<template>
  <el-container style="border-left: 1px solid #e7eaec" class="fullheight">
    <h3 class="flow_table_title">流程代理 列表</h3>
    <el-row class="agent-list__row">
      <el-button
        type="primary"
        size="small"
        @click="operating('0', 'add')"
        icon="el-icon-plus"
        style="margin-left: 0"
        >{{ $t('common.add') }}</el-button
      >
      <!--      <el-button type="danger" size="small" @click="remove" icon="el-icon-delete" style="margin-left:3px;">删除</el-button>-->
      <eip-popconfirm-button
        type="danger"
        title="确定删除吗？"
        icon="el-icon-delete"
        @onConfirm="remove"
        :disabled="checkBoxData.length < 1"
        style="margin-left: 10px"
        >{{ $t('common.delete') }}</eip-popconfirm-button
      >
      <el-input
        size="small"
        style="width: 380px; margin-left: 10px"
        clearable
        placeholder="标题"
        prefix-icon="el-icon-search"
        v-model="tableData"
        @keyup.enter.native="searchEnterFun"
      ></el-input>
      <el-button
        style="margin-left: 10px"
        size="small"
        type="primary"
        icon="el-icon-search"
        @click="search('find')"
        >查询</el-button
      >
      <el-button size="small" icon="el-icon-refresh" @click="reset"
        >重置</el-button
      >
    </el-row>
    <el-main>
      <el-table
        :data="rows"
        ref="htTable"
        @row-click="rowClick"
        stripe
        border
        style="width: 100%"
        header-cell-class-name="todo-header-row"
        row-class-name="todo-row"
        size="medium"
        v-loading="fullscreenLoading"
        @selection-change="handleChecked"
      >
        <el-table-column type="selection" sortable width="50"></el-table-column>
        <el-table-column
          type="index"
          sortable
          width="50"
          label="序号"
        ></el-table-column>
        <el-table-column
          prop="subject"
          width="230"
          label="标题"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="authName"
          label="委托人"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="agent"
          label="被委托人"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="startDate"
          label="开始日期"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="endDate"
          label="结束日期"
          align="center"
        ></el-table-column>
        <el-table-column label="是否有效" align="center">
          <template slot-scope="scope">
            <el-tag
              size="small"
              type="success"
              v-if="scope.row.isEnabled == 'Y'"
              >有效</el-tag
            >
            <el-tag size="small" type="danger" v-if="scope.row.isEnabled == 'N'"
              >无效</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column prop="type" label="委托类型" align="center">
          <template slot-scope="scope">
            <el-tag size="small" v-if="scope.row.type == 1">全权委托</el-tag>
            <el-tag size="small" v-if="scope.row.type == 2">部分委托</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="" label="操作" align="center" width="200">
          <template slot-scope="scope">
            <el-button
              @click="operating(scope.row.id, 'edit')"
              :disabled="getAgentDelayStatus(scope.row.endDate)"
              size="small"
              icon="el-icon-edit"
              plain
              >修改</el-button
            >
            <el-button
              @click="operating(scope.row.id, 'get')"
              size="small"
              icon="el-icon-tickets"
              plain
              >明细</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-main>
    <el-footer height="45px">
      <el-row type="flex" justify="end">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.page"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="10"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </el-row>
    </el-footer>
  </el-container>
</template>

