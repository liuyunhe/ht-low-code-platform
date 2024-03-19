<template>
  <ht-sidebar-dialog
      :visible="approveLineDialog"
      title="并行审批设置"
      :close-on-click-modal="false"
      :before-close="cancel"
      append-to-body
      class="dialog-body"
      width="100%"
    >
      <div :style="this.style">
            <van-form v-form @submit="confirm">

                <div class="title-divider">
                   <span>并行审批人员：</span>
                </div>

                <div class="opinion-text">
                  <EipUserSelector
                      v-model="users"
                      :config="{id:'userIds',fullname: 'users'}"
                      :append-to-body="true"
                      :single="false"
                    />
                </div>

                
                <div class="title-divider">
                    <span>并行审批意见：</span>
                </div>
                <div class="opinion-text">
                    <OpinionText :text="opinion" ref="opinionText"/>
                </div>
                 
            </van-form>
      
          <div class="ht-dialog-footer" >
              <van-grid clickable :column-num="2">
                <van-grid-item icon="passed" @click="confirm" text="确 认" />
                <van-grid-item icon="close" @click="cancel" text="取 消" />
              </van-grid>
          </div>

      </div>
      
  </ht-sidebar-dialog>
</template>

<script>
import flow from "@/api/flow.js";
import { Notify,Form } from "vant";
import OpinionText from "@/components/flow/task/OpinionText.vue";
import EipUserSelector from "@/components/eipControl/selector/EipUserSelector.vue";
import utils from "@/utils.js";

export default {
 name: "taskToApproveLine",
 props: ["taskId"],
  components: { 
    [Form.name]: Form,
    OpinionText, 
    EipUserSelector
  },
  data() {
    return {
      approveLineDialog: false,
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
      opinion: "",
      style:"",
      userIds: "",
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
      this.approveLineDialog = true;
    },
    //取消
    cancel() {
      this.approveLineDialog = false;
    },
    //确认
    confirm() {
      if (this.users == "" || this.users == null) {
        Notify({
          type: "danger",
          message: "请选择并行审批人员"
        });
        return;
      } else if (this.$refs.opinionText.getOpinion() == "") {
        Notify({
          type: "danger",
          message: "请填写并行审批意见"
        });
        return;
      }
      this.userIds += ",";
      let data = {
        notifyType: "inner",
        taskId: this.taskId,
        opinion: this.$refs.opinionText.getOpinion(),
        userIds: this.userIds
      };
      data.action = this.action;
      data.decideType = this.decideType;
      data.signType = this.signType;
      data.voteAmount = this.voteAmount;
      data.voteType = this.voteType;
      this.$store.dispatch("storeProcess/taskToApproveLine", data).then(() => {
        this.approveLineDialog = false;
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
>>> .el-dialog__header {
  padding: 10px 20px;
  background: #F8F8F8;
  height: 24px;
  line-height: 24px;
  border-bottom: 1px solid #eee;
  border-radius: 2px 2px 0 0;
}
>>> .el-dialog__headerbtn {
  top: 12px;
}
.ht-dialog-footer {
  height: 45px;
  position: fixed;
  bottom: 0;
  width: 100%;
}

div>>>.van-grid-item__icon {
  font-size: 15px !important;
}

div>>>.van-grid-item__content {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    height: 45px;
    padding: 16px 8px;
    background-color:  #f5f5f5 !important;
}

.title-divider{
    margin: 0;
    padding: 10px 10px 10px;
    color: rgba(69, 90, 100, 0.6);
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
    background: #F7F8FA;
}

.van-field{
  padding: 10px 26px;
}

.footer {
  height: 45px;
  position: fixed;
  bottom: 0;
  width: 100%;
}
.xh-star {
  color: red;
}
.van-radio-group .van-radio {
    margin-bottom: 5px;
}

div>>>.el-dialog .el-dialog__body{
  padding: 0px ;
  height: calc(100% - 115px);
}

.opinion-text{
  padding: 5px;
}
>>>.el-col-2 {
    width: 14.33333%;
}
>>>.el-col-22 {
    width: 85.66667%;
}
>>>.v-modal{
  z-index :z-index;
}
</style>