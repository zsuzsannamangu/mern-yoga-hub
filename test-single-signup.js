/**
 * Test single signup to debug reCAPTCHA issue
 */

const http = require('http');
const { URL } = require('url');

function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || 80,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const req = http.request(requestOptions, (res) => {
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

async function testSignup() {
    console.log('Testing signup with bypass token...');
    
    const testData = {
        name: 'Test User',
        email: 'debug@test.com',
        phone: '555-123-4567',
        classTitle: 'Yoga for Wheelchair Yogis (60 min)',
        date: '2025-09-13',
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        recaptchaToken: 'bypass'
    };
    
    try {
        const response = await makeRequest('http://localhost:5001/api/signup', {
            method: 'POST',
            body: JSON.stringify(testData)
        });
        
        console.log('Status:', response.status);
        console.log('Response:', response.body);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testSignup();
