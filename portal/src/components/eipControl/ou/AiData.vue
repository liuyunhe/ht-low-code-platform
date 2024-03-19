<template>
  <div v-show="true">
    <!-- 这里将根据formKey来判断业务场景 -->
    <!-- 2021-09-07 ccwgq 智能提取 -->
    <!-- 和智能审核一样的结构 button+dialog -->
    <el-button type="primary" icon="el-icon-edit-outline" @click="openDialog"
      >智能提取</el-button
    >
    <el-dialog
      :visible.sync="dialogVisible"
      @close="closeDialog"
      append-to-body
      title="智能提取"
      custom-class="ouai_dialog"
      width="98.5%"
      ref="dialog"
    >
      <el-row :gutter="10">
        <!-- 左侧是图片 -->
        <el-col
          :span="16"
          element-loading-text="图片加载中,请稍后..."
          v-loading="leftLoading"
        >
          <el-card>
            <el-scrollbar
              :style="{height: dialogHeight - dialogGap + 'px'}"
              ref="leftScroll"
            >
              <!--todo:显示图片 -->
              <div v-if="showDocImg">
                <div>
                  <img ref="img" :src="docImgSrc" />
                </div>
              </div>
              <!-- todo: 显示PDF -->
              <div v-else-if="showDocPdf">
                <pdf
                  style="margin-top: 40px"
                  ref="docPdf"
                  v-for="i in numPages"
                  :src="loadingTask"
                  :page="i"
                  :key="i"
                ></pdf>
              </div>
            </el-scrollbar>
          </el-card>
        </el-col>
        <!-- 右侧是JSON表单 -->
        <el-col :span="8">
          <el-card ref="rCard">
            <!-- card header -->
            <div slot="header" style="display: flex" ref="header">
              <div v-if="showUploadButton" style="float: left">
                <file-upload-ai
                  v-show="showUploadButton"
                  ref="fileUploadAi"
                  @updateShowDocPdf="updateShowDocPdf"
                  @updateShowDocImg="updateShowDocImg"
                  @updateDocPdfSrc="updateDocPdfSrc"
                  @updateDocImgSrc="updateDocImgSrc"
                  @updateNumPages="updateNumPages"
                ></file-upload-ai>
              </div>
              <div
                v-if="showAiDataButton"
                style="float: left; padding: 5px 10px 0px 10px"
              >
                <el-button
                  type="success"
                  size="mini"
                  round
                  @click="requestAiData"
                  >智能提取</el-button
                >
              </div>
              <div style="float: left; padding-top: 5px">
                <el-button
                  v-if="!showUploadButton"
                  type="primary"
                  round
                  size="mini"
                  @click="aiDataSave"
                  >保存</el-button
                >
              </div>
            </div>
            <!-- 表格显示要素项目 -->
            <!-- 仅当数据正确请求回来的时候显示 -->
            <el-scrollbar ref="scrollbar" style="height: 100%">
              <!-- 指定右侧的高度   dialog height:44px -->
              <div :style="{height: rgHeight + 'px'}">
                <el-table ref="table" :data="aiData" v-show="aiData.length > 0">
                  <el-table-column
                    prop="label"
                    label="要素"
                    width="100px"
                  ></el-table-column>
                  <el-table-column label="内容">
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
    </el-dialog>
  </div>
</template>