<script>
import {mapState, mapActions} from 'vuex'
import EipPopconfirmButton from '@/components/eipControl/EipPopconfirmButton'
import utils from '@/utils.js'
export default {
  name: 'agentList',
  components: {
    EipPopconfirmButton,
  },
  data() {
    return {
      tableData: '',
      fullscreenLoading: true,
      checkBoxData: [],
    }
  },
  computed: mapState({
    rows: (state) => state.agent.rows,
    pagination: (state) => state.agent.pagination,
    total: (state) => state.agent.total,
  }),
  methods: {
    rowClick(row, column, event) {
      this.$refs.htTable.toggleRowSelection(row)
    },
    remove() {
      var ids = []
      if (this.checkBoxData && this.checkBoxData.length > 0) {
        for (let index = 0; index < this.checkBoxData.length; index++) {
          ids.push(this.checkBoxData[index].id)
        }
      }
      //数组去重
      //this.checkBoxData = Array.from(new Set(this.checkBoxData));
      if (ids.length > 0) {
        this.$store.dispatch('agent/remove', ids.join(',')).then((res) => {
          this.search()
        })
      } else {
        this.$message({
          message: '请选择要删除的数据',
          type: 'warning',
        })
      }
    },
    handleChecked(value) {
      this.checkBoxData = value
    },
    //Loading 加载中
    openFullScreen() {
      this.fullscreenLoading = true
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
        this.$store.dispatch('agent/setPaginationPageNum', 1)
      }
      let querys = [] //查询条件
      let queryFilter = {}
      let pageBean = {pageBean: this.pagination}
      if (this.tableData == '') {
        this.$store.dispatch('agent/getlistJson', pageBean).then(() => {
          this.fullscreenLoading = false
        })
      } else {
        querys = [
          {
            property: 'subject_',
            value: this.tableData,
            group: 'main',
            operation: 'LIKE',
            relation: 'OR',
          },
        ]
        queryFilter = {pageBean: this.pagination, querys}
        this.$store.dispatch('agent/getlistJson', queryFilter).then(() => {
          this.fullscreenLoading = false
        })
      }
    },
    //重置
    reset() {
      this.tableData = ''
      this.search('find')
    },
    operating(id, action) {
      var title =
        action == 'edit'
          ? '编辑委托'
          : action == 'add'
          ? '添加委托'
          : '查看委托'
      if (action == 'add') {
        this.$router.push('/agent/agentAdd')
      } else if (action == 'edit') {
        this.$router.push('/agent/agentEdit/' + id)
      } else {
        this.$router.push('/agent/agentGet/' + id)
      }
    },
    handleSizeChange: function (size) {
      //每页下拉显示数据
      this.$store.dispatch('agent/setPaginationSize', size)
      this.search()
    },
    handleCurrentChange: function (currentPage) {
      //点击第几页
      this.$store.dispatch('agent/setPaginationPageNum', currentPage)
      this.search()
    },
    //yigz:2022-08-09 获取延期状态
    getAgentDelayStatus(endDate) {
      let currentDate = this.getCurrentTime()
      let currentTime =
        new Date(currentDate).getTime() ||
        new Date(new Date().format('yyyy-MM-dd') + ' ' + currentDate).getTime()
      let endDateTime =
        new Date(endDate).getTime() ||
        new Date(new Date().format('yyyy-MM-dd') + ' ' + endDate).getTime()

      return currentTime > endDateTime
    },
    //yigz:2022-08-09 获取当前时间
    getCurrentTime() {
      var date = new Date() //当前时间
      var month = this.zeroFill(date.getMonth() + 1) //月
      var day = this.zeroFill(date.getDate()) //日
      var hour = this.zeroFill(date.getHours()) //时
      var minute = this.zeroFill(date.getMinutes()) //分
      var second = this.zeroFill(date.getSeconds()) //秒

      //当前时间
      var curTime =
        date.getFullYear() +
        '-' +
        month +
        '-' +
        day +
        ' ' +
        hour +
        ':' +
        minute +
        ':' +
        second

      return curTime
    },
    zeroFill(i) {
      if (i >= 0 && i <= 9) {
        return '0' + i
      } else {
        return i
      }
    },
  },
  created() {
    let pagination = {pageBean: {page: 1, pageSize: 10, showTotal: true}}
    this.$store.dispatch('agent/getlistJson', pagination).then(() => {
      this.fullscreenLoading = false
    })
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
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

.agent-list__row {
  margin: 10px 0 0 20px;
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
.el-dropdown {
  vertical-align: top;
}
.el-dropdown + .el-dropdown {
  margin-left: 15px;
}
.el-icon-arrow-down {
  font-size: 12px;
}
</style>
