'use client';

import { Shield, Settings, Bell, User, LogOut, X, Check, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDisconnect, useWriteContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/web3/config';

interface Notification {
  id: string;
  message: string;
  time: string;
  type: 'rescue' | 'warning' | 'info';
  read: boolean;
}

export function DashboardHeader({ address }: { address: string }) {
  const router = useRouter();
  const { disconnect } = useDisconnect();
  const { writeContract } = useWriteContract();

  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '0x...';

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      message: 'Defense activated successfully',
      time: 'Just now',
      type: 'info',
      read: false
    },
    {
      id: '2',
      message: '24/7 monitoring active on 17 chains',
      time: '2 min ago',
      type: 'info',
      read: false
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleDisconnect = () => {
    disconnect();
    router.push('/');
  };

  const handleDeactivate = async () => {
    if (!confirm('Are you sure you want to deactivate defense? Your wallet will no longer be protected.')) return;
    try {
      // Get compromised wallet from URL
      const params = new URLSearchParams(window.location.search);
      const compromisedWallet = params.get('wallet');
      if (!compromisedWallet) return;

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'deactivate',
        args: [compromisedWallet as `0x${string}`],
      }, {
        onSuccess: () => {
          alert('Defense deactivated successfully');
          router.push('/');
        },
        onError: (err) => {
          alert('Error: ' + err.message);
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setShowNotifications(false);
        setShowSettings(false);
        setShowProfile(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <header className="h-20 flex items-center justify-between px-8 border-b border-[#00ff50]/20 bg-[#050a05]/80 backdrop-blur-xl sticky top-0 z-50">
      
      {/* Logo */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-[#00ff50] rounded-xl flex items-center justify-center">
          <Shield size={24} className="text-[#050a05]" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black text-white tracking-tighter leading-none">WALLET</span>
          <span className="text-xl font-black text-[#00ff50] tracking-tighter leading-none italic">CORPSE</span>
        </div>
      </div>

      {/* Center — address + live */}
      <div className="flex items-center gap-4">
        <div className="px-4 py-2 rounded-full bg-[#00ff50]/5 border border-[#00ff50]/10 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#00ff50] animate-pulse" />
          <span className="text-xs font-mono font-bold text-[#00ff50] tracking-widest">{truncatedAddress}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live Monitoring</span>
        </div>
      </div>

      {/* Right — action buttons */}
      <div className="flex items-center gap-3">

        {/* Notifications */}
        <div className="relative" data-dropdown>
          <button
            onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); setShowSettings(false); setShowProfile(false); }}
            style={{cursor:'pointer'}}
            className="relative p-2.5 rounded-xl bg-[#00ff50]/5 border border-[#00ff50]/10 text-slate-400 hover:text-[#00ff50] hover:border-[#00ff50]/30 transition-all"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-[#0a0f0a] border border-[#00ff50]/20 rounded-2xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <p className="text-xs font-bold text-white uppercase tracking-widest">Notifications</p>
                <button onClick={markAllRead} style={{cursor:'pointer'}} className="text-[10px] text-[#00ff50] font-bold hover:opacity-70">
                  Mark all read
                </button>
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-slate-500 text-xs">No notifications</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-white/5 ${!n.read ? 'bg-[#00ff50]/3' : ''}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === 'rescue' ? 'bg-[#00ff50]' : n.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-400'}`} />
                    <div className="flex-1">
                      <p className="text-xs text-white">{n.message}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{n.time}</p>
                    </div>
                    <button onClick={() => deleteNotification(n.id)} style={{cursor:'pointer'}} className="text-slate-600 hover:text-red-400 transition-colors">
                      <X size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="relative" data-dropdown>
          <button
            onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); setShowNotifications(false); setShowProfile(false); }}
            style={{cursor:'pointer'}}
            className="p-2.5 rounded-xl bg-[#00ff50]/5 border border-[#00ff50]/10 text-slate-400 hover:text-[#00ff50] hover:border-[#00ff50]/30 transition-all"
          >
            <Settings size={18} />
          </button>

          {showSettings && (
            <div className="absolute right-0 top-12 w-64 bg-[#0a0f0a] border border-[#00ff50]/20 rounded-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-xs font-bold text-white uppercase tracking-widest">Settings</p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => { router.push('/activate'); setShowSettings(false); }}
                  style={{cursor:'pointer'}}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
                >
                  <Shield size={14} className="text-[#00ff50]" />
                  <span className="text-xs text-slate-300">Manage Protection</span>
                </button>
                <button
                  onClick={() => { handleDeactivate(); setShowSettings(false); }}
                  style={{cursor:'pointer'}}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors text-left"
                >
                  <Trash2 size={14} className="text-red-400" />
                  <span className="text-xs text-red-400">Deactivate Defense</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" data-dropdown>
          <button
            onClick={(e) => { e.stopPropagation(); setShowProfile(!showProfile); setShowNotifications(false); setShowSettings(false); }}
            style={{cursor:'pointer'}}
            className="w-10 h-10 rounded-full bg-[#00ff50]/10 border border-[#00ff50]/20 flex items-center justify-center hover:border-[#00ff50]/50 transition-all"
          >
            <User size={18} className="text-[#00ff50]" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-64 bg-[#0a0f0a] border border-[#00ff50]/20 rounded-2xl overflow-hidden z-50">
              <div className="px-4 py-4 border-b border-white/5">
                <div className="w-10 h-10 rounded-full bg-[#00ff50]/10 border border-[#00ff50]/20 flex items-center justify-center mx-auto mb-2">
                  <User size={20} className="text-[#00ff50]" />
                </div>
                <p className="text-xs text-center text-slate-400 font-mono truncate">{address}</p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00ff50]" />
                  <p className="text-[10px] text-[#00ff50] font-bold">Defense Active</p>
                </div>
              </div>
              <div className="p-2">
                <button
                  onClick={() => { navigator.clipboard.writeText(address); }}
                  style={{cursor:'pointer'}}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
                >
                  <Check size={14} className="text-slate-400" />
                  <span className="text-xs text-slate-300">Copy Address</span>
                </button>
                <button
                  onClick={handleDisconnect}
                  style={{cursor:'pointer'}}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors text-left"
                >
                  <LogOut size={14} className="text-red-400" />
                  <span className="text-xs text-red-400">Disconnect</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
