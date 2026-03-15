const { ethers } = require('ethers');
const { FlashbotsBundleProvider } = require('@flashbots/ethers-provider-bundle');

// Flashbots sirf Ethereum mainnet pe kaam karta hai
// Base pe = Flashbots Protect RPC use karte hain

const FLASHBOTS_RELAY = 'https://relay.flashbots.net';
const BASE_PRIVATE_RPC = 'https://rpc.flashbots.net/fast'; // Base bhi support karta hai

let flashbotsProvider = null;

async function initFlashbots(provider, signerWallet) {
  try {
    flashbotsProvider = await FlashbotsBundleProvider.create(
      provider,
      signerWallet,
      FLASHBOTS_RELAY,
      'mainnet'
    );
    console.log('✅ Flashbots Provider initialized');
    return flashbotsProvider;
  } catch (err) {
    console.error('Flashbots init error:', err.message);
    return null;
  }
}

// MEV Bundle — hacker se guaranteed pehle
async function submitMEVBundle(
  flashbotsProvider,
  transactions,
  provider,
  maxBlocks = 5
) {
  try {
    const blockNumber = await provider.getBlockNumber();
    
    console.log(`\n⚡ Submitting MEV Bundle...`);
    console.log(`   Target blocks: ${blockNumber + 1} to ${blockNumber + maxBlocks}`);

    // Bundle simulate karo pehle
    const signedBundle = await flashbotsProvider.signBundle(transactions);
    
    const simulation = await flashbotsProvider.simulate(
      signedBundle,
      blockNumber + 1
    );

    if ('error' in simulation) {
      console.log(`❌ Simulation failed: ${simulation.error.message}`);
      return null;
    }

    console.log(`✅ Simulation passed!`);
    console.log(`   Gas used: ${simulation.totalGasUsed}`);

    // Multiple blocks pe submit karo — chance zyada hoga
    const submissions = [];
    for (let i = 1; i <= maxBlocks; i++) {
      const targetBlock = blockNumber + i;
      const submission = flashbotsProvider.sendRawBundle(signedBundle, targetBlock);
      submissions.push({ targetBlock, submission });
    }

    // Results check karo
    for (const { targetBlock, submission } of submissions) {
      try {
        const result = await (await submission).wait();
        if (result === 0) {
          console.log(`✅ Bundle included in block ${targetBlock}!`);
          return targetBlock;
        }
      } catch {}
    }

    console.log('⚠️ Bundle not included — falling back to high gas');
    return null;
  } catch (err) {
    console.error('MEV bundle error:', err.message);
    return null;
  }
}

// Ethereum mainnet rescue via Flashbots
async function rescueViaFlashbots(
  compromisedWallet,
  safeAddress,
  platformWallet,
  provider,
  flashbotsProvider,
  amount,
  platformCut = 10
) {
  try {
    const platformFee = amount.mul(platformCut).div(100);
    const userAmount = amount.sub(platformFee);
    
    const gasPrice = await provider.getGasPrice();
    const priorityGas = gasPrice.mul(2);
    
    const nonce = await provider.getTransactionCount(compromisedWallet.address);

    // Bundle: 2 transactions
    const bundle = [
      // Tx 1: User amount to safe wallet
      {
        signer: compromisedWallet,
        transaction: {
          to: safeAddress,
          value: userAmount,
          gasLimit: 21000,
          maxFeePerGas: priorityGas,
          maxPriorityFeePerGas: priorityGas.div(2),
          nonce: nonce,
          chainId: 1,
          type: 2,
        }
      },
      // Tx 2: Platform fee
      {
        signer: compromisedWallet,
        transaction: {
          to: platformWallet.address,
          value: platformFee,
          gasLimit: 21000,
          maxFeePerGas: priorityGas,
          maxPriorityFeePerGas: priorityGas.div(2),
          nonce: nonce + 1,
          chainId: 1,
          type: 2,
        }
      }
    ];

    const result = await submitMEVBundle(flashbotsProvider, bundle, provider);
    return result !== null;
  } catch (err) {
    console.error('Flashbots rescue error:', err.message);
    return false;
  }
}

// Base Chain Private RPC rescue
// Base pe Flashbots nahi — lekin private RPC use karte hain
async function rescueViaPrivateRPC(
  compromisedWallet,
  safeAddress,
  platformWallet,
  amount,
  platformCut = 10
) {
  try {
    // Base private RPC provider
    const privateProvider = new ethers.providers.JsonRpcProvider(
      BASE_PRIVATE_RPC
    );
    
    const compromisedPrivate = compromisedWallet.connect(privateProvider);
    const gasPrice = await privateProvider.getGasPrice();
    const highGas = gasPrice.mul(2);

    const platformFee = amount.mul(platformCut).div(100);
    const userAmount = amount.sub(platformFee);

    console.log(`\n⚡ Base Private RPC rescue...`);

    const tx = await compromisedPrivate.sendTransaction({
      to: safeAddress,
      value: userAmount,
      gasLimit: 21000,
      gasPrice: highGas,
    });
    await tx.wait();
    console.log(`✅ Private RPC rescue success! TX: ${tx.hash}`);

    // Platform fee
    if (platformFee.gt(0)) {
      const feeTx = await compromisedPrivate.sendTransaction({
        to: platformWallet.address,
        value: platformFee,
        gasLimit: 21000,
        gasPrice: highGas,
      });
      await feeTx.wait();
    }

    return tx.hash;
  } catch (err) {
    console.error('Private RPC error:', err.message);
    return null;
  }
}

// Smart rescue — chain ke hisaab se best method choose karo
async function smartRescue(options) {
  const {
    chainKey,
    compromisedWallet,
    safeAddress,
    platformWallet,
    amount,
    provider,
    flashbotsProvider,
  } = options;

  console.log(`\n🧠 Smart Rescue on ${chainKey}...`);

  if (chainKey === 'ethereum' && flashbotsProvider) {
    // Ethereum: Flashbots use karo
    console.log('🔥 Using Flashbots MEV bundle...');
    const success = await rescueViaFlashbots(
      compromisedWallet,
      safeAddress,
      platformWallet,
      provider,
      flashbotsProvider,
      amount
    );
    
    if (success) return 'flashbots';
    
    // Fallback: high gas
    console.log('⚠️ Flashbots failed — using high gas fallback...');
  }

  if (chainKey === 'base') {
    // Base: Private RPC
    console.log('⚡ Using Base Private RPC...');
    const hash = await rescueViaPrivateRPC(
      compromisedWallet,
      safeAddress,
      platformWallet,
      amount
    );
    if (hash) return 'private_rpc';
  }

  // Other chains: High priority gas
  console.log('💨 Using high priority gas...');
  return 'high_gas';
}

module.exports = {
  initFlashbots,
  submitMEVBundle,
  rescueViaFlashbots,
  rescueViaPrivateRPC,
  smartRescue,
};
