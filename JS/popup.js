$(function () {
    $("#btnPaste").click(function () {
       // 将之前抓取到的并保存的data数据从background.js取出
        var win = chrome.extension.getBackgroundPage();
        if (win.data) {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
         // 将之前抓取的数据发送
                chrome.tabs.sendMessage(tabs[0].id, { action: "paste", data: win.data }, function (response) {
                    console.log(response);
                });
            }); 
        }
    });
});