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

  // Auto login
  console.log('🔑 Logging in...');
  await page.waitForSelector('input[type="email"]', { timeout: 5000 });

  // Clear and fill email
  await page.fill('input[type="email"]', '');
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.fill('input[type="password"]', 'admin123');

  console.log('   Clicking Sign In button...');
  await page.click('button:has-text("Sign In")');

  console.log('⏳ Waiting for navigation after login...');
  await page.waitForURL('**/conversations', { timeout: 15000 }).catch(() => {
    console.log('   URL did not change to conversations, checking current page...');
  });

  await page.waitForTimeout(3000);

  console.log('📸 Screenshot 1: After login');
  await page.screenshot({ path: 'test-step1-logged-in.png', fullPage: true });

  // Check if we're logged in
  const currentURL = page.url();
  console.log(`   Current URL: ${currentURL}\n`);

  // Try to find conversations using multiple selectors
  console.log('🔍 Looking for conversations...');
  await page.waitForTimeout(2000);

  // Look for the conversation list items
  const conversations = await page.locator('li').all();
  console.log(`   Found ${conversations.length} total <li> elements`);

  // Filter for ones that look like conversations
  let foundConv = null;
  for (let i = 0; i < Math.min(conversations.length, 10); i++) {
    const text = await conversations[i].textContent();
    if (text && text.includes('patient-')) {
      foundConv = conversations[i];
      console.log(`   ✅ Found conversation: "${text.substring(0, 50)}..."`);
      break;
    }
  }

  if (foundConv) {
    console.log('\n🖱️  Clicking on conversation...');
    await foundConv.click();

    console.log('⏳ Waiting 3 seconds for messages to load...');
    await page.waitForTimeout(3000);

    console.log('📸 Screenshot 2: After clicking conversation');
    await page.screenshot({ path: 'test-step2-conversation-clicked.png', fullPage: true });

    // Analyze the page layout
    const layoutInfo = await page.evaluate(() => {
      // Find the header
      const headers = Array.from(document.querySelectorAll('h1, h2, [class*="text-2xl"], [class*="text-3xl"]'));
      const conversationsHeader = headers.find(h => h.textContent?.includes('Conversations'));

      // Find messages
      const messages = document.querySelectorAll('[class*="slideIn"], [class*="message"]');

      // Get main container
      const mainContainer = document.querySelector('main') || document.querySelector('[class*="h-screen"]');

      return {
        header: {
          found: !!conversationsHeader,
          text: conversationsHeader?.textContent,
          top: conversationsHeader?.getBoundingClientRect().top,
          visible: conversationsHeader ? window.getComputedStyle(conversationsHeader).display !== 'none' : false,
          inViewport: conversationsHeader ? (
            conversationsHeader.getBoundingClientRect().top >= 0 &&
            conversationsHeader.getBoundingClientRect().top <= window.innerHeight
          ) : false
        },
        messages: {
          count: messages.length
        },
        viewport: {
          scrollY: window.scrollY,
          innerHeight: window.innerHeight,
          scrollHeight: document.documentElement.scrollHeight
        },
        container: {
          className: mainContainer?.className,
          scrollTop: mainContainer?.scrollTop,
          scrollHeight: mainContainer?.scrollHeight,
          clientHeight: mainContainer?.clientHeight
        }
      };
    });

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║         LAYOUT ANALYSIS                ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('\n📋 Header:');
    console.log(`   Found: ${layoutInfo.header.found ? '✅' : '❌'}`);
    console.log(`   Text: "${layoutInfo.header.text}"`);
    console.log(`   Top position: ${layoutInfo.header.top}px`);
    console.log(`   Visible: ${layoutInfo.header.visible ? '✅' : '❌'}`);
    console.log(`   In viewport: ${layoutInfo.header.inViewport ? '✅' : '❌'}`);

    console.log('\n💬 Messages:');
    console.log(`   Count: ${layoutInfo.messages.count}`);

    console.log('\n🖥️  Viewport:');
    console.log(`   Scroll Y: ${layoutInfo.viewport.scrollY}px`);
    console.log(`   Height: ${layoutInfo.viewport.innerHeight}px`);
    console.log(`   Total scroll height: ${layoutInfo.viewport.scrollHeight}px`);

    console.log('\n📦 Container:');
    console.log(`   Class: ${layoutInfo.container.className}`);
    console.log(`   Scroll top: ${layoutInfo.container.scrollTop}px`);
    console.log(`   Client height: ${layoutInfo.container.clientHeight}px`);
    console.log(`   Scroll height: ${layoutInfo.container.scrollHeight}px`);

    if (layoutInfo.header.found && !layoutInfo.header.inViewport) {
      console.log('\n⚠️  ISSUE DETECTED: Header exists but is NOT in viewport!');
      if (layoutInfo.header.top < 0) {
        console.log('   → Header is scrolled ABOVE the viewport');
      } else {
        console.log('   → Header is scrolled BELOW the viewport');
      }
    } else if (layoutInfo.header.found && layoutInfo.header.inViewport) {
      console.log('\n✅ Header is visible and in viewport');
    } else {
      console.log('\n⚠️  Header not found on page');
    }
  } else {
    console.log('\n❌ No conversations found');
  }

  console.log('\n⏱️  Keeping browser open for 30 seconds for manual inspection...');
  await page.waitForTimeout(30000);

  await browser.close();
  console.log('✅ Test complete!');
})();
