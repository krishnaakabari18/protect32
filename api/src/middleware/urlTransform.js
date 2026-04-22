/**
 * Global URL Transform Middleware
 * Intercepts all JSON responses and converts relative file paths to full URLs
 */

const { getBaseUrl } = require('../utils/urlHelper');

// Fields that contain file paths (relative or absolute)
const FILE_FIELDS = [
  'profile_picture', 'profile_photo', 'avatar', 'avatar_url',
  'user_profile_picture', 'user_photo',
  'file_url', 'file_path', 'document_url',
  'state_dental_council_reg_photo', 'clinic_board',
  'feature_image', 'image', 'image_url', 'photo',
  'site_logo', 'favicon', 'seo_og_image',
  'clinic_video_url',
];

// Array fields that contain file paths
const FILE_ARRAY_FIELDS = [
  'clinic_photos', 'images', 'photos', 'attachments',
];

function toFullUrl(value) {
  if (!value || typeof value !== 'string') return value;

  // Already a full URL — replace host with current base
  if (value.startsWith('http://') || value.startsWith('https://')) {
    try {
      const base = new URL(getBaseUrl());
      const existing = new URL(value);
      // Only replace if it's a file path (not an external URL like razorpay)
      if (existing.pathname.startsWith('/uploads') || existing.pathname.startsWith('/assets')) {
        return `${base.origin}${existing.pathname}`;
      }
    } catch (e) {}
    return value;
  }

  // Relative path starting with uploads/
  if (value.startsWith('uploads/') || value.startsWith('/uploads/')) {
    const clean = value.replace(/^\/+/, '');
    return `${getBaseUrl()}/${clean}`;
  }

  return value;
}

function transformObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => transformObject(item));
  }

  const result = { ...obj };

  for (const key of Object.keys(result)) {
    const val = result[key];

    if (FILE_FIELDS.includes(key)) {
      result[key] = toFullUrl(val);
    } else if (FILE_ARRAY_FIELDS.includes(key) && Array.isArray(val)) {
      result[key] = val.map(v => (typeof v === 'string' ? toFullUrl(v) : transformObject(v)));
    } else if (key === 'files' && Array.isArray(val)) {
      // Document files array: [{path, url, ...}]
      result[key] = val.map(f => {
        if (typeof f === 'string') return toFullUrl(f);
        const tf = { ...f };
        if (tf.path) tf.path = toFullUrl(tf.path);
        if (tf.url) tf.url = toFullUrl(tf.url);
        if (tf.file_url) tf.file_url = toFullUrl(tf.file_url);
        return tf;
      });
    } else if (key === 'items' && Array.isArray(val)) {
      // Document items array
      result[key] = val.map(item => transformObject(item));
    } else if (val && typeof val === 'object' && !Array.isArray(val)) {
      result[key] = transformObject(val);
    } else if (Array.isArray(val)) {
      result[key] = val.map(item => (typeof item === 'object' ? transformObject(item) : item));
    }
  }

  return result;
}

function urlTransformMiddleware(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = function (body) {
    try {
      if (body && typeof body === 'object') {
        body = transformObject(body);
      }
    } catch (e) {
      console.error('[urlTransform] Error transforming response:', e.message);
    }
    return originalJson(body);
  };

  next();
}

module.exports = urlTransformMiddleware;
