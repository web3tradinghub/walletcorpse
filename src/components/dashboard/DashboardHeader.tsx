'use client';

import { Shield, Settings, Bell, User } from 'lucide-react';

export function DashboardHeader({ address }: { address: string }) {
  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <header className="h-20 flex items-center justify-between px-8 border-b border-[#00ff50]/20 bg-[#050a05]/80 backdrop-blur-xl sticky top-0 z-50 shadow-[0_4px_20px_rgba(0,255,80,0.05)]">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-[#00ff50] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,255,80,0.3)]">
          <Shield size={24} className="text-[#050a05]" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black text-white tracking-tighter leading-none">WALLET</span>
          <span className="text-xl font-black text-[#00ff50] tracking-tighter leading-none italic">CORPSE</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="px-4 py-2 rounded-full bg-[#00ff50]/5 border border-[#00ff50]/10 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#00ff50] shadow-[0_0_8px_#00ff50] animate-pulse" />
          <span className="text-xs font-mono font-bold text-[#00ff50] tracking-widest">{truncatedAddress}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live Monitoring</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2.5 rounded-xl bg-[#00ff50]/5 border border-[#00ff50]/10 text-slate-400 hover:text-[#00ff50] hover:border-[#00ff50]/30 transition-all">
          <Bell size={18} />
        </button>
        <button className="p-2.5 rounded-xl bg-[#00ff50]/5 border border-[#00ff50]/10 text-slate-400 hover:text-[#00ff50] hover:border-[#00ff50]/30 transition-all">
          <Settings size={18} />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ff50]/20 to-[#00ff50]/5 border border-[#00ff50]/20 flex items-center justify-center">
          <User size={18} className="text-[#00ff50]" />
        </div>
      </div>
    </header>
  );
}
