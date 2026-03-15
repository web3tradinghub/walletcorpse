'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Shield, Activity, Clock, Zap } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface BackendStatus {
  status: string;
  chains: number;
  watchingWallets: number;
  balances: Record<string, string>;
}

interface LiveStatusProps {
  compromisedWallet?: string;
}

export function LiveStatus({ compromisedWallet }: LiveStatusProps) {
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [lastCheck, setLastCheck] = useState<string>('');
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [newRescue, setNewRescue] = useState<any>(null);

  // Backend status check every 10 seconds
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/backend/status`);
        const data = await res.json();
        setBackendStatus(data);
        setIsOnline(true);
        setLastCheck(new Date().toLocaleTimeString());
      } catch {
        setIsOnline(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // Activity logs check every 15 seconds
  useEffect(() => {
    if (!compromisedWallet) return;

    const checkActivity = async () => {
      try {
        const res = await fetch(`/api/backend/activity/${compromisedWallet}`);
        const data = await res.json();
        if (data.success && data.logs) {
          const prevCount = activityLogs.length;
          setActivityLogs(data.logs);
          // New rescue notification
          if (data.logs.length > prevCount && prevCount > 0) {
            setNewRescue(data.logs[0]);
            setTimeout(() => setNewRescue(null), 5000);
          }
        }
      } catch {}
    };

    checkActivity();
    const interval = setInterval(checkActivity, 15000);
    return () => clearInterval(interval);
  }, [compromisedWallet]);

  return (
    <div>
      {/* New rescue notification popup */}
      <AnimatePresence>
        {newRescue && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-24 left-1/2 z-50 bg-[#00ff50] text-[#050a05] px-6 py-3 rounded-2xl font-black text-sm shadow-[0_0_30px_rgba(0,255,80,0.5)]"
          >
            ✅ RESCUE SUCCESS! {newRescue.amount} {newRescue.token_symbol} rescued!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        
        {/* Backend connection */}
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${isOnline ? 'bg-[#00ff50]/5 border-[#00ff50]/20' : 'bg-red-500/5 border-red-500/20'}`}>
          {isOnline 
            ? <Wifi size={18} className="text-[#00ff50] flex-shrink-0" />
            : <WifiOff size={18} className="text-red-400 flex-shrink-0" />
          }
          <div>
            <p className="text-[10px] text-slate-500 font-mono">BACKEND</p>
            <p className={`text-xs font-bold ${isOnline ? 'text-[#00ff50]' : 'text-red-400'}`}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </p>
          </div>
        </div>

        {/* Chains monitoring */}
        <div className="flex items-center gap-3 p-4 rounded-xl border bg-blue-500/5 border-blue-500/20">
          <Activity size={18} className="text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-slate-500 font-mono">CHAINS</p>
            <p className="text-xs font-bold text-blue-400">
              {backendStatus?.chains || 0} ACTIVE
            </p>
          </div>
        </div>

        {/* Total rescues */}
        <div className="flex items-center gap-3 p-4 rounded-xl border bg-purple-500/5 border-purple-500/20">
          <Shield size={18} className="text-purple-400 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-slate-500 font-mono">RESCUES</p>
            <p className="text-xs font-bold text-purple-400">
              {activityLogs.length} TOTAL
            </p>
          </div>
        </div>

        {/* Last check */}
        <div className="flex items-center gap-3 p-4 rounded-xl border bg-amber-500/5 border-amber-500/20">
          <Clock size={18} className="text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-slate-500 font-mono">LAST CHECK</p>
            <p className="text-xs font-bold text-amber-400">
              {lastCheck || 'Checking...'}
            </p>
          </div>
        </div>
      </div>

      {/* Chain balances */}
      {backendStatus?.balances && isOnline && (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-[#00ff50]" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">

      {/* Recent activity */}
      {activityLogs.length > 0 && (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 mb-8">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Recent Rescue Activity
          </p>
          <div className="flex flex-col gap-2">
            {activityLogs.slice(0, 5).map((log, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-[#00ff50]' : 'bg-red-400'}`} />
                  <p className="text-xs text-white">{log.event_type}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-[#00ff50] font-mono">{log.amount} {log.token_symbol}</p>
                  <p className="text-[10px] text-slate-500">
                    {new Date(log.created_at * 1000).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
