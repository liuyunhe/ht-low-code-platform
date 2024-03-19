<template>
  <el-container class="list_main_content fullheight">
    <el-aside
      width="200px"
      v-if="!$route.meta.single"
      v-show="asideShow"
      class="aside-tree__wrap"
    >
      <p class="flow_tree_top_title">
        {{ $t('navigator.myTodo') }} {{ $t('navigator.type') }}
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
    <!-- <el-aside width="200px" v-if="!$route.meta.single">
      <b class="top-title el-icon-menu">待办事项分类</b>
      <FlowTree ref="FlowTree" @currentTree="getCurrent" :loadCount="loadCount"></FlowTree>
    </el-aside> -->
    <el-container style="border-left: 1px solid #e7eaec">
      <h3 class="flow_table_title">
        {{ $t('navigator.myTodo') }} {{ $t('navigator.list') }}
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
                  placeholder="标题/流程名称/任务名称/发起人姓名"
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
              </el-col> -->
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
            <!-- <el-button size="small" @click="batchHandle">批量处理</el-button> -->
          </el-col>
        </el-row>
      </div>
      <el-main class="content">
        <!-- default-sort 默认不排序（排序时查询待办很慢，用户可以点击某列进行排序） -->
        <!-- ccwgq 2022-06-07 字体加大后修复table内的部分样式 -->
        <el-table
          :data="rows"
          height="100%"
          ref="htTable"
          style="width: 100%"
          header-cell-class-name="todo-header-row"
          row-class-name="todo-row"
          size="medium"
          @row-click="rowClick"
          v-loading="fullscreenLoading"
          @selection-change="handleSelectionChange"
          v-if="defaultFiledShowConf"
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
          <!-- <el-table-column
            prop="procInstId"
            :label="defaultFiledShowConf.procInstId.desc"
            :v-if="defaultFiledShowConf.procInstId.frontShow"
            show-overflow-tooltip
            width="180"
            align="center"
          ></el-table-column> -->
          <!--lyzcw: 2022-06-08 默认显示prop6公文编号:label="defaultFiledShowConf.prop6.desc"-->
          <!-- <el-table-column
            prop="serialNo"
            label="公文编号"
            align="center"
            width="160"
            show-overflow-tooltip
          ></el-table-column> -->
          <!-- <el-table-column
            prop="serialNo"
            label="公文编号"
            align="center"
            width="160"
            show-overflow-tooltip
          ></el-table-column> -->
          <!--<el-table-column
            prop="ourPartyText"
            label="我方主体"
            align="center"
            show-overflow-tooltip
            width="150"
          ></el-table-column>-->
          <el-table-column
            :label="defaultFiledShowConf.subject.desc"
            :v-if="defaultFiledShowConf.subject.frontShow"
            show-overflow-tooltip
            
          >
            <!-- yigz 2022-11-05:待办公文以修窗口形式打开 -->
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
            :label="defaultFiledShowConf.procDefName.desc"
            :v-if="defaultFiledShowConf.procDefName.frontShow"
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
            :v-if="defaultFiledShowConf.name.frontShow"
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
            :v-if="defaultFiledShowConf.createTime.frontShow"
            align="center"
            width="180"
          >
            <template slot-scope="scope">
              <span> {{ scope.row.createTime | formatDate }} </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="creator"
            :label="defaultFiledShowConf.creator.desc"
            v-if="defaultFiledShowConf.creator.frontShow"
            align="center"
            width="80"
          ></el-table-column>
          <!-- <el-table-column
            prop="ownerName"
            :label="defaultFiledShowConf.ownerName.desc"
            :v-if="defaultFiledShowConf.ownerName.frontShow"
            align="center"
            width="80"
          ></el-table-column> -->
          <!-- <el-table-column
            prop="assigneeName"
            :label="defaultFiledShowConf.assigneeName.desc"
            :v-if="defaultFiledShowConf.assigneeName.frontShow"
            align="center"
            width="90"
          ></el-table-column> -->
          <el-table-column
            width="70"
            :label="defaultFiledShowConf.status.desc"
            :v-if="defaultFiledShowConf.status.frontShow"
            align="center"
          >
            <template slot-scope="{row}">
              <span size="small" class="blue-color">{{
                status[row.status] +
                (row.instIsForbidden === '1' ? '(挂起)' : '')
              }}</span>
            </template>
          </el-table-column>
          <!-- lyzcw: 2021-08-16 添加显示紧急状态列 -->
          <!-- <el-table-column
            show-overflow-tooltip
            width="80"
            :label="defaultFiledShowConf.urgentStateValue.desc"
            :v-if="defaultFiledShowConf.urgentStateValue.frontShow"
            align="center"
          >
            <template slot-scope="{row}">
              <span
                size="small"
                :style="urgentStateColor(row.urgentStateValue)"
                >{{ urgentStateName[row.urgentStateValue] }}</span
              >
            </template>
          </el-table-column> -->

          <!-- <el-table-column
            prop="prop1"
            :label="defaultFiledShowConf.prop1.desc"
            :v-if="defaultFiledShowConf.prop1.frontShow"
            align="center"
            width="100"
          ></el-table-column> -->
          <el-table-column
            prop="prop2"
            :label="defaultFiledShowConf.prop2.desc"
            v-if="defaultFiledShowConf.prop2.frontShow"
            align="center"
            width="100"
          ></el-table-column>
          <!-- <el-table-column
            prop="prop3"
            :label="defaultFiledShowConf.prop3.desc"
            :v-if="defaultFiledShowConf.prop3.frontShow"
            align="center"
            width="100"
          ></el-table-column> -->
          <!-- <el-table-column
            prop="prop4"
            :label="defaultFiledShowConf.prop4.desc"
            :v-if="defaultFiledShowConf.prop4.frontShow"
            align="center"
            width="100"
          ></el-table-column> -->
          <!-- <el-table-column
            prop="prop5"
            :label="defaultFiledShowConf.prop5.desc"
            :v-if="defaultFiledShowConf.prop5.frontShow"
            align="center"
            width="100"
          ></el-table-column> -->

          <!-- <el-table-column
            prop="prop6"
            :label="defaultFiledShowConf.prop6.desc"
            :v-if="defaultFiledShowConf.prop6.frontShow"
            align="center"
            width="100"
          ></el-table-column> -->

          <!-- <el-table-column label="到期时间" align="center" width="180">
            <template slot-scope="scope">
              <span :style="computeColor(scope.row.deadline)">{{
                computeTime(scope.row.deadline)
              }}</span>
            </template>
          </el-table-column> -->
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
    <el-dialog
      :visible.sync="batchDialogVisible"
      title="批量处理"
      @close="batchHandleSetting = {}"
      @opened="afterOpen"
    >
      <el-form
        v-model="batchHandleSetting"
        label-width="120px"
        ref="batchHandleForm"
      >
        <el-form-item label="审批意见">
          <el-input
            type="textarea"
            placeholder="请输入审批内容"
            v-model="batchHandleSetting.opinion"
            maxlength="500"
            show-word-limit
          ></el-input>
        </el-form-item>
        <el-form-item label="审批动作" validate="required">
          <el-select v-model="batchHandleSetting.action" validate="required">
            <el-option key="agree" label="同意" value="agree"></el-option>
            <el-option key="reject" label="驳回" value="reject"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="驳回重提模式"
          v-if="
            batchHandleSetting.action === 'reject' ||
            batchHandleSetting.action === 'backToStart'
          "
          validate="required"
        >
          <el-radio v-model="batchHandleSetting.backHandMode" label="normal"
            >重新审批</el-radio
          >
          <el-radio v-model="batchHandleSetting.backHandMode" label="direct"
            >回到本节点</el-radio
          >
        </el-form-item>
        <el-form-item
          label="驳回方式"
          v-if="
            batchHandleSetting.action === 'reject' ||
            batchHandleSetting.action === 'backToStart'
          "
          validate="required"
        >
          <el-radio v-model="batchHandleSetting.rejectType" label="backToStart"
            >驳回到发起人</el-radio
          >
          <el-radio v-model="batchHandleSetting.rejectType" label="reject"
            >驳回上一步</el-radio
          >
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          @click="batchHandleSubmit"
          :loading="batchSubmitBtnLoad"
          >提交</el-button
        >
        <el-button @click="batchDialogVisible = false">取消</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :visible.sync="batchResultDialog"
      title="处理结果"
      @close="afterResultClose"
    >
      <template>
        <div v-if="batchUnBatchableList.length !== 0">
          <span>以下任务不允许批量办理，请进入页面审批</span>
          <div v-for="task in batchUnBatchableList" v-bind:key="task">
            <el-link type="primary" @click="open(task)">{{
              task.subject
            }}</el-link>
          </div>
        </div>
      </template>
      <template>
        <div v-if="batchCompleteList.length !== 0">
          <span>以下任务处理完成</span>
          <div v-for="task in batchCompleteList" v-bind:key="task.procInstId">
            <el-link type="success" @click="doneView(task.procInstId)">{{
              task.subject
            }}</el-link>
          </div>
        </div>
      </template>
      <template>
        <div v-if="batchFailedList.length !== 0">
          <span>以下任务处理失败</span>
          <div v-for="task in batchFailedList" v-bind:key="task.id">
            <el-link type="danger"
              >{{ task.subject }}({{ failedMsgMap[task.id] }})</el-link
            >
          </div>
        </div>
      </template>
      <template>
        <div v-if="batchNotAuthList.length !== 0">
          <span>以下任务您无权处理</span>
          <div v-for="task in batchNotAuthList" v-bind:key="task.subject">
            <el-link disabled>{{ task.subject }}</el-link>
          </div>
        </div>
      </template>
    </el-dialog>
  </el-container>
