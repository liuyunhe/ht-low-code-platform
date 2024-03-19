import axios from 'axios'
import { Message } from 'element-ui'
import $store from '@/store'
import store from '@/store/login'
import router from '@/router.js'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { saveAs } from 'file-saver'
axios.defaults.timeout = 1000000

// 不需要用到NProgress的请求接口
const NO_USE_NPPROGRESS_URL = 'loginByQrCode'

let pending = [] //声明一个数组用于存储每个ajax请求的取消函数和ajax标识
let cancelToken = axios.CancelToken
let removePending = ever => {
  for (let p in pending) {
    if (
      pending[p].u === ever.url + '&' + ever.method &&
      pending[p].data === eval.data
    ) {
      //当当前请求在数组中存在时执行函数体
      pending[p].f() //执行取消操作
      pending.splice(p, 1) //把这条记录从数组中移除
    }
  }
}

// 请求拦截（配置发送请求的信息）
axios.interceptors.request.use(
  config => {
    // 处理请求之前的配置
    if (!config.url.includes(NO_USE_NPPROGRESS_URL)) {
      NProgress.start() //开始
    } 
    store.state.loadding = true //在请求发出之前进行一些操作
    config.headers = config.headers || {}
    if (config.headers && config.headers.constructor == String) {
      try {
        config.headers = JSON.parse(config.headers)
      } catch (e) {
        Message.error(`请求头部不是有效的JSON格式:${config.headers}`)
        throw e
      }
    }
    config.headers['Accept-Language'] = localStorage.getItem('lang') || 'zh-CN'
    if (store.state.loginAccount) {
      config.headers['Tenant-Code'] =
        localStorage
          .getItem(store.state.loginAccount + 'loginRoutePath')
          .replace('/login/', '') || ''
    }
    const currentUser = store.state.currentUser
    currentUser &&
      currentUser.token &&
      !config.headers.Authorization &&
      (config.headers.Authorization = `Bearer ${currentUser.token}`)
    //如果是请求auth接口，则不带token
    if (config.url.indexOf('/auth?') != -1) {
      delete config.headers.Authorization
    }
    if (config.url.indexOf('/extractItems') != -1) {
      delete config.headers.Authorization
      // console.log("智能提取===>", config.url);
    }
    removePending(config) //在一个ajax发送前执行一下取消操作
    config.cancelToken = new cancelToken(c => {
      // 将请求的地址和请求的方式构建为一个字符串存放到请求数组中
      pending.push({
        u: config.url + '&' + config.method,
        f: c,
        data: config.data
      })
    })

    // 判断是否需要刷新token
    let currentTime = new Date().getTime()
    if (
      currentUser &&
      currentUser.loginTime &&
      currentTime - currentUser.loginTime >=
      (currentUser.expiration / 5) * 1000 &&
      config.url.indexOf('/refresh') == -1
    ) {
      $store.dispatch('login/refreshAndGetAuthenticationToken')
    }
    if (
      config.url.indexOf("/api/relevant/document/getRelevantDocumentList") > -1
    ) {
      let data = config.data
      if (data.pageBean) {
        // data.pageBean.loginId = 7194
        data.pageBean.showTotal = true
      }
      let obj = {};
      const propertyMap={
        'requestcode':'requestCode',
        'requestname':"requestName"
      }
      obj.pageBean = Object.assign({}, data.pageBean);
      if(data.querys){
        obj.querys=[]
        Object.values(data.querys)
        .forEach(item=>{
            let map={
              property:propertyMap[item.property],
              group:'组',
              value:item ?.value ?? ''
            };
         if(!!map.value){
          obj.querys.push(map)
         }
        })
      }
      config.data = obj;
    }
    return config
  },
  error => {
    // 请求失败的处理
    NProgress.done() // 结束
    return Promise.reject(error)
  }
)

