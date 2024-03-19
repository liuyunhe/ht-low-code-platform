<template>
  <div v-if="showDateView" class="data_view">
    <h3 style="padding-left: 20px; font-size: 14px" class="data_view__title">
      {{ templateInfo.name }}
    </h3>
    <ht-dataview-runtime-template
      :key="refreshTime"
      :templateKey="templateKey"
      :html="html"
      :templateInfo="templateInfo"
      :single="single"
      :taskType="taskType"
      :isJoinFlow="isJoinFlow"
      :defKey="defKey"
      :dataView="dataView"
      class="data-preview-wrap"
      :parameterqQuerys="parameterqQuerys"
    />
  </div>
</template>

<script>
import {Loading} from 'element-ui'
//ccwgq 2022-06-17 组件引入方式改成异步模式
const HtCheckbox = () => import('@/components/control/HtCheckbox.vue')
const HtDialog = () => import('@/components/control/HtDialog.vue')
const HtDialogBtn = () => import('@/components/control/htDialogBtn.vue')
const EipSelect = () => import('@/components/eipControl/EipSelect.vue')
// import HtCheckbox from '@/components/control/HtCheckbox.vue'
// import HtDialog from '@/components/control/HtDialog.vue'
// import HtDialogBtn from '@/components/control/htDialogBtn.vue'
// import EipSelect from '@/components/eipControl/EipSelect.vue'
import VRuntimeTemplate from 'v-runtime-template'
import utils from '@/utils.js'
import {Base64} from 'js-base64'
import Vue from 'vue'
import QRCode from 'qrcode'
import req from '@/request.js'
import form from '@/api/form.js'
import dialog from '@/api/dialogApi.js'
const TemplateBatchUpdateDialog = () =>
  import('@/components/dialog/TemplateBatchUpdateDialog.vue')
