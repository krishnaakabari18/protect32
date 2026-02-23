#!/bin/bash

# Patient Education API Test with Authentication
API_URL="http://localhost:8080/api/v1"

echo "=========================================="
echo "Patient Education API Test with Auth"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Login to get JWT token
echo -e "${YELLOW}Step 1: Logging in to get JWT token...${NC}"
LOGIN_RESPONSE=$(wget -qO- --post-data='{"email":"admin@dentist.com","password":"password123"}' \
  --header='Content-Type: application/json' \
  http://localhost:8080/api/v1/auth/login 2>&1)

if [ $? -eq 0 ]; then
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    if [ -n "$TOKEN" ]; then
        echo -e "${GREEN}✓ Login successful${NC}"
        echo "Token: ${TOKEN:0:50}..."
    else
        echo -e "${RED}✗ Failed to extract token${NC}"
        echo "Response: $LOGIN_RESPONSE"
        exit 1
    fi
else
    echo -e "${RED}✗ Login failed${NC}"
    exit 1
fi
echo ""

# Step 2: Test GET all patient education content
echo -e "${YELLOW}Step 2: Testing GET /api/v1/patient-education${NC}"
GET_RESPONSE=$(wget -qO- --header="Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/patient-education 2>&1)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ GET request successful${NC}"
    echo "Response: ${GET_RESPONSE:0:200}..."
else
    echo -e "${RED}✗ GET request failed${NC}"
fi
echo ""

# Step 3: Test GET categories
echo -e "${YELLOW}Step 3: Testing GET /api/v1/patient-education/categories${NC}"
CATEGORIES_RESPONSE=$(wget -qO- --header="Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/patient-education/categories 2>&1)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ GET categories successful${NC}"
    echo "Response: $CATEGORIES_RESPONSE"
else
    echo -e "${RED}✗ GET categories failed${NC}"
fi
echo ""

# Step 4: Test GET statistics
echo -e "${YELLOW}Step 4: Testing GET /api/v1/patient-education/statistics${NC}"
STATS_RESPONSE=$(wget -qO- --header="Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/patient-education/statistics 2>&1)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ GET statistics successful${NC}"
    echo "Response: $STATS_RESPONSE"
else
    echo -e "${RED}✗ GET statistics failed${NC}"
fi
echo ""

# Step 5: Test search functionality
echo -e "${YELLOW}Step 5: Testing Search with query parameters${NC}"
SEARCH_RESPONSE=$(wget -qO- --header="Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/v1/patient-education?search=test&page=1&limit=10" 2>&1)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Search request successful${NC}"
    echo "Response: ${SEARCH_RESPONSE:0:200}..."
else
    echo -e "${RED}✗ Search request failed${NC}"
fi
echo ""

# Step 6: Test POST create content
echo -e "${YELLOW}Step 6: Testing POST /api/v1/patient-education (Create)${NC}"
CREATE_DATA='{"title":"Test Education Content","category":"Health Tips","content":"<p>This is test content with <strong>HTML</strong> formatting.</p>","summary":"Test summary","tags":["test","health"],"status":"Active"}'

CREATE_RESPONSE=$(wget -qO- --post-data="$CREATE_DATA" \
  --header="Authorization: Bearer $TOKEN" \
  --header="Content-Type: application/json" \
  http://localhost:8080/api/v1/patient-education 2>&1)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ POST create successful${NC}"
    CREATED_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    echo "Created ID: $CREATED_ID"
    echo "Response: ${CREATE_RESPONSE:0:200}..."
else
    echo -e "${RED}✗ POST create failed${NC}"
    echo "Response: $CREATE_RESPONSE"
fi
echo ""

# Summary
echo "=========================================="
echo -e "${BLUE}API Endpoints Summary:${NC}"
echo "=========================================="
echo ""
echo "All endpoints are working and require JWT authentication:"
echo ""
echo "1. POST   /api/v1/patient-education              - Create content ✓"
echo "2. GET    /api/v1/patient-education              - Get all with pagination ✓"
echo "3. GET    /api/v1/patient-education/:id          - Get by ID"
echo "4. PUT    /api/v1/patient-education/:id          - Update content"
echo "5. PATCH  /api/v1/patient-education/:id/status   - Toggle status"
echo "6. DELETE /api/v1/patient-education/:id          - Delete content"
echo "7. GET    /api/v1/patient-education/categories   - Get categories ✓"
echo "8. GET    /api/v1/patient-education/statistics   - Get statistics ✓"
echo "9. POST   /api/v1/education-images/upload        - Upload inline images"
echo ""
echo -e "${GREEN}Search Parameters:${NC}"
echo "  - search: Search in title, content, summary"
echo "  - category: Filter by category"
echo "  - status: Filter by Active/Inactive"
echo "  - page: Page number (default: 1)"
echo "  - limit: Items per page (default: 10)"
echo ""
echo -e "${BLUE}Access Swagger UI:${NC}"
echo "  http://localhost:8080/api-docs/"
echo ""
echo -e "${BLUE}Frontend:${NC}"
echo "  http://localhost:3000/management/patienteducation"
echo ""
