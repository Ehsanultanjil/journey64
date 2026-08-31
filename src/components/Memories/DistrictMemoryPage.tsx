import React, { useState, useRef } from 'react';
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
  Sparkles,
  MapPin,
  Car,
  AlertCircle,
  Maximize2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getDistrictById } from '../../data/districts';
import { Photo, Visit } from '../../types';
import { compressImage } from '../../lib/storage';

interface Props {
  districtId: string;
  onBack: () => void;
}

export const DistrictMemoryPage: React.FC<Props> = ({ districtId, onBack }) => {
  const {
    userData,
    visits,
    trips,
    openTripDetail,
    updateDistrictNotes,
    updateDistrictRating,
    toggleDistrictFavorite,
    addPhoto,
    updatePhoto,
    deletePhoto,
    addVisit,
    updateVisit,
    deleteVisit,
    openLightbox,
  } = useApp();

  const district = getDistrictById(districtId);
  const districtData = userData[districtId];
  const districtVisits = visits.filter((v) => v.districtId === districtId);

  // Active visit selection (default to latest or first)
  const [selectedVisitId, setSelectedVisitId] = useState<string>(
    districtVisits[0]?.id || ''
  );

  // If selectedVisitId is not in districtVisits, reset to first
  const activeVisit =
    districtVisits.find((v) => v.id === selectedVisitId) ||
    districtVisits[0] ||
    null;

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(
    activeVisit?.notes || districtData?.notes || ''
  );
  const [isUploading, setIsUploading] = useState(false);
  const [editingPhotoCaptionId, setEditingPhotoCaptionId] = useState<string | null>(null);
  const [captionDraft, setCaptionDraft] = useState('');
  const [deletePhotoConfirmId, setDeletePhotoConfirmId] = useState<string | null>(null);
  const [isAddingNewVisit, setIsAddingNewVisit] = useState(false);
  const [newVisitDate, setNewVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [newVisitTitle, setNewVisitTitle] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!district) return null;

  const isFavorite = !!districtData?.isFavorite;
  const rating = districtData?.rating || 5;

  // Aggregate photos for active visit (or all for the district)
  const photos: Photo[] = (activeVisit?.photos || []).sort(
    (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
  );
  const totalPhotos = photos.length;
  const coverPhoto = photos.find((p) => p.isCover) || photos[0];

  // Connected trip if any
  const connectedTrip = activeVisit?.tripId
    ? trips.find((t) => t.id === activeVisit.tripId)
    : null;

  // Handle Photo upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (totalPhotos >= 5) {
      alert("You've saved the maximum 5 memories for this district.");
      return;
    }

    setIsUploading(true);
    try {
      const file = files[0];
      const compressed = await compressImage(file, 1600, 1600, 0.85);

      addPhoto(districtId, {
        url: compressed,
        caption: '',
        isCover: totalPhotos === 0,
        takenDate: activeVisit?.visitDate || new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error('Photo processing failed:', err);
      alert("Couldn't process image. Please try another photo.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveNotes = () => {
    updateDistrictNotes(districtId, notesDraft);
    if (activeVisit) {
      updateVisit(activeVisit.id, { notes: notesDraft });
    }
    setIsEditingNotes(false);
  };

  const handleSaveCaption = (photoId: string) => {
    updatePhoto(photoId, { caption: captionDraft });
    setEditingPhotoCaptionId(null);
  };

  const handleCreateVisit = () => {
    const newV = addVisit({
      districtId,
      visitDate: newVisitDate,
      title: newVisitTitle.trim() || `Journey to ${district.name}`,
      notes: '',
      rating: 5,
      photos: [],
    });
    setSelectedVisitId(newV.id);
    setIsAddingNewVisit(false);
    setNewVisitTitle('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          id="journal-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-white dark:bg-[#0e0e0e] border border-stone-200 dark:border-white/15 text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-white/10 transition-colors shadow-xs cursor-pointer font-body"
        >
          <ArrowLeft className="w-4 h-4" />
          মানচিত্রে ফিরে যান
        </button>

        {/* Favorite & Rating in Header */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white dark:bg-[#0e0e0e] border border-stone-200 dark:border-white/15 px-2.5 py-1.5 shadow-xs">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => updateDistrictRating(districtId, star)}
                className="p-0.5 text-amber-500 dark:text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    star <= rating ? 'fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400' : 'text-stone-300 dark:text-white/20'
                  }`}
                />
              </button>
            ))}
          </div>

          <button
            id="journal-fav-btn"
            onClick={() => toggleDistrictFavorite(districtId)}
            className={`p-2 border transition-all cursor-pointer ${
              isFavorite
                ? 'bg-[#F27D26] border-[#F27D26] text-white shadow-md'
                : 'bg-white dark:bg-[#0e0e0e] border-stone-200 dark:border-white/15 text-stone-400 hover:text-[#F27D26]'
            }`}
            aria-label="Toggle favorite"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
          </button>
        </div>
      </div>

      {/* Hero Cover Photo & Title Container */}
      <div className="relative overflow-hidden bg-stone-900 text-white shadow-xl border border-stone-200 dark:border-white/15">
        {coverPhoto ? (
          <div className="relative h-64 sm:h-80 md:h-96 w-full">
            <img
              src={coverPhoto.url}
              alt={district.name}
              className="w-full h-full object-cover cursor-pointer hover:scale-[1.01] transition-transform duration-500"
              onClick={() => openLightbox(photos, 0, district.name)}
            />
            <button
              onClick={() => openLightbox(photos, 0, district.name)}
              className="absolute top-4 right-4 p-2.5 bg-black/50 hover:bg-black/80 backdrop-blur-md text-white transition-colors cursor-pointer"
              aria-label="View fullscreen photo"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="h-64 sm:h-72 w-full bg-gradient-to-br from-[#2a1708] via-[#111111] to-[#050505] flex flex-col items-center justify-center p-8 text-center">
            <Compass className="w-16 h-16 text-[#F27D26]/40 mb-3" />
            <p className="font-body text-sm text-stone-300 font-medium">
              {district.bn_name} জেলার প্রিয় ছবি সংরক্ষণ করুন
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 px-4 py-2 bg-[#F27D26] hover:bg-[#d96615] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer font-body"
            >
              <Camera className="w-3.5 h-3.5" />
              কভার ছবি আপলোড করুন
            </button>
          </div>
        )}

        {/* Hero Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 font-body text-xs font-bold bg-[#F27D26] text-white">
              {district.division} বিভাগ
            </span>
            {districtVisits.length > 1 && (
              <span className="px-3 py-1 font-body text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/10">
                {districtVisits.length}টি ভ্রমণ রেকর্ড
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight flex items-baseline gap-3 text-white">
            {district.bn_name}
            <span className="text-lg sm:text-2xl font-normal text-stone-300 font-sans">
              ({district.name})
            </span>
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs sm:text-sm text-stone-300 font-body">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#F27D26]" />
              ভ্রমণ: {activeVisit?.visitDate || districtData?.firstVisitedDate || 'সংরক্ষিত'}
            </span>
            <span className="flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-[#F27D26]" />
              {totalPhotos} / ৫টি ছবি সংরক্ষিত
            </span>
          </div>
        </div>
      </div>

      {/* Multiple Visits / Trips Selector Tabs */}
      <div className="bg-white dark:bg-[#0e0e0e] p-4 border border-stone-200/80 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-xs transition-colors">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="font-body text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider whitespace-nowrap mr-1">
            ভ্রমণ তালিকা:
          </span>
          {districtVisits.map((v, idx) => (
            <button
              key={v.id}
              onClick={() => {
                setSelectedVisitId(v.id);
                setNotesDraft(v.notes || '');
              }}
              className={`px-3 py-1.5 font-body text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                (activeVisit?.id === v.id || (!activeVisit && idx === 0))
                  ? 'bg-[#F27D26] text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-white/5 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-white/10'
              }`}
            >
              {v.visitDate
                ? new Date(v.visitDate).toLocaleDateString('bn-BD', { month: 'short', year: 'numeric' })
                : `ভ্রমণ #${idx + 1}`}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsAddingNewVisit(true)}
          className="px-3 py-1.5 font-body text-xs font-bold text-[#EA580C] dark:text-[#F27D26] hover:bg-stone-100 dark:hover:bg-white/10 border border-[#F27D26]/40 flex items-center gap-1 transition-colors ml-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          নতুন ভ্রমণ যোগ করুন
        </button>
      </div>

      {/* Modal for Logging Another Journey */}
      {isAddingNewVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-white dark:bg-[#111111] p-5 shadow-2xl border border-stone-200 dark:border-white/20 space-y-4"
          >
            <h3 className="font-body text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#F27D26]" />
              {district.bn_name} জেলায় নতুন ভ্রমণ যোগ করুন
            </h3>
            <div className="space-y-3 font-body">
              <div>
                <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 mb-1">
                  ভ্রমণের শিরোনাম (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: শীতকালীন অবকাশ ২০২৬"
                  value={newVisitTitle}
                  onChange={(e) => setNewVisitTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-black border border-stone-200 dark:border-white/20 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#F27D26]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 mb-1">
                  ভ্রমণের তারিখ
                </label>
                <input
                  type="date"
                  value={newVisitDate}
                  onChange={(e) => setNewVisitDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-black border border-stone-200 dark:border-white/20 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#F27D26]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 font-body">
              <button
                onClick={() => setIsAddingNewVisit(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/10 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={handleCreateVisit}
                className="px-4 py-1.5 text-xs font-bold bg-[#F27D26] hover:bg-[#d96615] text-white shadow-xs cursor-pointer"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Photo Album Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#F27D26]" />
              ফটো অ্যালবাম
            </h2>
            <p className="font-body text-xs text-stone-500 dark:text-stone-400">
              এই জেলার সেরা ৩–৫টি স্মৃতি ছবি সংরক্ষণ করুন ({totalPhotos} / ৫)
            </p>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          {totalPhotos < 5 && (
            <button
              id="upload-photo-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3.5 py-2 bg-[#F27D26] hover:bg-[#d96615] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer font-body disabled:opacity-50"
            >
              {isUploading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              ছবি যোগ করুন ({5 - totalPhotos}টি বাকি)
            </button>
          )}
        </div>

        {/* Photo Grid */}
        {totalPhotos === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-stone-300 dark:border-white/20 hover:border-[#F27D26] dark:hover:border-[#F27D26] p-10 text-center cursor-pointer transition-colors bg-white dark:bg-[#0e0e0e]"
          >
            <ImageIcon className="w-10 h-10 text-stone-400 mx-auto mb-2" />
            <h4 className="font-body text-sm font-bold text-stone-800 dark:text-stone-200">
              স্মৃতি সংরক্ষণ করুন
            </h4>
            <p className="font-body text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto font-light">
              আপনার ভ্রমণের ৩–৫টি ছবি যোগ করুন। প্রথম ছবি নির্বাচন করতে এখানে ক্লিক করুন।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo, index) => {
              const isCover = photo.isCover || index === 0;
              return (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group relative overflow-hidden bg-stone-900 border border-stone-200 dark:border-white/15 shadow-sm ${
                    index === 0 ? 'sm:col-span-2 md:col-span-2 aspect-video sm:aspect-16/9' : 'aspect-square'
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || `${district.name} memory #${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                    onClick={() => openLightbox(photos, index, district.name)}
                  />

                  {/* Badges on photo */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {isCover && (
                      <span className="px-2 py-0.5 font-body text-[10px] font-bold bg-[#F27D26] text-white shadow-xs">
                        কভার ছবি
                      </span>
                    )}
                  </div>

                  {/* Actions overlay on hover */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md p-1">
                    {!isCover && (
                      <button
                        onClick={() => updatePhoto(photo.id, { isCover: true })}
                        title="Set as Cover Photo"
                        className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 text-xs cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingPhotoCaptionId(photo.id);
                        setCaptionDraft(photo.caption || '');
                      }}
                      title="Edit Caption"
                      className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 text-xs cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletePhotoConfirmId(photo.id)}
                      title="Delete Photo"
                      className="p-1.5 text-rose-300 hover:text-rose-100 hover:bg-rose-600/60 text-xs cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Caption bar */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white font-body">
                    {editingPhotoCaptionId === photo.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={captionDraft}
                          onChange={(e) => setCaptionDraft(e.target.value)}
                          placeholder="ক্যাপশন লিখুন..."
                          className="flex-1 px-2.5 py-1 text-xs bg-black/50 border border-white/30 text-white placeholder-stone-400 focus:outline-none focus:border-[#F27D26]"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveCaption(photo.id);
                            if (e.key === 'Escape') setEditingPhotoCaptionId(null);
                          }}
                        />
                        <button
                          onClick={() => handleSaveCaption(photo.id)}
                          className="p-1.5 bg-[#F27D26] text-white hover:bg-[#d96615] cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingPhotoCaptionId(null)}
                          className="p-1.5 bg-stone-700 text-white hover:bg-stone-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <p
                        onClick={() => {
                          setEditingPhotoCaptionId(photo.id);
                          setCaptionDraft(photo.caption || '');
                        }}
                        className="text-xs text-stone-200 line-clamp-2 cursor-pointer hover:text-white font-light"
                      >
                        {photo.caption ? `"${photo.caption}"` : '+ ক্যাপশন যোগ করুন...'}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Photo Confirmation Modal */}
      {deletePhotoConfirmId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-white dark:bg-[#111] p-5 shadow-2xl border border-stone-200 dark:border-white/20 space-y-3 font-body"
          >
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              এই ছবিটি মুছে ফেলতে চান?
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              ছবিটি {district.bn_name} অ্যালবাম থেকে মুছে ফেলা হবে।
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletePhotoConfirmId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/10 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  deletePhoto(deletePhotoConfirmId);
                  setDeletePhotoConfirmId(null);
                }}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
              >
                মুছে ফেলুন
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Personal Memory Journal Note */}
      <div className="bg-white dark:bg-[#0e0e0e] p-6 sm:p-8 border border-stone-200/80 dark:border-white/10 shadow-sm space-y-4 transition-colors font-body">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold tracking-wide text-stone-900 dark:text-white flex items-center gap-2">
            <span className="text-[#F27D26] text-xl">✍️</span>
            আমার ভ্রমণকাহিনী ও স্মৃতিকথা
          </h2>
          {!isEditingNotes && (
            <button
              onClick={() => setIsEditingNotes(true)}
              className="text-xs font-bold text-[#EA580C] dark:text-[#F27D26] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              সম্পাদনা করুন
            </button>
          )}
        </div>

        {isEditingNotes ? (
          <div className="space-y-3">
            <textarea
              rows={5}
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              placeholder={`${district.bn_name} ভ্রমণের অভিজ্ঞতা, সাথে কে ছিলেন, কী খেলেন, দর্শনীয় স্থানের অনুভূতি লিখে রাখুন...`}
              className="w-full p-4 text-sm leading-relaxed bg-stone-50 dark:bg-black border border-stone-200 dark:border-white/20 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-[#F27D26]"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setNotesDraft(activeVisit?.notes || districtData?.notes || '');
                  setIsEditingNotes(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/10 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-5 py-2 text-xs font-bold bg-[#F27D26] hover:bg-[#d96615] text-white shadow-xs cursor-pointer"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsEditingNotes(true)}
            className="cursor-pointer group p-4 -m-4 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors"
          >
            {notesDraft.trim().length > 0 ? (
              <p className="text-base leading-relaxed text-stone-800 dark:text-stone-300 italic whitespace-pre-line font-light">
                "{notesDraft}"
              </p>
            ) : (
              <p className="text-sm text-stone-400 italic font-light">
                এই ভ্রমণের কোনো গল্প এখনও লেখা হয়নি। {district.bn_name} জেলার স্মৃতি ও অভিজ্ঞতা লিখতে এখানে ক্লিক করুন...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