export default {
  name: 'template-dynamic-view',
  props: {
    templateKey: String,
    html: String,
    templateInfo: Object,
    parameterqQuerys: String,
    single: {
      default: 'true'
    },
    defKey: String,
    taskType: {
      default: ''
    },
    dataView: Object,
    isJoinFlow: {
      default: false
    }
  },
  data() {
    return {
      refreshTime: new Date().getTime(),
      showDateView: true,
      spanArr:[]
    }
  },
  created() {
    this.init()
    let formKey = this.$route.query.formKey
    let formValue = this.$route.query.value
    this.formKey = formKey
    this.formValue = formValue
  },
  watch: {
    html: function(newVal) {
      if (newVal) {
        this.init()
      }
    }
  },
  methods: {
    init() {
      Vue.component('ht-dataview-runtime-template', {
        template: this.html,
        props: {
          templateKey: String,
          templateInfo: Object,
          single: String,
          defKey: String,
          taskType: {
            default: ''
          },
          dataView: Object,
          isJoinFlow: {
            default: false
          },
          parameterqQuerys: String
        },
        data() {
          return {
            treeQuerys: [],
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
              queryData: ''
            },
            formType: false,
            labelPosition: 'left',
            incons: 'el-icon-arrow-down',
            options: {
              fullscreen: true,
              lock: true
            },
            rowTemplateId: null,
            rowId: null,
            QRCodeShow: true,
            QRCodeDesc: [],
            tree: [],
            customDialog: [],
            tableHeight: 0.685 * window.innerHeight,
            dialogSubVisible: false,
            tabs: [],
            ents: [],
            modifyRecord: {
              pagination: {
                pageBean: {
                  page: 1,
                  pageSize: 10,
                  total: 0
                }
              }
            },
            recordList: [],
            recordRefId: '',
            dialogRecordVisible: false,
            recordTableLoading: false,
            modifyDetailDialogVisible: false,
            currentModify: {},
            refId: '',
            querySubValue: '',
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
              pageSize: 10
            },
            paginationLayout: 'total, sizes, prev, pager, next, jumper',
            total: 0,
            permission: {
              print: true,
              add: true,
              del: true,
              export: true,
              edit: true,
              hidden: false
            },
            showRightMenu: true,
            listSelectable: true,
            filters: {},
            sorter: null,
            dialogSunVisible: false, //孙表对话框
            sunTabs: [], //孙表数据
            querySunValue: '',
            operateColWidth: '240',
            summaryFields: [],
            dialogVisible: false,
            pageResult: {
              page: 1,
              pageSize: 20,
              total: 0
            },
            logData: [],
            notSortableFields: [
              'bpm_status_',
              'bpm_proc_inst_id_',
              'bpm_subject_',
              'bpm_proc_def_name_',
              'bpm_create_time_',
              'bpm_end_time_',
              'bpm_is_forbidden_',
              'bpm_creator_'
            ],
            defaultValueList: [], //批量更新数据
            ignoredAlias: ['appCenterFront'],
            QRCodePattern: true,
            QRCodeType: '',
            isMobile: false,
            activeNames: ['1'],
            switchMap: {},
            filterMap: {},
            formKey: '',
            formValue: ''
          }
        },
        components: {
          VRuntimeTemplate,
          HtCheckbox,
          HtDialog,
          HtDialogBtn,
          TemplateBatchUpdateDialog,
          EipSelect
        },
        watch: {
          ents: {
            handler: function(newVal, oldValue) {
              if (newVal && newVal.length >= 1 && newVal != oldValue) {
                this.getSubData(this, this.refId)
              }
            },
            deep: true,
            immediate: true
          },
          templateInfo: {
            handler: function(newVal, oldVal) {
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
                    showTotal: 'true'
                  }
                } //初次加载默认pageBean
                params.pagination = pageBean

                if (_me.isJoinFlow) {
                  params.isJoinFlow = true
                  params.taskType = _me.taskType
                  params.defKey = _me.defKey
                }

                if (_me.dataView) {
                  _me.handelBindFiledValua()
                  //关联查询字段
                  if (
                    _me.dataView.selectList &&
                    _me.dataView.selectList.length > 0
                  ) {
                    params.selectList = _me.dataView.selectList
                  }
                  params.refIdValue = _me.dataView.refIdValue
                }
                //lyzcw:2021-07-27 表单列表传入初始查询条件
                //ccwgq:2022-05-11 修复初始条件传入
                if (this.$route.query.parameterqQuerys) {
                  // debugger;
                  // console.log(decodeURIComponent(this.$route.query.parameterqQuerys))
                  // console.log("decode==>",Base64.decode(
                  //     decodeURIComponent(this.$route.query.parameterqQuerys)
                  //   ))
                  let decodeStr = Base64.decode(
                    decodeURIComponent(this.$route.query.parameterqQuerys)
                  )
                  // decodeStr=decodeStr.replace(/&#39;/g,"'").replace(/\s/g,"");
                  // console.log('decode===>', decodeStr)
                  var querys = JSON.parse(decodeStr)

                  // debugger;
                  params.pagination.querys = querys
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
                //如果有设置默认排序,优先使用默认排序
                if (this.templateInfo.sortField) {
                  let sortField = JSON.parse(this.templateInfo.sortField)
                  let sorter = []
                  for (let x = 0; x < sortField.length; x++) {
                    sorter.push({
                      property: sortField[x].name,
                      direction: sortField[x].sort
                    })
                  }
                  params.pagination.sorter = sorter
                }

                const this_ = this
                if (params.templateId) {
                  this.$store
                    .dispatch('form/getBpmTemplateByPagination', params)
                    .then(response => {
                      this_.rows = response.data.rows
                      if(this.templateKey=='lshywgx' || this.templateKey=='lawyer_divide_form'){
                        let keys = [] // 唯一值的数组
                        if(response.data.rows.length>0){     
                        response.data.rows.forEach((item, index) => {
                            if (!keys.includes(item.lawer_nm)) {
                              keys.push(item.lawer_nm)
                            }
                          })
                          console.log(keys)
                          let temp = []
                          keys.forEach(item => {
                            // 将同一名称的数据放在相邻位置
                            response.data.rows.forEach(cell => {
                              if (item == cell.lawer_nm) {
                                temp.push(cell)
                              }
                            })
                          })
                        //***************************************** */
                          this_.rows = temp
                          for (let i = 0; i < this_.rows.length; i++) {
                            this_.rows[i].num=i+1
                          }
                        }
                        this_.total = keys.length
                      }else{
                        this_.total = response.data.total
                      }
                      // console.log(response)
                      // this_.total = response.data.total
                      this_.pagination.page = response.data.page
                      this_.pagination.pageSize = response.data.pageSize
                      loading.close()
                      this_.initSwitchStatus()
                      if (this_.$el && this_.$el.querySelector) {
                        let topBtnDom = this_.$el.querySelector(
                          'div.top_btn_col'
                        )
                        if (
                          !topBtnDom ||
                          (!topBtnDom.querySelector('i.el-icon-delete') &&
                            !topBtnDom.querySelector('i.el-icon-edit') &&
                            !topBtnDom.querySelector('i.el-icon-s-grid'))
                        ) {
                          this_.listSelectable = false
                        }
                        setTimeout(function() {
                          let tdDom = this_.$el.querySelector('td.right_menu')
                          if (
                            !tdDom ||
                            (!tdDom.querySelector('button') &&
                              tdDom.querySelector('switch'))
                          ) {
                            this_.showRightMenu = false
                          }
                        }, 200)
                      }
                    })
                } else {
                  loading.close()
                }
                if (newVal.treeField && newVal.treeField !== '{}') {
                  let treeField = JSON.parse(newVal.treeField)
                  this.initTree(treeField)
                  form.getSubEntsByFormKey(this.templateInfo.formKey, resp => {
                    resp.data.forEach(item => {
                      let subDisplayFields = []
                      item.attributeList.forEach(attr => {
                        subDisplayFields.push({
                          desc: attr.comment,
                          name: attr.fieldName,
                          type: attr.columnType
                        })
                      })
                      this.subDisplayFields.push({
                        fields: subDisplayFields,
                        name: item.name,
                        comment: item.comment
                      })
                    })
                  })
                }
                if (newVal.summaryField) {
                  this.summaryFields = JSON.parse(newVal.summaryField)
                }
              }
            },
            deep: true,
            immediate: true
          },
          currentTabName: function(newVal) {
            if (newVal) {
              this.querySubValue = ''
            }
          }
        },
        computed: {
          showDraftList() {
            //如果当前页面被嵌入iframe里面不显示草稿
            return window.self === window.top
          }
        },
        mounted() {
          this.handelBindFiledValua()
          let this_ = this
          this.$root.$on('form-reload-success', function() {
            this_.handelBindFiledValua()
          })
          this.$emit('afterMounted')
        },
        methods: {
          init() {},
          loadData(param, cb) {
            let querys = param.querys || []
            let hasDefaultQuery = false
            this.handelBindFiledValua()
            let pID = this.dataView.refIdValue
            querys.forEach(q => {
              if (q.property == 'PId') {
                hasDefaultQuery = true
              }
            })
            if (!hasDefaultQuery) {
              querys.push({
                operation: 'EQUAL',
                group: 'defalut',
                property: 'PId',
                relation: 'AND',
                value: pID
              })
              querys.push({
                operation: 'EQUAL',
                group: 'defalut',
                property: 'boAlias',
                relation: 'AND',
                value: this.templateInfo.boDefAlias
              })
            }

            param.querys = querys
            req
              .post(
                window.context.form + '/form/formDataImportLog/v1/listJson',
                param
              )
              .then(data => {
                let response = data.data
                this.logData = response.rows
                this.pageResult = {
                  page: response.page,
                  pageSize: response.pageSize,
                  total: response.total
                }
              })
              .finally(() => cb())
          },
          handelBindFiledValua() {
            //数据视图控件
            let _me = this
            if (this.dataView) {
              const pInst = utils.getOnlineFormInstance(
                this.$parent.$parent.$parent.$parent
              )
              if (!pInst[this.dataView.boDefAlias]) {
                this.dataView.boDefAlias = Object.keys(pInst.data)[0]
              }
              let refIdValue = utils.getValueByPath(
                pInst,
                'data.' + this.dataView.boDefAlias + '.id_'
              )

              if (
                sessionStorage.getItem('formImportTempRefId') &&
                !refIdValue
              ) {
                refIdValue = sessionStorage.getItem('formImportTempRefId')
              } else if (!refIdValue) {
                //导入的时候没有关键的外键，则为其自动添加
                refIdValue = new Date().getTime()
                sessionStorage.setItem('formImportTempRefId', refIdValue)
              }
              _me.dataView.refIdValue = refIdValue

              if (
                pInst.permission &&
                pInst.permission.table &&
                pInst.permission.table[this.templateInfo.boDefAlias]
              ) {
                this.permission =
                  pInst.permission.table[this.templateInfo.boDefAlias]
              }
              if (this.permission.hidden) {
                this.$parent.showDateView = false
              }
              //关联查询字段
              let selectList = this.dataView.selectList
              if (selectList && selectList.length > 0) {
                for (var i = 0; i < selectList.length; i++) {
                  if (selectList[i].selectField) {
                    const path =
                      'data.' +
                      this.dataView.boDefAlias +
                      '.' +
                      selectList[i].selectField
                    const value = utils.getValueByPath(pInst, path)
                    selectList[i].selectValue = value

                    //添加监听
                    pInst.$watch(path, function(newVal, oldVal) {
                      // 监听中使用间隔请求，减少请求次数
                      clearTimeout(this.timeout)
                      this.timeout = setTimeout(() => {
                        if (newVal !== oldVal) {
                          //_me.setDataViewValue(_me.dataView);
                          _me.search()
                        }
                      }, 500)
                    })
                  }
                }
              }
              //关联填充字段
              let bindList = this.dataView.bindList
              if (bindList && bindList.length > 0) {
                for (var i = 0; i < bindList.length; i++) {
                  if (bindList[i].fillField) {
                    const path =
                      'data.' +
                      this.dataView.boDefAlias +
                      '.' +
                      bindList[i].fillField
                    const value = utils.getValueByPath(pInst, path)

                    bindList[i].fillValue = value
                    pInst.$watch(path, function(newVal, oldVal) {
                      // 监听中使用间隔请求，减少请求次数
                      clearTimeout(this.timeout)
                      this.timeout = setTimeout(() => {
                        if (newVal !== oldVal) {
                          //_me.setDataViewValue(_me.dataView);
                          _me.search()
                        }
                      }, 500)
                    })
                  }
                }
              }
            }
          },
          printList() {
            this.notPrint = true
            setTimeout(() => {
              document.body.innerHTML = document.getElementById(
                'printData'
              ).innerHTML
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
              action +
              '/true'
            if (id) {
              url = url + '?id=' + id + '&'
            } else {
              url += '?'
            }
            var startFlowStr = 'startFlow=false'
            let path = url + startFlowStr
            if (path.indexOf('othermenu') != -1) {
              path = path.replace('/othermenu', '/statement')
            }

            this.$router.push({
              path: path,
              query: {isPrint: true}
            })
          },
          complete(row, taskType) {
            if (taskType == 'todo') {
              var url =
                window.context.bpmRunTime +
                '/runtime/task/v1/getBpmTaskByInstId?instId=' +
                row.bpm_proc_inst_id_
              req.get(url).then(res => {
                if (res.data.length == 0) {
                  this.$message.error('此任务已被处理或不存在！')
                } else if (res.data.length == 1) {
                  this.$router.push(
                    '/reportModuleInst/' +
                      res.data[0].id +
                      '/0' +
                      '/' +
                      this.defKey +
                      '/true/' +
                      this.templateKey
                  )
                } else {
                  this.$message.error('暂不支持！')
                }
              })
            } else if (taskType == 'done') {
              this.$router.push(
                '/reportModuleInstDone/' +
                  row.bpm_proc_inst_id_ +
                  '/doneList/' +
                  this.defKey +
                  '/' +
                  this.templateKey
              )
            } else if (taskType == 'request') {
              this.$router.push(
                '/reportModuleInstDone/' +
                  row.bpm_proc_inst_id_ +
                  '/request/' +
                  this.defKey +
                  '/' +
                  this.templateKey
              )
            } else if (taskType == 'todoRead') {
              let pageBean = {page: 1, pageSize: 10, showTotal: 'true'}
              let status = row.bpm_status_
              req
                .post('${bpmRunTime}/runtime/task/v1/getNoticeTodoReadList', {
                  pageBean: pageBean,
                  querys: [
                    {
                      property: 'proc_inst_id_',
                      value: row.bpm_proc_inst_id_,
                      operation: 'EQUAL',
                      relation: 'AND'
                    }
                  ]
                })
                .then(response => {
                  if (response.data.rows && response.data.rows.length > 0) {
                    let id = response.data.rows[0].id
                    let url = ''
                    7
                    if (status == 'FOLLOW') {
                      url =
                        '/reportModuleInstTaskRead/' +
                        id +
                        '/FOLLOW/' +
                        this.defKey +
                        '/' +
                        this.templateKey
                    } else if (status == 'COMMU') {
                      url =
                        '/reportModuleInst/' +
                        id +
                        '/0/' +
                        this.defKey +
                        '/true/' +
                        this.templateKey
                    } else {
                      url =
                        '/reportModuleInstRead/' +
                        row.bpm_proc_inst_id_ +
                        '/read/' +
                        id +
                        '/' +
                        this.defKey +
                        '/' +
                        this.templateKey
                    }
                    this.$router.push(url)
                  }
                })
            } else if (taskType == 'doneRead') {
              let pageBean = {page: 1, pageSize: 10, showTotal: 'true'}
              // yigz:2022-08-31:入库公文修改：我发起的已归档的公文+别人发起我处理的已归档公文+别人发起我加签的已归档公文+别人发起我抄送的已归档公文
              req
                .post('${bpmRunTime}/runtime/instance/v1/getEndInstList', {
                  pageBean: pageBean,
                  querys: [
                    {
                      property: 'proc_inst_id_',
                      value: row.bpm_proc_inst_id_,
                      operation: 'EQUAL',
                      relation: 'AND'
                    }
                  ]
                })
                .then(response => {
                  if (response.data.rows && response.data.rows.length > 0) {
                    let id = response.data.rows[0].id
                    this.$router.push(
                      '/reportModuleInstDone/' +
                        row.bpm_proc_inst_id_ +
                        '/read/done/' +
                        id +
                        '/' +
                        this.defKey +
                        '/' +
                        this.templateKey
                    )
                  }
                })
            } else if (taskType == 'myRead') {
              let pageBean = {page: 1, pageSize: 10, showTotal: 'true'}
              req
                .post('${bpmRunTime}/runtime/task/v1/getMyNoticeReadList', {
                  pageBean: pageBean,
                  querys: [
                    {
                      property: 'proc_inst_id_',
                      value: row.bpm_proc_inst_id_,
                      operation: 'EQUAL',
                      relation: 'AND'
                    }
                  ]
                })
                .then(response => {
                  if (response.data.rows && response.data.rows.length > 0) {
                    let id = response.data.rows[0].id
                    this.$router.push(
                      '/reportModuleInstMyRead/' +
                        row.bpm_proc_inst_id_ +
                        '/' +
                        id +
                        '/myRead/' +
                        this.defKey +
                        '/' +
                        this.templateKey
                    )
                  }
                })
            } else if (taskType == 'myDelegate') {
              this.$router.push(
                '/reportModuleInstRead/' +
                  row.bpm_proc_inst_id_ +
                  '/delegate/' +
                  this.defKey +
                  '/' +
                  this.templateKey
              )
            }
          },
          //下载全部选中的二维码
          downloadAllQRCode(
            templateId,
            mobileFormAlias,
            display,
            pkField,
            QRCodePattern
          ) {
            this.QRCodePattern = QRCodePattern
            const _selectData = this.$refs.multipleTemplateTable.selection
            if (_selectData.length === 0) {
              this.$message.error('请至少选中一条数据!')
              return
            }
            this.loading = true
            let account = Base64.encode(
              this.$store.state.login.currentUser.account
            )
            let token = this.$store.state.login.currentUser.token
            let mobile = window.context.mobile
            let QRCodeurl = ''
            let zip = new JSZip()
            // 创建一个名为images的新的文件目录
            let img = zip.folder('images')
            let plist = []
            for (let x = 0; x < _selectData.length; x++) {
              if (this.QRCodePattern) {
                QRCodeurl =
                  mobile +
                  '/QRCodeForm/' +
                  this.templateKey +
                  '/get' +
                  '?id=' +
                  _selectData[x][pkField] +
                  '&token=' +
                  token
              } else {
                QRCodeurl =
                  mobile +
                  '/QRCodeForm/' +
                  this.templateKey +
                  '/edit' +
                  '?id=' +
                  _selectData[x][pkField]
              }
              let msg = document.createElement('canvas')

              QRCode.toCanvas(msg, QRCodeurl, function(error) {
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
            Promise.all(plist).then(result => {
              document.getElementById('QRCodeAndDescAll').innerHTML = ''
              for (let x = 0; x < result.length; x++) {
                let canvas = result[x]
                let image = canvas.toDataURL().split(';base64,')[1]
                // 这个images文件目录中创建一个base64数据为imgData的图像，图像名是smile.gif
                img.file(x + '.png', image, {base64: true})
              }
              // 把打包内容异步转成blob二进制格式
              zip.generateAsync({type: 'blob'}).then(function(content) {
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
          objectSpanMethod({row, column, rowIndex, columnIndex}) {
            // console.log(this.rows)
            if(this.templateKey=='lshywgx' || this.templateKey=='lawyer_divide_form'){
              this.getSpanArr(this.rows)
              // console.log(this.spanArr)
              if (columnIndex === 0 || columnIndex === 1) {
                // 对前三列进行操作
                const _row = this.spanArr[rowIndex] // 合并行数
                const _col = _row > 0 ? 1 : 0 // 合并列数，1：不改变，0：被消除
                return {
                  rowspan: _row,
                  colspan: _col
                }
              }
            }
          },
          getSpanArr(data) {
            let position // 当前合并的行位置（连续相同名称的第一条数据位置）
            this.spanArr = []
            data.forEach((item, index) => {
              if (index === 0) {
                // 第一行， 不进行处理
                this.spanArr.push(1)
                position = 0
              } else {
                if (data[index].lawer_nm === data[index - 1].lawer_nm  || data[index].num === data[index - 1].num) {
                  // 当条数据跟上一条数据名称相同，要合并
                  this.spanArr[position] += 1 // 首条相同名称行合并行数增加
                  this.spanArr.push(0) // 当前行消除
                } else {
                  // 不需要处理的数据
                  this.spanArr.push(1)
                  position = index
                }
              }
            })
            // 表格序号
            let Nosort = 0
            for(let n in this.spanArr){
                if(this.spanArr[n]>0){
                    Nosort += 1
                    this.$set(data[n],'Nosort',Nosort)
                }
            }

          },
          onCopy(e) {
            this.$message.success('内容已复制到剪切板！')
          },
          // 复制失败时的回调函数
          onError(e) {
            this.$message.error('抱歉，复制失败！')
          },
          downloadQRCode() {
            let plist = []
            let _canvas = document.querySelector('#QRCodeAndDesc')
            plist.push(this.downloadQRCodeAndDesc('#QRCodeAndDesc', _canvas))
            Promise.all(plist).then(result => {
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
                canvas: canvas2
              }).then(function(canvas) {
                resolve(canvas)
              })
            })
            return p2
          },
          QRCodeDialogClose() {
            this.QRCodeType = ''
            this.QRCodeDialog = false
          },
          foundQRCode() {
            /*this.QRCodeurl =
              window.context.front +
              "/QRCodeForm/" +
              this.templateKey +
              "/get" +
              "?id=" +
              this.rowId +
              "&token=" +
              this.$store.state.login.currentUser.token;*/
            if (this.QRCodeType == 'add') {
              let isStartFlow = this.templateInfo.defId ? 'true' : 'false'
              this.QRCodeurl =
                req.getContext().mobile +
                '/template/form/' +
                this.templateKey +
                '/add/?startFlow=' +
                isStartFlow
              if (this.QRCodePattern) {
                let token = this.$store.state.login.currentUser.token
                this.QRCodeurl += '&token=' + token
              }
            } else {
              //不论需不需要登录，访问的都是明细页面
              if (this.QRCodePattern) {
                //免登录
                this.QRCodeurl =
                  req.getContext().mobile +
                  '/QRCodeForm/' +
                  this.templateKey +
                  '/get?id=' +
                  this.rowId +
                  '&token=' +
                  this.$store.state.login.currentUser.token
              } else {
                //需要登录
                this.QRCodeurl =
                  req.getContext().mobile +
                  '/QRCodeForm/' +
                  this.templateKey +
                  '/get?id=' +
                  this.rowId
              }
            }
            // Base64.encode(this.$store.state.login.currentUser.account);
            let msg = document.getElementById('QRCode')

            QRCode.toCanvas(msg, this.QRCodeurl, function(error) {
              console.log(error)
            })
            this.QRCodeShow = true
          },
          getQRCode(
            templateId,
            id,
            mobileFormAlias,
            display,
            index,
            QRCodePattern
          ) {
            this.QRCodePattern = QRCodePattern
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
          handleSizeChange: function(size) {
            //每页下拉显示数据
            this.pagination.pageSize = size
            this.search()
          },
          handleCurrentChange: function(currentPage) {
            //点击第几页
            this.pagination.page = currentPage
            this.search()
          },
          getParam() {
            let params = {}
            if (str == 'find') {
              // this.$store.dispatch("form/setBpmTemplatePaginationPageNum", 1);
              this.pagination.page = 1
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
              params.pagination.querys.forEach(q => {
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
            this.rows=[]
            const loading = this.$loading(this.options)
            let params = {}
            if (str == 'find') {
              // this.$store.dispatch("form/setBpmTemplatePaginationPageNum", 1);
              this.pagination.page = 1
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
            if (params.pagination && params.pagination.querys) {
              let tempQueryS = []
              let betweenConditions = {}
              params.pagination.querys.forEach(q => {
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
              params.pagination.querys = params.pagination.querys
                ? params.pagination.querys.concat(this.treeQuerys)
                : this.treeQuerys
            }
            //把过滤树的条件也拼接进去
            if (this.treeQuerys && this.treeQuerys.length > 0) {
              params.pagination.querys = params.pagination.querys
                ? params.pagination.querys.concat(this.treeQuerys)
                : this.treeQuerys
            }

            //数据视图控件
            if (this.dataView) {
              this.handelBindFiledValua()
              params.refIdValue = this.dataView.refIdValue
              //关联查询字段
              if (
                this.dataView.selectList &&
                this.dataView.selectList.length > 0
              ) {
                params.selectList = this.dataView.selectList
              }
            }
            const this_ = this
            if (this_.isJoinFlow) {
              params.isJoinFlow = true
              params.taskType = this_.taskType
              params.defKey = this_.defKey
            }
            if ($.isEmptyObject(this.searchForm)) {
              this.$store
                .dispatch('form/getBpmTemplateByPagination', params)
                .then(response => {
                  this_.rows = response.data.rows
                  // this_.total = response.data.total
                  if(this.templateKey=='lshywgx' || this.templateKey=='lawyer_divide_form'){
                        let keys = [] // 唯一值的数组
                        if(response.data.rows.length>0){     
                        response.data.rows.forEach((item, index) => {
                            if (!keys.includes(item.lawer_nm)) {
                              keys.push(item.lawer_nm)
                            }
                          })
                          console.log(keys)
                          let temp = []
                          keys.forEach(item => {
                            // 将同一名称的数据放在相邻位置
                            response.data.rows.forEach(cell => {
                              if (item == cell.lawer_nm) {
                                temp.push(cell)
                              }
                            })
                          })
                        //***************************************** */
                          this_.rows = temp
                          for (let i = 0; i < this_.rows.length; i++) {
                            this_.rows[i].num=i+1
                          }
                        }
                        this_.total = keys.length
                      }else{
                        this_.total = response.data.total
                      }
                  this_.pagination.page = response.data.page
                  this_.pagination.pageSize = response.data.pageSize
                  loading.close()
                })
            } else {
              this.$store
                .dispatch('form/getBpmTemplateByPagination', params)
                .then(response => {
                  this_.rows = response.data.rows
                  // this_.total = response.data.total
                  if(this.templateKey=='lshywgx' || this.templateKey=='lawyer_divide_form'){
                        let keys = [] // 唯一值的数组
                        if(response.data.rows.length>0){     
                        response.data.rows.forEach((item, index) => {
                            if (!keys.includes(item.lawer_nm)) {
                              keys.push(item.lawer_nm)
                            }
                          })
                          console.log(keys)
                          let temp = []
                          keys.forEach(item => {
                            // 将同一名称的数据放在相邻位置
                            response.data.rows.forEach(cell => {
                              if (item == cell.lawer_nm) {
                                temp.push(cell)
                              }
                            })
                          })
                        //***************************************** */
                          this_.rows = temp
                          for (let i = 0; i < this_.rows.length; i++) {
                            this_.rows[i].num=i+1
                          }
                        }
                        this_.total = keys.length
                      }else{
                        this_.total = response.data.total
                      }
                  this_.pagination.page = response.data.page
                  this_.pagination.pageSize = response.data.pageSize
                  loading.close()
                })
            }
          },
          getQueryFilter() {
            let operationMap = this.getSearchItems()
            let fieldTypeMap = this.getFieldType()
            let specialMap = this.getSpecialMap()
            let querys = [] //查询条件
            let queryFilter = {}
            let pageBean = {pageBean: this.pagination}
            let params = {templateId: this.templateInfo.id}
            params.pagination = pageBean
            if ($.isEmptyObject(this.searchForm)) {
              //2022-09-20 yigz：页面初始化时，若formKey存在，则添加formKey所标识的列为默认查询过滤条件
              if (this_.$parent.formKey && this_.$parent.formKey !== '') {
                let key = this_.$parent.formKey
                let value = this_.$parent.formValue
                let add_query = {
                  group: 'main',
                  operation: 'LIKE',
                  relation: 'AND',
                  value: value,
                  property: key
                }
                querys.push(add_query)
              }
              params.queryFilter.querys = querys
              return params
            } else {
              for (let key in this.searchForm) {
                if (
                  typeof this.searchForm[key] != 'undefined' &&
                  this.searchForm[key] != '' &&
                  this.searchForm[key] != null
                ) {
                  if (this.searchForm[key] instanceof Array) {
                    for (let i = 0; i < this.searchForm[key].length; i++) {
                      querys.push({
                        property: key,
                        value: this.searchForm[key][i],
                        group: 'main',
                        operation: operationMap[key],
                        relation: 'AND'
                      })
                    }
                  } else if (
                    this.searchForm[key].includes(',') &&
                    !specialMap[key]
                  ) {
                    let arr = this.searchForm[key].split(',')
                    arr.forEach(v => {
                      querys.push({
                        property: key,
                        value: v,
                        group: 'main',
                        operation: operationMap[key],
                        relation: 'AND'
                      })
                    })
                  } else {
                    let value = this.searchForm[key]
                    //整数类型
                    if (fieldTypeMap[key] && fieldTypeMap[key] == 'number') {
                      value = parseFloat(this.searchForm[key])
                    }
                    querys.push({
                      property: key,
                      value: value,
                      group: 'main',
                      operation: operationMap[key],
                      relation: 'AND'
                    })
                  }
                }
              }
              //2022-09-20 yigz：是否存在自动过滤的条件与用户自定义的查询条件相同的情况，若存在，则以用户查询条件为主
              let hasFormKeyByUser = false
              let formKey = this.$parent.formKey
              if (querys && querys.length) {
                for (let i = 0; i < querys.length; i++) {
                  console.log('property ==>', querys[i].property)
                  if (querys[i].property == formKey) {
                    hasFormKeyByUser = true
                    console.log('property 11==>', querys[i].property)
                  }
                }
              }
              if (!hasFormKeyByUser) {
                //2022-09-20 yigz：页面初始化时，若formKey存在，则添加formKey所标识的列为默认查询过滤条件
                if (this.$parent.formKey && this.$parent.formKey !== '') {
                  let key = this.$parent.formKey
                  let value = this.$parent.formValue
                  let add_query = {
                    group: 'main',
                    operation: 'LIKE',
                    relation: 'AND',
                    value: value,
                    property: key
                  }
                  querys.push(add_query)
                }
              }

              this.clearQueryByGroupName(querys, 'filter')
              // 将过滤条件添加查询参数数组中
              if (this.filters && Object.keys(this.filters).length > 0) {
                let prefix = this.templateInfo.isExternal === 1 ? '' : 'F_'
                Object.keys(this.filters).forEach(k => {
                  const filter = this.filters[k]
                  let query = {
                    property: prefix + k,
                    value: filter[0],
                    group: 'filter',
                    relation: 'AND'
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
              //如果有设置默认排序,优先使用默认排序
              if (this.templateInfo.sortField) {
                let sortField = JSON.parse(this.templateInfo.sortField)
                let sorter = []
                for (let x = 0; x < sortField.length; x++) {
                  sorter.push({
                    property: sortField[x].name,
                    direction: sortField[x].sort
                  })
                }
                queryFilter.sorter = sorter
              }
              if (this.sorter && this.sorter.length > 0) {
                queryFilter.sorter = this.sorter
              }
              params.pagination = queryFilter
              return params
            }
          },
          // 通过分组名称清除对应查询条件
          clearQueryByGroupName(querys, groupName) {
            // 待删除的查询条件
            let toDelete = []
            querys &&
              querys.forEach(query => {
                if (query.group == groupName) {
                  toDelete.push(query)
                }
              })
            toDelete.forEach(d => {
              querys.remove(d)
            })
          },
          handleSortChange(column) {
            if (!column.order) {
              this.sorter = null
            } else {
              this.sorter = [
                {
                  property: column.prop,
                  direction: column.order == 'ascending' ? 'ASC' : 'DESC'
                }
              ]
            }
            this.search()
          },
          handleFilterChange(m) {
            this.filters = {...this.filters, ...m}
            Object.keys(this.filters).forEach(k => {
              if (!this.filters[k] || this.filters[k].length == 0) {
                delete this.filters[k]
              }
            })
            this.search()
          },
          getSearchItems() {
            let searchItems = $('.search-item')
            let operationMap = {}
            let operationType = {
              like: 'LIKE',
              equal: 'EQUAL',
              between: 'BETWEEN',
              left_like: 'LEFT_LIKE',
              right_like: 'RIGHT_LIKE'
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
                  typeof $(searchItems[i])
                    .children()
                    .attr('ht-query') != 'undefined'
                ) {
                  operation = $(searchItems[i])
                    .children()
                    .attr('operation')
                  operationMap[
                    $(searchItems[i])
                      .children()
                      .attr('ht-query')
                  ] =
                    typeof operationType[operation] != 'undefined'
                      ? operationType[operation]
                      : operation
                }
              }
            }
            return operationMap
          },
          getFieldType() {
            let searchItems = $('.search-item')
            let operationMap = {}
            let operationType = {
              number: 'number',
              text: 'text'
            }
            if (searchItems) {
              for (let i = 0; i < searchItems.length; i++) {
                let operation = '='
                if (typeof $(searchItems[i]).attr('ht-query') != 'undefined') {
                  operation = $(searchItems[i]).attr('type')
                  operationMap[$(searchItems[i]).attr('ht-query')] =
                    typeof operationType[operation] != 'undefined'
                      ? operationType[operation]
                      : operation
                } else if (
                  typeof $(searchItems[i])
                    .children()
                    .attr('ht-query') != 'undefined'
                ) {
                  operation = $(searchItems[i])
                    .children()
                    .attr('type')
                  operationMap[
                    $(searchItems[i])
                      .children()
                      .attr('ht-query')
                  ] =
                    typeof operationType[operation] != 'undefined'
                      ? operationType[operation]
                      : operation
                }
              }
            }
            return operationMap
          },
          //获取特殊查询情况（自定义对话框）
          getSpecialMap() {
            let searchItems = $('.search-item')
            let fieldQueryMap = {} //查询条件字段

            if (searchItems) {
              for (var i = 0; i < searchItems.length; i++) {
                if (typeof $(searchItems[i]).attr('ht-query') != 'undefined') {
                  //查询条件字段
                  fieldQueryMap[$(searchItems[i]).attr('ht-query')] =
                    typeof $(searchItems[i]).attr('special-query') !=
                    'undefined'
                      ? true
                      : false
                } else if (
                  typeof $(searchItems[i])
                    .children()
                    .attr('ht-query') != 'undefined'
                ) {
                  //查询条件字段
                  fieldQueryMap[
                    $(searchItems[i])
                      .children()
                      .attr('ht-query')
                  ] =
                    typeof $(searchItems[i])
                      .children()
                      .attr('special-query') != 'undefined'
                      ? true
                      : false
                }
              }
            }
            return fieldQueryMap
          },
          getConditionQuery() {
            let searchAll = $('.search-query')
            let values = ''
            let querys = [] //查询条件
            let queryFilter = {}
            let pageBean = {pageBean: this.pagination}
            let params = {templateId: this.templateInfo.id}
            params.pagination = pageBean

            // 将过滤条件添加查询参数数组中
            if (this.filters && Object.keys(this.filters).length > 0) {
              let prefix = this.templateInfo.isExternal === 1 ? '' : 'F_'
              Object.keys(this.filters).forEach(k => {
                const filter = this.filters[k]
                let query = {
                  property: prefix + k,
                  value: filter[0],
                  group: 'filter',
                  relation: 'AND'
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

            if (this.queryForm.queryData == '') {
              queryFilter = {pageBean: this.pagination, querys}
              params.pagination = queryFilter
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
                    relation: 'OR'
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
          searchEnterFun: function(e) {
            let keyCode = window.event ? e.keyCode : e.which
            if (keyCode == 13) {
              this.search('find')
            }
          },
          reset(flag) {
            this.queryForm.queryData = ''
            if (this.templateInfo.conditionField) {
              let conditionField = utils.parseToJson(
                this.templateInfo.conditionField
              )
              for (let i = 0; i < conditionField.length; i++) {
                let fieldName = 'F_' + conditionField[i].name
                this.$set(this.searchForm, fieldName, '')
                this.$set(this.searchForm, conditionField[i].name, '')
              }
            }
            this.filters = {}
            this.$refs.multipleTemplateTable.clearFilter()
            if (!flag) {
              this.search('find')
            }
          },
          handleSelectionChange(val) {
            this.tableData.selectRows = val
          },
          deleted() {
            if (
              this.tableData.selectRows == null ||
              this.tableData.selectRows.length == 0
            ) {
              this.$message.warning('请选择文件删除!')
              return false
            }
            this.$confirm('此操作将删除该文件, 是否继续?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })
              .then(() => {
                let s = []
                for (let i = 0; i < this.tableData.selectRows.length; i++) {
                  s.push(
                    this.tableData.selectRows[i][this.templateInfo.pkField]
                  )
                }
                let data = {
                  ids: s.join(','),
                  boAlias: this.templateInfo.boDefAlias
                }
                this.$store
                  .dispatch('form/deleteTemplateDataById', data)
                  .then(() => {
                    this.pagination.page = 1
                    this.search()
                  })
              })
              .catch(() => {
                this.$message({
                  type: 'info',
                  message: '已取消删除'
                })
              })
          },
          del(id) {
            this.$confirm('此操作将删除该数据, 是否继续?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })
              .then(() => {
                let data = {ids: id, boAlias: this.templateInfo.boDefAlias}
                this.$store
                  .dispatch('form/deleteTemplateDataById', data)
                  .then(() => {
                    this.pagination.page = 1
                    this.search()
                  })
              })
              .catch(() => {
                this.$message({
                  type: 'info',
                  message: '已取消删除'
                })
              })
          },
          operating(templateId, id, action, defId, isStartFlow, openType) {
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
            //数据视图随机添加到其他菜单下面时获取当前菜单的别名  并且当前数据视图不是表单里的数据视图  dataView
            if (
              sessionStorage.menu_alias &&
              !this.dataView &&
              !this.ignoredAlias.includes(sessionStorage.menu_alias)
            ) {
              this.alias_new = sessionStorage.menu_alias
            }
            var url =
              '/' +
              this.alias_new +
              '/template/form/' +
              this.templateKey +
              '/' +
              action
            if (this.isJoinFlow) {
              this.alias_new = 'statement'
            }
            if (this.single == 'true') {
              url =
                '/' +
                this.alias_new +
                '/template/form/' +
                this.templateKey +
                '/' +
                action +
                '/true'
            }
            //判断数据视图控件
            let isDataView = false
            if (this.dataView) {
              if (this.dataView.boDefAlias && this.dataView.boDefAlias != '') {
                isDataView = true
              }
            }

            if (openType == 'new' || this.isJoinFlow || isDataView) {
              url += '/new'
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
              if (this.dataView.bindList && this.dataView.bindList.length > 0) {
                let bindList = []
                for (var i = 0; i < this.dataView.bindList.length; i++) {
                  let item = {
                    key: this.dataView.bindList[i].bindFilld,
                    value: this.dataView.bindList[i].fillValue
                  }
                  bindList.push(item)
                }
                dataUrl =
                  '&bindList=' +
                  encodeURIComponent(Base64.encode(JSON.stringify(bindList)))
              }
            }
            let path = url + startFlowStr
            if (dataUrl != '') {
              path = url + startFlowStr + dataUrl
            }
            if (openType == 'new' || this.isJoinFlow || isDataView) {
              window.open(
                this.$router.resolve(
                  path.replace(this.alias_new, 'statement') + '&isNewPage=true'
                ).href,
                '_self'
              )
            } else {
              if (path.indexOf('othermenu') != -1) {
                path = path.replace('/othermenu', '/statement')
              }
              this.$router.push(path)
            }
          },
          openUrl(url, type, row, fieldName) {
            if (row && fieldName) {
              url = this.handledUrlParams(url, row, fieldName)
            }
            if (type == 'new') {
              window.open(url, '_self')
            } else {
              window.location.href = url
            }
          },
          handledUrlParams(url, row, fieldName) {
            if (this.templateInfo.displayField) {
              let displayFields = JSON.parse(this.templateInfo.displayField)
              displayFields.forEach(display => {
                if (display.name == fieldName) {
                  if (display.urlParams && display.urlParams.length > 0) {
                    let urlParams = display.urlParams
                    let suffix = ''
                    urlParams.forEach(param => {
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
              conditionField.forEach(obj => {
                if (obj.parameter) {
                  querys.push({
                    property: obj.key,
                    value: data[obj.parameter],
                    group: 'main',
                    operation: obj.qt,
                    relation: 'AND'
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
              window.open(this.$router.resolve(url).href, '_self')
            } else {
              this.$router.push(url)
            }
          },
          startFlow(id) {
            let data = {
              defKey: this.templateInfo.defId,
              businessKey: id,
              boAlias: this.templateInfo.boDefAlias
            }
            let loadingInstance = Loading.service({fullscreen: true}) //开始
            this.$store
              .dispatch('storeProcess/startForm', data)
              .then(result => {
                loadingInstance.close() // 结束
                if (result.state) {
                  this.$message.success(result.message)
                  this.search()
                } else {
                  this.disabled = false
                  this.$message.error(result.message)
                }
              })
          },
          //点击导出按钮
          exports(exportSettingFields) {
            let displayFields = []
            if (exportSettingFields) {
              displayFields = JSON.parse(Base64.decode(exportSettingFields))
            }
            if (displayFields.length == 0 && this.templateInfo.displayField) {
              displayFields = JSON.parse(this.templateInfo.displayField)
            }
            this.exportType = 'main'
            this.displayFields = []
            displayFields.forEach(item => {
              if (item.type) {
                this.displayFields.push(item)
              }
            })
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
              case 'log':
                this.openLog()
                break
              default:
                break
            }
          },
          openLog() {
            this.dialogVisible = true
          },
          downloadMainTempFile() {
            let customTemplateId = ''
            if (this.templateInfo && this.templateInfo.manageField) {
              let manageFieldList = JSON.parse(this.templateInfo.manageField)
              for (let index = 0; index < manageFieldList.length; index++) {
                let manage = manageFieldList[index]
                if (manage.name == 'import') {
                  if (
                    manage.importTemplate &&
                    manage.importTemplate.length > 0
                  ) {
                    customTemplateId = manage.importTemplate[0].id
                  }
                  break
                }
              }
            }

            if (customTemplateId) {
              this.$store.dispatch('menu/downloadFile', customTemplateId)
            } else {
              let loadingInstance = Loading.service({fullscreen: true}) //开始
              this.$store
                .dispatch('form/downloadMainTempFile', this.templateInfo.alias)
                .then(() => {
                  loadingInstance.close() // 结束
                })
                .catch(c => {
                  loadingInstance.close()
                })
            }
          },

          importMain(param) {
            let formData = new FormData()
            formData.append('file', param.file)

            let params = {
              data: formData,
              alias: this.templateInfo.alias
            }

            if (this.dataView) {
              this.handelBindFiledValua()
              params.bindFilld = this.dataView.bindFilld || ''
              params.fillValue = this.dataView.fillValue || ''
              params.refIdValue = this.dataView.refIdValue
            }

            let loadingInstance = Loading.service({fullscreen: true}) //开始
            form.mainImport(params, data => {
              loadingInstance.close() // 结束
              if (data.state) {
                //导入成功之后重新渲染当前组件
                this.$parent.refreshTime = new Date().getTime()
                this.$message({type: 'success', message: data.message})
                param.onSuccess()
                if (sessionStorage.getItem('formImportTempRefId')) {
                  let json = JSON.parse(data.value)
                  json.boAlias = this.dataView.boDefAlias
                  let oldConf = sessionStorage.getItem('formImportTempJson')
                  if (!oldConf) {
                    sessionStorage.setItem(
                      'formImportTempJson',
                      JSON.stringify([json])
                    )
                  } else {
                    let oldJosn = JSON.parse(oldConf)
                    let isInOldJosn = false
                    for (let index = 0; index < oldJosn.length; index++) {
                      const old = oldJosn[index]
                      if (
                        old.tabName == json.tabName &&
                        old.bindFilld == json.bindFilld
                      ) {
                        isInOldJosn = true
                        break
                      }
                    }
                    if (!isInOldJosn) {
                      oldJosn.push(json)
                    }
                    sessionStorage.setItem(
                      'formImportTempJson',
                      JSON.stringify(oldJosn)
                    )
                  }
                }
                this.search()
              } else {
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
                  relation: 'AND'
                }
              ]
            }
            this.recordTableLoading = true
            let url = '${bpmRunTime}/bpm/boDataModifyRecord/v1/listJson'
            req.post(url, param).then(resp => {
              this.recordTableLoading = false
              this.recordList = resp.data.rows
              this.modifyRecord.pagination.pageBean = {
                pageSize: resp.data.pageSize,
                page: resp.data.page,
                total: resp.data.total
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
                  relation: 'AND'
                }
              ]
            }
            this.recordTableLoading = true
            let url = '${bpmRunTime}/bpm/boDataModifyRecord/v1/listJson'
            req.post(url, param).then(resp => {
              this.recordTableLoading = false
              this.recordList = resp.data.rows
              this.modifyRecord.pagination.pageBean = {
                pageSize: resp.data.pageSize,
                page: resp.data.page,
                total: resp.data.total
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
                  total: 0
                }
              }
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
            window.open(this.$router.resolve(url).href, '_self')
          },
          //确定导出
          submitExport() {
            if (!this.exportData || this.exportData.expField.length < 1) {
              this.$message({
                type: 'info',
                message: '请选择要导出的字段！'
              })
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
              filterKey: ''
            }
            data.query = this.getQueryFilter().pagination
            if (this.dataView && this.dataView.bindSelectd) {
              data.query.querys.push({
                value: this.dataView.selectValue,
                operation: 'EQUAL',
                property: 'F_' + this.dataView.bindSelectd
              })
            }
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
                value: expFields[i].desc
              })
            }
            let data = {
              alias: alias,
              refId: refId,
              type: this.exportData.getType,
              expField: JSON.stringify(expField),
              filterKey: ''
            }
            data.queryFilter = this.currentTab.pagination
            let loadingInstance = Loading.service({fullscreen: true})
            form.subExport(data, resp => {
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
                this.$message({
                  message: '已经是列表中第一位',
                  type: 'warning'
                })
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
                this.$message({
                  message: '已经是列表中最后一位',
                  type: 'warning'
                })
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
                  total: 0
                }
              }
            }
            tab.childEnts = []
            if (ent.childEnts && ent.childEnts.length > 0) {
              tab.childEnts = ent.childEnts
            }
            return new Promise((resolve, reject) => {
              this.$store
                .dispatch('form/getSubDataPagination', {
                  pagination: tab.pagination,
                  name: ent.name,
                  refId: refId
                })
                .then(data => {
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
            /*if (!this.ents || this.ents.length < 1) {
              form.getSubEntsByFormKey(this.templateInfo.formKey, (resp) => {
                // 子表与孙表字段名设置小写
                for (let i = 0; i < resp.data.length; i++) {
                  resp.data[i].attributeList.forEach(attribute => {
                    attribute.fieldName = attribute.fieldName.toLowerCase();
                  })
                  resp.data[i].childEnts.forEach(showChildEnt => {
                    showChildEnt.attributeList.forEach(attribute => {
                      attribute.fieldName = attribute.fieldName.toLowerCase();
                    })
                  })
                }
                this.ents = resp.data;
              });
            } else {*/
            this.getSubData(this, refId)
            /* }*/
          },
          async getSubData(_me, refId) {
            //let ents = this.ents;
            let ents = JSON.parse(_me.templateInfo.subField)

            if (ents && ents.length > 0) {
              for (let i = 0; i < ents.length; i++) {
                ents[i].attributeList.forEach(attr => {
                  attr.fieldName = attr.fieldName.toLowerCase()
                })
                ents[i].childEnts.forEach(showChildEnt => {
                  showChildEnt.attributeList.forEach(attribute => {
                    attribute.fieldName = attribute.fieldName.toLowerCase()
                  })
                })
                let tab = await this.getBoData(ents[i], refId)
                this.tabs.push(tab)
              }
            }
            this.dialogSubVisible = true
          },
          nodeClick(node) {
            const loading = this.$loading(this.options)
            // this.$store.dispatch("form/setBpmTemplatePaginationPageNum", 1);
            this.pagination.page = 1
            //每次点击过滤树,应该把右边的table 与分页全部重置为初始

            let pageBean = {
              pageBean: {page: 1, pageSize: this.pagination.pageSize}
            }
            pageBean.querys = []
            if (!node.id || node.id != -1) {
              let treeField = JSON.parse(this.templateInfo.treeField)
              treeField.querys.forEach(item => {
                if (item.key_ && item.value_) {
                  pageBean.querys.push({
                    property: '$TREE$' + item.key_,
                    value: node[item.value_],
                    group: 'main',
                    operation: 'EQUAL',
                    relation: 'AND'
                  })
                }
              })
            }
            //把过滤树的查询条件存一份起来,右边的搜索与分页才能同时使用
            this.treeQuerys = pageBean.querys

            let params = {
              templateId: this.templateInfo.id,
              pagination: pageBean
            }
            this.reset(true)
            //数据视图控件
            if (this.dataView) {
              if (
                this.dataView.selectList &&
                this.dataView.selectList.length > 0
              ) {
                params.selectList = this.dataView.selectList
              }
            }
            const this_ = this
            if (this_.isJoinFlow) {
              params.isJoinFlow = true
              params.taskType = this_.taskType
              params.defKey = this_.defKey
            }
            this.$store
              .dispatch('form/getBpmTemplateByPagination', params)
              .then(response => {
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
              value =>
                value[id] == value[pid] ||
                value[pid] == null ||
                value[pid] == pvalue
            )
            if (!parents) {
              parents = data.filter(
                value =>
                  value[pid] !== 'undefined' &&
                  value[pid] != null &&
                  value[id] != value[pid]
              )
            }
            return parents
          },
          //初始化树
          initTree(treeField) {
            const this_ = this
            form.getByAlias(treeField.alias, res => {
              this_.customDialog = res
              dialog.getTreeData(
                {
                  requestType: 'GET',
                  url:
                    '${form}/form/customDialog/v1/getTreeData?alias=' +
                    treeField.alias +
                    '&mapParam='
                },
                resp => {
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
                    value =>
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
                refId: tab.refId ? tab.refId : this.refId
              })
              .then(resp => {
                tab.pagination.pageBean = {
                  pageSize: resp.pageSize,
                  page: resp.page,
                  total: resp.total
                }
                tab.dataList = resp.rows
              })
              .finally(() => {
                this.subTableLoading = false
              })
          },
          querySubTable(tab) {
            tab.pagination.querys = []
            if (this.querySubValue) {
              tab.attributeList.forEach(item => {
                //pgSql使用模糊查询，类型不匹配时会报错，此处只保留varchar类型
                // if (item.dataType == 'varchar') {
                tab.pagination.querys.push({
                  property: item.fieldName,
                  value: this.querySubValue,
                  group: 'other',
                  operation: 'LIKE',
                  relation: 'OR'
                })
                // }
              })
            } else if (this.querySunValue) {
              tab.attributeList.forEach(item => {
                // if (item.dataType == 'varchar') {
                tab.pagination.querys.push({
                  property: item.fieldName,
                  value: this.querySunValue,
                  group: 'other',
                  operation: 'LIKE',
                  relation: 'OR'
                })
                // }
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
              refId: this.refId
            }
            form.subImport(params, data => {
              if (data.state) {
                this.$message({type: 'success', message: data.message})
                param.onSuccess()
                this.handleSubCurrentChange(1, this.currentTab)
              } else {
                this.$message.error(data.message)
                param.onError()
              }
            })
          },
          exportSub(tab) {
            this.exportType = 'sub'
            this.currentTab = tab
            this.displayFields = []
            this.subDisplayFieldsList = []
            tab.attributeList.forEach(item => {
              this.displayFields.push({
                desc: item.comment,
                name: item.fieldName,
                type: item.columnType
              })
            })
            this.dialogExportVisible = true
          },
          importButton(tab) {
            this.currentTab = tab
          },
          myDraftList() {
            //数据视图随机添加到其他菜单下面时获取当前菜单的别名  并且当前数据视图不是表单里的数据视图  dataView
            if (
              sessionStorage.menu_alias &&
              !this.dataView &&
              !this.ignoredAlias.includes(sessionStorage.menu_alias)
            ) {
              this.alias_new = sessionStorage.menu_alias
            }
            let dataViewFlag = false
            //判断当前数据视图是不是表单里的数据视图
            if (this.dataView) {
              if (this.dataView.boDefAlias && this.dataView.boDefAlias != '') {
                dataViewFlag = true
              }
            }
            let path =
              '/' +
              this.alias_new +
              '/draftList/' +
              this.templateInfo.alias +
              '/' +
              dataViewFlag
            if (this.openType == 'new' || dataViewFlag) {
              path += '?isNew=true'
            }
            if (dataViewFlag) {
              window.open(path, '_self')
            } else {
              this.$router.push(path)
            }

            // let url =
            //   "/statement/draftList?tempAlias=" + ;
            // const { href } = this.$router.push({
            //   path: url,
            // });
            // window.open(href, "_blank");
          },
          initSwitchStatus() {
            //初始化开关状态
            let manages = utils.parseToJson(this.templateInfo.manageField)
            for (let i = 0; i < manages.length; i++) {
              if (manages[i].name === 'switch') {
                let fieldName = manages[i].bind
                this.$set(this.switchMap, fieldName, {})
                this.switchMap[fieldName].on = manages[i].switchOn
                this.switchMap[fieldName].off = manages[i].switchOff
                this.switchMap[fieldName].onLabel = manages[i].switchOnLabel
                this.switchMap[fieldName].offLabel = manages[i].switchOffLabel
              }
            }
          },
          switchChange(pkVal, on, off, fieldName, row, defaultTrue) {
            let this_ = this
            let val = row[fieldName]
            if (val != on && val != off) {
              if (defaultTrue == 'true') {
                this.$set(row, fieldName, off)
                val = off
              } else {
                this.$set(row, fieldName, on)
                val = on
              }
            }
            this_
              .$confirm('将会修改该数据，是否继续?', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              })
              .then(() => {
                let form = window.context.form
                let formAlias = this_.templateInfo.formKey //表单别名
                let dataDefAlias = this_.templateInfo.boDefAlias //数据建模别名
                req
                  .get(
                    form +
                      '/form/dataTemplate/v1/getForm/' +
                      formAlias +
                      '/' +
                      dataDefAlias +
                      '?id=' +
                      pkVal +
                      '&action=get&recordId='
                  )
                  .then(resp => {
                    let boData = resp.data.data
                    boData[dataDefAlias][fieldName] = val
                    let saveData = {
                      boAlias: this_.templateInfo.boDefAlias,
                      boData: resp.data.data
                    }
                    this_.$store
                      .dispatch('form/boSave', saveData)
                      .then(result => {
                        if (result.state) {
                          this_.$message({
                            type: 'success',
                            message: '保存成功'
                          })
                        } else {
                          this_.$message({
                            type: 'error',
                            message: '保存失败'
                          })
                        }
                      })
                  })
              })
              .catch(() => {
                let form = window.context.form
                let formAlias = this_.templateInfo.formKey //表单别名
                let dataDefAlias = this_.templateInfo.boDefAlias //数据建模别名
                req
                  .get(
                    form +
                      '/form/dataTemplate/v1/getForm/' +
                      formAlias +
                      '/' +
                      dataDefAlias +
                      '?id=' +
                      pkVal +
                      '&action=get&recordId='
                  )
                  .then(resp => {
                    this_.$set(
                      row,
                      fieldName,
                      resp.data.data[dataDefAlias][fieldName]
                    )
                  })
              })
          },
          display(mpDisplay) {
            //pc端的数据报表不需要做本方法的处理，直接返回true即可。
            return true
          },
          // 2022.11.10 WF 根据条件显示隐藏按钮
          show(row, showJs) {
            /* console.log('row===>',row)
            console.log('showJs===>',showJs)
            console.log('Base64.decode(showJs)===>',Base64.decode(showJs)) */
            let Fn = Function('_req', 'row', '_this', Base64.decode(showJs)) //一个变量指向Function，防止有些前端编译工具报错
            let result = Fn(req, row, this, Base64.decode(showJs))
            /* console.log("显示=====>",result) */
            if (typeof result != 'boolean') {
              return true
            }
            return result
          },
          getFixed(fixed) {
            return fixed
          },
          summary(method, field, decimal) {
            let list = this.rows
              .filter(item => item[field] !== undefined && item[field] !== '')
              .map(item => new Number(item[field]))
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
          getColor(data, row) {
            let resuColor = 'color:black'
            let decode = Base64.decode(data)
            let colorRule = JSON.parse(decode)
            if (colorRule && colorRule instanceof Array) {
              colorRule.forEach(rule => {
                let Fn = Function('data', rule.proRule)
                if (Fn(row)) {
                  resuColor = 'color:' + rule.proColor
                }
              })
            }
            return resuColor
          },
          getProValue(value, rule) {
            return Math.round((value / rule) * 10000) / 100 // 小数点后两位百分比
          },
          getProColor(data, row) {
            let resuColor = '#409eff'
            let decode = Base64.decode(data)
            /*decode=decode.replace(/\s*!/g,"");*/
            let colorRule = JSON.parse(decode)
            if (colorRule && colorRule instanceof Array) {
              colorRule.forEach(rule => {
                let Fn = Function('data', rule.proRule)
                if (Fn(row)) {
                  resuColor = rule.proColor
                }
              })
            }
            return resuColor
          },
          isSortable(field) {
            let isClob = false
            this.displayFields.forEach(item => {
              if (item.name === field && item.type === 'clob') {
                isClob = true
              }
            })
            return !this.notSortableFields.includes(field) && !isClob
          },
          customEvilJS(row, htScript) {
            let Fn = Function('_req', 'row', '_this', Base64.decode(htScript)) //一个变量指向Function，防止有些前端编译工具报错
            let result = Fn(req, row, this)
          },
          batchUpdate(title, base64Json, base64Fileds) {
            
            if (
              this.tableData.selectRows == null ||
              this.tableData.selectRows.length == 0
            ) {
              this.$message.warning('请选择数据')
              return false
            }
            
            let defaultValueList = []
            let outForm = []
            if (base64Json) {
              //是否有用户自己输入的字段
              let res = true
              let batchUpdateData = JSON.parse(Base64.decode(base64Json))
              let filedsObj = JSON.parse(Base64.decode(base64Fileds))
              const flag = this.batchUpdateCheck(title, batchUpdateData, filedsObj, this.tableData.selectRows)
              if (!flag) return false          
              batchUpdateData.forEach(item => {
                if (item.valueType == 1) {
                  var isRequired = false
                  if (item.isRequired) {
                    isRequired = true
                  }
                  let obj = {
                    name: item.name,
                    desc: filedsObj[item.name],
                    outType: item.outValueType,
                    single: false,
                    selectCurrent: false,
                    isRequired: isRequired
                  }
                  if (item.outValueType == 'select') {
                    let selectConfig = JSON.parse(item.outConfig)
                    obj.ganged = {
                      alias: '',
                      valueBind: '',
                      noInit: '',
                      labelBind: '',
                      bind: {}
                    }
                    if (selectConfig.customQuery) {
                      let ganged = {
                        alias: selectConfig.customQuery.alias,
                        valueBind: selectConfig.customQuery.valueBind,
                        noInit: '',
                        labelBind: selectConfig.customQuery.labelBind,
                        bind: {}
                      }
                      obj.ganged = ganged
                    }
                    obj.selectData = selectConfig.selectData
                  } else if (item.outValueType == 'dialog') {
                    let selectConfig = JSON.parse(item.outConfig)
                    let dialogConfig = selectConfig.dialogConfig
                    let mappingConf = []
                    let parameter = selectConfig.parameter
                    for (var key in parameter) {
                      let value = parameter[key] || ''
                      mappingConf.push({
                        from: key,
                        target: [value],
                        targetSub: [value]
                      })
                    }
                    let custdialog = {
                      selectNum: dialogConfig.selectNum,
                      conditions: [],
                      mappingConf: mappingConf,
                      custQueryJson: [],
                      alias: dialogConfig.alias,
                      type: dialogConfig.custDialog
                    }
                    obj.custdialog = {
                      name: '请选择',
                      custDialog: custdialog,
                      resultField: dialogConfig.resultField
                    }
                  } else if (
                    item.outConfig &&
                    (item.outValueType != 'input' ||
                      item.outValueType != 'data' ||
                      item.outValueType != 'number')
                  ) {
                    let outConfig = JSON.parse(item.outConfig)
                    let parameter = outConfig.parameter
                    for (var key in parameter) {
                      if (!parameter[key]) {
                        delete parameter[key]
                      } else {
                        parameter[key] = 'data.' + parameter[key]
                      }
                    }
                    if (outConfig.selectCurrent) {
                      obj.selectCurrent = outConfig.selectCurrent
                    }
                    if (outConfig.isSingle) {
                      obj.single = outConfig.isSingle
                    }
                    obj.bindConfig = parameter
                  }
                  outForm.push(obj)
                  res = false
                } else {
                  defaultValueList.push({
                    key: item.name,
                    value: item.defaultValue
                  })
                }
              })
              if (res) {
                this.updateBo(defaultValueList)
              } else {
                this.defaultValueList = defaultValueList
                this.$refs.templateBatchUpdateDialog.showDialog(title, outForm)
              }
            } else {
              this.$message({type: 'info', message: '未设置更新内容'})
            }
          },
          batchUpdateCheck(title, batchUpdateData, filedsObj, selectRows) {
            if ( this.$route.params.templateKey === 'spgl'
              || this.$route.params.templateKey === 'rzspgl'
              || this.$route.params.templateKey === 'jfspb' ) {
              if (title.includes('批量')) {
                const STATUS = batchUpdateData.find(item => item.name == 'STATUS')
                let code 
                if(STATUS.defaultValue ==1){
                  code = 0
                }
                if (STATUS.defaultValue == 2) {
                  code = 1
                }
                const arr = selectRows.find(item => item.STATUS != code)
                if (arr) {
                  const text = STATUS.defaultValue == 2 ? '非已上架' : '非待上架'
                  this.$message({ type: 'info', message: `选中的商品中有${text}的商品，请重新选择` })
                  return false
                } else {
                  return true
                }
              }
              if (title === '定时上架') {
                const arr = selectRows.find(item => item.STATUS != 0)
                if (arr) {
                  this.$message({ type: 'info', message: `选中的商品中有非待上架的商品，请重新选择` })
                  return false
                } else {
                  return true
                }
              }
            } else {
              return true
            }
          },
          onConfirm(data) {
            let defaultValueList = []
            for (var key in data) {
              defaultValueList.push({key: key, value: data[key]})
            }
            let boData = this.defaultValueList
              ? this.defaultValueList.concat(defaultValueList)
              : this.defaultValue
            this.updateBo(boData)
          },
          updateBo(defaultValueList) {
            this.$confirm('此操作将批量更新数据, 是否继续?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })
              .then(() => {
                let selectRows = this.tableData.selectRows
                for (let i = 0; i < selectRows.length; i++) {
                  selectRows[i].formKey = this.templateInfo.formKey
                  for (let j = 0; j < defaultValueList.length; j++) {
                    selectRows[i][defaultValueList[j].key] =
                      defaultValueList[j].value
                  }
                }
                let data = {
                  boData: selectRows,
                  boAlias: this.templateInfo.boDefAlias
                }
                this.$store
                  .dispatch('form/batchUpdateTemplateData', data)
                  .then(data => {
                    if (data.state) {
                      this.$message({type: 'success', message: data.message})
                      this.search()
                    }
                  })
              })
              .catch(() => {
                this.$message({type: 'info', message: '已取消更新'})
              })
          },
          addCommand(command) {
            if (command == 'notLogin' || command == 'login') {
              this.getAddQRCode(command)
            }
          },
          getAddQRCode(command) {
            this.QRCodePattern = command == 'notLogin' ? true : false
            this.QRCodeDesc = []
            this.QRCodeType = 'add'
            this.QRCodeShow = false
            this.QRCodeDialog = true
          },
          showSearchPane() {
            return true
          },
          buildDefaultQuerys() {
            let this_ = this
            let querys = []
            let conditions = JSON.parse(this_.templateInfo.conditionField)
            let prefix = this.templateInfo.isExternal == 1 ? '' : 'F_'
            //条件字段默认值判断
            conditions.forEach(condition => {
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
                  relation: 'AND'
                })
              }
            })

            //2022-09-20 yigz：页面初始化时，若formKey存在，则添加formKey所标识的列为默认查询过滤条件
            if (this_.$parent.formKey && this_.$parent.formKey !== '') {
              let key = this_.$parent.formKey
              let value = this_.$parent.formValue
              let add_query = {
                group: 'main',
                operation: 'LIKE',
                relation: 'AND',
                value: value,
                property: key
              }
              querys.push(add_query)
            }
            //筛选字段默认值判断

            let filters = JSON.parse(this_.templateInfo.filteringField)
            filters.forEach(filter => {
              if (filter.defaultValue && filter.defaultValue.length > 0) {
                this_.filterMap[filter.name] = filter.defaultValue
                filter.defaultValue.forEach(val => {
                  querys.push({
                    property: prefix + filter.name,
                    value: val,
                    group: 'defVal_' + filter.name,
                    operation: 'EQUAL',
                    relation: 'OR'
                  })
                })
              }
            })
            this_.$on('afterMounted', () => {
              let headerColumns =
                this_.$refs.multipleTemplateTable.$refs.tableHeader.columns
              headerColumns.forEach(column => {
                if (this_.filterMap.hasOwnProperty(column.property)) {
                  this_.filterMap[column.property].forEach(val => {
                    column.filteredValue.push(val)
                  })
                }
              })
            })
            return querys
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
@import '@/assets/css/change-font.scss';
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

/deep/.el-aside {
  border-right: #e2e3e4 1px solid;
}

/deep/.el-scrollbar__wrap {
  overflow-x: hidden;
  padding: 23px 10px;
}

/deep/.el-scrollbar {
  height: 100%;
  width: 98%;
}

/deep/.el-input-group {
  margin-bottom: 10px;
  width: 50%;
}
/deep/.data_view__title {
  padding: 10px 0;
  margin-bottom: 0;
  border-bottom: 1px solid #ccc;
  margin-top: 8px;
  background: #fff;
}
.data_view /deep/ .el-main {
  padding-top: 10px;
}

.log_dialog /deep/ .toolbar-panel {
  margin-bottom: 0;
}

.log_dialog /deep/ .el-input-group {
  width: 100%;
}

.log_dialog /deep/ .el-dialog__header {
  padding-bottom: 0px;
}

div /deep/ .quick-search > div > input {
  width: 360px;
}
div /deep/ .el-collapse {
  margin-top: 5px;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}
.data-preview-wrap {
  /deep/.blurred-search__row {
    margin-left: -2px;
    margin-bottom: 10px;
    display: inline-flex;
    .blurred-search-btn__item {
      margin-left: 10px;
    }
  }
  /deep/.top_btn_col {
    margin-bottom: 10px;
    display: inline-block;
    // margin-left: -10px;
    .el-button {
      margin-right: 10px;
    }
    .el-button-group {
      margin-right: 10px;
      .el-button {
        margin-right: 0px;
      }
    }
  }
  /deep/.top_right_col {
    float: right;
    margin-bottom: 10px;
    .el-button {
      margin-right: 10px;
    }
  }
  /deep/.demo-form-inline {
    /deep/.el-col-6 {
      margin-bottom: 10px;
    }
  }
}
/deep/.clearfix:after {
  content: '';
  display: block;
  height: 0;
  clear: both;
  visibility: hidden;
}
/deep/.my-draft__icon {
  margin-right: 5px;
}
/deep/.el-dropdown .el-button-group .el-dropdown__caret-button {
  &::before {
    width: 0;
  }
}
</style>

<style lang="scss">
@import '@/assets/css/change-font.scss';
.el-select-dropdown__item {
  * {
    font-size: $define-main-fontSize;
  }
}
</style>