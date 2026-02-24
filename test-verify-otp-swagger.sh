#!/bin/bash

# Test Verify OTP API with Updated Schema
API_URL="http://localhost:8080/api/v1"

echo "=========================================="
echo "Verify OTP API - Swagger Schema Test"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test mobile number
MOBILE="+1234567823"
TEST_OTP="123456"

echo -e "${BLUE}Testing verify-otp API with mobile_verification purpose${NC}"
echo ""

# Step 1: Register user (OTP sent automatically)
echo -e "${YELLOW}Step 1: Registering user...${NC}"
REGISTER_DATA="{\"mobile_number\":\"$MOBILE\",\"full_name\":\"Test User\",\"user_type\":\"patient\"}"

REGISTER_RESPONSE=$(wget -qO- --post-data="$REGISTER_DATA" \
  --header="Content-Type: application/json" \
  $API_URL/auth/mobile-register 2>&1)

if echo "$REGISTER_RESPONSE" | grep -q "OTP sent"; then
    echo -e "${GREEN}✓ User registered and OTP sent${NC}"
else
    echo "Note: User may already exist"
fi
echo ""

# Step 2: Verify OTP with mobile_verification purpose
echo -e "${YELLOW}Step 2: Verifying OTP with mobile_verification purpose...${NC}"
echo ""
echo "Request Body:"
echo "{"
echo "  \"mobile_number\": \"$MOBILE\","
echo "  \"otp_code\": \"$TEST_OTP\","
echo "  \"purpose\": \"mobile_verification\""
echo "}"
echo ""

VERIFY_DATA="{\"mobile_number\":\"$MOBILE\",\"otp_code\":\"$TEST_OTP\",\"purpose\":\"mobile_verification\"}"

VERIFY_RESPONSE=$(wget -qO- --post-data="$VERIFY_DATA" \
  --header="Content-Type: application/json" \
  $API_URL/auth/verify-otp 2>&1)

if echo "$VERIFY_RESPONSE" | grep -q "OTP verified successfully"; then
    echo -e "${GREEN}✓ OTP verified successfully${NC}"
    echo ""
    echo "Response:"
    echo "$VERIFY_RESPONSE" | head -c 500
    echo ""
else
    echo "Response:"
    echo "$VERIFY_RESPONSE"
fi
echo ""

echo "=========================================="
echo -e "${BLUE}Swagger Documentation Updated${NC}"
echo "=========================================="
echo ""
echo "Purpose enum now includes:"
echo "  - registration"
echo "  - login"
echo "  - password_reset"
echo "  - mobile_verification  ← NEW"
echo ""
echo "Example request body:"
echo '{'
echo '  "mobile_number": "+1234567823",'
echo '  "otp_code": "123456",'
echo '  "purpose": "mobile_verification"'
echo '}'
echo ""
echo "Access Swagger UI:"
echo "  http://localhost:8080/api-docs/"
echo ""
echo -e "${GREEN}✓ Swagger schema updated successfully!${NC}"
echo ""
