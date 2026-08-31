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
  const { authUser, refreshAuth } = useApp();

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
        setSuccessMsg('Successfully signed in! Syncing your data...');
        await refreshAuth();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else if (mode === 'signup') {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        await SupabaseAuth.signUp(email.trim(), password, displayName.trim());
        setSuccessMsg('Account created! Please check your email to confirm or sign in directly.');
        await refreshAuth();
        setTimeout(() => {
          onClose();
        }, 2000);
      } else if (mode === 'reset') {
        await SupabaseAuth.resetPassword(email.trim());
        setSuccessMsg('Password reset email sent! Check your inbox.');
        setTimeout(() => setMode('signin'), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-[#0c0c0c] border border-white/15 text-white p-6 sm:p-8 shadow-2xl relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#F27D26] text-white flex items-center justify-center font-bold">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-2xl uppercase tracking-wider text-white">
                {mode === 'signin'
                  ? 'Sign In to Journey64'
                  : mode === 'signup'
                  ? 'Create Account'
                  : 'Reset Password'}
              </h3>
              <p className="font-body text-xs text-stone-400">
                Sync your 64-district travels across all devices
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex border-b border-white/10 mb-6 text-xs font-display uppercase tracking-wider">
            <button
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 transition-colors text-center ${
                mode === 'signin'
                  ? 'text-[#F27D26] border-b-2 border-[#F27D26] font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 transition-colors text-center ${
                mode === 'signup'
                  ? 'text-[#F27D26] border-b-2 border-[#F27D26] font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-body flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 text-[#3ECF8E] text-xs font-body flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-display uppercase text-stone-300 tracking-wider mb-1.5">
                  Full Name / Explorer Handle
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Ehsanul Tanjil"
                    className="w-full bg-white/5 border border-white/10 pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F27D26] font-body"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-display uppercase text-stone-300 tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-white/5 border border-white/10 pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F27D26] font-body"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-display uppercase text-stone-300 tracking-wider">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setMode('reset')}
                      className="text-[11px] text-[#F27D26] hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F27D26] font-body"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-[#F27D26] hover:bg-[#d96615] text-white font-display text-sm uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : mode === 'signin' ? (
                <>
                  Sign In & Sync
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : mode === 'signup' ? (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                'Send Reset Email'
              )}
            </button>
          </form>

          {/* Guest / Offline Mode footer */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-stone-500">
            <span>Using offline guest storage?</span>
            <button
              onClick={onClose}
              className="text-stone-300 hover:text-white underline cursor-pointer"
            >
              Continue as Guest
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
