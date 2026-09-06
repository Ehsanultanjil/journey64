import React, { useState, useEffect } from 'react';
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
  Eye,
  EyeOff,
  Sparkles,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SupabaseAuth } from '../../lib/supabase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { refreshAuth, authPromptMessage } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Clear messages on modal open / mode switch
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, mode]);

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
        }, 900);
      } else if (mode === 'signup') {
        if (password.length < 6) {
          throw new Error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
        }
        await SupabaseAuth.signUp(email.trim(), password, displayName.trim());
        setSuccessMsg('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! স্বাগতম।');
        await refreshAuth();
        setTimeout(() => {
          onClose();
        }, 1100);
      } else if (mode === 'reset') {
        await SupabaseAuth.resetPassword(email.trim());
        setSuccessMsg('পাসওয়ার্ড রিসেট ইমেইল পাঠানো হয়েছে! আপনার ইনবক্স চেক করুন।');
        setTimeout(() => setMode('signin'), 3000);
      }
    } catch (err: any) {
      let rawMsg = err?.message || 'অথেনটিকেশন প্রক্রিয়ায় একটি ত্রুটি ঘটেছে।';
      if (rawMsg.includes('Invalid login credentials')) {
        rawMsg = 'ভুল ইমেইল অথবা পাসওয়ার্ড দেওয়া হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
      } else if (rawMsg.includes('User already registered')) {
        rawMsg = 'এই ইমেইল দিয়ে ইতোমধ্যে অ্যাকাউন্ট রয়েছে। লগইন করার চেষ্টা করুন।';
      }
      setErrorMsg(rawMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md font-body">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="w-full max-w-md bg-[#0F1218] border border-white/15 text-white p-5 sm:p-7 rounded-[28px] sm:rounded-3xl shadow-2xl relative overflow-hidden z-10"
        >
          {/* Subtle Ambient Background Light */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#059669]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer z-20"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#059669] to-emerald-400 text-white flex items-center justify-center shadow-lg shadow-[#059669]/30">
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
              <p className="text-xs text-stone-300 font-light mt-0.5">
                ৬৪ জেলা ভ্রমণের সকল স্মৃতি ও তালিকা সংরক্ষণ করুন
              </p>
            </div>
          </div>

          {/* Contextual Action Prompt (if triggered by a gated action) */}
          {authPromptMessage && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-2.5 bg-[#059669]/15 border border-[#059669]/40 rounded-xl flex items-center gap-2 text-xs text-emerald-200"
            >
              <Info className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{authPromptMessage}</span>
            </motion.div>
          )}

          {/* Mode Switch Tabs */}
          <div className="flex bg-white/5 p-1 rounded-2xl mb-4 border border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all text-center cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[#059669] text-white shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              লগইন
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all text-center cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#059669] text-white shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              সাইন আপ
            </button>
          </div>

          {/* Alert messages */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/15 border border-red-500/35 text-red-200 text-xs rounded-2xl flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-[#059669]/20 border border-[#059669]/50 text-emerald-300 text-xs rounded-2xl flex items-center gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {mode === 'signup' && (
              <div>
                <label className="block font-bold text-stone-300 mb-1.5">
                  আপনার নাম
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="যেমন: তানজিল আহমেদ"
                    className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-stone-300 mb-1.5">
                ইমেইল ঠিকানা
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all"
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
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                    >
                      পাসওয়ার্ড ভুলে গেছেন?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ অক্ষর"
                    className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white cursor-pointer p-0.5"
                    tabIndex={-1}
                    aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখান'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {mode === 'reset' && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-xs text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                  ← লগইন পেজে ফিরে যান
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-[#059669] hover:bg-[#047857] active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#059669]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </>
              ) : (
                <span>পাসওয়ার্ড রিসেট লিংক পাঠান</span>
              )}
            </button>
          </form>

          {/* Guest Explanation Notice */}
          <div className="mt-4 p-2.5 bg-white/5 border border-white/10 rounded-xl text-[11px] text-stone-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              লগইন ছাড়াই মানচিত্র ও ৬৪ জেলার তথ্য দেখা যাবে। ভ্রমণ স্থিতি ও স্মৃতি সংরক্ষণ করতে লগইন করুন।
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
