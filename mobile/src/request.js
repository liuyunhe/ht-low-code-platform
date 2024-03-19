import axios from 'axios';
import { Notify } from 'vant';
import { Loading } from 'element-ui';
import $store from "@/store";
import store from '@/store/login';
import router from "@/router.js";
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { saveAs } from 'file-saver';
axios.defaults.timeout = 100000;

let pending = []; //声明一个数组用于存储每个ajax请求的取消函数和ajax标识
let cancelToken = axios.CancelToken;
let removePending = (ever) => {
    for (let p in pending) {
        if (pending[p].u === ever.url + '&' + ever.method && pending[p].data === eval.data) { //当当前请求在数组中存在时执行函数体
            pending[p].f(); //执行取消操作
            pending.splice(p, 1); //把这条记录从数组中移除
        }
    }
}

// 请求拦截（配置发送请求的信息）
axios.interceptors.request.use(config => {// 处理请求之前的配置
    // let loadingInstance = Loading.service({ fullscreen: true }); //开始
    NProgress.start(); //开始
    store.state.loadding = true; //在请求发出之前进行一些操作
    config.headers = config.headers || {};
    if (config.headers && config.headers.constructor == String) {
        try {
            config.headers = JSON.parse(config.headers);
        }
        catch (e) {
            Message.error(`请求头部不是有效的JSON格式:${config.headers}`);
            throw e;
        }
    }
    config.headers['Accept-Language'] = localStorage.getItem("lang") || "zh-CN";
    if (store.state.loginAccount) {
        config.headers['Tenant-Code'] = localStorage.getItem(store.state.loginAccount + "loginRoutePath").replace("/login/", "") || "";
    }
    const currentUser = store.state.currentUser;
    currentUser && currentUser.token && !config.headers.Authorization && (config.headers.Authorization = `Bearer ${currentUser.token}`);
    //如果是请求auth接口，则不带token
    if (config.url.indexOf('/auth?') != -1) {
        delete config.headers.Authorization;
    }
    if (config.url.indexOf('/sso/weixin') != -1) {
        delete config.headers.Authorization;
    }
    if (config.url.indexOf('/sso/dingTalk') != -1) {
        delete config.headers.Authorization;
    }
    if (config.url.indexOf('/sso/weixinPublic') != -1) {
        delete config.headers.Authorization;
    }
    removePending(config); //在一个ajax发送前执行一下取消操作
    config.cancelToken = new cancelToken((c) => {
        // 将请求的地址和请求的方式构建为一个字符串存放到请求数组中
        pending.push({ u: config.url + '&' + config.method, f: c, data: config.data });
    });
    // 判断是否需要刷新token
    let currentTime = new Date().getTime();
    if (currentUser && currentUser.loginTime && currentTime - currentUser.loginTime >= (currentUser.expiration / 5) * 1000 && config.url.indexOf('/refresh') == -1) {
        $store.dispatch("login/refreshAndGetAuthenticationToken");
    }
    return config;
}, error => {// 请求失败的处理
    NProgress.done(); // 结束
    // loadingInstance.close(); // 结束
    return Promise.reject(error);
});

// 响应拦截（配置请求回来的信息）
axios.interceptors.response.use(res => {// 处理响应数据
    // let loadingInstance = Loading.service({ fullscreen: true }); //开始
    let isShowMessage = res.config.isShowMessage !== undefined ? res.config.isShowMessage: true;
    removePending(res.config);  //在一个ajax响应后再执行一下取消操作，把已经完成的请求从pending中移除
    if (res.data && res.data.state != undefined && res.data.state === false && isShowMessage) {
        Notify({ type: 'danger', message: res.data.message });
    }
    store.state.loadding = false;//在这里对返回的数据进行处理
    // loadingInstance.close(); // 结束
    NProgress.done(); // 结束
    // 附件下载
    if (
        res &&
        res.status == 200 &&
        res.headers &&
        res.headers["content-disposition"] &&
        res.headers["content-disposition"].startsWith("attachment;")
    ) {
        let blob = new Blob([res.data]);
        const fileName = decodeURIComponent(
            res.headers["content-disposition"].split(";")[1].split("filename=")[1]
        );
        saveAs(blob, fileName);
    }
    return res;
}, error => {// 处理响应失败
    let loadingInstance = Loading.service({ fullscreen: true }); //开始
    const errorMessage = error && error.response && error.response.data && error.response.data.message ? error.response.data.message : error.message;
    if (error && error.response && error.response.status === 401) {
        sessionStorage.clear();
        router.push({ path: "/login" });
    } else if (error && error.response && error.response.status === 403) {
        Notify({ type: 'danger', message: errorMessage });
    } else if (error && error.response && error.response.status === 500) {
        if (error.response.data && error.response.data.message) {
            //如果是jwt超时了
            if (error.response.data.message.indexOf("JWT expired at") >= 0) {
                Notify({ type: 'warning', message: "登录认证超时，请重新登录！" });
            } else {
                Notify({ type: 'danger', message: error.response.data.message });
            }
        } else {
            Notify({ type: 'danger', message: error.message });
        }
    } else if (errorMessage && typeof (errorMessage) != 'undefined') {
        //如果是jwt超时了
        if (errorMessage.indexOf("JWT expired at") >= 0) {
            Notify({ type: 'warning', message: "登录认证超时，请重新登录！" });
        } else {
            Notify({ type: 'danger', message: errorMessage });
        }
    }
    NProgress.done(); // 结束
    loadingInstance.close(); // 结束
    return Promise.reject(error);
});

export default {
    request(data) {
        let reqData = data.data || {};
        //支持表达式作为域名解析
        data.url = this.parseUrl(data.url);
        //统一拼接域名接口
        if (data.url.indexOf('http') == -1) {
            data.url = context.mobile + data.url;
        }
        let requestData = {
            url: data.url,
            data: reqData,
            method: data.method || 'GET',
            params: data.params || {},
            onUploadProgress: data.onUploadProgress || null,
            headers: data.headers || '',
            responseType: data.responseType || 'json',
            isShowMessage: data.isShowMessage
        };
        return axios(requestData);
    },
    download(url) {
        return this.request({ url, responseType: "arraybuffer" });
    },
    get(url, type,isShowMessage) {
        return this.request({ url, responseType: type, isShowMessage: isShowMessage });
    },
    post(url, data, responseType) {
        return this.request({ url, data, method: "POST", responseType: responseType });
    },
    remove(url) {
        return this.request({ url, method: "DELETE" });
    },
    getContext() {
        return context;
    },
    parseUrl(url) {
        if (url === "") return;
        var ctx = this.getContext(),
            reg = /^(\$\{(\w+)\})\/.*$/;

        var match = reg.exec(url);
        if (match != null) {
            var name = match[2],
                mc = match[1],
                val = ctx[name];
            if (!val) {
                throw new Error("The '" + name + "' in url:" + url + " does not defined in context provider.");
            }
            return url.replace(mc, val);
        }
        else {
            return url;
        }
    }
}