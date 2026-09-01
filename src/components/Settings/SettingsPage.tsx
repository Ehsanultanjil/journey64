import React, { useState } from 'react';
import {
  User,
  Settings,
  ShieldCheck,
  Check,
  LogOut,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsPage: React.FC = () => {
  const {
    profile,
    settings,
    authUser,
    openAuthModal,
    signOut,
    cloudSync,
    updateProfile,
    updateSettings,
  } = useApp();

  const [nameDraft, setNameDraft] = useState(profile.name || '');
  const [bioDraft, setBioDraft] = useState(profile.bio || '');
  const [savedToast, setSavedToast] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: nameDraft.trim(),
      bio: bioDraft.trim(),
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  if (!authUser) {
    return (
      <div className="w-full max-w-lg mx-auto py-16 px-4 text-center space-y-6 animate-in fade-in duration-300 font-body">
        <div className="w-16 h-16 rounded-3xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center mx-auto shadow-md border border-[#10B981]/30">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            লগইন প্রয়োজন
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 font-light max-w-sm mx-auto leading-relaxed">
            আপনার ব্যক্তিগত প্রোফাইল তৈরি করতে এবং ৬৪ জেলার সকল ভ্রমণ ডাটা ক্লাউডে সুরক্ষিত রাখতে লগইন করুন।
          </p>
        </div>
        <button
          onClick={openAuthModal}
          className="px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-[#10B981]/30 cursor-pointer inline-flex items-center gap-2 hover:scale-105"
        >
          <span>লগইন / সাইন আপ করুন</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <span className="font-body font-bold text-[10px] uppercase tracking-wider text-[#10B981]">
          ব্যবহারকারী কনফিগারেশন
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mt-0.5">
          সেটিংস
        </h1>
      </div>

      <div className="space-y-5">
        {/* 1. Profile Card */}
        <div className="bg-[#12141A]/90 border border-white/10 p-5 sm:p-6 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-[#10B981] text-white flex items-center justify-center font-bold text-base shadow-sm">
              {(nameDraft || authUser?.email || 'U')[0]?.toUpperCase()}
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white leading-tight">
                ভ্রমণকারী প্রোফাইল
              </h3>
              <p className="font-body text-xs text-stone-400 font-light">
                আপনার ডায়েরিতে প্রদর্শিত নাম ও নীতিবাক্য
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 font-body">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5">
                নাম / নামফলক
              </label>
              <input
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="যেমন: আপনার নাম"
                className="w-full px-4 py-2.5 text-xs bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#10B981] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5">
                ভ্রমণ নীতিবাক্য
              </label>
              <input
                type="text"
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                placeholder="যেমন: ৬৪ জেলার পথে প্রান্তরে..."
                className="w-full px-4 py-2.5 text-xs bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#10B981] transition-colors"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              {savedToast && (
                <span className="text-xs font-bold text-[#10B981] flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> সংরক্ষিত হয়েছে
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </div>

        {/* 2. Display & Appearance */}
        <div className="bg-[#12141A]/90 border border-white/10 p-5 sm:p-6 rounded-3xl space-y-4 shadow-sm font-body">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center shadow-sm">
              <Settings className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white leading-tight">
                ডিসপ্লে পছন্দ
              </h3>
              <p className="text-xs text-stone-400 font-light">
                কালার থিম ও মানচিত্র ইন্টারফেস
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {/* District Labels */}
            <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5">
              <div>
                <p className="text-xs font-bold text-white">মানচিত্রে জেলার নাম</p>
                <p className="text-[11px] text-stone-400 font-light">
                  মানচিত্রের ওপরে বাংলা জেলার নামফলক প্রদর্শন
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.showDistrictLabels}
                onChange={(e) => updateSettings({ showDistrictLabels: e.target.checked })}
                className="w-5 h-5 accent-[#10B981] cursor-pointer rounded"
              />
            </div>
          </div>
        </div>

        {/* 3. Account & Auto-Sync Status */}
        <div className="bg-[#12141A]/90 border border-white/10 p-5 sm:p-6 rounded-3xl space-y-4 shadow-sm font-body">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white leading-tight">
                  অ্যাকাউন্ট ও ক্লাউড সিঙ্ক
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      cloudSync.connected ? 'bg-[#10B981] animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <p className="text-xs text-stone-300">
                    {cloudSync.connected ? 'অটো-সিঙ্ক সক্রিয় (Supabase)' : 'লোকাল মেমোরিতে সক্রিয়'}
                  </p>
                </div>
              </div>
            </div>

            {authUser ? (
              <button
                onClick={signOut}
                className="px-4 py-2 bg-white/10 hover:bg-rose-600/20 text-stone-300 hover:text-rose-400 border border-white/15 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                লগআউট
              </button>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>লগইন করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-xs text-stone-400 font-light flex items-center justify-between">
            <span>বর্তমান ব্যবহারকারী:</span>
            <span className="text-white font-semibold">
              {authUser ? authUser.email : 'গেস্ট ইউজার'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
