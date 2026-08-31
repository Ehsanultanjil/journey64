import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
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
  updateDistrictNotes: (districtId: string, notes: string) => void;
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

  const [userData, setUserData] = useState<Record<string, DistrictUserData>>({});
  const [visits, setVisits] = useState<Visit[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

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

  // Track Supabase Auth session changes
  useEffect(() => {
    SupabaseAuth.getUser().then((user) => {
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
      }
    });

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
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);


  // Verify Supabase connection on startup & auto-pull real cloud data if local is empty
  useEffect(() => {
    let isMounted = true;
    checkSupabaseConnection().then(async (res) => {
      if (!isMounted) return;
      setCloudSync((prev) => ({
        ...prev,
        connected: res.connected,
        message: res.message,
      }));

      // If connected, check if there's saved data in Supabase cloud
      if (res.connected) {
        try {
          const cloudRes = await SupabaseDB.pullLatestBackup();
          if (cloudRes.success && cloudRes.data && isMounted) {
            const cData = cloudRes.data;
            const currentLocal = StorageService.loadData();
            // If local data is empty, restore from cloud
            const localIsEmpty = Object.keys(currentLocal.userData).length === 0 && currentLocal.visits.length === 0;
            if (localIsEmpty && (Object.keys(cData.userData || {}).length > 0 || (cData.visits || []).length > 0)) {
              if (cData.userData) {
                setUserData(cData.userData);
                StorageService.saveUserData(cData.userData);
              }
              if (cData.visits) {
                setVisits(cData.visits);
                StorageService.saveVisits(cData.visits);
              }
              if (cData.trips) {
                setTrips(cData.trips);
                StorageService.saveTrips(cData.trips);
              }
              if (cData.profile) {
                setProfile(cData.profile);
                StorageService.saveProfile(cData.profile);
              }
              setCloudSync((prev) => ({
                ...prev,
                lastSynced: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                message: 'Synced from Supabase cloud database',
              }));
            }
          }
        } catch (e) {
          // Silent fallback to local data
        }
      }
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
    // Apply theme class on mount
    if (loaded.settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, []);

  // Reactive theme switch
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [settings.theme]);


  // Sync state to storage and cloud
  const syncUserData = (newUserData: Record<string, DistrictUserData>) => {
    setUserData(newUserData);
    StorageService.saveUserData(newUserData);
    SupabaseDB.syncDistrictUserData(newUserData).catch(() => {});
  };

  const syncVisits = (newVisits: Visit[]) => {
    setVisits(newVisits);
    StorageService.saveVisits(newVisits);
    SupabaseDB.syncVisits(newVisits).catch(() => {});
  };

  const syncTrips = (newTrips: Trip[]) => {
    setTrips(newTrips);
    StorageService.saveTrips(newTrips);
    SupabaseDB.syncTrips(newTrips).catch(() => {});
  };

  const syncProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    StorageService.saveProfile(newProfile);
    SupabaseDB.saveProfile(newProfile).catch(() => {});
  };

  const syncSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    SupabaseDB.saveSettings(newSettings).catch(() => {});

    if (newSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
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

  const updateDistrictNotes = (districtId: string, notes: string) => {
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
        updatedAt: new Date().toISOString(),
      },
    };
    syncUserData(newUserData);

    // Also sync with the primary visit
    const primaryVisit = visits.find((v) => v.districtId === districtId);
    if (primaryVisit) {
      updateVisit(primaryVisit.id, { notes });
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

    const updatedPhotos = [...(targetVisit.photos || []), newPhoto];
    const updatedVisits = allVisits.map((v) => {
      if (v.id === targetVisit!.id) {
        return {
          ...v,
          photos: updatedPhotos,
          updatedAt: now,
        };
      }
      return v;
    });

    syncVisits(updatedVisits);

    // Ensure status is visited
    if (userData[districtId]?.status !== 'visited') {
      setDistrictStatus(districtId, 'visited');
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

      // Push backup snapshot
      const backupRes = await SupabaseDB.pushBackup(
        `Cloud Sync - ${profile.name || 'User'} (${new Date().toLocaleDateString()})`,
        payload
      );

      // Attempt structured sync
      await Promise.allSettled([
        SupabaseDB.saveProfile(profile),
        SupabaseDB.saveSettings(settings),
        SupabaseDB.syncDistrictUserData(userData),
        SupabaseDB.syncVisits(visits),
        SupabaseDB.syncTrips(trips),
      ]);

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCloudSync({
        connected: true,
        syncing: false,
        lastSynced: nowStr,
        message: `Synced to Supabase cloud at ${nowStr}`,
      });

      return { success: true };
    } catch (err: any) {
      setCloudSync((prev) => ({
        ...prev,
        syncing: false,
        error: err.message,
        message: 'Sync failed: ' + err.message,
      }));
      return { success: false, error: err.message };
    }
  };

  // Pull latest snapshot from Supabase
  const pullFromCloud = async (): Promise<{ success: boolean; error?: string }> => {
    setCloudSync((prev) => ({ ...prev, syncing: true, error: undefined }));
    try {
      const res = await SupabaseDB.pullLatestBackup();
      if (!res.success || !res.data) {
        throw new Error(res.error || 'No cloud snapshot found in Supabase.');
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
        message: `Restored from Supabase cloud at ${nowStr}`,
      });

      return { success: true };
    } catch (err: any) {
      setCloudSync((prev) => ({
        ...prev,
        syncing: false,
        error: err.message,
        message: 'Pull failed: ' + err.message,
      }));
      return { success: false, error: err.message };
    }
  };

  const openAuthModal = () => setAuthModalOpen(true);
  const closeAuthModal = () => setAuthModalOpen(false);

  const signOut = async () => {
    await SupabaseAuth.signOut();
    setAuthUser(null);
    setCloudSync((prev) => ({
      ...prev,
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
