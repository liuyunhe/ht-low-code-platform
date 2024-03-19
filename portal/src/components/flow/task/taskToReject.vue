<template>
  <div class="bpm-btn-dialog">
    <el-dialog
      :title="title"
      width="60%"
      :visible.sync="rejectDialog"
      :close-on-click-modal="false"
    >
      <table
        v-loading="fullscreenLoading"
        cellspacing="0"
        cellpadding="0"
        border="0"
        class="form-table"
      >
        <tbody>
          <tr>
            <th style="width: 140px">
              <span class="xh-star">*</span>驳回重提模式：
            </th>
            <td>
              <el-radio v-model="backHandMode" label="normal"
                >重新审批</el-radio
              >
              <el-radio v-model="backHandMode" label="direct"
                >回到本节点</el-radio
              >
              <span v-show="false" class="xh-star"
                >(网关内驳回只能回到本节点)</span
              >
            </td>
          </tr>

          <tr>
            <th style="width: 140px">
              <span class="xh-star">*</span>驳回方式：
            </th>
            <td style="height: 50px; line-height: 25px">
              <!-- <el-radio
                v-model="radio"
                label="backToStart"
                v-show="
                  rejectConf.canRejectToStart &&
                  (backHandMode == 'normal' || !rejectConf.inSubProcess)
                "
                >驳回发起人</el-radio
              >
              <el-radio
                v-model="radio"
                v-if="
                  !rejectConf.afterGateway &&
                  !rejectConf.inGateway &&
                  !rejectConf.inSubProcess
                "
                label="rejectPre"
                v-show="rejectConf.canRejectPreAct"
                >驳回上一步</el-radio
              >
              <el-radio
                v-model="radio"
                label="reject"
                v-show="
                  rejectConf.canRejectToAnyNode &&
                  (!rejectConf.inSubProcess || backHandMode != 'normal')
                "
                >驳回指定节点</el-radio
              >&nbsp;&nbsp;&nbsp;&nbsp;
              <el-select
                style="width: 130px"
                size="mini"
                v-show="rejectConf.canRejectToAnyNode && radio == 'reject'"
                v-model="nodeId"
                placeholder="请选择"
              >
                <el-option
                  v-for="bpmExeStack in canRejectNode"
                  :key="bpmExeStack.nodeId"
                  :label="bpmExeStack.name"
                  :value="bpmExeStack.nodeId"
                ></el-option>
              </el-select> -->
              <el-radio
                v-model="radio"
                label="rejectPre"
                >驳回上一步</el-radio
              >
            </td>
          </tr>

          <tr>
            <th style="width: 140px">
              <span class="xh-star">*</span>驳回意见：
            </th>
            <td colspan="3">
              <OpinionText
                ref="opinionText"
                :text="opinion"
                @getOpinion="getOpinion"
              />
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
import {mapState, mapActions} from 'vuex'
import {Message} from 'element-ui'
import OpinionText from '@/components/common/opinionText.vue'
import FileUpload from '@/components/common/fileUpload.vue'
import utils from '@/utils.js'
import req from '@/request.js'
export default {
  name: 'taskToReject',
  props: [
    'taskId',
    'leaderId',
    'opinion',
    'opinionField',
    'appendOpinion',
    'instId',
  ],
  components: {OpinionText, FileUpload},
  data() {
    return {
      rejectTaskId: '', //要驳回的任务ID
      rejectDialog: false,
      radio: '',
      nodeId: '',
      backHandMode: 'normal',
      token: utils.getUrlKey('token'),
      canRejectNode: [],
      rejectConf: {},
      isSameNode: true,
      title: '驳回',
      fullscreenLoading: true,
      flowThis: '', //flowAction的this,
      boData: {},
      wrap: '\n',
      initBoAttr: '',
      appendStr: true,
      formatOpinion: '',
      opnionSortOrder: 'desc', //TODO:增加一个字段用来控制审批意见倒叙还是正序排序
    }
  },
  computed: {},
  watch: {
    backHandMode: function (n, o) {
      if (this.rejectConf.inSubProcess) {
        if (n == 'normal') {
          this.radio = 'backToStart'
        } else {
          this.radio = 'reject'
        }
      }
      if (!this.isSameNode) {
        if (n == 'normal') {
          this.canRejectNode = this.rejectConf.allowNormalNode
        } else {
          this.canRejectNode = this.rejectConf.allowDirectNode
        }
        let flag = false
        this.canRejectNode.forEach((n) => {
          if (n.nodeId == this.nodeId) {
            flag = true
            return
          }
        })
        if (!flag) {
          this.nodeId = ''
        }
      }
    },
  },
  methods: {
    //鼠标点击页面其他其他位置不关闭弹框
    handleClose() {
      this.rejectDialog = true
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
    //打开驳回设置页面
    handleOpen(parentTaskId, _this, text) {
      if (
        this.opinionField &&
        document.querySelector("[model-name='data." + this.opinionField + "']")
      ) {
        let con = document.querySelector(
          "[model-name='data." + this.opinionField + "']"
        ).__vue__
        if (con && con.isEditor) {
          this.wrap = '<br>'
        }
      }
      this.boData = _this.$refs.formContent.data
      if (parentTaskId) {
        this.rejectTaskId = parentTaskId
      }
      this.flowThis = _this
      let data = {taskId: this.taskId, backModel: 'reject'}
      let this_ = this
      this.$store
        .dispatch('storeProcess/taskToReject', data)
        .then(function (resp) {
          this_.rejectConf = resp
          let normalNodeIds = []
          resp.allowNormalNode.forEach((element) => {
            normalNodeIds.push(element.nodeId)
          })
          if (resp.allowNormalNode) {
            resp.allowDirectNode.forEach((element) => {
              if (normalNodeIds.indexOf(element.nodeId) < 0) {
                this_.isSameNode = false
              }
            })
          }
          if (resp.inGateway) {
            this_.backHandMode = 'direct'
          }
          if (this_.backHandMode == 'normal') {
            this_.canRejectNode = resp.allowNormalNode
          } else {
            this_.canRejectNode = resp.allowDirectNode
          }

          // 只有驳回发起人的情况
          if (
            this_.rejectConf.canRejectToStart &&
            !this_.rejectConf.canRejectPreAct &&
            !this_.rejectConf.canRejectToAnyNode
          ) {
            this_.radio = 'backToStart'
            this_.rejectDialog = true
            this_.fullscreenLoading = false
            return
          }
          // 只有驳回上一步的情况
          if (
            !this_.rejectConf.canRejectToStart &&
            this_.rejectConf.canRejectPreAct &&
            !this_.rejectConf.canRejectToAnyNode
          ) {
            this_.radio = 'rejectPre'
            this_.rejectDialog = true
            this_.fullscreenLoading = false
            return
          }

          // 只有驳回指定节点的情况并且指定节点只有一个
          if (
            !this_.rejectConf.canRejectToStart &&
            !this_.rejectConf.canRejectPreAct &&
            this_.rejectConf.canRejectToAnyNode &&
            this_.canRejectNode.length == 1
          ) {
            this_.nodeId = this_.canRejectNode[0].nodeId
            this_.radio = 'reject'
            this_.rejectDialog = true
            this_.fullscreenLoading = false
            return
          }
          if (
            this_.rejectConf.canRejectToStart &&
            (this_.backHandMode == 'normal' || !this_.rejectConf.inSubProcess)
          ) {
            this_.radio = 'backToStart'
          } else if (
            !this_.rejectConf.afterGateway &&
            !this_.rejectConf.inGateway &&
            !this_.rejectConf.inSubProcess &&
            this_.rejectConf.canRejectPreAct
          ) {
            this_.radio = 'rejectPre'
          } else if (
            this_.rejectConf.canRejectToAnyNode &&
            (!this_.rejectConf.inSubProcess || this_.backHandMode != 'normal')
          ) {
            this_.radio = 'reject'
            this_.isNode = true
          }
          this_.title = '驳回设置'
          this_.rejectDialog = true
          this_.text = text
          this_.$nextTick(function(){
            this_.$refs.opinionText.getText(this_.text)
          });
          this_.fullscreenLoading = false
        })
    },
    //取消
    cancel() {
      this.rejectDialog = false
      this.$refs.opinionText.opinion = ''
    },
    //确认
    confirm() {
      // debugger
      if (!this.radio) {
        Message.warning('请选择驳回方式')
        return
      }
      if (this.radio == 'reject' && !this.nodeId) {
        Message.warning('请选择驳回节点')
        return
      }
      if (!this.opinion && this.$refs.opinionText.getOpinion() == '') {
        Message.warning('请填写驳回意见')
        return
      }
      //ccwgq 2022-06-01 这时执行意见反填(有意见反填字段才填)
      if(this.opinionField){
         this.opinionBackToForm();
      }
      // lyzcw: 驳回不做校验，true改为false----2021-5-18
      utils
        .getOnlineFormData(false)
        .then((formDataStr) => {
          this.submitConfirm(formDataStr)
          this.$router.push({path:"/v-flow/v-todo"})
          })
        .catch((reason) =>
          utils.handleGetFormDataReject(reason).then(() => this.submitConfirm())
        )
    },
    submitConfirm(formDataStr) {
      let _this = this
      let scriptResult = this.runBeforeScript()
      //执行前置脚本返回false时终止按钮操作
      if (scriptResult === false) return
      //执行前置脚本返回的接口时先执行前置事件接口
      if (scriptResult.then && typeof scriptResult.then == 'function') {
        scriptResult.then(
          () => {
            //接口返回成功则正常执行按钮操作
            _this.funcDoNext(formDataStr)
          },
          (fail) => {
            //接口返回失败则终止按钮操作，并给与提示
            _this.$message.warning(fail)
            return
          }
        )
      } else {
        //执行前置脚本返回true时正常执行按钮操作
        _this.funcDoNext(formDataStr)
      }
    },
    funcDoNext(formDataStr) {
      utils.closeAllNotification()
      if (formDataStr && formDataStr.constructor != String) {
        formDataStr = JSON.stringify(formDataStr)
      }
      if (this.radio == 'rejectPre') {
        this.nodeId = ''
      }
      let files = this.$refs.FileUpload.getFiles()
      if (files != '') {
        files = JSON.stringify(files)
      }
      this.$refs.FileUpload.isFinishUpload()
      let data = {
        taskId: this.taskId,
        rejectTaskId: this.rejectTaskId,
        actionName: this.radio == 'rejectPre' ? 'reject' : this.radio,
        backHandMode: this.backHandMode,
        opinion: this.opinion || this.$refs.opinionText.getOpinion(),
        destination: this.nodeId,
        agentLeaderId: this.leaderId,
        files: files,
      }
      if (window.urgentStateValue) {
        data.urgentStateValue = window.urgentStateValue
      }
      if (formDataStr) {
        data.data = Base64.encode(formDataStr)
      }
      data.formKey = this.flowThis.$refs.formContent.formKey

      this.$loading()
      this.$store.dispatch('storeProcess/rejectComplete', data).then(() => {
        this.$loading().close()
        this.rejectDialog = false
        if (this.token != null) {
          // window.close()
          // 20231020 完成后返回上一级
          console.log("20231020测试")
          this.$router.push({path:"/v-flow/v-todo"})
          utils.reload();
          // window.history.go(-1)
        } else {
          console.log("else===》")
          //20221102 ninghua 退回后回到待办
          this.$router.push({path:"/v-flow/v-todo"})
          utils.reload();
          //this.$parent.nextTask()
          //this.$router.go(-1);
        }
      })
    },
    //获取意见
    getOpinion(opinion) {
      this.text = opinion
      let opinioValue = this.$refs.opinionText.getOpinion()
      if (
        this.opinionField &&
        document.querySelector("[model-name='data." + this.opinionField + "']")
      ) {
        let currentUser = this.$store.state.user.currentUserDetail.user
        let moment = require('moment')

        this.formatOpinion =
          opinioValue +
          this.wrap +
          currentUser.fullname +
          ' ' +
          moment().format('YYYY-MM-DD HH:mm:ss')
        // let boData = this.boData;
        // let filed=this.opinionField.split(".");
        // if(boData[filed[0]][filed[1]] == '<p><br/></p>'){
        //   boData[filed[0]][filed[1]] = "";
        // }
        // //是否覆盖审批意见
        // if (this.appendOpinion){
        //   if (opinioValue){boData[filed[0]][filed[1]]=opinioValue+this.wrap+currentUser.fullname+" "+moment().format("YYYY-MM-DD HH:mm:ss");
        //   }
        // }else{
        //   if (opinioValue){
        //     opinioValue+=this.wrap+currentUser.fullname+" "+moment().format("YYYY-MM-DD HH:mm:ss");
        //   }
        //   if (this.appendStr){
        //     this.initBoAttr=boData[filed[0]][filed[1]];
        //   }
        //   if (filed.length==2){
        //     if(this.initBoAttr){
        //       if(opinion){
        //         boData[filed[0]][filed[1]]=this.initBoAttr+this.wrap+this.wrap+opinioValue;
        //       }else{
        //         boData[filed[0]][filed[1]]=this.initBoAttr
        //       }
        //     }else{
        //       boData[filed[0]][filed[1]]=opinioValue;
        //     }
        //   }
        //   this.appendStr=false;
        // }
        /*else if (filed.length==3 &&boData[filed[0]][filed[1]].length>0){//处理子表
          for (let i = 0; i <boData[filed[0]][filed[1]].length ; i++) {
            boData[filed[0]][filed[1]][i][filed[2]]=opinioValue;
          }
        }*/
      }
    },
    //ccwgq 审批意见回填到表单
    opinionBackToForm() {
      let boData = this.boData
      let filed = this.opinionField.split('.')
      if (boData[filed[0]][filed[1]] == '<p><br/></p>') {
        boData[filed[0]][filed[1]] = ''
      }
      //是否覆盖审批意见
      if (this.appendOpinion) {
        if (this.formatOpinion) {
          boData[filed[0]][filed[1]] = this.formatOpinion
        }
      } else {
        if (this.appendStr) {
          this.initBoAttr = boData[filed[0]][filed[1]]
        }
        if (filed.length == 2) {
          if (this.initBoAttr) {
            //根据选项控制是否正序或者倒叙
            if (this.opnionSortOrder == 'desc') {
              boData[filed[0]][filed[1]] =
                this.formatOpinion + this.wrap + this.wrap + this.initBoAttr
            } else {
              boData[filed[0]][filed[1]] =
                this.initBoAttr + this.wrap + this.wrap + this.formatOpinion
            }
          } else {
            boData[filed[0]][filed[1]] = this.formatOpinion
          }
        }
        this.appendStr = false
      }
      /*else if (filed.length==3 &&boData[filed[0]][filed[1]].length>0){//处理子表
          for (let i = 0; i <boData[filed[0]][filed[1]].length ; i++) {
            boData[filed[0]][filed[1]][i][filed[2]]=opinioValue;
          }
        }*/
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
@import "@/assets/css/change-font.scss";
.attach-upload{
  display: none !important;
}
</style>
