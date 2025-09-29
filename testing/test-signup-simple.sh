#!/bin/bash

# Simple Signup Testing Script using curl
# This script tests various signup scenarios to ensure reliability

# Configuration
API_BASE=${REACT_APP_API:-"http://localhost:5001"}
TEST_EMAIL="test@example.com"
TEST_CLASS="Test Yoga Class"
TEST_DATE="2024-12-31"

echo "🧪 Starting Signup Tests..."
echo "API Base URL: $API_BASE"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local endpoint="$2"
    local method="$3"
    local data="$4"
    local expected_status="$5"
    
    echo "Testing: $test_name"
    
    # Make the request
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_BASE$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" "$API_BASE$endpoint")
    fi
    
    # Extract status code (last line)
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    # Check if test passed
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS - Status: $status_code${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL - Expected: $expected_status, Got: $status_code${NC}"
        echo "Response: $body"
        ((FAILED++))
    fi
    echo ""
}

# Test 1: API Connection
echo "=== Testing API Connection ==="
run_test "API Connection" "/api/events" "GET" "" "200"

# Test 2: Valid Returning Student
echo "=== Testing Returning Student Flow ==="
returning_data='{"email":"'$TEST_EMAIL'","classTitle":"'$TEST_CLASS'","date":"'$TEST_DATE'"}'
run_test "Valid Returning Student" "/api/check-student" "POST" "$returning_data" "200"

# Test 3: Invalid Email for Returning Student
echo "=== Testing Invalid Data ==="
invalid_email_data='{"email":"invalid-email","classTitle":"'$TEST_CLASS'","date":"'$TEST_DATE'"}'
run_test "Invalid Email (Returning)" "/api/check-student" "POST" "$invalid_email_data" "404"

# Test 4: Valid New Student
echo "=== Testing New Student Flow ==="
new_student_data='{
    "name":"Test User",
    "email":"newuser@test.com",
    "phone":"555-123-4567",
    "classTitle":"'$TEST_CLASS'",
    "date":"'$TEST_DATE'",
    "signature":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "recaptchaToken":"bypass"
}'
run_test "Valid New Student" "/api/signup" "POST" "$new_student_data" "200"

# Test 5: Missing Required Fields
echo "=== Testing Validation ==="
missing_fields_data='{
    "name":"",
    "email":"test@test.com",
    "phone":"555-123-4567",
    "classTitle":"'$TEST_CLASS'",
    "date":"'$TEST_DATE'",
    "signature":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "recaptchaToken":"bypass"
}'
run_test "Missing Required Fields" "/api/signup" "POST" "$missing_fields_data" "400"

# Test 6: Invalid Email Format
echo "=== Testing Email Validation ==="
invalid_email_new_data='{
    "name":"Test User",
    "email":"invalid-email",
    "phone":"555-123-4567",
    "classTitle":"'$TEST_CLASS'",
    "date":"'$TEST_DATE'",
    "signature":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "recaptchaToken":"bypass"
}'
run_test "Invalid Email Format" "/api/signup" "POST" "$invalid_email_new_data" "400"

# Test 7: Missing Signature
echo "=== Testing Signature Validation ==="
missing_signature_data='{
    "name":"Test User",
    "email":"test@test.com",
    "phone":"555-123-4567",
    "classTitle":"'$TEST_CLASS'",
    "date":"'$TEST_DATE'",
    "signature":"",
    "recaptchaToken":"bypass"
}'
run_test "Missing Signature" "/api/signup" "POST" "$missing_signature_data" "400"

# Summary
echo "📊 Test Results Summary:"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
total=$((PASSED + FAILED))
if [ $total -gt 0 ]; then
    success_rate=$((PASSED * 100 / total))
    echo -e "${YELLOW}📈 Success Rate: $success_rate%${NC}"
else
    echo -e "${YELLOW}📈 Success Rate: 0%${NC}"
fi

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! Your signup system is working correctly.${NC}"
else
    echo -e "\n${RED}⚠️  Some tests failed. Please check the issues above.${NC}"
fi
