import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navigation/Navbar';
import { BangladeshMap } from './components/Map/BangladeshMap';
import { DistrictQuickPanel } from './components/District/DistrictQuickPanel';
import { MemoriesTimelinePage } from './components/Memories/MemoriesTimelinePage';
import { TripsPage } from './components/Trips/TripsPage';
import { ProgressPage } from './components/Progress/ProgressPage';
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
    selectDistrict,
    authModalOpen,
    closeAuthModal,
  } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-28 md:pb-16 space-y-10 sm:space-y-12">
      {activeTab === 'explore' && (
        <div className="space-y-12 animate-in fade-in duration-300">
          {/* Bold Typographic Hero Banner */}
          <div className="relative border-b border-white/10 pb-8 pt-2 overflow-hidden">
            {/* Giant Architectural Background Watermark */}
            <div className="absolute right-0 top-0 select-none pointer-events-none opacity-5 flex items-baseline">
              <span className="font-display text-[16rem] sm:text-[22rem] leading-none text-white">64</span>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-3">
                  <span className="font-body font-black text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#F27D26]">
                    Interactive Canvas • Volume 01
                  </span>
                  <div className="h-[1px] w-12 bg-white/20" />
                  <span className="font-body text-[10px] tracking-[0.2em] uppercase text-white/50">
                    64 Territorial Districts
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h1 className="font-display text-4xl sm:text-6xl md:text-7xl uppercase tracking-tight text-white leading-none">
                    EXPLORE
                  </h1>
                  <span className="font-display text-4xl sm:text-6xl md:text-7xl uppercase tracking-tight text-outline">
                    BANGLADESH
                  </span>
                </div>

                <p className="font-body text-xs sm:text-sm text-stone-300 font-light tracking-wide max-w-2xl pt-1">
                  Click any district directly on the vector map or catalog below to log visits, record cherished travel memories, and map your personal journey.
                </p>
              </div>

              {/* High-Impact Stat Metrics Bar */}
              <div className="flex items-center gap-6 sm:gap-10 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
                <div>
                  <span className="block font-body font-black text-[9px] uppercase tracking-[0.25em] text-[#F27D26] mb-1">
                    Explored
                  </span>
                  <span className="block font-display text-3xl sm:text-4xl text-white leading-none">
                    {stats.visitedCount}
                    <span className="text-sm font-sans font-normal text-white/40 ml-1">/ 64</span>
                  </span>
                </div>

                <div className="h-10 w-[1px] bg-white/15" />

                <div>
                  <span className="block font-body font-black text-[9px] uppercase tracking-[0.25em] text-white/40 mb-1">
                    Completion
                  </span>
                  <span className="block font-display text-3xl sm:text-4xl text-[#F27D26] leading-none">
                    {stats.percentageExplored}%
                  </span>
                </div>

                <div className="h-10 w-[1px] bg-white/15" />

                <div>
                  <span className="block font-body font-black text-[9px] uppercase tracking-[0.25em] text-white/40 mb-1">
                    Wishlist
                  </span>
                  <span className="block font-display text-3xl sm:text-4xl text-white/80 leading-none">
                    {stats.wantToVisitCount}
                  </span>
                </div>
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
      {activeTab === 'trips' && <TripsPage />}
      {activeTab === 'progress' && <ProgressPage />}
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
