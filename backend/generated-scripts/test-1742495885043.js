const { Builder, By, until } = require('selenium-webdriver');
const fs = require('node:fs/promises');
const path = require('node:path');

/**
 * @param {import('selenium-webdriver').ThenableWebDriver} driver 
 * @param {{emit: (event: string, data: any) => void}} io
 */
async function runTest(driver, io) {
    const screenshotDir = './screenshots';

    try {
        await fs.mkdir(screenshotDir, { recursive: true });
        io.emit('test-log', { type: 'info', message: 'Starting SauceDemo login test...' });

        // Launch Chrome in headless mode
        await driver.manage().window().setRect({width:1280, height:1024}); //optional:set window size for better screenshots
        await driver.get('https://www.saucedemo.com/');
        const screenshot1 = await driver.takeScreenshot();
        await fs.writeFile(path.join(screenshotDir, 'login_page.png'), screenshot1, 'base64');
        io.emit('test-log', { type: 'info', message: 'Navigated to login page.' });

        // Enter valid credentials
        await driver.findElement(By.id('user-name')).sendKeys('standard_user');
        await driver.findElement(By.id('password')).sendKeys('secret_sauce');

        // Click the "Login" button
        await driver.findElement(By.id('login-button')).click();
        io.emit('test-log', { type: 'info', message: 'Clicked login button.' });


        // Wait for the inventory page to load (explicit wait)
        await driver.wait(until.elementLocated(By.id('inventory_container')), 10000); // 10-second timeout


        // Verify successful login
        const title = await driver.getTitle();
        if (title.includes('Swag Labs')) {
            const screenshot2 = await driver.takeScreenshot();
            await fs.writeFile(path.join(screenshotDir, 'inventory_page.png'), screenshot2, 'base64');
            io.emit('test-log', { type: 'success', message: `Login successful! Page title: ${title}` });
        } else {
            const errorMessage = await driver.findElement(By.css('.error-message-container')).getText(); //Example error message selector,adjust if needed.
            const screenshot3 = await driver.takeScreenshot();
            await fs.writeFile(path.join(screenshotDir, 'error_page.png'), screenshot3, 'base64');
            io.emit('test-log', { type: 'error', message: `Login failed! Error message: ${errorMessage}` });
            throw new Error('Login failed');
        }

    } catch (error) {
        io.emit('test-log', { type: 'error', message: `An error occurred: ${error.message}` });
        const screenshotError = await driver.takeScreenshot();
        await fs.writeFile(path.join(screenshotDir, 'error_screenshot.png'), screenshotError, 'base64');
    } finally {
        await driver.quit();
        io.emit('test-log', { type: 'info', message: 'Test completed. Browser closed.' });
    }
}


module.exports = runTest;



**To run this code:**

1.  **Install dependencies:**  `npm install selenium-webdriver`
2.  **Create a main script (e.g., `test.js`):**


const { Builder } = require('selenium-webdriver');
const runTest = require('./your_test_script_filename'); //Replace with your file name

async function main() {
    const driver = await new Builder().forBrowser('chrome').setChromeOptions(
        new require('selenium-webdriver').chrome.Options().addArguments('--headless=new')
    ).build();
    const io = {
        emit: (event, data) => {
            console.log(event, data); //Simulate io.emit for console output.
        }
    };
    await runTest(driver,io);

}
main();



3.  **Run the main script:** `node test.js`


Remember to replace `'./your_test_script_filename'` with the actual filename of your Selenium test script.  This improved version includes more robust error handling, clearer logging, and uses explicit waits to improve reliability.  The error message selector might need adjustment depending on the exact structure of the error message on the SauceDemo login page.  Make sure you have a ChromeDriver executable in your system's PATH or specify its location.