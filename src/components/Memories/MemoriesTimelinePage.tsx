import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Heart,
  Search,
  Calendar,
  Camera,
  MapPin,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DISTRICTS } from '../../data/districts';
import { DistrictMemoryPage } from './DistrictMemoryPage';
import { Navbar } from '../Navigation/Navbar';

export const MemoriesTimelinePage: React.FC = () => {
  const {
    userData,
    visits,
    viewingJournalDistrictId,
    openDistrictJournal,
    setActiveTab,
  } = useApp();

  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get all visited districts
  const visitedDistricts = useMemo(() => {
    return DISTRICTS.filter((d) => userData[d.id]?.status === 'visited');
  }, [userData]);

  // Group visits / memories chronologically by Year & Month
  const timelineGroups = useMemo(() => {
    // Collect all visited items
    const allItems: {
      district: (typeof DISTRICTS)[0];
      userData: (typeof userData)[string];
      latestVisit?: (typeof visits)[0];
      dateStr: string;
      year: number;
      month: number;
      coverPhoto?: string;
      photosCount: number;
      note: string;
    }[] = [];

    visitedDistricts.forEach((d) => {
      const ud = userData[d.id];
      const districtVisits = visits.filter((v) => v.districtId === d.id);
      const latestVisit = districtVisits[0];

      // Filters
      if (selectedDivision !== 'all' && d.division !== selectedDivision) return;
      if (favoritesOnly && !ud?.isFavorite) return;

      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchName =
          d.name.toLowerCase().includes(query) ||
          d.bn_name.toLowerCase().includes(query);
        const matchNote =
          (ud?.notes || '').toLowerCase().includes(query) ||
          (latestVisit?.notes || '').toLowerCase().includes(query);
        if (!matchName && !matchNote) return;
      }

      // Collect photos for cover
      const allPhotos = districtVisits.flatMap((v) => v.photos || []);
      const coverPhoto =
        allPhotos.find((p) => p.isCover)?.url || allPhotos[0]?.url;

      // Extract date
      const dateStr =
        ud?.firstVisitedDate ||
        latestVisit?.visitDate ||
        latestVisit?.createdAt ||
        new Date().toISOString();
      const parsedDate = new Date(dateStr);
      const year = isNaN(parsedDate.getFullYear())
        ? new Date().getFullYear()
        : parsedDate.getFullYear();
      const month = isNaN(parsedDate.getMonth())
        ? new Date().getMonth()
        : parsedDate.getMonth();

      allItems.push({
        district: d,
        userData: ud,
        latestVisit,
        dateStr,
        year,
        month,
        coverPhoto,
        photosCount: allPhotos.length,
        note: ud?.notes || latestVisit?.notes || '',
      });
    });

    // Group by Year -> Month
    const groups = new Map<number, Map<number, typeof allItems>>();

    allItems.forEach((item) => {
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
      <div className="w-full flex flex-col flex-1 px-3 sm:px-8 lg:px-12 py-6">
        <DistrictMemoryPage
          districtId={viewingJournalDistrictId}
          onBack={() => openDistrictJournal(null)}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-24 animate-in fade-in duration-300 flex flex-col min-h-full -mt-[48px] sm:-mt-[58px]">
      {/* Top Hero Container with Background Photo matching Explore page */}
      <div className="relative border-b border-white/10 overflow-hidden flex flex-col justify-start pb-6 sm:pb-10 pt-14 sm:pt-18">
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

        {/* Hero Text, Headline, and Filters */}
        <section className="relative z-10 px-4 sm:px-8 lg:px-12 pt-3 sm:pt-4">
          <div className="max-w-4xl space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <span className="font-body font-bold text-[10px] uppercase tracking-wider text-[#059669]">
                আমার ভ্রমণ ডায়েরি
              </span>
              <h1 className="font-display text-2xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-snug sm:leading-[1.08] drop-shadow-md">
                যেসব জেলায় ঘুরেছি
              </h1>
              <p className="font-body text-xs sm:text-sm md:text-base text-stone-200 font-light leading-relaxed max-w-lg drop-shadow-sm">
                বাংলাদেশের বিভিন্ন জেলায় ঘোরার গল্প, অভিজ্ঞতা আর সুন্দর সব ছবির অ্যালবাম।
              </p>
            </div>

            {/* Filter & Search Controls */}
            <div className="flex items-center gap-3 flex-wrap pt-2">
              <div className="relative min-w-[200px] sm:min-w-[260px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="স্মৃতি খুঁজুন... (জেলার নাম বা নোট)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-body font-semibold tracking-wide bg-[#12141A]/80 backdrop-blur-md border border-white/20 text-white placeholder-stone-400 focus:outline-none focus:border-[#059669] rounded-2xl shadow-sm"
                />
              </div>

              <button
                onClick={() => setFavoritesOnly(!favoritesOnly)}
                className={`px-4 py-2 text-xs font-body font-bold tracking-wider flex items-center gap-2 transition-all cursor-pointer rounded-2xl ${
                  favoritesOnly
                    ? 'bg-[#059669] text-white shadow-lg shadow-[#059669]/30'
                    : 'bg-[#12141A]/80 backdrop-blur-md border border-white/20 text-white hover:bg-white/20'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-white' : 'text-[#059669]'}`} />
                পছন্দের জেলাগুলো
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-12">
        {/* Empty State when no districts are visited */}
        {visitedDistricts.length === 0 ? (
          <div className="bg-[#12141A]/90 border border-white/10 p-10 sm:p-16 text-center space-y-5 max-w-lg mx-auto mt-4 rounded-3xl shadow-2xl">
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
    </div>
  );
};
