<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      quick-search-props="id,opeName,executor,ip,reqUrl"
      :default-sorter="[{ direction: 'DESC', property: 'executionTime' }]"
      ref="htTable"
      :show-export="false"
      @row-click="rowClick"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <ht-delete-button :url="deleteUrl" :htTable="$refs.htTable" @after-delete="afterDelete">删除</ht-delete-button>
        </el-button-group>
      </template>

      <template>
        <ht-table-column type="index" width="45" align="center" label="序号" />
        <ht-table-column prop="id" width="155" align="center" label="日志编号" />
        <ht-table-column prop="opeName" label="操作名称" :sortable="true" :show-overflow-tooltip="true">
          <template v-slot="{row,column,$index}">
            <el-link
              type="primary"
              @click="handleLogShow(row.id)"
              title="查看"
            >{{row.opeName}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column prop="executionTime" label="操作时间" :sortable="true" width="140" />
        <ht-table-column prop="executor" label="操作人" width="130" />
        <ht-table-column prop="ip" label="客户端IP" width="120" />
        <ht-table-column prop="reqUrl" label="请求地址" width="180" />
        <ht-table-column prop="logType" label="日志类型" width="90" :filters="typeArray">
          <template v-slot="{row}">
            <el-tag
              v-show="row.logType==s.value"
              type="info"
              v-for="s in typeArray"
              :key="s.value"
            >{{s.text}}</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column prop="moduleType" label="模块类型" width="100" :filters="statusArray">
          <template v-slot="{row}">
            <el-tag
              v-show="row.moduleType==s.value"
              type="info"
              v-for="s in statusArray"
              :key="s.value"
            >{{s.text}}</el-tag>
          </template>
        </ht-table-column>
      </template>
    </ht-table>
    <ht-sidebar-dialog
      width="30%"
      :close-on-click-modal="false"
      :visible="logDialogVisible"
      :before-close="handleLogClose"
      :append-to-body="true"
      title="日志详情"
      class="log"
    >
      <el-button
        style="float: right;z-index: 15000;position: relative;"
        @click="logDialogVisible = false;"
        type="danger"
        icon="el-icon-refresh-left"
      >返回</el-button>
      <el-form>
        <el-form-item label="操作人">
          {{log.executor}}
        </el-form-item>
        <el-form-item label="请求地址">
          {{log.reqUrl}}
        </el-form-item>
         <el-form-item label="内容">
           <textarea :disabled="true" cols="73" rows="41" style="font-size:14px" v-model="log.opeContent"></textarea>
        </el-form-item>
      </el-form>
    </ht-sidebar-dialog>
  </div>
</template>
<script>
import req from "@/request.js";
export default {
  components: {},
  data() {
    return {
      log:{"opeName":"日志暂未消费请稍后查看","opeContent":"日志暂未消费请稍后查看"},
      logDialogVisible: false,
      defaultProps: {
        children: "children",
        label: "name"
      },
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      curRow: {},
      dialogVisible: false,
      statusArray: [
        { text: "用户微服务", value: "eip-uc" },
        { text: "portal微服务", value: "eip-portal" },
        { text: "表单微服务", value: "eip-form" },
        { text: "bpm-model微服务", value: "eip-bpm-model" },
        { text: "bpm-runtime微服务", value: "eip-bpm-runtime" },
        { text: "默认服务", value: "base" }
      ],
      typeArray: [
        { text: "操作日志", value: "操作日志" },
        { text: "登录日志", value: "登录日志" },
        { text: "异常日志", value: "异常日志" }
      ]
    };
  },
  computed: {
    deleteUrl: function() {
      return window.context.portal + "/sys/sysLogs/v1/removes";
    }
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    handleLogClose(){
      this.logDialogVisible = false;
    },
    handleLogShow(id){
      this.logDialogVisible = true;
      this.$http.get(window.context.portal+ "/sys/sysLogs/v1/get/"+id).then(res=>{
        this.log = res.data;
      });
    },
    handleClose() {
      this.dialogVisible = false;
    },
    openDetail(row) {
      this.curRow = row;
      this.dialogVisible = true;
    },
    loadData(param, cb) {
      req
        .post(window.context.portal + "/sys/sysLogs/v1/list", param)
        .then(data => {
          let response = data.data;
          this.data = response.rows;
          this.pageResult = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total
          };
        })
        .finally(() => cb());
    },
    afterDelete() {
      this.$refs.htTable.load();
    },
    reinvoke(id) {
      let this_ = this;
      req
        .post(window.context.portal + "/portal/messageLog/v1/reinvoke/" + id)
        .then(function(response) {
          let data = response.data;
          if (data.state) {
            this_.$message.success(data.message);
            this_.$refs.htTable.load();
          } else {
            this_.$message.fail(data.message);
          }
        });
    },
    signSuccess(id) {
      let this_ = this;
      req
        .post(
          window.context.portal + "/portal/messageLog/v1/signSuccess/" + id
        )
        .then(function(response) {
          let data = response.data;
          if (data.state) {
            this_.$message.success(data.message);
            this_.$refs.htTable.load();
          } else {
            this_.$message.fail(data.message);
          }
        });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";

.aside-width {
  width: $--aside-width !important;
}
</style>
