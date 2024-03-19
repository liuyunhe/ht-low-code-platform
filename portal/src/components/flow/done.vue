<template>
  <el-container class="list_main_content fullheight">
    <!-- ccwgq 2022-07-07 v-show 设置为false 隐藏这个流程树 -->
    <el-aside
      width="200px"
      v-if="!$route.meta.single"
      v-show="asideShow"
      class="aside-tree__wrap"
    >
      <p class="flow_tree_top_title">
        {{ $t('navigator.myDone') }} {{ $t('navigator.type') }}
      </p>
      <FlowTree
        ref="FlowTree"
        @currentTree="getCurrent"
        :loadCount="loadCount"
        @switch-change="handleSwitch"
        :isAsideShow="isAsideShow"
      ></FlowTree>
    </el-aside>
    <div
      class="navbar-collapse"
      :class="{'navbar-collapse-right': !asideShow}"
      @click="asideShow = !asideShow"
      v-if="!$route.meta.single"
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
      <h3 class="flow_table_title">
        {{ $t('navigator.myDone') }} {{ $t('navigator.list') }}
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
                  placeholder="标题/编号/流程名称/发起人姓名"
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
              <el-col :span="6">
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
              </el-col>
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
              <!-- <el-col :span="10">
                <el-input
                  class="form_input"
                  size="small"
                  clearable
                  placeholder="公文编号"
                  prefix-icon="el-icon-document"
                  v-model="form.serialNo"
                  @keyup.enter.native="searchEnterFun"
                ></el-input>
              </el-col> -->
              <!-- <el-col :span="6">
                <el-input
                  class="form_input"
                  size="small"
                  clearable
                  placeholder="我方主体"
                  prefix-icon="el-icon-document"
                  v-model="form.ourPartyText"
                  @keyup.enter.native="searchEnterFun"
                ></el-input>
              </el-col>-->
            </el-row>
            <el-row :gutter="10" v-if="showAdvance">
              <el-col :span="8">
                <div>
                  <eip-sys-type-selector
                    placeholder="类别"
                    type-key="FLOW_TYPE"
                    v-model="form.typeName"
                    :sys-type-id.sync="form.typeId"
                  />
                </div>
              </el-col>
              <el-col :span="10">
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
            <el-button size="small" @click="taskToCopyTo()">抄送</el-button>
            <el-button size="small" type="primary" @click="search('find')"
              >搜索</el-button
            >
            <el-button size="small" type="success" @click="exportFlowList"
              ><i class="el-icon-download" v-if="!isExport"></i
              ><i class="el-icon-loading" v-else></i
              ><span v-if="!isExport">导出excel</span
              ><span v-else>导出中...</span></el-button
            >
          </el-col>
        </el-row>
      </div>
      <el-main class="content">
        <!-- default-sort  排序 -->
        <el-table
          :data="rows"
          height="100%"
          ref="htTable"
          @row-click="rowClick"
          style="width: 100%"
          header-cell-class-name="done-header-row"
          row-class-name="done-row"
          size="medium"
          v-loading="fullscreenLoading"
          @selection-change="handleSelectionChange"
          @hook:updated="updatedTable"
        >
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

          <!-- <el-table-column prop="id" width="160" show-overflow-tooltip align="center" label="流程编号"></el-table-column> -->
          <!--lyzcw: 2022-06-08 默认显示prop6公文编号:label="defaultFiledShowConf.prop6.desc"-->
          <!-- <el-table-column
            prop="serialNo"
            label="公文编号"
            align="center"
            width="150"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.serialNo }}</span>
            </template>
          </el-table-column> -->
          <!-- <el-table-column
            prop="serialNo"
            label="公文编号"
            align="center"
            width="150"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.serialNo }}</span>
            </template>
          </el-table-column> -->
          <!-- yigz 2022-11-05:已办公文以修窗口形式打开 -->
          <el-table-column label="标题" align="left" show-overflow-tooltip>
            <template slot-scope="scope">
              <span
                class="done-subject"
                @click="handleRowClick(scope.row, true)"
                @contextmenu.prevent="handleRowClick(scope.row, true)"
              >
                {{ scope.row.subject }}</span
              >
            </template>
          </el-table-column>

          <!-- <el-table-column
            prop="ourPartyText"
            label="我方主体"
            align="left"
            width="150"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>{{ scope.row.ourPartyText }}</span>
            </template>
          </el-table-column> -->

          <el-table-column
            label="流程名称"
            show-overflow-tooltip
            align="left"
            width="160"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.procDefName }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="是否办结"
            show-overflow-tooltip
            align="center"
            width="100"
          >
            <template slot-scope="scope">
              <span
                v-if="
                  scope.row.status == 'end' || scope.row.status == 'manualend'
                "
                class="blue-color"
                >已办结</span
              >
              <span
                v-if="
                  scope.row.status != 'end' && scope.row.status != 'manualend'
                "
                class="red-color"
                >未办结</span
              >
            </template>
          </el-table-column>
          <!-- <el-table-column width="90" align="center" label="公文类型">
            <template slot-scope="{row}">
              <span class="blue-color">{{ row.type_name }}</span>
            </template>
          </el-table-column> -->
          <el-table-column
            label="发起时间"
            show-overflow-tooltip
            align="center"
            width="160"
          >
            <template slot-scope="scope">
              <span> {{ scope.row.createTime | formatDate }} </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="creator"
            label="发起人"
            width="100"
            align="center"
          ></el-table-column>
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
      <el-dialog
        title="强制收回"
        :visible.sync="dialogFormVisible"
        :close-on-click-modal="false"
      >
        <el-input
          type="textarea"
          :autosize="{minRows: 4, maxRows: 4}"
          placeholder="请输入强制收回意见"
          v-model="opinion"
        ></el-input>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="saveRevoke" size="small"
            >确 定</el-button
          >
          <el-button @click="exitRevoke" size="small">取 消</el-button>
        </div>
      </el-dialog>
      <!-- 流程抄送-->
      <TaskToCopyTo ref="taskToCopyTo" :instId="ids" />
      <!-- 流程图 -->
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
import {mapState, mapActions} from 'vuex'
import process from '@/api/process'
import {Message} from 'element-ui'
import FlowTree from '@/components/flow/flowTree.vue'
import utils from '@/utils.js'
import TaskToCopyTo from '@/components/flow/task/taskToCopyTo.vue'
import eipOrgSelector from '@/components/eipControl/selector/EipOrgSelector.vue'
import eipUserSelector from '@/components/eipControl/selector/EipUserSelector.vue'
import eipSysTypeSelector from '@/components/eipControl/selector/EipSysTypeSelector.vue'
import TaskImage from '@/components/flow/task/taskImage.vue'
//ccwgq 2022-07-07 引入流程的事件总线    (已经改为mixin)
// import FlowBus from '@/components/eipControl/bus/FlowMenuBus.js'
import FlowMenuMixin from '@/components/flow/ou/OuFlowMenu.js'
export default {
  name: 'doneList',
  components: {
    FlowTree,
    TaskToCopyTo,
    eipOrgSelector,
    eipUserSelector,
    eipSysTypeSelector,
    TaskImage,
  },
  mixins: [FlowMenuMixin],
  props: {
    defKey: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      showAdvance: false,
      isAsideShow: false,
      asideShow: false,
      form: {
        tableData: '',
        date: '',
        orgName: '',
        orgId: '',
        serialNo: '',
        ourPartyText: '',
        subject: '',
        defName: '',
        flowType: '',
        userName: '',
        userId: '',
        urgentState: '',
        typeName: '',
        typeId: '',
      },
      currentTree: '',
      fullscreenLoading: true,
      dialogFormVisible: false,
      opinion: '',
      id: '',
      ids: '', //已办实例id集合,
      selectInstanceId: '',
      selectDefId: '',
      selectBpmnInstId: '',
      //流程导出标识
      currentSerialType: 'doneInst',
      //当前查询参数
      currentQueryFilter: {},
      isExport: false,
    }
  },
  watch: {
    'form.orgId': {
      handler(newName, oldName) {
        this.search('find')
      },
      immediate: true,
    },
  },
  computed: {
    // ...mapState('storeProcess', ['rows', 'pagination', 'total']),
    //ccwgq 2022-10-24 解决公文中心数据重复错误的问题
    ...mapState('storeProcess', {
      rows: (state) => state.data.doneList,
      pagination: (state) => state.pagination,
      total: (state) => state.total,
    }),
    currentSwitchValue() {
      // lyzcw:2022-05-09 默认类别树展开
      return (
        localStorage.doneAsideShow === 'true' ||
        localStorage.doneAsideShow === true ||
        localStorage.doneAsideShow === undefined
      )
    },
  },
  methods: {
    // lyzcw:2022-06-08 展开收起高级搜索
    advanceSearch() {
      this.showAdvance = !this.showAdvance
    },
    //将当前展开或者收起的值存在localStorage中
    handleSwitch(val) {
      localStorage.doneAsideShow = val
    },
    rowClick(row, column, event) {
      this.$refs.htTable.toggleRowSelection(row)
    },
    //流程抄送
    taskToCopyTo() {
      if (this.ids == '') {
        this.$message.warning('请选择要抄送的流程')
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
    formatDate(value) {
      return utils.formatDate(value.createTime)
    },
    handleClose(done) {
      this.dialogFormVisible = true
    },
    //强制收回到上一个节点
    handleRevoke(id) {
      this.dialogFormVisible = true
      this.id = id
    },
    saveRevoke() {
      if (this.opinion == '') {
        this.$message.warning('请填写强制收回意见')
        return false
      }
      let data = {
        instanceId: this.id,
        isHandRevoke: true,
        cause: this.opinion,
      }
      this.$store.dispatch('storeProcess/revokeInstance', data).then(() => {
        this.dialogFormVisible = false
        this.opinion = ''
        this.search()
      })
    },
    exitRevoke() {
      this.dialogFormVisible = false
      this.opinion = ''
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
      this.openFullScreen()
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
            property: 'wfInst.proc_def_name_',
            value: this.form.tableData,
            group: 'main',
            operation: 'LIKE',
            relation: 'OR',
          },
          {
            property: 'wfInst.subject_',
            value: this.form.tableData,
            group: 'main',
            operation: 'LIKE',
            relation: 'OR',
          },
          {
            property: 'wfInst.id_',
            value: this.form.tableData,
            group: 'main',
            operation: 'LIKE',
            relation: 'OR',
          },
          // lyzcw: 2022-06-10，模糊查询支持公文编号
          // {
          //   property: 'wfInst.SERIAL_NO',
          //   value: this.form.tableData,
          //   group: 'main',
          //   operation: 'LIKE',
          //   relation: 'OR',
          // },
          // lyzcw：2021-10-18 添加支持发起人姓名模糊查询
          {
            property: 'wfInst.CREATOR_',
            value: this.form.tableData,
            group: 'main',
            operation: 'LIKE',
            relation: 'OR',
          },
        ]
      }
      if (this.form.orgId) {
        querys.push({
          property: 'wfInst.CREATE_ORG_PATH_',
          value: this.form.orgId,
          group: 'orgId',
          operation: 'LIKE',
          relation: 'AND',
        })
      }
      if (this.currentTree) {
        querys.push({
          property: 'wfInst.type_id_',
          value: this.currentTree,
          group: 'typeId',
          operation: 'IN',
          relation: 'AND',
        })
      }
      if (this.form.date) {
        beginDate = utils.formatDate(this.form.date[0].getTime())
        endDate = utils.formatDate(this.form.date[1].getTime())
        querys.push({
          property: 'wfInst.create_time_',
          value: [beginDate, endDate],
          group: 'time',
          operation: 'BETWEEN',
          relation: 'AND',
        })
      }

      if (this.defKey) {
        querys.push({
          property: 'wfInst.proc_def_key_',
          value: this.defKey,
          operation: 'EQUAL',
          relation: 'AND',
        })
      }
      // lyzcw：2022-06-09 添加高级查询
      // if (this.form.serialNo) {
      //   querys.push({
      //     property: 'wfInst.SERIAL_NO', // 从流程实例表中查询公文编号
      //     value: this.form.serialNo,
      //     group: 'main',
      //     operation: 'LIKE',
      //     relation: 'AND',
      //   })
      // }
      if (this.form.subject) {
        querys.push({
          property: 'wfInst.subject_',
          value: this.form.subject,
          group: 'main',
          operation: 'LIKE',
          relation: 'AND',
        })
      }

      if (this.form.defName) {
        querys.push({
          property: 'wfInst.proc_def_name_',
          value: this.form.defName,
          group: 'main',
          operation: 'LIKE',
          relation: 'AND',
        })
      }
      if (this.form.userId) {
        querys.push({
          property: 'wfInst.CREATE_BY_',
          value: this.form.userId,
          group: 'main',
          operation: 'EQUAL',
          relation: 'AND',
        })
      }
      if (this.form.urgentState) {
        querys.push({
          property: 'wfInst.URGENT_STATE_',
          value: this.form.urgentState,
          group: 'main',
          operation: 'EQUAL',
          relation: 'AND',
        })
      }
      //类别
      if (this.form.typeId) {
        querys.push({
          property: 'wfInst.TYPE_PATH_',
          value: this.form.typeId,
          group: 'main',
          operation: 'LIKE',
          relation: 'AND',
        })
      }

      // yigz：2022-06-16 添加高级查询
      // if (this.form.ourPartyText) {
      //   querys.push({
      //     property: 'wfInst.OUR_PARTY_TEXT', // 从流程实例表中查询我方主体
      //     value: this.form.ourPartyText,
      //     group: 'main',
      //     operation: 'LIKE',
      //     relation: 'AND',
      //   })
      // }

      queryFilter = {pageBean: this.pagination, querys}
      this.$store
        .dispatch('storeProcess/getDoneByPagination', queryFilter)
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
      let tableName = '已办公文'
      let expTableName = '公文标题,呈报人,呈报部门,呈报时间'

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

    //重置
    reset() {
      this.form = {
        tableData: '',
        date: '',
        orgName: '',
        orgId: '',
        serialNo: '',
        ourPartyText: '',
        subject: '',
        defName: '',
        flowType: '',
        userName: '',
        userId: '',
        urgentState: '',
        typeName: '',
        typeId: '',
      }
      this.search('find')
    },
    handleRowClick(row, newWin) {
      // lyzcw:2022-09-05:支持已阅公文
      console.log('row.type：', row.type)
      if (row.type == 'copyto') {
        this.handleRowClickCopyto(row, newWin)
        return
      }
      console.log('判断是否显示强制收回按钮 ===>', row)
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
    // lyzcw:2022-09-05:支持已阅公文
    handleRowClickCopyto(row, newWin) {
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
      console.log('handleOpenUrl ===>', url)
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
    //子组件传值父组件(已办分类查询)
    getCurrent(data) {
      if (data.id == 6) {
        this.currentTree = ''
      } else {
        let ids = []
        this.getFlowTrees(data, ids)
        this.currentTree = ids.join(',')
      }
      this.search('find')
    },
    getFlowTrees(data, ids) {
      ids.push(data.id)
      let arr = data.children
      for (var i = 0; i < arr.length; i++) {
        this.getFlowTrees(arr[i], ids)
      }
    },
    loadCount() {
      let pageBean = {}
      return process.getDoneInstCount(pageBean)
    },
    async handleShowTaskImage(row) {
      await this.changeSeletion(row)
      this.$refs.taskImage.handleOpen()
    },
    changeSeletion(row) {
      this.selectInstanceId = row.id
      this.selectBpmnInstId = row.bpmnInstId
    },
    //ccwgq 2022-09-07 在 table组件的updated钩子里补充逻辑
    updatedTable() {
      // this.$nextTick(()=>{
      //  const $wrapper=$(this.$el).find('.el-table__body-wrapper');
      //  if($wrapper.length){
      //     $wrapper.css({height:"100%!important"})
      //  }
      // })
    },
  },
  created() {
    this.asideShow = this.currentSwitchValue
    this.isAsideShow = this.currentSwitchValue
    let querys = []
    if (this.defKey) {
      querys.push({
        property: 'proc_def_key_',
        value: this.defKey,
        operation: 'EQUAL',
        relation: 'AND',
      })
    }
    let pageBean = {
      pageBean: {page: '1', pageSize: '10', showTotal: 'true'},
      querys,
    } //初次加载默认pageBean
    this.$store
      .dispatch('storeProcess/getDoneByPagination', pageBean)
      .then(() => {
        //页面加载调用done.js里面的分页方法
        this.fullscreenLoading = false
      })
    this.currentQueryFilter = pageBean
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
@import '@/assets/css/change-font.scss';
.el-table /deep/ th.done-header-row {
  background-color: #fafafa;
  font-size: 13px;
}

.el-table /deep/ tr.done-row {
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

.done-subject {
  cursor: pointer;
}

.done-subject {
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
  // display: flex;
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
</style>