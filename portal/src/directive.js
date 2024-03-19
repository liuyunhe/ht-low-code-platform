import Vue from 'vue'
import {createPopper} from '@popperjs/core'
import utils from '@/hotent-ui-util.js'
import FormMath from '@/math.js'
import dialog from '@/api/dialogApi.js'
import CustomQuery from '@/components/eipControl/bus/CustomQuery.js'
import {addClass, setStyle} from 'element-ui/src/utils/dom'
import Clipboard from 'clipboard'
import {cloneDeep} from 'lodash'
// 表单tr中根据隐藏字段动态合并单元格的指令
Vue.directive('permit', {
  componentUpdated: function(el, binding) {
    if (el.tagName !== 'TR') {
      throw 'v-permit指令只能用在tr元素上.'
    }
    if (!binding.value || binding.value.constructor !== Number) {
      throw 'v-permit指令的值只能是大于0的数字.'
    }
    el.removeAttribute('hidden')

    // tr中没有子元素时，删除tr自身
    if (el.cells.length == 0) {
      el.setAttribute('hidden', 'hidden')
    } else if (el.cells.length < binding.value) {
      let colspan = binding.value - el.cells.length + 1
      // 设置colspan实现单元格合并
      el.cells[el.cells.length - 1].setAttribute('colspan', colspan)
    } else if (el.cells.length === binding.value) {
      for (var i = 0, c; (c = el.cells[i++]); ) {
        c.removeAttribute('colspan')
      }
    }
  }
})

// 表单指令，会在表单的vue实例上添加一个map，用以存放数学运算的表达式
Vue.directive('form', {
  bind: function(el, binding, vnode) {
    const inst = vnode.context
    if (inst && !inst.hasOwnProperty('watchMap')) {
      inst['watchMap'] = new Map()
    }
  }
})

// 判断输入框是否作为计算字段，是则添加监听
Vue.directive('express', {
  componentUpdated: function(el, binding, vnode) {
    const inst = vnode.context
    if (!inst.$vnode.data.model) {
      return
    }
    const elAttr = inst.$vnode.componentOptions.propsData.modelExpression
    if (elAttr && !inst._expressInit) {
      inst._expressInit = true
      // 子表每一行数据作用域所在的dom元素
      let {subScopeEl} = utils.getSubScopeElAndIndex(el)
      let subname = null
      let aliasElAttr = null
      // 子表数据，需要找到配置了data-subname的元素
      if (subScopeEl) {
        subname = subScopeEl.dataset['subname']
        if (!subname) {
          throw '无法获取到当前子表前缀'
        }
        const elAttrAry = elAttr.split('.'),
          elAttrArySize = elAttrAry.length
        if (elAttrArySize < 1) {
          throw `子表中的数据绑定表达式${elAttr}错误`
        }
        aliasElAttr = `${subname}.${elAttrAry[elAttrArySize - 1]}`
      }
      const p = utils.getOnlineFormInstance(inst)
      if (
        p.watchMap &&
        (p.watchMap.has(elAttr) || p.watchMap.has(aliasElAttr))
      ) {
        if (
          !inst._watchers.some(m => {
            return m.expression === 'inputVal'
          })
        ) {
          inst.$watch(
            'inputVal',
            function(newVal, oldVal, farewell) {
              if (newVal !== oldVal) {
                const expList =
                  p.watchMap.get(elAttr) || p.watchMap.get(aliasElAttr)
                expList.forEach(item => {
                  let result = 0
                  const t = item.target
                  // 当在子表单行中时，而且不是对子表进行列运算时，判定为子表当前行内运算
                  if (subScopeEl && !/.*?\[\{.*?\}\].*?/.test(item.exp)) {
                    // 组件销毁时，不再计算子表单行的公式
                    if (farewell) {
                      return
                    }
                    const index = subScopeEl.dataset['index']
                    if (index === undefined) {
                      throw '获取不到当前子表行的索引，无法完成计算.'
                    }
                    result = FormMath.calcSubExpValue(
                      item.exp,
                      p,
                      subname,
                      index
                    )
                    p.$emit(t, {result, index})
                  } else {
                    result = FormMath.calcExpValue(item.exp, p)
                    p.$emit(t, {result})
                  }
                })
              }
            },
            {immediate: true}
          )
        }
      }
    }
  }
})

