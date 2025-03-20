const {Builder, By, Key, until} = require('selenium-webdriver');

(async function testScript() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.get('https://www.google.com');
    const title = await driver.getTitle();

    if (title.includes('Google')) {
      console.log('✅ Title verification passed');
    } else {
      console.log(`❌ Title verification failed. Got: ${title}`);
    }

  } catch (error) {
    console.error('❌ Test script error:', error);
  } finally {
    await driver.quit();
    console.log('🛑 Browser closed');
  }
})();
