<template>
  <el-dialog
    title="智能提取"
    :visible.sync="dialogVisible"
    width="98.5%"
    append-to-body
    custom-class="ouai_dialog"
    ref="dialog"
    @close="closeDialog"
  >
    <el-row :gutter="10">
      <!-- 左侧是上传的文档(doc,pdf)或者图片 -->
      <el-col
        :span="16"
        element-loading-text="图片加载中,请稍后..."
        v-loading="leftLoading"
      >
        <el-card class="left-card">
          <div slot="header" class="clearfix">
            <div style="float:right;margin-left:10px;">
              <el-button
                type="danger"
                size="mini"
                icon="el-icon-delete"
                round
                v-show="!!docPdfSrc || !!docImgSrc"
                @click="clearUploadDoc()"
              ></el-button>
            </div>
            <div style="float:right">
              <file-upload-sample
                ref="fileUploadSample"
                @updateShowDocPdf="updateShowDocPdf"
                @updateShowDocImg="updateShowDocImg"
                @updateDocPdfSrc="updateDocPdfSrc"
                @updateDocImgSrc="updateDocImgSrc"
                @updateNumPages="updateNumPages"
              ></file-upload-sample>
            </div>
            <span
              >合同文本：<span
                class="copy-url"
                @click.self="
                  pasteData('.copy-url', docPdfSrc, '复制成功,请在浏览器打开')
                "
                >{{ docPdfSrc }}</span
              ></span
            >
          </div>
          <el-scrollbar
            ref="leftScrollbar"
            :style="{height: dialogHeight - dialogGap + 'px'}"
          >
            <!--TODO:显示图片/做到结果和原图片的切换 -->
            <div v-if="!showResult && showDocImg">
              <el-image ref="img" :src="docImgSrc"></el-image>
            </div>
            <div v-else-if="!showResult && showDocPdf">
              <pdf
                ref="docPdf"
                v-for="i in pdf.loadingPages"
                :src="docPdfSrc"
                :page="i"
                :key="i"
                :rotate="pdf.rotate"
                @progress="pdf.loadedRatio = $event"
                @page-loaded="pageLoaded($event)"
                @num-pages="pdf.total = $event"
                @error="pdfError($event)"
                @link-clicked="page = $event"
              ></pdf>
            </div>
            <div v-else-if="showResult">
              <el-image ref="img" :src="rstImgSrc"></el-image>
            </div>
          </el-scrollbar>
        </el-card>
      </el-col>
      <!-- 右侧是JSON表单 -->
      <el-col :span="8">
        <el-card ref="rCard">
          <!-- card header -->
          <div slot="header" ref="header">
            <div>
              <el-button
                :disabled="disableExtractBtn"
                type="primary"
                size="mini"
                round
                @click="startExtract()"
                >智能提取</el-button
              >
              <el-button
                class="copy-btn"
                v-show="showResult"
                type="success"
                size="mini"
                round
                @click="copyData()"
                >提取复制</el-button
              >
            </div>
          </div>
          <!-- 表格显示要素项目 -->
          <!-- 仅当数据正确请求回来的时候显示 -->
          <el-scrollbar
            ref="rightScrollbar"
            :style="{height: dialogHeight - dialogGap + 'px'}"
          >
            <!-- 指定右侧的高度   dialog height:44px -->
            <div>
              <el-table
                ref="table"
                highlight-current-row
                :data="aiData"
                v-show="aiData.length > 0"
              >
                <el-table-column
                  header-align="center"
                  prop="label"
                  label="要素"
                  width="100px"
                >
                  <template slot-scope="scope">
                    <td
                      colspan="1"
                      rowspan="1"
                      :style="{cursor: scope.row.order ? 'crosshair' : 'text'}"
                      @click="scrollDoc(scope.row.order)"
                    >
                      <p class="cell" style="padding-left:8px;">
                        {{ scope.row.label }}
                      </p>
                    </td>
                  </template>
                </el-table-column>
                <el-table-column label="内容" header-align="center">
                  <template slot-scope="scope">
                    <ht-input
                      style="width: 100%;"
                      :rows="5"
                      v-model="aiData[scope.$index]['value']"
                      :type="
                        aiData[scope.$index]['value'].trim().length >= 100
                          ? 'textarea'
                          : 'text'
                      "
                    ></ht-input>
                  </template>
                </el-table-column>
              </el-table></div
          ></el-scrollbar>
        </el-card>
      </el-col>
    </el-row>
    <div slot="footer"></div>
  </el-dialog>
</template>

