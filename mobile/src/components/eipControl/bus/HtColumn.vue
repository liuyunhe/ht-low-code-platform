<template>
  <div class="el-card box-card " ref="col" v-show="canDisplay">
    <div class="el-card__header" v-if="!isTab">
      <div class="clearfix">
        <span>{{ column.name }}</span>
        <div style="float: right">
          <el-button
            style="padding: 3px 0"
            type="text"
            v-if="column.colUrl"
            @click="openMore(column.colUrl)"
            title="更多"
          >
            <i class="el-icon-more" style="font-weight: bold; font-size:16px;"></i>
          </el-button>
          <el-button
            style="padding: 3px 0"
            type="text"
            @click="refresh"
            title="刷新"
          >
            <i class="el-icon-refresh" style="font-weight: bold;font-size:16px;"></i>
          </el-button>
          <el-button
            style="padding: 3px 0"
            type="text"
            @click="close"
            title="移除"
          >
            <i class="el-icon-close" style="font-weight: bold; font-size:16px;"></i>
          </el-button>
        </div>
      </div>
    </div>
    <div class="column-body" ref="colBody" v-loading="loading">
      <v-runtime-template
        :template="column.html ? column.html : html"
        ref="homeHtmlTemplate"
        v-if="isCommon"
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
        small
        layout="prev, pager, next,total"
      ></el-pagination>
    </div>
  </div>
</template>
<script>
import req from '@/request.js'
import portal from '@/api/portal.js'
import flow from '@/api/flow.js'
import VRuntimeTemplate from 'v-runtime-template'
const eipChart = () => import('@/components/eipControl/bus/EipChart.vue')
const chart = () => import('@/components/eipControl/bus/Chart.vue')
const indexNewsColumn = () =>
  import('@/components/eipControl/bus/IndexNewsColumn.vue')
import CustomDialogShowDetail from '@/components/form/CustomDialogShowDetail.vue'
import TemplatePreview from '@/components/dataTemplate/templatePreview.vue'
import HtChart from "@/components/common/HtChart"
import hotentUiUtils from '@/hotent-ui-util.js'

