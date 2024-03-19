<template>
  <div class="bpm-btn-dialog">
    <!-- 2022-10-09 yigz:原沟通反馈功能，文案上修改为 会签反馈，但功能还是原沟通反馈功能 -->
    <el-dialog
      title="会签反馈"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
    >
      <table cellspacing="0" cellpadding="0" border="0" class="form-table">
        <tbody>
          <tr>
            <th style="width: 100px">
              <span class="xh-star">*</span>审批意见：
            </th>
            <td colspan="3">
              <OpinionText :text="text" ref="opinionText" />
            </td>
          </tr>
          <tr class="attach-upload">
            <th style="width: 100px">附件上传：</th>
            <td colspan="3">
              <FileUpload ref="FileUpload" />
            </td>
          </tr>
        </tbody>
      </table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirm" size="small"
          >确 定</el-button
        >
        <el-button @click="cancel" size="small">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import OpinionText from '@/components/common/opinionText.vue'
import FileUpload from '@/components/common/fileUpload.vue'
import utils from '@/utils.js'
import {Base64} from 'js-base64'
import req from '@/request.js'
export default {
  name: 'taskToFeeBack',
  props: ['instId', 'taskId', 'leaderId', 'getFormKey', 'isLock', 'defId'],
  data() {
    return {
      dialogVisible: false,
      text: '',
      boData: null,
    }
  },
  components: {
    OpinionText,
    FileUpload,
  },
  methods: {
    showDialog({boData, text}) {
      this.dialogVisible = true
      this.boData = boData
      this.text = text
    },
    confirm() {
      let opinion = this.$refs.opinionText.getOpinion()
      if (!opinion) {
        this.$message({type: 'warning', message: '请输入反馈意见'})
        return
      }
      let files = this.$refs.FileUpload.getFiles()
      let zfiles = ''
      this.$refs.FileUpload.isFinishUpload()
      if (files && files != '') {
        files = JSON.stringify(files)
      }
      //ccwgq 2022-10-19 获取表单相关的数据
      let data = {
        instId: this.instId,
        taskId: this.taskId,
        opinion: opinion,
        files: files,
        zfiles: zfiles,
        //补充表单逻辑参数
        defId: this.defId,
        formKey: this.getFormKey(),
        agentLeaderId: this.leaderId,
        formType: 'inner',
      }
      utils
        .getOnlineFormData(false)
        .then((formDataStr) => {
          data.data = Base64.encode(formDataStr)
          this.$store.dispatch('storeProcess/doNextcommu', data).then(() => {
            //TODO: ccwgq 2022-10-21 保存表单的数据,未来待优化，争取两个接口合并成为一个
            const requestUrl =
              window.context.bpmRunTime + '/eipx7/opun/runtime/task/v1/saveToOu'
            req.post(requestUrl, data).then((resp) => {
              console.log('保存表单数据后的响应===>', resp)
            })
          })
          if (this.token != null) {
            window.close()
            // this.$router.push('/home')
          } else {
            // this.$router.go(-1)
            this.$router.push('/home')
          }
        })
        .catch((reason) => {
          utils.handleGetFormDataReject(reason).then(() => {})
        })
    },
    cancel() {
      this.dialogVisible = false
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/change-font.scss';
.attach-upload {
  display: none !important;
}
</style>