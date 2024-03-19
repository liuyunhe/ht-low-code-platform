<template>
  <div>
    <ht-sidebar-dialog title="角色接口授权" :visible="dialogVisible" :before-close="handleClose"  append-to-body>
      <ht-table
        v-if="dialogVisible"
        @load="loadMethodData"
        :data="data"
        :pageResult="pageResult"
        :selection="true"
        :default-sorter="[{direction: 'DESC',property: 'method.id_'}]"
        :default-querys="[{property:'ROLE_ALIAS_',value:roleAlias}]"
        :quick-search-props="[{prop: 'method.name_', label: '名称'},{prop: 'method.request_url_', label: '请求地址'}]"
        ref="htTable"
        :show-custom-column="false"
        :show-export="false"
      >
        <template v-slot:toolbar>
          <el-button-group>
            <el-button size="small" icon="el-icon-plus" @click="showMethodDialog">添加</el-button>
            <ht-delete-button
              :url="'${portal}/sys/sysRoleAuth/v1/removeRoleMethods?roleAlias='+roleAlias"
              pk="alias"
              parameter="methodAlias"
              :htTable="$refs.htTable"
            >删除</ht-delete-button>
          </el-button-group>
        </template>
        <template>
          <ht-table-column type="index" width="50" align="center" label="序号" />
          <ht-table-column prop="id" label="主键" :sortable="true" hidden />
          <ht-table-column prop="name" label="名称" :sortable="true" :show-overflow-tooltip="true"></ht-table-column>
          <ht-table-column prop="alias" label="别名" :sortable="true" />
          <ht-table-column prop="requestUrl" label="请求地址" :sortable="true" />
        </template>
      </ht-table>
    </ht-sidebar-dialog>
    <!-- 后台接口选择对话框  -->
    <eip-method-dialog
      ref="eipMethodDialog"
      name="eipMethodDialog"
      :role-alias="roleAlias"
      @onConfirm="dialogOnConfirm"
      append-to-body
    />
  </div>
</template>

<script>
const eipMethodDialog = () => import("@/components/dialog/EipMethodDialog.vue");

export default {
  name: "RoleMethodAuth",
  components: {
    eipMethodDialog
  },
  props: {},
  data() {
    return {
      dialogVisible: false,
      roleMenusMethod: null,
      defaultCheckedKeys: [],
      saveData: {},
      roleAlias: null,
      data: [],
      pageResult: {
        page: 1,
        pageSize: 100,
        total: 0
      }
    };
  },
  methods: {
    showMethodDialog() {
      this.$refs.eipMethodDialog.showDialog();
    },
    showDialog(roleAlias) {
      this.dialogVisible = true;
      this.roleAlias = roleAlias;
    },
    handleClose() {
      this.dialogVisible = false;
    },
    loadMethodData(params, cb) {
      this.$http
        .post(
          "${portal}" +
            `/sys/sysMethod/v1/getRoleMethods?roleAlias=${this.roleAlias}`,
          params
        )
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
    beforeSaveData() {
      // saveData = {roleAlias:"",arrMenuAlias:[],arrMethodAlias:[],dataPermission:{}}
      var elTree = this.$refs.htMenuManager.$refs.htMenuTree.$refs.htMenuTree
        .$refs.elTree;
      this.saveData = {
        roleAlias: this.roleAlias,
        arrMenuAlias: [
          ...elTree.getHalfCheckedKeys(),
          ...elTree.getCheckedKeys()
        ],
        arrMethodAlias: [],
        dataPermission: {}
      };
    },
    afterSaveData() {
      this.handleClose();
    },
    dialogOnConfirm(methods) {
      if (methods.length) {
        this.$http
          .post("${portal}/sys/sysRoleAuth/v1/saveRoleMethods", {
            roleAlias: this.roleAlias,
            arrMethodAlias: methods.extractByKey("alias"),
            dataPermission: {}
          })
          .then(response => {
            if (response.data.state) {
              this.$refs.htTable.load();
              this.$message({
                type: "success",
                message: response.data.message
              });
            }
          });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
>>> .el-dialog__body {
  padding: 0px;
}
</style>
