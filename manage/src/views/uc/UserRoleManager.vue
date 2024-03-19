<template>
  <ht-sidebar-dialog
    title="分配角色用户"
    :visible="dialogVisible"
    width="1040px"
    :before-close="handleClose"
    :close-on-click-modal="false"
     append-to-body
  >
    <ht-table
       v-if="dialogVisible"
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      :show-export="false"
      :show-custom-column="false"
      :quick-search-props="[{prop: 'u.fullname_', label: '姓名'},{prop: 'u.account_', label: '账号'}]"
      ref="userRoleTable"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="showUserDialog()" icon="el-icon-plus">加入用户</el-button>
          <ht-delete-button
            :url="roleDeleteUrl"
            :htTable="$refs.userRoleTable"
            pk="account"
            parameter="accounts"
          >删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="id" label="主键" :sortable="true" hidden />
        <ht-table-column
          prop="fullname"
          label="用户名称"
          width="300"
          :sortable="true"
          :show-overflow-tooltip="true"
        />
        <ht-table-column prop="account" label="账号" :sortable="true" />
        <ht-table-column prop="email" label="邮箱" />
        <ht-table-column prop="mobile" label="手机号码" />
      </template>
    </ht-table>
    <eip-user-dialog ref="eipUserDialog" @onConfirm="userDialogOnConfirm" append-to-body />
  </ht-sidebar-dialog>
</template>
<script>
import uc from "@/api/uc.js";
import EipUserDialog from "@/components/dialog/EipUserDialog.vue";

export default {
  props: {
  },
  components: {
    EipUserDialog
  },
  computed: {
    roleDeleteUrl: function() {
      return `${window.context.uc}/api/role/v1/roleUser/deleteUserRole?code=${this.roleCode}`;
    }
  },
  data() {
    return {
      dialogVisible: false,
      isSubmit: true,
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      roleCode:""
    };
  },
  watch: {
  },
  created() {},
  methods: {
    handleClose() {
      this.dialogVisible = false;
    },
    showDialog(roleCode) {
      this.roleCode = roleCode;
      this.dialogVisible = true;
    },
    dialogCancle() {
      this.dialogVisible = false;
    },
    loadData(param, cb) {
      uc.getRoleUsers(this.roleCode, param)
        .then(response => {
          this.data = response.rows;
          this.pageResult = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total
          };
        })
        .finally(() => cb());
    },
    showUserDialog() {
      this.$refs.eipUserDialog.showDialog();
    },
    userDialogOnConfirm(selection) {
      if (!selection || selection.length == 0) {
        this.$message.error("请至少选择一个用户");
        return;
      }
      let accounts = [];
      for (let user of selection) {
        accounts.push(user.account);
      }
      let param = {};
      param.code = this.roleCode;
      param.accounts = accounts.join(",");
      uc.saveUserRole(param).then(data => {
        if (data.state) {
          this.$message({
            message: data.message,
            type: "success",
            showClose: true
          });
          this.$refs.userRoleTable.load();
          return;
        }
        this.$message.error(data.message||"分配用户失败");
      });
    }
  }
};
</script>
<style scoped>
div[aria-invalid="true"] >>> .el-input__inner,
div[aria-invalid="true"] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
</style>
