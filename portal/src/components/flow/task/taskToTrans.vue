<template>
  <div class="bpm-btn-dialog">
    <el-dialog
      title="流转设置"
      :visible.sync="transDialog"
      :close-on-click-modal="false"
    >
      <table cellspacing="0" cellpadding="0" border="0" class="form-table">
        <tbody>
          <tr>
            <th style="width: 160px">
              <span class="xh-star">*</span>任务通过规则：
            </th>
            <td>
              <el-radio v-model="radioVote" label="1" @change="setVote"
                >全票通过</el-radio
              >
              <el-radio v-model="radioVote" label="2" @change="setVote"
                >一票否决</el-radio
              >
              <el-radio v-model="radioVote" label="3" @change="setVote"
                >一票同意</el-radio
              >
              <el-radio v-model="radioVote" label="4" @change="setVote"
                >自定义</el-radio
              >
            </td>
          </tr>
          <tr v-show="isHight">
            <th style="width: 160px">
              <span class="xh-star">*</span>计票策略：
            </th>
            <td>
              <el-radio v-model="decideType" label="agree">同意票</el-radio>
              <el-radio v-model="decideType" label="refuse">否决票</el-radio>
            </td>
          </tr>
          <tr v-show="isHight">
            <th style="width: 160px">
              <span class="xh-star">*</span>投票类型：
            </th>
            <td>
              <el-radio
                v-model="voteType"
                label="amount"
                @change="voteTypeChange"
                >绝对票</el-radio
              >
              <el-radio
                v-model="voteType"
                label="percent"
                @change="voteTypeChange"
                >百分比</el-radio
              >
            </td>
          </tr>
          <tr v-show="isHight">
            <th style="width: 160px"><span class="xh-star">*</span>票数：</th>
            <td>
              <el-input style="width: 80px" v-model="voteAmount"></el-input>
              <span v-show="isVoteAmount">%</span>
            </td>
          </tr>
          <tr>
            <th style="width: 160px">
              <span class="xh-star">*</span>流转类型：
            </th>
            <td>
              <el-radio v-model="signType" label="parallel">并行</el-radio>
              <el-radio v-model="signType" label="seq">串行</el-radio>
            </td>
          </tr>
          <tr>
            <th style="width: 160px">
              <span class="xh-star">*</span>流转结束后的动作：
            </th>
            <td>
              <el-radio v-model="action" label="submit">提交</el-radio>
              <el-radio v-model="action" label="back">返回</el-radio>
            </td>
          </tr>
          <tr>
            <th style="width: 160px">
              <span class="xh-star">*</span>流转人员：
            </th>
            <td>
              <ht-user-selector v-model="users" permission="w" />
            </td>
          </tr>
          <tr>
            <th style="width: 160px">
              <span class="xh-star">*</span>流转意见：
            </th>
            <td colspan="3">
              <OpinionText
                :text="text"
                ref="opinionText"
                @getOpinion="getOpinion"
              />
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
import {Message} from 'element-ui'
import OpinionText from '@/components/common/opinionText.vue'
import FileUpload from '@/components/common/fileUpload.vue'
import HtUserSelector from '@/components/control/HtUserSelector.vue'
import utils from '@/utils.js'
import req from '@/request.js'
export default {
  name: 'taskToTrans',
  props: ['taskId', 'files'],
  components: {OpinionText, FileUpload, HtUserSelector},
  data() {
    return {
      transDialog: false,
      users: '',
      radioVote: '1', //任务通过规则
      decideType: 'agree', //计票策略
      voteType: 'percent', //投票类型
      voteAmount: '100', //票数
      signType: 'parallel', //流转类型
      action: 'submit', //流转结束后的动作
      isHight: false,
      isVoteAmount: false,
      token: utils.getUrlKey('token'),
      flowThis: '', //flowAction的this
      text: '', //意见内容
      boData: '', //boData数据
      opinionField: '', //要回填的字段
      appendStr: true,
      initBoAttr: '',
      appendOpinion: false, //是否覆盖审批意见
      formatOpinion: '',
      opnionSortOrder: 'desc', //TODO:增加一个字段用来控制审批意见倒叙还是正序排序
    }
  },
  methods: {
    //获取意见
    getOpinion(opinion) {
      this.text = opinion
      let opinioValue = this.$refs.opinionText.getOpinion()
      if (this.opinionField) {
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
        //   if (opinioValue){boData[filed[0]][filed[1]]=opinioValue+"\n"+currentUser.fullname+" "+moment().format("YYYY-MM-DD HH:mm:ss");
        //   }
        // }else{
        //   if (opinioValue){
        //     opinioValue+="\n"+currentUser.fullname+" "+moment().format("YYYY-MM-DD HH:mm:ss");
        //   }
        //   if (this.appendStr){
        //     this.initBoAttr=boData[filed[0]][filed[1]];
        //   }
        //   if (filed.length==2){
        //     if(this.initBoAttr){
        //       if(opinion){
        //         boData[filed[0]][filed[1]]=this.initBoAttr+"\n\n"+opinioValue;
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
    //选择投票类型
    voteTypeChange(value) {
      if (value == 'percent') {
        this.isVoteAmount = true
      } else {
        this.isVoteAmount = false
      }
    },
    //选择任务通过规则
    setVote(value) {
      this.voteType = 'amount'
      this.voteAmount = '1'
      if (value == '1') {
        this.isHight = false
      } else if (value == '2') {
        this.isHight = false
        this.decideType = 'refuse'
      } else if (value == '3') {
        this.isHight = false
        this.decideType = 'agree'
      } else if (value == '4') {
        this.isHight = true
      }
    },
    //鼠标点击页面其他其他位置不关闭弹框
    handleClose(_this, opinionField, boData, appendOpinion) {
      this.opinionField = opinionField
      this.boData = boData
      this.appendOpinion = appendOpinion
      this.flowThis = _this
      this.transDialog = true
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
    //取消
    cancel() {
      this.transDialog = false
      this.getOpinion('')
    },
    //确认
    confirm() {
      if (this.users == '' || this.users == null) {
        Message.warning('请选择流转人员')
        return
      } else if (this.$refs.opinionText.getOpinion() == '') {
        Message.warning('请填写流转意见')
        return
      }
       //ccwgq 2022-06-01 这时执行意见反填(有意见反填字段才填)
      if(this.opinionField){
         this.opinionBackToForm();
      }
      utils
        .getOnlineFormData(true)
        .then((formDataStr) => this.submitConfirm(formDataStr))
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
      let userId = ''
      for (var i = 0; i < this.users.length; i++) {
        userId = userId + this.users[i].id + ','
      }
      userId = userId.substring(0, userId.length - 1)
      let data = {
        taskId: this.taskId,
        opinion: this.$refs.opinionText.getOpinion(),
        userIds: userId,
      }
      if (this.$refs.fileUpload.getFiles() != '') {
        data.files = JSON.stringify(this.$refs.fileUpload.getFiles())
      }
      data.action = this.action
      data.decideType = this.decideType
      data.signType = this.signType
      data.voteAmount = this.voteAmount
      data.voteType = this.voteType
      if (formDataStr) {
        data.data = Base64.encode(formDataStr)
      }
      data.formKey = this.flowThis.$refs.formContent.formKey

      this.$store.dispatch('storeProcess/taskToTrans', data).then(() => {
        this.transDialog = false
        if (this.token != null) {
          window.close()
        } else {
          this.$router.go(-1)
        }
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
@import "@/assets/css/change-font.scss";
.attach-upload{
  display: none !important;
}
</style>