// 自定义对话框 v-auth-set-event
Vue.directive('auth-set-event', {
  bind: function(el, bindings, vnode) {
    const htAuthSetEvent = el.getAttribute('attr')
    if (!htAuthSetEvent) return
    var defaultPermissionList = []
    dialog.getPermissionList(result => {
      defaultPermissionList = result
    })
    /**
     * 设置设置权限。
     * ownerNameJson 格式。
     * [{type:"everyone",title:"所有人"},{type:"user",title:"用户",id:"1,2",name:"ray,tom"}]
     */
    const setAuth = function() {
      var conf = {
        right: ownerNameJson,
        permissionList: defaultPermissionList
      }
      //授权选择器
      vnode.child.AuthSettingShow(conf)
    }
    var ownerNameJson = []
    var initData = bindings.value
    if (initData) {
      ownerNameJson = JSON.parse(initData)
      // showLable(ownerNameJson);
    }
    //对话框初始化监听
    el.childNodes[2].onclick = function() {
      setAuth()
    }
  }
})

Vue.directive('parseTemplete', {
  bind: function(el, binding, vnode) {
    var s = JSON.stringify
    el.innerHTML =
      'name: ' +
      s(binding.name) +
      '<br>' +
      'value: ' +
      s(binding.value) +
      '<br>' +
      'expression: ' +
      s(binding.expression) +
      '<br>' +
      'argument: ' +
      s(binding.arg) +
      '<br>' +
      'modifiers: ' +
      s(binding.modifiers) +
      '<br>' +
      'vnode keys: ' +
      Object.keys(vnode).join(', ')
  }
})