// 响应拦截（配置请求回来的信息）
axios.interceptors.response.use(
  res => {
    // 处理响应数据
    //是否显示错误信息，默认为显示
    let isShowMessage =
      res.config.isShowMessage !== undefined ? res.config.isShowMessage : true
    removePending(res.config) //在一个ajax响应后再执行一下取消操作，把已经完成的请求从pending中移除
    if (
      res.data &&
      res.data.state != undefined &&
      res.data.state === false &&
      isShowMessage
    ) {
      Message.errorLog(res.data.message, res.data.logId)
    }
    store.state.loadding = false //在这里对返回的数据进行处理
    NProgress.done() // 结束
    // 附件下载
    if (
      res &&
      res.status == 200 &&
      res.headers &&
      res.headers['content-disposition'] &&
      res.headers['content-disposition'].startsWith('attachment;')
    ) {
      let blob = new Blob([res.data])
      const fileName = decodeURIComponent(
        res.headers['content-disposition'].split(';')[1].split('filename=')[1]
      )
      saveAs(blob, fileName)
    }
    return res
  },
  error => {
    // 处理响应失败
    const tetantCode = localStorage.getItem(
      store.state.loginAccount + 'loginRoutePath'
    )
      ? localStorage
        .getItem(store.state.loginAccount + 'loginRoutePath')
        .replace('/login/', '') || ''
      : localStorage.getItem(store.state.loginAccount + 'loginRoutePath')
    const errorMessage =
      error &&
        error.response &&
        error.response.data &&
        error.response.data.message
        ? error.response.data.message
        : error.message
    if (error && error.response && error.response.status === 401) {
      sessionStorage.clear()
      if (window.ssoConfig.mode != 'cas' && window.ssoConfig.mode != 'oauth') {
        router.push({ path: '/login/' + tetantCode })
      }
    } else if (error && error.response && error.response.status === 403) {
      if (
        error &&
        error.response &&
        error.response.data &&
        error.response.data.logId
      ) {
        Message.errorLog(errorMessage, error.response.data.logId)
      } else {
        Message.error(errorMessage)
      }
    } else if (error && error.response && error.response.status === 500) {
      if (error.response.data && error.response.data.message) {
        Message.errorLog(error.response.data.message, error.response.data.logId)
      } else {
        Message.error(error.message)
      }
    } else if (errorMessage && typeof errorMessage != 'undefined') {
      Message.error(errorMessage)
    }
    NProgress.done() // 结束
    return Promise.resolve(error.response)
  }
)

Message.errorLog = function (obj, logId) {
  if (typeof obj == 'string' && logId) {
    let msg = obj
    let log = `【日志ID：${logId}】`
    Message({
      type: 'error',
      message:
        msg +
        "<div tooltip position='right' class='tooltip-wrapper'><i class='icon-question msg-log-icon'></i><p class='msg-log-content'>" +
        log +
        '</p> </div>',
      dangerouslyUseHTMLString: true
    })
  } else {
    Message.error(obj)
  }
}

export default {
  request(data) {
    let reqData = data.data || {}
    //支持表达式作为域名解析
    data.url = this.parseUrl(data.url)
    //统一拼接域名接口
    if (data.url.indexOf('http') == -1) {
      data.url = context.front + data.url
    }
    if (
      window.agentLeaderId &&
      window.agentLeaderId != '0' &&
      data.url.indexOf('leaderId=') < 0 &&
      window.location.href.indexOf('/task/') > 1
    ) {
      let mark = '&'
      if (data.url.indexOf('?') < 0) {
        mark = '?'
      }
      data.url += mark + 'leaderId=' + window.agentLeaderId
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
    }
    return axios(requestData)
  },
  download(url) {
    return this.request({ url, responseType: 'arraybuffer' })
  },
  get(url, type, isShowMessage) {
    return this.request({ url, responseType: type, isShowMessage: isShowMessage })
  },
  post(url, data, responseType) {
    return this.request({ url, data, method: 'POST', responseType: responseType })
  },
  remove(url) {
    return this.request({ url, method: 'DELETE' })
  },
  getContext() {
    return context
  },
  parseUrl(url) {
    if (url === '') return
    var ctx = this.getContext(),
      reg = /^(\$\{(\w+)\})\/.*$/

    var match = reg.exec(url)
    if (match != null) {
      var name = match[2],
        mc = match[1],
        val = ctx[name]
      if (!val) {
        throw new Error(
          "The '" +
          name +
          "' in url:" +
          url +
          ' does not defined in context provider.'
        )
      }
      return url.replace(mc, val)
    } else {
      return url
    }
  }
}
