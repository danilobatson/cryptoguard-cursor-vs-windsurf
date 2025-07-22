// Test script to verify backend API works
async function testBackendAPI() {
  console.log('🧪 Testing Backend API for LunarCrush data...')
  
  const baseUrl = 'http://localhost:8787' // Local Wrangler dev server
  
  const symbols = ['bitcoin', 'ethereum']
  
  for (const symbol of symbols) {
    try {
      console.log(`\n📡 Testing ${symbol}...`)
      
      const response = await fetch(`${baseUrl}/crypto/${symbol}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ ${symbol}:`, {
          price: data.data?.price,
          source: data.data?.source,
          success: data.success
        })
      } else {
        console.log(`❌ ${symbol} failed:`, response.status, response.statusText)
      }
    } catch (error) {
      console.log(`❌ ${symbol} error:`, error.message)
    }
  }
}

// Run the test
testBackendAPI()
