
// = 'https://space.bilibili.com/161775300/dynamic'

var Kaze = {
    cardList: [],
    historynew: {},
    apinew: {},
    Getdynamic(uid = '161775300') {
        let that = this;
        let xhr = new XMLHttpRequest();
        xhr.open("GET", 'https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=161775300', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                console.log(that);
                let info = JSON.parse(xhr.responseText);
                if (info.code == 0 && info.data != null && info.data.cards != null && info.data.cards.length > 0) {
                    info.data.cards.map(x => {
                        let dynamicInfo = JSON.parse(x.card);
                        that.cardList.push({ card: x.card, time: x.desc.timestamp, dynamicInfo: dynamicInfo, type: dynamicInfo["item"] == undefined ? 0 : 1 })
                    });
                    that.apinew = that.cardList[0];
                    chrome.storage.local.get(['cardList'], result => {
                        if (result != null && result.cardList != null && result.cardList.length > 0) {
                            that.historynew = result.cardList[0];
                            if (that.historynew.time != that.apinew.time) {
                                //console.log(新动态)
                                let dynamicInfo = that.apinew.dynamicInfo;
                                // type==0 视频 ==1 动态
                                if (that.apinew.type == 0) {
                                    chrome.notifications.create(that.historynew.time + '', {
                                        iconUrl: '../image/icon.png',
                                        message: dynamicInfo.dynamic,
                                        title: `饼来了!${dynamicInfo.title}`,
                                        imageUrl: dynamicInfo.pic,
                                        type: "image"
                                    });
                                } else {
                                    dynamicInfo = dynamicInfo.item;
                                    if (dynamicInfo.pictures != null && dynamicInfo.pictures.length > 0) {
                                        chrome.notifications.create(that.historynew.time + '', {
                                            iconUrl: '../image/icon.png',
                                            message: dynamicInfo.description,
                                            title: `饼来了!`,
                                            imageUrl: dynamicInfo.pictures[0].img_src,
                                            type: "image"
                                        });
                                    } else {
                                        chrome.notifications.create(that.historynew.time + '', {
                                            iconUrl: '../image/icon.png',
                                            message: dynamicInfo.description,
                                            title: `饼来了!`,
                                            type: "basic"
                                        });
                                    }

                                }

                                chrome.storage.local.set({ cardList: that.cardList });
                            } else {
                                //等待下一次循环
                                console.log("蹲");
                            }
                        } else {
                            chrome.storage.local.set({ cardList: that.cardList });
                        }
                    });
                }
            }
        }
        xhr.send();
    },
    SetInterval(interval = 300000) {
        console.log("开始");

        setInterval(() => {
            this.Getdynamic();
        }, interval);
    },
    Init() {
        this.Getdynamic();
        chrome.notifications.onClicked.addListener(id => {
            chrome.storage.local.get(['cardList'], result => {
                let todynamic = result.cardList.filter(x => x.time == id);
                if (todynamic != null && todynamic.length > 0) {
                    debugger;
                    if (todynamic[0].type == 0) {
                        chrome.tabs.create({ url: todynamic[0].dynamicInfo.short_link });
                    }
                    else {
                        chrome.tabs.create({ url:'https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=161775300' });
                    }
                }

            })

        })
    }
}
Kaze.Init();


