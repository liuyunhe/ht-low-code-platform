<template>
  <div class="fullheight">
    <ht-table
        @load="loadData"
        :data="data"
        :pageResult="pageResult"
        :selection="true"
        :show-export="false"
        :show-custom-column="false"
        quick-search-props="name,alias"
        ref="table"
        @row-click="rowClick"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="edit()" icon="el-icon-plus">添加</el-button>
          <el-button size="small" @click="importDialogVisible = true;" icon="el-icon-back">导入</el-button>
          <el-button size="small" @click="handleExport" icon="el-icon-right">导出</el-button>
          <ht-delete-button
              style="margin:0;"
              :url="deleteUrl"
              :htTable="$refs.table">删除
          </ht-delete-button>
        </el-button-group>
      </template>
      <ht-table-column
          prop="name"
          label="名称"
          :sortable="true"
          :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <el-link type="primary"  @click="edit(scope.row.id)" title="查看详情" >{{scope.row.name}}</el-link>
        </template>
      </ht-table-column>
      <ht-table-column
          prop="type"
          label="是否已发布"
          :filters="[
            { text: '否', value: '0' },
            { text: '是', value: '1' }
          ]">
        <template v-slot="{ row }">
          <el-tag type="danger" v-if="row.type === '0'">否</el-tag>
          <el-tag type="success" v-if="row.type === '1'">是</el-tag>
        </template>
      </ht-table-column>
    </ht-table>
    <report-setting ref="reportSetting" @after-save="afterSave"/>
    <flowChartEdit ref="flowChartEdit" @save-report="saveReport"/>
    <el-dialog
      title="导入流程图表"
      :visible.sync="importDialogVisible"
      width="40%"
      top="30vh"
      :close-on-click-modal="false"
      v-if="importDialogVisible">
      <div style="height:150px;padding-left: 20px ;">
        <el-upload
          style="display: inline-block;"
          :action="uploadUrl"
          :on-success="handleUploadResult"
          :on-error="handleUploadResult"
          :headers="uploadHeaders"
          :on-exceed="onExceed"
          accept=".zip"
          :before-upload="beforeUpload"
          :limit="1"
          :auto-upload="false"
          ref="upload">
          <el-button size="small" icon="el-icon-upload">选择流程图表</el-button>
        </el-upload>
      </div>
      <span slot="footer" class="dialog-footer">
            <el-button
              type="primary"
              @click="uploadSubmit"
              element-loading-text="导入中..."
              v-loading.fullscreen.lock="fullscreenLoading">确 定</el-button>
            <el-button @click="importDialogVisible = false">取 消</el-button>
          </span>
    </el-dialog>
  </div>
</template>

<script>
  import flow from "@/api/flow.js";
  import req from "@/request";
  import { mapState } from "vuex";
  const flowChartEdit = () => import("@/components/form/chart/FlowChartEdit.vue");
  const reportSetting = () => import("@/components/form/chart/ReportSetting.vue");
  export default {
    components:{
      flowChartEdit,
      reportSetting
    },
    data(){
      return {
        data:[],
        pageResult:{
          page:0,
          pageSize:50,
          total:0
        },
        selectedId:"",
        deleteUrl:window.context.bpmRunTime+"/runtime/report/v1/removeList",
        importDialogVisible: false,
        uploadUrl: window.context.bpmRunTime + "/runtime/report/v1/import",
        fullscreenLoading: false,
      }
    },
    computed: mapState({
      uploadHeaders: function(mapState) {
        return { Authorization: "Bearer " + mapState.login.currentUser.token };
      },
    }),
    methods:{
      rowClick(row, column, event){
        this.$refs.table.$refs.htTable.toggleRowSelection(row);
      },
      loadData(param,cb){
        flow
          .getFlowChartList(param)
          .then(response=>{
            this.pageResult = {
              page:response.page,
              pageSize: response.pageSize,
              total: response.total
            };
            this.data = response.rows;
          })
          .finally(()=>{
            cb();
          })
      },
      edit(id){
        if (id){
          this.$refs.flowChartEdit.handleOpen(id);
        }else{
          this.$refs.reportSetting.handleOpen();
        }
      },
      saveReport(){
        this.$refs.table.load();
      },
      afterSave(){
        this.$refs.table.load();
      },
      handleExport() {
        let selection = this.$refs.table.$refs.htTable.selection;
        if (selection && selection.length === 0) {
          this.$message.warning("请选择至少一项记录");
          return;
        }
        let ids = selection.map(item => item.id);
        let url = `${window.context.bpmRunTime}/runtime/report/v1/exportXml?ids=${ids}`;
        req.download(url);
      },
      handleUploadResult(data) {
        if (data.state) {
          if (data.message.includes("已存在故跳过")) {
            this.$message({ type: "warning", message: data.message, showClose: true, duration: 5000, dangerouslyUseHTMLString: true });
          } else {
            this.$message({ type: "success", message: "导入成功" });
          }
        } else {
          this.$message({ type: "error", message: data.message });
        }
        this.importDialogVisible = false;
        this.fullscreenLoading = false;
        this.$refs.table.querys = [];
        this.$refs.table.load();
      },
      beforeUpload(file) {
        if (!file.name.endsWith(".zip")) {
          this.$message.warning("只能导入zip文件!");
          return false;
        }
        this.fullscreenLoading = true;
      },
      onExceed(file) {
        this.$message.warning("只能选择一个zip文件!");
      },
      uploadSubmit() {
        if (
          !this.$refs.upload.uploadFiles ||
          this.$refs.upload.uploadFiles.length === 0
        ) {
          this.$message.warning("请选择要导入的流程图表!");
          return false;
        }
        this.$refs.upload.submit();
      }
    }
  }
</script>

<style scoped>

</style>
