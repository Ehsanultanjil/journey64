import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  MapPin,
  Calendar,
  Camera,
  Heart,
  Star,
  BookOpen,
  CheckCircle2,
  Bookmark,
  Sparkles,
  Plus,
  AlertTriangle,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DistrictStatus } from '../../types';

export const DistrictQuickPanel: React.FC = () => {
  const {
    selectedDistrict,
    selectDistrict,
    userData,
    visits,
    setDistrictStatus,
    updateDistrictRating,
    toggleDistrictFavorite,
    openDistrictJournal,
  } = useApp();

  const [confirmUnvisitOpen, setConfirmUnvisitOpen] = useState(false);

  if (!selectedDistrict) return null;

  const districtId = selectedDistrict.id;
  const currentData = userData[districtId];
  const currentStatus: DistrictStatus = currentData?.status || 'not_visited';
  const districtVisits = visits.filter((v) => v.districtId === districtId);
  const totalPhotos = districtVisits.reduce((acc, v) => acc + (v.photos?.length || 0), 0);
  const coverPhoto =
    districtVisits.flatMap((v) => v.photos || []).find((p) => p.isCover)?.url ||
    districtVisits.flatMap((v) => v.photos || [])[0]?.url;

  const isFavorite = !!currentData?.isFavorite;
  const rating = currentData?.rating || 5;
  const visitDate = currentData?.firstVisitedDate || districtVisits[0]?.visitDate;

  const handleStatusChange = (newStatus: DistrictStatus) => {
    if (currentStatus === 'visited' && newStatus === 'not_visited') {
      setConfirmUnvisitOpen(true);
      return;
    }
    setDistrictStatus(districtId, newStatus);
  };

  const handleConfirmUnvisit = () => {
    setDistrictStatus(districtId, 'not_visited');
    setConfirmUnvisitOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/50 backdrop-blur-xs">
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={() => selectDistrict(null)} />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-[#0c0c0c] text-white border border-white/20 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10"
        >
          {/* Cover Photo Header or Gradient Banner */}
          <div className="relative h-48 sm:h-56 w-full bg-[#161616] overflow-hidden shrink-0 border-b border-white/10">
            {coverPhoto ? (
              <img
                src={coverPhoto}
                alt={selectedDistrict.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1c120c] via-[#111111] to-[#050505] flex items-center justify-center p-6 text-center">
                <div>
                  <Compass className="w-14 h-14 text-[#F27D26]/40 mx-auto mb-2" />
                  <p className="font-body font-black text-[10px] text-white/50 tracking-[0.3em] uppercase">
                    {selectedDistrict.division} DIVISION
                  </p>
                </div>
              </div>
            )}

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />

            {/* Top Close & Favorite buttons */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
              <button
                id="quick-panel-fav-btn"
                onClick={() => toggleDistrictFavorite(districtId)}
                className={`p-2.5 transition-all ${
                  isFavorite
                    ? 'bg-[#F27D26] text-white scale-105 shadow-md'
                    : 'bg-black/60 text-white/80 hover:bg-black'
                }`}
                aria-label="Toggle favorite"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
              </button>

              <button
                id="quick-panel-close-btn"
                onClick={() => selectDistrict(null)}
                className="p-2.5 bg-black/60 hover:bg-[#F27D26] text-white transition-colors"
                aria-label="Close panel"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* District Titles on Cover */}
            <div className="absolute bottom-4 left-5 right-5 text-white">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-body font-black text-[9px] uppercase tracking-[0.2em] px-2.5 py-1 bg-[#F27D26] text-white">
                  {selectedDistrict.division} DIVISION
                </span>
                {selectedDistrict.isCoastal && (
                  <span className="font-body font-black text-[9px] uppercase tracking-[0.2em] px-2.5 py-1 bg-white/20 text-white backdrop-blur-md">
                    COASTAL
                  </span>
                )}
                {selectedDistrict.isHill && (
                  <span className="font-body font-black text-[9px] uppercase tracking-[0.2em] px-2.5 py-1 bg-amber-500 text-black">
                    HILL TRACT
                  </span>
                )}
              </div>
              <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-wide mt-1.5 flex items-baseline gap-3">
                {selectedDistrict.name}
                <span className="font-bn text-base sm:text-lg font-semibold text-white/60">
                  {selectedDistrict.bn_name}
                </span>
              </h2>
            </div>
          </div>

          {/* Panel Content Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
            {/* Tagline / Highlights */}
            {selectedDistrict.tagline && (
              <p className="text-xs sm:text-sm text-stone-300 font-light tracking-wide italic border-l-2 border-[#F27D26] pl-3 py-0.5">
                "{selectedDistrict.tagline}"
              </p>
            )}

            {/* Status Selector Bar (Bold Typography) */}
            <div className="space-y-1.5">
              <span className="font-body font-black text-[9px] uppercase tracking-[0.25em] text-white/50 block">
                TERRITORY STATUS
              </span>
              <div className="bg-white/5 p-1 flex items-center gap-1 border border-white/10">
                <button
                  id="status-btn-visited"
                  onClick={() => handleStatusChange('visited')}
                  className={`flex-1 py-2.5 px-3 font-body text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 transition-all ${
                    currentStatus === 'visited'
                      ? 'bg-[#F27D26] text-white shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  EXPLORED
                </button>

                <button
                  id="status-btn-want"
                  onClick={() => handleStatusChange('want_to_visit')}
                  className={`flex-1 py-2.5 px-3 font-body text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 transition-all ${
                    currentStatus === 'want_to_visit'
                      ? 'bg-amber-400 text-black shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  WISHLIST
                </button>

                <button
                  id="status-btn-not"
                  onClick={() => handleStatusChange('not_visited')}
                  className={`flex-1 py-2.5 px-3 font-body text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 transition-all ${
                    currentStatus === 'not_visited'
                      ? 'bg-white/20 text-white shadow-md'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  UNEXPLORED
                </button>
              </div>
            </div>

            {/* Visited Details & Actions */}
            {currentStatus === 'visited' && (
              <div className="space-y-4 pt-1">
                {/* Stats row: Visit Date, Photos Count, Rating */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3.5 border border-white/10">
                    <span className="font-body font-black text-[9px] uppercase tracking-[0.25em] text-[#F27D26] block mb-1">
                      FIRST RECORDED
                    </span>
                    <p className="font-display text-lg tracking-wide uppercase text-white">
                      {visitDate
                        ? new Date(visitDate).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'RECORDED'}
                    </p>
                  </div>

                  <div className="bg-white/5 p-3.5 border border-white/10">
                    <span className="font-body font-black text-[9px] uppercase tracking-[0.25em] text-[#F27D26] block mb-1">
                      MEMORIES SAVED
                    </span>
                    <p className="font-display text-lg tracking-wide uppercase text-white">
                      {totalPhotos} {totalPhotos === 1 ? 'PHOTO' : 'PHOTOS'}
                    </p>
                  </div>
                </div>

                {/* Rating row */}
                <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10">
                  <span className="font-body font-black text-[10px] uppercase tracking-[0.2em] text-white">
                    RATING
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => updateDistrictRating(districtId, star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= rating ? 'fill-amber-400 text-amber-400' : 'text-white/20'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Action Button: Open Journal */}
                <button
                  id="quick-panel-open-journal-btn"
                  onClick={() => {
                    selectDistrict(null);
                    openDistrictJournal(districtId);
                  }}
                  className="w-full py-4 px-6 bg-white text-black hover:bg-[#F27D26] hover:text-white font-body font-black text-xs uppercase tracking-[0.25em] flex items-center justify-between transition-colors cursor-pointer shadow-lg"
                >
                  <span className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4" />
                    OPEN MEMORY JOURNAL & ALBUM
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Want to Visit action */}
            {currentStatus === 'want_to_visit' && (
              <div className="p-4 bg-white/5 border border-amber-400/30 space-y-3">
                <div className="flex items-start gap-3">
                  <Bookmark className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-body font-black text-[11px] uppercase tracking-[0.2em] text-amber-400">
                      ON YOUR EXPLORATION WISHLIST
                    </h4>
                    <p className="font-body text-xs text-stone-300 mt-1 font-light">
                      Highlighted in gold on your 64-district territorial map.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleStatusChange('visited')}
                  className="w-full py-3 px-4 bg-amber-400 text-black hover:bg-[#F27D26] hover:text-white font-body font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  MARK AS EXPLORED
                </button>
              </div>
            )}

            {/* Not Visited action */}
            {currentStatus === 'not_visited' && (
              <div className="p-4 bg-white/5 border border-white/10 space-y-3">
                <p className="font-body text-xs text-stone-300 font-light">
                  Have you traveled through {selectedDistrict.name}? Record it to unlock badges and preserve photographs.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusChange('visited')}
                    className="flex-1 py-3 px-4 bg-[#F27D26] text-white hover:bg-white hover:text-black font-body font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    EXPLORED
                  </button>
                  <button
                    onClick={() => handleStatusChange('want_to_visit')}
                    className="py-3 px-4 bg-white/10 hover:bg-amber-400 hover:text-black text-white font-body font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    WISHLIST
                  </button>
                </div>
              </div>
            )}

            {/* Famous spots chips */}
            {selectedDistrict.famousSpots && selectedDistrict.famousSpots.length > 0 && (
              <div className="pt-2">
                <span className="font-body font-black text-[9px] uppercase tracking-[0.25em] text-white/50 block mb-2">
                  NOTABLE LANDMARKS
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedDistrict.famousSpots.map((spot, idx) => (
                    <span
                      key={idx}
                      className="font-body text-[10px] font-semibold uppercase tracking-wider px-3 py-1 bg-white/5 text-stone-300 border border-white/10"
                    >
                      {spot}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Confirmation Dialog for Unvisiting */}
      {confirmUnvisitOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4"
          >
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Mark {selectedDistrict.name} as not visited?
              </h3>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Your saved photos and journal memories will <strong>not</strong> be deleted, and can be restored anytime by marking the district as visited again.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmUnvisitOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUnvisit}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm"
              >
                Yes, Change Status
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
