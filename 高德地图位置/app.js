var https = require('https');
var http = require('http');
var fs = require('fs');

let wwList = [];
let comList = [];

//读取名称
function getExcelList(fileName) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data.toString().split('\r\n'));
    });
  });
}

// 获取一级列表
const getList = (item, isWW) => {
  return new Promise((resolve, reject) => {
    let respFileName = '';
    if (isWW) {
      respFileName = '旺旺名称结果.txt';
      console.log('正在拉取旺旺店铺-->' + item);
    } else {
      respFileName = '公司名称结果.txt';
      console.log('正在拉取公司-->' + item);
    }
    let urlItem = encodeURI(
      'http://restapi.amap.com/v3/place/text?s=rsv3&children=&key=8325164e247e15eea68b59e89200988b&page=1&offset=10&city=330100&language=zh_cn&callback=jsonp_291576_&platform=JS&logversion=2.0&sdkversion=1.3&appname=http%3A%2F%2Flbs.amap.com%2Fconsole%2Fshow%2Fpicker&csid=DB516DAB-B432-47AC-AC14-08B23FF195A5&keywords=' +
        item
    );
    http.get(urlItem, (res) => {
      let html = '';
      res.setEncoding('utf-8');
      res.on('data', (chunk) => {
        html += chunk;
      });
      res.on('end', () => {
        html = JSON.parse(html.substring(14, html.length - 1));
        let address = '';
        if (html.count === '0') {
          address = '查无结果';
        } else {
          address = html.pois[0].pname + html.pois[0].cityname + html.pois[0].adname + html.pois[0].address;
        }
        fs.appendFileSync(respFileName, address + '\n');
        resolve(html);
      });
    });
  });
};

let init = async () => {
  console.log('正在获取旺旺名称文件集合');
  wwList = await getExcelList('旺旺名称.txt');
  console.log('正在获取公司名称文件集合');
  comList = await getExcelList('公司名称.txt');
  console.log('名称获取完毕');
  for (let i in wwList) {
    console.log('第' + (parseInt(i) + 1) + '/' + wwList.length + '个');
    // 根据旺旺店铺获取地址
    await getList(wwList[i], true);

    // 根据公司名称获取地址
    await getList(comList[i], false);
    await sleep(2000);
  }
};

function sleep(time = 0) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

init();
