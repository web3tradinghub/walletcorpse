'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Clock, Activity, ShieldCheck, ShieldAlert, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { base } from 'viem/chains';
import { CONTRACT_ADDRESS } from '@/lib/web3/config';

interface ActivityItem {
  id: string;
  time: string;
  event: string;
  amount: string;
  status: 'drained' | 'rescued' | 'intercepted';
  details: string;
  txHash?: string;
}

interface ActivityTableProps {
  compromisedWallet?: string;
}

const statusStyles = {
  drained: {
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    dot: 'bg-red-500',
    label: 'Drained',
  },
  rescued: {
    color: 'text-[#00ff50]',
    bg: 'bg-[#00ff50]/10',
    border: 'border-[#00ff50]/20',
    dot: 'bg-[#00ff50]',
    label: 'Rescued',
  },
  intercepted: {
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    dot: 'bg-amber-500',
    label: 'Intercepted',
  },
};

export function ActivityTable({ compromisedWallet }: ActivityTableProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!compromisedWallet) {
      setLoading(false);
      return;
    }
    loadRealEvents();
  }, [compromisedWallet]);

  async function loadRealEvents() {
    try {
      setLoading(true);
      const client = createPublicClient({
        chain: base,
        transport: http('https://base-mainnet.g.alchemy.com/v2/1gMNepUoqdEeE6edf46Dz')
      });

      const currentBlock = await client.getBlockNumber();
      const fromBlock = currentBlock - BigInt(9000);

      const ethRescueLogs = await client.getLogs({
        address: CONTRACT_ADDRESS,
        event: parseAbiItem('event ETHRescued(address indexed compromised, address indexed safe, uint256 totalAmount, uint256 userAmount, uint256 platformFee, uint256 timestamp)'),
        fromBlock,
        toBlock: currentBlock,
      });

      const erc20Logs = await client.getLogs({
        address: CONTRACT_ADDRESS,
        event: parseAbiItem('event ERC20Rescued(address indexed compromised, address indexed safe, address indexed token, uint256 userAmount, uint256 platformFee, uint256 timestamp)'),
        fromBlock,
        toBlock: currentBlock,
      });

      const activatedLogs = await client.getLogs({
        address: CONTRACT_ADDRESS,
        event: parseAbiItem('event WalletActivated(address indexed compromised, address indexed safe, uint256 fee, uint256 timestamp)'),
        fromBlock,
        toBlock: currentBlock,
      });

      const allEvents: ActivityItem[] = [];

      for (const log of ethRescueLogs) {
        const args = log.args as any;
        const date = new Date(Number(args.timestamp) * 1000);
        allEvents.push({
          id: log.transactionHash || Math.random().toString(),
          time: date.toLocaleTimeString('en-US', { hour12: false }),
          event: 'ETH Rescued Successfully',
          amount: `${(Number(args.userAmount) / 1e18).toFixed(4)} ETH`,
          status: 'rescued',
          details: `Safe wallet: ${(args.safe as string).slice(0, 10)}...`,
          txHash: log.transactionHash || undefined,
        });
      }

      for (const log of erc20Logs) {
        const args = log.args as any;
        const date = new Date(Number(args.timestamp) * 1000);
        allEvents.push({
          id: log.transactionHash || Math.random().toString(),
          time: date.toLocaleTimeString('en-US', { hour12: false }),
          event: 'ERC20 Token Rescued',
          amount: `${(Number(args.userAmount) / 1e18).toFixed(2)} Tokens`,
          status: 'rescued',
          details: `Token: ${(args.token as string).slice(0, 10)}...`,
          txHash: log.transactionHash || undefined,
        });
      }

      for (const log of activatedLogs) {
        const args = log.args as any;
        const date = new Date(Number(args.timestamp) * 1000);
        allEvents.push({
          id: log.transactionHash || Math.random().toString(),
          time: date.toLocaleTimeString('en-US', { hour12: false }),
          event: 'Defense Activated',
          amount: `${(Number(args.fee) / 1e18).toFixed(4)} ETH`,
          status: 'intercepted',
          details: `Wallet: ${(args.compromised as string).slice(0, 10)}...`,
          txHash: log.transactionHash || undefined,
        });
      }

      allEvents.sort((a, b) => b.time.localeCompare(a.time));
      setActivities(allEvents);
    } catch (err) {
      console.error('Error loading events:', err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto py-10">
      <div className="flex flex-col h-[600px] bg-black/40 border border-[#00ff50]/15 rounded-3xl overflow-hidden backdrop-blur-xl">
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#00ff50]/10 bg-black/60">
          <div className="flex items-center gap-3">
            <Terminal size={20} className="text-[#00ff50]" />
            <h2 className="text-xl font-black text-white tracking-tighter uppercase">
              Real-time Defense Activity
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff50] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff50]"></span>
            </span>
            <span className="text-[10px] text-[#00ff50] font-mono font-bold uppercase tracking-widest">
              Live — Base Chain
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#00ff50] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Loading blockchain events...</p>
              </div>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <ShieldCheck size={48} className="text-[#00ff50]/20 mx-auto mb-3" />
                <p className="text-slate-400 text-sm font-bold">No activity yet</p>
                <p className="text-slate-600 text-xs mt-1">
                  Defense active — waiting for incoming transactions
                </p>
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[10px] font-black text-[#00ff50]/60 uppercase tracking-[0.2em] border-b border-[#00ff50]/10">
                  <th className="px-8 py-4">Time</th>
                  <th className="px-8 py-4">Event</th>
                  <th className="px-8 py-4 text-right">Amount</th>
                  <th className="px-8 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activities.map((activity, i) => {
                  const style = statusStyles[activity.status];
                  return (
                    <motion.tr
                      key={activity.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/3 transition-colors group cursor-pointer"
                      onClick={() => activity.txHash && window.open(`https://basescan.org/tx/${activity.txHash}`, '_blank')}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-slate-400 font-mono text-sm">
                          <Clock size={12} className="text-slate-600" />
                          {activity.time}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-white group-hover:text-[#00ff50] transition-colors">
                          {activity.event}
                        </p>
                        <p className="text-[10px] font-mono text-slate-600 mt-0.5">
                          {activity.details}
                        </p>
                      </td>
                      <td className="px-8 py-5 text-right font-mono text-sm">
                        <div className={cn("flex items-center justify-end gap-1 font-bold", style.color)}>
                          {activity.status === 'rescued' ? <ArrowUpRight size={12} /> :
                           activity.status === 'drained' ? <ArrowDownLeft size={12} /> : null}
                          {activity.amount}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center">
                          <div className={cn("px-3 py-1 rounded-full border flex items-center gap-1.5", style.bg, style.border)}>
                            <div className={cn("w-1.5 h-1.5 rounded-full", style.dot)} />
                            <span className={cn("text-[10px] font-bold uppercase tracking-wider", style.color)}>
                              {style.label}
                            </span>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-8 py-4 bg-black/60 border-t border-[#00ff50]/10 flex items-center justify-between text-[10px] font-mono text-[#00ff50]/40 uppercase tracking-widest">
          <span>Contract: {CONTRACT_ADDRESS?.slice(0, 10)}...</span>
          <span>Network: Base Mainnet</span>
        </div>
      </div>
    </div>
  );
}
