import React, { useState } from 'react';
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

const MainContent: React.FC = () => {
  const {
    activeTab,
    userData,
    visits,
    stats,
    achievements,
    selectDistrict,
    authModalOpen,
    closeAuthModal,
  } = useApp();

  return (
    <div className="flex flex-col min-h-full">
      {activeTab === 'explore' ? (
        <div className="space-y-8 sm:space-y-12 animate-in fade-in duration-300">
          {/* Top Hero Container (Background Photo spans behind Navbar all the way to top) */}
          <div className="relative border-b border-white/10 overflow-hidden min-h-[480px] sm:min-h-[560px] flex flex-col justify-between">
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

            {/* Navbar floating directly on top of the hero background image */}
            <Navbar />

            {/* Hero Text, Headline, and Live Metrics */}
            <section className="relative z-10 px-4 sm:px-8 lg:px-12 pt-6 sm:pt-10 pb-8 sm:pb-12">
              <div className="max-w-2xl space-y-4 sm:space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#059669]/25 backdrop-blur-md border border-[#059669]/40 text-emerald-300 text-[11px] font-body font-bold uppercase tracking-wider shadow-sm">
                  <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                  ৬৪ জেলা জাতীয় অভিযাত্রা ডায়েরি
                </div>

                <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.05] drop-shadow-md">
                  ৬৪ জেলা ভ্রমণ। <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-[#059669]">
                    জাতীয় পদচিহ্ন।
                  </span> <br />
                  অনন্ত স্মৃতিকথা।
                </h1>

                <p className="font-body text-xs sm:text-sm md:text-base text-stone-200 font-light leading-relaxed max-w-lg drop-shadow-sm">
                  বাংলাদেশের প্রতিটি জেলা, প্রান্তর ও প্রান্তরে আপনার ভ্রমণের অনন্য পদচিহ্ন চিহ্নিত করুন এবং স্মৃতিগুলো চিরকাল অক্ষত রাখুন।
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      document.getElementById('map-container')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-5 py-3 bg-white hover:bg-stone-100 text-stone-950 font-body text-xs sm:text-sm font-bold rounded-full flex items-center gap-2.5 shadow-xl hover:scale-105 transition-all cursor-pointer"
                  >
                    <span>মানচিত্র অন্বেষণ করুন</span>
                    <div className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center">
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>
                </div>

                {/* Bottom-left Metrics Counter Row */}
                <div className="flex items-center gap-6 sm:gap-10 pt-6 sm:pt-8 border-t border-white/15">
                  <div>
                    <p className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight drop-shadow-sm">
                      {stats.visitedCount}+
                    </p>
                    <p className="font-body text-[10px] sm:text-[11px] uppercase tracking-wider text-stone-300 font-semibold">
                      জেলা ভ্রমণ সম্পন্ন
                    </p>
                  </div>
                  <div className="h-8 w-[1px] bg-white/20" />
                  <div>
                    <p className="font-display text-3xl sm:text-4xl font-bold text-[#059669] tracking-tight drop-shadow-sm">
                      {stats.percentageExplored}%
                    </p>
                    <p className="font-body text-[10px] sm:text-[11px] uppercase tracking-wider text-stone-300 font-semibold">
                      সার্বভৌম পদচিহ্ন
                    </p>
                  </div>
                  <div className="h-8 w-[1px] bg-white/20" />
                  <div>
                    <p className="font-display text-3xl sm:text-4xl font-bold text-emerald-400 tracking-tight drop-shadow-sm">
                      {stats.divisionsExploredCount} <span className="text-sm font-normal text-white/60">/ ৮</span>
                    </p>
                    <p className="font-body text-[10px] sm:text-[11px] uppercase tracking-wider text-stone-300 font-semibold">
                      বিভাগ অন্বেষণ
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
                    আঞ্চলিক সূচি
                  </span>
                  <h2 className="font-display text-xl sm:text-3xl font-bold tracking-wide text-white mt-0.5 sm:mt-1">
                    বিভাগ অনুযায়ী ৬৪ জেলা
                  </h2>
                </div>
                <p className="font-body text-xs text-stone-400 font-light max-w-sm">
                  যেকোনো জেলায় ক্লিক করে ভ্রমণ স্থিতি ও আলোকচিত্র নথিভুক্ত করুন
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
                      className="bg-[#12141A]/90 border border-white/10 p-4 rounded-3xl space-y-3 shadow-md"
                    >
                      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: div.color }}
                          />
                          <h3 className="font-display text-sm font-bold text-white tracking-wide">
                            {div.bn_name} ({divDistricts.length})
                          </h3>
                        </div>
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
        </div>
      ) : (
        <div className="flex flex-col flex-1">
          <Navbar />
          <div className="px-3 sm:px-8 lg:px-12 pt-6 pb-16 flex-1">
            {activeTab === 'memories' && <MemoriesTimelinePage />}
            {activeTab === 'settings' && <SettingsPage />}
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
      {/* Outer Viewport Canvas (Neutral Grey) */}
      <div className="min-h-screen bg-[#E5E9EE] dark:bg-[#07080A] py-2 sm:py-6 px-1.5 sm:px-4 lg:px-6 flex flex-col justify-start font-sans selection:bg-[#059669] selection:text-white transition-colors duration-300">
        {/* Floating Device Container Frame matching Reference */}
        <div className="w-full max-w-[1500px] mx-auto bg-[#0A0C10] text-white rounded-[24px] sm:rounded-[36px] md:rounded-[44px] shadow-2xl border border-white/10 overflow-hidden relative flex flex-col min-h-[92vh]">
          <MainContent />
        </div>
      </div>
    </AppProvider>
  );
}

