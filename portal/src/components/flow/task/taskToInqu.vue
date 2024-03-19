<template>
  <div class="bpm-btn-dialog">
    <el-dialog
      title="征询设置"
      :visible.sync="inquDialog"
      :close-on-click-modal="false"
    >
      <table cellspacing="0" cellpadding="0" border="0" class="form-table">
        <tbody>
          <tr>
            <th style="width: 100px">
              <span class="xh-star">*</span>征询人员：
            </th>
            <td>
              <ht-user-selector v-model="users" single permission="w" />
            </td>
          </tr>
          <tr v-if="status">
            <th style="width: 100px">
              <span class="xh-star">*</span>征询类型：
            </th>
            <td>
              <el-radio v-model="inquType" label="direct">直接返回</el-radio>
              <el-radio v-model="inquType" label="step">逐级返回</el-radio>
            </td>
          </tr>
          <tr>
            <th style="width: 100px">
              <span class="xh-star">*</span>征询说明：
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
import OpinionText from '@/components/common/opinionText.vue'
import FileUpload from '@/components/common/fileUpload.vue'
import HtUserSelector from '@/components/control/HtUserSelector.vue'
import {Message} from 'element-ui'
import {Base64} from 'js-base64'
import utils from '@/utils.js'

export default {
  name: 'taskToInqu',
  props: ['taskId'],
  components: {OpinionText, FileUpload, HtUserSelector},
  data() {
    return {
      inquDialog: false,
      users: '',
      token: utils.getUrlKey('token'),
      inquType: 'direct',
      status: false,
      text: '', //意见内容
      boData: '', //boData数据
      opinionField: '', //要回填的字段
      appendStr: true,
      initBoAttr: '',
      appendOpinion: false, //是否覆盖审批意见,
      wrap: '\n',
      formatOpinion: '',
      opnionSortOrder: 'desc',
    }
  },
  methods: {
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
        //ccwgq 2022-05-30 回填的时机在确定按钮按下之后

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
    //鼠标点击页面其他其他位置不关闭弹框
    handleClose(opinionField, boData, appendOpinion) {
      if (
        opinionField &&
        document.querySelector("[model-name='data." + opinionField + "']")
      ) {
        let con = document.querySelector(
          "[model-name='data." + opinionField + "']"
        ).__vue__
        if (con && con.isEditor) {
          this.wrap = '<br>'
        }
      }
      this.opinionField = opinionField
      this.boData = boData
      this.appendOpinion = appendOpinion
      this.inquDialog = true
    },
    //取消
    cancel() {
      this.inquDialog = false
      this.getOpinion('')
    },
    showType() {
      this.status = true
    },
    //确认
    confirm() {
      if (this.users == '' || this.users == null) {
        Message.warning('请选择征询人员')
        return
      } else if (this.$refs.opinionText.getOpinion() == '') {
        Message.warning('请填写征询说明')
        return
      }
      //ccwgq 2022-06-01 这时执行意见反填(有意见反填字段才填)
      if(this.opinionField){
         this.opinionBackToForm();
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
      let data = {
        taskId: this.taskId,
        opinion: this.$refs.opinionText.getOpinion(),
        userIds: userId,
        action: 'back',
        files: files,
        data: JSON.stringify(this.$parent.$refs.formContent.data),
      }
      //征询类型
      if (this.status) {
        data.inquType = this.inquType
      }
      this.$store.dispatch('storeProcess/taskToInqu', data).then(() => {
        this.inquDialog = false
        if (this.token != null) {
          window.close()
        } else {
          this.$router.push('/v-flow/v-todo')
          //this.$router.go(-1);
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
