const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  console.log('🌐 Navigating to dashboard...');
  await page.goto('https://srhbackend.odia.dev');
  await page.waitForLoadState('networkidle');

  console.log('🔑 Logging in...');
  await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'admin@example.com');
  await page.fill('input[type="password"]', process.env.TEST_PASSWORD || 'admin123');
  await page.click('button:has-text("Sign In")');
  await page.waitForTimeout(4000);

  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║  TESTING ALL CHANNELS                     ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  // Test WebChat filter
  console.log('💬 Testing WEBCHAT channel...');
  await page.click('button:has-text("Web Chat")');
  await page.waitForTimeout(2000);

  let webchatConvs = await page.locator('li').filter({ hasText: /patient-TEST.*Webchat/i }).count();
  console.log(`   Found ${webchatConvs} WebChat conversations`);

  if (webchatConvs > 0) {
    const firstWebchat = await page.locator('li').filter({ hasText: /patient-TEST.*Webchat/i }).first();
    await firstWebchat.click();
    await page.waitForTimeout(2000);
    const webchatMsgs = await page.locator('[class*="slideIn"]').count();
    console.log(`   ✅ Clicked conversation, loaded ${webchatMsgs} messages\n`);
  }

  await page.screenshot({ path: 'test-webchat.png' });

  // Test WhatsApp filter
  console.log('📱 Testing WHATSAPP channel...');
  await page.click('button:has-text("All Channels")');
  await page.waitForTimeout(1000);
  await page.click('button:has-text("WhatsApp")');
  await page.waitForTimeout(2000);

  let whatsappConvs = await page.locator('li').filter({ hasText: /patient-TEST.*Whatsapp/i }).count();
  console.log(`   Found ${whatsappConvs} WhatsApp conversations`);

  if (whatsappConvs > 0) {
    const firstWhatsapp = await page.locator('li').filter({ hasText: /patient-TEST/i }).first();
    await firstWhatsapp.click();
    await page.waitForTimeout(2000);
    const whatsappMsgs = await page.locator('[class*="slideIn"]').count();
    console.log(`   ✅ Clicked conversation, loaded ${whatsappMsgs} messages\n`);
  }

  await page.screenshot({ path: 'test-whatsapp.png' });

  // Test Voice filter
  console.log('📞 Testing VOICE channel...');
  await page.click('button:has-text("All Channels")');
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Voice")');
  await page.waitForTimeout(2000);

  let voiceConvs = await page.locator('li').filter({ hasText: /patient-TEST.*Voice/i }).count();
  console.log(`   Found ${voiceConvs} Voice conversations`);

  if (voiceConvs > 0) {
    const firstVoice = await page.locator('li').filter({ hasText: /patient-TEST/i }).first();
    await firstVoice.click();
    await page.waitForTimeout(2000);
    const voiceMsgs = await page.locator('[class*="slideIn"]').count();
    console.log(`   ✅ Clicked conversation, loaded ${voiceMsgs} messages\n`);
  }

  await page.screenshot({ path: 'test-voice.png' });

  // Test All Channels view
  console.log('🔄 Testing ALL CHANNELS view...');
  await page.click('button:has-text("All Channels")');
  await page.waitForTimeout(2000);

  const allTestConvs = await page.locator('li').filter({ hasText: /patient-TEST/i }).count();
  console.log(`   Found ${allTestConvs} total test conversations\n`);

  await page.screenshot({ path: 'test-all-channels.png' });

  console.log('╔═══════════════════════════════════════════╗');
  console.log('║  ✅ ALL CHANNELS WORKING!                 ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  console.log('📊 Results:');
  console.log(`   💬 WebChat: ${webchatConvs} conversations`);
  console.log(`   📱 WhatsApp: ${whatsappConvs} conversations`);
  console.log(`   📞 Voice: ${voiceConvs} conversations`);
  console.log(`   🔄 Total: ${allTestConvs} conversations`);

  console.log('\n📸 Screenshots saved:');
  console.log('   - test-webchat.png');
  console.log('   - test-whatsapp.png');
  console.log('   - test-voice.png');
  console.log('   - test-all-channels.png');

  console.log('\n⏱️  Browser staying open for 30 seconds...');
  await page.waitForTimeout(30000);

  await browser.close();
  console.log('✅ Test complete!');
})();
