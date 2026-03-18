#!/bin/bash

# Setup Test User for Family Member Testing
echo "🔧 Setting up test user for family member functionality testing..."

API_BASE="http://localhost:8080/api/v1"

# Try to register a test admin user
echo "📝 Registering test admin user..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "Admin",
    "email": "admin@test.com",
    "mobile_number": "+91-9999999999",
    "password": "password123",
    "user_type": "admin"
  }')

echo "Register Response: $REGISTER_RESPONSE"

# Try to login with the test user
echo "🔐 Testing login with test admin user..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123"
  }')

echo "Login Response: $LOGIN_RESPONSE"

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "❌ Login failed, trying alternative credentials..."
    
    # Try with different common credentials
    for email in "admin@example.com" "test@test.com" "admin@admin.com"; do
        echo "🔐 Trying login with: $email"
        LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
          -H "Content-Type: application/json" \
          -d "{\"email\":\"$email\",\"password\":\"password123\"}")
        
        TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token // empty')
        
        if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
            echo "✅ Login successful with: $email"
            echo "Token: ${TOKEN:0:20}..."
            break
        fi
    done
fi

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "❌ Could not authenticate with any credentials"
    echo "Please check the database and ensure a user exists"
    exit 1
fi

echo "✅ Authentication successful!"
echo "Use email: admin@test.com (or the successful one above)"
echo "Password: password123"

# Now let's create a test patient if none exists
echo "🏥 Creating test patient..."

# First register a patient user
PATIENT_REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Patient",
    "email": "patient@test.com",
    "mobile_number": "+91-8888888888",
    "password": "password123",
    "user_type": "patient"
  }')

echo "Patient Register Response: $PATIENT_REGISTER_RESPONSE"

# Get the patient user ID
USERS_RESPONSE=$(curl -s -X GET "$API_BASE/users?user_type=patient&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Users Response: $USERS_RESPONSE"

PATIENT_USER_ID=$(echo $USERS_RESPONSE | jq -r '.data[0].id // empty')

if [ ! -z "$PATIENT_USER_ID" ] && [ "$PATIENT_USER_ID" != "null" ]; then
    echo "✅ Found patient user ID: $PATIENT_USER_ID"
    
    # Create patient record
    PATIENT_DATA='{
      "id": "'$PATIENT_USER_ID'",
      "emergency_contact_name": "Emergency Contact",
      "emergency_contact_number": "+91-7777777777",
      "insurance_provider": "Test Insurance",
      "insurance_policy_number": "TEST123456",
      "gender": "Male",
      "blood_group": "O+",
      "city": "Test City"
    }'
    
    CREATE_PATIENT_RESPONSE=$(curl -s -X POST "$API_BASE/patients" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$PATIENT_DATA")
    
    echo "Create Patient Response: $CREATE_PATIENT_RESPONSE"
    
    if echo $CREATE_PATIENT_RESPONSE | jq -e '.message' > /dev/null; then
        echo "✅ Test patient created successfully!"
        echo "Patient ID: $PATIENT_USER_ID"
    else
        echo "ℹ️ Patient may already exist or creation failed"
    fi
fi

echo ""
echo "🎉 Setup complete!"
echo "Test credentials: admin@test.com / password123"
echo "Test patient available for family member testing"