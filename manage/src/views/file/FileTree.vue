<template>
  <el-dialog
    :visible.sync="fileTreeDialog"
    :close-on-click-modal="false"
    width="55%"
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
    <el-tree :data="fileTree" :props="filesProps"></el-tree>
  </el-dialog>
</template>

<script>
import { Message } from "element-ui";
import req from "@/request.js";
import { mapState, mapActions } from "vuex";
export default {
  name: "file-tree",
  props: ["fileTree", "fileRow"],
  data() {
    return {
      fileTreeDialog: false,
      filesProps: {
        label: "originName",
        children: "childList"
      }
    };
  },
  methods: {
    handleOpen() {
      this.fileTreeDialog = true;
    },
    //关闭弹框
    close() {
      this.fileTreeDialog = false;
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

<style lang="stylus">
.currentPage {
  cursor: pointer;
  color: #8c8e92;
}

.currentPage:hover {
  color: #2761ff;
}
.arrow{
  position: fixed;
  top: 0px;
  left :0px;
  z-index: 2;
  width: 100%;
  background-color: #191919;
  padding: 12px 0;
  margin: 0;
  text-align :center;
}
>>>.el-dialog__body {
    color: #606266;
    font-size: 14px;
    padding:0;
}
</style>
