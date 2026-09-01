import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  District,
  DistrictStatus,
  DistrictUserData,
  Visit,
  Trip,
  Photo,
  UserProfile,
  TravelStats,
  DivisionStat,
  Achievement,
  ActiveTab,
} from '../types';
import { DISTRICTS, getDistrictById } from '../data/districts';
import {
  StorageService,
  AppSettings,
  DEFAULT_SETTINGS,
  DEFAULT_PROFILE,
} from '../lib/storage';
import {
  calculateTravelStats,
  calculateDivisionStats,
  evaluateAchievements,
} from '../lib/stats';
import { User } from '@supabase/supabase-js';
import { checkSupabaseConnection } from '../lib/supabase/client';
import { SupabaseAuth } from '../lib/supabase/auth';
import { SupabaseDB } from '../lib/supabase/db';

interface UnlockNotification {
  district: District;
  totalVisited: number;
  percentage: number;
}

interface LightboxState {
  isOpen: boolean;
  photos: Photo[];
  currentIndex: number;
  districtName?: string;
}

export interface CloudSyncState {
  connected: boolean;
  syncing: boolean;
  lastSynced?: string;
  message?: string;
  error?: string;
}

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  authUser: User | null;
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  userData: Record<string, DistrictUserData>;
  visits: Visit[];
  trips: Trip[];
  profile: UserProfile;
  settings: AppSettings;
  stats: TravelStats;

  divisionStats: DivisionStat[];
  achievements: Achievement[];
  cloudSync: CloudSyncState;
  pushToCloud: () => Promise<{ success: boolean; error?: string }>;
  pullFromCloud: () => Promise<{ success: boolean; error?: string }>;

  selectedDistrict: District | null;
  selectedDistrictVisits: Visit[];
  selectedDistrictPhotos: Photo[];
  selectDistrict: (districtId: string | null) => void;
  viewingJournalDistrictId: string | null;
  openDistrictJournal: (districtId: string | null) => void;
  activeTripId: string | null;
  openTripDetail: (tripId: string | null) => void;
  unlockModalData: UnlockNotification | null;
  closeUnlockModal: () => void;
  show100PercentModal: boolean;
  close100PercentModal: () => void;
  lightbox: LightboxState;
  openLightbox: (photos: Photo[], index?: number, districtName?: string) => void;
  closeLightbox: () => void;
  setLightboxIndex: (index: number) => void;
  setDistrictStatus: (
    districtId: string,
    status: DistrictStatus,
    extra?: { visitDate?: string; notes?: string; rating?: number }
  ) => void;
  updateDistrictNotes: (districtId: string, notes: string, visitDate?: string) => void;
  updateDistrictRating: (districtId: string, rating: number) => void;
  toggleDistrictFavorite: (districtId: string) => void;
  addVisit: (visit: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>) => Visit;
  updateVisit: (visitId: string, updates: Partial<Visit>) => void;
  deleteVisit: (visitId: string) => void;
  addPhoto: (districtId: string, photo: { url: string; caption?: string; isCover?: boolean; takenDate?: string }) => Photo | null;
  updatePhoto: (photoId: string, updates: Partial<Photo>) => void;
  deletePhoto: (photoId: string) => void;
  reorderPhotos: (districtId: string, photoIds: string[]) => void;
  createTrip: (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => Trip;
  updateTrip: (tripId: string, updates: Partial<Trip>) => void;
  deleteTrip: (tripId: string) => void;
  updateProfile: (profileUpdates: Partial<UserProfile>) => void;
  updateSettings: (settingsUpdates: Partial<AppSettings>) => void;
  resetToCleanSlate: () => void;
  loadDemoMode: () => void;
  importJsonBackup: (jsonString: string) => { success: boolean; error?: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('explore');
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  const [userData, setUserData] = useState<Record<string, DistrictUserData>>(() => StorageService.loadData().userData);
  const [visits, setVisits] = useState<Visit[]>(() => StorageService.loadData().visits);
  const [trips, setTrips] = useState<Trip[]>(() => StorageService.loadData().trips);
  const [profile, setProfile] = useState<UserProfile>(() => StorageService.loadData().profile);
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.loadData().settings);

  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [viewingJournalDistrictId, setViewingJournalDistrictId] = useState<string | null>(null);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  const [unlockModalData, setUnlockModalData] = useState<UnlockNotification | null>(null);
  const [show100PercentModal, setShow100PercentModal] = useState<boolean>(false);

  const [lightbox, setLightbox] = useState<LightboxState>({
    isOpen: false,
    photos: [],
    currentIndex: 0,
  });

  // Supabase Cloud Sync State
  const [cloudSync, setCloudSync] = useState<CloudSyncState>({
    connected: false,
    syncing: false,
    message: 'Checking Supabase connection...',
  });

  const isPullingCloudRef = useRef(false);
  const backupDebounceTimerRef = useRef<any>(null);

  const pullAndSyncUserCloudData = async (user: User) => {
    if (isPullingCloudRef.current) return;
    isPullingCloudRef.current = true;

    try {
      setCloudSync((prev) => ({
        ...prev,
        connected: true,
        syncing: true,
        message: 'ক্লাউড থেকে ডাটা সিঙ্ক হচ্ছে...',
      }));

      // 1. Pull latest cloud backup & structured tables for this user
      const backupRes = await SupabaseDB.pullLatestBackup(user.id);
      const tableUserData = await SupabaseDB.fetchUserData(user.id);
      const tableVisits = await SupabaseDB.fetchVisits(user.id);
      const tableTrips = await SupabaseDB.fetchTrips(user.id);

      const cloudUserData: Record<string, DistrictUserData> =
        backupRes.data?.userData && Object.keys(backupRes.data.userData).length > 0
          ? backupRes.data.userData
          : tableUserData && Object.keys(tableUserData).length > 0
          ? tableUserData
          : {};

      const cloudVisits: Visit[] =
        backupRes.data?.visits && backupRes.data.visits.length > 0
          ? backupRes.data.visits
          : tableVisits && tableVisits.length > 0
          ? tableVisits
          : [];

      const cloudTrips: Trip[] =
        backupRes.data?.trips && backupRes.data.trips.length > 0
          ? backupRes.data.trips
          : tableTrips && tableTrips.length > 0
          ? tableTrips
          : [];

      const cloudProfile = backupRes.data?.profile;

      // 2. Functional deep merge: Combine current latest state + storage with cloud data
      setUserData((prev) => {
        const local = StorageService.loadData();
        const baseSource: Record<string, DistrictUserData> = { ...local.userData, ...prev };
        const merged: Record<string, DistrictUserData> = { ...cloudUserData };

        (Object.keys(baseSource) as string[]).forEach((districtId) => {
          const localDistrict = baseSource[districtId];
          const existingCloud = merged[districtId];
          if (!existingCloud) {
            merged[districtId] = localDistrict;
          } else {
            const isVisited = existingCloud.status === 'visited' || localDistrict.status === 'visited';
            const isWant = isVisited ? false : (existingCloud.status === 'want_to_visit' || localDistrict.status === 'want_to_visit');
            const finalStatus = isVisited ? 'visited' : isWant ? 'want_to_visit' : 'not_visited';
            
            merged[districtId] = {
              districtId,
              status: finalStatus,
              isFavorite: !!(existingCloud.isFavorite || localDistrict.isFavorite),
              rating: existingCloud.rating || localDistrict.rating || 5,
              notes: existingCloud.notes || localDistrict.notes || '',
              firstVisitedDate: existingCloud.firstVisitedDate || localDistrict.firstVisitedDate,
              updatedAt: new Date().toISOString(),
            };
          }
        });

        StorageService.saveUserData(merged);
        SupabaseDB.syncDistrictUserData(merged, user.id).catch(() => {});
        return merged;
      });

      setVisits((prev) => {
        const local = StorageService.loadData();
        const visitMap = new Map<string, Visit>();
        cloudVisits.forEach((v) => visitMap.set(v.id, v));
        [...local.visits, ...prev].forEach((v) => {
          if (!visitMap.has(v.id)) {
            visitMap.set(v.id, v);
          } else {
            const existing = visitMap.get(v.id)!;
            const photoMap = new Map<string, any>();
            (existing.photos || []).forEach((p) => photoMap.set(p.url, p));
            (v.photos || []).forEach((p) => photoMap.set(p.url, p));
            existing.photos = Array.from(photoMap.values());
            existing.notes = existing.notes || v.notes;
            existing.visitDate = existing.visitDate || v.visitDate;
          }
        });
        const mergedVisits = Array.from(visitMap.values());
        StorageService.saveVisits(mergedVisits);
        SupabaseDB.syncVisits(mergedVisits, user.id).catch(() => {});
        return mergedVisits;
      });

      setTrips((prev) => {
        const local = StorageService.loadData();
        const tripMap = new Map<string, Trip>();
        cloudTrips.forEach((t) => tripMap.set(t.id, t));
        [...local.trips, ...prev].forEach((t) => tripMap.set(t.id, t));
        const mergedTrips = Array.from(tripMap.values());
        StorageService.saveTrips(mergedTrips);
        SupabaseDB.syncTrips(mergedTrips, user.id).catch(() => {});
        return mergedTrips;
      });

      if (cloudProfile) {
        setProfile(cloudProfile);
        StorageService.saveProfile(cloudProfile);
      }

      setCloudSync((prev) => ({
        ...prev,
        connected: true,
        syncing: false,
        lastSynced: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: 'সুপাবেস ক্লাউডে সফলভাবে সিঙ্ক হয়েছে',
      }));
    } catch (err) {
      console.error('Error syncing cloud data on login:', err);
      setCloudSync((prev) => ({ ...prev, syncing: false }));
    } finally {
      isPullingCloudRef.current = false;
    }
  };

  // Track Supabase Auth session changes (Single authoritative listener)
  useEffect(() => {
    const { data: authListener } = SupabaseAuth.onAuthStateChange(async (event, session) => {
      const user = session?.user || null;
      setAuthUser(user);
      if (user) {
        const uName = user.user_metadata?.display_name || user.user_metadata?.name || user.email?.split('@')[0];
        if (uName) {
          setProfile((prev) => ({
            ...prev,
            name: uName,
            displayName: uName,
          }));
        }
        pullAndSyncUserCloudData(user);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Verify Supabase connection on startup
  useEffect(() => {
    let isMounted = true;
    checkSupabaseConnection().then(async (res) => {
      if (!isMounted) return;
      setCloudSync((prev) => ({
        ...prev,
        connected: res.connected,
        message: res.message,
      }));
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Load initial data from StorageService
  useEffect(() => {
    const loaded = StorageService.loadData();
    setUserData(loaded.userData);
    setVisits(loaded.visits);
    setTrips(loaded.trips);
    setProfile(loaded.profile);
    // Lock dark mode permanently
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  }, []);

  // Manual trigger for cloud synchronization
  const syncNow = async () => {
    if (!authUser) {
      openAuthModal();
      return;
    }
    await pullAndSyncUserCloudData(authUser);
  };

  // Schedule debounced snapshot backup
  const scheduleDebouncedBackup = (currentData: {
    userData: Record<string, DistrictUserData>;
    visits: Visit[];
    trips: Trip[];
    profile: UserProfile;
    settings: AppSettings;
  }) => {
    if (backupDebounceTimerRef.current) {
      clearTimeout(backupDebounceTimerRef.current);
    }
    backupDebounceTimerRef.current = setTimeout(() => {
      if (authUser?.id) {
        SupabaseDB.pushBackup('auto_sync', currentData, authUser.id).catch(() => {});
      }
    }, 1200);
  };

  // Sync state to storage and cloud
  const syncUserData = (newUserData: Record<string, DistrictUserData>) => {
    setUserData(newUserData);
    StorageService.saveUserData(newUserData);
    const userId = authUser?.id;
    SupabaseDB.syncDistrictUserData(newUserData, userId).catch(() => {});
    scheduleDebouncedBackup({
      userData: newUserData,
      visits,
      trips,
      profile,
      settings,
    });
  };

  const syncVisits = (newVisits: Visit[]) => {
    setVisits(newVisits);
    StorageService.saveVisits(newVisits);
    const userId = authUser?.id;
    SupabaseDB.syncVisits(newVisits, userId).catch(() => {});
    scheduleDebouncedBackup({
      userData,
      visits: newVisits,
      trips,
      profile,
      settings,
    });
  };

  const syncTrips = (newTrips: Trip[]) => {
    setTrips(newTrips);
    StorageService.saveTrips(newTrips);
    const userId = authUser?.id;
    SupabaseDB.syncTrips(newTrips, userId).catch(() => {});
    scheduleDebouncedBackup({
      userData,
      visits,
      trips: newTrips,
      profile,
      settings,
    });
  };

  const syncProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    StorageService.saveProfile(newProfile);
    const userId = authUser?.id;
    SupabaseDB.saveProfile(newProfile, userId).catch(() => {});
    SupabaseDB.pushBackup('auto_sync', {
      userData,
      visits,
      trips,
      profile: newProfile,
      settings,
    }, userId).catch(() => {});
  };

  const syncSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    const userId = authUser?.id;
    SupabaseDB.saveSettings(newSettings, userId).catch(() => {});
    SupabaseDB.pushBackup('auto_sync', {
      userData,
      visits,
      trips,
      profile,
      settings: newSettings,
    }, userId).catch(() => {});
  };

  // Memoized stats & achievements
  const stats = useMemo(() => {
    return calculateTravelStats(userData, visits, trips);
  }, [userData, visits, trips]);

  const divisionStats = useMemo(() => {
    return calculateDivisionStats(userData);
  }, [userData]);

  const achievements = useMemo(() => {
    return evaluateAchievements(userData, visits, trips);
  }, [userData, visits, trips]);

  // Selected district helpers
  const selectedDistrict = useMemo(() => {
    if (!selectedDistrictId) return null;
    return getDistrictById(selectedDistrictId) || null;
  }, [selectedDistrictId]);

  const selectedDistrictVisits = useMemo(() => {
    const dId = viewingJournalDistrictId || selectedDistrictId;
    if (!dId) return [];
    return visits.filter((v) => v.districtId === dId);
  }, [viewingJournalDistrictId, selectedDistrictId, visits]);

  const selectedDistrictPhotos = useMemo(() => {
    const dId = viewingJournalDistrictId || selectedDistrictId;
    if (!dId) return [];
    const photos: Photo[] = [];
    visits
      .filter((v) => v.districtId === dId)
      .forEach((v) => {
        if (v.photos) photos.push(...v.photos);
      });
    return photos.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [viewingJournalDistrictId, selectedDistrictId, visits]);

  // Actions
  const selectDistrict = (districtId: string | null) => {
    setSelectedDistrictId(districtId);
  };

  const openDistrictJournal = (districtId: string | null) => {
    setSelectedDistrictId(null);
    setViewingJournalDistrictId(districtId);
    if (districtId) {
      setActiveTab('memories');
    }
  };

  const openTripDetail = (tripId: string | null) => {
    setActiveTripId(tripId);
    if (tripId) {
      setActiveTab('trips');
    }
  };

  const triggerConfetti = (type: 'unlock' | 'complete' = 'unlock') => {
    try {
      if (type === 'complete') {
        confetti({
          particleCount: 160,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#059669', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'],
        });
      } else {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#059669', '#10B981', '#F59E0B'],
        });
      }
    } catch (e) {
      // Ignore if canvas-confetti is not available
    }
  };

  const setDistrictStatus = (
    districtId: string,
    status: DistrictStatus,
    extra?: { visitDate?: string; notes?: string; rating?: number }
  ) => {
    const current = userData[districtId];
    const previousStatus = current?.status || 'not_visited';
    const now = new Date().toISOString();

    const updated: DistrictUserData = {
      districtId,
      status,
      rating: extra?.rating !== undefined ? extra.rating : current?.rating,
      isFavorite: current?.isFavorite || false,
      notes: extra?.notes !== undefined ? extra.notes : current?.notes,
      firstVisitedDate:
        status === 'visited'
          ? extra?.visitDate || current?.firstVisitedDate || new Date().toISOString().split('T')[0]
          : current?.firstVisitedDate,
      updatedAt: now,
    };

    const newUserData = {
      ...userData,
      [districtId]: updated,
    };

    syncUserData(newUserData);

    // If new visit status is marked as visited for the first time, create a default visit entry if none exists
    if (status === 'visited' && previousStatus !== 'visited') {
      const existingVisits = visits.filter((v) => v.districtId === districtId);
      if (existingVisits.length === 0) {
        const newVisit: Visit = {
          id: `visit-${districtId}-${Date.now()}`,
          districtId,
          visitDate: extra?.visitDate || new Date().toISOString().split('T')[0],
          notes: extra?.notes || '',
          rating: extra?.rating || 5,
          photos: [],
          createdAt: now,
          updatedAt: now,
        };
        syncVisits([newVisit, ...visits]);
      }

      // Check new totals
      const newStats = calculateTravelStats(newUserData, visits, trips);
      const district = getDistrictById(districtId);
      if (district) {
        setUnlockModalData({
          district,
          totalVisited: newStats.visitedCount,
          percentage: newStats.percentageExplored,
        });
        triggerConfetti(newStats.visitedCount === 64 ? 'complete' : 'unlock');
        if (newStats.visitedCount === 64) {
          setShow100PercentModal(true);
        }
      }
    }
  };

  const updateDistrictNotes = (districtId: string, notes: string, visitDate?: string) => {
    const current = userData[districtId] || {
      districtId,
      status: 'visited',
      updatedAt: new Date().toISOString(),
    };
    const newUserData = {
      ...userData,
      [districtId]: {
        ...current,
        notes,
        ...(visitDate ? { firstVisitedDate: visitDate } : {}),
        updatedAt: new Date().toISOString(),
      },
    };
    syncUserData(newUserData);

    // Also sync with the primary visit
    const primaryVisit = visits.find((v) => v.districtId === districtId);
    if (primaryVisit) {
      updateVisit(primaryVisit.id, {
        notes,
        ...(visitDate ? { visitDate } : {}),
      });
    } else {
      const now = new Date().toISOString();
      const newVisit: Visit = {
        id: `visit-${districtId}-${Date.now()}`,
        districtId,
        visitDate: visitDate || now.split('T')[0],
        notes,
        rating: current.rating || 5,
        photos: [],
        createdAt: now,
        updatedAt: now,
      };
      syncVisits([newVisit, ...visits]);
    }
  };

  const updateDistrictRating = (districtId: string, rating: number) => {
    const current = userData[districtId] || {
      districtId,
      status: 'visited',
      updatedAt: new Date().toISOString(),
    };
    const newUserData = {
      ...userData,
      [districtId]: {
        ...current,
        rating,
        updatedAt: new Date().toISOString(),
      },
    };
    syncUserData(newUserData);
  };

  const toggleDistrictFavorite = (districtId: string) => {
    const current = userData[districtId] || {
      districtId,
      status: 'visited',
      updatedAt: new Date().toISOString(),
    };
    const newUserData = {
      ...userData,
      [districtId]: {
        ...current,
        isFavorite: !current.isFavorite,
        updatedAt: new Date().toISOString(),
      },
    };
    syncUserData(newUserData);
  };

  const addVisit = (visitData: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>): Visit => {
    const now = new Date().toISOString();
    const newVisit: Visit = {
      ...visitData,
      id: `visit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: now,
      updatedAt: now,
    };

    const newVisits = [newVisit, ...visits];
    syncVisits(newVisits);

    // Ensure district status is visited
    if (userData[visitData.districtId]?.status !== 'visited') {
      setDistrictStatus(visitData.districtId, 'visited', { visitDate: visitData.visitDate });
    }

    return newVisit;
  };

  const updateVisit = (visitId: string, updates: Partial<Visit>) => {
    const newVisits = visits.map((v) => {
      if (v.id === visitId) {
        return {
          ...v,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return v;
    });
    syncVisits(newVisits);
  };

  const deleteVisit = (visitId: string) => {
    const target = visits.find((v) => v.id === visitId);
    const newVisits = visits.filter((v) => v.id !== visitId);
    syncVisits(newVisits);

    // If no visits remain for this district, we keep the district status as is, but we can clean up if desired
    if (target) {
      const remainingForDistrict = newVisits.filter((v) => v.districtId === target.districtId);
      if (remainingForDistrict.length === 0) {
        // District still stays visited as per requirement, or user can manually unvisit
      }
    }
  };

  const addPhoto = (
    districtId: string,
    photoData: { url: string; caption?: string; isCover?: boolean; takenDate?: string }
  ): Photo | null => {
    // Find or create primary visit for this district
    let targetVisit = visits.find((v) => v.districtId === districtId);
    let allVisits = [...visits];
    const now = new Date().toISOString();

    if (!targetVisit) {
      targetVisit = {
        id: `visit-${districtId}-${Date.now()}`,
        districtId,
        visitDate: photoData.takenDate || now.split('T')[0],
        notes: '',
        rating: 5,
        photos: [],
        createdAt: now,
        updatedAt: now,
      };
      allVisits = [targetVisit, ...allVisits];
    }

    // Check max 5 photos per district constraint
    const totalCurrentPhotos = targetVisit.photos?.length || 0;
    if (totalCurrentPhotos >= 5) {
      return null;
    }

    const isFirstPhoto = totalCurrentPhotos === 0;
    const newPhoto: Photo = {
      id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      districtId,
      visitId: targetVisit.id,
      url: photoData.url,
      caption: photoData.caption || '',
      sortOrder: totalCurrentPhotos,
      isCover: photoData.isCover !== undefined ? photoData.isCover : isFirstPhoto,
      isFavoriteMemory: isFirstPhoto,
      takenDate: photoData.takenDate || targetVisit.visitDate,
      createdAt: now,
    };

    if (photoData.takenDate) {
      targetVisit.visitDate = photoData.takenDate;
    }

    const updatedPhotos = [...(targetVisit.photos || []), newPhoto];
    const updatedVisits = allVisits.map((v) => {
      if (v.id === targetVisit!.id) {
        return {
          ...v,
          visitDate: photoData.takenDate || v.visitDate,
          photos: updatedPhotos,
          updatedAt: now,
        };
      }
      return v;
    });

    syncVisits(updatedVisits);

    // Ensure status is visited and sync firstVisitedDate
    const currentUD = userData[districtId];
    if (!currentUD || currentUD.status !== 'visited' || (photoData.takenDate && !currentUD.firstVisitedDate)) {
      syncUserData({
        ...userData,
        [districtId]: {
          ...(currentUD || { districtId, updatedAt: now }),
          status: 'visited',
          firstVisitedDate: photoData.takenDate || currentUD?.firstVisitedDate || now.split('T')[0],
          updatedAt: now,
        },
      });
    }

    return newPhoto;
  };

  const updatePhoto = (photoId: string, updates: Partial<Photo>) => {
    const newVisits = visits.map((v) => {
      if (!v.photos) return v;
      let hasTarget = false;
      const newPhotos = v.photos.map((p) => {
        if (p.id === photoId) {
          hasTarget = true;
          return { ...p, ...updates };
        }
        // If updates.isCover is true, set others to false
        if (updates.isCover) {
          return { ...p, isCover: false };
        }
        return p;
      });

      if (hasTarget) {
        return { ...v, photos: newPhotos, updatedAt: new Date().toISOString() };
      }
      return v;
    });

    syncVisits(newVisits);
  };

  const deletePhoto = (photoId: string) => {
    const newVisits = visits.map((v) => {
      if (!v.photos) return v;
      const targetPhoto = v.photos.find((p) => p.id === photoId);
      if (!targetPhoto) return v;

      const remaining = v.photos.filter((p) => p.id !== photoId);
      // If deleted photo was cover, assign new cover to the first remaining
      if (targetPhoto.isCover && remaining.length > 0) {
        remaining[0].isCover = true;
      }
      return { ...v, photos: remaining, updatedAt: new Date().toISOString() };
    });

    syncVisits(newVisits);
  };

  const reorderPhotos = (districtId: string, photoIds: string[]) => {
    const newVisits = visits.map((v) => {
      if (v.districtId !== districtId || !v.photos) return v;
      const photoMap = new Map<string, Photo>(v.photos.map((p) => [p.id, p]));
      const reordered: Photo[] = [];

      photoIds.forEach((id, index) => {
        const p = photoMap.get(id);
        if (p) {
          reordered.push({
            id: p.id,
            districtId: p.districtId,
            visitId: p.visitId,
            url: p.url,
            caption: p.caption,
            sortOrder: index,
            isCover: p.isCover,
            isFavoriteMemory: p.isFavoriteMemory,
            takenDate: p.takenDate,
            createdAt: p.createdAt,
          });
        }
      });

      // Append any unmentioned
      v.photos.forEach((p) => {
        if (!photoIds.includes(p.id)) {
          reordered.push({ ...p, sortOrder: reordered.length });
        }
      });

      return { ...v, photos: reordered, updatedAt: new Date().toISOString() };
    });

    syncVisits(newVisits);
  };

  const createTrip = (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Trip => {
    const now = new Date().toISOString();
    const newTrip: Trip = {
      ...tripData,
      id: `trip-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: now,
      updatedAt: now,
    };

    const newTrips = [newTrip, ...trips];
    syncTrips(newTrips);

    // Auto mark included districts as visited
    const newUserData = { ...userData };
    tripData.districtIds.forEach((dId) => {
      if (newUserData[dId]?.status !== 'visited') {
        newUserData[dId] = {
          districtId: dId,
          status: 'visited',
          firstVisitedDate: tripData.startDate,
          updatedAt: now,
        };
      }
    });
    syncUserData(newUserData);

    return newTrip;
  };

  const updateTrip = (tripId: string, updates: Partial<Trip>) => {
    const newTrips = trips.map((t) => {
      if (t.id === tripId) {
        return {
          ...t,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    syncTrips(newTrips);
  };

  const deleteTrip = (tripId: string) => {
    const newTrips = trips.filter((t) => t.id !== tripId);
    syncTrips(newTrips);
  };

  const updateProfile = (profileUpdates: Partial<UserProfile>) => {
    const updated = { ...profile, ...profileUpdates };
    syncProfile(updated);
  };

  const updateSettings = (settingsUpdates: Partial<AppSettings>) => {
    const updated = { ...settings, ...settingsUpdates };
    syncSettings(updated);
  };

  const resetToCleanSlate = () => {
    const res = StorageService.resetToBlank();
    setUserData(res.userData);
    setVisits(res.visits);
    setTrips(res.trips);
  };

  const loadDemoMode = () => {
    const res = StorageService.loadDemo();
    setUserData(res.userData);
    setVisits(res.visits);
    setTrips(res.trips);
  };

  const importJsonBackup = (jsonString: string) => {
    const res = StorageService.validateAndImportBackup(jsonString);
    if (!res.success || !res.data) {
      return { success: false, error: res.error || 'Failed to import.' };
    }

    syncUserData(res.data.userData);
    syncVisits(res.data.visits);
    syncTrips(res.data.trips);
    if (res.data.profile) {
      syncProfile(res.data.profile);
    }
    return { success: true };
  };

  const openLightbox = (photos: Photo[], index = 0, districtName?: string) => {
    setLightbox({
      isOpen: true,
      photos,
      currentIndex: index,
      districtName,
    });
  };

  const closeLightbox = () => {
    setLightbox((prev) => ({ ...prev, isOpen: false }));
  };

  const setLightboxIndex = (index: number) => {
    setLightbox((prev) => ({ ...prev, currentIndex: index }));
  };

  const closeUnlockModal = () => {
    setUnlockModalData(null);
  };

  const close100PercentModal = () => {
    setShow100PercentModal(false);
  };

  // Push full snapshot and structured records to Supabase
  const pushToCloud = async (): Promise<{ success: boolean; error?: string }> => {
    setCloudSync((prev) => ({ ...prev, syncing: true, error: undefined }));
    try {
      const payload = {
        app: 'Journey64',
        version: '1.0.0',
        syncedAt: new Date().toISOString(),
        profile,
        userData,
        visits,
        trips,
        settings,
      };

      const userId = authUser?.id;

      // Push backup snapshot
      await SupabaseDB.pushBackup(
        `Cloud Sync - ${profile.name || 'User'}`,
        payload,
        userId
      );

      // Attempt structured sync
      await Promise.allSettled([
        SupabaseDB.saveProfile(profile, userId),
        SupabaseDB.saveSettings(settings, userId),
        SupabaseDB.syncDistrictUserData(userData, userId),
        SupabaseDB.syncVisits(visits, userId),
        SupabaseDB.syncTrips(trips, userId),
      ]);

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCloudSync({
        connected: true,
        syncing: false,
        lastSynced: nowStr,
        message: `ক্লাউডে সফলভাবে সিঙ্ক হয়েছে (${nowStr})`,
      });

      return { success: true };
    } catch (err: any) {
      setCloudSync((prev) => ({
        ...prev,
        syncing: false,
        error: err.message,
        message: 'সিঙ্ক ব্যর্থ: ' + err.message,
      }));
      return { success: false, error: err.message };
    }
  };

  // Pull latest snapshot from Supabase
  const pullFromCloud = async (): Promise<{ success: boolean; error?: string }> => {
    setCloudSync((prev) => ({ ...prev, syncing: true, error: undefined }));
    try {
      const userId = authUser?.id;
      const res = await SupabaseDB.pullLatestBackup(userId);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'ক্লাউডে কোনো ব্যাকআপ পাওয়া যায়নি।');
      }

      const cloudData = res.data;
      if (cloudData.userData) {
        setUserData(cloudData.userData);
        StorageService.saveUserData(cloudData.userData);
      }
      if (cloudData.visits) {
        setVisits(cloudData.visits);
        StorageService.saveVisits(cloudData.visits);
      }
      if (cloudData.trips) {
        setTrips(cloudData.trips);
        StorageService.saveTrips(cloudData.trips);
      }
      if (cloudData.profile) {
        setProfile(cloudData.profile);
        StorageService.saveProfile(cloudData.profile);
      }
      if (cloudData.settings) {
        setSettings(cloudData.settings);
        StorageService.saveSettings(cloudData.settings);
      }

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCloudSync({
        connected: true,
        syncing: false,
        lastSynced: nowStr,
        message: `ক্লাউড থেকে সফলভাবে রিস্টোর হয়েছে (${nowStr})`,
      });

      return { success: true };
    } catch (err: any) {
      setCloudSync((prev) => ({
        ...prev,
        syncing: false,
        error: err.message,
        message: 'রিস্টোর ব্যর্থ: ' + err.message,
      }));
      return { success: false, error: err.message };
    }
  };

  const openAuthModal = () => setAuthModalOpen(true);
  const closeAuthModal = () => setAuthModalOpen(false);

  const signOut = async () => {
    await SupabaseAuth.signOut();
    setAuthUser(null);
    setProfile(DEFAULT_PROFILE);
    setCloudSync((prev) => ({
      ...prev,
      connected: false,
      message: 'Signed out of Supabase account',
    }));
  };

  const refreshAuth = async () => {
    const user = await SupabaseAuth.getUser();
    setAuthUser(user);
    if (user) {
      const uName = user.user_metadata?.display_name || user.user_metadata?.name || user.email?.split('@')[0];
      if (uName) {
        setProfile((prev) => ({
          ...prev,
          name: uName,
          displayName: uName,
        }));
      }
      await pullFromCloud();
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        authUser,
        authModalOpen,
        openAuthModal,
        closeAuthModal,
        signOut,
        refreshAuth,
        userData,
        visits,
        trips,
        profile,
        settings,
        stats,
        divisionStats,
        achievements,
        cloudSync,
        pushToCloud,
        pullFromCloud,

        selectedDistrict,
        selectedDistrictVisits,
        selectedDistrictPhotos,
        selectDistrict,
        viewingJournalDistrictId,
        openDistrictJournal,
        activeTripId,
        openTripDetail,
        unlockModalData,
        closeUnlockModal,
        show100PercentModal,
        close100PercentModal,
        lightbox,
        openLightbox,
        closeLightbox,
        setLightboxIndex,
        setDistrictStatus,
        updateDistrictNotes,
        updateDistrictRating,
        toggleDistrictFavorite,
        addVisit,
        updateVisit,
        deleteVisit,
        addPhoto,
        updatePhoto,
        deletePhoto,
        reorderPhotos,
        createTrip,
        updateTrip,
        deleteTrip,
        updateProfile,
        updateSettings,
        resetToCleanSlate,
        loadDemoMode,
        importJsonBackup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
