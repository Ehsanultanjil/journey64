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

      // Find cover photo
      const coverPhoto =
        dVisits.flatMap((v) => v.photos || []).find((p) => p.isCover)?.url ||
        dVisits.flatMap((v) => v.photos || [])[0]?.url;

      const photosCount = dVisits.reduce((acc, v) => acc + (v.photos?.length || 0), 0);
      const note = latestVisit?.notes || uData?.notes || '';

      return {
        district,
        userData: uData,
        visits: dVisits,
        dateStr,
        year,
        month,
        coverPhoto,
        photosCount,
        note,
      };
    });

    // Filter by division and search query
    const filtered = entries.filter((item) => {
      if (selectedDivision !== 'all' && item.district.division !== selectedDivision) {
        return false;
      }
      if (favoritesOnly && !item.userData?.isFavorite) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName =
          item.district.name.toLowerCase().includes(q) ||
          item.district.bn_name.includes(q);
        const matchesNote = item.note.toLowerCase().includes(q);
        return matchesName || matchesNote;
      }
      return true;
    });

    // Group by year -> month
    const groups = new Map<number, Map<number, typeof filtered>>();

    filtered.forEach((item) => {
      if (!groups.has(item.year)) {
        groups.set(item.year, new Map());
      }
      const yearMap = groups.get(item.year)!;
      if (!yearMap.has(item.month)) {
        yearMap.set(item.month, []);
      }
      yearMap.get(item.month)!.push(item);
    });

    // Convert map to sorted array
    const months = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
    ];

    return Array.from(groups.entries())
      .sort((a, b) => b[0] - a[0]) // Sort years descending
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

  // If currently viewing a specific district journal, render that component
  if (viewingJournalDistrictId) {
    return (
      <DistrictMemoryPage
        districtId={viewingJournalDistrictId}
        onBack={() => openDistrictJournal(null)}
      />
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-24 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <span className="font-body font-bold text-[10px] uppercase tracking-wider text-[#059669]">
            আমার ভ্রমণ ডায়েরি
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white mt-1">
            যেসব জেলায় ঘুরেছি
          </h1>
          <p className="font-body text-xs sm:text-sm text-stone-400 font-light mt-1 max-w-xl">
            বাংলাদেশের বিভিন্ন জেলায় ঘোরার গল্প, অভিজ্ঞতা আর সুন্দর সব ছবির অ্যালবাম।
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="স্মৃতি খুঁজুন... (জেলার নাম বা নোট)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-body font-semibold tracking-wide bg-white/5 border border-white/15 text-white placeholder-stone-400 focus:outline-none focus:border-[#059669] rounded-xl"
            />
          </div>

          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`px-4 py-2 text-xs font-body font-bold tracking-wider flex items-center gap-2 transition-all cursor-pointer rounded-xl ${
              favoritesOnly
                ? 'bg-[#059669] text-white shadow-md'
                : 'bg-white/5 border border-white/15 text-white hover:bg-white/10'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-white' : 'text-[#059669]'}`} />
            পছন্দের জেলাগুলো
          </button>
        </div>
      </div>

      {/* Empty State when no districts are visited */}
      {visitedDistricts.length === 0 ? (
        <div className="bg-[#12141A]/90 border border-white/10 p-10 sm:p-16 text-center space-y-5 max-w-lg mx-auto mt-8 rounded-3xl shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#059669]/15 text-[#059669] flex items-center justify-center mx-auto shadow-md border border-[#059669]/30">
            <Compass className="w-8 h-8 stroke-[2.5]" />
          </div>
          <span className="font-body font-bold text-[10px] uppercase tracking-wider text-[#059669] block">
            এখনও কোনো স্মৃতি নেই
          </span>
          <h3 className="font-display text-2xl font-bold tracking-wide text-white">
            আপনার ভ্রমণ ডায়েরি শুরু করুন
          </h3>
          <p className="font-body text-xs sm:text-sm text-stone-400 leading-relaxed font-light">
            আপনি এখনও কোনো জেলায় ঘোরা চিহ্নিত করেননি। মানচিত্র থেকে জেলা বেছে নিয়ে আপনার ছবি ও স্মৃতিগুলো লিখে রাখুন!
          </p>
          <button
            onClick={() => setActiveTab('explore')}
            className="px-6 py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-body font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-colors cursor-pointer shadow-md rounded-2xl"
          >
            <MapPin className="w-4 h-4" />
            মানচিত্রে যান
          </button>
        </div>
      ) : timelineGroups.length === 0 ? (
        <div className="text-center py-16 text-stone-500 font-body text-xs font-semibold">
          খুঁজে পাওয়া যায়নি। অন্য কিছু লিখে দেখুন।
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
                <span className="font-display text-3xl sm:text-4xl text-[#059669] font-bold tracking-wide z-10">
                  {group.year}
                </span>
                <div className="h-[1px] bg-white/10 flex-1" />
              </div>

              {group.months.map((month) => (
                <div key={month.monthName} className="space-y-4 sm:pl-10 relative">
                  <h3 className="font-body font-bold text-[11px] sm:text-xs tracking-wider text-white/50 uppercase">
                    {month.monthName}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {month.items.map((item) => (
                      <motion.div
                        key={item.district.id}
                        whileHover={{ y: -3 }}
                        onClick={() => openDistrictJournal(item.district.id)}
                        className="group bg-[#12141A]/90 border border-white/10 hover:border-white/25 transition-all cursor-pointer flex flex-col rounded-3xl overflow-hidden shadow-md"
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
                            <div className="w-full h-full bg-gradient-to-br from-[#0B1A13] to-[#0A0C10] flex items-center justify-center">
                              <Compass className="w-12 h-12 text-[#059669]/40" />
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                            <span className="font-body font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 bg-black/60 backdrop-blur-md text-white border border-white/10 rounded-full">
                              {item.district.division} বিভাগ
                            </span>
                            {item.userData?.isFavorite && (
                              <span className="p-1.5 bg-[#059669] text-white rounded-full">
                                <Heart className="w-3.5 h-3.5 fill-white" />
                              </span>
                            )}
                          </div>

                          {/* Bottom title on photo */}
                          <div className="absolute bottom-3.5 left-4 right-4 text-white">
                            <h4 className="font-display text-2xl font-bold uppercase tracking-wide flex items-baseline gap-2">
                              {item.district.bn_name}
                              <span className="font-sans text-xs font-normal text-white/70">
                                ({item.district.name})
                              </span>
                            </h4>
                            <div className="flex items-center gap-4 font-body text-[10px] text-white/70 mt-1 font-semibold">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3 h-3 text-[#059669]" />
                                {new Date(item.dateStr).toLocaleDateString('bn-BD', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Camera className="w-3 h-3 text-[#059669]" />
                                {item.photosCount}টি ছবি
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
                              ভ্রমণের অনুভূতি ও গল্প লিখে রাখতে ক্লিক করুন...
                            </p>
                          )}

                          <div className="pt-3 border-t border-white/10 flex items-center justify-between font-body font-bold text-[10px] uppercase tracking-wider text-[#059669]">
                            <span>ডায়েরি ও ছবি দেখুন</span>
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
