import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navigation/Navbar';
import { BangladeshMap } from './components/Map/BangladeshMap';
import { DistrictQuickPanel } from './components/District/DistrictQuickPanel';
import { MemoriesTimelinePage } from './components/Memories/MemoriesTimelinePage';
import { SettingsPage } from './components/Settings/SettingsPage';
import { UnlockCelebrationModal } from './components/Modals/UnlockCelebrationModal';
import { Completion100Modal } from './components/Modals/Completion100Modal';
import { PhotoLightbox } from './components/Modals/PhotoLightbox';
import { AuthModal } from './components/Auth/AuthModal';
import { DISTRICTS } from './data/districts';
import { DIVISIONS } from './data/divisions';
import {
  MapPin,
  Check,
  CheckCircle2,
  Bookmark,
  Camera,
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
  LogIn,
  User,
  ChevronDown,
  ChevronUp,
  Layers,
  Filter,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    authUser,
    openAuthModal,
    userData,
    visits,
    stats,
    achievements,
    selectDistrict,
    viewingJournalDistrictId,
    authModalOpen,
    closeAuthModal,
  } = useApp();

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [openDivision, setOpenDivision] = useState<string | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('#bangladesh-map-svg') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('.fixed') ||
      viewingJournalDistrictId
    ) {
      return;
    }
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Minimum 45px horizontal swipe with dominant horizontal trajectory
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX < 0) {
        // Swiped Left -> Move to Memories
        if (activeTab === 'explore') {
          setActiveTab('memories');
        }
      } else {
        // Swiped Right -> Move to Explore
        if (activeTab === 'memories' || activeTab === 'settings') {
          setActiveTab('explore');
        }
      }
    }

    setTouchStartX(null);
    setTouchStartY(null);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex flex-col min-h-full relative overflow-hidden"
    >
      {activeTab === 'explore' ? (
        <div className="flex flex-col min-h-full space-y-8 sm:space-y-12">
            {/* Top Hero Container (Background Photo spans behind Navbar all the way to top) */}
            <div className="relative border-b border-white/10 overflow-hidden flex flex-col justify-start pb-6 sm:pb-10">
              {/* Background Photo & Atmospheric Lighting Overlays */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                <img
                  src="/hero-bg.jpg"
                  alt="Bangladesh Nature Background"
                  className="w-full h-full object-cover object-center filter brightness-[0.80] contrast-[1.08]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/40 to-black/25" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10]/95 via-[#0A0C10]/50 to-transparent" />
              </div>

              {/* Sticky Floating Navbar */}
              <Navbar />

              {/* Hero Text, Headline, and Live Metrics */}
              <section className="relative z-10 px-4 sm:px-8 lg:px-12 pt-3 sm:pt-6">
                <div className="max-w-2xl space-y-3 sm:space-y-4">
                  {/* Mode Badge Indicator */}
                  <div>
                    {!authUser ? (
                      <button
                        onClick={() => openAuthModal('আপনার ভ্রমণ ডায়েরি শুরু করতে লগইন বা সাইন আপ করুন')}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold tracking-wide backdrop-blur-md hover:bg-amber-500/25 transition-all cursor-pointer"
                      >
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>গেস্ট মোড • ডাটা সেভ করতে লগইন করুন</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#059669]/20 border border-[#059669]/40 text-emerald-300 text-[11px] font-bold tracking-wide backdrop-blur-md">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>স্বাগতম, {authUser.user_metadata?.display_name || authUser.email?.split('@')[0]}</span>
                      </div>
                    )}
                  </div>

                  <h1 className="font-display text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-snug sm:leading-[1.08] drop-shadow-md">
                    দেশজুড়ে ঘুরে বেড়ান,{' '}
                    <br className="hidden sm:inline" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-[#059669]">
                      জমিয়ে রাখুন প্রতিটি
                    </span>{' '}
                    <br className="hidden sm:inline" />
                    জেলার সুন্দর স্মৃতি।
                  </h1>

                  <p className="font-body text-xs sm:text-sm md:text-base text-stone-200 font-light leading-relaxed max-w-lg drop-shadow-sm">
                    বাংলাদেশের কোন কোন জেলায় গিয়েছেন তা মানচিত্রে চিহ্নিত করুন, আর ভ্রমণের সুন্দর গল্প ও ছবিগুলো সাজিয়ে রাখুন আপনার ব্যক্তিগত ডায়েরিতে।
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 sm:pt-2">
                    <button
                      onClick={() => {
                        document.getElementById('map-container')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-4 sm:px-5 py-2.5 sm:py-3 bg-white hover:bg-stone-100 text-stone-950 font-body text-xs sm:text-sm font-bold rounded-full flex items-center gap-2 shadow-xl hover:scale-105 transition-all cursor-pointer"
                    >
                      <span>মানচিত্র দেখুন</span>
                      <div className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center">
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </button>

                    {!authUser && (
                      <button
                        onClick={() => openAuthModal('আপনার ভ্রমণ ডায়েরি শুরু করতে লগইন বা সাইন আপ করুন')}
                        className="px-4 sm:px-5 py-2.5 sm:py-3 bg-[#059669] hover:bg-[#047857] text-white font-body text-xs sm:text-sm font-bold rounded-full flex items-center gap-2 shadow-xl shadow-[#059669]/30 hover:scale-105 transition-all cursor-pointer"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>লগইন / সাইন আপ</span>
                      </button>
                    )}
                  </div>

                  {/* Bottom-left Metrics Counter Row */}
                  <div className="flex items-center gap-6 sm:gap-10 pt-6 sm:pt-8 border-t border-white/15">
                    <div>
                      <p className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight drop-shadow-sm">
                        {stats.visitedCount} <span className="text-sm font-normal text-white/60">/ ৬৪</span>
                      </p>
                      <p className="font-body text-[10px] sm:text-[11px] uppercase tracking-wider text-stone-300 font-semibold">
                        জেলায় ঘুরেছেন
                      </p>
                    </div>
                    <div className="h-8 w-[1px] bg-white/20" />
                    <div>
                      <p className="font-display text-3xl sm:text-4xl font-bold text-[#059669] tracking-tight drop-shadow-sm">
                        {stats.percentageExplored}%
                      </p>
                      <p className="font-body text-[10px] sm:text-[11px] uppercase tracking-wider text-stone-300 font-semibold">
                        বাংলাদেশ ভ্রমণ
                      </p>
                    </div>
                    <div className="h-8 w-[1px] bg-white/20" />
                    <div>
                      <p className="font-display text-3xl sm:text-4xl font-bold text-emerald-400 tracking-tight drop-shadow-sm">
                        {stats.divisionsExploredCount} <span className="text-sm font-normal text-white/60">/ ৮</span>
                      </p>
                      <p className="font-body text-[10px] sm:text-[11px] uppercase tracking-wider text-stone-300 font-semibold">
                        বিভাগ ঘুরেছেন
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Bangladesh Interactive Map Section */}
            <div className="px-3 sm:px-8 lg:px-12">
              <section aria-label="ইন্টারেক্টিভ মানচিত্র">
                <BangladeshMap />
              </section>
            </div>

            {/* 64-District Regional Catalog by Division (Horizontal List Rows on All Screen Sizes) */}
            <div className="px-3 sm:px-8 lg:px-12 pb-16">
              <section className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4">
                  <div>
                    <span className="font-body font-bold text-[10px] uppercase tracking-wider text-[#059669]">
                      বিভাগ ও জেলা তালিকা
                    </span>
                    <h2 className="font-display text-xl sm:text-3xl font-bold tracking-wide text-white mt-0.5 sm:mt-1">
                      বিভাগ অনুযায়ী ৬৪ জেলা
                    </h2>
                  </div>
                  <p className="font-body text-xs text-stone-400 font-light max-w-sm">
                    যেকোনো বিভাগে ক্লিক করে জেলা তালিকা দেখুন ও স্থিতি পরিবর্তন করুন
                  </p>
                </div>

                {/* Horizontal List of Divisions (Full-Width Rows on All Screen Sizes) */}
                <div className="space-y-2.5">
                  {DIVISIONS.map((div) => {
                    const isOpen = openDivision === div.name;
                    const divDistricts = DISTRICTS.filter((d) => d.division === div.name);
                    const divVisited = divDistricts.filter(
                      (d) => userData[d.id]?.status === 'visited'
                    ).length;
                    const divProgress = Math.round((divVisited / divDistricts.length) * 100);

                    return (
                      <div
                        key={div.name}
                        className={`w-full rounded-2xl sm:rounded-3xl border transition-all duration-300 overflow-hidden ${
                          isOpen
                            ? 'bg-[#12141A] border-[#059669]/60 shadow-lg shadow-[#059669]/10'
                            : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-white/20 shadow-xs'
                        }`}
                      >
                        {/* Full-Width Horizontal Division Header Row */}
                        <button
                          type="button"
                          onClick={() => setOpenDivision(isOpen ? null : div.name)}
                          className="w-full text-left p-3.5 sm:p-4.5 flex items-center justify-between gap-3 sm:gap-4 cursor-pointer select-none transition-colors group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Division Image Profile Picture with Proper Aspect Ratio */}
                            <div className="relative w-16 h-12 sm:w-20 sm:h-14 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 border border-white/15 bg-black/40 shadow-sm group-hover:scale-105 transition-transform">
                              <img
                                src={div.imageUrl}
                                alt={`${div.bn_name} বিভাগ`}
                                className="w-full h-full object-cover object-center"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                            </div>

                            {/* Division Name & Details */}
                            <div className="min-w-0 truncate">
                              <div className="flex items-center gap-2">
                                <h3 className={`font-display text-base sm:text-lg font-bold tracking-wide truncate transition-colors ${
                                  isOpen ? 'text-emerald-400' : 'text-white'
                                }`}>
                                  {div.bn_name} বিভাগ
                                </h3>
                                <span className="text-[11px] font-body text-stone-500 hidden sm:inline">
                                  ({div.name})
                                </span>
                              </div>
                              <p className="font-body text-xs text-stone-400 font-light truncate">
                                {div.districtsCount}টি জেলা • {div.description.slice(0, 50)}...
                              </p>
                            </div>
                          </div>

                          {/* Right Side: Count like 3/7, Progress %, and Chevron */}
                          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                            <div className="flex flex-col items-end">
                              <span className="font-display font-bold text-xs sm:text-sm text-white flex items-center gap-1">
                                <span className={divVisited > 0 ? 'text-[#059669]' : 'text-stone-300'}>
                                  {divVisited}
                                </span>
                                <span className="text-stone-500">/{divDistricts.length}</span>
                              </span>
                              <span className="font-body text-[10px] text-stone-500 font-medium">
                                {divProgress}% সম্পন্ন
                              </span>
                            </div>

                            <div
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all ${
                                isOpen
                                  ? 'bg-[#059669] text-white shadow-xs'
                                  : 'bg-white/5 text-stone-400 group-hover:bg-white/10 group-hover:text-white'
                              }`}
                            >
                              <motion.div
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </motion.div>
                            </div>
                          </div>
                        </button>

                        {/* Unfolded Districts Content Directly Below This Division */}
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25, ease: 'easeInOut' }}
                              className="overflow-hidden border-t border-white/10 bg-black/30"
                            >
                              <div className="p-4 sm:p-5 space-y-4">
                                {/* Full Landmark Cover Photo Banner */}
                                <div className="relative h-40 sm:h-52 w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/15 shadow-md bg-black/40">
                                  <img
                                    src={div.imageUrl}
                                    alt={`${div.bn_name} বিভাগ`}
                                    className="w-full h-full object-cover object-center"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                                  <div className="absolute bottom-3 left-4 right-4 text-white">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#059669] text-white shadow-xs">
                                        {div.bn_name} বিভাগ
                                      </span>
                                      <span className="text-[11px] font-body text-stone-200">
                                        {divVisited}/{divDistricts.length} জেলা সম্পন্ন ({divProgress}%)
                                      </span>
                                    </div>
                                    <p className="font-body text-xs sm:text-sm text-stone-200 font-light max-w-2xl line-clamp-2">
                                      {div.description}
                                    </p>
                                  </div>
                                </div>

                                {/* Districts Buttons Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 font-body">
                                  {divDistricts.map((dist) => {
                                    const status = userData[dist.id]?.status || 'not_visited';
                                    const isVisited = status === 'visited';

                                    return (
                                      <button
                                        key={dist.id}
                                        onClick={() => selectDistrict(dist.id)}
                                        className={`px-3 py-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between group cursor-pointer border ${
                                          isVisited
                                            ? 'bg-[#059669] text-white font-bold border-[#059669] shadow-xs'
                                            : status === 'want_to_visit'
                                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
                                            : 'bg-white/5 text-stone-300 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10'
                                        }`}
                                      >
                                        <span className="truncate">{dist.bn_name}</span>
                                        <div className="flex items-center gap-1 shrink-0 ml-1.5">
                                          {isVisited && <Check className="w-3.5 h-3.5 text-white" />}
                                          {status === 'want_to_visit' && (
                                            <Bookmark className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                          )}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        ) : activeTab === 'memories' ? (
          <MemoriesTimelinePage />
        ) : (
          <div className="flex flex-col flex-1">
            <Navbar />
            <div className="px-3 sm:px-8 lg:px-12 pt-6 pb-16 flex-1">
              <SettingsPage />
            </div>
          </div>
        )}

      {/* Interactive Global Modals */}
      <DistrictQuickPanel />
      <UnlockCelebrationModal />
      <Completion100Modal />
      <PhotoLightbox />
      <AuthModal isOpen={authModalOpen} onClose={closeAuthModal} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen w-full bg-[#07080A] text-white font-sans selection:bg-[#059669] selection:text-white flex flex-col p-1 sm:p-2 md:p-3">
        <div className="w-full bg-[#0A0C10] text-white rounded-[20px] sm:rounded-[28px] md:rounded-[36px] shadow-2xl border border-white/10 overflow-clip relative flex flex-col flex-1">
          <MainContent />
        </div>
      </div>
    </AppProvider>
  );
}

