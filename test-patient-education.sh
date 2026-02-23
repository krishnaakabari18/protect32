#!/bin/bash

# Test Patient Education API Endpoints
# Make sure you have a valid auth token

echo "=== Patient Education API Tests ==="
echo ""

# Get auth token (you need to login first)
# Replace with your actual token
TOKEN="YOUR_AUTH_TOKEN_HERE"

BASE_URL="http://localhost:8080/api/v1"

echo "1. Testing GET all content..."
wget -q -O - --header="Authorization: Bearer $TOKEN" \
  --header="ngrok-skip-browser-warning: true" \
  "$BASE_URL/patient-education" | head -c 200
echo ""
echo ""

echo "2. Testing GET categories..."
wget -q -O - --header="Authorization: Bearer $TOKEN" \
  --header="ngrok-skip-browser-warning: true" \
  "$BASE_URL/patient-education/categories"
echo ""
echo ""

echo "3. Testing GET statistics..."
wget -q -O - --header="Authorization: Bearer $TOKEN" \
  --header="ngrok-skip-browser-warning: true" \
  "$BASE_URL/patient-education/statistics"
echo ""
echo ""

echo "4. Testing GET with filters (Active status)..."
wget -q -O - --header="Authorization: Bearer $TOKEN" \
  --header="ngrok-skip-browser-warning: true" \
  "$BASE_URL/patient-education?status=Active" | head -c 200
echo ""
echo ""

echo "5. Testing search (diabetes)..."
wget -q -O - --header="Authorization: Bearer $TOKEN" \
  --header="ngrok-skip-browser-warning: true" \
  "$BASE_URL/patient-education?search=diabetes" | head -c 200
echo ""
echo ""

echo "=== Tests Complete ==="
echo ""
echo "Note: Replace YOUR_AUTH_TOKEN_HERE with actual token from login"
echo "To get token: Login via UI or use /api/v1/auth/login endpoint"
