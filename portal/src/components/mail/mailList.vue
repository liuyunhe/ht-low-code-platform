<template>
  <el-container class="fullheight">
    <el-aside width="200px" v-show="this.tree.length > 0">
      <el-row class="aside__top-btn">
        <el-col :span="24">
          <el-dropdown
            split-button
            type="success"
            size="mini"
            @click="sysnc('')"
          >
            <i class="el-icon-message" style="margin-right:2px"></i>收信
            <el-dropdown-menu slot="dropdown">
              <!-- <el-dropdown-item @click.native="sysnc('')">收取所有账号</el-dropdown-item> -->
              <el-dropdown-item
                v-for="item in tree"
                :key="item.id"
                @click.native="sysnc(item.id)"
                >{{ item.nickName }}</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
          <el-button
            @click="sendMail"
            type="primary"
            size="mini"
            icon="el-icon-plus"
            style="margin-left:3px"
            >写信</el-button
          >
        </el-col>
      </el-row>
      <el-tree
        :data="tree"
        node-key="id"
        default-expand-all
        highlight-current
        :props="defaultProps"
        ref="tree"
        @node-click="treeClick"
        style="margin-bottom:25px;"
      >
      </el-tree>
    </el-aside>

    <el-container
      style="border-left:1px solid #E7EAEC"
      v-if="this.tree.length > 0"
    >
      <h3 class="flow_table_title">邮件管理列表</h3>
      <div class="mail-list__wrap">
        <el-button
          @click="deleted"
          type="danger"
          size="small"
          icon="el-icon-delete"
          style="margin-left:0"
          :disabled="multipleSelection.length < 1"
          >删除</el-button
        >
        <el-input
          size="small"
          style="width:380px"
          clearable
          placeholder="请输入关键词 主题/发送人"
          prefix-icon="el-icon-search"
          v-model="tableData"
          @keyup.enter.native="searchEnterFun"
          class="mail-list__search"
        >
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="search('find')"
          ></el-button>
        </el-input>
      </div>
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
          :default-sort="{prop: 'sendDate', order: 'descending'}"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50"></el-table-column>
          <el-table-column
            type="index"
            width="50"
            label="序号"
          ></el-table-column>
          <el-table-column
            align="center"
            label="类型"
            width="80"
            prop="isRead"
            sortable
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <i v-if="scope.row.isRead == 1" class="el-icon-message"></i>
              <i v-if="scope.row.isRead == 0" class="el-icon-news"></i>
            </template>
          </el-table-column>
          <el-table-column
            prop="subject"
            label="主題"
            align="left"
            width="290"
            sortable
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span
                class="todo-subject"
                v-if="scope.row.type != 3"
                @click="handleRowClick(scope.row)"
                >{{ scope.row.subject }}</span
              >
              <span
                class="todo-subject"
                v-if="scope.row.type == 3"
                @click="mailEdits(scope.row)"
                >{{ scope.row.subject }}</span
              >
            </template>
          </el-table-column>
          <el-table-column
            label="发件人"
            width="290"
            align="left"
            prop="sendAddress"
            sortable
            show-overflow-tooltip
          >
            <template slot-scope="test">
              <el-popover trigger="hover" placement="top">
                <p>姓名: {{ test.row.senderName }}</p>
                <p>邮箱: {{ test.row.senderAddress }}</p>
                <el-button
                  v-show="test.row.isExitedMan == 1"
                  @click="saveMailman(test.row)"
                  size="small"
                  type="primary"
                  icon="el-icon-edit-outline"
                  >添加邮箱联系人</el-button
                >
                <div slot="reference" class="name-wrapper">
                  <el-tag size="medium">{{ test.row.senderAddress }}</el-tag>
                </div>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column
            prop="sendDate"
            sortable
            label="发信时间"
            align="left"
          ></el-table-column>
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
    </el-container>
    <div class="tips" v-else>
      <h3 class="flow_table_title">邮件管理列表</h3>
      <div class="setting__wrap">
        <div class="setting">
          <span>未配置邮箱账号，请通过</span>
          <router-link :to="{path: '/mail/settingAdd'}"
            ><span class="rounters">邮件配置添加页面</span></router-link
          >
          <span>添加一个邮箱账号</span>
        </div>
      </div>
    </div>
  </el-container>
</template>

<script>
import {mapState, mapActions} from 'vuex'
import {Message} from 'element-ui'

