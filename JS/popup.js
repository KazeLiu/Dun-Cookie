$(function () {
    let win = chrome.extension.getBackgroundPage();
    console.log(win)
    //顺便刷新一下后台
    win.Kaze.Getdynamic();
    let cardList = [];
    cardList = win.Kaze.cardList;
    console.log(cardList);
    if (cardList != null && cardList.length > 0) {
        cardList.map(x => {
            if (x.type == 1) {
                //动态
                $("#title-content").append(`<div class="card"><div class="time">发布时间：${common.TimespanTotime(x?.time)}</div><div class="content">${x?.dynamicInfo?.item?.description}</div></div>`);
            }
            else if (x.type == 0) {
                //视频
                $("#title-content").append(`<div class="card"><div class="time">发布时间：${common.TimespanTotime(x?.time)}</div><div class="content">${x?.dynamicInfo?.title}</div></div>`);
            }
        })
    }
    $("#toLink").click(()=>{
        chrome.tabs.create({ url:'https://space.bilibili.com/161775300/dynamic' });
    });
});

let common={
    TimespanTotime(date){
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
