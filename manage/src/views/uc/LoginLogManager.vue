<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      quick-search-props="name,account"
      :show-export="false"
      :show-custom-column="false"
      ref="htTable"
      @row-click="rowClick"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <ht-delete-button url="${uc}/uc/loginLog/v1/remove" :htTable="$refs.htTable">删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="name" label="用户名" :sortable="true" :show-overflow-tooltip="true">
          <template v-slot="{row}">
            <el-link type="primary" @click="showDialog(row.id)" title="查看详情">{{row.name}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column prop="account" label="用户账号" :sortable="true" :show-overflow-tooltip="true">
        </ht-table-column>
        <ht-table-column prop="ip" label="登录IP" :sortable="true" :show-overflow-tooltip="true">
        </ht-table-column>
        <ht-table-column
          prop="loginType"
          label="登录方式"
          width="110"
          :filters="[{text:'电脑端', value:'pc'},{text:'移动端', value:'mobile'}]"
        >
          <template v-slot="{row}">
            <el-tag v-if="row.loginType=='pc'">电脑端</el-tag>
            <el-tag type="info" v-if="row.loginType=='mobile'">移动端</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column prop="loginSum" label="登录次数" :sortable="true" :show-overflow-tooltip="true">
        </ht-table-column>
        <ht-table-column prop="pcSum" label="电脑端次数" :sortable="true" :show-overflow-tooltip="true">
        </ht-table-column>
        <ht-table-column prop="mobileSum" label="移动端次数" :sortable="true" :show-overflow-tooltip="true">
        </ht-table-column>
        <ht-table-column prop="createTime" label="首次登录时间" :sortable="true" :show-overflow-tooltip="true">
        </ht-table-column>
        <ht-table-column prop="updateTime" label="最后登录时间" :sortable="true" :show-overflow-tooltip="true">
            <template v-slot="{row}">
              <span v-if="row.updateTime">{{row.updateTime}}</span>
              <span v-if="!row.updateTime">{{row.createTime}}</span>
            </template>
        </ht-table-column>
      </template>
    </ht-table>
    <ht-sidebar-dialog
      width="28%"
      title="用户登录日志表"
      class="sp-manager__dialog"
      :visible="dialogVisible"
      :before-close="beforeCloseDialog"
    >
      <el-form v-form data-vv-scope="loginLogForm">
        <ht-form-item label="用户名">
          <ht-input v-model="loginLog.name" validate="required" />
        </ht-form-item>
        <ht-form-item label="用户账号">
          <ht-input v-model="loginLog.account" validate="required" />
        </ht-form-item>
        <ht-form-item label="登录IP">
          <ht-input v-model="loginLog.ip" validate="required" />
        </ht-form-item>
        <ht-form-item label="登录方式">
          <ht-input v-model="loginLog.loginType" validate="required" />
        </ht-form-item>
        <ht-form-item label="登录次数">
          <ht-input v-model="loginLog.loginSum" validate="required" />
        </ht-form-item>
        <ht-form-item label="电脑端次数">
          <ht-input v-model="loginLog.pcSum" validate="required" />
        </ht-form-item>
        <ht-form-item label="移动端次数">
          <ht-input v-model="loginLog.mobileSum" validate="required" />
        </ht-form-item>
        <ht-form-item label="首次登录时间">
          <ht-input v-model="loginLog.createTime" validate="required" />
        </ht-form-item>
        <ht-form-item label="最后登录时间">
          <ht-input v-model="loginLog.updateTime" validate="required" />
        </ht-form-item>
      </el-form>
      <div slot="footer" style="text-align: center">
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
      loginLog: {}
    };
  },
  mounted() {
    this.$validator = this.$root.$validator;
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    showDialog(id) {
      if (id) {
    	  this.$http.get("${uc}/uc/loginLog/v1/getJson?id="+`${id}`).then(resp => {
              this.loginLog = resp.data;
              this.dialogVisible = true;
          }, error => {
              reject(error);
          })
      } else {
        this.dialogVisible = true;
      }
    },
    beforeCloseDialog() {
      this.loginLog = {  };
      this.dialogVisible = false;
    },
    loadData(param, cb) {
    	this.$http.post("${uc}/uc/loginLog/v1/listJson", param).then(resp => {
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
