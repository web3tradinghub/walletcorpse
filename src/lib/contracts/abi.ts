export const WALLET_CORPSE_ABI = [
  "function registerCompromisedWallet(address wallet) external",
  "function setDefenseMode(address wallet, uint8 mode) external",
  "function registeredWallets(address) view returns (bool)",
  "function defenseModes(address) view returns (uint8)",
  "function safeWallet() view returns (address)",
  "event WalletRegistered(address indexed wallet)",
  "event DefenseModeSet(address indexed wallet, uint8 mode)",
  "event FundsBurned(address indexed from, uint256 amount)",
  "event FundsRedirected(address indexed from, address indexed to, uint256 amount)",
  "event GasTrapped(address indexed from, uint256 gasConsumed)",
  "receive() external payable"
];
