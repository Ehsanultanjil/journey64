import { supabase } from './client';
import { DistrictUserData, Visit, Trip, UserProfile } from '../../types';
import { AppSettings } from '../storage';

export const SupabaseDB = {
  // Push full snapshot / backup to Supabase
  async pushBackup(name: string, payload: any): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('journey_backups').insert([
        {
          name,
          data: payload,
        },
      ]);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.warn('Supabase push backup warning:', err.message);
      return { success: false, error: err.message };
    }
  },

  // Pull latest backup from Supabase
  async pullLatestBackup(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('journey_backups')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return { success: true, data: data?.data };
    } catch (err: any) {
      console.warn('Supabase pull latest backup warning:', err.message);
      return { success: false, error: err.message };
    }
  },

  // Sync User Profile
  async saveProfile(profile: UserProfile): Promise<boolean> {
    try {
      const { error } = await supabase.from('user_profiles').upsert([
        {
          id: 'default_user',
          name: profile.name,
          display_name: profile.displayName,
          bio: profile.bio,
          avatar_url: profile.avatarUrl,
          joined_date: profile.joinedDate,
          updated_at: new Date().toISOString(),
        },
      ]);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // Sync Settings
  async saveSettings(settings: AppSettings): Promise<boolean> {
    try {
      const { error } = await supabase.from('app_settings').upsert([
        {
          id: 'default_settings',
          theme: settings.theme,
          show_district_labels: settings.showDistrictLabels,
          show_bengali_names: settings.showBengaliNames,
          show_wishlist_on_map: settings.showWishlistOnMap,
          division_highlight_mode: settings.divisionHighlightMode,
          updated_at: new Date().toISOString(),
        },
      ]);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // Sync District User Data
  async syncDistrictUserData(userData: Record<string, DistrictUserData>): Promise<boolean> {
    try {
      const items = Object.values(userData).map((item) => ({
        id: item.districtId,
        district_id: item.districtId,
        status: item.status,
        rating: item.rating || 0,
        is_favorite: !!item.isFavorite,
        notes: item.notes || '',
        first_visited_date: item.firstVisitedDate || null,
        updated_at: item.updatedAt || new Date().toISOString(),
      }));

      if (items.length === 0) return true;

      const { error } = await supabase.from('district_user_data').upsert(items);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // Sync Visits
  async syncVisits(visits: Visit[]): Promise<boolean> {
    try {
      if (visits.length === 0) return true;
      const records = visits.map((v) => ({
        id: v.id,
        district_id: v.districtId,
        date: v.date,
        title: v.title,
        story: v.story || '',
        companions: v.companions || '',
        places_visited: v.placesVisited || [],
        weather: v.weather || '',
        favorite_food: v.favoriteFood || '',
        photos: v.photos || [],
        rating: v.rating || 5,
        created_at: v.createdAt || new Date().toISOString(),
        updated_at: v.updatedAt || new Date().toISOString(),
      }));

      const { error } = await supabase.from('visits').upsert(records);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // Sync Trips
  async syncTrips(trips: Trip[]): Promise<boolean> {
    try {
      if (trips.length === 0) return true;
      const records = trips.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description || '',
        start_date: t.startDate,
        end_date: t.endDate,
        district_ids: t.districtIds || [],
        cover_photo: t.coverPhoto || null,
        highlight_color: t.highlightColor || '#F27D26',
        status: t.status,
        created_at: t.createdAt || new Date().toISOString(),
        updated_at: t.updatedAt || new Date().toISOString(),
      }));

      const { error } = await supabase.from('trips').upsert(records);
      return !error;
    } catch (e) {
      return false;
    }
  },
};
