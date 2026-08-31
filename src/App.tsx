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

  const [activeDistrictIndex, setActiveDistrictIndex] = useState(0);

  const handlePrevDistrict = () => {
    const nextIdx = (activeDistrictIndex - 1 + DISTRICTS.length) % DISTRICTS.length;
    setActiveDistrictIndex(nextIdx);
    selectDistrict(DISTRICTS[nextIdx].id);
  };

  const handleNextDistrict = () => {
    const nextIdx = (activeDistrictIndex + 1) % DISTRICTS.length;
    setActiveDistrictIndex(nextIdx);
    selectDistrict(DISTRICTS[nextIdx].id);
  };

  return (
    <main className="space-y-8 sm:space-y-12 pb-16">
      {activeTab === 'explore' && (
        <div className="space-y-8 sm:space-y-12 animate-in fade-in duration-300">
          {/* Signature Cinematic Hero Stage (Matching Reference UI) */}
          <section className="relative px-4 sm:px-8 lg:px-12 pt-6 sm:pt-10 pb-8 sm:pb-12 bg-gradient-to-b from-[#141720] via-[#0B0D12] to-[#07080A] border-b border-white/10 overflow-hidden">
            {/* Ambient Background Glow Highlights */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#EA580C]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 sm:gap-12">
              {/* Left Headline & Pitch */}
              <div className="max-w-2xl space-y-4 sm:space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EA580C]/15 border border-[#EA580C]/30 text-[#EA580C] text-[11px] font-body font-bold uppercase tracking-wider">
                  <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                  ৬৪ জেলা জাতীয় অভিযাত্রা ডায়েরি
                </div>

                <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.05]">
                  ৬৪ জেলা ভ্রমণ। <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-stone-200 to-[#EA580C]">
                    জাতীয় পদচিহ্ন।
                  </span> <br />
                  অনন্ত স্মৃতিকথা।
                </h1>

                <p className="font-body text-xs sm:text-sm md:text-base text-stone-300 font-light leading-relaxed max-w-lg">
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

                {/* Bottom-left Metrics Counter Row (Matching Reference) */}
                <div className="flex items-center gap-6 sm:gap-10 pt-6 sm:pt-8 border-t border-white/10">
                  <div>
                    <p className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                      {stats.visitedCount}+
                    </p>
                    <p className="font-body text-[10px] sm:text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                      জেলা ভ্রমণ সম্পন্ন
                    </p>
                  </div>
                  <div className="h-8 w-[1px] bg-white/15" />
                  <div>
                    <p className="font-display text-3xl sm:text-4xl font-bold text-[#EA580C] tracking-tight">
                      {stats.percentageExplored}%
                    </p>
                    <p className="font-body text-[10px] sm:text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                      সার্বভৌম পদচিহ্ন
                    </p>
                  </div>
                  <div className="h-8 w-[1px] bg-white/15" />
                  <div>
                    <p className="font-display text-3xl sm:text-4xl font-bold text-amber-400 tracking-tight">
                      {stats.divisionsExploredCount} <span className="text-sm font-normal text-white/50">/ ৮</span>
                    </p>
                    <p className="font-body text-[10px] sm:text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                      বিভাগ অন্বেষণ
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom-Right Notched Dock Component (Matching Reference) */}
              <div className="bg-white text-stone-950 px-5 py-3 rounded-2xl sm:rounded-tl-2xl sm:rounded-br-none shadow-2xl flex items-center gap-3.5 border border-stone-200/60 self-stretch sm:self-auto justify-between sm:justify-start">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevDistrict}
                    aria-label="আগের জেলা"
                    className="w-8 h-8 rounded-full bg-stone-900 hover:bg-[#EA580C] text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextDistrict}
                    aria-label="পরের জেলা"
                    className="w-8 h-8 rounded-full bg-stone-900 hover:bg-[#EA580C] text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="hidden sm:block h-1.5 w-20 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#EA580C] transition-all duration-300"
                    style={{ width: `${((activeDistrictIndex + 1) / 64) * 100}%` }}
                  />
                </div>

                <div className="text-right sm:text-left">
                  <span className="font-mono text-xs font-bold text-stone-900 block leading-tight">
                    {String(activeDistrictIndex + 1).padStart(2, '0')}{' '}
                    <span className="text-stone-400 font-normal">/ ৬৪</span>
                  </span>
                  <span className="font-body text-[10px] font-bold text-[#EA580C] block leading-none truncate max-w-[100px]">
                    {DISTRICTS[activeDistrictIndex]?.bn_name}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Bangladesh Interactive Map Section */}
          <div className="px-3 sm:px-8 lg:px-12">
            <section aria-label="ইন্টারেক্টিভ মানচিত্র">
              <BangladeshMap />
            </section>
          </div>

          {/* 64-District Regional Catalog */}
          <div className="px-3 sm:px-8 lg:px-12">
            <section className="space-y-4 sm:space-y-6 pt-4 border-t border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4">
                <div>
                  <span className="font-body font-bold text-[10px] uppercase tracking-wider text-[#EA580C]">
                    আঞ্চলিক সূচি
                  </span>
                  <h2 className="font-display text-xl sm:text-3xl font-bold tracking-wide text-white mt-0.5 sm:mt-1">
                    বিভাগ অনুযায়ী ৬৪ জেলা
                  </h2>
                </div>
                <p className="font-body text-xs text-stone-400 max-w-sm font-light">
                  বিভাগ নির্বাচন করে জেলাগুলোতে ক্লিক করুন এবং ভ্রমণ স্থিতি চিহ্নিত করুন।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                {DIVISIONS.map((div) => {
                  const divDistricts = DISTRICTS.filter((d) => d.division === div.name);
                  const visitedCount = divDistricts.filter(
                    (d) => userData[d.id]?.status === 'visited'
                  ).length;
                  const percent = Math.round((visitedCount / div.districtsCount) * 100);

                  return (
                    <div
                      key={div.name}
                      className="bg-[#12141A]/90 border border-white/10 hover:border-white/20 transition-all p-3.5 sm:p-5 flex flex-col justify-between space-y-3 sm:space-y-4 relative group shadow-sm rounded-2xl"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: div.color }}
                            />
                            <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                              {div.bn_name} বিভাগ
                            </h3>
                          </div>
                          <span className="font-body text-xs font-bold text-stone-400">
                            {visitedCount} / {div.districtsCount}
                          </span>
                        </div>

                        <div className="h-1.5 w-full bg-white/10 mt-2 sm:mt-2.5 overflow-hidden rounded-full">
                          <div
                            className="h-full transition-all duration-300 rounded-full"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: div.color,
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 pt-1 sm:pt-2">
                        {divDistricts.map((district) => {
                          const status = userData[district.id]?.status || 'not_visited';
                          const photoCount = visits
                            .filter((v) => v.districtId === district.id)
                            .reduce((acc, v) => acc + (v.photos?.length || 0), 0);

                          return (
                            <button
                              key={district.id}
                              onClick={() => selectDistrict(district.id)}
                              className={`px-2 py-2 text-left text-xs transition-all flex items-center justify-between rounded-xl border cursor-pointer ${
                                status === 'visited'
                                  ? 'bg-[#EA580C]/15 text-[#EA580C] font-bold border-[#EA580C]/40'
                                  : status === 'want_to_visit'
                                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                  : 'bg-white/5 text-stone-400 hover:text-white hover:bg-white/10 border-white/5'
                              }`}
                            >
                              <span className="truncate font-body font-semibold">
                                {district.bn_name}
                              </span>
                              <div className="flex items-center gap-1 shrink-0 ml-1">
                                {photoCount > 0 && (
                                  <span className="text-[10px] text-white/50 flex items-center gap-0.5">
                                    <Camera className="w-2.5 h-2.5" />
                                    {photoCount}
                                  </span>
                                )}
                                {status === 'visited' && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#EA580C]" />
                                )}
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
      )}

      {activeTab === 'memories' && (
        <div className="px-3 sm:px-8 lg:px-12 pt-6">
          <MemoriesTimelinePage />
        </div>
      )}
      {activeTab === 'settings' && (
        <div className="px-3 sm:px-8 lg:px-12 pt-6">
          <SettingsPage />
        </div>
      )}

      {/* Interactive Global Modals */}
      <DistrictQuickPanel />
      <UnlockCelebrationModal />
      <Completion100Modal />
      <PhotoLightbox />
      <AuthModal isOpen={authModalOpen} onClose={closeAuthModal} />
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      {/* Outer Viewport Canvas (Neutral Grey) */}
      <div className="min-h-screen bg-[#E5E9EE] dark:bg-[#07080A] py-2 sm:py-6 px-1.5 sm:px-4 lg:px-6 flex flex-col justify-start font-sans selection:bg-[#EA580C] selection:text-white transition-colors duration-300">
        {/* Floating Device Container Frame matching Reference */}
        <div className="w-full max-w-[1500px] mx-auto bg-[#0A0C10] text-white rounded-[24px] sm:rounded-[36px] md:rounded-[44px] shadow-2xl border border-white/10 overflow-hidden relative flex flex-col min-h-[92vh]">
          <Navbar />
          <div className="flex-1">
            <MainContent />
          </div>
        </div>
      </div>
    </AppProvider>
  );
}

