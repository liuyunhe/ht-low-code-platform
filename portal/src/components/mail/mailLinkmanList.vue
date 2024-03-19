<template>
  <el-container class="fullheight">
    <h3 class="flow_table_title">邮件联系人列表</h3>
    <el-row class="mail-list__row">
        <el-button
          type="primary"
          @click="openDialog()"
          size="small"
          icon="el-icon-plus"
          >新增</el-button
        >
        <el-button
          @click="deleted"
          type="danger"
          size="small"
          icon="el-icon-delete"
          style="margin-left:10px"
          :disabled="multipleSelection.length < 1"
          >删除</el-button
        >
        <el-input
        class="search-input"
          size="small"
          style="width:380px"
          clearable
          placeholder="请输入关键词 联系人名称/邮箱地址"
          prefix-icon="el-icon-search"
          v-model="tableData"
          @keyup.enter.native="searchEnterFun"
        >
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="search('find')"
          ></el-button>
        </el-input>
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
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column
          prop="linkName"
          label="联系人名称"
          align="center"
          sortable
        >
          <template slot-scope="scope">
            <span
              class="todo-subject"
              @click="operating(scope.row.id, 'get')"
              >{{ scope.row.linkName }}</span
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="mailId"
          label="邮箱地址"
          width="360"
          align="center"
          sortable
        ></el-table-column>
        <el-table-column
          prop="phone"
          label="联系人电话"
          align="center"
          sortable
        ></el-table-column>
        <el-table-column fixed="right" label="操作" width="140" align="center">
          <template slot-scope="scope">
            <el-button
              @click="operating(scope.row.id, 'edit')"
              size="small"
              icon="el-icon-edit"
              plain
              >修改</el-button
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
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </el-row>
    </el-footer>
    <el-dialog
      title="添加邮箱联系人"
      v-if="dialogFormVisible"
      :visible.sync="dialogFormVisible"
      destroy-on-close
      width="600px"
      id="dialogs"
    >
      <el-form
        :model="data"
        status-icon
        ref="data"
        label-width="120px"
        class="demo-ruleForm"
        :rules="rules"
      >
        <el-form-item label="联系人名称：" prop="linkName">
          <el-input v-model="data.linkName" maxlength="15"></el-input>
        </el-form-item>
        <el-form-item label="邮箱地址：" prop="mailId">
          <el-input v-model="data.mailId" maxlength="30"></el-input>
        </el-form-item>
        <el-form-item label="联系人电话：" prop="phone">
          <el-input v-model="data.phone"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm('data')" size="small"
          >确 定</el-button
        >
        <el-button @click="cancel()" size="small">取 消</el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
import {mapState, mapActions} from 'vuex'

