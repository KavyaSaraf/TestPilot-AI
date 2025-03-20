```javascript
const {Builder, By, until} = require('selenium-webdriver');

(async function() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.get('https://www.google.com');
    let title = await driver.getTitle();
    if (title.includes('Google')) {
      console.log('Test passed: Page title contains "Google"');
    } else {
      console.error('Test failed: Page title does not contain "Google"');
    }
  } finally {
    await driver.quit();
  }
})();
```
