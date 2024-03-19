<template>
  <div>
    <el-footer style="height: 40px;line-height: 40px;padding:0px;padding-bottom: 5px;" v-if="inputWriteable && permission_sub!='n'">
      <el-button
        size="mini"
        @click="flowSelected"
        icon="el-icon-plus"
        plain
        round
        style="margin-left:0;"
      >添加</el-button>
    </el-footer>
    <br />
    <el-table
      v-if="dataTable.length>0 && permission_sub!='n'"
      :data="dataTable"
      border
      size="mini"
      style="width:98%"
      v-bind:class="{'isActive': !inputWriteable}"
      row-key="subject"
    >
      <el-table-column prop="subject" label="流程标题" align="LEFT">
        <template slot-scope="scope">
          <span style="cursor:pointer;color:#2761ff" @click="handleRowClick(scope.row)">{{scope.row.subject}}</span>
        </template>
      </el-table-column>
      <el-table-column prop label="操作" align="LEFT" width="49" v-if="inputWriteable">
        <template slot-scope="scope">
          <el-popconfirm title="确定删除吗？" @onConfirm="remove(scope.row)">
            <el-button slot="reference" type="danger" size="mini" icon="el-icon-delete" plain></el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <ht-sidebar-dialog
      title="添加相关流程"
      :visible.sync="relatedInformationDialog"
      :before-close="cancel"
      :close-on-click-modal="false"
      append-to-body
      width="100%"
    >
      <div>
        <div>
          <el-header class="middle-header">
            标题：
            <el-input
              size="small"
              style="width:85%;padding: 8px 0;"
              clearable
              placeholder="流程标题"
              @change="search()"
              prefix-icon="el-icon-search"
              v-model="subject"
            ></el-input>
          </el-header>
          <el-main style="padding:0">
            <el-table
              :data="rows"
              style="width: 100%"
              border
              size="small"
              :default-sort="{prop: 'createTime', order: 'descending'}"
              @selection-change="handleChecked"
              @select="onTableSelect"
              ref="flowTable"
              @row-click="RowClick"
            >
              <el-table-column type="selection" align="center" sortable width="40"></el-table-column>
              <el-table-column label="流程主题" prop="subject" align="center"></el-table-column>
            </el-table>
          </el-main>
          <el-footer>
            <el-row type="flex" justify="end">
              <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="pagination.page"
                small
                :page-sizes="[ 20, 30,40,50]"
                :page-size="pagination.pageSize"
                layout="total, prev, pager, next"
                :total="total"
              ></el-pagination>
            </el-row>
          </el-footer>
        </div>
      </div>
      <span slot="footer" class="dialog-footer" style="text-align: center;">
        <el-button type="primary" @click="confirm" size="small">确 定</el-button>
        <el-button @click="cancel" size="small">取 消</el-button>
      </span>
    </ht-sidebar-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import utils from "@/utils.js";
import sub_pio_mixin from "@/sub-permission-mixin.js";

