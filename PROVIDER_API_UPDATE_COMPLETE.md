# Provider API & Frontend - Complete Update Guide

## ✅ COMPLETED
1. Database migration - All new fields added to `providers` table
2. Provider Model updated - Handles all new fields in create/update operations

## 🔄 IN PROGRESS
Provider Controller and Frontend Form need updates

## Required Changes

### Provider Controller (`api/src/controllers/providerController.js`)

The controller's `createProvider` and `updateProvider` methods need to extract and pass all new fields:

```javascript
const providerData = {
  id, specialty, experience_years, clinic_name, contact_number,
  location, coordinates, about, clinic_photos, clinic_video_url,
  availability, time_slots,
  // Add these new fields:
  dental_chairs: req.body.dental_chairs,
  iopa_xray_type: req.body.iopa_xray_type,
  has_opg: req.body.has_opg === 'true' || req.body.has_opg === true,
  has_ultrasonic_cleaner: req.body.has_ultrasonic_cleaner === 'true' || req.body.has_ultrasonic_cleaner === true,
  intraoral_camera_type: req.body.intraoral_camera_type,
  rct_equipment: req.body.rct_equipment,
  autoclave_type: req.body.autoclave_type,
  sterilization_protocol: req.body.sterilization_protocol,
  disinfection_protocol: req.body.disinfection_protocol,
  specialists_availability: req.body.specialists_availability ? JSON.parse(req.body.specialists_availability) : [],
  bank_name: req.body.bank_name,
  bank_branch_name: req.body.bank_branch_name,
  bank_account_name: req.body.bank_account_name,
  bank_account_number: req.body.bank_account_number,
  bank_account_type: req.body.bank_account_type,
  bank_micr_no: req.body.bank_micr_no,
  bank_ifsc_code: req.body.bank_ifsc_code,
  number_of_clinics: parseInt(req.body.number_of_clinics) || 1,
  clinics: req.body.clinics ? JSON.parse(req.body.clinics) : [],
  full_name: req.body.full_name,
  date_of_birth: req.body.date_of_birth,
  pincode: req.body.pincode,
  mobile_number: req.body.mobile_number,
  whatsapp_number: req.body.whatsapp_number,
  email: req.body.email,
  years_of_experience: parseInt(req.body.years_of_experience),
  state_dental_council_reg_number: req.body.state_dental_council_reg_number,
  state_dental_council_reg_photo: req.body.state_dental_council_reg_photo,
  profile_photo: req.body.profile_photo
};
```

### Frontend Form Structure

The form needs these sections:

1. **Provider Details** (existing + new fields)
   - Full Name, Date of Birth, Pincode
   - Mobile Number, WhatsApp Number (checkbox for same)
   - Email, Years of Experience
   - State Dental Council Registration Number
   - Upload: Registration Photo, Profile Photo

2. **Clinic Details** (dynamic based on number_of_clinics)
   - Number of Clinics dropdown
   - For each clinic:
     - Pan No, Name, Contact Number
     - Speciality, Address
     - City, State, PIN Code
     - Google Map URL, Working Hours
     - No. of Dental Chairs
     - Upload: Clinic Board Photo

3. **Clinic Equipment**
   - Dental Chairs (number)
   - IOPA X-ray Type (dropdown)
   - OPG (Yes/No)
   - Ultrasonic Cleaner (Yes/No)
   - Intraoral Camera Type
   - RCT Equipment
   - Autoclave Type
   - Sterilization Protocol
   - Disinfection Protocol

4. **Specialists Availability**
   - Dynamic list of specialists
   - Each with: Type (dropdown), Availability (dropdown)

5. **Clinic Bank Details**
   - Bank Name, Branch Name, Account Name
   - Account Number, Account Type, MICR No
   - IFSC Code

## Frontend Implementation Notes

- Use `useState` for dynamic clinic forms
- Use `FormData` for file uploads
- Validate required fields before submission
- Handle JSON fields (specialists_availability, clinics) properly
- Show/hide WhatsApp field based on checkbox

## API Endpoints

- POST `/api/v1/providers` - Create with all fields
- PUT `/api/v1/providers/:id` - Update with all fields
- GET `/api/v1/providers/:id` - Returns all fields

## File Upload Fields

1. `state_dental_council_reg_photo` - Registration certificate
2. `profile_photo` - Provider profile picture
3. `clinic_board` - Part of clinics array (for each clinic)

## Testing Checklist

- [ ] Create provider with all fields
- [ ] Update provider with all fields
- [ ] File uploads work correctly
- [ ] Multiple clinics support works
- [ ] Specialists availability saves correctly
- [ ] Bank details save correctly
- [ ] Form validation works
- [ ] Edit mode populates all fields correctly

## Next Steps

1. Update provider controller to handle all new fields
2. Create comprehensive frontend form with all sections
3. Add file upload handling for new photo fields
4. Test create/update operations
5. Update Swagger documentation
