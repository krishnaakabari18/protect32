const ProviderModel = require('../models/providerModel');
const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { convertProviderUrls } = require('../utils/urlHelper');

// Compute open_time and close_time for each day based on enabled sessions
function computeTimeSlots(timeSlots) {
  if (!timeSlots || !Array.isArray(timeSlots)) return timeSlots;
  return timeSlots.map(day => {
    if (!day.is_open) return { ...day, open_time: null, close_time: null };

    const sessions = [
      { key: 'morning',   data: day.morning },
      { key: 'afternoon', data: day.afternoon },
      { key: 'evening',   data: day.evening },
    ];

    // Find first enabled session → open_time
    const firstEnabled = sessions.find(s => s.data?.enabled);
    // Find last enabled session → close_time
    const lastEnabled = [...sessions].reverse().find(s => s.data?.enabled);

    const open_time  = firstEnabled?.data?.start || null;
    const close_time = lastEnabled?.data?.end   || null;

    return { ...day, open_time, close_time };
  });
}

// Helper function to safely parse integers
const safeParseInt = (value, defaultValue = null) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Configure storage for provider clinic photos with date-based folder structure
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    const uploadPath = path.join('uploads', 'provider', String(year), month, day);
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    const filename = `${timestamp}_${basename}${ext}`;
    cb(null, filename);
  }
});

// File filter for images only
const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// Configure multer for clinic photos and other files
const upload = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB per file
  }
});

// Export the multer middleware for multiple file types
const uploadClinicPhotos = upload.fields([
  { name: 'clinic_photos', maxCount: 10 },
  { name: 'state_dental_council_reg_photo', maxCount: 1 },
  { name: 'profile_photo', maxCount: 1 }
]);

