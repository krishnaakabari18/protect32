#!/bin/bash

# Test procedures API endpoints

# Get auth token first
TOKEN=$(curl -s -X POST https://abbey-stateliest-treva.ngrok-free.dev/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{"email":"admin@example.com","password":"password123"}' | jq -r '.token')

echo "Token: ${TOKEN:0:20}..."
echo ""

# Test 1: Get procedures grouped by category
echo "=== Test 1: Get Procedures Grouped by Category ==="
curl -s -X GET "https://abbey-stateliest-treva.ngrok-free.dev/api/v1/procedures/grouped" \
  -H "Authorization: Bearer $TOKEN" \
  -H "ngrok-skip-browser-warning: true" | jq '.'

echo ""
echo "=== Test 2: Get All Categories ==="
curl -s -X GET "https://abbey-stateliest-treva.ngrok-free.dev/api/v1/procedures/categories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "ngrok-skip-browser-warning: true" | jq '.'

echo ""
echo "=== Test 3: Get Procedures by Category (Restorative) ==="
curl -s -X GET "https://abbey-stateliest-treva.ngrok-free.dev/api/v1/procedures/category/Restorative" \
  -H "Authorization: Bearer $TOKEN" \
  -H "ngrok-skip-browser-warning: true" | jq '.'
