 const fs = require('fs');
 const path = require('path');
 const puppeteer = require('puppeteer-core'); 

//执行入口
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
	executablePath: path.resolve('C:/Program Files (x86)/Google/Chrome/Application/chrome.exe')
  });
  const page = await browser.newPage();
  for (let index = 1; index < 50000; index++) {
    await page.waitFor(1000);
    await page.goto('https://juejin.im/post/5cc580abf265da037d4fb5ab');
    await page.goto('https://juejin.im/post/5ca2d47551882543d8590702');
    await page.goto('https://juejin.im/post/5c08b1826fb9a049a81f1d49'); 
    console.log('第' + index + '次');
  }
  browser.close();
})();