export default {
  name: 'ht-column',
  components: {
    VRuntimeTemplate,
    eipChart,
    chart,
    CustomDialogShowDetail,
    indexNewsColumn,
    TemplatePreview,
    HtChart
  },
  props: {
    columnAlias: {
      type: String,
      required: true,
    },
    // 是否来自于预览页面
    fromPreview: {
      type: Boolean,
      default: false,
    },
    isTab: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isCommon: false,
      isChart: false,
      isReport: false,
      isCustomDialog: false,
      chartId: '',
      reportOption: {},
      loading: true,
      html: '<span>本栏目无模板</span>',
      data: {},
      column: {},
      customDialog: {alias: ''},
      pageBean: {page: 1, pageSize: 10, total: 0, showTotal: true},
      canDisplay: true,
      isTemplate: false,
      templateKey: '',
    }
  },
  watch: {
    'column.colHeight': function (val) {
      if (val && val > 0) {
        this.$refs.colBody.style.height = val + 'px'
      }
    },
    'pageBean.page': function (val) {
      if (val && val > 0 && this.column.needPage == 1) {
        this.load()
      }
    },
  },
  mounted() {
    this.load()
  },
  methods: {
    openMore(url) {
      this.$router.push({path: url})
    },
    refresh() {
      this.load()
    },
    close() {
      this.$refs.col.remove()
    },
    load() {
      this.loading = true
      req
        .get(
          window.context.portal +
            '/portal/sysIndexColumn/sysIndexColumn/v1/getByAlias?alias=' +
            this.columnAlias
        )
        .then((response) => {
          let data = response.data
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

          if (this.column.colType && this.column.colType == 1) {
            let dataParam = JSON.parse(this.column.dataParam)
            if (dataParam.chartType == 2) {
              this.chartId = dataParam.id
              this.isChart = true
              this.loading = false
            } else {
              this.isReport = true
              this.getChartsData(dataParam)
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
        })
    },
    //图标
    getChartsData(dataParam) {
      req
        .get(
          window.context.bpmRunTime +
            '/runtime/report/v1/getEchartsData?reportId=' +
            dataParam.id
        )
        .then(
          (response) => {
            if (response && response.value) {
              let opt = response.value
              if (opt.constructor == Array) {
                opt = opt[0]
              }
              this.reportOption = {...opt}
            }
            this.loading = false
          },
          (err) => {
            this.loading = false
            this.html = `<span style='color:red;'>${err}</span>`
          }
        )
    },
    getDataToParse() {
      let column = this.column
      if (!column.dataFrom) {
        this.dencodeHtml()
        this.loading = false
        return
      }
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
        const curUser = this.$store.state.login.currentUser
        if (curUser) {
          ctx.curUserAccount = curUser.account
          ctx.curUserId = curUser.userId
        }
        column.dataParam = hotentUiUtils.parseExp(column.dataParam, ctx)
      }
      let dataParam = JSON.parse(column.dataParam || '[]')
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
          (response) => {
            this.data = response.data
            this.loading = false
            if (this.column.needPage === 1) {
              this.pageBean.page = this.data.page || 1
              this.pageBean.pageSize = this.data.pageSize || 10
              this.pageBean.total = this.data.total || 0
            }
            this.dencodeHtml()
          },
          (err) => {
            this.loading = false
            this.html = `<span style='color:red;'>${err}</span>`
          }
        )
      } else {
        req.get(column.dataFrom + urlParam).then(
          (response) => {
            this.data = response.data
            this.loading = false
            this.dencodeHtml()
          },
          (err) => {
            this.loading = false
            this.html = `<span style='color:red;'>${err}</span>`
          }
        )
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
      req.get(url).then(function (customDialog) {
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
      let Base64 = require('js-base64').Base64
      if (this.column.templateHtml) {
        this.column.html = Base64.decode(this.column.templateHtml)
      }
    },
    handleTodoClick(row) {
      if (row.status == 'SHARE' || row.status == 'BACKSHARE') {
        if (row.identityList && row.identityList.length == 1) {
          this.$router.push('/task/' + row.id + '/' + row.identityList[0].id)
        } else {
          let html =
            '<select ref=' +
            Math.random() +
            ' id="approvalLeaderSelect" style="width: 200px;height: 30px;border-radius: 4px;margin: 20px 70px;" ><option value="">请选择</option>'
          row.identityList.forEach((identity) => {
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
            beforeClose: function (action, instance, done) {
              if (action == 'confirm') {
                let se = document.getElementById('approvalLeaderSelect')
                if (se.selectedIndex == 0) {
                  this.$message.warning('请选择代为审批的领导')
                } else {
                  instance.close()
                  this_.$router.push(
                    '/task/' + row.id + '/' + se[se.selectedIndex].value
                  )
                }
              } else {
                instance.close()
              }
            },
          })
        }
      } else if (
        row.status == 'AGENT' &&
        row.ownerId != row.assigneeId &&
        row.ownerId == this.$store.state.login.currentUser.userId
      ) {
        //委托任务
        this.$router.push('/instRead/' + row.procInstId + '/agent')
      } else {
        this.$router.push('/task/' + row.id + '/0')
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.el-card {
  margin-bottom: 10px;
  border-radius: 10px;
  color: #333;
}
/deep/.el-card__header {
  padding: 10px 16px;
  border-bottom: none;
}
.el-card__header span {
  font-size: 16px;
  font-weight: 700;
}
.column-body {
  // padding: 0 10px 0 20px;
  height: 100%;
  // overflow-y: auto;
  #app{
    padding: 0 16px;
    /deep/.flow__items{
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }
  }
}
/deep/.container {
  padding-bottom: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .container_icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    font-size: 20px;
    color: #fff;
    line-height: 40px;
    text-align: center;
  }
  .icon__blue__bg {
    background: rgba(54, 143, 255, 1);
  }
  .icon__pink__bg {
    background: rgba(255, 120, 110, 1);
  }
  .icon__deep__blue__bg {
    background: rgba(77, 119, 255, 1);
  }
  .icon__yellow__bg {
    background: rgba(255, 155, 89, 1);
  }
  .icon__purple__bg {
    background: rgba(82, 98, 255, 1);
  }
  .icon__green__bg {
    background: rgba(87, 202, 176, 1);
  }
  .container_box {
    text-align: center;
    .container_box_title,
    .container_box_count {
      margin: 6px 0 0 0;
      font-size: 13px;
      font-family: 'Microsoft YaHei';
      font-weight: 500;
      color: rgb(19, 18, 18);
    }
    .container_box_count{
      margin-top: 0;
    }
  }
}
.column-footer {
  text-align: center;
  color: grey;
}
/* 我的首页栏目样式 */
/deep/.my-home {
  background-image: url('../../../assets/img/home_bg.png');
  height: 208px;
  text-align: center;
  margin-top: -17px;
  .my-home__title {
    font-weight: 550;
    font-size: 17px;
    padding-top: 20px;
    color: #fff;
  }
  .my-home__btn {
    width: 117px;
    height: 32px;
    line-height: 32px;
    color: #3db3d7;
    border: 1px solid #fff;
    background: #fff;
    border-radius: 16px;
    margin: 20px auto;
  }
}
</style>
