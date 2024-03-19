<template>
  <ht-sidebar-dialog
      :visible="commuDialog"
      title="沟通设置"
      :close-on-click-modal="false"
      append-to-body
      class="dialog-body"
      :before-close="cancel"
      width="100%"
    >
      <div :style="this.style">
            <van-form v-form @submit="confirm">

                <div class="title-divider">
                   <span>沟通人员：</span>
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
                    <span>沟通内容：</span>
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
 name: "taskToCommu",
 props: ["instId","defId"],
  components: { 
    [Form.name]: Form,
    OpinionText, 
    EipUserSelector
  },
  data() {
    return {
        commuDialog: false,
        users:"",
        userIds: "",
        style: "",
        opinion: "",
    };
  },
  methods: {
    //鼠标点击页面其他其他位置不关闭弹框
    handleClose(done) {
        this.commuDialog = true;
    },
    //取消
    cancel() {
        this.commuDialog = false;
    },
    //确认
    confirm() {
      if(this.users=="" || this.users==null){
          Notify({
            type: "warning",
            message: "请选择沟通人员"
          });
         return;
      }else if(this.$refs.opinionText.getOpinion()==""){
          Notify({
            type: "warning",
            message: "请填写沟通内容"
          });
        return;
      };
      const loading = this.$loading({
        lock: true,
        text: '任务沟通中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      this.userIds += ",";
      let files ="";
      let data = {"opinion":this.$refs.opinionText.getOpinion(),"userId":this.userIds,"instId":this.instId,"defId":this.defId,"files":files};
      this.$store.dispatch("storeProcess/communicate",data).then(()=>{
        loading.close();
        this.commuDialog = false;
        utils.reload();
      }).catch(() => {
        loading.close();
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
    background-color: #f5f5f5;
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