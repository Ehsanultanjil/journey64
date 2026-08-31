import React from 'react';
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
  ArrowUpRight,
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-28 md:pb-16 space-y-10 sm:space-y-12">
      {activeTab === 'explore' && (
        <div className="space-y-8 sm:space-y-10 animate-in fade-in duration-300">
          {/* Main Exploration Scorecard (National Footprint) in Bangla */}
          <div className="bg-[#0e0e0e] border border-white/15 p-6 sm:p-8 text-white space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <span className="font-body font-bold text-[10px] tracking-wider px-3 py-1 bg-[#F27D26] text-white">
                  জাতীয় পদচিহ্ন
                </span>
                <h2 className="font-display text-4xl sm:text-6xl font-bold tracking-tight mt-3">
                  {stats.visitedCount} <span className="text-white/40 font-normal text-2xl sm:text-4xl">/ ৬৪</span> জেলা
                </h2>
                <p className="font-body text-xs sm:text-sm text-stone-300 mt-1 font-light">
                  আপনি বাংলাদেশের মোট ভূমির <strong className="font-bold text-[#F27D26]">{stats.percentageExplored}%</strong> অন্বেষণ করেছেন।
                </p>
              </div>

              <div className="flex items-center gap-8 sm:text-right">
                <div>
                  <p className="font-display text-3xl sm:text-4xl font-bold text-amber-400">
                    {stats.wantToVisitCount}
                  </p>
                  <p className="font-body font-bold text-[10px] uppercase tracking-wider text-white/50">
                    ইচ্ছাতালিকা
                  </p>
                </div>
                <div>
                  <p className="font-display text-3xl sm:text-4xl font-bold text-white/30">
                    {stats.notVisitedCount}
                  </p>
                  <p className="font-body font-bold text-[10px] uppercase tracking-wider text-white/50">
                    বাকি আছে
                  </p>
                </div>
              </div>
            </div>

            {/* Big Progress Bar */}
            <div className="space-y-2 pt-2">
              <div className="h-3 w-full bg-white/10 overflow-hidden">
                <div
                  style={{ width: `${stats.percentageExplored}%` }}
                  className="h-full bg-[#F27D26] transition-all duration-700 ease-out"
                />
              </div>
              <div className="flex items-center justify-between font-body font-bold text-[10px] uppercase tracking-wider text-white/40">
                <span>০ জেলা</span>
                <span>৩২ অর্ধেক</span>
                <span>৬৪ পূর্ণ সার্বভৌমত্ব</span>
              </div>
            </div>

            {/* Metric Highlights Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
              <div className="p-3.5 bg-white/5 border border-white/5">
                <span className="block font-body font-bold text-[10px] uppercase tracking-wider text-stone-400">
                  স্মৃতিকথা
                </span>
                <span className="font-display text-2xl font-bold text-white mt-1 block">
                  {stats.totalMemories}
                </span>
              </div>
              <div className="p-3.5 bg-white/5 border border-white/5">
                <span className="block font-body font-bold text-[10px] uppercase tracking-wider text-stone-400">
                  সংরক্ষিত ছবি
                </span>
                <span className="font-display text-2xl font-bold text-white mt-1 block">
                  {stats.totalPhotos}
                </span>
              </div>
              <div className="p-3.5 bg-white/5 border border-white/5">
                <span className="block font-body font-bold text-[10px] uppercase tracking-wider text-stone-400">
                  বিভাগ অন্বেষণ
                </span>
                <span className="font-display text-2xl font-bold text-white mt-1 block">
                  {stats.divisionsExploredCount} <span className="text-xs text-white/40 font-normal">/ ৮</span>
                </span>
              </div>
              <div className="p-3.5 bg-white/5 border border-white/5">
                <span className="block font-body font-bold text-[10px] uppercase tracking-wider text-[#F27D26]">
                  অর্জিত সম্মাননা
                </span>
                <span className="font-display text-2xl font-bold text-[#F27D26] mt-1 block">
                  {achievements.filter(a => a.isUnlocked).length} <span className="text-xs text-white/40 font-normal">/ {achievements.length}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Bangladesh Interactive Map Section */}
          <section aria-label="ইন্টারেক্টিভ মানচিত্র">
            <BangladeshMap />
          </section>

          {/* 64-District Catalog & Quick Selector (Bengali Layout) */}
          <section className="space-y-6 pt-4 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="font-body font-bold text-[10px] uppercase tracking-wider text-[#F27D26]">
                  আঞ্চলিক সূচি
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-wide text-white mt-1">
                  বিভাগ অনুযায়ী ৬৪ জেলা
                </h2>
              </div>
              <p className="font-body text-xs text-stone-400 max-w-sm font-light">
                বিভাগ নির্বাচন করে জেলাগুলোতে ক্লিক করুন এবং ভ্রমণ স্থিতি চিহ্নিত করুন।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {DIVISIONS.map((div, idx) => {
                const divDistricts = DISTRICTS.filter((d) => d.division === div.name);
                const visitedCount = divDistricts.filter(
                  (d) => userData[d.id]?.status === 'visited'
                ).length;
                const percent = Math.round((visitedCount / div.districtsCount) * 100);

                return (
                  <div
                    key={div.name}
                    className="bg-[#0f0f0f] border border-white/10 hover:border-white/20 transition-all p-5 flex flex-col justify-between space-y-4 relative group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5"
                            style={{ backgroundColor: div.color }}
                          />
                          <h3 className="font-display text-xl font-bold text-white">
                            {div.bn_name} বিভাগ
                          </h3>
                        </div>
                        <span className="font-body text-xs font-bold text-stone-400">
                          {visitedCount} / {div.districtsCount}
                        </span>
                      </div>

                      <div className="h-1.5 w-full bg-white/10 mt-2.5 overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: div.color,
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-2">
                      {divDistricts.map((district) => {
                        const status = userData[district.id]?.status || 'not_visited';
                        const photoCount = visits
                          .filter((v) => v.districtId === district.id)
                          .reduce((acc, v) => acc + (v.photos?.length || 0), 0);

                        return (
                          <button
                            key={district.id}
                            onClick={() => selectDistrict(district.id)}
                            className={`px-2 py-1.5 text-left text-xs transition-all flex items-center justify-between border cursor-pointer ${
                              status === 'visited'
                                ? 'bg-white/10 text-white font-bold border-white/20'
                                : status === 'want_to_visit'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                : 'bg-transparent text-stone-400 hover:text-white hover:bg-white/5 border-white/5'
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
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#F27D26]" />
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
      )}

      {activeTab === 'memories' && <MemoriesTimelinePage />}
      {activeTab === 'settings' && <SettingsPage />}

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
      <div className="min-h-screen bg-[#050505] text-stone-100 flex flex-col font-sans selection:bg-[#F27D26] selection:text-white transition-colors duration-200">
        <Navbar />
        <div className="flex-1">
          <MainContent />
        </div>
      </div>
    </AppProvider>
  );
}
