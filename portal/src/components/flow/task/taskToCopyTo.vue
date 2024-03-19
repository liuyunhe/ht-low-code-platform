<template>
  <div class="bpm-btn-dialog">
    <el-dialog
      title="流程抄送"
      :visible.sync="copyToDialog"
      :close-on-click-modal="false"
    >
      <table cellspacing="0" cellpadding="0" border="0" class="form-table">
        <tbody>
          <tr>
            <th style="width: 100px">
              <span class="xh-star">*</span>抄送人员：
            </th>
            <td>
              <ht-user-selector v-model="users" permission="w" />
            </td>
          </tr>
          <!-- ccwgq 2022-09-07 抄送只需要选人不需要抄送说明  -->
          <tr v-show="false">
            <th style="width: 100px">
              <span class="xh-star">*</span>抄送说明：
            </th>
            <td colspan="3">
              <OpinionText ref="opinionText" />
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
import utils from '@/utils.js'
export default {
  name: 'taskToCopyTo',
  props: ['taskId', 'instId', 'nodeId'],
  components: {OpinionText, FileUpload, HtUserSelector},
  data() {
    return {
      copyToDialog: false,
      users: '',
      selectNodeId: ''
    }
  },
  computed: mapState({
    rows: state => state.storeProcess.rows
  }),
  methods: {
    //鼠标点击页面其他其他位置不关闭弹框
    handleClose(nodeId, copyTaskId) {
      this.selectNodeId = nodeId
      if (!this.taskId && copyTaskId) {
        this.taskId = copyTaskId
      }
      this.copyToDialog = true
    },
    //取消
    cancel() {
      this.copyToDialog = false
    },
    //确认
    confirm() {
      if (this.users == '' || this.users == null) {
        Message.warning('请选择抄送人员')
        return
      }
      //ccwgq 2022-09-07 抄送时只需要选人不需要抄送意见
      // else if(this.$refs.opinionText.getOpinion()==""){
      //   Message.warning("请填写抄送说明");
      //   return;
      // }
      let userId = ''
      for (var i = 0; i < this.users.length; i++) {
        userId = userId + this.users[i].id + ','
      }
      userId = userId.substring(0, userId.length - 1)
      let files = ''
      if (this.$refs.fileUpload.getFiles() != '') {
        files = JSON.stringify(this.$refs.fileUpload.getFiles())
      }
      let data = {
        copyToType: '0',
        messageType: 'inner',
        opinion: this.$refs.opinionText.getOpinion(),
        userId: userId,
        instanceId: this.instId,
        taskId: this.taskId,
        files: files,
        //源代码
        //selectNodeId: this.selectNodeId,
        //修改后代码
        selectNodeId: this.nodeId
      }

      this.$store.dispatch('storeProcess/transToMore', data).then(() => {
        this.copyToDialog = false
        utils.reload()
      })
    }
  }
}
</script>

<style lang="stylus">
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