'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Ghost, Flame, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/web3/config';

const STATIC_PARTICLES = [
  { id: 0, top: "12%", left: "45%", duration: 4.2, delay: 0.5, yOffset: -32 },
  { id: 1, top: "88%", left: "12%", duration: 6.1, delay: 1.2, yOffset: -45 },
  { id: 2, top: "34%", left: "78%", duration: 3.8, delay: 0.1, yOffset: -12 },
  { id: 3, top: "56%", left: "23%", duration: 7.2, delay: 2.5, yOffset: -28 },
  { id: 4, top: "15%", left: "92%", duration: 5.5, delay: 0.7, yOffset: -40 },
];

export default function Home() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [showConnect, setShowConnect] = useState(false);
  const [checking, setChecking] = useState(false);

  // Check karo kya connected wallet ka compromised wallet active hai
  const { data: compromisedWallet } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'safeToCompromised',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: isActive } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isWalletActive',
    args: compromisedWallet && compromisedWallet !== '0x0000000000000000000000000000000000000000'
      ? [compromisedWallet as `0x${string}`]
      : undefined,
    query: {
      enabled: !!compromisedWallet &&
        compromisedWallet !== '0x0000000000000000000000000000000000000000'
    }
  });

  // Jab wallet connect ho aur data aa jaye
  useEffect(() => {
    if (!isConnected || !checking) return;

    if (compromisedWallet &&
      compromisedWallet !== '0x0000000000000000000000000000000000000000' &&
      isActive) {
      // Already activated — dashboard pe jao
      router.push(`/dashboard?wallet=${compromisedWallet}`);
    } else if (isConnected && checking) {
      // Not activated — activate pe jao
      router.push('/activate');
    }
  }, [isConnected, compromisedWallet, isActive, checking]);

  const handleDefendClick = () => {
    if (!isConnected) {
      setShowConnect(true);
      return;
    }
    setChecking(true);

    if (compromisedWallet &&
      compromisedWallet !== '0x0000000000000000000000000000000000000000' &&
      isActive) {
      router.push(`/dashboard?wallet=${compromisedWallet}`);
    } else {
      router.push('/activate');
    }
  };

  // Jab wallet connect ho jaye automatically check karo
  useEffect(() => {
    if (isConnected && showConnect) {
      setShowConnect(false);
      setChecking(true);
    }
  }, [isConnected, showConnect]);

  return (
    <div className="relative min-h-screen bg-[#050a05] text-white overflow-hidden font-sans" style={{cursor:'crosshair'}}>
      
      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 p-10 flex justify-between items-center z-50">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="font-mono text-[#00ff50] font-bold text-sm tracking-[0.3em] flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-[#00ff50] rotate-45 flex items-center justify-center p-0.5">
            <div className="w-2 h-2 bg-[#00ff50]" />
          </div>
          WALLETCORPSE.IO
        </motion.div>

        <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-[#00ff50]/60 items-center">
          {['Platform', 'Network', 'Docs'].map(item => (
            <button key={item} style={{cursor:'pointer'}} className="relative hover:text-[#00ff50] transition-colors group">
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00ff50] transition-all group-hover:w-full" />
            </button>
          ))}

          {/* Connect/Dashboard button */}
          {isConnected ? (
            <button
              style={{cursor:'pointer'}}
              onClick={() => {
                if (compromisedWallet && compromisedWallet !== '0x0000000000000000000000000000000000000000' && isActive) {
                  router.push(`/dashboard?wallet=${compromisedWallet}`);
                } else {
                  router.push('/activate');
                }
              }}
              className="text-[#00ff50] border border-[#00ff50]/20 px-4 py-1.5 rounded-full hover:bg-[#00ff50]/10 transition-all text-xs"
            >
              {isActive ? 'Dashboard' : 'Activate'}
            </button>
          ) : (
            <div className="scale-90">
              <ConnectButton label="Connect Wallet" />
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="container mx-auto h-screen flex items-center px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center w-full">

          {/* Left */}
          <div className="flex flex-col gap-6">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
              className="flex flex-col leading-none">
              <h1 className="text-[120px] lg:text-[140px] font-black tracking-tighter text-[#00ff50] drop-shadow-[0_0_30px_rgba(0,255,80,0.4)]">
                WALLET
              </h1>
              <h1 className="text-[120px] lg:text-[140px] font-black tracking-tighter text-white -mt-8">
                CORPSE
              </h1>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-xl text-slate-400 font-medium max-w-md">
              Advanced Defensive Protocol for Compromised Crypto Assets. Immediate Protection for Multi-Chain Wallets.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-3">
              {[{Icon: Flame, label: 'SCORCHED EARTH'}, {Icon: Ghost, label: 'GHOST REDIRECT'}, {Icon: Lock, label: 'GAS TRAP'}].map(({Icon, label}) => (
                <div key={label} className="px-5 py-2.5 rounded-full border border-white/5 bg-white/5 flex items-center gap-2.5 hover:border-[#00ff50]/30 group" style={{cursor:'pointer'}}>
                  <Icon size={14} className="text-[#00ff50]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white">{label}</span>
                </div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
              className="flex items-center gap-6 mt-4">

              {/* Main CTA */}
              {showConnect && !isConnected ? (
                <div className="flex flex-col gap-3">
                  <p className="text-slate-400 text-sm">Connect your safe wallet first:</p>
                  <ConnectButton />
                </div>
              ) : (
                <button
                  style={{cursor:'pointer'}}
                  onClick={handleDefendClick}
                  className="flex items-center gap-3 bg-[#00ff50] text-[#050a05] px-10 py-5 rounded-2xl font-black text-lg uppercase tracking-tight hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(0,255,80,0.5)] transition-all"
                >
                  {checking ? 'Checking...' : isActive ? 'View Dashboard' : 'Defend My Wallet'}
                  <ArrowRight size={22} />
                </button>
              )}

              <button style={{cursor:'pointer'}}
                className="text-white border-2 border-white/10 px-10 py-5 rounded-2xl font-black text-lg uppercase tracking-tight hover:bg-white/5 transition-all">
                How It Works
              </button>
            </motion.div>
          </div>

          {/* Right — Astronaut */}
          <div className="relative h-[600px] flex items-center justify-center">
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00ff50]/20 rounded-full blur-[120px]" />
            {[...Array(3)].map((_, i) => (
              <motion.div key={i} animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute border-t border-l border-[#00ff50]/10 rounded-full"
                style={{ width: 500 - i * 80, height: 500 - i * 80, top: '50%', left: '50%', transform: `translate(-50%, -50%)` }} />
            ))}
            <motion.div animate={{ y: [-15, 15, -15] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-20">
              <div className="relative w-40 h-44 bg-white/90 rounded-[3rem] shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-20 bg-[#050a05] rounded-[2rem] border-2 border-[#00ff50]/30">
                  <div className="absolute bottom-4 right-6 w-8 h-1 bg-[#00ff50]/40 rounded-full blur-sm animate-pulse" />
                </div>
              </div>
              <div className="w-44 h-52 bg-white/90 rounded-[4rem] -mt-10 mx-auto relative shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                <div className="absolute -left-6 top-10 w-12 h-32 bg-white/80 rounded-2xl" />
              </div>
            </motion.div>
            {STATIC_PARTICLES.map((p) => (
              <motion.div key={p.id}
                animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.5, 1], y: [0, p.yOffset, 0] }}
                transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
                className="absolute w-1 h-1 bg-[#00ff50] rounded-full"
                style={{ top: p.top, left: p.left }} />
            ))}
          </div>
        </div>
      </main>

      {/* Footer ticker */}
      <footer className="absolute bottom-0 left-0 right-0 h-24 border-t border-[#00ff50]/10 flex items-center bg-black/20 px-10">
        <div className="flex items-center gap-12 text-[#00ff50]/40 font-black tracking-[0.4em] text-[10px]">
          {['WEB3 SECURITY', 'ETHEREUM', 'SOLANA', 'BSC', 'POLYGON', 'OPTIMISM', 'ARBITRUM', 'AVALANCHE'].map(l => (
            <div key={l} className="flex items-center gap-4">
              <span>{l}</span>
              <div className="w-1.5 h-1.5 bg-[#00ff50]/20 rounded-full" />
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
