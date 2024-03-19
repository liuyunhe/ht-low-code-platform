<template>
  <el-container class="list_main_content fullheight">
    <el-aside
      width="200px"
      v-if="!$route.meta.single"
      v-show="asideShow"
      class="aside-tree__wrap"
    >
      <p class="flow_tree_top_title">
        {{ $t('navigator.myRead') }} {{ $t('navigator.type') }}
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
        {{ $t('navigator.myRead') }} {{ $t('navigator.list') }}
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
            <el-row :gutter="10" style="flex-wrap: wrap; display: flex">
              <el-col :span="8">
                <el-input
                  size="small"
                  clearable
                  placeholder="标题/编号/流程名称"
                  prefix-icon="el-icon-search"
                  v-model="tableData"
                  @keyup.enter.native="searchEnterFun"
                ></el-input>
              </el-col>
              <el-col :span="10">
                <!-- <div >
          <p>创建时间</p> -->
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
                <!-- </div> -->
              </el-col>
              <el-col> </el-col>
            </el-row>
            <el-row :gutter="10" v-if="showAdvance">
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
              <!-- <el-col :span="8">
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
            <el-row :gutter="10" v-if="showAdvance">
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
                <div>
                  <eip-user-selector
                    ref="eipUserSelector"
                    class="form_user_selector"
                    style="display: inline-block"
                    placeholder="抄送人"
                    :single="true"
                    v-model="form.userName"
                    :config="{id: 'form.userId'}"
                  />
                </div>
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
        <el-row class="btn_wrap">
          <el-col :span="24">
            <el-button size="small" @click="advanceSearch"
              >高级
              <i
                :class="showAdvance ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"
              ></i>
            </el-button>
            <el-button
              style="margin-left: 20px"
              size="small"
              type="primary"
              icon="el-icon-search"
              @click="search('find')"
              >搜索</el-button
            >
            <el-button size="small" @click="reset" icon="el-icon-refresh"
              >重置</el-button
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
          height="100%"
          :data="rows"
          style="width: 100%"
          header-cell-class-name="done-header-row"
          row-class-name="done-row"
          size="medium"
          v-loading="fullscreenLoading"
          @hook:updated="updatedTable"
        >
          <el-table-column
            type="index"
            width="50"
            align="center"
            label="序号"
          ></el-table-column>

          <!-- <el-table-column
            prop="id"
            width="180"
            show-overflow-tooltip
            align="center"
            label="流程编号"
          ></el-table-column> -->
          <!-- <el-table-column
            prop="serialNo"
            label="公文编号"
            align="center"
            width="150"
          ></el-table-column> -->
          <!-- <el-table-column
            prop="serialNo"
            label="公文编号"
            align="center"
            width="150"
          ></el-table-column> -->

          <el-table-column label="标题" show-overflow-tooltip align="left">
            <template slot-scope="scope">
              <!-- yigz 2022-11-05:入库公文以修窗口形式打开 -->
              <span
                class="done-subject"
                @click="handleRowClick(scope.row, true)"
                @contextmenu.prevent="handleRowClick(scope.row, true)"
                >{{ scope.row.subject }}</span
              >
            </template>
          </el-table-column>
          <!-- <el-table-column
            prop="ourPartyText"
            label="我方主体"
            align="center"
            width="200"
            show-overflow-tooltip
          ></el-table-column> -->
          <el-table-column
            label="流程名称"
            show-overflow-tooltip
            align="center"
            width="180"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.procDefName }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="type_name"
            label="类型"
            align="center"
            width="200"
            show-overflow-tooltip
          ></el-table-column>
          <!--lyzcw:2022-09-06 改为入库公文页面后，已经没有任务名称-->
          <!--<el-table-column
            label="任务名称"
            show-overflow-tooltip
            align="center"
            width="100"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.taskName }}</span>
            </template>
          </el-table-column>-->
          <el-table-column
            label="流程创建时间"
            show-overflow-tooltip
            align="center"
            width="150"
          >
            <template slot-scope="scope">
              <span>{{
                scope.row.createTime | dateformat('yyyy-MM-dd HH:mm:ss')
              }}</span>
            </template>
          </el-table-column>
          <!--lyzcw:2022-09-06 改为入库公文页面后，已经没有任务名称-->
          <!--
          <el-table-column
            prop="qualfiedNames"
            label="抄送人"
            width="100"
            align="center"
          ></el-table-column>-->
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
    </el-container>
  </el-container>
</template>

