<template>
  <div class="bpm-btn-dialog">
    <!-- 2022-10-09 yigz:原沟通功能，文案上修改为 会签，但功能还是原沟通功能 -->
    <el-dialog
      title="会签设置"
      :visible.sync="commuDialog"
      :close-on-click-modal="false"
    >
      <table cellspacing="0" cellpadding="0" border="0" class="form-table">
        <tbody>
          <tr>
            <th style="width: 100px">
              <span class="xh-star">*</span>会签人员：
            </th>
            <td>
              <ht-user-selector v-model="users" permission="w" />
            </td>
          </tr>
          <tr>
            <th style="width: 100px">
              <span class="xh-star">*</span>会签内容：
            </th>
            <td colspan="3">
              <OpinionText ref="opinionText" :text="text" />
            </td>
          </tr>
          <tr class="attach-upload">
            <th style="width: 100px">附件上传：</th>
            <td colspan="3">
              <FileUpload ref="fileUpload" />
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
import {mapState, mapActions} from 'vuex'
import OpinionText from '@/components/common/opinionText.vue'
import FileUpload from '@/components/common/fileUpload.vue'
import HtUserSelector from '@/components/control/HtUserSelector.vue'
import {Message} from 'element-ui'
import {Base64} from 'js-base64'
import utils from '@/utils.js'
import process from '@/api/process.js'
export default {
  name: 'taskToCommu',
  //2022-09-15 yigz:沟通参数增加 nodeId
  props: [
    'instId',
    'defId',
    'taskId',
    'nodeId',
    'text',
    'getFormKey',
    'leaderId',
  ],
  components: {OpinionText, FileUpload, HtUserSelector},

  data() {
    return {
      commuDialog: false,
      users: '',
    }
  },
  computed: mapState({
    rows: (state) => state.storeProcess.rows,
  }),
  methods: {
    //鼠标点击页面其他其他位置不关闭弹框
    handleClose(done) {
      this.commuDialog = true
      this.text = done
      let _this = this
      this.$nextTick(function () {
        _this.$refs.opinionText.getText(_this.text)
      })
    },
    //取消
    cancel() {
      this.commuDialog = false
    },
    //确认
    confirm() {
      const that = this
      //console.log('taskId ===>', this.taskId)
      //console.log('nodeId ===>', this.nodeId)
      if (this.users == '' || this.users == null) {
        Message.warning('请选会签人员')
        return
      } else if (this.$refs.opinionText.getOpinion() == '') {
        Message.warning('请填写会签内容')
        return
      }
      let userId = ''
      for (var i = 0; i < this.users.length; i++) {
        userId = userId + this.users[i].id + ','
      }
      userId = userId.substring(0, userId.length - 1)
      let files = ''
      if (this.$refs.fileUpload.getFiles() != '') {
        files = JSON.stringify(this.$refs.fileUpload.getFiles())
      }
      //2022-09-15 yigz:沟通参数增加 nodeId
      //2022-10-20 ccwgq:沟通参数增加formKey和data,以传入表单数据
      let data = {
        opinion: this.$refs.opinionText.getOpinion(),
        userId: userId,
        instId: this.instId,
        defId: this.defId,
        files: files,
        taskId: this.taskId,
        nodeId: this.nodeId,
        formKey: this.getFormKey(),
        agentLeaderId: this.leaderId,
        formType: 'inner',
      }
      if (data.opinion.length > 500) {
        data.opinion = data.opinion.substring(0, 500)
      }
      //2022-10-20  ccwgq 获取表单数据传入参数请求
      utils
        .getOnlineFormData(false)
        .then((formDataStr) => {
          data.data = Base64.encode(formDataStr) //表单数据
          that.commuDialog = false
          const formKey = that.getFormKey()
          const formData = JSON.parse(formDataStr)
          const urgentStatus = formData[formKey]?.['urgent_status'] ?? '3'
          //TODO: ccwgq 2022-10-25 调用保存审批的接口来保存表单的数据
          let draftData = {}
          draftData.data = data.data
          draftData.defId = that.defId
          draftData.formKey = formKey
          draftData.formType = 'inner'
          draftData.agentLeaderId = that.leaderId || '0'
          draftData.taskId = that.taskId
          draftData.approval = true
          draftData.destination = ''
          draftData.jumpType = ''
          draftData.nodeUsers = '[]'
          draftData.urgentStateValue = {old: urgentStatus, new: urgentStatus}
          draftData.zfiles = ''
          const loading = that.$loading({
            text: '会签处理中......',
            lock: true,
            fullscreen: true,
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)',
          })
          process.saveTaskDraft(draftData, (resp) => {
            //先保存表单数据成功再发起会签
            this.$store
              .dispatch('storeProcess/communicate', data)
              .then(() => {
                that.commuDialog = false
                utils.reload()
              })
              .finally(() => {
                loading.close()
                //ninghua 20221027  会签完成后回到待办
                this.$router.push({path: '/v-flow/v-todo'})
                //this.$router.go(-1)
              })
          })
          // that.$store
          //   .dispatch('storeProcess/saveTaskDraft', draftData, false)
          //   .then(() => {})
          //   .catch(() => {
          //     Message.error('发起会签失败')
          //   })
        })
        .catch((reason) => {
          utils.handleGetFormDataReject(reason).then(() => {})
        })
    },
    //TODO:未来打开沟通对话框建议使用showDialog
    showDialog() {},
  },
}
</script>

<style lang="stylus" scoped>
.el-dialog__footer {
  padding: 10px 20px;
  padding-top: 10px;
  text-align: right;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

.form-table {
  width: 100%;
  border-top: 1px solid #ebeef5;
  border-left: 1px solid #ebeef5;
}

.form-table th {
  text-align: right;
  color: #666;
}

.form-table th > span {
  color: #f00;
}

.form-table th, .form-table td {
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  padding: 10px;
  min-width: 0;
  box-sizing: border-box;
  text-overflow: ellipsis;
  vertical-align: middle;
  position: relative;
}

.xh-star {
  color: red;
}
</style>

<style lang="scss" scoped>
@import '@/assets/css/change-font.scss';
.attach-upload {
  display: none !important;
}
</style>
