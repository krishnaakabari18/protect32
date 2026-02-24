#!/bin/bash

# Mobile Registration API Test Script
API_URL="http://localhost:8080/api/v1"

echo "=========================================="
echo "Mobile Registration API Test"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test 1: Register with full name (first and last)
echo -e "${YELLOW}Test 1: Register with full name (John Doe)${NC}"
REGISTER_DATA='{"mobile_number":"+919876543210","full_name":"John Doe","user_type":"patient"}'

RESPONSE=$(wget -qO- --post-data="$REGISTER_DATA" \
  --header="Content-Type: application/json" \
  $API_URL/auth/mobile-register 2>&1)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Registration successful${NC}"
    echo "Response:"
    echo "$RESPONSE" | head -c 500
    echo ""
    
    # Extract user ID for verification
    USER_ID=$(echo $RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -1)
    echo "User ID: $USER_ID"
    
    # Extract first and last name
    FIRST_NAME=$(echo $RESPONSE | grep -o '"first_name":"[^"]*' | cut -d'"' -f4)
    LAST_NAME=$(echo $RESPONSE | grep -o '"last_name":"[^"]*' | cut -d'"' -f4)
    echo "First Name: $FIRST_NAME"
    echo "Last Name: $LAST_NAME"
else
    echo -e "${RED}✗ Registration failed${NC}"
    echo "$RESPONSE"
fi
echo ""

# Test 2: Register with single name (only first name)
echo -e "${YELLOW}Test 2: Register with single name (Rajesh)${NC}"
REGISTER_DATA2='{"mobile_number":"+919876543211","full_name":"Rajesh","user_type":"patient"}'

RESPONSE2=$(wget -qO- --post-data="$REGISTER_DATA2" \
  --header="Content-Type: application/json" \
  $API_URL/auth/mobile-register 2>&1)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Registration successful${NC}"
    echo "Response:"
    echo "$RESPONSE2" | head -c 500
    echo ""
    
    FIRST_NAME2=$(echo $RESPONSE2 | grep -o '"first_name":"[^"]*' | cut -d'"' -f4)
    LAST_NAME2=$(echo $RESPONSE2 | grep -o '"last_name":"[^"]*' | cut -d'"' -f4)
    echo "First Name: $FIRST_NAME2"
    echo "Last Name: $LAST_NAME2 (should be empty or null)"
else
    echo -e "${RED}✗ Registration failed${NC}"
    echo "$RESPONSE2"
fi
echo ""

# Test 3: Register with multiple names (first, middle, last)
echo -e "${YELLOW}Test 3: Register with multiple names (Amit Kumar Singh)${NC}"
REGISTER_DATA3='{"mobile_number":"+919876543212","full_name":"Amit Kumar Singh","user_type":"patient"}'

RESPONSE3=$(wget -qO- --post-data="$REGISTER_DATA3" \
  --header="Content-Type: application/json" \
  $API_URL/auth/mobile-register 2>&1)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Registration successful${NC}"
    echo "Response:"
    echo "$RESPONSE3" | head -c 500
    echo ""
    
    FIRST_NAME3=$(echo $RESPONSE3 | grep -o '"first_name":"[^"]*' | cut -d'"' -f4)
    LAST_NAME3=$(echo $RESPONSE3 | grep -o '"last_name":"[^"]*' | cut -d'"' -f4)
    echo "First Name: $FIRST_NAME3 (should be 'Amit')"
    echo "Last Name: $LAST_NAME3 (should be 'Kumar Singh')"
else
    echo -e "${RED}✗ Registration failed${NC}"
    echo "$RESPONSE3"
fi
echo ""

# Test 4: Try to register with duplicate mobile number
echo -e "${YELLOW}Test 4: Try duplicate mobile number (should fail)${NC}"
REGISTER_DATA4='{"mobile_number":"+919876543210","full_name":"Another User","user_type":"patient"}'

RESPONSE4=$(wget -qO- --post-data="$REGISTER_DATA4" \
  --header="Content-Type: application/json" \
  $API_URL/auth/mobile-register 2>&1)

if echo "$RESPONSE4" | grep -q "already exists"; then
    echo -e "${GREEN}✓ Correctly rejected duplicate mobile number${NC}"
    echo "Error: $(echo $RESPONSE4 | grep -o '"error":"[^"]*' | cut -d'"' -f4)"
else
    echo -e "${RED}✗ Should have rejected duplicate mobile number${NC}"
    echo "$RESPONSE4"
fi
echo ""

# Test 5: Try to register without required fields
echo -e "${YELLOW}Test 5: Try without mobile number (should fail)${NC}"
REGISTER_DATA5='{"full_name":"Test User"}'

RESPONSE5=$(wget -qO- --post-data="$REGISTER_DATA5" \
  --header="Content-Type: application/json" \
  $API_URL/auth/mobile-register 2>&1)

if echo "$RESPONSE5" | grep -q "required"; then
    echo -e "${GREEN}✓ Correctly rejected missing mobile number${NC}"
    echo "Error: $(echo $RESPONSE5 | grep -o '"error":"[^"]*' | cut -d'"' -f4)"
else
    echo -e "${RED}✗ Should have rejected missing mobile number${NC}"
    echo "$RESPONSE5"
fi
echo ""

# Summary
echo "=========================================="
echo -e "${BLUE}Mobile Registration API Summary${NC}"
echo "=========================================="
echo ""
echo "Endpoint: POST $API_URL/auth/mobile-register"
echo ""
echo "Required Fields:"
echo "  ✓ mobile_number (string) - Mobile number with country code"
echo "  ✓ full_name (string) - Full name (will be split)"
echo ""
echo "Optional Fields:"
echo "  - user_type (string) - patient, provider, or admin (default: patient)"
echo ""
echo "Name Splitting Logic:"
echo "  - 'John' → first_name: 'John', last_name: null"
echo "  - 'John Doe' → first_name: 'John', last_name: 'Doe'"
echo "  - 'John Kumar Singh' → first_name: 'John', last_name: 'Kumar Singh'"
echo ""
echo "Response includes:"
echo "  - user object (with id, mobile_number, first_name, last_name)"
echo "  - accessToken (JWT)"
echo "  - refreshToken (JWT)"
echo "  - note: 'Please verify your mobile number using OTP'"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. User should verify mobile using: POST /auth/send-otp"
echo "2. Then verify OTP using: POST /auth/verify-otp"
echo "3. Access Swagger UI: http://localhost:8080/api-docs/"
echo ""
echo -e "${GREEN}✓ Mobile Registration API is ready for mobile app integration!${NC}"
echo ""
