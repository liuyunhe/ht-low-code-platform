<template>
  <div style="background: #fff; width: 100%">
    <div>
      <div>
        <el-header class="middle-header">
          <el-input
            size="small"
            style="width: 100%; padding: 8px 0"
            clearable
            @clear="clear"
            @change="searchChange"
            :placeholder="searchPlaceholder"
            prefix-icon="el-icon-search"
            @keyup.enter.native="search"
            v-model="searchWord"
          ></el-input>
        </el-header>
        <el-main style="padding: 0">
          <el-table
            :data="data"
            v-loading="loading"
            ref="selectorTable"
            stripe
            border
            :highlight-current-row="single"
            @row-click="handleRowClick"
            @select="handleTableSelect"
            @select-all="handleTableSelect"
            class="selector-table"
            size="small"
          >
            <el-table-column
              type="selection"
              align="center"
              width="40"
              v-if="!this.single"
            ></el-table-column>
            <el-table-column align="center" width="35" v-if="this.single">
              <template slot-scope="scope">
                <el-radio v-model="selectedId" :label="scope.row.id"></el-radio>
              </template>
            </el-table-column>
            <!-- <el-table-column type="index" width="60" align="center" label="序号"></el-table-column> -->
            <el-table-column
              :prop="column.prop"
              :label="column.label"
              :width="column.width"
              v-for="(column, index) in tableColumns"
              :key="index"
            >
              <template slot-scope="scope">
                <div class="cell" v-if="column.type == 'timestamp'">
                  {{
                    scope.row[column.prop] | dateformat('YYYY-MM-DD HH:mm:ss')
                  }}
                </div>
                <div class="cell" v-else>{{ scope.row[column.prop] }}</div>
              </template>
            </el-table-column>
          </el-table>
        </el-main>
        <el-footer>
          <el-row type="flex" justify="end">
            <el-pagination
              small
              :disabled="loading"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="pagination.page"
              :page-sizes="[10, 50, 100, 200, 300]"
              :page-size="pagination.pageSize"
              :pager-count="11"
              layout="total, prev, pager, next"
              :total="pagination.total"
            ></el-pagination>
          </el-row>
        </el-footer>
      </div>
    </div>
  </div>
