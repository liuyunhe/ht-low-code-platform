<template>
  <el-container class="list_main_content fullheight">
    <el-aside
      width="200px"
      v-if="!$route.meta.single"
      v-show="asideShow"
      class="aside-tree__wrap"
    >
      <p class="flow_tree_top_title">
        {{ $t('navigator.myRequest') }} {{ $t('navigator.type') }}
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
      <h3 class="flow_table_title">
        {{ $t('navigator.myRequest') }} {{ $t('navigator.list') }}
      </h3>
      <div class="content_top_wrap" style="flex-wrap: wrap">
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
                  placeholder="标题/编号/流程名称"
                  prefix-icon="el-icon-search"
                  v-model="form.tableData"
                  @keyup.enter.native="searchEnterFun"
                ></el-input>
              </el-col>
              <el-col :span="11">
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
              <el-col :span="5">
                <el-select
                  class="form_status"
                  v-model="form.statusData"
                  @change="statusChange"
                  clearable
                  placeholder="请选择状态"
                >
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
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
              <!-- <el-col :span="11">
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
              <!-- <el-col :span="5">
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
              <el-col :span="11">
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
              <el-col :span="5">
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
                <!-- <div>
              <eip-user-selector
                class="form_user_selector"
                style="display: inline-block"
                placeholder="发起人"
                :single="true"
                v-model="form.userName"
                :config="{ id: 'form.userId' }"
              />
            </div> -->
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
          style="width: 100%"
          header-cell-class-name="myRequest-header-row"
          row-class-name="myRequest-row"
          size="medium"
          v-loading="fullscreenLoading"
          :default-sort="{prop: 'status,createTime', order: 'descending'}"
          @hook:updated="updatedTable"
        >
          <el-table-column
            type="index"
            align="center"
            label="序号"
            width="80"
          ></el-table-column>
          <el-table-column label="流程图" align="center" width="70">
            <template slot-scope="scope">
              <el-button
                @click="handleShowTaskImage(scope.row)"
                icon="icon-flow1"
                size="mini"
              ></el-button>
            </template>
          </el-table-column>
          <!-- <el-table-column
            prop="id"
            width="160"
            show-overflow-tooltip
            align="center"
            label="流程编号"
          ></el-table-column> -->
          <!-- <el-table-column
            prop="serialNo"
            label="公文编号"
            align="center"
            width="170"
          ></el-table-column> -->
          <el-table-column
            label="标题"
            show-overflow-tooltip
            align="left"
          >
            <!-- yigz 2022-11-05:我的请求以修窗口形式打开 -->
            <template slot-scope="scope">
              <span
                class="myRequest-subject"
                @click="handleRowClick(scope.row, true)"
                @contextmenu.prevent="handleRowClick(scope.row, true)"
                >{{ scope.row.subject }}</span
              >
            </template>
          </el-table-column>
          <!-- <el-table-column
            prop="ourPartyText"
            label="我方主体"
            align="left"
            show-overflow-tooltip
            width="140"
          ></el-table-column> -->
          <el-table-column
            label="流程名称"
            show-overflow-tooltip
            align="left"
            width="150"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.procDefName }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="createTime"
            label="创建时间"
            align="center"
            width="180"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span> {{ scope.row.createTime | formatDate }} </span>
            </template>
          </el-table-column>
          <!-- <el-table-column prop="creator" label="发起人" align="center" width="180"></el-table-column> -->
          <el-table-column
            width="80"
            show-overflow-tooltip
            align="left"
            label="状态"
          >
            <template slot-scope="scope">
              <span
                v-if="
                  scope.row.status == 'revoke' ||
                  scope.row.status == 'revokeToStart' ||
                  scope.row.status == 'back' ||
                  scope.row.status == 'backToStart'
                "
                style="color: #f71010"
                >{{ myRequestStatus[scope.row.status] }}</span
              >
              <span v-if="scope.row.status == 'draft'" style="color: #c2a437">{{
                myRequestStatus[scope.row.status]
              }}</span>
              <span
                v-if="scope.row.status == 'running'"
                style="color: #318409"
                >{{ myRequestStatus[scope.row.status] }}</span
              >
              <span
                v-if="
                  scope.row.status == 'end' || scope.row.status == 'manualend'
                "
                style="color: #909399"
                >{{ myRequestStatus[scope.row.status] }}</span
              >
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" v-if="showOperation">
            <template slot-scope="scope">
              <div>
                <!-- <el-button
                v-if="
                  scope.row.status == 'running' ||
                    scope.row.status == 'back' ||
                    scope.row.status == 'revoke'
                "
                size="mini"
                type="danger"
                @click="handleRevoke(scope.row.id, scope.row.status)"
                >强制收回</el-button
              > -->
                <el-button
                  v-if="scope.row.status == 'draft'"
                  size="mini"
                  type="danger"
                  @click="deleteDraft(scope.row.id)"
                  >删除草稿</el-button
                >
                <el-button
                  v-if="
                    scope.row.status == 'manualend' ||
                    scope.row.status == 'revokeToStart' ||
                    scope.row.status == 'backToStart' ||
                    (scope.row.status == 'back' &&
                      scope.row.backToStart == true)
                  "
                  size="mini"
                  type="danger"
                  @click="deleteBpm(scope.row.id)"
                  >删除</el-button
                >
                <el-button
                  style="margin-top: 5px"
                  v-if="
                    scope.row.status == 'revokeToStart' ||
                    scope.row.status == 'backToStart' ||
                    (scope.row.status == 'back' &&
                      scope.row.backToStart == true)
                  "
                  size="mini"
                  type="danger"
                  @click="doEndProcessById(scope.row.id)"
                  >终止</el-button
                >
              </div>
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
      <el-dialog
        title="强制收回到发起人"
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
    </el-container>
    <!-- 流程图 -->
    <TaskImage
      ref="taskImage"
      :bpmnInstId="selectBpmnInstId"
      :instId="selectInstanceId"
      :defId="selectDefId"
    />
  </el-container>
