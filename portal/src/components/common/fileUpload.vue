<template>
  <div>
    <el-upload
      class="upload-demo"
      :action="actionUrl"
      :file-list="files"
      :headers="header"
      :on-success="success"
      :on-error="error"
      :on-preview="preview"
      :multiple="true"
      :before-remove="beforeRemove"
      :accept="accept"
      :before-upload="beforeAvatarUpload"
      ref="fileUp"
      :on-exceed="exceed"
      :limit="limits"
    >
      <el-tooltip placement="right" effect="light">
        <div slot="content">
          附件格式支持：{{accept}}
          <br />附件大小限制：单个文件不超过50MB
        </div>
        <el-button size="mini" round icon="el-icon-plus">上传</el-button>
      </el-tooltip>
    </el-upload>
    <!-- 预览文件-->
    <FilePreview ref="filePreview" />
  </div>
</template>

<script>
import { mapState } from "vuex";
import req from "@/request.js";
import { Base64 } from "js-base64";
import FilePreview from "@/components/common/FilePreview.vue";
import { stat } from "fs";
export default {
  components: { FilePreview },
  props: ["limit"],
  data() {
    return {
      limits: this.limit,
      src: "",
      fileId: "",
      fileTree: "",
      files: [],
      uploadingFiles: {},
      list: [],
      isChecking: true,
      accept:
        ".jpg,.jpeg,.png,.bmp,.pdf,.JPG,.JPEG,.PBG,.BMP,.PDF,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.rtf,.txt,.zip,.rar,.vsd,.dwg,.mp4",
      num: 0
    };
  },
  computed: mapState({
    header: state => {
      if (state.login && state.login.currentUser) {
        return { Authorization: `Bearer ${state.login.currentUser.token}` };
      }
      return {};
    },
    actionUrl: function() {
      return window.context.portal + "/system/file/v1/upload";
    }
  }),
  mounted() {
    if (!this.limit) {
      this.limits = 9999999;
    }
  },
  methods: {
    exceed(file, fileList) {
      if (this.limit == 1 && (fileList.length == 1 || file.length > 1)) {
        this.$message.warning("正文只能上传一个文件");
      }
    },
    preview(files) {
      let obj = {};
      obj.id = files.id;
      obj.name = files.name;
      obj.size = files.size;
      this.$refs.filePreview.preview(obj);
    },
    beforeRemove(file, fileList) {
      if (this.isChecking) {
        return this.$confirm(`确定移除 ${file.name}？`).then(() => {
          this.num = 0;
          let value = {};
          if (file.response) {
            value = file.response;
          } else {
            value = file;
            value.fileId = file.id;
          }
          for (var i = 0; i < this.files.length; i++) {
            if (this.files[i].id == value.fileId) {
              this.files.splice(i, 1); //删除数组某一项
            }
          }
        });
      } else {
        this.num = 0;
        let value = {};
        if (file.response) {
          value = file.response;
        } else {
          value = file;
          value.fileId = file.id;
        }
        for (var i = 0; i < this.files.length; i++) {
          if (this.files[i].id == value.fileId) {
            this.files.splice(i, 1); //删除数组某一项
            delete this.uploadingFiles[Base64.encode(this.files[i].name)];
          }
        }
      }
    },
    error(response, file, fileList) {
      delete this.uploadingFiles[Base64.encode(file.name)];
    },
    success(response, file, fileList) {
      for (let i = 0; i < fileList.length; i++) {
        delete this.uploadingFiles[Base64.encode(fileList[i].name)];
      }

      if (this.num == 0) {
        this.list = [];
        for (let i = 0; i < fileList.length; i++) {
          this.list.push(fileList[i]);
        }
      }
      this.num = this.num + 1;
      for (let j = 0; j < this.list.length; j++) {
        if (!this.list[j].raw) {
          for (let i = 0; i < fileList.length; i++) {
            if (this.list[j].name == fileList[i].name) {
              fileList.splice(i, 1);
              break;
            }
          }
        }
      }
      if (this.num == fileList.length) {
        for (let i = 0; i < fileList.length; i++) {
          if (fileList[i].response) {
            let value = fileList[i].response;
            let arrarFile = {};
            arrarFile.id = value.fileId;
            arrarFile.name = value.fileName;
            arrarFile.size = value.size;
            this.files.push(arrarFile);
          }
        }
        this.$emit("input", this.files);
      }
    },
    // handleChange(file, fileList) {
    //   if(file.status=="success"){
    //     let value = JSON.parse(file.response);
    //     let arrarFile = {};
    //     arrarFile.id = value.fileId;
    //     arrarFile.name = value.fileName;
    //     arrarFile.size = value.size;
    //     this.files.push(arrarFile);
    //     this.$emit("input", JSON.stringify(this.files));
    //   }
    //  },
    getFiles() {
      if (this.files.length == 0) {
        return "";
      } else {
        return this.files;
      }
    },
    isFinishUpload() {
      if (JSON.stringify(this.uploadingFiles) != "{}") {
        this.$message.warning("正在上传附件，请稍后！");
        throw "正在上传附件，请稍后！";
      }
    },
    beforeAvatarUpload(file) {
      // 文件类型限制
      const name = file.name ? file.name : "";
      const ext = name
        ? name.substr(name.lastIndexOf(".") + 1, name.length)
        : true;
      const isExt = this.accept.indexOf(ext) < 0;
      this.isChecking = !isExt;
      if (isExt) {
        if (this.accept == "false") {
          this.$message.error("请配置可上传文件的格式!");
        } else {
          this.$message.error("上传的附件只能是 " + this.accept + "格式!");
        }
        return !isExt;
      }
      this.uploadingFiles[Base64.encode(name)] = "eror";
    }
  }
};
</script>
<style lang="stylus" scoped>
.upload-demo {
  max-width: 570px;
  margin-top: 5px;
}
</style>