<script>
//适用场景 ht htsp htbgN
import fileUploadAi from '@/components/common/fileUploadAi.vue'
import {Loading, Message} from 'element-ui'
import pdf from 'vue-pdf'
import req from '@/request.js'
import dialogHeight from './dialog_height'
const isEmpty = function(value) {
  return value === '' || value === null
}
export default {
  name: 'aiData',
  //2021-09-14 ccwgq 这里指定传入表单的formKey和表单的数据
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
  mixins: [dialogHeight],
  components: {
    fileUploadAi,
    pdf
  },
  data()  {
    return {
      dialogVisible: false,
      aiData: [],
      taskId: '', //请求任务id,
      showDocPdf: '',
      showDocImg: '',
      docPdfSrc: '',
      docUrl: '',
      docImgSrc: '',
      numPages: 0,
      loadingTask: null,
      // showUploadButton: true, //决定上传按钮的隐藏显示与否
      showAiDataButton: true, //控制智能提取按钮
      scene: 'htsp', //场景判断，合同审批 打包合同还是法务和履约流程
      //合同id,流程实例id 和节点id和节点id,
      // htsp,dbhtsp,legal,approval
      cont_id: '',
      cont_nm: '',
      instId: '',
      defId: '',
      templateId: '',
      formKey: '',
      modelData: null,
      //loading
      leftLoading: false,
      rightLoading: false,
      //希望减掉的窗口高度
      dialogGap: 155
    }
  },
  computed: {
    //左右高度,为了使用element 滚动条
    lfHeight() {
      return window.innerHeight - 90
    },
    rgHeight() {
      if (this.$refs.header) {
        return (
          window.innerHeight - this.$refs.header.parentElement.offsetHeight - 90
        )
      }
      return window.innerHeight - 90 - 70
    },
    showUploadButton() {
      return isEmpty(this.instId) || isEmpty(this.defId)
    }
  },
  created() {
    //在此完成初始化
    const _this = this
    //todo:  打印查看组件内部数据
    _this.init()
  },
  methods: {
    // 2021-09-14 ccwgq 初始化组件
    init() {
      const _this = this
      _this.formKey = _this.getFormKey()
      if (isEmpty(_this.formKey)) {
        //获取表单key失败
        console.error('获取表单key失败')
        return
      }
      let foData = _this.dealFormData()
      // console.log(formData);
      _this.defId = foData.def_id ? foData.def_id : ''
      _this.instId = foData.inst_id ? foData.inst_id : ''
    },
    judgeNeedContId() {
      return !['ht','htN'].includes(this.formKey)
    },
    // computeHeight() {
    //   this.dialogHeight = parseInt(window.innerHeight)
    // },
    openDialog() {
      const _this = this
      _this.init()
      //todo:考虑打包合同
      _this.showAiDataButton = true
      _this.dialogVisible = true
      // console.log(_this.$refs.table);
    },
    closeDialog() {},
    updateShowDocPdf(newVal) {
      this.showDocPdf = newVal
    },
    updateShowDocImg(newVal) {
      this.showDocImg = newVal
    },
    updateDocPdfSrc(newVal, newUrl) {
      this.loadingTask = newVal
      this.docUrl = newUrl
      this.loadingTask.then(pdf => {
        this.numPages = pdf.numPages
      })
    },
    updateDocImgSrc(newVal, newUrl) {
      this.docImgSrc = newVal
      this.docUrl = newUrl
    },
    updateNumPages(newVal) {
      this.numPages = newVal
    },
    //处理计算上传的文档,利用vue-pdf实现预览
    pdfPreviewDealing() {
      let this_ = this
      const loadingTask = pdf.createLoadingTask(this_.docUrl)
      loadingTask.then(pdf => {
        this_.docPdfSrc = loadingTask
      })
    },
    // 2021-09-14 ccwgq 处理传回的数据,是JSON串
    dealRawAiData(aiData) {
      const _this = this
      if (typeof aiData === 'string') {
        aiData = JSON.parse(aiData)
      }
      _this.aiData = []
      for (let key in aiData) {
        let item = {name: key, ...aiData[key]}
        if (item.value && item.value.trim().length > 0) _this.aiData.push(item)
      }
    },
    // 2021-09-18 ccwgq 点击文档滚动
    scrollDoc(yPos) {
      this.$refs['leftScroll'].wrap.scrollTop = yPos - 100
    },
    //2021-09-23 ccwgq 单独处理表单的数据
    dealFormData() {
      let _this = this
      let boData = _this.getFormData()

      // 取出对象
      let foData
      if (['ht','htsp','htN'].includes(_this.formKey)) {
        foData = boData.ht
      } else if (_this.formKey === 'htbgN') {
        foData = boData.htbg
      } else {
        foData = {}
      }
      return foData
    },
    async getPdf(){
      const _this=this;
       //请求pdf路径
        let url =
          '${form}/form/printTemplate/v1/wordPrint?id=' +
          _this.templateId +
          '&defId=' +
          _this.defId +
          '&nodeId=' +
          '' +
          '&procInstId=' +
          _this.instId
        const pdfIdRes = await req.get(url)
        if (!pdfIdRes.data || !pdfIdRes.data.state) {
          loadingInstance.close()
          //todo请求失败干点什么
          return
        }
        url =
          window.context.portal +
          '/file/onlinePreviewController/v1/onlinePreview?fileId=' +
          pdfIdRes.data.value
        const pdfUrlRes = await req.get(url)
        if (!pdfUrlRes.data || pdfUrlRes.data.result !== 'pdf') {
          loadingInstance.close()
          return
        }
        //到此可以得到具体的pdf路径了
        _this.docUrl = window.context.portal + pdfUrlRes.data.pdfUrl
    },
    //2021-09-15 ccwgq 请求数据库里保存的智能数据
    async requestAiData() {
      let _this = this
      // 取出对象
      let foData
      foData = _this.dealFormData()
      if (typeof foData !== 'object' || foData === {}) {
        // console.error('foData不是一个对象或者空对象,请检查formKey或者foData')
        return
      }
      _this.cont_id = foData.id_
      //这里考虑了无模板的情况
      _this.templateId = isEmpty(foData.template_id)
        ? `${window.context.defaultTemplateId}`
        : foData.template_id
      _this.instId = foData.inst_id
      _this.defId = foData.def_id
      // 如果是启动了流程需要先请求pdf的路径，否则就需要上传文件
      if (_this.showUploadButton) {
        if (_this.docUrl === '') {
          _this.$message.warning('请先上传文件')
          return
        }
      }
      //开始加载数据
      const loadingInstance = _this.$loading({
        lock: true,
        text: '要素加载中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })

      if (!_this.showUploadButton) {
        //请求pdf路径
        let url =
          '${form}/form/printTemplate/v1/wordPrint?id=' +
          _this.templateId +
          '&defId=' +
          _this.defId +
          '&nodeId=' +
          '' +
          '&procInstId=' +
          _this.instId
        const pdfIdRes = await req.get(url)
        if (!pdfIdRes.data || !pdfIdRes.data.state) {
          loadingInstance.close()
          //todo请求失败干点什么
          return
        }
        url =
          window.context.portal +
          '/file/onlinePreviewController/v1/onlinePreview?fileId=' +
          pdfIdRes.data.value
        const pdfUrlRes = await req.get(url)
        if (!pdfUrlRes.data || pdfUrlRes.data.result !== 'pdf') {
          loadingInstance.close()
          return
        }
        //到此可以得到具体的pdf路径了
        _this.docUrl = window.context.portal + pdfUrlRes.data.pdfUrl
      }
      //请求后台接口
      //请求的图片宽度
      let leftWidth
      if (this.$refs.leftScroll && this.$refs.leftScroll.$el) {
        leftWidth = this.$refs.leftScroll.$el.offsetWidth
      }
      const aiDataRes = await _this.$http.post(
        '${bpmRunTime}/eipx7/opun/runtime/ai/v1/extractItems',
        {
          docUrl: _this.docUrl,
          width: leftWidth
        }
      )
      if (aiDataRes.data && aiDataRes.data.state) {
        //请求到数据
        loadingInstance.close()
        _this.leftLoading = true
        const aiData = aiDataRes.data.value.value
        const imgData = aiDataRes.data.value.img
        //处理数据格式
        _this.dealRawAiData(aiData)
        //渲染图片base64处理
        let bstr = imgData
        let n = bstr.length
        let u8arr = new Uint8Array(n)
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n)
        }
        _this.docImgSrc = 'data:image/png;base64,' + imgData
        // _this.docImgSrc = window.URL.createObjectURL(new Blob([u8arr], { type: "png" }));
        _this.showDocImg = true
        _this.showDocPdf = false
        _this.leftLoading = false
      }
      else {
        loadingInstance.close()
      }
      var loadingTask = pdf.createLoadingTask(_this.docUrl)
      loadingTask
        .then(pdf => {
          _this.loadingTask = loadingTask
          _this.numPages = pdf.numPages
        })
        .catch(err => {
          Message.error('pdf加载失败')
          // console.error("pdf加载失败===>", err);
        })
    },
    //2021-09-14 ccwgq 智能数据保存,将JSON串保存到合同表中的clause_json中去
    async aiDataSave() {
      const _this = this
      //将修改后的审核数据保存为JSON放入后端
      let json = {}
      for (let i = 0; i < _this.aiData.length; i++) {
        json[_this.aiData[i].name] = {
          label: _this.aiData[i].label,
          value: _this.aiData[i].value,
          order: _this.aiData[i].order
        }
      }
      const jsonString = JSON.stringify(json)
      const res = await _this.$http.post(
        '${bpmRunTime}/eipx7/opun/runtime/ai/v1/itemsSave',
        {
          json: jsonString,
          id: _this.cont_id
        }
      )
      if (res.data && res.data.state) {
        // console.log("智能回填数据保存成功");
        _this.$message.success('保存成功')
      } else {
        // console.log("智能回填数据保存失败");
        // _this.$message.warning("保存失败");
      }
    }
  },
  mounted() {
    // this.getPdf();
    // window.addEventListener('resize', this.computeHeight)
  },
  updated() {
    // console.log(this);
    const _this = this
    if (this.$refs.table) {
      $(this.$refs.table.$el)
        .find('tbody')
        .children()
        .each(function(index) {
          const td = $(this)
            .find('td')
            .first()
          td.off('click').on('click', function(event) {
            _this.scrollDoc(_this.aiData[index].order)
          })
          td.off('mouseover').on('mouseover', function() {
            $(this).css({cursor: 'crosshair'})
          })
        })
    }
  },
  destroyed() {
    // window.removeEventListener('resize', this.computeHeight)
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
    }
    .el-dialog__footer {
      height: 0px !important;
    }
  }
}

/deep/ .el-card {
  .el-card__body {
    padding-top: 0px;
  }
}

.el-card__right {
  position: relative;
}
</style>
