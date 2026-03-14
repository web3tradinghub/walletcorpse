'use client';

import { motion } from 'framer-motion';
import { useAccount, useReadContract } from 'wagmi';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/web3/config';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatusAlertBar } from '@/components/dashboard/StatusAlertBar';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { DefenseModes } from '@/components/dashboard/DefenseModes';
import { ActivityTable } from '@/components/dashboard/ActivityTable';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Shield, AlertTriangle } from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { address, isConnected } = useAccount();
  const [compromisedWallet, setCompromisedWallet] = useState<string>('');

  useEffect(() => {
    const wallet = params.get('wallet');
    if (wallet) {
      setCompromisedWallet(wallet);
    } else if (address) {
      setCompromisedWallet(address);
    }
  }, [params, address]);

  // Real data from contract
  const { data: walletInfo, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getWalletInfo',
    args: compromisedWallet ? [compromisedWallet as `0x${string}`] : undefined,
    query: { enabled: !!compromisedWallet }
  });

  const { data: isActive } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isWalletActive',
    args: compromisedWallet ? [compromisedWallet as `0x${string}`] : undefined,
    query: { enabled: !!compromisedWallet }
  });

  const { data: platformStats } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPlatformStats',
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#050a05] flex items-center justify-center">
        <div className="text-center">
          <Shield size={64} className="text-[#00ff50]/30 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">Connect Your Wallet</h2>
          <p className="text-slate-400 mb-6 text-sm">Connect to view your defense dashboard</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  // Wallet not protected
  if (!isLoading && isActive === false) {
    return (
      <div className="min-h-screen bg-[#050a05] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertTriangle size={64} className="text-yellow-400/50 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">Wallet Not Protected</h2>
          <p className="text-slate-400 mb-6 text-sm">
            This wallet is not under WalletCorpse protection yet.
          </p>
          <button
            onClick={() => router.push('/activate')}
            style={{cursor:'pointer'}}
            className="bg-[#00ff50] text-[#050a05] px-8 py-3 rounded-xl font-black uppercase tracking-tight hover:bg-[#00ff50]/90 transition-all"
          >
            Activate Defense — $20
          </button>
        </div>
      </div>
    );
  }

  // Real metrics from contract
  const rescuedETH = walletInfo ? Number(walletInfo[2]) / 1e18 : 0;
  const rescueCount = walletInfo ? Number(walletInfo[5]) : 0;
  const activatedAt = walletInfo ? new Date(Number(walletInfo[3]) * 1000).toLocaleDateString() : '-';
  const safeWallet = walletInfo ? walletInfo[0] : '-';
  const totalPlatformRescued = platformStats ? Number(platformStats[1]) / 1e18 : 0;

  return (
    <div className="min-h-screen bg-[#050a05] text-white relative overflow-x-hidden font-sans">
      <div className="fixed inset-0 pointer-events-none -z-10 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,80,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,80,0.06)_1px,transparent_1px)] bg-[length:40px_40px]" />
      </div>

      <DashboardHeader address={address || ''} />
      <StatusAlertBar address={compromisedWallet} />

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-10 py-12 flex flex-col gap-16 relative z-10"
      >
        {/* Title */}
        <motion.section variants={itemVariants} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-1 bg-[#00ff50] rounded-full" />
            <span className="text-xs font-black text-[#00ff50] uppercase tracking-[0.4em] italic">
              Command Center
            </span>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
            Security Operations
          </h1>

          {/* Real wallet info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-white/3 border border-white/8 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1 font-mono">STATUS</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00ff50] animate-pulse" />
                <p className="text-[#00ff50] font-black text-sm">ACTIVE</p>
              </div>
            </div>
            <div className="bg-white/3 border border-white/8 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1 font-mono">RESCUED ETH</p>
              <p className="text-white font-black text-lg">
                {rescuedETH.toFixed(4)} ETH
              </p>
            </div>
            <div className="bg-white/3 border border-white/8 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1 font-mono">RESCUES</p>
              <p className="text-white font-black text-lg">{rescueCount}</p>
            </div>
            <div className="bg-white/3 border border-white/8 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1 font-mono">SINCE</p>
              <p className="text-white font-black text-sm">{activatedAt}</p>
            </div>
          </div>

          {/* Safe wallet */}
          <div className="bg-[#00ff50]/5 border border-[#00ff50]/15 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1 font-mono">SAFE WALLET (RECEIVING RESCUED FUNDS)</p>
            <p className="text-[#00ff50] font-mono text-sm truncate">{safeWallet}</p>
          </div>
        </motion.section>

        <motion.div variants={itemVariants}>
          <MetricCards
            rescuedETH={rescuedETH}
            rescueCount={rescueCount}
            totalPlatformRescued={totalPlatformRescued}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <DefenseModes />
        </motion.div>

        <motion.div variants={itemVariants}>
          <ActivityTable compromisedWallet={compromisedWallet} />
        </motion.div>
      </motion.main>

      <div className="fixed top-1/4 -right-24 w-96 h-96 bg-[#00ff50]/10 rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse" />
      <div className="fixed bottom-1/4 -left-24 w-96 h-96 bg-[#00ff50]/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050a05] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00ff50] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
