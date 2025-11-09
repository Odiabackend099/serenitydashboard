const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('🌐 Navigating to dashboard...');
  await page.goto('https://srhbackend.odia.dev');
  await page.waitForLoadState('domcontentloaded');

  // Auto login
  console.log('🔑 Logging in...');
  await page.waitForSelector('input[type="email"]', { timeout: 5000 });
  await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'admin@example.com');
  await page.fill('input[type="password"]', process.env.TEST_PASSWORD || 'admin123');
  await page.click('button[type="submit"]');

  console.log('⏳ Waiting for page to load...');
  await page.waitForTimeout(5000);

  console.log('📸 Taking initial screenshot...');
  await page.screenshot({ path: 'step1-after-login.png', fullPage: true });

  // Try to find any conversation
  const conversations = await page.locator('li').filter({ hasText: 'patient-' }).all();
  console.log(`\n Found ${conversations.length} conversations`);

  if (conversations.length > 0) {
    console.log('\n🖱️  Clicking first conversation...');
    await conversations[0].click();

    console.log('⏳ Waiting 2 seconds...');
    await page.waitForTimeout(2000);

    console.log('📸 Taking screenshot after click...');
    await page.screenshot({ path: 'step2-after-click.png', fullPage: true });

    // Check what's on screen
    const pageInfo = await page.evaluate(() => {
      const header = document.querySelector('h1, h2, [class*="text-2xl"]');
      const messages = document.querySelectorAll('[class*="slideIn"]');

      return {
        headerText: header?.textContent,
        headerVisible: header ? window.getComputedStyle(header).display !== 'none' : false,
        headerTop: header?.getBoundingClientRect().top,
        messagesCount: messages.length,
        scrollY: window.scrollY,
        bodyHeight: document.body.scrollHeight
      };
    });

    console.log('\n📊 Page Information:');
    console.log(`   Header text: "${pageInfo.headerText}"`);
    console.log(`   Header visible: ${pageInfo.headerVisible}`);
    console.log(`   Header top: ${pageInfo.headerTop}px`);
    console.log(`   Messages: ${pageInfo.messagesCount}`);
    console.log(`   Scroll Y: ${pageInfo.scrollY}px`);
    console.log(`   Body height: ${pageInfo.bodyHeight}px`);

    if (pageInfo.headerTop && pageInfo.headerTop < 0) {
      console.log('\n⚠️  ISSUE FOUND: Header is scrolled above viewport (negative top position)!');
    } else if (pageInfo.headerTop && pageInfo.headerTop > 1080) {
      console.log('\n⚠️  ISSUE FOUND: Header is scrolled below viewport!');
    } else {
      console.log('\n✅ Header appears to be in viewport');
    }
  }

  console.log('\n⏱️  Browser will stay open for 30 seconds...');
  await page.waitForTimeout(30000);

  await browser.close();
  console.log('✅ Test complete!');
})();
