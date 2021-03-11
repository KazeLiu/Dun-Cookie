var Kaze = {
    cardlistdm: {
        weibo: [],
        cho3: [],
        yj: [],
        bili: []
    },
    isTest: false,
    //请求次数
    dunIndex: 0,
    dunTime: new Date(),
    // 循环的标识
    setIntervalindex: 0,
    setting: {
        time: 15000,
        getweibo: true,
        getbili: true,
        getyj: true,
        getcho3: true,
        fontsize: 'normal'
    },
    SetInterval(time) {
        this.setIntervalindex = setInterval(() => {
            this.dunIndex++;
            this.dunTime = new Date();
            this.GetData();
        }, parseInt(time));
    },
    RegexpWeibo(text) {
        return text.replace(
            /<\a.*?>|<\/a>|<\/span>|<\span.*>|<span class="surl-text">|<span class="url-icon">|<\img.*?>|全文|网页链接/g,
            '')
    },
    SendNotice(title, message, imageUrl, time) {
        if (imageUrl) {
            chrome.notifications.create(time + '_', {
                iconUrl: '../image/icon.png',
                message: message,
                title: title,
                imageUrl: imageUrl,
                type: "image"
            });
        } else {
            chrome.notifications.create(time + '_', {
                iconUrl: '../image/icon.png',
                message: message,
                title: title,
                type: "basic"
            });
        }
    },
    // 蹲饼入口
    GetData() {
        this.setting.getweibo?getWeibo.Getdynamic():Kaze.cardlistdm.weibo = [];
        this.setting.getbili?getBili.Getdynamic():Kaze.cardlistdm.bili = [];
        this.setting.getyj?getYj.Getdynamic():Kaze.cardlistdm.yj = [];
        this.setting.getcho3?getCho3.Getdynamic():Kaze.cardlistdm.cho3 = [];
    },
    Get(url, success) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                success(xhr.responseText);
            }
        }
        xhr.send();
    },
    Init() {
        let that = this;
        chrome.storage.local.get(['setting'], result => {
            if (result.setting == undefined) {
                chrome.storage.local.set({
                    setting: this.setting,
                });
            } else {
                this.setting = result.setting;
            }
            this.GetData();
            this.SetInterval(this.setting.time);
        });

        // this.TestSetInterval(3000);
        // 监听标签
        chrome.notifications.onClicked.addListener(id => {
            let todynamic = that.cardlistsort.filter(x => x.time + "_" == id);
            if (todynamic != null && todynamic.length > 0) {
                chrome.tabs.create({ url: todynamic[0].url });
            } else {
                alert('最近列表内没有找到该标签');
            }
        });
        if (this.isTest) {
            getBili.url = `test/bJson.json?host_uid=161775300`;
            getWeibo.url = `test/wJson.json?type=uid&value=6279793937&containerid=1076036279793937`;
            getYj.url = `test/yJson.json`;
            getCho3.url = `test/cJson.json?type=uid&value=6441489862&containerid=1076036441489862`
        }
    }
}


