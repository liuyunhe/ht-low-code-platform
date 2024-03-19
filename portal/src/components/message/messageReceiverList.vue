<template>
  <el-container class="fullheight">
    <el-container style="border-left: 1px solid #e7eaec">
      <h3 class="flow_table_title">内部消息列表</h3>
      <el-row class="message-receiver-list__row">
        <eip-popconfirm-button
          type="danger"
          title="确定删除吗？"
          icon="el-icon-delete"
          @onConfirm="remove"
          >{{ $t('common.delete') }}</eip-popconfirm-button
        >
        <el-button
          type="warning"
          v-if="filterQuery.value === 1"
          @click="mark()"
          class="mark-read__btn"
          >标记为已读</el-button
        >
        <ht-select
          class="read-option-select"
          v-model="readOption"
          :options="[
            {key: 1, value: '未读'},
            {key: 2, value: '已读'},
          ]"
          :validate="{required: true}"
        ></ht-select>
        <el-input
          size="small"
          style="width: 380px; margin-left: 10px"
          clearable
          placeholder="请输入公文标题名称/类型"
          prefix-icon="el-icon-search"
          @keyup.enter.native="searchEnterFun"
          v-model="tableData"
        ></el-input>
        <el-button
          style="margin-left: 10px"
          size="small"
          type="primary"
          icon="el-icon-search"
          @click="search()"
          >{{ $t('common.search') }}</el-button
        >
        <el-button size="small" icon="el-icon-refresh" @click="reset">{{
          $t('common.reset')
        }}</el-button>
      </el-row>
      <el-main>
        <el-table
          :data="rows"
          stripe
          border
          style="width: 100%"
          header-cell-class-name="todo-header-row"
          row-class-name="todo-row"
          size="medium"
          v-loading.fullscreen.lock="fullscreenLoading"
          @selection-change="handleChecked"
          @sort-change="receiveTimeSortChange"
        >
          <el-table-column type="selection" width="50"></el-table-column>
          <!-- yigz:2022-08-17 新增公文标题列 -->
          <el-table-column
            width="360"
            align="left"
            :show-overflow-tooltip="true"
            prop="titleName"
            label="公文标题名称"
          >
            <template slot-scope="scope">
              <el-link type="primary" @click="detail(scope.row)">{{
                scope.row.titleName
              }}</el-link>
            </template>
          </el-table-column>
          <el-table-column
            prop="subject"
            label="公文类型"
            align="center"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="owner"
            sortable
            label="发信人"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="createTime"
            label="发信时间"
            :show-overflow-tooltip="true"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="receiveTime"
            v-if="filterQuery.value === 2"
            sortable="custom"
            label="收信时间"
            align="center"
          >
            <template slot-scope="scope">{{
              scope.row.receiveTime ? scope.row.receiveTime : '未读消息'
            }}</template>
          </el-table-column>
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
    <el-dialog title="消息明细" :visible.sync="dialogVisible" width="40%">
      <el-form
        :model="rowData"
        status-icon
        ref="ruleForm"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="主题" prop="subject">
          <div>{{ rowData.subject }}</div>
        </el-form-item>
        <el-form-item label="发信人" prop="owner">
          <div>{{ rowData.owner }}</div>
        </el-form-item>
        <el-form-item label="发信时间" prop="createTime">
          <div>{{ rowData.createTime }}</div>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <div v-html="rowData.content"></div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </el-container>
</template>

<script>
import {mapState, mapActions} from 'vuex'
import EipPopconfirmButton from '@/components/eipControl/EipPopconfirmButton'

