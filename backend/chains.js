const KEY = process.env.ALCHEMY_KEY;

const CHAINS = {
  base: {
    name: 'Base',
    rpc: `wss://base-mainnet.g.alchemy.com/v2/${KEY}`,
    http: `https://base-mainnet.g.alchemy.com/v2/${KEY}`,
    symbol: 'ETH',
    isMain: true
  },
  ethereum: {
    name: 'Ethereum',
    rpc: `wss://eth-mainnet.g.alchemy.com/v2/${KEY}`,
    http: `https://eth-mainnet.g.alchemy.com/v2/${KEY}`,
    symbol: 'ETH'
  },
  polygon: {
    name: 'Polygon',
    rpc: `wss://polygon-mainnet.g.alchemy.com/v2/${KEY}`,
    http: `https://polygon-mainnet.g.alchemy.com/v2/${KEY}`,
    symbol: 'MATIC'
  },
  arbitrum: {
    name: 'Arbitrum',
    rpc: `wss://arb-mainnet.g.alchemy.com/v2/${KEY}`,
    http: `https://arb-mainnet.g.alchemy.com/v2/${KEY}`,
    symbol: 'ETH'
  },
  optimism: {
    name: 'Optimism',
    rpc: `wss://opt-mainnet.g.alchemy.com/v2/${KEY}`,
    http: `https://opt-mainnet.g.alchemy.com/v2/${KEY}`,
    symbol: 'ETH'
  },
  zkSync: {
    name: 'zkSync Era',
    rpc: `wss://zksync-mainnet.g.alchemy.com/v2/${KEY}`,
    http: `https://zksync-mainnet.g.alchemy.com/v2/${KEY}`,
    symbol: 'ETH'
  },
  polygonZkEvm: {
    name: 'Polygon zkEVM',
    rpc: `wss://polygonzkevm-mainnet.g.alchemy.com/v2/${KEY}`,
    http: `https://polygonzkevm-mainnet.g.alchemy.com/v2/${KEY}`,
    symbol: 'ETH'
  },
  linea: {
    name: 'Linea',
    rpc: `wss://linea-mainnet.g.alchemy.com/v2/${KEY}`,
    http: `https://linea-mainnet.g.alchemy.com/v2/${KEY}`,
    symbol: 'ETH'
  },
  scroll: {
    name: 'Scroll',
    rpc: `wss://scroll-mainnet.g.alchemy.com/v2/${KEY}`,
    http: `https://scroll-mainnet.g.alchemy.com/v2/${KEY}`,
    symbol: 'ETH'
  },
  celo: {
    name: 'Celo',
    rpc: `wss://celo-mainnet.g.alchemy.com/v2/${KEY}`,
    http: `https://celo-mainnet.g.alchemy.com/v2/${KEY}`,
    symbol: 'CELO'
  },
  bsc: {
    name: 'BSC',
    rpc: null,
    http: 'https://bsc-dataseed.binance.org',
    symbol: 'BNB',
    httpOnly: true
  },
  avalanche: {
    name: 'Avalanche',
    rpc: null,
    http: 'https://api.avax.network/ext/bc/C/rpc',
    symbol: 'AVAX',
    httpOnly: true
  },
  mantle: {
    name: 'Mantle',
    rpc: null,
    http: 'https://rpc.mantle.xyz',
    symbol: 'MNT',
    httpOnly: true
  },
  cronos: {
    name: 'Cronos',
    rpc: null,
    http: 'https://evm.cronos.org',
    symbol: 'CRO',
    httpOnly: true
  },
  kava: {
    name: 'Kava',
    rpc: null,
    http: 'https://evm.kava.io',
    symbol: 'KAVA',
    httpOnly: true
  },
  metis: {
    name: 'Metis',
    rpc: null,
    http: 'https://andromeda.metis.io/?owner=1088',
    symbol: 'METIS',
    httpOnly: true
  },
  aurora: {
    name: 'Aurora',
    rpc: null,
    http: 'https://mainnet.aurora.dev',
    symbol: 'ETH',
    httpOnly: true
  },
};

module.exports = CHAINS;
