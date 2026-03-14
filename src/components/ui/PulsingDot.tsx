'use client';

import { cn } from '@/lib/utils';

interface PulsingDotProps {
  color?: 'red' | 'green' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorStyles = {
  red: 'bg-red-500 shadow-[0_0_8px_#ef4444] after:bg-red-500/30 before:bg-red-500/20',
  green: 'bg-[#00ff50] shadow-[0_0_8px_#00ff50] after:bg-[#00ff50]/30 before:bg-[#00ff50]/20',
  yellow: 'bg-amber-500 shadow-[0_0_8px_#f59e0b] after:bg-amber-500/30 before:bg-amber-500/20',
};

const sizeStyles = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2.5 h-2.5',
  lg: 'w-4 h-4',
};

export function PulsingDot({ color = 'green', size = 'md', className }: PulsingDotProps) {
  return (
    <div className={cn('relative flex items-center justify-center', sizeStyles[size], className)}>
      <div className={cn(
        'absolute inset-0 rounded-full animate-ping delay-0 after:content-[""] after:absolute after:inset-[-4px] after:rounded-full after:opacity-0 after:animate-[expand_2s_infinite]',
        colorStyles[color]
      )} />
      <div className={cn(
        'absolute inset-0 rounded-full animate-ping delay-500 after:content-[""] after:absolute after:inset-[-8px] after:rounded-full after:opacity-0 after:animate-[expand_2.5s_infinite_0.5s]',
        colorStyles[color]
      )} />
      <div className={cn('relative rounded-full z-10', sizeStyles[size], colorStyles[color])} />
      
      <style jsx>{`
        @keyframes expand {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
