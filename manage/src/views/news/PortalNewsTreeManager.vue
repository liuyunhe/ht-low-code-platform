<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      quick-search-props="id"
      :show-export="false"
      :show-custom-column="false"
      ref="htTable"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="showDialog()" icon="el-icon-plus">添加</el-button>
          <ht-delete-button url="${portal}/portalNewsTree/v1/" :htTable="$refs.htTable">删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column
          prop="id"
          label="主键"
          :sortable="true"
          :show-overflow-tooltip="true"
        >
          <template v-slot="{row}">
            <el-link
              type="primary"
              @click="showDialog(row.id)"
              title="查看详情"
            >{{row.id}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column
          prop="name"
          label="名称"
          :sortable="true"
          :show-overflow-tooltip="true"
        >
        </ht-table-column>
        <ht-table-column
          prop="path"
          label="路径"
          :sortable="true"
          :show-overflow-tooltip="true"
        >
        </ht-table-column>
        <ht-table-column
          prop="parentId"
          label="上级id"
          :sortable="true"
          :show-overflow-tooltip="true"
        >
        </ht-table-column>
        <ht-table-column
          prop="rank"
          label="级别(总共有3级)"
          :sortable="true"
          :show-overflow-tooltip="true"
        >
        </ht-table-column>
        <ht-table-column
          prop="sn"
          label="排序"
          :sortable="true"
          :show-overflow-tooltip="true"
        >
        </ht-table-column>
        <ht-table-column
          prop="parentName"
          label="路径名称"
          :sortable="true"
          :show-overflow-tooltip="true"
        >
        </ht-table-column>
        <ht-table-column
          prop="tenantId"
          label="租户ID"
          :sortable="true"
          :show-overflow-tooltip="true"
        >
        </ht-table-column>
        <ht-table-column
          prop="createTime"
          label="创建时间"
          :sortable="true"
          :show-overflow-tooltip="true"
        >
        </ht-table-column>
        <ht-table-column
          prop="createBy"
          label="创建人"
          :sortable="true"
          :show-overflow-tooltip="true"
        >
        </ht-table-column>
        <ht-table-column
          prop="updateTime"
          label="更新时间"
          :sortable="true"
          :show-overflow-tooltip="true"
        >
        </ht-table-column>
        <ht-table-column
          prop="updateBy"
          label="更新人"
          :sortable="true"
          :show-overflow-tooltip="true"
        >
        </ht-table-column>
      </template>
    </ht-table>
    <ht-sidebar-dialog
      width="28%"
      title="实体信息"
      class="sp-manager__dialog"
      :visible="dialogVisible"
      :before-close="beforeCloseDialog"
    >
      <el-form v-form data-vv-scope="PortalNewsTreeForm">
        <ht-form-item label="主键">
          <ht-input v-model="PortalNewsTree.id" validate="required" />
        </ht-form-item>
        <ht-form-item label="名称">
          <ht-input v-model="PortalNewsTree.name" validate="required" />
        </ht-form-item>
        <ht-form-item label="路径">
          <ht-input v-model="PortalNewsTree.path" validate="required" />
        </ht-form-item>
        <ht-form-item label="上级id">
          <ht-input v-model="PortalNewsTree.parentId" validate="required" />
        </ht-form-item>
        <ht-form-item label="级别(总共有3级)">
          <ht-input v-model="PortalNewsTree.rank" validate="required" />
        </ht-form-item>
        <ht-form-item label="排序">
          <ht-input v-model="PortalNewsTree.sn" validate="required" />
        </ht-form-item>
        <ht-form-item label="路径名称">
          <ht-input v-model="PortalNewsTree.parentName" validate="required" />
        </ht-form-item>
        <ht-form-item label="租户ID">
          <ht-input v-model="PortalNewsTree.tenantId" validate="required" />
        </ht-form-item>
        <ht-form-item label="创建时间">
          <ht-input v-model="PortalNewsTree.createTime" validate="required" />
        </ht-form-item>
        <ht-form-item label="创建人">
          <ht-input v-model="PortalNewsTree.createBy" validate="required" />
        </ht-form-item>
        <ht-form-item label="更新时间">
          <ht-input v-model="PortalNewsTree.updateTime" validate="required" />
        </ht-form-item>
        <ht-form-item label="更新人">
          <ht-input v-model="PortalNewsTree.updateBy" validate="required" />
        </ht-form-item>
      </el-form>
      <div slot="footer" style="text-align: center">
        <ht-submit-button
          url="${portal}/portalNewsTree/v1/"
          :model="PortalNewsTree"
          :request-method="saveMethod"
          scope-name="PortalNewsTreeForm"
          @after-save-data="afterSaveData"
        >{{$t("eip.common.save")}}</ht-submit-button>
        <el-button @click="beforeCloseDialog">{{$t("eip.common.cancel")}}</el-button>
      </div>
    </ht-sidebar-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      dialogVisible: false,
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      PortalNewsTree: {},
      saveMethod: "POST"
    };
  },
  mounted() {
    this.$validator = this.$root.$validator;
  },
  methods: {
    showDialog(id) {
      if (id) {
        this.saveMethod = "PUT";
        this.$http.get("${portal}/portalNewsTree/v1/" + id).then(
          resp => {
            this.PortalNewsTree = resp.data;
            this.dialogVisible = true;
          },
          error => {
            reject(error);
          }
        );
      } else {
        this.saveMethod = "POST";
        this.dialogVisible = true;
      }
    },
    beforeCloseDialog() {
      this.PortalNewsTree = {};
      this.dialogVisible = false;
    },
    loadData(param, cb) {
      this.$http
        .post("${portal}/portalNewsTree/v1/query", param)
        .then(
          resp => {
            let response = resp.data;
            this.data = response.rows;
            this.pageResult = {
              page: response.page,
              pageSize: response.pageSize,
              total: response.total
            };
          },
          error => {
            reject(error);
          }
        )
        .finally(() => cb());
    },
    afterSaveData() {
      setTimeout(() => {
        this.beforeCloseDialog();
        this.$refs.htTable.load();
      }, 500);
    }
  }
};
</script>

<style lang="scss" scoped>
.sp-manager__dialog /deep/ > .el-dialog > .el-dialog__body {
  height: calc(100% - 170px);
}
</style>
