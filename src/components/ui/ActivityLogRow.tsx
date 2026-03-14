'use client';

import { motion } from 'framer-motion';
import { Clock, ArrowUpRight, ArrowDownLeft, ShieldCheck, ShieldAlert, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PulsingDot } from './PulsingDot';

interface ActivityLogRowProps {
  time: string;
  event: string;
  amount: string;
  status: 'drained' | 'rescued' | 'intercepted';
  details: string;
  index: number;
}

const statusStyles = {
  drained: {
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    label: 'Drained',
    icon: ShieldAlert,
    dotColor: 'red' as const,
  },
  rescued: {
    color: 'text-[#00ff50]',
    bg: 'bg-[#00ff50]/10',
    border: 'border-[#00ff50]/20',
    label: 'Rescued',
    icon: ShieldCheck,
    dotColor: 'green' as const,
  },
  intercepted: {
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    label: 'Intercepted',
    icon: Activity,
    dotColor: 'yellow' as const,
  },
};

export function ActivityLogRow({ 
  time, 
  event, 
  amount, 
  status, 
  details, 
  index 
}: ActivityLogRowProps) {
  const style = statusStyles[status];

  return (
    <motion.tr 
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.4,
        delay: index * 0.05,
        ease: 'easeOut'
      }}
      className="hover:bg-[#00ff50]/[0.03] transition-colors duration-200 group border-b border-[#00ff50]/5 last:border-0"
    >
      {/* Time Column */}
      <td className="px-8 py-6 whitespace-nowrap">
        <div className="flex items-center gap-3 text-slate-500 font-mono text-sm group-hover:text-slate-300 transition-colors">
          <Clock size={14} className="opacity-40 group-hover:opacity-100" />
          {time}
        </div>
      </td>

      {/* Event Column */}
      <td className="px-8 py-6">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-black text-white group-hover:text-[#00ff50] transition-colors tracking-tight">
            {event}
          </span>
          <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest group-hover:text-slate-500">
            {details}
          </span>
        </div>
      </td>

      {/* Amount Column */}
      <td className="px-8 py-6 text-right font-mono text-sm">
        <div className={cn('flex items-center justify-end gap-2 font-bold', style.color)}>
          {status === 'rescued' ? <ArrowUpRight size={14} /> : 
           status === 'drained' ? <ArrowDownLeft size={14} /> : null}
          {amount}
        </div>
      </td>

      {/* Status Column */}
      <td className="px-8 py-6">
        <div className="flex items-center justify-center">
          <div className={cn(
            'px-4 py-1.5 rounded-full border flex items-center gap-2.5 transition-all duration-300 backdrop-blur-md shadow-lg',
            style.bg, style.border
          )}>
            <PulsingDot color={style.dotColor} size="sm" />
            <span className={cn('text-[10px] font-black uppercase tracking-widest', style.color)}>
              {style.label}
            </span>
          </div>
        </div>
      </td>
    </motion.tr>
  );
}
