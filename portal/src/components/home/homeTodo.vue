<template>
  <el-card shadow="never">
    <div slot="header" class="clearfix">
      <el-badge :value="totalTodos">
        <b>待办公文</b>
      </el-badge>
      <el-button class="more-button" type="text" @click="todoDialog"
        >更多</el-button
      >
      <i
        class="el-icon-refresh tools-icon"
        :class="{rotating: refreshing}"
        @click="refreshTodo"
      ></i>
    </div>
    <el-table :data="todos" :height="380" style="width: 100%;" size="medium">
      <el-table-column width="90" align="center" label="类型">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status == 'NORMAL'" size="small">待办</el-tag>
          <el-tag v-if="scope.row.status == 'TRANSFORMED'" size="small"
            >流转</el-tag
          >
          <el-tag v-if="scope.row.status == 'TRANSFORMEDINQU'" size="small"
            >征询</el-tag
          >
          <el-tag v-if="scope.row.status == 'DELIVERTO'" size="small"
            >转办</el-tag
          >
          <el-tag v-if="scope.row.status == 'COPYTO'" size="small">抄送</el-tag>
          <el-tag v-if="scope.row.status == 'FOLLOW'" size="small">跟踪</el-tag>
          <!-- // 2022-10-09 yigz:原沟通功能，文案上修改为 会签，但功能还是原沟通功能 -->
          <!-- <el-tag v-if="scope.row.status == 'COMMU'" size="small">会签</el-tag> -->
          <el-tag v-if="scope.row.status == 'BACK'" size="small">驳回</el-tag>
          <el-tag v-if="scope.row.status == 'ADDSIGN'" size="small"
            >加签</el-tag
          >
          <el-tag v-if="scope.row.status == 'SHARE'" size="small">共享</el-tag>
          <el-tag v-if="scope.row.status == 'AGENT'" size="small">委托</el-tag>
          <el-tag v-if="scope.row.status == 'SIGNSEQUENCEED'" size="small"
            >顺序签署</el-tag
          >
          <el-tag v-if="scope.row.status == 'SIGNLINEED'" size="small"
            >并行签署</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column label="标题" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <span class="todo-subject" @click="handleRowClick(scope.row)">{{
            scope.row.subject
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="name"
        label="任务名称"
        align="center"
        width="180"
      ></el-table-column>
      <el-table-column
        prop="createTime"
        label="到达时间"
        align="center"
        width="170"
      ></el-table-column>
      <el-table-column
        prop="creator"
        label="发起人"
        align="center"
        width="110"
      ></el-table-column>
    </el-table>
  </el-card>
</template>
<script>
import {mapState} from 'vuex'

export default {
  data() {
    return {
      refreshing: false
    }
  },
  computed: mapState({
    todos: state => state.storeProcess.rows,
    totalTodos: state => state.storeProcess.total
  }),
  created() {
    let pageBean = {
      pageBean: {page: '1', pageSize: '8'}
    }
    this.refreshing = true
    this.$store
      .dispatch('storeProcess/getTodoByPagination', pageBean)
      .finally(() => {
        this.refreshing = false
      })
  },
  methods: {
    //刷新待办
    refreshTodo() {
      let pageBean = {
        pageBean: {page: '1', pageSize: '7'}
      }
      this.refreshing = true
      this.$store
        .dispatch('storeProcess/getTodoByPagination', pageBean)
        .finally(() => {
          this.refreshing = false
        })
    },
    //跳转待办列表
    todoDialog() {
      this.$router.push({path: '/flow/todo'})
    },
    handleRowClick(row) {
      this.$router.push('/task/' + row.id)
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
.todo-subject {
  cursor: pointer;
}

.todo-subject {
  color: $--theme-color;
}

/deep/ .el-table__body-wrapper {
  overflow-y: hidden !important;
}
</style>