const dict = {
  "zh-CN": {
    messages: {
      required: (field) => '必填',
      numeric: () => '请输入整数',
      email: () => '不是有效的邮箱地址',
      maxIntLen: (field, args) => `长度不能超过${args}`,
      maxLength: (field, args) => `长度不能超过${args}`,
      maxDecimalLen: (field, args) => `小数位的长度不能超过${args}`,
      datelessthan: (field, args) => {
        return '日期必须小于' + document.getElementsByName(args[0])[0].value;
      },
      daterangeend: (field, args) => {
        return '日期必须小于或等于' + document.getElementsByName(args[0])[0].value;
      },
      datemorethan: (field, args) => {
        return '日期必须大于' + document.getElementsByName(args[0])[0].value;
      },
      daterangestart: (field, args) => {
        return '日期必须大于或等于' + document.getElementsByName(args[0])[0].value;
      },
      number: () => '必须是数字',
      decimal: (field, args) => {
        if (args.length > 0 && args[0] > 0) {
          return '必须是数字，并且可以包含' + args[0] + '个小数';
        } else {
          return '必须是数字，并且不可以包含小数';
        }
      },
      alpha: () => '只能是字母字符',
      url: () => '请输入一合法的网址',
      max: (field, args) => {
        if (args.length > 0) {
          return '最大字符长度不能超过' + args[0] + '';
        } else {
          return '已超过最大字符长度';
        }
      },
      min: (field, args) => {
        if (args.length > 0) {
          return '必须至少为' + args[0] + '个字符';
        } else {
          return '字符长度不符合';
        }
      },
      length: (field, args) => {
        if (args.length > 0) {
          return '字符长度必须为' + args[0] + '个字符';
        } else {
          return '字符长度不符合';
        }
      },
      min_value: (field, args) => {
        if (args.length > 0) {
          return '必须为' + args[0] + '或更多';
        } else {
          return 'err';
        }
      }, regex: () => '字段格式无效',
      date: () => '必须为日期类型',
      time: () => '必须为日期时分秒类型',
      confirmed: () => '两次输入的数据不一致',
      backendValidate: (field, args, data) => {
        if (data && data.message) {
          return data.message;
        }
        return '后端验证失败';
      },
      phonenumber: () => {
        return '请输入正确的手机号码';
      },
      frontJSValidate: (field, args, data) => {
        if (data && data.message) {
          return data.message;
        }
        return "前端js校验失败"
      },
      isExist: () => {
        return '输入已存在';
      }
    },
    names: {
      expression: "常用语"
    }
  },
  "en-US": {
    messages: {
      required: () => 'required',
      numeric: () => 'please enter a number',
      email: () => 'not a valid mailbox address',
      maxIntLen: (field, args) => `length should not exceed${args}`,
      maxLength: (field, args) => `length should not exceed${args}`,
      maxDecimalLen: (field, args) => `the length of decimal digits should not exceed${args}`,
      datelessthan: (field, args) => {
        return 'date must be less than' + document.getElementsByName(args[0])[0].value;
      },
      daterangeend: (field, args) => {
        return 'date must be less than or equal to' + document.getElementsByName(args[0])[0].value;
      },
      datemorethan: (field, args) => {
        return 'date must be greater than' + document.getElementsByName(args[0])[0].value;
      },
      daterangestart: (field, args) => {
        return 'date must be greater than or equal to' + document.getElementsByName(args[0])[0].value;
      },
      number: () => 'must be a number',
      decimal: (field, args) => {
        if (args.length > 0 && args[0] > 0) {
          return 'must be a number and can contain ' + args[0] + ' decimal numbers';
        } else {
          return 'must be a number, and must not contain decimal';
        }
      },
      alpha: () => 'it can only be alphabetic characters.',
      url: () => 'please enter a legal website',
      max: (field, args) => {
        if (args.length > 0) {
          return 'maximum character length should not exceed' + args[0] + '';
        } else {
          return 'has exceeded the maximum character length';
        }
      },
      min: (field, args) => {
        if (args.length > 0) {
          return 'Must have at least  ' + args[0] + ' characters';
        } else {
          return 'character length does not match';
        }
      },
      length: (field, args) => {
        if (args.length > 0) {
          return 'character length must be  ' + args[0] + ' character';
        } else {
          return 'character length does not match';
        }
      },
      min_value: (field, args) => {
        if (args.length > 0) {
          return 'must be ' + args[0] + ' or more';
        } else {
          return 'err';
        }
      }, regex: () => 'invalid field format',
      date: () => 'must be of date type',
      confirmed: () => 'two inconsistencies in input data',
      backendValidate: (field, args, data) => {
        if (data && data.message) {
          return data.message;
        }
        return 'backend authentication failed';
      },
      phonenumber: () => {
        return 'please enter the correct mobile phone number';
      },
      frontJSValidate: (field, args, data) => {
        if (data && data.message) {
          return data.message;
        }
        return "front-end JS checkout failed"
      },
      isExist: () => {
        return 'is exist';
      }
    }
  }
};

export default dict
