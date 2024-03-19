import Vue from "vue";
import moment from 'moment';//日期格式化插件
import utils from "@/utils.js";
import form from "@/api/form.js";
import i18n from '@/lang/index.js';
import { Base64 } from "js-base64";
import req from "@/request.js";


Vue.filter('dateformat', function (dataStr, pattern = 'YYYY-MM-DD HH:mm:ss') {
  if (dataStr) {
    return moment(dataStr).format(pattern)
  } else {
    return "";
  }

}); //VUE页面使用：{{ newsinfo.add_time | dateformat('YYYY-MM-DD HH:mm:ss')}}

Vue.filter('timeLag', function (difference) {
  var r = "",
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
  return r;
});

Vue.filter('numFilter', function (value, type) {
  if (type == "thousandBit") {
    return utils.thousandBit(value)
  } else if (type == "currency") {
    return utils.convertCurrency(value)
  } else {
    return value;
  }

});

const backendValidate = {
  validate: (value, args) => {
    let url = args.url
    let submitFormData = args.submitFormData || false
    return new Promise((resolve, reject) => {
      form.backendValidate({ url: url, param: value, submitFormData: submitFormData }, res => {
        resolve(res);
      });
    });
  }, options: {
    hasTarget: false,
    immediate: true,
  },
  paramNames: ['url', 'submitFormData']
};
const frontJSValidate = {
  validate: (value, args) => {
    return new Promise((resolve, reject) => {
      let jsScript = args.jsScript
      jsScript = Base64.decode(jsScript);
      let formElementAry = document.getElementsByName("online-form");
      let data = {};
      if (formElementAry && formElementAry.length == 1) {
        let frmInst = formElementAry[0].__vue__;
        data = JSON.parse(JSON.stringify(frmInst.data));
      }
      function evil() {
        let Fn = Function('value', 'data', 'i18n', jsScript); //一个变量指向Function，防止有些前端编译工具报错
        let result = Fn(value, data, i18n);
        return result;
      }
      resolve(evil());
    });
  },
  options: {
    hasTarget: false,
    immediate: true,
  },
  paramNames: ['jsScript']
};

//  只能在rules 对象下添加校验规则
let rules = {
  isExist: {
    validate: (value, args) => {
      if (args.isTrue) {
        return true;
      }
      if (!value || !args) {
        return true;
      } else {
        let url = args.requestUrl;
        if (url) {
          return new Promise((resolve, reject) => {
            req.get(url + value).then(resp => {
              let data = resp.data;
              let isValid = false;
              if (!data || (data.constructor == Array && data.length == 0)
                || (data.constructor == Object && ((data.state && !data.value) || JSON.stringify(data) == '{}'))) {
                isValid = true;
              }
              resolve({ valid: isValid });
            })
          });
        } else {
          return { valid: true };
        }
      }
    },
    options: {
      hasTarget: false,
      immediate: false,
    },
    paramNames: ['requestUrl', 'isTrue']
  },
  time: {
    validate: (value, args) => {
      if (!value) { return true; }
      else {
        let dateVal = "";
        if (value.constructor == String) {
          dateVal = value;
        } else if (typeof value == "object") {
          dateVal = value.value;
          if (!dateVal || value.constructor == Date || (dateVal && dateVal.constructor == Date)) {
            return true;
          }
        }
        var re = /^(?:[01]?\d|2[0-3])(?::[0-5]?\d){2}$/g.test(dateVal.trim());
        return re;
      }
    },
    options: {
      hasTarget: false,
      immediate: true,
    },
    paramNames: []

  },
  date: {
    validate: (value, args) => {
      if (!value) { return true; }
      else {
        let dateVal = "";
        if (value.constructor == String) {
          dateVal = value;
        } else if (typeof value == "object") {
          dateVal = value.value;
          if (!dateVal || value.constructor == Date || (dateVal && dateVal.constructor == Date)) {
            return true;
          }
        }
        var re = /^([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8])))/g
          .test(dateVal.trim());
        return re;
      }
    },
    options: {
      hasTarget: false,
      immediate: true,
    },
    paramNames: []
  }
};

rules.backendValidate = backendValidate;
rules.frontJSValidate = frontJSValidate;


export default rules;

