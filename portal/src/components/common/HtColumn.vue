<template>
  <div class="el-card box-card is-always-shadow" ref="col" v-show="canDisplay">
    <div class="el-card__header" v-if="!isTab">
      <div class="clearfix">
        <span>{{ column.name }}</span>
        <div style="float: right" class="btn">
          <el-button
            type="text"
            style="color: rgba(85, 85, 85, 1)"
            v-if="column.colUrl"
            @click="openMore(column.colUrl)"
            title="更多"
          >
            <!-- <i class="el-icon-more" ></i> -->
            更多
          </el-button>
          <el-button type="text" @click="refresh" title="刷新">
            <i class="el-icon-refresh"></i>
          </el-button>
          <!-- <el-button  type="text" @click="close" title="移除">
            <i class="el-icon-close"></i>
          </el-button> -->
        </div>
      </div>
    </div>
    <div class="column-body" ref="colBody" v-loading="loading">
      <v-runtime-template
        :template="column.html ? column.html : html"
        v-if="isCommon"
        ref="homeHtmlTemplate"
      />
      <eip-chart :id="chartId" v-if="isChart" />
      <chart :option="reportOption" :index="1" v-if="isReport" />
      <custom-dialog-show-detail
        v-if="isCustomDialog"
        ref="customDialogShowDetail"
        :alias="customDialog.alias"
        :custom-dialog="customDialog"
      />
      <template-preview
        :templateKey="templateKey"
        single="true"
        v-if="isTemplate"
      ></template-preview>
    </div>
    <div class="column-footer">
      <el-pagination
        v-if="column.needPage == 1"
        :current-page.sync="pageBean.page"
        :page-size="pageBean.pageSize"
        :total="pageBean.total"
        layout="prev, pager, next,total"
      ></el-pagination>
    </div>
  </div>
</template>
<script>
import req from '@/request.js'
import VRuntimeTemplate from 'v-runtime-template'
import {mapState, mapGetters} from 'vuex'
import homeTodo from '@/components/home/homeTodo.vue'
import todayMeeting from '@/components/home/todayMeeting.vue'
import oftenFlow from '@/components/home/oftenFlow.vue'
import oftenFlowList from '@/components/home/oftenFlowList.vue'
import homeNotice from '@/components/home/homeNotice.vue'
import homeNews from '@/components/home/homeNews.vue'
import homeCarousel from '@/components/home/homeCarousel.vue'
import homeNewsList from '@/components/home/homeNewsList.vue'
import oftenSystem from '@/components/home/oftenSystem.vue'
import customChart from '@/components/home/customChart.vue'
const eipChart = () => import('@/components/form/chart/EipChart.vue')
const chart = () => import('@/components/form/chart/Chart.vue')
import CustomDialogShowDetail from '@/components/dialog/CustomDialogShowDetail.vue'
import homeInst from '@/components/home/homeInst.vue'
let Base64 = require('js-base64').Base64
const templatePreview = () =>
  import('@/components/dataTemplate/templatePreview.vue')
import hotentUiUtils from '@/hotent-ui-util.js'
//ccwgq 2022-07-20---增加合同范本 门户设计
import contractModel from '@/components/home/ou/contractModel.vue'
//新增流程中心，合同范本/通用调款库
import processCenter from '@/components/home/ou/processCenter.vue'
import contractModelCommon from '@/components/home/ou/contractModelCommon.vue'
const STATUS = {
  NORMAL: '待办',
  TRANSFORMED: '流转',
  TRANSFORMEDINQU: '征询',
  DELIVERTO: '转办',
  FOLLOW: '跟踪',
  COMMU: '沟通',
  BACK: '驳回',
  ADDSIGN: '会签加签',
  AGENT: '委托',
  SHARE: '共享',
  BACKSHARE: '驳回共享',
  APPROVELINEED: '并行审批',
  SIGNSEQUENCEED: '顺序签署',
  SIGNLINEED: '并行签署',
  USERADDSIGN: '用户会签'
}

