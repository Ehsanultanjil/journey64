import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PhotoLightbox: React.FC = () => {
  const { lightbox, closeLightbox, setLightboxIndex } = useApp();
  const [slideDirection, setSlideDirection] = useState<number>(0);

  // Swipe handling for background touch
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const dragHandledRef = useRef<boolean>(false);

  const totalPhotos = lightbox.photos.length;
  const currentIndex = lightbox.currentIndex;
  const hasMultiple = totalPhotos > 1;

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSlideDirection(-1);
      setLightboxIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalPhotos - 1) {
      setSlideDirection(1);
      setLightboxIndex(currentIndex + 1);
    }
  };

  useEffect(() => {
    if (!lightbox.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox.isOpen, currentIndex, totalPhotos]);

  if (!lightbox.isOpen || totalPhotos === 0) return null;

  const currentPhoto = lightbox.photos[currentIndex];
  if (!currentPhoto) return null;

  // Background touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragHandledRef.current) {
      dragHandledRef.current = false;
      return;
    }
    if (touchStartX.current === null) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - endX;
    const diffY = touchStartY.current !== null ? Math.abs(touchStartY.current - endY) : 0;

    // Must be predominantly horizontal and at least 45px
    if (Math.abs(diffX) > 45 && Math.abs(diffX) > diffY) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-80 bg-black/95 flex flex-col justify-between p-3 sm:p-6 backdrop-blur-md select-none touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between text-white z-20 shrink-0">
          <div>
            <h4 className="text-sm sm:text-base font-bold tracking-tight">
              {lightbox.districtName || 'ভ্রমণের স্মৃতি'}
            </h4>
            <p className="text-xs text-stone-400">
              {currentIndex + 1} / {totalPhotos}
            </p>
          </div>

          <button
            onClick={closeLightbox}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close Lightbox"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Main Photo Stage with Swipe Gesture */}
        <div className="relative flex-1 flex items-center justify-center p-2 min-h-0 overflow-hidden">
          {/* Previous Button (Desktop / Tablet) */}
          {hasMultiple && currentIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white z-30 backdrop-blur-xs transition-colors cursor-pointer hover:scale-105"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Interactive draggable / swipeable image */}
          <AnimatePresence initial={false} mode="wait">
            <motion.img
              key={currentPhoto.id}
              src={currentPhoto.url}
              alt={currentPhoto.caption || 'ভ্রমণের স্মৃতি'}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.35}
              onDragEnd={(_e, info) => {
                dragHandledRef.current = true;
                const threshold = 45;
                const velocityThreshold = 250;
                if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
                  handleNext();
                } else if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
                  handlePrev();
                }
              }}
              initial={{
                opacity: 0,
                x: slideDirection > 0 ? 80 : slideDirection < 0 ? -80 : 0,
                scale: 0.96,
              }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{
                opacity: 0,
                x: slideDirection > 0 ? -80 : slideDirection < 0 ? 80 : 0,
                scale: 0.96,
              }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl cursor-grab active:cursor-grabbing pointer-events-auto"
              draggable={false}
            />
          </AnimatePresence>

          {/* Next Button (Desktop / Tablet) */}
          {hasMultiple && currentIndex < totalPhotos - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white z-30 backdrop-blur-xs transition-colors cursor-pointer hover:scale-105"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Bottom Caption & Dots Bar */}
        <div className="text-center space-y-2 max-w-xl mx-auto z-20 shrink-0">
          {currentPhoto.caption && (
            <p className="text-xs sm:text-sm font-light text-stone-200 bg-black/60 px-4 py-2 rounded-xl backdrop-blur-md inline-block border border-white/10">
              "{currentPhoto.caption}"
            </p>
          )}

          {/* Thumbnail Dots Indicator */}
          {hasMultiple && (
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {lightbox.photos.map((p, idx) => (
                <button
                  key={p.id || idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSlideDirection(idx > currentIndex ? 1 : -1);
                    setLightboxIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex
                      ? 'w-6 bg-emerald-400'
                      : 'w-1.5 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`ছবি ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
};
