# 鹰角蹲饼器

## 用于实时抓取兔兔发的动态
 ![avatar](https://raw.githubusercontent.com/LiuZiYang1/Dun-Cookie/master/mdImg/2.png)
 ![avatar](https://raw.githubusercontent.com/LiuZiYang1/Dun-Cookie/master/mdImg/3.jpg)
 ![avatar](https://raw.githubusercontent.com/LiuZiYang1/Dun-Cookie/master/mdImg/4.jpg)

    有什么建议只管提，只要我写得出来

# 更新内容
## V1.0
> 1. 重构了代码，优化了界面，添加了通讯组和微博的接口
> 2. 添加了过滤整合列表的功能
> 3. 添加了一键去微博B站动态的功能

## V1.1
> 1. 重构了代码，优化了界面，添加了通讯组和微博的接口
> 2. 添加了过滤整合列表的功能
> 3. 添加了一键去微博B站动态的功能
> 4. 删除了jQuery依赖，用的原生写法

## V1.2.1-V1.2.9
> 1. 添加了过滤整合列表记忆的功能，被过滤的源不会进行主动推送和展示
> 2. 优化逻辑
> 3. 添加设置按钮
> 4. 添加测试数据方便大家测试

## V1.2.10
> 1. 添加选择字体大小的功能
> 2. 添加弹窗点击直接跳转的功能

## V1.3.0
> 1. 修复字体大小的bug
> 2. 添加朝陇山微博源
> 3. 过滤数据的方法改为源数据过滤而非屏蔽数据
> 4. 调整界面，界面拉大，按钮颜色调整
> 5. 微博文字提取改为正则提取，以后不会报错，感谢[@lwt-414](https://github.com/lwt-414)提供的正则表达式

## V1.3.1
> 1. 列表可以查看或关闭显示图片了！
> 2. 设置调整为秒，不用毫秒了，且强制时间调整为大于3秒
> 3. 列表开启了动态刷新 刷新时间为饼刷新频率的一半

## V1.3.2
> 1. 关闭上一个版本开启的测试模式
> 2. 添加判定，如果发布时间小于公布时间则不算新推送

## V1.3.3
> 1. 修复B站视频推送解析失败的BUG

## V1.3.4
> 1. 通讯组内容添加根据ID排序 应该能修复疯狂弹窗通讯组的问题

## V1.3.5
> 1. 通讯组内容发现是因为url带参数导致周期性的获取不到最新消息而疯狂弹窗 已修复

## V1.3.6 beta
> 1. 添加一拾山接口
> 2. 统一了微博端获取数据的方法
> 3. 添加常驻后台的功能
> 4. 已知问题：无法显示微博表情【前期不予以处理】


# 安装方法
## Chrome安装方法
> - [Chrome应用商店](https://chrome.google.com/webstore/detail/%E8%B9%B2%E9%A5%BC/gblmdllhbodefkmimbcjpflhjneagkkd?hl=zh-CN&authuser=0)
> - 下载zip通过开发者模式加载已解压的扩展程序
> 
## Firefox安装方法
    正在想办法注册火狐开发者
> 1. 先解压到任意文件夹
> 2. 地址栏输入 about:debugging ，回车
> 3. 点击“此Firefox”->临时载入扩展
> 4. 随便在解压后的插件文件夹里面点开任意文件即可加载

    如果有想支持我的火狐开发者，请联系我使用您的开发者商家火狐应用商店

# 注意事项
    只支持Chrome 不知道其他的浏览器安装会怎么样
    因为B站的json总是有奇怪的字符，所以，发现bug，请及时和我说，我好针对那条动态修改

# 下一步
    不知道，先测试BUG。
