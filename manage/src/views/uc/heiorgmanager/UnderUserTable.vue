<template>
  <el-dialog
          title="下属管理"
          :visible="dialogVisible"
          width="60%"
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
            :quick-search-props="[{prop: 'u.fullname_', label: '姓名'}]"
            :default-querys="[{property:'USER_ID_',value:this.orgUserId}]"
            ref="userRoleTable"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="showUserDialog()" icon="el-icon-plus">添加下属</el-button>
          <ht-delete-button
                  :url="roleDeleteUrl"
                  :htTable="$refs.userRoleTable"
                  pk="id"
                  parameter="ids"
          >删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="id" label="主键" :sortable="true" hidden />
        <ht-table-column
                prop="underUserName"
                label="下属姓名"
                width="300"
                :sortable="true"
                :show-overflow-tooltip="true"
        />
        <ht-table-column prop="createTime" label="创建时间" />
      </template>
    </ht-table>
    <eip-user-dialog ref="eipUserDialog" @onConfirm="addUnderUser" append-to-body />
  </el-dialog>
</template>
<script>
  import orgrequest from "@/api/org.js";
  import EipUserDialog from "@/components/dialog/EipUserDialog.vue";

  export default {
    name:'under-user-table',
    props:{
      userId: String,
      orgId:{
        type:String,
        default:""
      }
    },
    components: {
      EipUserDialog
    },
    computed: {
      roleDeleteUrl: function() {
        return `${window.context.uc}/api/org/v1/userUnder/delUnderUserByIds`;
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
        roleCode:"",
        orgUserId: ""
      };
    },
    watch: {
    },
    created() {},
    methods: {
      handleClose() {
        this.dialogVisible = false;
      },
      showDialog(orgUserId) {
        this.orgUserId = orgUserId
        this.dialogVisible = true;
      },
      dialogCancle() {
        this.dialogVisible = false;
      },
      loadData(param, cb) {
        if (this.orgId){
          param.querys.push({
            property: "ORG_ID_",
            value: this.orgId,
            group:"main",
            relation: "AND",
            operation: "EQUAL"
          })
        }
        orgrequest.getUserUndersPage(param)
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
      addUnderUser(selection) {
        if (!selection || selection.length == 0) {
          this.$message.error("请至少选择一个用户");
          return;
        }
        let accounts = [];
        for (let user of selection) {
          accounts.push(user.account);
        }
        let param = {};
        param.orgId = this.orgId;
        param.account=this.userId
        param.underAccounts = accounts.join(",");
        orgrequest.setUnderUsers(param).then(data => {
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
