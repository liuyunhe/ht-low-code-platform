<template>
  <div name="online-form" v-form>
    <ht-runtime-template
      v-if="!loadedFail"
      ref="onlineForm"
      :data="data"
      :permission="permission"
      :isView="isView"
      :isPrint="isPrint"
      @loadSuccess="loadSuccess"
      class="online-form-wrap form-table__wrap"
    />
    <div class="loaded-fail__div" v-if="loadedFail">
      表单加载失败,可能是表单配置发生了变化,请联系管理员...
    </div>
  </div>
</template>
<script>
/*ccwgq 2022-06-24 eipControl中的组件全部采用懒加载模式*/
const EipAttachment = () => import('@/components/eipControl/EipAttachment.vue')
const EipAutocomplete = () =>
  import('@/components/eipControl/EipAutocomplete.vue')
const EipButton = () => import('@/components/eipControl/EipButton.vue')
const EipCascader = () => import('@/components/eipControl/EipCascader.vue')
const EipCheckbox = () => import('@/components/eipControl/EipCheckbox.vue')
const EipCollapse = () => import('@/components/eipControl/EipCollapse.vue')
const EipDataView = () => import('@/components/eipControl/EipDataView.vue')
const EipDate = () => import('@/components/eipControl/EipDate.vue')
const EipDemensionSelector = () =>
  import('@/components/eipControl/selector/EipDemensionSelector.vue')
const EipDialog = () => import('@/components/eipControl/EipDialog.vue')
const EipDic = () => import('@/components/eipControl/EipDic.vue')
const EipDivider = () => import('@/components/eipControl/EipDivider.vue')
const EipFont = () => import('@/components/eipControl/EipFont.vue')
const EipFontUeditor = () =>
  import('@/components/eipControl/EipFontUeditor.vue')
const EipHotSubDialog = () =>
  import('@/components/eipControl/EipHotSubDialog.vue')
const EipHotTable = () => import('@/components/eipControl/EipHotTable.vue')
const EipImg = () => import('@/components/eipControl/EipImg.vue')
const EipInput = () => import('@/components/eipControl/EipInput.vue')
const EipJobSelector = () =>
  import('@/components/eipControl/selector/EipJobSelector.vue')
const EipMap = () => import('@/components/eipControl/EipMap.vue')
const EipOffice = () => import('@/components/eipControl/EipOffice.vue')
const EipOrgSelector = () =>
  import('@/components/eipControl/selector/EipOrgSelector.vue')
const EipPagination = () => import('@/components/eipControl/EipPagination.vue')
const EipPaginationLayout = () =>
  import('@/components/eipControl/EipPaginationLayout.vue')
const EipPaginationSteps = () =>
  import('@/components/eipControl/EipPaginationSteps.vue')
const EipPostSelector = () =>
  import('@/components/eipControl/selector/EipPostSelector.vue')
const EipQrcode = () => import('@/components/eipControl/EipQrcode.vue')
const EipRadio = () => import('@/components/eipControl/EipRadio.vue')
const EipRealtimeTextarea = () =>
  import('@/components/eipControl/EipRealtimeTextarea.vue')
const EipRealtimeInput = () =>
  import('@/components/eipControl/EipRealtimeInput.vue')
const EipRelFlow = () => import('@/components/eipControl/EipRelFlow.vue')
const EipRoleSelector = () =>
  import('@/components/eipControl/selector/EipRoleSelector.vue')
const EipSelect = () => import('@/components/eipControl/EipSelect.vue')
const EipSignature = () => import('@/components/eipControl/EipSignature.vue')
const EipStep = () => import('@/components/eipControl/EipStep.vue')
const EipSubDialog = () => import('@/components/eipControl/EipSubDialog.vue')
const EipSunDialog = () => import('@/components/eipControl/EipSunDialog.vue')
const EipSubExportDialog = () =>
  import('@/components/eipControl/EipSubExportDialog.vue')
const EipSubImportDialog = () =>
  import('@/components/eipControl/EipSubImportDialog.vue')
const EipSubPagination = () =>
  import('@/components/eipControl/EipSubPagination.vue')
