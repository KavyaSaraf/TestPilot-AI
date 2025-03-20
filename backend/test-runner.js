const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

/**
 * Runs a built-in test using Selenium WebDriver
 * @param {Object} io - Socket.io instance for real-time logging
 * @param {String} testDescription - Description of the test
 * @param {String} testURL - URL to test
 */
async function runTest(io, testDescription = 'Unnamed Test', testURL = 'http://localhost:3000') {
  let driver;
  const startTime = Date.now();

  try {
    io.emit('test-log', { type: 'info', message: `🚀 Starting test: ${testDescription}` });
    
    // Ensure screenshots directory exists
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const chromeOptions = new chrome.Options()
      .headless()
      .addArguments('--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage');
    
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();
    
    io.emit('test-log', { type: 'info', message: '🚀 Browser launched in headless mode' });
    
    await driver.manage().setTimeouts({ implicit: 10000, pageLoad: 15000, script: 10000 });
    
    // Navigate to the test URL
    io.emit('test-log', { type: 'info', message: `🌐 Navigating to ${testURL}` });
    await driver.get(testURL);
    
    // Take a screenshot after page load
    const screenshotPath = path.join(screenshotsDir, `page-loaded-${Date.now()}.png`);
    await driver.takeScreenshot().then((data) => fs.writeFileSync(screenshotPath, data, 'base64'));
    io.emit('test-log', { type: 'info', message: `📸 Captured screenshot: ${path.basename(screenshotPath)}` });
    
    // Get and verify page title
    const title = await driver.getTitle();
    io.emit('test-log', { type: 'info', message: `🔍 Page Title: ${title}` });
    
    if (title.includes('TestPilot AI')) {
      io.emit('test-log', { type: 'success', message: '✅ Title verification passed' });
    } else {
      io.emit('test-log', { type: 'warning', message: `⚠️ Title verification failed. Got: "${title}"` });
    }
    
    // Wait for body element to be present and get its class attributes
    try {
      await driver.wait(until.elementLocated(By.css('body')), 5000);
      const bodyElement = await driver.findElement(By.css('body'));
      const bodyClasses = await bodyElement.getAttribute('class');
      io.emit('test-log', { type: 'info', message: `🔍 Body classes: ${bodyClasses || 'none'}` });
    } catch (err) {
      io.emit('test-log', { type: 'error', message: `❌ Could not find body element: ${err.message}` });
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    io.emit('test-log', { type: 'success', message: `🎉 Test completed successfully in ${duration}s!` });
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    io.emit('test-log', { type: 'error', message: `❌ Test execution failed: ${error.message}` });
    
    // Try to take a screenshot in case of error
    if (driver) {
      try {
        const errorScreenshotPath = path.join(screenshotsDir, `error-${Date.now()}.png`);
        await driver.takeScreenshot().then((data) => fs.writeFileSync(errorScreenshotPath, data, 'base64'));
        io.emit('test-log', { type: 'info', message: `📸 Error screenshot captured: ${path.basename(errorScreenshotPath)}` });
      } catch (screenshotError) {
        io.emit('test-log', { type: 'error', message: `❌ Could not capture error screenshot: ${screenshotError.message}` });
      }
    }
  } finally {
    if (driver) {
      try {
        await driver.quit();
        io.emit('test-log', { type: 'info', message: '🛑 Browser closed' });
      } catch (quitError) {
        io.emit('test-log', { type: 'error', message: `❌ Error closing browser: ${quitError.message}` });
      }
    }
    
    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    io.emit('test-log', { type: 'info', message: `⏱️ Total execution time: ${totalDuration}s` });
    io.emit('test-finish', { message: '🏁 Test finished!' });
  }
}

module.exports = runTest;
