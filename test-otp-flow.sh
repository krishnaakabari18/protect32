#!/bin/bash

# Complete OTP Flow Test Script
API_URL="http://localhost:8080/api/v1"

echo "=========================================="
echo "OTP Flow Complete Test"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Test mobile number
MOBILE="+919999888877"
TEST_OTP="123456"

echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}  STEP 1: Mobile Registration${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Registering user with mobile: $MOBILE${NC}"
REGISTER_DATA="{\"mobile_number\":\"$MOBILE\",\"full_name\":\"Test User\",\"user_type\":\"patient\"}"

REGISTER_RESPONSE=$(wget -qO- --post-data="$REGISTER_DATA" \
  --header="Content-Type: application/json" \
  $API_URL/auth/mobile-register 2>&1)

if echo "$REGISTER_RESPONSE" | grep -q "User registered successfully"; then
    echo -e "${GREEN}✓ Registration successful${NC}"
    USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -1)
    ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    echo "User ID: $USER_ID"
    echo "Access Token: ${ACCESS_TOKEN:0:50}..."
elif echo "$REGISTER_RESPONSE" | grep -q "already exists"; then
    echo -e "${YELLOW}⚠ User already exists, continuing with existing user${NC}"
else
    echo -e "${RED}✗ Registration failed${NC}"
    echo "$REGISTER_RESPONSE"
fi
echo ""

echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}  STEP 2: Send OTP${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Sending OTP to: $MOBILE${NC}"
OTP_SEND_DATA="{\"mobile_number\":\"$MOBILE\",\"purpose\":\"mobile_verification\"}"

OTP_SEND_RESPONSE=$(wget -qO- --post-data="$OTP_SEND_DATA" \
  --header="Content-Type: application/json" \
  $API_URL/auth/send-otp 2>&1)

if echo "$OTP_SEND_RESPONSE" | grep -q "OTP sent successfully"; then
    echo -e "${GREEN}✓ OTP sent successfully${NC}"
    echo "Response: $OTP_SEND_RESPONSE"
    echo ""
    echo -e "${BLUE}📱 Check API server logs for the OTP code${NC}"
    echo -e "${BLUE}   In TEST MODE, the default OTP is: ${TEST_OTP}${NC}"
else
    echo -e "${RED}✗ Failed to send OTP${NC}"
    echo "$OTP_SEND_RESPONSE"
fi
echo ""

echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}  STEP 3: Verify OTP${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Verifying OTP: $TEST_OTP${NC}"
OTP_VERIFY_DATA="{\"mobile_number\":\"$MOBILE\",\"otp_code\":\"$TEST_OTP\",\"purpose\":\"mobile_verification\"}"

OTP_VERIFY_RESPONSE=$(wget -qO- --post-data="$OTP_VERIFY_DATA" \
  --header="Content-Type: application/json" \
  $API_URL/auth/verify-otp 2>&1)

if echo "$OTP_VERIFY_RESPONSE" | grep -q "OTP verified successfully"; then
    echo -e "${GREEN}✓ OTP verified successfully${NC}"
    VERIFIED_TOKEN=$(echo $OTP_VERIFY_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    echo "New Access Token: ${VERIFIED_TOKEN:0:50}..."
    echo ""
    echo -e "${GREEN}✅ User is now verified and can use the app!${NC}"
else
    echo -e "${RED}✗ OTP verification failed${NC}"
    echo "$OTP_VERIFY_RESPONSE"
fi
echo ""

echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}  STEP 4: Test Wrong OTP${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo ""

# Send OTP again for testing wrong OTP
echo -e "${YELLOW}Sending OTP again...${NC}"
wget -qO- --post-data="$OTP_SEND_DATA" \
  --header="Content-Type: application/json" \
  $API_URL/auth/send-otp > /dev/null 2>&1

echo -e "${YELLOW}Testing with wrong OTP: 999999${NC}"
WRONG_OTP_DATA="{\"mobile_number\":\"$MOBILE\",\"otp_code\":\"999999\",\"purpose\":\"mobile_verification\"}"

WRONG_OTP_RESPONSE=$(wget -qO- --post-data="$WRONG_OTP_DATA" \
  --header="Content-Type: application/json" \
  $API_URL/auth/verify-otp 2>&1)

if echo "$WRONG_OTP_RESPONSE" | grep -q "Invalid or expired OTP"; then
    echo -e "${GREEN}✓ Correctly rejected wrong OTP${NC}"
    echo "Error: $(echo $WRONG_OTP_RESPONSE | grep -o '"error":"[^"]*' | cut -d'"' -f4)"
else
    echo -e "${RED}✗ Should have rejected wrong OTP${NC}"
    echo "$WRONG_OTP_RESPONSE"
fi
echo ""

echo "=========================================="
echo -e "${BLUE}OTP Configuration Summary${NC}"
echo "=========================================="
echo ""
echo -e "${GREEN}Environment Variables (.env):${NC}"
echo "  OTP_TEST_MODE=true          # Enable test mode"
echo "  OTP_TEST_CODE=123456        # Default OTP for testing"
echo "  OTP_LENGTH=6                # OTP length"
echo "  OTP_EXPIRE_MINUTES=10       # OTP expiry time"
echo ""
echo -e "${GREEN}Test Mode Features:${NC}"
echo "  ✓ Always generates OTP: 123456"
echo "  ✓ OTP is logged to console"
echo "  ✓ No SMS service required"
echo "  ✓ Perfect for development/testing"
echo ""
echo -e "${GREEN}Production Mode:${NC}"
echo "  Set OTP_TEST_MODE=false"
echo "  Configure Twilio credentials"
echo "  OTP will be sent via SMS"
echo ""
echo -e "${BLUE}Complete Flow:${NC}"
echo "  1. POST /auth/mobile-register    → Register user"
echo "  2. POST /auth/send-otp           → Send OTP (123456 in test mode)"
echo "  3. POST /auth/verify-otp         → Verify OTP"
echo "  4. Use accessToken for API calls"
echo ""
echo -e "${GREEN}✓ OTP Flow Test Complete!${NC}"
echo ""
