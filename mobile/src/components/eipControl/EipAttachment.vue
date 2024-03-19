<template>
  <div class="inputs">
    <el-tooltip
      :placement="tooltipplacement || $tooltipplacement"
      :disabled="inputWriteable && !errors.has('custom-form.' + inputName)"
      v-if="permission != 'n'"
    >
      <div slot="content">{{ errors.first('custom-form.' + inputName) }}</div>
      <FileUpload
        v-if="inputWriteable"
        v-validate="inputValidate"
        :name="inputName"
        :fileVal="value"
        :multiple="multiple"
        :accept="accept"
        :limit="limit"
        :conf="propConfList"
        :size="size"
        :previewable="previewAble"
        :downloadable="downloadAble"
        :simplicity="simplicity"
        :inputWriteable="inputWriteable"
        v-model="inputVal"
        @download="previewFile"
      />
    </el-tooltip>
    <span v-if="!inputWriteable && permission != 'n'">
      <el-table
        v-if="filesData.length > 0"
        :data="filesData"
        border
        :style="'width:98%;margin-top :10px;'"
        size="mini"
      >
        <el-table-column label="附件名称" align="left" v-if="downloadAble">
          <template slot-scope="scope">
            <span class="done-subject" @click="handleRowClick(scope.row)">{{
              scope.row.name
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="附件名称"
          v-if="!downloadAble"
          prop="name"
          align="center"
          lalign="center"
        >
          <template slot-scope="scope">
            <span @click="handleRowClick(scope.row)">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :prop="con.name"
          :label="con.desc"
          v-for="con in propConfList"
          :key="con.name"
          width="200"
          align="center"
        >
          <template slot-scope="scope">
            <ht-input
              v-model="filesData[scope.$index][con.name]"
              :permission="
                permission == 'w' || permission == 'b'
                  ? con.requried
                    ? 'b'
                    : 'w'
                  : permission
              "
            ></ht-input>
          </template>
        </el-table-column>
      </el-table>
    </span>
    <span style="display:none;" v-validate>
      <slot name="labeldesc">{{ inputName }}</slot>
    </span>
    <FilePreview
      :fileId="fileId"
      ref="FilePreview"
      :previewParams="previewParams"
      @download="downloadFile"
      :permission="permission"
      :allowPreview="previewAble"
      :allowDownload="downloadAble"
    />
  </div>
</template>
<script>
import utils from '@/utils.js'
import req from '@/request.js'
import sub_pio_mixin from '@/sub-permission-mixin.js'
import FileUpload from '@/components/eipControl/bus/FileUploadFlow.vue'
import FilePreview from '@/components/common/FilePreview.vue'
import {Notify} from 'vant'
export default {
  name: 'eip-attachment',
  props: [
    'validate',
    'value',
    'name',
    'permission',
    'multiple',
    'accept',
    'limit',
    'propConf',
    'tooltipplacement',
    'size',
    'allowPreview',
    'allowDownload',
    'simplicity'
  ],
  mixins: [sub_pio_mixin], //混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission）
  data() {
    return {
      inputVal: '',
      val: '',
      uploadVal: [],
      fileId: '',
      fileTree: '',
      filesData: [],
      propConfList: [],
      extraProps: [],
      previewParams: {}
    }
  },
  watch: {
    inputVal: function(newVal, oldVal) {
      this.val = newVal
      this.$emit('input', this.val)
    }
  },
  computed: {
    inputWriteable: function() {
      return utils.getWriteable(this.permission)
    },
    inputValidate: function() {
      var validateObj = this.$store.state.index.validate
      return utils.addRequiredOrNot(
        this.permission,
        this.validate,
        validateObj,
        this
      )
    },
    inputName: function() {
      let labeldesc = ''
      if (
        this.$slots &&
        this.$slots.labeldesc &&
        this.$slots.labeldesc[0].children &&
        this.$slots.labeldesc[0].children[0].text
      ) {
        labeldesc = this.$slots.labeldesc[0].children[0].text
        return this.name ? this.name : utils.getName() + '-' + labeldesc
      } else {
        return this.name ? this.name : utils.getName()
      }
    },
    previewAble: function() {
      if (!utils.getWriteable(this.permission) && !this.allowPreview) {
        return false
      }
      return true
    },
    downloadAble: function() {
      if (!utils.getWriteable(this.permission) && !this.allowDownload) {
        return false
      }
      return true
    }
  },
  created() {
    // console.log(this.simplicity)
    if (this.propConf) {
      let list = JSON.parse(this.propConf)
      list.forEach(element => {
        if (element.desc) {
          if (element.requried) {
            element.inputValidate = 'required:true'
          }
          this.propConfList.push(element)
          this.extraProps.push(element.name)
        }
      })
    }

    if (this.value) {
      this.inputVal = this.value
      this.uploadVal = JSON.parse(this.value)
      if (this.uploadVal) {
        for (let i = 0; i < this.uploadVal.length; i++) {
          let file = {
            id: !this.uploadVal[i].id
              ? this.uploadVal[i].response.fileId
              : this.uploadVal[i].id,
            uid: this.uploadVal[i].uid,
            name: this.uploadVal[i].name,
            size: this.uploadVal[i].size,
            type: utils.substringType(this.uploadVal[i].name, '.'),
            bytes: utils.bigDecimal(this.uploadVal[i].size),
            username: this.uploadVal[i].username
          }
          this.extraProps.forEach(prop => {
            file[prop] = this.uploadVal[i][prop]
          })
          this.filesData.push(file)
        }
      }
    }

    this.$validator = this.$root.$validator
  },
  methods: {
    handleRowClick(item) {
      //判断能否预览
      if (this.previewAble) {
        this.previewFile(item)
      } else {
        //判断能否下载
        if (this.downloadAble) {
          Notify({
            type: 'warning',
            message: '文件不可预览，请下载后查看'
          })
          this.downloadFile({
            id: item.id
          })
        } else {
          Notify({
            type: 'warning',
            message: '您无权查看该文件'
          })
        }
      }
    },
    //附件下载
    previewFile(item) {
      //只读并且配置了不可预览不可下载
      let portal = window.context.portal
      let this_ = this
      let token = this.$store.state.login.currentUser.token
      req
        .get(
          window.context.portal +
            '/file/onlinePreviewController/v1/onlinePreview?fileId=' +
            item.id
        )
        .then(resp => {
          if (resp.data.result == 'html') {
            //html
            this_.$set(this_, 'previewParams', {
              type: 'html',
              url: portal + resp.data.pdfUrl,
              title: item.name,
              id: item.id
            })
            this_.$refs.FilePreview.showDialog()
          } else if (resp.data.result == 'pdf') {
            this_.$set(this_, 'previewParams', {
              type: 'pdf',
              url: portal + resp.data.pdfUrl,
              title: item.name,
              id: item.id
            })
            this_.$refs.FilePreview.showDialog()
          } else if (resp.data.imgUrls) {
            this_.$set(this_, 'previewParams', {
              type: 'picture',
              pictureUrl: portal + resp.data.currentUrl,
              pictureUrlList: [portal + resp.data.currentUser],
              title: item.name,
              id: item.id
            })
            this_.$refs.FilePreview.showDialog()
          } else if (resp.data.result == 'error') {
            Notify({
              type: 'danger',
              message: '附件不存在'
            })
          } else {
            if (this.permission != 'n' && this.permission != 'r') {
              Notify({
                type: 'warning',
                message: '当前文件不支持预览，请下载后查看'
              })
              this.downloadFile(item)
            } else {
              Notify({
                type: 'warning',
                message: '当前文件不支持预览'
              })
            }
          }
        })
    },
    downloadFile(item) {
      let downloadFrame = document.createElement('iframe')
      downloadFrame.src =
        window.context.portal + '/system/file/v1/downloadFile?fileId=' + item.id
      downloadFrame.style.display = 'none'
      document.body.appendChild(downloadFrame)
    }
  },
  components: {FileUpload, FilePreview}
}
</script>
<style lang="stylus">
.done-subject {
  cursor: pointer;
}

.done-subject {
  color: #2761ff;
}
.el-upload {
  display: inline;
  text-align: center;
  cursor: pointer;
  outline: none;
}

div[aria-invalid='true'] >>> button {
  border-color: #f56c6c;
}

.done-subject {
  cursor: pointer;
}

.done-subject:hover {
  color: #2761ff;
}

.el-image /deep/ .el-image-viewer_canvas{
  overflow: auto;
}
</style>
