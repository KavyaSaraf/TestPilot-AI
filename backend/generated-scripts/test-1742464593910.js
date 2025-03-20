const fs = require('node:fs/promises');
const path = require('node:path');

/**
 * @param {import('puppeteer').Page} page
 * @param {object} io -  object with an emit method for logging
 */
module.exports = async (page, io) => {
  const screenshotsDir = './screenshots';
  try {
    await fs.mkdir(screenshotsDir, { recursive: true });

    io.emit('test-log', { type: 'info', message: 'Starting Applitools demo login test...' });

    await page.goto('https://demo.applitools.com/');
    await page.waitForTimeout(2000); //Adding a small delay for page load

    await takeScreenshot(page, screenshotsDir, 'page-load');

    //Check if the login form exists
    const loginFormSelector = '#login';
    const loginForm = await page.$(loginFormSelector);
    if (!loginForm) {
      io.emit('test-log', { type: 'error', message: `Login form not found with selector: ${loginFormSelector}` });
      throw new Error('Login form not found');
    }
    io.emit('test-log', { type: 'success', message: 'Login form found.' });

    //Check selectors and ensure elements are present before interaction

    const usernameSelector = '#username';
    const passwordSelector = '#password';
    const loginButtonSelector = '#log-in';


    const usernameField = await page.$(usernameSelector);
    const passwordField = await page.$(passwordSelector);
    const loginButton = await page.$(loginButtonSelector);

    if (!usernameField || !passwordField || !loginButton) {
      io.emit('test-log', { type: 'error', message: 'One or more login form elements not found.' });
      throw new Error('Login elements missing');
    }
    io.emit('test-log', { type: 'success', message: 'Login form elements found.' });

    await takeScreenshot(page, screenshotsDir, 'login-form-elements');


    //Login
    await usernameField.type('your_username'); //Replace with valid username
    await passwordField.type('your_password'); //Replace with valid password
    await takeScreenshot(page, screenshotsDir, 'credentials-entered');

    await loginButton.click();
    await page.waitForNavigation({ waitUntil: 'networkidle2' }); // Wait for navigation

    await takeScreenshot(page, screenshotsDir, 'post-login');

    io.emit('test-log', { type: 'success', message: 'Login successful!' });

  } catch (error) {
    io.emit('test-log', { type: 'error', message: `Test failed: ${error.message}` });
    console.error(error); 
  }
};



async function takeScreenshot(page, dir, filename) {
  const filepath = path.join(dir, `${filename}.png`);
  await page.screenshot({ path: filepath });
  console.log(`Screenshot saved to: ${filepath}`);
}