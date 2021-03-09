
let options = {
    setting: {},
    Loadoption() {
        document.getElementById('reloadtime').value = this.setting.time;
        document.getElementById('getbili').checked = this.setting.getbili;
        document.getElementById('getweibo').checked = this.setting.getweibo;
        document.getElementById('getyj').checked = this.setting.getyj;
        console.log(this.setting);
        var radioObj = document.querySelectorAll(`.fontsize[value='${this.setting.fontsize}']`);
        radioObj[0].checked = true;

    },
    BindBtn() {


        document.getElementById('save').addEventListener('click',
            () => {
                let time = document.getElementById('reloadtime').value;
                time = time == "" ? 15000 : time;
                if (time < 1000) {
                    time = 1000;
                    document.getElementById('reloadtime').value = time;
                }
                //接收
                this.setting.time = time;
                document.querySelectorAll(`.checkarea input[type='checkbox'`).forEach(item => {
                    this.setting[item.value] = item.checked;
                });
                //字体
                var radioObj = document.querySelectorAll(".fontsize");
                for (var i = 0; i < radioObj.length; i++) {
                    if (radioObj[i].checked == true) {
                        let value = radioObj[i].value;
                        this.setting.fontsize = value;
                    }
                }
                chrome.storage.local.set({
                    setting: this.setting,
                }, () => {
                    let win = chrome.extension.getBackgroundPage();
                    win.clearInterval(win.Kaze.setIntervalindex);
                    win.Kaze.SetInterval(time);
                    win.Kaze.setting = this.setting;
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



