chrome.storage.local.get(['time'], result => {
    document.getElementById('reloadtime').value = result.time;
});

document.getElementById('save').addEventListener('click',
    () => {
        var time = document.getElementById('reloadtime').value;
        chrome.storage.local.set({
            time: time,
        }, function () {
            let win = chrome.extension.getBackgroundPage();
            win.clearInterval(win.Kaze.setIntervalindex);
            win.Kaze.SetInterval();
        });
    });