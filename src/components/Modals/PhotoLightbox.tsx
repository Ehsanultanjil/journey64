import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PhotoLightbox: React.FC = () => {
  const { lightbox, closeLightbox, setLightboxIndex } = useApp();

  useEffect(() => {
    if (!lightbox.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') {
        if (lightbox.currentIndex > 0) {
          setLightboxIndex(lightbox.currentIndex - 1);
        }
      }
      if (e.key === 'ArrowRight') {
        if (lightbox.currentIndex < lightbox.photos.length - 1) {
          setLightboxIndex(lightbox.currentIndex + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox.isOpen, lightbox.currentIndex, lightbox.photos.length]);

  if (!lightbox.isOpen || lightbox.photos.length === 0) return null;

  const currentPhoto = lightbox.photos[lightbox.currentIndex];
  if (!currentPhoto) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-80 bg-black/95 flex flex-col justify-between p-4 sm:p-6 backdrop-blur-md">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between text-white z-10">
          <div>
            <h4 className="text-sm font-bold tracking-tight">
              {lightbox.districtName || 'Travel Memory'}
            </h4>
            <p className="text-xs text-stone-400">
              {lightbox.currentIndex + 1} of {lightbox.photos.length}
            </p>
          </div>

          <button
            onClick={closeLightbox}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close Lightbox"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Main Photo Stage */}
        <div className="relative flex-1 flex items-center justify-center p-2 min-h-0">
          {/* Previous Button */}
          {lightbox.photos.length > 1 && lightbox.currentIndex > 0 && (
            <button
              onClick={() => setLightboxIndex(lightbox.currentIndex - 1)}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white z-20 backdrop-blur-xs transition-colors"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <motion.img
            key={currentPhoto.id}
            src={currentPhoto.url}
            alt={currentPhoto.caption || 'Travel memory'}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
          />

          {/* Next Button */}
          {lightbox.photos.length > 1 && lightbox.currentIndex < lightbox.photos.length - 1 && (
            <button
              onClick={() => setLightboxIndex(lightbox.currentIndex + 1)}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white z-20 backdrop-blur-xs transition-colors"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Bottom Caption Bar */}
        <div className="text-center max-w-xl mx-auto z-10">
          {currentPhoto.caption && (
            <p className="text-sm font-editorial italic text-stone-200 bg-black/50 px-4 py-2 rounded-xl backdrop-blur-md inline-block">
              "{currentPhoto.caption}"
            </p>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
};
