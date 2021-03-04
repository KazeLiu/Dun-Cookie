
let options = {
    setting: {},
    Loadoption() {
        document.getElementById('reloadtime').value = this.setting.time;
        document.getElementById('getbili').checked = this.setting.getbili;
        document.getElementById('getweibo').checked = this.setting.getweibo;
        document.getElementById('getyj').checked = this.setting.getyj;
    },
    BindBtn() {
        let time = document.getElementById('reloadtime').value;
        time == "" ? 15000 : time
        document.getElementById('save').addEventListener('click',
            () => {
                this.setting.time = time;
                document.querySelectorAll(`.checkarea input[type='checkbox'`).forEach(item => {
                    this.setting[item.value] = item.checked;
                });
                chrome.storage.local.set({
                    setting: this.setting,
                }, function () {
                    let win = chrome.extension.getBackgroundPage();
                    win.clearInterval(win.Kaze.setIntervalindex);
                    win.Kaze.SetInterval(time);
                    document.getElementById('alertinfo').innerHTML = "保存成功"
                    setTimeout(() => {
                        document.getElementById('alertinfo').innerHTML = '';
                    }, 3000);
                });
            });
    },
    ChangeInfo() {
        let win = chrome.extension.getBackgroundPage();
        document.getElementById('info').innerHTML = `已为你蹲饼<span style="color:#23ade5">${win.Kaze.dunIndex}</span>次`;
        setTimeout(() => {
            this.ChangeInfo();
        }, 100);
    }
}
window.onload = function () {
    chrome.storage.local.get(['setting'], result => {
        options.setting = result.setting
        options.Loadoption();
        options.BindBtn();
        options.ChangeInfo()
    });
}



