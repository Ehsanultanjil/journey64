import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';

const tabOrder: Record<string, number> = {
  explore: 0,
  memories: 1,
  settings: 2,
};

const pageVariants = {
  initial: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? 36 : -36,
  }),
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      x: { type: 'spring', stiffness: 350, damping: 32 },
      opacity: { duration: 0.22, ease: 'easeOut' },
    },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -36 : 36,
    transition: {
      x: { duration: 0.16, ease: 'easeInOut' },
      opacity: { duration: 0.16, ease: 'easeInOut' },
    },
  }),
};

const MainContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
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
  const [direction, setDirection] = useState<number>(0);
  const prevTabRef = useRef(activeTab);

  useEffect(() => {
    const prevOrder = tabOrder[prevTabRef.current] || 0;
    const newOrder = tabOrder[activeTab] || 0;
    setDirection(newOrder >= prevOrder ? 1 : -1);
    prevTabRef.current = activeTab;
  }, [activeTab]);

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
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        {activeTab === 'explore' && (
          <motion.div
            key="explore"
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col min-h-full space-y-8 sm:space-y-12"
          >
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

                  <div className="flex items-center gap-3 pt-1 sm:pt-2">
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

            {/* 64-District Regional Catalog */}
            <div className="px-3 sm:px-8 lg:px-12 pb-16">
              <section className="space-y-4 sm:space-y-6 pt-4 border-t border-white/10">
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
                    যেকোনো জেলায় ক্লিক করে ভ্রমণ স্থিতি ও ছবি যুক্ত করুন
                  </p>
                </div>

                {/* Division-grouped districts */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {DIVISIONS.map((div) => {
                    const divDistricts = DISTRICTS.filter((d) => d.division === div.name);
                    const divVisited = divDistricts.filter(
                      (d) => userData[d.id]?.status === 'visited'
                    ).length;
                    const divProgress = Math.round((divVisited / divDistricts.length) * 100);

                    return (
                      <div
                        key={div.name}
                        className="bg-[#12141A]/90 border border-white/10 p-4 rounded-3xl space-y-3 shadow-sm hover:border-white/20 transition-all"
                      >
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <h3 className="font-display text-base font-bold text-white flex items-center gap-1.5">
                            <span>{div.bn_name} বিভাগ</span>
                          </h3>
                          <span className="font-body text-[11px] font-bold text-stone-400">
                            {divVisited}/{divDistricts.length} ({divProgress}%)
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 font-body">
                          {divDistricts.map((dist) => {
                            const status = userData[dist.id]?.status || 'not_visited';
                            const isVisited = status === 'visited';

                            return (
                              <button
                                key={dist.id}
                                onClick={() => selectDistrict(dist.id)}
                                className={`px-2.5 py-1.5 rounded-xl text-left text-xs transition-all flex items-center justify-between group cursor-pointer ${
                                  isVisited
                                    ? 'bg-[#059669] text-white font-bold shadow-xs'
                                    : status === 'want_to_visit'
                                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                    : 'bg-white/5 text-stone-300 hover:bg-white/10 hover:text-white'
                                }`}
                              >
                                <span className="truncate">{dist.bn_name}</span>
                                <div className="flex items-center gap-1 shrink-0">
                                  {isVisited && <Check className="w-3 h-3 text-white" />}
                                  {status === 'want_to_visit' && (
                                    <Bookmark className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </motion.div>
        )}

        {activeTab === 'memories' && (
          <motion.div
            key="memories"
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col min-h-full"
          >
            <MemoriesTimelinePage />
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col flex-1"
          >
            <Navbar />
            <div className="px-3 sm:px-8 lg:px-12 pt-6 pb-16 flex-1">
              <SettingsPage />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
      {/* Outer Viewport Canvas (Neutral Grey) */}
      <div className="min-h-screen bg-[#E5E9EE] dark:bg-[#07080A] py-2 sm:py-6 px-1.5 sm:px-4 lg:px-6 flex flex-col justify-start font-sans selection:bg-[#059669] selection:text-white transition-colors duration-300">
        {/* Floating Device Container Frame matching Reference */}
        <div className="w-full max-w-[1500px] mx-auto bg-[#0A0C10] text-white rounded-[24px] sm:rounded-[36px] md:rounded-[44px] shadow-2xl border border-white/10 overflow-clip relative flex flex-col min-h-[92vh]">
          <MainContent />
        </div>
      </div>
    </AppProvider>
  );
}

