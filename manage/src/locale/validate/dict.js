let dict = {
  "zh-CN": {
    messages: {
      isExist: (field, args) => {
        return '输入已存在';
      }
    },
    names: {
    }
  },
  "zh-TW": {
    messages: {
      isExist: () => {
        return '輸入已存在';
      }
    },
    names: {
    }
  },
  "en-US": {
    messages: {
      isExist: () => {
        return 'is exist';
      }
    }
  }
};

export default dict