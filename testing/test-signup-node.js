/**
 * Simple Signup Testing Script (Node.js without dependencies)
 * This script tests various signup scenarios using built-in modules
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Configuration
const API_BASE = process.env.REACT_APP_API || 'http://localhost:5001';
const TEST_EMAIL = 'test@example.com';
const TEST_CLASS = 'Test Yoga Class';
const TEST_DATE = '2024-12-31';

// Test counter
let passed = 0;
let failed = 0;

// Function to make HTTP requests
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const req = client.request(requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    body: data,
                    headers: res.headers
                });
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (options.body) {
            req.write(options.body);
        }

        req.end();
    });
}

// Function to run a test
async function runTest(testName, endpoint, method = 'GET', body = null, expectedStatus = 200) {
    console.log(`Testing: ${testName}`);
    
    try {
        const response = await makeRequest(`${API_BASE}${endpoint}`, {
            method,
            body: body ? JSON.stringify(body) : null
        });
        
        if (response.status === expectedStatus) {
            console.log(`✅ PASS - Status: ${response.status}`);
            passed++;
        } else {
            console.log(`❌ FAIL - Expected: ${expectedStatus}, Got: ${response.status}`);
            console.log(`   Response:`, response.body);
            failed++;
        }
    } catch (error) {
        console.log(`❌ ERROR - ${testName}:`, error.message);
        failed++;
    }
    
    console.log(''); // Empty line for readability
}

// Main test function
async function runTests() {
    console.log('🧪 Starting Signup Tests...\n');
    console.log(`API Base URL: ${API_BASE}\n`);
    
    // Test 1: API Connection
    console.log('=== Testing API Connection ===');
    await runTest('API Connection', '/api/events', 'GET', null, 200);
    
    // Test 2: Valid Returning Student (expect 404 if email doesn't exist)
    console.log('=== Testing Returning Student Flow ===');
    const returningData = {
        email: TEST_EMAIL,
        classTitle: TEST_CLASS,
        date: TEST_DATE
    };
    await runTest('Valid Returning Student', '/api/check-student', 'POST', returningData, 404);
    
    // Test 3: Invalid Email for Returning Student
    console.log('=== Testing Invalid Data ===');
    const invalidEmailData = {
        email: 'invalid-email',
        classTitle: TEST_CLASS,
        date: TEST_DATE
    };
    await runTest('Invalid Email (Returning)', '/api/check-student', 'POST', invalidEmailData, 400);
    
    // Test 4: Valid New Student
    console.log('=== Testing New Student Flow ===');
    const timestamp = Date.now();
    const newStudentData = {
        name: 'Test User',
        email: `newuser${timestamp}@test.com`,
        phone: '555-123-4567',
        classTitle: 'Yoga for Wheelchair Yogis (60 min)',
        date: '2025-09-13',
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        recaptchaToken: 'bypass'
    };
    await runTest('Valid New Student', '/api/signup', 'POST', newStudentData, 200);
    
    // Test 5: Missing Required Fields
    console.log('=== Testing Validation ===');
    const missingFieldsData = {
        name: '',
        email: `test${timestamp}@test.com`,
        phone: '555-123-4567',
        classTitle: 'Yoga for Wheelchair Yogis (60 min)',
        date: '2025-09-13',
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        recaptchaToken: 'bypass'
    };
    await runTest('Missing Required Fields', '/api/signup', 'POST', missingFieldsData, 400);
    
    // Test 6: Invalid Email Format
    console.log('=== Testing Email Validation ===');
    const invalidEmailNewData = {
        name: 'Test User',
        email: 'invalid-email',
        phone: '555-123-4567',
        classTitle: 'Yoga for Wheelchair Yogis (60 min)',
        date: '2025-09-13',
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        recaptchaToken: 'bypass'
    };
    await runTest('Invalid Email Format', '/api/signup', 'POST', invalidEmailNewData, 400);
    
    // Test 7: Missing Signature
    console.log('=== Testing Signature Validation ===');
    const missingSignatureData = {
        name: 'Test User',
        email: `test2${timestamp}@test.com`,
        phone: '555-123-4567',
        classTitle: 'Yoga for Wheelchair Yogis (60 min)',
        date: '2025-09-13',
        signature: '',
        recaptchaToken: 'bypass'
    };
    await runTest('Missing Signature', '/api/signup', 'POST', missingSignatureData, 400);
    
    // Summary
    console.log('📊 Test Results Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    const total = passed + failed;
    const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (failed === 0) {
        console.log('\n🎉 All tests passed! Your signup system is working correctly.');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the issues above.');
    }
}

// Run the tests
runTests().catch(console.error);
