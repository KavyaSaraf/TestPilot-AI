const { Builder, By, until } = require('selenium-webdriver');
const fs = require('node:fs/promises');
const path = require('node:path');

async function testLogin(driver, io) {
  try {
    // Navigate to the login page
    await driver.get('https://demo.applitools.com/');
    io.emit('test-log', { type: 'info', message: 'Navigated to login page' });
    await takeScreenshot(driver, 'login-page');


    // Wait for the login button and verify its existence
    const loginButton = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 10000);
    io.emit('test-log', { type: 'info', message: 'Login button found' });
    await takeScreenshot(driver, 'login-button-found');

    // Click the login button
    await loginButton.click();
    io.emit('test-log', { type: 'info', message: 'Clicked login button' });


    // Wait for page navigation (check for a specific element after login)
    await driver.wait(until.elementLocated(By.css('.applitools-logo')), 10000);
    io.emit('test-log', { type: 'success', message: 'Successfully logged in' });
    await takeScreenshot(driver, 'logged-in');

  } catch (error) {
    io.emit('test-log', { type: 'error', message: `Login failed: ${error.message}` });
    await takeScreenshot(driver, 'login-failed');
    console.error("Error during login:", error); 
  } finally {
    //Ensure cleanup even if errors occur
    await driver.quit();
  }
}


async function takeScreenshot(driver, name) {
  try {
    const screenshot = await driver.takeScreenshot();
    await fs.mkdir('./screenshots', { recursive: true });
    await fs.writeFile(`./screenshots/${name}.png`, screenshot, 'base64');
    io.emit('test-log', { type: 'info', message: `Screenshot saved: ./screenshots/${name}.png` });
  } catch (error) {
    io.emit('test-log', { type: 'error', message: `Failed to save screenshot: ${error.message}` });
    console.error("Error saving screenshot:", error);
  }
}


module.exports = testLogin;


**To run this code:**

1.  **Install necessary packages:**
    bash
    npm install selenium-webdriver
    
2.  **Set up a Selenium WebDriver instance:**  You'll need a webdriver compatible with your browser (e.g., ChromeDriver for Chrome).  The `driver` object needs to be initialized *before* calling `testLogin`.  Example using ChromeDriver:

    
    const { Builder } = require('selenium-webdriver');
    const testLogin = require('./your_test_file'); //Replace with actual filename

    async function runTests(){
        const driver = await new Builder().forBrowser('chrome').build();
        await testLogin(driver, {emit: (type, msg) => console.log(type, msg)}); //Replace with your io object
    }

    runTests();
    


3.  **Replace `io`:** The provided code uses a placeholder `io` object for logging and emitting events. Replace `{emit: (type, msg) => console.log(type, msg)}` with your actual io object that handles these events (e.g., Socket.IO).  Make sure this object has an `emit` method that accepts the structure `{ type: 'info|success|error', message: 'Your message' }`.


This improved answer addresses error handling, screenshot saving, and provides a more complete example of how to integrate this test function into a larger test suite.  Remember to handle potential exceptions during file system operations (e.g., permission errors) if needed.