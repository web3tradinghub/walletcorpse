'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Lock } from 'lucide-react';

export function StatusAlertBar({ address }: { address: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-gradient-to-r from-red-600 via-orange-600 to-red-600 px-10 py-3.5 flex items-center justify-between shadow-[0_4px_30px_rgba(220,38,38,0.3)] sticky top-20 z-40 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[length:40px_40px] animate-[slide_30s_linear_infinite]" />
      
      {/* Scan line animation */}
      <div className="absolute inset-0 z-0">
        <div className="scan-line animate-slide-right" />
      </div>

      <div className="flex items-center gap-6 relative z-10">
        <div className="p-2 bg-white/20 rounded-xl animate-bounce">
          <AlertTriangle className="text-white" size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-white font-black uppercase tracking-[0.2em] text-[10px] leading-none opacity-80">System Alert: Critical Threat</span>
          <span className="text-white font-black text-lg lg:text-xl leading-none mt-1 uppercase tracking-tight">⚠ WALLET COMPROMISED — Defense Active</span>
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <div className="flex items-center gap-2 px-4 py-2 bg-black/30 rounded-full border border-white/10 backdrop-blur-md">
          <Lock className="text-white/80" size={14} />
          <span className="text-white/80 text-[10px] font-mono font-black uppercase tracking-widest">{address}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-white text-[10px] font-black uppercase tracking-[0.15em]">Defensive Protocols Operational</span>
        </div>
      </div>
    </motion.div>
  );
}