class ProviderController {
  static async createProvider(req, res) {
    try {
      console.log('=== CREATE PROVIDER DEBUG ===');
      console.log('Request Body:', req.body);
      console.log('Request Files:', req.files);
      
      // Extract and validate data
      const id = req.body.id;
      
      if (!id) {
        console.error('ERROR: No ID provided');
        return res.status(400).json({ error: 'Provider ID (user_id) is required. Please select a provider from the dropdown.' });
      }
      
      console.log('Provider ID:', id);
      
      // Check if provider already exists
      const existingProvider = await ProviderModel.findById(id);
      if (existingProvider) {
        console.error('ERROR: Provider already exists for this user');
        return res.status(400).json({ error: 'A provider record already exists for this user. Please select a different user or edit the existing provider.' });
      }
      
      // Check if user exists
      const userCheck = await pool.query('SELECT id, user_type FROM users WHERE id = $1', [id]);
      if (userCheck.rows.length === 0) {
        console.error('ERROR: User not found');
        return res.status(400).json({ error: 'User not found. Please select a valid user from the dropdown.' });
      }
      
      if (userCheck.rows[0].user_type !== 'provider') {
        console.error('ERROR: User is not a provider');
        return res.status(400).json({ error: 'Selected user is not a provider. Please select a user with provider type.' });
      }
      
      const providerData = {
        id: id,
        specialty: req.body.specialty || '',
        experience_years: safeParseInt(req.body.experience_years, 0),
        clinic_name: req.body.clinic_name || '',
        contact_number: req.body.contact_number || req.body.mobile_number || '',
        location: req.body.location || '',
        about: req.body.about || null,
        clinic_video_url: req.body.clinic_video_url || null,
        availability: req.body.availability || null,
        coordinates: req.body.coordinates || null,
        
        // New fields - Clinic Equipment
        dental_chairs: safeParseInt(req.body.dental_chairs, 2),
        iopa_xray_type: req.body.iopa_xray_type || 'Digital',
        has_opg: req.body.has_opg === 'true' || req.body.has_opg === true,
        has_ultrasonic_cleaner: req.body.has_ultrasonic_cleaner === 'true' || req.body.has_ultrasonic_cleaner === true,
        intraoral_camera_type: req.body.intraoral_camera_type || 'USB Model',
        rct_equipment: req.body.rct_equipment || 'Endomotor',
        autoclave_type: req.body.autoclave_type || 'Pressure cooker type',
        sterilization_protocol: req.body.sterilization_protocol || 'Autoclave',
        disinfection_protocol: req.body.disinfection_protocol || 'Chemical based',
        
        // Bank Details
        bank_name: req.body.bank_name || null,
        bank_branch_name: req.body.bank_branch_name || null,
        bank_account_name: req.body.bank_account_name || null,
        bank_account_number: req.body.bank_account_number || null,
        bank_account_type: req.body.bank_account_type || null,
        bank_micr_no: req.body.bank_micr_no || null,
        bank_ifsc_code: req.body.bank_ifsc_code || null,
        
        // Clinic Details
        number_of_clinics: safeParseInt(req.body.number_of_clinics, 1),
        
        // Provider Personal Details
        full_name: req.body.full_name || null,
        date_of_birth: req.body.date_of_birth || null,
        pincode: req.body.pincode || null,
        mobile_number: req.body.mobile_number || null,
        whatsapp_number: req.body.whatsapp_number || null,
        email: req.body.email || null,
        years_of_experience: safeParseInt(req.body.years_of_experience, 0),
        state_dental_council_reg_number: req.body.state_dental_council_reg_number || null,
        state_dental_council_reg_photo: req.body.state_dental_council_reg_photo || null,
        profile_photo: req.body.profile_photo || null,
      };
      
      // Handle JSON fields
      try {
        if (req.body.specialists_availability) {
          providerData.specialists_availability = typeof req.body.specialists_availability === 'string' 
            ? JSON.parse(req.body.specialists_availability) 
            : req.body.specialists_availability;
        } else {
          providerData.specialists_availability = [];
        }
      } catch (e) {
        console.error('Error parsing specialists_availability:', e);
        providerData.specialists_availability = [];
      }
      
      try {
        if (req.body.clinics) {
          providerData.clinics = typeof req.body.clinics === 'string' 
            ? JSON.parse(req.body.clinics) 
            : req.body.clinics;
        } else {
          providerData.clinics = [];
        }
      } catch (e) {
        console.error('Error parsing clinics:', e);
        providerData.clinics = [];
      }
      
      try {
        if (req.body.coordinates) {
          providerData.coordinates = typeof req.body.coordinates === 'string' 
            ? JSON.parse(req.body.coordinates) 
            : req.body.coordinates;
        }
      } catch (e) {
        console.error('Error parsing coordinates:', e);
        providerData.coordinates = null;
      }
      
      // Handle time_slots JSON - parse if it's a string
      if (req.body.time_slots) {
        try {
          providerData.time_slots = typeof req.body.time_slots === 'string' 
            ? JSON.parse(req.body.time_slots) 
            : req.body.time_slots;
        } catch (e) {
          console.error('Error parsing time_slots:', e);
          providerData.time_slots = req.body.time_slots;
        }
      }
      
      console.log('Provider Data:', providerData);
      console.log('Time Slots:', providerData.time_slots);
      
      // Validate required fields
      // if (!providerData.specialty) {
      //   return res.status(400).json({ error: 'Specialty is required' });
      // }
      // if (!providerData.clinic_name) {
      //   return res.status(400).json({ error: 'Clinic name is required' });
      // }
      // Accept either mobile_number or contact_number
      // if (!providerData.mobile_number && !providerData.contact_number) {
      //   return res.status(400).json({ error: 'Mobile number or contact number is required' });
      // }
      // if (!providerData.location) {
      //   return res.status(400).json({ error: 'Location is required' });
      // }
      
      // Add uploaded photo paths
      if (req.files) {
        // Handle clinic photos
        if (req.files.clinic_photos && req.files.clinic_photos.length > 0) {
          providerData.clinic_photos = req.files.clinic_photos.map(file => file.path.replace(/\\/g, '/'));
          console.log('Uploaded Clinic Photos:', providerData.clinic_photos);
        } else {
          providerData.clinic_photos = [];
        }
        
        // Handle state dental council registration photo
        if (req.files.state_dental_council_reg_photo && req.files.state_dental_council_reg_photo.length > 0) {
          providerData.state_dental_council_reg_photo = req.files.state_dental_council_reg_photo[0].path.replace(/\\/g, '/');
          console.log('Uploaded State Dental Council Photo:', providerData.state_dental_council_reg_photo);
        }
        
        // Handle profile photo
        if (req.files.profile_photo && req.files.profile_photo.length > 0) {
          providerData.profile_photo = req.files.profile_photo[0].path.replace(/\\/g, '/');
          console.log('Uploaded Profile Photo:', providerData.profile_photo);
        }
      } else {
        providerData.clinic_photos = [];
      }
      
      console.log('Creating provider with data:', providerData);
      const provider = await ProviderModel.create(providerData);
      console.log('Provider created successfully:', provider);

      // Sync procedures
      try {
        const procedureFees = req.body.procedure_fees
          ? (typeof req.body.procedure_fees === 'string' ? JSON.parse(req.body.procedure_fees) : req.body.procedure_fees)
          : (req.body.procedure_ids ? (typeof req.body.procedure_ids === 'string' ? JSON.parse(req.body.procedure_ids) : req.body.procedure_ids) : []);
        await ProviderModel.syncProcedures(provider.id, procedureFees);
      } catch (e) { console.error('Error syncing procedures:', e); }

      // Update linked user: first_name, last_name, email
      try {
        const { first_name, last_name, email } = req.body;
        const pool = require('../config/database');
        const updateFields = [];
        const updateValues = [];
        let up = 1;
        if (first_name !== undefined) { updateFields.push('first_name=$' + up++); updateValues.push(first_name); }
        if (last_name !== undefined)  { updateFields.push('last_name=$' + up++);  updateValues.push(last_name); }
        if (email)                    { updateFields.push('email=$' + up++);      updateValues.push(email); }
        if (updateFields.length > 0) {
          updateValues.push(provider.id);
          await pool.query('UPDATE users SET ' + updateFields.join(', ') + ' WHERE id=$' + up, updateValues);
        }
      } catch (e) { console.error('Error updating user from provider create:', e); }

      // Convert relative paths to absolute URLs
      const providerWithUrls = convertProviderUrls(provider);
      if (providerWithUrls.time_slots) {
        const ts = typeof providerWithUrls.time_slots === 'string' ? JSON.parse(providerWithUrls.time_slots) : providerWithUrls.time_slots;
        providerWithUrls.time_slots = computeTimeSlots(ts);
      }
      
      res.status(201).json({ message: 'Provider created successfully', data: providerWithUrls });
    } catch (error) {
      console.error('Create provider error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getAllProviders(req, res) {
    try {
      // Support both GET (query params) and POST (body) for filters
      const source = req.method === 'POST' ? req.body : req.query;
      const {
        specialty, location, pincode, search, keyword,
        min_experience, min_rating, daytime, procedure_id,
        page = 1, limit = 10
      } = source;

      const filters = {};
      if (keyword)        filters.keyword = keyword;
      if (specialty)      filters.specialty = specialty;
      if (location)       filters.location = location;
      if (pincode)        filters.pincode = pincode;
      if (search)         filters.search = search;
      if (min_experience) filters.min_experience = min_experience;
      if (min_rating)     filters.min_rating = min_rating;
      if (daytime)        filters.daytime = daytime;
      if (procedure_id)   filters.procedure_id = procedure_id;

      const providers = await ProviderModel.findAll(filters);
      const providersWithUrls = providers.map(provider => {
        const p = convertProviderUrls(provider);
        if (p.time_slots) {
          const ts = typeof p.time_slots === 'string' ? JSON.parse(p.time_slots) : p.time_slots;
          p.time_slots = computeTimeSlots(ts);
        }
        return p;
      });

      const pageNum = safeParseInt(page, 1);
      const limitNum = safeParseInt(limit, 10);
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedData = providersWithUrls.slice(startIndex, startIndex + limitNum);

      res.json({
        data: paginatedData,
        pagination: {
          page: pageNum, limit: limitNum,
          total: providersWithUrls.length,
          totalPages: Math.ceil(providersWithUrls.length / limitNum)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getProviderById(req, res) {
    try {
      const provider = await ProviderModel.findById(req.params.id);
      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }
      
      // Convert relative paths to absolute URLs
      const providerWithUrls = convertProviderUrls(provider);
      if (providerWithUrls.time_slots) {
        const ts = typeof providerWithUrls.time_slots === 'string' ? JSON.parse(providerWithUrls.time_slots) : providerWithUrls.time_slots;
        providerWithUrls.time_slots = computeTimeSlots(ts);
      }
      
      res.json({ data: providerWithUrls });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateProvider(req, res) {
    try {
      console.log('=== UPDATE PROVIDER DEBUG ===');
      console.log('Request Body:', req.body);
      console.log('Request Files:', req.files);
      
      // Extract data from FormData
      const providerData = {};
      
      // Basic fields
      if (req.body.specialty !== undefined) providerData.specialty = req.body.specialty;
      if (req.body.experience_years !== undefined) providerData.experience_years = safeParseInt(req.body.experience_years, 0);
      if (req.body.clinic_name !== undefined) providerData.clinic_name = req.body.clinic_name;
      if (req.body.contact_number !== undefined) providerData.contact_number = req.body.contact_number || req.body.mobile_number;
      if (req.body.location !== undefined) providerData.location = req.body.location;
      if (req.body.about !== undefined) providerData.about = req.body.about;
      if (req.body.clinic_video_url !== undefined) providerData.clinic_video_url = req.body.clinic_video_url;
      if (req.body.availability !== undefined) providerData.availability = req.body.availability;
      
      // Clinic Equipment fields
      if (req.body.dental_chairs !== undefined) providerData.dental_chairs = safeParseInt(req.body.dental_chairs, 2);
      if (req.body.iopa_xray_type !== undefined) providerData.iopa_xray_type = req.body.iopa_xray_type;
      if (req.body.has_opg !== undefined) providerData.has_opg = req.body.has_opg === 'true' || req.body.has_opg === true;
      if (req.body.has_ultrasonic_cleaner !== undefined) providerData.has_ultrasonic_cleaner = req.body.has_ultrasonic_cleaner === 'true' || req.body.has_ultrasonic_cleaner === true;
      if (req.body.intraoral_camera_type !== undefined) providerData.intraoral_camera_type = req.body.intraoral_camera_type;
      if (req.body.rct_equipment !== undefined) providerData.rct_equipment = req.body.rct_equipment;
      if (req.body.autoclave_type !== undefined) providerData.autoclave_type = req.body.autoclave_type;
      if (req.body.sterilization_protocol !== undefined) providerData.sterilization_protocol = req.body.sterilization_protocol;
      if (req.body.disinfection_protocol !== undefined) providerData.disinfection_protocol = req.body.disinfection_protocol;
      
      // Bank Details
      if (req.body.bank_name !== undefined) providerData.bank_name = req.body.bank_name;
      if (req.body.bank_branch_name !== undefined) providerData.bank_branch_name = req.body.bank_branch_name;
      if (req.body.bank_account_name !== undefined) providerData.bank_account_name = req.body.bank_account_name;
      if (req.body.bank_account_number !== undefined) providerData.bank_account_number = req.body.bank_account_number;
      if (req.body.bank_account_type !== undefined) providerData.bank_account_type = req.body.bank_account_type;
      if (req.body.bank_micr_no !== undefined) providerData.bank_micr_no = req.body.bank_micr_no;
      if (req.body.bank_ifsc_code !== undefined) providerData.bank_ifsc_code = req.body.bank_ifsc_code;
      
      // Provider Personal Details
      if (req.body.full_name !== undefined) providerData.full_name = req.body.full_name;
      if (req.body.date_of_birth !== undefined) providerData.date_of_birth = req.body.date_of_birth;
      if (req.body.pincode !== undefined) providerData.pincode = req.body.pincode;
      if (req.body.mobile_number !== undefined) providerData.mobile_number = req.body.mobile_number;
      if (req.body.whatsapp_number !== undefined) providerData.whatsapp_number = req.body.whatsapp_number;
      if (req.body.email !== undefined) providerData.email = req.body.email;
      if (req.body.years_of_experience !== undefined) providerData.years_of_experience = safeParseInt(req.body.years_of_experience, 0);
      if (req.body.state_dental_council_reg_number !== undefined) providerData.state_dental_council_reg_number = req.body.state_dental_council_reg_number;
      if (req.body.number_of_clinics !== undefined) providerData.number_of_clinics = safeParseInt(req.body.number_of_clinics, 1);
      
      // Handle JSON fields
      if (req.body.specialists_availability !== undefined) {
        try {
          providerData.specialists_availability = typeof req.body.specialists_availability === 'string' 
            ? JSON.parse(req.body.specialists_availability) 
            : req.body.specialists_availability;
        } catch (e) {
          console.error('Error parsing specialists_availability:', e);
          providerData.specialists_availability = req.body.specialists_availability;
        }
      }
      
      if (req.body.clinics !== undefined) {
        try {
          providerData.clinics = typeof req.body.clinics === 'string' 
            ? JSON.parse(req.body.clinics) 
            : req.body.clinics;
        } catch (e) {
          console.error('Error parsing clinics:', e);
          providerData.clinics = req.body.clinics;
        }
      }
      
      if (req.body.coordinates !== undefined) {
        try {
          providerData.coordinates = typeof req.body.coordinates === 'string' 
            ? JSON.parse(req.body.coordinates) 
            : req.body.coordinates;
        } catch (e) {
          console.error('Error parsing coordinates:', e);
          providerData.coordinates = req.body.coordinates;
        }
      }
      
      // Handle time_slots JSON - parse if it's a string
      if (req.body.time_slots !== undefined) {
        try {
          providerData.time_slots = typeof req.body.time_slots === 'string' 
            ? JSON.parse(req.body.time_slots) 
            : req.body.time_slots;
        } catch (e) {
          console.error('Error parsing time_slots:', e);
          providerData.time_slots = req.body.time_slots;
        }
      }
      
      console.log('Availability:', providerData.availability);
      console.log('Time Slots:', providerData.time_slots);
      
      // Add uploaded photo paths if new photos are uploaded
      if (req.files) {
        // Handle clinic photos — merge existing order with new uploads
        if (req.files.clinic_photos && req.files.clinic_photos.length > 0) {
          const newPhotos = req.files.clinic_photos.map(file => file.path.replace(/\\/g, '/'));

          // Use existing_photo_order if provided (reordered existing URLs from frontend)
          let existingOrder = [];
          if (req.body.existing_photo_order) {
            try {
              existingOrder = JSON.parse(req.body.existing_photo_order);
              // Strip absolute URLs back to relative paths for storage
              existingOrder = existingOrder.map(url => {
                // If it's an absolute URL, extract the relative path
                const match = url.match(/\/uploads\/.+/);
                return match ? match[0].replace(/^\//, '') : url;
              });
            } catch (e) {
              console.error('Error parsing existing_photo_order:', e);
            }
          }

          // Final order: existing (reordered) + new uploads appended at end
          providerData.clinic_photos = [...existingOrder, ...newPhotos];
        } else if (req.body.existing_photo_order) {
          // No new files but order may have changed
          try {
            let existingOrder = JSON.parse(req.body.existing_photo_order);
            existingOrder = existingOrder.map(url => {
              const match = url.match(/\/uploads\/.+/);
              return match ? match[0].replace(/^\//, '') : url;
            });
            providerData.clinic_photos = existingOrder;
          } catch (e) {
            console.error('Error parsing existing_photo_order:', e);
          }
        }
        
        // Handle state dental council registration photo
        if (req.files.state_dental_council_reg_photo && req.files.state_dental_council_reg_photo.length > 0) {
          providerData.state_dental_council_reg_photo = req.files.state_dental_council_reg_photo[0].path.replace(/\\/g, '/');
          console.log('Updated State Dental Council Photo:', providerData.state_dental_council_reg_photo);
        }
        
        // Handle profile photo
        if (req.files.profile_photo && req.files.profile_photo.length > 0) {
          providerData.profile_photo = req.files.profile_photo[0].path.replace(/\\/g, '/');
        }
      } else if (req.body.existing_photo_order) {
        // No files uploaded at all, but order may have changed
        try {
          let existingOrder = JSON.parse(req.body.existing_photo_order);
          existingOrder = existingOrder.map(url => {
            const match = url.match(/\/uploads\/.+/);
            return match ? match[0].replace(/^\//, '') : url;
          });
          providerData.clinic_photos = existingOrder;
        } catch (e) {
          console.error('Error parsing existing_photo_order (no files):', e);
        }
      }
      const provider = await ProviderModel.update(req.params.id, providerData);
      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      // Sync procedures
      try {
        const procedureFees = req.body.procedure_fees
          ? (typeof req.body.procedure_fees === 'string' ? JSON.parse(req.body.procedure_fees) : req.body.procedure_fees)
          : (req.body.procedure_ids ? (typeof req.body.procedure_ids === 'string' ? JSON.parse(req.body.procedure_ids) : req.body.procedure_ids) : []);
        await ProviderModel.syncProcedures(provider.id, procedureFees);
      } catch (e) { console.error('Error syncing procedures:', e); }

      // Update linked user: first_name, last_name, email
      try {
        const { first_name, last_name, email } = req.body;
        const pool = require('../config/database');
        const updateFields = [];
        const updateValues = [];
        let up = 1;
        if (first_name !== undefined) { updateFields.push('first_name=$' + up++); updateValues.push(first_name); }
        if (last_name !== undefined)  { updateFields.push('last_name=$' + up++);  updateValues.push(last_name); }
        if (email)                    { updateFields.push('email=$' + up++);      updateValues.push(email); }
        if (updateFields.length > 0) {
          updateValues.push(req.params.id);
          await pool.query('UPDATE users SET ' + updateFields.join(', ') + ' WHERE id=$' + up, updateValues);
        }
      } catch (e) { console.error('Error updating user from provider update:', e); }

      // Convert relative paths to absolute URLs
      const providerWithUrls = convertProviderUrls(provider);
      if (providerWithUrls.time_slots) {
        const ts = typeof providerWithUrls.time_slots === 'string' ? JSON.parse(providerWithUrls.time_slots) : providerWithUrls.time_slots;
        providerWithUrls.time_slots = computeTimeSlots(ts);
      }
      
      console.log('Provider updated successfully:', provider);
      res.json({ message: 'Provider updated successfully', data: providerWithUrls });
    } catch (error) {
      console.error('Update provider error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteProvider(req, res) {
    try {
      const provider = await ProviderModel.delete(req.params.id);
      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }
      res.json({ message: 'Provider deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteProviderImage(req, res) {
    try {
      const { id, imageType } = req.params;
      const { imagePath, imageIndex } = req.body;

      console.log('=== DELETE PROVIDER IMAGE DEBUG ===');
      console.log('Provider ID:', id);
      console.log('Image Type:', imageType);
      console.log('Image Path:', imagePath);
      console.log('Image Index:', imageIndex);

      // Get current provider data
      const provider = await ProviderModel.findById(id);
      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      let updateData = {};
      let filePathToDelete = null;

      switch (imageType) {
        case 'clinic_photos':
          if (provider.clinic_photos && Array.isArray(provider.clinic_photos)) {
            const updatedPhotos = [...provider.clinic_photos];
            if (imageIndex !== undefined && imageIndex >= 0 && imageIndex < updatedPhotos.length) {
              filePathToDelete = updatedPhotos[imageIndex];
              updatedPhotos.splice(imageIndex, 1);
              updateData.clinic_photos = updatedPhotos;
            } else if (imagePath) {
              const pathIndex = updatedPhotos.indexOf(imagePath);
              if (pathIndex > -1) {
                filePathToDelete = imagePath;
                updatedPhotos.splice(pathIndex, 1);
                updateData.clinic_photos = updatedPhotos;
              }
            }
          }
          break;

        case 'profile_photo':
          if (provider.profile_photo) {
            filePathToDelete = provider.profile_photo;
            updateData.profile_photo = null;
          }
          break;

        case 'state_dental_council_reg_photo':
          if (provider.state_dental_council_reg_photo) {
            filePathToDelete = provider.state_dental_council_reg_photo;
            updateData.state_dental_council_reg_photo = null;
          }
          break;

        default:
          return res.status(400).json({ error: 'Invalid image type' });
      }

      if (!filePathToDelete) {
        return res.status(404).json({ error: 'Image not found' });
      }

      // Update database
      const updatedProvider = await ProviderModel.update(id, updateData);
      if (!updatedProvider) {
        return res.status(404).json({ error: 'Failed to update provider' });
      }

      // Delete file from filesystem
      try {
        const fullPath = path.join(__dirname, '../../..', filePathToDelete);
        console.log('Attempting to delete file:', fullPath);
        
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log('File deleted successfully:', fullPath);
        } else {
          console.log('File not found on filesystem:', fullPath);
        }
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
        // Don't fail the request if file deletion fails
      }

      // Convert relative paths to absolute URLs for response
      const providerWithUrls = convertProviderUrls(updatedProvider);

      res.json({ 
        message: 'Image deleted successfully',
        data: providerWithUrls
      });

    } catch (error) {
      console.error('Delete provider image error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getProviderProcedures(req, res) {
    try {
      const pool = require('../config/database');
      const { id } = req.params;
      const result = await pool.query(
        `SELECT p.id, p.name, p.category, p.description
         FROM procedures p
         INNER JOIN provider_procedures pp ON pp.procedure_id = p.id
         WHERE pp.provider_id = $1 AND p.is_active = true
         ORDER BY p.category, p.name`,
        [id]
      );
      res.json({ data: result.rows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

// Export both the controller and the upload middleware
module.exports = ProviderController;
module.exports.uploadClinicPhotos = uploadClinicPhotos;
