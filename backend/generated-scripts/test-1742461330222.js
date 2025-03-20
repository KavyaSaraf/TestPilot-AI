
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
    await page.goto('https://www.google.com');
    const title = await page.title();
    if (title.includes('Google')) {
      console.log('Success: Page title contains "Google"');
      await page.screenshot({ path: 'google_success.png' });
    } else {
      console.error('Failure: Page title does not contain "Google"');
      await page.screenshot({ path: 'google_failure.png' });
      throw new Error('Page title mismatch');
    }
  } catch (error) {
    console.error('Test failed:', error);
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
    