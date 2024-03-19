import "@babel/polyfill"
import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import Print from "@/plugs/print"; //打印插件 源码修改过 getStyle方法
import "@/assets/css/element-custom.scss";
import ElementUI from "element-ui";
import i18n from "@/lang/index.js";
import moment from "moment"; //日期格式化插件
import VueUeditorWrap from "vue-ueditor-wrap"; //引入富文本组件
import echarts from "echarts"; //引入echarts
import HotentUi from "hotent-ui";
import "hotent-ui/lib/hotent-ui.css";
import "hotent-ui/src/assets/css/element-variables.scss"
import "@/directive.js";
import req from "@/request.js";
import deepmerge from "deepmerge";
import validate from "@/validate.js";
import dict from "@/lang/dict.js";
import HtSubmitButton from "@/components/common/HtSubmitButton.vue";
import HtDeleteButton from "@/components/common/HtDeleteButton.vue";
import VueClipboard from "vue-clipboard2";
import Formulas from "@/formulas.js";
import VueAMap from "vue-amap"; //高德地图插件

import Viewer from "v-viewer"; //图片预览插件
import "viewerjs/dist/viewer.css";

import Video from 'video.js'
import 'video.js/dist/video-js.css'
import CollapseTransition from 'element-ui/lib/transitions/collapse-transition';
//import "@/assets/css/new_style.scss";//cc 新建样式表用于覆盖现有样式
Vue.prototype.$video = Video

Vue.config.debug = true;

Vue.prototype.$http = req;

Vue.use(Viewer, {
  defaultOptions: {
    zIndex: 9999,
    toolbar: true
  }
})
Vue.use(VueClipboard);
Vue.use(ElementUI, {
  i18n: (key, value) => i18n.t(key, value),
  size: "small"
});

Vue.use(HotentUi, {
  i18n: (key, value) => i18n.t(key, value),
  size:'small'
});

Vue.use(Print);
Vue.use(Formulas);

// 注册全局组件
Vue.use(VueAMap);
Vue.component("HtSubmitButton", HtSubmitButton);
Vue.component("HtDeleteButton", HtDeleteButton);
Vue.component("vue-ueditor-wrap", VueUeditorWrap);
Vue.component(CollapseTransition.name, CollapseTransition)
// 注册全局的过滤器
Vue.filter('formatDate', function (value, pattern = "YYYY-MM-DD HH:mm:ss") {
  if (!value) {
    return "";
  }
  return moment(value).format(pattern)
})

Vue.prototype.$echarts = echarts;

window.app = new Vue({
  store,
  router,
  i18n,
  render: function (createElement) {
    if (
      "-ms-scroll-limit" in document.documentElement.style &&
      "-ms-ime-align" in document.documentElement.style
    ) {
      window.addEventListener(
        "hashchange",
        () => {
          var currentPath = window.location.hash.slice(1);
          if (this.$route.path !== currentPath) {
            this.$router.push(currentPath);
          }
        },
        false
      );
    }
    return createElement(App);
  }
}).$mount("#root");

let validateLocal = localStorage.getItem("lang");
let currentLocal = validateLocal || "zh-CN";
app.$validator.locale = currentLocal;

if (app.$validator) {
  for (let rule in validate) {
    app.$validator.rules[rule] = validate[rule];
  }
  app.$validator.dictionary.container = deepmerge(
    dict,
    app.$validator.dictionary.container,
    { clone: true }
  );
}

// 日期控件格式化
if ("zh-CN" == currentLocal) {
  moment.locale("zh-cn");
} else {
  moment.locale("en");
}
// el-tooltip 默认显示
Vue.prototype.$tooltipplacement = "bottom";

// wude 2022-11-30 增加路由跳转的处理
import { MessageBox } from 'element-ui';
import utils from '@/utils.js'
// router.beforeEach((to, from, next) => {
//   /**关闭所有校验提示 */
//   utils.closeAllNotification()
  
//   var fullPath_from = from.fullPath;
//   var name_from = from.name;
//   var formUpdataFlag = sessionStorage.getItem("formUpdataFlag");
//   if (formUpdataFlag == "true" && fullPath_from != '/' && name_from) {
//     // MessageBox.confirm('表单发生过变更,离开将导致录入数据丢失', '确定要离开当前页面吗?', {
//     //   confirmButtonText: '确定',
//     //   cancelButtonText: '取消',
//     //   type: 'warning',
//     // }).then(() => {
//     //   sessionStorage.setItem('formUpdataFlag', 'false')
//     //   next();
//     // }).catch(() => {
//     //   next(false);
//     // });
//   } else {
//     next();
//   }
// })
// ------------------------------