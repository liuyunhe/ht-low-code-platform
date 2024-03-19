<template>
  <div
    name="online-form"
    style="padding: 5px;"
    v-form
    class="onlin-form-components"
  >
    <ht-runtime-template
      v-if="!loadedFail"
      ref="onlineForm"
      :data="data"
      :permission="permission"
      :isView="isView"
      class="online-form-wrap"
    />
    <div class="loaded-fail__div" v-if="loadedFail">
      表单加载失败,可能是表单配置发生了变化,请联系管理员...
    </div>
  </div>
</template>
<script>
import EipInput from '@/components/eipControl/EipInput.vue'
import EipTextarea from '@/components/eipControl/EipTextarea.vue'
import EipRadio from '@/components/eipControl/EipRadio.vue'
import EipCheckbox from '@/components/eipControl/EipCheckbox.vue'
import EipAttachment from '@/components/eipControl/EipAttachment.vue'
import EipSelect from '@/components/eipControl/EipSelect.vue'
import EipTreeselect from '@/components/eipControl/EipTreeselect.vue'
import EipSwitch from '@/components/eipControl/EipSwitch.vue'
import EipDic from '@/components/eipControl/EipDic.vue'
const EipMap = () => import('@/components/eipControl/EipMap.vue')
const EipFontUeditor = () =>
  import('@/components/eipControl/EipFontUeditor.vue')
