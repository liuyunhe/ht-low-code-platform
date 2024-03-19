<template>
  <el-dialog
    title="智能比对"
    :visible.sync="dialogVisible"
    width="98.5%"
    append-to-body
    custom-class="smart_compare"
    @close="closeDialog()"
  >
    <!-- 待比对文档 -->
    <el-row :gutter="10">
      <el-col :span="12">
        <el-card ref="leftCard" class="left-card">
          <div slot="header" style="min-height:32px">
            <div style="float:right;margin-left:10px;">
              <el-button
                type="danger"
                size="mini"
                icon="el-icon-delete"
                round
                v-show="!!leftDocUrl || !!leftImgSrc"
                @click="clearUploadDoc('left')"
              ></el-button>
            </div>
            <div style="float:right;">
              <file-upload-sample
                ref="fileUploadSample"
                @updateShowDocPdf="updateShowDocPdf('left', $event)"
                @updateShowDocImg="updateShowDocImg('left', $event)"
                @updateDocPdfSrc="updateDocPdfSrc('left', ...arguments)"
                @updateDocImgSrc="updateDocImgSrc('left', ...arguments)"
                @updateNumPages="updateNumPages('left', $event)"
              ></file-upload-sample>
            </div>

            <span
              >合同文本：<span
                class="left-url"
                @click="
                  pasteData(
                    '.left-url',
                    leftDocUrl,
                    '复制成功,请在浏览器打开！'
                  )
                "
                >{{ leftDocUrl }}</span
              ></span
            >
          </div>
          <el-scrollbar
            ref="leftScrollBar"
            :style="{
              height: dialogHeight - dialogGap + 'px'
            }"
          >
            <div
              v-show="showLeftDocPdf"
              @click="scrollRightDoc"
              class="docPdf1"
            >
              <pdf
                style="margin-top: 40px"
                ref="leftDocPdf"
                v-for="i in leftNumPages"
                :page="i"
                :key="i"
                :rotate="leftPdf.rotate"
                @progress="leftPdf.loadedRatio = $event"
                @page-loaded="pageLoaded($event, 'left')"
                @num-pages="leftPdf.total = $event"
                @error="pdfError($event, 'left')"
                @link-clicked="page = $event"
                :src="leftDocUrl"
              ></pdf>
            </div>
            <div v-show="showLeftDocImg" @click="scrollRightDoc">
              <el-image
                :src="showResult ? leftRstImgSrc : leftImgSrc"
              ></el-image>
            </div>
          </el-scrollbar>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card ref="rightCard">
          <div slot="header" style="min-height:32px">
            <!-- TODO:增加比对报告 -->
            <div style="float:right;margin-left:10px;">
              <el-button
                type="danger"
                size="mini"
                icon="el-icon-delete"
                round
                v-show="!!rightDocUrl || !!rightImgSrc"
                @click="clearUploadDoc('right')"
              ></el-button>
            </div>
            <span style="float:right">
              <file-upload-ai
                ref="fileUploadAi"
                @updateShowDocPdf="updateShowDocPdf('right', $event)"
                @updateShowDocImg="updateShowDocImg('right', $event)"
                @updateDocPdfSrc="updateDocPdfSrc('right', ...arguments)"
                @updateDocImgSrc="updateDocImgSrc('right', ...arguments)"
                @updateNumPages2="updateNumPages('right', $event)"
              ></file-upload-ai>
            </span>
            <span
              >比对样本：<span
                class="right-url"
                @click="
                  copyData(
                    '.right-url',
                    rightDocUrl,
                    '复制成功,请在浏览器打开！'
                  )
                "
                >{{ rightDocUrl }}</span
              ></span
            >
          </div>
          <el-scrollbar
            ref="rightScrollBar"
            :style="{
              height: dialogHeight - dialogGap + 'px'
            }"
          >
            <div v-show="showRightDocPdf" @click="scrollLeftDoc">
              <pdf
                style="margin-top: 40px"
                ref="rightDocPdf"
                v-for="i in rightNumPages"
                :src="rightDocUrl"
                :page="i"
                :key="i"
                :rotate="rightPdf.rotate"
                @progress="rightPdf.loadedRatio = $event"
                @page-loaded="pageLoaded($event, 'right')"
                @num-pages="rightPdf.total = $event"
                @error="pdfError($event)"
                @link-clicked="page = $event"
              >
              </pdf>
            </div>
            <div v-show="showRightDocImg" @click="scrollLeftDoc">
              <el-image
                :src="showResult ? rightRstImgSrc : rightImgSrc"
              ></el-image>
            </div>
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>
    <!-- 比对结果 -->
    <el-row></el-row>
    <span slot="footer" class="right-buttons">
      <el-button-group>
        <el-button type="danger" size="medium" round @click="closeDialog()"
          >取消</el-button
        >
        <el-button
          :disabled="startDisabled"
          type="primary"
          size="medium"
          round
          @click="startCompare"
          >开始比对</el-button
        >
      </el-button-group>
    </span>
  </el-dialog>
