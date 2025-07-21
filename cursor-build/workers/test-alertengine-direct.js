// Direct test of our AlertEngine class
import { AlertEngine } from './durable-objects/AlertEngine.js';

console.log('Testing AlertEngine class directly...');

// Create a mock environment
const mockEnv = {
    LUNARCRUSH_API_KEY: 'test-key'
};

const mockState = {};

try {
    const alertEngine = new AlertEngine(mockState, mockEnv);
    console.log('✅ AlertEngine class can be instantiated');
    
    // Test the getStats method
    const stats = alertEngine.getStats();
    console.log('✅ getStats method works:', stats);
    
    if (stats.version === 'debug-v2.3') {
        console.log('✅ Correct debug version detected');
    } else {
        console.log('❌ Wrong version or old AlertEngine being used');
    }
    
} catch (error) {
    console.error('❌ AlertEngine test failed:', error);
}
