#!/bin/bash

# Test Provider API URL Conversion
# This script tests that all image/document fields return absolute URLs

echo "=========================================="
echo "Testing Provider API URL Conversion"
echo "=========================================="
echo ""

BASE_URL="https://abbey-stateliest-treva.ngrok-free.dev"
API_URL="${BASE_URL}/api/v1"

# First, login to get token
echo "1. Logging in to get authentication token..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get authentication token"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Successfully logged in"
echo ""

# Test GET all providers
echo "2. Testing GET /api/v1/providers..."
PROVIDERS_RESPONSE=$(curl -s -X GET "${API_URL}/providers" \
  -H "Authorization: Bearer ${TOKEN}")

echo "Response:"
echo "$PROVIDERS_RESPONSE" | jq '.'
echo ""

# Check if clinic_photos contains full URLs
echo "3. Checking if clinic_photos contains absolute URLs..."
CLINIC_PHOTOS=$(echo "$PROVIDERS_RESPONSE" | jq -r '.data[0].clinic_photos[0]' 2>/dev/null)

if [ -n "$CLINIC_PHOTOS" ] && [ "$CLINIC_PHOTOS" != "null" ]; then
  if [[ "$CLINIC_PHOTOS" == http* ]]; then
    echo "✅ clinic_photos contains absolute URL: $CLINIC_PHOTOS"
  else
    echo "❌ clinic_photos contains relative path: $CLINIC_PHOTOS"
    echo "Expected format: ${BASE_URL}/uploads/..."
  fi
else
  echo "⚠️  No clinic_photos found in response"
fi
echo ""

# Check if profile_picture contains full URLs
echo "4. Checking if profile_picture contains absolute URL..."
PROFILE_PICTURE=$(echo "$PROVIDERS_RESPONSE" | jq -r '.data[0].profile_picture' 2>/dev/null)

if [ -n "$PROFILE_PICTURE" ] && [ "$PROFILE_PICTURE" != "null" ]; then
  if [[ "$PROFILE_PICTURE" == http* ]]; then
    echo "✅ profile_picture contains absolute URL: $PROFILE_PICTURE"
  else
    echo "❌ profile_picture contains relative path: $PROFILE_PICTURE"
    echo "Expected format: ${BASE_URL}/uploads/..."
  fi
else
  echo "⚠️  No profile_picture found in response"
fi
echo ""

# Get first provider ID for detailed test
PROVIDER_ID=$(echo "$PROVIDERS_RESPONSE" | jq -r '.data[0].id' 2>/dev/null)

if [ -n "$PROVIDER_ID" ] && [ "$PROVIDER_ID" != "null" ]; then
  echo "5. Testing GET /api/v1/providers/${PROVIDER_ID}..."
  PROVIDER_DETAIL=$(curl -s -X GET "${API_URL}/providers/${PROVIDER_ID}" \
    -H "Authorization: Bearer ${TOKEN}")
  
  echo "Response:"
  echo "$PROVIDER_DETAIL" | jq '.'
  echo ""
  
  # Check URLs in detail response
  DETAIL_CLINIC_PHOTOS=$(echo "$PROVIDER_DETAIL" | jq -r '.data.clinic_photos[0]' 2>/dev/null)
  if [ -n "$DETAIL_CLINIC_PHOTOS" ] && [ "$DETAIL_CLINIC_PHOTOS" != "null" ]; then
    if [[ "$DETAIL_CLINIC_PHOTOS" == http* ]]; then
      echo "✅ Detail view clinic_photos contains absolute URL"
    else
      echo "❌ Detail view clinic_photos contains relative path"
    fi
  fi
fi

echo ""
echo "=========================================="
echo "Test Complete"
echo "=========================================="