</template>
<script>
import utils from '@/hotent-ui-util.js'
import {setTimeout} from 'timers'
export default {
  name: 'mobile-selector',
  props: {
    searchPlaceholder: {
      type: String,
      default: '',
    },
    selectLabel: {
      type: String,
      default: 'name',
    },
    tableColumns: {
      type: Array,
      default: () => {
        return []
      },
    },
    value: {
      type: Array,
      default: () => {
        return []
      },
    },
    data: Array,
    single: {
      type: Boolean,
      default: false,
    },
    //服务端分页
    pagination: {
      type: Object,
      default: () => {
        return {
          page: 1,
          pageSize: 50,
          total: 31214,
          showTotal: true,
        }
      },
    },
    quickSearchProps: {
      type: [String, Array],
      required: true,
    },
    uniqueKey: {
      type: String,
      default: 'id',
    },
  },
  data() {
    return {
      loading: false,
      searchWord: null,
      //客户端分页
      paging: {
        page: 1,
        pageSize: 10,
      },
      selectedId: null,
      selects: [],
      checkBoxDataAll: [], //选择的数据集合，用于复选框是否选中状态
    }
  },
  computed: {
    treeProps: function () {
      return {label: this.selectLabel}
    },
  },
  watch: {
    data: function (newVal) {
      if (newVal && newVal.length > 0) {
        this.syncCheckedStatus()
      }
    },
  },
  created() {
    // 组件初始化时，复制一份分页信息
    this.oldPaging = {...this.paging}
  },
  methods: {
    //判断数据是否包含某个对象，并返回数据包含对象的下标
    indexArray(array, item) {
      if (array.length == 0) {
        return -1
      }
      for (let i = 0; i < array.length; i++) {
        if (JSON.stringify(array[i]) == JSON.stringify(item)) {
          return i
        }
      }
      return -1
    },
    toggleRowSelection(res, val) {
      this.$refs.selectorTable.toggleRowSelection(this.data[res], val)
    },
    // 同步已选行到已选数据中去
    syncSelection2selects(_tag) {
      //判断是否为选中状态时 true：是，fasle：否
      if (_tag) {
        // 复制一份当前已选数据
        let tmpSelects = [...this.selects]
        // 先将当前页中的数据从已选数据中移除
        this.data.forEach((m) => {
          tmpSelects.remove(m)
        })
        // 将剩余的已选数据与当前页选中的数据合并
        tmpSelects = [...tmpSelects, ...this.$refs.selectorTable.selection]
        // 数组去重
        this.selects = tmpSelects.unique(this.uniqueKey)
      }
    },
    // 同步已选数据在Table中的选中状态
    syncCheckedStatus() {
      this.selectedId = null
      if (this.single) {
        this.selects.length === 1 && (this.selectedId = this.selects[0].id)
      } else {
        if (!this.$refs.selectorTable || !this.$refs.selectorTable.selection) {
          throw '未获取到数据列表，无法选择数据。'
        }
        this.$refs.selectorTable.clearSelection()
        this.selects.length > 0 &&
          setTimeout(() => {
            this.selects.forEach((m) => {
              if (
                this.data.some((n) => {
                  return utils.objectEquals(m, n)
                })
              ) {
                this.$refs.selectorTable.toggleRowSelection(m)
              }
            })
          })
      }
    },
    onShow(initSelectors) {
      // 每一次显示选择器时，重置当前选中数据为外部的v-model对象
      if (!initSelectors) {
        this.selects = [...this.value]
      } else {
        this.selects = initSelectors
      }
      this.reset()
    },
    onHide(sure) {
      // 在隐藏选择器时，如果点击的是确定按钮，则将当前选中数据更新到外部的v-model对象上
      if (sure) {
        this.$emit('input', this.selects)
      }
    },
    getQueryFilter() {
      let queryFilter = {
        querys: [],
        pageBean: this.paging,
      }

      if (
        this.quickSearchProps &&
        this.quickSearchProps.constructor == String &&
        this.searchWord
      ) {
        let props = this.quickSearchProps.split(',')
        props.forEach((item) => {
          let query = {
            property: item,
            value: this.searchWord,
            group: 'main',
            operation: 'LIKE',
            relation: 'OR',
          }
          queryFilter.querys.push(query)
        })
      }

      return queryFilter
    },
    // 加载数据，根据当前的搜索关键词及分页条件
    load() {
      this.loading = true
      this.$emit('load', this.getQueryFilter(), () => {
        this.loading = false
        //给选择的数据列添加复选框选中状态
        const this_ = this
        setTimeout(() => {
          if (this_.selects.length > 0) {
            this_.checkBoxDataAll = []
            let tmpSelects = [...this_.selects] //复制一份已选数据
            for (let i = 0; i < this_.data.length; i++) {
              for (let j = 0; j < tmpSelects.length; j++) {
                if (
                  this_.data[i][this_.selectLabel] ==
                  tmpSelects[j][this_.selectLabel]
                ) {
                  this_.checkBoxDataAll.push(this_.data[i])
                }
              }
            }
            if (this_.checkBoxDataAll.length > 0) {
              this_.checkBoxDataAll.forEach((row) => {
                let res = this_.indexArray(this_.data, row)
                if (res != -1) {
                  this_.toggleRowSelection(res, true)
                }
              })
            }
          }
        }, 300)
      })
    },
    // 搜索事件
    search() {
      if (this.loading) {
        return
      }
      this.paging = this.oldPaging
      this.load()
    },
    // 重置事件
    reset() {
      this.$emit('reset')
      this.searchWord = null
      this.paging = this.oldPaging
      this.load()
    },
    clear() {
      this.reset()
    },
    handleRowClick(row, column, event) {
      if (this.single) {
        this.selects = [row]
        this.selectedId = row.id
      } else {
        if (!this.$refs.selectorTable || !this.$refs.selectorTable.selection) {
          throw '未获取到数据列表，无法选择数据。'
        }
        let _tag = true
        const this_ = this
        this_.$refs.selectorTable.selection.forEach((m) => {
          if (m === row) {
            // 已选中该行时，取消选中状态
            this_.$refs.selectorTable.toggleRowSelection(row, false)
            //在选择了的数据集合中移除取消了选中的数据
            for (var j = this_.selects.length - 1; j >= 0; j--) {
              if (
                row[this_.selectLabel] == this_.selects[j][this_.selectLabel]
              ) {
                this_.selects.splice(j, 1)
              }
            }
            _tag = false
          }
        })
        // 非取消选中情况下，将当前行设置为选中状态
        _tag && this.$refs.selectorTable.toggleRowSelection(row)
        this.syncSelection2selects(_tag)
      }
    },
    handleTableSelect(selection) {
      if (selection.length > 0) {
        this.syncSelection2selects(true)
      } else {
        let _tag = true
        const this_ = this
        this_.$refs.selectorTable.selection.forEach((m) => {
          // 已选中该行时，取消选中状态
          this_.$refs.selectorTable.toggleRowSelection(m, false)
          //在选择了的数据集合中移除取消了选中的数据
          for (var j = this_.selects.length - 1; j >= 0; j--) {
            if (m[this_.selectLabel] == this_.selects[j][this_.selectLabel]) {
              this_.selects.splice(j, 1)
            }
          }
          _tag = false
        })
        this.syncSelection2selects(_tag)
      }
    },
    handleSizeChange(size) {
      this.paging.pageSize = size
      this.load()
    },
    handleCurrentChange(currentPage) {
      this.paging.page = currentPage
      this.load()
    },
    move(direct) {
      let selectedAry = this.$refs.selectTree.getCheckedNodes()
      // 将调整顺序之后的数组赋值给Tree
      this.selects = utils.arrayMove(this.selects, selectedAry, direct)
      setTimeout(() => {
        // 调整顺序后恢复勾选状态
        this.$refs.selectTree.setCheckedNodes(selectedAry)
      })
    },
    removeSelected() {
      let selectedAry = this.$refs.selectTree.getCheckedNodes()
      selectedAry.forEach((item) => {
        this.selects.remove(item)
      })
      this.syncCheckedStatus()
    },
    clearAllSelects() {
      this.selects = []
      this.syncCheckedStatus()
    },
    searchChange() {
      this.oldPaging.page = 1
      this.search()
    },
  },
}
</script>
<style lang="stylus" scoped>
.middle-header {
  padding-bottom: 16px;
  height: 48px !important;
}

