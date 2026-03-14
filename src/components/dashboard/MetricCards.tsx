'use client';

import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Activity } from 'lucide-react';

interface MetricCardsProps {
  rescuedETH?: number;
  rescueCount?: number;
  totalPlatformRescued?: number;
}

export function MetricCards({ 
  rescuedETH = 0, 
  rescueCount = 0,
  totalPlatformRescued = 0
}: MetricCardsProps) {
  const metrics = [
    {
      label: 'Total ETH Rescued',
      value: `${rescuedETH.toFixed(4)} ETH`,
      sub: 'Sent to your safe wallet',
      icon: TrendingUp,
      color: 'text-[#00ff50]',
      bg: 'bg-[#00ff50]/10',
      border: 'border-[#00ff50]/20',
    },
    {
      label: 'Rescue Operations',
      value: rescueCount.toString(),
      sub: 'Successful intercepts',
      icon: Activity,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label: 'Platform Total Rescued',
      value: `${totalPlatformRescued.toFixed(2)} ETH`,
      sub: 'Across all users',
      icon: TrendingDown,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {metrics.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`bg-white/3 border ${m.border} rounded-2xl p-6 hover:bg-white/5 transition-all`}
        >
          <div className="flex items-start justify-between mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {m.label}
            </p>
            <div className={`w-8 h-8 ${m.bg} rounded-lg flex items-center justify-center`}>
              <m.icon size={14} className={m.color} />
            </div>
          </div>
          <p className={`text-3xl font-black ${m.color} mb-1`}>{m.value}</p>
          <p className="text-xs text-slate-500">{m.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}
