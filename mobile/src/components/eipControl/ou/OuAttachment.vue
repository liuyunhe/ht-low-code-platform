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
    <!-- TODO:附件允许全部下载 -->
    <div v-if="inputWriteable" style="display: flex">
      <el-upload
        class="upload-demo"
        :action="actionUrl"
        :file-list="uploadFiles"
        :headers="header"
        :multiple="multiple"
        :accept="accept"
        :on-exceed="exceed"
        :on-error="error"
        :on-success="success"
        :before-upload="before"
        :limit="parseInt(limit) || 9999999"
      >
        <el-tooltip placement="right" effect="light">
          <div slot="content">
            <!-- TODO:修复附件支持功能 -->
            <!-- 附件格式支持：{{ accept }} <br /> -->
            附件大小限制：单个文件不超过{{ size }}MB
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
      :show-header="true"
      :style="{maxWidth: maxWidth + 'px'}"
      v-if="Array.isArray(filesData) && filesData.length > 0"
      :data="filesData"
      border
      height="250"
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
            <span style="padding-left: 4px">{{ scope.row.name }}</span>
          </div>
          <div v-else>
            <i class="el-icon-document"></i>
            <span style="padding-left: 4px">{{ scope.row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="附件大小" align="left">
        <template slot-scope="scope">
          <span>{{ scope.row.size | computerSize }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="上传者"
        align="left"
        prop="username"
      ></el-table-column>
      <el-table-column
        label="步骤"
        align="left"
        prop="procedure"
      ></el-table-column>
      <el-table-column label="上传时间" align="left">
        <template slot-scope="scope">
          <span>{{ scope.row.uploadTime | formatTime(pattern) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120px">
        <template slot-scope="scope">
          <div class="buttons">
            <el-button
              size="mini"
              v-if="inputWriteable || (isReadOnly && allowDownload)"
              @click="handleOneDownload(scope.row)"
              >下载</el-button
            >
            <el-button
              size="mini"
              v-if="
                isAllowDelete(scope.row) &&
                inputWriteable &&
                (!deleteBySelf ||
                  (deleteBySelf && scope.row.userId == currentUser.userId))
              "
              @click="handleOneRemove(scope.row)"
              >删除</el-button
            >
          </div>
        </template>
      </el-table-column>
    </el-table>
    <span v-else-if="!inputWriteable">附件未上传</span>
    <!-- <FilePreview ref="filePreview" :closeable="false" /> -->
  </div>
</template>

<script>
import moment from 'moment'
import utils from '@/utils.js'
import req from '@/request.js'
import sub_pio_mixin from '@/sub-permission-mixin.js'
import FilePreview from '@/components/common/FilePreview.vue'
export default {
  name: 'ou-attachment',
  components: {
    FilePreview,
  },
  props: {
    //TODO:
    validate: {
      type: String,
    },
    //值
    value: {
      type: String,
      required: true,
      default: '',
    },
    //权限
    permission: {
      type: String,
      required: true,
      validate: function (val) {
        return ['b', 'w', 'r', 'n'].includes(val)
      },
    },
    //单个文件限制大小
    size: {
      type: Number,
      default: 0,
      validate: function (val) {
        return val >= 0
      },
    },
    //限制上传的文件总数
    limit: {
      type: [Number, String],
      default: 1,
      validate: (val) => val >= 1,
    },
    //允许同时上传多个文件
    multiple: {
      type: Boolean,
      default: false,
    },
    //可接受的文件后缀
    accept: {
      type: String,
      default: '',
    },
    //允许可读权限时预览
    allowPreview: {
      type: Boolean,
      default: false,
    },
    //允许可读权限时下载
    allowDownload: {
      type: Boolean,
      default: false,
    },
    //TODO:其他配置
    propConf: {
      type: String,
    },
    //简略模式
    simplicity: {
      type: Boolean,
      default: false,
    },
    //节点名--步骤名,通过这接收流程中的节点名称
    nodeName: {
      type: String,
      default: '',
    },
     //节点ID--通过这接收流程中的节点ID
    nodeId:{
      type: String,
      default: '',
    },
    //格式化时间模式,和moment要求一致，
    //TODO:支持在管理端定义需要的时间格式
    pattern: {
      type: String,
      default: '',
    },
    //只允许用户删除自己上传的文件
    deleteBySelf: {
      type: Boolean,
      default: true,
    },
    // varControlDownload:{
    //   type:String,
    //   default:true
    // }
  },
  model: {
    prop: 'value',
    event: 'input',
  },
  filters: {
    //文件大小格式化
    computerSize: function (val) {
      if (val < 1024) {
        return val + 'B'
      } else if (val < 1024 * 1024) {
        var temp = val / 1024
        temp = temp.toFixed(2)
        return temp + 'KB'
      } else if (val < 1024 * 1024 * 1024) {
        var temp = val / (1024 * 1024)
        temp = temp.toFixed(2)
        return temp + 'MB'
      } else {
        var temp = val / (1024 * 1024 * 1024)
        temp = temp.toFixed(2)
        return temp + 'GB'
      }
    },
    //时间格式化
    formatTime: function (val, pattern) {
      val = new Date(val)
      pattern = pattern || 'YYYY-MM-DD HH:mm:ss'
      return moment(val).format(pattern)
    },
  },
  data() {
    return {
      filesData: [],
      inputName: null,
      uploadFiles: [], //上传组件记录的文件
      writeable: true,
      uploadingFiles: {},
      maxWidth: 100,
    }
  },
  computed: {
    isReadOnly: function () {
      return this.permission == 'r'
    },
    inputWriteable: function () {
      return this.writeable
        ? utils.getWriteable(this.permission)
        : this.writeable
    },
    inputValidate: function () {
      return utils.addRequiredOrNot(this.permission, this.validate, this)
    },
    actionUrl: function () {
      return window.context.portal + '/system/file/v1/upload'
    },

    //计算fileList
    fileList: {
      get() {
        return []
      },
      set(files) {},
    },

    header: function () {
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
    },
  },
  mixins: [sub_pio_mixin], //混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub）
  created() {
    this.inputName = this.name ? this.name : utils.getName()
    this.$validator = this.$root.$validator
    if (this.value && this.value.constructor === String) {
      //TODO:对附件类型进行转化
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
    filesData: function (newVal) {
      let r = ''
      if (newVal && newVal.constructor === Array && newVal.length > 0) {
        // 只有上传成功的附件才能更新v-model值
        let ary = newVal.filter((m) => m.status === 'success')
        if (ary && ary.length > 0) {
          r = JSON.stringify(ary)
        }
      }
      //设置表头显示
      this.$nextTick(() => {
        //此组件渲染完毕
        this.$nextTick(() => {
          //el-table渲染完毕
          //强制表头显示
          $(this.$el)
            .find('.el-table__header > thead > tr')
            .css({display: 'table-row', color: 'black'})
        })
      })
      this.$emit('input', r)
    },
  },

  methods: {
    //获取指定字符串点最后一个字符
    substringType(str) {
      let valueArr = str.split('.')
      return valueArr[valueArr.length - 1]
    },
    //当前节点的附件才允许删除
    //ccwgq 2022-07-05 改用节点ID进行判断
    isCurrentNode(nodeId) {
      return this.nodeId == nodeId
    },
    isAllowDelete(row) {
      var deletable = row?.allowDelete ?? true
      return this.isCurrentNode(row.procedure_id || '') && deletable
    },
    //上传前的回调
    before() {
      return true
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
      item.procedure_id=this.nodeId
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
    //TODO: 修复附件的预览功能
    //单个附件预览
    handleOnePreview(file) {
      return
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
        type: 'warning',
      })
        .then(() => {
          const resList = this.filesData.filter(
            (item) => item.response.fileId != file.response.fileId
          )
          this.filesData = resList
        })
        .catch(() => {
          //取消删除
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.el-table__header /deep/ thead tr {
  display: table-row;
  width: 100%;
}

/deep/ .el-table {
  // max-width: fit-content !important;;
  max-width: max-content !important;
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
    .preview {
      // background-color: #00bbff;
    }
  }
}
.file-cell {
  text-align: center;
}
/deep/ .el-upload-list {
  display: none;
}
</style>
