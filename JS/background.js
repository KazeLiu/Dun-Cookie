
// = 'https://space.bilibili.com/161775300/dynamic'
// = 'https://space.bilibili.com/456664753/dynamic' 测试 央视新闻
// 297326 自己
var Kaze = {
    cardList: [],
    historynew: {},
    apinew: {},
    dunIndex: 0,
    setIntervalindex: 0,
    Getdynamic(uid = '456664753') {
        let that = this;
        let xhr = new XMLHttpRequest();
        xhr.open("GET", `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=${uid}`, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                that.cardList = [];
                let info = JSON.parse(xhr.responseText);
                if (info.code == 0 && info.data != null && info.data.cards != null && info.data.cards.length > 0) {
                    info.data.cards.map(x => {
                        let dynamicInfo = JSON.parse(x.card);
                        let type = that.GetdynamicType(dynamicInfo);
                        let origindynamicInfo = {};
                        let origindyType = -1;
                        if (type == 2) {
                            origindynamicInfo = JSON.parse(dynamicInfo.origin);
                            origindyType = that.GetdynamicType(origindynamicInfo);
                        }
                        that.cardList.push({
                            card: x.card, time: x.desc.timestamp, dynamicInfo: dynamicInfo, type: type,
                            origindynamicInfo: origindynamicInfo,
                            origindyType: origindyType
                        })
                    });
                    that.apinew = that.cardList[0];
                    chrome.storage.local.get(['cardList'], result => {
                        if (result != null && result.cardList != null && result.cardList.length > 0) {
                            that.historynew = result.cardList[0];
                            if (that.historynew.time != that.apinew.time) {
                                let dynamicInfo = that.apinew.dynamicInfo;
                                let type = that.apinew.type;
                                let origindynamic = that.apinew.origindynamicInfo;
                                let origindyType = that.apinew.origindyType;
                                //参数反复利用
                                dynamicInfo = dynamicInfo.item;
                                // type==0 视频 ==1 动态 ==2转发
                                if (type == 0) {
                                    that.SendNotice("image", `饼来了!${dynamicInfo.title}`, dynamicInfo.dynamic, dynamicInfo.pic)
                                } else {
                                    if (type == 2) {
                                        //转发数据
                                        if (origindyType == 1) {
                                            dynamicInfo.content = `${dynamicInfo.content}//@${origindynamic?.user?.name}:${origindynamic?.item?.description}`;
                                            if (origindynamic?.item?.pictures != undefined) {
                                                that.SendNotice("image", `[转发动态]饼来了!`, `${dynamicInfo.content}//@${origindynamic.user.name}:${origindynamic.item.description}`, origindynamic.item.pictures[0].img_src)
                                            } else {
                                                that.SendNotice("basic", `[转发动态]饼来了!`, `${dynamicInfo.content}//@${origindynamic.user.name}:${origindynamic.item.description}`);
                                            }
                                        } else if (origindyType == 2) {
                                            that.SendNotice("basic", `[转发内容]饼来了!`, `套娃转发 不解析了`);
                                        } else if (origindyType == 0) {
                                            that.SendNotice("image", `[转发视频]饼来了!${origindynamic.title}`, `${dynamicInfo.content}//@${origindynamic.owner.name}:${origindynamic.title}`, origindynamic.pic);
                                        }
                                    } else {
                                        if (dynamicInfo?.pictures != undefined) {
                                            that.SendNotice("image", `饼来了!`, dynamicInfo?.content || dynamicInfo?.description, dynamicInfo?.pictures[0].img_src)
                                        } else {
                                            that.SendNotice("basic", `饼来了!`, dynamicInfo?.content || dynamicInfo?.description);
                                        }
                                    }


                                }

                                chrome.storage.local.set({ cardList: that.cardList });
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
    SetInterval() {
        chrome.storage.local.get(['time'], result => {
            if (result == {}) {
                time = 30000;
                chrome.storage.local.set({
                    time: time,
                });
            }
            this.setIntervalindex = setInterval(() => {
                this.dunIndex++;
                this.Getdynamic();
            }, result.time);
        });

    },
    SendNotice(type, title, message, imageUrl) {
        if (imageUrl) {
            chrome.notifications.create(this.historynew.time + '', {
                iconUrl: '../image/icon.png',
                message: message,
                title: title,
                imageUrl: imageUrl,
                type: type
            });
        } else {
            chrome.notifications.create(this.historynew.time + '', {
                iconUrl: '../image/icon.png',
                message: message,
                title: title,
                type: type
            });
        }

    },
    GetdynamicType(dynamicInfo) {
        let type = -1;
        if (dynamicInfo["item"] == undefined) {
            type = 0;
        }
        else if (dynamicInfo["item"] != undefined && dynamicInfo["origin"] != undefined) {
            type = 2;
        } else if (dynamicInfo["item"] != undefined) {
            type = 1;
        }
        return type;
    },
    Init() {
        this.Getdynamic();
        this.SetInterval();
        chrome.notifications.onClicked.addListener(id => {
            chrome.storage.local.get(['cardList'], result => {
                let todynamic = result.cardList.filter(x => x.time == id);
                if (todynamic != null && todynamic.length > 0) {
                    if (todynamic[0].type == 0) {
                        chrome.tabs.create({ url: todynamic[0].dynamicInfo.short_link });
                    }
                    else {
                        chrome.tabs.create({ url: 'https://space.bilibili.com/161775300/dynamic' });
                    }
                }

            })

        })
    }
}
Kaze.Init();


