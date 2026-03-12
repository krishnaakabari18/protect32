#!/bin/bash

# Test script for image deletion API
API_BASE="https://abbey-stateliest-treva.ngrok-free.dev/api/v1"

echo "=== Testing Provider Image Deletion API ==="

# Test 1: Get a provider to see existing images
echo "1. Getting provider data to check existing images..."
curl -X GET "$API_BASE/providers" \
  -H "ngrok-skip-browser-warning: true" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  | jq '.data[0] | {id, clinic_photos, profile_photo, state_dental_council_reg_photo}'

echo -e "\n2. Testing image deletion endpoints..."

# Test 2: Delete clinic photo (example)
echo "Testing DELETE clinic photo..."
curl -X DELETE "$API_BASE/providers/PROVIDER_ID_HERE/images/clinic_photos" \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "imageIndex": 0
  }' | jq '.'

# Test 3: Delete profile photo (example)
echo "Testing DELETE profile photo..."
curl -X DELETE "$API_BASE/providers/PROVIDER_ID_HERE/images/profile_photo" \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{}' | jq '.'

echo "=== Test Complete ==="
echo "Note: Replace PROVIDER_ID_HERE and YOUR_TOKEN_HERE with actual values"