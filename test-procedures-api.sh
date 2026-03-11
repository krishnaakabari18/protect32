#!/bin/bash

echo "Testing Procedures API..."
echo ""

# First, login to get a token
echo "1. Getting auth token..."
LOGIN_RESPONSE=$(wget -q -O - --post-data='{"email":"admin@dentist.com","password":"password123"}' \
  --header="Content-Type: application/json" \
  --header="ngrok-skip-browser-warning: true" \
  http://localhost:8080/api/v1/auth/login 2>&1)

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "Failed to get token. Response:"
    echo "$LOGIN_RESPONSE"
    exit 1
fi

echo "Token obtained: ${TOKEN:0:20}..."
echo ""

# Test procedures by-category endpoint
echo "2. Testing /api/v1/procedures/by-category..."
PROCEDURES_RESPONSE=$(wget -q -O - \
  --header="Authorization: Bearer $TOKEN" \
  --header="ngrok-skip-browser-warning: true" \
  http://localhost:8080/api/v1/procedures/by-category 2>&1)

echo "Response:"
echo "$PROCEDURES_RESPONSE" | head -50
echo ""

# Count categories
CATEGORY_COUNT=$(echo "$PROCEDURES_RESPONSE" | grep -o '"category"' | wc -l)
echo "Number of categories found: $CATEGORY_COUNT"