let getBili = {
    url: `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=161775300`,

    dturl: `https://space.bilibili.com/161775300/dynamic`,

    // B站：动态列表
    cardlist: [],
    // bilibili版本
    Getdynamic(success) {
        let that = this;
        that.cardlist = [];
        Kaze.Get(that.url + `&kaze=${Math.random().toFixed(3)}`, (responseText) => {
            let data = JSON.parse(responseText);
            if (data.code == 0 && data.data != null && data.data.cards != null && data.data.cards.length > 0) {
                data.data.cards.map(x => {
                    let dynamicInfo = JSON.parse(x.card);
                    that.cardlist.push({
                        time: x.desc.timestamp,
                        dynamicInfo: dynamicInfo,
                        type: that.GetdynamicType(dynamicInfo),
                        source: 0,
                        url: dynamicInfo.short_link || that.dturl
                    });
                });
                that.JudgmentNew(that.cardlist);
                Kaze.cardlistdm.bili = that.cardlist;
            }
        });
    },
    GetdynamicType(dynamicInfo) {
        // 0为视频 1为动态
        let type = -1;
        if (dynamicInfo.hasOwnProperty('item')) {
            type = 1;
        }
        else {
            type = 0;
        }
        return type;
    },
    JudgmentNew(dynamiclist) {
        let oldcardlist = Kaze.cardlistdm.bili
        if (oldcardlist.length > 0 && oldcardlist[0].time != dynamiclist[0].time) {
            let dynamicInfo = dynamiclist[0];
            // 0为视频 1为动态
            if (dynamicInfo.type == 0) {
                dynamicInfo = dynamicInfo.dynamicInfo
                Kaze.SendNotice(`【B站】喂公子吃饼!`, `${dynamicInfo.title}:${dynamicInfo.dynamic}`, dynamicInfo.pic, dynamicInfo.time)
            } else {
                if (dynamicInfo.type == 2) {
                } else {
                    let time = dynamicInfo.time;
                    dynamicInfo = dynamicInfo.dynamicInfo.item;
                    if (dynamicInfo != null && dynamicInfo != undefined && dynamicInfo.pictures != undefined) {
                        Kaze.SendNotice(`【B站】喂公子吃饼!`, dynamicInfo.content || dynamicInfo.description, dynamicInfo.pictures[0].img_src, time);
                    } else {
                        Kaze.SendNotice(`【B站】喂公子吃饼!`, dynamicInfo.content || dynamicInfo.description, null, time);
                    }
                }


            }
        }
    }
}

let getWeibo = {
    url: `https://m.weibo.cn/api/container/getIndex?type=uid&value=6279793937&containerid=1076036279793937`,

    dturl: `https://weibo.com/arknights`,

    // 微博：动态列表
    cardlist: [],
    // 微博
    Getdynamic(success) {
        let that = this;
        that.cardlist = [];
        Kaze.Get(that.url + `&kaze=${Math.random().toFixed(3)}`, (responseText) => {
            let data = JSON.parse(responseText);
            if (data.ok == 1 && data.data != null && data.data.cards != null && data.data.cards.length > 0) {
                data.data.cards.map(x => {
                    if (x.hasOwnProperty('mblog') && !x.mblog.hasOwnProperty('title')) {
                        let dynamicInfo = x.mblog;
                        that.cardlist.push({
                            time: Math.floor(new Date(dynamicInfo.created_at).getTime() / 1000),
                            dynamicInfo: dynamicInfo.text,
                            text: Kaze.RegexpWeibo(dynamicInfo.text),
                            image: dynamicInfo.bmiddle_pic || dynamicInfo.original_pic,
                            type: that.GetdynamicType(dynamicInfo),
                            source: 1,
                            url: x.scheme
                        });

                    }
                });
                // 判定是否是新的
                that.JudgmentNew(that.cardlist);
                Kaze.cardlistdm.weibo = that.cardlist;
            }
        });
    },
    GetdynamicType(dynamicInfo) {
        // 0为视频 1为动态
        let type = -1;
        try {
            if (dynamicInfo.page_info.type == "video") {
                type = 0;
            }
            else {
                type = 1;
            }
        } catch (error) {

        }
        return type;
    },
    JudgmentNew(dynamiclist) {
        let oldcardlist = Kaze.cardlistdm.weibo;
        if (oldcardlist.length > 0 && oldcardlist[0].time != dynamiclist[0].time) {
            if (dynamiclist[0].image) {
                Kaze.SendNotice("【微博】喂公子吃饼！", dynamiclist[0].text.split('<br/>').join(''), dynamiclist[0].image, dynamiclist[0].time);
            }
            else {
                Kaze.SendNotice("【微博】喂公子吃饼！", dynamiclist[0].text.split('<br/>').join(''), null, dynamiclist[0].time);
            }
        }
    }
}

