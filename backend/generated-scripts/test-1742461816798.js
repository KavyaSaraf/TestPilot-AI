
    const puppeteer = require('puppeteer');
    
    module.exports = async (page, io) => {
      try {
        ```javascript
const puppeteer = require('puppeteer');

(async () => {
  let browser = null;
  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://google.com');
    const title = await page.title();
    if (title.includes('Google')) {
      console.log('Success: Page title contains "Google"');
      await page.screenshot({ path: 'google_screenshot.png' });
    } else {
      console.log('Failure: Page title does not contain "Google"');
      await page.screenshot({ path: 'google_failure_screenshot.png' });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();

```

      } catch (error) {
        console.error('❌ Test script error:', error);
        io.emit('test-log', { type: 'error', message: `❌ Test script error: ${error.message}` });
      } finally {
        await page.close();
        io.emit('test-log', { type: 'info', message: '🛑 Page closed' });
      }
    };
    