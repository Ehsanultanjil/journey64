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
          {/* Main Exploration Scorecard (National Footprint) */}
          <div className="bg-[#0e0e0e] border border-white/15 p-6 sm:p-8 text-white space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <span className="font-body font-black text-[9px] uppercase tracking-[0.25em] px-3 py-1 bg-[#F27D26] text-white">
                  NATIONAL FOOTPRINT
                </span>
                <h2 className="font-display text-4xl sm:text-6xl uppercase tracking-tight mt-3">
                  {stats.visitedCount} <span className="text-white/40">/ 64</span> DISTRICTS
                </h2>
                <p className="font-body text-xs sm:text-sm text-stone-300 mt-1 font-light">
                  You have unlocked <strong className="font-bold text-[#F27D26]">{stats.percentageExplored}%</strong> of Bangladesh's sovereign landmass.
                </p>
              </div>

              <div className="flex items-center gap-8 sm:text-right">
                <div>
                  <p className="font-display text-3xl sm:text-4xl text-amber-400">
                    {stats.wantToVisitCount}
                  </p>
                  <p className="font-body font-black text-[9px] uppercase tracking-[0.2em] text-white/50">
                    WISHLIST
                  </p>
                </div>
                <div>
                  <p className="font-display text-3xl sm:text-4xl text-white/30">
                    {stats.notVisitedCount}
                  </p>
                  <p className="font-body font-black text-[9px] uppercase tracking-[0.2em] text-white/50">
                    UNEXPLORED
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
              <div className="flex items-center justify-between font-body font-black text-[9px] uppercase tracking-[0.2em] text-white/40">
                <span>0 DISTRICTS</span>
                <span>32 HALFWAY</span>
                <span>64 FULL SOVEREIGNTY</span>
              </div>
            </div>

            {/* Metric Highlights Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
              <div className="p-3 bg-white/5 border border-white/5">
                <span className="block font-body font-black text-[9px] uppercase tracking-[0.2em] text-stone-400">
                  MEMORIES
                </span>
                <span className="font-display text-2xl text-white mt-1 block">
                  {stats.totalMemories}
                </span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5">
                <span className="block font-body font-black text-[9px] uppercase tracking-[0.2em] text-stone-400">
                  PHOTOS SAVED
                </span>
                <span className="font-display text-2xl text-white mt-1 block">
                  {stats.totalPhotos}
                </span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5">
                <span className="block font-body font-black text-[9px] uppercase tracking-[0.2em] text-stone-400">
                  DIVISIONS
                </span>
                <span className="font-display text-2xl text-white mt-1 block">
                  {stats.divisionsExploredCount} <span className="text-xs text-white/40">/ 8</span>
                </span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5">
                <span className="block font-body font-black text-[9px] uppercase tracking-[0.2em] text-[#F27D26]">
                  HONORS UNLOCKED
                </span>
                <span className="font-display text-2xl text-[#F27D26] mt-1 block">
                  {achievements.filter(a => a.isUnlocked).length} <span className="text-xs text-white/40">/ {achievements.length}</span>
                </span>
              </div>
            </div>
          </div>


          {/* Bangladesh Interactive Map Section */}
          <section aria-label="Interactive Map">
            <BangladeshMap />
          </section>

          {/* 64-District Catalog & Quick Selector (Bold Typography Layout) */}
          <section className="space-y-6 pt-4 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="font-body font-black text-[9px] uppercase tracking-[0.3em] text-[#F27D26]">
                  Territorial Index
                </span>
                <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-white mt-1">
                  ALL 64 DISTRICTS BY DIVISION
                </h2>
              </div>
              <p className="font-body text-xs text-stone-400 max-w-sm font-light">
                Browse divisions and mark districts to instantly unlock memories and badges.
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
                      {/* Division Header with bold typography */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="font-body font-black text-[9px] uppercase tracking-[0.25em] text-white/40">
                            DIV 0{idx + 1}
                          </span>
                          <h3 className="font-display text-xl uppercase tracking-wide text-white group-hover:text-[#F27D26] transition-colors">
                            {div.name}
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="font-display text-lg text-[#F27D26]">
                            {visitedCount}
                            <span className="text-white/40 text-xs font-sans">/{div.districtsCount}</span>
                          </span>
                        </div>
                      </div>

                      {/* Minimalist divider & Progress bar */}
                      <div className="h-[2px] w-full bg-white/10 overflow-hidden mb-3">
                        <div
                          className="h-full bg-[#F27D26] transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Districts List */}
                    <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                      {divDistricts.map((district) => {
                        const status = userData[district.id]?.status || 'not_visited';
                        const districtVisits = visits.filter(
                          (v) => v.districtId === district.id
                        );
                        const photoCount = districtVisits.reduce(
                          (acc, v) => acc + (v.photos?.length || 0),
                          0
                        );

                        return (
                          <button
                            key={district.id}
                            id={`district-list-item-${district.id}`}
                            onClick={() => selectDistrict(district.id)}
                            className="w-full py-1.5 px-2 text-left flex items-center justify-between text-xs hover:bg-white/10 transition-colors group/item"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`w-1.5 h-1.5 shrink-0 ${
                                  status === 'visited'
                                    ? 'bg-[#F27D26]'
                                    : status === 'want_to_visit'
                                    ? 'bg-amber-400'
                                    : 'bg-white/20'
                                }`}
                              />
                              <span className="font-body font-medium text-stone-200 truncate group-hover/item:text-white">
                                {district.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {photoCount > 0 && (
                                <span className="font-body text-[10px] text-white/50 flex items-center gap-0.5 font-bold">
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