export default {
  name: 'messageReceiverList',
  components: {
    EipPopconfirmButton,
  },
  data() {
    return {
      rowData: {},
      dialogVisible: false,
      tableData: '',
      fullscreenLoading: true,
      checkBoxData: [],
      readOption: 1,
      filterQuery: {
        property: 'receiveTime',
        value: 1,
        operation: 'EQUAL',
        relation: 'AND',
        group: 'filterTime',
      },
      filterParams: {
        receiveTimeOrder: 'desc',
      },
    }
  },
  watch: {
    readOption: function (newVal) {
      this.filterQuery.value = newVal
      this.$store.dispatch('messageReceiver/setPaginationPageNum', 1)
      this.search()
    },
  },
  computed: mapState({
    rows: (state) => state.messageReceiver.rows,
    pagination: (state) => state.messageReceiver.pagination,
    total: (state) => state.messageReceiver.total,
  }),
  methods: {
    mark() {
      var ids = []
      if (this.checkBoxData && this.checkBoxData.length > 0) {
        for (let index = 0; index < this.checkBoxData.length; index++) {
          ids.push(this.checkBoxData[index].id)
        }
      }
      if (ids.length > 0) {
        this.$store.dispatch('messageReceiver/mark', ids).then((res) => {
          this.search()
        })
      } else {
        this.$message({
          message: '请选择要标记的数据',
          type: 'warning',
        })
      }
    },
    detail(row) {
      this.$store.dispatch('messageReceiver/detail', row.id).then((res) => {
        this.rowData = res
        this.dialogVisible = true
        this.search()
      })
    },

    remove() {
      var ids = []
      if (this.checkBoxData && this.checkBoxData.length > 0) {
        for (let index = 0; index < this.checkBoxData.length; index++) {
          ids.push(this.checkBoxData[index].id)
        }
      }

      if (ids.length > 0) {
        this.$store
          .dispatch('messageReceiver/remove', ids.join(','))
          .then((res) => {
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
        this.search()
      }
    },
    // 查询
    search() {
      this.openFullScreen()
      let queryFilter = {pageBean: this.pagination}
      if (this.filterQuery.value === 2) {
        queryFilter = Object.assign(queryFilter, {params: this.filterParams})
      }
      let querys = []
      if (this.tableData === '') {
        querys = [this.filterQuery]
      } else {
        querys = [
          //yigz:2022-08-17 新增公文标题查询
          {
            property: 'content',
            value: '%' + this.tableData + '%',
            group: 'main',
            operation: 'LIKE',
            relation: 'OR',
          },
          {
            property: 'subject',
            value: '%' + this.tableData + '%',
            group: 'main',
            operation: 'LIKE',
            relation: 'OR',
          },

          this.filterQuery,
        ]
      }
      queryFilter = Object.assign(queryFilter, {querys})
      this.$store
        .dispatch('messageReceiver/getlistJson', queryFilter)
        .then(() => {
          this.fullscreenLoading = false
        })
      this.$store.dispatch('messageReceiver/setMsgbadge')
    },
    //重置
    reset() {
      this.tableData = ''
      this.search()
    },
    operating(id, action) {
      var title =
        action == 'edit'
          ? '编辑常用语'
          : action == 'add'
          ? '添加常用语'
          : '查看常用语'
      if (action == 'add') {
        this.$router.push('/messageReceiver/messageReceiverAdd')
      } else if (action == 'edit') {
        this.$router.push('/messageReceiver/messageReceiverEdit/' + id)
      } else {
        this.$router.push('/messageReceiver/messageReceiverGet/' + id)
      }
    },
    handleSizeChange: function (size) {
      //每页下拉显示数据
      this.$store.dispatch('messageReceiver/setPaginationSize', size)
      this.search()
    },
    handleCurrentChange: function (currentPage) {
      //点击第几页
      this.$store.dispatch('messageReceiver/setPaginationPageNum', currentPage)
      this.search()
    },
    receiveTimeSortChange({column, prop, order}) {
      if (order === 'ascending') {
        this.filterParams.receiveTimeOrder = 'asc'
      } else {
        this.filterParams.receiveTimeOrder = 'desc'
      }
      this.search()
    },
  },
  created() {
    //默认显示未读消息
    let pagination = {
      pageBean: {page: 1, pageSize: 10, showTotal: true},
      querys: [this.filterQuery],
    }
    this.$store.dispatch('messageReceiver/getlistJson', pagination).then(() => {
      this.fullscreenLoading = false
    })
    this.$store.dispatch('messageReceiver/setMsgbadge')
  },
}
</script>

<style lang="scss" scoped>
.el-table >>> th.todo-header-row {
  background-color: #fafafa;
  font-size: 13px;
}

.el-table >>> tr.todo-row {
  font-size: 13px;
  color: #000;
}

.el-container {
  background-color: #fff;
}

.message-receiver-list__row {
  margin: 10px 0 0 20px;
  .mark-read__btn {
    margin-left: 10px;
  }
}

.el-header {
  border-bottom: 1.5px solid #ededed;
}

.todo-subject {
  cursor: pointer;
}

.todo-subject {
  color: #2761ff;
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
.read-option-select {
  margin-left: 10px;
  width: 74px;
}
</style>
