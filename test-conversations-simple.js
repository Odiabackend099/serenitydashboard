const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Navigating to conversations page directly...');
  await page.goto('https://srhbackend.odia.dev');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  console.log('Current URL:', page.url());

  // Listen to console messages
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  // Listen to network requests for messages
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/rest/v1/messages')) {
      console.log(`\nNETWORK: ${response.status()} ${url}`);
      try {
        const data = await response.json();
        console.log(`Messages received: ${Array.isArray(data) ? data.length : 'error'}`);
      } catch (e) {
        console.log('Could not parse response');
      }
    }
  });

  // Wait for conversations list
  console.log('Waiting for conversations...');
  await page.waitForSelector('text=Conversations', { timeout: 5000 });

  // Find and click first conversation
  const firstConv = await page.locator('li').filter({ hasText: 'patient-' }).first();
  const convExists = await firstConv.count();

  if (convExists > 0) {
    console.log('\n=== Clicking first conversation ===');
    await firstConv.click();

    // Wait for potential loading
    await page.waitForTimeout(3000);

    // Check what's displayed
    const loadingVisible = await page.locator('text=Loading messages').count();
    const noMessagesVisible = await page.locator('text=No messages yet').count();
    const messagesVisible = await page.locator('[class*="animate-slideIn"]').count();

    console.log('\n=== CONVERSATION STATE ===');
    console.log(`Loading spinner: ${loadingVisible > 0 ? 'YES' : 'NO'}`);
    console.log(`"No messages" text: ${noMessagesVisible > 0 ? 'YES' : 'NO'}`);
    console.log(`Messages count: ${messagesVisible}`);

    // Take screenshot
    await page.screenshot({ path: 'conversation-debug.png', fullPage: true });
    console.log('\nScreenshot saved: conversation-debug.png');
  } else {
    console.log('No conversations found!');
  }

  console.log('\nKeeping browser open for 20 seconds for inspection...');
  await page.waitForTimeout(20000);

  await browser.close();
  console.log('Test complete!');
})();
