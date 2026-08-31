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
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Map
        </button>

        {/* Favorite & Rating in Header */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-2.5 py-1.5 rounded-2xl shadow-2xs">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => updateDistrictRating(districtId, star)}
                className="p-0.5 text-amber-400 hover:scale-110 transition-transform"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    star <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300 dark:text-stone-600'
                  }`}
                />
              </button>
            ))}
          </div>

          <button
            id="journal-fav-btn"
            onClick={() => toggleDistrictFavorite(districtId)}
            className={`p-2 rounded-2xl border transition-all ${
              isFavorite
                ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400 shadow-2xs'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-400 hover:text-rose-500'
            }`}
            aria-label="Toggle favorite"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Hero Cover Photo & Title Container */}
      <div className="relative rounded-3xl overflow-hidden bg-stone-900 text-white shadow-xl border border-stone-200 dark:border-stone-800">
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
              className="absolute top-4 right-4 p-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-colors"
              aria-label="View fullscreen photo"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="h-64 sm:h-72 w-full bg-gradient-to-br from-emerald-900 via-stone-900 to-stone-950 flex flex-col items-center justify-center p-8 text-center">
            <Compass className="w-16 h-16 text-emerald-400/40 mb-3" />
            <p className="text-sm text-emerald-200/90 font-medium">
              Preserve your favorite memory of {district.name}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
            >
              <Camera className="w-3.5 h-3.5" />
              Upload Cover Photograph
            </button>
          </div>
        )}

        {/* Hero Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600/90 backdrop-blur-md text-white">
              {district.division} Division
            </span>
            {districtVisits.length > 1 && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-800/80 backdrop-blur-md text-stone-200 border border-white/10">
                {districtVisits.length} Trips Recorded
              </span>
            )}
            {connectedTrip && (
              <button
                onClick={() => openTripDetail(connectedTrip.id)}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-600/80 hover:bg-sky-600 backdrop-blur-md text-white flex items-center gap-1 transition-colors"
              >
                <Car className="w-3 h-3" />
                Part of: {connectedTrip.name}
              </button>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight flex items-baseline gap-3">
            {district.name}
            <span className="text-lg sm:text-2xl font-normal text-stone-300">
              {district.bn_name}
            </span>
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs sm:text-sm text-stone-300">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Visited: {activeVisit?.visitDate || districtData?.firstVisitedDate || 'Recorded'}
            </span>
            <span className="flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-400" />
              {totalPhotos} / 5 memories saved
            </span>
          </div>
        </div>
      </div>

      {/* Multiple Visits / Trips Selector Tabs (if more than 1 visit exists or user wants to log another journey) */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider whitespace-nowrap mr-1">
            Journeys:
          </span>
          {districtVisits.map((v, idx) => (
            <button
              key={v.id}
              onClick={() => {
                setSelectedVisitId(v.id);
                setNotesDraft(v.notes || '');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                (activeVisit?.id === v.id || (!activeVisit && idx === 0))
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {v.visitDate
                ? new Date(v.visitDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
                : `Visit #${idx + 1}`}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsAddingNewVisit(true)}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-1 transition-colors ml-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Log Another Trip Here
        </button>
      </div>

      {/* Modal for Logging Another Journey */}
      {isAddingNewVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4"
          >
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Log Another Visit to {district.name}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Trip Title (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Winter Vacation 2026"
                  value={newVisitTitle}
                  onChange={(e) => setNewVisitTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Visit Date
                </label>
                <input
                  type="date"
                  value={newVisitDate}
                  onChange={(e) => setNewVisitDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAddingNewVisit(false)}
                className="px-3 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateVisit}
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
              >
                Save Journey
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Photo Album Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-600" />
              Photo Album
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Preserve 3–5 of your best memories from this district ({totalPhotos} / 5)
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
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-2xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 disabled:opacity-50"
            >
              {isUploading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              Add Photo ({5 - totalPhotos} left)
            </button>
          )}
        </div>

        {/* Editorial Photo Grid (1 large + 2 medium + 2 bottom) */}
        {totalPhotos === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-10 text-center cursor-pointer transition-colors bg-white/40 dark:bg-stone-900/40"
          >
            <ImageIcon className="w-10 h-10 text-stone-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">
              Save This Memory
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
              Add 3–5 photos to remember this journey forever. Click here to select your first photo.
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
                  className={`group relative rounded-2xl overflow-hidden bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm ${
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
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600/90 backdrop-blur-md text-white shadow-2xs">
                        Cover Photo
                      </span>
                    )}
                  </div>

                  {/* Actions overlay on hover */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md rounded-xl p-1">
                    {!isCover && (
                      <button
                        onClick={() => updatePhoto(photo.id, { isCover: true })}
                        title="Set as Cover Photo"
                        className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg text-xs"
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
                      className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg text-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletePhotoConfirmId(photo.id)}
                      title="Delete Photo"
                      className="p-1.5 text-rose-300 hover:text-rose-100 hover:bg-rose-600/60 rounded-lg text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Caption bar */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white">
                    {editingPhotoCaptionId === photo.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={captionDraft}
                          onChange={(e) => setCaptionDraft(e.target.value)}
                          placeholder="Write a short caption..."
                          className="flex-1 px-2.5 py-1 text-xs bg-black/50 border border-white/30 rounded-lg text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveCaption(photo.id);
                            if (e.key === 'Escape') setEditingPhotoCaptionId(null);
                          }}
                        />
                        <button
                          onClick={() => handleSaveCaption(photo.id)}
                          className="p-1.5 bg-emerald-600 rounded-lg text-white hover:bg-emerald-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingPhotoCaptionId(null)}
                          className="p-1.5 bg-stone-700 rounded-lg text-white hover:bg-stone-600"
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
                        className="text-xs text-stone-200 line-clamp-2 cursor-pointer hover:text-white"
                      >
                        {photo.caption ? `"${photo.caption}"` : '+ Add a caption...'}
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
            className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-3"
          >
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Delete this memory photo?
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              This photo will be removed from your {district.name} album.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletePhotoConfirmId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deletePhoto(deletePhotoConfirmId);
                  setDeletePhotoConfirmId(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Personal Memory Journal Note */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span className="text-emerald-700 dark:text-emerald-400 font-serif italic text-2xl">
              ✍️
            </span>
            MY MEMORY
          </h2>
          {!isEditingNotes && (
            <button
              onClick={() => setIsEditingNotes(true)}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Story
            </button>
          )}
        </div>

        {isEditingNotes ? (
          <div className="space-y-3">
            <textarea
              rows={5}
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              placeholder={`Write your personal story of visiting ${district.name} — who you traveled with, what you tasted, quiet moments, or favorite adventures...`}
              className="w-full p-4 text-sm font-editorial leading-relaxed bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-2xl text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setNotesDraft(activeVisit?.notes || districtData?.notes || '');
                  setIsEditingNotes(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-5 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
              >
                Save Memory
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsEditingNotes(true)}
            className="cursor-pointer group rounded-2xl p-4 -m-4 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
          >
            {notesDraft.trim().length > 0 ? (
              <p className="text-base font-editorial leading-relaxed text-stone-700 dark:text-stone-300 italic whitespace-pre-line">
                "{notesDraft}"
              </p>
            ) : (
              <p className="text-sm font-editorial text-stone-400 italic">
                No story written yet for this trip. Click here to pen your personal thoughts, favorite moments, and memories of {district.name}...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
