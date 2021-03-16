
let options = {
    setting: {},
    Loadoption() {
        document.getElementById('reloadtime').value = this.setting.time / 1000;
        document.getElementById('getbili').checked = this.setting.getbili;
        document.getElementById('getweibo').checked = this.setting.getweibo;
        document.getElementById('getcho3').checked = this.setting.getcho3;
        document.getElementById('getyj').checked = this.setting.getyj;
        document.querySelectorAll(`.fontsize[value='${this.setting.fontsize}']`)[0].checked = true;
        document.querySelectorAll(`.imgshow[value='${this.setting.imgshow}']`)[0].checked = true;
    },
    BindBtn() {
        document.getElementById('save').addEventListener('click',
            () => {
                let time = document.getElementById('reloadtime').value;
                time = time == "" ? 15 : time;
                time = time * 1000;
                if (time < 3000) {
                    time = 3000;
                    document.getElementById('reloadtime').value = time;
                }
                //接收
                this.setting.time = time;
                document.querySelectorAll(`.checkarea input[type='checkbox'`).forEach(item => {
                    this.setting[item.value] = item.checked;
                });
                //字体
                var fontsizeradio = document.querySelectorAll(".fontsize");
                for (var i = 0; i < fontsizeradio.length; i++) {
                    if (fontsizeradio[i].checked == true) {
                        let value = fontsizeradio[i].value;
                        this.setting.fontsize = value;
                    }
                }
                //展示图片
                var imgshowradio = document.querySelectorAll(".imgshow");
                for (var i = 0; i < imgshowradio.length; i++) {
                    if (imgshowradio[i].checked == true) {
                        let value = imgshowradio[i].value;
                        this.setting.imgshow = value;
                    }
                }

                chrome.storage.local.set({
                    setting: this.setting,
                }, () => {
                    let win = chrome.extension.getBackgroundPage();
                    win.clearInterval(win.Kaze.setIntervalindex);
                    win.Kaze.SetInterval(time);
                    win.Kaze.setting = this.setting;
                    win.Kaze.GetData();
                    this.ShowText("保存成功");
                });
            });

    },
    ShowText(text) {
        document.getElementById('alertinfo').innerHTML = text
        setTimeout(() => {
            document.getElementById('alertinfo').innerHTML = '';
        }, 3000);
    },
    ChangeInfo() {
        let win = chrome.extension.getBackgroundPage();
        debugger;
        document.getElementById('info').innerHTML = `已为你蹲饼<span style="color:#23ade5">${win.Kaze.dunIndex}</span>次`;
        setTimeout(() => {
            this.ChangeInfo();
        }, 1500);
    },
}
window.onload = function () {
    chrome.storage.local.get(['setting'], result => {
        options.setting = result.setting
        options.Loadoption();
        options.BindBtn();
        options.ChangeInfo()
    });
}



