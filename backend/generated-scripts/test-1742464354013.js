const fs = require('node:fs/promises');
const path = require('node:path');

/**
 * @param {import('puppeteer').Page} page
 * @param {object} io - Socket.IO instance
 * @param {io.emit} io.emit
 */
module.exports = async (page, io) => {
  try {
    const screenshotDir = './screenshots';
    await fs.mkdir(screenshotDir, { recursive: true });

    io.emit('test-log', { type: 'info', message: 'Navigating to login page...' });
    await page.goto('https://www.saucedemo.com/');
    await page.screenshot({ path: path.join(screenshotDir, 'before-login.png') });

    io.emit('test-log', { type: 'info', message: 'Entering credentials...' });
    await page.type('#user-name', 'standard_user');
    await page.type('#password', 'secret_sauce');
    await page.screenshot({ path: path.join(screenshotDir, 'after-credentials.png') });

    io.emit('test-log', { type: 'info', message: 'Clicking login button...' });
    await page.click('#login-button');

    await page.waitForNavigation();
    await page.screenshot({ path: path.join(screenshotDir, 'after-login.png') });

    const currentURL = page.url();
    if (currentURL === 'https://www.saucedemo.com/inventory.html') {
      io.emit('test-log', { type: 'success', message: 'Login successful!' });
    } else {
      io.emit('test-log', { type: 'error', message: `Login failed. Current URL: ${currentURL}` });
      await page.screenshot({ path: path.join(screenshotDir, 'login-failed.png') });
      throw new Error('Login failed');
    }
  } catch (error) {
    io.emit('test-log', { type: 'error', message: `An error occurred: ${error.message}` });
    console.error(error); 
  }
};