export default {
  name: "eip-rel-flow",
  props: ["modelName", "validate", "permission", "searchConfig"],
  components: {},
  mixins: [sub_pio_mixin],//混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub）
  data() {
    return {
      relatedInformationDialog: false,
      checked: true,
      subject: "",
      createTime: "",
      checkBoxData: [],
      checkBoxDataAll: [],
      dataTable: []
    };
  },
  computed: mapState({
    rows: state => state.relatedProcess.rows,
    pagination: state => state.relatedProcess.pagination,
    total: state => state.relatedProcess.total,
    relatedInformation: state => state.relatedProcess.relatedInformation,
    inputWriteable: function() {
      return utils.getWriteable(this.permission_sub);
    }
  }),
  methods: {
    cancel() {
      this.relatedInformationDialog = false;
    },
    //确认
    confirm() {
      const _me = this;
      this.checkBoxData.forEach(row => {
        let res = _me.indexArray(_me.checkBoxDataAll, row);
        if (res == -1) {
          _me.checkBoxDataAll.push(row);
        }
      });
      this.dataTable = this.checkBoxDataAll;
      this.relatedInformationDialog = false;
      if (this.modelName) {
        const pInst = utils.getOnlineFormInstance(_me);
        utils.setValueByPath(
          pInst,
          this.modelName,
          JSON.stringify(this.dataTable)
        );
      }
    },
    handleChecked(value) {
      this.checkBoxData = value;
    },
    handleSizeChange: function(size) {
      //每页下拉显示数据
      this.$store.dispatch("relatedProcess/setPaginationSize", size);
      this.search();
    },
    handleCurrentChange: function(currentPage) {
      const this_ = this;
      if (this.checkBoxData != undefined && this.checkBoxData.length > 0) {
        this.checkBoxData.forEach(row => {
          let res = this_.indexArray(this_.checkBoxDataAll, row);
          if (res == -1) {
            this_.checkBoxDataAll.push(row);
          }
        });
      }
      this_.checkBoxData = this_.checkBoxDataAll;
      //点击第几页
      this.$store.dispatch("relatedProcess/setPaginationPageNum", currentPage);
      this.search();
    },
    RowClick(row, column, event) {
      this.$refs.flowTable.toggleRowSelection(row);
    },
    check() {
      const this_ = this;
      setTimeout(() => {
        if (this_.checkBoxData == undefined || this_.checkBoxData.length == 0) {
          this_.checkBoxData = this_.checkBoxDataAll;
        }
        this_.checkBoxData.forEach(row => {
          let res = this_.indexArray(this_.rows, row);
          if (res != -1) {
            this_.$refs.flowTable.toggleRowSelection(this_.rows[res]);
          }
        });
      }, 250);
    },
    onTableSelect(rows, row) {
      let selected = rows.length && rows.indexOf(row) !== -1;
      if (!selected) {
        let res = this.indexArray(this.checkBoxDataAll, row);
        this.checkBoxDataAll.splice(res, 1);
        if (this.checkBoxDataAll.length == 0) {
          this.checkBoxData = [];
        }
      }
    },
    search() {
      let querys = []; //查询条件
      let queryFilter = {};
      let pageBean = { pageBean: this.pagination };
      if (this.subject != "") {
        querys.push({
          property: "SUBJECT_",
          value: this.subject,
          group: "main",
          operation: "LIKE",
          relation: "OR"
        });
      }
      if (this.createTime != "") {
        querys.push({
          property: "CREATE_TIME_",
          value: utils.formatDateYear(this.createTime),
          group: "main",
          operation: "LIKE",
          relation: "OR"
        });
      }
      if (querys.length > 0) {
        if (this.searchConfig.isPaging) {
          queryFilter = {
            pageBean: {
              page: "1",
              pageSize: this.searchConfig.pageSize,
              showTotal: "true"
            },
            querys
          };
        } else {
          queryFilter = { pageBean: {} };
        }
        this.$store.dispatch("relatedProcess/getlistJson", queryFilter);
      } else {
        this.$store.dispatch("relatedProcess/getlistJson", pageBean);
      }
      this.check();
    },
    flowSelected: function() {
      if (this.checkBoxData == undefined || this.checkBoxData.length == 0) {
        this.checkBoxData = this.dataTable;
      }
      this.relatedInformationDialog = true;
      var pageBean = {};
      if (this.searchConfig.isPaging) {
        pageBean = {
          page: 1,
          pageSize: this.searchConfig.pageSize,
          showTotal: true
        };
      }
      let pagination = { pageBean: pageBean };
      this.$store.dispatch("relatedProcess/getlistJson", pagination);
      setTimeout(() => {
        this.check();
      }, 500);
    }, //重置
    reset() {
      this.subject = "";
      this.createTime = "";
      this.search();
    },
    remove(row) {
      this.dataTable.remove(row);
      if (this.modelName) {
        const pInst = utils.getOnlineFormInstance(this);
        utils.setValueByPath(
          pInst,
          this.modelName,
          JSON.stringify(this.dataTable)
        );
      }
    }, //上移按钮
    up(idx) {
      idx = Number.parseInt(idx);
      if (idx < 1) {
        return;
      }
      var t = this.dataTable[idx - 1];
      this.$set(this.dataTable, idx - 1, this.dataTable[idx]);
      this.$set(this.dataTable, idx, t);
      if (this.modelName) {
        const pInst = utils.getOnlineFormInstance(this);
        utils.setValueByPath(
          pInst,
          this.modelName,
          JSON.stringify(this.dataTable)
        );
      }
    },
    //下移按钮
    down(idx) {
      idx = Number.parseInt(idx);
      if (idx >= this.dataTable.length - 1) {
        return;
      }

      var t = this.dataTable[idx + 1];
      this.$set(this.dataTable, idx + 1, this.dataTable[idx]);
      this.$set(this.dataTable, idx, t);

      if (this.modelName) {
        const pInst = utils.getOnlineFormInstance(this);
        utils.setValueByPath(
          pInst,
          this.modelName,
          JSON.stringify(this.dataTable)
        );
      }
    },
    handleRowClick(row) {
      window.open(this.$router.resolve("/inst/" + row.id).href, "_blank");
    },
    //去重json数组重复数据
    uniqueArray(array, key) {
      var result = [array[0]];
      for (var i = 1; i < array.length; i++) {
        var item = array[i];
        var repeat = false;
        for (var j = 0; j < result.length; j++) {
          if (item[key] == result[j][key]) {
            repeat = true;
            break;
          }
        }
        if (!repeat) {
          result.push(item);
        }
      }
      return result;
    },
    indexArray(array, item) {
      for (var i = 0; i < array.length; i++) {
        if (array[i].id == item.id) {
          return i;
        }
      }
      return -1;
    }
  },

  created() {},
  mounted() {
    const _me = this;
    if (this.modelName) {
      const pInst = utils.getOnlineFormInstance(_me);
      const oldVal = utils.getValueByPath(pInst, this.modelName);
      if (oldVal) {
        this.dataTable = JSON.parse(oldVal);
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
.isActive{
  width: 98%;margin-top :-24px;
}
.classObject{
  width: 98%;
  margin-top: 4px;
}
div>>>.el-table--mini td, >>>.el-table--mini th {
  padding: 2px 0 !important;
}

>>>.el-button--mini, .el-button--mini.is-round {
  padding: 5px 7px;
}

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