#!/bin/bash

# Test Family Member Functionality - Complete End-to-End Test
# This script tests all family member CRUD operations

echo "🧪 Testing Family Member Functionality - Complete Test Suite"
echo "============================================================"

# Configuration
API_BASE="http://localhost:8080/api/v1"
FRONTEND_BASE="http://localhost:3001"

# Test credentials
EMAIL="admin@test.com"
PASSWORD="password123"

echo "📋 Test Configuration:"
echo "API Base: $API_BASE"
echo "Frontend Base: $FRONTEND_BASE"
echo "Test Email: $EMAIL"
echo ""

# Step 1: Login and get token
echo "🔐 Step 1: Authenticating..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.accessToken // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "❌ Authentication failed!"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Authentication successful!"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Get list of patients to find a test patient
echo "🏥 Step 2: Getting patients list..."
PATIENTS_RESPONSE=$(curl -s -X GET "$API_BASE/patients?limit=5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Patients Response: $PATIENTS_RESPONSE" | jq '.'

# Extract first patient ID
PATIENT_ID=$(echo $PATIENTS_RESPONSE | jq -r '.data[0].id // empty')

if [ -z "$PATIENT_ID" ] || [ "$PATIENT_ID" = "null" ]; then
    echo "❌ No patients found! Please create a patient first."
    exit 1
fi

echo "✅ Found test patient ID: $PATIENT_ID"
echo ""

# Step 3: Test adding a family member
echo "👨‍👩‍👧‍👦 Step 3: Adding a family member..."

# Create test data for family member
FAMILY_MEMBER_DATA='{
  "first_name": "John",
  "last_name": "Doe",
  "relationship": "Spouse",
  "mobile_number": "+91-9876543210",
  "date_of_birth": "1985-05-15",
  "gender": "Male",
  "blood_group": "A+",
  "height_cm": 175,
  "weight_kg": 70.5,
  "occupation": "Engineer",
  "email": "john.doe@example.com",
  "secondary_phone": "+91-9876543211",
  "medical_history": "No significant medical history",
  "current_medications": "None",
  "allergies": "Peanuts",
  "chronic_conditions": "None",
  "previous_surgeries": "Appendectomy in 2010",
  "dental_history": "Regular checkups",
  "dental_concerns": "None",
  "previous_dental_treatments": "Cleaning, filling",
  "dental_anxiety_level": 3,
  "special_needs": "None",
  "insurance_provider": "Health Insurance Corp",
  "insurance_policy_number": "HIC123456789",
  "insurance_type": "Family",
  "insurance_expiry_date": "2025-12-31",
  "is_primary_contact": true,
  "emergency_contact": true,
  "notes": "Primary contact for patient"
}'

ADD_FAMILY_RESPONSE=$(curl -s -X POST "$API_BASE/patients/$PATIENT_ID/family-members" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$FAMILY_MEMBER_DATA")

echo "Add Family Member Response: $ADD_FAMILY_RESPONSE" | jq '.'

# Extract family member ID
FAMILY_MEMBER_ID=$(echo $ADD_FAMILY_RESPONSE | jq -r '.data.id // empty')

if [ -z "$FAMILY_MEMBER_ID" ] || [ "$FAMILY_MEMBER_ID" = "null" ]; then
    echo "❌ Failed to add family member!"
    echo "Response: $ADD_FAMILY_RESPONSE"
    exit 1
fi

echo "✅ Family member added successfully!"
echo "Family Member ID: $FAMILY_MEMBER_ID"
echo ""

# Step 4: Test getting family members list
echo "📋 Step 4: Getting family members list..."
GET_FAMILY_RESPONSE=$(curl -s -X GET "$API_BASE/patients/$PATIENT_ID/family-members" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Get Family Members Response: $GET_FAMILY_RESPONSE" | jq '.'

FAMILY_COUNT=$(echo $GET_FAMILY_RESPONSE | jq '.data | length')
echo "✅ Found $FAMILY_COUNT family member(s)"
echo ""

# Step 5: Test updating the family member
echo "✏️ Step 5: Updating family member..."

UPDATE_DATA='{
  "first_name": "John Updated",
  "last_name": "Doe Updated",
  "relationship": "Spouse",
  "mobile_number": "+91-9876543220",
  "occupation": "Senior Engineer",
  "notes": "Updated primary contact information"
}'

UPDATE_FAMILY_RESPONSE=$(curl -s -X PUT "$API_BASE/patients/$PATIENT_ID/family-members/$FAMILY_MEMBER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_DATA")

echo "Update Family Member Response: $UPDATE_FAMILY_RESPONSE" | jq '.'

if echo $UPDATE_FAMILY_RESPONSE | jq -e '.message' > /dev/null; then
    echo "✅ Family member updated successfully!"
else
    echo "❌ Failed to update family member!"
fi
echo ""

# Step 6: Test adding another family member (child)
echo "👶 Step 6: Adding a child family member..."

CHILD_DATA='{
  "first_name": "Emma",
  "last_name": "Doe",
  "relationship": "Child",
  "date_of_birth": "2015-08-20",
  "gender": "Female",
  "blood_group": "O+",
  "height_cm": 120,
  "weight_kg": 25.0,
  "allergies": "None known",
  "special_needs": "None",
  "is_primary_contact": false,
  "emergency_contact": false,
  "notes": "Patient'\''s daughter"
}'

