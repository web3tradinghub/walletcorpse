const { ethers } = require('ethers');
require('dotenv').config();
const http = require('http');
const crypto = require('crypto');
const db = require('./database');
const CHAINS = require('./chains');
const MEVProtection = require('./mev-protection');

const PLATFORM_PRIVATE_KEY = process.env.PLATFORM_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'walletcorpse_32byte_secret_key!!';
const PLATFORM_CUT = 10;

const ABI = [
  "function isWalletActive(address) view returns (bool)",
  "event WalletActivated(address indexed compromised, address indexed safe, uint256 fee, uint256 timestamp)"
];

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

const providers = {};
const platformWallets = {};
const watchList = new Map();
const processingSet = new Set();
const lastBlocks = {}; // HTTP polling ke liye
let baseContract = null;

function encrypt(text) {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let enc = cipher.update(text);
  enc = Buffer.concat([enc, cipher.final()]);
  return iv.toString('hex') + ':' + enc.toString('hex');
}

function decrypt(text) {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const [ivHex, encHex] = text.split(':');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(ivHex, 'hex'));
  let dec = decipher.update(Buffer.from(encHex, 'hex'));
  dec = Buffer.concat([dec, decipher.final()]);
  return dec.toString();
}

async function getTokenBalances(address, httpUrl) {
  try {
    const res = await fetch(httpUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1,
        method: 'alchemy_getTokenBalances',
        params: [address, 'erc20']
      })
    });
    const data = await res.json();
    return (data.result?.tokenBalances || []).filter(t =>
      t.tokenBalance && t.tokenBalance !== '0x' + '0'.repeat(64)
    );
  } catch { return []; }
}

async function rescueOnChain(compromisedAddress, chainKey) {
  const procKey = `${compromisedAddress}-${chainKey}`;
  if (processingSet.has(procKey)) return;
  processingSet.add(procKey);

  const walletData = db.getWallet(compromisedAddress);
  if (!walletData?.privateKey) { processingSet.delete(procKey); return; }

  const chain = CHAINS[chainKey];
  const provider = providers[chainKey];
  const platformWallet = platformWallets[chainKey];
  if (!provider || !platformWallet) { processingSet.delete(procKey); return; }

  const mev = new MEVProtection(chainKey, PLATFORM_PRIVATE_KEY);

  try {
    const compromisedWallet = new ethers.Wallet(walletData.privateKey, provider);
    const safeAddress = walletData.safeAddress;
    const gasPrice = await provider.getGasPrice();
    const highGas = gasPrice.mul(2);

    console.log(`\n🚨 [${chain.name}] Rescuing ${compromisedAddress.slice(0,10)}...`);

    // ALL ERC20 tokens
    const tokens = await getTokenBalances(compromisedAddress, chain.http);
    for (const t of tokens) {
      try {
        const token = new ethers.Contract(t.contractAddress, ERC20_ABI, compromisedWallet);
        const bal = await token.balanceOf(compromisedAddress);
        if (bal.isZero()) continue;
        let sym = 'TKN', dec = 18;
        try { sym = await token.symbol(); dec = await token.decimals(); } catch {}
        const result = await mev.rescueToken(t.contractAddress, compromisedWallet, safeAddress, platformWallet, bal, PLATFORM_CUT);
        if (result.success) {
          db.logActivity(compromisedAddress, `TOKEN_${chain.name}`, result.amount, result.symbol, result.txHash, 'success');
          console.log(`✅ [${chain.name}] ${result.amount} ${result.symbol || sym} rescued!`);
        }
      } catch {}
    }

    // Native token
    let balance = await provider.getBalance(compromisedAddress);
    const gasCost = highGas.mul(21000);

    if (balance.lte(gasCost)) {
      await platformWallet.sendTransaction({
        to: compromisedWallet.address,
        value: gasCost.mul(2),
        gasPrice: highGas,
        gasLimit: 21000,
      }).then(tx => tx.wait()).catch(() => {});
      balance = await provider.getBalance(compromisedAddress);
    }

    if (balance.gt(gasCost)) {
      const result = await mev.executeRescue({
        compromisedWallet, safeAddress, platformWallet,
        amount: balance, platformCut: PLATFORM_CUT
      });
      if (result?.success) {
        db.logActivity(compromisedAddress, `NATIVE_${chain.name}`, ethers.utils.formatEther(balance), chain.symbol, result.txHash || '', 'success');
        console.log(`✅ [${chain.name}] ${chain.symbol} rescued via ${result.method}!`);
      }
    }

    console.log(`✅ [${chain.name}] Complete!`);
  } catch (err) {
    console.error(`[${chain.name}] Error: ${err.message.slice(0,80)}`);
  } finally {
    processingSet.delete(procKey);
  }
}

async function rescueAllChains(compromisedAddress) {
  console.log(`\n🌐 ALL CHAINS RESCUE START...`);
  await Promise.allSettled(
    Object.keys(CHAINS).map(k => rescueOnChain(compromisedAddress, k))
  );
  console.log(`\n🏆 ALL CHAINS COMPLETE!`);
}

