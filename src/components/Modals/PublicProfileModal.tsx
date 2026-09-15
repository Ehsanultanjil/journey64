import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Lock,
  Sparkles,
  MapPin,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  Shield,
  Compass,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DISTRICTS, getDistrictById } from '../../data/districts';

export const PublicProfileModal: React.FC = () => {
  const {
    viewingPublicProfile,
    isLoadingPublicProfile,
    closePublicProfile,
    openLightbox,
  } = useApp();

  const profile = viewingPublicProfile?.profile;
  const isLocked = profile?.isLocked;
  const visitedCount = viewingPublicProfile?.visitedCount || 0;
  const percentage = Math.round((visitedCount / 64) * 100);

  // Visited districts objects
  const visitedDistrictsList = useMemo(() => {
    if (!viewingPublicProfile?.visitedDistricts) return [];
    return viewingPublicProfile.visitedDistricts
      .map((id) => getDistrictById(id))
      .filter((d): d is NonNullable<typeof d> => !!d);
  }, [viewingPublicProfile?.visitedDistricts]);



  if (!viewingPublicProfile && !isLoadingPublicProfile) return null;

  const displayName = profile?.displayName || profile?.name || 'ভ্রমণকারী';
  const handleName = profile?.handle || profile?.displayName?.toLowerCase().replace(/\s+/g, '') || profile?.name?.toLowerCase().replace(/\s+/g, '') || profile?.id?.slice(0, 8);
  const coverUrl = profile?.coverUrl || 'https://images.unsplash.com/photo-1608958435020-e8a7109ba809?q=80&w=1600&auto=format&fit=crop';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md font-body">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={closePublicProfile} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-[#12141A] border border-white/15 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]"
        >
          {/* Close Floating Button */}
          <button
            onClick={closePublicProfile}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95"
            title="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>

          {isLoadingPublicProfile ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-stone-400">
              <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">প্রোফাইল লোড হচ্ছে...</p>
            </div>
          ) : profile ? (
            <div className="overflow-y-auto no-scrollbar flex-1">
              {/* Cover Banner */}
              <div className="relative h-36 sm:h-48 w-full bg-stone-900 overflow-hidden">
                <img
                  src={coverUrl}
                  alt="Cover"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12141A] via-[#12141A]/40 to-black/30" />
              </div>

              {/* Profile Card Header */}
              <div className="px-5 sm:px-8 pb-5 pt-0 relative">
                <div className="flex items-end justify-between -mt-14 sm:-mt-16 mb-4">
                  {/* Avatar */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden bg-[#0A0C10] border-4 border-[#12141A] shadow-2xl relative flex items-center justify-center">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#004526] to-[#002e18] text-white flex items-center justify-center font-display text-2xl sm:text-3xl font-bold">
                        {displayName[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Privacy / Locked Icon: lock icon only if locked, nothing if unlocked */}
                  {isLocked && (
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-stone-400" title="লক করা">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Name, Handle, Location */}
                <div className="space-y-2">
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {displayName}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-400">
                      <span>@{handleName}</span>
                      {profile.location && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            {profile.location}
                          </span>
                        </>
                      )}
                      {profile.joinedDate && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-stone-400" />
                            {profile.joinedDate.slice(0, 4)} থেকে যুক্ত
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {profile.bio && (
                    <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed max-w-xl">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* BODY: LOCKED STATE vs PUBLIC ACTIVE STATE */}
              {isLocked ? (
                <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-2 text-stone-500">
                  <Lock className="w-6 h-6" />
                  <p className="text-xs">প্রোফাইলটি লক করা আছে</p>
                </div>
              ) : (
                <div className="px-5 sm:px-8 pb-8 space-y-6">
                  {/* Exploration Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-stone-400">
                      <span className="flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-emerald-400" />
                        <span>বাংলাদেশ অন্বেষণ অগ্রগতি</span>
                      </span>
                      <span className="font-bold text-white">{visitedCount}/৬৪ জেলা ({percentage}%)</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#004526] to-emerald-400 transition-all duration-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Visited Districts Section */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ভ্রমণকৃত জেলাসমূহ ({visitedDistrictsList.length})</span>
                    </h4>

                    {visitedDistrictsList.length === 0 ? (
                      <p className="text-xs text-stone-400 italic py-2">
                        ব্যবহারকারী এখনও কোনো জেলা ভ্রমণের তথ্য যুক্ত করেননি।
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1 no-scrollbar">
                        {visitedDistrictsList.map((d) => (
                          <span
                            key={d.id}
                            className="px-2.5 py-1 rounded-lg bg-[#004526]/40 text-emerald-200 border border-emerald-500/30 text-xs font-body font-semibold flex items-center gap-1 shadow-2xs"
                          >
                            <span>{d.bn_name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* District Memories & Photos Feed */}
                  {viewingPublicProfile.coverPhotos && viewingPublicProfile.coverPhotos.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>ভ্রমণ স্মৃতির গ্যালারি ({viewingPublicProfile.coverPhotos.length})</span>
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {viewingPublicProfile.coverPhotos.map((item) => (
                          <div
                            key={item.districtId}
                            onClick={() => {
                              openLightbox([
                                {
                                  id: item.districtId,
                                  districtId: item.districtId,
                                  url: item.coverUrl,
                                  caption: `${item.districtBnName} — ${item.caption || 'ভ্রমণ স্মৃতি'}`,
                                  sortOrder: 0,
                                  createdAt: new Date().toISOString(),
                                },
                              ], 0, item.districtBnName);
                            }}
                            className="group relative aspect-square rounded-2xl overflow-hidden bg-black/40 border border-white/10 cursor-pointer shadow-sm hover:border-emerald-500/60 transition-all hover:scale-[1.02]"
                          >
                            <img
                              src={item.coverUrl}
                              alt={item.districtBnName}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-2.5 flex flex-col justify-between">
                              <span className="self-start px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/15">
                                {item.districtBnName}
                              </span>
                              {item.caption && (
                                <p className="text-[10px] text-stone-300 font-light truncate">
                                  {item.caption}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
