var Kaze = {
    //存在本地的总列表 里面有标题，内容，图片，类型
    cardlist: [],
    //给前台用的列表 已经排序
    cardlistsort: [],
    //请求次数
    dunIndex: 0,
    dunTime: new Date(),
    // 循环的标识
    setIntervalindex: 0,
    // 加载完成标志
    loadSuccess: {
        weibo: false,
        bili: false,
        announce: false
    },
    setting: {
        time: 15000,
        getweibo: true,
        getbili: true,
        getyj: true,
        fontsize:'normal'
    },
    SetInterval(time) {
        this.setIntervalindex = setInterval(() => {
            this.dunIndex++;
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
    GetData(success) {
        getWeibo.Getdynamic(() => {
            this.loadSuccess.weibo = true;
            this.ReturnDate(success);
        });
        getBili.Getdynamic(() => {
            this.loadSuccess.bili = true;
            this.ReturnDate(success);
        });
        getAnnouncement.Getdynamic(() => {
            this.loadSuccess.announce = true;
            this.ReturnDate(success);
        });
    },
    ReturnDate(success) {
        let loadSuccess = this.loadSuccess;
        if (loadSuccess.announce && loadSuccess.bili && loadSuccess.weibo) {
            this.loadSuccess = {
                weibo: false,
                bili: false,
                announce: false
            };
            this.cardlistsort = this.cardlist;
            if (success) {
                success();
            }
        }
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
            }else{
                alert('最近列表内没有找到该标签');
            }
        });
    }
}


