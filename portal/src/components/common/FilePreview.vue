<template>
  <el-dialog
    :visible.sync="dialogVisible"
    width="100%"
    custom-class="preview__dialog"
    :title="fileRow.name"
    append-to-body
    :show-close="closeable"
  >
    <div class="preview__container">
      <Loading v-if="loading"></Loading>
      <FillPage type="2" v-if="errorMessage" :tip="errorMessage"></FillPage>
      <!-- 预览压缩文件-->
      <FileTree ref="fileTreeSearch" :fileTree="fileTree" :fileRow="fileRow" />
      <!-- 预览pdf.word等文件格式 -->
      <Pdf ref="pdfSearch" :src="src" />
      <!-- 预览excel.jpg.png.txt等文件格式 -->
      <IframeSrc
        ref="iframeSrcSearch"
        :iframeSrc="iframeSrc"
        :fileRow="fileRow"
      />
      <VideoPlayer ref="videoPlayer" :fileRow="fileRow" />
    </div>
  </el-dialog>
</template>

<script>
import {mapState} from 'vuex'
import req from '@/request.js'
import Pdf from '@/components/common/pdf.vue'
import IframeSrc from '@/components/common/iframeSrc.vue'
import FileTree from '@/components/common/fileTree.vue'
import VideoPlayer from '@/components/common/HtVideoPlayer.vue'
import Loading from '@/components/common/Loading.vue'
import FillPage from '@/components/common/FillPage.vue'

export default {
  components: {
    Pdf,
    IframeSrc,
    FileTree,
    VideoPlayer,
    FileTree,
    Loading,
    FillPage
  },
  props: {
    closeable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      dialogVisible: false,
      fileRow: '',
      iframeSrc: '',
      src: '',
      fileTree: '',
      loading: false,
      errorMessage: null
    }
  },
  computed: mapState({
    header: state => {
      return {Authorization: `Bearer ${state.login.currentUser.token}`}
    },
    actionUrl: function() {
      return window.context.portal + '/system/file/v1/upload'
    }
  }),
  methods: {
    async preview(row) {
      const this_ = this
      this.loading = true
      this.errorMessage = null
      this.fileRow = ''
      this.dialogVisible = true
      await this.$store
        .dispatch('menu/onlinePreview', row.id)
        .then(data => {
          // console.log( "data：", data );
          const loadError = '加载要预览的附件时出错'
          if (!data) {
            this.errorMessage = '要预览的附件不存在'
          } else if (data.result == 'fileNotSupported') {
            this.errorMessage = '当前附件格式不支持预览'
          } else if (
            typeof data == 'object' &&
            data.hasOwnProperty('state') &&
            (!data.state || !data.result)
          ) {
            this.errorMessage = data.message || loadError
          } else if (
            typeof data == 'object' &&
            data.hasOwnProperty('result') &&
            data.result === 'error'
          ) {
            this.errorMessage = loadError
          } else {
            this.fileRow = row
            this.src = null
            this.iframeSrc = null
            switch (data.result) {
              case 'html':
                this.iframeSrc = window.context.portal + data.pdfUrl
                this.$refs.iframeSrcSearch.handleOpen()
                break
              case 'txt':
                this.iframeSrc = window.context.portal + data.TxtUrl
                this.$refs.iframeSrcSearch.handleOpen()
                break
              case 'picture':
                this.iframeSrc = window.context.portal + data.currentUrl
                this.$refs.iframeSrcSearch.handleOpen()
                break
              case 'compress':
                this_.download(row.id)
                //todo：压缩文件预览，lyzcw 2021-06-07 09:08
                // console.log( "data：", data );
                // console.log( "data.fileTree：", data.fileTree );
                // this.fileTree = JSON.parse(data.fileTree).childList;
                // console.log( "this.fileTree：", this.fileTree );

                // this.$refs.fileTreeSearch.handleOpen();
                this.errorMessage = '不支持压缩文件的在线预览'
                break
              case 'media':
                this_.download(row.id)
                // this.$refs.videoPlayer.show();
                this.errorMessage = '不支持视频的在线播放'
                break
              default:
                this.src = window.context.portal + data.pdfUrl
                this.$refs.pdfSearch.handleOpen()
                break
            }
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    //下载附件
    download(id) {
      this.$store.dispatch('menu/downloadFile', id)
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';

.el-dialog__wrapper /deep/ {
  .preview__dialog {
    height: calc(100% - 60px);
    background: transparent;
    margin: 0 !important;

    .el-dialog__header {
      background: $--color-black;
      min-height: 20px;
      padding: 10px;
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
      width: 80%;
      background: $--color-white;
      height: calc(100% - 44px);
      margin: 0 auto;
    }
  }
}

.preview__container {
  height: 100%;
}
/*ccwgq 2022-10-08 调整关闭按钮的样式*/
/deep/ .el-dialog {
  .el-dialog__headerbtn {
    i {
      font-size: 25px;
      display: inline-block;
      vertical-align: middle;
      -webkit-transform: perspective(1px) translateZ(0);
      transform: perspective(1px) translateZ(0);
      box-shadow: 0 0 1px rgba(0, 0, 0, 0);
      -webkit-transition-duration: 0.3s;
      transition-duration: 0.3s;
      -webkit-transition-property: transform;
      transition-property: transform;
    }
    &:hover {
      i {
        -webkit-transform: scale(1.4);
        transform: scale(1.4);
      }
    }
  }
}
</style>
