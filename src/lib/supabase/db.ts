import { supabase } from './client';
import { DistrictUserData, Visit, Trip, UserProfile, Photo } from '../../types';
import { AppSettings } from '../storage';

// Clean photo data before sending to DB — ensure only valid URLs are persisted in the visits JSONB column.
function cleanPhotosForDB(photos: Photo[]): Photo[] {
  return (photos || [])
    .filter((p) => p && typeof p.url === 'string' && p.url.trim().length > 0 && !p.url.startsWith('data:'))
    .map((p) => ({
      id: p.id,
      districtId: p.districtId,
      visitId: p.visitId,
      placeName: p.placeName || '',
      url: p.url,
      caption: p.caption || '',
      sortOrder: p.sortOrder || 0,
      isCover: !!p.isCover,
      isFavoriteMemory: !!p.isFavoriteMemory,
      takenDate: p.takenDate,
      createdAt: p.createdAt,
    }));
}

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

  // ==================== PHOTO STORAGE ====================

  // Upload a photo (base64 data URL) to Supabase Storage and return the public URL
  async uploadPhoto(
    base64DataUrl: string,
    districtId: string,
    photoId: string,
    userId?: string
  ): Promise<string | null> {
    try {
      const effectiveUserId = await this.getEffectiveUserId(userId);
      if (!effectiveUserId) {
        console.error('[SupabaseDB] uploadPhoto: no user ID');
        return null;
      }

      // Convert base64 data URL to Blob
      const response = await fetch(base64DataUrl);
      const blob = await response.blob();

      const mimeType = blob.type || 'image/jpeg';
      const ext = mimeType.includes('png') ? 'png' : 'jpg';

      // Unique path: userId/districtId/photoId.ext
      const filePath = `${effectiveUserId}/${districtId}/${photoId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, blob, {
          contentType: mimeType,
          upsert: true,
        });

      if (uploadError) {
        console.error('[SupabaseDB] uploadPhoto FAILED:', uploadError.message);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      return urlData?.publicUrl || null;
    } catch (err: any) {
      console.error('[SupabaseDB] uploadPhoto EXCEPTION:', err?.message, err);
      return null;
    }
  },

  // ==================== BACKUP ====================

  // Push full snapshot backup — finds and updates existing backup for this user,
  // or inserts a new one. Avoids creating duplicate rows on every call.
  async pushBackup(name: string, payload: any, userId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const effectiveUserId = await this.getEffectiveUserId(userId);
      if (!effectiveUserId) {
        return { success: false, error: 'No user ID available' };
      }

      const backupName = `user_backup_${effectiveUserId}`;

      // Clean photos from the backup payload to avoid bloating and eliminate corrupt entries
      const cleanPayload = { ...payload };
      if (cleanPayload.visits && Array.isArray(cleanPayload.visits)) {
        cleanPayload.visits = cleanPayload.visits.map((v: any) => ({
          ...v,
          photos: v.photos ? cleanPhotosForDB(v.photos) : [],
        }));
      }

      const backupData = {
        ...cleanPayload,
        userId: effectiveUserId,
        syncedAt: new Date().toISOString(),
      };

      // Find existing backup for this user and update it instead of creating duplicates
      const { data: existing } = await supabase
        .from('journey_backups')
        .select('id')
        .eq('name', backupName)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        // Update existing backup in place
        const { error } = await supabase
          .from('journey_backups')
          .update({ data: backupData })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        // Insert new backup row
        const { error } = await supabase.from('journey_backups').insert([{
          name: backupName,
          data: backupData,
        }]);
        if (error) throw error;
      }

      return { success: true };
    } catch (err: any) {
      console.error('[SupabaseDB] pushBackup FAILED:', err.message, err);
      return { success: false, error: err.message };
    }
  },

  // Pull latest backup from Supabase for this user
  async pullLatestBackup(userId?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const effectiveUserId = await this.getEffectiveUserId(userId);

      let query = supabase
        .from('journey_backups')
        .select('*')
        .order('created_at', { ascending: false });

      if (effectiveUserId) {
        query = query.eq('name', `user_backup_${effectiveUserId}`);
      }

      const { data, error } = await query.limit(1).maybeSingle();

      if (error) throw error;
      return { success: true, data: data?.data };
    } catch (err: any) {
      console.error('[SupabaseDB] pullLatestBackup FAILED:', err.message, err);
      return { success: false, error: err.message };
    }
  },

  // ==================== PROFILE & SETTINGS ====================

  // Sync User Profile — uses userId as the primary key `id`
  async saveProfile(profile: UserProfile, userId?: string): Promise<boolean> {
    try {
      const effectiveUserId = await this.getEffectiveUserId(userId);
      if (!effectiveUserId) return false;

      const { error } = await supabase.from('user_profiles').upsert([
        {
          id: effectiveUserId,
          name: profile.name,
          display_name: profile.displayName || profile.name,
          bio: profile.bio || '',
          avatar_url: profile.avatarUrl || null,
          joined_date: profile.joinedDate,
          updated_at: new Date().toISOString(),
        },
      ]);
      if (error) {
        console.error('[SupabaseDB] saveProfile FAILED:', error.message, error);
      }
      return !error;
    } catch (e: any) {
      console.error('[SupabaseDB] saveProfile EXCEPTION:', e?.message, e);
      return false;
    }
  },

  // Sync Settings
  async saveSettings(settings: AppSettings, userId?: string): Promise<boolean> {
    try {
      const effectiveUserId = await this.getEffectiveUserId(userId);
      if (!effectiveUserId) return false;

      const id = `settings_${effectiveUserId}`;
      const { error } = await supabase.from('app_settings').upsert([
        {
          id,
          theme: settings.theme,
          show_district_labels: settings.showDistrictLabels,
          show_bengali_names: settings.showBengaliNames,
          show_wishlist_on_map: settings.showWishlistOnMap,
          division_highlight_mode: settings.divisionHighlightMode,
          updated_at: new Date().toISOString(),
        },
      ]);
      if (error) {
        console.error('[SupabaseDB] saveSettings FAILED:', error.message, error);
      }
      return !error;
    } catch (e: any) {
      console.error('[SupabaseDB] saveSettings EXCEPTION:', e?.message, e);
      return false;
    }
  },

  // ==================== DISTRICT USER DATA ====================

  // Sync District User Data — uses `{userId}_{districtId}` as primary key
  async syncDistrictUserData(userData: Record<string, DistrictUserData>, userId?: string): Promise<boolean> {
    try {
      const effectiveUserId = await this.getEffectiveUserId(userId);
      if (!effectiveUserId) return false;

      const items = Object.values(userData).map((item) => ({
        id: `${effectiveUserId}_${item.districtId}`,
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
      if (error) {
        console.error('[SupabaseDB] syncDistrictUserData FAILED:', error.message, error);
      }
      return !error;
    } catch (e: any) {
      console.error('[SupabaseDB] syncDistrictUserData EXCEPTION:', e?.message, e);
      return false;
    }
  },

  // ==================== VISITS ====================

  // Sync Visits — uses `{userId}_{localVisitId}` as primary key
  // Photos are stripped of base64 data before writing — only URLs are stored.
  // Batches in chunks of 10 to avoid exceeding PostgREST payload limits.
  async syncVisits(visits: Visit[], userId?: string): Promise<boolean> {
    try {
      if (visits.length === 0) return true;
      const effectiveUserId = await this.getEffectiveUserId(userId);
      if (!effectiveUserId) return false;

      const records = visits.map((v) => ({
        id: `${effectiveUserId}_${v.id}`,
        district_id: v.districtId,
        date: v.visitDate || new Date().toISOString().split('T')[0],
        title: v.title || 'ভ্রমণ স্মৃতি',
        story: v.notes || '',
        // Only store photo metadata with valid URLs — no base64 in DB
        photos: v.photos ? cleanPhotosForDB(v.photos) : [],
        rating: v.rating || 5,
        created_at: v.createdAt || new Date().toISOString(),
        updated_at: v.updatedAt || new Date().toISOString(),
      }));

      // Batch in chunks to avoid payload size limits
      const BATCH_SIZE = 10;
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('visits').upsert(batch);
        if (error) {
          console.error(`[SupabaseDB] syncVisits batch ${i / BATCH_SIZE + 1} FAILED:`, error.message, error);
          // Continue with other batches instead of returning false immediately
        }
      }

      return true;
    } catch (e: any) {
      console.error('[SupabaseDB] syncVisits EXCEPTION:', e?.message, e);
      return false;
    }
  },

  // Delete a visit permanently from Supabase
  async deleteVisit(visitId: string, userId?: string): Promise<boolean> {
    try {
      const effectiveUserId = await this.getEffectiveUserId(userId);
      if (!effectiveUserId) return false;
      const fullId = `${effectiveUserId}_${visitId}`;
      const { error } = await supabase.from('visits').delete().eq('id', fullId);
      if (error) {
        console.error('[SupabaseDB] deleteVisit FAILED:', error.message);
      }
      return !error;
    } catch (e: any) {
      console.error('[SupabaseDB] deleteVisit EXCEPTION:', e?.message);
      return false;
    }
  },

  // ==================== TRIPS ====================

  // Sync Trips — uses `{userId}_{localTripId}` as primary key
  async syncTrips(trips: Trip[], userId?: string): Promise<boolean> {
    try {
      if (trips.length === 0) return true;
      const effectiveUserId = await this.getEffectiveUserId(userId);
      if (!effectiveUserId) return false;

      const records = trips.map((t) => ({
        id: `${effectiveUserId}_${t.id}`,
        name: t.name,
        description: t.notes || '',
        start_date: t.startDate,
        end_date: t.endDate,
        district_ids: t.districtIds || [],
        created_at: t.createdAt || new Date().toISOString(),
        updated_at: t.updatedAt || new Date().toISOString(),
      }));

      const { error } = await supabase.from('trips').upsert(records);
      if (error) {
        console.error('[SupabaseDB] syncTrips FAILED:', error.message, error);
      }
      return !error;
    } catch (e: any) {
      console.error('[SupabaseDB] syncTrips EXCEPTION:', e?.message, e);
      return false;
    }
  },

  // ==================== FETCH / READ ====================

  // Fetch user data — uses deterministic ID prefix `{userId}_` to scope records
  async fetchUserData(userId?: string): Promise<Record<string, DistrictUserData> | null> {
    try {
      const effectiveUserId = await this.getEffectiveUserId(userId);
      if (!effectiveUserId) return null;

      const { data, error } = await supabase
        .from('district_user_data')
        .select('*')
        .like('id', `${effectiveUserId}_%`);

      if (error) {
        console.error('[SupabaseDB] fetchUserData FAILED:', error.message, error);
        return null;
      }
      if (!data || data.length === 0) return null;

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
    } catch (e: any) {
      console.error('[SupabaseDB] fetchUserData EXCEPTION:', e?.message, e);
      return null;
    }
  },

  // Fetch visits — uses deterministic ID prefix `{userId}_` to scope records
  // Increases limit to 200 to capture all visits
  async fetchVisits(userId?: string): Promise<Visit[] | null> {
    try {
      const effectiveUserId = await this.getEffectiveUserId(userId);
      if (!effectiveUserId) return null;

      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .like('id', `${effectiveUserId}_%`)
        .order('updated_at', { ascending: false })
        .limit(200);

      if (error) {
        console.error('[SupabaseDB] fetchVisits FAILED:', error.message, error);
        return null;
      }
      if (!data || data.length === 0) return null;

      const prefix = `${effectiveUserId}_`;
      return data.map((row: any) => ({
        // Strip the userId prefix to get local visit ID
        id: row.id.startsWith(prefix) ? row.id.slice(prefix.length) : row.id,
        districtId: row.district_id,
        visitDate: row.date || new Date().toISOString().split('T')[0],
        title: row.title || 'ভ্রমণ স্মৃতি',
        notes: row.story || '',
        photos: (row.photos || []).filter((p: any) => p && typeof p.url === 'string' && p.url.trim().length > 0),
        rating: row.rating || 5,
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      }));
    } catch (e: any) {
      console.error('[SupabaseDB] fetchVisits EXCEPTION:', e?.message, e);
      return null;
    }
  },

  // Fetch trips — uses deterministic ID prefix
  async fetchTrips(userId?: string): Promise<Trip[] | null> {
    try {
      const effectiveUserId = await this.getEffectiveUserId(userId);
      if (!effectiveUserId) return null;

      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .like('id', `${effectiveUserId}_%`);

      if (error) {
        console.error('[SupabaseDB] fetchTrips FAILED:', error.message, error);
        return null;
      }
      if (!data || data.length === 0) return null;

      const prefix = `${effectiveUserId}_`;
      return data.map((row: any) => ({
        id: row.id.startsWith(prefix) ? row.id.slice(prefix.length) : row.id,
        name: row.name,
        startDate: row.start_date,
        endDate: row.end_date,
        notes: row.description || '',
        districtIds: row.district_ids || [],
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      }));
    } catch (e: any) {
      console.error('[SupabaseDB] fetchTrips EXCEPTION:', e?.message, e);
      return null;
    }
  },
};
