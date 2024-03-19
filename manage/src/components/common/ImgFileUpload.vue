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
      :limit="1"
    >
      <el-tooltip placement="right" effect="light">
        <div slot="content">
          附件格式支持：{{ accept }} <br />附件大小限制：单个文件不超过50MB
        </div>
        <el-button size="mini" round icon="el-icon-plus">上传</el-button>
      </el-tooltip>
    </el-upload>
  </div>
</template>

<script>
import { mapState } from "vuex";
import req from "@/request.js";
import { Base64 } from "js-base64";
export default {
  components: {},
 props: ["fileJson"],
  data() {
    return {
      src: "",
      fileId: "",
      fileTree: "",
      iframeSrc: "",
      files: [],
      uploadingFiles: {},
      list: [],
      isChecking: true,
      accept: ".jpg,.jpeg,.png,.JPG,.JPEG,.gif,.PNG,.GIF",
      num: 0
    };
  },
  watch: {
    fileJson: {
      handler: function(val, oldVal) {
        if(val){
          this.files = JSON.parse(val);
        }
      }
    }
  },
  computed: mapState({
    header: state => {
      return { Authorization: `Bearer ${state.login.currentUser.token}` };
    },
    actionUrl: function() {
      return window.context.portal + "/system/file/v1/upload";
    }
  }),
  mounted() {
    if (this.$attrs.value) {
      this.files = JSON.parse(this.$attrs.value);
    }
  },
  methods: {
    exceed(file, fileList) {
      if (fileList.length == 1 || file.length > 1) {
        this.$message.warning("只能上传一个文件");
      }
    },
    preview(files) {
      var id = files.id;
      alert(id);
    },
    beforeRemove(file, fileList) {
      if (this.isChecking) {
        return this.$confirm(`确定移除 ${file.name}？`).then(() => {
          this.$emit("input", "");
        });
      }
    },
    error(response, file, fileList) {
      delete this.uploadingFiles[Base64.encode(file.name)];
    },
    success(response, file, fileList) {
      this.$emit(
        "input",
        JSON.stringify([{ id: response.fileId, name: response.fileName }])
      );
    },
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
