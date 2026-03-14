'use client';

import { motion } from 'framer-motion';
import { Flame, Ghost, Lock, ShieldAlert, Zap } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function DefenseModes() {
  const [selected, setSelected] = useState<number>(0);

  const modes = [
    {
      id: 0,
      label: "SCORCHED EARTH",
      icon: Flame,
      description: "Burn all incoming. Hacker gets zero.",
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]",
      activeBg: "bg-red-500/5",
    },
    {
      id: 1,
      label: "GHOST REDIRECT",
      icon: Ghost,
      description: "Flash-send to safe wallet instantly",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]",
      activeBg: "bg-purple-500/5",
    },
    {
      id: 2,
      label: "GAS TRAP",
      icon: Lock,
      description: "Drain hacker bot gas with decoys",
      color: "text-[#00ff50]",
      bg: "bg-[#00ff50]/10",
      border: "border-[#00ff50]/30 shadow-[0_0_20px_rgba(0,255,80,0.2)]",
      activeBg: "bg-[#00ff50]/5",
    }
  ];

  return (
    <div className="flex flex-col gap-10 w-full max-w-[1600px] mx-auto py-10 border-t border-[#00ff50]/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-[#00ff50]/10 text-[#00ff50]">
            <Zap size={24} />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase glow-text italic">Select Defense Mode</h2>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black border border-[#00ff50]/20">
          <span className="text-[10px] font-black text-[#00ff50] uppercase tracking-[0.2em] font-mono italic">Encryption Level: MIL-STD-810G</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {modes.map((mode, i) => (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelected(mode.id)}
            className={cn(
              "p-8 rounded-[3rem] border transition-all duration-300 flex flex-col items-center gap-6 relative overflow-hidden group backdrop-blur-md",
              selected === mode.id 
                ? "bg-[#00ff50]/10 border-[#00ff50] shadow-[0_0_40px_rgba(0,255,80,0.2)]" 
                : "bg-black/40 border-white/5 hover:border-[#00ff50]/30"
            )}
          >
            <div className={cn(
              "p-6 rounded-full transition-all duration-500 relative z-10",
              selected === mode.id ? "bg-[#00ff50] text-black shadow-[0_0_30px_#00ff50]" : "bg-black/80 text-white/40 border border-white/5 group-hover:text-white"
            )}>
              <mode.icon size={48} strokeWidth={2.5} />
            </div>

            <div className="flex flex-col items-center gap-3 relative z-10">
              <span className={cn(
                "text-2xl font-black tracking-tighter uppercase transition-colors duration-300",
                selected === mode.id ? "text-white glow-text" : "text-white/60 group-hover:text-white"
              )}>
                {mode.label}
              </span>
              <p className="text-sm font-medium text-slate-500 text-center max-w-[200px] leading-relaxed">
                {mode.description}
              </p>
            </div>

            {selected === mode.id && (
              <motion.div 
                layoutId="active-shield"
                className="absolute top-6 right-8 text-[#00ff50] animate-pulse"
              >
                <ShieldAlert size={28} />
              </motion.div>
            )}

            <div className={cn(
              "absolute inset-0 bg-gradient-to-br from-[#00ff50]/10 to-transparent opacity-0 transition-opacity duration-500 pointer-events-none",
              selected === mode.id && "opacity-100"
            )} />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
