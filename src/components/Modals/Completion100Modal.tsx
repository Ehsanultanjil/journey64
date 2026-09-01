import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Completion100Modal: React.FC = () => {
  const { show100PercentModal, close100PercentModal, profile } = useApp();

  if (!show100PercentModal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-80 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md font-body">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 25 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          className="relative w-full max-w-md bg-[#0F1218] text-white border border-white/15 p-6 sm:p-8 rounded-3xl shadow-2xl text-center space-y-5 overflow-hidden"
        >
          <button
            onClick={close100PercentModal}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Trophy Icon */}
          <div className="w-16 h-16 rounded-2xl bg-[#EA580C] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#EA580C]/30 text-3xl font-bold">
            🏆
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C]">
              ঐতিহাসিক মাইলফলক অর্জিত!
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mt-1">
              সম্পূর্ণ বাংলাদেশ ভ্রমণ সম্পন্ন!
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 font-light mt-3 leading-relaxed">
              অভিনন্দন <strong className="text-white font-bold">{profile.name || 'ভ্রমণকারী'}</strong>! আপনি বাংলাদেশের ৮টি বিভাগের সকল{' '}
              <strong className="text-[#EA580C] font-bold">৬৪টি জেলা</strong> সফলভাবে ভ্রমণ ও নথিভুক্ত করেছেন।
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-light text-stone-300">
            🇧🇩 প্রতিটি নদী, পাহাড়, বনভূমি, উপকূল এবং প্রত্নতাত্ত্বিক স্মৃতি এখন আপনার জাতীয় ভ্রমণ ডায়েরিতে অমর হয়ে রইল।
          </div>

          <button
            onClick={close100PercentModal}
            className="w-full py-3.5 px-6 bg-[#EA580C] hover:bg-[#c2410c] text-white font-bold text-xs rounded-2xl shadow-lg shadow-[#EA580C]/25 transition-all cursor-pointer hover:scale-[1.01]"
          >
            আমার সম্পূর্ণ মানচিত্র দেখুন
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
