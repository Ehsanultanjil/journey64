import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Calendar,
  Camera,
  Heart,
  Star,
  Trash2,
  Edit3,
  Plus,
  Image as ImageIcon,
  Check,
  X,
  Compass,
  Maximize2,
  Bookmark,
  Sparkles,
  Save,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getDistrictById } from '../../data/districts';
import { Photo } from '../../types';
import { compressImage } from '../../lib/storage';

interface Props {
  districtId: string;
  onBack: () => void;
}

export const DistrictMemoryPage: React.FC<Props> = ({ districtId, onBack }) => {
  const {
    userData,
    visits,
    updateDistrictNotes,
    updateDistrictRating,
    toggleDistrictFavorite,
    addPhoto,
    updatePhoto,
    deletePhoto,
    openLightbox,
  } = useApp();

  const district = getDistrictById(districtId);
  const districtData = userData[districtId];
  const districtVisits = visits.filter((v) => v.districtId === districtId);

  const activeVisit = districtVisits[0] || null;

  const [notesDraft, setNotesDraft] = useState(
    activeVisit?.notes || districtData?.notes || ''
  );
  const [visitDateDraft, setVisitDateDraft] = useState(
    activeVisit?.visitDate || districtData?.firstVisitedDate || new Date().toISOString().split('T')[0]
  );
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [captionDraft, setCaptionDraft] = useState('');
  const [deletePhotoConfirmId, setDeletePhotoConfirmId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!district) return null;

  const isFavorite = !!districtData?.isFavorite;
  const rating = districtData?.rating || 5;

  useEffect(() => {
    if (activeVisit?.visitDate) {
      setVisitDateDraft(activeVisit.visitDate);
    } else if (districtData?.firstVisitedDate) {
      setVisitDateDraft(districtData.firstVisitedDate);
    }
  }, [activeVisit?.visitDate, districtData?.firstVisitedDate]);

  // Aggregate all photos for this district
  const photos: Photo[] = (activeVisit?.photos || []).sort(
    (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
  );
  const totalPhotos = photos.length;
  const coverPhoto = photos.find((p) => p.isCover) || photos[0];

  // Handle Photo upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (totalPhotos + files.length > 5) {
      alert('সর্বোচ্চ ৫টি ছবি আপলোড করা যাবে।');
      return;
    }

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedBase64 = await compressImage(file, 1600, 1600, 0.85);

        addPhoto(districtId, {
          url: compressedBase64,
          caption: '',
          isCover: totalPhotos === 0 && i === 0,
          takenDate: visitDateDraft || new Date().toISOString().split('T')[0],
        });
      }
    } catch (err) {
      console.error('Photo upload failed:', err);
      alert('ছবি আপলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveNotes = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateDistrictNotes(districtId, notesDraft, visitDateDraft);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2000);
  };

  const handleSaveCaption = (photoId: string) => {
    updatePhoto(photoId, { caption: captionDraft.trim() });
    setEditingCaptionId(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200 font-body">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
        <button
          id="journal-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#12141A] border border-white/15 text-white hover:bg-[#1A1E26] rounded-full transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>মানচিত্রে ফিরুন</span>
        </button>

        {/* Favorite & Rating in Header */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#12141A] border border-white/15 px-3 py-1.5 rounded-full shadow-sm">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => updateDistrictRating(districtId, star)}
                className="p-0.5 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  className={`w-4 h-4 ${
                    star <= rating ? 'fill-amber-400 text-amber-400' : 'text-white/20'
                  }`}
                />
              </button>
            ))}
          </div>

          <button
            id="journal-fav-btn"
            onClick={() => toggleDistrictFavorite(districtId)}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              isFavorite
                ? 'bg-[#059669] border-[#059669] text-white shadow-md scale-105'
                : 'bg-[#12141A] border-white/15 text-stone-400 hover:text-[#059669]'
            }`}
            aria-label="পছন্দের তালিকা"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
          </button>
        </div>
      </div>

      {/* Hero Cover Showcase Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#12141A] border border-white/15 shadow-xl">
        {coverPhoto ? (
          <div className="relative h-60 sm:h-80 md:h-96 w-full">
            <img
              src={coverPhoto.url}
              alt={district.name}
              className="w-full h-full object-cover filter brightness-95 cursor-pointer hover:scale-[1.01] transition-transform duration-500"
              onClick={() => openLightbox(photos, 0, district.name)}
            />
            <button
              onClick={() => openLightbox(photos, 0, district.name)}
              className="absolute top-4 right-4 p-2.5 bg-black/60 hover:bg-black/90 backdrop-blur-md rounded-full text-white transition-colors cursor-pointer shadow-md"
              aria-label="পূর্ণস্ক্রিন দেখুন"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="h-60 sm:h-72 w-full bg-gradient-to-br from-[#0B1A13] via-[#12141A] to-[#0A0C10] flex flex-col items-center justify-center p-8 text-center">
            <Compass className="w-14 h-14 text-[#059669]/40 mb-3" />
            <p className="text-sm text-stone-300 font-medium">
              {district.bn_name} জেলার ছবি ও স্মৃতিকথা সংরক্ষণ করুন
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-full flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>ছবি আপলোড করুন</span>
            </button>
          </div>
        )}

        {/* Hero Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/70 to-transparent">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-[#059669] text-white shadow-xs">
              {district.division} বিভাগ
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/15 backdrop-blur-md text-stone-200">
              {totalPhotos} / ৫টি ছবি
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white flex items-baseline gap-3">
            {district.bn_name}
            <span className="font-sans text-base sm:text-2xl font-normal text-stone-300">
              ({district.name})
            </span>
          </h1>

          {district.tagline && (
            <p className="text-xs sm:text-sm text-stone-300 font-light mt-1.5 italic max-w-xl">
              "{district.tagline}"
            </p>
          )}
        </div>
      </div>

      {/* Main Grid: Left Side Photos, Right Side Travel Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Photo Gallery & Upload Section (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#059669]" />
                ফটো অ্যালবাম
              </h2>
              <p className="text-xs text-stone-400">
                এই জেলার সেরা স্মৃতি ছবি ({totalPhotos} / ৫)
              </p>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              multiple
              className="hidden"
            />

            {totalPhotos < 5 && (
              <button
                id="upload-photo-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>ছবি যোগ করুন</span>
              </button>
            )}
          </div>

          {/* Photo Grid */}
          {totalPhotos === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 hover:border-[#059669] p-8 rounded-3xl text-center cursor-pointer transition-colors bg-[#12141A]/90 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#059669]/20 transition-colors">
                <ImageIcon className="w-6 h-6 text-[#059669]" />
              </div>
              <h4 className="text-sm font-bold text-white">
                ছবি নির্বাচন করুন
              </h4>
              <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto font-light">
                আপনার ভ্রমণের ৩–৫টি ছবি আপলোড করুন। এখানে ক্লিক করে ছবি নির্বাচন করুন।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((photo, index) => {
                const isCover = photo.isCover || index === 0;
                return (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`group relative overflow-hidden rounded-2xl bg-[#161A22] border border-white/15 shadow-sm aspect-square ${
                      index === 0 ? 'col-span-2 aspect-video' : ''
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || `${district.name} memory #${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                      onClick={() => openLightbox(photos, index, district.name)}
                    />

                    {/* Cover Badge */}
                    {isCover && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#059669] text-white shadow-xs">
                          কভার
                        </span>
                      </div>
                    )}

                    {/* Actions Overlay */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-md p-1 rounded-lg">
                      {!isCover && (
                        <button
                          onClick={() => updatePhoto(photo.id, { isCover: true })}
                          title="কভার ছবি করুন"
                          className="p-1.5 text-stone-300 hover:text-white hover:bg-white/20 rounded cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingCaptionId(photo.id);
                          setCaptionDraft(photo.caption || '');
                        }}
                        title="ক্যাপশন এডিট"
                        className="p-1.5 text-stone-300 hover:text-white hover:bg-white/20 rounded cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletePhotoConfirmId(photo.id)}
                        title="ছবি মুছুন"
                        className="p-1.5 text-rose-300 hover:text-white hover:bg-rose-600 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Caption on Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
                      {editingCaptionId === photo.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={captionDraft}
                            onChange={(e) => setCaptionDraft(e.target.value)}
                            placeholder="ক্যাপশন লিখুন..."
                            className="flex-1 px-2 py-1 text-xs bg-black/70 border border-white/30 rounded text-white focus:outline-none focus:border-[#059669]"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveCaption(photo.id);
                              if (e.key === 'Escape') setEditingCaptionId(null);
                            }}
                          />
                          <button
                            onClick={() => handleSaveCaption(photo.id)}
                            className="p-1 bg-[#059669] text-white rounded cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingCaptionId(null)}
                            className="p-1 bg-white/20 text-white rounded cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <p
                          onClick={() => {
                            setEditingCaptionId(photo.id);
                            setCaptionDraft(photo.caption || '');
                          }}
                          className="text-[11px] text-stone-200 truncate cursor-pointer hover:text-white"
                        >
                          {photo.caption || '+ ক্যাপশন যোগ করুন'}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Travel Story & Notes Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#12141A]/90 border border-white/15 p-5 sm:p-6 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#059669]" />
                ভ্রমণকাহিনী ও ডায়েরি
              </h3>
            </div>

            <form onSubmit={handleSaveNotes} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#059669]" />
                  ভ্রমণের তারিখ
                </label>
                <input
                  type="date"
                  value={visitDateDraft}
                  onChange={(e) => setVisitDateDraft(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#059669] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  স্মৃতিকথা ও অভিজ্ঞতা
                </label>
                <textarea
                  rows={6}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder={`${district.bn_name} ভ্রমণের অনুভূতি, সেরা দর্শনীয় স্থান, স্মৃতিচিহ্ন ও খাবারের অভিজ্ঞতা লিখে রাখুন...`}
                  className="w-full p-3.5 text-xs bg-white/5 border border-white/15 rounded-2xl text-white placeholder-stone-500 focus:outline-none focus:border-[#059669] transition-colors resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                {isSavedToast ? (
                  <span className="text-xs font-bold text-[#059669] flex items-center gap-1.5 animate-in fade-in">
                    <Check className="w-4 h-4" /> সংরক্ষিত হয়েছে
                  </span>
                ) : (
                  <span className="text-[11px] text-stone-500">
                    অটো-সিঙ্ক প্রস্তুত
                  </span>
                )}

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Photo Confirmation Modal */}
      {deletePhotoConfirmId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-[#12141A] border border-white/20 p-5 rounded-3xl space-y-3 font-body shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white">
              এই ছবিটি মুছে ফেলতে চান?
            </h3>
            <p className="text-xs text-stone-300">
              ছবিটি {district.bn_name} অ্যালবাম থেকে সরিয়ে ফেলা হবে।
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletePhotoConfirmId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-stone-400 hover:text-white cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  deletePhoto(deletePhotoConfirmId);
                  setDeletePhotoConfirmId(null);
                }}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs cursor-pointer"
              >
                মুছে ফেলুন
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
