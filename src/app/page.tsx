'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Ghost, Flame, Lock } from 'lucide-react';
import { useState } from 'react';

const STATIC_PARTICLES = [
  { id: 0, top: "12%", left: "45%", duration: 4.2, delay: 0.5, yOffset: -32 },
  { id: 1, top: "88%", left: "12%", duration: 6.1, delay: 1.2, yOffset: -45 },
  { id: 2, top: "34%", left: "78%", duration: 3.8, delay: 0.1, yOffset: -12 },
  { id: 3, top: "56%", left: "23%", duration: 7.2, delay: 2.5, yOffset: -28 },
  { id: 4, top: "15%", left: "92%", duration: 5.5, delay: 0.7, yOffset: -40 },
];

export default function Home() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#050a05] text-white overflow-hidden font-sans" style={{cursor:'crosshair'}}>
      <nav className="absolute top-0 left-0 right-0 p-10 flex justify-between items-center z-50">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="font-mono text-[#00ff50] font-bold text-sm tracking-[0.3em] flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-[#00ff50] rotate-45 flex items-center justify-center p-0.5">
            <div className="w-2 h-2 bg-[#00ff50]" />
          </div>
          WALLETCORPSE.IO
        </motion.div>
        <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-[#00ff50]/60">
          {['Platform','Network','Docs'].map(item => (
            <button key={item} style={{cursor:'pointer'}} className="relative hover:text-[#00ff50] transition-colors group">
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00ff50] transition-all group-hover:w-full" />
            </button>
          ))}
          <button
            style={{cursor:'pointer'}}
            onClick={() => router.push('/activate')}
            className="text-[#00ff50] border border-[#00ff50]/20 px-4 py-1.5 rounded-full hover:bg-[#00ff50]/10 hover:shadow-[0_0_15px_rgba(0,255,80,0.3)] transition-all">
            Launch Dashboard
          </button>
        </div>
      </nav>

      <main className="container mx-auto h-screen flex items-center px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center w-full">
          <div className="flex flex-col gap-6">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
              className="flex flex-col leading-none">
              <h1 className="text-[120px] lg:text-[140px] font-black tracking-tighter text-[#00ff50] drop-shadow-[0_0_30px_rgba(0,255,80,0.4)]">WALLET</h1>
              <h1 className="text-[120px] lg:text-[140px] font-black tracking-tighter text-white -mt-8">CORPSE</h1>
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-xl text-slate-400 font-medium max-w-md">
              Advanced Defensive Protocol for Compromised Crypto Assets. Immediate Protection for Multi-Chain Wallets.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-3">
              {[{Icon:Flame,label:'SCORCHED EARTH'},{Icon:Ghost,label:'GHOST REDIRECT'},{Icon:Lock,label:'GAS TRAP'}].map(({Icon,label}) => (
                <div key={label} className="px-5 py-2.5 rounded-full border border-white/5 bg-white/5 flex items-center gap-2.5 hover:border-[#00ff50]/30 group" style={{cursor:'pointer'}}>
                  <Icon size={14} className="text-[#00ff50]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white">{label}</span>
                </div>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
              className="flex items-center gap-6 mt-4">
              <button
                style={{cursor:'pointer'}}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => router.push('/activate')}
                className="flex items-center gap-3 bg-[#00ff50] text-[#050a05] px-10 py-5 rounded-2xl font-black text-lg uppercase tracking-tight hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(0,255,80,0.5)] transition-all">
                Defend My Wallet
                <ArrowRight size={22} className={isHovered ? "translate-x-2 transition-transform" : "transition-transform"} />
              </button>
              <button style={{cursor:'pointer'}}
                className="text-white border-2 border-white/10 px-10 py-5 rounded-2xl font-black text-lg uppercase tracking-tight hover:bg-white/5 transition-all">
                How It Works
              </button>
            </motion.div>
          </div>

          <div className="relative h-[600px] flex items-center justify-center">
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00ff50]/20 rounded-full blur-[120px]" />
            {[...Array(3)].map((_, i) => (
              <motion.div key={i} animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-t border-l border-[#00ff50]/10 rounded-full"
                style={{ margin: i * 40, top: '50%', left: '50%', width: 500 - i*80, height: 500 - i*80, transform: `translate(-50%, -50%)` }} />
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

      <footer className="absolute bottom-0 left-0 right-0 h-24 border-t border-[#00ff50]/10 flex items-center bg-black/20 px-10">
        <div className="flex items-center gap-12 text-[#00ff50]/40 font-black tracking-[0.4em] text-[10px]">
          {['WEB3 SECURITY','ETHEREUM','SOLANA','BSC','POLYGON','OPTIMISM','ARBITRUM','AVALANCHE'].map(l => (
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