<script>
import {mapState, mapActions} from 'vuex'
import FlowTree from '@/components/flow/flowTree.vue'
import utils from '@/utils.js'
import process from '@/api/process.js'
import eipUserSelector from '@/components/eipControl/selector/EipUserSelector.vue'
import eipSysTypeSelector from '@/components/eipControl/selector/EipSysTypeSelector.vue'
//ccwgq 2022-07-07 引入流程的事件总线    (已经改为mixin)
// import FlowBus from '@/components/eipControl/bus/FlowMenuBus.js'
import FlowMenuMixin from '@/components/flow/ou/OuFlowMenu.js'
export default {
  name: 'doneRead',
  components: {
    FlowTree,
    eipUserSelector,
    eipSysTypeSelector,
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
      isAsideShow: false,
      asideShow: false,
      tableData: '',
      date: '',
      currentTree: '',
      fullscreenLoading: true,
      dialogFormVisible: false,
      opinion: '',
      id: '',
      //是否显示高级搜索项
      showAdvance: false,
      form: {
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
        //我方主体
        ourPartyText: '',
      },
      //流程导出标识
      currentSerialType: 'endInst',
      //当前查询参数
      currentQueryFilter: {},
      isExport: false,
    }
  },
  computed: {
    // ...mapState('storeProcess', ['rows', 'pagination', 'total']),
    //ccwgq 2022-10-24 解决公文中心数据重复错误的问题
    ...mapState('storeProcess', {
      rows: (state) => state.data.doneReadList,
      pagination: (state) => state.pagination,
      total: (state) => state.total,
    }),
    currentSwitchValue() {
      // lyzcw:2022-05-09 默认类别树展开
      return (
        localStorage.doneReadAsideShow === 'true' ||
        localStorage.doneReadAsideShow === true ||
        localStorage.doneReadAsideShow === undefined
      )
    },
  },
  methods: {
    // yigz:2022-06-14 展开收起高级搜索
    advanceSearch() {
      this.showAdvance = !this.showAdvance
    },
    //将当前展开或者收起的值存在localStorage中
    handleSwitch(val) {
      localStorage.doneReadAsideShow = val
    },
    formatDate(value) {
      return utils.formatDate(value.createTime)
    },
    handleClose(done) {
      this.dialogFormVisible = true
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
      if (this.tableData == '' && (this.date == '' || this.date == null)) {
        if (this.currentTree != '') {
          querys = [
            {
              property: 'wfInst.type_path_',
              value: this.currentTree,
              group: 'typeId',
              operation: 'LIKE',
              relation: 'AND',
            },
          ]
        }
      } else {
        if (this.currentTree != '') {
          querys = [
            {
              property: 'wfInst.type_path_',
              value: this.currentTree,
              group: 'typeId',
              operation: 'LIKE',
              relation: 'AND',
            },
          ]
          if (this.tableData) {
            querys.push({
              property: 'wfInst.proc_def_name_',
              value: this.tableData,
              group: 'main',
              operation: 'LIKE',
              relation: 'OR',
            })

            querys.push({
              property: 'wfInst.subject_',
              value: this.tableData,
              group: 'main',
              operation: 'LIKE',
              relation: 'OR',
            })

            querys.push({
              property: 'wfInst.id_',
              value: this.tableData,
              group: 'main',
              operation: 'LIKE',
              relation: 'OR',
            })
            //2022-06-15 yigz：添加公文编号模糊查询
            // querys.push({
            //   property: 'wfInst.SERIAL_NO',
            //   value: this.tableData,
            //   group: 'main',
            //   operation: 'LIKE',
            //   relation: 'OR',
            // })
          }
        } else {
          querys = [
            {
              property: 'wfInst.proc_def_name_',
              value: this.tableData,
              group: 'main',
              operation: 'LIKE',
              relation: 'OR',
            },
            {
              property: 'wfInst.subject_',
              value: this.tableData,
              group: 'main',
              operation: 'LIKE',
              relation: 'OR',
            },
            {
              property: 'wfInst.id_',
              value: this.tableData,
              group: 'main',
              operation: 'LIKE',
              relation: 'OR',
            },
            //yigz: 2022-06-14 添加公文编号模糊查询
            // {
            //   property: 'wfInst.SERIAL_NO',
            //   value: this.tableData,
            //   group: 'main',
            //   operation: 'LIKE',
            //   relation: 'OR',
            // },
          ]
        }
        if (this.date) {
          beginDate = utils.formatDate(this.date[0].getTime())
          endDate = utils.formatDate(this.date[1].getTime())
          querys.push({
            property: 'wfInst.create_time_',
            value: [beginDate, endDate],
            group: 'time',
            operation: 'BETWEEN',
            relation: 'AND',
          })
        }
      }
      if (this.defKey) {
        querys.push({
          property: 'inst.PROC_DEF_KEY_',
          value: this.defKey,
          operation: 'EQUAL',
          relation: 'AND',
        })
      }

      // 2022-06-15 yigz 添加高级搜索
      // if (this.form.serialNo) {
      //   // 从流程实例表中查询公文编号
      //   querys.push({
      //     property: 'wfInst.SERIAL_NO',
      //     value: this.form.serialNo,
      //     group: 'main',
      //     operation: 'LIKE',
      //     relation: 'AND',
      //   })
      // }
      if (this.form.subject) {
        //流程标题
        querys.push({
          property: 'wfInst.subject_',
          value: this.form.subject,
          group: 'main',
          operation: 'LIKE',
          relation: 'AND',
        })
      }
      if (this.form.defName) {
        //流程名称
        querys.push({
          property: 'wfInst.proc_def_name_',
          value: this.form.defName,
          group: 'main',
          operation: 'LIKE',
          relation: 'AND',
        })
      }
      if (this.form.urgentState) {
        //紧急程度
        querys.push({
          property: 'wfInst.URGENT_STATE_',
          value: this.form.urgentState,
          group: 'main',
          operation: 'EQUAL',
          relation: 'AND',
        })
      }
      if (this.form.typeId) {
        //类别
        querys.push({
          property: 'wfInst.TYPE_PATH_',
          value: this.form.typeId,
          group: 'main',
          operation: 'LIKE',
          relation: 'AND',
        })
      }

      if (this.form.userId) {
        //抄送人模糊查询
        querys.push({
          property: 'wfInst.CREATE_BY_',
          value: this.form.userId,
          group: 'main',
          operation: 'EQUAL',
          relation: 'AND',
        })
      }
      // if (this.form.ourPartyText) {
      //   //我方主体模糊查询
      //   querys.push({
      //     property: 'wfInst.OUR_PARTY_TEXT',
      //     value: this.form.ourPartyText,
      //     group: 'main',
      //     operation: 'LIKE',
      //     relation: 'AND',
      //   })
      // }

      queryFilter = {pageBean: this.pagination, querys}
      this.$store
        .dispatch('storeProcess/getNoticeDoneReadList', queryFilter)
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

      let tableName = '入库公文'
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
      this.tableData = ''
      this.date = ''
      this.form = {
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
      }
      this.search('find')
    },
    //  yigz:2022-08-31:入库公文修改：我发起的已归档的公文+别人发起我处理的已归档公文+别人发起我加签的已归档公文+别人发起我抄送的已归档公文
    handleRowClick(row, newWin) {
      //  已办 ：done，已阅：copyto
      if (row.type == 'done') {
        this.handleRowClickDone(row, newWin)
        return
      }
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

    // yigz:2022-09-08:支持已办公文
    handleRowClickDone(row, newWin) {
      console.log('handleRowClickDone ===>', row)
      //判断是否显示强制收回按钮
      let type = ''
      if (row.type == 'end' || row.type == 'manualend') {
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
        // this.handleOpenUrl('/inst/' + row.id + '/' + 'done', newWin)
        //ccwgq 2022-09-15 解决入库公文进去后表单加载错误或者权限含有可写权限
        this.handleOpenUrl('/inst/' + row.id + '/read/done/' + row.id, newWin)
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
    //子组件传值父组件(已办分类查询)
    getCurrent(data) {
      if (data.id == 6) {
        this.currentTree = ''
        this.openFullScreen()
        let pageBean = {pageBean: this.pagination}
        this.$store
          .dispatch('storeProcess/getNoticeDoneReadList', pageBean)
          .then(() => {
            //页面加载调用done.js里面的分页方法
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
      return process.getNoticeDoneReadCount({})
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
        property: 'inst.PROC_DEF_KEY_',
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
      .dispatch('storeProcess/getNoticeDoneReadList', pageBean)
      .then(() => {
        //页面加载调用done.js里面的分页方法
        this.fullscreenLoading = false
      })
    this.currentQueryFilter = pageBean
  },
  updated() {
    this.$nextTick(() => {
      // console.log($('.el-main'));
      const $els = $('.el-main')
      if ($els.length > 1) {
        $els.eq(1).attr('style', 'overflow:hidden!important')
      }
    })
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
  .date_wrap {
    display: flex;
    margin-right: 14px;
    p {
      width: 64px;
      margin: 8px;
    }
  }
}
@media (max-width: 1152px) {
  .content_top_wrap {
    flex-wrap: wrap;
    .btn_wrap {
      margin: 10px 0 0 -19px;
    }
  }
}
</style>