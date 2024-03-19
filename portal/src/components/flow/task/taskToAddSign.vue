<template>
  <div class="bpm-btn-dialog">
    <el-dialog
      title="会签设置"
      :visible.sync="addSignDialog"
      :close-on-click-modal="false"
    >
      <table cellspacing="0" cellpadding="0" border="0" class="form-table">
        <tbody>
          <tr>
            <th style="width: 100px">
              <span class="xh-star">*</span>会签人员：
            </th>
            <td>
              <ht-user-selector
                v-model="users"
                :single="false"
                permission="w"
              />
            </td>
          </tr>
          <tr>
            <th style="width: 100px">
              <span class="xh-star">*</span>会签说明：
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
import req from '@/request.js'
export default {
  name: 'taskToAddSign',
  props: ['taskId'],
  components: {OpinionText, FileUpload, HtUserSelector},
  data() {
    return {
      addSignDialog: false,
      users: '',
      nodeType: '',
      instId: '',
      flowThis: '', //flowAction的this
    }
  },
  methods: {
    //鼠标点击页面其他其他位置不关闭弹框
    handleClose(nodeType, instId, _this) {
      this.flowThis = _this
      this.instId = instId
      this.nodeType = nodeType
      this.addSignDialog = true
    },
    //执行前置脚本
    runBeforeScript() {
      let _this = this
      let item = utils.indexOfList(
        _this.flowThis.rowsBtn,
        'alias',
        _this.flowThis.btnAlias
      )
      return _this.tempScript(item.beforeScript)
    },
    //执行前置脚本
    tempScript(script) {
      let _this = this
      let _req = req
      let boData = _this.flowThis.$refs.formContent.data
      let tempScript =
        'var tempFunction = function(_req,data,_this){ ' + script + '};'
      let result = eval(tempScript + 'tempFunction(_req,boData,_this);')
      if (result && result.then && typeof result.then == 'function') {
        return result
      }
      if (result === false) return false
      return true
    },
    //人员选择器
    selectUser() {
      this.$refs.selectUser.showDialog() //父组件调用子组件方法
    },
    //取消
    cancel() {
      this.addSignDialog = false
    },
    //确认
    confirm() {
      if (this.users == '' || this.users == null) {
        Message.warning('请选择加签人员')
        return
      } else if (this.$refs.opinionText.getOpinion() == '') {
        Message.warning('请填写加签说明')
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

      if (this.nodeType == 'USERTASK') {
        //用户任务加签
        let data = {
          action: 'back',
          files: files,
          opinion: this.$refs.opinionText.getOpinion(),
          taskId: this.taskId,
          userIds: userId,
        }
        //获取表单数据
        utils
          .getOnlineFormData(true)
          .then((formDataStr) => this.submitConfirm(formDataStr, data))
          .catch((reason) =>
            utils
              .handleGetFormDataReject(reason)
              .then(() => this.submitConfirm('', data))
          )
      } else {
        //会签任务加签
        let data = {
          taskId: this.taskId,
          opinion: this.$refs.opinionText.getOpinion(),
          userId: userId,
          files: files,
        }
        this.$store.dispatch('storeProcess/taskSignUsers', data).then(() => {
          this.addSignDialog = false
          utils.reload()
        })
      }
    },
    //用户任务加签
    submitConfirm(formDataStr, data) {
      let _this = this
      let scriptResult = this.runBeforeScript()
      //执行前置脚本返回false时终止按钮操作
      if (scriptResult === false) return
      //执行前置脚本返回的接口时先执行前置事件接口
      if (scriptResult.then && typeof scriptResult.then == 'function') {
        scriptResult.then(
          () => {
            //接口返回成功则正常执行按钮操作
            _this.funcDoNext(formDataStr, data)
          },
          (fail) => {
            //接口返回失败则终止按钮操作，并给与提示
            _this.$message.warning(fail)
            return
          }
        )
      } else {
        //执行前置脚本返回true时正常执行按钮操作
        _this.funcDoNext(formDataStr, data)
      }
    },
    funcDoNext(formDataStr, data) {
      utils.closeAllNotification()
      if (formDataStr) {
        data.data = Base64.encode(formDataStr)
      }
      this.$store.dispatch('storeProcess/userTaskToSign', data).then(() => {
        this.addSignDialog = false
        this.$router.push('/inst/' + this.instId + '/doneList')
      })
    },
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