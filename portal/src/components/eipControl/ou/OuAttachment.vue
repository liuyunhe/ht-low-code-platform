<template>
  <div
    v-if="inputWriteable || isReadOnly"
    class="ou-attachment"
    role="attachment"
  >
    <input
      type="hidden"
      v-model="value"
      v-validate="inputValidate"
      :name="inputName"
    />
    <!-- TODO:文件类型控制   文件大小限制 -->
    <div v-if="inputWriteable" style="display: flex">
      <el-upload
        ref="uplaod"
        class="upload-demo"
        :action="actionUrl"
        :file-list="uploadFiles"
        :headers="header"
        :multiple="multiple"
        :accept="accept"
        :on-exceed="exceed"
        :on-error="error"
        :on-success="success"
        :on-progress="process"
        :before-upload="before"
        :limit="parseInt(limit) || 9999999"
      >
        <el-tooltip placement="right" effect="light">
          <div slot="content">
            附件格式支持：{{ accept }} <br />附件大小限制：单个文件不超过{{
              size
            }}MB
          </div>
          <el-button size="mini" icon="el-icon-upload2">
            {{ this.multiple ? '选择多个文件' : '选择文件' }}
          </el-button>
        </el-tooltip>
      </el-upload>
      <div style="margin-left: 10px">最大{{ size }}M/个</div>
    </div>
    <!-- table显示 -->
    <el-table
      :key="tableKey"
      :show-header="true"
      :style="{maxWidth: maxWidth + 'px'}"
      v-if="Array.isArray(filesData) && filesData.length > 0"
      :data="filesData"
      border
      ref="fileTable"
    >
      <el-table-column min-width="150" label="附件名" align="left">
        <template slot-scope="scope">
          <div
            v-if="inputWriteable || (isReadOnly && allowPreview)"
            class="preview"
            @click="handleOnePreview(scope.row)"
          >
            <i class="el-icon-document"></i>
            <span style="padding-left: 4px;" class="preview-text">{{ scope.row.name }}</span>
          </div>
          <div v-else>
            <i class="el-icon-document"></i>
            <span style="padding-left: 4px">{{ scope.row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="附件大小" align="left" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.size | computerSize }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="上传者"
        align="left"
        prop="username"
        width="100"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        v-if="isFlow"
        label="步骤"
        align="left"
        prop="procedure"
      ></el-table-column>
      <el-table-column label="上传时间" align="left" width="170">
        <template slot-scope="scope">
          <span>{{ scope.row.uploadTime | formatTime(pattern) }}</span>
        </template>
      </el-table-column>
      <!-- 合同编号 -->
      <el-table-column
        label="合同编号"
        prop="serialNo"
        v-if="!!watermark"
      ></el-table-column>
      <el-table-column label="操作" align="left">
        <template slot-scope="scope">
          <div class="buttons">
            <!-- 下载按钮 -->
            <el-button
              size="mini"
              type="success"
              circle
              v-if="inputWriteable || (isReadOnly && allowDownload)"
              @click="handleOneDownload(scope.row)"
              ><i class="el-icon-download"></i
            ></el-button>
            <!-- 删除按钮的逻辑控制:
            必须在当前节点时，且allowDelete为true,具有写或者必填权限，并根据参数判断是否仅限于本人上传本人删除！！ -->
            <el-button
              type="danger"
              size="mini"
              circle
              v-if="
                isAllowDelete(scope.row) &&
                  inputWriteable &&
                  (!deleteBySelf ||
                    (deleteBySelf && scope.row.userId == currentUser.userId))
              "
              @click="handleOneRemove(scope.row)"
              ><i class="el-icon-delete"></i
            ></el-button>
            <!-- 水印按钮 -->
            <el-tooltip content="给附件加上水印">
              <el-button
                type="primary"
                circle
                size="mini"
                v-if="!!watermark && permission_sub != 'n'"
                @click="handleWatermarkClick(scope.row)"
              >
                <i class="el-icon-s-check"></i>
              </el-button>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <span v-else-if="!inputWriteable">附件未上传</span>
    <el-progress
      ref="progress"
      v-show="showProgress && inputWriteable"
      :color="progressColor"
      :percentage="progressPercent"
    ></el-progress>
    <file-preview ref="filePreview" />
    <!-- 水印设置对话框 -->
    <el-dialog
      :visible.sync="dialogVisible"
      ref="dialog"
      title="水印设置"
      :append-to-body="true"
    >
      <el-form class="watermark-form" :model="form">
        <el-form-item prop="serialNo" label="合同编号">
          <el-input type="text" v-model="serialNo" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item prop="watermarkText" label="水印文字">
          <el-input
            rows="4"
            type="textarea"
            v-model="form.watermarkText"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button
          :disabled="!form.watermarkText"
          type="success"
          size="small"
          round
          @click="confirmWatermark"
        >
          加水印
        </el-button>
        <el-button
          type="danger"
          size="small"
          round
          @click="dialogVisible = false"
          >取消</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import moment from 'moment'
import filesize from 'filesize'
import utils from '@/utils.js'
import req from '@/request.js'
import portal from '@/api/portal.js'
import sub_pio_mixin from '@/sub-permission-mixin.js'
import FilePreview from '@/components/common/FilePreview.vue'
import {Message} from 'element-ui'
export default {
  name: 'ou-attachment',
  components: {
    FilePreview
  },
  props: [
    'validate',
    'value',
    'permission',
    //单个文件限制大小
    'size',
    //限制上传的文件总数
    'limit',
    //允许同时上传多个文件
    'multiple',
    //可接受的文件后缀
    'accept',
    //允许可读权限时预览
    'allowPreview',
    //允许可读权限时下载
    'allowDownload',
    'propConf',
    'simplicity',
    //显示流程信息
    'isFlow',
    //节点名--步骤名,通过这接收流程中的节点名称
    'nodeName',
    //节点ID--通过这接收流程中的节点ID
    'nodeId',
    'pattern',
    //只允许用户删除自己上传的文件
    'deleteBySelf',
    //启用水印功能
    'watermark',
    'defaultText', //水印默认文字
    'serialNo',
    //自定义列
    'defineColumns',
  ],
  model: {
    prop: 'value',
    event: 'input'
  },
  filters: {
    //文件大小格式化
    computerSize: function(val) {
      // if (val < 1024) {
      //   return val + 'B'
      // } else if (val < 1024 * 1024) {
      //   var temp = val / 1024
      //   temp = temp.toFixed(2)
      //   return temp + 'KB'
      // } else if (val < 1024 * 1024 * 1024) {
      //   var temp = val / (1024 * 1024)
      //   temp = temp.toFixed(2)
      //   return temp + 'MB'
      // } else {
      //   var temp = val / (1024 * 1024 * 1024)
      //   temp = temp.toFixed(2)
      //   return temp + 'GB'
      // }
      return filesize(val, {base: 2, standard: 'iec'}) //使用filesize一步到位
    },
    //时间格式化
    formatTime: function(val, pattern) {
      val = new Date(val)
      pattern = pattern || 'YYYY-MM-DD HH:mm:ss'
      return moment(val).format(pattern)
    }
  },
  data() {
    return {
      tableKey: 'name',
      filesData: [], //格式化JSON的文件数据
      uploadFiles: [], //上传组件记录的文件
      writeable: true,
      uploadingFiles: {},
      maxWidth: 100,
      progressPercent: 0,
      showProgress: false,
      // progressColor:'#4FD301',
      progressColor: '#409EFF',
      uploadQueue: [], //上传队列
      beforeUploadFileList: [], //上传前的文件
      dialogVisible: false, //水印设置对话框
      form: {
        file: null,
        watermarkText: '', //水印文字
        serialNo: this.serialNo
      }
    }
  },
  computed: {
    isReadOnly: function() {
      return this.permission == 'r'
    },
    inputWriteable: function() {
      return this.writeable
        ? utils.getWriteable(this.permission_sub)
        : this.writeable
    },
    inputValidate: function() {
      var validateObj = this.$store.state.index.validate
      return utils.addRequiredOrNot(
        this.permission_sub,
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
    actionUrl: function() {
      return window.context.portal + '/system/file/v1/upload'
    },

    //计算fileList
    fileList: {
      get() {
        return []
      },
      set(files) {}
    },

    header: function() {
      var state = this.$store.state
      if (state.login && state.login.currentUser) {
        return {Authorization: `Bearer ${state.login.currentUser.token}`}
      }
      return {}
    },
    //从 sessionStorage获取当前用户信息
    currentUser() {
      var s = sessionStorage.getItem('currentUser')
      s = JSON.parse(s || '{}')
      return s
    }
  },
  mixins: [sub_pio_mixin], //混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub）
  created() {
    this.$validator = this.$root.$validator
    if (this.value && this.value.constructor === String) {
      if (!this.value.response) {
        let fileVal = [...JSON.parse(this.value)]
        //获取附件类型
        for (let i = 0; i < fileVal.length; i++) {
          if (fileVal[i].name && fileVal[i].name.split('.')) {
            fileVal[i].type = this.substringType(fileVal[i].name)
            fileVal[i].state = 'success'
            fileVal[i].percentage = 100
          }
        }
        this.filesData = fileVal
      } else {
        this.filesData = JSON.parse(this.value)
      }
    }
    if(this.defaultText){
      this.form.watermarkText=this.defaultText
    }
    // this.filesData.forEach((item) => {
    //   if (item?.response?.fileId) {
    //     item.fileId = item?.response?.fileId
    //   }
    // })
  },
  mounted() {
    //防止table宽度自适应挤占标题单元格的宽度
    const pEl = this.$el.parentElement
    //   console.log(pEl,pEl.clientWidth);
    this.maxWidth = pEl.clientWidth || pEl.offsetWidth || 100
  },
  watch: {
    //数据同步
    filesData: {
      handler: function(newVal) {
        let r = ''
        if (newVal && newVal.constructor === Array && newVal.length > 0) {
          // 只有上传成功的附件才能更新v-model值
          let ary = newVal.filter(m => m.status === 'success')
          if (ary && ary.length > 0) {
            r = JSON.stringify(ary)
          }
        }
        this.$emit('input', r)
        //设置表头显示
        this.$nextTick(() => {
          //此组件渲染完毕
          if (
            newVal.length >=
            this.beforeUploadFileList.length + this.uploadQueue.length
          ) {
            this.progressColor = '#4FD301'
          }
          this.$nextTick(() => {
            //el-table渲染完毕
            //强制表头显示
            $(this.$el)
              .find('.el-table__header > thead > tr')
              .css({display: 'table-row', color: 'black'})
            //计算这时组件的数组长度已经满足了需要的长度,也就是上传完了，表格也渲染完了，真正上传的逻辑才算完成（包括渲染完了）
          })
        })
      },
      deep: true
    }
  },

  methods: {
    // 加上水印
    handleWatermarkClick(file) {
      this.form.file = file
      this.dialogVisible = true
    },
    //确认加上水印
    confirmWatermark() {
      var data = {}
      data.input = this.form.file.response.fileId
      data.waterMark = this.form.watermarkText
      portal.getFileWatermark(data, resp => {
        Message.success({
          message: '加水印成功',
          onClose: () => {
            this.dialogVisible = false //关闭对话框,在消息弹出框消失之后
            this.form.watermarkText = ''
            const index = this.indexArray(this.filesData, this.form.file)
            this.form.file.serialNo = this.serialNo
            if (index > -1) {
              // this.filesData[index] = this.form.file
              //强制响应式数据  setter触发
              this.$set(this.filesData, index, this.form.file)
            }
            // this.$set(this,"filesData",this.filesData);
            this.tableKey = this.serialNo
            if (this.tableKey == this.serialNo) {
              this.tableKey + 1
            }
          }
        })
      })
    },
    //判断数据是否包含某个对象，并返回数据包含对象的下标
    indexArray(array, item) {
      if (array.length == 0) {
        return -1
      }
      for (let i = 0; i < array.length; i++) {
        if (JSON.stringify(array[i]) == JSON.stringify(item)) {
          return i
        }
      }
      return -1
    },
    //获取指定字符串点最后一个字符
    substringType(str) {
      let valueArr = str.split('.')
      return valueArr[valueArr.length - 1]
    },
    //当前节点的附件才允许删除
    //ccwgq 2022-07-05 节点通过节点ID来判断是否相等
    isCurrentNode(nodeId) {
      return this.nodeId == nodeId
    },
    isAllowDelete(row) {
      var deletable = row?.allowDelete ?? true
      //之所以这样写是为了兼容旧数据
      return (
        (!this.isFlow ||
          (this.isFlow && this.isCurrentNode(row.procedure_id || ''))) &&
        deletable
      )
    },
    //上传前的回调
    before() {
      this.showProgress = true //显示上传进度条
      this.progressColor = this.$options.data().progressColor //上传颜色置回
      this.uploadQueue = [] //清空上传队列
      this.beforeUploadFileList = Object.assign([], this.filesData) //记录上传前的文件
      return true
    },
    //上传中的进度
    process(event, file, fileList) {
      //有uid
      // console.log('process event==>', event)
      // console.log('process file===>', file)
      // console.log('process fileList ===>', fileList)
      //更新上传队列的数据信息
      var item = this.uploadQueue.filter(item => item.uid == file.uid)
      if (item.length == 0) {
        item = {uid: file.uid}
        this.uploadQueue.push(item)
      } else {
        item = item[0]
      }
      item.total = event.total
      item.loaded = event.loaded
      item.percent = event.percent
      //根据上传队列统计信息了  总的loaded/总的total
      var allLoaded = this.uploadQueue
        .map(q => q.loaded)
        .reduce((pre, cur) => pre + cur, 0)
      var allTotal = this.uploadQueue
        .map(q => q.total)
        .reduce((pre, cur) => pre + cur, 0)
      var allPercent = 0
      this.uploadQueue.forEach(q => {
        allPercent += (q.total / allTotal) * q.percent
      })
      // console.log(`loaded:${allLoaded}/total:${allTotal}`);
      // console.log(`percent:${allPercent}`);
      this.progressPercent = Math.floor(allPercent)
      // this.progressColor = allPercent < 100 ? '#409EFF' : '#4FD301'
      this.showProgress = allLoaded <= allTotal
      //进度条到底后保持2.5s
      if (this.progressPercent === 100) {
        setTimeout(() => {
          this.showProgress = false
        }, 2500)
      }
    },
    //文件超出个数时的钩子
    exceed(file, fileList) {
      if (this.limit == 1 && (fileList.length == 1 || file.length > 1)) {
        this.$message.warning('正文只能上传一个文件')
      }
    },
    //上传发生错误
    error(response, file, fileList) {
      delete this.uploadingFiles[Base64.encode(file.name)]
    },
    //上传成功
    success(response, file, fileList) {
      for (let i = 0; i < fileList.length; i++) {
        delete this.uploadingFiles[Base64.encode(fileList[i].name)]
      }
      var item = {}
      file.response.status = file.status
      item.name = file.name
      item.size = file.size
      item.response = response
      item.userId = this.currentUser.userId || ''
      item.username = file.response.username
      item.uploadTime = this.$Formulas.formatDate(
        new Date(),
        'YYYY-MM-DD HH:mm:ss'
      )
      item.procedure = this.nodeName
      item.procedure_id = this.nodeId
      item.status = file.status
      item.allowDelete = true //刚上传时的附件总是可以删除的
      this.filesData.push(item)
    },
    //单个附件下载
    handleOneDownload(file) {
      //file: 数组中的对象
      if (!file.response && !file.id) {
        this.$message.warning('请稍后再试！')
        return
      }
      let fileId = ''
      if (file.id) {
        fileId = file.id
      } else {
        fileId = file.response.fileId
      }
      req.download('${portal}/system/file/v1/downloadFile?fileId=' + fileId)
    },
    //单个附件预览
    handleOnePreview(file) {
      if (file?.response?.fileId) {
        let obj = {}
        obj.id = file?.response?.fileId
        obj.name = file.name
        obj.size = file.size
        this.$refs.filePreview.preview(obj)
      }
    },
    //单个附件删除
    handleOneRemove(file) {
      this.$confirm(`确认删除【${file.name}】吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const resList = this.filesData.filter(
            item => item.response.fileId != file.response.fileId
          )
          this.filesData = resList
        })
        .catch(() => {
          //取消删除
        })
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-table__header thead {
  tr {
    display: table-row;
    width: 100%;
    .cell {
      text-align: left !important;
    }
  }
  th {
    background: #e7f3fc !important;
  }
}
/deep/ .el-table {
  max-width: 2000px !important;
}
.file-list {
  .filename {
    min-width: 150px;
  }
  .file-size {
    min-width: 100px;
  }
  .uploader {
    min-width: 100px;
  }
  .procedure {
    min-width: 100px;
  }
  .upload-time {
    min-width: 100px;
  }
  .settings {
    min-width: 180px;
  }
  .file-title {
  }
  .file-content {
  }
  .preview {
    span {
      &:hover {
        color: aqua;
      }
    }
  }
}
.file-cell {
  text-align: center;
}
/deep/ .el-upload-list {
  display: none;
}
/deep/ .el-table__row {
  display: table-row !important;
}
.preview-text{
  color:#606266;
  &:hover{
    color:#409EFF;
    cursor: pointer;
  }
}
</style>
