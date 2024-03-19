<template>
<div class="bpm-btn-dialog">
  <el-dialog title="并行审批设置" :visible.sync="transDialog" :close-on-click-modal="false">
    <table cellspacing="0" cellpadding="0" border="0" class="form-table">
      <tbody>
        <tr>
          <th style="width: 160px;">
            <span class="xh-star">*</span>并行审批人员：
          </th>
          <td>
            <ht-user-selector v-model="users" permission="w"/>
          </td>
        </tr>
        <tr>
          <th style="width: 160px;">
            <span class="xh-star">*</span>并行审批意见：
          </th>
          <td colspan="3">
            <OpinionText ref="opinionText"/>
          </td>
        </tr>
      </tbody>
    </table>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirm" size="small">确 定</el-button>
      <el-button @click="cancel" size="small">取 消</el-button>
    </div>
  </el-dialog>
</div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { Message } from "element-ui";
import OpinionText from "@/components/common/opinionText.vue";
import FileUpload from "@/components/common/fileUpload.vue";
import HtUserSelector from "@/components/control/HtUserSelector.vue";
import utils from "@/utils.js";

export default {
  name: "taskToApproveLine",
  props: ["taskId"],
  components: { OpinionText, FileUpload, HtUserSelector },
  data() {
    return {
      transDialog: false,
      users: "",
      radioVote: "1", //任务通过规则
      decideType: "agree", //计票策略
      voteType: "percent", //投票类型
      voteAmount: "100", //票数
      signType: "parallel", //流转类型
      action: "submit", //流转结束后的动作
      isHight: false,
      isVoteAmount: false,
      token:utils.getUrlKey("token"),
    };
  },
  methods: {
    //选择投票类型
    voteTypeChange(value) {
      if (value == "percent") {
        this.isVoteAmount = true;
      } else {
        this.isVoteAmount = false;
      }
    },
    //选择任务通过规则
    setVote(value) {
      this.voteType = "amount";
      this.voteAmount = "1";
      if (value == "1") {
        this.isHight = false;
      } else if (value == "2") {
        this.isHight = false;
        this.decideType = "refuse";
      } else if (value == "3") {
        this.isHight = false;
        this.decideType = "agree";
      } else if (value == "4") {
        this.isHight = true;
      }
    },
    //鼠标点击页面其他其他位置不关闭弹框
    handleClose(done) {
      this.transDialog = true;
    },
    //取消
    cancel() {
      this.transDialog = false;
    },
    //确认
    confirm() {
      if (this.users == "" || this.users == null) {
        Message.warning("请选择流转人员");
        return;
      } else if (this.$refs.opinionText.getOpinion() == "") {
        Message.warning("请填写流转意见");
        return;
      }
      let userId = "";
      for (var i = 0; i < this.users.length; i++) {
        userId = userId + this.users[i].id + ",";
      }
      userId = userId.substring(0, userId.length - 1);
      let data = {
        notifyType: "inner",
        taskId: this.taskId,
        opinion: this.$refs.opinionText.getOpinion().trim(),
        userIds: userId
      };
      data.action = this.action;
      data.decideType = this.decideType;
      data.signType = this.signType;
      data.voteAmount = this.voteAmount;
      data.voteType = this.voteType;
      this.$store.dispatch("storeProcess/taskToApproveLine", data).then(() => {
        this.transDialog = false;
        if(this.token!=null){
          window.close();
        }else{
          this.$router.go(-1);
        }
      });
    }
  }
};
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