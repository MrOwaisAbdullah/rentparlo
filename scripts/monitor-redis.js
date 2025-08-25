// Simple script to monitor Redis connections
import Redis from 'ioredis';

// Get Redis URL from environment
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.log('REDIS_URL not set, skipping Redis monitoring');
  process.exit(0);
}

// Create Redis client for monitoring
const redis = new Redis(redisUrl);

redis.on('connect', () => {
  console.log('Monitor connected to Redis');
});

redis.on('error', (err) => {
  console.error('Monitor Redis error:', err);
});

// Function to get client list
async function getClientInfo() {
  try {
    const clientList = await redis.client('list');
    const clients = clientList.split('\n').filter(line => line.trim() !== '');
    console.log(`Current Redis connections: ${clients.length}`);
    
    // Show connection details
    clients.forEach((client, index) => {
      console.log(`Client ${index + 1}: ${client.substring(0, 100)}...`);
    });
    
    return clients.length;
  } catch (error) {
    console.error('Error getting client info:', error);
    return 0;
  }
}

// Monitor connections every 5 seconds
console.log('Starting Redis connection monitoring...');
console.log('Press Ctrl+C to stop');

let intervalId = setInterval(async () => {
  try {
    await getClientInfo();
  } catch (error) {
    console.error('Monitoring error:', error);
  }
}, 5000);

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down monitor...');
  clearInterval(intervalId);
  await redis.quit();
  console.log('Monitor shutdown complete');
  process.exit(0);
});