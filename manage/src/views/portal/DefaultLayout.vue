<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      @row-click="rowClick"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      quick-search-props="name,memo"
      ref="layoutTable"
      :show-export="false"
    >
          <template v-slot:toolbar>
            <el-button-group>
              <el-button size="small" icon="el-icon-upload2" @click="showImportLayout">导入</el-button>
              <el-button size="small" icon="el-icon-download" @click="exportLayout">导出</el-button>
            </el-button-group>
          </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="id" label="主键" :sortable="true" hidden />
        <ht-table-column prop="name" label="布局名称" :sortable="true" :show-overflow-tooltip="true"  >
          <template v-slot="{row}">
            <el-link @click="handleCommand({row:row,command:'edit'})" type="primary" title="点击编辑">{{row.name}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column prop="memo" label="布局描述" :sortable="true" :show-overflow-tooltip='true'/>
        <ht-table-column prop="layoutType" label="布局类型"
              :filters="[{text:'管理端',value:0},{text:'手机端',value:1},{text:'应用端',value:2}]">
          <template v-slot="{row}">
            <el-tag v-if="row.layoutType==0" type="info">管理端</el-tag>
            <el-tag v-if="row.layoutType==1" type="success">手机端</el-tag>
            <el-tag v-if="row.layoutType==2" type="warning">应用端</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column label="操作" width="150">
          <template v-slot="{row}">
            <el-button @click="handleCommand({row:row,command:'preview'})"><i class="icon icon-monitor"></i>预览</el-button>
          </template>
        </ht-table-column>
      </template>
    </ht-table>
    <el-dialog title="上传文件" :visible="uploadDialogVisible" :before-close="beforeClose" name="uploadDialog" width="40%" top="30vh" custom-class="upload-dialog">
      <el-upload :action="uploadUrl" :http-request="handleImport" accept=".zip"
      :file-list="fileList" :limit="1" :auto-upload="false" ref="elUpload" class="upload-dialog__content">
        <el-button size="small" icon="el-icon-upload">点击上传</el-button>
        <div slot="tip" class="el-upload__tip">只能上传zip文件（默认门户只能导入到默认门户）</div>
      </el-upload>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="uploadSubmit" >上传</el-button>
        <el-button type="default" @click="beforeClose">取消</el-button>
      </span>
    </el-dialog>
    <PortalDesignerDialog ref="designDialog" @close="designClose" />
    <LayoutPreviewDialog ref="previewDialog" />
  </div>
</template>
<script>
import portal from "@/api/portal.js";
import utils from "@/hotent-ui-util.js";
const PortalDesignerDialog = () => import("@/components/portal/PortalDesignerDialog.vue");
const LayoutPreviewDialog = () => import("@/views/portal/LayoutPreviewDialog.vue");
let Base64 = require('js-base64').Base64;
export default {
    components:{PortalDesignerDialog,LayoutPreviewDialog},
    data() {
    return {
      data: [],
      pageResult: {
        page: 1,
        pageSize: 30,
        total: 0
      },
      uploadDialogVisible:false,
      uploadUrl:"",
      fileList:[],
    };
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.layoutTable.$refs.htTable.toggleRowSelection(row);
    },
    loadData(param, cb) {
      portal.getDefaultLayoutManagerPage(param)
        .then(response => {
          this.data = response.rows;
          this.pageResult = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total
          };
        })
        .finally(() => cb&&cb());
    },
    designClose(val){
      this.$refs.layoutTable.load();
    },
    handleCommand(params) {
      switch (params.command) {
        case "preview":
          this.preview(params.row.id);
          break;
        case "edit":
          this.$refs.designDialog.showDialog(params.row.id,params.row.layoutType);
          break;
      }
    },
    preview(id){
      this.$refs.previewDialog.showDialog(id);
    },
    exportLayout(){
      let selection = this.$refs.layoutTable.$refs.htTable.selection;
      if(!selection || selection.length == 0){
        this.$message.warning("请至少选择一条数据");
        return ;
      }
      let ids = new Array();
      selection.forEach(item=>{
        ids.push(item.id)
      })
      this.$http.request({
        url:`${window.context.portal}/portal/sysIndexLayoutManage/sysIndexLayoutManage/v1/exportDefaultLayout?isDefault=true`,
        method:"POST",
        data:ids,
        responseType:"arraybuffer"
      })
    },
    showImportLayout(){
      this.uploadDialogVisible = true
    },
    handleImport(param){
      let formData = new FormData();
      formData.append("file",param.file);
      portal.importDefaultLayout(formData).then(resp=>{
        if(resp.state){
          this.$message.success(resp.message);
          this.fileList.splice(0);
          this.uploadDialogVisible = false;
          this.$refs.layoutTable.load();
        }else{
          this.beforeClose();
        }
      })
    },
    uploadSubmit(){
      if(this.$refs.elUpload.uploadFiles.length == 0){
        this.$message.warning("请上传文件");
        return ;
      }
      this.$refs.elUpload.submit();
    },
    beforeClose(){
      this.uploadDialogVisible = false;
      this.fileList.splice(0);
    }
  }
};
</script>
<style scoped lang="scss">
div[aria-invalid="true"] >>> .el-input__inner,
div[aria-invalid="true"] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
a:hover{
  cursor:pointer;
  color:blue;
}
 /deep/ .el-dialog.upload-dialog{
    height:unset;
    /deep/ .el-dialog__body{
      height:unset;
    }
    .upload-dialog__content{
      height:150px;
    }
    min-height: unset;
  }
</style>
