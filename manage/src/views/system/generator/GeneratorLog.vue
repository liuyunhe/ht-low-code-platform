<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      quick-search-props="tableOrForm,ip"
      :show-export="false"
      :show-custom-column="false"
      ref="htTable"
      @row-click="rowClick"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <ht-delete-button url="${form}/formCodegenLog/v1/" :htTable="$refs.htTable">删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column
          prop="tableOrForm"
          label="名称"
          :sortable="true"
          :show-overflow-tooltip="true"
        >
          <template v-slot="{row}">
            <el-link type="primary" @click="showDialog(row.id)" title="查看详情">{{row.tableOrForm}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column
          prop="type"
          label="生成类型"
          :filters="[{text: '表单', value: 'form'}, {text: '物理表', value: 'table'}]"
        >
          <template v-slot="{row}">
            <el-tag type="primary" v-if="row.type=='form'">表单</el-tag>
            <el-tag type="warning" v-else-if="row.type=='table'">物理表</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column prop="ip" label="操作IP" :sortable="true" :show-overflow-tooltip="true"></ht-table-column>
        <ht-table-column
          prop="createTime"
          label="操作时间"
          :sortable="true"
          :show-overflow-tooltip="true"
        ></ht-table-column>
      </template>
    </ht-table>
    <ht-sidebar-dialog
      width="28%"
      title="代码生成日志"
      class="sp-manager__dialog"
      :visible="dialogVisible"
      :before-close="beforeCloseDialog"
    >
      <el-form v-form data-vv-scope="FormCodegenLogForm">
        <ht-form-item label="生成类型">
          <el-tag type="primary" v-if="FormCodegenLog.type=='form'">表单</el-tag>
          <el-tag type="warning" v-else-if="FormCodegenLog.type=='table'">物理表</el-tag>
        </ht-form-item>
        <ht-form-item label="名称">{{FormCodegenLog.tableOrForm}}</ht-form-item>
        <ht-form-item label="生成参数">
          <ht-input
            type="textarea"
            v-model="FormCodegenLog.opeContent"
            :rows="10"
            :readonly="true"
          />
        </ht-form-item>
        <ht-form-item label="操作IP">{{FormCodegenLog.ip}}</ht-form-item>
        <ht-form-item label="操作人">{{FormCodegenLog.createBy}}</ht-form-item>
        <ht-form-item label="操作时间">{{FormCodegenLog.createTime}}</ht-form-item>
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
      FormCodegenLog: {}
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
        this.$http.get("${form}/formCodegenLog/v1/" + id).then(
          resp => {
            this.FormCodegenLog = resp.data;
            this.dialogVisible = true;
          },
          error => {
            reject(error);
          }
        );
      }
    },
    beforeCloseDialog() {
      this.FormCodegenLog = {};
      this.dialogVisible = false;
    },
    loadData(param, cb) {
      this.$http
        .post("${form}/formCodegenLog/v1/query", param)
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
    }
  }
};
</script>

<style lang="scss" scoped>
.sp-manager__dialog /deep/ > .el-dialog > .el-dialog__body {
  height: calc(100% - 170px);
}
</style>
