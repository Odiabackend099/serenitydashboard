const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });

  // Test at mobile viewport (400px width as shown in screenshot)
  const context = await browser.newContext({
    viewport: { width: 400, height: 725 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();

  console.log('📱 Testing Mobile Responsive Design at 400px width\n');
  console.log('🌐 Navigating to dashboard...');
  await page.goto('https://srhbackend.odia.dev');
  await page.waitForLoadState('networkidle');

  console.log('🔑 Logging in...');
  await page.waitForSelector('input[type="email"]');

  // Clear and fill email
  await page.fill('input[type="email"]', '');
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button:has-text("Sign In")');

  console.log('⏳ Waiting for dashboard to load...');
  await page.waitForTimeout(6000);

  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║  MOBILE VIEW TEST (400px)                 ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  // Test 1: Conversations List View
  console.log('📋 TEST 1: Conversations List View');
  await page.waitForTimeout(2000);

  // Check if filters are visible and not overlapping
  const filtersVisible = await page.locator('text=Status:').isVisible();
  const channelFiltersVisible = await page.locator('text=Channel:').isVisible();
  console.log(`   Filters visible: ${filtersVisible ? '✅' : '❌'}`);
  console.log(`   Channel filters visible: ${channelFiltersVisible ? '✅' : '❌'}`);

  // Take screenshot of list view
  await page.screenshot({ path: 'mobile-list-view.png', fullPage: true });
  console.log('   📸 Screenshot: mobile-list-view.png\n');

  // Check conversation list
  const conversations = await page.locator('li').filter({ hasText: /patient-TEST/i }).count();
  console.log(`   Conversations visible: ${conversations}`);

  // Test 2: Click on a conversation
  console.log('\n💬 TEST 2: Message View');
  const firstConv = await page.locator('li').filter({ hasText: /patient-TEST/i }).first();
  await firstConv.click();
  await page.waitForTimeout(2000);

  // Check if conversation list is hidden on mobile
  const listHidden = await page.locator('text=Conversations').count() === 0 ||
                     !(await page.locator('text=Conversations').first().isVisible());
  console.log(`   Conversation list hidden: ${listHidden ? '✅ YES (correct)' : '❌ NO (should be hidden)'}`);

  // Check if back button exists
  const backButtonExists = await page.locator('button[title="Back to conversations"]').count() > 0;
  console.log(`   Back button visible: ${backButtonExists ? '✅ YES' : '❌ NO'}`);

  // Check if messages are displayed
  const messagesCount = await page.locator('[class*="slideIn"]').count();
  console.log(`   Messages displayed: ${messagesCount}`);

  // Take screenshot of message view
  await page.screenshot({ path: 'mobile-message-view.png', fullPage: true });
  console.log('   📸 Screenshot: mobile-message-view.png\n');

  // Test 3: Test message bubbles responsiveness
  console.log('💭 TEST 3: Message Bubbles');

  const messageInfo = await page.evaluate(() => {
    const messages = document.querySelectorAll('[class*="slideIn"]');
    const viewportWidth = window.innerWidth;

    let maxWidth = 0;
    let overflow = false;

    messages.forEach(msg => {
      const rect = msg.getBoundingClientRect();
      if (rect.width > maxWidth) maxWidth = rect.width;
      if (rect.right > viewportWidth) overflow = true;
    });

    return {
      viewportWidth,
      maxMessageWidth: maxWidth,
      hasOverflow: overflow,
      messageCount: messages.length
    };
  });

  console.log(`   Viewport width: ${messageInfo.viewportWidth}px`);
  console.log(`   Max message width: ${messageInfo.maxMessageWidth.toFixed(0)}px`);
  console.log(`   Messages overflow viewport: ${messageInfo.hasOverflow ? '❌ YES (bad)' : '✅ NO (good)'}`);

  // Test 4: Test input field
  console.log('\n⌨️  TEST 4: Message Input');

  const inputInfo = await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="message"]');
    const sendButton = document.querySelector('button[title="Send message"]');

    return {
      inputExists: !!input,
      inputWidth: input?.offsetWidth || 0,
      sendButtonExists: !!sendButton,
      sendButtonWidth: sendButton?.offsetWidth || 0,
      sendButtonText: sendButton?.textContent?.trim() || ''
    };
  });

  console.log(`   Input field exists: ${inputInfo.inputExists ? '✅' : '❌'}`);
  console.log(`   Input width: ${inputInfo.inputWidth}px`);
  console.log(`   Send button exists: ${inputInfo.sendButtonExists ? '✅' : '❌'}`);
  console.log(`   Send button text: "${inputInfo.sendButtonText}" ${inputInfo.sendButtonText === '' ? '(icon only - good for mobile)' : ''}`);

  // Test 5: Back navigation
  console.log('\n◀️  TEST 5: Back Navigation');

  if (backButtonExists) {
    await page.click('button[title="Back to conversations"]');
    await page.waitForTimeout(1000);

    const listVisibleAgain = await page.locator('text=Conversations').first().isVisible();
    const messagesHidden = await page.locator('[class*="slideIn"]').count() === 0 ||
                          !(await page.locator('[class*="slideIn"]').first().isVisible().catch(() => false));

    console.log(`   Back to list successful: ${listVisibleAgain ? '✅' : '❌'}`);
    console.log(`   Messages panel hidden: ${messagesHidden ? '✅' : '❌'}`);

    await page.screenshot({ path: 'mobile-back-to-list.png', fullPage: true });
    console.log('   📸 Screenshot: mobile-back-to-list.png');
  }

  // Final Summary
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║  MOBILE RESPONSIVENESS SUMMARY            ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  const allTestsPassed =
    filtersVisible &&
    channelFiltersVisible &&
    conversations > 0 &&
    listHidden &&
    backButtonExists &&
    messagesCount > 0 &&
    !messageInfo.hasOverflow &&
    inputInfo.inputExists &&
    inputInfo.sendButtonExists;

  console.log(`Overall Status: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '⚠️  SOME ISSUES FOUND'}`);
  console.log('\n📸 Screenshots saved:');
  console.log('   - mobile-list-view.png');
  console.log('   - mobile-message-view.png');
  console.log('   - mobile-back-to-list.png');

  console.log('\n⏱️  Browser staying open for 30 seconds for inspection...');
  await page.waitForTimeout(30000);

  await browser.close();
  console.log('✅ Mobile test complete!');
})();
