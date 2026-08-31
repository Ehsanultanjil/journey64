import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Calendar,
  Camera,
  MapPin,
  Heart,
  Star,
  Search,
  ArrowRight,
  Sparkles,
  Compass,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DISTRICTS, getDistrictById } from '../../data/districts';
import { DistrictMemoryPage } from './DistrictMemoryPage';

export const MemoriesTimelinePage: React.FC = () => {
  const {
    userData,
    visits,
    openDistrictJournal,
    viewingJournalDistrictId,
    setActiveTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);

  // If currently viewing a specific district journal, render that component
  if (viewingJournalDistrictId) {
    return (
      <DistrictMemoryPage
        districtId={viewingJournalDistrictId}
        onBack={() => openDistrictJournal(null)}
      />
    );
  }

  // Get visited districts list
  const visitedDistricts = useMemo(() => {
    return DISTRICTS.filter((d) => userData[d.id]?.status === 'visited');
  }, [userData]);

  // Group visits and district memories chronologically by year and month
  const timelineGroups = useMemo(() => {
    // Collect all district entries with dates
    const entries = visitedDistricts.map((district) => {
      const uData = userData[district.id];
      const dVisits = visits.filter((v) => v.districtId === district.id);
      const latestVisit = dVisits[0];

      const dateStr = latestVisit?.visitDate || uData?.firstVisitedDate || '2023-01-01';
      const dateObj = new Date(dateStr);
      const year = isNaN(dateObj.getFullYear()) ? 2023 : dateObj.getFullYear();
      const month = isNaN(dateObj.getMonth()) ? 0 : dateObj.getMonth();

      // Photos
      const photos = dVisits.flatMap((v) => v.photos || []);
      const coverPhoto = photos.find((p) => p.isCover)?.url || photos[0]?.url;

      // Note
      const note = latestVisit?.notes || uData?.notes || '';

      return {
        district,
        userData: uData,
        visitsCount: dVisits.length,
        photosCount: photos.length,
        coverPhoto,
        note,
        dateStr,
        dateObj,
        year,
        month,
      };
    });

    // Apply filters
    const filtered = entries.filter((item) => {
      if (selectedDivision !== 'all' && item.district.division !== selectedDivision) {
        return false;
      }
      if (favoritesOnly && !item.userData?.isFavorite) {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const m1 = item.district.name.toLowerCase().includes(q);
        const m2 = item.district.bn_name.includes(q);
        const m3 = item.note.toLowerCase().includes(q);
        return m1 || m2 || m3;
      }
      return true;
    });

    // Sort descending by date
    filtered.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

    // Group by Year -> Month
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const groupMap = new Map<number, Map<number, typeof filtered>>();
    filtered.forEach((item) => {
      if (!groupMap.has(item.year)) {
        groupMap.set(item.year, new Map());
      }
      const yearMap = groupMap.get(item.year)!;
      if (!yearMap.has(item.month)) {
        yearMap.set(item.month, []);
      }
      yearMap.get(item.month)!.push(item);
    });

    return Array.from(groupMap.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([year, monthsMap]) => ({
        year,
        months: Array.from(monthsMap.entries())
          .sort((a, b) => b[0] - a[0])
          .map(([monthIndex, items]) => ({
            monthName: months[monthIndex],
            items,
          })),
      }));
  }, [visitedDistricts, userData, visits, selectedDivision, favoritesOnly, searchQuery]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-24 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <span className="font-body font-black text-[9px] uppercase tracking-[0.3em] text-[#F27D26]">
            Archival Log • Chronological Stream
          </span>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white mt-1">
            TRAVEL MEMORIES
          </h1>
          <p className="font-body text-xs sm:text-sm text-stone-400 font-light mt-1 max-w-xl">
            A chronological visual record of all your explorations across Bangladesh.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
            <input
              type="text"
              placeholder="SEARCH MEMORIES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-body font-bold tracking-wider bg-white/5 border border-white/15 text-white placeholder-white/40 uppercase focus:outline-none focus:border-[#F27D26]"
            />
          </div>

          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`px-4 py-2 text-xs font-body font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all cursor-pointer ${
              favoritesOnly
                ? 'bg-[#F27D26] text-white shadow-md'
                : 'bg-white/5 border border-white/15 text-white hover:bg-white/10'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-white' : 'text-[#F27D26]'}`} />
            FAVORITES
          </button>
        </div>
      </div>

      {/* Empty State when no districts are visited */}
      {visitedDistricts.length === 0 ? (
        <div className="bg-[#0f0f0f] border border-white/10 p-10 sm:p-16 text-center space-y-5 max-w-lg mx-auto mt-8">
          <div className="w-16 h-16 bg-white text-black flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8 stroke-[2.5]" />
          </div>
          <span className="font-body font-black text-[10px] uppercase tracking-[0.3em] text-[#F27D26] block">
            EMPTY ARCHIVE
          </span>
          <h3 className="font-display text-2xl uppercase tracking-wide text-white">
            YOUR JOURNEY STARTS HERE
          </h3>
          <p className="font-body text-xs sm:text-sm text-stone-400 leading-relaxed font-light">
            You haven't explored a district yet. Select any region on the 64-district vector map and record your first memory!
          </p>
          <button
            onClick={() => setActiveTab('explore')}
            className="px-6 py-3.5 bg-white text-black hover:bg-[#F27D26] hover:text-white font-body font-black text-xs uppercase tracking-[0.2em] inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
            OPEN 64-DISTRICT MAP
          </button>
        </div>
      ) : timelineGroups.length === 0 ? (
        <div className="text-center py-16 text-stone-500 font-body text-xs uppercase tracking-widest">
          NO MEMORIES MATCH YOUR ACTIVE FILTER.
        </div>
      ) : (
        /* Timeline Feed */
        <div className="space-y-12 relative">
          {/* Vertical Timeline Rule */}
          <div className="absolute left-6 top-8 bottom-8 w-[1px] bg-white/10 hidden sm:block" />

          {timelineGroups.map((group) => (
            <div key={group.year} className="space-y-8">
              {/* Year Heading */}
              <div className="flex items-center gap-4">
                <span className="font-display text-3xl sm:text-4xl text-[#F27D26] tracking-wide z-10">
                  {group.year}
                </span>
                <div className="h-[1px] bg-white/10 flex-1" />
              </div>

              {group.months.map((month) => (
                <div key={month.monthName} className="space-y-4 sm:pl-10 relative">
                  <h3 className="font-body font-black text-[10px] sm:text-xs tracking-[0.25em] text-white/50 uppercase">
                    {month.monthName}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {month.items.map((item) => (
                      <motion.div
                        key={item.district.id}
                        whileHover={{ y: -3 }}
                        onClick={() => openDistrictJournal(item.district.id)}
                        className="group bg-[#0e0e0e] border border-white/10 hover:border-white/25 transition-all cursor-pointer flex flex-col"
                      >
                        {/* Cover Image */}
                        <div className="relative h-48 w-full bg-[#181818] overflow-hidden border-b border-white/10">
                          {item.coverPhoto ? (
                            <img
                              src={item.coverPhoto}
                              alt={item.district.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#1b120c] to-[#0a0a0a] flex items-center justify-center">
                              <Compass className="w-12 h-12 text-[#F27D26]/30" />
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                            <span className="font-body font-black text-[9px] uppercase tracking-[0.2em] px-2.5 py-1 bg-black/60 backdrop-blur-md text-white border border-white/10">
                              {item.district.division}
                            </span>
                            {item.userData?.isFavorite && (
                              <span className="p-1.5 bg-[#F27D26] text-white">
                                <Heart className="w-3.5 h-3.5 fill-white" />
                              </span>
                            )}
                          </div>

                          {/* Bottom title on photo */}
                          <div className="absolute bottom-3.5 left-4 right-4 text-white">
                            <h4 className="font-display text-2xl uppercase tracking-wide flex items-baseline gap-2">
                              {item.district.name}
                              <span className="font-bn text-sm font-semibold text-white/60">
                                {item.district.bn_name}
                              </span>
                            </h4>
                            <div className="flex items-center gap-4 font-body text-[10px] text-white/60 mt-1 uppercase tracking-wider">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3 h-3 text-[#F27D26]" />
                                {new Date(item.dateStr).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Camera className="w-3 h-3 text-[#F27D26]" />
                                {item.photosCount} {item.photosCount === 1 ? 'photo' : 'photos'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Note / Excerpt Body */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          {item.note.trim().length > 0 ? (
                            <p className="font-body text-xs leading-relaxed text-stone-300 font-light italic line-clamp-2">
                              "{item.note}"
                            </p>
                          ) : (
                            <p className="font-body text-xs text-stone-500 italic font-light">
                              Add a story to preserve your thoughts from this visit...
                            </p>
                          )}

                          <div className="pt-3 border-t border-white/10 flex items-center justify-between font-body font-black text-[10px] uppercase tracking-[0.2em] text-[#F27D26]">
                            <span>VIEW ALBUM & NOTES</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
