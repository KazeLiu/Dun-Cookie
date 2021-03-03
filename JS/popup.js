window.onload = function () {
    let win = chrome.extension.getBackgroundPage();
    console.log(win)
    //顺便刷新一下后台
    win.Kaze.GetData(() => {
        let cardlist = [];
        cardlist = win.Kaze.cardlist;
        console.log(cardlist);
        Kaze.ShowList(cardlist);
    });

    let button = document.querySelectorAll('button')
    button.forEach(item => {
        item.addEventListener('click', event => {
            let btn = event.target;
            let id = event.target.id;
            let cardlist = [];
            cardlist = win.Kaze.cardlist;
            switch (id) {
                case 'toB':
                    chrome.tabs.create({ url: 'https://space.bilibili.com/161775300/dynamic' });
                    break;
                case 'toWeibo':
                    chrome.tabs.create({ url: 'https://weibo.com/arknights' });
                    break;
                case 'showB':
                    event.target.classList.toggle('off');
                    if ([...event.target.classList].includes('off')) {
                        Kaze.ShowList(cardlist);
                    } else {
                        Kaze.ShowList(cardlist.filter(x => x.source === "bilibili"));
                    }
                    break;
                case 'showWeibo':
                    event.target.classList.toggle('off');
                    if ([...event.target.classList].includes('off')) {
                        Kaze.ShowList(cardlist);
                    } else {
                        Kaze.ShowList(cardlist.filter(x => x.source === "weibo"));

                    }
                    break;
            }
        })
    })

}
let Kaze = {
    ShowList(cardlist) {
        if (cardlist != null && cardlist.length > 0) {
            let html = '';
            cardlist.map(x => {
                if (x.source === "weibo") {
                    // 处理html
                    let data = x.dynamicInfo.split('<br />').splice(1, x.dynamicInfo.length);
                    data[data.length - 1] = data[data.length - 1].split('<a href')[0];
                    let dynamicInfo = data.join('<br/>');
                    if (x.type == 0) {
                        html += `<div class="card">
                        <div class="time">${common.TimespanTotime(x.time)}发布于微博</div>
                        <div class="content">【视频资源，无法播放，请去微博动态查看】</div>
                            </div>`

                    } else if (x.type == 1) {
                        html += `<div class="card">
                        <div class="time">${common.TimespanTotime(x.time)}发布于微博</div>
                        <div class="content">${dynamicInfo}</div>
                            </div>`
                    }
                } else if (x.source === "bilibili") {
                    if (x.type == 0) {
                        html += `<div class="card">
                        <div class="time">${common.TimespanTotime(x.time)}发布于B站</div>
                        <div class="content">${x.dynamicInfo.title}</div>
                            </div>`
                    } else if (x.type == 1) {
                        let dynamicInfo = x.dynamicInfo.item.description.replace(/\n/g, "<br/>")
                        html += `<div class="card">
                        <div class="time">${common.TimespanTotime(x.time)}发布于B站</div>
                        <div class="content">${dynamicInfo}</div>
                            </div>`
                    }
                }
            });
            document.getElementById('title-content').innerHTML = html;
        }
    }
}
let common = {
    TimespanTotime(date) {
        date = new Date(date * 1000);
        let Y = date.getFullYear();
        let M = (date.getMonth() + 1);
        let D = date.getDate();
        let h = date.getHours();
        let m = date.getMinutes();
        let s = date.getSeconds();
        return `${Y}-${this.addZero(M)}-${this.addZero(D)} ${this.addZero(h)}:${this.addZero(m)}:${this.addZero(s)}`;
    },
    addZero(m) {
        return m < 10 ? '0' + m : m;
    }
}