</template>

<script>
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
import req from '@/request.js'
//ccwgq 2022-07-07 引入流程的事件总线 (07-08改成mixin)
// import FlowBus from '@/components/eipControl/bus/FlowMenuBus.js'
import FlowMenuMixin from '@/components/flow/ou/OuFlowMenu.js'
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
// lyzcw: 2021-08-16 添加列表显示紧急状态
const URGENTNAME = {
  3: '正常',
  2: '重要',
  1: '紧急',
}

export default {
  name: 'todo',
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
    orgName: {type: String, default: ''},
    orgId: {type: String, default: ''},
  },
  data() {
    return {
      showAdvance: false,
      isAsideShow: true,
      batchHandleIds: [],
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
      status: STATUS,
      currentTree: '',
      fullscreenLoading: true,
      sorter: [],
      urgentStateConf: {},
      urgentStateConfList: [],
      urgentStateVal: '',
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
        // {name: 'serialNo', desc: '公文编号', frontShow: false},
        // {name: 'ourPartyText', desc: '我方主体', frontShow: false},
        {name: 'prop1', desc: '扩展1', frontShow: false},
        {name: 'prop2', desc: '扩展2', frontShow: false},
        {name: 'prop3', desc: '扩展3', frontShow: false},
        {name: 'prop4', desc: '扩展4', frontShow: false},
        {name: 'prop5', desc: '扩展5', frontShow: false},
        {name: 'prop6', desc: '扩展6', frontShow: true},
      ],
      selectInstanceId: '',
      selectBpmnInstId: '',
      selectDefId: '',
      batchDialogVisible: false,
      batchHandleSetting: {},
      batchResultDialog: false,
      batchCompleteList: [],
      batchFailedList: [],
      batchUnBatchableList: [],
      batchNotAuthList: [],
      failedMsgMap: {},
      batchSubmitBtnLoad: false,
      skipMsg: '',
      unBatchMsg: '',
      urgentStateName: URGENTNAME,
      //流程导出标识
      currentSerialType: 'todo',
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
      rows: (state) => state.data.todoList,
      pagination: (state) => state.pagination,
      total: (state) => state.total,
    }),
    currentSwitchValue() {
      // lyzcw:2022-05-09 默认类别树展开
      return (
        localStorage.todoAsideShow === 'true' ||
        localStorage.todoAsideShow === true ||
        localStorage.todoAsideShow === undefined
      )
    },
  },
  created() {
    this.getTaskList()
    this.asideShow = this.currentSwitchValue
    this.isAsideShow = this.currentSwitchValue
  },
  methods: {
    // lyzcw:2022-06-08 展开收起高级搜索
    advanceSearch() {
      this.showAdvance = !this.showAdvance
    },

    //将当前展开或者收起的值存在localStorage中
    handleSwitch(val) {
      localStorage.todoAsideShow = val
    },
    getTaskList() {
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
      let pageBean = {
        pageBean: {page: '1', pageSize: '10', showTotal: 'true'},
        querys: querys,
      } //初次加载默认pageBean
      // this.$store
      //   .dispatch("storeProcess/getUrgentStateConf", { getConf: true })
      //   .then(data => {
      this.$store
        .dispatch('storeProcess/getTodoByPagination', pageBean)
        .then(() => {
          //页面加载调用tudo.js里面的分页方法
          this.fullscreenLoading = false
        })
      this.currentQueryFilter = pageBean
      // if (data.conf) {
      //   try {
      //     data.conf = JSON.parse(data.conf);
      //   } catch (error) {
      //     data.conf = eval("(" + data.conf + ")");
      //   }
      //   this.urgentStateConfList = data.conf;
      //   let conf = {};
      //   for (let index = 0, c; (c = data.conf[index++]); ) {
      //     if (c.default) {
      //       this.urgentStateConf.defaultValue = c.state;
      //     }
      //     conf[c.state] = c;
      //   }
      //   this.urgentStateConf.conf = conf;
      // }
      // });
    },
    rowClick(row, column, event) {
      //操作列不触发多选按钮
      if (column && column.label == '流程图') {
        return
      }
      this.$refs.htTable.toggleRowSelection(row)
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
    // 处理排序
    handleSortChange: function (m) {
      this.sorter.splice(
        this.sorter.findIndex((s) => s.property == m.prop),
        1
      )
      if (m.order) {
        this.sorter.push({
          property: m.prop,
          direction: m.order == 'ascending' ? 'ASC' : 'DESC',
        })
      }
      this.search()
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
          // {
          //   property: 'bt.PROP6_',
          //   value: this.form.tableData,
          //   group: 'main',
          //   operation: 'LIKE',
          //   relation: 'OR',
          // },
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
      // if (this.form.serialNo) {
      //   querys.push({
      //     property: 'inst.SERIAL_NO', // 从流程实例表查询公文编号
      //     value: this.form.serialNo,
      //     group: 'main',
      //     operation: 'LIKE',
      //     relation: 'AND',
      //   })
      // }
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
      // if (this.form.ourPartyText) {
      //   querys.push({
      //     property: 'inst.OUR_PARTY_TEXT', // 实例表查询我方主体
      //     value: this.form.ourPartyText,
      //     group: 'main',
      //     operation: 'LIKE',
      //     relation: 'AND',
      //   })
      // }

      queryFilter = {pageBean: this.pagination, querys, sorter: this.sorter}
      this.openFullScreen()
      this.$store
        .dispatch('storeProcess/getTodoByPagination', queryFilter)
        .then(() => {
          this.fullscreenLoading = false
        })
      this.currentQueryFilter = queryFilter
    },

    /**
    serialType 接口标识
    getType  查询结果：page  所有数据：all
    tableName 导出的表格名称
    expTableName 导出的字段名称：多个字段之间用“，”分割，base64格式 不带“+”
    expField 导出的字段名称标识：多个字段之间用“，”分割，base64格式 不带“+”
    queryFilter 查询参数请求体 
 */

    //导出流程列表
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
      let tableName = '待办公文'
      let expTableName = '公文标题,呈报人,呈报部门,呈报时间'

      let Base64 = require('js-base64').Base64
      expTableName = encodeURIComponent(Base64.encode(expTableName))
      // createOrgPathName 创建人所属组织树名称
      // createOrgName 创建人所属组织名称
      let expField = 'serialNo,subject,creator,createOrgPathName,createDate'
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
        userName: '',
        userId: '',
        urgentState: '',
        typeName: '',
        typeId: '',
      }
      this.search('find')
    },
    handleRowClick(row, newWin) {
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
          url = '/sysModuleInst/' + row.id + '/0' + '/' + this.defKey + '/true'
        }
        this.handleOpenUrl(url, newWin)
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
        this.currentTree = ''
        this.openFullScreen()
        let pageBean = {pageBean: this.pagination}
        this.$store
          .dispatch('storeProcess/getTodoByPagination', pageBean)
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
      return process.getCountByUserId(this.pagination)
    },
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
    urgentStateColor(stateValeu) {
      if (stateValeu == 3)
        //绿色
        return {color: '#22870D'}
      else if (stateValeu == 2)
        //黄色
        return {color: '#E1A306'}
      else if (stateValeu == 1)
        //红色
        return {color: '#F1300A'}
      return {}
    },
    async handleShowTaskImage(row) {
      await this.changeSeletion(row)
      this.$refs.taskImage.handleOpen()
    },
    changeSeletion(row) {
      this.selectInstanceId = row.procInstId
      this.selectBpmnInstId = row.bpmnInstId
    },
    batchHandle() {
      let selectTasks = this.$refs.htTable.selection
      if (!selectTasks || selectTasks.length == 0) {
        this.$message({type: 'warning', message: '请至少选择一条任务'})
        return
      }
      //忽略掉非待办类型的任务
      let ids = []
      this.skipMsg = ''
      for (let i = selectTasks.length - 1; i >= 0; i--) {
        if (selectTasks[i].status == 'NORMAL') {
          ids.push(selectTasks[i].id)
        } else {
          this.skipMsg += selectTasks[i].subject + '</br>'
          selectTasks.splice(i, 1)
        }
      }
      if (ids.length > 0) {
        req
          .get(
            '${bpmRunTime}/runtime/task/v1/filterUnBatchable?taskIds=' +
              ids.join(',')
          )
          .then((resp) => {
            if (resp.data.state && resp.data.value) {
              if (resp.data.value.length != ids.length) {
                ids = resp.data.value
                let unBatchMsg = '以下任务未配置批量处理<br/>'
                for (let i = selectTasks.length - 1; i >= 0; i--) {
                  if (!resp.data.value.includes(selectTasks[i].id)) {
                    unBatchMsg += selectTasks[i].subject + '<br/>'
                    selectTasks.splice(i, 1)
                  }
                }
                //this.$message({type:"warning",dangerouslyUseHTMLString:true,message:unBatchMsg});
                this.unBatchMsg = unBatchMsg
              }
              if (ids && ids.length > 0) {
                this.batchHandleIds = ids
                this.batchDialogVisible = true
              } else {
                this.showMsg()
              }
            }
          })
      } else {
        if (this.skipMsg) {
          this.showMsg()
        }
      }
      this.batchHandleCheck()
    },
    batchHandleCheck() {},
    batchHandleSubmit() {
      let errMsg = ''
      this.batchSubmitBtnLoad = true
      if (!this.batchHandleSetting.opinion || !this.batchHandleSetting.action) {
        errMsg = '完善表单信息'
      }
      if (
        this.batchHandleSetting.action == 'reject' &&
        (!this.batchHandleSetting.backHandMode ||
          !this.batchHandleSetting.rejectType)
      ) {
        errMsg = '请完善驳回设置'
      }
      if (errMsg) {
        this.$message({type: 'warning', message: errMsg})
        this.batchSubmitBtnLoad = false
        return
      }
      let action
      if (this.batchHandleSetting.action == 'agree') {
        action = 'agree'
      } else {
        action =
          this.batchHandleSetting.rejectType || this.batchHandleSetting.action
      }
      this.$http
        .post(window.context.bpmRunTime + '/runtime/task/v1/batchHandle', {
          taskIds: this.batchHandleIds.join(','),
          action: action,
          opinion: this.batchHandleSetting.opinion,
        })
        .then((resp) => {
          if (resp.data && resp.data.state) {
            this.batchDialogVisible = false
            this.batchSubmitBtnLoad = false
            this.showBatchResult(resp.data.value)
          }
        })
    },
    showBatchResult(taskMaps) {
      this.batchCompleteList = taskMaps['complete']
      this.batchFailedList = taskMaps['failedList']
      this.batchUnBatchableList = taskMaps['unHandleList']
      this.batchNotAuthList = taskMaps['notAuth']
      this.failedMsgMap = taskMaps['failedMsg']
      this.batchResultDialog = true
    },
    afterBatchClose() {
      this.batchDialogVisible = false
      this.batchHandleSetting = {}
    },
    afterResultClose() {
      this.batchCompleteList = []
      this.batchFailedList = []
      this.batchUnBatchableList = []
      this.batchNotAuthList = []
      this.failedMsgMap = []
      this.batchResultDialog = false
      this.search('find')
    },
    open(row) {
      let token = this.$store.state.login.currentUser.token
      if (row.status == 'SHARE' || row.status == 'BACKSHARE') {
        if (row.identityList && row.identityList.length == 1) {
          let url =
            '/task/' + row.id + '/' + row.identityList[0].id + '?token=' + token
          //this.$router.push(url);
          window.open(window.context.front + url, '_self')
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
                  /*this_.$router.push(
                          "/task/" + row.id + "/" + se[se.selectedIndex].value
                  );*/
                  let url =
                    window.context.front +
                    '/task/' +
                    row.id +
                    '/' +
                    se[se.selectedIndex].value +
                    '?token=' +
                    token
                  window.open(url, '_self')
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
        //this.$router.push("/instRead/" + row.procInstId + "/agent");
        window.open(
          window.context.front +
            '/instRead/' +
            row.procInstId +
            '/agent' +
            '?token=' +
            token,
          '_self'
        )
      } else if (row.status == 'FOLLOW') {
        //跟踪任务
        //this.$router.push("/taskRead/" + row.id + "/FOLLOW");
        window.open(
          window.context.front +
            '/taskRead/' +
            row.id +
            '/FOLLOW' +
            '?token=' +
            token,
          '_self'
        )
      } else {
        let url = '/task/' + row.id + '/0'
        if (this.defKey) {
          url += '/noSingle' + '?token=' + token
        }
        //this.$router.push(url);
        window.open(window.context.front + url, '_self')
      }
    },
    doneView(procId) {
      let token = this.$store.state.login.currentUser.token
      let url =
        window.context.front + '/inst/' + procId + '/doneList?token=' + token
      window.open(url, '_self')
    },
    afterOpen() {
      this.showMsg()
    },
    showMsg() {
      let message = ''
      if (this.skipMsg) {
        message =
          '以下任务不是待办任务，不支持批量处理:</br>' + this.skipMsg + '<br/>'
      }
      if (this.unBatchMsg) {
        message += this.unBatchMsg
      }
      if (message) {
        this.$message({
          dangerouslyUseHTMLString: true,
          message,
          type: 'warning',
        })
      }
    },
    //ccwgq 2022-09-07 在 table组件的updated钩子里补充逻辑
    updatedTable() {
      // this.$nextTick(()=>{
      //  const $wrapper=$(this.$el).find('.el-table__body-wrapper');
      //  if($wrapper.length){
      // $wrapper.removeAttr('style');
      //  }
      // })
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
@import '@/assets/css/change-font.scss';
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
