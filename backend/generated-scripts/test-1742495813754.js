const { Builder, By, until } = require('selenium-webdriver');
const fs = require('node:fs/promises');
const path = require('node:path');

/**
 *  Selenium WebDriver test script for SauceDemo login.
 * @param {import('selenium-webdriver').WebDriver} driver - The Selenium WebDriver instance.
 * @param {object} io -  Object with an emit function for logging (e.g., Socket.IO).  Must have io.emit('test-log', {type, message})
 */
async function sauceDemoTest(driver, io) {
    try {
        io.emit('test-log', { type: 'info', message: 'Test started' });

        // Launch Chrome in headless mode
        const options = new Builder().forBrowser('chrome').setChromeOptions({ args: ['--headless'] }).build();
        driver = driver || options; //Allow passing a driver for potential reuse in a test suite.


        // Navigate to the login page
        await driver.get('https://www.saucedemo.com/');
        await takeScreenshot(driver, 'loginPage');
        io.emit('test-log', { type: 'info', message: 'Navigated to login page' });

        // Enter valid credentials
        await driver.findElement(By.id('user-name')).sendKeys('standard_user');
        await driver.findElement(By.id('password')).sendKeys('secret_sauce');

        // Click the "Login" button
        await driver.findElement(By.id('login-button')).click();

        // Wait for the inventory page to load (using a more robust wait condition)
        await driver.wait(until.elementLocated(By.id('inventory_container')), 10000, 'Inventory page did not load within 10 seconds');
        await takeScreenshot(driver, 'inventoryPage');
        io.emit('test-log', { type: 'info', message: 'Successfully logged in' });


        // Verify the page title
        const pageTitle = await driver.getTitle();
        if (pageTitle.includes('Swag Labs')) {
            io.emit('test-log', { type: 'success', message: `Login successful. Page title: ${pageTitle}` });
        } else {
            io.emit('test-log', { type: 'error', message: `Login failed. Expected title containing 'Swag Labs', but got: ${pageTitle}` });
            throw new Error('Login failed. Incorrect page title.');
        }


    } catch (error) {
        io.emit('test-log', { type: 'error', message: `Test failed: ${error.message}` });
        try {
          await takeScreenshot(driver, 'error');
          const errorMessage = await driver.findElement(By.css('h3')).getText(); // Attempt to get error message if possible. Adjust CSS selector if needed.
          io.emit('test-log', {type: 'error', message: `Error message: ${errorMessage}`})
        } catch (screenshotError) {
          io.emit('test-log', {type: 'error', message: `Failed to capture screenshot or error message: ${screenshotError.message}`})
        }
    } finally {
        await driver.quit();
        io.emit('test-log', { type: 'info', message: 'Test finished' });
    }
}


/**Helper function to take a screenshot and save it */
async function takeScreenshot(driver, filename) {
  const screenshot = await driver.takeScreenshot();
  const filepath = path.join(__dirname, 'screenshots', `${filename}.png`);
  await fs.mkdir(path.dirname(filepath), { recursive: true });
  await fs.writeFile(filepath, screenshot, 'base64');
}

module.exports = sauceDemoTest;



**Before running:**

1.  **Install dependencies:**  `npm install selenium-webdriver`
2.  **Create a `screenshots` directory:** in the same directory as your script.
3.  **Set up your `io` object:** This example uses a placeholder `io` object. In a real application, you would replace this with your Socket.IO or other logging mechanism.  Make sure your `io.emit` function is correctly configured.


**How to run:**


const {Builder} = require('selenium-webdriver');
const sauceDemoTest = require('./your_script_name'); // Replace with your file name

async function runTest(){
    const io = { //Example IO object
        emit: (type, data) => console.log(`${type.toUpperCase()}:`, data.message)
    }
    const driver = new Builder().forBrowser('chrome').setChromeOptions({ args: ['--headless'] }).build();

    await sauceDemoTest(driver, io);
}
runTest();



Remember to replace `'./your_script_name'` with the actual path to your script file.  This improved answer includes more robust error handling, better logging, and a helper function for taking screenshots.  The screenshot saving is also made more reliable.  This version also provides an example of how to run the test, allowing the passing of a webdriver instance if you need to re-use the driver in a test suite.