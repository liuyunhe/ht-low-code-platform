<template>
  <div class="bpm-btn-dialog">
    <!-- 2022-08-31：yigz 加签 修改为 会签 -->
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
          <!-- ccwgq 2022-05-27 加入保存表单数据单选 默认保存 -->
          <tr>
            <th style="width: 100px">保存表单数据</th>
            <td colspan="3">
              <el-radio-group v-model="saveBoData">
                <el-radio :label="false">否</el-radio>
                <el-radio :label="true">是</el-radio>
              </el-radio-group>
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
import {Base64} from 'js-base64'
export default {
  name: 'userAddSignReply',
  props: ['instId', 'taskId', 'defId','text'],
  data() {
    return {
      dialogVisible: false,
      // text: '',
      saveBoData: true, //是否保存表单数据
      data: {}, //data
    }
  },
  components: {
    OpinionText,
    FileUpload,
  },
  methods: {
    showDialog(data,text) {
      this.data = data
      this.dialogVisible = true
      this.text = text
      let _this = this
      this.$nextTick(function(){
        _this.$refs.opinionText.getText(_this.text)
      });
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
      let data = {
        procDefId: this.defId,
        procInstId: this.instId,
        status: 'inqu_reply',
        taskId: this.taskId,
        opinion: opinion,
        files: files,
        zfiles: zfiles,
      }
      //ccwgq 2022-05-27 确认要保存数据
      if (this.saveBoData) {
        //保存并不显示提示框
        debugger
        console.log(JSON.parse(Base64.decode(this.data.data)))
        //TODO:让后端在加签接口增加保存数据的功能
        this.$store.dispatch('storeProcess/saveTaskDraft', this.data, false)
      }
      this.$store.dispatch('storeProcess/userAddSign', data).then(() => {
        if (this.token != null) {
          window.close()
        } else {
          this.$router.go(-1)
        }
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
