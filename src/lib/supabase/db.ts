import { supabase } from './client';
import { DistrictUserData, Visit, Trip, UserProfile } from '../../types';
import { AppSettings } from '../storage';

export const SupabaseDB = {
  // Helper to get active user ID
  async getEffectiveUserId(userId?: string): Promise<string | undefined> {
    if (userId) return userId;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user?.id;
    } catch {
      return undefined;
    }
  },

  // Push full snapshot / backup to Supabase
  async pushBackup(name: string, payload: any, userId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const effectiveUserId = await this.getEffectiveUserId(userId);
      const { error } = await supabase.from('journey_backups').insert([
        {
          name,
          data: payload,
          user_id: effectiveUserId || null,
        },
      ]);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.warn('Supabase push backup warning:', err.message);
      return { success: false, error: err.message };
    }
  },

  // Pull latest backup from Supabase for this user (or latest available)
  async pullLatestBackup(userId?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const effectiveUserId = await this.getEffectiveUserId(userId);

      let query = supabase
        .from('journey_backups')
        .select('*')
        .order('created_at', { ascending: false });

      if (effectiveUserId) {
        query = query.eq('user_id', effectiveUserId);
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
      const effectiveUserId = await this.getEffectiveUserId(userId);
      const id = effectiveUserId || 'default_user';
      const { error } = await supabase.from('user_profiles').upsert([
        {
          id,
          user_id: effectiveUserId || null,
          name: profile.name,
          display_name: profile.displayName || profile.name,
          bio: profile.bio || '',
          avatar_url: profile.avatarUrl || null,
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
      const effectiveUserId = await this.getEffectiveUserId(userId);
      const id = effectiveUserId ? `settings_${effectiveUserId}` : 'default_settings';
      const { error } = await supabase.from('app_settings').upsert([
        {
          id,
          user_id: effectiveUserId || null,
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
      const effectiveUserId = await this.getEffectiveUserId(userId);
      const items = Object.values(userData).map((item) => ({
        id: effectiveUserId ? `${effectiveUserId}_${item.districtId}` : item.districtId,
        user_id: effectiveUserId || null,
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

      // Also create an auto backup snapshot for multi-device sync
      if (effectiveUserId) {
        supabase.from('journey_backups').insert([
          {
            name: 'auto_sync',
            user_id: effectiveUserId,
            data: { userData },
          },
        ]).then(() => {});
      }

      return !error;
    } catch (e) {
      return false;
    }
  },

  // Sync Visits
  async syncVisits(visits: Visit[], userId?: string): Promise<boolean> {
    try {
      if (visits.length === 0) return true;
      const effectiveUserId = await this.getEffectiveUserId(userId);
      const records = visits.map((v) => ({
        id: v.id,
        user_id: effectiveUserId || null,
        district_id: v.districtId,
        date: v.visitDate,
        title: v.title || 'Trip Memory',
        story: v.notes || '',
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
      const effectiveUserId = await this.getEffectiveUserId(userId);
      const records = trips.map((t) => ({
        id: t.id,
        user_id: effectiveUserId || null,
        name: t.name,
        description: t.notes || '',
        start_date: t.startDate,
        end_date: t.endDate,
        district_ids: t.districtIds || [],
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
      const effectiveUserId = await this.getEffectiveUserId(userId);
      let query = supabase.from('district_user_data').select('*');
      if (effectiveUserId) query = query.eq('user_id', effectiveUserId);
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
      const effectiveUserId = await this.getEffectiveUserId(userId);
      let query = supabase.from('visits').select('*');
      if (effectiveUserId) query = query.eq('user_id', effectiveUserId);
      const { data, error } = await query;
      if (error || !data) return null;

      return data.map((row: any) => ({
        id: row.id,
        districtId: row.district_id,
        visitDate: row.date || new Date().toISOString().split('T')[0],
        title: row.title || 'Trip Memory',
        notes: row.story || '',
        photos: row.photos || [],
        rating: row.rating || 5,
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      }));
    } catch (e) {
      return null;
    }
  },

  // Fetch structured trips
  async fetchTrips(userId?: string): Promise<Trip[] | null> {
    try {
      const effectiveUserId = await this.getEffectiveUserId(userId);
      let query = supabase.from('trips').select('*');
      if (effectiveUserId) query = query.eq('user_id', effectiveUserId);
      const { data, error } = await query;
      if (error || !data) return null;

      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        startDate: row.start_date,
        endDate: row.end_date,
        notes: row.description || '',
        districtIds: row.district_ids || [],
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      }));
    } catch (e) {
      return null;
    }
  },
};
