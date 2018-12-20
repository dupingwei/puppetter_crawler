const fs = require('fs');
const puppeteer = require('puppeteer');

//执行入口
(async () => {
    const browser = await (puppeteer.launch({
        headless: true
    }));
    const page = await browser.newPage();
    for (let index = 1;index < 50000;index++) {
		await page.waitFor(1000);
		await page.goto('https://juejin.im/post/5a7c36c3f265da4e82633a0b');
		await page.goto('https://juejin.im/post/5a324ddf51882552de5e2ab7');
		console.log('第'+index+'次')
    }
    browser.close();
})();