import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  ShieldCheck,
  LogOut,
  ArrowRight,
  Camera,
  Edit3,
  Sparkles,
  Image as ImageIcon,
  X,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { compressImage } from '../../lib/storage';

export const SettingsPage: React.FC = () => {
  const {
    profile,
    authUser,
    openAuthModal,
    signOut,
    updateProfile,
    toggleProfileLock,
    stats,
  } = useApp();

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(profile.name || '');
  const [handleDraft, setHandleDraft] = useState(profile.handle || authUser?.email?.split('@')[0] || 'traveler');
  const [bioDraft, setBioDraft] = useState(profile.bio || '');
  const [locationDraft, setLocationDraft] = useState(profile.location || 'বাংলাদেশ');
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(profile.avatarUrl);
  const [coverPreview, setCoverPreview] = useState<string | undefined>(profile.coverUrl);
  const [isLockedDraft, setIsLockedDraft] = useState<boolean>(!!profile.isLocked);

  const [savedToast, setSavedToast] = useState(false);

  // Hidden File Inputs for avatar & cover uploads
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  // Open Edit Modal and sync drafts
  const handleOpenEditModal = () => {
    setNameDraft(profile.name || (authUser?.user_metadata?.display_name as string) || '');
    setHandleDraft(profile.handle || authUser?.email?.split('@')[0] || 'traveler');
    setBioDraft(profile.bio || 'বাংলাদেশের ৬৪ জেলার পথে প্রান্তরে এক অনন্য পদচিহ্ন।');
    setLocationDraft(profile.location || 'বাংলাদেশ');
    setAvatarPreview(profile.avatarUrl);
    setCoverPreview(profile.coverUrl);
    setIsLockedDraft(!!profile.isLocked);
    setIsEditModalOpen(true);
  };

  // Avatar / Cover Image Handlers
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 600, 600, 0.85);
      setAvatarPreview(compressed);
    } catch (err) {
      console.error('Failed to compress avatar image', err);
    }
  };

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1600, 800, 0.82);
      setCoverPreview(compressed);
    } catch (err) {
      console.error('Failed to compress cover image', err);
    }
  };

  // Save profile updates
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: nameDraft.trim() || 'ভ্রমণকারী',
      displayName: nameDraft.trim() || 'ভ্রমণকারী',
      handle: handleDraft.trim().replace(/^@+/, ''),
      bio: bioDraft.trim(),
      location: locationDraft.trim(),
      avatarUrl: avatarPreview,
      coverUrl: coverPreview,
      isLocked: isLockedDraft,
    });
    setIsEditModalOpen(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  // Quick cover change directly from banner
  const handleDirectCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1600, 800, 0.82);
      updateProfile({ coverUrl: compressed });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    } catch (err) {
      console.error('Failed to update cover', err);
    }
  };

  // Quick avatar change directly from profile photo
  const handleDirectAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 600, 600, 0.85);
      updateProfile({ avatarUrl: compressed });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    } catch (err) {
      console.error('Failed to update avatar', err);
    }
  };



  // Fallback cover & names
  const currentCover = profile.coverUrl || '/images/divisions/chattogram.jpg';
  const displayName = profile.displayName || profile.name || authUser?.user_metadata?.display_name || authUser?.email?.split('@')[0] || 'ভ্রমণকারী';
  const handleName = profile.handle || authUser?.email?.split('@')[0] || 'traveler';

  if (!authUser) {
    return (
      <div className="w-full max-w-lg mx-auto py-16 px-4 text-center space-y-6 animate-in fade-in duration-300 font-body">
        <div className="w-16 h-16 rounded-3xl bg-[#004526]/15 text-[#004526] flex items-center justify-center mx-auto shadow-md border border-[#004526]/30">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            প্রোফাইল দেখতে লগইন করুন
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 font-light max-w-sm mx-auto leading-relaxed">
            আপনার ভ্রমণ প্রোফাইল ও সেটিংস সুরক্ষিত রাখতে লগইন করুন।
          </p>
        </div>
        <button
          onClick={() => openAuthModal('আপনার ভ্রমণ প্রোফাইল দেখতে লগইন করুন')}
          className="px-6 py-3 bg-[#004526] hover:bg-[#005a32] text-white rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-[#004526]/30 cursor-pointer inline-flex items-center gap-2 hover:scale-105"
        >
          <span>লগইন / সাইন আপ করুন</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-24 animate-in fade-in duration-300 font-body">
      {/* Toast Notification */}
      <AnimatePresence>
        {savedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#004526] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-400/30"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>প্রোফাইল সফলভাবে আপডেট হয়েছে!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file inputs for direct upload */}
      <input
        type="file"
        ref={coverInputRef}
        onChange={handleDirectCoverChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleDirectAvatarChange}
        accept="image/*"
        className="hidden"
      />

      {/* 1. EXPANSIVE DESKTOP PROFILE HEADER */}
      <div className="w-full bg-[#12141A]/95 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Cover Photo Banner */}
        <div className="relative h-56 sm:h-72 md:h-84 lg:h-96 w-full bg-stone-900 overflow-hidden group">
          <img
            src={currentCover}
            alt="Profile Cover"
            className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12141A] via-[#12141A]/40 to-black/30" />

          {/* Edit Profile Button on Cover Photo Corner */}
          <button
            onClick={handleOpenEditModal}
            className="absolute top-4 right-4 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95 text-xs font-bold"
            title="প্রোফাইল সম্পাদনা করুন"
          >
            <Edit3 className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">প্রোফাইল এডিট</span>
          </button>
        </div>

        {/* Profile Info & Avatar Layer */}
        <div className="px-5 sm:px-8 lg:px-10 pb-6 pt-0 relative">
          <div className="flex items-end justify-between -mt-16 sm:-mt-20 md:-mt-24 mb-4">
            {/* Avatar with Camera Trigger */}
            <div className="relative group self-start">
              <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-3xl overflow-hidden bg-[#0A0C10] border-4 border-[#12141A] shadow-2xl relative flex items-center justify-center">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#004526] to-[#002e18] text-white flex items-center justify-center font-display text-3xl sm:text-4xl font-bold">
                    {displayName[0]?.toUpperCase()}
                  </div>
                )}
                {/* Overlay upload hover */}
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer transition-opacity"
                >
                  <Camera className="w-5 h-5 mb-0.5 text-emerald-400" />
                  <span>ছবি পরিবর্তন</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Details, Bio & Exploration Progress Bar */}
          <div className="space-y-3">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
                {displayName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs sm:text-sm text-stone-400 font-medium">
                  @{handleName}
                </p>
                {/* Lock icon only if locked */}
                {profile.isLocked && (
                  <Lock className="w-3.5 h-3.5 text-stone-400" title="লক করা" />
                )}
              </div>
            </div>

            {/* Bio */}
            <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed max-w-2xl">
              {profile.bio || 'বাংলাদেশের ৬৪ জেলার পথে প্রান্তরে এক অনন্য পদচিহ্ন।'}
            </p>

            {/* Clean Progress Bar (Requested by user) */}
            <div className="space-y-1.5 pt-2 max-w-lg">
              <div className="flex items-center justify-between text-xs text-stone-300">
                <span className="font-semibold text-white">
                  ভ্রমণ সম্পন্ন: {stats.visitedCount} / ৬৪ জেলা
                </span>
                <span className="text-emerald-400 font-bold">
                  {stats.percentageExplored}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#004526] to-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(stats.percentageExplored, 2)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUPER CLEAN SETTINGS & PRIVACY SECTION (No extra tabs, no gallery) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        
        {/* Card 1: Profile Privacy & Lock Section */}
        <div className="bg-[#12141A]/90 border border-white/10 p-5 sm:p-6 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  profile.isLocked
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-[#004526]/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {profile.isLocked ? <Lock className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-white leading-tight">
                    প্রোফাইল প্রাইভেসি ও লক
                  </h3>
                  <p className="text-[11px] text-stone-400">আপনার ভ্রমণের গোপনীয়তা নিয়ন্ত্রণ</p>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                profile.isLocked
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {profile.isLocked ? '🔒 লক করা' : '🌐 উন্মুক্ত'}
              </span>
            </div>

            <p className="text-xs text-stone-300 font-light leading-relaxed">
              {profile.isLocked
                ? 'আপনার প্রোফাইল বর্তমানে লক করা আছে। অনুসন্ধানকারীরা আপনার নাম ও হ্যান্ডেল ছাড়া কোনো ভ্রমণ মানচিত্র বা ছবি দেখতে পারবেন না।'
                : 'আপনার প্রোফাইল বর্তমানে উন্মুক্ত আছে। যেকেউ ইউজারনেম দিয়ে খুঁজে আপনার ভ্রমণ মানচিত্র ও দর্শনীয় স্থানসমূহ দেখতে পারবেন।'}
            </p>
          </div>

          <button
            onClick={() => toggleProfileLock(!profile.isLocked)}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md ${
              profile.isLocked
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
            }`}
          >
            {profile.isLocked ? (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>প্রোফাইল আনলক করুন</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>প্রোফাইল লক করুন</span>
              </>
            )}
          </button>
        </div>

        {/* Card 2: User Account & Sign Out */}
        <div className="bg-[#12141A]/90 border border-white/10 p-5 sm:p-6 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 text-stone-300 flex items-center justify-center shadow-sm">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold text-white leading-tight">
                  লগইনকৃত অ্যাকাউন্ট
                </h3>
                <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                  {authUser.email}
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-300 font-light leading-relaxed">
              আপনার গুগল অ্যাকাউন্টের মাধ্যমে আপনি যেকোনো ডিভাইস থেকে আপনার ভ্রমণ তথ্য অ্যাক্সেস করতে পারবেন।
            </p>
          </div>

          <button
            onClick={signOut}
            className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>লগআউট করুন</span>
          </button>
        </div>
      </div>

      {/* 3. EDIT PROFILE MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-[#12141A] border border-white/15 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-body"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-display text-lg font-bold text-white">
                    প্রোফাইল সম্পাদনা করুন
                  </h3>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveProfile} className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Avatar & Cover Pickers */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-300">
                    ছবি ও কভার
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Avatar picker */}
                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-black/40 overflow-hidden border border-white/10 flex items-center justify-center shrink-0">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-stone-500" />
                        )}
                      </div>
                      <label className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors text-center block">
                        <span>ছবি বদলান</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Cover picker */}
                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-black/40 overflow-hidden border border-white/10 flex items-center justify-center shrink-0">
                        {coverPreview ? (
                          <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-stone-500" />
                        )}
                      </div>
                      <label className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors text-center block">
                        <span>কভার বদলান</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    আপনার নাম
                  </label>
                  <input
                    type="text"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    placeholder="যেমন: Ehsanul Karim Tanjil"
                    className="w-full px-4 py-2.5 text-xs bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#004526] transition-colors"
                  />
                </div>

                {/* Handle / Username */}
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    ইউজারনেম / হ্যান্ডেল (@)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-stone-500 text-xs">@</span>
                    <input
                      type="text"
                      value={handleDraft}
                      onChange={(e) => setHandleDraft(e.target.value)}
                      placeholder="ehsanultanjil"
                      className="w-full pl-8 pr-4 py-2.5 text-xs bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#004526] transition-colors"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    অবস্থান / ঠিকানা
                  </label>
                  <input
                    type="text"
                    value={locationDraft}
                    onChange={(e) => setLocationDraft(e.target.value)}
                    placeholder="যেমন: ঢাকা, বাংলাদেশ"
                    className="w-full px-4 py-2.5 text-xs bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#004526] transition-colors"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    বায়ো বা ভ্রমণ উক্তি
                  </label>
                  <textarea
                    rows={3}
                    value={bioDraft}
                    onChange={(e) => setBioDraft(e.target.value)}
                    placeholder="যেমন: বাংলাদেশের ৬৪ জেলার পথে প্রান্তরে এক অনন্য পদচিহ্ন..."
                    className="w-full px-4 py-2.5 text-xs bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#004526] transition-colors resize-none"
                  />
                </div>

                {/* Profile Privacy / Lock toggle in modal */}
                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Lock className={`w-4 h-4 ${isLockedDraft ? 'text-amber-400' : 'text-stone-400'}`} />
                    <div>
                      <p className="text-xs font-bold text-white">প্রোফাইল লক রাখুন (ব্যক্তিগত)</p>
                      <p className="text-[11px] text-stone-400 font-light">অন্যান্য ব্যবহারকারীদের থেকে আপনার ভ্রমণ স্মৃতি ও মানচিত্র গোপন রাখুন</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isLockedDraft}
                    onChange={(e) => setIsLockedDraft(e.target.checked)}
                    className="w-5 h-5 accent-[#004526] cursor-pointer rounded"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#004526] hover:bg-[#005a32] text-white text-xs font-bold transition-all shadow-md shadow-[#004526]/30 cursor-pointer"
                  >
                    সেভ করুন
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
