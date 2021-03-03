
// = 'https://space.bilibili.com/161775300/dynamic'
// = 'https://space.bilibili.com/456664753/dynamic' 测试 央视新闻
// 297326 自己
var Kaze = {
    //存在本地的总列表 里面有标题，内容，图片，类型
    cardlist: [],
    //请求次数
    dunIndex: 0,
    // 循环的标识
    setIntervalindex: 0,

    SetInterval() {
        chrome.storage.local.get(['time'], result => {
            if (result.time == undefined) {
                result.time = 30000;
                chrome.storage.local.set({
                    time: result.time,
                });
            }
            this.setIntervalindex = setInterval(() => {
                this.dunIndex++;
                this.GetBilibilidynamic();
            }, result.time);
        });
    },
    SendNotice(type, title, message, imageUrl) {
        if (imageUrl) {
            chrome.notifications.create(this.bilihistorylistone.time + '', {
                iconUrl: '../image/icon.png',
                message: message,
                title: title,
                imageUrl: imageUrl,
                type: type
            });
        } else {
            chrome.notifications.create(this.bilihistorylistone.time + '', {
                iconUrl: '../image/icon.png',
                message: message,
                title: title,
                type: type
            });
        }
    },
    // 蹲饼入口
    GetData(success) {
        getWeibo.Getdynamic(null, () => {
            getBili.Getdynamic(null, () => {
                this.cardlist.sort((x, y) => {
                    return x.time > y.time ? -1 : 1
                });
                console.log(this.cardlist);
                if (success) {
                    success();
                }
            });
        });
    },
    Init() {
        this.GetData();

         this.SetInterval();
        // 只打开列表 微博不允许直接连接进入
        // chrome.notifications.onClicked.addListener(id => {
        //     chrome.storage.local.get(['cardList'], result => {
        //         let todynamic = result.cardList.filter(x => x.time == id);
        //         if (todynamic != null && todynamic.length > 0) {
        //             if (todynamic[0].type == 0) {
        //                 chrome.tabs.create({ url: todynamic[0].dynamicInfo.short_link });
        //             }
        //             else {
        //                 chrome.tabs.create({ url: 'https://space.bilibili.com/161775300/dynamic' });
        //             }
        //         }

        //     })
        // })
    }
}


let getBili = {
    // B站：动态列表
    cardlist: [],
    // bilibili版本
    Getdynamic(alert = false, success) {
        let that = this;
        let xhr = new XMLHttpRequest();
        that.cardlist = [];
        xhr.open("GET", `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=161775300`, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                let data = JSON.parse(xhr.responseText);
                if (data.code == 0 && data.data != null && data.data.cards != null && data.data.cards.length > 0) {
                    data.data.cards.map(x => {
                        let dynamicInfo = JSON.parse(x.card);
                        that.cardlist.push({
                            time: x.desc.timestamp,
                            dynamicInfo: dynamicInfo,
                            type: that.GetdynamicType(dynamicInfo),
                            source: 'bilibili'
                        });
                    });
                    console.log(that.cardlist);
                    //重新计算组合
                    Kaze.cardlist = Kaze.cardlist.filter(x => x.source != "bilibili");
                    Kaze.cardlist.push(...that.cardlist);
                    chrome.storage.local.set({
                        bilicardList: that.cardlist,
                        cardList: Kaze.cardlist
                    }, () => {
                        if (success) {
                            success();
                        }
                    });
                }
            }
        }
        xhr.send();
    },
    GetdynamicType(dynamicInfo) {
        // 0为视频 1为动态
        let type = -1;
        if (dynamicInfo["item"] == undefined) {
            type = 0;
        }
        // 忽略转发
        // else if (dynamicInfo["item"] != undefined && dynamicInfo["origin"] != undefined) {
        //     type = 2;
        // } 
        else if (dynamicInfo["item"] != undefined) {
            type = 1;
        }
        return type;
    },
}

let getWeibo = {
    // 微博：动态列表
    cardlist: [],
    // 微博
    Getdynamic(alert = false, success) {
        let that = this;
        let xhr = new XMLHttpRequest();
        that.cardlist = [];
        xhr.open("GET", `https://m.weibo.cn/api/container/getIndex?type=uid&value=6279793937&containerid=1076036279793937`, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                let data = JSON.parse(xhr.responseText);
                if (data.ok == 1 && data.data != null && data.data.cards != null && data.data.cards.length > 0) {
                    data.data.cards.map(x => {
                        //删除置顶 x.mblog.title != undefined
                        if (x.mblog.title == undefined) {
                            let dynamicInfo = x.mblog;
                            that.cardlist.push({
                                time: Math.floor(new Date(dynamicInfo.created_at).getTime() / 1000),
                                dynamicInfo: dynamicInfo.text,
                                type: that.GetdynamicType(dynamicInfo.text),
                                source: 'weibo'
                            });
                        }
                    });
                    console.log(that.cardlist);
                    //重新计算组合
                    Kaze.cardlist = Kaze.cardlist.filter(x => x.source != "weibo");
                    Kaze.cardlist.push(...that.cardlist);
                    chrome.storage.local.set({
                        weibocardList: that.cardlist,
                        cardList: Kaze.cardlist
                    }, () => {
                        if (success) {
                            success();
                        }
                    });
                }
            }
        }
        xhr.send();
    },
    GetdynamicType(dynamicInfo) {
        // 0为视频 1为动态
        let type = -1;
        if (dynamicInfo.split('明日方舟Arknights的微博视频').length > 1) {
            type = 0;
        }
        else {
            type = 1;
        }
        return type;
    },
}

Kaze.Init();