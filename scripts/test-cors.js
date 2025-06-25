// Test script to verify CORS functionality for public endpoints
// Usage: node scripts/test-cors.js <your-domain> <siteId>

import fetch from 'node-fetch';

async function testCORS(baseUrl, siteId) {
  console.log('🧪 Testing CORS for public contact endpoint...');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Site ID: ${siteId}`);
  console.log('');

  // Test OPTIONS preflight request
  console.log('1. Testing OPTIONS preflight request...');
  try {
    const optionsResponse = await fetch(`${baseUrl}/api/public/sites/${siteId}/contact`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://example.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    console.log(`   Status: ${optionsResponse.status}`);
    console.log('   CORS Headers:');
    console.log(`   - Access-Control-Allow-Origin: ${optionsResponse.headers.get('Access-Control-Allow-Origin')}`);
    console.log(`   - Access-Control-Allow-Methods: ${optionsResponse.headers.get('Access-Control-Allow-Methods')}`);
    console.log(`   - Access-Control-Allow-Headers: ${optionsResponse.headers.get('Access-Control-Allow-Headers')}`);
    console.log(`   - Access-Control-Max-Age: ${optionsResponse.headers.get('Access-Control-Max-Age')}`);
    console.log('');
  } catch (error) {
    console.error('   ❌ OPTIONS request failed:', error.message);
    console.log('');
  }

  // Test actual POST request
  console.log('2. Testing POST request with CORS headers...');
  try {
    const postResponse = await fetch(`${baseUrl}/api/public/sites/${siteId}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://example.com'
      },
      body: JSON.stringify({
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          message: 'This is a CORS test message'
        }
      })
    });

    console.log(`   Status: ${postResponse.status}`);
    console.log('   CORS Headers:');
    console.log(`   - Access-Control-Allow-Origin: ${postResponse.headers.get('Access-Control-Allow-Origin')}`);
    console.log(`   - Access-Control-Allow-Methods: ${postResponse.headers.get('Access-Control-Allow-Methods')}`);
    console.log(`   - Access-Control-Allow-Headers: ${postResponse.headers.get('Access-Control-Allow-Headers')}`);
    
    const responseBody = await postResponse.text();
    console.log(`   Response: ${responseBody}`);
    console.log('');
  } catch (error) {
    console.error('   ❌ POST request failed:', error.message);
    console.log('');
  }

  console.log('✅ CORS test completed!');
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node scripts/test-cors.js <base-url> <site-id>');
  console.log('Example: node scripts/test-cors.js https://yourdomain.com site-123');
  process.exit(1);
}

const [baseUrl, siteId] = args;
testCORS(baseUrl, siteId).catch(console.error); 