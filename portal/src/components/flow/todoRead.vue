<template>
  <el-container class="list_main_content fullheight">
    <el-aside
      width="200px"
      v-if="!$route.meta.single"
      v-show="asideShow"
      class="aside-tree__wrap"
    >
      <p class="flow_tree_top_title">
        {{ $t('navigator.toRead') }} {{ $t('navigator.type') }}
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
        {{ $t('navigator.toRead') }} {{ $t('navigator.list') }}
      </h3>
      <div class="content_top_wrap">
        <el-row class="done_read_btn">
          <el-col :span="2">
            <el-button size="small" type="primary" @click="noticeTurnDode()"
              >已阅</el-button
            ></el-col
          >
          <el-col :span="8"
            ><el-input
              size="small"
              clearable
              placeholder="标题/编号/流程名称"
              prefix-icon="el-icon-search"
              v-model="tableData"
              @keyup.enter.native="searchEnterFun"
            ></el-input
          ></el-col>
          <el-col :span="10">
            <div class="date_wrap">
              <p>到达时间</p>
              <el-date-picker
                v-model="date"
                type="datetimerange"
                align="right"
                size="small"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :default-time="['00:00:00', '23:59:59']"
              >
              </el-date-picker>
            </div>
          </el-col>
        </el-row>
        <!-- <el-row class="btn_wrap">
          <el-col :span="24">
            <el-button
              style="margin-left: 10px"
              size="small"
              type="primary"
              icon="el-icon-search"
              @click="search('find')"
              >搜索</el-button
            >
            <el-button size="small" @click="reset" icon="el-icon-refresh"
              >重置</el-button
            >
          </el-col>
        </el-row> -->
        <el-form
          ref="form"
          v-form
          data-vv-scope="form"
          class="content_top_wrap_form"
          style="flex-wrap: wrap"
        >
          <div>
            <el-row :gutter="10" v-if="showAdvance" style="flex-wrap: wrap">
              <el-col :span="8" style="margin-bottom: 5px">
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
              <el-col :span="8">
                <el-input
                  class="form_input"
                  size="small"
                  clearable
                  placeholder="公文编号"
                  prefix-icon="el-icon-document"
                  v-model="form.serialNo"
                  @keyup.enter.native="searchEnterFun"
                ></el-input>
              </el-col>
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
            </el-row>
            <el-row :gutter="10" v-if="showAdvance" style="flex-wrap: wrap">
              <el-col :span="8" style="margin-bottom: 5px">
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
              <!-- <el-col :span="8">
                <el-input
                  class="form_input"
                  size="small"
                  clearable
                  placeholder="我方主体"
                  prefix-icon="el-icon-s-fold"
                  v-model="form.ourPartyText"
                  @keyup.enter.native="searchEnterFun"
                ></el-input>
              </el-col>-->
              <el-col :span="5">
                <!-- <div> -->
                <eip-user-selector
                  class="form_user_selector"
                  style="display: inline-block"
                  placeholder="抄送人"
                  :single="true"
                  v-model="form.ownerName"
                  :config="{id: 'form.ownerId'}"
                />
                <!-- </div> -->
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

            <el-button size="small" type="primary" @click="search('find')"
              >搜索</el-button
            >
            <el-button size="small" @click="reset">重置</el-button>
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
          :key="uniqueKey"
          :data="rows"
          height="100%"
          style="width: 100%"
          header-cell-class-name="todo-header-row"
          row-class-name="todo-row"
          size="medium"
          v-loading="fullscreenLoading"
          :default-sort="{prop: 'createTime', order: 'descending'}"
          @selection-change="handleSelectionChange"
          @hook:updated="updatedTable"
        >
          <el-table-column
            type="selection"
            width="50"
            align="center"
          ></el-table-column>

          <!-- <el-table-column
            prop="procInstId"
            width="180"
            show-overflow-tooltip
            align="center"
            label="流程编号"
          ></el-table-column> -->
          <el-table-column
            prop="serialNo"
            label="公文编号"
            show-overflow-tooltip
            align="center"
            width="150"
          ></el-table-column>
          <!-- yigz 2022-11-05:抄送公文以修窗口形式打开 -->
          <el-table-column label="标题" show-overflow-tooltip align="left">
            <template slot-scope="scope">
              <span
                class="todo-subject"
                @click="handleRowClick(scope.row, true)"
                @contextmenu.prevent="handleRowClick(scope.row, true)"
                >{{ scope.row.subject }}</span
              >
            </template>
          </el-table-column>
          <el-table-column
            prop="ourPartyText"
            label="我方主体"
            align="left"
            show-overflow-tooltip
            width="150"
          ></el-table-column>
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
            label="任务名称"
            show-overflow-tooltip
            align="left"
            width="150"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>

          <el-table-column
            prop="createTime"
            label="到达时间"
            align="center"
            width="160"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span> {{ scope.row.createTime | formatDate }} </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="ownerName"
            label="抄送人"
            align="center"
            width="90"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column width="90" align="center" label="类型">
            <template slot-scope="{row}">
              <span class="blue-color">{{ todoReadStatus[row.status] }}</span>
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
    </el-container>
  </el-container>
