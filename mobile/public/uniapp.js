var userAgent = navigator.userAgent;
if (userAgent.indexOf('AlipayClient') > -1) {
    // 支付宝小程序的 JS-SDK 防止 404 需要动态加载，如果不需要兼容支付宝小程序，则无需引用此 JS 文件。
    document.writeln('<script src="https://appx/web-view.min.js"' + '>' + '<' + '/' + 'script>');
} else if (/QQ/i.test(userAgent) && /miniProgram/i.test(userAgent)) {
    // QQ 小程序
    document.write('<script type="text/javascript" src="https://qqq.gtimg.cn/miniprogram/webview_jssdk/qqjssdk-1.0.0.js"><\/script>');
} else if (/miniProgram/i.test(userAgent) || /MicroMessenger/i.test(userAgent)) {
    // 微信小程序 JS-SDK 如果不需要兼容微信小程序，则无需引用此 JS 文件。
    document.write('<script type="text/javascript" src="https://res.wx.qq.com/open/js/jweixin-1.4.0.js"><\/script>');
} else if (/toutiaomicroapp/i.test(userAgent)) {
    // 字节跳动小程序 JS-SDK 如果不需要兼容字节跳动小程序，则无需引用此 JS 文件。
    document.write('<script type="text/javascript" src="https://s3.pstatp.com/toutiao/tmajssdk/jssdk-1.0.1.js"><\/script>');
} else if (/swan/i.test(userAgent)) {
    // 百度小程序 JS-SDK 如果不需要兼容百度小程序，则无需引用此 JS 文件。
    document.write('<script type="text/javascript" src="https://b.bdstatic.com/searchbox/icms/searchbox/js/swan-2.0.18.js"><\/script>');
}
// uni 的 SDK 
document.write('<script type="text/javascript" src="https://js.cdn.aliyun.dcloud.net.cn/dev/uni-app/uni.webview.1.5.2.js"><\/script>');