export default {
  name: 'mailList',
  data() {
    return {
      tableData: '',
      currentTree: {},
      defaultTree: [],
      fullscreenLoading: true,
      dialogFormVisible: false,
      multipleSelection: [],
      defaultProps: {
        children: 'children',
        label: 'nickName'
      },
      data: {
        linkName: '',
        mailId: '',
        phone: ''
      }
    }
  },
  computed: mapState({
    rows: state => state.mail.mailRows,
    pagination: state => state.mail.mailPagination,
    total: state => state.mail.mailTotal,
    tree: state => state.mail.tree,
    mailSettingDefault: state => state.mail.mailSettingDefault
  }),
  methods: {
    rowClick(row, column, event) {
      this.$refs.htTable.toggleRowSelection(row)
    },
    //Loading 加载中
    openFullScreen() {
      this.fullscreenLoading = true
    },
    handleSizeChange: function(size) {
      //每页下拉显示数据
      this.$store.dispatch('mail/setMailPaginationSize', size)
      this.search()
    },
    handleCurrentChange: function(currentPage) {
      //点击第几页
      this.$store.dispatch('mail/setMailPaginationPageNum', currentPage)
      this.search()
    },
     //回车查询
    searchEnterFun: function(e) {
      var keyCode = window.event ? e.keyCode : e.which
      if (keyCode == 13) {
        this.search('find')
      }
    },
    search(str) {
      this.openFullScreen()
      var id = null
      let querys = [] //查询条件
      let queryFilter = {}
      let pageBean = {pageBean: this.pagination}
      if (!this.currentTree.id) {
        id = this.mailSettingDefault.id
      } else {
        if (this.currentTree.isParent == false) {
          id = this.currentTree.id
        } else {
          id = this.currentTree.parentId
        }
      }
      if (str == 'find') {
        this.$store.dispatch('mail/setMailPaginationPageNum', 1)
      }
      if (this.tableData == '') {
        if (!this.currentTree.id) {
          querys = [
            {
              property: 'type',
              value: 1,
              group: 'main',
              operation: 'EQUAL',
              relation: 'AND'
            },
            {
              property: 'setId',
              value: this.mailSettingDefault.id,
              group: 'main',
              operation: 'EQUAL',
              relation: 'AND'
            }
          ]
        } else {
          if (!this.currentTree.types) {
            querys = [
              {
                property: 'setId',
                operation: 'EQUAL',
                group: 'main',
                value: this.currentTree.id,
                relation: 'AND'
              }
            ]
          } else {
            querys = [
              {
                property: 'type',
                value: this.currentTree.types,
                group: 'main',
                operation: 'EQUAL',
                relation: 'AND'
              },
              {
                property: 'setId',
                value: this.currentTree.parentId,
                group: 'main',
                operation: 'EQUAL',
                relation: 'AND'
              }
            ]
          }
        }
      } else if (this.tableData != '') {
        if (!this.currentTree.id) {
          querys = [
            {
              property: 'subject',
              value: this.tableData,
              group: 'main',
              operation: 'LIKE',
              relation: 'OR'
            },
            {
              property: 'senderAddress',
              value: this.tableData,
              group: 'main',
              operation: 'LIKE',
              relation: 'OR'
            },
            {
              property: 'type',
              value: '1',
              group: 'main',
              operation: 'EQUAL',
              relation: 'AND'
            },
            {
              property: 'setId',
              value: this.mailSettingDefault.id,
              group: 'main',
              operation: 'EQUAL',
              relation: 'AND'
            }
          ]
        } else {
          if (!this.currentTree.types) {
            querys = [
              {
                property: 'subject',
                value: this.tableData,
                group: 'main',
                operation: 'LIKE',
                relation: 'OR'
              },
              {
                property: 'senderAddress',
                value: this.tableData,
                group: 'main',
                operation: 'LIKE',
                relation: 'OR'
              },
              {
                property: 'setId',
                value: this.currentTree.id,
                group: 'main',
                operation: 'EQUAL',
                relation: 'AND'
              }
            ]
          } else {
            querys = [
              {
                property: 'subject',
                value: this.tableData,
                group: 'main',
                operation: 'LIKE',
                relation: 'OR'
              },
              {
                property: 'senderAddress',
                value: this.tableData,
                group: 'main',
                operation: 'LIKE',
                relation: 'OR'
              },
              {
                property: 'type',
                value: this.currentTree.types,
                group: 'main',
                operation: 'EQUAL',
                relation: 'AND'
              },
              {
                property: 'setId',
                value: this.currentTree.parentId,
                group: 'main',
                operation: 'EQUAL',
                relation: 'AND'
              }
            ]
          }
        }
      }
      queryFilter = {pageBean: this.pagination, querys}
      this.$store.dispatch('mail/getMailByPagination', queryFilter).then(() => {
        this.fullscreenLoading = false
      })
    },
    reset() {
      this.tableData = ''
      this.search()
    },
    deleted() {
      if (
        this.multipleSelection == null ||
        this.multipleSelection.length == 0
      ) {
        this.$message.warning('请选择文件删除!')
        return false
      }
      this.$confirm('此操作将删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$store
            .dispatch('mail/deleteMaliById', this.multipleSelection)
            .then(() => {
              this.$store.dispatch('mail/getMailTreeList')
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
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    sysnc(id) {
      if (id == '') {
        id = this.mailSettingDefault.id
      }
      Message.info('收信中，请稍等!')
      this.$store.dispatch('mail/getSysncById', id).then(() => {
        this.$store.dispatch('mail/getMailTreeList')
        this.search('find')
      })
    },
    treeClick(n, i, e) {
      this.currentTree = n
      var type = n.types
      let querys = [] //查询条件
      let queryFilter = {}
      if (!n.types) {
        if (this.tableData != '') {
          querys = [
            {
              property: 'setId',
              operation: 'EQUAL',
              group: 'main',
              value: n.id,
              relation: 'AND'
            },
            {
              property: 'subject',
              value: this.tableData,
              group: 'main',
              operation: 'LIKE',
              relation: 'OR'
            },
            {
              property: 'senderAddress',
              value: this.tableData,
              group: 'main',
              operation: 'LIKE',
              relation: 'OR'
            }
          ]
        } else {
          querys = [
            {
              property: 'setId',
              operation: 'EQUAL',
              group: 'main',
              value: n.id,
              relation: 'AND'
            }
          ]
        }
        queryFilter = {pageBean: this.pagination, querys}
        this.$store.dispatch('mail/getMailByPagination', queryFilter)
      } else {
        if (this.tableData != '') {
          querys = [
            {
              property: 'subject',
              value: this.tableData,
              group: 'main',
              operation: 'LIKE',
              relation: 'OR'
            },
            {
              property: 'senderAddress',
              value: this.tableData,
              group: 'main',
              operation: 'LIKE',
              relation: 'OR'
            },
            {
              property: 'setId',
              value: n.parentId,
              group: 'main',
              operation: 'EQUAL',
              relation: 'AND'
            },
            {
              property: 'type',
              value: type,
              group: 'main',
              operation: 'EQUAL',
              relation: 'AND'
            }
          ]
        } else {
          querys = [
            {
              property: 'setId',
              value: n.parentId,
              group: 'main',
              operation: 'EQUAL',
              relation: 'AND'
            },
            {
              property: 'type',
              value: type,
              group: 'main',
              operation: 'EQUAL',
              relation: 'AND'
            }
          ]
        }
        queryFilter = {pageBean: this.pagination, querys}
        this.$store.dispatch('mail/getMailByPagination', queryFilter)
      }
    },
    handleRowClick(row) {
      //打开页面，变成只读
      if (row.isRead == 0) {
        //idRead变成1,未读的变成已读
        this.$store.dispatch('mail/setMailByisRead', row.id)
      }
      this.$router.push('/mail/mailGet/' + row.id)
    },
    mailEdits(row) {
      //打开页面，变成只读
      if (row.isRead == 0) {
        //idRead变成1,未读的变成已读
        this.$store.dispatch('mail/setMailByisRead', row.id)
      }
      this.$router.push('/mail/mailEdit/' + row.id)
    },
    sendMail() {
      this.$router.push('/mail/mailAdd')
    },
    saveMailman(row) {
      this.data.linkName = row.senderName
      this.data.mailId = row.senderAddress
      this.$prompt('请输入邮箱联系人电话', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(({value}) => {
          this.data.phone = value
          this.$store.dispatch('mail/saveMailLinkman', this.data).then(() => {
            this.search()
          })
        })
        .catch(() => {})
    }
  },
  created() {
    var ids = ''
    this.$store.dispatch('mail/getMailTreeList').then(treeList => {
      //展开tree默认选中
      for (let i of treeList) {
        if (i.isDefault == 1) {
          this.$refs.tree.setCurrentKey(i.children[0].id)
          ids = i.id
        }
      }
      let querys = [
        {
          property: 'type',
          value: 1,
          group: 'main',
          operation: 'EQUAL',
          relation: 'AND'
        },
        {
          property: 'setId',
          value: ids,
          group: 'main',
          operation: 'EQUAL',
          relation: 'AND'
        }
      ]
      let pageBean = {pageBean: {page: '1', pageSize: '10', showTotal: 'true'}} //初次加载默认pageBean
      let queryFilter = {pageBean: pageBean, querys}
      this.$store.dispatch('mail/getMailByPagination', queryFilter).then(() => {
        //页面加载调用tudo.js里面的分页方法
        this.fullscreenLoading = false
      })
    })
  },
  mounted() {}
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
.el-table /deep/ th.todo-header-row {
  background-color: #fafafa;
  font-size: 13px;
}
.aside__top-btn {
  padding: 14px 0 6px 10px;
  border-bottom: 1px solid #ccc;
}
.el-table /deep/ tr.todo-row {
  font-size: 13px;
  color: $--color-text-regular;
}

.el-container {
  background-color: #fff;
}

.mail-list__wrap {
  margin: 10px 0 0 20px;
  .mail-list__search {
    margin-left: 10px;
  }
}

.el-header {
  border-bottom: 1.5px solid #ededed;
}

/deep/.el-tree {
  position: relative;
  cursor: default;
  background: #fff;
  color: $--color-text-primary;
  font-size: 13px;
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
.tips {
  width: 100%;
}
.rounters {
  color: #27b5b7;
}
.setting__wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100% - 50px);
}
.setting {
  height: 50px;
  font-size: 15px;
  color: #e6a23c;
  line-height: 50px;
}
a {
  text-decoration: none;
}
.router-link-active {
  text-decoration: none;
}
</style>
