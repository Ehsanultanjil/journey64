import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Calendar,
  Camera,
  Heart,
  Trash2,
  Edit3,
  Plus,
  Image as ImageIcon,
  Check,
  X,
  MapPin,
  Lock,
  Maximize2,
  Save,
  Sparkles,
  LayoutGrid,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getDistrictById } from '../../data/districts';
import { Photo } from '../../types';
import { compressImage } from '../../lib/storage';
import { uploadPhotoFile } from '../../lib/supabase/storage';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface Props {
  districtId: string;
  onBack: () => void;
}

export const DistrictMemoryPage: React.FC<Props> = ({ districtId, onBack }) => {
  const {
    authUser,
    openAuthModal,
    userData,
    visits,
    updateDistrictNotes,
    toggleDistrictFavorite,
    addPhoto,
    addPhotos,
    updatePhoto,
    deletePhoto,
    renamePlace,
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
  const [targetUploadPlace, setTargetUploadPlace] = useState<string>('');

  // Place Creation State
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [newPlaceNameDraft, setNewPlaceNameDraft] = useState('');
  const [customPlaces, setCustomPlaces] = useState<string[]>([]);

  // Caption, Place Rename & Delete states
  const [editingPlaceName, setEditingPlaceName] = useState<string | null>(null);
  const [editingPlaceDraft, setEditingPlaceDraft] = useState('');
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [captionDraft, setCaptionDraft] = useState('');
  const [deletePhotoConfirmId, setDeletePhotoConfirmId] = useState<string | null>(null);
  const [galleryViewMode, setGalleryViewMode] = useState<'grid' | 'slider'>('grid');

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  if (!district) return null;

  const isFavorite = !!districtData?.isFavorite;

  // Aggregate all photos for this district (ensure only valid image URLs are rendered)
  const allPhotos: Photo[] = useMemo(() => {
    return (activeVisit?.photos || [])
      .filter((p) => p && typeof p.url === 'string' && p.url.trim().length > 0)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [activeVisit?.photos]);

  const coverPhoto = allPhotos.find((p) => p.isCover) || allPhotos[0];

  // Group photos by Place / Location
  const placeSections = useMemo(() => {
    const defaultPlaceName = district.famousSpots?.[0] || 'প্রধান আকর্ষণ';
    const placeMap = new Map<string, Photo[]>();

    // Seed existing photos into places
    allPhotos.forEach((photo) => {
      const pName = photo.placeName?.trim() || defaultPlaceName;
      if (!placeMap.has(pName)) {
        placeMap.set(pName, []);
      }
      placeMap.get(pName)!.push(photo);
    });

    // Also include any user-created custom places that don't have photos yet
    customPlaces.forEach((cp) => {
      const trimmed = cp.trim();
      if (trimmed && !placeMap.has(trimmed)) {
        placeMap.set(trimmed, []);
      }
    });

    // If empty, ensure at least one default place
    if (placeMap.size === 0) {
      placeMap.set(defaultPlaceName, []);
    }

    return Array.from(placeMap.entries()).map(([placeName, photos]) => ({
      placeName,
      photos,
    }));
  }, [allPhotos, customPlaces, district.famousSpots]);

  // In edit mode show all sections; in view mode show only sections that have photos
  const displaySections = useMemo(() => {
    if (isEditing) return placeSections;
    return placeSections.filter((s) => s.photos.length > 0);
  }, [isEditing, placeSections]);

  // Trigger file upload for a specific place
  const handleTriggerUpload = (placeName: string) => {
    if (!authUser) {
      openAuthModal('ছবি যোগ করতে লগইন করুন');
      return;
    }
    setTargetUploadPlace(placeName);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle Photo upload for the selected place
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentPlacePhotos = allPhotos.filter(
      (p) => (p.placeName?.trim() || district.famousSpots?.[0] || 'প্রধান আকর্ষণ') === targetUploadPlace
    );

    if (currentPlacePhotos.length + files.length > 5) {
      alert(`প্রতিটি স্থানে সর্বোচ্চ ৫টি ছবি আপলোড করা যাবে। (বর্তমানে আছে: ${currentPlacePhotos.length}টি)`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    try {
      const photosToAdd = [];
      const isOverallEmpty = allPhotos.length === 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadPhotoFile(file, districtId, authUser?.id);
        photosToAdd.push({
          url: res.url,
          caption: '',
          placeName: targetUploadPlace,
          isCover: isOverallEmpty && i === 0,
          takenDate: visitDateDraft || new Date().toISOString().split('T')[0],
        });
      }

      if (photosToAdd.length > 0) {
        addPhotos(districtId, photosToAdd);
        setIsSavedToast(true);
        setTimeout(() => setIsSavedToast(false), 2000);
      }
    } catch (err) {
      console.error('Photo upload failed:', err);
      alert('ছবি আপলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Add a new place section
  const handleAddNewPlace = (name?: string) => {
    const placeNameToAdd = (name || newPlaceNameDraft).trim();
    if (!placeNameToAdd) return;

    if (!customPlaces.includes(placeNameToAdd)) {
      setCustomPlaces((prev) => [...prev, placeNameToAdd]);
    }
    setNewPlaceNameDraft('');
    setIsAddingPlace(false);
  };

  // Rename a place section
  const handleSavePlaceName = (oldPlaceName: string) => {
    const trimmed = editingPlaceDraft.trim();
    if (!trimmed) {
      setEditingPlaceName(null);
      return;
    }

    if (trimmed !== oldPlaceName) {
      renamePlace(districtId, oldPlaceName, trimmed);
      setCustomPlaces((prev) => prev.map((cp) => (cp === oldPlaceName ? trimmed : cp)));
      if (targetUploadPlace === oldPlaceName) {
        setTargetUploadPlace(trimmed);
      }
      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 2000);
    }
    setEditingPlaceName(null);
  };

  const handleSetCoverPhoto = (photoId: string) => {
    allPhotos.forEach((p) => {
      updatePhoto(p.id, { isCover: p.id === photoId });
    });
  };

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editingCaptionId) {
      updatePhoto(editingCaptionId, { caption: captionDraft.trim() });
      setEditingCaptionId(null);
    }
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

  const handleToggleEdit = () => {
    if (!authUser) {
      openAuthModal('ভ্রমণ নোট ও স্মৃতি এডিট করতে অনুগ্রহ করে লগইন করুন');
      return;
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto space-y-6 sm:space-y-8 pb-24 animate-in fade-in duration-200 font-body">
      {/* Hidden File Input for Place-specific Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Guest Mode Notice */}
      {!authUser && (
        <div className="p-3 sm:p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>আপনি অতিথি হিসেবে স্মৃতিগুলো দেখছেন। ছবি আপলোড বা স্থান যোগ করতে লগইন করুন।</span>
          </div>
          <button
            onClick={() => openAuthModal('ছবি ও স্মৃতিকথা সংরক্ষণ করতে অনুগ্রহ করে লগইন করুন')}
            className="px-3.5 py-1.5 bg-[#004526] hover:bg-[#005a32] text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer whitespace-nowrap self-end sm:self-auto"
          >
            লগইন করুন
          </button>
        </div>
      )}

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
          {/* Favorite Button */}
          <button
            id="journal-fav-btn"
            onClick={() => toggleDistrictFavorite(districtId)}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              isFavorite
                ? 'bg-[#004526] border-[#004526] text-white shadow-md scale-105'
                : 'bg-[#12141A] border-white/15 text-stone-400 hover:text-[#004526]'
            }`}
            aria-label="পছন্দের তালিকা"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
          </button>

          {/* Edit Mode Toggle Button */}
          <button
            id="journal-edit-mode-btn"
            onClick={handleToggleEdit}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              isEditing
                ? 'bg-stone-700 hover:bg-stone-600 text-white'
                : 'bg-[#004526] hover:bg-[#005a32] text-white shadow-md'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'প্রিভিউ দেখুন' : 'এডিট করুন'}</span>
          </button>
        </div>
      </div>

      {/* Sleek Luminous Cover Card */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl p-5 sm:p-8 lg:p-10 space-y-3 sm:space-y-4 isolate transform-gpu bg-[#0A0C10]">
        {/* Background Cover Photo with Vibrant Glass Blur */}
        {coverPhoto ? (
          <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl sm:rounded-3xl pointer-events-none">
            <img
              src={coverPhoto.url}
              alt={district.name}
              className="w-full h-full object-cover filter blur-md scale-120 brightness-[0.88] contrast-[1.04] transform-gpu"
            />
            <div className="absolute inset-0 bg-[#0A0C10]/55 rounded-2xl sm:rounded-3xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10]/90 via-transparent to-black/20 rounded-2xl sm:rounded-3xl" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0B1A13] via-[#12141A] to-[#0A0C10] rounded-2xl sm:rounded-3xl" />
        )}

        {/* Content on Cover */}
        <div className="relative z-10 space-y-2 sm:space-y-3">
          <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white flex items-baseline gap-2.5 drop-shadow-md">
              {district.bn_name}
              <span className="font-sans text-base sm:text-xl font-normal text-stone-200">
                ({district.name})
              </span>
            </h1>

            {visitDateDraft && (
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-black/50 backdrop-blur-md text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm shrink-0">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
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

          {district.tagline && (
            <p className="text-xs sm:text-sm text-stone-200 font-light italic max-w-2xl drop-shadow-xs">
              "{district.tagline}"
            </p>
          )}

          {notesDraft.trim().length > 0 && (
            <p className="font-body text-xs sm:text-sm md:text-base text-stone-100 leading-relaxed font-light whitespace-pre-line pt-1 drop-shadow-xs max-w-4xl">
              "{notesDraft}"
            </p>
          )}

          {district.famousSpots && district.famousSpots.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-stone-300 pt-1.5 border-t border-white/10 flex-wrap">
              <MapPin className="w-3 h-3 text-[#004526] shrink-0" />
              <span>দর্শনীয় স্থান: {district.famousSpots.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* ================= EDIT MODE (Notes & Date Settings) ================= */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#12141A]/95 border border-[#004526]/40 p-5 sm:p-8 rounded-3xl space-y-6 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#004526]/20 text-[#004526] flex items-center justify-center">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-white">
                  স্মৃতি ও বিবরণ সম্পাদনা করুন
                </h2>
                <p className="text-xs text-stone-400 font-light">
                  ভ্রমণের তারিখ ও অনুভূতি লিখে রাখুন
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title="সম্পাদনা বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="max-w-xs">
              <label className="block text-xs font-bold text-stone-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#004526]" />
                কবে গিয়েছিলেন?
              </label>
              <input
                type="date"
                value={visitDateDraft}
                onChange={(e) => setVisitDateDraft(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#004526] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5">
                ভ্রমণের অভিজ্ঞতা ও গল্প
              </label>
              <textarea
                rows={4}
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder={`${district.bn_name} ভ্রমণের অনুভূতি ও স্মৃতিগুলো লিখে রাখুন...`}
                className="w-full p-3.5 text-xs bg-white/5 border border-white/15 rounded-2xl text-white placeholder-stone-500 focus:outline-none focus:border-[#004526] transition-colors resize-none leading-relaxed"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* ================= MULTI-LOCATION PHOTO ALBUM SECTIONS ================= */}
      <div className="space-y-8">
        {/* Empty state when not editing and no photos exist */}
        {allPhotos.length === 0 && !isEditing && (
          <div className="p-8 sm:p-12 text-center bg-[#0E1015]/80 border border-white/10 rounded-3xl space-y-4 shadow-xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#004526]/20 text-[#004526] flex items-center justify-center">
              <Camera className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-white">
                এই জেলায় এখনো কোনো ছবি বা স্মৃতি যোগ করা হয়নি
              </h3>
              <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto">
                ছবি আপলোড করতে ও স্মৃতি সংরক্ষণ করতে উপরের "এডিট করুন" বাটনে চাপুন।
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#004526] hover:bg-[#005a32] text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer hover:scale-105"
            >
              <Edit3 className="w-4 h-4" />
              <span>ছবি ও স্মৃতি যোগ করুন</span>
            </button>
          </div>
        )}

        {/* Gallery Control Bar */}
        {(allPhotos.length > 0 || isEditing) && (
          <div className="flex items-center justify-between gap-4 flex-wrap bg-[#0E1015]/70 border border-white/10 px-5 py-3 rounded-2xl shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">
                  ফটোগ্যালারি ও অ্যালবাম
                </h2>
                <p className="text-[11px] text-stone-400 font-light">
                  মোট {allPhotos.length}টি স্মৃতি সংরক্ষিত
                </p>
              </div>
            </div>

            {/* View Mode Toggle: Grid vs Slider */}
            <div className="flex items-center bg-black/50 border border-white/10 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setGalleryViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  galleryViewMode === 'grid'
                    ? 'bg-[#004526] text-white shadow-sm'
                    : 'text-stone-400 hover:text-white hover:bg-white/5'
                }`}
                title="গ্রিড ভিউ"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>গ্রিড ভিউ</span>
              </button>
              <button
                type="button"
                onClick={() => setGalleryViewMode('slider')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  galleryViewMode === 'slider'
                    ? 'bg-[#004526] text-white shadow-sm'
                    : 'text-stone-400 hover:text-white hover:bg-white/5'
                }`}
                title="স্লাইডার ভিউ"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>স্লাইডার ভিউ</span>
              </button>
            </div>
          </div>
        )}

        {/* Render each location/spot */}
        {displaySections.map((section) => {
          const { placeName, photos: placePhotos } = section;
          return (
            <div
              key={placeName}
              className="bg-[#0E1015]/90 border border-white/10 p-5 sm:p-7 rounded-3xl space-y-4 shadow-xl"
            >
              {/* Place/Spot Header */}
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#004526]/25 text-emerald-400 flex items-center justify-center shadow-xs">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    {editingPlaceName === placeName ? (
                      <div className="flex items-center gap-1.5 py-0.5">
                        <input
                          type="text"
                          value={editingPlaceDraft}
                          onChange={(e) => setEditingPlaceDraft(e.target.value)}
                          placeholder="স্থানের নাম..."
                          className="px-2.5 py-1 text-sm font-bold bg-black/90 border border-emerald-500/60 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 shadow-inner"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSavePlaceName(placeName);
                            }
                            if (e.key === 'Escape') {
                              setEditingPlaceName(null);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSavePlaceName(placeName)}
                          className="p-1.5 bg-[#004526] hover:bg-[#005a32] text-white rounded-lg transition-colors cursor-pointer shadow-xs"
                          title="নাম সংরক্ষণ করুন"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPlaceName(null)}
                          className="p-1.5 bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white rounded-lg transition-colors cursor-pointer shadow-xs"
                          title="বাতিল"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group/placename">
                        <h3
                          onClick={() => {
                            if (isEditing) {
                              setEditingPlaceName(placeName);
                              setEditingPlaceDraft(placeName);
                            }
                          }}
                          className={`font-display text-lg font-bold text-white leading-tight flex items-center gap-2 ${
                            isEditing ? 'cursor-pointer hover:text-emerald-300 transition-colors' : ''
                          }`}
                          title={isEditing ? 'নাম পরিবর্তন করতে ক্লিক করুন' : undefined}
                        >
                          <span>{placeName}</span>
                        </h3>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPlaceName(placeName);
                              setEditingPlaceDraft(placeName);
                            }}
                            className="p-1 rounded-lg text-stone-400 hover:text-emerald-300 hover:bg-white/10 transition-all cursor-pointer opacity-70 group-hover/placename:opacity-100"
                            title="স্থানের নাম পরিবর্তন করুন"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                    <p className="text-[11px] text-stone-400 font-light mt-0.5">
                      {placePhotos.length} / ৫টি ছবি
                    </p>
                  </div>
                </div>

                {/* Upload Button for this place (Only in Edit Mode) */}
                {isEditing && placePhotos.length < 5 && (
                  <button
                    type="button"
                    onClick={() => handleTriggerUpload(placeName)}
                    disabled={isUploading}
                    className="px-3.5 py-1.5 bg-[#004526] hover:bg-[#005a32] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-105 disabled:opacity-50"
                  >
                    {isUploading && targetUploadPlace === placeName ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    )}
                    <span>ছবি যোগ করুন</span>
                  </button>
                )}
              </div>

              {/* Photos Display: AspectRatio Grid View or Scrollable Row */}
              {galleryViewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pt-1">
                  {placePhotos.map((photo, pIdx) => {
                    const isCover = photo.id === coverPhoto?.id;
                    return (
                      <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25, delay: pIdx * 0.04 }}
                        className="group relative rounded-2xl overflow-hidden bg-[#12151C] border border-white/15 hover:border-emerald-500/50 shadow-md transition-all"
                      >
                        <AspectRatio ratio={4 / 3} className="bg-white/5 relative w-full overflow-hidden">
                          <img
                            src={photo.url}
                            alt={photo.caption || placeName}
                            onClick={() => openLightbox(allPhotos, allPhotos.findIndex((p) => p.id === photo.id), placeName)}
                            className="size-full object-cover rounded-2xl cursor-pointer group-hover:scale-105 transition-transform duration-500 ease-out block"
                            loading="lazy"
                          />

                          {/* Cover Badge */}
                          {isCover && (
                            <div className="absolute top-2 left-2 z-20 pointer-events-none">
                              <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-[#004526] text-white shadow-md backdrop-blur-md border border-emerald-400/40">
                                কভার ছবি
                              </span>
                            </div>
                          )}

                          {/* Top Action Buttons (Shown ONLY in Edit Mode) */}
                          {isEditing && (
                            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                              {!isCover && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetCoverPhoto(photo.id);
                                  }}
                                  className="p-1.5 bg-black/70 hover:bg-[#004526] text-white rounded-lg backdrop-blur-md transition-colors cursor-pointer"
                                  title="কভার ছবি হিসেবে সেট করুন"
                                >
                                  <Sparkles className="w-3 h-3 text-amber-300" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletePhotoConfirmId(photo.id);
                                }}
                                className="p-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-lg backdrop-blur-md transition-colors cursor-pointer"
                                title="ছবি মুছে ফেলুন"
                              >
                                <Trash2 className="w-3 h-3 text-rose-300" />
                              </button>
                            </div>
                          )}

                          {/* Bottom Caption Overlay */}
                          {isEditing ? (
                            <div
                              className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/95 via-black/70 to-transparent text-white z-20"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {editingCaptionId === photo.id ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={captionDraft}
                                    onChange={(e) => setCaptionDraft(e.target.value)}
                                    placeholder="ক্যাপশন..."
                                    className="flex-1 px-1.5 py-0.5 text-[10px] bg-black/90 border border-[#004526] rounded text-white focus:outline-none"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSaveCaption(photo.id);
                                      }
                                      if (e.key === 'Escape') {
                                        setEditingCaptionId(null);
                                      }
                                    }}
                                    onBlur={() => handleSaveCaption(photo.id)}
                                  />
                                  <button
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      handleSaveCaption(photo.id);
                                    }}
                                    className="p-1 bg-[#004526] text-white rounded cursor-pointer"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <div
                                  onClick={() => {
                                    setEditingCaptionId(photo.id);
                                    setCaptionDraft(photo.caption || '');
                                  }}
                                  className="flex items-center justify-between gap-1 cursor-pointer hover:bg-white/10 px-1 py-0.5 rounded transition-colors"
                                  title="ক্যাপশন এডিট করতে ক্লিক করুন"
                                >
                                  <p className="text-[10px] truncate text-stone-200">
                                    {photo.caption || '+ ক্যাপশন দিন'}
                                  </p>
                                  <Edit3 className="w-2.5 h-2.5 text-stone-400 shrink-0" />
                                </div>
                              )}
                            </div>
                          ) : (
                            photo.caption && (
                              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white pointer-events-none z-20">
                                <p className="text-[10px] sm:text-xs font-medium text-stone-200 truncate">
                                  {photo.caption}
                                </p>
                              </div>
                            )
                          )}
                        </AspectRatio>
                      </motion.div>
                    );
                  })}

                  {/* Empty Upload Slot if less than 5 photos and in Edit Mode (Grid) */}
                  {isEditing && placePhotos.length < 5 && (
                    <div
                      onClick={() => handleTriggerUpload(placeName)}
                      className="cursor-pointer group"
                      title={`এই স্থানে আরও ${5 - placePhotos.length}টি ছবি যোগ করতে পারবেন`}
                    >
                      <AspectRatio
                        ratio={4 / 3}
                        className="rounded-2xl border-2 border-dashed border-white/20 hover:border-emerald-500/60 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center p-3 text-center transition-all"
                      >
                        <div className="w-9 h-9 rounded-full bg-white/5 group-hover:bg-[#004526] text-stone-400 group-hover:text-white flex items-center justify-center transition-colors shadow-sm mb-1.5">
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <span className="text-[11px] font-bold text-stone-300 group-hover:text-white">
                          ছবি যোগ করুন
                        </span>
                        <span className="text-[9px] text-stone-400 mt-0.5 font-light">
                          ({5 - placePhotos.length}টি বাকি)
                        </span>
                      </AspectRatio>
                    </div>
                  )}
                </div>
              ) : (
                /* Photos Row - Slider / Horizontal Row Display */
                <div className="flex flex-row items-center gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 scrollbar-thin">
                  {/* Uploaded Photos in this Place */}
                  {placePhotos.map((photo, pIdx) => {
                    const isCover = photo.id === coverPhoto?.id;
                    return (
                      <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: pIdx * 0.04 }}
                        className="group relative shrink-0 h-56 sm:h-64 rounded-2xl overflow-hidden bg-[#12151C] border border-white/15 hover:border-emerald-500/50 shadow-md transition-all flex items-center justify-center"
                      >
                        {/* Photo Image - natural aspect ratio preserved */}
                        <img
                          src={photo.url}
                          alt={photo.caption || placeName}
                          onClick={() => openLightbox(allPhotos, allPhotos.findIndex((p) => p.id === photo.id), placeName)}
                          className="h-full w-auto max-h-56 sm:max-h-64 max-w-[85vw] sm:max-w-xl object-contain rounded-2xl cursor-pointer group-hover:scale-[1.02] transition-transform duration-300 block"
                          loading="lazy"
                        />

                        {/* Cover Badge */}
                        {isCover && (
                          <div className="absolute top-2 left-2 z-20 pointer-events-none">
                            <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-[#004526] text-white shadow-md backdrop-blur-md border border-emerald-400/40">
                              কভার ছবি
                            </span>
                          </div>
                        )}

                        {/* Top Action Buttons (Shown ONLY in Edit Mode) */}
                        {isEditing && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            {!isCover && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetCoverPhoto(photo.id);
                                }}
                                className="p-1.5 bg-black/70 hover:bg-[#004526] text-white rounded-lg backdrop-blur-md transition-colors cursor-pointer"
                                title="কভার ছবি হিসেবে সেট করুন"
                              >
                                <Sparkles className="w-3 h-3 text-amber-300" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletePhotoConfirmId(photo.id);
                              }}
                              className="p-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-lg backdrop-blur-md transition-colors cursor-pointer"
                              title="ছবি মুছে ফেলুন"
                            >
                              <Trash2 className="w-3 h-3 text-rose-300" />
                            </button>
                          </div>
                        )}

                        {/* Bottom Caption Overlay */}
                        {isEditing ? (
                          <div
                            className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/95 via-black/70 to-transparent text-white z-20"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {editingCaptionId === photo.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={captionDraft}
                                  onChange={(e) => setCaptionDraft(e.target.value)}
                                  placeholder="ক্যাপশন..."
                                  className="flex-1 px-1.5 py-0.5 text-[10px] bg-black/90 border border-[#004526] rounded text-white focus:outline-none"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleSaveCaption(photo.id);
                                    }
                                    if (e.key === 'Escape') {
                                      setEditingCaptionId(null);
                                    }
                                  }}
                                  onBlur={() => handleSaveCaption(photo.id)}
                                />
                                <button
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSaveCaption(photo.id);
                                  }}
                                  className="p-1 bg-[#004526] text-white rounded cursor-pointer"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div
                                onClick={() => {
                                  setEditingCaptionId(photo.id);
                                  setCaptionDraft(photo.caption || '');
                                }}
                                className="flex items-center justify-between gap-1 cursor-pointer hover:bg-white/10 px-1 py-0.5 rounded transition-colors"
                                title="ক্যাপশন এডিট করতে ক্লিক করুন"
                              >
                                <p className="text-[10px] truncate text-stone-200">
                                  {photo.caption || '+ ক্যাপশন দিন'}
                                </p>
                                <Edit3 className="w-2.5 h-2.5 text-stone-400 shrink-0" />
                              </div>
                            )}
                          </div>
                        ) : (
                          photo.caption && (
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white pointer-events-none z-20">
                              <p className="text-[10px] sm:text-xs font-medium text-stone-200 truncate">
                                {photo.caption}
                              </p>
                            </div>
                          )
                        )}
                      </motion.div>
                    );
                  })}

                  {/* Empty Upload Slot if less than 5 photos and in Edit Mode */}
                  {isEditing && placePhotos.length < 5 && (
                    <div
                      onClick={() => handleTriggerUpload(placeName)}
                      className="h-56 sm:h-64 w-36 sm:w-44 shrink-0 rounded-2xl border-2 border-dashed border-white/20 hover:border-emerald-500/60 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center p-3 text-center transition-all cursor-pointer group"
                      title={`এই স্থানে আরও ${5 - placePhotos.length}টি ছবি যোগ করতে পারবেন`}
                    >
                      <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-[#004526] text-stone-400 group-hover:text-white flex items-center justify-center transition-colors shadow-sm mb-1.5">
                        <Plus className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <span className="text-[11px] font-bold text-stone-300 group-hover:text-white">
                        ছবি যোগ করুন
                      </span>
                      <span className="text-[9px] text-stone-400 mt-0.5 font-light">
                        ({5 - placePhotos.length}টি স্লট বাকি)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add New Place / Spot Button / Form (Shown ONLY in Edit Mode) */}
        {isEditing && (
          <div className="p-5 sm:p-6 bg-[#12141A]/60 border border-dashed border-white/20 rounded-3xl">
            {isAddingPlace ? (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  নতুন স্থান বা দর্শনীয় স্পটের নাম
                </h4>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    value={newPlaceNameDraft}
                    onChange={(e) => setNewPlaceNameDraft(e.target.value)}
                    placeholder="যেমন: আলীকদম, মিরিঞ্জা ভ্যালি, নীলগিরি..."
                    className="flex-1 px-4 py-2.5 text-xs bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#004526] transition-colors"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewPlace();
                      }
                    }}
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddNewPlace()}
                      className="px-5 py-2.5 bg-[#004526] hover:bg-[#005a32] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                    >
                      যোগ করুন
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingPlace(false);
                        setNewPlaceNameDraft('');
                      }}
                      className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-stone-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      বাতিল
                    </button>
                  </div>
                </div>

                {/* Suggestions from district famousSpots */}
                {district.famousSpots && district.famousSpots.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-2">
                    <span className="text-[10px] text-stone-400">পরামর্শ:</span>
                    {district.famousSpots.map((spot) => (
                      <button
                        key={spot}
                        type="button"
                        onClick={() => handleAddNewPlace(spot)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] text-emerald-300 cursor-pointer transition-colors"
                      >
                        + {spot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingPlace(true)}
                className="w-full py-3 flex items-center justify-center gap-2 text-xs font-bold text-stone-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all cursor-pointer group"
              >
                <div className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-[#004526] text-white flex items-center justify-center transition-colors">
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>+ নতুন স্থান / স্পট যোগ করুন (যেমন: আলীকদম, মিরিঞ্জা ভ্যালি...)</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Save Button Bar (Shown ONLY in Edit Mode) */}
      {isEditing && (
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <div>
            {isSavedToast && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" /> সফলভাবে সেভ হয়েছে!
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSaveAll}
            id="journal-save-bottom-btn"
            className="px-6 py-2.5 bg-[#004526] hover:bg-[#005a32] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#004526]/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            <span>পরিবর্তন সেভ করুন</span>
          </button>
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
              ছবিটি {district.bn_name} অ্যালবাম থেকে সরিয়ে ফেলা হবে।
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
