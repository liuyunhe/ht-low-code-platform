import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import Print from "vue-print-nb"; //打印插件
import "@/assets/icon/iconfont.css";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import i18n from "@/lang/index.js";
import moment from "moment"; //日期格式化插件
import VueUeditorWrap from "@/components/vueUeditorWrap/vue-ueditor-wrap.vue"; //引入富文本组件
import echarts from "echarts"; //引入echarts
import HotentUi from "hotent-ui";
import "hotent-ui/lib/hotent-ui.css";
import "../theme/index.css";
import "@/directive.js";
import req from "@/request.js";
import deepmerge from "deepmerge";
import validate from "@/validate.js";
import dict from "@/lang/dict.js";
import { Notify } from "vant";
import { Grid, GridItem } from "vant";
import { Icon } from "vant";
import { DropdownMenu, DropdownItem } from "vant";
import { Dialog } from "vant";
import { Tag } from "vant";
import { ActionSheet } from "vant";
import { Lazyload } from "vant";
import { Button } from 'vant';
import VueAMap from "vue-amap"; //高德地图插件
import Viewer from "v-viewer"; //图片预览插件
import "viewerjs/dist/viewer.css";
import VueClipboard from "vue-clipboard2";
import Formulas from "@/formulas.js";
import { Cell, CellGroup } from 'vant';
import { Image as VanImage } from 'vant';
import vueEsign from 'vue-esign' // 手写面板的插件
Vue.use(vueEsign)
Vue.use(VanImage);
Vue.use(Viewer, {
    defaultOptions: {
        zIndex: 9999,
        toolbar: true
    }
})
Vue.use(VueClipboard);
Vue.use(Lazyload);
Vue.use(VueAMap);
Vue.use(Formulas);
Vue.use(Cell);
Vue.use(CellGroup);
Vue.use(Button);
// 注册时可以配置额外的选项
Vue.use(Lazyload, {
    lazyComponent: true
});

import 'vant/lib/index.css'
//ccwgq 处理内网环境中无法加载字体库
import '@/assets/css/vant-icon.css'

// 全局注册
Vue.component("vue-ueditor-wrap", VueUeditorWrap);
Vue.use(ActionSheet);
Vue.use(Dialog);
Vue.use(Tag);
Vue.use(DropdownMenu);
Vue.use(DropdownItem);
Vue.use(Icon);
Vue.use(Grid);
Vue.use(GridItem);
Vue.use(Notify);
Vue.config.debug = true;

Vue.prototype.$http = req;
import VConsole from 'vconsole';
new VConsole()   //开发环境下需要一个控制台

Vue.use(ElementUI, {
    i18n: (key, value) => i18n.t(key, value),
    size: "small"
});

Vue.use(HotentUi, {
    i18n: (key, value) => i18n.t(key, value)
});

// console.log("console.log(Vue.$validate);" + Vue.$veeValidate);
Vue.use(Print);

Vue.component("vue-ueditor-wrap", VueUeditorWrap);
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
        app.$validator.dictionary.container, { clone: true }
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