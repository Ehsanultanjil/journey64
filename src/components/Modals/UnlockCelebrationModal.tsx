import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MapPin, Camera, X, ArrowRight, CheckCircle2 } from 'lucide-react';
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
      <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          className="relative w-full max-w-sm bg-[#0e0e0e] text-white border border-[#F27D26] p-6 sm:p-8 shadow-2xl text-center space-y-5 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={closeUnlockModal}
            className="absolute top-4 right-4 p-1.5 text-white/40 hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon Badge */}
          <div className="w-16 h-16 bg-[#F27D26] flex items-center justify-center mx-auto text-white shadow-lg">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <span className="font-body font-black text-[9px] uppercase tracking-[0.3em] text-[#F27D26]">
              TERRITORY UNLOCKED
            </span>
            <h3 className="font-display text-3xl uppercase tracking-wide mt-1 text-white flex items-center justify-center gap-2">
              {district.name}
              <span className="font-body text-sm font-normal text-white/50">
                ({district.bn_name})
              </span>
            </h3>
            <p className="font-body text-xs text-stone-400 font-light mt-0.5">
              {district.division} DIVISION
            </p>
          </div>

          {/* Footprint tally card */}
          <div className="bg-white/5 border border-white/10 p-4 space-y-1">
            <p className="font-body font-black text-[9px] uppercase tracking-[0.2em] text-white/50">
              NATIONAL EXPEDITION PROGRESS
            </p>
            <p className="font-display text-2xl text-[#F27D26]">
              {totalVisited} OF 64 DISTRICTS ({percentage}%)
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => {
                closeUnlockModal();
                openDistrictJournal(district.id);
              }}
              className="w-full py-3 px-4 bg-[#F27D26] hover:bg-[#d96c1e] text-white font-body font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              RECORD MEMORIES & PHOTOS
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={closeUnlockModal}
              className="w-full py-2.5 text-xs font-body font-bold uppercase tracking-wider text-stone-400 hover:text-white cursor-pointer"
            >
              CONTINUE EXPLORING MAP
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
