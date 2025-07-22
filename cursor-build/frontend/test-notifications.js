// Notification Permission UI Test Suite
// Run this in the browser console to test functionality

window.notificationTest = {
  // Test notification permission status
  checkPermission() {
    console.log('🔔 Testing Notification Permission Status...');
    console.log('Browser Support:', 'Notification' in window);
    console.log('Current Permission:', Notification.permission);
    
    if (!('Notification' in window)) {
      console.error('❌ Notifications not supported in this browser');
      return false;
    }
    
    switch (Notification.permission) {
      case 'granted':
        console.log('✅ Notifications are ENABLED');
        break;
      case 'denied':
        console.log('❌ Notifications are BLOCKED');
        break;
      case 'default':
        console.log('⚠️ Notifications need permission');
        break;
    }
    
    return true;
  },

  // Test notification banner visibility
  checkBannerVisibility() {
    console.log('\n🏷️ Testing NotificationBanner visibility...');
    
    if (Notification.permission === 'granted') {
      console.log('✅ Banner should be HIDDEN (notifications granted)');
    } else {
      console.log('👁️ Banner should be VISIBLE (notifications not granted)');
    }
    
    // Check if banner is dismissed
    const dismissed = localStorage.getItem('notificationBannerDismissed');
    if (dismissed) {
      console.log('📝 Banner was previously dismissed by user');
    }
  },

  // Test notification status card
  checkStatusCard() {
    console.log('\n📊 Testing NotificationStatusCard...');
    console.log('Should show permission status and appropriate actions');
    
    if (Notification.permission === 'granted') {
      console.log('✅ Should show green "Enabled" status with test button');
    } else if (Notification.permission === 'denied') {
      console.log('❌ Should show red "Blocked" status with instructions');
    } else {
      console.log('⚠️ Should show yellow "Not Set" status with enable button');
    }
  },

  // Test the alert modal integration
  checkAlertModalIntegration() {
    console.log('\n🚨 Testing AlertModal notification integration...');
    console.log('Alert modal should check permission before creating alerts');
    
    if (Notification.permission !== 'granted') {
      console.log('⚠️ Alert modal should show permission warning');
    } else {
      console.log('✅ Alert modal should allow alerts without warning');
    }
  },

  // Test notification functionality
  async testNotification() {
    console.log('\n🧪 Testing notification functionality...');
    
    if (!('Notification' in window)) {
      console.error('❌ Notifications not supported');
      return;
    }

    if (Notification.permission === 'granted') {
      console.log('✅ Sending test notification...');
      new Notification('🧪 Test Notification', {
        body: 'Notification system is working perfectly!',
        icon: '/favicon.ico',
        tag: 'test-notification'
      });
      console.log('✅ Test notification sent');
    } else if (Notification.permission === 'default') {
      console.log('⚠️ Requesting permission...');
      try {
        const permission = await Notification.requestPermission();
        console.log('Permission result:', permission);
        
        if (permission === 'granted') {
          new Notification('🎉 Permission Granted!', {
            body: 'You will now receive crypto alerts.',
            icon: '/favicon.ico',
            tag: 'permission-granted'
          });
        }
      } catch (error) {
        console.error('❌ Permission request failed:', error);
      }
    } else {
      console.log('❌ Notifications are blocked - cannot test');
    }
  },

  // Run complete test suite
  runFullTest() {
    console.log('🚀 Running Complete Notification UI Test Suite\n');
    console.log('='.repeat(50));
    
    this.checkPermission();
    this.checkBannerVisibility();
    this.checkStatusCard();
    this.checkAlertModalIntegration();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Test suite complete!');
    console.log('\n💡 To test notifications: notificationTest.testNotification()');
    console.log('💡 To reset banner: localStorage.removeItem("notificationBannerDismissed")');
  },

  // Reset all settings (for testing)
  reset() {
    console.log('🔄 Resetting notification test environment...');
    localStorage.removeItem('notificationBannerDismissed');
    console.log('✅ Local storage cleared');
    console.log('💡 Refresh the page to see changes');
  }
};

// Auto-run basic test on load
console.log('🔔 Notification Test Suite Loaded');
console.log('💡 Run: notificationTest.runFullTest()');
