const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Navigating to dashboard...');
  await page.goto('https://srhbackend.odia.dev');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Take screenshot of initial state
  await page.screenshot({ path: 'dashboard-initial.png' });
  console.log('Screenshot saved: dashboard-initial.png');

  // Check if we're on login page
  const loginForm = await page.locator('input[type="email"]').count();

  if (loginForm > 0) {
    console.log('Login page detected - please login manually');
    // Wait for manual login
    await page.waitForURL('**/conversations', { timeout: 120000 });
  }

  console.log('Waiting for conversations to load...');
  await page.waitForSelector('li[class*="cursor-pointer"]', { timeout: 10000 });

  // Get all conversations
  const conversations = await page.locator('li[class*="cursor-pointer"]').all();
  console.log(`Found ${conversations.length} conversations`);

  if (conversations.length > 0) {
    console.log('Clicking first conversation...');

    // Listen to console messages
    page.on('console', msg => console.log('BROWSER:', msg.text()));

    // Listen to network requests
    page.on('response', response => {
      if (response.url().includes('messages') || response.url().includes('conversations')) {
        console.log(`NETWORK: ${response.status()} ${response.url()}`);
      }
    });

    await conversations[0].click();

    // Wait a bit for messages to load
    await page.waitForTimeout(2000);

    // Take screenshot after clicking
    await page.screenshot({ path: 'conversation-clicked.png' });
    console.log('Screenshot saved: conversation-clicked.png');

    // Check if messages loaded
    const loadingSpinner = await page.locator('div:has-text("Loading messages")').count();
    const noMessages = await page.locator('p:has-text("No messages yet")').count();
    const messageCount = await page.locator('div[class*="animate-slideIn"]').count();

    console.log('\n=== RESULTS ===');
    console.log(`Loading spinner visible: ${loadingSpinner > 0}`);
    console.log(`"No messages" shown: ${noMessages > 0}`);
    console.log(`Messages loaded: ${messageCount}`);
  }

  console.log('\nKeeping browser open for 30 seconds...');
  await page.waitForTimeout(30000);

  await browser.close();
})();
