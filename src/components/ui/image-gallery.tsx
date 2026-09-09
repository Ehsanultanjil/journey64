'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useInView } from 'framer-motion';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export interface GalleryPhotoItem {
  id?: string;
  url: string;
  caption?: string;
  placeName?: string;
  isCover?: boolean;
  ratio?: number;
}

interface ImageGalleryProps {
  photos?: GalleryPhotoItem[];
  onPhotoClick?: (photo: GalleryPhotoItem, index: number) => void;
  className?: string;
}

// Curated high-quality travel & landscape images for fallback / demo
const DEMO_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', isPortrait: false, alt: 'Tropical Beach' },
  { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80', isPortrait: true, alt: 'Foggy Forest Mountain' },
  { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', isPortrait: false, alt: 'Rocky Mountain Peak' },
  { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', isPortrait: false, alt: 'Yosemite Valley Stream' },
  { url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80', isPortrait: true, alt: 'Starry Night Mountains' },
  { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80', isPortrait: false, alt: 'Scenic Lake View' },
  { url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=800&q=80', isPortrait: true, alt: 'Cascading Waterfall Bridge' },
  { url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80', isPortrait: false, alt: 'Green Valley Sunrise' },
  { url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=800&q=80', isPortrait: true, alt: 'Mountain Pine Forest' },
  { url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80', isPortrait: true, alt: 'Sunlight Through Forest Trees' },
  { url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80', isPortrait: false, alt: 'Lush Pine Woods' },
  { url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80', isPortrait: false, alt: 'Deep Woodland Path' },
];

export function ImageGallery({ photos, onPhotoClick, className }: ImageGalleryProps) {
  // If user provided real photos, divide them into 3 masonry columns
  if (photos && photos.length > 0) {
    const columns: GalleryPhotoItem[][] = [[], [], []];
    photos.forEach((photo, idx) => {
      columns[idx % 3].push(photo);
    });

    return (
      <div className={cn('relative w-full py-4', className)}>
        <div className="mx-auto grid w-full gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {columns.map((colPhotos, colIdx) => (
            <div key={colIdx} className="grid gap-4 sm:gap-6">
              {colPhotos.map((photo, photoIdx) => {
                // Determine ratio: if user provided ratio use it, else alternate elegantly
                const isPortrait = photo.ratio ? photo.ratio < 1 : ((colIdx + photoIdx) % 2 === 1);
                const ratio = photo.ratio || (isPortrait ? 3 / 4 : 4 / 3);
                const globalIndex = photos.findIndex((p) => p.id === photo.id);

                return (
                  <div
                    key={photo.id || `${colIdx}-${photoIdx}`}
                    onClick={() => onPhotoClick?.(photo, globalIndex >= 0 ? globalIndex : photoIdx)}
                    className="group cursor-pointer relative"
                  >
                    <AnimatedImage
                      alt={photo.caption || photo.placeName || `Photo ${photoIdx + 1}`}
                      src={photo.url}
                      ratio={ratio}
                      className="border border-white/10 hover:border-emerald-500/50 shadow-md group-hover:shadow-emerald-500/10 transition-all duration-300 rounded-2xl overflow-hidden"
                    />
                    {photo.isCover && (
                      <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-[#004526] text-white shadow-md backdrop-blur-md border border-emerald-400/40">
                          কভার ছবি
                        </span>
                      </div>
                    )}
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white rounded-b-2xl pointer-events-none">
                        <p className="text-xs font-medium text-stone-200 truncate">
                          {photo.caption}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default demo implementation with 3 columns
  return (
    <div className={cn('relative flex min-h-screen w-full flex-col items-center justify-center py-10 px-4', className)}>
      <div className="mx-auto grid w-full max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, col) => (
          <div key={col} className="grid gap-6">
            {Array.from({ length: 4 }).map((_, index) => {
              const itemIdx = (col * 4 + index) % DEMO_IMAGES.length;
              const demo = DEMO_IMAGES[itemIdx];
              const ratio = demo.isPortrait ? 9 / 16 : 16 / 9;
              const width = demo.isPortrait ? 1080 : 1920;
              const height = demo.isPortrait ? 1920 : 1080;

              return (
                <AnimatedImage
                  key={`${col}-${index}`}
                  alt={demo.alt || `Image ${col}-${index}`}
                  src={demo.url}
                  ratio={ratio}
                  placeholder={`https://placehold.co/${width}x${height}/0E1015/FFF?text=Loading...`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

interface AnimatedImageProps {
  alt: string;
  src: string;
  className?: string;
  placeholder?: string;
  ratio: number;
}

export function AnimatedImage({ alt, src, ratio, placeholder, className }: AnimatedImageProps) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  const [isLoading, setIsLoading] = React.useState(true);

  const [imgSrc, setImgSrc] = React.useState(src);

  const handleError = () => {
    if (placeholder) {
      setImgSrc(placeholder);
    }
  };

  return (
    <AspectRatio
      ref={ref}
      ratio={ratio}
      className={cn('bg-accent relative size-full rounded-2xl border overflow-hidden bg-[#12151C] border-white/10', className)}
    >
      <img
        alt={alt}
        src={imgSrc}
        className={cn(
          'size-full rounded-2xl object-cover opacity-0 transition-all duration-1000 ease-in-out',
          {
            'opacity-100': isInView && !isLoading,
          },
        )}
        onLoad={() => setIsLoading(false)}
        loading="lazy"
        onError={handleError}
      />
    </AspectRatio>
  );
}
