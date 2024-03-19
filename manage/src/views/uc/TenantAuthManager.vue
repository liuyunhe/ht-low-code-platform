<template>
  <ht-sidebar-dialog
    title="分配租户管理员"
    :visible="dialogVisible"
    width="1040px"
    :before-close="handleClose"
    close-on-click-modal
  >
    <ht-table
       v-if="dialogVisible"
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      :show-export="false"
      :show-custom-column="false"
      :default-querys="defualtQuerys"
      :quick-search-props="[{prop: 'u.fullname_', label: '姓名'},{prop: 'u.account_', label: '账号'}]"
      ref="tenantAuthTable"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="showUserDialog()" icon="el-icon-plus">加入用户</el-button>
          <ht-delete-button
            :url="roleDeleteUrl"
            :htTable="$refs.tenantAuthTable"
            pk="userId"
            parameter="userIds"
            :ignore-tenant="true"
          >删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="id" label="主键" :sortable="true" hidden />
        <ht-table-column
          prop="userName"
          label="用户名称"
          width="300"
          :sortable="true"
          :show-overflow-tooltip="true"
        />
        <ht-table-column prop="account" label="账号" :sortable="true" />
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
      return `${window.context.uc}/uc/tenantAuth/v1/deleteTenantAuth?typeId=${this.tenantTypeId}&tenantId=${this.tenantId}`;
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
      defualtQuerys:[],
      tenantTypeId:"",
      tenantId:""
    };
  },
  watch: {
  },
  created() {},
  methods: {
    handleClose() {
      this.dialogVisible = false;
    },
    showDialog(tenantTypeId,tenantId) {
      this.$store.dispatch("tenant/actionTenantId", null);
      this.defualtQuerys = [];
      this.tenantTypeId = tenantTypeId;
      this.defualtQuerys.push({property:'auth.TYPE_ID_',value: tenantTypeId});
      if(tenantId){
         this.tenantId = tenantId;
         this.defualtQuerys.push({property:'auth.TENANT_ID_',value: tenantId});
      }else{
         this.defualtQuerys.push({property:'auth.TENANT_ID_',value: ''});
      }
      this.dialogVisible = true;
    },
    dialogCancle() {
      this.dialogVisible = false;
    },
    loadData(param, cb) {
      this.$http.post("${uc}/uc/tenantAuth/v1/queryByTypeOrTenant", param).then(resp => {
            let response = resp.data;
            this.data = response.rows;
            this.pageResult = {
              page: response.page,
              pageSize: response.pageSize,
              total: response.total
            };
        }, error => {
            reject(error);
        }).finally(() => cb());
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
      param.typeId = this.tenantTypeId;
      param.tenantId = this.tenantId;
      param.accounts = accounts.join(",");
     this.$http.post("${uc}/uc/tenantAuth/v1/saveTenantAuth",param).then(result => {
        if (result.data.state) {
          this.$message({
            message: result.data.message,
            type: "success",
            showClose: true
          });
          this.$refs.tenantAuthTable.load();
          return;
        }
        this.$message.error(result.data.message||"设置管理员失败");
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