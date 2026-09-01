import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Camera, X, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const UnlockCelebrationModal: React.FC = () => {
  const {
    unlockModalData,
    closeUnlockModal,
    openDistrictJournal,
  } = useApp();

  if (!unlockModalData) return null;

  const { district, totalVisited, percentage } = unlockModalData;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md font-body">
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 20 }}
          transition={{ type: 'spring', damping: 24, stiffness: 320 }}
          className="relative w-full max-w-sm bg-[#0F1218] text-white border border-white/15 p-6 sm:p-8 rounded-3xl shadow-2xl text-center space-y-5 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={closeUnlockModal}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-[#EA580C] flex items-center justify-center mx-auto text-white shadow-lg shadow-[#EA580C]/30">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C]">
              নতুন জেলা ভ্রমণ চিহ্নিত!
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mt-1 text-white flex items-center justify-center gap-2">
              {district.bn_name}
              <span className="font-sans text-sm font-normal text-stone-300">
                ({district.name})
              </span>
            </h3>
            <p className="text-xs text-stone-400 font-light mt-0.5">
              {district.division} বিভাগ
            </p>
          </div>

          {/* Footprint Progress Card */}
          <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              জাতীয় অভিযাত্রা অগ্রগতি
            </p>
            <p className="font-display text-xl sm:text-2xl font-bold text-[#EA580C]">
              ৬৪ জেলার মধ্যে {totalVisited}টি ({percentage}%)
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={() => {
                closeUnlockModal();
                openDistrictJournal(district.id);
              }}
              className="w-full py-3 px-4 bg-[#EA580C] hover:bg-[#c2410c] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#EA580C]/25 transition-all cursor-pointer hover:scale-[1.01]"
            >
              <Camera className="w-4 h-4" />
              <span>স্মৃতি ও ছবি সংরক্ষণ করুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={closeUnlockModal}
              className="w-full py-2 text-xs font-semibold text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              মানচিত্র অন্বেষণ চালিয়ে যান
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
