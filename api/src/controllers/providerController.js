const ProviderModel = require('../models/providerModel');
const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// Configure multer for clinic photos
const upload = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB per file
  }
});

// Export the multer middleware
const uploadClinicPhotos = upload.array('clinic_photos', 10);

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
        experience_years: parseInt(req.body.experience_years) || 0,
        clinic_name: req.body.clinic_name || '',
        contact_number: req.body.contact_number || '',
        location: req.body.location || '',
        about: req.body.about || null,
        clinic_video_url: req.body.clinic_video_url || null,
        availability: req.body.availability || null,
        coordinates: req.body.coordinates || null,
      };
      
      console.log('Provider Data:', providerData);
      
      // Validate required fields
      if (!providerData.specialty) {
        return res.status(400).json({ error: 'Specialty is required' });
      }
      if (!providerData.clinic_name) {
        return res.status(400).json({ error: 'Clinic name is required' });
      }
      if (!providerData.contact_number) {
        return res.status(400).json({ error: 'Contact number is required' });
      }
      if (!providerData.location) {
        return res.status(400).json({ error: 'Location is required' });
      }
      
      // Add uploaded photo paths
      if (req.files && req.files.length > 0) {
        providerData.clinic_photos = req.files.map(file => file.path.replace(/\\/g, '/'));
        console.log('Uploaded Photos:', providerData.clinic_photos);
      } else {
        providerData.clinic_photos = [];
      }
      
      console.log('Creating provider with data:', providerData);
      const provider = await ProviderModel.create(providerData);
      console.log('Provider created successfully:', provider);
      
      res.status(201).json({ message: 'Provider created successfully', data: provider });
    } catch (error) {
      console.error('Create provider error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getAllProviders(req, res) {
    try {
      const { specialty, location, page = 1, limit = 10 } = req.query;
      const filters = {};
      if (specialty) filters.specialty = specialty;
      if (location) filters.location = location;

      const providers = await ProviderModel.findAll(filters);
      
      // Pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedData = providers.slice(startIndex, endIndex);
      
      res.json({ 
        data: paginatedData,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: providers.length,
          totalPages: Math.ceil(providers.length / limitNum)
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
      res.json({ data: provider });
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
      
      if (req.body.specialty) providerData.specialty = req.body.specialty;
      if (req.body.experience_years) providerData.experience_years = parseInt(req.body.experience_years);
      if (req.body.clinic_name) providerData.clinic_name = req.body.clinic_name;
      if (req.body.contact_number) providerData.contact_number = req.body.contact_number;
      if (req.body.location) providerData.location = req.body.location;
      if (req.body.about !== undefined) providerData.about = req.body.about;
      if (req.body.clinic_video_url !== undefined) providerData.clinic_video_url = req.body.clinic_video_url;
      if (req.body.availability !== undefined) providerData.availability = req.body.availability;
      
      // Add uploaded photo paths if new photos are uploaded
      if (req.files && req.files.length > 0) {
        const newPhotos = req.files.map(file => file.path.replace(/\\/g, '/'));
        console.log('New Photos:', newPhotos);
        
        // Get existing provider to merge photos
        const existingProvider = await ProviderModel.findById(req.params.id);
        if (existingProvider && existingProvider.clinic_photos) {
          providerData.clinic_photos = [...existingProvider.clinic_photos, ...newPhotos];
        } else {
          providerData.clinic_photos = newPhotos;
        }
      }
      
      console.log('Updating provider with data:', providerData);
      const provider = await ProviderModel.update(req.params.id, providerData);
      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }
      
      console.log('Provider updated successfully:', provider);
      res.json({ message: 'Provider updated successfully', data: provider });
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
}

// Export both the controller and the upload middleware
module.exports = ProviderController;
module.exports.uploadClinicPhotos = uploadClinicPhotos;