<script>
import fileUploadSample from '@/components/common/fileUploadSample'
import {Loading, Message} from 'element-ui'
import pdf from 'vue-pdf'
import ai from '@/api/ou/aiServer'
import dialogHeight from './dialog_height'
const isEmpty = function(value) {
  return value === '' || value === null
}
//弹窗
export default {
  name: 'SmartExtract',
  components: {
    fileUploadSample,
    pdf
  },
  props: {
    visible: {
      type: Boolean,
      required: true
    }
  },
  mixins: [dialogHeight],
  data() {
    return {
      aiData: [], //存放智能数据
      taskId: '', //请求任务id,
      showDocPdf: '', //显示文档PDF
      showDocImg: '', //显示文档图片
      showResult: false, //显示结果控制
      docPdfSrc: '', // 上传doc或者PDF的时候的路径
      docPdf: '', //实际为vue-pdf中的
      pdf: {
        current: 1,
        total: 1,
        rotate: 0,
        loadedRatio: 0,
        loadingPages: 0
      },
      docImgSrc: '', //上传图片时，图片的路径
      numPages: 0,
      loadingTask: null, //vuePDf的Task, 类Promise对象
      autoHeight: {
        height: '550px'
      },
      // showUploadButton: true, //决定上传按钮的隐藏显示与否
      showAiDataButton: true, //控制智能提取按钮
      //loading
      leftLoading: false,
      rightLoading: false,
      rstImgSrc: '', //结果文档是渲染的图片路径
      //希望减掉的窗口高度
      dialogGap: 155
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', false)
      }
    },
    disableExtractBtn() {
      return !this.showDocPdf && !this.showDocImg
    }
  },
  mounted() {},
  methods: {
    //清空上传文本
    clearUploadDoc() {
      this.showDocPdf = true
      this.showDocImg = false
      this.docPdfSrc = ''
      this.docImgSrc = ''
      this.showResult = false
    },
    //关闭弹窗
    closeDialog() {
      const origanData = this.$options.data()
      this.showDocPdf = origanData.showDocPdf
      this.showDocImg = origanData.showDocImg
      this.docPdfSrc = origanData.docPdfSrc
      this.docImgSrc = origanData.docImgSrc
      this.rstImgSrc = origanData.rstImgSrc
      this.showResult = false
      this.aiData = []

      this.dialogVisible = false
    },
    //文档滚动
    scrollDoc(yPos) {
      if (yPos >= 0) {
        this.$refs['leftScrollbar'].wrap.scrollTop = yPos - 100
      }
    },
    updateShowDocPdf(nVal) {
      this.showDocPdf = nVal
      this.clearAiData()
    },
    updateShowDocImg(nVal) {
      this.showDocImg = nVal
      this.clearAiData()
    },
    updateDocPdfSrc(task, url) {
      this.docPdf = task
      this.docPdfSrc = url
    },
    updateDocImgSrc(task, url) {
      this.docPdf = task
      this.docImgSrc = url
    },
    updateNumPages(nVal) {
      this.pdf.loadingPages = nVal
    },
    pageLoaded(e) {
      console.log('pdf has loaded finished!')
    },
    pdfError(err) {
      console.error(err)
    },
    startExtract() {
      this.showResult = false
      //保证传入的url不为空
      let url = ''
      if (this.showDocPdf) {
        url = this.docPdfSrc
      }
      if (this.showDocImg) {
        url = this.docImgSrc
      }

      if (!url) {
        Message.warning('请上传合同文件')
        return
      }
      //TODO:计算需要的文档宽度  width
      const params = {
        docUrl: url
      }
      const loadingInstance = this.$loading({
        lock: true,
        text: '要素加载中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      ai.smartExtract(params, data => {
        if (!data.state) {
          //失败
          loadingInstance.close()
          return
        }
        const aiData = data.value.value
        //格式化请求回来的数据
        this.dealRawAiData(aiData)
        const baseImg = data.value.img
        this.dealRawBase64Data(baseImg)
        this.showResult = true
        loadingInstance.close()
        Message.success('智能提取完成')
      })
    },
    dealRawAiData(aiData) {
      const _this = this
      if (typeof aiData === 'string') {
        aiData = JSON.parse(aiData)
      }
      _this.aiData = []
      for (let key in aiData) {
        let item = {name: key, ...aiData[key]}
        if (item.value && item.value.trim().length > 0) {
          item.value = item.value.replace(/\s/g, '')
          _this.aiData.push(item)
        }
      }
      //根据系统本身的默认规则排序
      _this.aiData.sort((pre, cur) => pre.label.localeCompare(cur.label))
    },
    //处理base64的图片
    dealRawBase64Data(base64Data) {
      let bstr = base64Data
      let n = bstr.length
      let u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      this.rstImgSrc = 'data:image/png;base64,' + base64Data
      // this.rstImgSrc = window.URL.createObjectURL(
      //   new Blob([u8arr], {type: 'png'})
      // )
    },
    //点击复制按钮一键复制提取的内容
    copyData() {
      let i = -1
      let transferData = ''
      while (++i < this.aiData.length) {
        transferData += `${this.aiData[i].label}：${this.aiData[i].value}\n`
      }
      this.pasteData('.copy-btn', transferData, '复制成功', '复制失败')
    },
    clearAiData() {
      this.showResult = false
      this.aiData = []
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
.el-dialog__wrapper /deep/ {
  .ouai_dialog {
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
      height: 0px !important;
    }
  }
}
/deep/ .el-message {
  min-width: fit-content !important;
}
/deep/ .el-card {
  .el-card__header {
    height: 55px !important;
  }
  .el-card__body {
    width: 100%;
    background: $--color-white;
    // height: calc(100%);
    margin: 0 auto;
    padding: 0;
    overflow: hidden;
  }
}

.el-card__right {
  position: relative;
}

/deep/.el-scrollbar__wrap {
  overflow-x: hidden !important;
}
.left-card {
  /deep/ .el-card__header {
    position: relative;
  }
}

/deep/ .upload-demo {
  margin: 0;
}
</style>
