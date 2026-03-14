const { ethers } = require('ethers');
const { FlashbotsBundleProvider } = require('@flashbots/ethers-provider-bundle');
require('dotenv').config();

const ALCHEMY_WS_URL = process.env.ALCHEMY_WS_URL;
const PLATFORM_PRIVATE_KEY = process.env.PLATFORM_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const ABI = [
  "function isActive(address) view returns (bool)",
  "function getSafeWallet(address) view returns (address)",
  "event WalletActivated(address indexed compromised, address indexed safe, uint256 fee, uint256 timestamp)"
];

const watchList = new Map();

async function init() {
  console.log('🚀 WalletCorpse Backend Starting...');

  const provider = new ethers.providers.WebSocketProvider(ALCHEMY_WS_URL);
  const platformWallet = new ethers.Wallet(PLATFORM_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, platformWallet);

  const flashbotsProvider = await FlashbotsBundleProvider.create(
    provider,
    platformWallet,
    'https://relay.flashbots.net',
    'mainnet'
  );

  console.log('✅ Connected to Ethereum');
  console.log('✅ Platform wallet:', platformWallet.address);

  // Error handler — init ke andar
  provider.on('error', () => {
    console.log('🔄 Reconnecting in 5s...');
    setTimeout(init, 5000);
  });

  await loadActiveWallets(provider, contract);
  listenForNewActivations(contract);
  monitorTransactions(provider, platformWallet, flashbotsProvider);
}

async function loadActiveWallets(provider, contract) {
  console.log('📋 Loading active wallets...');
  try {
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = currentBlock - 9;
    const filter = contract.filters.WalletActivated();
    const events = await contract.queryFilter(filter, fromBlock, currentBlock);

    for (const event of events) {
      const compromised = event.args[0];
      const isStillActive = await contract.isActive(compromised);
      if (isStillActive) {
        const safe = await contract.getSafeWallet(compromised);
        watchList.set(compromised.toLowerCase(), safe.toLowerCase());
        console.log(`👁️ Watching: ${compromised.slice(0,8)}...`);
      }
    }
    console.log(`✅ Watching ${watchList.size} wallets`);
  } catch (err) {
    console.log('📋 Starting fresh, no previous wallets');
    console.log(`✅ Watching 0 wallets`);
  }
}

function listenForNewActivations(contract) {
  contract.on('WalletActivated', async (compromised, safe) => {
    watchList.set(compromised.toLowerCase(), safe.toLowerCase());
    console.log(`🆕 New wallet activated: ${compromised.slice(0,8)}...`);
  });
}

function monitorTransactions(provider, platformWallet, flashbotsProvider) {
  console.log('👀 Monitoring pending transactions...');

  provider.on('pending', async (txHash) => {
    try {
      const tx = await provider.getTransaction(txHash);
      if (!tx || !tx.to) return;

      const toAddress = tx.to.toLowerCase();

      if (watchList.has(toAddress) && tx.value.gt(0)) {
        console.log(`\n🚨 INCOMING TX DETECTED!`);
        console.log(`   To: ${tx.to}`);
        console.log(`   Amount: ${ethers.utils.formatEther(tx.value)} ETH`);
        await rescueWithFlashbots(toAddress, tx, platformWallet, flashbotsProvider, provider);
      }
    } catch (err) {
      // silent
    }
  });
}

async function rescueWithFlashbots(compromisedAddress, incomingTx, platformWallet, flashbotsProvider, provider) {
  try {
    const safeWallet = watchList.get(compromisedAddress);
    const amount = incomingTx.value;
    const platformFee = amount.mul(10).div(100);
    const userAmount = amount.sub(platformFee);

    console.log(`💰 Rescuing ${ethers.utils.formatEther(amount)} ETH`);
    console.log(`   Platform (10%): ${ethers.utils.formatEther(platformFee)} ETH`);
    console.log(`   User (90%): ${ethers.utils.formatEther(userAmount)} ETH`);

    const block = await provider.getBlockNumber();
    const gasPrice = await provider.getGasPrice();

    const bundle = [
      {
        transaction: {
          to: safeWallet,
          value: userAmount,
          gasLimit: 21000,
          gasPrice: gasPrice.mul(2),
          chainId: 1,
          type: 0
        },
        signer: platformWallet
      }
    ];

    for (let i = 1; i <= 3; i++) {
      const targetBlock = block + i;
      const signedBundle = await flashbotsProvider.signBundle(bundle);
      const simulation = await flashbotsProvider.simulate(signedBundle, targetBlock);

      if ('error' in simulation) {
        console.log(`❌ Sim failed: ${simulation.error.message}`);
        continue;
      }

      const submission = await flashbotsProvider.sendRawBundle(signedBundle, targetBlock);
      const result = await submission.wait();

      if (result === 0) {
        console.log(`✅ RESCUE SUCCESS! Block: ${targetBlock}`);
        console.log(`   Sent ${ethers.utils.formatEther(userAmount)} ETH → ${safeWallet}`);
        return;
      }
    }
    console.log('⚠️ Bundle not included, will retry');
  } catch (err) {
    console.error('❌ Rescue error:', err.message);
  }
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught:', err.message);
});

init().catch(console.error);
