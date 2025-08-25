// Test to verify Redis connection fix
const { cacheManager, shutdownRedis } = require('../dist/lib/cache-redis.cjs');

async function testRedisConnections() {
  console.log('Testing Redis connection management...');
  
  // Create multiple cache manager instances to test connection reuse
  const managers = [];
  for (let i = 0; i < 5; i++) {
    // Create new instances of CacheManager
    const CacheManager = cacheManager.constructor;
    const manager = new CacheManager();
    managers.push(manager);
  }
  
  console.log(`Created ${managers.length} cache managers`);
  
  // Test setting and getting values
  const testKey = 'test-key';
  const testValue = { message: 'Hello Redis!', timestamp: Date.now() };
  
  try {
    // Set value using first manager
    await managers[0].set(testKey, testValue, { ttl: 60 });
    console.log('Successfully set test value');
    
    // Give some time for the operation to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get value using last manager
    const retrievedValue = await managers[managers.length - 1].get(testKey);
    console.log('Retrieved value:', retrievedValue);
    
    if (JSON.stringify(retrievedValue) === JSON.stringify(testValue)) {
      console.log('✓ Redis connection sharing working correctly');
    } else {
      console.log('✗ Redis connection sharing not working');
    }
    
    // Test cache stats
    const stats = managers[0].getCacheStats();
    console.log('Cache stats:', stats);
    
  } catch (error) {
    console.error('Error testing Redis connections:', error);
  } finally {
    // Clean up
    await shutdownRedis();
    console.log('Test completed and Redis connection closed');
  }
}

// Run the test
testRedisConnections().catch(console.error);