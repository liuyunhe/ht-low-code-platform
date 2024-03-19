<template>
  <div class="inputs" ref="inputs" style="width: 100%;">
    <ht-file
    :key="refreshTime"
      v-model="inputVal"
      :name="inputName"
      :permission="permission_sub"
      :size="size"
      :limit="limits"
      :validate="inputValidate"
      :multiple="multiple"
      :accept="acceptFile"
      :propConfList="propConfList"
      :actionUrl="actionUrl"
      :header="header"
      :beforeUpload="beforeAvatarUpload"
      :onSuccess="onSuccess"
      :previewable="previewAble"
      :downloadable="downloadAble"
      :isSimple="simplicity"
      ref="upload"
      @download="download"
      @preview="preview"
      :class="{'htfile__readonly':permission_sub==='r'}"
    />
    <!-- @before-upload="beforeAvatarUpload" -->
    <!-- 预览压缩文件-->
    <FilePreview ref="filePreview" />
  </div>
</template>
<script>
import { mapState } from "vuex";
import utils from "@/utils.js";
import req from "@/request.js";
import sub_pio_mixin from "@/sub-permission-mixin.js";
import FilePreview from "@/components/common/FilePreview.vue";
import { Message } from "element-ui";
export default {
  name: "eip-attachment",
  components: { FilePreview },
  props: [
    "validate",
    "value",
    "name",
    "permission",
    "size",
    "limit",
    "multiple",
    "accept",
    "propConf",
    "allowPreview",
    "allowDownload",
    "simplicity"
  ],
  mixins: [sub_pio_mixin],//混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub）
  data() {
    return {
      limits: 9999,
      propConfList: [],
      inputVal: this.value,
      refreshTime:new Date().getTime(),
      src: "",
      fileId: "",
      fileTree: "",
      iframeSrc: "",
      acceptFile: "",
      newValidate: null,
      actionUrl:window.context.portal + "/system/file/v1/upload",
    };
  },
  computed: mapState({
    inputValidate: function() {
      if (this.newValidate) {
        return this.newValidate;
      }
      var validateObj = this.$store.state.index.validate;
      return utils.addRequiredOrNot(
        this.permission_sub,
        this.validate,
        validateObj,
        this
      );
    },
    header: state => {
      return { Authorization: `Bearer ${state.login.currentUser.token}` };
    },
    //actionUrl: function() {
    //  return window.context.portal + "/system/file/v1/upload";
    //},
    inputName: function() {
      let labeldesc = "";
      if (
        this.$slots &&
        this.$slots.labeldesc &&
        this.$slots.labeldesc[0].children &&
        this.$slots.labeldesc[0].children[0].text
      ) {
        labeldesc = this.$slots.labeldesc[0].children[0].text;
        return this.name ? this.name : utils.getName() + "-" + labeldesc;
      } else {
        return this.name ? this.name : utils.getName();
      }
    },
    previewAble: function(){
      if(this.permission_sub!='w' && !this.allowPreview){
        return false;
      }
      return true;
    },
    downloadAble: function(){
      if(this.permission_sub!='w' && !this.allowDownload){
        return false;
      }
      return true;
    },
  }),
  watch: {
    inputVal(val) {
      this.$emit("input", val);
    },
    value(val){
      this.inputVal = val;
      setTimeout(()=>{
        this.refreshTime=new Date().getTime();
      },300)
    }
  },
  mounted() {
    if (this.limit) {
      this.limits = Number(this.limit);
    }
    try {
      const formInst = utils.getOnlineFormInstance(this);
      if(formInst.flowKey){
          this.actionUrl = this.actionUrl + '?flowKey='+formInst.flowKey;
      }
    } catch (error) {}
  },
  beforeDestroy() {},
  destroyed() {},
  created() {
    if (this.propConf) {
      let list = JSON.parse(this.propConf);
      list.forEach(element => {
        if (element.desc) {
          if (element.requried) {
            element.inputValidate = "required:true";
          }
          this.propConfList.push(element);
        }
      });
    }
    if (this.accept) {
      this.acceptFile = "." + this.accept.split(",").join(",.");
    }
    this.$validator = this.$root.$validator;
  },
  methods: {
    onSuccess(file) {},
    beforeAvatarUpload(file) {
      if(!this.accept || typeof(this.accept) == 'undefined'){
        return true;
      }
      // 文件类型限制
      const name = file.name ? file.name : "";
      const ext = name
        ? name.substr(name.lastIndexOf(".") + 1, name.length)
        : true;
      const isExt = this.accept.indexOf(ext) < 0;
      if (isExt) {
        if (this.accept == "" || this.accept == undefined) {
          this.$message.error("请配置可上传文件的格式!");
        } else {
          this.$message.error("上传的附件只能是 " + this.accept + "格式!");
        }
      }
      return !isExt;
    },
    download(file) {
      if (!file.response && !file.id) {
        this.$message.warning("请稍后再试！");
        return;
      }
      let fileId = "";
      if(file.id){
        fileId = file.id;
      }else{
        fileId = file.response.fileId;
      }
      req.download("${portal}/system/file/v1/downloadFile?fileId=" +  fileId);
    },
    preview(files) {
      if (!files.response  && !files.id) {
        this.$message.warning("请稍后再试！");
        return;
      }
      if(files.id){
        let obj = {};
        obj.id=files.id;
        obj.name=files.name;
        obj.size=files.size;
        this.$refs.filePreview.preview(obj)
      }else{
        var fileData = files.response;
        let obj = {};
        obj.id=fileData.fileId;
        obj.name=fileData.fileName;
        obj.size=fileData.size;
        this.$refs.filePreview.preview(obj)
      }
      
    }
  }
};
</script>
<style lang="scss" scoped>
div[aria-invalid='true'] /deep/ .el-input__inner, div[aria-invalid='true'] /deep/ .el-input__inner:focus {
  border-color: #f56c6c;
}
.htfile__readonly{
  /deep/.file-list__wrap{
    margin-top: 2px;
  }
}
</style>
