  <template>
  <el-dialog
    :visible.sync="videoDialogVisible"
    :close-on-click-modal="false"
    width="800px"
    :show-close="false"
    top="15vh"
    class="video-dialog"
    :append-to-body="true"
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
        style="
          float: right;
          padding-right: 40px;
          font-size: 20px;
          color: #8c8e92;
          cursor: pointer;
        "
        @click="videoDialogVisible = false"
      >
        <i class="el-icon-close"></i>
      </span>
    </p>
    <div class="test_two_box" v-if="videoDialogVisible">
      <video id="myVideo" class="video-js">
        <source :src="videoSrc" type="video/mp4" />
      </video>
    </div>
  </el-dialog>
</template>

<script>
/* eslint-disable */
import {Message} from 'element-ui'
import req from '@/request.js'
export default {
  name: 'TestTwo',
  props: ['fileRow'],
  data() {
    return {
      videoDialogVisible: false,
      videoSrc: '',
    }
  },
  // computed: {
  //    downloadUrl: function() {
  //     return window.context.portal+'/system/file/v1/downloadFile?fileId=' +  this.fileRow.id;
  //   }
  // },
  watch: {
    'fileRow.id': function (newVal, oldVal) {
      if (newVal) {
        let _this = this
        req
          .get(
            window.context.portal +
              '/file/onlinePreviewController/v1/getFileById_' +
              newVal,
            'arraybuffer'
          )
          .then((response) => {
            _this.videoSrc = window.URL.createObjectURL(
              new Blob([response.data], {type: 'video/mp4'})
            )
          })
      }
    },
  },
  methods: {
    initVideo() {
      //初始化视频方法
      let myPlayer = this.$video(myVideo, {
        //确定播放器是否具有用户可以与之交互的控件。没有控件，启动视频播放的唯一方法是使用autoplay属性或通过Player API。
        controls: true,
        //自动播放属性,muted:静音播放
        autoplay: 'muted',
        //建议浏览器是否应在<video>加载元素后立即开始下载视频数据。
        preload: 'auto',
        //设置视频播放器的显示宽度（以像素为单位）
        width: '800px',
        //设置视频播放器的显示高度（以像素为单位）
        height: '573x',
        playbackRates: [0.5, 1, 1.5, 2],
        language: 'zh-CN',
      })
    },
    show() {
      this.videoDialogVisible = true
      let this_ = this
      setTimeout(function () {
        this_.initVideo()
      }, 50)
    },
    //附件下载
    download() {
      req.download(this.downloadUrl)
    },
  },
}
</script>
 <style lang="scss" scoped>
.video-dialog /deep/ .el-dialog__header {
  display: none;
}
.video-dialog /deep/ .el-dialog__body {
  height: 100%;
  padding: 0px;
}
</style>