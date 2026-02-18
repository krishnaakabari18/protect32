#!/bin/bash

echo "🧪 Testing Login API..."
echo ""

# Test login
response=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}')

# Check if response contains token
if echo "$response" | grep -q "accessToken"; then
    echo "✅ Login successful!"
    echo ""
    echo "Response:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
else
    echo "❌ Login failed!"
    echo ""
    echo "Error response:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
fi

echo ""
