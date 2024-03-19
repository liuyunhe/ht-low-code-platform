/*! Copyright (c) 2019 Hotent(http://www.hotent.com)
 * 
 * Version: 1.0.0
 */
; (function () {
	var hotent = {};
	window.hotent = hotent;
	// 是否现代浏览器
	hotent.isModern = function () {
		return window.addEventListener ? true : false;
	}
	// 添加事件监听
	hotent.addListener = function (name, fn) {
		if (!name || name.constructor != String) {
			throw "name could not be empty and must be String.";
		}
		if (!fn || fn.constructor != Function) {
			throw "fn could not be empty and must be Function.";
		}
		var eventMethod = hotent.isModern ? "addEventListener" : "attachEvent",
			eventer = window[eventMethod];

		var match = name.match(/^on(\w+)$/);
		if (match && match.length == 2) {
			name = match[1];
		}
		eventer(hotent.isModern ? name : "on" + name, fn);
	}
	// 发送消息给父页面
	hotent.sendMessage = function (params) {
		window.parent && window.parent.postMessage(params, "*");
	}

	// 监听父页面发送过来的message
	hotent.addListener("message", function (e) {
		var type = e.data || 0;
		// 子页面先回复父页面：收到消息
		hotent.sendMessage({ type: "roger" });
		switch (type) {
			case "getHeight":	/*获取页面高度*/
				hotent.getHeight();
				break;
			case "saveData":	/*保存页面数据*/
			case "modifyForm":	/*打开新页面编辑数据*/
			case "printForm":	/*打印*/
			case "validForm":	/*验证数据*/
				hotent.invoke(type);
				break;
		}
	});

	// 调用页面定义的方法
	hotent.invoke = function (methodName) {
		var r = window[methodName];
		if (!r || r.constructor != Function) {
			throw "页面未提供方法：" + methodName;
		}
		else {
			r.apply();
		}
	}

	// 获取页面高度
	hotent.getHeight = function () {
		var height = document.getElementsByTagName("body")[0].scrollHeight,
			params = { type: "height", height: height };
		hotent.sendMessage(params);
	}

	// 监听鼠标滚动事件
	hotent.addListener("wheel", function (e) {
		var params = { type: "wheel", wheelDeltaY: -e.deltaY };
		hotent.sendMessage(params);
	});
})();