const EipSubtableBackfill = () =>
  import('@/components/eipControl/EipSubtableBackfill.vue')
const EipSwitch = () => import('@/components/eipControl/EipSwitch.vue')
const EipTabs = () => import('@/components/eipControl/EipTabs.vue')
const EipTag = () => import('@/components/eipControl/EipTag.vue')
const EipTextarea = () => import('@/components/eipControl/EipTextarea.vue')
const EipTreeselect = () => import('@/components/eipControl/EipTreeselect.vue')
const EipUserSelector = () =>
  import('@/components/eipControl/selector/EipUserSelector.vue')
const EipViewer = () => import('@/components/eipControl/EipViewer.vue')
/**======================  ht component    ==================== */
const HtCascader = () => import('@/components/control/HtCascader.vue')
const HtCurrency = () => import('@/components/control/HtCurrency.vue')
const HtDigital = () => import('@/components/control/HtDigital.vue')
const HtFile = () => import('@/components/control/HtFile.vue')
const HtInputAutocomplete = () =>
  import('@/components/control/HtInputAutocomplete.vue')
const HtLabel = () => import('@/components/control/HtLabel.vue')
const HtGangedSelect = () => import('@/components/control/HtGangedSelect.vue')
const HtTree = () => import('@/components/control/HtTree.vue')
const HtTreeselect = () => import('@/components/control/HtTreeselect.vue')

/** =====================  ou component   ====================== */
const ContractPreview = () => import('@/components/common/ContractPreview.vue')
const OuPdf = () => import('@/components/eipControl/ou/OuPdf.vue')
const OuAttachment = () => import('@/components/eipControl/ou/OuAttachment.vue')
const OuOpinion = () => import('@/components/eipControl/ou/OuOpinion.vue')
const AddBusinessLineDialog = () => import('@/components/eipControl/ou/AddBusinessLineDialog.vue')
import SubPagination from '@/components/eipControl/bus/SubPagination.js'

/*    -----     懒加载结束    -----     */
// import EipInput from '@/components/eipControl/EipInput.vue'
// import EipCheckbox from '@/components/eipControl/EipCheckbox.vue'
// import EipSelect from '@/components/eipControl/EipSelect.vue'
// import EipRadio from '@/components/eipControl/EipRadio.vue'
// import EipUserSelector from '@/components/eipControl/selector/EipUserSelector.vue'
// import EipDemensionSelector from '@/components/eipControl/selector/EipDemensionSelector.vue'
// import EipJobSelector from '@/components/eipControl/selector/EipJobSelector.vue'
// import EipOrgSelector from '@/components/eipControl/selector/EipOrgSelector.vue'
// import EipPostSelector from '@/components/eipControl/selector/EipPostSelector.vue'
// import EipRoleSelector from '@/components/eipControl/selector/EipRoleSelector.vue'
// import EipTextarea from '@/components/eipControl/EipTextarea.vue'
// import EipFont from '@/components/eipControl/EipFont.vue'
// import EipDialog from '@/components/eipControl/EipDialog.vue'
// import EipAutocomplete from '@/components/eipControl/EipAutocomplete.vue'
// import EipCascader from '@/components/eipControl/EipCascader.vue'
// import EipTreeselect from '@/components/eipControl/EipTreeselect.vue'
// import EipButton from '@/components/eipControl/EipButton.vue'
// import EipDate from '@/components/eipControl/EipDate.vue'
// import EipImg from '@/components/eipControl/EipImg.vue'
// import EipViewer from '@/components/eipControl/EipViewer.vue'
// import EipSwitch from '@/components/eipControl/EipSwitch.vue'
// const EipMap = () => import('@/components/eipControl/EipMap.vue')
// const EipFontUeditor = () =>
//   import('@/components/eipControl/EipFontUeditor.vue')
// import HtFile from '@/components/control/HtFile.vue'
// import HtGangedSelect from '@/components/control/HtGangedSelect.vue'
// import EipRelFlow from '@/components/eipControl/EipRelFlow.vue'
// import EipSubDialog from '@/components/eipControl/EipSubDialog.vue'
// import EipSunDialog from '@/components/eipControl/EipSunDialog.vue'
// import HtLabel from '@/components/control/HtLabel.vue'
// import HtDigital from '@/components/control/HtDigital.vue'
// import HtCurrency from '@/components/control/HtCurrency.vue'
// import EipRealtimeInput from '@/components/eipControl/EipRealtimeInput.vue'
// import EipRealtimeTextarea from '@/components/eipControl/EipRealtimeTextarea.vue'
// import EipStep from '@/components/eipControl/EipStep.vue'
// import HtInputAutocomplete from '@/components/control/HtInputAutocomplete.vue'
// import HtTreeselect from '@/components/control/HtTreeselect.vue'
// import HtCascader from '@/components/control/HtCascader.vue'
// import HtTree from '@/components/control/HtTree.vue'

