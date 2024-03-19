<template>
  <!--  当拥有权限的时候  -->
  <div
    id="ou_pdf"
    style="height: 71vh; overflow-x: hidden; text-align: content"
    v-if="permission_sub != 'n'"
  >
    <!-- pdf title -->
    <div class="pdf-title">
      <div class="pdf-list">
        <span style="color: #fff; padding-right: 10px">{{
          selectFile.fileName
        }}</span>
        <span v-if="pdfList && pdfList.length > 1">
          <el-dropdown placement="bottom-end" @command="selectPdf">
            <span class="el-dropdown-link">
              切换文件<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <!-- 修复了 key属性  -->
              <el-dropdown-item
                v-for="(item, index) in pdfList"
                :key="'pdf-' + (index + 1)"
                :command="item"
                >{{ item.fileName }}</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
        </span>
      </div>
      <div class="pdf-tab">
        <!-- <el-button type="text" @click.stop="prePage">上一页</el-button>
        <span style="padding: 0 5px; color: #fff"
          >{{ pageNum }}/{{ pageTotalNum ? pageTotalNum : 0 }}</span
        >
        <el-button type="text" @click.stop="nextPage">下一页</el-button> -->
        <el-button type="text" @click.stop="clock">
          <i class="el-icon-refresh-right"></i>
        </el-button>
        <el-button type="text" @click.stop="counterClock">
          <i class="el-icon-refresh-left"></i>
        </el-button>
        <!-- <el-button type="text" @click.stop="pdfPrintAll">打印</el-button> -->
        <el-button type="text" @click.stop="pdfDownload">下载</el-button>
        <el-button type="text" @click.stop="refresh">刷新</el-button>
      </div>
    </div>
    <div class="pdf-main">
      <!-- v-if 不能和v-for同时使用   TODO:建议使用计算属性替代 -->
      <pdf
        v-show="pdfFlag"
        style="margin-top: 40px; manage: auto"
        v-for="i in numPages"
        :src="pdfSrc"
        :page="i"
        :key="i"
        :rotate="pageRotate"
        @password="password"
        @progress="loadedRatio = $event"
        @page-loaded="pageLoaded($event)"
        @num-pages="pageTotalNum = $event"
        @error="pdfError($event)"
        @link-clicked="page = $event"
      >
      </pdf>
      <pdf v-show="false" ref="pdf" :src="pdfSrc"></pdf>
    </div>
  </div>
</template>

<script>
import req from '@/request.js'
import pdf from 'vue-pdf'
import {Loading, Message} from 'element-ui'
import utils from '@/hotent-ui-util.js'
import sub_pio_mixin from '@/sub-permission-mixin.js'