import EipTabs from '@/components/eipControl/EipTabs.vue'
import EipCollapse from '@/components/eipControl/EipCollapse.vue'
import EipPagination from '@/components/eipControl/EipPagination.vue'
import EipPaginationLayout from '@/components/eipControl/EipPaginationLayout.vue'
import EipPaginationSteps from '@/components/eipControl/EipPaginationSteps.vue'
import EipRealtimeInput from '@/components/eipControl/EipRealtimeInput.vue'
import EipRealtimeTextarea from '@/components/eipControl/EipRealtimeTextarea.vue'
import EipStep from '@/components/eipControl/EipStep.vue'
import EipAutocomplete from '@/components/eipControl/EipAutocomplete.vue'
import EipFont from '@/components/eipControl/EipFont.vue'
import EipImg from '@/components/eipControl/EipImg.vue'
import EipViewer from '@/components/eipControl/EipViewer.vue'
import EipDate from '@/components/eipControl/EipDate.vue'
import EipRelFlow from '@/components/eipControl/EipRelFlow.vue'
import EipUserSelector from '@/components/eipControl/selector/EipUserSelector.vue'
import EipSubPagination from '@/components/eipControl/EipSubPagination.vue'
import SubPagination from '@/components/eipControl/bus/SubPagination.js'
import EipDemensionSelector from '@/components/eipControl/selector/EipDemensionSelector.vue'
import EipJobSelector from '@/components/eipControl/selector/EipJobSelector.vue'
import EipOrgSelector from '@/components/eipControl/selector/EipOrgSelector.vue'
import EipPostSelector from '@/components/eipControl/selector/EipPostSelector.vue'
import EipRoleSelector from '@/components/eipControl/selector/EipRoleSelector.vue'
import EipButton from '@/components/eipControl/EipButton.vue'
import EipCascader from '@/components/eipControl/EipCascader.vue'
import EipDialog from '@/components/eipControl/EipDialog.vue'
import EipSunDialog from '@/components/eipControl/EipSunDialog.vue'
import EipSubDialog from '@/components/eipControl/EipSubDialog.vue'
import EipDataView from '@/components/eipControl/EipDataView.vue'
import EipTag from '@/components/eipControl/EipTag.vue'
import ContractPreview from '@/components/eipControl/ContractPreview.vue'
import EipSignature from '@/components/eipControl/EipSignature.vue'
import EipDivider from '@/components/eipControl/EipDivider.vue'
//ccwgq 引入自定义的组件
import OuAttachment from '../eipControl/ou/OuAttachment.vue'
import {Notify} from 'vant'
import VRuntimeTemplate from 'v-runtime-template'
import Vue from 'vue'
export default {
  name: 'online-form',
  props: ['html', 'data', 'permission', 'isView'],
  data() {
    return {
      loadedFail: false //表单加载html是否失败
    }
  },
  created() {
    this.init()
    //todo: 检测html的内容
    // console.log(this.html)
  },
  watch: {
    data: {
      handler: function(newVal, oldValue) {
        this.$root.$emit('updateData', newVal)
      },
      deep: true,
      immediate: true
    },
    html: function(newVal) {
      if (newVal) {
        this.init()
      }
    }
  },

  //改v-runtime-template.es.js的源码，或者改v-runtime-template的版本改成1.5.2
  methods: {
    init() {
      Vue.component('ht-runtime-template', {
        props: ['html', 'data', 'permission', 'isView'],
        template: this.html,
        data() {
          return {
            transitionIndex: -1,
            left_image: `background-image: url(${require('@/assets/img/xh_hd.png')})`,
            right_image: `background-image: url(${require('@/assets/img/xh_hd.png')})`,
            curTabIndex: 'tabe_check_0',
            //ccwgq,修复table边框过粗的问题
            observerList: [],
            subBtnWatcher: null
          }
        },
        computed: {
          isMobile() {
            return navigator.userAgent.match(
              /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
            )
          }
        },
        mounted() {
          let that = this
          // 如果当前表单的element为Comment说明表单加载失败了。
          if (this.$el && this.$el.constructor == Comment) {
            this.$parent.loadedFail = true
          }
          //todo:根组件的验证器
          this.$validator = this.$root.$validator
          //todo:添加子表
          if (this.permission.table) {
            for (let subTableName in this.permission.table) {
              if (this.permission.table[subTableName].required) {
                this.addSubTableByName(subTableName)
              }
            }
          }
          //ccwgq  2022-03-11修复table布局中由于隐藏字段造成的边框叠加看起来过粗的问题
          //如果table中某一行的所有单元格都没有子节点，说明其字段已经全部隐藏,
          //采用MutationObserver实现
          const ele = this.$el
          const config = {childList: true, subtree: true}
          const callback = mutationsList => {
            for (let mutation of mutationsList) {
              if (
                mutation.type == 'childList' &&
                mutation.target.nodeName == 'TR'
              ) {
                const tr = mutation.target
                const $tr = $(tr)
                if (tr.childNodes && tr.childNodes.length === 0) {
                  $tr.hide()
                  return
                }
                let hide = true
                $tr.find('td').each(function(index) {
                  if (this.children && this.children.length > 0) {
                    hide = false
                  }
                })
                hide ? $tr.hide() : $tr.show()
              }
            }
          }
          if (ele && $(ele).find("table[class='main-table']").length > 0) {
            $(ele)
              .find("table[class='main-table']")
              .each(function() {
                $(this)
                  .find('tr')
                  .each(function() {
                    //某一行
                    //先检查其有无子节点
                    if (this.childNodes && this.childNodes.length === 0) {
                      $(this).css('display', 'none')
                      return
                    }
                    let hide = true
                    $(this)
                      .find('td')
                      .each(function(index) {
                        if (this.children && this.children.length > 0) {
                          hide = false
                        }
                      })
                    if (hide) {
                      $(this).css('display', 'none')
                    }
                  })
                //这是变化后的，初始化也得执行一次;
                const ob = new MutationObserver(callback)
                ob.observe(this, config)
                that.observerList.push(ob)
              })
          }
          this.$nextTick(()=>{
            //按钮默认收起
          //子表的
          const $subBtns = $($.find('.collapse-button__sub'))
          $subBtns.each(function() {
            $(this).text()=='收起'&& $(this).trigger('click')
          })
          const $sunBtns = $($.find('.collapse-button__sun'));
          $sunBtns.each(function(){
            $(this).text()=='收起' && $(this).trigger('click')
          })
          })
        },
        methods: {
          async leaveTabVerify(activeName, oldActiveName) {
            let erritems = []
            let formElementAry = document.getElementsByName('online-form')
            let frmInst = formElementAry[0].__vue__
            let childrens = frmInst.$refs.onlineForm.$children[0].$refs
            let result = await frmInst.$root.$validator.validateAll(
              'custom-form'
            )
            if (!result) {
              let curEl = childrens[oldActiveName].$el
              this.$validator.errors.items.forEach(item => {
                if (curEl.contains(document.getElementsByName(item.field)[0])) {
                  erritems.push(item)
                }
              })
            }
            //拼接提示消息
            let msg = ''
            for (let item of erritems) {
              let fieldLabel = ''
              if (item.field) {
                fieldLabel = item.field
              }
              if (item.field && item.field.indexOf('-') != -1) {
                fieldLabel = item.field.substr(item.field.indexOf('-') + 1)
              }
              msg += fieldLabel + ' ' + item.msg + '<br/>'
            }
            if (msg) {
              this.$notify.error({
                title: this.$t('common.errTip'),
                dangerouslyUseHTMLString: true,
                message: msg
              })
              reject()
            }
          },
          //子表上移
          up(index, data) {
            if (index === 0) {
              this.$message({
                message: '已经是列表中第一位',
                type: 'warning'
              })
            } else {
              let temp = data[index - 1]
              Vue.set(data, index - 1, data[index])
              Vue.set(data, index, temp)
            }
          },
          //子表默认值回填
          addSubTab(subTabPath) {
            let pathArr = subTabPath.split('.')
            if (pathArr.length < 3) {
              this.$message({
                message: '子表路径有误',
                type: 'warning'
              })
            } else {
              let subTabName = pathArr[2].replace('sub_', '')
              let subInitData = this.data[pathArr[1]].initData[subTabName] || {}
              //判断当前子表是否存有回显值
              if (
                this.$parent.subBackfill &&
                this.$parent.subBackfill.has(subTabPath)
              ) {
                //this.data[pathArr[1]][pathArr[2]].push(this.$parent.subBackfill.get(subTabPath));
                subInitData = this.$parent.subBackfill.get(subTabPath)
              }
              //把数组里面的值为 null 转换为空字符串
              let str = JSON.stringify(subInitData).replace(/null/g, '""')
              let subData = JSON.parse(str)
              for (var key in subData) {
                //点添加时判断要新增子表记录中的孙表是否有值
                if (key.indexOf('sub_') == 0 && subData[key].length > 0) {
                  subData[key] = [] //有则清空
                }
                //点添加时判断要新增子表记录中的字段是否有值
                //if(subData[key]){
                //    subData[key] = "";//有则清空
                //}
              }
              this.data[pathArr[1]][pathArr[2]].push(subData)
              // this.permission.table[subTabName].required = "false";
            }
          },
          //孙表默认值回填
          addSunTab(subTabPath, subIndex) {
            let pathArr = subTabPath.split('.')
            if (pathArr.length < 4) {
              this.$message({
                message: '孙表路径有误',
                type: 'warning'
              })
            } else {
              let subTabName = pathArr[2].replace('sub_', '')
              let sunTabName = pathArr[3].replace('sub_', '')
              let subInitData =
                this.data[pathArr[1]].initData[subTabName].initData[
                  sunTabName
                ] || {}
              //判断当前孙表是否存有回显值
              if (
                this.$parent.subBackfill &&
                this.$parent.subBackfill.has(subTabPath)
              ) {
                //this.data[pathArr[1]][pathArr[2]].push(this.$parent.subBackfill.get(subTabPath));
                subInitData = this.$parent.subBackfill.get(subTabPath)
              }
              //把数组里面的值为 null 转换为空字符串
              let str = JSON.stringify(subInitData).replace(/null/g, '""')
              if (!this.data[pathArr[1]][pathArr[2]][subIndex][pathArr[3]]) {
                let key = [pathArr[3]]
                let value = new Array()
                this.data[pathArr[1]][pathArr[2]][subIndex][key] = value
              }
              this.data[pathArr[1]][pathArr[2]][subIndex][pathArr[3]].push(
                JSON.parse(str)
              )
              this.$forceUpdate() //迫使 Vue 实例重新渲染

              // this.permission.table[sunTabName].required = "false";
            }
          },
          addSubTableByName(subTableName) {
            for (let boAlias in this.data) {
              let subInitData = this.data[boAlias].initData[subTableName] || {}
              if (
                this.data[boAlias]['sub_' + subTableName] &&
                this.data[boAlias]['sub_' + subTableName].length < 1
              ) {
                this.data[boAlias]['sub_' + subTableName].push(
                  JSON.parse(JSON.stringify(subInitData))
                )
                // 孙表必填 默认添加一条
                if (this.permission.table) {
                  for (let tableName in this.permission.table) {
                    if (this.permission.table[tableName].required) {
                      if (
                        this.data[boAlias][
                          'sub_' + subTableName
                        ][0].hasOwnProperty('sub_' + tableName) &&
                        this.data[boAlias]['sub_' + subTableName][0][
                          'sub_' + tableName
                        ] &&
                        this.data[boAlias]['sub_' + subTableName][0][
                          'sub_' + tableName
                        ].length < 1
                      ) {
                        this.data[boAlias]['sub_' + subTableName][0][
                          'sub_' + tableName
                        ].push(
                          JSON.parse(
                            JSON.stringify(subInitData.initData[tableName])
                          )
                        )
                      } else if (
                        this.data[boAlias][
                          'sub_' + subTableName
                        ][0].hasOwnProperty('sub_' + tableName) &&
                        !this.data[boAlias]['sub_' + subTableName][0][
                          'sub_' + tableName
                        ]
                      ) {
                        this.data[boAlias]['sub_' + subTableName][0][
                          'sub_' + tableName
                        ] = []
                        this.data[boAlias]['sub_' + subTableName][0][
                          'sub_' + tableName
                        ].push(
                          Object.assign({}, subInitData.initData[tableName])
                        )
                      }
                    }
                  }
                }
              }
            }
          },
          deleteRow(subTablePath, item) {
            let pathArr = subTablePath.split('.')
            if (pathArr.length < 2) {
              this.$message({
                message: '子表路径有误',
                type: 'warning'
              })
            } else {
              let subTabName = pathArr[1].replace('sub_', '')
              if (
                this.data[pathArr[0]][pathArr[1]].length == 1 &&
                (this.permission.table[subTabName].required == true ||
                  this.permission.table[subTabName].required == 'true')
              ) {
                this.$message({
                  message: '子表必填一条记录',
                  type: 'warning'
                })
                return
              }
              this.data[pathArr[0]][pathArr[1]].remove(item)
            }
          },
          deleteSunRow(subTablePath, item, subIndex) {
            let pathArr = subTablePath.split('.')
            if (pathArr.length < 3) {
              this.$message({
                message: '孙表路径有误',
                type: 'warning'
              })
            } else {
              let subTabName = pathArr[1].replace('sub_', '')
              let sunTabName = pathArr[2].replace('sub_', '')
              if (
                this.data[pathArr[0]][pathArr[1]][subIndex][pathArr[2]]
                  .length == 1 &&
                (this.permission.table[sunTabName].required == true ||
                  this.permission.table[subTabName].required == 'true')
              ) {
                this.$message({
                  message: '孙表必填一条记录',
                  type: 'warning'
                })
                return
              }
              this.data[pathArr[0]][pathArr[1]][subIndex][pathArr[2]].remove(
                item
              )
            }
          },
          clearAll(subTablePath, isHot, index) {
            let pathArr = subTablePath.split('.')
            if (pathArr.length < 2) {
              this.$message({
                message: '子表路径有误',
                type: 'warning'
              })
              //孙表
            } else if ((index || index === 0) && pathArr.length == 3) {
              let subTabName = pathArr[1].replace('sub_', '')
              //ccwgq 2021-12-07 增加孙表判断
              const sunTabName = pathArr[2].replace('sub_', '')
              if (
                this.data[pathArr[0]][pathArr[1]][index][pathArr[2]].length ==
                  1 &&
                (this.permission.table[sunTabName].required == true ||
                  this.permission.table[sunTabName].required == 'true')
              ) {
                this.$message({
                  message: '孙表必填一条记录',
                  type: 'warning'
                })
                return
              }
              this.data[pathArr[0]][pathArr[1]][index][pathArr[2]] = []
            } else {
              let subTabName = pathArr[1].replace('sub_', '')
              if (
                this.data[pathArr[0]][pathArr[1]].length == 1 &&
                (this.permission.table[subTabName].required == true ||
                  this.permission.table[subTabName].required == 'true')
              ) {
                this.$message({
                  message: '子表必填一条记录',
                  type: 'warning'
                })
                return
              }
              this.data[pathArr[0]][pathArr[1]] = []
              if (isHot) {
                const hotTableRef = 'hottable.' + subTablePath
                this.$refs[hotTableRef].fillbackHotTableData(null)
              }
            }
          },
          //子表下移
          down(index, data) {
            if (index === data.length - 1) {
              this.$message({
                message: '已经是列表中最后一位',
                type: 'warning'
              })
            } else {
              this.isTransition = true
              let i = data[index + 1]
              Vue.set(data, index + 1, data[index])
              Vue.set(data, index, i)
            }
          },
          //子表复制数据
          copy(obj, item) {
            let newOne = JSON.parse(JSON.stringify(item))
            //把id置空以免走的修改方法
            if (newOne.id_) {
              delete newOne.id_
            }

            if (newOne.sub_row_readonly) {
              delete newOne.sub_row_readonly
            }

            obj.push(newOne)
          },
          //点击分页校验按钮触发事件
          nextStepClick(isCheck, index, way) {
            let childrens = this.$refs.onlineForm.$children[0].$refs
            let nextIndex = way == 'back' ? index - 1 : index + 1
            //进入下一个页签并且需要校验当前页签。则进行校验
            if (way == 'next' && isCheck == 'y') {
              this.$validator.validateAll('custom-form').then(result => {
                let curTabHasError = false
                if (!result) {
                  let curEl = childrens['next_step_check_' + index].$el
                  this.$validator.errors.items.forEach(item => {
                    if (
                      curEl.contains(document.getElementsByName(item.field)[0])
                    ) {
                      curTabHasError = true
                      return
                    }
                  })
                }
                if (result || !curTabHasError) {
                  childrens.el_table_check.currentName = nextIndex + ''
                  var childrensArray = Object.getOwnPropertyNames(childrens)
                  childrensArray.remove('collapse')
                  if (index == childrensArray.length - 3 && way == 'next') {
                    this.$root.$emit('startFlowBtnChange', true)
                  }
                }
              })
            } else {
              childrens.el_table_check.currentName = nextIndex + ''
              var childrensArray = Object.getOwnPropertyNames(childrens)
              childrensArray.remove('collapse')
              if (index == childrensArray.length - 3 && way == 'next') {
                this.$root.$emit('startFlowBtnChange', true)
              }
            }
          },
          //点击右滑动按钮
          xhright(subTablePath) {
            var div = document.getElementById('xh_tablegd_' + subTablePath)
            var div_left = document.getElementById('lefthk_' + subTablePath)
            var div_right = document.getElementById('righthk_' + subTablePath)
            div.scrollLeft += 150
            if (div.scrollLeft + div.offsetWidth >= div.scrollWidth) {
              div_right.hidden = true
            }
            if (div.scrollLeft > 0) {
              div_left.hidden = false
            }
          },
          //点击左滑动按钮
          xhleft(subTablePath) {
            var div = document.getElementById('xh_tablegd_' + subTablePath)
            var div_left = document.getElementById('lefthk_' + subTablePath)
            var div_right = document.getElementById('righthk_' + subTablePath)
            div.scrollLeft -= 150
            if (div.scrollLeft + div.offsetWidth <= div.scrollWidth) {
              div_right.hidden = false
            }
            if (div.scrollLeft <= 0) {
              div_left.hidden = true
            }
          },
          initFill() {},
          isShowAddButton(path, maxRow, subIndex) {
            if (maxRow === 0) return false
            let pathArr = path.split('.')
            if (subIndex >= 0) {
              if (pathArr.length < 4) {
                this.$message({
                  message: '子表路径有误',
                  type: 'warning'
                })
              } else {
                let data = this.data[pathArr[1]][pathArr[2]][subIndex][
                  pathArr[3]
                ]
                return data.length >= maxRow
              }
            } else {
              if (pathArr.length < 3) {
                this.$message({
                  message: '子表路径有误',
                  type: 'warning'
                })
              } else {
                let data = this.data[pathArr[1]][pathArr[2]]
                return data.length >= maxRow
              }
            }
            return false
          },
          //ccwgq 2022-04-07 绑定按钮回调
          collapseBtn(that, subTablePath) {
            // console.log('我被点击了===>', arguments)
            this.subBtn = that
            const $btn = $(that)
            const $bros = $($.find('.collapse-button__sub')).filter(function() {
              return $(this).data('path') == $btn.data('path') && this !== that
            })
            const $curRow = $btn.parents('.el-row')
            const $broRows = $curRow
              .siblings('.el-row')
              .filter(function(index) {
                return index != 0
              })
            if ($btn.text() == '收起') {
              //收起此处
              $broRows.each(function() {
                $(this).hide()
              })
              $btn.text('展开')
            } else if ($btn.text() == '展开') {
              //展开伙伴
              $broRows.each(function() {
                $(this).show()
              })
              $btn.text('收起')
              // $bros.each(function() {
              //   $(this).trigger('click')
              // })
            }
          },
          //ccwgq 2022-04-09  孙表添加折叠按钮
          collapseBtnSun(that,sunTablePath){
            const $btn = $(that)
            const $curRow=$btn.parent('.el-row');
            const $broRows=$curRow.siblings('.el-row').filter(function(index){
              return index!=0;
            })
            // console.log($broRows);
            //如果没有需要折叠的则不会折叠
            if($btn.text()=='收起'){
              $broRows.each(function(){
                $(this).hide()
              })
              $btn.text('展开')
            }
            else if($btn.text()=='展开'){
               $broRows.each(function(){
                $(this).show()
              })
              $btn.text('收起')
            }

          }
        },
        components: {
          EipInput,
          EipTextarea,
          EipRadio,
          EipCheckbox,
          EipAttachment,
          EipSelect,
          EipTreeselect,
          EipSwitch,
          EipDic,
          EipCollapse,
          EipPagination,
          EipPaginationLayout,
          EipPaginationSteps,
          EipRealtimeInput,
          EipRealtimeTextarea,
          EipStep,
          EipAutocomplete,
          EipFont,
          EipImg,
          EipViewer,
          EipDate,
          EipRelFlow,
          EipUserSelector,
          EipDemensionSelector,
          EipJobSelector,
          EipOrgSelector,
          EipPostSelector,
          EipRoleSelector,
          EipButton,
          EipCascader,
          EipDialog,
          VRuntimeTemplate,
          Notify,
          EipSubDialog,
          EipMap,
          EipDataView,
          EipTag,
          ContractPreview,
          EipSignature,
          EipDivider,
          EipSunDialog,
          EipTabs,
          EipSubPagination,
          SubPagination,
          EipFontUeditor,
          //自定义的组件
          OuAttachment
        },
        beforeDestroy() {
          //组件销毁去除对这些dom的观察
          this.observerList.forEach(ob => {
            ob.disconnect && ob.disconnect()
          })
        }
      })
    }
  }
}
</script>
<style lang="scss">
.right-dialog .dialog-footer {
  position: absolute;
  bottom: 5px !important;
  left: 0;
  right: 0;
  text-align: center;
}
.el-button {
  margin:0!important;
}
.el-main {
  display: block;
  -webkit-box-flex: 1;
  -ms-flex: 1;
  flex: 1;
  -ms-flex-preferred-size: auto;
  flex-basis: auto;
  overflow: auto;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  padding: 0px !important;
}
.el-button--mini,
.el-button--mini.is-round {
  padding: 7px 10px;
}
.transition {
  outline: 1px dotted #85a5ff;
  outline-width: 2px;
  outline-offset: -1px;
}
.el-tabs--border-card {
  border: 1px solid #ebeef5;
  -webkit-box-shadow: none;
  box-shadow: none;
}

