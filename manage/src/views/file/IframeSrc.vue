<template>
  <el-dialog
    :visible.sync="iframeSrcDialog"
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
        >下载</el-button
      >
      <span
        style="float :right;padding-right:40px;font-size: 20px;color: rgb(223 227 234);cursor: pointer;"
        @click="close"
        ><i style="font-size: 20px;" class="el-icon-close"></i
      ></span>
    </p>
    <iframe
      :src="dataSrc"
      style="height:100%;width:100%;border:0;"
      align="middle"
    ></iframe>
  </el-dialog>
</template>

<script>
import { Message } from "element-ui";
import req from "@/request.js";
export default {
  name: "iframe-src",
  props: ["iframeSrc", "fileRow"],
  data() {
    return {
      iframeSrcDialog: false,
      dataSrc: ''
    };
  },
  watch: {
    iframeSrc: function(newVal, oldVal) {
      if(newVal){
        let _this = this;
        req.get(this.iframeSrc,'arraybuffer').then(response=>{
            let type = response.headers['content-type'];
            if(type){
              _this.dataSrc = window.URL.createObjectURL(new Blob([response.data], { type: type }));
            }else{
              _this.dataSrc = window.URL.createObjectURL(new Blob([response.data]));
            }
        });
      }
    }
  },
  methods: {
    handleOpen() {
      this.iframeSrcDialog = true;
    },
    //关闭弹框
    close() {
      this.iframeSrcDialog = false;
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
.arthis_.fileRow{
  position: fixed;
  top: 0px;
  z-index: 2;
  width: 100%;
  background-color: #191919;
  padding: 12px 0;
  margin: 0;
  text-align :center;
}
>>>.el-dialog__body{
  height: calc(100% - 52px);
  color: #606266;
  font-size: 14px;
  padding:0;
  padding-left:30px;
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
