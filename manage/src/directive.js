import Vue from "vue";
import moment from 'moment';//日期格式化插件
import utils from "@/hotent-ui-util.js"
import req from "@/request.js"
import _ from "lodash";
import app from "@/main.js";
/**
 * 根据指令model的值获取拼音
 * 使用方式：
 * 例如：
 * <ht-input  v-model="role.code" v-pinyin="role.name" placeholder="full修饰符 为全拼，否则为首字母"></ht-input>
 * <ht-input  v-model="role.code" v-pinyin.full="role.name" placeholder="full修饰符 为全拼，否则为首字母"></ht-input>
 *  watch role.name  set role.code
 */
Vue.directive('pinyin', {
	// 指令的定义
	componentUpdated: function (el, binding, vnode) {
		let context = vnode.context;
		// 防抖
		let debounceGetPinyin = _.debounce((newVal) => {
			// disabled 或者 readonly 时 不需要请求
			if (el.__vue__.disabled || el.__vue__.readonly) return;
			req.request({
				url: `${window.context.uc}/base/tools/v1/getPinyin`,
				method: "GET",
				params: { chinese: newVal, type: `${binding.modifiers.full ? 1 : 0}` }
			}).then(res => {
				if (res.data.state) {
					let modelExp = vnode.data.model.expression.replace(/\[\w+.?\$\w+\]/g, "[" + binding.arg + "]")
					utils.setValueByPath(context, modelExp, res.data.value);
					app.$nextTick(() => {
						app.$validator.validate();
					})
				}
			}).finally(() => {
			});
		}, 300);

		if (binding.value && binding.value != binding.oldValue) {
			debounceGetPinyin(binding.value);
		}

		// context.$watch(watchExp(), function (newVal, oldVal) {
		// 	if (newVal && newVal != oldVal) {
		// 		debounceGetPinyin(newVal);
		// 	}
		// }, {
		// 	deep: true,
		// 	immediate: false
		// });
	}
});

Vue.filter('dateformat', function (dataStr, pattern = 'yyyy-MM-dd HH:mm:ss') {
	if (dataStr) {
		return moment(dataStr).format(pattern)
	} else {
		return "";
	}

}); //VUE页面使用：{{ newsinfo.add_time | dateformat('YYYY-MM-DD HH:mm:ss')}}

Vue.filter('timeLag', function (difference) {
	let r = "",
		////计算出相差天数
		days = Math.floor(difference / (24 * 3600 * 1000)),
		//计算出小时数
		leave1 = difference % (24 * 3600 * 1000),   //计算天数后剩余的毫秒数
		hours = Math.floor(leave1 / (3600 * 1000)),
		//计算相差分钟数
		leave2 = leave1 % (3600 * 1000),      //计算小时数后剩余的毫秒数
		minutes = Math.floor(leave2 / (60 * 1000)),
		//计算相差秒数
		leave3 = leave2 % (60 * 1000),    //计算分钟数后剩余的毫秒数
		seconds = Math.round(leave3 / 1000);
	if (days > 0) r += days + "天";
	if (hours > 0) r += hours + "小时";
	if (minutes > 0) r += minutes + "分钟";
	if (seconds > 0) r += seconds + "秒";
	if (!r) {
		return '0秒';
	}
	return r;

});

// 表单指令，会在表单的vue实例上添加一个map，用以存放数学运算的表达式
Vue.directive('form', {
	bind: function (el, binding, vnode) {
		const inst = vnode.context;
		if (inst && !inst.hasOwnProperty("watchMap")) {
			inst["watchMap"] = new Map();
		}
	}
});

// 当前用户不是平台管理员时删除指令所在元素
Vue.directive('pm', {
	inserted(el, binding, vnode) {
		let result = false;
		try {
			result = vnode.context.$store.state.login.currentUser.userAttrs.tenantId == -1;
		} catch (e) { }
		if (!result) {
			el.parentNode && el.parentNode.removeChild(el);
		}
	}
});
//表格横向拖拽
Vue.directive('tableDrag', {
    inserted: function (el) {
        el = el.getElementsByClassName('el-table__body-wrapper')[0] ||  el;
        if (el) {
            el.style.cursor = 'grab';
            el.onmousedown = function (event) {
                let gapX = event.clientX;
                let startX = el.scrollLeft;
                document.onmousemove = function (e) {
                    let x = e.clientX - gapX;
                    el.scrollLeft = startX - x;
                    return false;
                };
                document.onmouseup = function (e) {
                    document.onmousemove = null;
                    document.onmouseup = null;
                };
            };
        }
    }
});