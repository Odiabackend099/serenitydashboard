const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Opening dashboard...');
  await page.goto('https://srhbackend.odia.dev');
  await page.waitForLoadState('networkidle');

  console.log('\n⏸️  PAUSED - Please login manually in the browser window');
  console.log('After logging in and seeing the Conversations page, press Enter here...\n');

  // Wait for user to press Enter
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });

  console.log('\n✅ Continuing test...\n');

  // Listen to console
  page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));

  // Listen to network
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/rest/v1/messages')) {
      console.log(`\n📡 NETWORK: ${response.status()} GET /messages`);
      try {
        const data = await response.json();
        console.log(`   📨 Received ${Array.isArray(data) ? data.length : 0} messages`);
        if (Array.isArray(data) && data.length > 0) {
          console.log(`   First message: ${data[0].body?.substring(0, 50)}...`);
        }
      } catch (e) {}
    }
  });

  // Find first conversation
  console.log('Looking for conversations...');
  const convList = await page.locator('li').filter({ hasText: /patient-\d+/ }).all();
  console.log(`Found ${convList.length} conversations`);

  if (convList.length > 0) {
    console.log('\n🖱️  Clicking first conversation...');
    await convList[0].click();

    console.log('Waiting 3 seconds for messages to load...');
    await page.waitForTimeout(3000);

    // Check state
    const loading = await page.locator('text=Loading messages').count();
    const noMsg = await page.locator('text=No messages yet').count();
    const msgs = await page.locator('[class*="animate-slideIn"]').count();

    console.log('\n=== RESULTS ===');
    console.log(`⏳ Loading: ${loading > 0}`);
    console.log(`📭 No messages: ${noMsg > 0}`);
    console.log(`💬 Messages displayed: ${msgs}`);

    await page.screenshot({ path: 'final-state.png', fullPage: true });
    console.log('\n📸 Screenshot: final-state.png');
  }

  console.log('\nBrowser will stay open for 30 seconds for inspection...');
  await page.waitForTimeout(30000);

  await browser.close();
})();