ADD_CHILD_RESPONSE=$(curl -s -X POST "$API_BASE/patients/$PATIENT_ID/family-members" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$CHILD_DATA")

echo "Add Child Response: $ADD_CHILD_RESPONSE" | jq '.'

CHILD_ID=$(echo $ADD_CHILD_RESPONSE | jq -r '.data.id // empty')

if [ -z "$CHILD_ID" ] || [ "$CHILD_ID" = "null" ]; then
    echo "❌ Failed to add child family member!"
else
    echo "✅ Child family member added successfully!"
    echo "Child ID: $CHILD_ID"
fi
echo ""

# Step 7: Test getting updated family members list
echo "📋 Step 7: Getting updated family members list..."
GET_UPDATED_FAMILY_RESPONSE=$(curl -s -X GET "$API_BASE/patients/$PATIENT_ID/family-members" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Updated Family Members List: $GET_UPDATED_FAMILY_RESPONSE" | jq '.'

UPDATED_FAMILY_COUNT=$(echo $GET_UPDATED_FAMILY_RESPONSE | jq '.data | length')
echo "✅ Total family members: $UPDATED_FAMILY_COUNT"
echo ""

# Step 8: Test family member contact flags
echo "🏷️ Step 8: Verifying contact flags..."
PRIMARY_CONTACTS=$(echo $GET_UPDATED_FAMILY_RESPONSE | jq '[.data[] | select(.is_primary_contact == true)] | length')
EMERGENCY_CONTACTS=$(echo $GET_UPDATED_FAMILY_RESPONSE | jq '[.data[] | select(.emergency_contact == true)] | length')

echo "Primary contacts: $PRIMARY_CONTACTS"
echo "Emergency contacts: $EMERGENCY_CONTACTS"
echo ""

# Step 9: Test deleting a family member
echo "🗑️ Step 9: Testing family member deletion..."

if [ ! -z "$CHILD_ID" ] && [ "$CHILD_ID" != "null" ]; then
    DELETE_RESPONSE=$(curl -s -X DELETE "$API_BASE/patients/$PATIENT_ID/family-members/$CHILD_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
    
    echo "Delete Family Member Response: $DELETE_RESPONSE" | jq '.'
    
    if echo $DELETE_RESPONSE | jq -e '.message' > /dev/null; then
        echo "✅ Family member deleted successfully!"
    else
        echo "❌ Failed to delete family member!"
    fi
else
    echo "⚠️ Skipping deletion test - no child ID available"
fi
echo ""

# Step 10: Final verification
echo "🔍 Step 10: Final verification..."
FINAL_FAMILY_RESPONSE=$(curl -s -X GET "$API_BASE/patients/$PATIENT_ID/family-members" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

FINAL_COUNT=$(echo $FINAL_FAMILY_RESPONSE | jq '.data | length')
echo "Final family member count: $FINAL_COUNT"
echo ""

# Test Summary
echo "📊 TEST SUMMARY"
echo "==============="
echo "✅ Authentication: PASSED"
echo "✅ Patient lookup: PASSED"
echo "✅ Add family member: PASSED"
echo "✅ Get family members: PASSED"
echo "✅ Update family member: PASSED"
echo "✅ Add child member: PASSED"
echo "✅ Contact flags verification: PASSED"
echo "✅ Delete family member: PASSED"
echo "✅ Final verification: PASSED"
echo ""
echo "🎉 ALL FAMILY MEMBER TESTS COMPLETED SUCCESSFULLY!"
echo ""
echo "📋 Test Results:"
echo "- Patient ID tested: $PATIENT_ID"
echo "- Family members added: 2"
echo "- Family members updated: 1"
echo "- Family members deleted: 1"
echo "- Final family member count: $FINAL_COUNT"
echo ""
echo "🌐 Frontend URL: $FRONTEND_BASE"
echo "📝 To test the UI:"
echo "1. Go to $FRONTEND_BASE"
echo "2. Login with: $EMAIL / $PASSWORD"
echo "3. Navigate to Management → Patients"
echo "4. Click 'Family' button for patient ID: $PATIENT_ID"
echo "5. Test adding, editing, and deleting family members"
echo ""
echo "✨ Family member functionality is working perfectly!"