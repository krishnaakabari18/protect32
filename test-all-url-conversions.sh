#!/bin/bash

# Test All API URL Conversions
# This script tests that all image/document fields return absolute URLs across all endpoints

echo "=========================================="
echo "Testing All API URL Conversions"
echo "=========================================="
echo ""

BASE_URL="https://occupiable-milissa-ennuyante.ngrok-free.dev"
API_URL="${BASE_URL}/api/v1"

# Login to get token
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get authentication token"
  exit 1
fi

echo "✅ Successfully logged in"
echo ""

# Function to check if a URL is absolute
check_url() {
  local field_name=$1
  local url=$2
  
  if [ -n "$url" ] && [ "$url" != "null" ]; then
    if [[ "$url" == http* ]]; then
      echo "  ✅ $field_name: Absolute URL"
    else
      echo "  ❌ $field_name: Relative path - $url"
    fi
  else
    echo "  ⚠️  $field_name: No data"
  fi
}

# Test Providers API
echo "2. Testing Providers API..."
PROVIDERS=$(curl -s -X GET "${API_URL}/providers?limit=1" -H "Authorization: Bearer ${TOKEN}")
CLINIC_PHOTOS=$(echo "$PROVIDERS" | jq -r '.data[0].clinic_photos[0]' 2>/dev/null)
PROFILE_PIC=$(echo "$PROVIDERS" | jq -r '.data[0].profile_picture' 2>/dev/null)
check_url "clinic_photos" "$CLINIC_PHOTOS"
check_url "profile_picture" "$PROFILE_PIC"
echo ""

# Test Users API
echo "3. Testing Users API..."
USERS=$(curl -s -X GET "${API_URL}/users?limit=1" -H "Authorization: Bearer ${TOKEN}")
USER_PROFILE=$(echo "$USERS" | jq -r '.data[0].profile_picture' 2>/dev/null)
check_url "profile_picture" "$USER_PROFILE"
echo ""

# Test Documents API
echo "4. Testing Documents API..."
DOCUMENTS=$(curl -s -X GET "${API_URL}/documents?limit=1" -H "Authorization: Bearer ${TOKEN}")
DOC_FILE_URL=$(echo "$DOCUMENTS" | jq -r '.data[0].file_url' 2>/dev/null)
DOC_FILE_PATH=$(echo "$DOCUMENTS" | jq -r '.data[0].files[0].path' 2>/dev/null)
check_url "file_url" "$DOC_FILE_URL"
check_url "files[0].path" "$DOC_FILE_PATH"
echo ""

# Test Patient Education API
echo "5. Testing Patient Education API..."
EDUCATION=$(curl -s -X GET "${API_URL}/patient-education?limit=1" -H "Authorization: Bearer ${TOKEN}")
FEATURE_IMAGE=$(echo "$EDUCATION" | jq -r '.data[0].feature_image' 2>/dev/null)
check_url "feature_image" "$FEATURE_IMAGE"
echo ""

# Test Auth Profile API
echo "6. Testing Auth Profile API..."
PROFILE=$(curl -s -X GET "${API_URL}/auth/profile" -H "Authorization: Bearer ${TOKEN}")
AUTH_PROFILE=$(echo "$PROFILE" | jq -r '.data.profile_picture' 2>/dev/null)
check_url "profile_picture" "$AUTH_PROFILE"
echo ""

echo "=========================================="
echo "Test Complete"
echo "=========================================="
echo ""
echo "Summary:"
echo "- All image/document fields should return absolute URLs"
echo "- Format: ${BASE_URL}/uploads/..."
echo "- If you see relative paths, the URL conversion is not working"
