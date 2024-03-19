<template>
  <div>
    <el-button type="default" icon="el-icon-view" @click="showPrint()">
      <span>预览</span>
    </el-button>
    <FlowPrint
      ref="flowPrint"
      :formKey="formKey"
      :instId="instId"
      @printWordTemplate="printWordTemplate"
      @previewWordTemplate="previewWordTemplate"
      @printHtml="printHtml"
    />

    <el-dialog
      title="word预览"
      :visible.sync="previewWordDialog"
      width="90%"
      style="margin-top:-100px !important;"
    >
      <iframe
        :src="previewWordPdfSrc"
        name="previewWord"
        style="width:100%;border:0;"
        align="middle"
        :height="previewWordHeight"
      ></iframe>
    </el-dialog>
  </div>
</template>
<script>
import req from '@/request.js'
import {Loading, Message} from 'element-ui'
import FlowPrint from '@/components/flow/flowPrint.vue'
import utils from '@/utils.js'

/* 自定义打印 */
export default {
  name: 'ou-print',
  components: {
    FlowPrint
  },
  props: {
    getFormData: {
      type: Function,
      default: null
    },
    getFormKey: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      formKey: '',
      boAlias: '',
      subTableName: '',
      templateId: '',
      defId: '',
      nodeId: '', //当前任务节点
      instId: '',
      isPkg: '00', //是否打包合同
      busiId: '',
      previewWordDialog: false,
      previewWordHeight: 600,
      previewWordPdfSrc: ''
    }
  },
  created() {},
  destroyed() {},
  watch: {},
  methods: {
    showPrint() {
      let _this = this
      _this.formKey = _this.getFormKey()
      // console.log('formKey====>', _this.formKey)
      if (!_this.formKey || _this.formKey == '') {
        if (!_this.nodeId) {
          _this.nodeId = ''
        }

        // console.log(
        //   `请求的参数defId=${_this.defId},nodeId=${_this.nodeId},instId=${_this.instId}`
        // )

        if (!_this.defId || !_this.instId) {
          _this.$message.warning('请先启动流程')
          return
        }

        var url =
          '${bpmRunTime}/runtime/instance/v1/printBoAndFormKey?defId=' +
          _this.defId +
          '&nodeId=' +
          _this.nodeId +
          '&procInstId=' +
          _this.instId

        req.get(url).then(res => {
          if (res.data) {
            _this.formKey = res.data.formKey
            let param = {
              pageBean: {page: 1, pageSize: 20, total: 0},
              querys: [
                {
                  group: 'defaultQueryGroup',
                  operation: 'EQUAL',
                  relation: 'AND',
                  property: 'formKey',
                  value: this.formKey
                }
              ]
            }
            req
              .post(
                req.getContext().form + '/form/printTemplate/v1/getPrintList',
                param
              )
              .then(response => {
                if (response.data.rows && response.data.rows.length > 0) {
                  _this.$refs.flowPrint.handleOpen() //父组件调用子组件方法
                } else {
                  _this.printHtml()
                }
              })
          }
        })
        // lyzcw：合同表单，直接从表单中获取套打模板ID
        //ccwgq 2022-06-13 合同表单新版formKey:htN
      } else if (
        ['ht','htN','htsp','fb','htbgN'].includes(_this.formKey)
      ) {
        _this.ouPrint()
      } else {
        let param = {
          pageBean: {page: 1, pageSize: 20, total: 0},
          querys: [
            {
              group: 'defaultQueryGroup',
              operation: 'EQUAL',
              relation: 'AND',
              property: 'formKey',
              value: _this.formKey
            }
          ]
        }
        req
          .post(
            req.getContext().form + '/form/printTemplate/v1/getPrintList',
            param
          )
          .then(response => {
            if (response.data.rows && response.data.rows.length > 0) {
              _this.$refs.flowPrint.handleOpen() //父组件调用子组件方法
            } else {
              _this.printHtml()
            }
          })
      }
    },
    //未设置word套打模板，直接调用打印
    printHtml(data) {
      //   if (this.type != "doneList") {
      //     this.$refs.flowAction.hiddenOpertion();
      //   } else {
      //     this.$refs.doneAction.hiddenOpertion();
      //   }

      let this_ = this
      //   this_.$parent.hiddenOpertion();

      setTimeout(() => {
        document.getElementsByTagName('body')[0].style.zoom = 0.8
        window.print()
        utils.reload()
        document.getElementsByTagName('body')[0].style.zoom = 1
      }, 500)
    },
    previewWordTemplate(data) {
      if (!data) {
        this.$message({
          message: '请选择打印模板',
          type: 'warning'
        })
        return false
      }
      if (data && data.printType == 'form') {
        this.$message({
          message: '请选择word套打模板',
          type: 'warning'
        })
        return false
      }
      //todo:请求前校验字段
      Loading.service('表单打印中')
      var url =
        '${form}/form/printTemplate/v1/wordPrint?id=' +
        data.id +
        '&defId=' +
        this.defId +
        '&nodeId=' +
        this.nodeId +
        '&procInstId=' +
        this.instId
      req.get(url).then(res => {
        let loadingInstance = Loading.service('表单打印中')
        if (!res.data.state) {
          this.$message({
            message: res.data.message,
            type: 'warning'
          })
          this.$nextTick(() => {
            // 以服务的方式调用的 Loading 需要异步关闭
            loadingInstance.close()
          })
        } else {
          let url =
            window.context.portal +
            '/file/onlinePreviewController/v1/onlinePreview?fileId=' +
            res.data.value
          this.$http.get(url).then(resp => {
            let data = resp.data
            if (data == null || data.result == 'error') {
              Message.error('模板不存在，请选择一个打印模板')
            } else {
              req
                .get(window.context.portal + data.pdfUrl, 'arraybuffer')
                .then(response => {
                  let type = response.headers['content-type']
                  if (type) {
                    this.previewWordPdfSrc = window.URL.createObjectURL(
                      new Blob([response.data], {type: type})
                    )
                  } else {
                    this.previewWordPdfSrc = window.URL.createObjectURL(
                      new Blob([response.data])
                    )
                  }
                  this.previewWordDialog = true
                })
              Loading.service('表单打印中').close()
            }
          })
        }
      })
    },
    printWordTemplate(data) {
      if (!data) {
        this.$message({
          message: '请选择打印模板',
          type: 'warning'
        })
        return false
      }
      if (data && data.printType == 'form') {
        this.$message({
          message: '请选择word套打模板',
          type: 'warning'
        })
        return false
      }
      Loading.service('表单打印中')
      var url =
        '${form}/form/printTemplate/v1/wordPrint?id=' +
        data.id +
        '&defId=' +
        this.defId +
        '&nodeId=' +
        this.nodeId +
        '&procInstId=' +
        this.instId
      req.get(url).then(res => {
        let loadingInstance = Loading.service('表单打印中')
        if (!res.data.state) {
          this.$message({
            message: res.data.message,
            type: 'warning'
          })
          this.$nextTick(() => {
            // 以服务的方式调用的 Loading 需要异步关闭
            loadingInstance.close()
          })
        } else {
          req
            .download(
              '${portal}/system/file/v1/downloadFile?fileId=' + res.data.value
            )
            .then(r => {
              this.$nextTick(() => {
                // 以服务的方式调用的 Loading 需要异步关闭
                loadingInstance.close()
              })
            })
        }
      })
    },
    // lyzcw: 自定义打印预览：从表单获取套打模板ID
    ouPrint() {
      let this_ = this
      let boData = this_.getFormData()
      // lyzcw: 2021-08-26 合同和合同变更如果有合同附件，直接预览该附件，多附件只预览第一个，并提示到在表单里预览
      var contJsonStr
      if (['ht','htN', 'htsp'].includes(this_.formKey)) {
        contJsonStr = boData.ht.cont_json
      } else if (this.formKey == 'htbgN') {
        contJsonStr = boData.htgb.cont_json
      }
      if (typeof contJsonStr == 'string') {
        try {
          var contJson = JSON.parse(contJsonStr)
          if (typeof contJson == 'object' && contJson) {
            if (contJson.size > 0) {
              this.$message.warning(
                '合同附件有多个，这是第一个附件，其他请在表单的“合同附件里预览”'
              )
            }
            var obj = {}
            console.log('预览获取的合同附件json：', JSON.stringify(contJson))
            obj.id = contJson[0].response.fileId
            obj.name = contJson[0].name
            obj.size = contJson[0].size
            // 直接预览合同附件
            this.$refs.flowAction.$refs.formContent.$refs.filePreview.preview(
              obj
            )
            return
          }
        } catch (e) {
          console.log('error：' + '解析预览附件异常' + '!!!' + e)
        }
      }

      // console.log('从表单那拿来的数据boData======>', boData)
      if (['ht','htN', 'htsp'].includes(this_.formKey)) {
        this_.docName = boData.ht.cont_nm
        this_.templateId =
          boData.ht.template_id == null || boData.ht.template_id == ''
            ? `${window.context.defaultTemplateId}`
            : boData.ht.template_id
        this_.defId = boData.ht.def_id
        this_.instId = boData.ht.inst_id
        this_.nodeId = ''
        this_.subTableName = 'sub_d_cont'
        // 套打模板用到的建模是ht
        this_.boAlias = 'ht'
        this_.isPkg = boData.ht.is_pkg
        this_.busiId = boData.ht.id_
        let refId = boData.ht.REF_ID_
        // console.log('打包合同,is_pkg + ID：', this_.isPkg + "+" +  this_.busiId )
        // console.log('refId===>', refId)
        // console.log('isPkg===>', this_.isPkg)
        if (refId !=undefined && refId !== '') {
          //根据原来是否有外键
          this_.isPkg = '01'
          // this.$message({
          //   message: '暂不支持打包合同打印预览',
          //   type: 'warning'
          // })
          // return false
        }
      } else if (this_.formKey == 'fb') {
        this_.docName = boData.htfb.model_name
        this_.templateId = boData.htfb.template_id
        this_.defId = boData.htfb.def_id
        this_.instId = boData.htfb.inst_id
        this_.nodeId = ''
      } else if (this_.formKey == 'htbgN') {
        this_.docName = boData.htbg.model_name
        this_.templateId =
          boData.htbg.template_id == null || boData.htbg.template_id == ''
            ? `${window.context.defaultTemplateId}`
            : boData.htbg.template_id
        this_.defId = boData.htbg.def_id
        this_.instId = boData.htbg.inst_id
        this_.nodeId = ''
      }

      if (!this_.templateId && this_.formKey != 'fb') {
        this.$message({
          message: '请选择合同范本',
          type: 'warning'
        })
        return
      } else if (!this_.templateId && this_.formKey == 'fb') {
        this.$message({
          message: '请选择套打模板文件',
          type: 'warning'
        })
        return
      }

      if (
        this_.defId == undefined ||
        this_.defId == '' ||
        this_.instId == undefined ||
        this_.instId == ''
      ) {
        this_.$message.warning('请先保存表单')
        return
      }
      Loading.service('表单打印中')
      //ccwgq 2022-03-04  此处参数传递过多,修改
      var url =
        '${form}/form/printTemplate/v1/wordPrint?id=' +
        this_.templateId +
        '&defId=' +
        this.defId +
        '&nodeId=' +
        this.nodeId +
        '&procInstId=' +
        this.instId +
        '&isSub=' +
        this.isPkg +
        '&formKey=' +
        this.formKey +
        '&busiId=' +
        this.busiId +
        '&subTableName=' +
        this.subTableName +
        '&boAlias=' +
        this.boAlias
      // var url =
      //   '${form}/form/printTemplate/v1/wordPrint?id=' +
      //   this_.templateId +
      //   '&defId=' +
      //   this.defId +
      //   '&nodeId=' +
      //   this.nodeId +
      //   '&procInstId=' +
      //   this.instId
      req.get(url).then(res => {
        let loadingInstance = Loading.service('表单打印中')
        if (!res.data.state) {
          this.$message({
            message: res.data.message,
            type: 'warning'
          })
          this.$nextTick(() => {
            // 以服务的方式调用的 Loading 需要异步关闭
            loadingInstance.close()
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
                    this.previewWordPdfSrc = window.URL.createObjectURL(
                      new Blob([response.data], {type: type})
                    )
                  } else {
                    this.previewWordPdfSrc = window.URL.createObjectURL(
                      new Blob([response.data])
                    )
                  }
                  this.previewWordDialog = true
                })
              Loading.service('表单打印中').close()
            }
          })
        }
      })
    },
    ouPrint1() {
      let this_ = this
      let boData = this_.getFormData()
      let templateFileId = boData.ht.template_id
      let url =
        window.context.portal +
        '/file/onlinePreviewController/v1/onlinePreview?fileId=' +
        templateFileId
      this.$http.get(url).then(resp => {
        let data = resp.data
        if (data == null || data.result == 'error') {
          Message.error('模板不存在，请选择一个打印模板')
        } else {
          req
            .get(window.context.portal + data.pdfUrl, 'arraybuffer')
            .then(response => {
              let type = response.headers['content-type']
              if (type) {
                this.previewWordPdfSrc = window.URL.createObjectURL(
                  new Blob([response.data], {type: type})
                )
              } else {
                this.previewWordPdfSrc = window.URL.createObjectURL(
                  new Blob([response.data])
                )
              }
              this.previewWordDialog = true
            })
          Loading.service('表单打印中').close()
        }
      })
    }
  },
  mounted() {}
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
</style>