export default {
  name: 'ht-column',
  components: {
    VRuntimeTemplate,
    homeTodo,
    todayMeeting,
    oftenFlow,
    oftenFlowList,
    homeNotice,
    homeNews,
    homeCarousel,
    oftenSystem,
    customChart,
    eipChart,
    chart,
    homeNewsList,
    CustomDialogShowDetail,
    homeInst,
    templatePreview,
    //ccwgq
    contractModel,
    //wjc
    processCenter,
    contractModelCommon
  },
  props: {
    columnAlias: {
      type: String,
      required: true
    },
    // 是否来自于预览页面
    fromPreview: {
      type: Boolean,
      default: false
    }, //是否存在tab标签中
    isTab: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      status: STATUS,
      loading: true,
      html: '<span>本栏目无模板</span>',
      data: {},
      column: {colUrl: ''},
      isCommon: false,
      isChart: false,
      isReport: false,
      isCustomDialog: false,
      customDialog: {alias: ''},
      pageBean: {page: 1, pageSize: 10, total: 0, showTotal: false},
      canDisplay: true,
      isTemplate: false,
      templateKey: ''
    }
  },
  //所有的columns别名，采用逗号分割
  computed: {
    ...mapState({
      columnDataLoadedAliases: state => state.menu.columnDataLoadedAliases
    }),
    ...mapGetters('menu', ['getColumnDataWithAlias'])
  },
  watch: {
    'column.colHeight': function(val) {
      if (val && val > 0) {
        this.$refs.colBody.style.height = val + 'px'
      }
    },
    'pageBean.page': function(val) {
      if (val && val > 0 && this.column.needPage == 1) {
        this.load()
      }
    },
    //TODO:此处的逻辑存在问题
    //导致组件的_watcher 实例下的deps[4].subs[1]的watcher报错
    columnDataLoadedAliases: {
      handler: function(v) {
        v &&
          this.handleColumnData(
            // this.$store.getters['menu/getColumnDataWithAlias'](this.columnAlias)
            this.getColumnDataWithAlias(this.columnAlias)
          )
      },
      immediate: true
    }
  },
  created() {
    this.load(true)
  },
  methods: {
    // lyzcw: 2022-07-28 支持子组件修改“更多”地址
    changeColUrl(colUrl) {
      this.column.colUrl = colUrl
    },
    handleTodoListClick(item) {
      this.$router.push('/v-flow/v-todo/' + item.orgName + '/' + item.orgId)
    },
    openMore(url) {
      let suffix = 'from=home'
      suffix = url.indexOf('&') > -1 ? '&' + suffix : '?' + suffix
      this.$router.push({path: `${url}${suffix}`})
    },
    refresh() {
      this.load()
    },
    close() {
      this.$refs.col.remove()
    },
    load(batch) {
      // 多个栏目一起请求时，合并为一次请求后台
      if (batch) {
        // 不需要回调处理数据，通过vuex监听数据更新
        this.$store.dispatch('menu/getColumnByAliasBatch', this.columnAlias)
      } else {
        this.loading = true
        this.$store
          .dispatch('menu/getColumnByAlias', this.columnAlias)
          .then(data => {
            this.handleColumnData(data)
          })
      }
    },
    handleColumnData(data) {
      if (!data) {
        this.loading = false
        this.canDisplay = false
        return
      }
      this.column = data
      //计算该栏目是否展示
      if (this.fromPreview) {
        this.canDisplay = true
      } else {
        this.canDisplay = this.column.displayRights
      }
      //如果无展示权限，则不进行栏目数据渲染了，并隐藏整个组件
      if (!this.canDisplay) {
        this.loading = false
        return
      }
      if (
        this.column &&
        (this.column.colType == 1 || this.column.colType == 4)
      ) {
        let dataParam = JSON.parse(this.column.dataParam)
        if (dataParam.chartType == 2) {
          this.chartId = dataParam.id
          this.isChart = true
          this.loading = false
        } else {
          this.isReport = true
          this.getChartsData(dataParam.id)
        }
      } else {
        //自定义对话框
        if (this.column.dataMode === 1) {
          this.getCustomDialogData()
        }
        //restful查询
        else if (this.column.dataMode === 3) {
          this.isCommon = true
          this.getDataToParse()
        } else if (this.column.dataMode === 4) {
          //数据报表
          if (this.column.dataFrom) {
            let dataFrom = JSON.parse(this.column.dataFrom)
            this.templateKey = dataFrom.alias
          }
          this.isTemplate = true
          this.loading = false
        } else {
          this.isCommon = true
          this.dencodeHtml()
          this.loading = false
        }
      }
    },
    //图标
    getChartsData(id) {
      this.$store.dispatch('storeProcess/getEchartData', id).then(response => {
        this.data = response.options
        this.loading = false
        this.dencodeHtml()
      })
    },
    getDataToParse() {
      let column = this.column
      if (!column.dataFrom) {
        this.dencodeHtml()
        this.loading = false
        return
      }
      if (column.colType != 1) {
        //post请求参数
        let queryParams = {}
        //如果需要分页
        if (column.needPage === 1) {
          queryParams.pageBean = this.pageBean
        }
        //get请求参数
        let urlParam = ''
        if (column.dataParam) {
          let ctx = {}
          const curUserDetail = this.$store.state.user.currentUserDetail
          if (curUserDetail && curUserDetail.user) {
            ctx.curUserAccount = curUserDetail.user.account
            ctx.curUserId = curUserDetail.user.id
          }
          column.dataParam = hotentUiUtils.parseExp(column.dataParam, ctx)
        }
        let dataParam = JSON.parse(
          typeof column.dataParam != 'undefined' && column.dataParam != ''
            ? column.dataParam.replace(/\\\\/g, '\\')
            : '[]'
        )
        if (dataParam) {
          for (var i = 0; i < dataParam.length; i++) {
            var value = dataParam[i]['value']
            var name = dataParam[i]['name']
            if (column.requestType == 'POST') {
              try {
                value = JSON.parse(value)
              } catch (e) {}
              queryParams[name] = value
              //如果参数中也设置了分页
              if (name === 'pageBean') {
                this.pageBean = value
              }
            } else {
              urlParam =
                i > 0
                  ? urlParam + '&' + name + '=' + value
                  : '?' + name + '=' + value
            }
          }
        }
        //请求获取数据
        if (column.requestType && column.requestType == 'POST') {
          req.post(column.dataFrom, queryParams).then(
            response => {
              this.data = response.data
              this.loading = false
              if (this.column.needPage === 1) {
                this.pageBean.page = this.data.page || 1
                this.pageBean.pageSize = this.data.pageSize || 10
                this.pageBean.total = this.data.total || 0
              }
              this.dencodeHtml()
            },
            err => {
              this.loading = false
              this.html = `<span style='color:red;'>${err}</span>`
            }
          )
        } else {
          req.get(column.dataFrom + urlParam).then(
            response => {
              this.data = response.data
              this.loading = false
              this.dencodeHtml()
            },
            err => {
              this.loading = false
              this.html = `<span style='color:red;'>${err}</span>`
            }
          )
        }
      }
    },
    getCustomDialogData() {
      let this_ = this
      let dataFrom = JSON.parse(this.column.dataFrom || '{}')
      if (!dataFrom.alias) {
        this_.loading = false
        this_.isCommon = true
        this.dencodeHtml()
        return
      }
      let url =
        '${form}/form/customDialog/v1/getByAlias?alias=' + dataFrom.alias
      req.get(url).then(function(customDialog) {
        customDialog = customDialog.data
        //格式化对话框的显示字段、返回字段、条件字段、排序字段
        customDialog.displayfield = JSON.parse(customDialog.displayfield)
        for (let i = 0; i < customDialog.displayfield.length; i++) {
          customDialog.displayfield[i].field = customDialog.displayfield[
            i
          ].field.toUpperCase()
        }
        customDialog.resultfield = JSON.parse(customDialog.resultfield)
        customDialog.sortfield = JSON.parse(customDialog.sortfield)
        customDialog.conditionfield = JSON.parse(customDialog.conditionfield)
        //列表
        if (customDialog.style == 0) {
          this_.customDialog = customDialog
          this_.isCustomDialog = true
          this_.loading = false
          setTimeout(() => {
            this_.$refs.customDialogShowDetail.initData() //显示自定义对话框列表预览弹框
          })
        }
      })
    },
    dencodeHtml() {
      if (this.column.templateHtml) {
        this.column.html = Base64.decode(this.column.templateHtml)
      } else {
        if (Array.isArray(this.data)) {
          this.reportOption = this.data[0]
        }
      }
    },
    handleRowClick(url, newWin) {
      if (url && (url.startsWith('/inst/') || url.startsWith('/start/'))) {
        this.handleOpenUrl(url, newWin)
        return
      }
      this.$router.push(url)
    },
    handleTodoClick(row, newWin) {
      if (row.status == 'SHARE' || row.status == 'BACKSHARE') {
        if (row.identityList && row.identityList.length == 1) {
          this.handleOpenUrl(
            '/task/' + row.id + '/' + row.identityList[0].id,
            newWin
          )
        } else {
          let html =
            '<select ref=' +
            Math.random() +
            ' id="approvalLeaderSelect" style="width: 200px;height: 30px;border-radius: 4px;margin: 20px 70px;" ><option value="">请选择</option>'
          row.identityList.forEach(identity => {
            html +=
              '<option value="' +
              identity.id +
              '">' +
              identity.name +
              '</option>'
          })
          html += '</select>'
          let this_ = this
          this.$alert(html, '请选择一个领导代为审批', {
            dangerouslyUseHTMLString: true,
            beforeClose: function(action, instance, done) {
              if (action == 'confirm') {
                let se = document.getElementById('approvalLeaderSelect')
                if (se.selectedIndex == 0) {
                  this.$message.warning('请选择代为审批的领导')
                } else {
                  instance.close()
                  this_.handleOpenUrl(
                    '/task/' + row.id + '/' + se[se.selectedIndex].value,
                    newWin
                  )
                }
              } else {
                instance.close()
              }
            }
          })
        }
      } else if (
        row.status == 'AGENT' &&
        row.ownerId != row.assigneeId &&
        row.ownerId == this.$store.state.login.currentUser.userId
      ) {
        //委托任务
        this.handleOpenUrl('/instRead/' + row.procInstId + '/agent', newWin)
      } else {
        this.handleOpenUrl('/task/' + row.id + '/0', newWin)
      }
    },
    handleOpenUrl(url, newWin) {
      if (!newWin) {
        this.$router.push(url)
        return
      }
      if (!url) {
        return
      }
      let token = this.$store.state.login.currentUser.token
      if (!url.toLowerCase().startsWith('http')) {
        url = window.context.front + url
      }
      if (url.indexOf('?') == -1) {
        url = url + '?token=' + token
      } else {
        url = url + '&token=' + token
      }
      window.open(url, '_self')
    },
    clickApp(app) {
      //1常规应用 2数据报表 3自定义视图 4图表
      if (app.type == 4) {
        let content = JSON.parse(app.content)
        this.$router.push({
          path: 'appContent',
          query: {id: content.id, type: app.type}
        })
      } else if (app.type === 2) {
        let content = JSON.parse(app.content)
        this.$router.push({
          path: 'appContent',
          query: {key: content.key, type: app.type}
        })
      } else if (app.type === 3) {
        let content = JSON.parse(app.content)
        this.$router.push({
          path: 'appContent',
          query: {
            alias: content.alias,
            sqlAlias: content.sqlAlias,
            type: app.type
          }
        })
      } else if (app.type === 1) {
        this.$router.push({
          path: 'appContent',
          query: {id: app.id, type: app.type}
        })
      } else if (app.type === 6) {
        let content = JSON.parse(app.content)
        this.$router.push({
          path: 'appContent',
          query: {id: content.id, type: app.type}
        })
      } else if (app.type === 7) {
        this.$router.push({
          path: 'appContent',
          query: {path: app.content, type: app.type}
        })
      }
    }
  },
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
.el-card {
  margin-bottom: 20px;
}
.el-card__header {
  padding-top: 13px;
  padding-bottom: 13px;
}
.el-card__header span {
  font-size: 18px;
  font-weight: 900;
  border-left: 5px solid #2761ff;
  padding-left: 5px;
}

.column-body {
  padding: 0 10px 0 20px;
  height: 100%;
  overflow-y: auto;
}

.column-footer {
  text-align: center;
  color: grey;
}

/deep/ .todo-subject {
  cursor: pointer;
}

/deep/ .todo-subject {
  color: $--theme-color;
}
.btn /deep/ i {
  font-size: 15px;
  font-weight: 900;
  color: #9e9e9e;
}
.btn /deep/ .el-button {
  padding: 3px 0;
}
.btn /deep/ i:hover {
  transform: scale(1.4);
  -webkit-transform: scale(1.5);
  -moz-transform: scale(1.5);
  color: $--theme-color;
}
</style>
