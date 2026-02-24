#!/bin/bash

# Test Auto OTP Flow - Registration with Automatic OTP
API_URL="http://localhost:8080/api/v1"

echo "=========================================="
echo "Auto OTP Flow Test"
echo "Registration + Automatic OTP Sending"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Test mobile number (use unique number each time)
MOBILE="+1234567$(date +%s | tail -c 4)"
TEST_OTP="123456"

echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}  STEP 1: Mobile Registration${NC}"
echo -e "${CYAN}  (OTP will be sent automatically)${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Registering user with mobile: $MOBILE${NC}"
REGISTER_DATA="{\"mobile_number\":\"$MOBILE\",\"full_name\":\"Test User Auto\",\"user_type\":\"patient\"}"

REGISTER_RESPONSE=$(wget -qO- --post-data="$REGISTER_DATA" \
  --header="Content-Type: application/json" \
  $API_URL/auth/mobile-register 2>&1)

if echo "$REGISTER_RESPONSE" | grep -q "OTP sent"; then
    echo -e "${GREEN}✓ Registration successful${NC}"
    echo -e "${GREEN}✓ OTP automatically sent${NC}"
    echo ""
    
    USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -1)
    ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    OTP_SENT=$(echo $REGISTER_RESPONSE | grep -o '"otp_sent":[^,]*' | cut -d':' -f2)
    OTP_EXPIRES=$(echo $REGISTER_RESPONSE | grep -o '"otp_expires_in_minutes":[^,]*' | cut -d':' -f2)
    
    echo "User ID: $USER_ID"
    echo "Access Token: ${ACCESS_TOKEN:0:50}..."
    echo "OTP Sent: $OTP_SENT"
    echo "OTP Expires In: $OTP_EXPIRES minutes"
    echo ""
    echo -e "${BLUE}📱 Check API server logs for the OTP code${NC}"
    echo -e "${BLUE}   In TEST MODE, the OTP is: ${TEST_OTP}${NC}"
else
    echo -e "${RED}✗ Registration failed${NC}"
    echo "$REGISTER_RESPONSE"
    exit 1
fi
echo ""

echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}  STEP 2: Verify OTP${NC}"
echo -e "${CYAN}  (No need to call send-otp separately)${NC}"
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
    MOBILE_VERIFIED=$(echo $OTP_VERIFY_RESPONSE | grep -o '"mobile_verified":[^,]*' | cut -d':' -f2)
    IS_VERIFIED=$(echo $OTP_VERIFY_RESPONSE | grep -o '"is_verified":[^,]*' | cut -d':' -f2)
    
    echo "New Access Token: ${VERIFIED_TOKEN:0:50}..."
    echo "Mobile Verified: $MOBILE_VERIFIED"
    echo "User Verified: $IS_VERIFIED"
    echo ""
    echo -e "${GREEN}✅ User is now fully verified and can use the app!${NC}"
else
    echo -e "${RED}✗ OTP verification failed${NC}"
    echo "$OTP_VERIFY_RESPONSE"
fi
echo ""

echo "=========================================="
echo -e "${BLUE}Flow Summary${NC}"
echo "=========================================="
echo ""
echo -e "${GREEN}New Simplified Flow:${NC}"
echo "  1. POST /auth/mobile-register"
echo "     → User registered"
echo "     → OTP automatically sent"
echo "     → Returns: user, tokens, otp_sent=true"
echo ""
echo "  2. POST /auth/verify-otp"
echo "     → Verify OTP (123456 in test mode)"
echo "     → User marked as verified"
echo "     → Returns: updated user, new tokens"
echo ""
echo -e "${GREEN}Benefits:${NC}"
echo "  ✓ One less API call (no need for /send-otp)"
echo "  ✓ Faster registration flow"
echo "  ✓ Better user experience"
echo "  ✓ OTP sent immediately after registration"
echo ""
echo -e "${BLUE}Test Mode Configuration:${NC}"
echo "  OTP_TEST_MODE=true"
echo "  OTP_TEST_CODE=123456"
echo "  OTP_EXPIRE_MINUTES=10"
echo ""
echo -e "${GREEN}✓ Auto OTP Flow Test Complete!${NC}"
echo ""
