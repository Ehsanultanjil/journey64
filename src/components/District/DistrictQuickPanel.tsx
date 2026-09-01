import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calendar,
  Camera,
  Heart,
  Star,
  BookOpen,
  CheckCircle2,
  Bookmark,
  Compass,
  ArrowRight,
  Sparkles,
  AlertTriangle,
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
    updateDistrictNotes,
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
  const notes = currentData?.notes || districtVisits[0]?.notes || '';

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
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm">
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={() => selectDistrict(null)} />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-[#0F1218] text-white border border-white/15 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10 font-body"
        >
          {/* Header Banner */}
          <div className="relative h-44 sm:h-52 w-full bg-[#161A22] overflow-hidden shrink-0">
            {coverPhoto ? (
              <img
                src={coverPhoto}
                alt={selectedDistrict.name}
                className="w-full h-full object-cover filter brightness-90"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1C1612] via-[#12141A] to-[#0A0C10] flex items-center justify-center p-6 text-center">
                <div>
                  <Compass className="w-12 h-12 text-[#EA580C]/40 mx-auto mb-2" />
                  <span className="text-[10px] font-bold text-[#EA580C] uppercase tracking-widest">
                    {selectedDistrict.division} DIVISION
                  </span>
                </div>
              </div>
            )}

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F1218] via-[#0F1218]/50 to-black/30" />

            {/* Top Control Buttons */}
            <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
              <button
                id="quick-panel-fav-btn"
                onClick={() => toggleDistrictFavorite(districtId)}
                className={`p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                  isFavorite
                    ? 'bg-[#EA580C] text-white shadow-md scale-105'
                    : 'bg-black/60 text-white/80 hover:bg-black hover:text-[#EA580C]'
                }`}
                aria-label="পছন্দের তালিকা"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
              </button>

              <button
                id="quick-panel-close-btn"
                onClick={() => selectDistrict(null)}
                className="p-2.5 rounded-full bg-black/60 hover:bg-[#EA580C] text-white backdrop-blur-md transition-colors cursor-pointer"
                aria-label="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* District Titles on Banner */}
            <div className="absolute bottom-3.5 left-4 right-4 text-white">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EA580C] text-white shadow-xs">
                  {selectedDistrict.division} বিভাগ
                </span>
                {selectedDistrict.isCoastal && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/15 text-white backdrop-blur-md">
                    উপকূলীয়
                  </span>
                )}
                {selectedDistrict.isHill && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    পার্বত্য
                  </span>
                )}
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight flex items-baseline gap-2 text-white">
                {selectedDistrict.bn_name}
                <span className="font-sans text-xs font-normal text-stone-300">
                  ({selectedDistrict.name})
                </span>
              </h2>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            {/* Tagline / Highlights */}
            {selectedDistrict.tagline && (
              <p className="text-xs text-stone-300 font-light italic border-l-2 border-[#EA580C] pl-3 py-0.5">
                "{selectedDistrict.tagline}"
              </p>
            )}

            {/* Status Selection Cards (Clean 3-Way Selector) */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                ভ্রমণ স্থিতি নির্বাচন করুন
              </label>

              <div className="grid grid-cols-3 gap-2">
                {/* 1. Visited */}
                <button
                  id="status-btn-visited"
                  onClick={() => handleStatusChange('visited')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    currentStatus === 'visited'
                      ? 'bg-[#EA580C] border-[#EA580C] text-white shadow-lg shadow-[#EA580C]/25'
                      : 'bg-white/5 border-white/10 text-stone-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className={`w-5 h-5 ${currentStatus === 'visited' ? 'text-white' : 'text-stone-400'}`} />
                  <span className="text-xs font-bold leading-tight">ভ্রমণ করেছি</span>
                </button>

                {/* 2. Wishlist */}
                <button
                  id="status-btn-wishlist"
                  onClick={() => handleStatusChange('want_to_visit')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    currentStatus === 'want_to_visit'
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-lg shadow-amber-500/20'
                      : 'bg-white/5 border-white/10 text-stone-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${currentStatus === 'want_to_visit' ? 'text-amber-400 fill-amber-400' : 'text-stone-400'}`} />
                  <span className="text-xs font-bold leading-tight">ইচ্ছাতালিকা</span>
                </button>

                {/* 3. Not Visited */}
                <button
                  id="status-btn-not-visited"
                  onClick={() => handleStatusChange('not_visited')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    currentStatus === 'not_visited'
                      ? 'bg-white/15 border-white/30 text-white shadow-md'
                      : 'bg-white/5 border-white/10 text-stone-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full border border-stone-500 flex items-center justify-center text-[10px] text-stone-400">
                    ✕
                  </span>
                  <span className="text-xs font-bold leading-tight">বাকি আছে</span>
                </button>
              </div>
            </div>

            {/* Rating & Photo Counter Bar */}
            {currentStatus === 'visited' && (
              <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <span className="block text-[11px] font-bold text-stone-400">ভ্রমণ রেটিং</span>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => updateDistrictRating(districtId, star)}
                        className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        aria-label={`${star} star`}
                      >
                        <Star className={`w-4 h-4 ${star <= rating ? 'fill-amber-400' : 'text-white/20'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-right border-l border-white/10 pl-3">
                  <span className="block text-[11px] font-bold text-stone-400">সংরক্ষিত ছবি</span>
                  <span className="text-xs font-bold text-white flex items-center justify-end gap-1 mt-1">
                    <Camera className="w-3.5 h-3.5 text-[#EA580C]" />
                    {totalPhotos}টি ছবি
                  </span>
                </div>
              </div>
            )}

            {/* Quick Journal / Open Memory Page Button */}
            <div className="pt-2">
              <button
                id="open-journal-page-btn"
                onClick={() => openDistrictJournal(districtId)}
                className="w-full py-3 bg-[#EA580C] hover:bg-[#c2410c] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#EA580C]/25 transition-all cursor-pointer hover:scale-[1.01]"
              >
                <Camera className="w-4 h-4" />
                <span>ফটো অ্যালবাম ও ভ্রমণ ডায়েরি</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Confirm Reset Status Dialog */}
        {confirmUnvisitOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-body">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm bg-[#12141A] border border-white/20 p-5 rounded-3xl space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-2.5 text-amber-400">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h4 className="text-sm font-bold text-white">ভ্রমণ স্থিতি পরিবর্তন করবেন?</h4>
              </div>
              <p className="text-xs text-stone-300 font-light leading-relaxed">
                {selectedDistrict.bn_name} জেলাকে 'বাকি আছে' হিসেবে চিহ্নিত করবেন?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setConfirmUnvisitOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-stone-400 hover:text-white cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleConfirmUnvisit}
                  className="px-4 py-2 text-xs font-bold bg-[#EA580C] hover:bg-[#c2410c] text-white rounded-xl cursor-pointer"
                >
                  হ্যাঁ, পরিবর্তন করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
