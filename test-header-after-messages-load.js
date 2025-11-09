const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('🌐 Navigating to dashboard...');
  await page.goto('https://srhbackend.odia.dev');
  await page.waitForLoadState('networkidle');

  console.log('🔑 Logging in...');
  await page.waitForSelector('input[type="email"]', { timeout: 5000 });
  await page.fill('input[type="email"]', '');
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button:has-text("Sign In")');

  console.log('⏳ Waiting for conversations page...');
  await page.waitForTimeout(4000);

  // Find a test conversation
  console.log('🔍 Looking for test conversations...');
  const testConv = await page.locator('li').filter({ hasText: 'patient-TEST' }).first();
  const exists = await testConv.count();

  if (exists > 0) {
    console.log('✅ Found test conversation\n');

    // Take screenshot before click
    console.log('📸 Before clicking...');
    await page.screenshot({ path: 'header-before-click.png', fullPage: true });

    const headerBefore = await page.evaluate(() => {
      const header = document.querySelector('h1, h2');
      return {
        found: !!header,
        text: header?.textContent,
        top: header?.getBoundingClientRect().top,
        visible: header ? (header.getBoundingClientRect().top >= 0 && header.getBoundingClientRect().top <= window.innerHeight) : false
      };
    });

    console.log('   Header before: ' + (headerBefore.visible ? '✅ VISIBLE' : '❌ NOT VISIBLE'));
    console.log(`   Position: ${headerBefore.top}px\n`);

    // Click conversation
    console.log('🖱️  Clicking conversation...');
    await testConv.click();

    console.log('⏳ Waiting for loading to start...');
    await page.waitForTimeout(1000);

    // Wait for loading to finish
    console.log('⏳ Waiting for messages to load...');
    await page.waitForSelector('text=Loading messages', { state: 'hidden', timeout: 10000 }).catch(() => {
      console.log('   Loading text still visible or not found');
    });

    await page.waitForTimeout(2000);

    console.log('📸 After messages loaded...');
    await page.screenshot({ path: 'header-after-messages-loaded.png', fullPage: true });

    const headerAfter = await page.evaluate(() => {
      const header = document.querySelector('h1, h2');
      const messagesContainer = document.querySelector('[class*="overflow"]');

      return {
        header: {
          found: !!header,
          text: header?.textContent,
          top: header?.getBoundingClientRect().top,
          bottom: header?.getBoundingClientRect().bottom,
          visible: header ? (header.getBoundingClientRect().top >= 0 && header.getBoundingClientRect().top <= window.innerHeight) : false
        },
        messages: {
          count: document.querySelectorAll('[class*="slideIn"]').length
        },
        scroll: {
          windowScrollY: window.scrollY,
          bodyScrollTop: document.documentElement.scrollTop,
          containerScrollTop: messagesContainer?.scrollTop || 0
        },
        viewport: {
          height: window.innerHeight
        }
      };
    });

    console.log('\n╔═══════════════════════════════════════╗');
    console.log('║    HEADER STATUS AFTER LOAD           ║');
    console.log('╚═══════════════════════════════════════╝\n');

    console.log('📋 Header:');
    console.log(`   Found: ${headerAfter.header.found ? '✅' : '❌'}`);
    console.log(`   Text: "${headerAfter.header.text}"`);
    console.log(`   Top: ${headerAfter.header.top}px`);
    console.log(`   Bottom: ${headerAfter.header.bottom}px`);
    console.log(`   Visible in viewport: ${headerAfter.header.visible ? '✅ YES' : '❌ NO'}`);

    console.log('\n💬 Messages:');
    console.log(`   Count: ${headerAfter.messages.count}`);

    console.log('\n📜 Scroll:');
    console.log(`   Window scroll Y: ${headerAfter.scroll.windowScrollY}px`);
    console.log(`   Body scroll top: ${headerAfter.scroll.bodyScrollTop}px`);
    console.log(`   Container scroll top: ${headerAfter.scroll.containerScrollTop}px`);

    console.log('\n🖥️  Viewport:');
    console.log(`   Height: ${headerAfter.viewport.height}px`);

    if (!headerAfter.header.visible) {
      console.log('\n❌ ISSUE CONFIRMED: Header is NOT visible after messages load!');
      if (headerAfter.header.top < 0) {
        console.log('   → Header is scrolled ABOVE viewport (negative top)');
      } else if (headerAfter.header.top > headerAfter.viewport.height) {
        console.log('   → Header is scrolled BELOW viewport');
      }
    } else {
      console.log('\n✅ Header is visible');
    }

    // Scroll to top and check again
    console.log('\n🔝 Scrolling to top...');
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      const container = document.querySelector('[class*="overflow-auto"]');
      if (container) container.scrollTop = 0;
    });

    await page.waitForTimeout(1000);

    console.log('📸 After scroll to top...');
    await page.screenshot({ path: 'header-after-scroll-top.png', fullPage: true });

    const headerAfterScroll = await page.evaluate(() => {
      const header = document.querySelector('h1, h2');
      return {
        top: header?.getBoundingClientRect().top,
        visible: header ? (header.getBoundingClientRect().top >= 0 && header.getBoundingClientRect().top <= window.innerHeight) : false
      };
    });

    console.log(`   Header visible after scroll: ${headerAfterScroll.visible ? '✅ YES' : '❌ NO'}`);
    console.log(`   Position: ${headerAfterScroll.top}px`);

  } else {
    console.log('❌ No test conversations found');
  }

  console.log('\n⏱️  Browser open for 30 seconds...');
  await page.waitForTimeout(30000);

  await browser.close();
  console.log('✅ Done!');
})();
