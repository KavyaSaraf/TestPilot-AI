
    const puppeteer = require('puppeteer');
    
    module.exports = async (page, io) => {
      try {
        ```javascript
const puppeteer = require('puppeteer');

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://demo.applitools.com/');
    await page.screenshot({ path: 'login_page.png' });
    await page.type('#username', 'testuser');
    await page.type('#password', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForSelector('h1');
    const heading = await page.$eval('h1', el => el.textContent);
    if (heading.includes('Financial Overview')) {
      await page.screenshot({ path: 'success.png' });
      console.log('Login successful!');
    } else {
      await page.screenshot({ path: 'failure.png' });
      console.error('Login failed!');
      throw new Error('Login failed: Heading does not contain "Financial Overview"');
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
    