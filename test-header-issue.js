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
  await page.waitForTimeout(3000);

  console.log('✅ Continuing test...\n');

  // Wait for conversations to load
  console.log('🔍 Waiting for conversations list...');
  await page.waitForSelector('li[class*="cursor-pointer"]', { timeout: 10000 }).catch(() => {
    console.log('   Timeout waiting for conversations, continuing anyway...');
  });
  const convList = await page.locator('li[class*="cursor-pointer"]').all();
  console.log(`   Found ${convList.length} conversations\n`);

  if (convList.length > 0) {
    // Take screenshot BEFORE clicking
    console.log('📸 Screenshot 1: Before clicking conversation');
    await page.screenshot({ path: 'before-click.png', fullPage: true });

    // Check if header is visible
    const headerBefore = await page.locator('text=Conversations').first().isVisible();
    console.log(`   Header visible: ${headerBefore ? '✅ YES' : '❌ NO'}\n`);

    // Click first conversation
    console.log('🖱️  Clicking first conversation...');
    await convList[0].click();

    // Wait for messages to load
    await page.waitForTimeout(2000);

    // Take screenshot AFTER clicking
    console.log('📸 Screenshot 2: After clicking conversation');
    await page.screenshot({ path: 'after-click.png', fullPage: true });

    // Check if header is still visible
    const headerAfter = await page.locator('text=Conversations').first().isVisible();
    console.log(`   Header visible: ${headerAfter ? '✅ YES' : '❌ NO'}`);

    // Check if messages are visible
    const messagesCount = await page.locator('[class*="animate-slideIn"]').count();
    console.log(`   Messages displayed: ${messagesCount}\n`);

    // Get viewport and scroll info
    const scrollInfo = await page.evaluate(() => ({
      scrollY: window.scrollY,
      innerHeight: window.innerHeight,
      bodyScrollHeight: document.body.scrollHeight,
      headerTop: document.querySelector('h1')?.getBoundingClientRect().top
    }));

    console.log('📊 Scroll Information:');
    console.log(`   Window scroll Y: ${scrollInfo.scrollY}px`);
    console.log(`   Viewport height: ${scrollInfo.innerHeight}px`);
    console.log(`   Body scroll height: ${scrollInfo.bodyScrollHeight}px`);
    console.log(`   Header top position: ${scrollInfo.headerTop}px`);

    if (scrollInfo.headerTop < 0) {
      console.log('\n⚠️  PROBLEM: Header is scrolled off screen!');
    }

    // Wait a bit more and check again
    console.log('\n⏳ Waiting 3 more seconds...');
    await page.waitForTimeout(3000);

    console.log('📸 Screenshot 3: After waiting');
    await page.screenshot({ path: 'after-wait.png', fullPage: true });

    const headerFinal = await page.locator('text=Conversations').first().isVisible();
    console.log(`   Header visible: ${headerFinal ? '✅ YES' : '❌ NO'}\n`);

    // Get the container structure
    const containerInfo = await page.evaluate(() => {
      const mainContainer = document.querySelector('main') || document.querySelector('[class*="h-screen"]');
      return {
        mainClass: mainContainer?.className,
        mainHeight: mainContainer?.offsetHeight,
        mainScrollHeight: mainContainer?.scrollHeight,
        overflow: window.getComputedStyle(mainContainer).overflow
      };
    });

    console.log('📦 Container Information:');
    console.log(`   Main container class: ${containerInfo.mainClass}`);
    console.log(`   Container height: ${containerInfo.mainHeight}px`);
    console.log(`   Container scroll height: ${containerInfo.mainScrollHeight}px`);
    console.log(`   Overflow: ${containerInfo.overflow}`);
  }

  console.log('\n⏱️  Keeping browser open for 30 seconds for inspection...');
  await page.waitForTimeout(30000);

  await browser.close();
  console.log('✅ Test complete!');
})();
