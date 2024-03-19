<template>
  <el-container class="list_main_content fullheight">
    <el-aside
      width="200px"
      v-if="!$route.meta.single"
      v-show="asideShow"
      class="aside-tree__wrap"
    ></el-aside>
    <div></div>
    <el-container style="border-left: 1px solid #e7eaec">
      <h3 class="flow_table_title">
        {{ $t('navigator.searchAll') }} {{ $t('navigator.list') }}
      </h3>
      <div class="content_top_wrap">
        <el-form
          ref="form"
          v-form
          data-vv-scope="form"
          class="content_top_wrap_form"
          style="flex-wrap: wrap"
        >
          <div>
            <el-row :gutter="10">
              <el-col :span="8">
                <el-input
                  class="form_input"
                  size="small"
                  clearable
                  placeholder="标题/公文编号/流程名称/任务名称/发起人姓名"
                  prefix-icon="el-icon-search"
                  v-model="form.tableData"
                  @keyup.enter.native="searchEnterFun"
                ></el-input>
              </el-col>
              <el-col :span="10">
                <el-date-picker
                  class="form_date_picker"
                  v-model="form.date"
                  type="datetimerange"
                  size="small"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  :default-time="['00:00:00', '23:59:59']"
                ></el-date-picker>
              </el-col>
              <!-- <el-col :span="6">
                <div>
                  <eip-org-selector
                    class="form_org_selector"
                    style="display: inline-block"
                    placeholder="发起人组织"
                    :single="true"
                    v-model="form.orgName"
                    :config="{id: 'form.orgId'}"
                  />
                </div>
              </el-col> -->
            </el-row>
            <el-row :gutter="10" v-if="showAdvance">
              <el-col :span="8">
                <el-input
                  class="form_input"
                  size="small"
                  clearable
                  placeholder="标题"
                  prefix-icon="el-icon-s-fold"
                  v-model="form.subject"
                  @keyup.enter.native="searchEnterFun"
                ></el-input>
              </el-col>
              <el-col :span="10">
                <el-input
                  class="form_input"
                  size="small"
                  clearable
                  placeholder="公文编号"
                  prefix-icon="el-icon-document"
                  v-model="form.prop6"
                  @keyup.enter.native="searchEnterFun"
                ></el-input>
              </el-col>
              <el-col :span="6">
                <div>
                  <eip-sys-type-selector
                    placeholder="类别"
                    type-key="FLOW_TYPE"
                    v-model="form.typeName"
                    :sys-type-id.sync="form.typeId"
                  />
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="10" v-if="showAdvance">
              <el-col :span="8">
                <el-input
                  class="form_input"
                  size="small"
                  clearable
                  placeholder="流程名称"
                  prefix-icon="el-icon-s-operation"
                  v-model="form.defName"
                  @keyup.enter.native="searchEnterFun"
                ></el-input>
              </el-col>
              <!-- <el-col :span="10">
                <el-input
                  class="form_input"
                  size="small"
                  clearable
                  placeholder="我方主体"
                  prefix-icon="el-icon-s-operation"
                  v-model="form.ourPartyText"
                  @keyup.enter.native="searchEnterFun"
                ></el-input>
              </el-col>-->
              <el-col :span="3">
                <div>
                  <el-select
                    class="el-select"
                    size="small"
                    v-model="form.urgentState"
                    clearable
                    placeholder="紧急程度"
                  >
                    <el-option key="1" label="紧急" value="1"></el-option>
                    <el-option key="2" label="重要" value="2"></el-option>
                    <el-option key="3" label="正常" value="3"></el-option>
                  </el-select>
                </div>
              </el-col>
              <el-col :span="3">
                <div>
                  <eip-user-selector
                    class="form_user_selector"
                    style="display: inline-block"
                    placeholder="发起人"
                    :single="true"
                    v-model="form.userName"
                    :config="{id: 'form.userId'}"
                  />
                </div>
              </el-col>
            </el-row>
          </div>
        </el-form>
        <el-row>
          <el-col :span="24">
            <el-button size="small" @click="advanceSearch"
              >高级
              <i
                :class="showAdvance ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"
              ></i>
            </el-button>
            <el-button size="small" @click="reset">重置</el-button>
            <!-- <el-button size="small" @click="taskToCopyTo()">抄送</el-button> -->
            <el-button size="small" type="primary" @click="search('find')"
              >搜索</el-button
            >
            <el-button size="small" type="success" @click="exportFlowList"
              ><i class="el-icon-download" v-if="!isExport"></i
              ><i class="el-icon-loading" v-else></i
              ><span v-if="!isExport">导出excel</span
              ><span v-else>导出中...</span></el-button
            >
            <!-- <el-button size="small" @click="batchHandle">批量处理</el-button> -->
          </el-col>
        </el-row>
      </div>
      <el-main class="content">
        <!-- table show data -->
        <el-table
          height="100%"
          :data="rows"
          ref="htTable"
          style="width: 100%"
          header-cell-class-name="flow-header-row"
          row-class-name=""
          @row-click="rowClick"
          size="medium"
          v-loading="fullscreenLoading"
          @selection-change="handleSelectionChange"
          v-if="defaultFiledShowConf"
          @hook:updated="updatedTable"
        >
          <!-- TODO:settings showing rows -->
          <el-table-column
            type="selection"
            width="50"
            align="center"
          ></el-table-column>
          <el-table-column label="流程图" width="70" align="center">
            <template slot-scope="scope">
              <el-button
                @click="handleShowTaskImage(scope.row)"
                icon="icon-flow1"
                size="mini"
              ></el-button>
            </template>
          </el-table-column>
          <el-table-column
            prop="serialNo"
            label="公文编号"
            align="center"
            width="160"
            show-overflow-tooltip
          ></el-table-column>
          <!-- 流程标题 -->
          <el-table-column
            :label="defaultFiledShowConf.subject.desc"
            v-if="defaultFiledShowConf.subject.frontShow"
            show-overflow-tooltip
            align="left"
          >
            <template slot-scope="scope">
              <span
                class="todo-subject"
                @click="handleRowClick(scope.row, true)"
                @contextmenu.prevent="handleRowClick(scope.row, true)"
              >
                {{ scope.row.subject }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="ourPartyText"
            label="我方主体"
            align="center"
            width="150"
          ></el-table-column>
          <!-- 流程名称 -->
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
          <!-- 任务名称 -->
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
          <!-- 创建时间 -->
          <el-table-column
            prop="createTime"
            :label="defaultFiledShowConf.createTime.desc"
            v-if="defaultFiledShowConf.createTime.frontShow"
            align="center"
            width="180"
          >
            <template slot-scope="scope">
              <span> {{ scope.row.createTime | formatDate }} </span>
            </template>
          </el-table-column>
          <!-- 创建人 -->
          <el-table-column
            prop="creator"
            :label="defaultFiledShowConf.creator.desc"
            v-if="defaultFiledShowConf.creator.frontShow"
            align="center"
            width="80"
          ></el-table-column>
          <el-table-column width="90" align="center" label="公文类型">
            <template slot-scope="{row}">
              <span class="blue-color">{{ FLOW_TYPE[row.type] }}</span>
            </template>
          </el-table-column>
          <!-- 紧急状态 -->
          <el-table-column
            show-overflow-tooltip
            :label="defaultFiledShowConf.urgentStateValue.desc"
            :v-if="defaultFiledShowConf.urgentStateValue.frontShow"
            align="center"
          >
            <template slot-scope="{row}">
              <span
                size="small"
                :style="urgentStateColor(row.urgentStateValue)"
                >{{ row.urgentStateValue | urgentText }}</span
              >
            </template>
          </el-table-column>
        </el-table>
      </el-main>
      <el-footer height="52px">
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
      <TaskImage
        ref="taskImage"
        :bpmnInstId="selectBpmnInstId"
        :instId="selectInstanceId"
        :defId="selectDefId"
      />
    </el-container>
  </el-container>
</template>

<script>
const STATUS = {
  NORMAL: '待办',
  TRANSFORMED: '流转',
  TRANSFORMEDINQU: '征询',
  DELIVERTO: '转办',
  FOLLOW: '跟踪',
  // 2022-10-09 yigz:原沟通功能，文案上修改为 会签，但功能还是原沟通功能
  COMMU: '会签',
  BACK: '驳回',
  ADDSIGN: '会签加签',
  AGENT: '委托',
  SHARE: '共享',
  BACKSHARE: '驳回共享',
  APPROVELINEED: '并行审批',
  SIGNSEQUENCEED: '顺序签署',
  SIGNLINEED: '并行签署',
  USERADDSIGN: '用户会签',
  COPYTO: '抄送',
}
const FLOW_TYPE = {
  1: '抄送公文',
  2: '入库公文',
  3: '已办公文',
  4: '我的请求',
  5: '待办公文',
}
import {mapState, mapActions} from 'vuex'
import process from '@/api/process'
import FlowTree from '@/components/flow/flowTree.vue'
import utils from '@/utils.js'
import {Message} from 'element-ui'
import TaskImage from '@/components/flow/task/taskImage.vue'
import TaskToCopyTo from '@/components/flow/task/taskToCopyTo.vue'
import eipOrgSelector from '@/components/eipControl/selector/EipOrgSelector.vue'
import eipUserSelector from '@/components/eipControl/selector/EipUserSelector.vue'
import eipSysTypeSelector from '@/components/eipControl/selector/EipSysTypeSelector.vue'

import FlowMenuMixin from '@/components/flow/ou/OuFlowMenu.js'
// lyzcw: 2021-08-16 添加列表显示紧急状态
const URGENTNAME = {
  3: '正常',
  2: '重要',
  1: '紧急',
}
const URGENTCOLOR = {
  3: '#22870D',
  2: '#E1A306',
  1: '#E1A306',
}
export default {
  name: 'searchFlow',
  components: {
    FlowTree,
    TaskToCopyTo,
    eipOrgSelector,
    eipUserSelector,
    eipSysTypeSelector,
    TaskImage,
  },
  mixins: [FlowMenuMixin],
  filters: {
    urgentColor: function (val) {
      return URGENTCOLOR[val]
    },
    urgentText: function (val) {
      return URGENTNAME[val]
    },
  },
  props: {
    defKey: {
      type: String,
      default: '',
    },
    orgName: {type: String, default: ''},
    orgId: {type: String, default: ''},
  },
  data() {
    return {
      SEARCH_STATUS: STATUS,
      FLOW_TYPE: FLOW_TYPE,
      showAdvance: false,
      isAsideShow: false,
      batchHandleIds: [],
      asideShow: false,
      fullscreenLoading: false,
      form: {
        tableData: '',
        date: '',
        orgName: '',
        orgId: '',
        prop6: '',
        prop5: '',
        subject: '',
        defName: '',
        flowType: '',
        userName: '',
        userId: '',
        urgentState: '',
        typeName: '',
        typeId: '',
        ourPartyText: '',
      },
      selectInstanceId: '',
      selectBpmnInstId: '',
      selectDefId: '',
      ids: '', //待办任务id集合
      defaultFiledShowConf: '',
      defaultFiledShowConfList: [
        {name: 'subject', desc: '标题', frontShow: true},
        {name: 'procInstId', desc: '流程编号', frontShow: false},
        {name: 'procDefName', desc: '流程名称', frontShow: true},
        {name: 'name', desc: '任务名称', frontShow: true},
        {name: 'status', desc: '类型', frontShow: true},
        {name: 'createTime', desc: '创建时间', frontShow: true},
        {name: 'creator', desc: '发起人', frontShow: true},
        {name: 'urgentStateValue', desc: '紧急状态', frontShow: true},
        {name: 'dueExpDate', desc: '到期时间', frontShow: false},
        {name: 'ownerName', desc: '所属人', frontShow: false},
        {name: 'assigneeName', desc: '待审批人', frontShow: false},
        {name: 'prop1', desc: '扩展1', frontShow: false},
        {name: 'prop2', desc: '扩展2', frontShow: false},
        {name: 'prop3', desc: '扩展3', frontShow: false},
        {name: 'prop4', desc: '扩展4', frontShow: false},
        {name: 'prop5', desc: '我方主体', frontShow: false},
        {name: 'prop6', desc: '公文编号', frontShow: true},
      ],
      //流程导出标识
      currentSerialType: 'searchTask',
      //当前查询参数
      currentQueryFilter: {},
      isExport: false,
    }
  },
  watch: {},
  computed: {
    // ...mapState('storeProcess', ['rows', 'pagination', 'total'])
    //ccwgq 2022-10-24 解决公文中心数据重复错误的问题
    ...mapState('storeProcess', {
      rows: (state) => state.data.searchList,
      pagination: (state) => state.pagination,
      total: (state) => state.total,
    }),
  },
  created() {
    //  let querys = [] //查询条件
    //   let queryFilter = {}
    //   let pageBean = {pageBean: this.pagination}
    //   let beginDate = '' //开始时间
    //   let endDate = '' //结束时间
    //   let group = 'main' //判断条件
    //   queryFilter = {pageBean: this.pagination, querys, sorter: this.sorter}
    this.getTaskList()
    // this.$store
    //     .dispatch('storeProcess/getFlowAllByPagination', queryFilter)
    //     .then(() => {})
  },
  methods: {
    //展开收起高级搜索
    advanceSearch() {
      this.showAdvance = !this.showAdvance
    },
    searchEnterFun(e) {
      var keycode = window.event ? e.keyCode : e.which
      if (keyCode == 13) {
        this.search('find')
      }
    },
    //获取任务
    getTaskList() {
      this.fullscreenLoading = true
      this.$http
        .get(
          '${portal}/sys/sysProperties/v1/getDecryptByAlias?alias=taskListFiledConf'
        )
        .then((resp) => {
          let tempConf = {}
          if (resp.data) {
            tempConf = JSON.parse(resp.data.value)
          } else {
            tempConf = this.defaultFiledShowConfList
          }
          this.formatConfListToObj(tempConf)
          this.fullscreenLoading = false
        })
      let querys = []
      if (this.defKey) {
        querys.push({
          property: 'bt.proc_def_key_',
          value: this.defKey,
          operation: 'EQUAL',
          relation: 'AND',
        })
      }
      //判断是否有URL传参
      if (this.orgName && this.orgId) {
        this.form.orgName = this.orgName
        this.form.orgId = this.orgId
        querys.push({
          group: 'orgId',
          property: 'inst.CREATE_ORG_PATH_',
          value: this.orgId,
          operation: 'LIKE',
          relation: 'AND',
        })
      }
      let queryFilter = {
        pageBean: {page: '1', pageSize: '10', showTotal: 'true'},
        querys: querys,
      } //初次加载默认pageBean
      this.$store
        .dispatch('storeProcess/getFlowAllByPagination', queryFilter)
        .then(() => {})
      this.currentQueryFilter = queryFilter
    },
    formatConfListToObj(tempList) {
      let editConfObj = {}
      tempList.forEach((c) => {
        let key = c.name
        editConfObj[key] = c
      })
      this.$set(this, 'defaultFiledShowConf', editConfObj)
    },
    //查询
    search(str) {
      this.fullscreenLoading = true
      if (str == 'find') {
        this.$store.dispatch('storeProcess/setPaginationPageNum', 1)
      }
      let querys = [] //查询条件
      let queryFilter = {}
      let pageBean = {pageBean: this.pagination}
      let beginDate = '' //开始时间
      let endDate = '' //结束时间
      let group = 'main' //判断条件
      if (this.form.tableData) {
        querys = [
          {
            property: 'bt.subject_',
            value: this.form.tableData,
            group: 'main',
            operation: 'LIKE',
            relation: 'OR',
          },
          {
            property: 'bt.proc_inst_id_',
            value: this.form.tableData,
            group: 'main',
            operation: 'LIKE',
            relation: 'OR',
          },
          // lyzcw: 2022-06-10，模糊查询支持公文编号
          {
            property: 'bt.PROP6_',
            value: this.form.tableData,
            group: 'main',
            operation: 'LIKE',
            relation: 'OR',
          },
          {
            property: 'bt.proc_def_name_',
            value: this.form.tableData,
            group: 'main',
            operation: 'LIKE',
            relation: 'OR',
          },
          {
            property: 'bt.name_',
            value: this.form.tableData,
            group: 'main',
            operation: 'LIKE',
            relation: 'OR',
          },
          // lyzcw：2021-10-18 添加支持发起人姓名模糊查询
          {
            property: 'inst.CREATOR_',
            value: this.form.tableData,
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
      if (this.form.orgId) {
        querys.push({
          property: 'inst.CREATE_ORG_PATH_',
          value: this.form.orgId,
          group: 'orgId',
          operation: 'LIKE',
          relation: 'AND',
        })
      }
      if (this.currentTree) {
        querys.push({
          property: 'bt.type_id_',
          value: this.currentTree,
          group: 'typeId',
          operation: 'IN',
          relation: 'AND',
        })
      }
      if (this.defKey) {
        querys.push({
          property: 'bt.proc_def_key_',
          value: this.defKey,
          operation: 'EQUAL',
          relation: 'AND',
        })
      }
      if (this.form.date) {
        beginDate = utils.formatDate(this.form.date[0].getTime())
        endDate = utils.formatDate(this.form.date[1].getTime())
        querys.push({
          property: 'bt.create_time_',
          value: [beginDate, endDate],
          group: 'time',
          operation: 'BETWEEN',
          relation: 'AND',
        })
      }
      // lyzcw：2022-06-09 添加高级查询
      if (this.form.prop6) {
        querys.push({
          property: 'bt.PROP6_', // prop6映射表单公文编号
          value: this.form.prop6,
          group: 'main',
          operation: 'LIKE',
          relation: 'AND',
        })
      }
      if (this.form.subject) {
        querys.push({
          property: 'bt.SUBJECT_',
          value: this.form.subject,
          group: 'main',
          operation: 'LIKE',
          relation: 'AND',
        })
      }

      if (this.form.defName) {
        querys.push({
          property: 'bt.proc_def_name_',
          value: this.form.defName,
          group: 'main',
          operation: 'LIKE',
          relation: 'AND',
        })
      }

      if (this.form.userId) {
        querys.push({
          property: 'inst.CREATE_BY_',
          value: this.form.userId,
          group: 'main',
          operation: 'EQUAL',
          relation: 'AND',
        })
      }
      if (this.form.urgentState) {
        querys.push({
          property: 'inst.URGENT_STATE_',
          value: this.form.urgentState,
          group: 'main',
          operation: 'EQUAL',
          relation: 'AND',
        })
      }
      //类别
      if (this.form.typeId) {
        querys.push({
          property: 'inst.TYPE_PATH_',
          value: this.form.typeId,
          group: 'main',
          operation: 'LIKE',
          relation: 'AND',
        })
      }
      // 2022-06-16 yigz:添加我方主体高级搜索条件
      if (this.form.ourPartyText) {
        querys.push({
          property: 'inst.OUR_PARTY_TEXT', // prop5映射表单我方主体
          value: this.form.ourPartyText,
          group: 'main',
          operation: 'LIKE',
          relation: 'AND',
        })
      }
      queryFilter = {pageBean: this.pagination, querys, sorter: this.sorter}
      this.$store
        .dispatch('storeProcess/getFlowAllByPagination', queryFilter)
        .then(() => {
          this.fullscreenLoading = false
        })
      this.currentQueryFilter = queryFilter
    },

    //2022-09-08：yigz 导出流程列表
    exportFlowList() {
      let _this = this
      if (_this.isExport) {
        Message.warning('正在导出文件，请稍后')
        return
      }
      let serialType = _this.currentSerialType
      let queryFilter = _this.currentQueryFilter
      //默认导出当前查询结果数据
      let getType = 'page'
      if (queryFilter.querys && queryFilter.querys.length <= 1) {
        //根据查询请求参数，若请求参数数组长度为默认的1，则表示导出所有数据
        getType = 'all'
      }
      let tableName = '公文查询'
      let expTableName = '公文编号,公文标题,呈报人,呈报部门,呈报时间'
      let Base64 = require('js-base64').Base64
      expTableName = encodeURIComponent(Base64.encode(expTableName))

      // createOrgPathName 创建人所属组织树名称
      // createOrgName 创建人所属组织名称
      let expField = 'serialNo,subject,creator,createOrgPathName,createTime'
      expField = encodeURIComponent(Base64.encode(expField))
      let appendParam =
        'getType=' +
        getType +
        '&tableName=' +
        tableName +
        '&expTableName=' +
        expTableName +
        '&expField=' +
        expField
      _this.openFullScreen()
      _this.isExport = true
      process
        .exportFlowListData(serialType, appendParam, queryFilter)
        .then(function (resp) {
          _this.fullscreenLoading = false
          _this.isExport = false
        })
    },

    //Loading 加载中
    openFullScreen() {
      this.fullscreenLoading = true
    },
    //重置数据
    reset() {
      this.form = {
        tableData: '',
        date: '',
        orgName: '',
        orgId: '',
        prop6: '',
        prop5: '',
        subject: '',
        defName: '',
        userName: '',
        userId: '',
        urgentState: '',
        typeName: '',
        typeId: '',
      }
      this.search('find')
    },
    handleRowClick(row, newWin) {
      //     1: '抄送公文',
      // 2: '入库公文',
      // 3: '已办公文',
      // 4: '我的请求',
      // 5: '待办公文',
      let url = ''
      switch (row.type.toString()) {
        //抄送公文
        case '1': {
          let url = ''
          //跟踪任务
          if (row.status == 'FOLLOW') {
            url = '/taskRead/' + row.id + '/FOLLOW'
            if (this.defKey) {
              url =
                '/sysModuleInstTaskRead/' + row.id + '/FOLLOW/' + this.defKey
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
          if (!newWin) {
            this.$router.push(url)
          } else {
            window.open(
              window.context.front +
                url +
                '?token=' +
                this.$store.state.login.currentUser.token
            )
          }
          break
        }
        //入库公文
        case '2': {
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
            this.handleOpenUrl(
              '/inst/' + row.id + '/read/done/' + row.id,
              newWin
            )
          }
          break
        }
        //已办公文
        case '3': {
          //已办公文
          let type = 'doneList'
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
          break
        }
        //我的请求
        case '4': {
          //我的请求
          if (this.defKey) {
            this.handleOpenUrl(
              '/sysModuleInst/' + row.id + '/request/' + this.defKey,
              newWin
            )
          }
          if (row.status == 'draft') {
            this.handleOpenUrl('/start/' + row.procDefId + '/' + row.id, newWin)
          } else if (row.status == 'end' || row.status == 'manualend') {
            this.handleOpenUrl('/instRead/' + row.id + '/myRequest', newWin)
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
              .then((resp) => {
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
                this.handleOpenUrl(url, newWin)
              })
          } else {
            this.handleOpenUrl('/inst/' + row.id + '/request', newWin)
          }
          break
        }
        //待办公文
        case '5': {
          //待办公文
          if (row.status == 'SHARE' || row.status == 'BACKSHARE') {
            if (row.identityList && row.identityList.length == 1) {
              let url = '/task/' + row.id + '/' + row.identityList[0].id
              this.handleOpenUrl(url, newWin)
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
          } else if (row.status == 'FOLLOW') {
            //跟踪任务
            this.handleOpenUrl('/taskRead/' + row.id + '/FOLLOW', newWin)
          } else {
            let url = '/task/' + row.id + '/0'
            if (this.defKey) {
              url =
                '/sysModuleInst/' + row.id + '/0' + '/' + this.defKey + '/true'
            }
            this.handleOpenUrl(url, newWin)
          }
          break
        }
        default: {
          return
        }
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
    rowClick(row, column, event) {
      //操作列不触发多选按钮
      if (column && column.label == '流程图') {
        return
      }
      this.$refs.htTable.toggleRowSelection(row)
    },
    // pagination callbacks
    handleSizeChange(size) {
      //每页下拉显示数据
      this.$store.dispatch('storeProcess/setPaginationSize', size)
      this.search()
    },
    handleCurrentChange(currentPage) {
      //点击第几页
      this.$store.dispatch('storeProcess/setPaginationPageNum', currentPage)
      this.search()
    },
    //批量勾选流程获取
    handleSelectionChange(val) {
      this.ids = ''
      if (val.length > 0) {
        for (let i = 0; i < val.length; i++) {
          this.ids = this.ids + val[i].id + ','
        }
        this.ids = this.ids.substring(0, this.ids.length - 1)
      }
    },
    async handleShowTaskImage(row) {
      await this.changeSeletion(row)
      this.$refs.taskImage.handleOpen()
    },
    changeSeletion(row) {
      this.selectInstanceId = row.procInstId
      this.selectBpmnInstId = row.bpmnInstId
    },
    //回车查询
    searchEnterFun: function (e) {
      var keyCode = window.event ? e.keyCode : e.which
      if (keyCode == 13) {
        this.search('find')
      }
    },
    getCurrent(data) {},
    //紧急状态颜色
    urgentStateColor(stateValue) {
      if (stateValue == 3)
        //绿色
        return {color: '#22870D'}
      else if (stateValue == 2)
        //黄色
        return {color: '#E1A306'}
      else if (stateValue == 1)
        //红色
        return {color: '#E1A306'}
      return {}
    },
    //到期时间格式
    computeTime(deadline) {
      if (deadline) {
        let time = new Date(deadline).getTime()
        let nowTime = new Date().getTime()
        let duration = time - nowTime
        if (duration > 0) return deadline
        else {
          let hour = Math.floor(Math.abs(duration / 3600000))
          let minute = Math.ceil(Math.abs((duration % 3600000) / 60000))
          return '已到期' + hour + '时' + minute + '分'
        }
      }
      return ''
    },
    //到期时间颜色
    computeColor(deadline) {
      if (deadline) {
        let time = new Date(deadline).getTime()
        let nowTime = new Date().getTime()
        let day = (time - nowTime) / 86400000
        if (day > 0)
          //绿色
          return {color: '#22870D'}
        else {
          if (Math.ceil(Math.abs(day)) >= 3)
            //红色
            return {color: '#F1300A'}
          //黄色
          else return {color: '#E1A306'}
        }
      }
      return {}
    },
    //ccwgq 2022-09-07 在 table组件的updated钩子里补充逻辑
    updatedTable() {
      // this.$nextTick(()=>{
      //  const $wrapper=$(this.$el).find('.el-table__body-wrapper');
      //  if($wrapper.length){
      //   $wrapper.css({height:"100%!important"})
      //  }
      // })
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
@import '@/assets/css/change-font.scss';
.el-table /deep/ th.flow-header-row {
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
.content {
  padding-top: 0;
  height: 100%;
}
.content_top_wrap {
  // display: flex;   //防止按钮组的样式错误禁止这个div启用弹性布局
  flex-direction: row;
  margin: 10px 0 0 20px;
  flex-wrap: wrap;
  // height: 32px;
  &_form {
    display: flex;
    flex-direction: row;
    margin-bottom: 10px;
    /deep/ .el-input__prefix,
    /deep/.el-input__suffix {
      height: 32px;
    }
    .form_input {
      margin-right: 10px;
    }
    .form_date_picker,
    .form_org_selector {
      margin-right: 10px;
      min-width: 300px;
    }
  }
}
.el-table /deep/ .icon-flow1 {
  color: #2761ff;
}
</style>