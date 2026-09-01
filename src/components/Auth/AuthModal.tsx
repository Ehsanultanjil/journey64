import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Compass,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SupabaseAuth } from '../../lib/supabase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { refreshAuth } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await SupabaseAuth.signIn(email.trim(), password);
        setSuccessMsg('সফলভাবে লগইন হয়েছে! আপনার ভ্রমণ ডাটা সিঙ্ক হচ্ছে...');
        await refreshAuth();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else if (mode === 'signup') {
        if (password.length < 6) {
          throw new Error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
        }
        await SupabaseAuth.signUp(email.trim(), password, displayName.trim());
        setSuccessMsg('অ্যাকাউন্ট তৈরি হয়েছে! সরাসরি লগইন করতে পারেন।');
        await refreshAuth();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else if (mode === 'reset') {
        await SupabaseAuth.resetPassword(email.trim());
        setSuccessMsg('পাসওয়ার্ড রিসেট ইমেইল পাঠানো হয়েছে! আপনার ইনবক্স চেক করুন।');
        setTimeout(() => setMode('signin'), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'অথেনটিকেশন প্রক্রিয়ায় একটি ত্রুটি ঘটেছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md font-body">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-[#0F1218] border border-white/15 text-white p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-[#EA580C] text-white flex items-center justify-center shadow-md">
              <Compass className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white leading-tight">
                {mode === 'signin'
                  ? 'আমার বাংলাদেশ — লগইন'
                  : mode === 'signup'
                  ? 'নতুন অ্যাকাউন্ট তৈরি করুন'
                  : 'পাসওয়ার্ড রিসেট'}
              </h3>
              <p className="text-xs text-stone-400 font-light mt-0.5">
                ৬৪ জেলা ভ্রমণের সকল ডাটা ক্লাউডে সুরক্ষিত রাখুন
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex bg-white/5 p-1 rounded-2xl mb-5 border border-white/10 text-xs font-bold">
            <button
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all text-center cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[#EA580C] text-white shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              লগইন
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all text-center cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#EA580C] text-white shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              সাইন আপ
            </button>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981] text-xs rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'signup' && (
              <div>
                <label className="block font-bold text-stone-300 mb-1.5">
                  আপনার নাম
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="যেমন: এহসানুল তানজিল"
                    className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#EA580C] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-stone-300 mb-1.5">
                ইমেইল ঠিকানা
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#EA580C] transition-colors"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-stone-300">
                    পাসওয়ার্ড
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setMode('reset')}
                      className="text-[11px] text-[#EA580C] hover:underline cursor-pointer"
                    >
                      ভুলে গেছেন?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#EA580C] transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-[#EA580C] hover:bg-[#c2410c] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#EA580C]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>প্রসেসিং হচ্ছে...</span>
                </>
              ) : mode === 'signin' ? (
                <>
                  <span>লগইন করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : mode === 'signup' ? (
                <>
                  <span>অ্যাকাউন্ট তৈরি করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <span>রিসেট লিংক পাঠান</span>
              )}
            </button>
          </form>

          {/* Footer Security Badge */}
          <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            <span>সুপাবেস ক্লাউড এনক্রিপ্টেড ও সুরক্ষিত</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
