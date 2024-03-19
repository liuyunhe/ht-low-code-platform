<template>
  <div>
    <el-button
      type="success"
      icon="el-icon-document-copy"
      @click="showDialogComp()"
    >
      <span>智能比对</span>
    </el-button>
    <!--  弹窗   -->
    <el-dialog
      :visible.sync="dialogCompVisible"
      width="98.5%"
      custom-class="ouai__dialog"
      title="智能比对"
      :show-close="true"
      append-to-body
      @close="closeDialog()"
    >
      <!-- 待比对文档 -->
      <el-row :gutter="10" v-show="showDoc">
        <!-- :gutter 分栏间隔 -->
        <el-col :span="13">
          <el-card ref="leftCard" class="el-card" onclick="">
            <div slot="header" class="clearfix">
              <span>合同文本：{{ docUrl1 }}</span>
            </div>
            <el-scrollbar
              ref="docScrollbar1"
              :style="{
                height: dialogHeight - dialogGap + 'px'
              }"
            >
              <div @click="scrollDoc2" class="docPdf1">
                <pdf
                  style="margin-top: 40px"
                  ref="docPdf1"
                  v-for="i in numPages1"
                  :src="docPdfSrc1"
                  :page="i"
                  :key="i"
                  :rotate="pageRotate"
                  @progress="loadedRatio = $event"
                  @page-loaded="pageLoaded($event)"
                  @num-pages="pageTotalNum = $event"
                  @error="pdfError($event)"
                  @link-clicked="page = $event"
                >
                </pdf>
              </div>
            </el-scrollbar>
          </el-card>
        </el-col>
        <el-col :span="11">
          <el-card ref="rightCard" class="el-card" onclick="">
            <div slot="header" class="clearfix">
              <span>比对样本：<!--{{docUrl2}}--></span>
              <!--用印后-->
              <span style="position:absolute;right:180px;top:12px">
                <el-tooltip placement="right" effect="light">
                  <div slot="content">
                    与合同的用印后附件比对
                  </div>
                  <el-button
                    size="mini"
                    round
                    icon="el-icon-star-off"
                    @click="getSignedAttach()"
                    >用印后</el-button
                  >
                </el-tooltip>
              </span>
              <!--范本-->
              <span style="position:absolute;right:100px;top:12px">
                <el-tooltip placement="right" effect="light">
                  <div slot="content">
                    与合同的范本比对
                  </div>
                  <el-button
                    size="mini"
                    round
                    icon="el-icon-document"
                    @click="getPdf('fb')"
                    >范本</el-button
                  >
                </el-tooltip>
              </span>
              <!--上传-->
              <span style="position:absolute;right:20px;top:8px">
                <file-upload-ai
                  ref="fileUploadAi"
                  @updateShowDocPdf="updateShowDocPdf"
                  @updateShowDocImg="updateShowDocImg"
                  @updateDocPdfSrc="updateDocPdfSrc"
                  @updateDocImgSrc="updateDocImgSrc"
                  @updateNumPages2="updateNumPages2"
                ></file-upload-ai>
              </span>
            </div>
            <el-scrollbar
              ref="docScrollbar2"
              :style="{
                height: dialogHeight - dialogGap + 'px'
              }"
            >
              <div v-show="showDocPdf2" @click="scrollDoc1()">
                <pdf
                  style="margin-top: 40px"
                  ref="docPdf2"
                  v-for="i in numPages2"
                  :src="docPdfSrc2"
                  :page="i"
                  :key="i"
                  :rotate="pageRotate"
                  @progress="loadedRatio = $event"
                  @page-loaded="pageLoaded($event, 'right')"
                  @num-pages="pageTotalNum = $event"
                  @error="pdfError($event)"
                  @link-clicked="page = $event"
                >
                </pdf>
              </div>
              <div v-show="showDocImg2" @click="scrollDoc1()">
                <el-image :src="docImgSrc2"></el-image>
              </div>
            </el-scrollbar>
          </el-card>
        </el-col>
      </el-row>

      <!-- 比对结果 -->
      <el-row :gutter="10" v-show="showResult">
        <!-- :gutter 分栏间隔 -->
        <el-col :span="12">
          <el-card class="el-card" onclick="">
            <div slot="header" class="clearfix">
              <span>合同文本：</span>
            </div>
            <el-scrollbar
              ref="rstScrollbar1"
              :style="{
                height: dialogHeight - dialogGap + 'px'
              }"
              @mouseover="changeRstFlag(false)"
            >
              <div @click="scrollRst2()">
                <el-image :src="rstImgSrc1"></el-image>
              </div>
            </el-scrollbar>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="el-card" onclick="">
            <div slot="header" class="clearfix">
              <span>比对样本：</span>
              <!--上传-->
              <span v-if="false" style="position:absolute;right:30px;top:20px">
                <a href="#">比对报告</a>
              </span>
            </div>
            <el-scrollbar
              ref="rstScrollbar2"
              :style="{
                height: dialogHeight - dialogGap + 'px'
              }"
              @mouseover="changeRstFlag(true)"
            >
              <div @click="scrollRst1()">
                <el-image :src="rstImgSrc2"></el-image>
              </div>
            </el-scrollbar>
          </el-card>
        </el-col>
      </el-row>
      <span slot="footer" class="right-buttons">
        <el-button-group>
          <el-button
            type="danger"
            size="medium"
            round
            v-show="showCancelBtn"
            @click="closeDialog()"
            >取消</el-button
          >
          <el-button
            v-show="showStartBtn"
            type="primary"
            size="medium"
            round
            @click="startComp()"
            >开始比对</el-button
          ></el-button-group
        >
        <!-- <el-button v-show="showReportBtn" type="primary">比对报告</el-button> -->
        <el-button v-show="showReturnBtn" @click="returnDoc()">返回</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import req from '@/request.js'