</template>

<script>
const TODO_READ_STATUS = {
  COPYTO: '抄送',
  // 2022-10-09 yigz:原沟通功能，文案上修改为 会签
  COMMU: '会签',
  FOLLOW: '跟踪',
}

import {mapState, mapActions} from 'vuex'
import FlowTree from '@/components/flow/flowTree.vue'
import utils from '@/utils.js'
import process from '@/api/process'
import {Message} from 'element-ui'
import eipUserSelector from '@/components/eipControl/selector/EipUserSelector.vue'
import eipSysTypeSelector from '@/components/eipControl/selector/EipSysTypeSelector.vue'
//ccwgq 2022-07-07 引入流程的事件总线    (已经改为mixin)
// import FlowBus from '@/components/eipControl/bus/FlowMenuBus.js'
import FlowMenuMixin from '@/components/flow/ou/OuFlowMenu.js'
export default {
  name: 'todoRead',
  components: {
    FlowTree,
    eipSysTypeSelector,
    eipUserSelector,
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
      todoReadStatus: TODO_READ_STATUS,
      isAsideShow: false,
      asideShow: false,
      tableData: '',
      date: '',
      currentTree: '',
      fullscreenLoading: true,
      ids: '', //抄送任务id集合
      showAdvance: false,
      form: {
        // tableData: '',
        // date: '',
        serialNo: '',
        subject: '',
        defName: '',
        flowType: '',
        userName: '',
        userId: '',
        urgentState: '',
        typeName: '',
        typeId: '',
        //抄送人
        ownerName: '',
        //抄送人id
        ownerId: '',
        //我方主体
        ourPartyText: '',
      },
      //流程导出标识
      currentSerialType: 'noticeTodoRead',
      //当前查询参数
      currentQueryFilter: {},
      isExport: false,
      uniqueKey: new Date().getTime(),
    }
  },
  computed: {
    // ...mapState('storeProcess', ['rows', 'pagination', 'total']),
    //ccwgq 2022-10-24 解决公文中心数据重复错误的问题
    ...mapState('storeProcess', {
      rows: (state) => state.data.todoReadList,
      pagination: (state) => state.pagination,
      total: (state) => state.total,
    }),
    currentSwitchValue() {
      // lyzcw:2022-05-09 默认类别树展开
      return (
        localStorage.todoReadAsideShow === 'true' ||
        localStorage.todoReadAsideShow === true ||
        localStorage.todoReadAsideShow === undefined
      )
    },
  },
  methods: {
    //将当前展开或者收起的值存在localStorage中
    handleSwitch(val) {
      localStorage.todoReadAsideShow = val
    },
    //批量勾选待阅流程执行已阅操作
    handleSelectionChange(val) {
      this.ids = ''
      if (val.length > 0) {
        for (let i = 0; i < val.length; i++) {
          this.ids = this.ids + val[i].id + ','
        }
        this.ids = this.ids.substring(0, this.ids.length - 1)
      }
    },
    noticeTurnDode() {
      if (this.ids != '') {
        this.$store
          .dispatch('storeProcess/noticeTurnDode', this.ids)
          .then(() => {
            this.search('find')
          })
      } else {
        Message.warning('请选择要阅读的任务')
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
      const currentUser = this.$store.state.user.currentUserDetail.user
      this.openFullScreen()
      if (str == 'find') {
        this.$store.dispatch('storeProcess/setPaginationPageNum', 1)
      }
      let querys = [] //查询条件
      let queryFilter = {}
      let pageBean = {pageBean: this.pagination}
      let beginDate = '' //开始时间
      let endDate = '' //结束时间
      let group = 'main1' //判断条件
      if (this.tableData == '' && (this.date == '' || this.date == null)) {
        // console.log('到达时间 111===>', this.date)
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
        if (this.currentTree != '') {
          console.log('到达时间 222===>', this.date)
          querys = [
            {
              property: 'bpm_pro_inst.type_id_',
              value: this.currentTree,
              group: 'typeId',
              operation: 'IN',
              relation: 'AND',
            },
          ]
          if (this.tableData) {
            querys.push({
              property: 'bpm_pro_inst.subject_',
              value: this.tableData,
              group: 'main1',
              operation: 'LIKE',
              relation: 'OR',
            })

            querys.push({
              property: 'bpm_task_notice.proc_inst_id_',
              value: this.tableData,
              group: 'main1',
              operation: 'LIKE',
              relation: 'OR',
            })

            querys.push({
              property: 'bpm_pro_inst.proc_def_name_',
              value: this.tableData,
              group: 'main1',
              operation: 'LIKE',
              relation: 'OR',
            })
            //yigz: 2022-06-14 添加公文编号模糊查询
            querys.push({
              property: 'bpm_pro_inst.SERIAL_NO',
              value: this.tableData,
              group: 'main1',
              operation: 'LIKE',
              relation: 'OR',
            })
          }
        } else {
          querys = [
            {
              property: 'bpm_pro_inst.subject_',
              value: this.tableData,
              group: 'main1',
              operation: 'LIKE',
              relation: 'OR',
            },
            {
              property: 'bpm_task_notice.proc_inst_id_',
              value: this.tableData,
              group: 'main1',
              operation: 'LIKE',
              relation: 'OR',
            },
            {
              property: 'bpm_pro_inst.proc_def_name_',
              value: this.tableData,
              group: 'main1',
              operation: 'LIKE',
              relation: 'OR',
            },
            //yigz: 2022-06-14 添加公文编号模糊查询
            {
              property: 'bpm_pro_inst.SERIAL_NO',
              value: this.tableData,
              group: 'main1',
              operation: 'LIKE',
              relation: 'OR',
            },
          ]
        }
        console.log('到达时间 ===>', this.date)
        if (this.date != null && this.date != '') {
          beginDate = utils.formatDate(this.date[0].getTime())
          endDate = utils.formatDate(this.date[1].getTime())
          querys.push({
            property: 'bpm_task_notice.create_time_',
            value: [beginDate, endDate],
            group: 'time',
            operation: 'BETWEEN',
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
      // 2022-06-15 yigz 添加高级搜索
      if (this.form.serialNo) {
        // 从流程实例表查询公文编号
        querys.push({
          property: 'bpm_pro_inst.SERIAL_NO',
          value: this.form.serialNo,
          group: 'main',
          operation: 'LIKE',
          relation: 'AND',
        })
      }
      // 2022-06-16 yigz 添加高级搜索
      if (this.form.ourPartyText) {
        // 从流程实例表中查询我方主体
        querys.push({
          property: 'bpm_pro_inst.OUR_PARTY_TEXT',
          value: this.form.ourPartyText,
          group: 'main',
          operation: 'LIKE',
          relation: 'AND',
        })
      }
      if (this.form.subject) {
        //流程标题
        querys.push({
          property: 'bpm_pro_inst.subject_',
          value: this.form.subject,
          group: 'main',
          operation: 'LIKE',
          relation: 'AND',
        })
      }
      if (this.form.defName) {
        //流程名称
        querys.push({
          property: 'bpm_pro_inst.proc_def_name_',
          value: this.form.defName,
          group: 'main',
          operation: 'LIKE',
          relation: 'AND',
        })
      }
      if (this.form.urgentState) {
        //紧急程度
        querys.push({
          property: 'bpm_pro_inst.URGENT_STATE_',
          value: this.form.urgentState,
          group: 'main',
          operation: 'EQUAL',
          relation: 'AND',
        })
      }
      if (this.form.typeId) {
        //类别
        querys.push({
          property: 'bpm_pro_inst.TYPE_PATH_',
          value: this.form.typeId,
          group: 'main',
          operation: 'LIKE',
          relation: 'AND',
        })
      }
      if (this.form.ownerId) {
        //抄送人模糊查询
        querys.push({
          property: 'bpm_task_notice.OWNER_ID_',
          value: this.form.ownerId,
          group: 'main',
          operation: 'LIKE',
          relation: 'AND',
        })
      }

      if (this.form.ourPartyText) {
        //我方主体模糊查询
        querys.push({
          property: 'bpm_pro_inst.OUR_PARTY_TEXT',
          value: this.form.ourPartyText,
          group: 'main',
          operation: 'LIKE',
          relation: 'AND',
        })
      }

      queryFilter = {pageBean: this.pagination, querys}
      this.$store
        .dispatch('storeProcess/getNoticeTodoReadList', queryFilter)
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

      let tableName = '抄送公文'
      let expTableName = '公文编号,公文标题,呈报人,呈报部门,呈报时间'
      let Base64 = require('js-base64').Base64
      expTableName = encodeURIComponent(Base64.encode(expTableName))
      // createOrgPathName 创建人所属组织树名称
      // createOrgName 创建人所属组织名称
      let expField = 'serialNo,subject,ownerName,createOrgPathName,createTime'

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

    // yigz:2022-06-14 展开收起高级搜索
    advanceSearch() {
      this.showAdvance = !this.showAdvance
    },
    //重置
    reset() {
      this.tableData = ''
      this.date = ''
      this.form = {
        // tableData: '',
        // date: '',
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
        ourPartyText: '',
        ownerName: '',
        ownerId: '',
      }
      this.search('find')
    },
    handleRowClick(row, newWin) {
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
      if (!newWin) {
        this.$router.push(url)
        // window.open(
        //   window.context.front +
        //     url +
        //     '?token=' +
        //     this.$store.state.login.currentUser.token
        // )
      } else {
        window.open(
          window.context.front +
            url +
            '?token=' +
            this.$store.state.login.currentUser.token
        )
      }
    },
    //子组件传值父组件(待办分类查询)
    getCurrent(data) {
      if (data.id == 6) {
        this.currentTree = ''
        this.openFullScreen()
        let pageBean = {pageBean: this.pagination}
        this.$store
          .dispatch('storeProcess/getNoticeTodoReadList', pageBean)
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
    loadCount() {
      return process.getNoticeTodoReadCount({})
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
    this.$store.commit('storeProcess/clearListData', [])
    let querys = []
    if (this.defKey) {
      querys.push({
        property: 'bpm_pro_inst.proc_def_key_',
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
      .dispatch('storeProcess/getNoticeTodoReadList', pageBean)
      .then(() => {
        //页面加载调用tudo.js里面的分页方法
        this.fullscreenLoading = false
      })
    this.currentQueryFilter = pageBean
  },
  mounted() {
    this.$forceUpdate()
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
  // display: flex;
  // flex-direction: row;
  // margin: 10px 0 0 20px;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -ms-flex-direction: row;
  flex-direction: row;
  margin: 10px 0 0 20px;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  /deep/ .el-input__prefix,
  /deep/.el-input__suffix {
    height: 32px;
  }
  // /deep/.el-date-editor--datetimerange.el-input__inner {
  //   width: 220px;
  // }
  .done_read_btn {
    margin-right: 10px;
  }
  .date_wrap {
    display: flex;
    margin-right: 14px;
    p {
      width: 64px;
      margin: 8px;
    }
  }
}
.content_top_wrap_form {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -ms-flex-direction: row;
  flex-direction: row;
  margin-bottom: 10px;
}
@media (max-width: 1152px) {
  .content_top_wrap {
    flex-wrap: wrap;
    /deep/.el-row {
      margin-bottom: 0;
    }
    .btn_wrap {
      margin: 10px 0 0 -9px;
    }
  }
}
</style>