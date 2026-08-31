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
  theme: 'light',
  showDistrictLabels: true,
  showBengaliNames: true,
  showWishlistOnMap: true,
  divisionHighlightMode: false,
};

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Ehsanul Tanjil',
  displayName: 'Ehsanul Tanjil',
  bio: 'Explorer of Bangladesh — one district at a time.',
  joinedDate: '2024-01-01',
};

// Image compression helper using HTML5 Canvas
export async function compressImage(
  source: File | string,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          maxHeight = height;
        }
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

// Storage Service
export const StorageService = {
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

      return {
        userData: rawUserData ? JSON.parse(rawUserData) : {},
        visits: rawVisits ? JSON.parse(rawVisits) : [],
        trips: rawTrips ? JSON.parse(rawTrips) : [],
        profile: rawProfile ? JSON.parse(rawProfile) : DEFAULT_PROFILE,
        settings: rawSettings ? JSON.parse(rawSettings) : DEFAULT_SETTINGS,
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

  saveUserData(userData: Record<string, DistrictUserData>) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (e) {
      console.error('Storage quota or error saving user data:', e);
    }
  },

  saveVisits(visits: Visit[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
    } catch (e) {
      console.error('Storage quota or error saving visits:', e);
    }
  },

  saveTrips(trips: Trip[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    } catch (e) {
      console.error('Error saving trips:', e);
    }
  },

  saveProfile(profile: UserProfile) {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Error saving profile:', e);
    }
  },

  saveSettings(settings: AppSettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
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

  exportBackup(
    userData: Record<string, DistrictUserData>,
    visits: Visit[],
    trips: Trip[],
    profile: UserProfile
  ): string {
    const backup = {
      app: 'My Bangladesh',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      profile,
      userData,
      visits,
      trips,
    };
    return JSON.stringify(backup, null, 2);
  },

  exportBackupFile() {
    const current = this.loadData();
    const jsonStr = this.exportBackup(
      current.userData,
      current.visits,
      current.trips,
      current.profile
    );
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-bangladesh-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  validateAndImportBackup(jsonString: string): {
    success: boolean;
    data?: {
      userData: Record<string, DistrictUserData>;
      visits: Visit[];
      trips: Trip[];
      profile?: UserProfile;
    };
    error?: string;
  } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'Invalid backup file format.' };
      }

      const userData = parsed.userData || {};
      const visits = Array.isArray(parsed.visits) ? parsed.visits : [];
      const trips = Array.isArray(parsed.trips) ? parsed.trips : [];
      const profile = parsed.profile;

      return {
        success: true,
        data: {
          userData,
          visits,
          trips,
          profile,
        },
      };
    } catch (e) {
      return { success: false, error: 'Could not parse JSON file. Please ensure it is a valid My Bangladesh export.' };
    }
  },
};
