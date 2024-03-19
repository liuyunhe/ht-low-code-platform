<template>
  <div>
    <viewer v-if="permission_sub != 'n'" :images="imgArr" :options="options" v-model="inputVal">
      <ul>
        <li v-for="(item, index) of imgArr" :key="index">
          <el-card :body-style="{ padding: '0px', margin: '10px' }">
            <img v-if="previewAble" :src="item.previewUrl" :key="index" :style="style" />
            <div>
              <span>{{ item.fileName }}</span>
              <el-row style="float: right; padding: 3px 0">
                <el-button
                  v-if="uploadType == 'local' && downloadAble"
                  icon="el-icon-download"
                  circle
                  @click="downloadFile(item)"
                ></el-button>
                <el-button
                  v-if="permission_sub=='w'"
                  icon="el-icon-delete"
                  circle
                  @click="imgArr.remove(item)"
                ></el-button>
              </el-row>
            </div>
          </el-card>
        </li>
      </ul>
    </viewer>
    <input type="hidden" v-model="value" v-validate="inputValidate" :name="inputName" />
    <el-upload
      v-if="uploadType == 'local' && permission_sub=='w'"
      class="upload-demo"
      :action="actionUrl"
      :headers="header"
      :file-list="imgArr"
      :show-file-list="false"
      :multiple="multiple"
      :on-success="success"
      :on-progress="progress"
      :before-upload="beforeAvatarUpload"
      :limit="Number(limit)"
      :on-exceed="handleExceed"
    >
      <el-button size="mini" icon="el-icon-plus">上传图片</el-button>
    </el-upload>
    <ht-field-tail  v-if="permission_sub != 'n'" :fieldName="inputName" :readonly="!inputWriteable" :inputValue="inputVal">
      <slot name="append" slot="append"></slot>
    </ht-field-tail>
    <el-button
      v-if="uploadType == 'https' && permission_sub=='w'"
      size="mini"
      round
      icon="el-icon-plus"
      @click="dialogFormVisible = true"
      >上传</el-button
    >

    <ht-sidebar-dialog
      title="网络图片上传"
      :visible.sync="dialogFormVisible"
      :before-close="cancel"
      :close-on-click-modal="false"
      append-to-body
      width="100%"
    >
      <el-form :model="httpsFile" data-vv-scope="httpsFileForm">
        <el-form-item label="文件名称" label-width="100px">
          <ht-input
            placeholder="请输入文件名称"
            v-model="httpsFile.fileName"
            :validate="{ required: true }"
          ></ht-input>
        </el-form-item>
        <el-form-item label="文件地址" label-width="100px">
          <ht-input
            placeholder="请输入文件地址"
            v-model="httpsFile.url"
            :validate="{ required: true }"
          ></ht-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer" style="text-align: center;">
        <el-button type="primary" @click="httpsDialog" size="small">确 定</el-button>
        <el-button @click="cancel" size="small">取 消</el-button>
      </span>
    </ht-sidebar-dialog>
  </div>