let getBili = {
    url: `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=161775300`,
    // url: `test/bJson.json`,
    dturl: `https://space.bilibili.com/161775300/dynamic`,

    // B站：动态列表
    cardlist: [],
    oldcardlist: [],
    // bilibili版本
    Getdynamic(success) {
        let that = this;
        let xhr = new XMLHttpRequest();
        that.cardlist = [];
        Kaze.Get(that.url, (responseText) => {
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
                // console.log(that.cardlist);
                if (Kaze.setting.getbili) {
                    that.JudgmentNew(that.cardlist);
                }
                that.oldcardlist = that.cardlist;
                //重新计算组合
                Kaze.cardlist = Kaze.cardlist.filter(x => x.source != 0);
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
        });
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
    JudgmentNew(dynamiclist) {
        if (this.oldcardlist.length > 0 && this.oldcardlist[0].time != dynamiclist[0].time) {
            let dynamicInfo = dynamiclist[0];
            // 0为视频 1为动态
            if (dynamicInfo.type == 0) {
                dynamicInfo = dynamicInfo.dynamicInfo
                Kaze.SendNotice(`【B站】喂公子吃饼!`, `${dynamicInfo.title}:${dynamicInfo.dynamic}`, dynamicInfo.pic, dynamicInfo.time)
            } else {
                if (dynamicInfo.type == 2) {
                    //不处理转发数据
                    // dynamicInfo=dynamicInfo.item;
                    // if (origindyType == 1) {
                    //     dynamicInfo.content = `${dynamicInfo.content}//@${origindynamic?.user?.name}:${origindynamic?.item?.description}`;
                    //     if (origindynamic?.item?.pictures != undefined) {
                    //         that.SendNotice("image", `[转发动态]饼来了!`, `${dynamicInfo.content}//@${origindynamic.user.name}:${origindynamic.item.description}`, origindynamic.item.pictures[0].img_src)
                    //     } else {
                    //         that.SendNotice("basic", `[转发动态]饼来了!`, `${dynamicInfo.content}//@${origindynamic.user.name}:${origindynamic.item.description}`);
                    //     }
                    // }
                    //  else if (origindyType == 2) {
                    //     that.SendNotice("basic", `[转发内容]饼来了!`, `套娃转发 不解析了`);
                    // } 
                    // else if (origindyType == 0) {
                    //     that.SendNotice("image", `[转发视频]饼来了!${origindynamic.title}`, `${dynamicInfo.content}//@${origindynamic.owner.name}:${origindynamic.title}`, origindynamic.pic);
                    // }
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
    // url: `test/wJson.json`,
    dturl: `https://weibo.com/arknights`,

    // 微博：动态列表
    cardlist: [],
    oldcardlist: [],
    // 微博
    Getdynamic(success) {
        let that = this;
        let xhr = new XMLHttpRequest();
        that.cardlist = [];
        that.oldcardlist = Kaze.cardlist.filter(x => x.source == 1);
        Kaze.Get(that.url, (responseText) => {
            let data = JSON.parse(responseText);
            if (data.ok == 1 && data.data != null && data.data.cards != null && data.data.cards.length > 0) {
                data.data.cards.map(x => {
                    //删除置顶 x.mblog.title != undefined
                    // x.mblog.title == undefined
                    if (x.mblog != undefined && x.mblog.title == undefined) {
                        let dynamicInfo = x.mblog;
                        // 处理html
                        let process_dynamic = '';
                        try {
                            let temp = dynamicInfo.text.split('<br />').splice(1, dynamicInfo.text.length);
                            temp[temp.length - 1] = temp[temp.length - 1].split('<a href')[0];
                            process_dynamic = temp.join('<br/>');
                        } catch (error) {
                            process_dynamic = dynamicInfo.text;

                        }
                        that.cardlist.push({
                            time: Math.floor(new Date(dynamicInfo.created_at).getTime() / 1000),
                            dynamicInfo: dynamicInfo.text,
                            text: process_dynamic,
                            image: dynamicInfo.bmiddle_pic || dynamicInfo.original_pic,
                            type: that.GetdynamicType(dynamicInfo),
                            source: 1,
                            url: x.scheme
                        });

                    }
                });
                // console.log(that.cardlist);
                // 判定是否是新的
                if (Kaze.setting.getweibo) {
                    that.JudgmentNew(that.cardlist);
                }
                that.oldcardlist = that.cardlist;
                //重新计算组合并保存
                Kaze.cardlist = Kaze.cardlist.filter(x => x.source != 1);
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
        if (this.oldcardlist.length > 0 && this.oldcardlist[0].time != dynamiclist[0].time) {
            if (dynamiclist[0].image) {
                Kaze.SendNotice("【微博】喂公子吃饼！", dynamiclist[0].text.split('<br/>').join(''), dynamiclist[0].image, dynamiclist[0].time);
            }
            else {
                Kaze.SendNotice("【微博】喂公子吃饼！", dynamiclist[0].text.split('<br/>').join(''), null, dynamiclist[0].time);
            }
        }
    }
}

let getAnnouncement = {
    url: `https://ak-fs.hypergryph.com/announce/IOS/announcement.meta.json`,
    // url: `test/yJson.json`,
    // 通讯录：动态列表
    cardlist: [],
    oldcardlist: [],
    // 通讯录
    Getdynamic(success) {
        let that = this;
        let xhr = new XMLHttpRequest();
        that.cardlist = [];
        that.oldcardlist = Kaze.cardlist.filter(x => x.source == 2);
        Kaze.Get(that.url, (responseText) => {
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
            if (Kaze.setting.getyj) {
                that.JudgmentNew(that.cardlist);
            }

            that.oldcardlist = that.cardlist;
            //重新计算组合并保存
            Kaze.cardlist = Kaze.cardlist.filter(x => x.source != 2);
            Kaze.cardlist.push(...that.cardlist);
            chrome.storage.local.set({
                AnnouncementList: that.cardlist,
                cardList: Kaze.cardlist
            }, () => {
                if (success) {
                    success();
                }
            });
        });
    },
    JudgmentNew(dynamiclist) {
        if (this.oldcardlist.length > 0 && this.oldcardlist[0].announceId != dynamiclist[0].announceId) {
            Kaze.SendNotice("【制作组通讯】喂公子吃饼！", dynamiclist[0].dynamicInfo, null, dynamiclist[0].time);
        }
    }
}

Kaze.Init();