<template>
  <div>
    <!-- 打印预览只有在 表单的formkey 合同 合同审批 合同变更 范本 时才可以使用 -->
    <!-- TODO:自定义移动端的打印预览套件  部分参考FilePreview组件的设计 -->
    <el-button v-if="visible" type="info" @click="showPrint" round
      >预览</el-button
    >
    <el-dialog
      class="ou-dialog"
      title="预览"
      :visible.sync="showPrintDialog"
      :fullscreen="true"
      :show-close="true"
      :append-to-body="true"
      @opened="opened"
    >
      <div class="preview__container" style="height: auto">
        <Loading v-if="loading"></Loading>
        <!-- 预览pdf.word等文件格式 -->
        <Pdf
          ref="pdfSearch"
          :src="pdf.src"
          :closeable="true"
          @close="close"
          @pageChange="pdfPageChange"
          @pdf-loaded="loading = false"
        />
        <el-button
          circle
          style="position:fixed;bottom:8rem;right:0.5rem;z-index:9999"
          icon="el-icon-error"
          @click="showPrintDialog = false"
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
        ></el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import req from '@/request.js'
import Pdf from '@/components/common/pdf'
import Loading from '@/components/common/Loading'
import {Notify} from 'vant'
export default {
  name: 'ou-print',
  /**
   * defId: 定义id,instId:实例id,type:[start:开始未启动的,task:启动中的，done:完成的]
   */
  props: {
    defId: {
      type: String
    },
    instId: {
      type: String
    },
    type: {
      type: String,
      required: true,
      validate: value => ['start', 'task', 'done'].includes(value)
    }
  },
  data: function() {
    return {
      showPrintDialog: false,
      formKey: '',
      numPages: 0,
      previewWordPdfSrc: '',
      watermarkSetting: null,
      fileId: '',
      pdf: {
        loading: false,
        finished: false,
        blob: '',
        src: ''
      },
      templateId: '',
      cont_id: '',
      loading: false,
      modelName: '', //数据模型名  要么是ht(合同，合同审批，合同变更)，要么是范本（合同范本）
      curScale: 1, //收缩尺度,
      fvm: null, //表单组件实例,
      visible: false
    }
  },
  components: {
    Pdf,
    Loading
  },
  mounted() {
    this.getFormKey()
  },
  methods: {
    visibleFn() {
      if (this.type == 'start') {
        let fvm = null
        const svm = this.$parent.$parent.$parent
        fvm = svm.$refs.formContent
        if (
          fvm &&
          fvm.data &&
          (typeof fvm.data.ht === 'object' || typeof fvm.data.htfb === 'object')
        ) {
          this.visible = true
        } else {
          this.visible = false
        }
      } else if (this.type == 'task') {
        this.visible = false
      } else if (this.type == 'done') {
        this.visible = false
      } else {
        this.visible = false
      }
    },
    getFormKey() {
      // console.log('ouprint getFormKey执行了')
      const that = this
      if (
        this.instId == '' ||
        this.instId === null ||
        this.defId == '' ||
        this.defId === null
      ) {
        //定义id和实例id不能为空
        // console.log('参数可能为空,instId,defId', this.instId, this.defId)
        this.visible = false
        that.$emit('handleRemove')
        return
      }
      let url =
        `${
          window.context.bpmRunTime
        }/runtime/instance/v1/printBoAndFormKey?defId=` +
        `${that.defId}&nodeId=''&procInstId=${that.instId}`
      req.get(url).then(res => {
        if (res.data) {
          const {data} = res
          //todo:设置PC表单别名和移动端表单别名的映射关系,如果以后涉及的表单别名有变化请及时更改
          let map = new Map()
          //合同
          map.set('ht', 'htmobile')
          //合同变更
          // map.set('htbgN', 'htbgNmobile')
          //合同审批
          // map.set('htsp', 'htspmobile')
          //范本
          map.set('fb', 'fbmobile')
          //容错，防止得到的表单别名不是需要的
          if ([...map.keys()].includes(data.formKey)) {
            switch (data.formKey) {
              case 'ht':
                // that.cont_id=data.bodata
                that.cont_id = data.boData.ht.id_
                that.templateId = data.boData.ht.template_id
                break
              case 'htsp':
                that.cont_id = data.boData.ht.id_
                that.templateId = data.boData.ht.template_id
                break
              case 'htbgN':
                that.cont_id = data.boData.htbg.id_
                that.templateId = data.boData.htbg.template_id
                break
              case 'fb':
                that.cont_id = data.boData.htfb.id_
                that.templateId = data.boData.htfb.template_id
                break
              default:
                break
            }
            that.formKey = map.get(data.formKey)
            this.visible = true
            //通知父组件添加
            that.$emit('handleAdd')
          } else {
            //通知父组件移除
            this.visible = false
            that.$emit('handleRemove')
          }
        } else {
          that.$emit('handleRemove')
        }
      })
      // console.log('接口被请求====>')
    },
    //关闭弹窗
    close() {
      this.showPrintDialog = false
    },
    //下载文件
    download() {
      req.download(
        '${portal}/system/file/v1/downloadFile?fileId=' + this.fileId
      )
    },
    //收缩放大
    scale(type) {
      let el = null
      el = document.getElementById('touchPad')
      if (type == 'enlarge') {
        this.curScale += 0.2
        if (this.curScale > 3) {
          this.curScale = 3
        }
        el.style.transform = 'scale(' + this.curScale + ')'
      } else if (type == 'reduce') {
        this.curScale -= 0.2
        if (this.curScale < 1) {
          this.curScale = 1
        }
        el.style.transform = 'scale(' + this.curScale + ')'
      }
    },
    pdfPageChange() {
      let el = document.getElementById('touchPad')
      this.curScale = 1
      el.style.transform = 'scale(' + this.curScale + ')'
    },
    opened() {
      this.curScale = 1
    },
    showPrint() {
      const that = this
      let fvm = null
      if (that.type == 'start') {
        const svm = that.$parent.$parent.$parent
        fvm = svm.$refs.formContent
      } else if (that.type == 'task') {
        const tvm = that.$parent
        fvm = tvm.$refs.formContent
      } else if (that.type == 'done') {
        const dvm = that.$parent
        fvm = dvm.$refs.doneAction.$refs.doneFormContent
      }
      if (
        fvm.data &&
        (fvm.data.hasOwnProperty('ht') || fvm.data.hasOwnProperty('htfb'))
      ) {
        if (fvm.data.hasOwnProperty('ht')) {
          this.dealContractData(fvm)
        }
        if (fvm.data.hasOwnProperty('htfb')) {
          this.dealTemplateData(fvm)
        }
      } else {
        //未获得表单组件实例
        Notify('预览失败')
        // console.log('预览失败原因:获取不到表单组件实例')
      }
    },
    /**
     * 处理合同数据
     * 先去查找合同附件中有无fileId的记录，没有就请求模板信息
     * */
    async dealContractData(fvm) {
      const that = this
      //  附件数据信息，合同附件，(合同，合同变更，合同审批)
      let attachJson = fvm.data.ht.cont_json
      try {
        attachJson = JSON.parse(attachJson)
      } catch {
        attachJson = []
      }
      if (
        attachJson[0] &&
        attachJson[0].response &&
        attachJson[0].response.fileId
      ) {
        this.fileId = attachJson[0].response.fileId
      } else {
        //请求获取表单实例
        if (fvm.data.ht && fvm.data.ht.template_id)
          if (this.templateId === '' || this.templateId === null) {
            this.templateId = window.context.defaultTemplateId
          }
        let url, res
        url =
          '${form}/form/printTemplate/v1/wordPrint?id=' +
          that.templateId +
          '&defId=' +
          that.defId +
          '&nodeId=' +
          '' +
          '&procInstId=' +
          that.instId
        res = await req.get(url)
        if (res.data && res.data.value) {
          this.fileId = res.data.value
        } else {
          Notify('预览失败')
        }
      }
    },
    /**处理范本模板数据*/
    dealTemplateData(fvm) {
      //查找template_file_id
      this.fileId = fvm.data.htfb.template_file_id
    }
  },
  watch: {
    //fileID一旦发生了变化就请求接口查询文件的路径，组装赋值
    fileId: function(val) {
      if (val !== null && val != '') {
        req
          .get(
            `${
              window.context.portal
            }//file/onlinePreviewController/v1/onlinePreview?fileId=${
              this.fileId
            }`
          )
          .then(res => {
            if (res.data.pdfUrl) {
              this.pdf.src = window.context.portal + res.data.pdfUrl
              this.showPrintDialog = true
              // this.loading = true
            } else {
              //请求数据失败
              Notify('预览失败')
            }
          })
      } else {
        Notify('预览失败')
      }
    },
    defId: function(val) {
      // console.log('defId change')
      this.getFormKey()
    },
    instId: function(val) {
      this.getFormKey()
    },
    showPrintDialog: function(val) {
      let navs = document.getElementsByClassName('van-nav-bar--fixed')
      if (val) {
        navs[0].setAttribute('style', '')
      } else {
        navs[0].setAttribute('style', 'z-index:9999')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ van-nav-bar {
  z-index: 0;
}
.ou-dialog /deep/ {
  .el-dialog__header {
    z-index: 999999 !important;
  }
  .el-dialog__body {
    padding: 10px 2px;
  }
}
</style>
