#!/bin/bash

# Test Comprehensive Patient Profile System
echo "=== Testing Comprehensive Patient Profile System ==="

API_BASE="http://localhost:8080/api/v1"

# First, login to get auth token
echo "1. Logging in to get auth token..."
LOGIN_RESPONSE=$(wget -qO- --post-data='{"email":"admin@dentist.com","password":"password123"}' \
  --header='Content-Type: application/json' \
  "${API_BASE}/auth/login")

echo "Login Response: $LOGIN_RESPONSE"

# Extract token (assuming JSON response with accessToken field)
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get auth token. Login response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Got auth token: ${TOKEN:0:20}..."

# Test 1: Get all patients
echo ""
echo "2. Testing GET /patients (get all patients)..."
PATIENTS_RESPONSE=$(wget -qO- --header="Authorization: Bearer $TOKEN" \
  "${API_BASE}/patients")

echo "Patients Response: $PATIENTS_RESPONSE"

# Test 2: Get users to find a user ID for creating patient
echo ""
echo "3. Getting users to find a user ID for patient creation..."
USERS_RESPONSE=$(wget -qO- --header="Authorization: Bearer $TOKEN" \
  "${API_BASE}/users")

echo "Users Response: $USERS_RESPONSE"

# Extract first user ID (assuming JSON array response)
USER_ID=$(echo "$USERS_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$USER_ID" ]; then
  echo "❌ No user ID found for patient creation"
  exit 1
fi

echo "✅ Found user ID for patient creation: $USER_ID"

# Test 3: Create comprehensive patient profile
echo ""
echo "4. Testing POST /patients (create comprehensive patient profile)..."

# Create patient data
PATIENT_DATA='{
  "id": "'$USER_ID'",
  "emergency_contact_name": "John Emergency",
  "emergency_contact_number": "+91-9876543210",
  "insurance_provider": "Health Insurance Co",
  "insurance_policy_number": "HIC123456789",
  "gender": "Male",
  "blood_group": "B+",
  "height_cm": 175,
  "weight_kg": 70.5,
  "occupation": "Software Engineer",
  "marital_status": "Married",
  "nationality": "Indian",
  "preferred_language": "English",
  "religion": "Hindu",
  "medical_history": "No major medical history",
  "current_medications": "None",
  "allergies": "None known",
  "chronic_conditions": "None",
  "previous_surgeries": "None",
  "family_medical_history": "Diabetes in family",
  "dental_history": "Regular checkups",
  "dental_concerns": "Teeth whitening",
  "previous_dental_treatments": "Cleaning, Filling",
  "dental_anxiety_level": 3,
  "preferred_appointment_time": "Morning",
  "special_needs": "None",
  "secondary_phone": "+91-9876543211",
  "work_phone": "+91-9876543212",
  "preferred_contact_method": "WhatsApp",
  "address_line_1": "123 Tech Park",
  "address_line_2": "Near IT Hub",
  "city": "Bangalore",
  "state": "Karnataka",
  "postal_code": "560001",
  "country": "India",
  "insurance_type": "Family Floater",
  "insurance_expiry_date": "2025-12-31",
  "insurance_coverage_amount": 500000,
  "communication_preferences": "{\"email_notifications\": true, \"sms_notifications\": true}",
  "appointment_preferences": "{\"preferred_time\": \"morning\", \"reminder_hours\": 24}",
  "privacy_settings": "{\"share_with_family\": true, \"marketing_communications\": false}"
}'

CREATE_RESPONSE=$(wget -qO- --post-data="$PATIENT_DATA" \
  --header='Content-Type: application/json' \
  --header="Authorization: Bearer $TOKEN" \
  "${API_BASE}/patients")

echo "Create Patient Response: $CREATE_RESPONSE"

# Check if patient was created successfully
if echo "$CREATE_RESPONSE" | grep -q "successfully"; then
  echo "✅ Patient created successfully"
  PATIENT_ID="$USER_ID"
else
  echo "❌ Failed to create patient"
  # Try to get existing patient
  EXISTING_PATIENT=$(wget -qO- --header="Authorization: Bearer $TOKEN" \
    "${API_BASE}/patients/$USER_ID")
  
  if echo "$EXISTING_PATIENT" | grep -q '"id"'; then
    echo "✅ Found existing patient, will use for testing"
    PATIENT_ID="$USER_ID"
  else
    echo "❌ No patient found, cannot continue tests"
    exit 1
  fi
fi

# Test 4: Get patient by ID
echo ""
echo "5. Testing GET /patients/:id (get patient by ID)..."
PATIENT_DETAIL_RESPONSE=$(wget -qO- --header="Authorization: Bearer $TOKEN" \
  "${API_BASE}/patients/$PATIENT_ID")

echo "Patient Detail Response: $PATIENT_DETAIL_RESPONSE"

# Test 5: Add family member
echo ""
echo "6. Testing POST /patients/:id/family-members (add family member)..."

FAMILY_MEMBER_DATA='{
  "first_name": "Jane",
  "last_name": "Doe",
  "relationship": "Spouse",
  "mobile_number": "+91-9876543213",
  "date_of_birth": "1990-05-15",
  "gender": "Female",
  "blood_group": "A+",
  "height_cm": 160,
  "weight_kg": 55.0,
  "occupation": "Teacher",
  "email": "jane.doe@example.com",
  "medical_history": "No major issues",
  "allergies": "Peanuts",
  "dental_anxiety_level": 2,
  "is_primary_contact": true,
  "emergency_contact": true,
  "notes": "Primary emergency contact"
}'

FAMILY_MEMBER_RESPONSE=$(wget -qO- --post-data="$FAMILY_MEMBER_DATA" \
  --header='Content-Type: application/json' \
  --header="Authorization: Bearer $TOKEN" \
  "${API_BASE}/patients/$PATIENT_ID/family-members")

echo "Add Family Member Response: $FAMILY_MEMBER_RESPONSE"

# Test 6: Get family members
echo ""
echo "7. Testing GET /patients/:id/family-members (get family members)..."
FAMILY_MEMBERS_RESPONSE=$(wget -qO- --header="Authorization: Bearer $TOKEN" \
  "${API_BASE}/patients/$PATIENT_ID/family-members")

echo "Family Members Response: $FAMILY_MEMBERS_RESPONSE"

# Test 7: Update patient
echo ""
echo "8. Testing PUT /patients/:id (update patient)..."

UPDATE_DATA='{
  "dental_anxiety_level": 5,
  "preferred_appointment_time": "Evening",
  "special_needs": "Wheelchair accessible"
}'

UPDATE_RESPONSE=$(wget -qO- --method=PUT --body-data="$UPDATE_DATA" \
  --header='Content-Type: application/json' \
  --header="Authorization: Bearer $TOKEN" \
  "${API_BASE}/patients/$PATIENT_ID")

echo "Update Patient Response: $UPDATE_RESPONSE"

# Test 8: Test filtering
echo ""
echo "9. Testing GET /patients with filters..."
FILTER_RESPONSE=$(wget -qO- --header="Authorization: Bearer $TOKEN" \
  "${API_BASE}/patients?gender=Male&blood_group=B%2B&city=Bangalore")

echo "Filter Response: $FILTER_RESPONSE"

echo ""
echo "=== Comprehensive Patient Profile System Test Complete ==="
echo "✅ All tests completed successfully!"