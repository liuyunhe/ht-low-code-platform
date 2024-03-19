<template>
  <el-dialog
    :visible.sync="pdfDialog"
    :close-on-click-modal="false"
    width="80%"
    :show-close="false"
    top="52px"
  >
    <p class="arrow">
      <el-button
        icon="el-icon-download"
        @click="download()"
        style="download"
        type="primary"
        size="mini"
      >下载</el-button>
      <span
        style="float :right;padding-right:40px;font-size: 20px;color: rgb(223 227 234);cursor: pointer;"
        @click="close"
      >
        <i style="font-size: 20px;" class="el-icon-close"></i>
      </span>
    </p>
    <iframe :src="pdfSrc" style="width:100%;border:0;" align="middle" :height="height"></iframe>
  </el-dialog>
</template>

<script>
import { Message } from "element-ui";
import req from "@/request.js";
export default {
  name: "pdf",
  props: ["src", "fileRow"],
  data() {
    return {
      filesProps: {
        label: "originName"
      },
      pdfDialog: false,
      currentPage: 0, // pdf文件页码
      pageCount: 0, // pdf文件总页数
      height: 800,
      fileType: "pdf", // 文件类型
      pdfSrc: ''
    };
  },
  mounted() {
    this.height = document.documentElement.clientHeight - 80;
  },
  // computed: {
  //   pdfSrc: function() {
  //     return (
  //       window.context.manage + "/static/pdfjs/web/viewer.html?file=" + this.src
  //     );
  //   }
  // },
  watch: {
    src: function(newVal, oldVal) {
      if(newVal){
        let _this = this;
        req.get(this.src,'arraybuffer').then(response=>{
            _this.pdfSrc = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        });
      }
    }
  },

  methods: {
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
.currentPage {
  cursor: pointer;
  color: #8c8e92;
}

.currentPage:hover {
  color: #2761ff;
}

.arrow {
  position: fixed;
  top: 0px;
  z-index: 2;
  width: 100%;
  background-color: #191919;
  padding: 12px 0;
  margin: 0;
  text-align: center;
}

>>>.el-dialog__body {
  height: calc(100% - 52px);
  color: #606266;
  font-size: 14px;
  padding: 0;
  padding-left: 30px;
}

>>>.el-dialog {
  height: calc(100% - 52px);
  position: relative;
  margin: 0 auto 0;
  background: #fff;
  border-radius: 2px;
  -webkit-box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 50%;
}
</style>
