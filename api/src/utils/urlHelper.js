/**
 * URL Helper Utility
 * Converts relative file paths to absolute URLs
 */

// Store the last known request host for dynamic URL building
let _lastKnownHost = null;

/**
 * Set the current request host (called from middleware)
 */
function setRequestHost(host) {
  if (host) _lastKnownHost = host;
}

/**
 * Get the base URL from environment or construct it
 * @returns {string} Base URL
 */
function getBaseUrl() {
  // Use BASE_URL from environment if available
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }
  // Fallback to constructing from PORT
  const port = process.env.PORT || 8080;
  return `http://localhost:${port}`;
}

/**
 * Convert a relative file path to absolute URL
 * @param {string|null} relativePath - Relative path (e.g., "uploads/provider/2024/02/24/image.jpg")
 * @returns {string|null} Absolute URL or null
 */
function toAbsoluteUrl(relativePath) {
  if (!relativePath) return null;
  
  const baseUrl = getBaseUrl();
  
  // If it's already an absolute URL, replace the host with current base URL
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    try {
      const url = new URL(relativePath);
      const base = new URL(baseUrl);
      return `${base.origin}${url.pathname}`;
    } catch (e) {
      return relativePath;
    }
  }
  
  // Remove leading slash if present
  const cleanPath = relativePath.replace(/^\/+/, '');
  
  return `${baseUrl}/${cleanPath}`;
}

/**
 * Convert an array of relative paths to absolute URLs
 * @param {Array<string>|null} relativePaths - Array of relative paths
 * @returns {Array<string>|null} Array of absolute URLs or null
 */
function toAbsoluteUrls(relativePaths) {
  if (!relativePaths || !Array.isArray(relativePaths)) return null;
  
  return relativePaths
    .filter(path => path) // Remove null/undefined
    .map(path => toAbsoluteUrl(path));
}

/**
 * Convert all image/document fields in an object to absolute URLs
 * @param {Object} data - Data object with image/document fields
 * @param {Array<string>} fields - Array of field names to convert
 * @returns {Object} Data with converted URLs
 */
function convertFieldsToAbsoluteUrls(data, fields = []) {
  if (!data) return data;
  
  const converted = { ...data };
  
  fields.forEach(field => {
    if (converted[field]) {
      if (Array.isArray(converted[field])) {
        converted[field] = toAbsoluteUrls(converted[field]);
      } else {
        converted[field] = toAbsoluteUrl(converted[field]);
      }
    }
  });
  
  return converted;
}

/**
 * Convert provider data to include absolute URLs
 * @param {Object} provider - Provider data
 * @returns {Object} Provider with absolute URLs
 */
function convertProviderUrls(provider) {
  if (!provider) return provider;
  
  return convertFieldsToAbsoluteUrls(provider, [
    'clinic_photos',
    'profile_photo',
    'state_dental_council_reg_photo',
    'profile_picture', // Keep for backward compatibility
    'clinic_video_url'
  ]);
}

/**
 * Convert user data to include absolute URLs
 * @param {Object} user - User data
 * @returns {Object} User with absolute URLs
 */
function convertUserUrls(user) {
  if (!user) return user;
  
  return convertFieldsToAbsoluteUrls(user, [
    'profile_picture'
  ]);
}

/**
 * Convert document data to include absolute URLs
 * @param {Object} document - Document data
 * @returns {Object} Document with absolute URLs
 */
function convertDocumentUrls(document) {
  if (!document) return document;
  
  const converted = { ...document };
  
  // Convert file_url (backward compatibility field)
  if (converted.file_url) {
    converted.file_url = toAbsoluteUrl(converted.file_url);
  }
  
  // Convert files array (each file object has a path property)
  if (converted.files) {
    let filesArray = converted.files;
    
    // Parse if it's a JSON string
    if (typeof filesArray === 'string') {
      try {
        filesArray = JSON.parse(filesArray);
      } catch (e) {
        // If parsing fails, leave as is
        return converted;
      }
    }
    
    // Convert each file's path to absolute URL
    if (Array.isArray(filesArray)) {
      converted.files = filesArray.map(file => ({
        ...file,
        path: toAbsoluteUrl(file.path),
        url: toAbsoluteUrl(file.path) // Add url field for convenience
      }));
    }
  }
  
  return converted;
}

/**
 * Convert patient education data to include absolute URLs
 * @param {Object} education - Patient education data
 * @returns {Object} Education with absolute URLs
 */
function convertEducationUrls(education) {
  if (!education) return education;
  
  return convertFieldsToAbsoluteUrls(education, [
    'feature_image'
  ]);
}

/**
 * Convert patient data to include absolute URLs
 * @param {Object} patient - Patient data
 * @returns {Object} Patient with absolute URLs
 */
function convertPatientUrls(patient) {
  if (!patient) return patient;
  
  return convertFieldsToAbsoluteUrls(patient, [
    'profile_photo',
    'profile_picture' // Keep for backward compatibility
  ]);
}

module.exports = {
  getBaseUrl,
  toAbsoluteUrl,
  toAbsoluteUrls,
  convertFieldsToAbsoluteUrls,
  convertProviderUrls,
  convertUserUrls,
  convertDocumentUrls,
  convertEducationUrls,
  convertPatientUrls,
  setRequestHost,
};
