const { Builder, By, until } = require('selenium-webdriver');
const fs = require('node:fs/promises');
const path = require('node:path');

async function sauceDemoSortTest(driver, io) {
  try {
    io.emit('test-log', { type: 'info', message: 'Starting SauceDemo sort test' });

    // Login
    await driver.get('https://www.saucedemo.com/');
    await driver.findElement(By.id('user-name')).sendKeys('standard_user');
    await driver.findElement(By.id('password')).sendKeys('secret_sauce');
    await driver.findElement(By.id('login-button')).click();

    // Verify products are displayed
    await driver.wait(until.elementLocated(By.className('inventory_item')), 5000);
    io.emit('test-log', { type: 'info', message: 'Products displayed successfully' });
    const screenshot1 = await driver.takeScreenshot();
    await fs.mkdir('./screenshots', { recursive: true });
    await fs.writeFile('./screenshots/products_before_sort.png', screenshot1, 'base64');


    // Select sorting option
    const dropdown = await driver.findElement(By.className('product_sort_container'));
    await dropdown.click();
    await driver.findElement(By.css('[value="lowtohigh"]')).click();

    // Verify sorting
    await driver.wait(until.elementLocated(By.className('inventory_item')), 5000);
    const productPrices = await driver.findElements(By.className('inventory_item_price'));
    const prices = await Promise.all(productPrices.map(async (element) => parseFloat(await element.getText().replace('$', ''))));
    const isSorted = prices.every((price, index) => index === 0 || price >= prices[index - 1]);

    if (isSorted) {
      io.emit('test-log', { type: 'success', message: 'Products sorted correctly' });
    } else {
      io.emit('test-log', { type: 'error', message: 'Products not sorted correctly' });
      throw new Error('Products are not sorted correctly');
    }


    // Screenshot of sorted list
    const screenshot2 = await driver.takeScreenshot();
    await fs.writeFile('./screenshots/products_after_sort.png', screenshot2, 'base64');
    io.emit('test-log', { type: 'info', message: 'Screenshot of sorted products saved' });

  } catch (error) {
    io.emit('test-log', { type: 'error', message: `Test failed: ${error.message}` });
    const errorScreenshot = await driver.takeScreenshot();
    await fs.writeFile('./screenshots/error.png', errorScreenshot, 'base64');
    throw error; // Re-throw the error to be handled by the test runner
  } finally {
    await driver.quit();
    io.emit('test-log', { type: 'info', message: 'Browser closed' });
  }
}


module.exports = sauceDemoSortTest;