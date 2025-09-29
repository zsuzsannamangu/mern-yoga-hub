/**
 * Test fetch functionality in production
 */

// Test the same fetch logic used in the server
let fetch;
try {
    fetch = require('node-fetch');
    console.log('✅ node-fetch loaded successfully');
} catch (error) {
    console.log('❌ node-fetch failed:', error.message);
    
    if (typeof globalThis.fetch !== 'undefined') {
        fetch = globalThis.fetch;
        console.log('✅ Using built-in fetch');
    } else {
        console.log('❌ No fetch available');
        fetch = null;
    }
}

// Test fetch functionality
async function testFetch() {
    if (!fetch) {
        console.log('❌ No fetch function available');
        return;
    }
    
    try {
        const response = await fetch('https://httpbin.org/get');
        const data = await response.json();
        console.log('✅ Fetch test successful:', data.url);
    } catch (error) {
        console.log('❌ Fetch test failed:', error.message);
    }
}

testFetch();