</template>
<script>
import req from "@/request.js";
import { mapState } from "vuex";
import { Loading } from "element-ui";
import {Notify} from "vant";
import utils from "@/utils.js";
import sub_pio_mixin from "@/sub-permission-mixin.js";
export default {
  name: "EipViewer",
  props: [
    "value",
    "permission",
    "modelExpression",
    "imgHeight",
    "imgWidth",
    "uploadType",
    "limit",
    "validate",
    "multiple",
    "name",
    "allowPreview",
    "allowDownload"
  ],
  mixins: [sub_pio_mixin],//混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub）
  data() {
    return {
      httpsFile: { fileName: "", url: "", previewUrl:"" },
      dialogFormVisible: false,
      style: {
        width: "225px",
        height: "180px",
        border: "2px solid #ccc",
        borderRadius: "3px",
        padding: "1px",
        margin: "1px",
        cursor: "pointer"
      },
      imgArr: []
    };
  },
  computed: mapState({
    inputVal: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      }
    },
    inputWriteable: function() {
      return utils.getWriteable(this.permission_sub);
    },
    inputValidate: function() {
      var validateObj = this.$store.state.index.validate;
      return utils.addRequiredOrNot(
        this.permission_sub,
        this.validate,
        validateObj,
        this
      );
    },
    inputName: function() {
      let labeldesc = "";
      if(this.$slots && this.$slots.labeldesc && this.$slots.labeldesc[0].children && this.$slots.labeldesc[0].children[0].text ){
        labeldesc = this.$slots.labeldesc[0].children[0].text;
        return this.name ? this.name : utils.getName()+ "-" +labeldesc;
      }else{
        return this.name ? this.name : utils.getName();
      }
    },
    header: state => {
      return { Authorization: `Bearer ${state.login.currentUser.token}` };
    },
    actionUrl: function() {
      return window.context.portal + "/system/file/v1/upload";
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
    imgArr: function(newVal) {
      if (newVal && (newVal.length>0 && (!newVal[newVal.length-1].status || newVal[newVal.length-1].status!="success"))) {
        if(this.previewAble){
          let  this_ = this;
          let index = 0;
          this.imgArr.forEach(img => {
            if ( this.uploadType=='local' && !img.previewUrl){
              req.get(img.url,'arraybuffer').then(response=>{
                let type = response.headers['content-type'];
                if(type){
                  img.previewUrl = window.URL.createObjectURL(new Blob([response.data], { type: type }));
                }else{
                  img.previewUrl = window.URL.createObjectURL(new Blob([response.data]));
                }
                this_.$set(this_.imgArr, index, img);
                index++;
              });
            } else if (this.uploadType=='https') {
              img.previewUrl=img.url
            }
          });
        }
        this.$emit("input", JSON.stringify(this.imgArr));
      }
    }
  },
  mounted() {
    if (this.value) {
      this.imgArr = JSON.parse(this.value);
    }
    if (this.imgHeight > 0 && this.imgWidth > 0) {
      this.style = {
        height: this.imgHeight + "px",
        width: this.imgWidth + "px"
      };
    }
  },
  created() {
    this.$validator = this.$root.$validator;
  },
  methods: {
    cancel() {
      this.dialogFormVisible = false;
    },
    handleExceed(files, fileList) {
        Notify({type:"warning",message:`只允许上传${Number(this.limit)} 个文件`})
    },
    progress() {
      Loading.service("文件上传中");
    },
    //文件上传成功时
    success(response, file, fileList) {
      let loadingInstance = Loading.service("文件上传中");
      const this_ =this;
      setTimeout(function () {
        if(fileList.length != this_.imgArr.length){
          for (let i = 0; i < fileList.length; i++) {
            let value = fileList[i].response;
            if(!value){
              continue;
            }
            let item = {};
            item.url =
              window.context.portal +
              "/file/onlinePreviewController/v1/getFileById_" +
              value.fileId;
            item.fileName = value.fileName;
            item.previewUrl = '';
            this_.imgArr.push(item);
          }
        }
        // 以服务的方式调用的 Loading 需要异步关闭
        loadingInstance.close();
      }, 1000);
    },
    beforeAvatarUpload(file) {
      var FileExt = file.name.replace(/.+\./, "");
      if (
        ["jpg", "png", "gif", "ico", "jpeg"].indexOf(FileExt.toLowerCase()) ===
        -1
      ) {
        Notify({
          type: "warning",
          message: "请上传后缀名为jpg、png、gif、ico、jpeg类型的图片"
        });
        return false;
      }
    },
    downloadFile(item) {
      if(item && item.url && item.url.split("getFileById_").length==2){
        let fileId = item.url.split("getFileById_")[1];
        req.download("${portal}/system/file/v1/downloadFile?fileId=" +  fileId);
      }
    },
    httpsDialog: function() {
      this.$validator.validateAll("httpsFileForm").then(result => {
        if (result) {
          let item = {
            fileName: this.httpsFile.fileName,
            url: this.httpsFile.url,
            previewUrl: ''
          };
          this.imgArr.push(item);
          this.httpsFile = { fileName: "", url: "", previewUrl:"" };
          this.dialogFormVisible = false;
        } else {
          this.$message.error("表单未正确填写");
        }
      });
    }
  }
};
</script>
<style scoped>
input[aria-invalid='true'] + div /deep/ button {
  border-color: #f56c6c;
}
ul {
  display: flex;
  flex-wrap: wrap;
}
ul li {
  list-style: none;
}
</style>
