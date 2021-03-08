window.onload = function () {
    let win = chrome.extension.getBackgroundPage();
    //顺便刷新一下后台
    // win.Kaze.GetData(() => {

    // });

    let cardlist = [];
    cardlist = win.Kaze.cardlistsort;
    cardlist.sort((x, y) => x.time < y.time ? 1 : -1);
    Kaze.ShowList(cardlist);
    let card = document.querySelectorAll('.card');
    card.forEach(item => {
        item.addEventListener('click', event => {
            chrome.tabs.create({ url: event.currentTarget.dataset.url });
        });
    });

    let button = document.querySelectorAll('button');
    button.forEach(item => {
        item.addEventListener('click', event => {
            let id = event.target.id;
            switch (id) {
                case 'toB':
                    chrome.tabs.create({ url: 'https://space.bilibili.com/161775300/dynamic' });
                    break;
                case 'toWeibo':
                    chrome.tabs.create({ url: 'https://weibo.com/arknights' });
                    break;
                case 'showB':
                    event.target.classList.toggle('off');
                    document.querySelectorAll('.card[data-type="0"]').forEach(item => {
                        item.classList.toggle('none');
                    });
                    break;
                case 'showWeibo':
                    event.target.classList.toggle('off');
                    document.querySelectorAll('.card[data-type="1"]').forEach(item => {
                        item.classList.toggle('none');
                    });
                    break;
                case 'showyj':
                    event.target.classList.toggle('off');
                    document.querySelectorAll('.card[data-type="2"]').forEach(item => {
                        item.classList.toggle('none');
                    });
                    break;
                case 'toSetting':
                    var urlToOpen = chrome.extension.getURL('html/options.html');
                    chrome.tabs.create({
                        url: urlToOpen
                    });
                    break;

            }
        })
    });

    // 根据设置隐藏部分列表
    // 临时方法  因为异步
    setTimeout(() => {
        chrome.storage.local.get(['setting'], result => {
            let setting = result.setting;
            if (!setting.getbili) {
                document.getElementById('showB').click();
            }
            if (!setting.getweibo) {
                document.getElementById('showWeibo').click();
            }
            if (!setting.getyj) {
                document.getElementById('showyj').click();
            }
            document.getElementById('title-content').classList.add(setting.fontsize);
        });
    }, 100);
}
let Kaze = {
    ShowList(cardlist) {
        if (cardlist != null && cardlist.length > 0) {
            let html = '';
            cardlist.map(x => {
                if (x.source == 0) {
                    if (x.type == 0) {
                        html += `<div class="card" data-type="0" data-url="${x.url}">
                        <div class="head">
                            <img src="../image/bili.ico">
                            <span class="time">${common.TimespanTotime(x.time)}</span>
                        </div>
                        <div class="content">${x.dynamicInfo.title}</div>
                            </div>`;
                    } else if (x.type == 1) {
                        let dynamicInfo = '';
                        if (x.dynamicInfo.item.description) {
                            dynamicInfo = x.dynamicInfo.item.description.replace(/\n/g, "<br/>");
                        } else {
                            dynamicInfo = x.dynamicInfo.item.content.replace(/\n/g, "<br/>");
                        }

                        html += `<div class="card" data-type="0" data-url="${x.url}">
                        <div class="head">
                            <img src="../image/bili.ico">
                                <span class="time">${common.TimespanTotime(x.time)}</span>
                            </div>
                        <div class="content">${dynamicInfo}</div>
                            </div>`;
                    }
                }
                else if (x.source == 1) {
                    // 处理html
                    if (x.type == 0) {
                        html += `<div class="card" data-type="1" data-url="${x.url}">
                        <div class="head">
                        <img src="../image/weibo.ico">
                            <span class="time">${common.TimespanTotime(x.time)}</span>
                        </div>
                        <div class="content">【视频资源，无法播放，请去微博动态查看】</div>
                            </div>`;

                    } else if (x.type == 1) {
                        html += `<div class="card" data-type="1"   data-url="${x.url}">
                            <div class="head">
                            <img src="../image/weibo.ico">
                            <span class="time">${common.TimespanTotime(x.time)}</span>
                        </div>
                        <div class="content">${x.text}</div>
                            </div>`;
                    }
                }
                else if (x.source == 2) {
                    html += `<div class="card" data-type="2"  data-url="${x.url}" >
                            <div class="head">
                            <img src="../image/mrfz.ico">
                            <span class="time">${common.TimespanTotime(x.time, 2)}</span>
                        </div>
                        <div class="content">${x.dynamicInfo}</div>
                            </div>`;
                }
            });
            document.getElementById('title-content').innerHTML = html;
        }
    }
}
let common = {
    TimespanTotime(date, type = 1) {
        date = new Date(date * 1000);
        let Y = date.getFullYear();
        let M = (date.getMonth() + 1);
        let D = date.getDate();
        let h = date.getHours();
        let m = date.getMinutes();
        let s = date.getSeconds();
        if (type == 2) {
            return `${Y}-${this.addZero(M)}-${this.addZero(D)}`;
        }
        return `${Y}-${this.addZero(M)}-${this.addZero(D)} ${this.addZero(h)}:${this.addZero(m)}:${this.addZero(s)}`;
    },
    addZero(m) {
        return m < 10 ? '0' + m : m;
    }
}
