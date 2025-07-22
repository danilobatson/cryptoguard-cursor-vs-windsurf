try {
  console.log('✅ Testing component imports...')

  // Test alert store import
  import('./src/stores/useAlertStore.js').then(() => {
    console.log('✅ useAlertStore imports successfully')
  }).catch(err => {
    console.log('❌ useAlertStore import failed:', err.message)
  })

  // Test alert modal import
  import('./src/components/alerts/AlertModal.jsx').then(() => {
    console.log('✅ AlertModal imports successfully')
  }).catch(err => {
    console.log('❌ AlertModal import failed:', err.message)
  })

  // Test alerts list import
  import('./src/components/alerts/AlertsList.jsx').then(() => {
    console.log('✅ AlertsList imports successfully')
  }).catch(err => {
    console.log('❌ AlertsList import failed:', err.message)
  })

} catch (error) {
  console.log('❌ Import test failed:', error.message)
}
