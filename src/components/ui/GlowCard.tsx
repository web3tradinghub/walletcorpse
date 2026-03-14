'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  glowColor?: string;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

const intensityMap = {
  low: 'group-hover:shadow-[0_0_15px_var(--glow-color)]',
  medium: 'group-hover:shadow-[0_0_30px_var(--glow-color)]',
  high: 'group-hover:shadow-[0_0_50px_var(--glow-color)]',
};

export function GlowCard({ 
  children, 
  glowColor = 'rgba(0, 255, 80, 0.2)', 
  intensity = 'medium',
  className 
}: GlowCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={cn(
        'group relative bg-[#050a05]/80 border border-[#00ff50]/15 rounded-3xl p-6 transition-all duration-300 backdrop-blur-xl overflow-hidden',
        intensityMap[intensity],
        className
      )}
      style={{ '--glow-color': glowColor } as React.CSSProperties}
    >
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00ff50]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Card Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
