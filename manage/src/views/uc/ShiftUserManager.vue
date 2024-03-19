<template>
  <ht-sidebar-dialog
      width="40%"
      :title="title"
      :visible="dialogVisible"
      :before-close="handleClose"
      class="add__user-dialog"
      :append-to-body="true">
    <ht-table
        @load="loadData"
        :data="data"
        :pageResult="pageResult"
        :selection="true"
        :show-export="false"
        :show-custom-column="false"
        ref="htTable"
        v-if="dialogVisible">
      <template v-slot:toolbar>
        <el-button size="small" @click="showUserDialog()" icon="el-icon-plus">加入用户</el-button>
        <ht-delete-button
            :url="deleteUrl"
            :htTable="$refs.htTable"
            pk="id"
            parameter="ids"
        >删除</ht-delete-button>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="id" label="主键" :sortable="true" hidden />
        <ht-table-column prop="fullname" label="用户名称" width="300" :sortable="true" :show-overflow-tooltip="true"/>
        <ht-table-column prop="account" label="账号" :sortable="true" />
        <ht-table-column prop="email" label="邮箱" />
        <ht-table-column prop="mobile" label="手机号码" />
      </template>
    </ht-table>
    <eip-user-dialog
        ref="eipUserDialog"
        @onConfirm="confirm"
        append-to-body/>
  </ht-sidebar-dialog>
</template>

<script>
  import uc from "@/api/uc.js"
  import EipUserDialog from "../../components/dialog/EipUserDialog";
  export default {
    name: "shift-user-manager",
    components: {
      EipUserDialog
    },
    data(){
      return {
        title: "添加用户",
        dialogVisible: false,
        data: [],
        pageResult: {
          page: 1,
          pageSize: 10,
          total: 0
        },
        deleteUrl: window.context.uc + "/uc/shiftRule/v1/removeShiftUser",
        selectId: ""
      }
    },
    methods: {
      loadData(param, cb){
        if (!param.querys){
          param.querys = [];
        }
        param.querys.push({
          property: "su.shift_id_",
          value: this.selectId,
          group: "common",
          relation: "AND",
          operation: "EQUAL"
        })
        uc.getShiftUsers(param).then(data => {
          this.data = data.rows;
          this.pageResult = {
            page: data.page,
            pageSize: data.pageSize,
            total: data.total
          }
        }).finally(() => {
          cb && cb();
        })
      },
      handleClose(){
        this.dialogVisible = false;
      },
      showUserDialog(){
        this.$refs.eipUserDialog.showDialog();
      },
      openDialog(id){
        this.dialogVisible = true;
        this.selectId = id;
      },
      confirm(selection){
        if (!selection || selection.length == 0) {
          this.$message.error("请至少选择一个用户");
          return;
        }
        let shiftUser = [];
        selection.forEach(item => {
          shiftUser.push({
            userId: item.id,
            shiftId: this.selectId
          })
        })
        uc.saveShiftUser(shiftUser).then(data => {
          if (data.state){
            this.$message({type:'success',message:"添加成功"});
            this.$refs.htTable.load();
          }
        });
      }
    }
  }
</script>

<style lang="scss" scoped>
.add__user-dialog{
  /deep/ .el-dialog{
    margin-top: 0 !important;
  }
}
</style>