</template>

<script>
import ai from '@/api/ou/aiServer'
import pdf from 'vue-pdf'
import fileUploadAi from '@/components/common/fileUploadAi.vue'
import fileUploadSample from '@/components/common/fileUploadSample'
import dialogHeight from './dialog_height'
export default {
  name: 'SmartCompare',
  components: {pdf, fileUploadAi, fileUploadSample},
  props: {
    visible: {
      type: Boolean,
      required: true
    }
  },
  mixins: [dialogHeight],
  data() {
    return {
      alignLeftRst: [],
      alignRightRst: [],
      docFlag: false,
      rstFlag: false,
      leftNumPages: 1, //左侧文档页数
      rightNumPages: 1, //右侧文档页数
      showResult: false, //显示结果
      showDoc: true, //显示文档
      showLeftDocPdf: true,
      showRightDocPdf: true,
      showLeftDocImg: false,
      showRightDocImg: false,
      showStartBtn: true,
      showCancelBtn: true,
      showReturnBtn: false,
      showReportBtn: false,
      leftDocUrl: '', //左侧的文档url
      rightDocUrl: '', //右侧的文档url
      leftImgSrc: '', //左侧图片url
      rightImgSrc: '', //右侧图片url
      leftDocTask: '', //左侧文档VuePDF task
      rightDocTask: '', //右侧文档VuePDF task
      leftRstImgSrc: '',
      rightRstImgSrc: '',
      selectSample: 'upload',
      //*   pdf相关
      /*  */
      leftPdf: {
        current: 1, //当前页数
        total: 1, //总页数
        rotate: 0, //旋转角度
        loadedRatio: 0, //加载进度
        loadingNum: 0 //已经加载的页数
      },
      rightPdf: {
        current: 1, //当前页数
        total: 1, //总页数
        rotate: 0, //旋转角度
        loadedRatio: 0, //加载进度
        loadingNum: 0 //已经加载的页数
      },
      // pdf列表
      pdfList: [],
      // 当前页数
      pageNum: 1,
      // 总页数
      pageTotalNum: 1,
      // 旋转角度
      pageRotate: 0,
      // 加载进度
      loadedRatio: 0,
      // 加载的页数
      curPageNum: 0,
      //** pdf结束
      dialogGap: 223 //窗口减去的高度
    }
  },
  computed: {
    //弹窗控制
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', false)
      }
    },
    startDisabled() {
      return !this.leftDocUrl || !this.rightDocUrl
    },
    scrollStyle() {
      const widowHeight = window.innerHeight
      const header =
        $('smart_compare .el-dialog__header').prop('offsetHeight') || 44
      const footer =
        $('smart_compare .el-dialog__footer').prop('offsetHeight') || 58
      return `height:${windowHeight - (115 + header + footer) + 'px'}`
    }
  },
  methods: {
    //复制数据到剪贴板,方便用户
    copyData(selector, data, message) {
      message = message || '复制成功'
      const cb = new Clipboard(selector, {
        text: () => {
          return data
        }
      })
        .on('success', () => {
          this.$message.success(message)
          cb.destroy()
        })
        .on('error', () => {
          // this.$message.error('复制失败')
          cb.destroy()
        })
    },
    /*开始比对*/
    startCompare() {
      const loadingInstance = this.$loading({
        lock: true,
        text: '比对中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      ai.smartCompare(this.leftDocUrl, this.rightDocUrl, data => {
        if (!data || !data.state || !data.value) {
          console.error('比对失败')
          loadingInstance.close()
        } else {
          this.leftRstImgSrc = 'data:image/jpeg;base64,' + data.value.img1
          this.rightRstImgSrc = 'data:image/jpeg;base64,' + data.value.img2
          this.alignLeftRst = data.value.align1
          this.alignRightRst = data.value.align2

          this.showDoc = false
          this.showResult = true //控制显示的是上传的图片还是结果的图片

          this.showStartBtn = false
          this.showCancelBtn = false
          this.showReturnBtn = true
          this.showReportBtn = true

          this.showLeftDocImg = true
          this.showRightDocImg = true

          this.showLeftDocPdf = false
          this.showRightDocPdf = false

          loadingInstance.close()
          this.$message.success('比对完成')
        }
      })
    },
    switchDoc(type) {
      if (type == 'left') {
      } else if (type == 'right') {
      } else {
      }
    },
    closeDialog() {
      const origanData = this.$options.data()
      this.leftDocUrl = origanData.leftDocUrl
      this.leftDocTask = origanData.leftDocTask
      this.leftImgSrc = origanData.leftImgSrc
      this.showLeftDocPdf = origanData.showLeftDocPdf
      this.showLeftDocImg = origanData.showLeftDocImg

      this.rightDocUrl = origanData.rightDocUrl
      this.rightDocTask = origanData.rightDocTask
      this.rightImgSrc = origanData.rightImgSrc
      this.showRightDocPdf = origanData.showRightDocPdf
      this.showRightDocImg = origanData.showRightDocImg

      this.dialogVisible = false
    },
    //更新文档PDF的显示控制
    updateShowDocPdf(type, newVal) {
      if (type == 'left') {
        this.showLeftDocPdf = newVal
      } else if (type == 'right') {
        this.showRightDocPdf = newVal
      } else {
      }
    },
    //更新文档图片的显示控制
    updateShowDocImg(type, nVal) {
      if (type == 'left') {
        this.showLeftDocImg = nVal
      } else if (type == 'right') {
        this.showRightDocImg = nVal
      } else {
      }
    },
    /** 更新PDF加载任务，文件路径 */
    updateDocPdfSrc(type, task, url) {
      if (type == 'left') {
        this.leftDocTask = task
        this.leftDocUrl = url
      } else if (type == 'right') {
        this.rightDocUrl = url
        this.rightDocTask = task
      } else {
      }
    },
    //更新图片加载任务以及图片的路径
    updateDocImgSrc(type, newVal, newUrl) {
      if (type == 'left') {
        this.leftImgSrc = newVal
        this.leftDocUrl = newUrl
      } else if (type == 'right') {
      } else {
        this.rightImgSrc = newVal
        this.rightDocUrl = newUrl
      }
    },
    //更新文档的页数
    updateNumPages(type, pages) {
      type == 'left'
        ? (this.leftNumPages = pages)
        : type == 'right'
        ? (this.rightNumPages = pages)
        : ''
    },
    /**左侧文档滚动 */
    scrollLeftDoc() {
      if (!!this.leftDocUrl || !!this.leftImgSrc) {
        this.$refs['leftScrollBar'].wrap.scrollTop = this.$refs[
          'rightScrollBar'
        ].wrap.scrollTop
      }
    },
    /**右侧文档滚动 */
    scrollRightDoc() {
      if (!!this.rightDocUrl || !!this.rightImgSrc) {
        this.$refs['rightScrollBar'].wrap.scrollTop = this.$refs[
          'leftScrollBar'
        ].wrap.scrollTop
      }
    },
    //清空本文档的数据
    clearUploadDoc(type) {
      if (type == 'left') {
        this.showLeftDocPdf = false
        this.showLeftDocImg = false
        this.leftDocUrl = ''
        this.leftImgSrc = ''
      } else if (type == 'right') {
        this.showRightDocPdf = false
        this.showRightDocImg = false
        this.rightDocUrl = ''
        this.rightImgSrc = ''
      } else {
      }
    },
    scrollLeftRst() {
      let currentPos = this.$refs['rstScrollbar2'].wrap.scrollTop
      var num = this.alignRst2.findIndex(function(item) {
        return currentPos >= item[0] && currentPos <= item[1]
      })
      if (num == -1) {
        this.$refs['rstScrollbar1'].wrap.scrollTop = currentPos
      } else {
        this.$refs['rstScrollbar1'].wrap.scrollTop = this.alignRst1[num][0]
      }
    },
    scrollRightRst() {
      let currentPos = this.$refs['rstScrollbar1'].wrap.scrollTop
      var num = this.alignRst1.findIndex(function(item) {
        return currentPos >= item[0] && currentPos <= item[1]
      })
      if (num == -1) {
        this.$refs['rstScrollbar2'].wrap.scrollTop = currentPos
      } else {
        this.$refs['rstScrollbar2'].wrap.scrollTop = this.alignRst2[num][0]
      }
    },
    getHeight() {
      this.autoLeftHeight.height = '600px'
      this.autoRightHeight.height = '600px'
    },
    pageLoaded(e, type) {
      type == 'left'
        ? (this.leftPdf.loadingNum = e)
        : (this.rightPdf.loadingNum = e)
    },
    pdfError(err, type) {
      console.error(`${type} pdf error===>`, err)
    },
    returnDoc() {
      this.showDoc = true
      this.showResult = false

      this.showStartBtn = true
      this.showCancelBtn = true
      this.showReturnBtn = false
      this.showReportBtn = false
    },

    pageLoaded(e) {
      this.curPageNum = e
    },
    pdfError(error) {
      console.error('error==============>', error)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
.el-dialog__wrapper /deep/ {
  .smart_compare {
    background: $--color-white;
    margin: 0px !important;
    padding: 10px;
    border-radius: 3px;
    .el-dialog__header {
      background: $--color-white;
      padding: 10px;
    }
    .el-dialog__body {
      width: 100%;
      background: $--color-white;
      margin: 0 auto;
      padding: 0;
      overflow: hidden;
    }
    .el-dialog__footer {
      padding-bottom: 0;
    }
  }
}

/deep/ .el-card {
  .el-card__header {
    position: relative;
    padding: 18px 10px;
  }
}

.right-button {
  position: absolute;
  right: 10px;
  bottom: 10px;
  height: 33px;
}

/deep/ .el-scrollbar__wrap {
  overflow-x: hidden;
}
/deep/ .upload-demo {
  margin: 0;
}
</style>
