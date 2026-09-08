import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Settings,
  ShieldCheck,
  Check,
  LogOut,
  ArrowRight,
  RefreshCw,
  Camera,
  Edit3,
  Share2,
  MapPin,
  Calendar,
  Award,
  Sparkles,
  Image as ImageIcon,
  Compass,
  Bookmark,
  X,
  Upload,
  CheckCircle2,
  Lock,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DISTRICTS, getDistrictById } from '../../data/districts';
import { DIVISIONS } from '../../data/divisions';
import { compressImage } from '../../lib/storage';

export const SettingsPage: React.FC = () => {
  const {
    profile,
    settings,
    authUser,
    openAuthModal,
    signOut,
    cloudSync,
    pushToCloud,
    updateProfile,
    updateSettings,
    stats,
    achievements,
    userData,
    visits,
    openLightbox,
    openDistrictJournal,
    setActiveTab,
  } = useApp();

  // Active Profile Sub-Tab
  const [activeProfileTab, setActiveProfileTab] = useState<'gallery' | 'settings'>('gallery');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(profile.name || '');
  const [handleDraft, setHandleDraft] = useState(profile.handle || authUser?.email?.split('@')[0] || 'traveler');
  const [bioDraft, setBioDraft] = useState(profile.bio || '');
  const [locationDraft, setLocationDraft] = useState(profile.location || 'বাংলাদেশ');
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(profile.avatarUrl);
  const [coverPreview, setCoverPreview] = useState<string | undefined>(profile.coverUrl);
  
  const [savedToast, setSavedToast] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  // Hidden File Inputs
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

  // Share profile summary
  const handleShareProfile = async () => {
    const shareText = `🌟 আমি "জার্নি ৬৪" এর মাধ্যমে বাংলাদেশের ${stats.visitedCount}টি জেলা ও ${stats.divisionsExploredCount}টি বিভাগ ভ্রমণ করেছি (${stats.percentageExplored}% সম্পন্ন)! 🇧🇩\nআমার ভ্রমণ প্রোফাইল দেখুন।`;
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2500);
      } catch (err) {
        console.error('Clipboard error', err);
      }
    }
  };

  const handleManualSync = async () => {
    setSyncLoading(true);
    await pushToCloud();
    setSyncLoading(false);
  };

  // All visited districts
  const visitedDistrictsList = useMemo(() => {
    return DISTRICTS.filter((d) => userData[d.id]?.status === 'visited');
  }, [userData]);

  // Visited districts with cover photos (1 cover photo per district)
  const districtCovers = useMemo(() => {
    const list: {
      districtId: string;
      districtName: string;
      districtBnName: string;
      division: string;
      coverUrl: string;
      caption?: string;
      totalPhotosCount: number;
    }[] = [];

    visitedDistrictsList.forEach((d) => {
      const districtVisits = visits.filter((v) => v.districtId === d.id);
      const allPhotos = districtVisits.flatMap((v) => v.photos || []);
      if (allPhotos.length > 0) {
        const coverPhoto = allPhotos.find((p) => p.isCover) || allPhotos[0];
        list.push({
          districtId: d.id,
          districtName: d.name,
          districtBnName: d.bn_name,
          division: d.division,
          coverUrl: coverPhoto.url,
          caption: coverPhoto.caption,
          totalPhotosCount: allPhotos.length,
        });
      }
    });

    return list;
  }, [visitedDistrictsList, visits]);

  const totalPhotosCount = useMemo(() => {
    return visits.reduce((acc, v) => acc + (v.photos?.length || 0), 0);
  }, [visits]);

  const handleOpenDistrictPage = (districtId: string) => {
    openDistrictJournal(districtId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Travel Rank badge calculation
  const travelerRank = useMemo(() => {
    const pct = stats.percentageExplored;
    if (pct >= 100) return { title: '৬৪ জেলার মহারথী', color: 'from-amber-400 to-yellow-600', level: 'লেভেল ৫' };
    if (pct >= 50) return { title: 'মাস্টার ট্রাভেলার', color: 'from-emerald-400 to-teal-600', level: 'লেভেল ৪' };
    if (pct >= 25) return { title: 'অভিযাত্রী ট্র্যাকার', color: 'from-blue-400 to-indigo-600', level: 'লেভেল ৩' };
    if (pct >= 10) return { title: 'পথিক পর্যটক', color: 'from-teal-400 to-emerald-600', level: 'লেভেল ২' };
    return { title: 'নবীন অভিযাত্রী', color: 'from-[#004526] to-[#005a32]', level: 'লেভেল ১' };
  }, [stats.percentageExplored]);

  // Default scenic cover fallback
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
            আপনার ভ্রমণ প্রোফাইল, সামাজিক ব্যাজ ও স্মৃতিগুলো যেকোনো ডিভাইস থেকে দেখতে লগইন করুন।
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
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-24 animate-in fade-in duration-300 font-body">
      {/* Toast Notification */}
      <AnimatePresence>
        {(savedToast || copiedToast) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#004526] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-400/30"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{savedToast ? 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' : 'প্রোফাইল বিবরণ কপি হয়েছে!'}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file inputs for quick upload */}
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

      {/* 1. SOCIAL PROFILE CARD HEADER */}
      <div className="bg-[#12141A]/95 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Cover Photo Banner */}
        <div className="relative h-44 sm:h-64 w-full bg-stone-900 overflow-hidden group">
          <img
            src={currentCover}
            alt="Profile Cover"
            className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12141A] via-[#12141A]/40 to-black/30" />

          {/* Simple Edit Icon in Corner of Cover Photo */}
          <button
            onClick={handleOpenEditModal}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95 group"
            title="প্রোফাইল সম্পাদনা করুন"
          >
            <Edit3 className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
          </button>
        </div>

        {/* Profile Info & Avatar Layer */}
        <div className="px-5 sm:px-8 pb-6 pt-0 relative">
          <div className="flex items-end justify-between -mt-16 sm:-mt-20 mb-4">
            {/* Avatar with Camera Trigger */}
            <div className="relative group self-start">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-[#0A0C10] border-4 border-[#12141A] shadow-2xl relative flex items-center justify-center">
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

          {/* User Details & Bio */}
          <div className="space-y-3">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {displayName}
              </h1>
              <p className="text-xs sm:text-sm text-stone-400 font-medium mt-0.5">
                @{handleName}
              </p>
            </div>

            {/* Bio Description */}
            <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed max-w-2xl">
              {profile.bio || 'বাংলাদেশের ৬৪ জেলার পথে প্রান্তরে এক অনন্য পদচিহ্ন।'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. PROFILE SUB-TABS NAVIGATION */}
      <div className="flex items-center border-b border-white/10 gap-2 sm:gap-6 overflow-x-auto no-scrollbar pt-2">
        <button
          onClick={() => setActiveProfileTab('gallery')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap px-1 ${
            activeProfileTab === 'gallery'
              ? 'border-[#004526] text-white'
              : 'border-transparent text-stone-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>স্মৃতির গ্যালারি ({districtCovers.length})</span>
        </button>

        <button
          onClick={() => setActiveProfileTab('settings')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap px-1 ${
            activeProfileTab === 'settings'
              ? 'border-[#004526] text-white'
              : 'border-transparent text-stone-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>অ্যাকাউন্ট ও সেটিংস</span>
        </button>
      </div>

      {/* 4. TAB CONTENT AREAS */}
      <div className="pt-2">
        {/* TAB 1: DISTRICT COVER PHOTOS FEED */}
        {activeProfileTab === 'gallery' && (
          <div className="space-y-4">
            {districtCovers.length === 0 ? (
              <div className="text-center py-16 px-4 bg-[#12141A]/60 border border-white/10 rounded-3xl space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-stone-500">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-lg font-bold text-white">
                    এখনও কোনো ভ্রমণকৃত জেলার ছবি নেই
                  </h3>
                  <p className="text-xs text-stone-400 font-light max-w-sm mx-auto">
                    আপনার ভ্রমণকৃত জেলার মেমোরি ডায়েরিতে ছবি আপলোড করুন, এখানে প্রতিটি জেলার কভার ছবি প্রদর্শিত হবে।
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('memories')}
                  className="px-5 py-2.5 bg-[#004526] hover:bg-[#005a32] text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 shadow-md shadow-[#004526]/30"
                >
                  <span>ডায়েরি খুলুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {districtCovers.map((item, idx) => (
                  <motion.div
                    key={item.districtId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    onClick={() => handleOpenDistrictPage(item.districtId)}
                    className="group relative aspect-square rounded-2xl overflow-hidden bg-black/40 border border-white/10 cursor-pointer shadow-md hover:border-emerald-500/60 transition-all hover:scale-[1.02]"
                    title={`${item.districtBnName} জেলার ডায়েরি ও স্মৃতি দেখতে ক্লিক করুন`}
                  >
                    <img
                      src={item.coverUrl}
                      alt={item.districtBnName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1 w-full">
                        <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white shadow-sm">
                          {item.districtBnName}
                        </span>

                        {item.totalPhotosCount > 1 && (
                          <span className="px-2 py-0.5 rounded-md bg-[#004526]/90 backdrop-blur-md text-[9px] font-bold text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                            <ImageIcon className="w-2.5 h-2.5" />
                            <span>{item.totalPhotosCount}</span>
                          </span>
                        )}
                      </div>

                      {/* Bottom Info on Hover */}
                      <div className="transform translate-y-1 group-hover:translate-y-0 transition-transform">
                        <div className="flex items-center justify-between text-white">
                          <p className="text-xs font-bold truncate group-hover:text-emerald-300 transition-colors">
                            {item.districtBnName} ডায়েরি
                          </p>
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {item.caption && (
                          <p className="text-[10px] text-stone-300 font-light truncate mt-0.5">
                            {item.caption}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ACCOUNT & SETTINGS */}
        {activeProfileTab === 'settings' && (
          <div className="space-y-4 max-w-3xl">
            {/* Display Settings */}
            <div className="bg-[#12141A]/90 border border-white/10 p-5 sm:p-6 rounded-3xl space-y-4 shadow-sm">
              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center shadow-sm">
                  <Settings className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white leading-tight">
                    ডিসপ্লে সেটিংস
                  </h3>
                  <p className="text-xs text-stone-400 font-light">
                    মানচিত্র ও ইন্টারফেস পছন্দ
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5">
                  <div>
                    <p className="text-xs font-bold text-white">মানচিত্রে জেলার নাম</p>
                    <p className="text-[11px] text-stone-400 font-light">
                      মানচিত্রের ওপর সরাসরি বাংলা নাম দেখতে চান কি না
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showDistrictLabels}
                    onChange={(e) => updateSettings({ showDistrictLabels: e.target.checked })}
                    className="w-5 h-5 accent-[#004526] cursor-pointer rounded"
                  />
                </div>
              </div>
            </div>

            {/* Cloud Sync & Account */}
            <div className="bg-[#12141A]/90 border border-white/10 p-5 sm:p-6 rounded-3xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#004526]/15 text-[#004526] flex items-center justify-center shadow-sm">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white leading-tight">
                      ক্লাউড ব্যাকআপ ও সিঙ্ক
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          cloudSync.connected ? 'bg-[#004526] animate-pulse' : 'bg-amber-400'
                        }`}
                      />
                      <p className="text-xs text-stone-300">
                        {cloudSync.message || (cloudSync.connected ? 'ক্লাউড সিঙ্ক চালু আছে' : 'ডাটা এই ডিভাইসে সেভ আছে')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleManualSync}
                    disabled={syncLoading}
                    className="px-3.5 py-2 bg-[#004526] hover:bg-[#005a32] text-white border border-[#004526] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
                    <span>{syncLoading ? 'সিঙ্ক হচ্ছে...' : 'এখনই সিঙ্ক করুন'}</span>
                  </button>

                  <button
                    onClick={signOut}
                    className="px-3.5 py-2 bg-white/10 hover:bg-rose-600/20 text-stone-300 hover:text-rose-400 border border-white/15 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    লগআউট
                  </button>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-xs text-stone-400 font-light flex items-center justify-between">
                <span>বর্তমান ইমেইল:</span>
                <span className="text-white font-semibold">
                  {authUser.email}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. EDIT PROFILE MODAL */}
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