import {Loading, Message} from 'element-ui'
import pdf from 'vue-pdf'
import fileUploadAi from '@/components/common/fileUploadAi.vue'
import dialogHeight from './dialog_height'
/* 浏览组件 */
export default {
  name: 'ai-compare',
  components: {
    fileUploadAi,
    pdf
  },
  props: {
    instId: null,
    defId: null,
    nodeId: null,
    //  为了获取表单的内容
    getFormData: {
      type: Function,
      default: null
    }
    // getFormKey: {
    //   type: Function,
    //   default: null
    // }
  },
  mixins: [dialogHeight],
  data() {
    return {
      alignRst1: [],
      alignRst2: [],
      docflag: false,
      rstflag: false,
      numPages1: 1,
      numPages2: 1,
      showResult: false,
      showDoc: true,
      showDocPdf2: true,
      showDocImg2: false,
      showDocPdf1: true,
      showStartBtn: true,
      showCancelBtn: true,
      showReturnBtn: false,
      showReportBtn: false,
      selectSample: 'upload',
      docPdfSrc1: '',
      docPdfSrc2: '',
      docImgSrc2: '',
      // 要比对的两个文件url，用于后端获取后请求ai引擎比对
      docUrl1: '',
      docUrl2: '',
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

      dialogCompVisible: false,
      rstImgSrc1: '',
      rstImgSrc2: '',
      dialogGap: 186
    }
  },
  created() {},
  destroyed() {},
  watch: {},
  mounted() {},
  methods: {
    scrollDoc1() {
      this.$refs['docScrollbar1'].wrap.scrollTop = this.$refs[
        'docScrollbar2'
      ].wrap.scrollTop
    },
    scrollDoc2() {
      this.$refs['docScrollbar2'].wrap.scrollTop = this.$refs[
        'docScrollbar1'
      ].wrap.scrollTop
    },
    scrollRst1() {
      let currentPos = this.$refs['rstScrollbar2'].wrap.scrollTop
      //console.log("currentPos：", currentPos );
      var num = this.alignRst2.findIndex(function(item) {
        //console.log("item：", item );
        return currentPos >= item[0] && currentPos <= item[1]
      })
      //console.log("num2：", num );
      if (num == -1) {
        this.$refs['rstScrollbar1'].wrap.scrollTop = currentPos
      } else {
        this.$refs['rstScrollbar1'].wrap.scrollTop = this.alignRst1[num][0]
      }
    },
    scrollRst2() {
      let currentPos = this.$refs['rstScrollbar1'].wrap.scrollTop
      //console.log("currentPos：", currentPos );
      var num = this.alignRst1.findIndex(function(item) {
        //console.log("item：", item );
        return currentPos >= item[0] && currentPos <= item[1]
      })
      //console.log("num1：", num );
      if (num == -1) {
        this.$refs['rstScrollbar2'].wrap.scrollTop = currentPos
      } else {
        this.$refs['rstScrollbar2'].wrap.scrollTop = this.alignRst2[num][0]
      }
    },
    updateShowDocPdf(newVal) {
      this.showDocPdf2 = newVal
    },
    updateShowDocImg(newVal) {
      this.showDocImg2 = newVal
    },
    updateDocPdfSrc(newVal, newUrl) {
      this.docPdfSrc2 = newVal
      this.docUrl2 = newUrl
    },
    updateDocImgSrc(newVal, newUrl) {
      this.docImgSrc2 = newVal
      this.docUrl2 = newUrl
    },
    updateNumPages2(newVal) {
      this.numPages2 = newVal
    },
    // getHeight() {
    //   this.autoHeight0.height = '550px' //(windowHeight - 210) + 'px';
    //   this.autoHeight.height = '550px' //(windowHeight - 210) + 'px';
    // },
    closeDialog() {
      this.dialogCompVisible = false
      // 不清空载入的文档, lyzcw: 2021-06-03 20:12
      // this.docPdfSrc1 = ''
      // this.docPdfSrc2 = ''
      // this.docImgSrc2 = ''
      // this.docUrl1 = ''
      // this.docUrl2 = ''
      // this.pageNum = 1
      // this.pageTotalNum = 1
      // this.pageRotate = 0
      //  加载进度
      // this.loadedRatio = 0
      // this.curPageNum = 0
    },
    showDialogComp() {
      let this_ = this
      if (!this_.docPdfSrc1) {
        setTimeout(() => {
          this_.getPdf('ht')
        }, 10)
      } else {
        this_.dialogCompVisible = true
      }

      //console.log("formData:", this_.$parent.getFormData());
    },

    startComp() {
      const loadingInstance = this.$loading({
        lock: true,
        text: '比对中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      let url = `${window.context.bpmRunTime}/eipx7/opun/runtime/ai/v1/docCompare?docUrl1=${this.docUrl1}&docUrl2=${this.docUrl2}`

      req.get(url).then(resp => {
        if (!resp.data || !resp.data.state || !resp.data.value) {
          console.log('比对失败resp：', resp)
          Message.error('比对失败')

          loadingInstance.close()
        } else {
          //console.log("比对成功resp：", resp.data.value );
          this.rstImgSrc1 = 'data:image/jpeg;base64,' + resp.data.value.img1
          this.rstImgSrc2 = 'data:image/jpeg;base64,' + resp.data.value.img2
          this.alignRst1 = resp.data.value.align1
          this.alignRst2 = resp.data.value.align2

          this.showDoc = false
          this.showResult = true

          this.showStartBtn = false
          this.showCancelBtn = false
          this.showReturnBtn = true
          this.showReportBtn = true

          loadingInstance.close()
        }
      })
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
    },
    //获取用印后附件，lyzcw:2021-06-02 16:50
    getSignedAttach() {
      let this_ = this
      let boData = this_.$parent.getFormData()
      console.log('boData===>', boData)
      let formKey = this_.$parent.getFormKey()
      let foData
      if (['ht','htsp','htN'].includes(formKey)) {
        foData = boData.ht
      } else if (formKey === 'htbgN') {
        foData = boData.htbg
      }
      //todo: json格式错误
      let signedJson = foData.signed_json
      console.log('json===>', signedJson)
      if (!signedJson || signedJson.trim() == '') {
        Message.error('附件不存在')
        return
      }

      let singedAttach = JSON.parse(signedJson)
      let fileId = singedAttach[0].response.fileId

      const loadingInstance1 = this.$loading({
        lock: true,
        text: '附件加载中，请耐心等待...',
        spinner: 'el-icon-loading',
        // target: '.docPdf1',
        background: 'rgba(0, 0, 0, 0.7)'
      })

      this_.showFile(fileId)
    },
    // lyzcw: 获取pdf文件
    getPdf(doc) {
      let this_ = this
      let boData = this_.$parent.getFormData()
      let formKey = this_.$parent.getFormKey()
      // console.log('formKey====>', formKey)
      let foData
      if (['ht','htsp','htN'].includes(formKey)) {
        foData = boData.ht
      } else if (formKey === 'htbgN') {
        foData = boData.htbg
      } else {
        // console.log('formKey不可预测，此formKey还没处理')
      }
      let templateId =
        foData.template_id == null || foData.template_id == ''
          ? `${window.context.defaultTemplateId}`
          : foData.template_id
      if (!templateId) {
        this_.$message({
          message: '请选择合同范本',
          type: 'warning'
        })
        return
      }

      // console.log("boData.ht：", boData.ht);
      var defId, nodeId, instId

      if (doc == 'ht') {
        defId = this_.defId
        nodeId = this_.nodeId
        instId = this_.instId
      } else if (doc == 'fb') {
        if (foData.model_def_id == null || foData.model_def_id == '') {
          this_.$message({
            message: '该合同没有选用范本',
            type: 'warning'
          })
          return
        }
        defId = foData.model_def_id
        nodeId = ''
        instId = foData.model_inst_id
        this_.showDocImg2 = false
        this_.showDocPdf2 = true
      }
      const loadingInstance1 = this.$loading({
        lock: true,
        text: 'pdf加载中，请耐心等待...',
        spinner: 'el-icon-loading',
        // target: '.docPdf1',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      // 表单校验完成后再打开比对的窗口
      this_.dialogCompVisible = true
      // #############################
      var url =
        '${form}/form/printTemplate/v1/wordPrint?id=' +
        templateId +
        '&defId=' +
        defId +
        '&nodeId=' +
        nodeId +
        '&procInstId=' +
        instId
      req.get(url).then(res => {
        if (!res.data.state) {
          this.$message({
            message: res.data.message,
            type: 'warning'
          })
          this.$nextTick(() => {
            // 以服务的方式调用的 Loading 需要异步关闭
            loadingInstance1.close()
          })
        } else {
          let url =
            window.context.portal +
            '/file/onlinePreviewController/v1/onlinePreview?fileId=' +
            res.data.value
          this.$http.get(url).then(resp => {
            let data = resp.data
            if (data.result == 'error') {
              Message.error('附件不存在')
            } else {
              req
                .get(window.context.portal + data.pdfUrl, 'arraybuffer')
                .then(response => {
                  let type = response.headers['content-type']
                  if (type) {
                    if (doc == 'ht') {
                      this_.docPdfSrc1 = window.URL.createObjectURL(
                        new Blob([response.data], {type: type})
                      )
                    } else if (doc == 'fb') {
                      this_.docPdfSrc2 = window.URL.createObjectURL(
                        new Blob([response.data], {type: type})
                      )
                    }
                  } else {
                    if (doc == 'ht') {
                      this_.docPdfSrc1 = window.URL.createObjectURL(
                        new Blob([response.data])
                      )
                    } else if (doc == 'fb') {
                      this_.docPdfSrc2 = window.URL.createObjectURL(
                        new Blob([response.data])
                      )
                    }
                  }
                  if (doc == 'ht') {
                    this_.docUrl1 = window.context.portal + data.pdfUrl
                    var loadingTask = pdf.createLoadingTask(this_.docPdfSrc1)
                    loadingTask
                      .then(pdf => {
                        this_.docPdfSrc1 = loadingTask
                        this_.numPages1 = pdf.numPages
                      })
                      .catch(err => {
                        Message.error('pdf加载失败')
                        console.error('pdf加载失败===>', err)
                      })
                  } else if (doc == 'fb') {
                    this_.docUrl2 = window.context.portal + data.pdfUrl
                    var loadingTask = pdf.createLoadingTask(this_.docPdfSrc2)
                    loadingTask
                      .then(pdf => {
                        this_.docPdfSrc2 = loadingTask
                        this_.numPages2 = pdf.numPages
                      })
                      .catch(err => {
                        Message.error('pdf加载失败')
                        console.error('pdf加载失败===>', err)
                      })
                  }
                })
              loadingInstance1.close()
            }
          })
        }
      })
    },

    async showFile(fileId) {
      //console.log("fileId", fileId );
      let this_ = this
      await this.$store
        .dispatch('menu/onlinePreview', fileId)
        .then(data => {
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
            // this.fileRow = row;
            this.src = null
            this.iframeSrc = null
            switch (data.result) {
              case 'picture':
                let docImgSrc = ''
                req
                  .get(window.context.portal + data.currentUrl, 'arraybuffer', {
                    timeout: 300000
                  })
                  .then(response => {
                    //console.log("imageResponse：", response );
                    let type = response.headers['content-type']
                    if (type) {
                      docImgSrc = window.URL.createObjectURL(
                        new Blob([response.data], {type: type})
                      )
                    } else {
                      docImgSrc = window.URL.createObjectURL(
                        new Blob([response.data])
                      )
                    }
                    this.updateShowDocPdf(false)
                    this.updateShowDocImg(true)
                    this.updateDocPdfSrc('')
                    this.updateDocImgSrc(
                      docImgSrc,
                      window.context.portal + data.currentUrl
                    )
                  })

                break
              default:
                // this_.showDocImg2 = false;
                // this_.showDocPdf2 = true;
                //console.log("docPdfSrc2：", window.context.portal + data.pdfUrl);
                //console.log("this.$parent.showDocPdf2：", this.$parent.showDocPdf2);
                req
                  .get(window.context.portal + data.pdfUrl, 'arraybuffer', {
                    timeout: 300000
                  })
                  .then(response => {
                    //console.log("docResponse：", response );
                    let type = response.headers['content-type']
                    let docPdfSrc = ''
                    if (type) {
                      docPdfSrc = window.URL.createObjectURL(
                        new Blob([response.data], {type: type})
                      )
                    } else {
                      docPdfSrc = window.URL.createObjectURL(
                        new Blob([response.data])
                      )
                    }
                    this.updateShowDocPdf(true)
                    this.updateShowDocImg(false)

                    this.updateDocImgSrc('')

                    var loadingTask = pdf.createLoadingTask(docPdfSrc)
                    loadingTask
                      .then(pdf => {
                        this.updateDocPdfSrc(
                          loadingTask,
                          window.context.portal + data.pdfUrl
                        )
                        this.updateNumPages2(pdf.numPages)
                      })
                      .catch(err => {
                        Message.error('pdf加载失败')
                        console.error('pdf加载失败===>', err)
                      })
                  })

                break
            }
          }
        })
        //.finally(() => { this.$parent.loading = false })
        .finally(() => {
          Loading.service('上传中......').close()
        })
    },
    changeDocFlag(flag) {
      this.docflag = flag
      console.log('this.docflag：', this.docflag)
    },
    changeRstFlag(flag) {
      this.rstflag = flag
    },
    // 左右滚动条滚动同步
    doc1HandleScroll() {
      console.log('docflag2：', this.docflag)
      if (!this.docflag) {
        this.$refs.docScrollbar2.scrollTop = this.$refs.docScrollbar1.scrollTop
        //console.log("this.$refs.docScrollbar2.scrollTop：", this.$refs.docScrollbar2.scrollTop)
      }
    },
    doc2HandleScroll() {
      console.log('docflag1：', this.docflag)
      if (this.docflag) {
        this.$refs.docScrollbar1.scrollTop = this.$refs.docScrollbar2.scrollTop
        //console.log("this.$refs.docScrollbar1.scrollTop：", this.$refs.docScrollbar1.scrollTop)
      }
    },
    rst1HandleScroll() {
      console.log(
        "this.$refs['rstScrollbar1'].wrap.scrollTop：",
        this.$refs['rstScrollbar1'].wrap.scrollTop
      )
      if (!this.rstflag) {
        this.$refs['rstScrollbar2'].wrap.scrollTop = this.$refs[
          'rstScrollbar1'
        ].wrap.scrollTop
        //this.$refs.rstScrollbar2.scrollTop = this.$refs.rstScrollbar1.scrollTop
      }
    },
    rst2HandleScroll() {
      console.log(
        "this.$refs['rstScrollbar2'].wrap.scrollTop：",
        this.$refs['rstScrollbar2'].wrap.scrollTop
      )
      if (this.rstflag) {
        this.$refs['rstScrollbar1'].wrap.scrollTop = this.$refs[
          'rstScrollbar2'
        ].wrap.scrollTop
        //this.$refs.rstScrollbar1.scrollTop = this.$refs.rstScrollbar2.scrollTop
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
.el-dialog__wrapper /deep/ {
  .ouai__dialog {
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
      height: calc(100%);
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
  .el-card__body {
    padding-top: 0px;
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
</style>
