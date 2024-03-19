import req from "@/request.js";
import _ from "lodash";
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
  }
};

export default rules;

