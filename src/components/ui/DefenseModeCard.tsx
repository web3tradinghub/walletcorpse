'use client';

import { motion } from 'framer-motion';
import { LucideIcon, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

interface DefenseModeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export function DefenseModeCard({ 
  icon: Icon, 
  title, 
  description, 
  isSelected, 
  onClick,
  className 
}: DefenseModeCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center gap-6 p-8 rounded-[3rem] border transition-all duration-300 group overflow-hidden backdrop-blur-xl',
        isSelected 
          ? 'bg-[#00ff50]/10 border-[#00ff50] shadow-[0_0_40px_rgba(0,255,80,0.2)]' 
          : 'bg-black/40 border-[#00ff50]/10 hover:border-[#00ff50]/30',
        className
      )}
    >
      {/* Icon Wrapper */}
      <div className={cn(
        'p-6 rounded-full transition-all duration-500 relative z-10',
        isSelected 
          ? 'bg-[#00ff50] text-[#050a05] shadow-[0_0_30px_#00ff50]' 
          : 'bg-black/80 text-white/40 border border-[#00ff50]/10 group-hover:text-white group-hover:border-[#00ff50]/30'
      )}>
        <Icon size={48} strokeWidth={2.5} />
      </div>

      {/* Content */}
      <div className="flex flex-col items-center gap-3 relative z-10">
        <span className={cn(
          'text-2xl font-black tracking-tighter uppercase transition-colors duration-300',
          isSelected ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
        )}>
          {title}
        </span>
        <p className="text-sm font-medium text-slate-500 text-center max-w-[200px] leading-relaxed">
          {description}
        </p>
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <motion.div 
          layoutId="active-shield"
          className="absolute top-6 right-8 text-[#00ff50] animate-pulse"
        >
          <ShieldAlert size={28} />
        </motion.div>
      )}

      {/* Background Gradient */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br from-[#00ff50]/10 to-transparent opacity-0 transition-opacity duration-500 pointer-events-none',
        isSelected && 'opacity-100'
      )} />
    </motion.button>
  );
}
