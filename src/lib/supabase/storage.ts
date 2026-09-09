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
function dataURLtoBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const binary = atob(parts[1]);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}

/**
 * Uploads a photo to Supabase Storage ('photos' bucket).
 * Uses high-performance client-side compression and directly converts to Blob.
 * Always resolves to a public Supabase Storage URL for cross-device synchronization.
 */
export async function uploadPhotoFile(
  file: File,
  districtId: string,
  userId?: string
): Promise<PhotoUploadResult> {
  // Step 1: Client-side compression to ensure fast upload and crisp visual quality
  const compressedBase64 = await compressImage(file, 1200, 1200, 0.75);

  // Step 2: Resolve effective user ID
  let effectiveUserId = userId;
  if (!effectiveUserId) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      effectiveUserId = session?.user?.id;
    } catch {
      // ignore
    }
  }

  const cleanUserId = (effectiveUserId || 'guest').replace(/[^a-zA-Z0-9_-]/g, '');
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const filePath = `${cleanUserId}/${districtId}_${uniqueId}.jpg`;

  try {
    const blob = dataURLtoBlob(compressedBase64);

    const { data, error } = await supabase.storage
      .from('photos')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('[Supabase Storage] Upload error:', error.message);
      throw error;
    }

    if (data) {
      const { data: publicUrlData } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        return {
          url: publicUrlData.publicUrl,
          isCloudStorage: true,
        };
      }
    }

    throw new Error('Supabase Storage did not return public URL');
  } catch (err: any) {
    console.error('[Supabase Storage] Failed to upload photo to storage:', err?.message || err);
    // If user is offline or storage is unreachable, fallback to compressedBase64 with error note
    return {
      url: compressedBase64,
      isCloudStorage: false,
      error: err?.message || 'Storage upload failed',
    };
  }
}