// import EipTabs from '@/components/eipControl/EipTabs.vue'
// import EipSubPagination from '@/components/eipControl/EipSubPagination.vue'
// import EipSubImportDialog from '@/components/eipControl/EipSubImportDialog.vue'
// import EipSubExportDialog from '@/components/eipControl/EipSubExportDialog.vue'
// import EipAttachment from '@/components/eipControl/EipAttachment.vue'
// import EipDic from '@/components/eipControl/EipDic.vue'
// import EipPaginationLayout from '@/components/eipControl/EipPaginationLayout.vue'
// import EipPagination from '@/components/eipControl/EipPagination.vue'
// import EipCollapse from '@/components/eipControl/EipCollapse.vue'
// import EipPaginationSteps from '@/components/eipControl/EipPaginationSteps.vue'
// import EipDataView from '@/components/eipControl/EipDataView.vue'
// import EipHotTable from '@/components/eipControl/EipHotTable.vue'
// import EipHotSubDialog from '@/components/eipControl/EipHotSubDialog.vue'
// import ContractPreview from '@/components/common/ContractPreview.vue'
// import EipTag from '@/components/eipControl/EipTag.vue'
// import EipSubtableBackfill from '@/components/eipControl/EipSubtableBackfill.vue'
// import EipDivider from '@/components/eipControl/EipDivider.vue'
// import EipOffice from '@/components/eipControl/EipOffice.vue'
// import EipQrcode from '@/components/eipControl/EipQrcode.vue'
// import EipSignature from '@/components/eipControl/EipSignature.vue'
// import SubPagination from '@/components/eipControl/bus/SubPagination.js'
/** 自定义控件 **/
// import OuPdf from '@/components/eipControl/ou/OuPdf.vue'
// import OuAttachment from '@/components/eipControl/ou/OuAttachment.vue'

