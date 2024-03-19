<template>
  <ht-sidebar-dialog
      :visible="addSignDialog"
      title="加签设置"
      :close-on-click-modal="false"
      :before-close="cancel"
      append-to-body
      class="dialog-body"
      width="100%"
    >
      <div :style="this.style">
            <van-form v-form @submit="confirm">
                <div class="title-divider">
                   <span>加签人员：</span>
                </div>
                <div class="opinion-text">
                  <EipUserSelector
                      v-model="users"
                      :config="{id:'userIds',fullname: 'users'}"
                      :append-to-body="true"
                    />
                </div>
                <div class="title-divider">
                    <span>加签说明：</span>
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
import { mapState, mapActions } from "vuex";
import flow from "@/api/flow.js";
import { Notify,Form } from "vant";
import OpinionText from "@/components/flow/task/OpinionText.vue";
import EipUserSelector from "@/components/eipControl/selector/EipUserSelector.vue";
import utils from "@/utils.js";
import req from "@/request.js";
export default {
  name: "TaskToAddSign",
  props: ["taskId"],
  components: { OpinionText, EipUserSelector,[Form.name]: Form, },
  data() {
    return {
        addSignDialog: false,
        users:"",
        userIds: "",
        style: "",
        opinion: "",
        nodeType:"",
        instId:"",
    };
  },
  methods: {
    //鼠标点击页面其他其他位置不关闭弹框
    handleClose(nodeType,instId) {
      this.instId = instId;
      this.nodeType = nodeType;
      this.addSignDialog = true;
    },
    //取消
    cancel() {
      this.addSignDialog = false;
    },
    //确认
    confirm() {
      if (this.users == "" || this.users == null) {
        Notify({type: "warning",message: "请选择加签人员"});
        return;
      } else if (this.$refs.opinionText.getOpinion() == "") {
        Notify({type: "warning",message: "请填写加签说明"});
        return;
      }
      const loading = this.$loading({
        lock: true,
        text: '任务加签中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      let files ="";
      if(this.nodeType=="USERTASK"){//用户任务加签
         let data = {
          action:"back",
          files: files,
          opinion: this.$refs.opinionText.getOpinion(),
          taskId: this.taskId,
          userIds: this.userIds
        };
        let this_ = this;
        utils.getOnlineFormData(true).then(
            formDataStr => {
              data.data = Base64.encode(formDataStr);
              this_.$store.dispatch("storeProcess/userTaskToSign", data).then(() => {
                  loading.close();
                  if(this_.token!=null){
                  this_.addSignDialog = false;
                  window.close();
                  }else{
                  Notify({ type: 'success',
                      duration: 1000, message: data.message, onClose: function () {
                      this_.addSignDialog = false;
                      this_.$router.push('/work/myMatters');
                      }
                  });
                  }
              }).catch(() => {
                loading.close();
              });
            },
            reason => {
              loading.close();
              if (reason == 1) {
                  Notify({
                  type: "error",
                  message: "未获取到表单信息."
                  });
              }else if(reason == 5){
                  Notify({
                  type: "error",
                  message: "处理业务数据超时！"
                  });
              }
            }
        );
      }else{//会签任务加签
        let data = {
          taskId: this.taskId,
          opinion: this.$refs.opinionText.getOpinion(),
          userId: this.userIds,
          files: files
        };
        this.$store.dispatch("storeProcess/taskSignUsers",data).then(()=>{
          loading.close();
          this.addSignDialog = false;
          utils.reload();
        }).catch(() => {
          loading.close();
        });
      }
    },
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
    background-color: #eee;
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
    margin-bottom: 8px;
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