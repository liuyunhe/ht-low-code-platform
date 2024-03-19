<template>
  <el-dialog
    :visible.sync="dialogVisible" 
    custom-class="preview__dialog" 
    :title="previewParams.title"
    append-to-body 
    :show-close="closeable" 
    fullscreen destory-on-close
    @opened="opened">
    <div class="preview__container" :style="'height:' + bodyHeight">
      <Loading v-if="loading"></Loading>
      <FillPage 
        type="2"
        v-if="errorMessage" 
        :tip="errorMessage"
        custom-link-label="开始下载"
        @customLinkClick="startDownload">
      </FillPage>
      <!-- 预览pdf.word等文件格式 -->
      <Pdf 
        ref="pdfSearch" 
        :src="previewParams.url" 
        v-if="previewParams.type == 'pdf'" 
        :closeable="closeable" 
        @close="close"
        @pageChange="pdfPageChange" />
      <iframe 
        :src="previewParams.url" 
        v-if="previewParams.type == 'html'" 
        frameborder="0" width="100%" 
        height="100%" 
        align="middle" 
        id="iframe"></iframe>
      <el-image 
        v-if="previewParams.type == 'picture'" 
        ref="elImage" 
        :src="previewParams.pictureUrl" 
        id="elImg"
        ></el-image>
      <el-button 
        circle 
        style="position:fixed;bottom:8rem;right:0.5rem;z-index:9999" 
        icon="el-icon-error" 
        @click="dialogVisible = false"
        ></el-button>
        <el-button 
          circle 
          style="position:fixed;bottom:5rem;right:0.5rem;z-index:9999" 
          icon="el-icon-circle-plus" 
          @click="scale('enlarge')"
          ></el-button>
        <el-button 
          circle 
          style="position:fixed;bottom:2rem;right:0.5rem;z-index:9999" 
          icon="el-icon-remove"
          @click="scale('reduce')"
          ></el-button>
        <el-button 
          circle 
          style="position:fixed;bottom:11rem;right:0.5rem;z-index:9999"
          icon="el-icon-download"
          @click="download"
          v-if="permission !== 'r' || allowDownload"
          ></el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
import req from '@/request.js'
import Pdf from '@/components/common/pdf.vue'
import Loading from '@/components/common/Loading.vue'
import FillPage from '@/components/common/FillPage.vue'

export default {
  components: { Pdf, Loading, FillPage },
  props: {
    closeable: {
      type: Boolean,
      default: true
    },
    fileId:{
      type: String,
    },
    previewParams:{
      type: Object
    },
    permission:{
      type:String
    },
    allowDownload:{
      type: Boolean
    },
    allowPreview:{
      type: Boolean
    }
  },
  data() {
    return {
      dialogVisible: false,
      fileRow: {},
      iframeSrc: '',
      src: '',
      fileTree: '',
      loading: false,
      errorMessage: null,
      curScale:1
    }
  },
  computed: mapState({
    header: state => {
      return { Authorization: `Bearer ${state.login.currentUser.token}` }
    },
    actionUrl: function () {
      return window.context.portal + '/system/file/v1/upload'
    }
  }),
  methods: {
    async preview(row) {
      this.fileRow = row;
      this.dialogVisible = true;
      this.errorMessage = "不支持在线预览，请下载后查看。";
    },
    startDownload() {
      req.download("${portal}/system/file/v1/downloadFile?fileId=" + this.fileRow.id);
    },
    showDialog(){
      this.dialogVisible = true;
    },
    close(){
      this.dialogVisible = false;
    },
     //放缩
    scale(type){
      //放大
      let el = null;
      if(this.previewParams.type == 'html'){
        el = document.getElementById("iframe");
      }else if(this.previewParams.type == 'pdf'){
        el = document.getElementById('touchPad');
      }else if(this.previewParams.type == 'picture'){
        el = document.getElementsByClassName("el-image")[0];
      }
      
      if(type == "enlarge"){
        this.curScale += 0.2;
        if(this.curScale > 3){
          this.curScale = 3;
        }
        el.style.transform = "scale("+this.curScale+")"
      }else if(type == "reduce"){
        this.curScale -= 0.2;
        if(this.curScale < 1){
          this.curScale = 1;
        }
        el.style.transform = "scale("+this.curScale+")"
      }
    },
    download(){
      this.$emit("download",{id:this.previewParams.id})
    },
    pdfPageChange(){
      let el = document.getElementById('touchPad');
      this.curScale = 1;
      el.style.transform = "scale("+this.curScale+")"
    },
    opened(){
      this.curScale = 1;
    }
  },
  computed: {
    bodyHeight() {
      if(this.previewParams.type == 'html'){
        return document.body.clientHeight + "px";
      }else{
        return 'auto'
      }
    }
  },
}
</script>
<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";

.el-dialog__wrapper /deep/ {
  .preview__dialog {
    background: transparent;
    margin: 0 !important;

    .el-dialog__header {
      z-index: 10000;
      background: $--color-black;
      min-height: 20px;
      width: 100%;
      overflow: auto;
    }
    .el-dialog__title {
      color: $--color-white;
    }
    .el-dialog__headerbtn {
      top: 10px;
    }
    .el-dialog__close {
      color: $--color-white;
    }
    .el-dialog__body {
      background: $--color-white;
      width:100%;
      height: auto;
      min-height: 100%;
      overflow: auto;
    }
  }
}

.preview__container {
  height: 100%;
}
#touchPad{
  transform-origin: 0 0;
}
#iframe{
  transform-origin:0 0;
}
.el-image{
  transform-origin:0 0;
}

</style>
