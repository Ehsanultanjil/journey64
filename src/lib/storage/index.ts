import { DistrictUserData, Visit, Trip, UserProfile, Photo } from '../../types';
import { DEMO_USER_DATA, DEMO_VISITS, DEMO_TRIPS } from '../../data/demoData';

const STORAGE_KEYS = {
  USER_DATA: 'journey64_user_data_v2',
  VISITS: 'journey64_visits_v2',
  TRIPS: 'journey64_trips_v2',
  PROFILE: 'journey64_profile_v2',
  SETTINGS: 'journey64_settings_v2',
};

export interface AppSettings {
  theme: 'system' | 'light' | 'dark';
  showDistrictLabels: boolean;
  showBengaliNames: boolean;
  showWishlistOnMap: boolean;
  divisionHighlightMode: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  showDistrictLabels: true,
  showBengaliNames: true,
  showWishlistOnMap: true,
  divisionHighlightMode: false,
};

export const DEFAULT_PROFILE: UserProfile = {
  name: 'ভ্রমণকারী',
  displayName: 'ভ্রমণকারী',
  bio: 'বাংলাদেশের ৬৪ জেলার পথে প্রান্তরে এক অনন্য পদচিহ্ন।',
  joinedDate: '2025-01-01',
};

// ================= IndexedDB Utility for Unlimited Reliable Storage =================
const DB_NAME = 'journey64_db_v2';
const DB_VERSION = 1;
const STORE_NAME = 'app_data';

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onerror = (event: any) => {
      reject(event.target.error);
    };
  });
}

async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result !== undefined ? request.result : null);
      };
      request.onerror = () => {
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}

async function idbSet<T>(key: string, value: T): Promise<boolean> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

// ================= Image compression helper =================
// Resizes to max 1200x1200 with 0.75 JPEG compression for lightweight, instant saving
export async function compressImage(
  source: File | string,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(typeof source === 'string' ? source : URL.createObjectURL(source));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      try {
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } catch (err) {
        resolve(typeof source === 'string' ? source : URL.createObjectURL(source));
      }
    };

    img.onerror = (e) => {
      reject(e);
    };

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(source);
    }
  });
}

// ================= Robust Dual Storage Service (LocalStorage + IndexedDB) =================
export const StorageService = {
  // Synchronous load on initial mount
  loadData(): {
    userData: Record<string, DistrictUserData>;
    visits: Visit[];
    trips: Trip[];
    profile: UserProfile;
    settings: AppSettings;
    isDemo: boolean;
  } {
    try {
      const rawUserData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      const rawVisits = localStorage.getItem(STORAGE_KEYS.VISITS);
      const rawTrips = localStorage.getItem(STORAGE_KEYS.TRIPS);
      const rawProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
      const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const parsedSettings = rawSettings ? JSON.parse(rawSettings) : DEFAULT_SETTINGS;
      const finalSettings = {
        ...DEFAULT_SETTINGS,
        ...parsedSettings,
        theme: 'dark' as const,
      };

      return {
        userData: rawUserData ? JSON.parse(rawUserData) : {},
        visits: rawVisits ? JSON.parse(rawVisits) : [],
        trips: rawTrips ? JSON.parse(rawTrips) : [],
        profile: rawProfile ? JSON.parse(rawProfile) : DEFAULT_PROFILE,
        settings: finalSettings,
        isDemo: false,
      };
    } catch (err) {
      console.error('Failed to load from storage:', err);
      return {
        userData: {},
        visits: [],
        trips: [],
        profile: DEFAULT_PROFILE,
        settings: DEFAULT_SETTINGS,
        isDemo: false,
      };
    }
  },

  // Asynchronous load from IndexedDB (Unlimited capacity, retrieves all photos)
  async loadDataAsync(): Promise<{
    userData?: Record<string, DistrictUserData>;
    visits?: Visit[];
    trips?: Trip[];
    profile?: UserProfile;
    settings?: AppSettings;
  }> {
    try {
      const [userData, visits, trips, profile, settings] = await Promise.all([
        idbGet<Record<string, DistrictUserData>>(STORAGE_KEYS.USER_DATA),
        idbGet<Visit[]>(STORAGE_KEYS.VISITS),
        idbGet<Trip[]>(STORAGE_KEYS.TRIPS),
        idbGet<UserProfile>(STORAGE_KEYS.PROFILE),
        idbGet<AppSettings>(STORAGE_KEYS.SETTINGS),
      ]);

      return {
        userData: userData || undefined,
        visits: visits || undefined,
        trips: trips || undefined,
        profile: profile || undefined,
        settings: settings || undefined,
      };
    } catch (e) {
      console.warn('IndexedDB load warning:', e);
      return {};
    }
  },

  saveUserData(userData: Record<string, DistrictUserData>) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (e) {
      console.warn('LocalStorage quota warning for user data:', e);
    }
    idbSet(STORAGE_KEYS.USER_DATA, userData);
  },

  saveVisits(visits: Visit[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
    } catch (e) {
      console.warn('LocalStorage quota reached for visits, saved safely to IndexedDB:', e);
    }
    idbSet(STORAGE_KEYS.VISITS, visits);
  },

  saveTrips(trips: Trip[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    } catch (e) {
      console.warn('Error saving trips to localStorage:', e);
    }
    idbSet(STORAGE_KEYS.TRIPS, trips);
  },

  saveProfile(profile: UserProfile) {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Error saving profile to localStorage:', e);
    }
    idbSet(STORAGE_KEYS.PROFILE, profile);
  },

  saveSettings(settings: AppSettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Error saving settings to localStorage:', e);
    }
    idbSet(STORAGE_KEYS.SETTINGS, settings);
  },

  resetToBlank(): {
    userData: Record<string, DistrictUserData>;
    visits: Visit[];
    trips: Trip[];
  } {
    const emptyUserData: Record<string, DistrictUserData> = {};
    const emptyVisits: Visit[] = [];
    const emptyTrips: Trip[] = [];

    this.saveUserData(emptyUserData);
    this.saveVisits(emptyVisits);
    this.saveTrips(emptyTrips);

    return {
      userData: emptyUserData,
      visits: emptyVisits,
      trips: emptyTrips,
    };
  },

  loadDemo(): {
    userData: Record<string, DistrictUserData>;
    visits: Visit[];
    trips: Trip[];
  } {
    this.saveUserData(DEMO_USER_DATA);
    this.saveVisits(DEMO_VISITS);
    this.saveTrips(DEMO_TRIPS);

    return {
      userData: DEMO_USER_DATA,
      visits: DEMO_VISITS,
      trips: DEMO_TRIPS,
    };
  },

  validateAndImportBackup(jsonString: string): {
    success: boolean;
    data?: {
      userData: Record<string, DistrictUserData>;
      visits: Visit[];
      trips: Trip[];
      profile?: UserProfile;
      settings?: AppSettings;
    };
    error?: string;
  } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'অবৈধ ব্যাকআপ ফাইল ফরম্যাট।' };
      }

      const backupData = parsed.data || parsed;
      const userData = backupData.userData || {};
      const visits = backupData.visits || [];
      const trips = backupData.trips || [];
      const profile = backupData.profile || DEFAULT_PROFILE;
      const settings = backupData.settings || DEFAULT_SETTINGS;

      this.saveUserData(userData);
      this.saveVisits(visits);
      this.saveTrips(trips);
      this.saveProfile(profile);
      this.saveSettings(settings);

      return {
        success: true,
        data: {
          userData,
          visits,
          trips,
          profile,
          settings,
        },
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'ব্যাকআপ ফাইলটি পার্স করা যায়নি।' };
    }
  },
};