let getYj = {
    url: `https://ak-fs.hypergryph.com/announce/IOS/announcement.meta.json`,
    // 通讯录：动态列表
    cardlist: [],
    // 通讯录
    Getdynamic(success) {
        let that = this;
        that.cardlist = [];
        Kaze.Get(that.url + `?kaze=${Math.random().toFixed(3)}`, (responseText) => {
            let data = JSON.parse(responseText);
            data.announceList.forEach(x => {
                // 屏蔽几个条目 先用ID 看有没有问题
                if (!(x.announceId == 94 || x.announceId == 98 || x.announceId == 192 || x.announceId == 95 || x.announceId == 97)) {
                    that.cardlist.push({
                        time: Math.floor(new Date(`${(new Date().getFullYear())}/${x.month}/${x.day} 00:00:00`).getTime() / 1000),
                        dynamicInfo: x.title,
                        announceId: x.announceId,
                        source: 2,
                        url: x.webUrl
                    });
                }
            });
            // 判定是否是新的
            that.JudgmentNew(that.cardlist);
            Kaze.cardlistdm.yj = that.cardlist;

        });
    },
    JudgmentNew(dynamiclist) {
        let oldcardlist = Kaze.cardlistdm.yj;
        if (oldcardlist.length > 0 && oldcardlist[0].announceId != dynamiclist[0].announceId) {
            Kaze.SendNotice("【制作组通讯】喂公子吃饼！", dynamiclist[0].dynamicInfo, null, dynamiclist[0].time);
        }
    }
}

let getCho3 = {
    url: `https://m.weibo.cn/api/container/getIndex?type=uid&value=6441489862&containerid=1076036441489862`,
    dturl: `https://weibo.com/arknights`,

    // 微博：动态列表
    cardlist: [],
    // 微博
    Getdynamic(success) {
        let that = this;
        that.cardlist = [];
        Kaze.Get(that.url + `&kaze=${Math.random().toFixed(3)}`, (responseText) => {
            let data = JSON.parse(responseText);
            if (data.ok == 1 && data.data != null && data.data.cards != null && data.data.cards.length > 0) {
                data.data.cards.map(x => {
                    if (x.hasOwnProperty('mblog') && !x.mblog.hasOwnProperty('title')) {
                        let dynamicInfo = x.mblog;
                        that.cardlist.push({
                            time: Math.floor(new Date(dynamicInfo.created_at).getTime() / 1000),
                            dynamicInfo: dynamicInfo.text,
                            text: Kaze.RegexpWeibo(dynamicInfo.text),
                            image: dynamicInfo.bmiddle_pic || dynamicInfo.original_pic,
                            type: that.GetdynamicType(dynamicInfo),
                            source: 3,
                            url: x.scheme
                        });

                    }
                });
                // 判定是否是新的
                that.JudgmentNew(that.cardlist);
                Kaze.cardlistdm.cho3 = that.cardlist;
            }
        });
    },
    GetdynamicType(dynamicInfo) {
        // 0为视频 1为动态
        let type = -1;
        try {
            if (dynamicInfo.page_info.type == "video") {
                type = 0;
            }
            else {
                type = 1;
            }
        } catch (error) {

        }
        return type;
    },
    JudgmentNew(dynamiclist) {
        let oldcardlist = Kaze.cardlistdm.cho3;
        if (oldcardlist.length > 0 && oldcardlist[0].time != dynamiclist[0].time) {
            if (dynamiclist[0].image) {
                Kaze.SendNotice("【微博】喂公子吃饼！", dynamiclist[0].text.split('<br/>').join(''), dynamiclist[0].image, dynamiclist[0].time);
            }
            else {
                Kaze.SendNotice("【微博】喂公子吃饼！", dynamiclist[0].text.split('<br/>').join(''), null, dynamiclist[0].time);
            }
        }
    }
}

Kaze.Init();