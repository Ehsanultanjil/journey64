import { supabase } from './client';
import { DistrictUserData, Visit, Trip, UserProfile } from '../../types';
import { AppSettings } from '../storage';

export const SupabaseDB = {
  // Push full snapshot / backup to Supabase
  async pushBackup(name: string, payload: any, userId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('journey_backups').insert([
        {
          name,
          data: payload,
          user_id: userId || null,
        },
      ]);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.warn('Supabase push backup warning:', err.message);
      return { success: false, error: err.message };
    }
  },

  // Pull latest backup from Supabase for this user (or global latest)
  async pullLatestBackup(userId?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      let query = supabase
        .from('journey_backups')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.limit(1).maybeSingle();

      if (error) throw error;
      return { success: true, data: data?.data };
    } catch (err: any) {
      console.warn('Supabase pull latest backup warning:', err.message);
      return { success: false, error: err.message };
    }
  },

  // Sync User Profile
  async saveProfile(profile: UserProfile, userId?: string): Promise<boolean> {
    try {
      const id = userId || 'default_user';
      const { error } = await supabase.from('user_profiles').upsert([
        {
          id,
          user_id: userId || null,
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
  async saveSettings(settings: AppSettings, userId?: string): Promise<boolean> {
    try {
      const id = userId ? `settings_${userId}` : 'default_settings';
      const { error } = await supabase.from('app_settings').upsert([
        {
          id,
          user_id: userId || null,
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
  async syncDistrictUserData(userData: Record<string, DistrictUserData>, userId?: string): Promise<boolean> {
    try {
      const items = Object.values(userData).map((item) => ({
        id: userId ? `${userId}_${item.districtId}` : item.districtId,
        user_id: userId || null,
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
  async syncVisits(visits: Visit[], userId?: string): Promise<boolean> {
    try {
      if (visits.length === 0) return true;
      const records = visits.map((v) => ({
        id: v.id,
        user_id: userId || null,
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
  async syncTrips(trips: Trip[], userId?: string): Promise<boolean> {
    try {
      if (trips.length === 0) return true;
      const records = trips.map((t) => ({
        id: t.id,
        user_id: userId || null,
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

  // Fetch structured user data from tables
  async fetchUserData(userId?: string): Promise<Record<string, DistrictUserData> | null> {
    try {
      let query = supabase.from('district_user_data').select('*');
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (error || !data) return null;

      const map: Record<string, DistrictUserData> = {};
      data.forEach((row: any) => {
        map[row.district_id] = {
          districtId: row.district_id,
          status: row.status,
          rating: row.rating,
          isFavorite: row.is_favorite,
          notes: row.notes,
          firstVisitedDate: row.first_visited_date,
          updatedAt: row.updated_at,
        };
      });
      return map;
    } catch (e) {
      return null;
    }
  },

  // Fetch structured visits
  async fetchVisits(userId?: string): Promise<Visit[] | null> {
    try {
      let query = supabase.from('visits').select('*');
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (error || !data) return null;

      return data.map((row: any) => ({
        id: row.id,
        districtId: row.district_id,
        date: row.date,
        title: row.title,
        story: row.story,
        companions: row.companions,
        placesVisited: row.places_visited || [],
        weather: row.weather,
        favoriteFood: row.favorite_food,
        photos: row.photos || [],
        rating: row.rating,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (e) {
      return null;
    }
  },

  // Fetch structured trips
  async fetchTrips(userId?: string): Promise<Trip[] | null> {
    try {
      let query = supabase.from('trips').select('*');
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (error || !data) return null;

      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        startDate: row.start_date,
        endDate: row.end_date,
        districtIds: row.district_ids || [],
        coverPhoto: row.cover_photo,
        highlightColor: row.highlight_color,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (e) {
      return null;
    }
  },
};
