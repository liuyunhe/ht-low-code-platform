<template>
  <div class="inputs">
    <el-tooltip :placement="tooltipplacement||$tooltipplacement" :disabled="inputWriteable && !errors.has('custom-form.'+inputName)">
      <div slot="content">{{errors.first('custom-form.'+inputName)}}</div>
      <FileUpload
        v-if="inputWriteable"
        v-validate="inputValidate"
        :name="inputName"
        :fileVal="value"
        :multiples="multiple"
        :accept="accept"
        :limit="limit"
        :conf="propConfList"
        v-model="inputVal"
      />
    </el-tooltip>
    <span v-if="!inputWriteable">
      <el-table v-if="filesData.length>0" :data="filesData" border style="width: 100%;margin-top :10px;" size="medium">
      <el-table-column label="序号" align="center"  type="index" width="70"></el-table-column>
      <el-table-column label="附件名称" align="center">
        <template slot-scope="scope">
          <span class="done-subject" v-if="canPreview" @click="previewFile(scope.row)">{{scope.row.name}}</span>
          <span class="done-subject" v-if="!canPreview">{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="type" align="center" lalign="center" width="100" label="附件类型"></el-table-column>
      <el-table-column prop="bytes" align="center" lalign="center" width="100" label="附件大小"></el-table-column>
      <el-table-column prop="username" align="center" label="上传者" width="120" ></el-table-column>
      <el-table-column :prop="con.name" :label="con.desc"  v-for="con in propConfList" :key="con.name" width="200"  align="center">

      </el-table-column>
      <el-table-column v-if="canDownload" align="center" label="操作" width="100" >
        <template slot-scope="scope">
          <el-button
            @click="downloadFile(scope.row)"
            size="small"
            icon="el-icon-download"
            plain
          ></el-button>
        </template>
      </el-table-column>
    </el-table>
    </span>
    <!-- 预览压缩文件-->
    <FileTree ref="fileTreeSearch"  :fileTree="fileTree" :fileId="fileId"/>
    <!-- 预览pdf.word等文件格式 -->
    <Pdf ref="pdfSearch" :src="src" :fileId="fileId"/>
    <!-- 预览excel.jpg.png.txt等文件格式 -->
    <IframeSrc ref="iframeSrcSearch" :iframeSrc="iframeSrc"  :fileId="fileId"/>
	<span style="display:none;"  v-validate>
	  <slot name="labeldesc">{{inputName}}</slot>
	</span>
  </div>
</template>
<script>
import utils from "@/utils.js";
import req from "@/request.js";
import FileUpload from "@/components/common/fileUploadFlow.vue";
import Pdf from "@/components/common/pdf.vue";
import IframeSrc from "@/components/common/iframeSrc.vue";
import FileTree from "@/components/common/fileTree.vue";
export default {
  name: "ht-file",
  props: ["validate", "value", "name", "permission","multiple","accept","limit","propConf","tooltipplacement","allowPreview","allowDownload"],
  data() {
    return {
      src:"",
      iframeSrc:"",
      inputVal: "",
      val:"",
      uploadVal:[],
      fileId:"",
      fileTree:"",
      filesData:[],
      propConfList:[],
      extraProps:[]
    };
  },
  watch: {
    inputVal: function(newVal, oldVal) {
      this.val = newVal;
      this.$emit("input", this.val);
    }
  },
  computed: {
    inputWriteable: function() {
      return utils.getWriteable(this.permission);
    },
    inputValidate: function() {
      var validateObj= this.$store.state.index.validate;
      return utils.addRequiredOrNot(this.permission, this.validate ,validateObj ,this);
    },
    inputName: function() {
      let labeldesc = "";
      if(this.$slots && this.$slots.labeldesc && this.$slots.labeldesc[0].children && this.$slots.labeldesc[0].children[0].text){
        labeldesc = this.$slots.labeldesc[0].children[0].text;
        return this.name ? this.name : utils.getName()+ "-" +labeldesc;
      }else{
        return this.name ? this.name : utils.getName();
      }
    },
    canPreview: function(){
      if(this.permission=='r' && !this.allowPreview){
        return false;
      }
      return true;
    },
    canDownload: function(){
      if(this.permission=='r' && !this.allowDownload){
        return false;
      }
      return true;
    },
  },
  created() {
     if (this.propConf) {
      let list = JSON.parse(this.propConf);
      list.forEach(element => {
         if(element.desc){
           if(element.requried){
               element.inputValidate='required:true';
           }
           this.propConfList.push(element);
           this.extraProps.push(element.name);
         }
      });
    }

    if(this.value){
       this.inputVal= this.value;
       this.uploadVal=JSON.parse(this.value);
       if(this.uploadVal){
          for(let i=0;i<this.uploadVal.length;i++ ){
            let file ={id:this.uploadVal[i].id,name:this.uploadVal[i].name,size:this.uploadVal[i].size,type:utils.substringType(this.uploadVal[i].name,"."),bytes:utils.bigDecimal(this.uploadVal[i].size),username:this.uploadVal[i].username};
            this.extraProps.forEach(prop => {
               file[prop] = this.uploadVal[i][prop];
            });
            this.filesData.push(file);
          }
       }
    }
   
    this.$validator = this.$root.$validator;
  },
  mounted() {
  },
  methods: {
    //附件下载
    downloadFile(file){
      this.$store.dispatch("menu/downloadFile",file.id);
    },
    previewFile(files){
        var id = files.id;
        this.$store.dispatch("menu/onlinePreview",id).then(data=>{ 
                this.fileId = id;
                if(data.result=="html"){
                    this.iframeSrc=window.context.portal+data.pdfUrl;
                    this.$refs.iframeSrcSearch.handleOpen();
                }else if(data.result=="txt"){
                    this.iframeSrc=window.context.portal+data.TxtUrl;
                    this.$refs.iframeSrcSearch.handleOpen();
                }else if(data.result=="picture"){
                    this.iframeSrc=window.context.portal+data.currentUrl;
                    this.$refs.iframeSrcSearch.handleOpen();
                }else if(data.result=="compress"){
                    this.fileTree=JSON.parse(data.fileTree).childList;
                    this.$refs.fileTreeSearch.handleOpen();
                }else{
                    this.src = window.context.portal+data.pdfUrl;
                    this.$refs.pdfSearch.handleOpen();
                }
            });
    },
    select() {
      this.$message.success("打开选择器对话框");
    }
  },
  components: {Pdf,IframeSrc,FileUpload,FileTree }
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
.el-upload {
    display: inline;
    text-align: center;
    cursor: pointer;
    outline: none;
}
div[aria-invalid='true'] /deep/ button {
  border-color: #f56c6c;
}
.done-subject {
  cursor: pointer;
}

.done-subject {
  color: $--theme-color;
}
</style>