export default {
  name: 'ou-pdf',
  components: {
    pdf
  },
  props: ['fileList', 'permission'],
  mixins: [sub_pio_mixin], //混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub_sub）
  computed: {
    getFileList: function() {
      return this.fileList
    }
  },
  data() {
    return {
      visiable: false,
      selectFileId: '',
      pdfSrc: '',
      pdfBlob: '',
      pdfList: [],
      pageNum: 1,
      numPages: 1,
      pageTotalNum: 1,
      pageRotate: 0,
      // 加载进度
      loadedRatio: 0,
      curPageNum: 0,
      top: 0,
      pdfFlag: true,
      selectFile: {}
    }
  },
  watch: {
    fileList: function() {
      let _this = this
      if (_this.fileList) {
        if (this.permission_sub == 'n') return
        console.log(
          'JSON.parse(_this.fileList)=======>',
          typeof JSON.parse(_this.fileList),
          JSON.parse(_this.fileList)
        )
        _this.pdfList = JSON.parse(_this.fileList).files
        _this.selectFile = _this.pdfList[0]
        this.getPdf(_this.selectFile)
      }
    },
    loadedRatio: function(newVal, oldVal) {
      let loadingInstance = Loading.service({text: '加载中...'})
      if (this.loadedRatio == 1) {
        loadingInstance.close()
      }
    },
    permission: function() {
      console.log('permission=======================>', this.permission)
    }
  },
  mounted() {
    let _this = this
    if (_this.fileList) {
      if (this.permission_sub == 'n') return
      console.log(
        'JSON.parse(_this.fileList)=======>',
        typeof JSON.parse(_this.fileList),
        JSON.parse(_this.fileList)
      )
      _this.pdfList = JSON.parse(_this.fileList).files
      _this.selectFile = _this.pdfList[0]
      this.getPdf(_this.selectFile)
    }
  },

  methods: {
    getPdf(selectFile) {
      if (this.permission_sub == 'n') return
      let _this = this
      _this.selectFile = selectFile
      var src =
        window.context.portal +
        '/file/onlinePreviewController/v1/getFileByPathAndId_' +
        selectFile.fileId +
        '_pdf'
      console.log('pdfsrc ==============>', src)
      req.get(src, 'arraybuffer').then(response => {
        _this.pdfBlob =
          window.URL.createObjectURL(
            new Blob([response.data], {type: 'application/pdf'})
          ) + '#toolbar=0'
        var loadingTask = pdf.createLoadingTask(_this.pdfBlob)
        loadingTask
          .then(pdf => {
            _this.pdfSrc = loadingTask
            _this.numPages = pdf.numPages
            _this.pdfFlag = true
          })
          .catch(err => {
            Message.error('pdf加载失败')
            console.error('pdf加载失败')
          })
      })
    },
    refresh() {
      this.pdfFlag = false
      let _this = this
      _this.getPdf(_this.selectFile)
    },
    selectPdf(pdf) {
      console.log(pdf)
      this.selectFile = pdf
      this.getPdf(pdf)
      this.pageNum = 1
      document.getElementById('ou_pdf').scrollTop = 0
    },
    handleScroll() {
      let onlineForm = document.getElementsByClassName('actiondiv')[0]
      if (onlineForm) {
        console.log('获取滚动条1', onlineForm.scrollTop)
        this.top = onlineForm.scrollTop
      }
    },

    prePage() {
      var p = this.pageNum
      p = p > 1 ? p - 1 : this.pageTotalNum
      this.pageNum = p
      document.getElementById('ou_pdf').scrollTop = 0
    },
    nextPage() {
      var p = this.pageNum
      p = p < this.pageTotalNum ? p + 1 : 1
      this.pageNum = p
      document.getElementById('ou_pdf').scrollTop = 0
    },
    clock() {
      this.pageRotate += 90
    },
    counterClock() {
      this.pageRotate -= 90
    },
    password(updatePassword, reason) {
      updatePassword(prompt('password is "123456"'))
      console.log('...reason...')
      console.log(reason)
      console.log('...reason...')
    },
    pageLoaded(e) {
      this.curPageNum = e
    },
    pdfError(error) {
      console.error('error==============>', error)
      Message.error('pdf加载失败')
    },
    pdfPrintAll() {
      this.$refs.pdf.print()
    },
    pdfPrint() {
      this.$refs.pdf.print(100, [1, 2])
    },
    pdfDownload() {
      let this_ = this
      const fileName = this.selectFile.fileName + '.pdf'
      if ('download' in document.createElement('a')) {
        // 非IE下载
        const elink = document.createElement('a')
        elink.download = fileName
        elink.style.display = 'none'
        elink.href = this_.pdfBlob
        document.body.appendChild(elink)
        elink.click()
        URL.revokeObjectURL(elink.href) // 释放URL 对象
        document.body.removeChild(elink)
      } else {
        // IE10+下载
        navigator.msSaveBlob(blob, fileName)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
.pdf-title {
  position: absolute;
  transform: translate(0%, -25%);
  right: 0px;
  margin: auto;
  /* height: 35px; */
  /* line-height: 35px; */
  z-index: 1;
  /* text-align: center; */
  background-color: #041f3a;
  width: 100%;
  line-height: 30px;
}
.pdf-main {
  max-width: 100%;
}
.pdf-list {
  /* float: left; */
  display: inline;
  padding-left: 10px;
}
.pdf-tab {
  float: right;
  padding-right: 10px;
}
</style>
