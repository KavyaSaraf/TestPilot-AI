const fs = require('node:fs/promises');
const path = require('node:path');

module.exports = async (page, io) => {
  const screenshotsDir = './screenshots';

  try {
    await fs.mkdir(screenshotsDir, { recursive: true });

    io.emit('test-log', { type: 'info', message: 'Navigating to login page...' });
    await page.goto('https://demo.applitools.com/', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(screenshotsDir, 'login_page.png') });

    io.emit('test-log', { type: 'info', message: 'Entering credentials...' });
    await page.type('#username', 'testuser');
    await page.type('#password', 'password123');
    await page.screenshot({ path: path.join(screenshotsDir, 'credentials_entered.png') });

    io.emit('test-log', { type: 'info', message: 'Clicking login button...' });
    
    await page.waitForSelector('button#log-in', { visible: true }); // Wait for button
    await page.click('button#log-in'); // Updated selector

    await page.waitForNavigation();
    await page.screenshot({ path: path.join(screenshotsDir, 'post_login.png') });

    io.emit('test-log', { type: 'info', message: 'Verifying page heading...' });
    const pageHeading = await page.$eval('h1', el => el.textContent);
    if (pageHeading.includes('Financial Overview')) {
      io.emit('test-log', { type: 'success', message: 'Login successful! Page heading verified.' });
    } else {
      io.emit('test-log', { type: 'error', message: `Login failed! Expected "Financial Overview", but got "${pageHeading}"` });
      throw new Error('Login failed - incorrect page heading');
    }

  } catch (error) {
    io.emit('test-log', { type: 'error', message: `An error occurred: ${error.message}` });
    await page.screenshot({ path: path.join(screenshotsDir, 'error.png') }); 
    throw error; // Re-throw the error to halt execution
  }
};
