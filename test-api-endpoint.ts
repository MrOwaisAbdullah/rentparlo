// Simple test to check if the API endpoint is accessible
async function testApiEndpoint() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    console.log(`Testing API endpoint at: ${baseUrl}/api/seller/minimal/batch`);
    
    // Test with a simple request
    const response = await fetch(`${baseUrl}/api/seller/minimal/batch?userId=test123`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response OK: ${response.ok}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
    } else {
      console.error(`Error response: ${response.status} - ${response.statusText}`);
      const text = await response.text();
      console.error('Error body:', text);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testApiEndpoint();