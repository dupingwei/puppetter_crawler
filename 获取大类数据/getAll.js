const fs = require('fs');
const puppeteer = require('puppeteer');

const shopTypeList = [
    {name: '淘宝店', param: 'goodrate=&isb=0&shop_type=&ratesum='},
   {name: '金冠', param: 'goodrate=&isb=0&shop_type=&ratesum=jin'},
  {name: '皇冠', param: 'goodrate=&isb=0&shop_type=&ratesum=huang'},
    {name: '钻级', param: 'goodrate=&isb=0&shop_type=&ratesum=zhuan'},
    {name: '心级', param: 'goodrate=&isb=0&shop_type=&ratesum=xin'},
   {name: '天猫', param: 'isb=1&shop_type=&ratesum=&goodrate='},
    {name: '全球购', param: 'goodrate=&shop_type=2&isb=&ratesum='},
    {name: '不限', param: 'goodrate=&shop_type=&isb=&ratesum='}
];
const nowTypeList = ['成人']

let nowType = '';
let shopType = {};

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
        console.log('爬取《' + nowType + '》数据，当前类目：' + shopType.name + ', 第 ' + index + ' 页, ' + '本页数量:' + itemLength);
        fs.open('日志.log', 'a', (err, fd) => {
            if (err) throw err;
            fs.appendFile(fd, (new Date()).toLocaleDateString() + " " + (new Date()).toLocaleTimeString() + '\t爬取《' + nowType + '》数据，当前类目：' + shopType.name + ', 第 ' + index + ' 页, ' + '本页数量:' + itemLength + '\n', 'utf8', (err) => {
                fs.close(fd, (err) => {
                    if (err) throw err;
                });
                if (err) throw err;
            });
        });
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
                fs.open(nowType + shopType.name + '.txt', 'a', (err, fd) => {
                    if (err) throw err;
                    fs.appendFile(fd,
                        infoWW.wwName + '\t' +
                        infoWW.shopName + '\t' +
                        infoWW.href + '\t' +
                        infoWW.shopHref + '\t' +
                        infoWW.sale + '\t' +
                        infoWW.sum + '\t' +
                        infoWW.address.replace(/\s+/g, "-") + '\t' +
                        infoWW.mainCat.replace(/\s+/g, ",") + '\t' +
                        infoWW.unitPrice + '\t' +
                        infoWW.dsrOne + '\t' +
                        infoWW.dsrOneCp + '\t' +
                        infoWW.dsrTwo + '\t' +
                        infoWW.dsrTwoCp + '\t' +
                        infoWW.dsrThree + '\t' +
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
                fs.open('日志.log', 'a', (err, fd) => {
                    if (err) throw err;
                    fs.appendFile(fd, (new Date()).toLocaleDateString() + " " + (new Date()).toLocaleTimeString() + '\t第 ' + index + ' 页，当次第 ' + i + ' 个失败！' + '\n', 'utf8', (err) => {
                        fs.close(fd, (err) => {
                            if (err) throw err;
                        });
                        if (err) throw err;
                    });
                });
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

	for(let jj = 0 ; jj< nowTypeList.length ; jj++){
		nowType = nowTypeList[jj];
		for (let item in shopTypeList) {
			console.log(item)
			shopType = shopTypeList[item];
			// 进入页面 ==> 金冠店
			await page.goto('https://shopsearch.taobao.com/search?app=shopsearch&q=' + decodeURI(nowType) + '&tracelog=shopsearchnoqcat&' + shopType.param);

			await page.waitFor(1500);
			await page.waitForSelector('#shopsearch-pager');

			try {
				let totalPage = await page.$eval('#shopsearch-pager .total', el => el.innerText);
				totalPage = Number.parseInt(totalPage.split(' ')[1]);
				console.log('总共有：' + totalPage + ' 页');
				for (let index = 1; index <= totalPage; index++) {
					await getWang(index, page);
					if (index === totalPage) {
						break
					} else {
						await page.click('#shopsearch-pager .next .J_Ajax.num.icon-tag');
					}
				}
			} catch (error) {
			}
		}	
		if (jj === (nowTypeList.length - 1)) {
			browser.close();
			return
		}
	}
    
})();
