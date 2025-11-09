const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('🌐 Loading dashboard...');
  await page.goto('https://srhbackend.odia.dev');
  await page.waitForLoadState('networkidle');

  console.log('🔑 Logging in...');
  await page.fill('input[type="email"]', '');
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button:has-text("Sign In")');

  await page.waitForTimeout(5000);

  console.log('📸 Screenshot: Initial page load');
  await page.screenshot({ path: 'layout-step1-initial.png', fullPage: false });

  // Get layout info
  const beforeClick = await page.evaluate(() => {
    const mainContainer = document.querySelector('[class*="h-screen"]');
    const grid = document.querySelector('[class*="grid-cols-3"]');
    const leftPanel = document.querySelector('[class*="col-span-1"]');
    const rightPanel = document.querySelector('[class*="col-span-2"]');

    return {
      mainContainer: {
        className: mainContainer?.className,
        height: mainContainer?.offsetHeight,
        scrollHeight: mainContainer?.scrollHeight
      },
      grid: {
        className: grid?.className,
        height: grid?.offsetHeight,
        display: grid ? window.getComputedStyle(grid).display : null
      },
      leftPanel: {
        exists: !!leftPanel,
        height: leftPanel?.offsetHeight,
        width: leftPanel?.offsetWidth
      },
      rightPanel: {
        exists: !!rightPanel,
        height: rightPanel?.offsetHeight,
        width: rightPanel?.offsetWidth,
        innerHTML: rightPanel?.innerHTML?.substring(0, 200)
      }
    };
  });

  console.log('\n📊 Layout BEFORE clicking conversation:');
  console.log('Main container height:', beforeClick.mainContainer.height);
  console.log('Grid height:', beforeClick.grid.height);
  console.log('Left panel:', beforeClick.leftPanel.exists ? `${beforeClick.leftPanel.width}x${beforeClick.leftPanel.height}` : 'NOT FOUND');
  console.log('Right panel:', beforeClick.rightPanel.exists ? `${beforeClick.rightPanel.width}x${beforeClick.rightPanel.height}` : 'NOT FOUND');

  // Find and click test conversation
  const testConv = await page.locator('li').filter({ hasText: 'patient-TEST' }).first();
  const found = await testConv.count();

  if (found > 0) {
    console.log('\n🖱️  Clicking test conversation...');
    await testConv.click();

    await page.waitForTimeout(4000);

    console.log('📸 Screenshot: After clicking conversation');
    await page.screenshot({ path: 'layout-step2-after-click.png', fullPage: false });

    const afterClick = await page.evaluate(() => {
      const rightPanel = document.querySelector('[class*="col-span-2"]');
      const header = rightPanel?.querySelector('[class*="border-b"]');
      const messagesArea = rightPanel?.querySelector('[class*="flex-1"]');
      const messages = messagesArea?.querySelectorAll('[class*="slideIn"]');
      const loadingSpinner = messagesArea?.querySelector('[class*="animate-spin"]');
      const noMessagesText = messagesArea?.textContent?.includes('No messages');

      return {
        rightPanel: {
          exists: !!rightPanel,
          height: rightPanel?.offsetHeight,
          width: rightPanel?.offsetWidth,
          display: rightPanel ? window.getComputedStyle(rightPanel).display : null,
          visibility: rightPanel ? window.getComputedStyle(rightPanel).visibility : null
        },
        header: {
          exists: !!header,
          height: header?.offsetHeight,
          text: header?.textContent?.substring(0, 100)
        },
        messagesArea: {
          exists: !!messagesArea,
          height: messagesArea?.offsetHeight,
          scrollHeight: messagesArea?.scrollHeight,
          overflow: messagesArea ? window.getComputedStyle(messagesArea).overflow : null
        },
        content: {
          messagesCount: messages?.length || 0,
          hasLoadingSpinner: !!loadingSpinner,
          hasNoMessagesText: !!noMessagesText
        }
      };
    });

    console.log('\n📊 Layout AFTER clicking conversation:');
    console.log('\n📦 Right Panel:');
    console.log('  Exists:', afterClick.rightPanel.exists ? '✅' : '❌');
    console.log('  Size:', `${afterClick.rightPanel.width}x${afterClick.rightPanel.height}px`);
    console.log('  Display:', afterClick.rightPanel.display);
    console.log('  Visibility:', afterClick.rightPanel.visibility);

    console.log('\n📋 Header:');
    console.log('  Exists:', afterClick.header.exists ? '✅' : '❌');
    console.log('  Height:', afterClick.header.height + 'px');
    console.log('  Text:', `"${afterClick.header.text}"`);

    console.log('\n💬 Messages Area:');
    console.log('  Exists:', afterClick.messagesArea.exists ? '✅' : '❌');
    console.log('  Height:', afterClick.messagesArea.height + 'px');
    console.log('  Scroll height:', afterClick.messagesArea.scrollHeight + 'px');
    console.log('  Overflow:', afterClick.messagesArea.overflow);

    console.log('\n📝 Content:');
    console.log('  Messages count:', afterClick.content.messagesCount);
    console.log('  Loading spinner:', afterClick.content.hasLoadingSpinner ? '✅ YES' : '❌ NO');
    console.log('  "No messages" text:', afterClick.content.hasNoMessagesText ? '✅ YES' : '❌ NO');

    // Diagnose the issue
    console.log('\n🔍 DIAGNOSIS:');
    if (!afterClick.rightPanel.exists) {
      console.log('❌ RIGHT PANEL NOT FOUND - Major layout issue!');
    } else if (afterClick.rightPanel.height === 0) {
      console.log('❌ RIGHT PANEL HAS ZERO HEIGHT!');
    } else if (!afterClick.header.exists) {
      console.log('❌ HEADER NOT RENDERING IN RIGHT PANEL!');
    } else if (afterClick.content.messagesCount === 0 && !afterClick.content.hasLoadingSpinner && !afterClick.content.hasNoMessagesText) {
      console.log('❌ MESSAGES AREA IS EMPTY - No content rendering!');
    } else {
      console.log('✅ Layout appears correct');
    }
  }

  console.log('\n⏱️  Browser open for 30 seconds...');
  await page.waitForTimeout(30000);

  await browser.close();
  console.log('✅ Complete!');
})();
