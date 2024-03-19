<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      quick-search-props="authorizeDesc"
      :show-export="false"
      ref="htTable"
      @row-click="rowClick"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="showDialog()" icon="el-icon-plus"
            >添加</el-button
          >
          <el-button size="small" @click="showAuthPageDialog()" icon="el-icon-search"
            >授权查询</el-button
          >
          <ht-delete-button
            url="${bpmModel}/flow/defAuthorize/v1/del"
            :htTable="$refs.htTable"
            style="margin:0;"
            >删除</ht-delete-button
          >
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="id" label="主键" :sortable="true" hidden />
        <ht-table-column
          prop="authorizeDesc"
          label="权限描述"
          :sortable="true"
          :show-overflow-tooltip="true"
        >
          <template v-slot="{ row, column, $index }">
            <el-link
              type="primary"
              @click="handleCommand({ row: row, command: 'edit' })"
              title="点击编辑"
              >{{ row.authorizeDesc }}</el-link
            >
          </template>
        </ht-table-column>
        <ht-table-column prop="creator" label="创建人" :sortable="true" />
        <ht-table-column prop="createTime" label="创建时间" :sortable="true" />
      </template>
    </ht-table>

    <!-- 授权设置  -->
    <def-authorize-dialog
      ref="defAuthorizeDialog"
      name="defAuthorizeDialog"
      @onConfirm="authorizeConfirm"
    ></def-authorize-dialog>
    <!-- 授权查询  -->
    <def-authorize-page-dialog
      ref="defAuthorizePageDialog"
      name="defAuthorizePageDialog"
    ></def-authorize-page-dialog>
  </div>
</template>
<script>
import request from "@/request.js";
const defAuthorizeDialog = () => import("@/components/dialog/DefAuthorizeDialog.vue");
const defAuthorizePageDialog = () => import("@/components/dialog/DefAuthorizePageDialog.vue");

export default {
  components: {
    defAuthorizeDialog,
    defAuthorizePageDialog
  },
  computed: {},
  data() {
    return {
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
    };
  },
  mounted() {
    this.$validator = this.$root.$validator;
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    showDialog(row) {
      this.$refs.defAuthorizeDialog.showDialog(row?row.id:'');
    },
    loadData(param, cb) {
      request
        .post("${bpmModel}/flow/defAuthorize/v1/listJson", param)
        .then(response => {
          this.data = response.data.rows;
          this.pageResult = {
            page: response.data.page,
            pageSize: response.data.pageSize,
            total: response.data.total
          };
        })
        .finally(() => cb());
    },
    handleCommand(params) {
      switch (params.command) {
        case "edit":
          this.showDialog(params.row);
          break;
        default:
          break;
      }
    },
    authorizeConfirm(load){
      if(load){
        this.$refs.htTable.load();
      }
    },
    showAuthPageDialog(){
      this.$refs.defAuthorizePageDialog.showDialog();
    },
  }
};
</script>
<style lang="scss" scoped>
div[aria-invalid="true"] >>> .el-input__inner,
div[aria-invalid="true"] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
/deep/.el-dialog.authorization-dialog-wrap{
  // /deep/.el-dialog__body{
  //         height: 500px;
  //         overflow-y: scroll;
  //       }
}
</style>
