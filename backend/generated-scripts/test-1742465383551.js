const { Builder, By, until } = require('selenium-webdriver');
const fs = require('node:fs/promises');
const path = require('node:path');


async function runTest(driver, io) {
  try {
    io.emit('test-log', { type: 'info', message: 'Test started' });

    // Launch Chrome in headless mode
    await driver.get('https://www.saucedemo.com/');
    await driver.manage().window().setRect({ width: 1200, height: 800 }); //optional: set window size for better screenshot

    await takeScreenshot(driver, 'login_page_before');
    io.emit('test-log', { type: 'info', message: 'Navigated to login page' });

    // Enter credentials
    await driver.findElement(By.id('user-name')).sendKeys('standard_user');
    await driver.findElement(By.id('password')).sendKeys('secret_sauce');
    io.emit('test-log', { type: 'info', message: 'Entered credentials' });

    // Click login button
    await driver.findElement(By.id('login-button')).click();
    io.emit('test-log', { type: 'info', message: 'Clicked login button' });


    // Wait for inventory page to load (using explicit wait)
    await driver.wait(until.elementLocated(By.id('inventory_container')), 10000);
    await takeScreenshot(driver, 'inventory_page');
    io.emit('test-log', { type: 'info', message: 'Inventory page loaded' });

    // Verify page title
    const title = await driver.getTitle();
    if (title.includes('Swag Labs')) {
      io.emit('test-log', { type: 'success', message: 'Login successful' });
    } else {
      await takeScreenshot(driver, 'login_failed');
      io.emit('test-log', { type: 'error', message: `Login failed. Expected title containing 'Swag Labs', but got '${title}'` });
      throw new Error('Login failed');
    }

  } catch (error) {
    let errorMessage = 'An unexpected error occurred';
    if (error.message) {
        errorMessage = error.message;
    }

    try {
        const errorElement = await driver.findElement(By.css('.error-message-container h3'));
        if (errorElement) {
            errorMessage = await errorElement.getText();
        }
    } catch (e) {
        // ignore error getting error message.
    }

    io.emit('test-log', { type: 'error', message: errorMessage });
    await takeScreenshot(driver, 'error');

  } finally {
    await driver.quit();
    io.emit('test-log', { type: 'info', message: 'Test completed' });
  }
}


async function takeScreenshot(driver, filename) {
    const screenshot = await driver.takeScreenshot();
    const screenshotDir = './screenshots';
    await fs.mkdir(screenshotDir, { recursive: true });
    const filePath = path.join(screenshotDir, `${filename}.png`);
    await fs.writeFile(filePath, screenshot, 'base64');
}


module.exports = runTest;