<template>
    <el-container>
      <el-header v-show="contracts.length>1" class="header" height="48px">
          <ht-form-item
            label="选择合同"
            label-width="100px"
          >
            <ht-select
              v-model="currentFileId"
              :options="contracts"
              :props="{ key: 'fileId', value: 'templateName' }"
              filterable
              @change="changeFile"
            >
            </ht-select>
          </ht-form-item>
      </el-header>
      <el-main>
          <iframe :src="pdfSrc" :name="currentFileName" style="width:100%;border:0;" align="middle" :height="height"></iframe>
      </el-main>
    </el-container>
</template>

<script>
import utils from "@/utils.js";
import { Message } from "element-ui";
import req from "@/request.js";
export default {
  name: "contractPreview",
  props: ["options"],
  data() {
    return {
      filesProps: {
        label: "originName"
      },
      contracts:[],
      currentPage: 0, // pdf文件页码
      pageCount: 0, // pdf文件总页数
      height: 800,
      fileType: "pdf", // 文件类型
      currentFileId:'',
      currentFileName:'',
      pdfSrc: '',
    };
  },
  mounted() {
    this.height = document.documentElement.clientHeight - 80;
    this.getContracts();
  },
  created() {
    
  },
  methods: {
    getContracts(){
      const formInst = utils.getOnlineFormInstance(this);
      let _this = this;
      this.$http.get('${bpmRunTime}/runtime/bpmPrintRecord/v1/getByProInstId?procInstId='+formInst.$parent['instId']).then(resp => {
        if(resp.data){
          _this.contracts = resp.data;
          if(_this.contracts.length>0){
            _this.currentFileId = _this.contracts[0]['fileId'];
            _this.currentFileName = _this.contracts[0]['templateName'];
            _this.changeFile();
          }
        }
      }, error => {
          _this.$message({
            message: "获取合同记录失败！",
            type: "error"
          });
      })
    },
    changeFile(){
      let _this = this;
      if(this.currentFileId){
          this.contracts.forEach(item =>{
            if(item.fileId==_this.currentFileId){
              _this.currentFileName = item.templateName;
            }
          })
          let url = window.context.portal+"/file/onlinePreviewController/v1/onlinePreview?fileId="+this.currentFileId;
          this.$http.get(url).then(resp => {
            let data = resp.data;
            if (data.result == "error") {
              Message.error("附件不存在");
            } else {
              _this.pdfSrc = window.context.portal + data.pdfUrl;
            }
          });
      }
    },
    // 改变PDF页码,val传过来区分上一页下一页的值,0上一页,1下一页   $scope.src=+portal+$scope.data.pdfUrl;
    changePdfPage(val) {
      if (val === 0 && this.currentPage > 1) {
        this.currentPage--;
      }
      if (val === 1 && this.currentPage < this.pageCount) {
        this.currentPage++;
      }
    },
    // pdf加载时
    loadPdfHandler() {
      this.currentPage = 1; // 加载的时候先加载第一页
    },
    handleOpen() {
      this.pdfDialog = true;
    },
    //关闭弹框
    close() {
      this.pdfDialog = false;
    },
    //附件下载
    download() {
      req.download(
        "${portal}/system/file/v1/downloadFile?fileId=" + this.fileRow.id
      );
    }
  }
};
</script>

<style lang="stylus" scoped>
.header{
  padding:0px !important;
  background-color:#F1F1F1;
}
.el-main{
  padding:0px !important;
}
</style>
