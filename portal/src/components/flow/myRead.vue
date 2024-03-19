<template>
  <el-container class="list_main_content fullheight">
    <el-aside width="200px" v-if="!$route.meta.single" v-show="asideShow" class="aside-tree__wrap">
      <p class="flow_tree_top_title">{{$t('navigator.myCirculation')}} {{$t('navigator.type')}}</p>
      <FlowTree ref="FlowTree" @currentTree="getCurrent" :loadCount="loadCount" @switch-change="handleSwitch"
        :isAsideShow="isAsideShow"></FlowTree>
    </el-aside>
    <div
    v-if="!$route.meta.single"
      class="navbar-collapse"
      :class="{'navbar-collapse-right': !asideShow}"
      @click="asideShow = !asideShow"
    >
      <div class="navbar-collapse-bg">
        <i class="navbar-collapse-arrow" :class="{'el-icon-arrow-left': asideShow, 'el-icon-arrow-right': !asideShow}"></i>
      </div>
    </div>
    <el-container style="border-left:1px solid #E7EAEC">
      <h3 class="flow_table_title">{{$t('navigator.myCirculation')}} {{$t('navigator.list')}}</h3>
      <div class="content_top_wrap">
        <el-input
          size="small"
          clearable
          style="width:240px;"
          placeholder="流程事项/流程名称"
          prefix-icon="el-icon-search"
          v-model="tableData"
          @keyup.enter.native="searchEnterFun"
        ></el-input>
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
        <el-row class="btn_wrap">
          <el-col :span="24">
            <el-button style="margin-left: 10px" size="small" type="primary" icon="el-icon-search" @click="search('find')">查询</el-button>
            <el-button size="small" @click="reset" icon="el-icon-refresh">重置</el-button>
          </el-col>
        </el-row>
      </div>
      <el-main class="content">
        <!-- default-sort  排序 -->
        <el-table
          :data="rows"
          style="width: 100%"
          header-cell-class-name="todo-header-row"
          row-class-name="todo-row"
          size="medium"
          v-loading="fullscreenLoading"
          :default-sort="{prop: 'createTime', order: 'descending'}"
        >
          <!-- <el-table-column type="index" width="50" align="left" label="序号"></el-table-column> -->
          <el-table-column prop="procInstId" width="180" show-overflow-tooltip align="center" label="流程编号"></el-table-column>
          <el-table-column label="标题" show-overflow-tooltip  align="left">
            <template slot-scope="scope">
              <span class="todo-subject" @click="handleRowClick(scope.row)" @contextmenu.prevent="handleRowClick(scope.row,true)">{{ scope.row.subject }}</span>
            </template>
          </el-table-column>
          <el-table-column label="流程名称" show-overflow-tooltip align="left" width="120">
            <template slot-scope="scope">
              <span>{{ scope.row.procDefName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="任务名称" show-overflow-tooltip align="left" width="120">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="到达时间" show-overflow-tooltip align="center" width="160">
            <template slot-scope="scope">
              <span> {{ scope.row.createTime | formatDate}} </span>
            </template>
          </el-table-column>
          <el-table-column prop="assigneeName" label="被抄送人" align="center" width="90"></el-table-column>
          <el-table-column width="80" align="left" label="阅读状态">
            <template slot-scope="scope">
              <span v-if="scope.row.isRead == 0" class="red-color" >抄送</span>
              <span v-if="scope.row.isRead == 1" class="green-color" >入库</span>
            </template>
          </el-table-column>
          <el-table-column width="80" show-overflow-tooltip align="left" label="强制收回状态">
            <template slot-scope="scope">
              <span v-if="scope.row.isRevoke == 0" class="blue-color">未强制收回</span>
              <span v-if="scope.row.isRevoke == 1" class="red-color" >已强制收回</span>
            </template>
          </el-table-column>
          <el-table-column width="80" align="center" label="操作">
            <template slot-scope="scope">
              <el-button v-if="scope.row.isRevoke == 0" type="danger" @click="delBpmTaskNoticeById(scope.row)" size="small">强制收回</el-button>
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
import {mapState, mapActions} from 'vuex'
import FlowTree from '@/components/flow/flowTree.vue'
import utils from '@/utils.js'
import process from '@/api/process.js'
//ccwgq 2022-07-07 引入流程的事件总线    (已经改为mixin)
// import FlowBus from '@/components/eipControl/bus/FlowMenuBus.js'
import FlowMenuMixin from '@/components/flow/ou/OuFlowMenu.js'
export default {
  name: 'myRead',
  components: {
    FlowTree
  },
  mixins:[FlowMenuMixin],
  props: {
    defKey: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isAsideShow:false,
      asideShow:false,
      tableData: '',
      date: '',
      currentTree: '',
      fullscreenLoading: true
    }
  },
  computed: {
    // ...mapState('storeProcess',['rows','pagination','total']),
     //ccwgq 2022-10-24 解决公文中心数据重复错误的问题
    ...mapState('storeProcess', {
      rows: (state) => state.data.myReadList,
      pagination: (state) => state.pagination,
      total: (state) => state.total,
    }),
    currentSwitchValue(){
      // lyzcw:2022-05-09 默认类别树展开
      return localStorage.myReadAsideShow === 'true' || localStorage.myReadAsideShow === true || localStorage.myReadAsideShow === undefined
    }
  },
  methods: {
     //将当前展开或者收起的值存在localStorage中
    handleSwitch(val){
      localStorage.myReadAsideShow = val
    },
    //根据ID主键ID删除抄送任务
    delBpmTaskNoticeById(row) {
      this.$confirm('确认强制收回此任务?', '提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        this.$store.dispatch('storeProcess/delBpmTaskNoticeById', row.id).then(() => {
          this.search()
        })
      })
    },
    //Loading 加载中
    openFullScreen() {
      this.fullscreenLoading = true
    },
    handleSizeChange: function(size) {
      //每页下拉显示数据
      this.$store.dispatch('storeProcess/setPaginationSize', size)
      this.search()
    },
    handleCurrentChange: function(currentPage) {
      //点击第几页
      this.$store.dispatch('storeProcess/setPaginationPageNum', currentPage)
      this.search()
    },
    //回车查询
    searchEnterFun: function(e) {
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
      let group = 'main1' //判断条件
      if (this.tableData) {
        querys = [
          {
            property: 'bpm_pro_inst.subject_',
            value: this.tableData,
            group: 'main1',
            operation: 'LIKE',
            relation: 'OR'
          },
          {
            property: 'bpm_task_notice.proc_inst_id_',
            value: this.tableData,
            group: 'main1',
            operation: 'LIKE',
            relation: 'OR'
          },
          {
            property: 'bpm_pro_inst.proc_def_name_',
            value: this.tableData,
            group: 'main1',
            operation: 'LIKE',
            relation: 'OR'
          }
        ]
      }

      if (this.currentTree) {
        querys.push({
          property: 'bpm_pro_inst.type_id_',
          value: this.currentTree,
          group: 'typeId',
          operation: 'IN',
          relation: 'AND'
        })
      }

      if (this.date) {
        let beginDate = utils.formatDate(this.date[0].getTime()) //开始时间
        let endDate = utils.formatDate(this.date[1].getTime()) //结束时间
        querys.push({
          property: 'bpm_task_notice.create_time_',
          value: [beginDate, endDate],
          group: 'time',
          operation: 'BETWEEN',
          relation: 'AND'
        })
      }
      if (this.defKey) {
        querys.push({
          property: 'bpm_pro_inst.proc_def_key_',
          value: this.defKey,
          operation: 'EQUAL',
          relation: 'AND'
        })
      }
      queryFilter = {pageBean: this.pagination, querys}
      this.$store.dispatch('storeProcess/getMyNoticeReadList', queryFilter).then(() => {
        this.fullscreenLoading = false
      })
    },
    //重置
    reset() {
      this.tableData = ''
      this.date = ''
      this.search('find')
    },
    handleRowClick(row,newWin) {
      if (this.defKey){
        this.handleOpenUrl('/sysModuleInstMyRead/' + row.procInstId + '/' + row.id + '/myRead/'+this.defKey,newWin)
      } else{
        this.handleOpenUrl('/myRead/' + row.procInstId + '/' + row.id + '/myRead',newWin)
      }

    },
    handleOpenUrl(url,newWin){
      if(!newWin){
        this.$router.push(url);
        return ;
      }
      if(!url){
        return ;
      }
      let token = this.$store.state.login.currentUser.token;
      if(!url.toLowerCase().startsWith("http")){
        url = window.context.front + url;
      }
      if(url.indexOf('?') == -1){
        url = url + "?token=" + token;
      }else{
        url = url + "&token=" + token;
      }
      window.open(url,"_self");
    },
    //子组件传值父组件(待办分类查询)
    getCurrent(data) {
      if (data.id == 6) {
        this.currentTree = ''
        this.openFullScreen()
        let pageBean = {pageBean: this.pagination}
        this.$store.dispatch('storeProcess/getMyNoticeReadList', pageBean).then(() => {
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
      return process.getMyNoticeReadCount({})
    }
  },
  created() {
    this.asideShow = this.currentSwitchValue
    this.isAsideShow = this.currentSwitchValue
    let querys = []
    if (this.defKey) {
      querys.push({
        property: 'bpm_pro_inst.proc_def_key_',
        value: this.defKey,
        operation: 'EQUAL',
        relation: 'AND'
      })
    }
    let pageBean = {
      pageBean: {page: '1', pageSize: '10', showTotal: 'true'},
      querys
    } //初次加载默认pageBean
    this.$store.dispatch('storeProcess/getMyNoticeReadList', pageBean).then(() => {
      //页面加载调用tudo.js里面的分页方法
      this.fullscreenLoading = false
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
@import "@/assets/css/change-font.scss";
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
}
.content_top_wrap {
  display: flex;
  flex-direction: row;
  margin: 10px 0 0 20px;
  /deep/ .el-input__prefix,
  /deep/.el-input__suffix {
    height: 32px;
  }
  /deep/.el-date-editor--datetimerange.el-input__inner {
    width: 220px;
  }
  .done_read_btn {
    margin-right: 10px;
  }
  .date_wrap {
    display: flex;
    p {
      width: 64px;
      margin: 8px;
    }
  }
}
@media (max-width: 1024px) {
  .content_top_wrap {
    flex-wrap: wrap;
    .btn_wrap {
      margin: 10px 0 0 -9px;
    }
  }
}
</style>
