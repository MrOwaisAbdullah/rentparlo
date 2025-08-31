// Simple script to manually insert test analytics events
console.log('Creating manual analytics test...');

// This is just to verify the structure of the analytics event
const testEvent = {
  event_type: 'view',
  user_id: '00000000-0000-0000-0000-000000000000',
  listing_id: null,
  metadata: { page: 'seller_profile', username: 'testuser', test: true },
  created_at: new Date().toISOString()
};

console.log('Test event structure:', testEvent);

// Test the analytics counting logic
const testAnalyticsCounting = () => {
  // Simulate what the RPC function does
  const events = [
    { event_type: 'view' },
    { event_type: 'view' },
    { event_type: 'view' },
    { event_type: 'contact_click' },
    { event_type: 'contact_click' },
    { event_type: 'WhatsApp_click' }
  ];
  
  const total_views = events.filter(e => e.event_type === 'view').length;
  const total_contact_clicks = events.filter(e => e.event_type === 'contact_click').length;
  const total_whatsapp_clicks = events.filter(e => e.event_type === 'WhatsApp_click').length;
  
  console.log('Simulated RPC function results:');
  console.log('Total views:', total_views);
  console.log('Total contact clicks:', total_contact_clicks);
  console.log('Total WhatsApp clicks:', total_whatsapp_clicks);
};

testAnalyticsCounting();

console.log('Manual test completed.');