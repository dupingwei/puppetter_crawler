const fs = require('fs');
const puppeteer = require('puppeteer');

const variable = {
    wangList: []
}

//读取旺旺名称
function getWangList() {
    return new Promise((resolve, reject) => {
        fs.readFile('待爬旺旺.txt', (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data.toString().split('\r\n'));
        });
    });
}

//获取歌词
function getWang(wangwang, page) {
    return new Promise(async (resolve, reject) => {
        console.log(wangwang)
        // 进入页面
        await page.goto('https://shopsearch.taobao.com/search');
        // 点击搜索框拟输入
        await page.type('.search-combobox-input', wangwang, {
            delay: 0
        });

        // 回车
        await page.keyboard.press('Enter');
        await page.waitFor(2000);
        let infoWW = {
            wwName: '', //店铺卖家旺旺名称
            sale: 0, //店铺销量
            sum: 0, //店铺宝贝数量
            error: '' //未查询到时的错误旺旺
        }
        // 获取旺旺列表
        try {
            infoWW.wwName = await page.$eval('#list-container .list-item .shop-info-list a', el => el.innerText);
            infoWW.sale = await page.$eval('#list-container .list-item .info-sale em', el => el.innerText);
            infoWW.sum = await page.$eval('#list-container .list-item .info-sum em', el => el.innerText);
            if (infoWW.wwName == wangwang) {
                fs.appendFileSync('反馈信息.txt', infoWW.wwName + '    ' + infoWW.sale + '     ' + infoWW.sum + '\n')
            } else {
                fs.appendFileSync('反馈信息.txt', wangwang + '    ' + infoWW.wwName + '    ' + infoWW.sale + '     ' + infoWW.sum + '\n')
            }
        } catch (error) {
            console.log('获取不到此旺旺>>>>>>>>>>>>' + wangwang)
            fs.appendFileSync('反馈信息.txt', wangwang + '    无结果'+ '\n')
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