Vue.directive('alsCharts', {
  inserted(el, binding, vnode) {
    const inst = binding.context
    function init(data) {
      if (
        !(
          data.value &&
          data.value !== true &&
          data.value.constructor == Array &&
          data.value[0].legend
        )
      ) {
        return
      }
      var options = data.value[0]
      var height = getDivHeight(el) - 35
      var wrap = $('<div></div>').css({
        width: '100%',
        height: height
      })
      $(el).css({
        display: 'block',
        width: '100%',
        height: height
      })
      const echarts = require('echarts')
      var myChart = echarts.init(el)
      inst.$root.$on('resize', () => {
        myChart.resize() //监测图表自适应
      })
      var option = {
        title: {
          text: options.name,
          subtext: options.subtext,
          top: 12
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        calculable: true,
        legend: {
          x: 'right',
          data: options.legend
        },
        toolbox: {
          show: true,
          orient: 'vertical',
          y: 'center',
          right: 20,
          itemGap: 13,
          feature: {
            mark: {show: true},
            dataView: {show: true, readOnly: false},
            magicType: {show: true, type: ['line', 'bar', 'stack', 'tiled']},
            restore: {show: true},
            saveAsImage: {show: true},
            dataZoom: {
              yAxisIndex: 'none'
            },
            dataView: {
              show: true,
              readOnly: true,
              optionToContent: function(opt) {
                //console.info(opt);
                var axisData = opt.xAxis[0].data
                var series = opt.series
                var tdHeaders = '<th></th>' //表头
                series.forEach(function(item) {
                  tdHeaders +=
                    '<th style="padding: 8px 10px;background-color:#F5F5F5;">' +
                    item.name +
                    '</th>' //组装表头
                })
                var table =
                  '<div><table cellspacing="20" cellspacing="0"  style="text-align:center;border:1px solid black;border-collapse:collapse;" rules="all"><tbody><tr>' +
                  tdHeaders +
                  '</tr>'
                var tdBodys = '' //数据
                var colors = ['#FFFFFF', '#F5F5F5']
                for (let i = 0, l = axisData.length; i < l; i++) {
                  for (let j = 0; j < series.length; j++) {
                    tdBodys += '<td>' + series[j].data[i] + '</td>' //组装表数据
                  }
                  var curColor = colors[i % 2]
                  table +=
                    '<tr style="background-color:' +
                    curColor +
                    '"><td style="padding: 8px 10px;">' +
                    axisData[i] +
                    '</td>' +
                    tdBodys +
                    '</tr>'
                  tdBodys = ''
                }
                table += '</tbody></table></div>'
                return table
              }
            }
          }
        },
        calculable: true,
        grid: {
          y: 80,
          y2: 40,
          x2: 40
        },
        xAxis: [
          {
            type: 'category',
            data: options.xAxis
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        //x轴数据区域缩放组件--暂时不添加
        /*dataZoom: [
                    {
                        type: 'slider',
                        show: true,
                        xAxisIndex: [0],
                        start: 1,
                        end: 35
                    },
                    {
                        type: 'inside',
                        xAxisIndex: [0],
                        start: 1,
                        end: 35
                    },
                ],*/
        series: options.series
      }
      myChart.setOption(option, true)
    }

    //获取当前栏目的高度
    function getDivHeight(el) {
      if (el) {
        var pHeight = $(el)
          .parent()
          .height()
        if (pHeight < 1) {
          return getDivHeight($(el).parent())
        }
      } else {
        return 340
      }
      return pHeight
    }

    init(binding)
  }
})

Vue.directive('opinion', {
  bind: function(el, binding, vnode) {
    if (binding.value) {
      while (binding.value.indexOf('\n') != -1) {
        binding.value = binding.value.replace('\n', '<br>')
      }
      el.innerHTML = binding.value
    }
  }
})

Vue.directive('iframetrigger', {
  bind: function(el, binding, vnode) {
    el.onload = function() {
      $('body').trigger('formLoaded')
    }

    $('body').bind('formLoaded', function(e) {
      var frm = $('#frmFrame')[0]
      window.addEventListener('message', function(e) {
        if (e.data && e.data.constructor == Object && e.data.type == 'height') {
          frm.style.visibility = 'hidden'
          // 提前还原高度
          frm.setAttribute('height', 'auto')
          setTimeout(function() {
            frm.setAttribute('height', e.data.height)
            frm.style.visibility = 'visible'
            $(frm).trigger('mouseover')
          }, 0)
        }
      })
    })
  }
})

Vue.directive('methodauth', {
  bind: function(el, binding, vnode) {
    let allMethod = window.sessionStorage.allMethod
    let methodAuth = window.sessionStorage.methodAuth
    let elAuth = binding.expression
    let allMethodArray = allMethod.split(',')
    let methodAuthArray = methodAuth.split(',')
    // 无权限则隐藏按钮
    if (
      $.inArray(elAuth, methodAuthArray) == -1 &&
      $.inArray(elAuth, allMethodArray)
    ) {
      $(el).css('display', 'none')
    }
  }
})

// 注册全局公式计算组件
Vue.directive('formula', {
  bind(el, binding, vnode) {
    let propsData = vnode.context.$options.propsData
    //初始化的时候，如果没有值，则用公式的计算结果来赋值给当前字段
    let oldVal = utils.getValueByPath(propsData, binding.value.bindPath)
    if (propsData && !oldVal) {
      utils.setValueByPath(
        propsData,
        binding.value.bindPath,
        binding.value.value
      )
      vnode.context.$forceUpdate()
    }
  },
  update(el, binding, vnode, oldVnode) {
    if (binding.oldValue.value instanceof Date) {
      if (binding.oldValue.value.getTime() !== binding.value.value.getTime()) {
        utils.setValueByPath(
          vnode.context.$options.propsData,
          binding.value.bindPath,
          binding.value.value
        )
        vnode.context.$forceUpdate()
      }
    } else {
      if (binding.oldValue.value != binding.value.value) {
        utils.setValueByPath(
          vnode.context.$options.propsData,
          binding.value.bindPath,
          binding.value.value
        )
        vnode.context.$forceUpdate()
      }
    }
  }
})

Vue.directive('mapping', {
  update(el, binding, vnode, oldVnode) {
    if (binding.oldValue !== binding.value) {
      Vue.set(el.__vue__, 'inputVal', binding.value)
    }
  }
})

Vue.directive('dynamic-options', {
  bind(el, binding, vnode) {
    let exp = null
    if (binding.expression) {
      exp = utils.parseToJson(binding.expression)
    }
    const inst = vnode.context
    if (inst) {
      // 上一次动态选项查询条件
      inst.preDynamicLoadParams = null
      inst.$on('dynamic-options:load', (alias, params) => {
        // if(alias === 'xdfxz'){
          // debugger
        // }
        params = params || {}
        const paramsTmp =cloneDeep(params);
        // 是否执行查询
        let doLoad = true
        if (exp && exp.cache) {
          // 相比上一次，查询参数是否有变化
          const changed = !utils.objectEquals(inst.preDynamicLoadParams, params)
          if (changed) {
            doLoad = true
            inst.preDynamicLoadParams = params
          } else {
            doLoad = false
          }
        }
        doLoad &&
          CustomQuery.load(alias, params).then(data => {
            inst.$emit('dynamic-options:update', alias, data)
          })
      })
    }
  }
})
//用于上级值变化后，下级内容需要清空
Vue.directive('watch-parent', {
  update(el, binding, vnode) {
    if (binding.value && binding.value.pid) {
      for (var key in binding.value.pid) {
        const inst = vnode.context
        const instParent = utils.getOnlineFormInstance(inst)
        instParent.$watch(
          () => {
            return utils.getValueByPath(
              instParent,
              binding.value.pid[key],
              binding.value.index
            )
          },
          function(newVal, oldVal, farewell) {
            if (newVal !== oldVal) {
              inst.inputVal = ''
            }
          }
        )
      }
    }
  }
})
Vue.directive('related-query', {
  bind(el, binding, vnode) {
    const inst = vnode.context
    let exp = null
    if (binding.expression) {
      exp = utils.parseToJson(binding.expression)
    }
    if (inst) {
      // 上一次关联查询条件（一个组件可以绑定多个关联查询，）
      inst.preRelatedQueryParams = {}
      inst.$on('related-query:load', (alias, params, resultBind) => {
        params = params || {}
        // 是否执行查询
        let doLoad = true
        if (exp && exp.cache) {
          // 相比上一次，查询参数是否有变化
          const changed = !utils.objectEquals(
            inst.preRelatedQueryParams[alias],
            params
          )
          if (changed) {
            doLoad = true
            inst.preRelatedQueryParams[alias] = params
          } else {
            doLoad = false
          }
        }
        doLoad &&
          CustomQuery.load(alias, params).then(data => {
            if (
              data &&
              data.constructor == Array &&
              data.length > 0 &&
              resultBind &&
              resultBind.constructor == Object
            ) {
              // 获取当前控件是否在子表和孙表某行中(子表和孙表的下标)
              let {index: subIndex} = utils.getSubScopeElAndIndex(el)
              let {index: sunIndex} = utils.getSunScopeElAndIndex(el)
              const pInst = utils.getOnlineFormInstance(inst)
              // 关联查询值回绑时，默认获取返回的第一条记录
              let singleData = data[0]
              if (!$.isEmptyObject(params)) {
                const list = data.filter(item => {
                  let flag = true
                  Object.keys(params).forEach(key => {
                    if (item[key] !== params[key]) {
                      flag = false
                    }
                  })
                  return flag
                })
                if (list.length) {
                  singleData = list[0]
                }
              }
              Object.keys(resultBind).forEach(k => {
                const path = resultBind[k]
                // 主表
                if (subIndex == null) {
                  utils.setValueByPath(pInst, path, singleData[k])
                }
                // 子表
                else if (sunIndex == null) {
                  utils.setValueByPath(pInst, path, singleData[k], subIndex)
                }
                // 孙表
                else {
                  let realPath = path.split('.')
                  if (realPath.length > 3) {
                    realPath[2] = `${realPath[2]}[${subIndex}]`
                  }
                  realPath = realPath.join('.')
                  utils.setValueByPath(pInst, realPath, singleData[k], sunIndex)
                }
              })
            }
          })
      })
    }
  },
  update(el, binging, vnode) {}
})
//表格横向拖拽
Vue.directive('tableDrag', {
  inserted: function(el) {
    const currentElement =
      el.getElementsByClassName('el-table__body-wrapper')[0] || el
    const tagNames = ['span', 'input', 'textarea', 'aside']
    if (currentElement) {
      currentElement.onmousedown = function(event) {
        const currentTagNames = event.target.tagName.toLowerCase()
        if (tagNames.includes(currentTagNames)) return
        currentElement.style.cursor = 'grab'
        let gapX = event.clientX
        let startX = el.scrollLeft
        document.onmousemove = function(e) {
          let x = e.clientX - gapX
          currentElement.scrollLeft = startX - x
          return false
        }
        document.onmouseup = function(e) {
          document.onmousemove = null
          document.onmouseup = null
        }
      }
    }
  }
})

//用于控制子表或孙表单行permission
Vue.directive('permission-line', {
  bind(el, binding, vnode) {
    if (binding.value) {
      const inst = vnode.context
      let idxObj = utils.getSubScopeElAndIndex(el)
      let paths = binding.value.split('_')
      let boType = paths[0]
      let idStr = binding.value + '_' + idxObj.index
      //孙表时，获取孙表所属子表序号
      if (boType == 'sun' && idxObj.subScopeEl) {
        const subIdxObj = utils.getSunScopeElAndIndex(
          idxObj.subScopeEl.parentElement
        )
        idStr = binding.value + '_' + subIdxObj.index + '_' + idxObj.index
      }
      if (
        inst.permission &&
        inst.permission['subFields'] &&
        inst.permission['subFields'][idStr]
      ) {
        setTimeout(function() {
          if (el.__vue__) {
            el.__vue__.permission_sub = inst.permission['subFields'][idStr]
            el.__vue__.sub_work = true
          }
        }, 0)
      }
    }
  },
  inserted(el, binding, vnode) {
    if (binding.value) {
      const inst = vnode.context
      let idxObj = utils.getSubScopeElAndIndex(el)
      let paths = binding.value.split('_')
      let boType = paths[0]
      let idStr = binding.value + '_' + idxObj.index
      //孙表时，获取孙表所属子表序号
      if (boType == 'sun' && idxObj.subScopeEl) {
        const subIdxObj = utils.getSunScopeElAndIndex(
          idxObj.subScopeEl.parentElement
        )
        idStr = binding.value + '_' + subIdxObj.index + '_' + idxObj.index
      }
      if (
        inst.permission &&
        inst.permission['subFields'] &&
        inst.permission['subFields'][idStr]
      ) {
        setTimeout(function() {
          if (el.__vue__) {
            el.__vue__.permission_sub = inst.permission['subFields'][idStr]
            el.__vue__.sub_work = true
          }
        }, 0)
      }
    }
  },
  update(el, binding, vnode) {
    if (binding.value) {
      const inst = vnode.context
      let idxObj = utils.getSubScopeElAndIndex(el)
      let paths = binding.value.split('_')
      let boType = paths[0]
      let idStr = binding.value + '_' + idxObj.index
      //孙表时，获取孙表所属子表序号
      if (boType == 'sun' && idxObj.subScopeEl) {
        const subIdxObj = utils.getSunScopeElAndIndex(
          idxObj.subScopeEl.parentElement
        )
        idStr = binding.value + '_' + subIdxObj.index + '_' + idxObj.index
      }
      if (
        inst.permission &&
        inst.permission['subFields'] &&
        inst.permission['subFields'][idStr]
      ) {
        setTimeout(function() {
          if (el.__vue__) {
            el.__vue__.permission_sub = inst.permission['subFields'][idStr]
          }
        }, 0)
      }
    }
  }
})
//用于控制子表或孙表单行permission lable标签
Vue.directive('permission-line-lable', {
  bind(el, binding, vnode) {
    if (binding.value) {
      const inst = vnode.context
      let idxObj = utils.getSubScopeElAndIndex(el)
      let paths = binding.value.split('_')
      let boType = paths[0]
      let idStr = binding.value + '_' + idxObj.index
      //孙表时，获取孙表所属子表序号
      if (boType == 'sun' && idxObj.subScopeEl) {
        const subIdxObj = utils.getSunScopeElAndIndex(
          idxObj.subScopeEl.parentElement
        )
        idStr = binding.value + '_' + subIdxObj.index + '_' + idxObj.index
      }
      if (
        inst.permission &&
        inst.permission['subFields'] &&
        inst.permission['subFields'][idStr]
      ) {
        setTimeout(function() {
          // el.parentElement.hidden =
          //   inst.permission['subFields'][idStr] == 'n' ? true : false
          let $el = $(el.parentElement)
          //栅格布局时
          if (
            $el
              .parent()
              .parent()
              .hasClass('el-col')
          ) {
            $el = $el.parent().parent()
          }
          if (inst.permission['subFields'][idStr] == 'n') {
            $el.hide()
          } else {
            $el.show()
          }
        }, 0)
      }
    }
  },
  inserted(el, binding, vnode) {
    if (binding.value) {
      const inst = vnode.context
      let idxObj = utils.getSubScopeElAndIndex(el)
      let paths = binding.value.split('_')
      let boType = paths[0]
      let idStr = binding.value + '_' + idxObj.index
      //孙表时，获取孙表所属子表序号
      if (boType == 'sun' && idxObj.subScopeEl) {
        const subIdxObj = utils.getSunScopeElAndIndex(
          idxObj.subScopeEl.parentElement
        )
        idStr = binding.value + '_' + subIdxObj.index + '_' + idxObj.index
      }
      const interVal = setInterval(() => {
        if (
          inst.permission &&
          inst.permission['subFields'] &&
          inst.permission['subFields'][idStr]
        ) {
          setTimeout(function() {
            // el.parentElement.hidden =
            //   inst.permission['subFields'][idStr] == 'n' ? true : false
            let $el = $(el.parentElement)
            //栅格布局时
            if (
              $el
                .parent()
                .parent()
                .hasClass('el-col')
            ) {
              $el = $el.parent().parent()
            }
            if (inst.permission['subFields'][idStr] == 'n') {
              $el.hide()
            } else {
              $el.show()
            }
            clearInterval(interVal)
          }, 0)
        }
      }, 20)
    }
  },
  update(el, binding, vnode) {
    if (binding.value) {
      const inst = vnode.context
      let idxObj = utils.getSubScopeElAndIndex(el)
      let paths = binding.value.split('_')
      let boType = paths[0]
      let idStr = binding.value + '_' + idxObj.index
      //孙表时，获取孙表所属子表序号
      if (boType == 'sun' && idxObj.subScopeEl) {
        const subIdxObj = utils.getSunScopeElAndIndex(
          idxObj.subScopeEl.parentElement
        )
        idStr = binding.value + '_' + subIdxObj.index + '_' + idxObj.index
      }
      if (
        inst.permission &&
        inst.permission['subFields'] &&
        inst.permission['subFields'][idStr]
      ) {
        setTimeout(function() {
          // el.parentElement.hidden =
          //   inst.permission['subFields'][idStr] == 'n' ? true : false
          let $el = $(el.parentElement)
          if (
            $el
              .parent()
              .parent()
              .hasClass('el-col')
          ) {
            $el = $el.parent().parent()
          }
          if (inst.permission['subFields'][idStr] == 'n') {
            $el.hide()
          } else {
            $el.show()
          }
        }, 0)
      }
    }
  }
})
//ccwgq 2022-10-09 自适应的tooltip
Vue.directive('auto-tooltip', {
  inserted: function(el, binding, vNode) {
    //get value from binding.value;
    // console.log(el.childNodes.length);
    //tooltip的placement属性, 阈值宽度和主题均可以通过绑定得到，防止为undefined,
    //预设初始值
    var placement = binding?.value?.placement ?? 'bottom'
    var width = binding?.value?.width ?? 700
    var effect = binding?.value?.effect ?? 'dark'
    //ellipsis省略样式
    setStyle(el, 'max-width', width + 'px')
    setStyle(el, 'text-overflow', 'ellipsis')
    setStyle(el, 'overflow', 'hidden')
    setStyle(el, 'display', 'block')
    setStyle(el, 'white-space', 'nowrap')
    //mouseenter事件
    el.addEventListener('mouseenter', function() {
      //没有ellipsis时的真实宽度
      const range = document.createRange()
      range.setStart(el, 0)
      range.setEnd(el, el.childNodes.length)
      const rangeWidth = Math.round(range.getBoundingClientRect().width)
      //与阈值宽度做比较
      if (rangeWidth > width) {
        createTooltip()
      }
    })
    //鼠标离开的mouseleave事件中移除所有的tooltip dom
    el.addEventListener('mouseleave', function(e) {
      const divs = document.querySelectorAll('.auto-tooltip')
      divs.forEach(function(div) {
        div.remove()
      })
    })
    //创建tooltip的逻辑单独封装
    function createTooltip() {
      var content = el.innerText //设置内容
      var div = document.createElement('div')
      div.textContent = content
      //样式设定
      addClass(div, 'auto-tooltip')
      div.setAttribute('id', 'tooltip')
      div.setAttribute('role', 'tooltip')
      setStyle(div, 'position', 'absolute')
      setStyle(div, 'border-radius', '4px')
      setStyle(div, 'padding', '10px')
      setStyle(div, 'z-index', '2000')
      setStyle(div, 'font-size', '14px')
      setStyle(div, 'line-height', 1.2)
      setStyle(div, 'min-width', '12px')
      setStyle(div, 'word-wrap', 'break-word')
      setStyle(div, 'background', effect == 'dark' ? '#303133' : '#FFF')
      if (effect == 'dark') {
        setStyle(div, 'color', '#303133')
        setStyle(div, 'border', 'solid 1px #303133')
      }
      setStyle(div, 'color', '#FFF')
      const body = document.querySelector('body')
      body.appendChild(div)
      //使用popperjs创建
      createPopper(el, div, {
        placement: placement
      })
    }
    // el.addEventListener('mouseenter',addToolTip);
  }
})
//ccwgq 2022-10-11  字段可读时引入复制按钮
Vue.directive('read-copy', {
  inserted: function(el, binding, vnode) {
    const inst = vnode.componentInstance
    if (inst.permission === 'r') {
      //仅仅可读时
      const $el = $(inst.$el)
      const childEl = $el.find("div[class='field-tail']")
      const $textEl = $(childEl).find('span')
      //find tail element
      if (childEl.length === 1 && $textEl.length == 1) {
        //get text
        const text = $textEl.prop('innerText')
        if (!text) return
        //add icon dom
        const iconEl = document.createElement('span')
        const iEl = document.createElement('i')
        $(iEl).addClass('el-icon-document-copy')
        $(iconEl).append(iEl)
        $(iconEl).css({marginLeft: '7px', cursor: 'pointer', color: 'inherit'})
        $(childEl).append(iconEl)
        const fn = function(color) {
          return function() {
            $(iconEl).css({color: color})
          }
        }
        $(iconEl)
          .off('mouseover')
          .on('mouseover', fn('#409EFF'))
        $(iconEl)
          .off('mouseleave')
          .on('mouseleave', fn('inherit'))
        //copy text
        $(iconEl)
          .off('click')
          .on('click', function() {
            //set button dom
            const btn = document.createElement('button')
            $(btn).attr('data-clipboard-text', text)
            $(btn).attr('id', inst._uid || inst.inputName)
            document.body.appendChild(btn)
            const copyBtn = new Clipboard(btn)
            //copy callback
            copyBtn.on('success', function() {
              inst.$message.success('复制成功')
              copyBtn.destroy()
              document.body.removeChild(btn)
            })
            $(btn).trigger('click')
          })
      }
    }
  }
})
var directive = {}

export default directive
