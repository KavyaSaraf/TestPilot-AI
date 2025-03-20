const { Builder, By, Key, until } = require('selenium-webdriver');

(async function() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.get('https://www.google.com');

    let title = await driver.getTitle();
    console.log('Page title is:', title);

    if (title.includes('Google')) {
      console.log('✅ Title verification passed!');
    } else {
      console.error('❌ Title verification failed!');
    }

  } catch (error) {
    console.error('❌ Error during test execution:', error);
  } finally {
    await driver.quit();
  }
})();
