import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const UnlockCelebrationModal: React.FC = () => {
  const {
    unlockModalData,
    closeUnlockModal,
  } = useApp();

  // Auto-dismiss after 2.6 seconds of joyful celebration animation
  useEffect(() => {
    if (!unlockModalData) return;
    const timer = setTimeout(() => {
      closeUnlockModal();
    }, 2600);
    return () => clearTimeout(timer);
  }, [unlockModalData, closeUnlockModal]);

  if (!unlockModalData) return null;

  const { district, totalVisited, percentage } = unlockModalData;

  return (
    <AnimatePresence>
      <div
        onClick={closeUnlockModal}
        className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md font-body cursor-pointer select-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: -20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 350 }}
          className="relative w-full max-w-xs sm:max-w-sm bg-gradient-to-b from-[#131A1F] via-[#0F1419] to-[#0A0D12] text-white border border-[#059669]/40 p-6 sm:p-8 rounded-[32px] shadow-2xl shadow-[#059669]/20 text-center space-y-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Radial Ambient Glow Background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#059669]/25 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Animated Joyful Icon Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: [0, 1.2, 1], rotate: [0, -10, 10, 0] }}
            transition={{ type: 'spring', damping: 14, stiffness: 300, delay: 0.1 }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#047857] to-[#10B981] flex items-center justify-center mx-auto text-white shadow-xl shadow-[#059669]/40"
          >
            <Sparkles className="w-9 h-9 sm:w-11 sm:h-11 animate-pulse" />
          </motion.div>

          {/* Text & District Details */}
          <div className="space-y-1">
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[11px] font-bold uppercase tracking-widest text-[#10B981] flex items-center justify-center gap-1.5"
            >
              <span>✨</span>
              <span>নতুন জেলা ভ্রমণ সম্পন্ন!</span>
              <span>✨</span>
            </motion.span>

            <motion.h3
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25, type: 'spring' }}
              className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-baseline justify-center gap-2 pt-1"
            >
              {district.bn_name}
              <span className="font-sans text-sm sm:text-base font-normal text-stone-300">
                ({district.name})
              </span>
            </motion.h3>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs text-stone-300 font-light flex items-center justify-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5 text-[#059669]" />
              <span>{district.division} বিভাগ</span>
            </motion.p>
          </div>

          {/* Progress Pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl inline-block"
          >
            <p className="font-display text-lg sm:text-xl font-bold text-[#10B981]">
              ৬৪ জেলার মধ্যে {totalVisited}টি ({percentage}%)
            </p>
          </motion.div>

          {/* Animated Auto-Progress Bar Indicator */}
          <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-3">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.5, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-[#059669] to-[#10B981]"
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
