import { chromium } from 'playwright';

const BASE = 'https://generalbots.org';

const tests = [
  { name: 'homepage has hero badge', url: '/', check: 'data-i18n="hero.badge"' },
  { name: 'features page has features.hero.sub', url: '/features/', check: 'data-i18n="features.hero.sub"' },
  { name: 'integrations page has integrations.hero.sub', url: '/integrations/', check: 'data-i18n="integrations.hero.sub"' },
  { name: 'pricing page loads', url: '/pricing/', check: 'pricing' },
  { name: 'contact page loads', url: '/contact/', check: 'contact' },
];

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('=== 1. Page load tests ===');
  for (const t of tests) {
    await page.goto(BASE + t.url, { waitUntil: 'networkidle' });
    const html = await page.content();
    const ok = html.includes(t.check);
    console.log(`  ${ok ? '✅' : '❌'} ${t.name} (${t.url})`);
  }

  console.log('\n=== 2. Flag injection test ===');
  await page.goto(BASE + '/features/', { waitUntil: 'networkidle' });
  await page.waitForSelector('#lang-flags a', { timeout: 10000 });
  const flagCount = await page.locator('#lang-flags a').count();
  console.log(`  ${flagCount > 0 ? '✅' : '❌'} Flags injected: ${flagCount}`);

  console.log('\n=== 3. Language switch test: en → es ===');
  await page.goto(BASE + '/features/', { waitUntil: 'networkidle' });
  await page.waitForSelector('#lang-flags a', { timeout: 10000 });

  // Get English text before switching
  const enTextBefore = await page.locator('[data-i18n="features.hero.sub"]').textContent();
  console.log(`  EN text: "${enTextBefore}"`);

  // Click Spanish flag (index 2 = es)
  const flags = page.locator('#lang-flags a');
  await flags.nth(2).click();
  await page.waitForTimeout(2000);

  // Check Spanish text
  const esText = await page.locator('[data-i18n="features.hero.sub"]').textContent();
  const spanishDetected = esText !== enTextBefore;
  console.log(`  ${spanishDetected ? '✅' : '❌'} ES text: "${esText}"`);

  console.log('\n=== 4. Navigation persistence: /features/ → / → /features/ ===');
  // Navigate to homepage
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Navigate back to features
  await page.goto(BASE + '/features/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.waitForSelector('#lang-flags a', { timeout: 10000 });

  // Check if Spanish flag is still active (opacity 1)
  const esFlag = page.locator('#lang-flags a').nth(2);
  const esOpacity = await esFlag.evaluate(el => el.style.opacity);
  console.log(`  ${esOpacity === '1' ? '✅' : '❌'} Spanish flag highlighted (opacity: ${esOpacity})`);

  // Check text is still Spanish
  const esTextAfter = await page.locator('[data-i18n="features.hero.sub"]').textContent();
  const spanishStill = esTextAfter !== enTextBefore;
  console.log(`  ${spanishStill ? '✅' : '❌'} ES text after navigation: "${esTextAfter}"`);

  console.log('\n=== 5. Switch to Portuguese ===');
  await flags.nth(1).click(); // pt = index 1
  await page.waitForTimeout(2000);
  const ptText = await page.locator('[data-i18n="features.hero.sub"]').textContent();
  const ptDetected = ptText !== esTextAfter && ptText !== enTextBefore;
  console.log(`  ${ptDetected ? '✅' : '❌'} PT text: "${ptText}"`);

  console.log('\n=== 6. Switch back to English ===');
  await flags.nth(0).click(); // en = index 0
  await page.waitForTimeout(2000);
  const enTextAfter = await page.locator('[data-i18n="features.hero.sub"]').textContent();
  console.log(`  ${enTextAfter === enTextBefore ? '✅' : '❌'} EN text: "${enTextAfter}"`);

  await browser.close();

  const passed = spanishDetected && spanishStill && ptDetected && enTextAfter === enTextBefore && flagCount > 0;
  console.log(`\n${'='.repeat(50)}`);
  console.log(passed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
}

run().catch(e => { console.error('TEST ERROR:', e); process.exit(1); });