// HTTP polling for non-WebSocket chains
async function pollChain(chainKey) {
  const chain = CHAINS[chainKey];
  const provider = providers[chainKey];
  if (!provider) return;

  try {
    const currentBlock = await provider.getBlockNumber();
    const lastBlock = lastBlocks[chainKey] || currentBlock - 1;

    if (currentBlock <= lastBlock) return;

    for (let b = lastBlock + 1; b <= currentBlock; b++) {
      try {
        const block = await provider.getBlockWithTransactions(b);
        if (!block?.transactions) continue;

        for (const tx of block.transactions) {
          if (!tx.to) continue;
          const addr = tx.to.toLowerCase();
          if (!watchList.has(addr)) continue;
          const wd = db.getWallet(addr);
          if (!wd?.privateKey) continue;

          console.log(`\n�� [${chain.name}] TX detected in block ${b}!`);
          await rescueOnChain(addr, chainKey);
        }
      } catch {}
    }

    lastBlocks[chainKey] = currentBlock;
  } catch {}
}

async function initChain(chainKey) {
  const chain = CHAINS[chainKey];
  try {
    let provider;

    if (chain.httpOnly || !chain.rpc) {
      // HTTP provider with polling
      provider = new ethers.providers.JsonRpcProvider(chain.http);
      providers[chainKey] = provider;
      const wallet = new ethers.Wallet(PLATFORM_PRIVATE_KEY, provider);
      platformWallets[chainKey] = wallet;

      // Start polling every 3 seconds
      setInterval(() => pollChain(chainKey), 3000);

      const bal = await provider.getBalance(wallet.address);
      console.log(`✅ [${chain.name}] ${ethers.utils.formatEther(bal)} ${chain.symbol} (HTTP polling)`);
    } else {
      // WebSocket provider
      provider = new ethers.providers.WebSocketProvider(chain.rpc);
      providers[chainKey] = provider;
      const wallet = new ethers.Wallet(PLATFORM_PRIVATE_KEY, provider);
      platformWallets[chainKey] = wallet;

      provider.on('error', () => {
        console.log(`🔄 [${chain.name}] Reconnecting...`);
        setTimeout(() => initChain(chainKey), 5000);
      });

      provider.on('pending', async (txHash) => {
        try {
          const tx = await provider.getTransaction(txHash);
          if (!tx?.to) return;
          const addr = tx.to.toLowerCase();
          if (!watchList.has(addr)) return;
          const wd = db.getWallet(addr);
          if (!wd?.privateKey) return;
          console.log(`\n🚨 [${chain.name}] INCOMING! ${ethers.utils.formatEther(tx.value || 0)} ${chain.symbol}`);
          provider.waitForTransaction(txHash, 1).then(async r => {
            if (r?.status === 1) await rescueOnChain(addr, chainKey);
          }).catch(() => {});
        } catch {}
      });

      const bal = await provider.getBalance(wallet.address);
      console.log(`✅ [${chain.name}] ${ethers.utils.formatEther(bal)} ${chain.symbol} (WebSocket)`);
    }

    return true;
  } catch (err) {
    console.error(`❌ [${chain.name}] Failed: ${err.message.slice(0,50)}`);
    return false;
  }
}

async function init() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   WalletCorpse — Advanced MEV System     ║');
  console.log('║   20 Chains | Flashbots | Private RPC    ║');
  console.log('╚══════════════════════════════════════════╝\n');

  for (const k of Object.keys(CHAINS)) await initChain(k);

  // Base contract events
  if (providers.base) {
    baseContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, platformWallets.base);
    baseContract.on('WalletActivated', (compromised) => {
      watchList.set(compromised.toLowerCase(), true);
      console.log(`\n🆕 New: ${compromised.slice(0,10)}...`);
    });
    try {
      const cur = await providers.base.getBlockNumber();
      const evts = await baseContract.queryFilter(baseContract.filters.WalletActivated(), cur - 9, cur);
      evts.forEach(e => watchList.set(e.args[0].toLowerCase(), true));
    } catch {}
  }

  const dbWallets = db.getAllActiveWallets();
  dbWallets.forEach(w => watchList.set(w.compromisedAddress, true));

  console.log(`\n✅ ${Object.keys(CHAINS).length} chains initialized`);
  console.log(`✅ Watching ${watchList.size} wallets`);
  console.log(`👀 24/7 monitoring active\n`);
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  let body = '';
  if (req.method === 'POST') {
    await new Promise(r => { req.on('data', c => body += c); req.on('end', r); });
  }

  if (req.method === 'POST' && req.url === '/register-key') {
    try {
      const { compromisedAddress, privateKey, safeAddress } = JSON.parse(body);
      db.saveWallet(compromisedAddress, safeAddress || '', privateKey);
      watchList.set(compromisedAddress.toLowerCase(), true);
      rescueAllChains(compromisedAddress.toLowerCase());
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: '20 chains active!' }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  if (req.method === 'GET' && req.url === '/status') {
    const balances = {};
    for (const [k, pw] of Object.entries(platformWallets)) {
      try { balances[k] = ethers.utils.formatEther(await pw.provider.getBalance(pw.address)); }
      catch { balances[k] = '0'; }
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'running', chains: Object.keys(CHAINS).length, watchingWallets: watchList.size, balances }));
    return;
  }

  if (req.method === 'GET' && req.url.startsWith('/activity/')) {
    const logs = db.getActivityLog(req.url.replace('/activity/', ''));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, logs }));
    return;
  }

  if (req.method === 'POST' && req.url === '/defense-mode') {
    try {
      const { compromisedAddress, mode } = JSON.parse(body);
      db.updateDefenseMode(compromisedAddress, mode);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, mode }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  res.writeHead(404); res.end();
});

server.listen(process.env.PORT || 3001, () => console.log(`🌐 API port ${process.env.PORT || 3001}\n`));
process.on('uncaughtException', err => console.error('Uncaught:', err.message));
init().catch(console.error);