</template>

<script>
import {mapState, mapActions} from 'vuex'
import FlowTree from '@/components/flow/flowTree.vue'
import utils from '@/utils.js'
import process from '@/api/process.js'
import {Message} from 'element-ui'
import TaskImage from '@/components/flow/task/taskImage.vue'
import eipUserSelector from '@/components/eipControl/selector/EipUserSelector.vue'
import eipSysTypeSelector from '@/components/eipControl/selector/EipSysTypeSelector.vue'
//ccwgq 2022-07-07 引入流程的事件总线    (已经改为mixin)
// import FlowBus from '@/components/eipControl/bus/FlowMenuBus.js'
import FlowMenuMixin from '@/components/flow/ou/OuFlowMenu.js'
const MY_REQUEST_STATUS = {
  revoke: '强制收回',
  revokeToStart: '强制收回到发起人',
  draft: '草稿',
  running: '运行中',
  end: '结束',
  manualend: '人工结束',
  back: '驳回',
  backToStart: '驳回到发起人',
}

export default {
  name: 'myRequest',
  components: {
    FlowTree,
    // eipUserSelector,
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
      myRequestStatus: MY_REQUEST_STATUS,
      isAsideShow: false,
      asideShow: false,
      form: {
        tableData: '',
        date: '',
        statusData: '',
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
      fullscreenLoading: true,
      dialogFormVisible: false,
      opinion: '',
      currentTree: '',
      id: '',
      statusData: '',
      options: [
        // {
        //   value: '',
        //   label: '请选择状态',
        // },
        {
          value: 'revoke',
          label: '强制收回',
        },
        {
          value: 'draft',
          label: '草稿',
        },
        {
          value: 'back',
          label: '驳回',
        },
        {
          value: 'end',
          label: '结束',
        },
        {
          value: 'running',
          label: '运行中',
        },
      ],
      showOperation: false,
      selectInstanceId: '',
      selectDefId: '',
      selectBpmnInstId: '',
      //流程导出标识
      currentSerialType: 'myRequest',
      //当前查询参数
      currentQueryFilter: {},
      isExport: false,
    }
  },
  computed: {
    // ...mapState('storeProcess', ['rows', 'pagination', 'total']),
    //ccwgq 2022-10-24 解决公文中心数据重复错误的问题
    ...mapState('storeProcess', {
      rows: (state) => state.data.requestList,
      pagination: (state) => state.pagination,
      total: (state) => state.total,
    }),
    currentSwitchValue() {
      // lyzcw:2022-05-09 默认类别树展开
      return (
        localStorage.myRequestAsideShow === 'true' ||
        localStorage.myRequestAsideShow === true ||
        localStorage.myRequestAsideShow === undefined
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
      localStorage.myRequestAsideShow = val
    },
    //选择状态查询
    statusChange(value) {
      this.form.statusData = value
      this.search('find')
    },
    handleClose(done) {
      this.dialogFormVisible = true
    },
    //逻辑删除流程实例
    deleteBpm(id) {
      this.$confirm('确认删除此流程?', '提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        type: 'warning',
        closeOnClickModal: false,
      }).then(() => {
        this.$store.dispatch('storeProcess/restore', id).then(() => {
          this.search('find')
        })
      })
    },
    //终止流程
    doEndProcessById(id) {
      this.$confirm('确认终止此流程?', '提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        type: 'warning',
        closeOnClickModal: false,
      }).then(() => {
        this.$store.dispatch('storeProcess/doEndProcessById', id).then(() => {
          this.search('find')
        })
      })
    },
    //删除草稿
    deleteDraft(id) {
      this.$store.dispatch('storeProcess/removeDraftById', id).then(() => {
        this.search('find')
      })
    },
    //强制收回到发起人
    handleRevoke(id, status) {
      if (status == 'revokeToStart') {
        this.$message.warning('已强制收回，不能再强制收回')
        return false
      }
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
        isHandRevoke: false,
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
      if (
        this.form.tableData == '' &&
        this.form.statusData == '' &&
        (this.form.date == '' || this.form.date == null)
      ) {
        if (this.currentTree != '') {
          querys = [
            {
              property: 'bpm_pro_inst.type_id_',
              value: this.currentTree,
              group: 'typeId',
              operation: 'IN',
              relation: 'AND',
            },
          ]
        }
      } else {
        if (
          this.form.tableData != '' &&
          this.form.statusData != '' &&
          this.form.date != '' &&
          this.form.date != null
        ) {
          group = 'time'
        }
        if (this.form.date != null && this.form.date != '') {
          beginDate = utils.formatDate(this.form.date[0].getTime())
          endDate = utils.formatDate(this.form.date[1].getTime())
        }
        if (this.form.tableData) {
          querys.push({
            property: 'bpm_pro_inst.proc_def_name_',
            value: this.form.tableData,
            group: 'main',
            operation: 'LIKE',
            relation: 'OR',
          })
          querys.push({
            property: 'bpm_pro_inst.subject_',
            value: this.form.tableData,
            group: 'main',
            operation: 'LIKE',
            relation: 'OR',
          })
          querys.push({
            property: 'bpm_pro_inst.id_',
            value: this.form.tableData,
            group: 'main',
            operation: 'LIKE',
            relation: 'OR',
          })
          // lyzcw: 2022-06-10，模糊查询支持公文编号
        //   querys.push({
        //     property: 'bpm_task.PROP6_',
        //     value: this.form.tableData,
        //     group: 'main',
        //     operation: 'LIKE',
        //     relation: 'OR',
        //   })
        }
        if (beginDate && endDate) {
          querys.push({
            property: 'bpm_pro_inst.create_time_',
            value: [beginDate, endDate],
            group: 'time',
            operation: 'BETWEEN',
            relation: 'AND',
          })
        }

        if (this.form.statusData) {
          querys.push({
            property: 'bpm_pro_inst.status_',
            value: this.form.statusData,
            group: 'status',
            operation: 'LIKE',
            relation: 'AND',
          })
        }

        if (this.currentTree) {
          querys.push({
            property: 'bpm_pro_inst.type_id_',
            value: this.currentTree,
            group: 'typeId',
            operation: 'IN',
            relation: 'AND',
          })
        }
      }
      if (this.defKey) {
        querys.push({
          property: 'bpm_pro_inst.proc_def_key_',
          value: this.defKey,
          operation: 'EQUAL',
          relation: 'AND',
        })
      }
      // lyzcw：2022-06-09 添加高级查询
      // if (this.form.serialNo) {
      //   querys.push({
      //     property: 'bpm_pro_inst.SERIAL_NO', // 从流程实例表中查询公文编号
      //     value: this.form.serialNo,
      //     group: 'main',
      //     operation: 'LIKE',
      //     relation: 'AND',
      //   })
      // }
      if (this.form.subject) {
        querys.push({
          property: 'bpm_pro_inst.subject_',
          value: this.form.subject,
          group: 'main',
          operation: 'LIKE',
          relation: 'AND',
        })
      }

      if (this.form.defName) {
        querys.push({
          property: 'bpm_pro_inst.proc_def_name_',
          value: this.form.defName,
          group: 'main',
          operation: 'LIKE',
          relation: 'AND',
        })
      }
      if (this.form.userId) {
        querys.push({
          property: 'bpm_pro_inst.CREATE_BY_',
          value: this.form.userId,
          group: 'main',
          operation: 'EQUAL',
          relation: 'AND',
        })
      }
      if (this.form.urgentState) {
        querys.push({
          property: 'bpm_pro_inst.URGENT_STATE_',
          value: this.form.urgentState,
          group: 'main',
          operation: 'EQUAL',
          relation: 'AND',
        })
      }
      if (this.form.typeId) {
        querys.push({
          property: 'bpm_pro_inst.TYPE_PATH_',
          value: this.form.typeId,
          group: 'main',
          operation: 'LIKE',
          relation: 'AND',
        })
      }

      // yigz：2022-06-16 添加高级查询
      // if (this.form.ourPartyText) {
      //   querys.push({
      //     property: 'bpm_pro_inst.OUR_PARTY_TEXT', // 从流程实例表中查询我方主体
      //     value: this.form.ourPartyText,
      //     group: 'main',
      //     operation: 'LIKE',
      //     relation: 'AND',
      //   })
      // }
      // console.log('search quers ====>', querys)
      queryFilter = {pageBean: this.pagination, querys}
      this.$store
        .dispatch('storeProcess/getMyRequestByPagination', queryFilter)
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

      let tableName = '我的请求'
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
        statusData: '',
        serialNo: '',
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
    //子组件传值父组件(我的请求分类查询)
    getCurrent(data) {
      if (data.id == 6) {
        this.openFullScreen()
        this.currentTree = ''
        let pageBean = {pageBean: this.pagination}
        this.$store
          .dispatch('storeProcess/getMyRequestByPagination', pageBean)
          .then(() => {
            //页面加载调用myRequest.js里面的分页方法
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
    loadCount() {
      let pageBean = {}
      return process.getMyRequestCount(pageBean)
    },
    checkOperationShow(data) {
      //draft manualend revokeToStart backToStart back revokeToStart backToStart back(&&backToStart==true)
      //是否显示操作列
      if (!data || data.length == 0) {
        this.showOperation = false
        return
      }
      let arr = [
        'draft',
        'manualend',
        'revokeToStart',
        'backToStart',
        'revokeToStart',
      ]
      for (let i = 0; i < data.length; i++) {
        let row = data[i]
        if (
          (row.status == 'back' && row.backToStart == true) ||
          arr.includes(row.status)
        ) {
          this.showOperation = true
          return
        }
      }
      this.showOperation = false
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
      //   $wrapper.css({height:"100%!important"})
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
      .dispatch('storeProcess/getMyRequestByPagination', pageBean)
      .then(() => {
        //页面加载调用myRequest.js里面的分页方法
        this.fullscreenLoading = false
      })
    this.currentQueryFilter = pageBean
  },
  watch: {
    rows(newValue, oldValue) {
      this.checkOperationShow(newValue)
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
@import '@/assets/css/change-font.scss';
.el-table /deep/ th.myRequest-header-row {
  background-color: #fafafa;
  font-size: 13px;
}

.el-table /deep/ tr.myRequest-row {
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

.myRequest-subject {
  cursor: pointer;
}

.myRequest-subject {
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
  padding: 0px 0px 0px 0px !important;
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
    .form_date_picker {
      margin-right: 10px;
      min-width: 300px;
    }
    .form_status {
      margin-right: 10px;
      min-width: 200px;
    }
  }
}
</style>
