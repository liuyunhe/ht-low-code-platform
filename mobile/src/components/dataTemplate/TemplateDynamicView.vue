<template>
  <div>
    <ht-runtime-template
      :templateKey="templateKey"
      :html="html"
      :templateInfo="templateInfo"
      :single="single"
      :taskType="taskType"
      :isJoinFlow="isJoinFlow"
      :dataView="dataView"
    />
  </div>
</template>

<script>
import {Loading} from 'element-ui'
import HtCheckbox from '@/components/control/HtCheckbox.vue'
import HtDialog from '@/components/control/HtDialog.vue'
import HtDialogBtn from '@/components/control/htDialogBtn.vue'
import VRuntimeTemplate from 'v-runtime-template'
import utils from '@/utils.js'
import {Base64} from 'js-base64'
import Vue from 'vue'
import QRCode from 'qrcode'
import req from '@/request.js'
import form from '@/api/form.js'
import dialog from '@/api/dialogApi.js'
import {Dialog, Notify} from 'vant'
const TemplateBatchUpdateDialog = () =>
  import('@/components/dataTemplate/TemplateBatchUpdateDialog.vue')
export default {
  name: 'template-dynamic-view',
  props: {
    templateKey: String,
    html: String,
    templateInfo: Object,
    parameterqQuerys: String,
    single: String,
    defKey: String,
    taskType: {
      default: '',
    },
    dataView: Object,
    isJoinFlow: {
      default: false,
    },
  },
  created() {
    this.init()
  },
  watch: {
    html: function (newVal) {
      if (newVal) {
        this.init()
      }
    },
  },
  methods: {
    init() {
      Vue.component('ht-runtime-template', {
        template: this.html,
        props: {
          templateKey: String,
          templateInfo: Object,
          single: String,
          defKey: String,
          taskType: {
            default: '',
          },
          dataView: Object,
          isJoinFlow: {
            default: false,
          },
        },
        data() {
          return {
            activeNames: [],
            isMobile: true,
            QRCodePattern: true,
            alias_new: 'statement',
            loading: false,
            QRCodeurl: '',
            QRCodeDialog: false,
            html: '',
            tableData: {selectRows: [], querys: ''},
            dialogExportVisible: false,
            exportData: {getType: 'all', expField: []},
            displayFields: [],
            exportSellection: [],
            searchForm: {F_xb: '', F_xm: ''},
            queryForm: {
              queryData: '',
            },
            formType: false,
            labelPosition: 'left',
            incons: 'el-icon-arrow-down',
            options: {
              fullscreen: true,
              lock: true,
            },
            rowTemplateId: null,
            rowId: null,
            QRCodeShow: true,
            QRCodeDesc: [],
            tree: [],
            customDialog: [],
            tableHeight: 0.7 * window.innerHeight,
            dialogSubVisible: false,
            summaryFields: [],
            dialogSunVisible: false, //孙表对话框
            tabs: [],
            sunTabs: [], //孙表数据
            ents: [],
            modifyRecord: {
              pagination: {
                pageBean: {
                  page: 1,
                  pageSize: 10,
                  total: 0,
                },
              },
            },
            notSortableFields: [
              'bpm_status_',
              'bpm_proc_inst_id_',
              'bpm_subject_',
              'bpm_proc_def_name_',
              'bpm_create_time_',
              'bpm_end_time_',
              'bpm_is_forbidden_',
              'bpm_creator_',
            ],
            recordList: [],
            recordRefId: '',
            dialogRecordVisible: false,
            recordTableLoading: false,
            modifyDetailDialogVisible: false,
            currentModify: {},
            refId: '',
            querySubValue: '',
            querySunValue: '',
            subTableLoading: false,
            currentTabName: '',
            currentTab: {},
            exportType: 'main',
            subDisplayFields: [],
            subDisplayFieldsList: [],
            notPrint: false,
            displayField: {},
            treeList: [],
            rows: [],
            pagination: {
              page: 1,
              pageSize: 10,
            },
            paginationLayout: 'total, sizes, prev, pager, next',
            total: 0,
            permission: {
              print: true,
              add: true,
              del: true,
              export: true,
              edit: true,
              hidden: false,
            },
            showRightMenu: true,
            listSelectable: true,
            operateColWidth: '150',
            dialogVisible: false,
            filters: {},
            filterMap: {},
            //ccwgq,修复table边框过粗的问题
            observerList: [],
          }
        },
        computed: {
          isMobile1() {
            return navigator.userAgent.match(
              /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
            )
          },
        },
        components: {
          VRuntimeTemplate,
          HtCheckbox,
          HtDialog,
          HtDialogBtn,
          TemplateBatchUpdateDialog,
          Notify,
        },
        watch: {
          ents: {
            handler: function (newVal, oldValue) {
              if (newVal && newVal.length >= 1 && newVal != oldValue) {
                this.getSubData(this, this.refId)
              }
            },
            deep: true,
            immediate: true,
          },
          templateInfo: {
            handler: function (newVal, oldVal) {
              if (newVal && newVal.id) {
                const loading = this.$loading(this.options)
                let _me = this
                _me.templateInfo = newVal
                if (_me.templateInfo.displayField) {
                  let displayField = utils.parseToJson(
                    _me.templateInfo.displayField
                  )
                  for (var i = 0; i < displayField.length; i++) {
                    if (displayField[i].type) {
                      this.displayFields.push(displayField[i])
                    }
                  }
                }
                if (_me.templateInfo.conditionField) {
                  let conditionField = utils.parseToJson(
                    _me.templateInfo.conditionField
                  )
                  for (var i = 0; i < conditionField.length; i++) {
                    var fieldName = 'F_' + conditionField[i].name
                    this.$set(this.searchForm, fieldName, '')
                  }
                }
                let params = {templateId: _me.templateInfo.id}
                let pageBean = {
                  pageBean: {
                    page: '1',
                    pageSize: newVal.pageSize,
                    showTotal: 'true',
                  },
                } //初次加载默认pageBean
                params.pagination = pageBean
                if (_me.isJoinFlow) {
                  params.isJoinFlow = true
                  params.taskType = _me.taskType
                  params.defKey = _me.defKey
                }
                if (_me.dataView) {
                  //关联查询字段
                  if (
                    _me.dataView.bindSelectd &&
                    _me.dataView.bindSelectd != ''
                  ) {
                    const pInst = utils.getOnlineFormInstance(
                      this.$parent.$parent.$parent
                    )
                    const path =
                      'data.' +
                      _me.dataView.boDefAlias +
                      '.' +
                      _me.dataView.selectField
                    const value = utils.getValueByPath(pInst, path)
                    _me.dataView.selectValue = value
                    params.selectField = _me.dataView.bindSelectd
                    params.selectValue = _me.dataView.selectValue
                  }
                }
                if (this.parameterqQuerys) {
                  var querys = JSON.parse(
                    Base64.decode(decodeURIComponent(this.parameterqQuerys))
                  )
                  params.pagination.querys = querys
                }
                let defaultQuery = this.buildDefaultQuerys()
                if (defaultQuery.length > 0) {
                  if (params.pagination.querys) {
                    params.pagination.querys.concat(defaultQuery)
                  } else {
                    params.pagination.querys = defaultQuery
                  }
                }
                const this_ = this
                this.$store
                  .dispatch('form/getBpmTemplateByPagination', params)
                  .then((response) => {
                    this_.rows = response.data.rows
                    this_.total = response.data.total
                    this_.pagination.page = response.data.page
                    this_.pagination.pageSize = response.data.pageSize
                    if (this_.$el && this_.$el.querySelector) {
                      let topBtnDom = this_.$el.querySelector('div.top_btn_col')
                      if (
                        !topBtnDom ||
                        !topBtnDom.querySelector('i.el-icon-delete')
                      ) {
                        this_.listSelectable = false
                      }
                      setTimeout(function () {
                        let tdDom = this_.$el.querySelector('td.right_menu')
                        if (!tdDom || !tdDom.querySelector('button')) {
                          this_.showRightMenu = false
                        }
                      }, 200)
                    }
                    loading.close()
                    if (this_.$el && this_.$el.querySelector) {
                      let topBtnDom = this_.$el.querySelector('div.top_btn_col')
                      if (
                        !topBtnDom ||
                        !topBtnDom.querySelector('i.el-icon-delete')
                      ) {
                        this_.listSelectable = false
                      }
                      setTimeout(function () {
                        let tdDom = this_.$el.querySelector('td.right_menu')
                        if (!tdDom || !tdDom.querySelector('button')) {
                          this_.showRightMenu = false
                        }
                      }, 200)
                    }
                  })
                if (newVal.treeField && newVal.treeField !== '{}') {
                  let treeField = JSON.parse(newVal.treeField)
                  this.initTree(treeField)
                  form.getSubEntsByFormKey(
                    this.templateInfo.formKey,
                    (resp) => {
                      resp.data.forEach((item) => {
                        let subDisplayFields = []
                        item.attributeList.forEach((attr) => {
                          subDisplayFields.push({
                            desc: attr.comment,
                            name: attr.fieldName,
                            type: attr.columnType,
                          })
                        })
                        this.subDisplayFields.push({
                          fields: subDisplayFields,
                          name: item.name,
                          comment: item.comment,
                        })
                      })
                    }
                  )
                }
                if (newVal.summaryField) {
                  this.summaryFields = JSON.parse(newVal.summaryField)
                }
              }
            },
            deep: true,
            immediate: true,
          },
          currentTabName: function (newVal) {
            if (newVal) {
              this.querySubValue = ''
            }
          },
        },
        mounted() {
          let _me = this
          //数据视图控件
          if (this.dataView) {
            const pInst = utils.getOnlineFormInstance(
              this.$parent.$parent.$parent.$parent
            )
            //关联查询字段
            if (this.dataView.bindSelectd && this.dataView.bindSelectd != '') {
              const path =
                'data.' +
                this.dataView.boDefAlias +
                '.' +
                this.dataView.selectField
              const value = utils.getValueByPath(pInst, path)
              this.dataView.selectValue = value
              pInst.$watch(path, function (newVal, oldVal) {
                if (newVal !== oldVal) {
                  _me.dataView.selectValue = newVal
                  _me.search()
                }
              })
            }
            //关联填充字段
            if (this.dataView.fillField && this.dataView.fillField != '') {
              const path_fillField =
                'data.' +
                this.dataView.boDefAlias +
                '.' +
                this.dataView.fillField
              const value_fillValue = utils.getValueByPath(
                pInst,
                path_fillField
              )
              this.dataView.fillValue = value_fillValue
              pInst.$watch(path_fillField, function (newVal, oldVal) {
                if (newVal !== oldVal) {
                  _me.dataView.fillValue = newVal
                }
              })
            }
          }
          _me.$emit('afterMounted')
          this.$nextTick(() => {
            //按钮默认收起
            //子表的
            const $subBtns = $($.find('.collapse-button__sub'))
            $subBtns.each(function () {
              $(this).text() == '收起' && $(this).trigger('click')
            })
            const $sunBtns = $($.find('.collapse-button__sun'))
            $sunBtns.each(function () {
              $(this).text() == '收起' && $(this).trigger('click')
            })
          })
        },
        methods: {
          //ccwgq 2022-04-07 绑定按钮回调
          collapseBtn(that, subTablePath) {
            // console.log('我被点击了===>', arguments)
            this.subBtn = that
            const $btn = $(that)
            const $bros = $($.find('.collapse-button__sub')).filter(
              function () {
                return (
                  $(this).data('path') == $btn.data('path') && this !== that
                )
              }
            )
            const $curRow = $btn.parents('.el-row')
            const $broRows = $curRow
              .siblings('.el-row')
              .filter(function (index) {
                return index != 0
              })
            if ($btn.text() == '收起') {
              //收起此处
              $broRows.each(function () {
                $(this).hide()
              })
              $btn.text('展开')
            } else if ($btn.text() == '展开') {
              //展开伙伴
              $broRows.each(function () {
                $(this).show()
              })
              $btn.text('收起')
              // $bros.each(function() {
              //   $(this).trigger('click')
              // })
            }
          },
          //ccwgq 2022-04-09  孙表添加折叠按钮
          collapseBtnSun(that, sunTablePath) {
            const $btn = $(that)
            const $curRow = $btn.parent('.el-row')
            const $broRows = $curRow
              .siblings('.el-row')
              .filter(function (index) {
                return index != 0
              })
            // console.log($broRows);
            //如果没有需要折叠的则不会折叠
            if ($btn.text() == '收起') {
              $broRows.each(function () {
                $(this).hide()
              })
              $btn.text('展开')
            } else if ($btn.text() == '展开') {
              $broRows.each(function () {
                $(this).show()
              })
              $btn.text('收起')
            }
          },
          printList() {
            this.notPrint = true
            setTimeout(() => {
              document.body.innerHTML =
                document.getElementById('printData').innerHTML
              window.print()
              location.reload()
            }, 200)
            setTimeout(() => {
              this.notPrint = false
            }, 200)
          },
          printDetail(templateId, id, action) {
            //数据随机添加到其他菜单下面时获取当前菜单的别名
            if (sessionStorage.menu_alias) {
              this.alias_new = sessionStorage.menu_alias
            }
            var url =
              '/' +
              this.alias_new +
              '/template/form/' +
              this.templateKey +
              '/' +
              action
            if (id) {
              url = url + '?id=' + id + '&'
            } else {
              url += '?'
            }
            var startFlowStr = 'startFlow=false'
            this.$router.push({
              path: url + startFlowStr,
              query: {isPrint: true},
            })
          },
          complete(instId) {
            const me_ = this
            var url =
              window.context.bpmRunTime +
              '/runtime/task/v1/getBpmTaskByInstId?instId=' +
              instId
            req.get(url).then(function (res) {
              if (res.data.length == 0) {
                Notify({type: 'warning', message: '此任务已被处理或不存在'})
              } else if (res.data.length == 1) {
                me_.$router.push('/task/' + res.data[0].id + '/0')
              } else {
                let html =
                  '<select ref=' +
                  Math.random() +
                  ' id="approvalLeaderSelect" style="width: 200px;height: 30px;border-radius: 4px;margin: 20px 70px;" ><option value="">请选择</option>'
                res.data.forEach((identity) => {
                  html +=
                    '<option value="' +
                    identity.id +
                    '">' +
                    identity.name +
                    '</option>'
                })
                html += '</select>'
                me_.$alert(html, '请选择一个代办任务审批', {
                  dangerouslyUseHTMLString: true,
                  beforeClose: function (action, instance, done) {
                    if (action == 'confirm') {
                      let se = document.getElementById('approvalLeaderSelect')
                      if (se.selectedIndex == 0) {
                        me_.$message.warning('请选择要审批的任务')
                      } else {
                        instance.close()
                        me_.$router.push(
                          '/task/' + se[se.selectedIndex].value + '/0'
                        )
                      }
                    } else {
                      instance.close()
                    }
                  },
                })
              }
            })
          },
          //下载全部选中的二维码
          downloadAllQRCode(templateId, mobileFormAlias, display, pkField) {
            const _selectData = this.$refs.multipleTemplateTable.selection
            if (_selectData.length === 0) {
              Notify({type: 'warning', message: '请至少选中一条数据'})
              return
            }
            this.loading = true
            let account = Base64.encode(
              this.$store.state.login.currentUser.account
            )
            let token = this.$store.state.login.currentUser.token
            let front = window.context.front
            let QRCodeurl = ''
            let zip = new JSZip()
            // 创建一个名为images的新的文件目录
            let img = zip.folder('images')
            let plist = []
            for (let x = 0; x < _selectData.length; x++) {
              if (this.QRCodePattern) {
                QRCodeurl =
                  front +
                  '/QRCodeForm/' +
                  this.templateKey +
                  '/get' +
                  '?id=' +
                  _selectData[x][pkField] +
                  '&token=' +
                  token
              } else {
                QRCodeurl =
                  front +
                  '/QRCodeForm/' +
                  this.templateKey +
                  '/ddit' +
                  '?id=' +
                  _selectData[x][pkField]
              }

              let msg = document.createElement('canvas')

              QRCode.toCanvas(msg, QRCodeurl, function (error) {
                console.log(error)
              })
              let _canvas = document.createElement('div')
              _canvas.setAttribute('id', 'QRCodeAndDescAll' + x)
              _canvas.setAttribute(
                'style',
                'text-align:center;width:' + msg.width + 'px;'
              )
              _canvas.appendChild(msg)
              //创建底部的描述信息
              for (let Y = 0; Y < display.length; Y++) {
                let item = JSON.parse(display[Y])
                if (_selectData[x][item.name]) {
                  let desc = document.createElement('div')
                  desc.innerHTML = item.desc + ':' + _selectData[x][item.name]
                  _canvas.appendChild(desc)
                }
              }
              document.getElementById('QRCodeAndDescAll').appendChild(_canvas)
              plist.push(
                this.downloadQRCodeAndDesc('#QRCodeAndDescAll' + x, _canvas)
              )
            }
            Promise.all(plist).then((result) => {
              document.getElementById('QRCodeAndDescAll').innerHTML = ''
              for (let x = 0; x < result.length; x++) {
                let canvas = result[x]
                let image = canvas.toDataURL().split(';base64,')[1]
                // 这个images文件目录中创建一个base64数据为imgData的图像，图像名是smile.gif
                img.file(x + '.png', image, {base64: true})
              }
              // 把打包内容异步转成blob二进制格式
              zip.generateAsync({type: 'blob'}).then(function (content) {
                let eleLink = document.createElement('a')
                eleLink.download = '二维码.zip'
                eleLink.style.display = 'none'
                // 下载内容转变成blob地址
                eleLink.href = URL.createObjectURL(content)
                // 触发点击
                document.body.appendChild(eleLink)
                eleLink.click()
                // 然后移除
                document.body.removeChild(eleLink)
              })

              this.loading = false
            })
          },
          onCopy(e) {
            Notify({type: 'success', message: '内容已复制到剪切板'})
          },
          // 复制失败时的回调函数
          onError(e) {
            Notify({type: 'error', message: '抱歉，复制失败'})
          },
          downloadQRCode() {
            let plist = []
            let _canvas = document.querySelector('#QRCodeAndDesc')
            plist.push(this.downloadQRCodeAndDesc('#QRCodeAndDesc', _canvas))
            Promise.all(plist).then((result) => {
              let canvas = result[0]
              let link = document.createElement('a')
              link.href = canvas.toDataURL() //下载链接
              link.setAttribute('download', '二维码.jpg')
              link.style.display = 'none' //a标签隐藏
              document.body.appendChild(link)
              link.click()
            })
          },
          //把二维码与二维码说明一起下载成图片
          downloadQRCodeAndDesc(classs, _canvas) {
            let p2 = new Promise((resolve, reject) => {
              let canvas2 = document.createElement('canvas')
              let w = parseInt(window.getComputedStyle(_canvas).width)
              let h = parseInt(window.getComputedStyle(_canvas).height)
              //将canvas画布放大若干倍，然后盛放在较小的容器内，就显得不模糊了
              canvas2.width = w * 2
              canvas2.height = h * 2
              canvas2.style.width = w + 'px'
              canvas2.style.height = h + 'px'
              //可以按照自己的需求，对context的参数修改,translate指的是偏移量
              let context = canvas2.getContext('2d')
              context.scale(2, 2)
              return html2canvas(document.querySelector(classs), {
                canvas: canvas2,
              }).then(function (canvas) {
                resolve(canvas)
              })
            })
            return p2
          },
          QRCodeDialogClose() {
            this.QRCodeDialog = false
          },
          foundQRCode() {
            if (this.QRCodePattern) {
              this.QRCodeurl =
                window.context.front +
                '/QRCodeForm/' +
                this.templateKey +
                '/get?id=' +
                this.rowId +
                '&token=' +
                this.$store.state.login.currentUser.token
            } else {
              this.QRCodeurl =
                window.context.front +
                '/QRCodeForm/' +
                this.templateKey +
                '/edit?id=' +
                this.rowId
            }
            let msg = document.getElementById('QRCode')

            QRCode.toCanvas(msg, this.QRCodeurl, function (error) {
              console.log(error)
            })
            this.QRCodeShow = true
          },
          getQRCode(templateId, id, mobileFormAlias, display, index) {
            this.QRCodeDesc = []
            for (let x = 0; x < display.length; x++) {
              let item = JSON.parse(display[x])
              if (this.rows[index][item.name]) {
                this.QRCodeDesc.push(
                  item.desc + ':' + this.rows[index][item.name]
                )
              }
            }
            this.mobileFormAlias = mobileFormAlias
            this.QRCodeShow = false
            this.QRCodeDialog = true
            this.rowTemplateId = templateId
            this.rowId = id
          },
          handleSizeChange: function (size) {
            //每页下拉显示数据
            this.pagination.pageSize = size
            this.search()
          },
          handleCurrentChange: function (currentPage) {
            //点击第几页
            this.pagination.page = currentPage
            this.search()
          },
          getParam() {
            let params = {}
            if (str == 'find') {
              this.$store.dispatch('form/setBpmTemplatePaginationPageNum', 1)
            }

            //判断为合并查询还是分开查询
            if (this.formType) {
              params = this.getQueryFilter()
            } else {
              //判断是否配置了合并查询
              if ($('.search-query').length > 0) {
                params = this.getConditionQuery()
              } else {
                params = this.getQueryFilter()
              }
            }

            if (
              params.pagination &&
              params.pagination &&
              params.pagination.querys
            ) {
              let tempQueryS = []
              let betweenConditions = {}
              params.pagination.querys.forEach((q) => {
                if (
                  q.value &&
                  (q.operation != 'BETWEEN' || q.value.constructor == Array)
                ) {
                  tempQueryS.push(q)
                } else if (q.value) {
                  let conditions = q
                  if (betweenConditions[q.property]) {
                    conditions = betweenConditions[q.property]
                    conditions.value = [conditions.value]
                    conditions.value.push(q.value)
                  }
                  betweenConditions[q.property] = conditions
                }
              })
              for (const key in betweenConditions) {
                tempQueryS.push(betweenConditions[key])
              }
              params.pagination.querys = tempQueryS
            }
            return params
          },
          search(str) {
            const loading = this.$loading(this.options)
            let params = {}
            if (str == 'find') {
              this.$store.dispatch('form/setBpmTemplatePaginationPageNum', 1)
            }
            //判断为合并查询还是分开查询
            if (this.formType) {
              params = this.getQueryFilter()
            } else {
              //判断是否配置了合并查询
              if ($('.search-query').length > 0) {
                params = this.getConditionQuery()
              } else {
                params = this.getQueryFilter()
              }
            }
            if (
              params.pagination &&
              params.pagination &&
              params.pagination.querys
            ) {
              let tempQueryS = []
              let betweenConditions = {}
              params.pagination.querys.forEach((q) => {
                if (
                  q.value &&
                  (q.operation != 'BETWEEN' || q.value.constructor == Array)
                ) {
                  tempQueryS.push(q)
                } else if (q.value) {
                  let conditions = q
                  if (betweenConditions[q.property]) {
                    conditions = betweenConditions[q.property]
                    conditions.value = [conditions.value]
                    conditions.value.push(q.value)
                  }
                  betweenConditions[q.property] = conditions
                }
              })
              for (const key in betweenConditions) {
                tempQueryS.push(betweenConditions[key])
              }
              params.pagination.querys = tempQueryS
            }
            //数据视图控件
            if (this.dataView) {
              if (
                this.dataView.bindSelectd &&
                this.dataView.bindSelectd != ''
              ) {
                params.selectField = this.dataView.bindSelectd
                params.selectValue = this.dataView.selectValue
              }
            }
            const this_ = this
            if ($.isEmptyObject(this.searchForm)) {
              this.$store
                .dispatch('form/getBpmTemplateByPagination', params)
                .then((response) => {
                  this_.rows = response.data.rows
                  this_.total = response.data.total
                  this_.pagination.page = response.data.page
                  this_.pagination.pageSize = response.data.pageSize
                  loading.close()
                })
            } else {
              this.$store
                .dispatch('form/getBpmTemplateByPagination', params)
                .then((response) => {
                  this_.rows = response.data.rows
                  this_.total = response.data.total
                  this_.pagination.page = response.data.page
                  this_.pagination.pageSize = response.data.pageSize
                  loading.close()
                })
            }
          },
          getQueryFilter() {
            let operationMap = this.getSearchItems()
            let querys = [] //查询条件
            let queryFilter = {}
            let pageBean = {pageBean: this.pagination}
            let params = {templateId: this.templateInfo.id}
            params.pagination = pageBean
            if ($.isEmptyObject(this.searchForm)) {
              return params
            } else {
              for (let key in this.searchForm) {
                if (
                  typeof this.searchForm[key] != 'undefined' &&
                  this.searchForm[key] != ''
                ) {
                  if (this.searchForm[key] instanceof Array) {
                    for (let i = 0; i < this.searchForm[key].length; i++) {
                      querys.push({
                        property: key,
                        value: this.searchForm[key][i],
                        group: 'main',
                        operation: operationMap[key],
                        relation: 'AND',
                      })
                    }
                  } else if (this.searchForm[key].includes(',')) {
                    let arr = this.searchForm[key].split(',')
                    arr.forEach((v) => {
                      querys.push({
                        property: key,
                        value: v,
                        group: 'main',
                        operation: operationMap[key],
                        relation: 'AND',
                      })
                    })
                  } else {
                    querys.push({
                      property: key,
                      value: this.searchForm[key],
                      group: 'main',
                      operation: operationMap[key],
                      relation: 'AND',
                    })
                  }
                }
              }
              // 将过滤条件添加查询参数数组中
              if (this.filters && Object.keys(this.filters).length > 0) {
                Object.keys(this.filters).forEach((k) => {
                  const filter = this.filters[k]
                  let query = {
                    property: 'F_' + k,
                    value: filter[0],
                    group: 'filter',
                    relation: 'AND',
                  }
                  if (filter.length == 1) {
                    query.operation = 'EQUAL'
                    querys.push(query)
                  } else if (filter.length > 1) {
                    query.operation = 'IN'
                    query.value = filter
                    querys.push(query)
                  }
                })
              }
              queryFilter = {pageBean: this.pagination, querys}
              params.pagination = queryFilter
              return params
            }
          },
          getSearchItems() {
            let searchItems = $('.search-item')
            let operationMap = {}
            let operationType = {
              like: 'LIKE',
              equal: 'EQUAL',
              between: 'BETWEEN',
              left_like: 'LEFT_LIKE',
              right_like: 'RIGHT_LIKE',
            }
            if (searchItems) {
              for (let i = 0; i < searchItems.length; i++) {
                let operation = '='
                if (typeof $(searchItems[i]).attr('ht-query') != 'undefined') {
                  operation = $(searchItems[i]).attr('operation')
                  operationMap[$(searchItems[i]).attr('ht-query')] =
                    typeof operationType[operation] != 'undefined'
                      ? operationType[operation]
                      : operation
                } else if (
                  typeof $(searchItems[i]).children().attr('ht-query') !=
                  'undefined'
                ) {
                  operation = $(searchItems[i]).children().attr('operation')
                  operationMap[$(searchItems[i]).children().attr('ht-query')] =
                    typeof operationType[operation] != 'undefined'
                      ? operationType[operation]
                      : operation
                }
              }
            }
            return operationMap
          },
          getConditionQuery() {
            let searchAll = $('.search-query')
            let values = ''
            let querys = [] //查询条件
            let queryFilter = {}
            let pageBean = {pageBean: this.pagination}
            let params = {templateId: this.templateInfo.id}
            params.pagination = pageBean
            if (this.queryForm.queryData == '') {
              return params
            } else {
              if (
                typeof $($(searchAll[0]).children()[0]).attr(
                  'ht-quick-search'
                ) != 'undefined'
              ) {
                values = $($(searchAll[0]).children()[0]).attr(
                  'ht-quick-search'
                )
                let arr = values.split(',')
                for (let value of arr) {
                  querys.push({
                    property: value,
                    value: this.queryForm.queryData,
                    group: 'main',
                    operation: 'LIKE',
                    relation: 'OR',
                  })
                }
              }
            }
            queryFilter = {pageBean: this.pagination, querys}
            params.pagination = queryFilter
            return params
          },
          //打开高级检索
          advanced() {
            this.formType = !this.formType
            if (this.formType) {
              this.incons = 'el-icon-arrow-up'
              this.queryForm.queryData = ''
            } else {
              this.incons = 'el-icon-arrow-down'
              this.searchForm = {}
            }
          },
          //回车查询
          searchEnterFun: function (e) {
            let keyCode = window.event ? e.keyCode : e.which
            if (keyCode == 13) {
              this.search('find')
            }
          },
          reset() {
            this.queryForm.queryData = ''
            if (this.templateInfo.conditionField) {
              let conditionField = utils.parseToJson(
                this.templateInfo.conditionField
              )
              for (let i = 0; i < conditionField.length; i++) {
                let fieldName = 'F_' + conditionField[i].name
                this.$set(this.searchForm, fieldName, '')
              }
            }
            this.search('find')
          },
          handleSelectionChange(val) {
            this.tableData.selectRows = val
          },
          deleted() {
            if (
              this.tableData.selectRows == null ||
              this.tableData.selectRows.length == 0
            ) {
              Notify({type: 'warning', message: '请选择文件删除'})
              return false
            }

            Dialog.confirm({
              title: '提示',
              message: '此操作将删除该数据, 是否继续?',
            })
              .then(() => {
                let s = ''
                for (let i = 0; i < this.tableData.selectRows.length; i++) {
                  s +=
                    this.tableData.selectRows[i][this.templateInfo.pkField] +
                    ','
                }
                s = s.substring(0, s.length - 1)
                let data = {ids: s, boAlias: this.templateInfo.boDefAlias}
                this.$store
                  .dispatch('form/deleteTemplateDataById', data)
                  .then(() => {
                    this.search()
                  })
              })
              .catch(() => {})
          },
          del(id) {
            Dialog.confirm({
              title: '提示',
              message: '此操作将删除该数据, 是否继续?',
            })
              .then(() => {
                let data = {ids: id, boAlias: this.templateInfo.boDefAlias}
                this.$store
                  .dispatch('form/deleteTemplateDataById', data)
                  .then(() => {
                    this.search()
                  })
              })
              .catch(() => {})
          },
          operating(templateId, id, action, defId, isStartFlow, openType) {
            if (!this.templateInfo.mobileFormAlias) {
              Notify({
                type: 'danger',
                message: '该报表未绑定手机表单！',
              })
              return
            }
            //isStartFlow （false：可以发起流程，true：不可以发起流程）
            if (this.templateInfo.manageField && !isStartFlow) {
              //先配置不能发起流程
              if (action == 'add' && isStartFlow == '') {
                isStartFlow = true
              }
              if (action == 'edit' && isStartFlow === false) {
                isStartFlow = true
              }
              //再判断是否可以发起流程
              let manageField = JSON.parse(this.templateInfo.manageField)
              //判断是否配置了发起流程按钮
              for (let k = 0; k < manageField.length; k++) {
                if (action == 'add' && manageField[k].name == 'startFlow') {
                  isStartFlow = false
                  break
                } else if (
                  action == 'edit' &&
                  manageField[k].name == 'startFlow'
                ) {
                  isStartFlow = false
                  break
                }
              }
            }
            if (!templateId) {
              templateId = this.templateInfo.id
              action = action == 'select' ? 'get' : 'add'
            }
            var url = '/template/form/' + this.templateKey + '/' + action
            if (this.single == 'true') {
              url =
                '/template/form/' + this.templateKey + '/' + action + '/true'
            }
            if (id) {
              url = url + '?id=' + id + '&'
            } else {
              url += '?'
            }
            let startFlowStr = 'startFlow=false'
            if (action == 'add' && defId && isStartFlow === false) {
              startFlowStr = 'startFlow=true'
            } else if (id && isStartFlow === false && defId) {
              startFlowStr = 'startFlow=true'
            }
            let dataUrl = ''
            if (this.dataView) {
              if (this.dataView.bindSelectd) {
                let value = ''
                if (this.dataView.fillValue) {
                  value = this.dataView.fillValue
                }
                dataUrl =
                  '&fillField=' +
                  this.dataView.bindSelectd +
                  '&fillValue=' +
                  value
              }
            }
            let path = url + startFlowStr
            if (dataUrl != '') {
              path = url + startFlowStr + dataUrl
            }
            this.$router.push(path)
          },
          openUrl(url, type, row, fieldName) {
            if (row && fieldName) {
              url = this.handledUrlParams(url, row, fieldName)
            }
            if (type == 'new') {
              window.open(url, '_blank')
            } else {
              window.location.href = url
            }
          },
          handledUrlParams(url, row, fieldName) {
            if (this.templateInfo.displayField) {
              let displayFields = JSON.parse(this.templateInfo.displayField)
              displayFields.forEach((display) => {
                if (display.name == fieldName) {
                  if (display.urlParams && display.urlParams.length > 0) {
                    let urlParams = display.urlParams
                    let suffix = ''
                    urlParams.forEach((param) => {
                      if (suffix) {
                        suffix += '&'
                      }
                      suffix = suffix + param.name + '=' + row[param.field]
                    })
                    if (suffix) {
                      if (url.indexOf('?') != -1) {
                        url = url + '&' + suffix
                      } else {
                        url = url + '?' + suffix
                      }
                      return url
                    }
                  }
                  return url
                }
              })
            }
            return url
          },
          viewReport(data, jsonStr, openType) {
            let item = JSON.parse(Base64.decode(jsonStr))
            let conditionField = item.conditionField
            let querys = []
            if (conditionField && conditionField.length > 0) {
              conditionField.forEach((obj) => {
                if (obj.parameter) {
                  querys.push({
                    property: obj.key,
                    value: data[obj.parameter],
                    group: 'main',
                    operation: obj.qt,
                    relation: 'AND',
                  })
                }
              })
            }
            //数据随机添加到其他菜单下面时获取当前菜单的别名
            if (sessionStorage.menu_alias) {
              this.alias_new = sessionStorage.menu_alias
            }
            var url =
              '/' +
              this.alias_new +
              '/template/preview/' +
              item.alias +
              '/false/' +
              encodeURIComponent(Base64.encode(JSON.stringify(querys)))
            //url 转码防止有斜杠 导致路由跳转不对
            if (openType == 'new') {
              window.open(this.$router.resolve(url).href, '_blank')
            } else {
              this.$router.push(url)
            }
          },
          startFlow(id) {
            let data = {
              defKey: this.templateInfo.defId,
              businessKey: id,
              boAlias: this.templateInfo.boDefAlias,
            }
            let loadingInstance = Loading.service({fullscreen: true}) //开始
            this.$store
              .dispatch('storeProcess/startForm', data)
              .then((result) => {
                loadingInstance.close() // 结束
                if (result.state) {
                  Notify({type: 'success', message: result.message})
                  this.search()
                } else {
                  this.disabled = false
                  Notify({type: 'error', message: result.message})
                }
              })
          },
          //点击导出按钮
          exports() {
            this.exportType = 'main'
            this.displayFields = []
            if (this.templateInfo.displayField) {
              let displayField = JSON.parse(this.templateInfo.displayField)
              displayField.forEach((item) => {
                if (item.type) {
                  this.displayFields.push(item)
                }
              })
            }
            this.subDisplayFieldsList = [...this.subDisplayFields]
            this.dialogExportVisible = true
          },
          importCommand(params) {
            switch (params.command) {
              case 'downloadTempFile':
                this.downloadMainTempFile()
                break
              case 'importMain':
                this.importMain()
                break
              default:
                break
            }
          },
          downloadMainTempFile() {
            let loadingInstance = Loading.service({fullscreen: true}) //开始
            this.$store
              .dispatch('form/downloadMainTempFile', this.templateInfo.alias)
              .then(() => {
                loadingInstance.close() // 结束
              })
              .catch((c) => {
                loadingInstance.close()
              })
          },
          importMain(param) {
            let formData = new FormData()
            formData.append('file', param.file)
            let params = {
              data: formData,
              alias: this.templateInfo.alias,
            }
            let loadingInstance = Loading.service({fullscreen: true}) //开始
            form.mainImport(params, (data) => {
              loadingInstance.close() // 结束
              if (data.state) {
                Notify({type: 'success', message: data.message})
                param.onSuccess()
                this.search()
              } else {
                Notify({type: 'error', message: data.message})
                param.onError()
              }
            })
          },
          //显示子表对话框
          showSubList(refId) {
            this.refId = refId
            this.getSubEntsByFormKey(refId)
          },
          //显示修改记录
          openRecordList(refId) {
            this.dialogRecordVisible = true
            this.recordRefId = refId
            let param = {
              pageBean: {page: 1, pageSize: 10, showTotal: true},
              sorter: [{direction: 'ASC', property: 'modifyTime'}],
              querys: [
                {
                  property: 'ref_id_',
                  value: this.recordRefId,
                  group: 'main',
                  operation: 'EQUAL',
                  relation: 'AND',
                },
              ],
            }
            this.recordTableLoading = true
            let url = '${bpmRunTime}/bpm/boDataModifyRecord/v1/listJson'
            req.post(url, param).then((resp) => {
              this.recordTableLoading = false
              this.recordList = resp.data.rows
              this.modifyRecord.pagination.pageBean = {
                pageSize: resp.data.pageSize,
                page: resp.data.page,
                total: resp.data.total,
              }
            })
          },
          handleRecordCurrentChange(index, modifyRecord) {
            modifyRecord.pagination.pageBean.page = index
            let param = {
              pageBean: modifyRecord.pagination.pageBean,
              sorter: [{direction: 'ASC', property: 'modifyTime'}],
              querys: [
                {
                  property: 'ref_id_',
                  value: this.recordRefId,
                  group: 'main',
                  operation: 'EQUAL',
                  relation: 'AND',
                },
              ],
            }
            this.recordTableLoading = true
            let url = '${bpmRunTime}/bpm/boDataModifyRecord/v1/listJson'
            req.post(url, param).then((resp) => {
              this.recordTableLoading = false
              this.recordList = resp.data.rows
              this.modifyRecord.pagination.pageBean = {
                pageSize: resp.data.pageSize,
                page: resp.data.page,
                total: resp.data.total,
              }
            })
          },
          //取消修改记录对话框
          recordCancel() {
            this.dialogRecordVisible = false
            this.recordList = []
            this.recordRefId = ''
            this.modifyRecord = {
              pagination: {
                pageBean: {
                  page: 1,
                  pageSize: 10,
                  total: 0,
                },
              },
            }
          },
          //
          openModifyDetail(row) {
            this.currentModify = row
            this.modifyDetailDialogVisible = true
          },
          //查看修改记录详情
          showModifyRecord(id, refId) {
            var url =
              '/statement/template/form/' +
              this.templateKey +
              '/get/true' +
              '?id=' +
              refId +
              '&startFlow=false&recordId=' +
              id +
              '&isNewPage=true'
            window.open(this.$router.resolve(url).href, '_blank')
          },
          //确定导出
          submitExport() {
            if (!this.exportData || this.exportData.expField.length < 1) {
              Notify({type: 'warning', message: '请选择要导出的字段'})
              return
            }

            if (this.exportType === 'main') this.exportMain()
            else
              this.exportSubData(
                this.exportData.expField,
                this.refId,
                this.currentTab.entName
              )
          },
          exportMain() {
            let expField = ''
            for (let i = 0; i < this.exportData.expField.length; i++) {
              if (i > 0) {
                expField += ','
              }
              expField += this.exportData.expField[i].name
            }
            expField = Base64.encode(expField)

            let data = {
              boAlias: this.templateInfo.alias,
              getType: this.exportData.getType,
              expField: expField,
              filterKey: '',
            }
            data.query = this.getQueryFilter().pagination
            let loadingInstance = Loading.service({fullscreen: true}) //开始
            this.$store.dispatch('form/templateExport', data).then(() => {
              loadingInstance.close() // 结束
              this.dialogExportVisible = false
            })
            for (let i = 0; i < this.subDisplayFieldsList.length; i++) {
              this.exportSubData(
                this.$refs['subExportTable'][i].selection,
                '',
                this.subDisplayFieldsList[i].name
              )
              this.$set(this.$refs['subExportTable'][i], 'selection', [])
            }
          },
          exportSubData(expFields, refId, alias) {
            let expField = []
            for (let i = 0; i < expFields.length; i++) {
              expField.push({
                key: expFields[i].name,
                value: expFields[i].desc,
              })
            }
            let data = {
              alias: alias,
              refId: refId,
              type: this.exportData.getType,
              expField: JSON.stringify(expField),
              filterKey: '',
            }
            data.queryFilter = this.currentTab.pagination
            let loadingInstance = Loading.service({fullscreen: true})
            form.subExport(data, (resp) => {
              loadingInstance.close()
              this.dialogExportVisible = false
            })
          },
          //取消导出
          exportCancel() {
            this.dialogExportVisible = false
            this.exportData.expField = []
          },
          //取消子表对话框
          subCancel() {
            this.dialogSubVisible = false
            this.tabs = []
            this.ents = []
          },
          sunCancel() {
            this.dialogSunVisible = false
            this.sunTabs = []
          },
          handleExportSelectionChange(val) {
            this.exportData.expField = []
            if (val) {
              this.exportData.expField = val
            }
          },
          //全选
          handleExportSelectAll() {
            this.exportData.expField = this.displayFields
          },
          //排序
          sort(index, type) {
            if ('up' == type) {
              if (index === 0) {
                Notify({type: 'warning', message: '已经是列表中第一位'})
              } else {
                let temp = this.displayFields[index - 1]
                this.$set(
                  this.displayFields,
                  index - 1,
                  this.displayFields[index]
                )
                this.$set(this.displayFields, index, temp)
              }
            } else {
              if (index === this.displayFields.length - 1) {
                Notify({type: 'warning', message: '已经是列表中最后一位'})
              } else {
                this.isTransition = true
                let i = this.displayFields[index + 1]
                this.$set(
                  this.displayFields,
                  index + 1,
                  this.displayFields[index]
                )
                this.$set(this.displayFields, index, i)
              }
            }
          },
          async getSunData(tab, row) {
            let ents = tab.childEnts
            let pk = tab.pkKey
            let refId = ''
            if (row[pk.toLocaleLowerCase()]) {
              refId = row[pk.toLocaleLowerCase()]
            } else {
              refId = row[pk.toUpperCase()]
            }
            this.subTableLoading = true
            if (ents && ents.length > 0) {
              for (let i = 0; i < ents.length; i++) {
                let tab = await this.getBoData(ents[i], refId)
                this.sunTabs.push(tab)
              }
            }
            this.subTableLoading = false
            this.dialogSunVisible = true
          },
          getBoData(ent, refId) {
            let attributeList = ent.attributeList
            let tab = {
              refId: refId,
              pkKey: ent.pkKey,
              name: ent.tableName,
              entName: ent.name,
              title: ent.comment,
              attributeList: attributeList,
              comment: ent.comment,
              pagination: {
                pageBean: {
                  pageSize: 10,
                  page: 1,
                  total: 0,
                },
              },
            }
            tab.childEnts = []
            if (ent.showChildEntList && ent.showChildEntList.length > 0) {
              tab.childEnts = ent.showChildEntList
            }
            return new Promise((resolve, reject) => {
              this.$store
                .dispatch('form/getSubDataPagination', {
                  pagination: tab.pagination,
                  name: ent.name,
                  refId: refId,
                })
                .then((data) => {
                  if (data && data.rows.length > 0) {
                    tab.dataList = data.rows
                    tab.pagination.pageBean.pageSize = data.pageSize
                    tab.pagination.pageBean.page = data.page
                    tab.pagination.pageBean.total = data.total
                  } else {
                    tab.dataList = []
                    tab.pagination.pageBean.pageSize = 1
                    tab.pagination.pageBean.page = 1
                    tab.pagination.pageBean.total = 0
                  }
                  resolve(tab)
                })
            })
          },

          getSubEntsByFormKey(refId) {
            if (!this.ents || this.ents.length < 1) {
              form.getSubEntsByFormKey(this.templateInfo.formKey, (resp) => {
                // 子表与孙表字段名设置小写
                for (let i = 0; i < resp.data.length; i++) {
                  resp.data[i].attributeList.forEach((attribute) => {
                    attribute.fieldName = attribute.fieldName.toLowerCase()
                  })
                  resp.data[i].showChildEntList.forEach((showChildEnt) => {
                    showChildEnt.attributeList.forEach((attribute) => {
                      attribute.fieldName = attribute.fieldName.toLowerCase()
                    })
                  })
                }
                this.ents = resp.data
              })
            } else {
              this.getSubData(this, refId)
            }
          },
          async getSubData(_me, refId) {
            let ents = this.ents
            if (ents && ents.length > 0) {
              for (let i = 0; i < ents.length; i++) {
                let tab = await this.getBoData(ents[i], refId)
                this.tabs.push(tab)
              }
            }
            this.dialogSubVisible = true
          },
          nodeClick(node) {
            const loading = this.$loading(this.options)
            this.$store.dispatch('form/setBpmTemplatePaginationPageNum', 1)

            let pageBean = {pageBean: this.pagination}
            pageBean.querys = []
            if (!node.id || node.id != -1) {
              let treeField = JSON.parse(this.templateInfo.treeField)
              treeField.querys.forEach((item) => {
                if (item.key_ && item.value_) {
                  pageBean.querys.push({
                    property: 'F_' + item.key_,
                    value: node[item.value_],
                    group: 'main',
                    operation: 'EQUAL',
                    relation: 'AND',
                  })
                }
              })
            }

            let params = {
              templateId: this.templateInfo.id,
              pagination: pageBean,
            }

            //数据视图控件
            if (this.dataView) {
              if (
                this.dataView.bindSelectd &&
                this.dataView.bindSelectd != ''
              ) {
                params.selectField = this.dataView.bindSelectd
                params.selectValue = this.dataView.selectValue
              }
            }
            const this_ = this
            this.$store
              .dispatch('form/getBpmTemplateByPagination', params)
              .then((response) => {
                this_.rows = response.data.rows
                this_.total = response.data.total
                this_.pagination.page = response.data.page
                this_.pagination.pageSize = response.data.pageSize
                loading.close()
              })
          },
          //加载树的信息
          toTreeData(data, id, pid, name, pvalue) {
            // 建立个树形结构,需要定义个最顶层的父节点，pvalue是0
            let parents = data.filter(
              (value) =>
                value[id] == value[pid] ||
                value[pid] == null ||
                value[pid] == pvalue
            )
            if (!parents) {
              parents = data.filter(
                (value) =>
                  value[pid] !== 'undefined' &&
                  value[pid] != null &&
                  value[id] != value[pid]
              )
            }
            return parents
          },
          //初始化树
          initTree(treeField) {
            //ccwgq 2021-12-01  别名为空会报错，禁止报错
            if (treeField.alias === '') return
            const this_ = this
            form.getByAlias(treeField.alias, (res) => {
              this_.customDialog = res
              dialog.getTreeData(
                {
                  requestType: 'GET',
                  url:
                    '${bpmModel}/form/customDialog/v1/getTreeData?alias=' +
                    treeField.alias +
                    '&mapParam=',
                },
                (resp) => {
                  if (this_.customDialog.displayfield) {
                    let displayfield = JSON.parse(
                      this_.customDialog.displayfield
                    )
                    this_.displayField = displayfield
                    this_.treeList = resp.data
                    let head = {}
                    head[displayfield.displayName] = '全部'
                    head.id = -1
                    this_.tree.push(head)
                  }
                }
              )
            })
          },
          loadTree(node, resolve) {
            if (node) {
              if (node.data.id === -1) {
                let tree = this.toTreeData(
                  this.treeList,
                  this.displayField.id,
                  this.displayField.pid,
                  this.displayField.displayName,
                  this.displayField.pvalue ? this.displayField.pvalue : '0'
                )
                resolve(tree)
              } else {
                resolve(
                  this.treeList.filter(
                    (value) =>
                      value[this.displayField.pid] ===
                      node.data[this.displayField.id]
                  )
                )
              }
            } else {
              resolve([])
            }
          },
          handleSubCurrentChange(index, tab) {
            tab.pagination.pageBean.page = index
            this.subTableLoading = true
            this.$store
              .dispatch('form/getSubDataPagination', {
                pagination: tab.pagination,
                name: tab.entName,
                refId: tab.refId,
              })
              .then((resp) => {
                tab.pagination.pageBean = {
                  pageSize: resp.pageSize,
                  page: resp.page,
                  total: resp.total,
                }
                tab.dataList = resp.rows
              })
              .finally(() => {
                this.subTableLoading = false
              })
          },
          querySubTable(tab, value) {
            tab.pagination.querys = []
            if (value) {
              tab.attributeList.forEach((item) => {
                tab.pagination.querys.push({
                  property: item.fieldName,
                  value: value,
                  group: 'other',
                  operation: 'LIKE',
                  relation: 'OR',
                })
              })
            }
            this.handleSubCurrentChange(1, tab)
          },
          importSub(param) {
            let formData = new FormData()
            formData.append('file', param.file)
            let params = {
              data: formData,
              alias: this.currentTab.entName,
              refId: this.refId,
            }
            form.subImport(params, (data) => {
              if (data.state) {
                Notify({type: 'success', message: data.message})
                param.onSuccess()
                this.handleSubCurrentChange(1, this.currentTab)
              } else {
                Notify({type: 'error', message: data.message})
                param.onError()
              }
            })
          },
          exportSub(tab) {
            this.exportType = 'sub'
            this.currentTab = tab
            this.displayFields = []
            this.subDisplayFieldsList = []
            tab.attributeList.forEach((item) => {
              this.displayFields.push({
                desc: item.comment,
                name: item.fieldName,
                type: item.columnType,
              })
            })
            this.dialogExportVisible = true
          },
          importButton(tab) {
            this.currentTab = tab
          },
          myDraftList() {
            let url =
              '/statement/draftList?tempAlias=' + this.templateInfo.alias
            const {href} = this.$router.resolve({
              path: url,
            })
            window.open(href, '_blank')
          },
          getColor(data, row) {
            let resuColor = 'color:black'
            let decode = Base64.decode(data)
            /*decode=decode.replace(/\s*!/g,"");*/
            let colorRule = JSON.parse(decode)
            if (colorRule && colorRule instanceof Array) {
              colorRule.forEach((rule) => {
                let Fn = Function('data', rule.proRule)
                if (Fn(row)) {
                  resuColor = 'color:' + rule.proColor
                }
              })
            }
            return resuColor
          },
          onConfirm(data) {
            let defaultValueList = []
            for (var key in data) {
              defaultValueList.push({key: key, value: data[key]})
            }
            let boData = this.defaultValueList.concat(defaultValueList)
            this.updateBo(boData)
          },
          display(mpDisplay) {
            if (mpDisplay === '1') {
              return true
            } else {
              return false
            }
          },
          summary(method, field, decimal) {
            let list = this.rows
              .filter((item) => item[field] !== undefined && item[field] !== '')
              .map((item) => new Number(item[field]))
            if (!list || list.length == 0) {
              return
            }
            if (method === 'count') {
              return list.length
            } else if (method === 'sum') {
              return list.reduce((a, b) => a + b).toFixed(decimal)
            } else if (method === 'min') {
              return Math.min(...list).toFixed(decimal)
            } else if (method === 'max') {
              return Math.max(...list).toFixed(decimal)
            } else if (method === 'avg') {
              return (list.reduce((a, b) => a + b) / list.length).toFixed(
                decimal
              )
            }
          },
          getFixed(fixed) {
            return false
          },
          handleSortChange(column) {},
          handleFilterChange(m) {
            this.filters = {...this.filters, ...m}
            Object.keys(this.filters).forEach((k) => {
              if (!this.filters[k] || this.filters[k].length == 0) {
                delete this.filters[k]
              }
            })
            this.search()
          },
          isSortable(field) {
            return !this.notSortableFields.includes(field)
          },
          showSearchPane() {
            let conditions = JSON.parse(this.templateInfo.conditionField)
            for (let i = 0; i < conditions.length; i++) {
              if (conditions[i].mpDisplay == 1) {
                return true
              }
            }
            return false
          },
          buildDefaultQuerys() {
            // debugger;
            let this_ = this
            let querys = []
            let conditions = JSON.parse(this_.templateInfo.conditionField)
            let prefix = this.templateInfo.isExternal == 1 ? '' : 'F_'
            //条件字段默认值判断
            conditions.forEach((condition) => {
              if (condition.defaultValue) {
                let field = condition.colPrefix + condition.na
                this_.$set(this_.searchForm, field, condition.defaultValue)
                let value = condition.defaultValue
                if (condition.ty == 'number') {
                  value = parseFloat(value)
                }
                querys.push({
                  property: field,
                  value: value,
                  group: 'main',
                  operation: condition.qt.toUpperCase(),
                  relation: 'AND',
                })
              }
            })
            //筛选字段默认值判断

            let filters = JSON.parse(this_.templateInfo.filteringField)
            filters.forEach((filter) => {
              if (filter.defaultValue && filter.defaultValue.length > 0) {
                this_.filterMap[filter.name] = filter.defaultValue
                filter.defaultValue.forEach((val) => {
                  querys.push({
                    property: prefix + filter.name,
                    value: val,
                    group: 'defVal_' + filter.name,
                    operation: 'EQUAL',
                    relation: 'OR',
                  })
                })
              }
            })
            this_.$on('afterMounted', () => {
              let headerColumns =
                this_.$refs.multipleTemplateTable.$refs.tableHeader.columns
              headerColumns.forEach((column) => {
                if (this_.filterMap.hasOwnProperty(column.property)) {
                  this_.filterMap[column.property].forEach((val) => {
                    column.filteredValue.push(val)
                  })
                }
              })
            })
            return querys
          },
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
/deep/ th.todo-header-row {
  background-color: #fafafa;
  font-size: 13px;
}

/deep/ tr.todo-row {
  font-size: 13px;
  color: $--color-text-regular;
}

.el-container {
  background-color: #fff;
}

.el-row {
  margin-bottom: 20px;
}

.el-header {
  border-bottom: 1.5px solid #ededed;
}
/deep/ .el-main {
  padding: 10px !important;
}
.i {
  margin-right: 4px;
}

.todo-subject {
  cursor: pointer;
}

.todo-subject:hover {
  color: $--theme-color;
}

/deep/ .el-dialog__body {
  padding: 15px 10px;
}

/deep/ .el-checkbox {
  margin-left: 15px;
}

/deep/ .el-radio {
  margin-left: 15px;
}

/deep/ .el-button {
  margin-left: 0px;
}
/deep/ .el-col .el-button {
  margin-left: 0px;
  margin-bottom: 5px;
}

/deep/.el-aside {
  border-right: #e2e3e4 1px solid;
}

/deep/.el-scrollbar__wrap {
  overflow-x: hidden;
  padding: 23px 10px;
}

/deep/.el-scrollbar {
  height: 860px;
  width: 98%;
}

/deep/.el-input-group {
  margin-bottom: 10px;
  width: 50%;
}
</style>
