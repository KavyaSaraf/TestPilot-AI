```javascript
const {Builder, By, Key, until} = require('selenium-webdriver');

(async function example() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.get('https://www.google.com');
    let title = await driver.getTitle();
    if (title.includes("Google")) {
      console.log("Test Passed");
    } else {
      console.log("Test Failed");
    }
  } finally {
    await driver.quit();
  }
})();
```
