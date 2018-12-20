const fs = require('fs');
const puppeteer = require('puppeteer');

const variable = {
    wangList: []
}
const fileName = '反馈_1.txt';
let tempInput = '';

//读取旺旺名称
function getWangList() {
    return new Promise((resolve, reject) => {
        fs.readFile('1.txt', (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data.toString().split('\r\n'));
        });
    });
}

//获取
function getWang(wangwang, page) {
    return new Promise(async (resolve, reject) => {
        try {
            await page.waitForSelector('#J_SearchForm');
        } catch (error) {
            await page.reload();
            await page.waitFor(1000);
        }
        console.log(wangwang);
        await page.focus("#J_SearchForm .search-combobox-input");
        for (let i = 0; i < tempInput.length; i++) {
            await page.keyboard.press("Delete");
        }
        // 搜索框模拟输入
        await page.keyboard.type(wangwang);
        // 回车
        await page.keyboard.press('Enter');

        await page.waitFor(1000);
        let infoWW = {
            shopName: '', //店铺名称
            sale: 0, //销量
            error: '' //未查询到时的错误旺旺
        }
        tempInput = wangwang;
        try {
            await page.waitForSelector('#shopsearch-shoplist');
        } catch (error) {
            await page.reload();
            await page.waitFor(1000);
        }
        // 获取旺旺列表
        try {
            infoWW.wwName = await page.$eval('#list-container .list-item:nth-child(1) .shop-info-list a', el => el.innerText);
            infoWW.shopName = await page.$eval('#list-container .list-item:nth-child(1) .shop-name.J_shop_name', el => el.innerText);
            infoWW.sale = await page.$eval('#list-container .list-item:nth-child(1) .info-sale em', el => el.innerText);
            if (infoWW.wwName.trim() == wangwang.trim()) {
                fs.appendFileSync(fileName,
                    wangwang + '    ' +
                    infoWW.shopName + '    ' +
                    infoWW.sale + '    ' +
                    '\n')
            } else {
                console.log('>>>>>>>>>>>>获取不到此旺旺： ' + wangwang)
                fs.appendFileSync(fileName, wangwang + '    无结果' + '\n')
            }

        } catch (error) {
            console.log('>>>>>>>>>>>>获取不到此旺旺： ' + wangwang)
            fs.appendFileSync(fileName, wangwang + '    无结果' + '\n')
        }
        resolve()
    });
}

//执行入口
(async () => {
    const browser = await (puppeteer.launch({
        headless: true
    }));
    const page = await browser.newPage();
    await page.goto('https://www.taobao.com/');
    // 进入页面
    await page.goto('https://shopsearch.taobao.com/search');
    variable.wangList = await getWangList();
    for (let index in variable.wangList) {
        await getWang(variable.wangList[index].trim(), page);
    }
    browser.close();
})();