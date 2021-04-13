var Kaze = {
    cardlistdm: {
        weibo: [],
        cho3: [],
        ys3: [],
        yj: [],
        bili: []
    },
    version: '1.3.6  Beta',
    isTest: false,
    isFrist: true,
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
        getys3: true,
        fontsize: 'normal',
        imgshow: true
    },
    SetInterval(time) {
        this.setIntervalindex = setInterval(() => {
            this.dunTime = new Date();
            this.GetData();
        }, parseInt(time));
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
        this.dunIndex++;
        this.setting.getweibo ? getWeibo.Getdynamic() : Kaze.cardlistdm.weibo = [];
        this.setting.getbili ? getBili.Getdynamic() : Kaze.cardlistdm.bili = [];
        this.setting.getyj ? getYj.Getdynamic() : Kaze.cardlistdm.yj = [];
        this.setting.getcho3 ? getCho3.Getdynamic() : Kaze.cardlistdm.cho3 = [];
        this.setting.getys3 ? getYs3.Getdynamic() : Kaze.cardlistdm.ys3 = [];
    },
    Get(url, success) {
        try {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText != "") {
                    success(xhr.responseText);
                }
            }
            xhr.send();
        } catch (error) {
            console.log(error);
        }
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

        // 监听标签
        chrome.notifications.onClicked.addListener(id => {
            let { weibo = [], cho3 = [], yj = [], bili = [] } = Kaze.cardlistdm;
            let cardlist = [...weibo, ...cho3, ...yj, ...bili];
            let todynamic = cardlist.filter(x => x.time + "_" == id);
            if (todynamic != null && todynamic.length > 0) {
                chrome.tabs.create({ url: todynamic[0].url });
            } else {
                alert('最近列表内没有找到该标签');
            }
        });
        if (this.isTest) {
            getBili.url = `test/bJson.json?host_uid=161775300`;
            getWeibo.opt.url = `test/wJson.json?type=uid&value=6279793937&containerid=1076036279793937`;
            getYj.url = `test/yJson.json`;
            getCho3.opt.url = `test/cJson.json?type=uid&value=6441489862&containerid=1076036441489862`;
            getYs3.opt.url = `test/ysJson.json?type=uid&value=6441489862&containerid=1076036441489862`;
        }
    }
}

let getAndProcessWeiboData = {
    cardlist: {},
    defopt: {
        url: '',//网址
        dturl: '',//连接网址
        title: '',//弹窗标题
        dataName: '',//数据源对象名称
        success: {},//回调方法
        source: 1,//来源
    },
    getdynamic(opt) {
        let that = this;
        opt = Object.assign({}, that.defopt, opt);
        that.cardlist[opt.dataName] = [];
        Kaze.Get(opt.url + `&kaze=${Math.random().toFixed(3)}`, (responseText) => {
            try {
                let data = JSON.parse(responseText);
                if (data.ok == 1 && data.data != null && data.data.cards != null && data.data.cards.length > 0) {
                    data.data.cards.map(x => {
                        if (x.hasOwnProperty('mblog') && !x.mblog.hasOwnProperty('title') && !x.mblog.hasOwnProperty('retweeted_status')) {
                            let dynamicInfo = x.mblog;
                            that.cardlist[opt.dataName].push({
                                time: Math.floor(new Date(dynamicInfo.created_at).getTime() / 1000),
                                dynamicInfo: dynamicInfo.text,
                                text: that.regexp(dynamicInfo.text),
                                image: dynamicInfo.bmiddle_pic || dynamicInfo.original_pic,
                                type: that.getdynamicType(dynamicInfo),
                                source: opt.source,
                                url: x.scheme
                            });
                        }
                    });
                    // 判定是否是新的
                    that.cardlist[opt.dataName].sort((x, y) => x.time < y.time ? 1 : -1);
                    let hasNew = that.judgmentNew(that.cardlist[opt.dataName], opt);
                    Kaze.cardlistdm[opt.dataName] = that.cardlist[opt.dataName];
                    // console.log( that.cardlist[opt.dataName]);
                    if (typeof opt.success == 'function') {
                        opt.success(hasNew, that.cardlist[opt.dataName]);
                    }
                }
            } catch (error) {
            }
        });
    },
    getdynamicType(dynamic) {
        // 0为视频 1为动态
        let type = -1;
        if (dynamic.hasOwnProperty("page_info") && dynamic.page_info.hasOwnProperty('type') && dynamic.page_info.type == "video") {
            type = 0;
        }
        else {
            type = 1;
        }
        return type;
    },
    judgmentNew(dynamiclist, opt) {
        let oldcardlist = Kaze.cardlistdm[opt.dataName];
        console.log(oldcardlist,dynamiclist,opt.dataName)
        if (oldcardlist.length > 0 && oldcardlist[0].time != dynamiclist[0].time && dynamiclist[0].time > oldcardlist[0].time) {
            console.log(opt.title, new Date(), dynamiclist[0], oldcardlist[0]);
            if (dynamiclist[0].image) {
                Kaze.SendNotice(`【${opt.title}】喂公子吃饼！`, dynamiclist[0].text.split('<br />').join(''), dynamiclist[0].image, dynamiclist[0].time);
            }
            else {
                Kaze.SendNotice(`【${opt.title}】喂公子吃饼！`, dynamiclist[0].text.split('<br />').join(''), null, dynamiclist[0].time);
            }
            return true
        } else {
            return false
        }
    },
    regexp(text) {
        return text.replace(
            /<\a.*?>|<\/a>|<\/span>|<\span.*>|<span class="surl-text">|<span class='url-icon'>|<\img.*?>|全文|网页链接/g,
            '')
    },
}

