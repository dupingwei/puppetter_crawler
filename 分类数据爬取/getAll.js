const fs = require('fs');
const puppeteer = require('puppeteer');

const nowType = '女装';

//获取歌词
function getWang(index, page) {
    return new Promise(async (resolve, reject) => {

        await page.waitForSelector('#shopsearch-shoplist');
        let infoWW = {
            wwName: '', //卖家旺旺名称
            shopName: '', //店铺名称
            href: '', //店铺链接
            shopHref: '', //店铺评分工商资质链接
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
        let itemLength = await page.$$eval('#list-container .list-item', lists => lists.length);
        console.log('当前第 ' + index + ' 页>>>>>>>>>>>>>>>>>>>>>' + '本页数量:' + itemLength);
        if (itemLength === 0) return;

        for (let i = 1; i <= itemLength; i++) {
            await page.waitFor(150);
            try {
                infoWW.wwName = await page.$eval('#list-container .list-item:nth-child(' + i + ') .shop-info-list a', el => el.innerText);
                infoWW.shopName = await page.$eval('#list-container .list-item:nth-child(' + i + ') .shop-name.J_shop_name', el => el.innerText);
                infoWW.href = await page.$eval('#list-container .list-item:nth-child(' + i + ') .shop-name.J_shop_name', el => el.href);
                try {
                    infoWW.shopHref = await page.$eval('#list-container .list-item:nth-child(' + i + ') .icon-service-tianmao-large', el => el.href);
                } catch (error) {
                    infoWW.shopHref = '非天猫'
                }
                infoWW.sale = await page.$eval('#list-container .list-item:nth-child(' + i + ') .info-sale em', el => el.innerText);
                infoWW.sum = await page.$eval('#list-container .list-item:nth-child(' + i + ') .info-sum em', el => el.innerText);

                try {
                    infoWW.address = await page.$eval('#list-container .list-item:nth-child(' + i + ') .shop-info .shop-address', el => el.innerText);
                } catch (rror) {
                    infoWW.address = '无'
                }
                try {
                    infoWW.mainCat = await page.$eval('#list-container .list-item:nth-child(' + i + ') .main-cat a', el => el.innerText.substring(0, 40));
                } catch (rror) {
                    infoWW.mainCat = '无'
                }
                //四个价格
                try {
                    infoWW.unitPrice = await page.$eval('#list-container .list-item:nth-child(' + i + ') .shop-products .one-product:nth-child(1) .price-wrap', el => el.innerText);
                    infoWW.unitPrice += '、' + await page.$eval('#list-container .list-item:nth-child(' + i + ') .shop-products .one-product:nth-child(2) .price-wrap', el => el.innerText);
                    infoWW.unitPrice += '、' + await page.$eval('#list-container .list-item:nth-child(' + i + ') .shop-products .one-product:nth-child(3) .price-wrap', el => el.innerText);
                    infoWW.unitPrice += '、' + await page.$eval('#list-container .list-item:nth-child(' + i + ') .shop-products .one-product:nth-child(4) .price-wrap', el => el.innerText);
                } catch (error) {
                    infoWW.unitPrice = '0000'
                }

                await page.hover('#list-container .list-item:nth-child(' + i + ') .descr.J_descr.target-hint-descr')
                try {
                    infoWW.dsrOne = await page.$eval('#list-container .list-item:nth-child(' + i + ') .J_PopupDsr.popup-shopinfo .shop-mark li:nth-child(2) a', el => el.innerText);
                    infoWW.dsrOneCp = await page.$eval('#list-container .list-item:nth-child(' + i + ') .J_PopupDsr.popup-shopinfo .shop-avg li:nth-child(2)', el => el.innerText);
                    infoWW.dsrTwo = await page.$eval('#list-container .list-item:nth-child(' + i + ') .J_PopupDsr.popup-shopinfo .shop-mark li:nth-child(3) a', el => el.innerText);
                    infoWW.dsrTwoCp = await page.$eval('#list-container .list-item:nth-child(' + i + ') .J_PopupDsr.popup-shopinfo .shop-avg li:nth-child(2)', el => el.innerText);
                    infoWW.dsrThree = await page.$eval('#list-container .list-item:nth-child(' + i + ') .J_PopupDsr.popup-shopinfo .shop-mark li:nth-child(4) a', el => el.innerText);
                    infoWW.dsrThreeCp = await page.$eval('#list-container .list-item:nth-child(' + i + ') .J_PopupDsr.popup-shopinfo .shop-avg li:nth-child(2)', el => el.innerText);
                } catch (error) {
                    infoWW.dsrOne = '0';
                    infoWW.dsrOneCp = '0';
                    infoWW.dsrTwo = '0';
                    infoWW.dsrTwoCp = '0';
                    infoWW.dsrThree = '0';
                    infoWW.dsrThreeCp = '0';
                }
                fs.open(nowType + '.txt', 'a', (err, fd) => {
                    if (err) throw err;
                    fs.appendFile(fd,
                        infoWW.wwName + '    ' +
                        infoWW.shopName + '    ' +
                        infoWW.href + '    ' +
                        infoWW.shopHref + '    ' +
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
                        '\n',
                        'utf8',
                        (err) => {
                            fs.close(fd, (err) => {
                                if (err) throw err;
                            });
                            if (err) throw err;
                        });
                });
            } catch (error) {
                console.log('第 ' + index + ' 页，当次第 ' + i + ' 个失败！');
            }
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
    // 进入页面
    await page.goto('https://shopsearch.taobao.com/search?app=shopsearch&q=' + decodeURI(nowType) + '&tracelog=shopsearchnoqcat&isb=0&shop_type=&ratesum=jin');

    /*// 点击搜索框拟输入
    await page.type('.search-combobox-input', nowType, {
        delay: 0
    });
    // 回车
    await page.keyboard.press('Enter');
    await page.waitFor(2000);
    await page.waitForSelector('#shopsearch-pager');
    await page.click('#shopsearch-sortbar .sorts .sort:nth-child(2)');*/

    await page.waitFor(1500);
    await page.waitForSelector('#shopsearch-pager');

    /*await page.hover('#shopsearch-sortbar .row.dp-row> div:nth-child(1)');
    await page.click('#shopsearch-sortbar .layer-panel .sub-layer-panel:nth-child(4) ~ a');
    await page.waitForSelector('#shopsearch-pager');*/

    try {
        let totalPage = await page.$eval('#shopsearch-pager .total', el => el.innerText);
        totalPage = Number.parseInt(totalPage.split(' ')[1]);
        console.log('总共有：' + totalPage + ' 页');
        for (let index = 1; index <= totalPage; index++) {
            await getWang(index, page);
            if (index === totalPage) {
                browser.close();
                return;
            } else {
                await page.click('#shopsearch-pager .next .J_Ajax.num.icon-tag');
            }
        }
    } catch (error) {
    }
})();
