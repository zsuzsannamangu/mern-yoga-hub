/**
 * Signup Testing Script
 * This script tests various signup scenarios to ensure reliability
 */

// Use built-in fetch for Node.js 18+ or import for older versions
let fetch;
try {
    // Try to use built-in fetch (Node.js 18+)
    fetch = globalThis.fetch;
    if (!fetch) {
        throw new Error('fetch not available');
    }
} catch (error) {
    console.log('Built-in fetch not available. Please install node-fetch or use Node.js 18+');
    console.log('Run: npm install node-fetch');
    process.exit(1);
}

// Configuration
const API_BASE = process.env.REACT_APP_API || 'http://localhost:5001';
const TEST_EMAIL = 'test@example.com';
const TEST_CLASS = 'Test Yoga Class';
const TEST_DATE = '2024-12-31';

// Test scenarios
const testScenarios = [
    {
        name: 'Valid New Student Signup',
        data: {
            name: 'Test User',
            email: 'newuser@test.com',
            phone: '555-123-4567',
            classTitle: TEST_CLASS,
            date: TEST_DATE,
            signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            recaptchaToken: 'bypass'
        },
        expectedStatus: 200
    },
    {
        name: 'Invalid Email Format',
        data: {
            name: 'Test User',
            email: 'invalid-email',
            phone: '555-123-4567',
            classTitle: TEST_CLASS,
            date: TEST_DATE,
            signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            recaptchaToken: 'bypass'
        },
        expectedStatus: 400
    },
    {
        name: 'Missing Required Fields',
        data: {
            name: '',
            email: 'test@test.com',
            phone: '555-123-4567',
            classTitle: TEST_CLASS,
            date: TEST_DATE,
            signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            recaptchaToken: 'bypass'
        },
        expectedStatus: 400
    },
    {
        name: 'Missing Signature',
        data: {
            name: 'Test User',
            email: 'test@test.com',
            phone: '555-123-4567',
            classTitle: TEST_CLASS,
            date: TEST_DATE,
            signature: '',
            recaptchaToken: 'bypass'
        },
        expectedStatus: 400
    },
    {
        name: 'Returning Student Check',
        data: {
            email: TEST_EMAIL,
            classTitle: TEST_CLASS,
            date: TEST_DATE
        },
        endpoint: '/api/check-student',
        method: 'POST',
        expectedStatus: 200
    }
];

// Test function
async function runTests() {
    console.log('🧪 Starting Signup Tests...\n');
    
    let passed = 0;
    let failed = 0;
    
    for (const test of testScenarios) {
        try {
            console.log(`Testing: ${test.name}`);
            
            const endpoint = test.endpoint || '/api/signup';
            const method = test.method || 'POST';
            
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(test.data)
            });
            
            const result = await response.json();
            
            if (response.status === test.expectedStatus) {
                console.log(`✅ PASS - Status: ${response.status}`);
                passed++;
            } else {
                console.log(`❌ FAIL - Expected: ${test.expectedStatus}, Got: ${response.status}`);
                console.log(`   Response:`, result);
                failed++;
            }
            
        } catch (error) {
            console.log(`❌ ERROR - ${test.name}:`, error.message);
            failed++;
        }
        
        console.log(''); // Empty line for readability
    }
    
    console.log('📊 Test Results:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
}

// Run the tests
runTests().catch(console.error);
