async function testApi() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    console.log('Testing API endpoint:', `${baseUrl}/api/seller/minimal/batch?userId=test-id`);
    
    // Try to fetch the API endpoint
    const response = await fetch(`${baseUrl}/api/seller/minimal/batch?userId=test-id`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', data);
    } else {
      console.error('API request failed with status:', response.status);
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testApi();