import Vue from "vue";
import App from "./App.vue";
import ElementUI from "element-ui";
import HotentUi from "hotent-ui";
import i18n from '@/locale/index.js';
import "hotent-ui/lib/hotent-ui.css";
import "hotent-ui/src/assets/css/element-variables.scss"
import "@/assets/css/element-custom.scss";
import '@/directive.js';
import HtSubmitButton from "@/components/common/HtSubmitButton.vue";
import HtDeleteButton from "@/components/common/HtDeleteButton.vue";
import HtLoadData from "@/components/common/HtLoadData.vue";
import VueUeditorWrap from "vue-ueditor-wrap"; //引入富文本组件
import VueCodeMirror from 'vue-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/base16-light.css'
import 'codemirror/mode/vue/vue'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/groovy/groovy'
import req from "@/request.js";
import 'jquery';
import deepmerge from 'deepmerge';
import validate from '@/validate.js';
import dict from "@/locale/validate/dict.js";
import VueAMap from 'vue-amap';//高德地图插件
import VueClipboard from 'vue-clipboard2';//复制内容到剪贴板

import router from "./router";
import store from "./store";

import Video from 'video.js'
import 'video.js/dist/video-js.css'
Vue.prototype.$video = Video

Vue.config.productionTip = false;
Vue.prototype.$http = req;

Vue.use(ElementUI, {
    i18n: (key, value) => i18n.t(key, value),
    size: "small"
});
Vue.use(HotentUi, {
    i18n: (key, value) => i18n.t(key, value)
});
//使用vue-codemirror组件
Vue.use(VueCodeMirror);
Vue.use(VueAMap);
Vue.use(VueClipboard);
// 注册全局组件
Vue.component("HtSubmitButton", HtSubmitButton);
Vue.component("HtDeleteButton", HtDeleteButton);
Vue.component("HtLoadData", HtLoadData);
Vue.component('vue-ueditor-wrap', VueUeditorWrap);


let app = new Vue({
    router,
    store,
    i18n,
    render: h => h(App)
}).$mount("#root");

export default app;

let validateLocal = localStorage.getItem("lang");
let currentLocal = validateLocal || "zh-CN";
app && app.$validator && app.$validator.localize(currentLocal);

if (app.$validator) {
    for (let rule in validate) {
        app.$validator.rules[rule] = validate[rule];
    }
    app.$validator.dictionary.container = deepmerge(dict, app.$validator.dictionary.container, { clone: true })
}
