<template>
  <el-dialog
    title="岗位人员"
    :visible="dialogVisible"
    width="80%"
    :before-close="handleClose"
    @select-all="selectUser"
    close-on-click-modal
    :append-to-body="true"
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
      :default-querys="[{property:'POS_ID_',value:this.postId}]"
      ref="userTable"
      @select-all="selectUser"
      @select="selectUser"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="showUserDialog()" icon="el-icon-plus">添加用户</el-button>
          <el-button size="small" @click="setMaster()">设置主组织</el-button>
          <ht-delete-button :url="DeleteUrl" :htTable="$refs.userTable" pk="orgUserId">删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="id" label="主键" :sortable="true" hidden />
        <ht-table-column
          prop="u.fullName_"
          label="用户名称"
          width="300"
          :sortable="true"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            {{scope.row.fullName}}
          </template>
        </ht-table-column>
        <ht-table-column prop="account" label="账号" />
        <ht-table-column
          prop="isMaster"
          label="主组织"
          width="100"
          :filters="[{text:'否', value:'0'},{text:'是', value:'1'}]"
        >
          <template v-slot="{row}">
            <el-tag type="danger" v-if="row.isMaster=='0'">否</el-tag>
            <el-tag v-if="row.isMaster=='1'">是</el-tag>
          </template>
        </ht-table-column>
      </template>
    </ht-table>
    <eip-user-dialog ref="eipUserDialog" @onConfirm="addUnderUser" append-to-body />
  </el-dialog>
</template>
<script>
import orgrequest from "@/api/org.js";
import EipUserDialog from "@/components/dialog/EipUserDialog.vue";

export default {
  name: "under-user-table",
  components: {
    EipUserDialog
  },
  computed: {
    DeleteUrl: function() {
      return `${window.context.uc}/api/org/v1/orgUser/delOrgUser`;
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
      roleCode: "",
      postCode: "",
      postId: "",
      selectUsers: []
    };
  },
  watch: {},
  created() {},
  methods: {
    handleClose() {
      this.dialogVisible = false;
    },
    showDialog(postId, postCode) {
      this.postId = postId;
      this.postCode = postCode;
      this.dialogVisible = true;
    },
    dialogCancle() {
      this.dialogVisible = false;
    },
    loadData(param, cb) {
      orgrequest
        .getOrgUserPage(param)
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
      var param = { postCode: "", accounts: [] };
      param.postCode = this.postCode;
      param.accounts = accounts.join(",");
      orgrequest.saveUserPost(param).then(data => {
        if (data.state) {
          this.$message({
            message: data.message,
            type: "success",
            showClose: true
          });
          this.$refs.userTable.load();
          return;
        }
        // this.$message.error(data.message || "分配用户失败");
      });
    },
    selectUser(selection) {
      this.selectUsers = selection;
    },
    setMaster(){
      if(this.selectUsers.length == 0){
        this.$message({message:'请选择人员', type:'warning'});
        return;
      }
      let ids = [];
      this.selectUsers.forEach(item =>{
        ids.push(item.orgUserId);
      })
      orgrequest.setMasterById(ids).then(resp =>{
        if(resp.state) {
          this.$message({message:resp.message, type:'success'});
          this.selectUsers = [];
          this.$refs.userTable.load();
        }
      })
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
