<template>
  <el-tabs v-model="activeName" type="card" @tab-click="changeTab">
    <!-- 待办公文 -->
    <el-tab-pane :label="map[0]['label']" :name="map[0]['name']">
      <el-table :data="tableData" align="left" v-loading="dataLoading">
        <el-table-column
          type="index"
          align="left"
          label="序号"
          width="50px"
        ></el-table-column>
        <el-table-column
          label="标题"
          align="left"
          width="220px"
          show-overflow-tooltip
        >
          <template slot-scope="scope" align="left">
            <span
              class="todo-subject"
              @click="handleTodoClick(scope.row)"
              @contextmenu.prevent="handleTodoClick(scope.row, true)"
              >{{ scope.row.subject }}</span
            >
          </template>
        </el-table-column>
        <el-table-column
          align="left"
          label="发起人"
          width="100px"
          prop="creator"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="createTime"
          label="到达时间"
          show-overflow-tooltip
          align="left"
        ></el-table-column>
      </el-table>
    </el-tab-pane>
    <!-- 已办公文 -->
    <el-tab-pane :label="map[1]['label']" :name="map[1]['name']">
      <el-table :data="tableData" align="left" v-loading="dataLoading">
        <el-table-column
          type="index"
          align="left"
          label="序号"
          width="50px"
        ></el-table-column>
        <el-table-column
          label="标题"
          align="left"
          width="220px"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span
              class="done-subject"
              @click="handleRowClick(scope.row)"
              @contextmenu.prevent="handleRowClick(scope.row, true)"
            >
              {{ scope.row.subject }}</span
            >
          </template>
        </el-table-column>
        <el-table-column
          align="left"
          label="发起人"
          width="100px"
          prop="creator"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="createTime"
          label="发起时间"
          show-overflow-tooltip
          align="left"
        >
          <template slot-scope="scope">
            <span> {{ scope.row.createTime | formatDate }} </span>
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>
    <!-- 抄送公文 -->
    <el-tab-pane :label="map[2]['label']" :name="map[2]['name']">
      <el-table :data="tableData" align="left" v-loading="dataLoading">
        <el-table-column
          type="index"
          align="left"
          label="序号"
          width="50px"
        ></el-table-column>
        <el-table-column
          label="标题"
          width="220px"
          show-overflow-tooltip
          align="left"
        >
          <template slot-scope="scope">
            <span
              class="todo-subject"
              @click="handleRowClickCs(scope.row)"
              @contextmenu.prevent="handleRowClickCs(scope.row, true)"
              >{{ scope.row.subject }}</span
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="ownerName"
          label="抄送人"
          width="100px"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="createTime"
          label="到达时间"
          align="center"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span> {{ scope.row.createTime | formatDate }} </span>
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>
    <!-- 我的请求 -->
    <el-tab-pane :label="map[3]['label']" :name="map[3]['name']">
      <el-table :data="tableData" v-loading="dataLoading">
        <el-table-column
          type="index"
          align="left"
          label="序号"
          width="50px"
        ></el-table-column>
        <el-table-column align="left" label="状态">
          <template slot-scope="scope">
            <span v-if="scope.row.status == 'revoke'" style="color:#f71010"
              >撤回</span
            >
            <span
              v-if="scope.row.status == 'revokeToStart'"
              style="color:#f71010"
              >撤回到发起人</span
            >
            <span v-if="scope.row.status == 'draft'" style="color:#c2a437"
              >草稿</span
            >
            <span v-if="scope.row.status == 'running'" style="color:#318409"
              >正在运行</span
            >
            <span v-if="scope.row.status == 'end'" style="color:#909399"
              >结束</span
            >
            <span v-if="scope.row.status == 'manualend'" style="color:#909399"
              >人工结束</span
            >
            <span v-if="scope.row.status == 'back'" style="color:#f71010"
              >驳回</span
            >
            <span v-if="scope.row.status == 'backToStart'" style="color:#f71010"
              >驳回的发起人</span
            >
          </template>
        </el-table-column>
        <el-table-column
          label="标题"
          width="220px"
          show-overflow-tooltip
          align="left"
        >
          <template slot-scope="scope">
            <span
              class="myRequest-subject"
              @click="handleRowClickMyRequest(scope.row)"
              @contextmenu.prevent="handleRowClickMyRequest(scope.row, true)"
              >{{ scope.row.subject }}</span
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="发起时间"
          show-overflow-tooltip
          align="left"
        ></el-table-column>
      </el-table>
    </el-tab-pane>
    <!-- 入库公文 -->
    <el-tab-pane :label="map[4]['label']" :name="map[4]['name']">
      <el-table :data="tableData" v-loading="dataLoading">
        <el-table-column
          type="index"
          align="left"
          label="序号"
          width="50px"
        ></el-table-column>
        <el-table-column
          label="标题"
          width="220px"
          show-overflow-tooltip
          align="left"
        >
          <template slot-scope="scope">
            <span
              class="todo-subject"
              @click="handleEndClick(scope.row)"
              @contextmenu.prevent="handleEndClick(scope.row, true)"
              >{{ scope.row.subject }}</span
            >
          </template>
        </el-table-column>
        <el-table-column
          label="发起人"
          width="120"
          show-overflow-tooltip
          align="center"
          prop="creator"
        ></el-table-column>
        <el-table-column label="发起时间" prop="createTime">
          <template slot-scope="scope">
            <div>
              {{ formatDate(scope.row) }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
//首页流程中心
const form = window.context.form
import req from '@/request.js'
import utils from '@/utils.js'
import {mapState} from 'vuex'
export default {
  props: {
    alias: {
      type: String
    }
  },
  data() {
    return {
      tableData: [],
      activeName: 'first',
      data: {
        rows: []
      },
      //ccwgq 2022-09-23
      dataLoading: true,
      map: [
        {
          label: '待办公文',
          name: 'first',
          requestUrl: '${bpmRunTime}/runtime/task/v1/getTodoList',
          colUrl: '/v-flow/v-todo'
        },
        {
          label: '已办公文',
          name: 'second',
          requestUrl: '${bpmRunTime}/runtime/instance/v1/getDoneInstList',
          colUrl: '/v-flow/v-done'
        },
        {
          label: '抄送公文',
          name: 'third',
          requestUrl: '${bpmRunTime}/runtime/task/v1/getNoticeTodoReadList',
          colUrl: '/v-flow/v-todoRead'
        },
        {
          label: '我的请求',
          name: 'fourth',
          requestUrl: '${bpmRunTime}/runtime/instance/v1/getMyRequestList',
          colUrl: '/v-flow/v-request'
        },
        {
          label: '入库公文',
          name: 'fifth',
          requestUrl: '${bpmRunTime}/runtime/instance/v1/getEndInstList',
          colUrl: '/v-flow/v-doneRead'
        }
      ]
    }
  },
  computed: mapState('menu', ['columnInfo']),
  created() {
    // debugger
    if (
      this.columnInfo.restore &&
      this.$parent.columnAlias == this.columnInfo.alias
    ) {
      const activeName = this.columnInfo.activeTab || 'first'
      this.activeName = activeName
      const tab = this.map.filter(item => item.name == activeName)[0]
      this.$store.dispatch('menu/setColumnInfo', {})
      // this.changeTab(tab)
    }
    this.getProcessMethod()
  },
  mounted() {
    // this.getProcessMethod()
  },
  methods: {
    //切换tab页
    changeTab(tab) {
      const nameList = this.map.map(item => item.name)
      if (nameList.includes(tab.name)) {
        this.tableData = []
        this.dataLoading = true
        this.activeName = tab.name
        this.$store.dispatch('menu/setColumnInfo', {activeName: tab.name})
      }
      // if (tab.name == 'first') {
      //   this.activeName = 'first'
      // } else if (tab.name == 'second') {
      //   this.activeName = 'second'
      // } else if (tab.name == 'third') {
      //   this.activeName = 'third'
      // } else if (tab.name == 'fourth') {
      //   this.activeName = 'fourth'
      // } else {
      //   this.activeName = 'fifth'
      // }
      this.getProcessMethod()
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
    handleRowClick(row, newWin) {
      //判断是否显示强制收回按钮
      let type = ''
      if (
        !(row.status != 'running' || row.opinionStatus != 'agree') ||
        row.opinionStatus == 'inqu'
      ) {
        type = 'done'
      } else {
        type = 'doneList'
      }
      if (this.defKey) {
        this.handleOpenUrl(
          '/sysModuleInst/' + row.id + '/' + type + '/' + this.defKey,
          newWin
        )
      } else {
        this.handleOpenUrl('/inst/' + row.id + '/' + type, newWin)
      }
    },
    handleRowClickCs(row, newWin) {
      let url = ''
      //跟踪任务
      if (row.status == 'FOLLOW') {
        url = '/taskRead/' + row.id + '/FOLLOW'
        if (this.defKey) {
          url = '/sysModuleInstTaskRead/' + row.id + '/FOLLOW/' + this.defKey
        }
      } else if (row.status == 'COMMU') {
        url = '/task/' + row.id + '/0'
        if (this.defKey) {
          url = '/sysModuleInst/' + row.id + '/0/' + this.defKey + '/true'
        }
      } else {
        url = '/inst/' + row.procInstId + '/read/' + row.id
        if (this.defKey) {
          url =
            '/sysModuleInstRead/' +
            row.procInstId +
            '/read/' +
            row.id +
            '/' +
            this.defKey
        }
      }
      // if (!newWin) {
      //   this.handleOpenUrl(url,newWin);
      // } else {
      //   window.open(
      //     window.context.front +
      //       url +
      //       '?token=' +
      //       this.$store.state.login.currentUser.token
      //   )
      // }
      this.handleOpenUrl(url,newWin)
    },
    handleEndClick(row, newWin) {
      if (this.defKey) {
        this.handleOpenUrl(
          '/sysModuleInstDone/' +
            row.id +
            '/read/done/' +
            row.id +
            '/' +
            this.defKey,
          newWin
        )
      } else {
        this.handleOpenUrl('/inst/' + row.id + '/read/done/' + row.id, newWin)
      }
    },
    handleOpenUrl(url, newWin) {
      if (url.indexOf('?') == -1) {
        url = url + '?from=home'
      } else {
        url = url + '&from=home'
      }
      this.$store.dispatch('menu/setColumnInfo', {
        alias: this.$parent.columnAlias,
        activeTab: this.activeName
      })
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
        url = url + '?from=home&token=' + token
      } else {
        url = url + '&from=home&token=' + token
      }
      window.open(url, '_self')
    },
    handleRowClickMyRequest(row, newWin) {
      if (this.defKey) {
        this.handleOpenUrlMyRequest(
          '/sysModuleInst/' + row.id + '/request/' + this.defKey,
          newWin
        )
      }
      if (row.status == 'draft') {
        this.handleOpenUrlMyRequest(
          '/start/' + row.procDefId + '/' + row.id,
          newWin
        )
      } else if (row.status == 'end' || row.status == 'manualend') {
        this.handleOpenUrlMyRequest(
          '/instRead/' + row.id + '/myRequest',
          newWin
        )
      } else if (
        row.status == 'backToStart' ||
        row.status == 'back' ||
        row.status == 'revoke' ||
        row.status == 'revokeToStart'
      ) {
        this.$http
          .get(
            '${bpmRunTime}/runtime/instance/v1/getStartNodeTaskByInstId?instId=' +
              row.id
          )
          .then(resp => {
            let url = '/inst/' + row.id + '/request'
            if (resp && resp.data) {
              url = '/taskFromOtherPage/' + resp.data.id + '/0/myRequest'
              if (this.defKey) {
                url =
                  '/sysModuleInst/' +
                  resp.data.id +
                  '/0' +
                  '/' +
                  this.defKey +
                  '/true'
              }
            }
            this.handleOpenUrlMyRequest(url, newWin)
          })
      } else {
        this.handleOpenUrlMyRequest('/inst/' + row.id + '/request', newWin)
      }
    },
    handleOpenUrlMyRequest(url, newWin) {
      if (url.indexOf('?') == -1) {
        url = url + '?from=home'
      } else {
        url = url + '&from=home'
      }
      this.$store.dispatch('menu/setColumnInfo', {
        alias: this.$parent.columnAlias,
        activeTab: this.activeName
      })
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

    formatDate(value) {
      return utils.formatDate(value.createTime)
    },
    //获取待办,已办，抄送，我的请求
    async getProcessMethod() {
      let param = {}
      param.querys = []
      let pageBean = {}
      pageBean.page = 1
      pageBean.pageSize = 10
      pageBean.showTotal = true
      param.pageBean = pageBean
      let _this = this
      let res = null
      if (this.activeName == 'first') {
        res = await this.$http.post(
          '${bpmRunTime}/runtime/task/v1/getTodoList',
          param
        )
        // lyzcw: 2022-08-04 同时修改“更多”链接
        this.$parent.changeColUrl('/v-flow/v-todo')
      } else if (this.activeName == 'second') {
        res = await this.$http.post(
          '${bpmRunTime}/runtime/instance/v1/getDoneInstList',
          param
        )
        // lyzcw: 2022-08-04 同时修改“更多”链接
        this.$parent.changeColUrl('/v-flow/v-done')
      } else if (this.activeName == 'third') {
        res = await this.$http.post(
          '${bpmRunTime}/runtime/task/v1/getNoticeTodoReadList',
          param
        )
        // lyzcw: 2022-08-04 同时修改“更多”链接
        this.$parent.changeColUrl('/v-flow/v-todoRead')
      } else if (this.activeName == 'fourth') {
        res = await this.$http.post(
          '${bpmRunTime}/runtime/instance/v1/getMyRequestList',
          param
        )
        // lyzcw: 2022-08-04 同时修改“更多”链接
        this.$parent.changeColUrl('/v-flow/v-request')
      }
      //ccwgq: 2022-09-05 新增入库公文
      else if (this.activeName == 'fifth') {
        res = await this.$http.post(
          '${bpmRunTime}/runtime/instance/v1/getEndInstList',
          param
        )
        //同时修改更多链接
        this.$parent.changeColUrl('/v-flow/v-doneRead')
      }
      if (res.status == 200) {
        this.tableData = res.data.rows
        this.dataLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
@import '@/assets/css/change-font.scss';
.el-table /deep/ th.myRequest-header-row {
  background-color: #fafafa;
  font-size: 13px;
}
.model-subject {
  cursor: pointer;
  color: #2761ff;
}

.myRequest-subject {
  cursor: pointer;
}

.myRequest-subject {
  color: $--theme-color;
}
.done-subject {
  cursor: pointer;
}

.done-subject {
  color: $--theme-color;
}
</style>
