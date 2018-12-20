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
        // 进入页面
        await page.goto('https://shopsearch.taobao.com/search');
        // 点击搜索框拟输入
        await page.type('.search-combobox-input', wangwang, {
            delay: 0
        });

        // 回车
        await page.keyboard.press('Enter');
        await page.waitFor(2000);
        console.log(wangwang)
        let infoWW = {
            wwName: '', //卖家旺旺名称
            shopName: '', //店铺名称
            sale: 0, //销量
            sum: 0, //宝贝数量
            address: '', //地址
            mainCat: 0, //主营
            unitPrice: 0, //客单价
            dsrOne: '',//描述相符
            dsrOneCp: '',//描述相符与同行业比较（显示正负）
            dsrTwo: '',//服务态度
            dsrTwoCp: '',//与同行业比较
            dsrThree: '',//物流态度
            dsrThreeCp: '',//与同行业比较
            error: '' //未查询到时的错误旺旺
        }
        // 获取旺旺列表
        try {
            await page.waitForSelector('#shopsearch-shoplist');
            infoWW.wwName = await page.$eval('#list-container .list-item:nth-child(1) .shop-info-list a', el => el.innerText);
            infoWW.shopName = await page.$eval('#list-container .list-item:nth-child(1) .shop-name.J_shop_name', el => el.innerText);
            infoWW.sale = await page.$eval('#list-container .list-item:nth-child(1) .info-sale em', el => el.innerText);
            infoWW.sum = await page.$eval('#list-container .list-item:nth-child(1) .info-sum em', el => el.innerText);
            try {
                infoWW.address = await page.$eval('#list-container .list-item:nth-child(1) .shop-info .shop-address', el => el.innerText);
                infoWW.mainCat = await page.$eval('#list-container .list-item:nth-child(1) .main-cat a', el => el.innerText.substring(0, 40));
                //四个价格
                infoWW.unitPrice = await page.$eval('#list-container .list-item:nth-child(1) .shop-products .one-product:nth-child(1) .price-wrap', el => el.innerText);
                infoWW.unitPrice += '、' + await page.$eval('#list-container .list-item:nth-child(1) .shop-products .one-product:nth-child(2) .price-wrap', el => el.innerText);
                infoWW.unitPrice += '、' + await page.$eval('#list-container .list-item:nth-child(1) .shop-products .one-product:nth-child(3) .price-wrap', el => el.innerText);
                infoWW.unitPrice += '、' + await page.$eval('#list-container .list-item:nth-child(1) .shop-products .one-product:nth-child(4) .price-wrap', el => el.innerText);

                //TODO 天猫店铺下列方式可以，普通店铺待做
                await page.hover('#list-container .list-item:nth-child(1) .descr.J_descr.target-hint-descr')

                infoWW.dsrOne = await page.$eval('#list-container .list-item:nth-child(1) .J_PopupDsr.popup-shopinfo .shop-mark li:nth-child(2) a', el => el.innerText);
                infoWW.dsrOneCp = await page.$eval('#list-container .list-item:nth-child(1) .J_PopupDsr.popup-shopinfo .shop-avg li:nth-child(2)', el => el.innerText);
                infoWW.dsrTwo = await page.$eval('#list-container .list-item:nth-child(1) .J_PopupDsr.popup-shopinfo .shop-mark li:nth-child(3) a', el => el.innerText);
                infoWW.dsrTwoCp = await page.$eval('#list-container .list-item:nth-child(1) .J_PopupDsr.popup-shopinfo .shop-avg li:nth-child(2)', el => el.innerText);
                infoWW.dsrThree = await page.$eval('#list-container .list-item:nth-child(1) .J_PopupDsr.popup-shopinfo .shop-mark li:nth-child(4) a', el => el.innerText);
                infoWW.dsrThreeCp = await page.$eval('#list-container .list-item:nth-child(1) .J_PopupDsr.popup-shopinfo .shop-avg li:nth-child(2)', el => el.innerText);
            } catch (error) {
            }
            if (infoWW.address == '') {
                infoWW.address = '无'
            }
            if (infoWW.mainCat == '') {
                infoWW.mainCat = '无'
            }
            if (infoWW.unitPrice == '') {
                infoWW.unitPrice = '无'
            }
            if (infoWW.wwName.trim() == wangwang.trim()) {
                fs.appendFileSync('反馈信息.txt',
                    wangwang + '    ' +
                    infoWW.wwName + '    ' +
                    infoWW.shopName + '    ' +
                    infoWW.sale + '    ' +
                    infoWW.sum + '    ' +
                    infoWW.address.replace(/\s+/g, "-") + '    ' +
                    infoWW.mainCat.replace(/\s+/g, ",") + '    ' +
                    infoWW.unitPrice + '    ' +
                    infoWW.dsrOne + '    ' +
                    infoWW.dsrOneCp + '    ' +
                    infoWW.dsrTwo + '    ' +
                    infoWW.dsrTwoCp + '    ' +
                    infoWW.dsrThree + '    ' +
                    infoWW.dsrThreeCp +
                    '\n')
            } else {
                console.log('>>>>>>>>>>>>获取不到此旺旺： ' + wangwang)
                fs.appendFileSync('反馈信息.txt', wangwang + '    无结果' + '\n')
            }

        } catch (error) {
            console.log('>>>>>>>>>>>>获取不到此旺旺： ' + wangwang)
            fs.appendFileSync('反馈信息.txt', wangwang + '    无结果' + '\n')
        }
        resolve()
    });
}

//执行入口
(async () => {
    const browser = await (puppeteer.launch({
        headless: false
    }));
    const page = await browser.newPage();
    await page.goto('https://www.taobao.com/');
    variable.wangList = await getWangList();
    for (let index in variable.wangList) {
        await getWang(variable.wangList[index], page);
    }
    browser.close();
})();