<template>
  <div class="fullheight">
    <el-button @click="save" type="primary" :loading="loading" v-if="inputWriteable===canInput">保存</el-button>
    <div id="office"></div>
  </div>
</template>

<script>
import Vue from "vue";
import webOfficeTpl from "../../public/static/webOffice/iWebOffice2015";
import WebOffice2015 from "../../public/static/webOffice/WebOffice";
import portal from "@/api/portal.js";
export default {
  name: "web-office",
  props: {
    fileId: String,
    isRevision: {
      type: String,
      default: "0"
    },
    inputWriteable: {
      type: String,
      default: "1"
    }
  },
  data() {
    return {
      webOffice: null,
      webOfficeTpl: null,
      loading: false,
      canInput: "1"
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initWebOffice();
      this.initWebOfficeObject();
    })
  },
  methods: {
    initWebOffice() {
      this.webOffice = new Vue({
        template: webOfficeTpl
      }).$mount('#office');
    },
    async initWebOfficeObject() {
      this.webOfficeObj = new WebOffice2015();
      this.webOfficeObj.setObj(document.getElementById('WebOffice'));
      try{
        this.webOfficeObj.ServerUrl = "http://localhost:8083/goldgrid";
        let url = `http://192.168.1.174:8088/system/file/v1/downloadFile?fileId=${this.fileId}`;
        let file = await portal.getFile(this.fileId);
        let extensionName = file.data.extensionName?file.data.extensionName:"doc"
        this.webOfficeObj.UserName = this.getCurrentUsername();
        this.webOfficeObj.FileName = `${this.fileId}.${extensionName}`;
        this.webOfficeObj.FileType = `.${extensionName}`;
        this.webOfficeObj.ShowWindow = true;
        this.webOfficeObj.SetCaption(this.webOfficeObj.UserName + "正在编辑文档");
        this.webOfficeObj.EditType = this.isRevision==="1"?"2":"1";
        this.webOfficeObj.ShowToolBar = true;
        if (!this.webOfficeObj.WebSetSkin(0xdbdbdb, 0xeaeaea, 0xeaeaea, 0xdbdbdb, 0xdbdbdb, 0xdbdbdb, 0x000000)) {
          this.webOfficeObj.Alert(this.webOfficeObj.Status);
        }
        if(this.webOfficeObj.WebOpen3(url)) {
          if (this.isRevision==="1"){
            this.webOfficeObj.WebShow(true);
            this.webOfficeObj.VBASetUserName(this.getCurrentUsername());
          }else {
            this.webOfficeObj.WebShow(false);
          }
        }else {
          this.webOfficeObj.Alert(this.webOfficeObj.Status);
        }
      } catch(e){
        this.webOfficeObj.Alert(this.webOfficeObj.Status);
      }
    },
    save() {
      this.loading = true;
      let fileData = this.webOfficeObj.GetCurrentFile();
      let formData = new FormData();
      formData.append("file",fileData);
      portal.fileUpload(formData,this.fileId).then(resp => {
        if (resp.status === 200) {
          // this.$message.success("保存成功");
        }
      }).finally(() => {
        this.loading = false;
      });
    },
    getCurrentUsername() {
      let currentUser = JSON.parse(window.sessionStorage.getItem("currentUser"));
      return currentUser.username;
    }
  }
};
</script>

<style scoped></style>
