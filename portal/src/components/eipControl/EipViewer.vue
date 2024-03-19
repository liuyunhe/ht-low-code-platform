<template>
  <div class="abcc">
    <viewer v-if="permission_sub != 'n'" :images="imgArr"  v-model="inputVal">
      <ul>
        <li v-for="(item, index) of imgArr" :key="index">
          <el-card
            alt="查看原图"
            :body-style="{ padding: '0px', margin: '10px', cursor: 'pointer' }"
          >
            <img v-if="previewAble" :src="item.previewUrl" :key="index" :style="style" />
            <div>
              <span>{{ item.fileName }}</span>
              <el-row v-if="downloadAble" style="float: right; padding: 3px 0">
                <el-button
                  v-if="uploadType == 'local'"
                  icon="el-icon-download"
                  circle
                  @click="downloadFile(item)"
                ></el-button>
                <el-button
                  v-if="permission_sub != 'r'"
                  icon="el-icon-delete"
                  circle
                  @click="imgArrRemove(index,item)"
                ></el-button>
              </el-row>
            </div>
          </el-card>
        </li>
      </ul>
    </viewer>
    <input v-if="permission_sub != 'n'" type="hidden" v-model="value" v-validate="inputValidate" :name="inputName" />
    <el-upload
      v-if="uploadType == 'local' && permission_sub != 'r' && permission_sub != 'n'"
      class="upload-demo"
      :file-list="imgArr"
      :action="actionUrl"
      :headers="header"
      :show-file-list="false"
      :on-success="success"
      :on-progress="progress"
      :before-upload="beforeAvatarUpload"
      :multiple="multiple"
      :limit="Number(limit)"
      :on-exceed="handleExceed"
    >
      <el-tooltip placement="right" effect="light">
        <div slot="content">附件格式支持：img/jpg/gif</div>
        <el-button size="mini" round icon="el-icon-plus">上传</el-button>
      </el-tooltip>
    </el-upload>
    <ht-field-tail v-if="permission_sub != 'n'" :fieldName="inputName" :readonly="!inputWriteable" :inputValue="inputVal">
      <slot name="append" slot="append"></slot>
    </ht-field-tail>
    <el-button
      v-if="uploadType == 'https' && permission_sub != 'r' && permission_sub != 'n'"
      size="mini"
      round
      icon="el-icon-plus"
      @click="dialogFormVisible = true"
      >上传</el-button
    >

    <el-dialog title="网络图片上传" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
      <el-form :model="httpsFile" data-vv-scope="httpsFileForm">
        <el-form-item label="文件名称" label-width="100px">
          <ht-input
            style="width:100%"
            placeholder="请输入文件名称"
            v-model="httpsFile.fileName"
            :validate="{ required: true }"
          ></ht-input>
        </el-form-item>
        <el-form-item label="文件地址" label-width="100px">
          <ht-input
            style="width:100%"
            placeholder="请输入文件地址"
            v-model="httpsFile.url"
            :validate="{ required: true }"
          ></ht-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="httpsDialog()">确定</el-button>
        <el-button @click="dialogFormVisible = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import req from "@/request.js";
import { mapState } from "vuex";
import { Loading } from "element-ui";
import hotentUtils from "@/hotent-ui-util.js";
import sub_pio_mixin from "@/sub-permission-mixin.js";
import utils from "@/utils.js";
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
    "multiple",
    "validate",
    "name",
    "allowPreview",
    "allowDownload"
  ],
  mixins: [sub_pio_mixin],//混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub_sub）
  data() {
    return {
      httpsFile: { fileName: "", url: "", previewUrl:"" },
      dialogFormVisible: false,
      style: {
        width: "265px",
        height: "180px",
        border: "2px solid #ccc",
        borderRadius: "3px",
        padding: "1px",
        margin: "1px",
        cursor: "pointer"
      },
      imgArr: [],
      loadingInstance:null,
      onceUploadingFileList:[],//一个批次正在上传的文件
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
    value(newVal) {
      console.log(newVal)
      if (newVal) {
      let ary = JSON.parse(this.value);
      if(ary instanceof Array){
        this.imgArr = ary;
      }
    }
     },
    imgArr: function(newVal,oldVal) {
      if (newVal && (newVal.length>0 && (!newVal[newVal.length-1].status || newVal[newVal.length-1].status!="success"))) {
        if(this.previewAble){
          let  this_ = this;
        //  let index = 0;
          this.imgArr.forEach((img,index) => {
            // console.log('this.uploadType',this.uploadType)
            if ( this.uploadType=='local' && !img.previewUrl){
              // console.log('111111111')
              let newImg = {}
              if(img.url){
                newImg = img
              }else {
                newImg.url =  BASE_URL_ +img
              }
              req.get(newImg.url,'arraybuffer').then(response=>{
                let type = response.headers['content-type'];
                if(type){
                  // newImg.previewUrl = window.URL.createObjectURL(new Blob([response.data], { type: type }));
                  newImg.previewUrl = newImg.url;
                }else{
                  // newImg.previewUrl = window.URL.createObjectURL(new Blob([response.data]));
                  newImg.previewUrl = newImg.url;
                }
                this_.$set(this_.imgArr, index, newImg);
               // index++;
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
      let ary = JSON.parse(this.value);
      console.log(this.value)
      if(ary instanceof Array){
        this.imgArr = ary;
      }
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
    imgArrRemove(index,item){
      console.log(item)
      this.imgArr.remove(item);
      this.$emit("input", JSON.stringify(this.imgArr));
    },
    handleExceed(files, fileList) {
        this.$message.warning(`当前限制选择 ${Number(this.limit)} 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
      },
    progress() {
      this.loadingInstance = Loading.service("文件上传中");
    },
    //文件上传成功时
    success(response, file, fileList) {
      this.onceUploadingFileList.push(response);
      let allUploadSuccess = fileList.every(item=>{return item.status ==='success'});

      //所有的文件都上传成功后，再处理
      if(allUploadSuccess){
        this.handleOnceUpload();
      }
    },
    handleOnceUpload(){
      this.onceUploadingFileList.forEach(item=>{
        let obj ={previewUrl:"",fileName:item.fileName};
        obj.url =window.context.portal +"/file/onlinePreviewController/v1/getFileById_" +item.fileId;  // window.context.portal +
        obj.previewUrl = obj.url;
        this.imgArr.push(obj);
      })
      //清空该批次上传的文件
      this.onceUploadingFileList = [];
      this.loadingInstance && this.loadingInstance.close();
    },
    beforeAvatarUpload(file) {
      var FileExt = file.name.replace(/.+\./, "");
      if (
        ["jpg", "png", "gif", "ico", "jpeg"].indexOf(FileExt.toLowerCase()) ===
        -1
      ) {
        this.$message({
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
            previewUrl:''
          };
          this.imgArr.push(item);
          this.httpsFile = { fileName: "", url: "",previewUrl:"" };
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
