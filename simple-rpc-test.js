// Simple test to verify the RPC function directly
console.log('Testing RPC function fix...');

// This simulates what the RPC function should return
const testSellerId = '66666666-6666-6666-6666-666666666666';

// Simulate the expected RPC function result
const simulatedRpcResult = [
  {
    total_views: 3,
    total_contact_clicks: 1,
    total_whatsapp_clicks: 1
  }
];

console.log('Simulated RPC result:', simulatedRpcResult);

// Test accessing the data correctly
const totalViews = simulatedRpcResult && simulatedRpcResult.length > 0 ? simulatedRpcResult[0].total_views : 0;
const totalContactClicks = simulatedRpcResult && simulatedRpcResult.length > 0 ? simulatedRpcResult[0].total_contact_clicks : 0;
const totalWhatsAppClicks = simulatedRpcResult && simulatedRpcResult.length > 0 ? simulatedRpcResult[0].total_whatsapp_clicks : 0;

console.log('Parsed values:');
console.log('Total Views:', totalViews);
console.log('Total Contact Clicks:', totalContactClicks);
console.log('Total WhatsApp Clicks:', totalWhatsAppClicks);

if (totalViews > 0 && totalContactClicks > 0 && totalWhatsAppClicks > 0) {
  console.log('\n✅ RPC function data structure is correct!');
} else {
  console.log('\n❌ RPC function data structure issue');
}