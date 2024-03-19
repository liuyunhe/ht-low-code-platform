<template>
  <el-container class="list_main_content">
    <el-aside
      width="200px"
      v-if="!$route.meta.single"
      v-show="asideShow"
      class="aside-tree__wrap"
    >
      <p class="flow_tree_top_title">领导待办分类</p>
      <FlowTree
        ref="FlowTree"
        @currentTree="getCurrent"
        :loadCount="loadCount"
        @switch-change="handleSwitch"
        :isAsideShow="isAsideShow"
      ></FlowTree>
    </el-aside>
    <div
      v-if="!$route.meta.single"
      class="navbar-collapse"
      :class="{'navbar-collapse-right': !asideShow}"
      @click="asideShow = !asideShow"
    >
      <div class="navbar-collapse-bg">
        <i
          class="navbar-collapse-arrow"
          :class="{
            'el-icon-arrow-left': asideShow,
            'el-icon-arrow-right': !asideShow,
          }"
        ></i>
      </div>
    </div>
    <el-container style="border-left: 1px solid #e7eaec">
      <h3 class="flow_table_title">领导待办公文列表</h3>
      <!-- <el-row :gutter="10">
           <el-col :span="12">
            <el-input
              size="medium"
              clearable
              placeholder="标题/编号/流程名称/任务名称/扩展字段"
              prefix-icon="el-icon-search"
              v-model="tableData"
              @keyup.enter.native="searchEnterFun"
            ></el-input>
          </el-col>
          <el-col :span="12">
            <el-date-picker
              v-model="date"
              type="datetimerange"
              align="right"
              size="medium"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="['00:00:00', '23:59:59']"
            ></el-date-picker>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-button size="small" type="primary" @click="search('find')">查询</el-button>
            <el-button size="small" @click="reset">重置</el-button>
            <el-button size="small" @click="taskToCopyTo()">抄送</el-button>
          </el-col>
        </el-row> -->
      <div class="content_top_wrap">
        <el-input
          size="small"
          class="leader-todo__input"
          clearable
          placeholder="标题/编号/流程名称/任务名称/扩展字段"
          prefix-icon="el-icon-search"
          v-model="tableData"
          @keyup.enter.native="searchEnterFun"
        ></el-input>
        <div class="date_wrap">
          <el-date-picker
            v-model="date"
            type="datetimerange"
            align="right"
            size="small"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="['00:00:00', '23:59:59']"
          ></el-date-picker>
        </div>
        <el-row class="btn_wrap">
          <el-col :span="24">
            <el-button size="small" type="primary" @click="search('find')"
              >查询</el-button
            >
            <el-button size="small" @click="reset">重置</el-button>
            <el-button size="small" @click="taskToCopyTo()">抄送</el-button>
          </el-col>
        </el-row>
      </div>
      <el-main>
        <!-- default-sort  排序 -->
        <el-table
          :data="rows"
          style="width: 100%"
          header-cell-class-name="todo-header-row"
          row-class-name="todo-row"
          size="medium"
          v-loading="fullscreenLoading"
          :default-sort="{prop: 'createTime', order: 'descending'}"
          @selection-change="handleSelectionChange"
          v-if="defaultFiledShowConf"
        >
          <el-table-column
            type="selection"
            width="50"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="procInstId"
            :label="defaultFiledShowConf.procInstId.desc"
            v-if="defaultFiledShowConf.procInstId.frontShow"
            show-overflow-tooltip
            align="center"
          ></el-table-column>
          <el-table-column
            :label="defaultFiledShowConf.subject.desc"
            v-if="defaultFiledShowConf.subject.frontShow"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span
                class="todo-subject"
                @click="handleRowClick(scope.row)"
                @contextmenu.prevent="handleRowClick(scope.row, true)"
              >
                {{ scope.row.subject }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            :label="defaultFiledShowConf.procDefName.desc"
            v-if="defaultFiledShowConf.procDefName.frontShow"
            show-overflow-tooltip
            align="center"
            width="120"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.procDefName }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="defaultFiledShowConf.name.desc"
            v-if="defaultFiledShowConf.name.frontShow"
            show-overflow-tooltip
            align="center"
            width="120"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="createTime"
            :label="defaultFiledShowConf.createTime.desc"
            v-if="defaultFiledShowConf.createTime.frontShow"
            align="center"
            width="150"
          ></el-table-column>
          <el-table-column
            prop="creator"
            :label="defaultFiledShowConf.creator.desc"
            v-if="defaultFiledShowConf.creator.frontShow"
            align="center"
            width="90"
          ></el-table-column>
          <el-table-column
            prop="ownerName"
            :label="defaultFiledShowConf.ownerName.desc"
            v-if="defaultFiledShowConf.ownerName.frontShow"
            align="center"
            width="90"
          ></el-table-column>
          <el-table-column
            prop="assigneeName"
            :label="defaultFiledShowConf.assigneeName.desc"
            v-if="defaultFiledShowConf.assigneeName.frontShow"
            align="center"
            width="90"
          ></el-table-column>
          <!-- <el-table-column
            width="100"
            align="center"
            :label="defaultFiledShowConf.urgentStateValue.desc"
            v-if="defaultFiledShowConf.urgentStateValue.frontShow"
            prop="urgentStateValue"
          >
            <template slot-scope="scope">
              <span
                v-if="scope.row.urgentStateValue && urgentStateConf.conf"
                :style="
                  'color:' +
                    urgentStateConf.conf[scope.row.urgentStateValue].color
                "
                size="small"
              >
                {{
                urgentStateConf.conf[scope.row.urgentStateValue].name
                }}
              </span>
            </template>
          </el-table-column> -->
          <el-table-column
            width="100"
            :label="defaultFiledShowConf.status.desc"
            v-if="defaultFiledShowConf.status.frontShow"
            align="center"
          >
            <template slot-scope="scope">
              <el-tag v-if="scope.row.status == 'NORMAL'" size="small"
                >待办</el-tag
              >
              <el-tag v-if="scope.row.status == 'TRANSFORMED'" size="small"
                >流转</el-tag
              >
              <el-tag v-if="scope.row.status == 'TRANSFORMEDINQU'" size="small"
                >征询</el-tag
              >
              <el-tag v-if="scope.row.status == 'DELIVERTO'" size="small"
                >转办</el-tag
              >
              <el-tag v-if="scope.row.status == 'FOLLOW'" size="small"
                >跟踪</el-tag
              >
              <el-tag v-if="scope.row.status == 'COMMU'" size="small"
                >沟通</el-tag
              >
              <el-tag v-if="scope.row.status == 'BACK'" size="small"
                >驳回</el-tag
              >
              <el-tag v-if="scope.row.status == 'ADDSIGN'" size="small"
                >加签</el-tag
              >
              <el-tag v-if="scope.row.status == 'AGENT'" size="small"
                >委托</el-tag
              >
              <el-tag v-if="scope.row.status == 'SHARE'" size="small"
                >共享</el-tag
              >
              <el-tag v-if="scope.row.status == 'BACKSHARE'" size="small"
                >驳回共享</el-tag
              >
              <el-tag v-if="scope.row.status == 'APPROVELINEED'" size="small"
                >并行审批</el-tag
              >
              <el-tag v-if="scope.row.status == 'SIGNSEQUENCEED'" size="small"
                >顺序签署</el-tag
              >
              <el-tag v-if="scope.row.status == 'SIGNLINEED'" size="small"
                >并行签署</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column
            prop="prop1"
            :label="defaultFiledShowConf.prop1.desc"
            v-if="defaultFiledShowConf.prop1.frontShow"
            align="center"
            width="100"
          ></el-table-column>
          <el-table-column
            prop="prop2"
            :label="defaultFiledShowConf.prop2.desc"
            v-if="defaultFiledShowConf.prop2.frontShow"
            align="center"
            width="100"
          ></el-table-column>
          <el-table-column
            prop="prop3"
            :label="defaultFiledShowConf.prop3.desc"
            v-if="defaultFiledShowConf.prop3.frontShow"
            align="center"
            width="100"
          ></el-table-column>
          <el-table-column
            prop="prop4"
            :label="defaultFiledShowConf.prop4.desc"
            v-if="defaultFiledShowConf.prop4.frontShow"
            align="center"
            width="100"
          ></el-table-column>
          <el-table-column
            prop="prop5"
            :label="defaultFiledShowConf.prop5.desc"
            v-if="defaultFiledShowConf.prop5.frontShow"
            align="center"
            width="100"
          ></el-table-column>
          <el-table-column
            prop="prop6"
            :label="defaultFiledShowConf.prop6.desc"
            v-if="defaultFiledShowConf.prop6.frontShow"
            align="center"
            width="100"
          ></el-table-column>
        </el-table>
      </el-main>
      <el-footer height="45px">
        <el-row type="flex" justify="end">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pagination.page"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pagination.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          ></el-pagination>
        </el-row>
      </el-footer>
      <!-- 流程抄送-->
      <TaskToCopyTo ref="taskToCopyTo" :taskId="ids" />
    </el-container>
  </el-container>
