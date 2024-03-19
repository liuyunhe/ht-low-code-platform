<template>
  <ht-runtime-template
    :sqlAlias="sqlAlias"
    :alias="alias"
    :single="single"
    :queryView="queryView"
    class="data-preview-wrap"
  />
</template>

<script>
import {mapState, mapActions} from 'vuex'
import {Message} from 'element-ui'
import {Loading} from 'element-ui'
import HtCheckbox from '@/components/control/HtCheckbox.vue'
import HtDialog from '@/components/control/HtDialog.vue'
import HtDialogBtn from '@/components/control/htDialogBtn.vue'
import utils from '@/utils.js'
import req from '@/request.js'
import {Base64} from 'js-base64'
import Vue from 'vue'
import moment from 'moment'

export default {
  name: 'dynamic-view',
  props: {
    single: String,
    sqlAlias: String,
    alias: String,
    html: String,
    queryView: Object
  },
  created() {
    this.init()
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
      const _this = this
      Vue.component('ht-runtime-template', {
        props: {
          single: String,
          sqlAlias: String,
          alias: String,
          html: String,
          queryView: Object
        },
        template: this.html,
        data() {
          return {
            bpmRunTime: window.context.bpmRunTime,
            fileList: [],
            tableData: {selectRows: [], querys: ''},
            dialogExportVisible: false,
            exportData: {getType: 'all', expField: []},
            exportSellection: [],
            searchForm: {},
            displayFields: [],
            alarmSettingMap: {},
            summaryTypeMap: {},
            queryForm: {
              queryData: ''
            },
            uploadParams: {id: []},
            formType: false,
            labelPosition: 'left',
            incons: 'el-icon-arrow-down',
            formatterMap: {},
            options: {
              fullscreen: true,
              lock: true
            },
            uploadError: '/runtime/photoErrorCsv/v1/uploadErrorList',
            upoadPdfToAzure:
              window.context.bpmRunTime + '/runtime/blob/v1/upoadPdfToAzure',
            uploadUnprepare: '/runtime/blob/v1/upoadToAzure',
            summarySetting: [],
            activeNames: ['1']
          }
        },
        computed: mapState({
          rows: state => state.form.querySqlViewRows,
          pagination: state => state.form.querySqlViewPagination,
          total: state => state.form.querySqlViewTotal,
          uploadHeaders: state => {
            return {Authorization: `Bearer ${state.login.currentUser.token}`}
          },
          uploadErrorHttp() {
            return this.bpmRunTime + this.uploadError
          },
          uploadUnprepareHttp() {
            return this.bpmRunTime + this.uploadUnprepare
          },
          isMobile() {
            return navigator.userAgent.match(
              /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
            )
          }
        }),
        components: {
          HtCheckbox,
          HtDialog,
          HtDialogBtn
        },
        watch: {
          formKey: function(newVal) {
            if (newVal) {
              this.init()
            }
          },
          'tableData.selectRows': function(newVal) {
            if (newVal.length > 0) {
              let me_ = this
              me_.uploadParams.id = []
              newVal.forEach(item => {
                me_.uploadParams.id.push(item.INSTID)
              })
            }
          },
          $route: 'init',
          queryView: {
            handler(newVal, oldVal) {
              if (newVal.shows) {
                this.init()
                let displayField = utils.parseToJson(newVal.shows)
                for (var i = 0; i < displayField.length; i++) {
                  if (displayField[i].hidden == 0) {
                    this.displayFields.push(displayField[i])
                    if (displayField[i].summaryType) {
                      this.summaryTypeMap[displayField[i].fieldName] =
                        displayField[i].summaryType
                    }
                  }
                  if (displayField[i].formater) {
                    this.formatterMap[displayField[i].fieldName] =
                      displayField[i].formater
                  }
                  if (displayField[i].alarmSetting) {
                    this.alarmSettingMap[displayField[i].fieldName] =
                      displayField[i].alarmSetting
                  }
                }
              }
              if (newVal.summarySetting) {
                this.summarySetting = JSON.parse(newVal.summarySetting)
              }
            },
            immediate: true
          }
        },
        methods: {
          //todo:没有init方法浏览器真的在报错
          init() {},
          //ccwgq:2022-05-11 合同按标的金额统计 专用 传入标的金额
          matterFilter(title) {
            let begin = 0
            let end = 999_9999
            if (title == '1000-5000万') {
              begin = 1000_0000
              end = 4999_9999
            } else if (title == '1000万以下') {
              begin = 0
              end = 999_9999
            } else if (title == '5000万以上') {
              begin = 5000_0000
              end = 9999_9999_9999
            }

            const query = [
              {
                property: 'matter_amt',
                value: [begin, end],
                group: 'main',
                operation: 'BETWEEN',
                relation: 'AND'
              }
            ]
            const params = encodeURIComponent(
              Base64.encode(JSON.stringify(query))
            )

            this.$router.push(
              `/business_center/template/preview/ht?parameterqQuerys=${params}`
            )
          },
          // 2021-8-23 ccwgq   分析路由参数实现数据的过滤  追加搜索框的隐藏逻辑
          //例如初次过滤时带回了合同名，过滤条件的合同名搜索框最好隐藏
          decodeRouterQuery() {
            const parameterqQuerys = this.$route.query.parameterqQuerys
            if ($.isEmptyObject(parameterqQuerys)) {
              return null
            } else {
              let params = Base64.decode(decodeURI(parameterqQuerys))
              params = JSON.parse(params)
              // console.log("解析得到的必填参数===>",params);
              let querys = []
              if (typeof params !== 'undefined' && params.length) {
                //解析拼接参数
                params.forEach(item => {
                  if (item['property']) {
                    querys.push({
                      property: item['property'].toUpperCase(),
                      value: item['value'],
                      group: item['group'],
                      operation: item['operation'],
                      relation: 'AND'
                    })
                  }
                })
              }
              return querys
            }
          },
          //打印
          printList() {
            document.body.innerHTML = document.getElementById(
              'printData'
            ).innerHTML
            window.print()
            location.reload()
          },
          //生成二维码
          //路由跳转
          routerPush(url) {
            this.$router.push(url)
          },
          // yigz 2022-10-17:添加跳转新窗口的方法
          routerPushNewWindow(url) {
            // window.open('/fvue'+url)
            window.open(url)
          },
          //查看与处理流程按钮
          dispose(row) {
            let url
            if (row.TASKID) {
              //审批任务
              url = '/task/' + row.TASKID
            } else {
              //查看流程实例
              url = '/inst/' + row.INSTID
            }
            this.$router.push(url)
          },

          handleSizeChange: function(size) {
            //每页下拉显示数据
            this.$store.dispatch('form/setQuerySqlViewPaginationSize', size)
            this.search()
          },
          handleCurrentChange: function(currentPage) {
            //点击第几页
            this.$store.dispatch(
              'form/setQuerySqlViewPaginationPageNum',
              currentPage
            )
            this.search()
          },
          //回车查询
          searchEnterFun: function(e) {
            let keyCode = window.event ? e.keyCode : e.which
            if (keyCode == 13) {
              this.search('find')
            }
          },
          //2021-08-23  ccwgq  加入自定义数据过滤
          search(str) {
            const loading = this.$loading(this.options)
            let params = {}
            if (str == 'find') {
              this.$store.dispatch('form/setQuerySqlViewPaginationPageNum', 1)
            }
            //判断为合并查询还是分开查询
            if (this.formType) {
              params = this.getQueryFilter()
            } else {
              //判断是否配置了合并查询
              if ($('.search-query').length > 0) {
                console.log('getConditionQuery')
                params = this.getConditionQuery()
              } else {
                params = this.getQueryFilter()
              }
            }
            //2021-08-23 ccwgq  补充数据过滤
            const addQuerys = this.decodeRouterQuery()
            if (addQuerys !== null && addQuerys.length) {
              let querys = params.pagination.querys || []
              querys.concat(addQuerys)
              params.pagination.querys = querys
            }
            //  -----------------------------------------
            if ($.isEmptyObject(this.searchForm)) {
              this.$store
                .dispatch('form/getQuerySqlViewByPagination', params)
                .then(() => {
                  loading.close()
                })
            } else {
              this.$store
                .dispatch('form/getQuerySqlViewByPagination', params)
                .then(() => {
                  loading.close()
                })
            }
          },
          getQueryFilter() {
            let operationMap = this.getSearchItems() //查询条件类型
            let fieldQueryMap = this.getFieldQuery() //查询条件字段
            let specialMap = this.getSpecialMap() //获取特殊查询情况（自定义对话框）
            let querys = [] //查询条件
            let queryFilter = {}
            let pageBean = {pageBean: this.pagination}
            let params = {sqlAlias: this.sqlAlias, alias: this.alias}
            params.pagination = pageBean
            if ($.isEmptyObject(this.searchForm)) {
              return params
            } else {
              for (var key in this.searchForm) {
                if (
                  typeof this.searchForm[key] != 'undefined' &&
                  this.searchForm[key] != ''
                ) {
                  if (this.searchForm[key] instanceof Array) {
                    if (operationMap[key] === 'BETWEEN') {
                      let valueArray = []
                      for (let i = 0; i < this.searchForm[key].length; i++) {
                        valueArray.push(this.searchForm[key][i])
                      }
                      querys.push({
                        property: key,
                        value: valueArray.join(','),
                        group: 'main',
                        operation: operationMap[key],
                        relation: 'AND'
                      })
                    } else {
                      for (let i = 0; i < this.searchForm[key].length; i++) {
                        querys.push({
                          property: key,
                          value: this.searchForm[key][i],
                          group: 'main',
                          operation: operationMap[key],
                          relation: 'AND'
                        })
                      }
                    }
                  } else if (
                    this.searchForm[key].includes(',') &&
                    !specialMap[key]
                  ) {
                    let arr = this.searchForm[key].split(',')
                    for (let i = 0; i < arr.length; i++) {
                      if (
                        arr[i] == '' ||
                        arr[i] == null ||
                        typeof arr[i] == 'undefined'
                      ) {
                        arr.splice(i, 1)
                        i = i - 1
                      }
                    }
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
                    querys.push({
                      property: key,
                      value: this.searchForm[key],
                      group: 'main',
                      operation: operationMap[key],
                      relation: 'AND'
                    })
                  }
                }
              }
              queryFilter = {pageBean: this.pagination, querys}
              params.pagination = queryFilter
              return params
            }
          },
          //获取查询条件类型
          getSearchItems() {
            let searchItems = $('.search-item')
            let operationMap = {} //查询条件类型
            let operationType = {
              LK: 'LIKE',
              EQ: 'EQUAL',
              between: 'BETWEEN',
              LFK: 'LEFT_LIKE',
              RHK: 'RIGHT_LIKE',
              NE: 'NOT_EQUAL',
              LT: 'LESS',
              LE: 'LESS_EQUAL',
              GT: 'GREAT',
              GE: 'GREAT_EQUAL'
            }
            if (searchItems) {
              for (var i = 0; i < searchItems.length; i++) {
                var operation = '='
                if (typeof $(searchItems[i]).attr('ht-query') != 'undefined') {
                  //查询条件类型
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
                  //查询条件类型
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
          //获取查询条件字段
          getFieldQuery() {
            let searchItems = $('.search-item')
            let fieldQueryMap = {} //查询条件字段

            if (searchItems) {
              for (var i = 0; i < searchItems.length; i++) {
                if (typeof $(searchItems[i]).attr('ht-query') != 'undefined') {
                  //查询条件字段
                  fieldQueryMap[$(searchItems[i]).attr('ht-query')] = $(
                    searchItems[i]
                  ).attr('field-query')
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
                  ] = $(searchItems[i])
                    .children()
                    .attr('field-query')
                }
              }
            }
            return fieldQueryMap
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
            let params = {sqlAlias: this.sqlAlias, alias: this.alias}
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
                var arr = values.split(',')
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
          reset() {
            this.queryForm.queryData = ''
            this.searchForm = {}
            this.search('find')
          },
          handleSelectionChange(val) {
            this.tableData.selectRows = val
          },

          selectable(row, index) {
            if (row.BATCH_COVER_FLAG != 'YES' && row.NODEID == 'UserTask171') {
              return true
            }
            return false
          },
          //点击导出按钮
          exports() {
            this.dialogExportVisible = true
          },

          punchOrder() {
            this.$store
              .dispatch('storeProcess/downLoadToFile', 'Batchkeijyo')
              .then(res => {})
          },

          handleRemove(file, fileList) {
            console.log(file, fileList)
          },
          beforeAvatarUpload(file) {
            var fileName = new Array()
            fileName = file.name.split('.')
            const extension = fileName[fileName.length - 1] === 'pdf'
            if (!extension) {
              this.$message({
                message: '上传模板只能是PDF格式!',
                type: 'warning'
              })
              return false
            }
            if (this.tableData.selectRows.length == 0) {
              this.$message({
                type: 'warning',
                message: '请选择要上传送付状的案件'
              })
              return false
            }
            return true
          },

          onSuccessUpload(response, file, fileLis) {
            this.$message.success('送付状成功')
            window.location.reload()
          },
          handlePreview(file) {},
          //确定导出
          submitExport() {
            if (!this.exportData || this.exportData.expField.length < 1) {
              this.$message({
                type: 'info',
                message: '请选择要导出的字段！'
              })
              return
            }
            let expField = ''
            for (var i = 0; i < this.exportData.expField.length; i++) {
              if (i > 0) {
                expField += ','
              }
              expField += this.exportData.expField[i].fieldName
            }
            expField = Base64.encode(expField).replace(/\+/g, '%2B')
            let params = {sqlAlias: this.sqlAlias, alias: this.alias}
            let data = {
              sqlAlias: this.sqlAlias,
              alias: this.alias,
              getType: this.exportData.getType,
              expField: expField
            }
            data.query = this.getQueryFilter().pagination
            let loadingInstance = Loading.service({fullscreen: true}) //开始
            this.$store.dispatch('form/querySqlViewExport', data).then(() => {
              loadingInstance.close() // 结束
              this.dialogExportVisible = false
            })
          },

          //取消导出
          exportCancel() {
            this.dialogExportVisible = false
            this.exportData.expField = []
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
                Vue.set(
                  this.displayFields,
                  index - 1,
                  this.displayFields[index]
                )
                Vue.set(this.displayFields, index, temp)
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
                Vue.set(
                  this.displayFields,
                  index + 1,
                  this.displayFields[index]
                )
                Vue.set(this.displayFields, index, i)
              }
            }
          },

          getSubEntsByFormKey(refId) {
            let _me = this
            _me.tabs = []
            if (!_me.ents || _me.ents.length < 1) {
              this.$store
                .dispatch('form/getSubEntsByFormKey', this.templateInfo.alias)
                .then(ents => {
                  _me.ents = ents
                  this.getSubData(_me, refId)
                })
            } else {
              this.getSubData(_me, refId)
            }
          },
          getSummaries(param) {
            let _summaryTypeMap = this.summaryTypeMap
            const {columns, data} = param
            const sums = []
            columns.forEach((column, index) => {
              if (index === 0) {
                sums[index] = '合计'
                return
              }
              if (
                _summaryTypeMap[column.property] &&
                _summaryTypeMap[column.property] == 'sum'
              ) {
                const values = data.map(item => Number(item[column.property]))
                if (!values.every(value => isNaN(value))) {
                  sums[index] = values.reduce((prev, curr) => {
                    const value = Number(curr)
                    if (!isNaN(value)) {
                      return prev + curr
                    } else {
                      return prev
                    }
                  }, 0)
                } else {
                  sums[index] = 'N/A'
                }
              }
            })

            return sums
          },
          columnFormatter(row, column, cellValue) {
            let formatter = this.formatterMap[column.property]
            if (formatter) {
              try {
                var script =
                  'var formatterFunction = function(row,column,cellValue){ ' +
                  formatter +
                  '};'
                var result = eval(
                  script + 'formatterFunction(row,column,cellValue);'
                )
                return result
              } catch (e) {
                return cellValue
              }
            } else {
              return cellValue
            }
          },
          dateFormatter(row, column, cellValue) {
            if (cellValue) {
              return cellValue.replace('.0', '')
            } else {
              return cellValue
            }
          },
          //lyzcw：2021-08-02 引入日期格式化，先安装：npm install moment --save
          dateFormat: function(row, column, cellValue) {
            var date = row[column.property]

            if (date == undefined || cellValue == '' || cellValue == null) {
              return ''
            }

            return moment(date).format('YYYY-MM-DD ')
          },
          //lyzcw：2021-08-12 引入月份格式化
          monthFormat: function(row, column, cellValue) {
            var date = row[column.property]

            if (date == undefined || cellValue == '' || cellValue == null) {
              return ''
            }

            return moment(date).format('YYYY-MM')
          },
          getAlarmColor(field, cellValue) {
            let alarmSetting = this.alarmSettingMap[field]
            let type = ''
            this.displayFields.forEach(item => {
              if (item.fieldName === field) {
                type = item.dataType
              }
            })
            if (alarmSetting) {
              try {
                let alarmSettingJson = utils.parseToJson(alarmSetting)
                let alarmScript = ''
                for (var i = 0; i < alarmSettingJson.length; i++) {
                  let alarm = alarmSettingJson[i]
                  let condition = alarm.condition
                  let conditionStr = ''
                  for (var m = 0; m < condition.length; m++) {
                    if (m > 0) {
                      conditionStr += ' && '
                    }
                    if (
                      type === 'number' ||
                      type === 'bigint' ||
                      type === 'int'
                    ) {
                      if (condition[m].op == 'indexOf' && condition[m].val) {
                        conditionStr =
                          conditionStr +
                          "'" +
                          cellValue +
                          "'.indexOf('" +
                          condition[m].val +
                          "')!=-1"
                      } else if (condition[m].op == 'notIndexOf') {
                        conditionStr =
                          conditionStr +
                          "'" +
                          cellValue +
                          "'.indexOf('" +
                          condition[m].val +
                          "')==-1"
                      } else {
                        conditionStr =
                          conditionStr +
                          cellValue +
                          condition[m].op +
                          condition[m].val
                      }
                    } else {
                      if (condition[m].op == 'indexOf' && condition[m].val) {
                        conditionStr =
                          conditionStr +
                          "'" +
                          cellValue +
                          "'.indexOf('" +
                          condition[m].val +
                          "')!=-1"
                      } else if (condition[m].op == 'notIndexOf') {
                        conditionStr =
                          conditionStr +
                          "'" +
                          cellValue +
                          "'.indexOf('" +
                          condition[m].val +
                          "')==-1"
                      } else {
                        conditionStr =
                          conditionStr +
                          "'" +
                          cellValue +
                          "'" +
                          condition[m].op +
                          "'" +
                          condition[m].val +
                          "'"
                      }
                    }
                    //conditionStr = conditionStr+cellValue+condition[m].op+condition[m].val;
                  }
                  if (i > 0) {
                    alarmScript += ' else '
                  }
                  let colorStr = 'color:' + alarm.color + ''
                  alarmScript =
                    alarmScript +
                    'if(' +
                    conditionStr +
                    "){return '" +
                    colorStr +
                    "';}"
                }
                if (alarmScript) {
                  alarmScript += 'else{ return "";}'
                  var script =
                    'var alarmFunction = function(){ ' + alarmScript + '};'
                  var result = eval(script + 'alarmFunction();')
                  return result
                } else {
                  return ''
                }
              } catch (e) {
                return ''
              }
            }
          },
          summary(method, field, decimal) {
            let list = this.rows
              .filter(item => item[field] !== undefined && item[field] !== '')
              .map(item => new Number(item[field]))
            if (method === 'count') {
              return list.length
            } else if (method === 'sum') {
              if (list.length > 0) {
                return list.reduce((a, b) => a + b).toFixed(decimal)
              } else {
                return 0
              }
              // return list.reduce((a, b) => a + b).toFixed(decimal)
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
          showSearchPane() {
            return true
          },
          //2022-09-20 yigz:根据表单列表的某一列的key和value值跳转并过滤对应的列表数据(注意：key必须是表单列表某一列的key，区分大小写)
          /**
           * formKey:过滤字段
           * value：值
           * formListAlias：表单列表别名
           */
          routerPushByFormKey(value, formKey, formListAlias) {
            let param = value[formKey]
            this.$router.push({
              // path: '/statement/template/preview/' + formListAlias,
              //2022-09-21 yigz:修改跳转路径为表单列表页面
              path: '/business_divide/template/preview/' + formListAlias,
              query: {formKey: formKey, value: param}
            })
          }
        }
      })
    }
  }
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
</style>