import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Sparkles,
  Save,
  MapPin,
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

  // View vs Edit Mode state
  const [isEditing, setIsEditing] = useState(false);

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
    if (activeVisit?.notes || districtData?.notes) {
      setNotesDraft(activeVisit?.notes || districtData?.notes || '');
    }
  }, [activeVisit?.visitDate, districtData?.firstVisitedDate, activeVisit?.notes, districtData?.notes]);

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
        const compressedBase64 = await compressImage(file, 1080, 1080, 0.75);

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

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateDistrictNotes(districtId, notesDraft, visitDateDraft);
    setIsSavedToast(true);
    setTimeout(() => {
      setIsSavedToast(false);
      setIsEditing(false);
    }, 400);
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
          className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-bold bg-[#12141A] border border-white/15 text-white hover:bg-[#1A1E26] rounded-full transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>মানচিত্রে ফিরুন</span>
        </button>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-2">
          {/* Star Rating */}
          <div className="flex items-center gap-1 bg-[#12141A] border border-white/15 px-3 py-1.5 rounded-full shadow-sm">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => updateDistrictRating(districtId, star)}
                className="p-0.5 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${
                    star <= rating ? 'fill-amber-400 text-amber-400' : 'text-white/20'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Favorite Button */}
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

          {/* Small Edit Button at Top */}
          <button
            id="journal-edit-mode-btn"
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              isEditing
                ? 'bg-stone-700 hover:bg-stone-600 text-white'
                : 'bg-[#059669] hover:bg-[#047857] text-white shadow-md'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'প্রিভিউ দেখুন' : 'এডিট করুন'}</span>
          </button>
        </div>
      </div>

      {/* Sleek Luminous Cover Card with Direct Minimalist Text */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#12141A] border border-white/15 shadow-2xl p-4 sm:p-7 space-y-2.5 sm:space-y-3.5">
        {/* Background Cover Photo with Vibrant Glass Blur - NOT Dark */}
        {coverPhoto ? (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src={coverPhoto.url}
              alt={district.name}
              className="w-full h-full object-cover filter blur-md scale-110 brightness-[0.88] contrast-[1.04]"
            />
            {/* Soft Ambient Overlay */}
            <div className="absolute inset-0 bg-[#0A0C10]/50 backdrop-blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10]/80 via-transparent to-black/20" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0B1A13] via-[#12141A] to-[#0A0C10]" />
        )}

        {/* Content directly on Cover: District Name, Division, Date & User Notes */}
        <div className="relative z-10 space-y-2 sm:space-y-2.5">
          {/* Top Badges: Division, Photo Count, and Date */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-[#059669] text-white shadow-xs">
              {district.division} বিভাগ
            </span>
            <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-black/40 backdrop-blur-md text-stone-200 border border-white/15">
              {totalPhotos}টি ছবি
            </span>

            {/* Visit Date Pill */}
            {visitDateDraft && (
              <span className="px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-black/40 backdrop-blur-md text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-emerald-400" />
                <span>
                  {new Date(visitDateDraft).toLocaleDateString('bn-BD', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </span>
            )}
          </div>

          {/* District Name Headline */}
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white flex items-baseline gap-2.5 drop-shadow-md">
            {district.bn_name}
            <span className="font-sans text-base sm:text-xl font-normal text-stone-200">
              ({district.name})
            </span>
          </h1>

          {/* Tagline if available */}
          {district.tagline && (
            <p className="text-xs sm:text-sm text-stone-200 font-light italic max-w-xl drop-shadow-xs">
              "{district.tagline}"
            </p>
          )}

          {/* User's Note / Story: ONLY rendered if user wrote notes */}
          {notesDraft.trim().length > 0 && (
            <p className="font-body text-xs sm:text-sm text-stone-100 leading-relaxed font-light whitespace-pre-line pt-1 drop-shadow-xs max-w-2xl">
              "{notesDraft}"
            </p>
          )}

          {/* Famous Spots */}
          {district.famousSpots && district.famousSpots.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-stone-300 pt-1.5 border-t border-white/10 flex-wrap">
              <MapPin className="w-3 h-3 text-[#059669] shrink-0" />
              <span>দর্শনীয় স্থান: {district.famousSpots.slice(0, 3).join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* ================= EDIT MODE ================= */}
      {isEditing ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#12141A]/95 border border-[#059669]/40 p-5 sm:p-8 rounded-3xl space-y-6 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#059669]/20 text-[#059669] flex items-center justify-center">
                <Edit3 className="w-4 h-4" />
              </div>
              <h2 className="font-display text-xl font-bold text-white">
                স্মৃতি ও তথ্য পরিবর্তন করুন
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {isSavedToast && (
                <span className="text-xs font-bold text-[#059669] flex items-center gap-1.5 animate-in fade-in">
                  <Check className="w-4 h-4" /> সেভ হয়েছে
                </span>
              )}

              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSaveAll}
                className="px-5 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>পরিবর্তন সেভ করুন</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveAll} className="space-y-6">
            {/* 1. Date Input */}
            <div className="max-w-xs">
              <label className="block text-xs font-bold text-stone-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#059669]" />
                কবে গিয়েছিলেন?
              </label>
              <input
                type="date"
                value={visitDateDraft}
                onChange={(e) => setVisitDateDraft(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#059669] transition-colors"
              />
            </div>

            {/* 2. Story / Description Textarea */}
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5">
                ভ্রমণের অভিজ্ঞতা, বিবরণ ও অনুভূতি
              </label>
              <textarea
                rows={5}
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder={`${district.bn_name} ভ্রমণের গল্প, সুন্দর জায়গা আর ভালো লাগার মুহূর্তগুলো লিখে রাখুন...`}
                className="w-full p-3.5 text-xs bg-white/5 border border-white/15 rounded-2xl text-white placeholder-stone-500 focus:outline-none focus:border-[#059669] transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* 3. Photo Upload & Management under Edit Page */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#059669]" />
                    ছবি ব্যবস্থাপনা ({totalPhotos} / ৫)
                  </h3>
                  <p className="text-xs text-stone-400 font-light">
                    নতুন ছবি যোগ করুন অথবা আগের ছবি এডিট/মুছে ফেলুন
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
                    type="button"
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

              {/* Photo Edit Grid */}
              {totalPhotos === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 hover:border-[#059669] p-8 rounded-2xl text-center cursor-pointer transition-colors bg-white/5 group"
                >
                  <ImageIcon className="w-8 h-8 text-[#059669] mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-white">ছবি আপলোড করুন</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    ক্লিক করে এই জেলায় ঘোরার ছবি যোগ করুন (সর্বোচ্চ ৫টি)
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {photos.map((photo) => {
                    const isCover = photo.id === coverPhoto?.id;
                    return (
                      <div
                        key={photo.id}
                        className="group relative overflow-hidden rounded-2xl bg-[#161A22] border border-white/15 aspect-square"
                      >
                        <img
                          src={photo.url}
                          alt={photo.caption || 'District photo'}
                          className="w-full h-full object-cover"
                        />

                        {isCover && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-bold rounded bg-[#059669] text-white shadow-xs">
                            কভার ছবি
                          </span>
                        )}

                        {/* Action buttons on thumbnail */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/75 backdrop-blur-md p-1 rounded-lg">
                          {!isCover && (
                            <button
                              type="button"
                              onClick={() => updatePhoto(photo.id, { isCover: true })}
                              title="কভার ছবি করুন"
                              className="p-1 text-stone-300 hover:text-white hover:bg-white/20 rounded cursor-pointer"
                            >
                              <Star className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCaptionId(photo.id);
                              setCaptionDraft(photo.caption || '');
                            }}
                            title="ক্যাপশন লিখুন"
                            className="p-1 text-stone-300 hover:text-white hover:bg-white/20 rounded cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletePhotoConfirmId(photo.id)}
                            title="ছবি মুছুন"
                            className="p-1 text-rose-300 hover:text-white hover:bg-rose-600 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Caption Field */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white">
                          {editingCaptionId === photo.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={captionDraft}
                                onChange={(e) => setCaptionDraft(e.target.value)}
                                placeholder="ক্যাপশন..."
                                className="flex-1 px-1.5 py-0.5 text-[10px] bg-black/80 border border-white/30 rounded text-white focus:outline-none focus:border-[#059669]"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveCaption(photo.id);
                                  if (e.key === 'Escape') setEditingCaptionId(null);
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveCaption(photo.id)}
                                className="p-0.5 bg-[#059669] text-white rounded cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <p
                              onClick={() => {
                                setEditingCaptionId(photo.id);
                                setCaptionDraft(photo.caption || '');
                              }}
                              className="text-[10px] text-stone-200 truncate cursor-pointer hover:text-white"
                            >
                              {photo.caption || '+ ক্যাপশন লিখুন'}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </form>
        </motion.div>
      ) : (
        /* ================= VIEW MODE (Clean Gallery & Story) ================= */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Photo Gallery Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#059669]" />
                স্মৃতির অ্যালবাম ({totalPhotos}টি ছবি)
              </h2>
            </div>

            {totalPhotos === 0 ? (
              <div className="bg-[#12141A]/90 border border-white/10 p-8 rounded-3xl text-center space-y-2">
                <ImageIcon className="w-8 h-8 text-stone-500 mx-auto" />
                <p className="text-xs text-stone-400">এখনও কোনো ছবি আপলোড করা হয়নি।</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {photos.map((photo, index) => {
                  const isCover = photo.id === coverPhoto?.id;
                  return (
                    <motion.div
                      key={photo.id}
                      whileHover={{ scale: 1.02 }}
                      className={`group relative overflow-hidden rounded-2xl bg-[#161A22] border border-white/15 shadow-sm aspect-square cursor-pointer ${
                        isCover ? 'col-span-2 aspect-video' : ''
                      }`}
                      onClick={() => openLightbox(photos, index, district.name)}
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption || `${district.name} photo`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {isCover && (
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#059669] text-white shadow-xs">
                            কভার ছবি
                          </span>
                        </div>
                      )}

                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
                          <p className="text-xs text-stone-200 truncate">{photo.caption}</p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

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
