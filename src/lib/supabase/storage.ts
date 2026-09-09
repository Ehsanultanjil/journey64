import { supabase } from './client';
import { compressImage } from '../storage';

export interface PhotoUploadResult {
  url: string;
  isCloudStorage: boolean;
  error?: string;
}

/**
 * Uploads a photo to Supabase Storage ('photos' bucket) if available.
 * If the bucket is not yet configured, automatically falls back to an
 * optimized lightweight compressed base64 image (<200KB) to prevent database timeouts.
 */
export async function uploadPhotoFile(
  file: File,
  districtId: string,
  userId?: string
): Promise<PhotoUploadResult> {
  // Step 1: Client-side compression to ensure fast performance and crisp visual quality
  const compressedBase64 = await compressImage(file, 1200, 1200, 0.75);

  // Step 2: If user is logged in, try uploading to Supabase Storage 'photos' bucket
  if (userId) {
    try {
      // Convert base64 to Blob for storage upload
      const response = await fetch(compressedBase64);
      const blob = await response.blob();

      const ext = file.type?.split('/')[1] || 'jpg';
      const cleanUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '');
      const filePath = `${cleanUserId}/${districtId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

      const { data, error } = await supabase.storage
        .from('photos')
        .upload(filePath, blob, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('photos')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return {
            url: publicUrlData.publicUrl,
            isCloudStorage: true,
          };
        }
      } else {
        console.warn('[Supabase Storage] Bucket upload failed or bucket does not exist:', error?.message);
      }
    } catch (err: any) {
      console.warn('[Supabase Storage] Upload exception:', err?.message || err);
    }
  }

  // Fallback to lightweight compressed base64
  return {
    url: compressedBase64,
    isCloudStorage: false,
  };
}
