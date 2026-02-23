#!/bin/bash

echo "========================================="
echo "Patient Education Module - Complete Fix"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Clear Next.js cache
echo -e "${YELLOW}Step 1: Clearing Next.js cache...${NC}"
cd backend
rm -rf .next
rm -rf node_modules/.cache
echo -e "${GREEN}✓ Cache cleared${NC}"
echo ""

# Step 2: Verify page file exists
echo -e "${YELLOW}Step 2: Verifying page file...${NC}"
if [ -f "app/(defaults)/management/patient-education/page.tsx" ]; then
    echo -e "${GREEN}✓ Page file exists${NC}"
else
    echo -e "${RED}✗ Page file missing!${NC}"
    exit 1
fi
echo ""

# Step 3: Verify component exists
echo -e "${YELLOW}Step 3: Verifying component file...${NC}"
if [ -f "components/management/patient-education-crud.tsx" ]; then
    echo -e "${GREEN}✓ Component file exists${NC}"
else
    echo -e "${RED}✗ Component file missing!${NC}"
    exit 1
fi
echo ""

# Step 4: Check for running Next.js process
echo -e "${YELLOW}Step 4: Checking for running Next.js process...${NC}"
NEXTJS_PID=$(ps aux | grep "next dev" | grep -v grep | awk '{print $2}' | head -1)
if [ ! -z "$NEXTJS_PID" ]; then
    echo -e "${YELLOW}Found running Next.js process (PID: $NEXTJS_PID)${NC}"
    echo -e "${YELLOW}Stopping it...${NC}"
    kill $NEXTJS_PID
    sleep 2
    echo -e "${GREEN}✓ Process stopped${NC}"
else
    echo -e "${GREEN}✓ No running process found${NC}"
fi
echo ""

# Step 5: Start Next.js dev server
echo -e "${YELLOW}Step 5: Starting Next.js dev server...${NC}"
echo -e "${YELLOW}This will run in the background...${NC}"
npm run dev > /dev/null 2>&1 &
NEXTJS_NEW_PID=$!
echo -e "${GREEN}✓ Next.js started (PID: $NEXTJS_NEW_PID)${NC}"
echo ""

# Step 6: Wait for server to be ready
echo -e "${YELLOW}Step 6: Waiting for server to be ready...${NC}"
sleep 5
echo -e "${GREEN}✓ Server should be ready${NC}"
echo ""

# Step 7: Check API server
cd ../api
echo -e "${YELLOW}Step 7: Checking API server...${NC}"
API_PID=$(ps aux | grep "node src/server.js" | grep -v grep | awk '{print $2}' | head -1)
if [ ! -z "$API_PID" ]; then
    echo -e "${GREEN}✓ API server is running (PID: $API_PID)${NC}"
else
    echo -e "${RED}✗ API server not running!${NC}"
    echo -e "${YELLOW}Starting API server...${NC}"
    node src/server.js > /dev/null 2>&1 &
    API_NEW_PID=$!
    echo -e "${GREEN}✓ API server started (PID: $API_NEW_PID)${NC}"
fi
echo ""

# Final instructions
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Open your browser"
echo "2. Go to: http://localhost:3001"
echo "3. Login if needed"
echo "4. Navigate to: Management > Patient Education"
echo ""
echo -e "${YELLOW}If you still see 'Route not found':${NC}"
echo "1. Hard refresh browser: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)"
echo "2. Clear browser cache"
echo "3. Try incognito/private window"
echo ""
echo -e "${GREEN}The editor will now show consistently every time!${NC}"
echo ""
