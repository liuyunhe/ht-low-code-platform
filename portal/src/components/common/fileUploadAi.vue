<template>
  <div>
    <el-upload
      class="upload-demo"
      :show-file-list="false"
      :action="actionUrl"
      :file-list="files"
      :headers="header"
      :on-success="success"
      :on-error="error"
      :multiple="true"
      :before-remove="beforeRemove"
      :accept="accept"
      :before-upload="beforeAvatarUpload"
      ref="fileUp"
      :on-exceed="exceed"
      :limit="limits"
    >
      <el-tooltip placement="right" effect="light">
        <div slot="content">
          与上传的文件比对，文件格式支持：{{ accept }}
          <br />附件大小限制：单个文件不超过50MB
        </div>
        <el-button size="mini" round icon="el-icon-plus">上传</el-button>
      </el-tooltip>
    </el-upload>
    <!-- 预览文件-->
    <!-- <FilePreview ref="filePreview"  v-show="false" /> -->
  </div>
</template>

<script>
import {mapState} from 'vuex'
import req from '@/request.js'
import {Base64} from 'js-base64'
import {Loading, Message} from 'element-ui'
import pdf from 'vue-pdf'

export default {
  name: 'file-upload-ai',
  //   components: { FilePreview },
  props: [
    'limit',
    'showDocImg2',
    'showDocPdf2',
    'docImgSrc2',
    'docPdfSrc2',
    'numPages2'
  ],
  data() {
    return {
      limits: this.limit,
      src: '',
      iframeSrc: '',
      fileId: '',
      fileTree: '',
      files: [],
      uploadingFiles: {},
      list: [],
      isChecking: true,
      accept:
        '.jpg,.jpeg,.png,.bmp,.pdf,.JPG,.JPEG,.PBG,.BMP,.PDF,.doc,.docx,.rtf',
      num: 0
    }
  },
  computed: mapState({
    header: state => {
      if (state.login && state.login.currentUser) {
        return {Authorization: `Bearer ${state.login.currentUser.token}`}
      }
      return {}
    },
    actionUrl: function() {
      return window.context.portal + '/system/file/v1/upload'
    }
  }),
  mounted() {
    if (!this.limit) {
      this.limits = 9999999
    }
  },
  methods: {
    exceed(file, fileList) {
      if (this.limit == 1 && (fileList.length == 1 || file.length > 1)) {
        this.$message.warning('正文只能上传一个文件')
      }
    },
    // preview(files) {
    //   let obj = {};
    //   obj.id = files.id;
    //   obj.name = files.name;
    //   obj.size = files.size;
    //   this.$refs.filePreview.preview(obj);
    // },
    beforeRemove(file, fileList) {
      if (this.isChecking) {
        return this.$confirm(`确定移除 ${file.name}？`).then(() => {
          this.num = 0
          let value = {}
          if (file.response) {
            value = file.response
          } else {
            value = file
            value.fileId = file.id
          }
          for (var i = 0; i < this.files.length; i++) {
            if (this.files[i].id == value.fileId) {
              this.files.splice(i, 1) //删除数组某一项
            }
          }
        })
      } else {
        this.num = 0
        let value = {}
        if (file.response) {
          value = file.response
        } else {
          value = file
          value.fileId = file.id
        }
        for (var i = 0; i < this.files.length; i++) {
          if (this.files[i].id == value.fileId) {
            this.files.splice(i, 1) //删除数组某一项
            delete this.uploadingFiles[Base64.encode(this.files[i].name)]
          }
        }
      }
    },
    error(response, file, fileList) {
      delete this.uploadingFiles[Base64.encode(file.name)]
    },
    success(response, file, fileList) {
      //console.log("success：", file.response.fileId );
      for (let i = 0; i < fileList.length; i++) {
        delete this.uploadingFiles[Base64.encode(fileList[i].name)]
      }

      if (this.num == 0) {
        this.list = []
        for (let i = 0; i < fileList.length; i++) {
          this.list.push(fileList[i])
        }
      }
      this.num = this.num + 1
      for (let j = 0; j < this.list.length; j++) {
        if (!this.list[j].raw) {
          for (let i = 0; i < fileList.length; i++) {
            if (this.list[j].name == fileList[i].name) {
              fileList.splice(i, 1)
              break
            }
          }
        }
      }
      if (this.num == fileList.length) {
        for (let i = 0; i < fileList.length; i++) {
          if (fileList[i].response) {
            let value = fileList[i].response
            let arrarFile = {}
            arrarFile.id = value.fileId
            arrarFile.name = value.fileName
            arrarFile.size = value.size
            this.files.push(arrarFile)
          }
        }
        this.$emit('input', this.files)
      }
      this.showFile(file.response.fileId)
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
                //this.$parent.docImgSrc2 = window.context.portal + data.currentUrl;
                // this_.showDocImg2 = true;
                // this_.showDocPdf2 = false;
                //console.log("docImgSrc2", window.window.context.portal + data.currentUrl);
                //console.log("this.$parent.showDocImg2", this.$parent.showDocImg2);

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
                    this.$emit('updateShowDocPdf', false)
                    this.$emit('updateShowDocImg', true)
                    this.$emit('updateDocPdfSrc', '')
                    this.$emit(
                      'updateDocImgSrc',
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
                    this.$emit('updateShowDocPdf', true)
                    this.$emit('updateShowDocImg', false)

                    this.$emit('updateDocImgSrc', '')

                    var loadingTask = pdf.createLoadingTask(docPdfSrc)
                    loadingTask
                      .then(pdf => {
                        this.$emit(
                          'updateDocPdfSrc',
                          loadingTask,
                          window.context.portal + data.pdfUrl
                        )
                        this.$emit('updateNumPages2', pdf.numPages)
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

    // handleChange(file, fileList) {
    //   if(file.status=="success"){
    //     let value = JSON.parse(file.response);
    //     let arrarFile = {};
    //     arrarFile.id = value.fileId;
    //     arrarFile.name = value.fileName;
    //     arrarFile.size = value.size;
    //     this.files.push(arrarFile);
    //     this.$emit("input", JSON.stringify(this.files));
    //   }
    //  },
    getFiles() {
      if (this.files.length == 0) {
        return ''
      } else {
        return this.files
      }
    },
    isFinishUpload() {
      if (JSON.stringify(this.uploadingFiles) != '{}') {
        this.$message.warning('正在上传附件，请稍后！')
        throw '正在上传附件，请稍后！'
      }
    },
    beforeAvatarUpload(file) {
      // 文件类型限制
      const name = file.name ? file.name : ''
      const ext = name
        ? name.substr(name.lastIndexOf('.') + 1, name.length)
        : true
      const isExt = this.accept.indexOf(ext) < 0
      this.isChecking = !isExt
      if (isExt) {
        if (this.accept == 'false') {
          this.$message.error('请配置可上传文件的格式!')
        } else {
          this.$message.error('上传的附件只能是 ' + this.accept + '格式!')
        }
        return !isExt
      }
      let loadingInstance = Loading.service('上传中......')
      this.uploadingFiles[Base64.encode(name)] = 'eror'
    }
  }
}
</script>
<style lang="stylus" scoped>
.upload-demo {
  max-width: 570px;
  margin-top: 5px;
}
</style>
