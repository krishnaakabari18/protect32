const PatientModel = require('../models/patientModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { convertPatientUrls } = require('../utils/urlHelper');

// Helper function to safely parse integers
const safeParseInt = (value, defaultValue = null) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Configure storage — profile photos go to uploads/users/{userId}/ (same as user controller)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // req.params.id is available when multer runs after route matching
    const userId = req.params?.id || req.user?.id || 'temp';
    const uploadPath = path.join('uploads', 'users', String(userId));
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile_${Date.now()}${ext}`);
  }
});

// File filter for images only
const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'), false);
  }
};

// Configure multer for patient photos
const upload = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB per file
  }
});

// Export the multer middleware for patient profile photos
const uploadPatientPhotos = upload.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'family_member_photo', maxCount: 1 }
]);

class PatientController {
  static async create(req, res) {
    try {
      console.log('=== CREATE PATIENT DEBUG ===');
      console.log('Request Body:', req.body);
      console.log('Request Files:', req.files);
      
      const id = req.body.id;
      
      if (!id) {
        console.error('ERROR: No ID provided');
        return res.status(400).json({ error: 'Patient ID (user_id) is required. Please select a patient from the dropdown.' });
      }
      
      // Check if patient already exists
      const existingPatient = await PatientModel.findById(id);
      if (existingPatient) {
        console.error('ERROR: Patient already exists for this user');
        return res.status(400).json({ error: 'A patient record already exists for this user. Please select a different user or edit the existing patient.' });
      }
      
      const patientData = {
        id: id,
        // Basic info
        emergency_contact_name: req.body.emergency_contact_name || null,
        emergency_contact_number: req.body.emergency_contact_number || null,
        insurance_provider: req.body.insurance_provider || null,
        insurance_policy_number: req.body.insurance_policy_number || null,
        
        // Enhanced profile fields
        gender: req.body.gender || null,
        blood_group: req.body.blood_group || null,
        height_cm: req.body.height_cm || null,
        weight_kg: req.body.weight_kg || null,
        occupation: req.body.occupation || null,
        marital_status: req.body.marital_status || null,
        nationality: req.body.nationality || null,
        preferred_language: req.body.preferred_language || null,
        religion: req.body.religion || null,
        
        // Medical information
        medical_history: req.body.medical_history || null,
        current_medications: req.body.current_medications || null,
        allergies: req.body.allergies || null,
        chronic_conditions: req.body.chronic_conditions || null,
        previous_surgeries: req.body.previous_surgeries || null,
        family_medical_history: req.body.family_medical_history || null,
        
        // Dental information
        dental_history: req.body.dental_history || null,
        dental_concerns: req.body.dental_concerns || null,
        previous_dental_treatments: req.body.previous_dental_treatments || null,
        dental_anxiety_level: req.body.dental_anxiety_level || null,
        preferred_appointment_time: req.body.preferred_appointment_time || null,
        special_needs: req.body.special_needs || null,
        
        // Contact information
        secondary_phone: req.body.secondary_phone || null,
        work_phone: req.body.work_phone || null,
        preferred_contact_method: req.body.preferred_contact_method || null,
        
        // Address
        address_line_1: req.body.address_line_1 || null,
        address_line_2: req.body.address_line_2 || null,
        city: req.body.city || null,
        state: req.body.state || null,
        postal_code: req.body.postal_code || null,
        country: req.body.country || 'India',
        
        // Insurance
        insurance_type: req.body.insurance_type || null,
        insurance_expiry_date: req.body.insurance_expiry_date || null,
        insurance_coverage_amount: req.body.insurance_coverage_amount || null,
        
        // Preferences (JSON fields)
        communication_preferences: req.body.communication_preferences || null,
        appointment_preferences: req.body.appointment_preferences || null,
        privacy_settings: req.body.privacy_settings || null
      };
      
      // Handle JSON fields
      try {
        if (req.body.communication_preferences) {
          patientData.communication_preferences = typeof req.body.communication_preferences === 'string' 
            ? JSON.parse(req.body.communication_preferences) 
            : req.body.communication_preferences;
        }
        if (req.body.appointment_preferences) {
          patientData.appointment_preferences = typeof req.body.appointment_preferences === 'string' 
            ? JSON.parse(req.body.appointment_preferences) 
            : req.body.appointment_preferences;
        }
        if (req.body.privacy_settings) {
          patientData.privacy_settings = typeof req.body.privacy_settings === 'string' 
            ? JSON.parse(req.body.privacy_settings) 
            : req.body.privacy_settings;
        }
      } catch (e) {
        console.error('Error parsing JSON fields:', e);
      }
      
      // Add uploaded photo path — save to patients.profile_photo AND users.profile_picture
      if (req.files && req.files.profile_photo && req.files.profile_photo.length > 0) {
        const photoPath = req.files.profile_photo[0].path.replace(/\\/g, '/');
        patientData.profile_photo = photoPath;
        // Sync to users table
        const pool = require('../config/database');
        await pool.query('UPDATE users SET profile_picture = $1 WHERE id = $2', [photoPath, id]);
      }
      
      console.log('Creating patient with data:', patientData);
      const patient = await PatientModel.create(patientData);
      console.log('Patient created successfully:', patient);

      // Also update the linked user's first_name, last_name, email
      const { first_name, last_name, email, mobile_number } = req.body;
      if (first_name || last_name || email || mobile_number) {
        const userFields = [];
        const userValues = [];
        let up = 1;
        if (first_name) { userFields.push(`first_name = $${up++}`); userValues.push(first_name); }
        if (last_name)  { userFields.push(`last_name = $${up++}`);  userValues.push(last_name); }
        if (email)      { userFields.push(`email = $${up++}`);      userValues.push(email); }
        if (mobile_number) { userFields.push(`mobile_number = $${up++}`); userValues.push(mobile_number); }
        if (userFields.length > 0) {
          userValues.push(id);
          const pool = require('../config/database');
          await pool.query(`UPDATE users SET ${userFields.join(', ')} WHERE id = $${up}`, userValues);
        }
      }
      
      // Convert relative paths to absolute URLs
      const patientWithUrls = convertPatientUrls(patient);
      
      res.status(201).json({ message: 'Patient created successfully', data: patientWithUrls });
    } catch (error) {
      console.error('Create patient error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const { page = 1, limit = 10, search, gender, blood_group, city, state } = req.query;
      
      const filters = {};
      if (search) filters.search = search;
      if (gender) filters.gender = gender;
      if (blood_group) filters.blood_group = blood_group;
      if (city) filters.city = city;
      if (state) filters.state = state;
      
      const patients = await PatientModel.findAll(filters);
      
      // Convert relative paths to absolute URLs for all patients
      const patientsWithUrls = patients.map(patient => convertPatientUrls(patient));
      
      // Pagination
      const pageNum = safeParseInt(page, 1);
      const limitNum = safeParseInt(limit, 10);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedData = patientsWithUrls.slice(startIndex, endIndex);
      
      res.json({ 
        data: paginatedData,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: patientsWithUrls.length,
          totalPages: Math.ceil(patientsWithUrls.length / limitNum)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Internal helper — fetch patient by ID without HTTP context
  static async getByIdInternal(id) {
    const patient = await PatientModel.findById(id);
    return patient ? convertPatientUrls(patient) : null;
  }

  static async getById(req, res) {
    try {
      const patient = await PatientModel.findById(req.params.id);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      
      // Convert relative paths to absolute URLs
      const patientWithUrls = convertPatientUrls(patient);
      
      res.json({ data: patientWithUrls });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Patient self-service: update own profile using JWT token (no ID in URL)
  static async updateProfile(req, res) {
    try {
      const patientId = req.user.id; // from JWT — never from URL/body
      const patientData = {};

      const fields = [
        'emergency_contact_name','emergency_contact_number','insurance_provider','insurance_policy_number',
        'gender','blood_group','height_cm','weight_kg','occupation','marital_status','nationality',
        'preferred_language','religion','medical_history','current_medications','allergies',
        'chronic_conditions','previous_surgeries','family_medical_history','dental_history',
        'dental_concerns','previous_dental_treatments','dental_anxiety_level','preferred_appointment_time',
        'special_needs','secondary_phone','work_phone','preferred_contact_method',
        'address_line_1','address_line_2','city','state','postal_code','country',
        'insurance_type','insurance_expiry_date','insurance_coverage_amount',
      ];
      fields.forEach(f => { if (req.body[f] !== undefined) patientData[f] = req.body[f] || null; });

      // JSON fields
      ['communication_preferences','appointment_preferences','privacy_settings'].forEach(f => {
        if (req.body[f] !== undefined) {
          try { patientData[f] = typeof req.body[f] === 'string' ? JSON.parse(req.body[f]) : req.body[f]; }
          catch (e) { /* ignore parse error */ }
        }
      });

      // Profile photo — save to patients.profile_photo AND users.profile_picture
      if (req.files?.profile_photo?.[0]) {
        const photoPath = req.files.profile_photo[0].path.replace(/\\/g, '/');
        patientData.profile_photo = photoPath;
        const pool = require('../config/database');
        await pool.query('UPDATE users SET profile_picture = $1 WHERE id = $2', [photoPath, patientId]);
      }

      if (Object.keys(patientData).length === 0 && !req.body.first_name && !req.body.last_name && !req.body.email && !req.body.mobile_number) {
        return res.status(400).json({ success: false, message: 'No fields to update', data: null, error: 'NO_FIELDS' });
      }

      const patient = await PatientModel.update(patientId, patientData);
      if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found', data: null, error: 'NOT_FOUND' });

      // Update linked user fields
      const { first_name, last_name, email, mobile_number } = req.body;
      if (first_name || last_name || email || mobile_number) {
        const userFields = []; const userValues = []; let up = 1;
        if (first_name)    { userFields.push(`first_name = $${up++}`);    userValues.push(first_name); }
        if (last_name)     { userFields.push(`last_name = $${up++}`);     userValues.push(last_name); }
        if (email)         { userFields.push(`email = $${up++}`);         userValues.push(email); }
        if (mobile_number) { userFields.push(`mobile_number = $${up++}`); userValues.push(mobile_number); }
        if (userFields.length) {
          userValues.push(patientId);
          const pool = require('../config/database');
          await pool.query(`UPDATE users SET ${userFields.join(', ')} WHERE id = $${up}`, userValues);
        }
      }

      res.json({ success: true, message: 'Profile updated successfully', data: convertPatientUrls(patient), error: null });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message, data: null, error: error.message });
    }
  }

  static async update(req, res) {
    try {
      console.log('=== UPDATE PATIENT DEBUG ===');
      console.log('Request Body:', req.body);
      console.log('Request Files:', req.files);
      console.log('Request Body Keys:', Object.keys(req.body));
      
      const patientData = {};
      
      // Basic fields
      if (req.body.emergency_contact_name !== undefined) patientData.emergency_contact_name = req.body.emergency_contact_name;
      if (req.body.emergency_contact_number !== undefined) patientData.emergency_contact_number = req.body.emergency_contact_number;
      if (req.body.insurance_provider !== undefined) patientData.insurance_provider = req.body.insurance_provider;
      if (req.body.insurance_policy_number !== undefined) patientData.insurance_policy_number = req.body.insurance_policy_number;
      
      // Enhanced profile fields
      if (req.body.gender !== undefined) patientData.gender = req.body.gender;
      if (req.body.blood_group !== undefined) patientData.blood_group = req.body.blood_group;
      if (req.body.height_cm !== undefined) patientData.height_cm = req.body.height_cm;
      if (req.body.weight_kg !== undefined) patientData.weight_kg = req.body.weight_kg;
      if (req.body.occupation !== undefined) patientData.occupation = req.body.occupation;
      if (req.body.marital_status !== undefined) patientData.marital_status = req.body.marital_status;
      if (req.body.nationality !== undefined) patientData.nationality = req.body.nationality;
      if (req.body.preferred_language !== undefined) patientData.preferred_language = req.body.preferred_language;
      if (req.body.religion !== undefined) patientData.religion = req.body.religion;
      
      // Medical information
      if (req.body.medical_history !== undefined) patientData.medical_history = req.body.medical_history;
      if (req.body.current_medications !== undefined) patientData.current_medications = req.body.current_medications;
      if (req.body.allergies !== undefined) patientData.allergies = req.body.allergies;
      if (req.body.chronic_conditions !== undefined) patientData.chronic_conditions = req.body.chronic_conditions;
      if (req.body.previous_surgeries !== undefined) patientData.previous_surgeries = req.body.previous_surgeries;
      if (req.body.family_medical_history !== undefined) patientData.family_medical_history = req.body.family_medical_history;
      
      // Dental information
      if (req.body.dental_history !== undefined) patientData.dental_history = req.body.dental_history;
      if (req.body.dental_concerns !== undefined) patientData.dental_concerns = req.body.dental_concerns;
      if (req.body.previous_dental_treatments !== undefined) patientData.previous_dental_treatments = req.body.previous_dental_treatments;
      if (req.body.dental_anxiety_level !== undefined) patientData.dental_anxiety_level = req.body.dental_anxiety_level;
      if (req.body.preferred_appointment_time !== undefined) patientData.preferred_appointment_time = req.body.preferred_appointment_time;
      if (req.body.special_needs !== undefined) patientData.special_needs = req.body.special_needs;
      
      // Contact information
      if (req.body.secondary_phone !== undefined) patientData.secondary_phone = req.body.secondary_phone;
      if (req.body.work_phone !== undefined) patientData.work_phone = req.body.work_phone;
      if (req.body.preferred_contact_method !== undefined) patientData.preferred_contact_method = req.body.preferred_contact_method;
      
      // Address
      if (req.body.address_line_1 !== undefined) patientData.address_line_1 = req.body.address_line_1;
      if (req.body.address_line_2 !== undefined) patientData.address_line_2 = req.body.address_line_2;
      if (req.body.city !== undefined) patientData.city = req.body.city;
      if (req.body.state !== undefined) patientData.state = req.body.state;
      if (req.body.postal_code !== undefined) patientData.postal_code = req.body.postal_code;
      if (req.body.country !== undefined) patientData.country = req.body.country;
      
      // Insurance
      if (req.body.insurance_type !== undefined) patientData.insurance_type = req.body.insurance_type || null;
      if (req.body.insurance_expiry_date !== undefined) patientData.insurance_expiry_date = req.body.insurance_expiry_date || null;
      if (req.body.insurance_coverage_amount !== undefined) patientData.insurance_coverage_amount = req.body.insurance_coverage_amount || null;
      
      // Handle JSON fields
      if (req.body.communication_preferences !== undefined) {
        try {
          patientData.communication_preferences = typeof req.body.communication_preferences === 'string' 
            ? JSON.parse(req.body.communication_preferences) 
            : req.body.communication_preferences;
        } catch (e) {
          console.error('Error parsing communication_preferences:', e);
        }
      }
      
      if (req.body.appointment_preferences !== undefined) {
        try {
          patientData.appointment_preferences = typeof req.body.appointment_preferences === 'string' 
            ? JSON.parse(req.body.appointment_preferences) 
            : req.body.appointment_preferences;
        } catch (e) {
          console.error('Error parsing appointment_preferences:', e);
        }
      }
      
      if (req.body.privacy_settings !== undefined) {
        try {
          patientData.privacy_settings = typeof req.body.privacy_settings === 'string' 
            ? JSON.parse(req.body.privacy_settings) 
            : req.body.privacy_settings;
        } catch (e) {
          console.error('Error parsing privacy_settings:', e);
        }
      }
      
      // Add uploaded photo path — save to patients.profile_photo AND users.profile_picture
      if (req.files && req.files.profile_photo && req.files.profile_photo.length > 0) {
        let photoPath = req.files.profile_photo[0].path.replace(/\\/g, '/');
        const patientId = req.params.id;

        // If file landed in 'temp' folder, move it to the correct user folder
        if (photoPath.includes('/temp/') || photoPath.includes('\\temp\\')) {
          const correctDir = path.join('uploads', 'users', patientId);
          if (!fs.existsSync(correctDir)) fs.mkdirSync(correctDir, { recursive: true });
          const newPath = path.join(correctDir, path.basename(photoPath));
          fs.renameSync(photoPath, newPath);
          photoPath = newPath.replace(/\\/g, '/');
        }

        patientData.profile_photo = photoPath;
        const pool = require('../config/database');
        await pool.query('UPDATE users SET profile_picture = $1 WHERE id = $2', [photoPath, patientId]);
      }

      if (Object.keys(patientData).length === 0) {
        return res.status(400).json({ error: 'No fields to update', receivedFields: Object.keys(req.body) });
      }

      const patient = await PatientModel.update(req.params.id, patientData);
      if (!patient) return res.status(404).json({ error: 'Patient not found' });

      // Update linked user fields
      const { first_name, last_name, email, mobile_number } = req.body;
      if (first_name || last_name || email || mobile_number) {
        const pool = require('../config/database');
        const userFields = []; const userValues = []; let up = 1;
        if (first_name)    { userFields.push(`first_name = $${up++}`);    userValues.push(first_name); }
        if (last_name)     { userFields.push(`last_name = $${up++}`);     userValues.push(last_name); }
        if (email)         { userFields.push(`email = $${up++}`);         userValues.push(email); }
        if (mobile_number) { userFields.push(`mobile_number = $${up++}`); userValues.push(mobile_number); }
        if (userFields.length > 0) {
          userValues.push(req.params.id);
          await pool.query(`UPDATE users SET ${userFields.join(', ')} WHERE id = $${up}`, userValues);
        }
      }

      res.json({ message: 'Patient updated successfully', data: convertPatientUrls(patient) });
    } catch (error) {
      console.error('Update patient error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const patient = await PatientModel.delete(req.params.id);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      res.json({ message: 'Patient deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Patient Self-Service: Get own family members
  static async getMyFamilyMembers(req, res) {
    try {
      const patientId = req.user.userId; // From JWT token
      const members = await PatientModel.getFamilyMembers(patientId);
      
      // Convert relative paths to absolute URLs for all members
      const membersWithUrls = members.map(member => convertPatientUrls(member));
      
      res.json({ data: membersWithUrls });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Patient Self-Service: Add own family member
  static async addMyFamilyMember(req, res) {
    try {
      console.log('=== ADD MY FAMILY MEMBER DEBUG ===');
      console.log('Request Body:', req.body);
      console.log('Request Files:', req.files);
      console.log('User ID from token:', req.user.userId);
      
      const patientId = req.user.userId; // From JWT token
      
      const memberData = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        relationship: req.body.relationship,
        mobile_number: req.body.mobile_number || null,
        date_of_birth: req.body.date_of_birth || null,
        
        // Enhanced fields
        gender: req.body.gender || null,
        blood_group: req.body.blood_group || null,
        height_cm: req.body.height_cm || null,
        weight_kg: req.body.weight_kg || null,
        occupation: req.body.occupation || null,
        email: req.body.email || null,
        secondary_phone: req.body.secondary_phone || null,
        
        // Medical information
        medical_history: req.body.medical_history || null,
        current_medications: req.body.current_medications || null,
        allergies: req.body.allergies || null,
        chronic_conditions: req.body.chronic_conditions || null,
        previous_surgeries: req.body.previous_surgeries || null,
        
        // Dental information
        dental_history: req.body.dental_history || null,
        dental_concerns: req.body.dental_concerns || null,
        previous_dental_treatments: req.body.previous_dental_treatments || null,
        dental_anxiety_level: req.body.dental_anxiety_level || null,
        special_needs: req.body.special_needs || null,
        
        // Insurance
        insurance_provider: req.body.insurance_provider || null,
        insurance_policy_number: req.body.insurance_policy_number || null,
        insurance_type: req.body.insurance_type || null,
        insurance_expiry_date: req.body.insurance_expiry_date || null,
        
        // Additional fields
        is_primary_contact: req.body.is_primary_contact === 'true' || req.body.is_primary_contact === true,
        emergency_contact: req.body.emergency_contact === 'true' || req.body.emergency_contact === true,
        notes: req.body.notes || null
      };
      
      // Add uploaded photo path
      if (req.files && req.files.family_member_photo && req.files.family_member_photo.length > 0) {
        memberData.profile_photo = req.files.family_member_photo[0].path.replace(/\\/g, '/');
        console.log('Uploaded Family Member Photo:', memberData.profile_photo);
      }
      
      const member = await PatientModel.addFamilyMember(patientId, memberData);
      
      // Convert relative paths to absolute URLs
      const memberWithUrls = convertPatientUrls(member);
      
      res.status(201).json({ message: 'Family member added successfully', data: memberWithUrls });
    } catch (error) {
      console.error('Add my family member error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Patient Self-Service: Update own family member
  static async updateMyFamilyMember(req, res) {
    try {
      const patientId = req.user.userId; // From JWT token
      const memberId = req.params.memberId;
      
      // First verify this family member belongs to this patient
      const existingMember = await PatientModel.getFamilyMemberById(memberId);
      if (!existingMember || existingMember.patient_id !== patientId) {
        return res.status(403).json({ error: 'Access denied. You can only update your own family members.' });
      }
      
      const memberData = { ...req.body };
      
      // Convert empty strings to null for date fields to avoid PostgreSQL errors
      if (memberData.date_of_birth === '') memberData.date_of_birth = null;
      if (memberData.insurance_expiry_date === '') memberData.insurance_expiry_date = null;
      
      // Add uploaded photo path if new photo is uploaded
      if (req.files && req.files.family_member_photo && req.files.family_member_photo.length > 0) {
        memberData.profile_photo = req.files.family_member_photo[0].path.replace(/\\/g, '/');
      }
      
      const member = await PatientModel.updateFamilyMember(memberId, memberData);
      if (!member) {
        return res.status(404).json({ error: 'Family member not found' });
      }
      
      // Convert relative paths to absolute URLs
      const memberWithUrls = convertPatientUrls(member);
      
      res.json({ message: 'Family member updated successfully', data: memberWithUrls });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Patient Self-Service: Delete own family member
  static async deleteMyFamilyMember(req, res) {
    try {
      const patientId = req.user.userId; // From JWT token
      const memberId = req.params.memberId;
      
      // First verify this family member belongs to this patient
      const existingMember = await PatientModel.getFamilyMemberById(memberId);
      if (!existingMember || existingMember.patient_id !== patientId) {
        return res.status(403).json({ error: 'Access denied. You can only delete your own family members.' });
      }
      
      const member = await PatientModel.deleteFamilyMember(memberId);
      if (!member) {
        return res.status(404).json({ error: 'Family member not found' });
      }
      res.json({ message: 'Family member deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Family Members (Admin)
  static async addFamilyMember(req, res) {
    try {
      console.log('=== ADD FAMILY MEMBER DEBUG ===');
      console.log('Request Body:', req.body);
      console.log('Request Files:', req.files);
      
      const memberData = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        relationship: req.body.relationship,
        mobile_number: req.body.mobile_number || null,
        date_of_birth: req.body.date_of_birth || null,
        
        // Enhanced fields
        gender: req.body.gender || null,
        blood_group: req.body.blood_group || null,
        height_cm: req.body.height_cm || null,
        weight_kg: req.body.weight_kg || null,
        occupation: req.body.occupation || null,
        email: req.body.email || null,
        secondary_phone: req.body.secondary_phone || null,
        
        // Medical information
        medical_history: req.body.medical_history || null,
        current_medications: req.body.current_medications || null,
        allergies: req.body.allergies || null,
        chronic_conditions: req.body.chronic_conditions || null,
        previous_surgeries: req.body.previous_surgeries || null,
        
        // Dental information
        dental_history: req.body.dental_history || null,
        dental_concerns: req.body.dental_concerns || null,
        previous_dental_treatments: req.body.previous_dental_treatments || null,
        dental_anxiety_level: req.body.dental_anxiety_level || null,
        special_needs: req.body.special_needs || null,
        
        // Insurance
        insurance_provider: req.body.insurance_provider || null,
        insurance_policy_number: req.body.insurance_policy_number || null,
        insurance_type: req.body.insurance_type || null,
        insurance_expiry_date: req.body.insurance_expiry_date || null,
        
        // Additional fields
        is_primary_contact: req.body.is_primary_contact === 'true' || req.body.is_primary_contact === true,
        emergency_contact: req.body.emergency_contact === 'true' || req.body.emergency_contact === true,
        notes: req.body.notes || null
      };
      
      // Add uploaded photo path
      if (req.files && req.files.family_member_photo && req.files.family_member_photo.length > 0) {
        memberData.profile_photo = req.files.family_member_photo[0].path.replace(/\\/g, '/');
        console.log('Uploaded Family Member Photo:', memberData.profile_photo);
      }
      
      const member = await PatientModel.addFamilyMember(req.params.id, memberData);
      
      // Convert relative paths to absolute URLs
      const memberWithUrls = convertPatientUrls(member);
      
      res.status(201).json({ message: 'Family member added successfully', data: memberWithUrls });
    } catch (error) {
      console.error('Add family member error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getFamilyMembers(req, res) {
    try {
      const members = await PatientModel.getFamilyMembers(req.params.id);
      
      // Convert relative paths to absolute URLs for all members
      const membersWithUrls = members.map(member => convertPatientUrls(member));
      
      res.json({ data: membersWithUrls });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateFamilyMember(req, res) {
    try {
      const memberData = { ...req.body };
      
      // Convert empty strings to null for date fields to avoid PostgreSQL errors
      if (memberData.date_of_birth === '') memberData.date_of_birth = null;
      if (memberData.insurance_expiry_date === '') memberData.insurance_expiry_date = null;
      
      // Add uploaded photo path if new photo is uploaded
      if (req.files && req.files.family_member_photo && req.files.family_member_photo.length > 0) {
        memberData.profile_photo = req.files.family_member_photo[0].path.replace(/\\/g, '/');
      }
      
      const member = await PatientModel.updateFamilyMember(req.params.memberId, memberData);
      if (!member) {
        return res.status(404).json({ error: 'Family member not found' });
      }
      
      // Convert relative paths to absolute URLs
      const memberWithUrls = convertPatientUrls(member);
      
      res.json({ message: 'Family member updated successfully', data: memberWithUrls });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteFamilyMember(req, res) {
    try {
      const member = await PatientModel.deleteFamilyMember(req.params.memberId);
      if (!member) {
        return res.status(404).json({ error: 'Family member not found' });
      }
      res.json({ message: 'Family member deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

// Export both the controller and the upload middleware
PatientController.uploadPatientPhotos = uploadPatientPhotos;
module.exports = PatientController;