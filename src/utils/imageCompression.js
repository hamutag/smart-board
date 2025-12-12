// Client-side image compression / resizing (data saver).
//
// Why:
// - Many phones shoot 3-10MB images.
// - Uploading these as slide backgrounds burns data + makes the board slower.
//
// This utility downsizes images to a sensible resolution and recompresses.

function isImage(file) {
  return Boolean(file && typeof file.type === 'string' && file.type.startsWith('image/'));
}

function getBasename(name) {
  const i = name.lastIndexOf('.');
  return i > 0 ? name.slice(0, i) : name;
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    // Some browsers ignore quality for PNG; that's fine.
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

async function loadBitmap(file) {
  // createImageBitmap is fastest when available
  if (typeof createImageBitmap === 'function') {
    return await createImageBitmap(file);
  }

  // Fallback: HTMLImageElement
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = (e) => reject(e);
      el.src = url;
    });
    // Fake bitmap-like object
    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
      _img: img,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Compress an image file.
 *
 * @param {File} file
 * @param {object} options
 * @param {number} options.maxWidth
 * @param {number} options.maxHeight
 * @param {number} options.quality 0..1 (jpeg/webp)
 * @param {'auto'|'jpeg'|'png'|'webp'} options.format
 * @param {boolean} options.preserveAlpha
 * @param {number} options.skipBelowBytes If file is smaller than this, returns original
 */
export async function compressImageFile(
  file,
  {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.82,
    format = 'auto',
    preserveAlpha = false,
    skipBelowBytes = 250 * 1024,
  } = {}
) {
  if (!isImage(file)) return file;
  if (typeof window === 'undefined') return file;

  // Small images? not worth the CPU.
  if (file.size && file.size < skipBelowBytes) return file;

  let bitmap;
  try {
    bitmap = await loadBitmap(file);
  } catch {
    return file;
  }

  const srcW = bitmap.width;
  const srcH = bitmap.height;

  if (!srcW || !srcH) return file;

  const ratio = Math.min(1, maxWidth / srcW, maxHeight / srcH);
  const dstW = Math.max(1, Math.round(srcW * ratio));
  const dstH = Math.max(1, Math.round(srcH * ratio));

  // If we're not resizing and already not huge – keep original.
  if (ratio === 1 && file.size < 1.5 * 1024 * 1024) {
    return file;
  }

  const canvas = document.createElement('canvas');
  canvas.width = dstW;
  canvas.height = dstH;

  const ctx = canvas.getContext('2d', { alpha: preserveAlpha });
  if (!ctx) return file;

  // Draw
  if (bitmap._img) {
    ctx.drawImage(bitmap._img, 0, 0, dstW, dstH);
  } else {
    ctx.drawImage(bitmap, 0, 0, dstW, dstH);
  }

  // Decide output format
  const wantsPng = preserveAlpha || file.type === 'image/png';
  let mime;
  if (format === 'png' || wantsPng) {
    mime = 'image/png';
  } else if (format === 'jpeg') {
    mime = 'image/jpeg';
  } else if (format === 'webp') {
    mime = 'image/webp';
  } else {
    // auto: try webp first, fallback to jpeg
    mime = 'image/webp';
  }

  let blob = await canvasToBlob(canvas, mime, quality);

  // Fallback if webp not supported
  if (!blob && mime === 'image/webp') {
    mime = 'image/jpeg';
    blob = await canvasToBlob(canvas, mime, quality);
  }

  if (!blob) return file;

  // If compression didn't help, keep original
  if (blob.size >= file.size * 0.95) return file;

  const base = getBasename(file.name || 'image');
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
  const outName = `${base}.${ext}`;

  try {
    return new File([blob], outName, { type: mime, lastModified: Date.now() });
  } catch {
    // Older browsers might not support File constructor; use Blob
    blob.name = outName;
    return blob;
  }
}

export function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)}KB`;
  return `${(n / (1024 * 1024)).toFixed(2)}MB`;
}