>>> .el-header {
  padding-right: 0px !important;
  padding-left: 5px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  -ms-flex-negative: 0;
  flex-shrink: 0;
}

>>>.el-footer {
  height: 0px !important;
}

>>> .el-dialog__header {
  padding: 10px 20px;
  background: #F8F8F8;
  height: 24px;
  line-height: 24px;
  border-bottom: 1px solid #eee;
  border-radius: 2px 2px 0 0;
}

>>> .el-dialog__title {
  font-size: 15px;
  color: #333;
}

>>> .el-dialog__headerbtn {
  top: 12px;
}

.el-table {
  font-size: 12px;
}

.el-input__inner[aria-invalid='true'] {
  border-color: #f56c6c;
}

.el-select__tags {
  background: #fff;
  margin-left: 1px;
}

.left-aside {
  border-right: 1px solid #eee;
  padding: 10px;
}

.org-tree {
  height: 440px;
  margin-top: 10px;
}

.org-table {
  width: 100%;
}

.right-aside {
  border-left: 1px solid #eee;
}

.select-aside {
  border-left: 1px solid #eee;
}

.select-header {
  border-bottom: 1px solid #eee;
  height: 52px !important;
}

.select-header > span {
  padding: 10px 0;
  line-height: 53px;
}

.select-tree-div {
  height: 500px;
  overflow-y: auto;
}

>>> .el-dialog__body {
  height: calc(100% - 95px) !important;
  padding: 0;
}

>>> .el-card__header {
  padding: 10px;
}

>>> .el-card__body {
  padding: 10px;
}

>>> .el-dialog__body div {
  height: 100% !important;
}

.org-find-card >>> .el-card__header {
  background: #F5F7FA;
}

>>> .el-main {
  padding: 0 5px !important;
}

.button-group {
  width: 70px;
  height: 170px;
  margin: 0px auto;
  position: relative;
  top: 50%;
  -webkit-transform: translateY(-50%);
  -moz-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  -o-transform: translateY(-50%);
  transform: translateY(-50%);
}

.button-group > button {
  display: block;
  margin: 8px 0;
}
</style>