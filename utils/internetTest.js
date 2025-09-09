// Internet Connection Test Utility
// ใช้สำหรับทดสอบการเชื่อมต่ออินเทอร์เน็ตแบบง่ายๆ

// เพิ่มฟังก์ชันตรวจสอบแบบเบา
export const quickInternetCheck = async () => {
    try {
      console.log('🌐 Quick internet check...');
      
      // ใช้ AbortController แทน AbortSignal.timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 วินาที
      
      const response = await fetch('https://httpbin.org/status/200', {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('✅ Quick internet check: SUCCESS');
        return true;
      } else {
        console.log('❌ Quick internet check: FAILED - Status:', response.status);
        return false;
      }
    } catch (error) {
      console.log('❌ Quick internet check: ERROR -', error.message);
      return false;
    }
  };
  
  export const simpleInternetTest = async () => {
    console.log('🧪 Starting simple internet test...');
    
    try {
      // ใช้ AbortController แทน AbortSignal.timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 วินาที
      
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('✅ Internet connection test: SUCCESS');
        return true;
      } else {
        console.log('❌ Internet connection test: FAILED - Status:', response.status);
        return false;
      }
    } catch (error) {
      console.log('❌ Internet connection test: ERROR -', error.message);
      return false;
    }
  };
  
  export const testMultipleUrls = async () => {
    const testUrls = [
      'https://httpbin.org/status/200',
      'https://jsonplaceholder.typicode.com/posts/1',
      'https://api.github.com/zen'
    ];
    
    console.log('🧪 Testing multiple URLs...');
    
    for (const url of testUrls) {
      try {
        console.log(`🔍 Testing: ${url}`);
        
        // ใช้ AbortController แทน AbortSignal.timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 วินาที
        
        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`✅ ${url}: SUCCESS (${response.status})`);
          return { success: true, workingUrl: url };
        } else {
          console.log(`⚠️ ${url}: Status ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${url}: ${error.message}`);
      }
    }
    
    console.log('❌ All URLs failed');
    return { success: false, workingUrl: null };
  };
  
  export const checkNetworkStatus = () => {
    if (typeof navigator !== 'undefined') {
      return {
        onLine: navigator.onLine,
        userAgent: navigator.userAgent,
        platform: navigator.platform
      };
    }
    return { onLine: true, userAgent: 'Unknown', platform: 'Unknown' };
  };
  
  // ฟังก์ชันสำหรับทดสอบใน Console
  export const runInternetDiagnostics = async () => {
    console.log('🔍 Running Internet Diagnostics...');
    
    // ตรวจสอบ Network Status
    const networkStatus = checkNetworkStatus();
    console.log('📱 Network Status:', networkStatus);
    
    // ทดสอบการเชื่อมต่อแบบง่าย
    const simpleTest = await simpleInternetTest();
    console.log('🌐 Simple Test Result:', simpleTest);
    
    // ทดสอบหลาย URL
    const multiTest = await testMultipleUrls();
    console.log('🔗 Multi-URL Test Result:', multiTest);
    
    // สรุปผล
    if (simpleTest || multiTest.success) {
      console.log('✅ Internet connection is working');
    } else {
      console.log('❌ Internet connection is not working');
    }
    
    return {
      networkStatus,
      simpleTest,
      multiTest,
      overallStatus: simpleTest || multiTest.success
    };
  };
  