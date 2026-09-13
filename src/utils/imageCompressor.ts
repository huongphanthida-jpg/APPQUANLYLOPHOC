/**
 * Utility to downscale and compress Base64 image data URLs before saving to localStorage.
 * Prevents QuotaExceededError while retaining clear visual quality for student avatars.
 */

export const compressImageBase64 = (
  dataUrl: string,
  maxWidth = 300,
  maxHeight = 300,
  quality = 0.82
): Promise<string> => {
  return new Promise((resolve) => {
    // If not a base64 data URL (e.g. http link or empty), return as-is
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      return resolve(dataUrl);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        // If image is already smaller than target bounds and payload small, return as-is
        if (width <= maxWidth && height <= maxHeight && dataUrl.length < 50 * 1024) {
          return resolve(dataUrl);
        }

        // Calculate aspect ratio fit
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(dataUrl);
        }

        // Use high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG with specified quality (~15-30KB)
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch (err) {
        console.warn('Image compression fallback:', err);
        resolve(dataUrl);
      }
    };

    img.onerror = () => {
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
};
