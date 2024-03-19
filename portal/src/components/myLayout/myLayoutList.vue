<template>
  <el-container>
    <PortalDesignerDialog ref="designDialog" @close="designClose" />
    <el-container style="border-left:1px solid #E7EAEC">
      <el-main>
        <el-row>
          <el-col :span="6">
            <el-button
              type="primary"
              size="small"
              @click="addMyLayout()"
              icon="el-icon-plus"
              style="margin-left:0"
            >{{$t('common.add')}}</el-button>
<!--            <el-button-->
<!--              type="danger"-->
<!--              size="small"-->
<!--              @click="remove"-->
<!--              icon="el-icon-delete"-->
<!--              style="margin-left:3px;"-->
<!--            >{{$t('common.delete')}}</el-button>-->
            <eip-popconfirm-button
                type="danger"
                title="确定删除吗？"
                icon="el-icon-delete"
                @onConfirm="remove"
                style="margin-left:3px;">{{$t('common.delete')}}</eip-popconfirm-button>
          </el-col>
          <el-col :span="18">
            <el-input
              size="small"
              style="width:380px"
              clearable
              :placeholder="$t('myLayout.myLayoutName')"
              prefix-icon="el-icon-search"
              v-model="tableData"
            ></el-input>
            <el-button
              style="margin-left: 20px"
              size="small"
              type="primary"
              icon="el-icon-search"
              @click="search('find')"
            >{{$t('common.search')}}</el-button>
            <el-button size="small" icon="el-icon-refresh" @click="reset">{{$t('common.reset')}}</el-button>
          </el-col>
        </el-row>
        <el-table
          :data="rows"
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
          <el-table-column type="index" sortable width="50" :label="$t('common.seq')"></el-table-column>
          <el-table-column prop="name" :label="$t('myLayout.myLayoutName')" align="center"></el-table-column>
          <el-table-column prop :label="$t('myLayout.valid')" align="center" width="290">
            <template slot-scope="scope">{{scope.row.valid===1 ? "有效" :"无效"}}</template>
          </el-table-column>
          <el-table-column prop :label="$t('common.operation')" align="center" width="290">
            <template slot-scope="scope">
              <el-button
                @click="editMylayout(scope.row.id)"
                size="small"
                icon="el-icon-edit"
                plain
              >{{$t('common.modify')}}</el-button>
              <el-button
                v-if="scope.row.valid!==1"
                @click="setValid(scope.row.id)"
                size="small"
                icon="el-icon-tickets"
                plain
              >{{$t('myLayout.setValid')}}</el-button>
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
          ></el-pagination>
        </el-row>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import req from "@/request.js";
const PortalDesignerDialog = () =>
  import("@/components/myLayout/PortalDesignerDialog.vue");
import EipPopconfirmButton from "@/components/eipControl/EipPopconfirmButton";

export default {
  name: "approvalItemList",
  components: {
    PortalDesignerDialog,
    EipPopconfirmButton
  },
  data() {
    return {
      tableData: "",
      fullscreenLoading: true,
      checkBoxData: [],
      portal: window.context.portal,
      rows: [],
      pagination: { page: 1, pageSize: 10, showTotal: true },
      total: 1
    };
  },

  methods: {
    setValid(id) {
      req
        .get(this.portal + `/portal/sysIndexMyLayout/v1/setValid?id=` + id)
        .then(response => {
          this.search();
        });
    },
    designClose() {
      this.init();
    },
    addMyLayout() {
      this.$refs.designDialog.showDialog();
    },
    editMylayout(id) {
      this.$refs.designDialog.showDialog(id);
    },
    init(pagination) {
      if (!pagination) {
        pagination = { pageBean: { page: 1, pageSize: 10, showTotal: true } };
      }
      req
        .post(this.portal + `/portal/sysIndexMyLayout/v1/listJson`, pagination)
        .then(response => {
          this.rows = response.data.rows;
          let pageBean = {
            page: response.data.page,
            pageSize: response.data.pageSize,
            showTotal: true
          };
          this.pagination = pageBean;
          this.total = response.data.total;
          this.fullscreenLoading = false;
        });
    },
    remove() {
      var ids = [];
      if (this.checkBoxData && this.checkBoxData.length > 0) {
        for (let index = 0; index < this.checkBoxData.length; index++) {
          ids.push(this.checkBoxData[index].id);
        }
      }
      //数组去重
      //this.checkBoxData = Array.from(new Set(this.checkBoxData));
      if (ids.length > 0) {
        req
          .remove(
            this.portal +
              `/portal/sysIndexMyLayout/v1/deleteLayout?ids=` +
              ids.join(",")
          )
          .then(response => {
            this.search();
          });
      } else {
        this.$message({
          message: "请选择要删除的数据",
          type: "warning"
        });
      }
    },
    handleChecked(value) {
      this.checkBoxData = value;
    },
    //Loading 加载中
    openFullScreen() {
      this.fullscreenLoading = true;
    },
    // 查询
    search(str) {
      this.openFullScreen();
      if (str == "find") {
        this.pagination.page = 1;
      }
      let querys = []; //查询条件
      let queryFilter = {};
      let pageBean = { pageBean: this.pagination };
      if (this.tableData == "") {
        this.init(pageBean);
      } else {
        querys = [
          {
            property: "NAME_",
            value: this.tableData,
            group: "main",
            operation: "LIKE",
            relation: "OR"
          }
        ];
        queryFilter = { pageBean: this.pagination, querys };
        this.init(queryFilter);
      }
    },
    //重置
    reset() {
      this.tableData = "";
      this.search("find");
    },
    operating(id, action) {
      var title =
        action == "edit"
          ? "编辑常用语"
          : action == "add"
          ? "添加常用语"
          : "查看常用语";
      if (action == "add") {
        this.$router.push("/approvalItem/approvalItemAdd");
      } else if (action == "edit") {
        this.$router.push("/approvalItem/approvalItemEdit/" + id);
      } else {
        this.$router.push("/approvalItem/approvalItemGet/" + id);
      }
    },
    handleSizeChange: function(size) {
      //每页下拉显示数据
      this.$store.dispatch("approvalItem/setPaginationSize", size);
      this.search();
    },
    handleCurrentChange: function(currentPage) {
      //点击第几页
      this.$store.dispatch("approvalItem/setPaginationPageNum", currentPage);
      this.search();
    }
  },
  created() {
    this.init();
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
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
