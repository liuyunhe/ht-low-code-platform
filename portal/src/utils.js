import { Message, MessageBox, Notification } from 'element-ui'
import { is } from 'vee-validate/dist/rules.esm'
let closeAllNotificationFlag = false //是否隐藏感叹号校验提示
let notifications = {} //用来获取弹窗的实例，以对对应弹窗进行操作
var utils = {
  /**根据传入的值和数组进行比较，相等返回该数据个某条数据*/
  indexOfList(list, key, value) {
    for (let i = 0; i < list.length; i++) {
      if (list[i][key] == value) {
        return list[i]
      }
    }
  },
  /**字节数转KB或者MB*/
  bigDecimal: bytes => {
    let returnValue = bytes / (1024 * 1024)
    if (returnValue > 1) {
      return returnValue.toFixed(2) + 'M'
    } else {
      returnValue = bytes / 1024
      return returnValue.toFixed(0) + 'KB'
    }
  },
  /**获取指定字符后面所有字符*/
  substringType: (str, type) => {
    let returnValue = str.split('.')
    return returnValue[returnValue.length - 1]
  },
  /**获取随机的名称*/
  getName: () => {
    return Math.random()
      .toString(36)
      .substr(2)
  },
  /**获取控件是否可编辑*/
  getWriteable: permission => {
    if (permission === 'w' || permission === 'b') {
      return true
    }
    return false
  },
  /**获取控件是否添加必填校验*/
  addRequiredOrNot: (permission, validate, linkageValidate, _this) => {
    //判断是否有联动校验
    if (linkageValidate.length > 0) {
      linkageValidate.forEach(ele => {
        if (ele && ele.validate && 'data.' + ele.target == _this.atter) {
          validate = ele.validate
        }
      })
    }
    if (permission !== 'b') {
      return validate
    }
    //如果表单授权为某控件加了必填则必填
    if (
      permission === 'b' &&
      validate &&
      !validate.required &&
      validate.constructor === Object
    ) {
      validate.required = true
    }
    if (validate === undefined || validate === null) {
      validate = 'required'
    } else if (validate.constructor === String) {
      let ary = validate.split('|')
      if (!ary.some(item => item === 'required')) {
        ary.splice(0, 0, 'required')
        validate = ary.join('|')
      }
    } else if (validate.constructor === Object) {
      validate = Object.assign({ required: true }, validate)
    } else {
      throw 'validate不是允许的类型'
    }
    return validate
  },
  // 格式化日期
  formatDate: value => {
    let date = null
    if (!value) {
      return date
    }
    if (value.constructor == Date && !isNaN(value.getTime())) {
      date = value
    } else if (value.constructor == String || value.constructor == Number) {
      date = new Date(value)
    } else {
      throw '格式化日期时，传入的数据格式不正确。'
    }
    let y = date.getFullYear()
    let MM = date.getMonth() + 1
    MM = MM < 10 ? '0' + MM : MM
    let d = date.getDate()
    d = d < 10 ? '0' + d : d
    let h = date.getHours()
    h = h < 10 ? '0' + h : h
    let m = date.getMinutes()
    m = m < 10 ? '0' + m : m
    let s = date.getSeconds()
    s = s < 10 ? '0' + s : s
    return y + '-' + MM + '-' + d + ' ' + h + ':' + m + ':' + s
  },
  // 格式化日期
  formatDateYear: value => {
    let date = new Date(value)
    let y = date.getFullYear()
    let MM = date.getMonth() + 1
    MM = MM < 10 ? '0' + MM : MM
    let d = date.getDate()
    d = d < 10 ? '0' + d : d
    return y + '-' + MM + '-' + d
  },
  // 比较2个日期
  daysBetween: (DateOne, DateTwo, notSupportEquals) => {
    if (!DateOne || !DateTwo) {
      return true
    }
    var date1 =
      new Date(DateOne).getTime() ||
      new Date(new Date().format('yyyy-MM-dd') + ' ' + DateOne).getTime()
    var date2 =
      new Date(DateTwo).getTime() ||
      new Date(new Date().format('yyyy-MM-dd') + ' ' + DateTwo).getTime()
    if (notSupportEquals) {
      //大于。v2>v1 。
      if (date2 > date1) {
        return true
      } else {
        return false
      }
    } else {
      //大于等于。v2>=v1 。只要v1不大于v2即可
      if (date1 > date2) {
        return false
      } else {
        return true
      }
    }
  },
  // 日期计算
  dateCalc: (startDate, endDate, op) => {
    if (
      !startDate ||
      !endDate ||
      startDate.length == 0 ||
      endDate.length == 0
    ) {
      return 0
    }
    if (op.legend == 0) {
      op = 'day'
    }
    var date1 =
      new Date(startDate).getTime() ||
      new Date(new Date().format('yyyy-MM-dd') + ' ' + startDate).getTime()
    var date2 =
      new Date(endDate).getTime() ||
      new Date(new Date().format('yyyy-MM-dd') + ' ' + endDate).getTime()
    var res = 0
    var days = date2 - date1
    switch (op) {
      case 'month':
        res = parseInt(days / (1000 * 60 * 60 * 24 * 30))
        break
      case 'day':
        res = parseInt(days / (1000 * 60 * 60 * 24))
        break
      case 'hour':
        res = parseInt(days / (1000 * 60 * 60))
        break
      case 'minute':
        res = parseInt(days / (1000 * 60))
        break
      default:
        res = parseInt(days / 1000)
    }
    return res
  },

  // 格式化日期
  formatDateByString: value => {
    let date = null
    if (!value) {
      return date
    }
    if (value.constructor == Date && !isNaN(value.getTime())) {
      date = value
    } else if (value.constructor == String || value.constructor == Number) {
      date = new Date(value)
    } else {
      throw '格式化日期时，传入的数据格式不正确。'
    }
    let y = date.getFullYear()
    let MM = date.getMonth() + 1
    MM = MM < 10 ? '0' + MM : MM
    let d = date.getDate()
    d = d < 10 ? '0' + d : d
    let h = date.getHours()
    h = h < 10 ? '0' + h : h
    let m = date.getMinutes()
    m = m < 10 ? '0' + m : m
    let s = date.getSeconds()
    s = s < 10 ? '0' + s : s
    return y + '年' + MM + '月' + d + '日' + ' ' + h + ':' + m
  },
   // 格式化日期
   formatDateByWFString: value => {
    let date = null
    if (!value) {
      return date
    }
    if (value.constructor == Date && !isNaN(value.getTime())) {
      date = value
    } else if (value.constructor == String || value.constructor == Number) {
      date = new Date(value)
    } else {
      throw '格式化日期时，传入的数据格式不正确。'
    }
    let y = date.getFullYear()
    let MM = date.getMonth() + 1
    MM = MM < 10 ? '0' + MM : MM
    let d = date.getDate()
    d = d < 10 ? '0' + d : d
    let h = date.getHours()
    h = h < 10 ? '0' + h : h
    let m = date.getMinutes()
    m = m < 10 ? '0' + m : m
    let s = date.getSeconds()
    s = s < 10 ? '0' + s : s
    return y + '-' + MM + '-' + d  + ' ' + h + ':' + m+ ':' + s
  },
  // 平铺结构转嵌套结构
  tile2nest: (array, key, pKey, childrenKey) => {
    if (!array || array.constructor !== Array) {
      return array
    }
    // 复制一份，避免修改原始数组
    let ary = [...array]
    key = key || 'id'
    pKey = pKey || 'parentId'
    childrenKey = childrenKey || 'children'
    // 定义一个待移除数组
    let ary2remove = []
    ary.map(item => {
      if (item[key] !== item[pKey]) {
        // 找父节点
        let p = ary.filter(c => c[key] === item[pKey])
        if (p && p.length == 1) {
          p[0].children = p[0].children || []
          // 将子节点放到父节点中
          p[0].children.push(item)
          ary2remove.push(item[key])
        }
      }
    })
    // 遍历移除待删除对象
    ary2remove.map(item => {
      ary = ary.filter(c => c[key] !== item)
    })
    return ary
  },
  // 从对象中获取和验证字段路径
  getAndValidPath: (obj, key) => {
    if (
      !obj ||
      obj.constructor != Object ||
      !key ||
      key.constructor != String
    ) {
      return null
    }
    if (!obj.hasOwnProperty(key)) {
      return null
    }
    let path = obj[key]
    if (/^\w+.*\w+$/.test(path)) {
      return path
    } else {
      return null
    }
  },
  // 获取Vue实例中指定className的父实例
  getParentInstanceByClassName: (instance, className) => {
    if (!instance) {
      throw 'VueComponent实例为空.'
    }
    if (
      instance.$el.className &&
      instance.$el.className.indexOf(className) > -1
    ) {
      return instance
    } else if (instance.$root && instance.$root._uid == instance._uid) {
      throw `查找VueComponent实例树时找到根节点都未找到className为${className}的实例.`
    } else if (instance.$parent) {
      return utils.getParentInstanceByClassName(instance.$parent, className)
    }
  },
  // 获取控件所在表单对应的实例对象
  getOnlineFormInstance: instance => {
    if (!instance) {
      throw 'VueComponent实例为空.'
    }
    if (
      instance.$el.getAttribute &&
      instance.$el.getAttribute('name') === 'online-form'
    ) {
      return instance
    } else if (instance.$root && instance.$root._uid == instance._uid) {
      throw `查找VueComponent实例树时找到根节点都未找到name为online-form的实例.`
    } else if (instance.$parent) {
      return utils.getOnlineFormInstance(instance.$parent)
    }
  },

  // 根据自定义标签名(组件名)获取某个Vue实例
  getInstanceByTag: (instance, args) => {
    if (!instance) {
      throw 'VueComponent实例为空.'
    }
    if (args.includes(instance.$options._componentTag)) {
      return instance
    } else if (instance.$root && instance.$root._uid == instance._uid) {
      throw `查找VueComponent实例树时找到根节点都未找到name为tag的实例.`
    } else if (instance.$parent) {
      return utils.getInstanceByTag(instance.$parent, args)
    }
  },

  // 获取Vue实例及父级实例中有reload方法的实例
  getReloadMethod: instance => {
    if (!instance) {
      return null
    }
    if (instance.reload && instance.reload.constructor === Function) {
      return instance
    } else if (instance.$root && instance.$root._uid == instance._uid) {
      return null
    } else if (instance.$parent) {
      return utils.getReloadMethod(instance.$parent)
    }
  },

  // 重新加载当前页面(不会刷新整个页面，只刷新router-view部分)
  reload: () => {
    let viewElementAry = document.getElementsByName('app-base-main')
    if (!viewElementAry || viewElementAry.length != 1) {
      window.location.reload()
    } else {
      let viewInst = viewElementAry[0].__vue__
      if (!viewInst || !viewInst._isVue) {
        window.location.reload()
      }
      let r = utils.getReloadMethod(viewInst)
      if (r) {
        r.reload()
      } else {
        window.location.reload()
      }
    }
  },
  // 获取在线表单的json格式字符串的表单数据(validate参数决定是否需要对表单进行验证)
  getOnlineFormData: validate => {
    return new Promise((resolve, reject) => {
      let formElementAry = document.getElementsByName('online-form')
      if (!formElementAry || formElementAry.length < 1) {
        var frmFrame = $('#frmFrame')
        if (frmFrame && frmFrame.length > 0) {
          var frm = frmFrame[0]
          var isCallBack = false
          var cancelTimeout = false
          var isTimeOut = false
          // 子页面是否收到了消息
          var isRoger = false
          frm.contentWindow.postMessage('saveData', '*')
          window.addEventListener('message', function (e) {
            if (e.data && e.data.constructor == Object) {
              if (e.data.type == 'saveData' && !isCallBack) {
                isCallBack = true
                if (e.data.state && !isTimeOut) {
                  let iframeData = {
                    businessKey: e.data.businessKey,
                    sysCode: e.data.sysCode
                  }
                  if (e.data.vars) {
                    iframeData.vars = e.data.vars
                  }
                  resolve(iframeData)
                }
              } else if (e.data.type == 'cancelTimeout') {
                cancelTimeout = true
              } else if (e.data.type == 'roger' && !isRoger) {
                isRoger = true
              }
            }
          })

          // 只要子页面引入了hotent.helper.js，父页面发送了消息后，子页面会马上回复`roger`。
          // 这里设置0.5秒后未收到`roger`消息则认为子页面未引入hotent.helper.js，此时直接reject。
          setTimeout(function () {
            if (!isRoger) {
              reject(6)
            }
          }, 500)

          // 设置10秒超时机制，如果超时则不再往下执行
          setTimeout(function () {
            if (!isCallBack && !cancelTimeout) {
              isTimeOut = true
              reject(5)
            }
          }, 10000)
        } else {
          reject(1)
        }
      } else {
        let frmInst = formElementAry[0].__vue__
        if (!frmInst || !frmInst._isVue) {
          reject(2)
        }
        //处理handsontable子表数据
        let refs = frmInst.$refs['onlineForm'].$refs
        let hotData = true
        if (refs) {
          for (const ref in refs) {
            if (refs.hasOwnProperty(ref) && ref.indexOf('hottable.') == 0) {
              const refEle = refs[ref]
              hotData = refEle.getHotTableData(true)
              if (hotData && Array.isArray(hotData)) {
                const names = ref.split('.')
                if (hotData && Array.isArray(hotData)) {
                  frmInst.data[names[1]][names[2]] = [...hotData]
                } else {
                  frmInst.data[names[1]][names[2]] = []
                }
              }
            }
          }
        }
        if (!validate) {
          resolve(JSON.stringify(frmInst.data))
          return
        }
        frmInst.$root.$validator.validateAll('custom-form').then(result => {
          if (hotData === false) {
            //hottable子表数据校验失败
            reject(7)
            return
          }
          if (result) {
            resolve(JSON.stringify(frmInst.data))
          } else {
            reject({ reason: 3, errors: frmInst.$root.$validator.errors.items })
          }
        })
      }
    })
  },
  // 获取表单数据失败的处理
  handleGetFormDataReject: (reason, needConfirm) => {
    return new Promise((resolve, reject) => {
      let errors = []
      if (reason && reason.constructor == Object) {
        errors = reason.errors
        reason = reason.reason
      }
      switch (reason) {
        case 1:
          Message.error('未获取到在线表单或者URL表单.')
          reject()
          break
        case 2:
          Message.error('使用了在线表单，但是表单为空或者加载失败.')
          reject()
          break
        case 3:
          let errorMsg = []
          errors &&
            errors.forEach(e => {
              let fieldLabel = ''
              if (e.field) {
                if (e.field.indexOf('-') != -1) {
                  fieldLabel = e.field.substr(e.field.indexOf('-') + 1)
                } else {
                  fieldLabel = e.field
                }
              }
              errorMsg.push(`${fieldLabel} ${e.msg}`)
            })
          if (errorMsg.length > 0) {
            if (document.getElementsByName('online-form')[0]) {
              let frmInst = document.getElementsByName('online-form')[0].__vue__
              let jsonObj = frmInst.$refs.onlineForm.$refs
              for (let key in jsonObj) {
                if (jsonObj[key].$el.textContent) {
                  let textContent = jsonObj[key].$el.textContent
                  for (let i = 0; i < errorMsg.length; i++) {
                    if (textContent.indexOf(errorMsg[i]) != -1) {
                      document.getElementsByClassName(key)[0].style.color =
                        'red'
                      break
                    }
                  }
                }
              }
            }
            utils.handleReject(errorMsg)
          } else {
            Message.warning('请正确的填写表单内容.')
          }
          reject()
          break
        case 5:
          Message.error('URL表单处理业务数据超时.')
          reject()
          break
        case 6:
          if (needConfirm) {
            MessageBox.confirm(
              'URL表单页面未正确处理数据，是否仍然启动流程？',
              { type: 'warning' }
            )
              .then(() => resolve())
              .catch(() => reject())
          } else {
            resolve()
          }
          break

        case 7: //hottable子表数据校验失败。
          reject()
          break
        default:
          Message.error(`获取表单数据时发生预期之外的异常，reason:${reason}`)
          reject()
          break
      }
    })
  },
  //关闭所有校验通知
  closeAllNotification() {
    closeAllNotificationFlag = true
    for (let key in notifications) {
      notifications[key].close()
      delete notifications[key]
    }
  },
  handleReject(errorMsg) {
    utils.closeAllNotification()
    closeAllNotificationFlag = false
    let notifi = Notification.error({
      title: '错误提示',
      dangerouslyUseHTMLString: true,
      message: `请正确的填写以下表单内容：<br/>${errorMsg.join('<br/>')}`,
      duration: 0,
      onClose: function () {
        if (!closeAllNotificationFlag) {
          setTimeout(() => {
            let n = Notification.warning({
              customClass: 'customClass',
              duration: 0,
              showClose: false,
              onClick: function () {
                n.close()
                utils.handleReject(errorMsg)
              }
            })
            notifications[n.id] = n
          }, 10)
        }
      }
    })
    notifications[notifi.id] = notifi
  },
  // 获取指定dom元素的父级中具有指定属性的dom元素
  getParentElementByAttribute: (el, attribute) => {
    if (!el || !el.hasAttribute || el.hasAttribute.constructor !== Function) {
      throw '传入的元素el不能为空且必须为HTMLHtmlElement类型.'
    }
    if (!attribute || attribute.constructor !== String) {
      throw '传入的属性attribute不能为空且必须为String类型.'
    }
    if (el.hasAttribute(attribute)) {
      return el
    } else if (el.tagName === 'HTML') {
      return null
    } else {
      return utils.getParentElementByAttribute(el.parentElement, attribute)
    }
  },
  // 从父级dom元素中获取指定属性的值
  getSomeAttributeFromParentElement: (el, attribute) => {
    let pEl = utils.getParentElementByAttribute(el, attribute)
    if (pEl && pEl.getAttribute && pEl.getAttribute.constructor === Function) {
      return pEl.getAttribute(attribute)
    }
    return null
  },
  // 通过路径取得对象中的属性
  getValueByPath: (obj, path, subIndex, sunIndex) => {
    if (!obj || !path || path.constructor != String) {
      return null
    }
    if (!/^\w?.*[\w|\]]$/.test(path)) {
      return null
    }
    const configAttr = path.split('.')
    if (sunIndex >= 0 && configAttr.length == 5) {
      path =
        configAttr[0] +
        '.' +
        configAttr[1] +
        '.' +
        configAttr[2] +
        '[' +
        subIndex +
        ']' +
        '.' +
        configAttr[3] +
        '.' +
        configAttr[4]
    }
    let pathAry = path.split('.')
    if (pathAry.length == 1) {
      return obj[path]
    } else if (pathAry.length > 1) {
      let ret = obj
      for (var i = 0; i < pathAry.length; i++) {
        const key = pathAry[i]
        const match = /^(\w+)\[(\d+)\]$/.exec(key)
        if (match) {
          ret = ret[match[1]][match[2]]
        } else if (ret && ret.constructor === Array) {
          let index = 0
          if (subIndex != null && subIndex != undefined) {
            let preIndex = Number.parseInt(subIndex)
            if (!isNaN(preIndex)) {
              index = preIndex
            }
          }
          if (sunIndex != null && sunIndex != undefined) {
            let preIndex = Number.parseInt(sunIndex)
            if (!isNaN(preIndex)) {
              index = preIndex
            }
          }
          ret = ret[index][key]
        } else {
          ret = ret[key]
        }
      }
      return ret
    }
    return null
  },
  //ccwgq 2022-10-15 补充孙表直接逻辑
  setValueByPath: (obj, path, value, subIndex, sunIndex) => {
    if (!obj || !path || path.constructor != String) {
      return
    }
    if (!/^\w?.*[\w|\]]$/.test(path)) {
      return
    }
    //ccwgq 2022-10-17 补充孙表的逻辑,以前都是在组件内部完成路径的拼接,
    //代码过于冗余,不如在这里拼接
    const configAttr = path.split('.')
    if (sunIndex >= 0 && configAttr.length == 5) {
      path =
        configAttr[0] +
        '.' +
        configAttr[1] +
        '.' +
        configAttr[2] +
        '[' +
        subIndex +
        ']' +
        '.' +
        configAttr[3] +
        '.' +
        configAttr[4]
    }
    let pathAry = path.split('.')
    if (pathAry.length == 1) {
      obj[path] = value
    } else if (pathAry.length > 1) {
      let ret = obj
      for (var i = 0; i < pathAry.length; i++) {
        const key = pathAry[i]
        const match = /^(\w+)\[(\d+)\]$/.exec(key)
        if (i == pathAry.length - 1) {
          if (match) {
            ret[match[1]][match[2]] = value
          } else if (ret && ret.constructor === Array) {
            let index = 0
            if (subIndex != null && subIndex != undefined) {
              let preIndex = Number.parseInt(subIndex)
              if (!isNaN(preIndex)) {
                index = preIndex
              }
            }
            if (sunIndex != null && sunIndex != undefined) {
              let preIndex = Number.parseInt(sunIndex)
              if (!isNaN(preIndex)) {
                index = preIndex
              }
            }
            obj.$set(ret[index], key, value)
            //ret[index][key] = value;
          } else {
            //ret[key] = value;
            obj.$set(ret, key, value)
          }
        } else {
          if (match) {
            ret = ret[match[1]][match[2]]
          } else {
            ret = ret[key]
          }
        }
      }
    }
    obj.$forceUpdate()
  },
  /**
   * 将字符串转为json对象。
   * @param jsonStr
   * @param type  可不填写parseToJson
   * @returns
   */
  parseToJson: (jsonStr, type) => {
    type = type || 1
    if (!jsonStr || jsonStr === '') return
    //如果包含换行，下面解析json会报错，所以将换行替换为2个空格符
    jsonStr = jsonStr.replace(/\n/g, '  ')
    try {
      switch (type) {
        case 1:
          return eval('(' + jsonStr + ')')
          break
        case 4:
          JSON.parse(jsonStr)
          break
        default:
          throw '解析json对象错误'
          break
      }
    } catch (e) {
      return utils.parseToJson(jsonStr, type + 1)
    }
  },
  /**
   * 将数字转换成人名币大写。
   *
   * @param currencyDigits
   * @returns
   */
  convertCurrency: currencyDigits => {
    var MAXIMUM_NUMBER = 99999999999.99
    var CN_ZERO = '零'
    var CN_ONE = '壹'
    var CN_TWO = '贰'
    var CN_THREE = '叁'
    var CN_FOUR = '肆'
    var CN_FIVE = '伍'
    var CN_SIX = '陆'
    var CN_SEVEN = '柒'
    var CN_EIGHT = '捌'
    var CN_NINE = '玖'
    var CN_TEN = '拾'
    var CN_HUNDRED = '佰'
    var CN_THOUSAND = '仟'
    var CN_TEN_THOUSAND = '万'
    var CN_HUNDRED_MILLION = '亿'
    var CN_SYMBOL = ''
    var CN_DOLLAR = '元'
    var CN_TEN_CENT = '角'
    var CN_CENT = '分'
    var CN_INTEGER = '整'
    var integral
    var decimal
    var outputCharacters
    var parts
    var digits, radices, bigRadices, decimals
    var zeroCount
    var i, p, d
    var quotient, modulus
    currencyDigits = currencyDigits.toString()
    if (currencyDigits == '') {
      return ''
    }
    if (currencyDigits.match(/[^,.\d]/) != null) {
      return ''
    }
    if (
      currencyDigits.match(
        /^((\d{1,3}(,\d{3})*(.((\d{3},)*\d{1,3}))?)|(\d+(.\d+)?))$/
      ) == null
    ) {
      return ''
    }
    currencyDigits = currencyDigits.replace(/,/g, '')
    currencyDigits = currencyDigits.replace(/^0+/, '')

    if (Number(currencyDigits) > MAXIMUM_NUMBER) {
      return ''
    }

    parts = currencyDigits.split('.')
    if (parts.length > 1) {
      integral = parts[0]
      decimal = parts[1]

      decimal = decimal.substr(0, 2)
    } else {
      integral = parts[0]
      decimal = ''
    }

    digits = new Array(
      CN_ZERO,
      CN_ONE,
      CN_TWO,
      CN_THREE,
      CN_FOUR,
      CN_FIVE,
      CN_SIX,
      CN_SEVEN,
      CN_EIGHT,
      CN_NINE
    )
    radices = new Array('', CN_TEN, CN_HUNDRED, CN_THOUSAND)
    bigRadices = new Array('', CN_TEN_THOUSAND, CN_HUNDRED_MILLION)
    decimals = new Array(CN_TEN_CENT, CN_CENT)

    outputCharacters = ''

    if (Number(integral) > 0) {
      zeroCount = 0
      for (i = 0; i < integral.length; i++) {
        p = integral.length - i - 1
        d = integral.substr(i, 1)
        quotient = p / 4
        modulus = p % 4
        if (d == '0') {
          zeroCount++
        } else {
          if (zeroCount > 0) {
            outputCharacters += digits[0]
          }
          zeroCount = 0
          outputCharacters += digits[Number(d)] + radices[modulus]
        }
        if (modulus == 0 && zeroCount < 4) {
          outputCharacters += bigRadices[quotient]
        }
      }
      outputCharacters += CN_DOLLAR
    }

    if (decimal != '') {
      for (i = 0; i < decimal.length; i++) {
        d = decimal.substr(i, 1)
        if (d != '0') {
          outputCharacters += digits[Number(d)] + decimals[i]
        }
      }
    }

    if (outputCharacters == '') {
      outputCharacters = CN_ZERO + CN_DOLLAR
    }
    if (decimal == '') {
      outputCharacters += CN_INTEGER
    }
    outputCharacters = CN_SYMBOL + outputCharacters
    return outputCharacters
  },
  /**
   * 数字格式转换成千分位
   *@param{Object}num
   */
  thousandBit: num => {
    if ((num + '').trim() == '') {
      return ''
    }
    if (isNaN(num)) {
      return ''
    }
    num = num + ''
    if (/^.*\..*$/.test(num)) {
      var pointIndex = num.lastIndexOf('.')
      var intPart = num.substring(0, pointIndex)
      var pointPart = num.substring(pointIndex + 1, num.length)
      var intPart = intPart + ''
      var re = /(-?\d+)(\d{3})/
      while (re.test(intPart)) {
        intPart = intPart.replace(re, '$1,$2')
      }
      num = intPart + '.' + pointPart
    } else {
      num = num + ''
      var re = /(-?\d+)(\d{3})/
      while (re.test(num)) {
        num = num.replace(re, '$1,$2')
      }
    }
    return num
  },
  /**
   * 通过name获取页面url地址参数
   * @param name
   * @returns
   *
   */
  getUrlKey: function (name) {
    return (
      decodeURIComponent(
        (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(
          location.href
        ) || [, ''])[1].replace(/\+/g, '%20')
      ) || null
    )
  },
  //选择器上下移
  down: function (ary, selectArr, this_) {
    if (ary.length > 0 && selectArr.length > 0) {
      var idx = selectArr.indexOf(ary[ary.length - 1])
      if (idx + 1 < selectArr.length) {
        var t = selectArr[idx + 1]
        selectArr[idx + 1] = selectArr[idx]
        selectArr[idx] = t
        this_.calacInputSuffixHeight()
        this_.syncInputValue()
      }
    }
  },
  up: function (ary, selectArr, this_) {
    if (ary.length > 0 && selectArr.length > 0) {
      var idx = selectArr.indexOf(ary[ary.length - 1])
      if (idx != 0) {
        var t = selectArr[idx - 1]
        selectArr[idx - 1] = selectArr[idx]
        selectArr[idx] = t
        this_.calacInputSuffixHeight()
        this_.syncInputValue()
      }
    }
  },
  Array: {
    //上移按钮
    up: function (idx, list) {
      idx = parseInt(idx)
      if (idx < 1) {
        return
      }
      var t = list[idx - 1]
      list[idx - 1] = list[idx]
      list[idx] = t
    },
    //下移按钮
    down: function (idx, list) {
      idx = parseInt(idx)
      if (idx >= list.length - 1) {
        return
      }
      var t = list[idx + 1]
      list[idx + 1] = list[idx]
      list[idx] = t
    },
    resumeSn: function (list) {
      for (var k = 0; k < list.length; k++) {
        list[k].sn = k
      }
      return list
    },
    /**
     * idx 原位置
     * num 目标位置
     * list 数组
     */
    moveToNum: function (idx, target, list) {
      if (target == -1) {
        target = 0
      } else if (idx >= target) {
        target = target + 1
      }
      var t = list.splice(idx, 1)
      list.insert(target, t[0])
      this.resumeSn(list)
    },
    //删除按钮
    del: function (idx, list) {
      list.splice(idx, 1)
    },
    //找到指定元素的未知
    idxOf: function (val, list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i] == val) return i
      }
      return -1
    },
    //删除指定元素
    remove: function (val, list) {
      var idx = this.idxOf(val, list)
      if (idx > -1) {
        list.splice(idx, 1)
      }
    },
    //置顶
    top: function (idx, list) {
      if (idx >= list.length || idx < 1) {
        return
      }
      //逐个交换
      for (var i = 0; i < idx; i++) {
        var temp = list[i]
        list[i] = list[idx]
        list[idx] = temp
      }
    },
    //置底
    bottom: function (idx, list) {
      if (idx >= list.length - 1 || idx < 0) {
        return
      }
      //逐个交换
      for (var i = list.length - 1; i > idx; i--) {
        var temp = list[i]
        list[i] = list[idx]
        list[idx] = temp
      }
    }
  },
  /**
   * 对象转url参数
   * @param {*} data
   * @param {*} isPrefix
   */
  queryParams(data, isPrefix = false) {
    let prefix = isPrefix ? '?' : ''
    let _result = []
    for (let key in data) {
      let value = data[key]
      // 去掉为空的参数
      if (['', undefined, null].includes(value)) {
        continue
      }
      if (value.constructor === Array) {
        value.forEach(_value => {
          _result.push(
            encodeURIComponent(key) + '[]=' + encodeURIComponent(_value)
          )
        })
      } else {
        _result.push(encodeURIComponent(key) + '=' + encodeURIComponent(value))
      }
    }

    return _result.length ? prefix + _result.join('&') : ''
  },
  Menu: {
    addSubMenus: function (that, children) {
      let this_ = this
      if (children && children.length > 0) {
        //					if(!parent.children){
        //						parent.children = [{path:'/', redirect:children[0].menuUrl}];
        //					}
        children.forEach(m => {
          //const route = {path: m.menuUrl, name: m.alias,  component: resolve => require([`@/${m.templateUrl}`], resolve )};
          //parent.children.push(route);
          if (m.children && m.children.length > 0) {
            this_.addSubMenus(that, m.children)
          }
        })
      }
    },
    addToRouter: function (that, route) {
      let routes = that.$router.options.routes
      let isIn = false
      routes.forEach(r => {
        if (r.path == route.path) {
          isIn = true
        }
      })
      if (!isIn) {
        that.$router.options.routes.push(route)
        that.$router.addRoutes([route])
      }
    },
    addSyncMenus: function (that, menus) {
      if (menus && menus.constructor === Array && menus.length > 0) {
        // 更新当前选中的菜单
        setTimeout(() => {
          const curRoutePath = that.$route.path
          menus.forEach(m => {
            //将动态菜单添加到路由
            if (
              m.code != 'home' &&
              m.code != 'statement' &&
              that.menuMaps[m.code]
            ) {
              //const route = {path: m.path,  component: resolve => require([`@/${m.templateUrl}`], resolve )};
              //添加路由信息
              if (that.menuMaps[m.code] && that.menuMaps[m.code].length > 0) {
                this.addSubMenus(that, that.menuMaps[m.code])
              }
              //this.addToRouter(that,route);
            }
            const p = new RegExp(`^/${m.alias}/.*$`)
            if (p.test(curRoutePath)) {
              that.activeMenuIndex = m.alias
            }
          })
        }, 100)
      }
    }
  },

  //  ccwgq  ===> 修复 孙表中的对话框回填错误... 获取属性路径错误  观察dom层级
  /**
   * 获取点击后对话框的子表下标
   * @param vInst
   * @param modelName
   */
  getSonTableIndex(vInst, modelName, isGrand) {
    const mainModel = modelName[0]
    const subModel = modelName[1]
    let el = vInst.$el
    // console.log("vInst===>",vInst,vInst.$el);
    // console.log("modelName===>",modelName);
    el = this.getParentElementByAttribute(el, 'data-subname')
    if (isGrand) {
      el = this.getParentElementByAttribute(el.parentElement, 'data-subname')
    }
    if ($(el).attr('data-subname') === `data.${mainModel}.${subModel}`) {
      // console.log($(el).attr("data-index"));
      return $(el).attr('data-index')
    } else return null
  },
  /**
   * 获取点击后对话框的孙表下标
   * @param vInst
   * @param modelName
   */
  getGrandTableIndex(vInst, modelName) {
    const mainModel = modelName[0]
    const subModel = modelName[1]
    const grandModel = modelName[2]
    let el = vInst.$el
    el = this.getParentElementByAttribute(el, 'data-subname')
    const val = $(el).attr('data-subname')
    const sonIndex = this.getSonTableIndex(vInst, modelName, true)
    if (!sonIndex) {
      return null
    }
    const key = `data.${mainModel}.${subModel}[${sonIndex}].${grandModel}`
    if (val !== key) {
      return null
    }
    return $(el).attr('data-index')
  },

  //ccwgq 2022-08-15 增加模板解析
  /**
   * 将${key}形式的占位符模板解析到真实的值
   * @param {object} data 数据
   * @param {string} template 模板
   */
  parseTemplate(data, template) {
    const Lib = {}
    if (typeof data !== 'object') data = {}
    //定义Lib为前缀的为一些内置
    var REG = /\$\{(([^{}])+)\}/g
    const matchList = template.match(REG) //匹配所有的${.}格式的值
    matchList.forEach(item => {
      const obj = item.match(/\${(?<key>([\w-.]+))}/).groups
      let fieldPath //解析出${key}中key的值
      if (obj && obj.key) {
        fieldPath = obj.key
        let repVal = '' //整个${key}要被这个值给替换
        if (/^Lib\.[\w]+/.test(fieldPath)) {
          //key是Lib.xx的形式,说明是内置库的某些变量
          //取得field
          const field = fieldPath.substring(4)
          if (!!Lib.field) {
            repVal = Lib.field
          }
        } else if (/^context/.test(fieldPath)) {
          fieldPath = fieldPath.split('.')
          let val = window
          fieldPath.forEach(path => {
            val = val[path]
          })
          repVal = val
        } else {
          const key = fieldPath.toLocaleLowerCase()
          if (data[key]) {
            repVal = data[key]
          }
        }
        template = template.replace(item, repVal)
      }
    })
    return template
  },

  /**
   * wude 2022-11-30
   * 页面跳转前,检查表单是否修改,进行提示
   * @param {*} this_ this
   * @param {*} route 要跳转的路由
   */
  checkFormUpdata(this_,route){
    var formUpdataFlag = sessionStorage.getItem('formUpdataFlag')
    // if (formUpdataFlag == 'true') {
      // MessageBox.confirm(
      //   '表单发生过变更,离开将导致录入数据丢失',
      //   '确定要离开当前页面吗?',
      //   {
      //     confirmButtonText: '确定',
      //     cancelButtonText: '取消',
      //     type: 'warning',
      //   }
      // )
      //   .then(() => {
      //     sessionStorage.setItem('formUpdataFlag', 'false')
      //     this_.$router.push(route)
      //   })
      //   .catch(() => {})
    // } else {
      this_.$router.push(route)
    // }
  }
}

// 在数组上扩展一个删除指定项的方法
Array.prototype.remove = function (item) {
  this.splice(
    this.findIndex(v => v === item),
    1
  )
}

// 在数组上扩展一个去重的方法
Array.prototype.unique = function (arg) {
  const res = new Map()
  return this.filter(m => {
    if (arg) {
      return !res.has(m[arg]) && res.set(m[arg], 1)
    } else {
      return !res.has(m) && res.set(m, 1)
    }
  })
}



export default utils