import Vue from 'vue'
import VRuntimeTemplate from 'v-runtime-template'
//只是要使用Vue.component,就只要引入这个api,不要把整个库都引入，太大了
// import { component as ComponentApi } from 'vue'
export default {
  name: 'online-form',
  props: [
    'html',
    'data',
    'permission',
    'isView',
    'isPrint',
    'initFillData',
    'flowKey',
    'formId',
    'isLook'
  ],
  data() {
    return {
      loadedFail: false, //表单加载html是否失败
      subBackfill: new Map(),
      hotTableFillback: String
    }
  },
  created() {
    this.init()
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
    },
    hotTableFillback: function(newVal) {
      if (newVal) {
        let newValArray = newVal.split('_timestamp_')
        let boPathArray = newValArray[0].split('.')
        let hotTableRef = 'hottable.' + boPathArray[0] + '.' + boPathArray[1]
        let subBo = this.data[boPathArray[0]][boPathArray[1]]
        this.$refs.onlineForm.$refs[hotTableRef].fillbackHotTableData(subBo)
      }
    }
  },
  methods: {
    loadSuccess(res) {
      this.$emit('loadSuccess', res)
    },
    init() {
      let initFillData = this.initFillData
      let permission = this.permission
      Vue.component('ht-runtime-template', {
        props: ['html', 'data', 'permission', 'isView', 'isPrint'],
        template: this.html,
        data() {
          return {
            left_image: '',
            right_image: '',
            transitionIndex: -1,
            curTabIndex: 'tabe_check_0',
            errMesg: '',
            fillOrg: {},
            fillOrgConfMap: {},
            //ccwgq 增加dom变化的监听
            observerList: []
          }
        },
        computed: {
          // 子表前端分页过滤器
          pagingSubData() {
            const me = this
            return function(datapath) {
              // 通过子表数据路径获取分页数据
              return SubPagination.pagingByPath(datapath, me)
            }
          },
          //ccwgq 2022-04-08 增加移动端判断
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
          this.$validator = this.$root.$validator
          if (this.permission.table) {
            for (let subTableName in this.permission.table) {
              if (this.permission.table[subTableName].required) {
                this.addSubTableByName(subTableName)
              }
            }
          }
          this.$emit('loadSuccess', true)
          //初始化handsontable数据
          if (this.data) {
            const formId = this.formId
            let _this = this
            if (!formId) {
              this.toInitTemolateData(initFillData)
            } else {
              const loading = this.$loading({
                lock: true,
                text: '正在获取初始化信息...',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
              })
              this.$http
                .get('${form}/form/form/v1/previewDesignVue?formId=' + formId)
                .then(
                  resp => {
                    if (resp.data) {
                      const formData = resp.data.data
                      for (const key in formData) {
                        if (formData.hasOwnProperty(key)) {
                          if (!_this.data[key]) {
                            _this.data[key] = formData[key]
                          }
                        }
                      }
                      loading.close()
                      _this.toInitTemolateData(initFillData)
                    } else {
                      loading.close()
                      _this.toInitTemolateData(initFillData)
                    }
                  },
                  () => {
                    loading.close()
                    _this.toInitTemolateData(initFillData)
                  }
                )
            }
          }
          if (this.isPrint) {
            this.printDetail()
          }
          //ccwgq  2022-03-11修复table布局中由于隐藏字段造成的边框叠加看起来过粗的问题
          //如果table中某一行的所有单元格都没有子节点，说明其字段已经全部隐藏,
          // const ele = this.$el
          // if (ele && $(ele).find("table[class='main-table']").length > 0) {
          //   $(ele)
          //     .find("table[class='main-table']")
          //     .each(function() {
          //       $(this)
          //         .find('tr')
          //         .each(function() {
          //           //某一行
          //           //先检查其有无子节点
          //           if (this.childNodes && this.childNodes.length === 0) {
          //             $(this).css('display', 'none')
          //             return
          //           }
          //           let hide = true
          //           $(this)
          //             .find('td')
          //             .each(function(index) {
          //               if (this.children && this.children.length > 0) {
          //                 hide = false
          //               }
          //             })
          //           if (hide) {
          //             $(this).css('display', 'none')
          //           }
          //         })
          //     })
          // }
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
        },
        //改v-runtime-template.es.js的源码，或者改v-runtime-template的版本改成1.5.2
        methods: {
          //将JSON字段转义
          parseJsonStr(str) {
            if (typeof str === 'string') return str.replace(/\"/g, '\"')
            return null
          },
          toInitTemolateData(initFillData) {
            if (!this.data) {
              return
            }
            const formData = this.data
            let refs = this.$refs
            for (const def in formData) {
              if (formData.hasOwnProperty(def)) {
                const boDef = formData[def]
                for (const bo in boDef) {
                  if (boDef.hasOwnProperty(bo) && bo.indexOf('sub_') == 0) {
                    const ref = 'hottable.' + def + '.' + bo
                    if (refs[ref]) {
                      try {
                        refs[ref].fillbackHotTableData(
                          formData[def][bo],
                          permission
                        )
                        if (initFillData) {
                          refs[ref].initTemplateData()
                        }
                      } catch (error) {
                        console.log(error)
                      }
                    }
                  }
                }
              }
            }
          },
          printDetail() {
            let a = document.getElementsByName('online-form')[0].innerHTML
            window.print()
            if (this.isPrint) {
              this.$router.go(-1)
            }
            setTimeout(function() {
              location.reload()
            }, 200)
          },
          async leaveTabVerify(activeName, oldActiveName) {
            let erritems = []
            let formElementAry = document.getElementsByName('online-form')
            let frmInst = formElementAry[0].__vue__
            let childrens = frmInst.$refs.onlineForm.$refs
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
              this.$parent.loadedFail = true
              this.$set(data, index - 1, data[index])
              this.$set(data, index, temp)
              this.$parent.loadedFail = false
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
              this.$parent.loadedFail = true
              this.$set(data, index + 1, data[index])
              this.$set(data, index, i)
              this.$parent.loadedFail = false
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
            newOne.sub_guid = this.guid()
            obj.push(newOne)
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
                // //点添加时判断要新增子表记录中的字段是否有值
                // if(subData[key]){
                //     subData[key] = "";//有则清空
                // }
              }
              let fillObj = this.toFillOrg(
                pathArr[1] + '.' + pathArr[2],
                subData
              )
              fillObj.sub_guid = this.guid()
              this.data[pathArr[1]][pathArr[2]].push(fillObj)
            }
          },
          guid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
              /[xy]/g,
              function(c) {
                var r = (Math.random() * 16) | 0,
                  v = c == 'x' ? r : (r & 0x3) | 0x8
                return v.toString(16)
              }
            )
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
              let sunBodata = JSON.parse(str)
              sunBodata.sub_guid = this.guid()
              this.data[pathArr[1]][pathArr[2]][subIndex][pathArr[3]].push(
                sunBodata
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
                        //  ccwgq 2021-11-30  数据拷贝，防止孙表添加部分数据重复复制
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
            console.log("子表删除===>",subTablePath,'=====>',item)
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
              this.data[pathArr[0]][pathArr[1]][index][pathArr[2]].empty()
            } else {
              const subTabName = pathArr[1].replace('sub_', '')
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
              this.data[pathArr[0]][pathArr[1]].empty()
              if (isHot) {
                const hotTableRef = 'hottable.' + subTablePath
                this.$refs[hotTableRef].fillbackHotTableData(null)
              }
            }
          },
          addInitTemplateData(subTablePath) {
            const hotTableRef = 'hottable.' + subTablePath
            this.$refs[hotTableRef].toAddInitTemplateData()
          },
          mergeCellRefresh(subTablePath) {
            const hotTableRef = 'hottable.' + subTablePath
            this.$refs[hotTableRef].mergeCellRefresh()
          },
          execCellMathExp(subTablePath) {
            const hotTableRef = 'hottable.' + subTablePath
            this.$refs[hotTableRef].execCellMathExp()
          },
          execCrossMapping(subTablePath) {
            const hotTableRef = 'hottable.' + subTablePath
            this.$refs[hotTableRef].execCrossMapping()
          },
          getHotTableData(subTablePath) {
            const hotTableRef = 'hottable.' + subTablePath
            this.$refs[hotTableRef].getHotTableData()
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
          toFillOrg(path, row) {
            const fillOrgConf = this.fillOrgConfMap[path]
            let fillObj = {}
            if (fillOrgConf && this.fillOrg) {
              if (fillOrgConf.name) {
                const namePath = fillOrgConf.name.split('.')
                fillObj[namePath[namePath.length - 1]] = this.fillOrg.name
              }
              if (fillOrgConf.id) {
                const idPath = fillOrgConf.id.split('.')
                fillObj[idPath[idPath.length - 1]] = this.fillOrg.id
              }
              if (fillOrgConf.code) {
                const codePath = fillOrgConf.code.split('.')
                fillObj[codePath[codePath.length - 1]] = this.fillOrg.code
              }
              if (fillOrgConf.instId) {
                const instIdPath = fillOrgConf.instId.split('.')
                fillObj[instIdPath[instIdPath.length - 1]] = this.$parent
                  .$parent.instId
                  ? this.$parent.$parent.instId
                  : ''
              }
              return {...row, ...fillObj}
            }
            return row
          },
          initFill(path, conf) {
            //收集自动回填信息
            if (path && conf) {
              try {
                const confJson = this.fillOrgConfMap[path]
                  ? this.fillOrgConfMap[path]
                  : JSON.parse(conf)
                if (
                  confJson.id ||
                  confJson.code ||
                  confJson.name ||
                  confJson.instId
                ) {
                  this.fillOrgConfMap[path] = confJson
                  this.initFirstFill(path, confJson)
                }
              } catch (error) {}
            }
          },
          initFirstFill(path, conf) {
            //处理第一行的回填
            const paths = path.split('.')
            if (
              this.data[paths[0]][paths[1]] &&
              this.data[paths[0]][paths[1]].length == 1 &&
              this.fillOrg.id
            ) {
              if (conf.id) {
                const idPath = conf.id.split('.')
                if (!this.data[paths[0]][paths[1]][0][idPath[2]]) {
                  this.data[paths[0]][paths[1]][0][idPath[2]] = this.fillOrg.id
                  if (conf.code) {
                    const codePath = conf.code.split('.')
                    if (!this.data[paths[0]][paths[1]][0][codePath[2]]) {
                      this.data[paths[0]][paths[1]][0][
                        codePath[2]
                      ] = this.fillOrg.code
                    }
                  }
                  if (conf.name) {
                    const namePath = conf.name.split('.')
                    if (!this.data[paths[0]][paths[1]][0][namePath[2]]) {
                      this.data[paths[0]][paths[1]][0][
                        namePath[2]
                      ] = this.fillOrg.name
                    }
                  }
                }
              }
              if (conf.instId) {
                const instIdPath = conf.instId.split('.')
                if (!this.data[paths[0]][paths[1]][0][instIdPath[2]]) {
                  this.data[paths[0]][paths[1]][0][instIdPath[2]] = this.$parent
                    .$parent.instId
                    ? this.$parent.$parent.instId
                    : ''
                }
              }
            }
          },
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
          }
        },
        components: {
          EipCheckbox,
          EipInput,
          EipPagination,
          EipSelect,
          EipSubExportDialog,
          EipSubImportDialog,
          EipSubPagination,
          EipSubExportDialog,
          EipPaginationLayout,
          EipUserSelector,
          EipDemensionSelector,
          EipJobSelector,
          EipOrgSelector,
          EipPostSelector,
          EipRoleSelector,
          EipRadio,
          EipTextarea,
          EipFont,
          EipDialog,
          EipButton,
          EipDate,
          EipImg,
          EipViewer,
          EipSwitch,
          HtFile,
          VRuntimeTemplate,
          HtGangedSelect,
          EipRelFlow,
          EipSubDialog,
          HtLabel,
          HtDigital,
          HtCurrency,
          EipRealtimeInput,
          EipRealtimeTextarea,
          EipStep,
          HtInputAutocomplete,
          HtTreeselect,
          HtCascader,
          HtTree,
          EipAttachment,
          EipDic,
          EipAutocomplete,
          EipCascader,
          EipTreeselect,
          EipCollapse,
          EipPaginationSteps,
          EipMap,
          EipDataView,
          EipSunDialog,
          EipTag,
          EipHotTable,
          EipHotSubDialog,
          ContractPreview,
          EipSubtableBackfill,
          EipDivider,
          EipOffice,
          EipQrcode,
          EipSignature,
          EipTabs,
          EipFontUeditor,
          // ccwgq ou components
          OuAttachment,
          OuOpinion,
          AddBusinessLineDialog
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
td .el-form-item__error {
  -webkit-transform: scale(0.9);
  transform: scale(0.9);
  position: sticky;
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
.loaded-fail__div {
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  color: #f56c6c;
}
.main-table {
  border-collapse: separate;
  margin-bottom: 20px;
  /*ccwgq  2022-05-26 表格布局的字体大小和东证OA一致  start*/
  * {
    font-size: 11pt;
    // color:black;
    font-family: MicroSoft YaHei;
  }
  /** end */
}
@media print {
  .printHide {
    display: none;
  }
  // .form-table{
  //   border: none;
  // }
  // .main-title {
  //   min-width: 130px;
  // }
  .main-field {
    line-height: 1.5 !important;
  }
  .el-main {
    padding: 0px !important;
  }
  .sub-table-header /deep/ th {
    min-width: 110px !important;
  }
  colgroup {
    display: none !important;
  }
  .el-table__header {
    width: 100% !important;
  }
  .el-table__body {
    width: 100% !important;
  }
  .el-table_1_column_1 {
    width: 60px !important;
  }
  .el-table_1_column_3 {
    width: 100px !important;
  }
  .el-table_1_column_4 {
    width: 100px !important;
  }
  .el-table_1_column_5 {
    display: none !important;
  }
  .gutter {
    display: none !important;
  }
  .form-table {
    border: 1px solid rgb(238, 235, 235) !important;
    // border-left: 1px solid rgb(238, 235, 235) !important;
  }
  .form-table > tbody > tr > th,
  .form-table > tbody > tr > td,
  .form-table > tfoot > tr > td,
  .form-table > thead > tr > th {
    border: 1px solid rgb(238, 235, 235) !important;
    // border-bottom: 1px solid rgb(238, 235, 235) !important;
  }
  .el-table__header {
    border: 1px solid rgb(238, 235, 235) !important;
    // border-left: 1px solid rgb(238, 235, 235) !important;
    // border-right: 1px solid rgb(238, 235, 235) !important;
  }
  .el-table__header > tbody > tr > th,
  .el-table__header > tbody > tr > td,
  .el-table__header > tfoot > tr > td,
  .el-table__header > thead > tr > th {
    border: 1px solid rgb(238, 235, 235) !important;
  }
  // .el-table__body {
  //   border-left: 1px solid rgb(238, 235, 235) !important;
  //   border-right: 1px solid rgb(238, 235, 235) !important;
  // }
  .el-table__body > tbody > tr > th,
  .el-table__body > tbody > tr > td,
  .el-table__body > tfoot > tr > td,
  .el-table__body > thead > tr > th {
    border: 1px solid rgb(238, 235, 235) !important;
  }
  //  .el-table--group, .el-table--border {
  //   border-top: none;
  // }
  // .el-table--border th, .el-table--border td{
  //   border-right: 1px solid rgb(238, 235, 235) !important;
  // }
  .el-table th.is-leaf,
  .el-table td {
    border-bottom: 1px solid rgb(238, 235, 235) !important;
  }
}
.main-title {
  word-break: break-all;
  text-align: right;
  font-weight: 100;
  color: #545252;
  font-size: 12px;
  padding: 0px 10px !important;
  font-weight: bold;
  line-height: 28px;
  background-color: #f6f6f6;
}
.main-field {
  padding: 10px;
  line-height: 0;
  .unit {
    display: inline-block;
    // margin-top: 16px;
  }
}
.online-form-wrap {
  [name='online-form'] .el-date-editor.el-input,
  .el-date-editor.el-input__inner {
    width: 100%;
  }
  .el-input {
    width: 100% !important;
  }
  .amap-page-container {
    .amap-toolbar,
    .amap-geolocation-con,
    .amap-scalecontrol,
    .amap-logo,
    .amap-copyright {
      z-index: 1 !important;
    }
  }
  // .input_wrap{
  //   display: flex;
  //   flex-direction: row;
  //   /deep/.ht_inputs{
  //     width: 80% !important;
  //   }

  // }
}
.el-tooltip__popper {
  p {
    width: 300px;
  }
}
.xh_table tfoot td:empty {
  padding: 0 !important;
  border: none !important;
}
.online-form-wrap {
  .table_layout_wrap,
  .xh_table,
  .grandson_table_wrap {
    overflow: auto;
  }
}
.inputs {
  .file-list__wrap {
    padding-left: 0;
    .file-item {
      .file-icon,
      .file-close__icon {
        padding-top: 11px;
      }
    }
  }
}
.form-table__wrap {
  .form-table > thead > tr > th:last-child {
    min-width: 90px !important;
  }
}
/* ccwgq 2022-09-29 增加交叉阴影样式*/
$oddColor: #909399; /*奇数颜色*/
$evenColor: #79bbff; /*偶数颜色*/
$topMargin: 20px; /*top外边距*/
$bilaMargin: 10px; /*两侧的外边距*/
.sub-box-card__0,
.sub-box-card__1 {
  margin: $topMargin $bilaMargin 0 $bilaMargin;
}
.sub-box-card__0 {
  box-shadow: 0 2px 10px 0 $evenColor !important;
}
.sub-box-card__1 {
  box-shadow: 0 2px 10px 0 $oddColor !important;
}
.el-card:last-child {
  margin-bottom: $topMargin;
}
</style>
