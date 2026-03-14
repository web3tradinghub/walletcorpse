'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletAddressProps {
  address: string;
  className?: string;
  truncated?: boolean;
}

export function WalletAddress({ 
  address, 
  className, 
  truncated = true 
}: WalletAddressProps) {
  const [copied, setCopied] = useState(false);
  const displayAddress = truncated 
    ? `${address.slice(0, 6)}...${address.slice(-4)}` 
    : address;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <div className={cn('relative group inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-[#00ff50]/80 bg-[#00ff50]/5 px-3 py-1.5 rounded-lg border border-[#00ff50]/10 hover:border-[#00ff50]/30 transition-all cursor-pointer', className)}
      onClick={handleCopy}
    >
      <span>{displayAddress}</span>
      {copied ? <Check size={12} className="text-[#00ff50]" /> : <Copy size={12} className="text-[#00ff50]/40 group-hover:text-[#00ff50]" />}
      
      {/* Tooltip for full address */}
      {truncated && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 border border-[#00ff50]/30 text-white text-[10px] px-3 py-1.5 rounded-lg pointer-events-none whitespace-nowrap z-50 shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
          {address}
        </div>
      )}
      
      {/* Copied indicator */}
      {copied && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#00ff50] text-[#050a05] text-[10px] font-black px-3 py-1 rounded-full whitespace-nowrap z-50">
          COPIED TO CLIPBOARD
        </div>
      )}
    </div>
  );
}
