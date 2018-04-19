const fs = require('fs');
const puppeteer = require('puppeteer');

const variable = {
    musicList: []
}

//读取歌曲名称
function getMusicList() {
    return new Promise((resolve, reject) => {
        fs.readFile('待爬歌曲.txt', (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data.toString().split('\r\n'));
        });
    });
}

//获取歌词
function  getLyric(musicName,page) {
    return new Promise(async(resolve, reject) => {
        // 进入页面
        await page.goto('https://music.163.com/#');

        // 点击搜索框拟人输入
        await page.type('.txt.j-flag', musicName, { delay: 0 });

        // 回车
        await page.keyboard.press('Enter');

        // 获取歌曲列表的 iframe
        await page.waitFor(2000);
        let iframe = await page.frames().find(f => f.name() === 'contentFrame');
        const SONG_LS_SELECTOR = await iframe.$('.srchsongst');

        // 获取歌曲 鬼才会想起 的地址
        const selectedSongHref = await iframe.evaluate(e => {
            const songList = Array.from(e.childNodes);
            return songList[0].childNodes[1].firstChild.firstChild.firstChild.href;
        }, SONG_LS_SELECTOR);

        // 进入歌曲页面
        await page.goto(selectedSongHref);

        // 获取歌曲页面嵌套的 iframe
        await page.waitFor(2000);
        iframe = await page.frames().find(f => f.name() === 'contentFrame');

        // 点击 展开按钮
        const unfoldButton = await iframe.$('#flag_ctrl');
        await unfoldButton.click();

        // 获取歌词
        const LYRIC_SELECTOR = await iframe.$('#lyric-content');
        const lyricCtn = await iframe.evaluate(e => {
            return e.innerText;
        }, LYRIC_SELECTOR);

        fs.appendFileSync('歌词.txt', '\n================================'+musicName+'============================\n')
        fs.appendFileSync('歌词.txt', lyricCtn)
        resolve()
    });
}

//执行入口
(async() => {
    const browser = await (puppeteer.launch({ headless: false }));
    const page = await browser.newPage();
    variable.musicList = await getMusicList();
    for (let index in variable.musicList) {
        await getLyric(variable.musicList[index],page);
    }
    browser.close();
})();
