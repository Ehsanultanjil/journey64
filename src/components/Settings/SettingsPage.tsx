import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  User,
  Settings,
  Sun,
  Moon,
  Cloud,
  CloudUpload,
  CloudDownload,
  Download,
  Upload,
  Trash2,
  Check,
  MapPin,
  Sparkles,
  AlertTriangle,
  LogOut,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../lib/storage';

export const SettingsPage: React.FC = () => {
  const {
    profile,
    settings,
    authUser,
    openAuthModal,
    signOut,
    cloudSync,
    pushToCloud,
    pullFromCloud,
    updateProfile,
    updateSettings,
    resetToCleanSlate,
    loadDemoMode,
    importJsonBackup,
    setActiveTab,
  } = useApp();

  const [nameDraft, setNameDraft] = useState(profile.name || '');
  const [bioDraft, setBioDraft] = useState(profile.bio || '');
  const [savedToast, setSavedToast] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [confirmDemoOpen, setConfirmDemoOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: nameDraft.trim(),
      bio: bioDraft.trim(),
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importJsonBackup(content);
        if (res.success) {
          setSyncToast('ব্যাকআপ সফলভাবে রিস্টোর হয়েছে!');
          setTimeout(() => {
            setSyncToast(null);
            setActiveTab('explore');
          }, 1500);
        } else {
          setSyncToast(`ইমপোর্ট ব্যর্থ: ${res.error}`);
          setTimeout(() => setSyncToast(null), 3000);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="font-body font-bold text-[10px] uppercase tracking-wider text-[#EA580C]">
            কন্ট্রোল প্যানেল
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mt-0.5">
            সেটিংস ও প্রোফাইল
          </h1>
        </div>

        {/* Quick Auth Status Pill */}
        <div className="flex items-center gap-2 bg-[#12141A] border border-white/10 px-3.5 py-1.5 rounded-full self-start sm:self-auto">
          <span
            className={`w-2 h-2 rounded-full ${
              cloudSync.connected ? 'bg-[#10B981] animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="font-body text-xs font-semibold text-stone-300">
            {authUser ? authUser.email : 'গেস্ট সেশন (অফলাইন)'}
          </span>
        </div>
      </div>

      {syncToast && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-[#EA580C]/15 border border-[#EA580C]/40 text-[#EA580C] font-body text-xs font-bold rounded-2xl flex items-center gap-2"
        >
          <Check className="w-4 h-4 shrink-0" />
          {syncToast}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Profile Card */}
        <div className="bg-[#12141A]/90 border border-white/10 p-5 sm:p-6 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EA580C] text-white flex items-center justify-center font-bold text-base shadow-sm">
                {(nameDraft || authUser?.email || 'U')[0]?.toUpperCase()}
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white leading-tight">
                  ভ্রমণকারী পরিচিতি
                </h3>
                <p className="font-body text-xs text-stone-400 font-light">
                  আপনার ডায়েরির নাম ও নীতিবাক্য
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 font-body">
              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  নাম / নামফলক
                </label>
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  placeholder="যেমন: এহসানুল তানজিল"
                  className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#EA580C] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  ভ্রমণ নীতিবাক্য
                </label>
                <input
                  type="text"
                  value={bioDraft}
                  onChange={(e) => setBioDraft(e.target.value)}
                  placeholder="যেমন: ৬৪ জেলার পথে প্রান্তরে..."
                  className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#EA580C] transition-colors"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                {savedToast && (
                  <span className="text-xs font-bold text-[#EA580C] flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> সংরক্ষিত
                  </span>
                )}
                <button
                  type="submit"
                  className="ml-auto px-4 py-2 bg-[#EA580C] hover:bg-[#c2410c] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 2. App & Map Preferences */}
        <div className="bg-[#12141A]/90 border border-white/10 p-5 sm:p-6 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center shadow-sm">
                <Settings className="w-5 h-5 text-[#EA580C]" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white leading-tight">
                  মানচিত্র ও ডিসপ্লে পছন্দ
                </h3>
                <p className="font-body text-xs text-stone-400 font-light">
                  থিম ও ইন্টারফেস কাস্টমাইজেশন
                </p>
              </div>
            </div>

            <div className="space-y-3 font-body">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                <div>
                  <p className="text-xs font-bold text-white">কালার থিম</p>
                  <p className="text-[11px] text-stone-400 font-light">
                    {settings.theme === 'dark' ? 'ডার্ক মোড সক্রিয়' : 'হোয়াইট মোড সক্রিয়'}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => updateSettings({ theme: 'light' })}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                      settings.theme === 'light'
                        ? 'bg-white text-stone-950 shadow-sm'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    হোয়াইট
                  </button>
                  <button
                    onClick={() => updateSettings({ theme: 'dark' })}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                      settings.theme === 'dark'
                        ? 'bg-[#EA580C] text-white shadow-sm'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    ডার্ক
                  </button>
                </div>
              </div>

              {/* District Labels Toggle */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                <div>
                  <p className="text-xs font-bold text-white">মানচিত্রে জেলার নাম</p>
                  <p className="text-[11px] text-stone-400 font-light">
                    মানচিত্রের উপরে বাংলা জেলার নাম প্রদর্শন
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showDistrictLabels}
                  onChange={(e) => updateSettings({ showDistrictLabels: e.target.checked })}
                  className="w-5 h-5 accent-[#EA580C] cursor-pointer rounded"
                />
              </div>

              {/* Wishlist Marker Toggle */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                <div>
                  <p className="text-xs font-bold text-white">ইচ্ছাতালিকা হাইলাইট</p>
                  <p className="text-[11px] text-stone-400 font-light">
                    মানচিত্রে সোনালী রঙে ইচ্ছাতালিকা প্রদর্শন
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showWishlistOnMap}
                  onChange={(e) => updateSettings({ showWishlistOnMap: e.target.checked })}
                  className="w-5 h-5 accent-[#EA580C] cursor-pointer rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Cloud Database & Backup Actions (Clean Single Card) */}
      <div className="bg-[#12141A]/90 border border-white/10 p-5 sm:p-7 rounded-3xl space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center shadow-sm">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white leading-tight">
                ক্লাউড ডাটাবেজ ও ব্যাকআপ
              </h3>
              <p className="font-body text-xs text-stone-400 font-light">
                আপনার ৬৪ জেলা ভ্রমণের সকল রেকর্ড ক্লাউড এবং লোকাল ফাইলে সংরক্ষণ করুন
              </p>
            </div>
          </div>

          {/* Account Login / Logout Button */}
          {authUser ? (
            <button
              onClick={signOut}
              className="px-4 py-2 bg-white/10 hover:bg-rose-600/20 text-stone-300 hover:text-rose-400 border border-white/15 rounded-xl font-body text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              লগআউট করুন
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className="px-4 py-2 bg-[#EA580C] hover:bg-[#c2410c] text-white rounded-xl font-body text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
            >
              <span>লগইন / সাইন আপ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-body">
          {/* Cloud Push */}
          <button
            onClick={async () => {
              setSyncToast('ক্লাউডে সিঙ্ক হচ্ছে...');
              const res = await pushToCloud();
              if (res.success) {
                setSyncToast('সুপাবেস ক্লাউডে সফলভাবে সংরক্ষিত হয়েছে!');
                setTimeout(() => setSyncToast(null), 2500);
              } else {
                setSyncToast(res.error || 'সিঙ্ক ব্যর্থ');
                setTimeout(() => setSyncToast(null), 3500);
              }
            }}
            disabled={cloudSync.syncing}
            className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#10B981] rounded-2xl text-left transition-all group cursor-pointer disabled:opacity-50 flex items-center gap-3"
          >
            <CloudUpload className="w-5 h-5 text-[#10B981] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">ক্লাউডে সেভ</p>
              <p className="text-[10px] text-stone-400">আপডেট আপলোড করুন</p>
            </div>
          </button>

          {/* Cloud Pull */}
          <button
            onClick={async () => {
              if (window.confirm('ক্লাউড থেকে ডাটা রিস্টোর করতে চান?')) {
                setSyncToast('ক্লাউড থেকে আনা হচ্ছে...');
                const res = await pullFromCloud();
                if (res.success) {
                  setSyncToast('ক্লাউড থেকে সফলভাবে রিস্টোর হয়েছে!');
                  setTimeout(() => setSyncToast(null), 2500);
                } else {
                  setSyncToast(res.error || 'কোনো ক্লাউড রেকর্ড মেলেনি');
                  setTimeout(() => setSyncToast(null), 3500);
                }
              }
            }}
            disabled={cloudSync.syncing}
            className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#10B981] rounded-2xl text-left transition-all group cursor-pointer disabled:opacity-50 flex items-center gap-3"
          >
            <CloudDownload className="w-5 h-5 text-[#10B981] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">ক্লাউড থেকে রিস্টোর</p>
              <p className="text-[10px] text-stone-400">ডাটা নামিয়ে আনুন</p>
            </div>
          </button>

          {/* Export JSON */}
          <button
            onClick={() => StorageService.exportBackupFile()}
            className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#EA580C] rounded-2xl text-left transition-all group cursor-pointer flex items-center gap-3"
          >
            <Download className="w-5 h-5 text-[#EA580C] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">ফাইল ব্যাকআপ</p>
              <p className="text-[10px] text-stone-400">JSON ফাইল ডাউনলোড</p>
            </div>
          </button>

          {/* Import JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#EA580C] rounded-2xl text-left transition-all group cursor-pointer flex items-center gap-3"
          >
            <Upload className="w-5 h-5 text-[#EA580C] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">ফাইল ইমপোর্ট</p>
              <p className="text-[10px] text-stone-400">JSON ফাইল আপলোড</p>
            </div>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />
        </div>

        {/* Danger Zone / Reset */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 font-body">
          <button
            onClick={() => setConfirmDemoOpen(true)}
            className="px-4 py-2 text-xs font-bold text-[#EA580C] hover:bg-[#EA580C]/10 border border-[#EA580C]/30 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            ডেমো ট্যুর ডাটা লোড করুন (১৭ জেলা)
          </button>

          <button
            onClick={() => setConfirmResetOpen(true)}
            className="px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-1.5 transition-colors ml-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            সব ডাটা রিসেট (০ জেলা)
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-[#12141A] border border-white/20 p-6 rounded-3xl space-y-4 shadow-2xl font-body"
          >
            <div className="flex items-center gap-3 text-rose-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">
                সব ভ্রমণ ডাটা মুছে ফেলতে চান?
              </h3>
            </div>
            <p className="text-xs text-stone-300 font-light leading-relaxed">
              আপনার সংরক্ষিত ৬৪ জেলার ভ্রমণ স্থিতি, স্মৃতিকথা এবং ছবিগুলো পরিষ্কার করা হবে।
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmResetOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-stone-400 hover:text-white cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  resetToCleanSlate();
                  setConfirmResetOpen(false);
                  setActiveTab('explore');
                }}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs cursor-pointer"
              >
                হ্যাঁ, রিসেট করুন
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Demo Load Confirmation Dialog */}
      {confirmDemoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-[#12141A] border border-white/20 p-6 rounded-3xl space-y-4 shadow-2xl font-body"
          >
            <div className="flex items-center gap-3 text-[#EA580C]">
              <Sparkles className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">
                নমুনা ডেমো ডাটা লোড করবেন?
              </h3>
            </div>
            <p className="text-xs text-stone-300 font-light leading-relaxed">
              কক্সবাজার, বান্দরবান, সিলেটসহ ১৭টি জেলার আকর্ষণীয় ফটো ও স্মৃতিকথা লোড করা হবে।
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDemoOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-stone-400 hover:text-white cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  loadDemoMode();
                  setConfirmDemoOpen(false);
                  setActiveTab('explore');
                }}
                className="px-4 py-2 text-xs font-bold bg-[#EA580C] hover:bg-[#c2410c] text-white rounded-xl shadow-xs cursor-pointer"
              >
                লোড করুন
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