.tabcheck_btn {
  text-align: right;
  padding-top: 20px;
}
.formT_box {
  padding: 0;
  background: #fff;
  border-radius: 3px;
  box-shadow: 0 -1px 4px rgba(100, 100, 100, 0.1);
  overflow: hidden;
  position: relative;
  margin-bottom: 9px;
  line-height: 20px;
}
.formT_box::-webkit-scrollbar {
  display: none;
}
.xh_table {
  overflow-x: auto;
}
.xh_hd {
  position: absolute;
  right: 0;
  top: 0;
  width: 30px;
  height: 60px;
  max-height: 133px;
  border-radius: 5px 0 0 5px;
  background-color: rgba(227, 228, 231, 0.7);
  background-repeat: no-repeat;
  background-size: 15px 15px;
  background-position: center center;
  transform: rotate(180deg);
  /* margin-top: 25px; */
}
.xh_hdleft {
  z-index: 60;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  width: 30px;
  height: 60px;
  max-height: 133px;
  border-radius: 5px 0 0 5px;
  background-color: rgba(227, 228, 231, 0.7);
  background-repeat: no-repeat;
  background-size: 15px 15px;
  background-position: center center;
  // transform: rotate(180deg);
  /* margin-top: 25px; */
}

/**以下是手机端修改在线表单控件的样式 */
[name='online-form'] .el-form-item--mini.el-form-item,
[name='online-form'] .el-form-item--small.el-form-item {
  padding-bottom: 5px;
  margin-bottom: 10px;
  border-bottom: 1px solid #f3f2ef;
}
[name='online-form'] .el-form-item--small .el-form-item__label {
  text-align: left;
}
[name='online-form'] .el-input__inner,
.el-textarea__inner {
  border: 1px solid #fff;
}
[name='online-form'] .el-input__inner:focus,
.el-textarea__inner:focus {
  border: 1px solid #409eff;
}

[name='online-form'] .el-input-number .el-input__inner {
  border: 1px solid #dcdfe6;
}
[name='online-form'] .el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 100%;
}
.onlin-form-components {
  .el-form-item__content {
    p {
      span {
        font-size: 14px !important;
      }
    }
  }
  .el-form-item__label {
    span {
      color: #000 !important;
    }
  }
  .el-input__inner,
  .el-textarea__inner {
    font-size: 14px;
    color: #000;
  }
}
</style>