export default {
  name: 'mailLinkmanList',
  data() {
    var checkName = (rule, value, callback) => {
      var pattern = new RegExp(
        "[`~!@#$%^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？ ]"
      )
      if (value == '') {
        callback(new Error('请输入联系人名称'))
      } else if (pattern.test(value)) {
        callback(new Error('联系人名称包含特殊字符，请重新输入'))
      } else {
        callback()
      }
    }
    var checkphone = (rule, value, callback) => {
      const reg = /^1[3|4|5|7|8][0-9]\d{8}$/
      if (value == '') {
        callback(new Error('请输入手机号'))
      } else if (!reg.test(value)) {
        callback(new Error('请输入正确的手机号!'))
      } else {
        callback()
      }
    }
    return {
      tableData: '',
      dialogFormVisible: false,
      fullscreenLoading: true,
      multipleSelection: [],
      formLabelWidth: '80px',
      data: {
        linkName: '',
        mailId: '',
        phone: ''
      },
      rules: {
        mailId: [
          {required: true, message: '请输入邮箱地址', trigger: 'blur'},
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: 'blur,change'
          }
        ],
        linkName: [{required: true, validator: checkName, trigger: 'blur'}],
        phone: [{required: true, validator: checkphone, trigger: 'blur'}]
      }
    }
  },
  computed: mapState({
    rows: state => state.mail.mailLinkmanRows,
    pagination: state => state.mail.mailLinkmanPagination,
    total: state => state.mail.mailLinkmanTotal,
    tree: state => state.mail.tree
  }),
  methods: {
     //回车查询
    searchEnterFun: function(e) {
      var keyCode = window.event ? e.keyCode : e.which
      if (keyCode == 13) {
        this.search('find')
      }
    },
    rowClick(row, column, event) {
      this.$refs.htTable.toggleRowSelection(row)
    },
    //Loading 加载中
    openFullScreen() {
      this.fullscreenLoading = true
    },
    handleSizeChange: function(size) {
      //每页下拉显示数据
      this.$store.dispatch('mail/setMailLinkmanPaginationSize', size)
      this.search()
    },
    handleCurrentChange: function(currentPage) {
      //点击第几页
      this.$store.dispatch('mail/setMailLinkmanPaginationPageNum', currentPage)
      this.search()
    },
    search(str) {
      this.openFullScreen()
      if (str == 'find') {
        this.$store.dispatch('mail/setMailLinkmanPaginationPageNum', 1)
      }
      let querys = [] //查询条件
      let queryFilter = {}
      let pageBean = {pageBean: this.pagination}
      if (this.tableData == '') {
        this.$store
          .dispatch('mail/getMailLinkmanByPagination', pageBean)
          .then(() => {
            this.fullscreenLoading = false
          })
      } else if (this.tableData != '') {
        querys = [
          {
            property: 'linkName',
            value: this.tableData,
            group: 'main',
            operation: 'LIKE',
            relation: 'OR'
          },
          {
            property: 'mailId',
            value: this.tableData,
            group: 'main',
            operation: 'LIKE',
            relation: 'OR'
          }
        ]
        queryFilter = {pageBean: this.pagination, querys}
        this.$store
          .dispatch('mail/getMailLinkmanByPagination', queryFilter)
          .then(() => {
            this.fullscreenLoading = false
          })
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    deleted() {
      if (
        this.multipleSelection == null ||
        this.multipleSelection.length == 0
      ) {
        this.$message.warning('请选择联系人删除!')
        return false
      }
      this.$confirm('此操作将删除该联系人, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$store
            .dispatch('mail/deleteMaliLinkmanById', this.multipleSelection)
            .then(() => {
              this.search()
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    operating(id, action) {
      if (action == 'add') {
        this.$router.push('/mail/linkmanAdd')
      } else if (action == 'edit') {
        this.$router.push('/mail/linkmanEdit/' + id)
      } else {
        this.$router.push('/mail/linkmanGet/' + id)
      }
    },
    submitForm(data) {
      this.$refs[data].validate(valid => {
        if (valid) {
          this.$store.dispatch('mail/saveMailLinkman', this.data).then(() => {
            this.data = {
              linkName: '',
              mailId: '',
              phone: ''
            }
            this.dialogFormVisible = false
            this.search()
          })
        } else {
          this.$message.warning('您输入表单信息有误，请重新填写!')
          return false
        }
      })
    },
    openDialog() {
      this.data = {
        linkName: '',
        mailId: '',
        phone: ''
      }
      this.dialogFormVisible = true
    },
    cancel() {
      this.data = {}
      this.dialogFormVisible = false
    }
  },
  created() {
    let pageBean = {pageBean: {page: '1', pageSize: '10', showTotal: 'true'}} //初次加载默认pageBean
    this.$store
      .dispatch('mail/getMailLinkmanByPagination', pageBean)
      .then(() => {
        this.fullscreenLoading = false
      })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
.mail-list__row{
  margin: 10px 0 0 20px;
  .search-input{
    margin-left: 10px;
  }
}
.el-table /deep/ th.todo-header-row {
  background-color: #fafafa;
  font-size: 13px;
}
.el-table /deep/ tr.todo-row {
  font-size: 13px;
  color: $--color-text-regular;
}
.todo-subject {
  cursor: pointer;
}

.todo-subject {
  color: $--theme-color;
}

.el-container {
  background-color: #fff;
}

.el-header {
  border-bottom: 1.5px solid #ededed;
}
.dialog-footer {
  margin-top: 10px;
}
</style>