let getBili = {
    url: `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=161775300`,
    dturl: `https://space.bilibili.com/161775300/dynamic`,
    // B站：动态列表
    cardlist: [],
    // bilibili版本
    Getdynamic() {
        let that = this;
        that.cardlist = [];
        Kaze.Get(that.url + `&kaze=${Math.random().toFixed(3)}`, (responseText) => {
            let data = JSON.parse(responseText);
            if (data.code == 0 && data.data != null && data.data.cards != null && data.data.cards.length > 0) {
                data.data.cards.map(x => {
                    let dynamicInfo = JSON.parse(x.card);
                    that.cardlist.push({
                        time: x.desc.timestamp,
                        dynamicInfo: that.GetdynamicInfo(dynamicInfo),
                        image: that.GetdynamicImage(dynamicInfo),
                        type: that.GetdynamicType(dynamicInfo),
                        source: 0,
                        url: dynamicInfo.short_link || that.dturl
                    });
                });
                that.cardlist.sort((x, y) => x.time < y.time ? 1 : -1);
                that.JudgmentNew(that.cardlist);
                Kaze.cardlistdm.bili = that.cardlist;
            }

        }
            , { name: "Bilibili动态", type: 'getbili' });
    },
    GetdynamicType(dynamic) {
        // 0为视频 1为动态
        let type = -1;
        if (dynamic.hasOwnProperty('item')) {
            type = 1;
        }
        else {
            type = 0;
        }
        return type;
    },
    GetdynamicInfo(dynamic) {
        // 0为视频 1为动态
        let dynamicInfo = '';
        if (dynamic.hasOwnProperty('item')) {
            dynamicInfo = dynamic.item.description || dynamic.item.content;
        }
        else {
            dynamicInfo = dynamic.desc || dynamic.title;
        }
        return dynamicInfo;
    },
    GetdynamicImage(dynamic) {
        // 0为视频 1为动态
        let dynamicInfo = null;
        if (dynamic.hasOwnProperty('item')) {
            if (dynamic.item.hasOwnProperty('pictures')) {
                dynamicInfo = dynamic.item.pictures.length > 0 ? dynamic.item.pictures[0].img_src : null;
            }
        }
        else {
            dynamicInfo = dynamic.pic || dynamic.pic;
        }
        return dynamicInfo;
    },
    JudgmentNew(dynamiclist) {
        let oldcardlist = Kaze.cardlistdm.bili
        if (oldcardlist.length > 0 && oldcardlist[0].time != dynamiclist[0].time && dynamiclist[0].time > oldcardlist[0].time) {
            let dynamicInfo = dynamiclist[0];
            console.log('B站', new Date(), dynamicInfo, oldcardlist[0]);
            // 0为视频 1为动态
            if (dynamicInfo.type == 0) {
                Kaze.SendNotice(`【B站】喂公子吃饼!`, `${dynamicInfo.dynamicInfo.replace(/\n/g, "")}`, dynamicInfo.image, dynamicInfo.time)
            } else {
                if (!!!dynamicInfo.pictures) {
                    Kaze.SendNotice(`【B站】喂公子吃饼!`, dynamicInfo.dynamicInfo.replace(/\n/g, ""), dynamicInfo.image, dynamicInfo.time);
                } else {
                    Kaze.SendNotice(`【B站】喂公子吃饼!`, dynamicInfo.dynamicInfo.replace(/\n/g, ""), null, dynamicInfo.time);
                }
            }
        }
    }
}

