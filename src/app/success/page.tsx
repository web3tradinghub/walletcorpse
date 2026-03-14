'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Shield, ArrowRight, Copy } from 'lucide-react';
import { useState, Suspense } from 'react';

function SuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const wallet = params.get('wallet');
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (wallet) {
      navigator.clipboard.writeText(wallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#050a05] text-white flex items-center justify-center p-6"
      style={{
        backgroundImage: `linear-gradient(rgba(0,255,80,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,80,0.04) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }}>

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00ff50]/8 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center relative z-10"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#00ff50]/10 border-2 border-[#00ff50]/30 mb-8 mx-auto"
        >
          <CheckCircle size={48} className="text-[#00ff50]" />
        </motion.div>

        <h1 className="text-4xl font-black text-white mb-3">
          Defense <span className="text-[#00ff50]">Active!</span>
        </h1>
        <p className="text-slate-400 mb-8">
          Your wallet is now protected 24/7. Any incoming funds will be automatically rescued to your safe wallet.
        </p>

        {/* Wallet Info */}
        {wallet && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6 mb-8 text-left">
            <p className="text-xs text-slate-500 font-mono mb-2">PROTECTED WALLET</p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[#00ff50] font-mono text-sm truncate">{wallet}</p>
              <button
                onClick={copyAddress}
                style={{cursor:'pointer'}}
                className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
              >
                {copied ? <CheckCircle size={16} className="text-[#00ff50]" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        )}

        {/* What happens next */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 mb-8 text-left">
          <p className="text-xs text-slate-500 font-mono mb-4">WHAT HAPPENS NOW</p>
          {[
            'Backend monitors your wallet 24/7',
            'Any incoming tx detected instantly',
            'Flashbots rescue before hacker bot',
            '90% sent to your safe wallet',
            'Active until you manually stop it',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
              <div className="w-5 h-5 rounded-full bg-[#00ff50]/20 border border-[#00ff50]/30 flex items-center justify-center flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00ff50]" />
              </div>
              <p className="text-slate-300 text-sm">{item}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push('/dashboard')}
          style={{cursor:'pointer'}}
          className="w-full bg-[#00ff50] text-[#050a05] py-4 rounded-xl font-black text-lg uppercase tracking-tight hover:bg-[#00ff50]/90 transition-all flex items-center justify-center gap-2"
        >
          <Shield size={20} />
          View Dashboard
          <ArrowRight size={20} />
        </button>
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
