const fs = require('fs');
const puppeteer = require('puppeteer');

const variable = {
    wangList: []
}

//读取旺旺名称
function getWangList() {
    return new Promise((resolve, reject) => {
        fs.readFile('销量.txt', (err, data) => {
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
        console.log(wangwang)
        try {
            // 进入页面
            await page.goto('https://shopsearch.taobao.com/search');
            await page.waitForSelector('#J_SearchForm');
            await page.waitFor(1000);
        } catch (error) {
            await page.reload();
            await page.waitFor(1000);
        }
        // 点击搜索框拟输入
        await page.type('.search-combobox-input', wangwang, {
            delay: 0
        });

        // 回车
        await page.keyboard.press('Enter');
        await page.waitFor(1000);
        let infoWW = {
            shopName: '', //店铺名称
            sale: 0, //销量
            error: '' //未查询到时的错误旺旺
        }
        // 获取旺旺列表
        try {
            await page.waitForSelector('#shopsearch-shoplist');
            infoWW.wwName = await page.$eval('#list-container .list-item:nth-child(1) .shop-info-list a', el => el.innerText);
            infoWW.shopName = await page.$eval('#list-container .list-item:nth-child(1) .shop-name.J_shop_name', el => el.innerText);
            infoWW.sale = await page.$eval('#list-container .list-item:nth-child(1) .info-sale em', el => el.innerText);
            if (infoWW.wwName.trim() == wangwang.trim()) {
                fs.appendFileSync('销量结果.txt',
                    wangwang + '\t' +
                    infoWW.shopName + '\t' +
                    infoWW.sale + '\t' +
                    '\n')
            } else {
                console.log('>>>>>>>>>>>>获取不到此旺旺： ' + wangwang)
                fs.appendFileSync('销量结果.txt', wangwang + '\t无结果' + '\n')
            }

        } catch (error) {
			// TODO
            console.log('>>>>>>>>>>>>获取不到此旺旺： ' + wangwang)
            fs.appendFileSync('销量结果.txt', wangwang + '\t无结果' + '\n')
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
    variable.wangList = await getWangList();
    for (let index in variable.wangList) {
        await getWang(variable.wangList[index], page);
    }
    browser.close();
})();