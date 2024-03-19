<template>
  <el-dialog
      title="下属管理"
      :visible="dialogVisible"
      width="60%"
      :before-close="handleClose"
      close-on-click-modal
      :append-to-body="true"
  >
    <el-form :inline="true" v-if="dimId?false:true">
      <ht-form-item label="维度">
        <ht-select
            :options="demList"
            :props="{key: 'id',value: 'demName'}"
            v-model="demId"
            @change="change(true)"/>
      </ht-form-item>
      <ht-form-item label="上级">
        {{superior || "无"}}
      </ht-form-item>
    </el-form>
    <ht-table
        v-if="dialogVisible"
        @load="loadData"
        :data="data"
        :pageResult="pageResult"
        :selection="true"
        :show-export="false"
        :show-custom-column="false"
        :quick-search-props="[{prop: 'UNDER_USER_NAME_', label: '姓名'}]"
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
  import uc from "@/api/uc.js";
  import EipUserDialog from "@/components/dialog/EipUserDialog.vue";

  export default {
    name:'under-user-table',
    props: {
      userId: String,
      orgId: {
        type: String,
        default: ""
      },
      demList: {
        type: Array,
        default: () => {
          return [];
        }
      },
      dimId: {
        type: String,
        default: ""
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
        demId:"",
        orgUserId: "",
        superior:""
      };
    },
    watch: {
    },
    methods: {
      handleClose() {
        this.dialogVisible = false;
      },
      showDialog(orgUserId) {
        this.orgUserId = orgUserId
        this.dialogVisible = true;
        this.demId = this.dimId;
        this.demList.forEach(item => {
          if (item.isDefault===1){
            this.demId = item.id;
          }
        });
        this.change(false);
      },
      dialogCancle() {
        this.dialogVisible = false;
      },
      loadData(param, cb) {
        if (this.demId){
          param.querys.push({
            property: "DIMEN_ID_",
            value: this.demId,
            group:"defaultQueryGroup",
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
        if (!this.demId){
          this.$message.error("请选择维度");
          return;
        }
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
        let param = {
          dimenId: this.demId,
          account: this.userId,
          underAccounts: accounts.join(",")
        }
        uc.setUnderUser(param).then(data => {
          if (data.state) {
            this.$message({
              message: data.message,
              type: "success",
              showClose: true
            });
          }else{
            this.$message.error(data.message||"分配用户失败");
          }
        }).finally(() => {
          this.$refs.userRoleTable.load();
        });
      },
      change(isLoad){
        uc.getSuperior(this.orgUserId,this.demId).then(data => {
          this.superior = data?data.fullname:"无";
        });
        if (isLoad)
          this.$refs.userRoleTable.load();
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
