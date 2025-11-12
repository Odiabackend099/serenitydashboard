const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🌐 Navigating to dashboard...');
  await page.goto('https://srhbackend.odia.dev');
  await page.waitForLoadState('networkidle');

  // Auto login
  console.log('🔑 Logging in...');
  await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'admin@example.com');
  await page.fill('input[type="password"]', process.env.TEST_PASSWORD || 'admin123');
  await page.click('button[type="submit"]');

  console.log('⏳ Waiting for conversations page...');
  await page.waitForURL('**/conversations', { timeout: 10000 }).catch(() => {
    console.log('   Still loading...');
  });
  await page.waitForSelector('text=Conversations', { timeout: 10000 });

  console.log('✅ Logged in successfully!\n');

  // Listen to console
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Loading messages') || text.includes('Messages loaded') || text.includes('Error')) {
      console.log(`🖥️  BROWSER: ${text}`);
    }
  });

  // Listen to network
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/rest/v1/messages')) {
      console.log(`\n📡 NETWORK: ${response.status()} ${url.split('/rest/v1/')[1]}`);
      try {
        const data = await response.json();
        if (Array.isArray(data)) {
          console.log(`   ✉️  Received ${data.length} messages`);
          if (data.length > 0) {
            console.log(`   First: "${data[0].body?.substring(0, 60)}..."`);
          }
        }
      } catch (e) {
        console.log(`   ⚠️  Could not parse response`);
      }
    }
  });

  // Find conversations
  console.log('🔍 Looking for conversations...');
  await page.waitForSelector('li[class*="cursor-pointer"]', { timeout: 5000 });
  const convList = await page.locator('li[class*="cursor-pointer"]').all();
  console.log(`   Found ${convList.length} conversations\n`);

  if (convList.length > 0) {
    console.log('🖱️  Clicking first conversation...');
    await convList[0].click();

    console.log('⏳ Waiting 4 seconds for messages to load...\n');
    await page.waitForTimeout(4000);

    // Check state
    const loading = await page.locator('text=Loading messages').count();
    const noMsg = await page.locator('text=No messages yet').count();
    const msgs = await page.locator('[class*="animate-slideIn"]').count();

    console.log('\n╔════════════════════════════════╗');
    console.log('║       CONVERSATION STATE       ║');
    console.log('╚════════════════════════════════╝');
    console.log(`⏳ Loading spinner: ${loading > 0 ? '✅ YES' : '❌ NO'}`);
    console.log(`📭 "No messages" text: ${noMsg > 0 ? '✅ YES' : '❌ NO'}`);
    console.log(`💬 Messages displayed: ${msgs}`);

    await page.screenshot({ path: 'conversation-state.png', fullPage: true });
    console.log(`\n📸 Screenshot saved: conversation-state.png`);

    // Get the selected conversation ID
    const selectedConvId = await page.evaluate(() => {
      const selectedLi = document.querySelector('li[class*="border-l-healthcare-primary"]');
      return selectedLi?.textContent?.match(/patient-\d+/)?.[0] || 'unknown';
    });
    console.log(`📋 Selected conversation: ${selectedConvId}`);
  }

  console.log('\n⏱️  Keeping browser open for 30 seconds...');
  await page.waitForTimeout(30000);

  await browser.close();
  console.log('✅ Test complete!');
})();