let getWeibo = {
    opt: {
        url: 'https://m.weibo.cn/api/container/getIndex?type=uid&value=6279793937&containerid=1076036279793937',
        dturl: 'https://weibo.com/arknights',
        title: '官方微博',
        dataName: 'weibo',
        source: 1,
    },
    Getdynamic() {
        getAndProcessWeiboData.getdynamic(this.opt);
    }
}

let getYj = {
    url: `https://ak-fs.hypergryph.com/announce/IOS/announcement.meta.json`,
    // 通讯录：动态列表
    cardlist: [],
    // 通讯录
    Getdynamic() {
        let that = this;
        that.cardlist = [];
        Kaze.Get(that.url, (responseText) => {
            try {
                let data = JSON.parse(responseText);
                data.announceList.forEach(x => {
                    // 屏蔽几个条目 先用ID 看有没有问题
                    if (!(x.announceId == 94 || x.announceId == 98 || x.announceId == 192 || x.announceId == 95 || x.announceId == 97)) {
                        that.cardlist.push({
                            time: Math.floor(new Date(`${(new Date().getFullYear())}/${x.month}/${x.day} 23:59:59`).getTime() / 1000),
                            text: `${x.title}`,
                            announceId: x.announceId,
                            source: 2,
                            url: x.webUrl
                        });
                    }
                });
                that.cardlist.sort((x, y) => {
                    return y.announceId - x.announceId;
                });
                // 判定是否是新的
                that.JudgmentNew(that.cardlist);
                Kaze.cardlistdm.yj = that.cardlist;
            } catch (error) {

            }

        }, { name: "通讯录", type: 'getyj' });
    },
    JudgmentNew(dynamiclist) {
        let oldcardlist = Kaze.cardlistdm.yj;
        if (oldcardlist.length > 0 && oldcardlist[0].announceId != dynamiclist[0].announceId &&
            dynamiclist[0].announceId > oldcardlist[0].announceId) {
            console.log('通讯组', new Date(), dynamiclist[0], oldcardlist[0]);
            Kaze.SendNotice("【制作组通讯】喂公子吃饼！", dynamiclist[0].text, null, dynamiclist[0].time);
        }
    }
}

let getCho3 = {
    opt: {
        url: 'https://m.weibo.cn/api/container/getIndex?type=uid&value=6441489862&containerid=1076036441489862',
        dturl: 'https://weibo.com/u/6441489862',
        title: '朝陇山',
        dataName: 'cho3',
        source: 3,
    },
    Getdynamic() {
        getAndProcessWeiboData.getdynamic(this.opt);
    }
}

let getYs3 = {
    opt: {
        url: 'https://m.weibo.cn/api/container/getIndex?type=uid&value=7506039414&containerid=1076037506039414',
        dturl: 'https://weibo.com/u/7506039414',
        title: '一拾山',
        dataName: 'ys3',
        source: 4,
    },
    Getdynamic() {
        getAndProcessWeiboData.getdynamic(this.opt);
    }
}

Kaze.Init();