</template>

<script>
import {mapState, mapActions} from 'vuex'
import process from '@/api/process'
import FlowTree from '@/components/flow/flowTree.vue'
import utils from '@/utils.js'
import {Message} from 'element-ui'
import TaskToCopyTo from '@/components/flow/task/taskToCopyTo.vue'
export default {
  name: 'todo',
  components: {
    FlowTree,
    TaskToCopyTo,
  },
  props: {
    defKey: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      asideShow: false,
      isAsideShow: false,
      tableData: '',
      date: '',
      currentTree: '',
      fullscreenLoading: true,
      urgentStateConf: {},
      urgentStateConfList: [],
      urgentStateVal: '',
      ids: '', //待办任务id集合
      defaultFiledShowConf: '',
      defaultFiledShowConfList: [
        {name: 'subject', desc: '标题', frontShow: true},
        {name: 'procInstId', desc: '流程编号', frontShow: true},
        {name: 'procDefName', desc: '流程名称', frontShow: true},
        {name: 'name', desc: '任务名称', frontShow: true},
        {name: 'status', desc: '类型', frontShow: true},
        {name: 'createTime', desc: '创建时间', frontShow: true},
        {name: 'creator', desc: '创建人', frontShow: true},
        {name: 'urgentStateValue', desc: '紧急状态', frontShow: true},
        {name: 'dueExpDate', desc: '到期时间', frontShow: false},
        {name: 'ownerName', desc: '所属人', frontShow: false},
        {name: 'assigneeName', desc: '待审批人', frontShow: false},
        {name: 'prop1', desc: '扩展1', frontShow: false},
        {name: 'prop2', desc: '扩展2', frontShow: false},
        {name: 'prop3', desc: '扩展3', frontShow: false},
        {name: 'prop4', desc: '扩展4', frontShow: false},
        {name: 'prop5', desc: '扩展5', frontShow: false},
        {name: 'prop6', desc: '扩展6', frontShow: false},
      ],
    }
  },
  computed: {
    // ...mapState('storeProcess',['rows','pagination','total']),
    //ccwgq 2022-10-24 解决公文中心数据重复错误的问题
    ...mapState('storeProcess', {
      rows: (state) => state.data.leaderList,
      pagination: (state) => state.pagination,
      total: (state) => state.total,
    }),
    currentSwitchValue() {
      return (
        localStorage.leaderTodoAsideShow === 'true' ||
        localStorage.leaderTodoAsideShow === true
      )
    },
  },
  methods: {
    //将当前展开或者收起的值存在localStorage中
    handleSwitch(val) {
      localStorage.leaderTodoAsideShow = val
    },
    //流程抄送
    taskToCopyTo() {
      if (this.ids == '') {
        Message.warning('请选择要抄送的流程')
        return
      }
      this.$refs.taskToCopyTo.handleClose() //父组件调用子组件方法
    },
    //批量勾选待办流程获取
    handleSelectionChange(val) {
      this.ids = ''
      if (val.length > 0) {
        for (let i = 0; i < val.length; i++) {
          this.ids = this.ids + val[i].id + ','
        }
        this.ids = this.ids.substring(0, this.ids.length - 1)
      }
    },
    //Loading 加载中
    openFullScreen() {
      this.fullscreenLoading = true
    },
    handleSizeChange: function (size) {
      //每页下拉显示数据
      this.$store.dispatch('storeProcess/setPaginationSize', size)
      this.search()
    },
    handleCurrentChange: function (currentPage) {
      //点击第几页
      this.$store.dispatch('storeProcess/setPaginationPageNum', currentPage)
      this.search()
    },
    //回车查询
    searchEnterFun: function (e) {
      var keyCode = window.event ? e.keyCode : e.which
      if (keyCode == 13) {
        this.search('find')
      }
    },
    // 查询
    search(str) {
      if (str == 'find') {
        this.$store.dispatch('storeProcess/setPaginationPageNum', 1)
      }
      let querys = [] //查询条件
      let queryFilter = {}
      let pageBean = {pageBean: this.pagination}
      let beginDate = '' //开始时间
      let endDate = '' //结束时间
      let group = 'main' //判断条件
      if (this.tableData) {
        querys = [
          {
            property: 'subject_',
            value: this.tableData,
            group: 'main',
            operation: 'LIKE',
            relation: 'OR',
          },
          {
            property: 'proc_inst_id_',
            value: this.tableData,
            group: 'main',
            operation: 'LIKE',
            relation: 'OR',
          },
          {
            property: 'proc_def_name_',
            value: this.tableData,
            group: 'main',
            operation: 'LIKE',
            relation: 'OR',
          },
          {
            property: 'name_',
            value: this.tableData,
            group: 'main',
            operation: 'LIKE',
            relation: 'OR',
          },
        ]
        let temp = querys[0]
        for (let index = 1; index < 7; index++) {
          let query = JSON.parse(JSON.stringify(temp))
          query.property = 'prop' + index
          querys.push(query)
        }
      }
      if (this.urgentStateVal) {
        querys.push({
          property: 'urgentStateValue',
          value: this.urgentStateVal,
          group: 'main',
          operation: 'IN',
          relation: 'OR',
        })
      }
      if (this.currentTree) {
        querys.push({
          property: 'type_id_',
          value: this.currentTree,
          group: 'typeId',
          operation: 'IN',
          relation: 'AND',
        })
      }
      if (this.defKey) {
        querys.push({
          property: 'tmp.proc_def_key_',
          value: this.defKey,
          operation: 'EQUAL',
          relation: 'AND',
        })
      }
      if (this.date) {
        beginDate = utils.formatDate(this.date[0].getTime())
        endDate = utils.formatDate(this.date[1].getTime())
        querys.push({
          property: 'tmp.create_time_',
          value: [beginDate, endDate],
          group: 'time',
          operation: 'BETWEEN',
          relation: 'AND',
        })
      }
      queryFilter = {pageBean: this.pagination, querys}
      this.openFullScreen()
      this.$store
        .dispatch('storeProcess/getLeaderTodoByPagination', queryFilter)
        .then((data) => {
          if (!data.state) {
            if (data.message === 'BaseException: 无秘书审批权限！') {
              this.$router.push('/v-flow/v-todo')
              window.location.reload()
            }
          }
          this.fullscreenLoading = false
        })
    },
    //重置
    reset() {
      this.tableData = ''
      this.date = ''
      this.search('find')
    },
    handleRowClick(row, newWin) {
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
                  this_.handleOpenUrl(
                    '/task/' + row.id + '/' + se[se.selectedIndex].value,
                    newWin
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
    //子组件传值父组件(待办分类查询)
    getCurrent(data) {
      if (data.id == 6) {
        this.openFullScreen()
        let pageBean = {pageBean: this.pagination}
        this.$store
          .dispatch('storeProcess/getLeaderTodoByPagination', pageBean)
          .then(() => {
            this.fullscreenLoading = false
          })
      } else {
        let ids = []
        this.getFlowTrees(data, ids)
        this.currentTree = ids.join(',')
        this.search('find')
      }
    },
    getFlowTrees(data, ids) {
      ids.push(data.id)
      let arr = data.children
      for (var i = 0; i < arr.length; i++) {
        this.getFlowTrees(arr[i], ids)
      }
    },
    formatConfListToObj(tempList) {
      let editConfObj = {}
      tempList.forEach((c) => {
        let key = c.name
        editConfObj[key] = c
      })
      this.$set(this, 'defaultFiledShowConf', editConfObj)
    },
    loadCount() {
      return process.getLeaderTodoCount()
    },
  },
  created() {
    this.asideShow = this.currentSwitchValue
    this.isAsideShow = this.currentSwitchValue

    let this_ = this
    this.$http
      .get('${portal}/sys/sysProperties/v1/getByAlias?alias=taskListFiledConf')
      .then(function (resp) {
        let tempConf = {}
        if (resp.data) {
          tempConf = resp.data
        } else {
          tempConf = this_.defaultFiledShowConfList
        }
        this_.formatConfListToObj(tempConf)
      })

    let querys = []
    if (this.defKey) {
      querys.push({
        property: 'tmp.proc_def_key_',
        value: this.defKey,
        operation: 'EQUAL',
        relation: 'AND',
      })
    }
    let pageBean = {
      pageBean: {page: '1', pageSize: '10', showTotal: 'true'},
      querys,
    } //初次加载默认pageBean
    // this.$store
    //   .dispatch("storeProcess/getUrgentStateConf", { getConf: true })
    //   .then(data => {
    this.$store
      .dispatch('storeProcess/getLeaderTodoByPagination', pageBean)
      .then(() => {
        //页面加载调用tudo.js里面的分页方法
        this.fullscreenLoading = false
      })
    //   if (data.conf) {
    //     try {
    //       data.conf = JSON.parse(data.conf);
    //     } catch (error) {
    //       data.conf = eval("(" + data.conf + ")");
    //     }
    //     this.urgentStateConfList = data.conf;
    //     let conf = {};
    //     for (let index = 0, c; (c = data.conf[index++]); ) {
    //       if (c.default) {
    //         this.urgentStateConf.defaultValue = c.state;
    //       }
    //       conf[c.state] = c;
    //     }
    //     this.urgentStateConf.conf = conf;
    //   }
    // });
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
.list_main_content {
  height: 100%;
}
.el-table /deep/ th.todo-header-row {
  background-color: #fafafa;
  font-size: 13px;
}

.el-table /deep/ tr.todo-row {
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

.todo-subject {
  cursor: pointer;
}

.todo-subject {
  color: $--theme-color;
}

.top-title {
  line-height: 58px;
  margin-left: 20px;
  font-size: 16px;
  color: #a2a2a2;
}

/deep/.el-tree {
  position: relative;
  cursor: default;
  background: #fff;
  color: $--color-text-primary;
  font-size: 13px;
}
.content_top_wrap {
  display: flex;
  flex-direction: row;
  margin: 10px 0 0 20px;
  .leader-todo__input {
    width: 30%;
  }
  /deep/ .el-input__prefix,
  /deep/.el-input__suffix {
    height: 32px;
  }
  /deep/.el-date-editor--datetimerange.el-input__inner {
    width: 220px;
  }
  .date_wrap {
    display: flex;
    margin: 0 10px;
  }
}
</style>
