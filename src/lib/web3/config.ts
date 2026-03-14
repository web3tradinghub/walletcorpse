import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'WalletCorpse',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [sepolia, base],
  ssr: true,
});

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export const CONTRACT_ABI = [
  {
    name: 'activate',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'compromisedWallet', type: 'address' },
      { name: 'safeWallet', type: 'address' }
    ],
    outputs: []
  },
  {
    name: 'deactivate',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'compromisedWallet', type: 'address' }],
    outputs: []
  },
  {
    name: 'isWalletActive',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'getActivationFee',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'getWalletInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'compromised', type: 'address' }],
    outputs: [
      { name: 'safeWallet', type: 'address' },
      { name: 'isActiveStatus', type: 'bool' },
      { name: 'rescuedETH', type: 'uint256' },
      { name: 'activatedAt', type: 'uint256' },
      { name: 'lastRescueAt', type: 'uint256' },
      { name: 'rescueCount', type: 'uint256' }
    ]
  },
  {
    name: 'getPlatformStats',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: '_totalActivations', type: 'uint256' },
      { name: '_totalRescued', type: 'uint256' },
      { name: '_accumulatedFees', type: 'uint256' }
    ]
  },
  {
    name: 'WalletActivated',
    type: 'event',
    inputs: [
      { name: 'compromised', type: 'address', indexed: true },
      { name: 'safe', type: 'address', indexed: true },
      { name: 'fee', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false }
    ]
  }
] as const;
