import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Award, Sparkles, X, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Completion100Modal: React.FC = () => {
  const { show100PercentModal, close100PercentModal, profile } = useApp();

  if (!show100PercentModal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative w-full max-w-md bg-[#0e0e0e] text-white border-2 border-[#F27D26] p-8 sm:p-10 shadow-2xl text-center space-y-6 overflow-hidden"
        >
          <button
            onClick={close100PercentModal}
            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Trophy Icon */}
          <div className="w-20 h-20 bg-[#F27D26] text-white flex items-center justify-center mx-auto shadow-xl text-3xl font-black">
            🏆
          </div>

          <div>
            <span className="font-body font-black text-[10px] uppercase tracking-[0.3em] text-[#F27D26]">
              LEGENDARY EXPEDITION MILESTONE
            </span>
            <h2 className="font-display text-4xl uppercase tracking-tight text-white mt-2">
              BANGLADESH COMPLETED
            </h2>
            <p className="font-body text-xs sm:text-sm text-stone-300 font-light mt-3 leading-relaxed">
              Honor to <strong className="text-white font-bold">{profile.name || 'Traveler'}</strong>! You have successfully documented and traversed all{' '}
              <strong className="text-[#F27D26] font-bold">64 districts</strong> across all 8 administrative divisions of Bangladesh.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 text-xs font-body font-light text-stone-300">
            🇧🇩 Every river delta, eastern hill tract, mangrove canopy, coastal expanse, and ancient heritage site is now permanently inscribed into your master journal.
          </div>

          <button
            onClick={close100PercentModal}
            className="w-full py-3.5 px-6 bg-[#F27D26] hover:bg-[#d96c1e] text-white font-body font-black uppercase tracking-[0.2em] text-xs transition-colors cursor-pointer"
          >
            ADMIRE MY COMPLETED MAP
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
