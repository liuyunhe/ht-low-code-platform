<template>
  <ht-sidebar-dialog
      :visible="taskUrgentDialog"
      title="任务催办"
      :close-on-click-modal="false"
      :before-close="cancel"
      append-to-body
      class="dialog-body"
      width="100%"
    >
      <div :style="this.style">
            <van-form v-form @submit="confirm">

                <div v-if="nodeList && nodeList.length>1" class="title-divider">
                   <span>催办节点：</span>
                </div>
                <van-field v-if="nodeList && nodeList.length>1">
                   <template #input>
                      <van-radio-group v-model="selectNodeId">
                          <van-radio v-for="item in nodeList" :key="item.nodeId" :name="item.nodeId" >{{item.name}}</van-radio>
                      </van-radio-group>
                   </template>
                </van-field>

                 <div class="title-divider">
                   <span>被催办人：</span>
                </div>
                <van-field>
                   <template #input>
                      <van-checkbox-group v-if="nodeDefMap[selectNodeId]" v-model="appointee">
                        <van-checkbox v-for="item in nodeDefMap[selectNodeId].assigneeUsers" :key="item.id" :name="item" shape="square">{{item.fullname}}</van-checkbox>
                      </van-checkbox-group>
                   </template>
                </van-field>


                <div class="title-divider">
                   <span>是否催办秘书：</span>
                </div>
                <van-field name="radio">
                  <template #input>
                    <van-radio-group v-model="appointeeSecretary"   direction="horizontal">
                      <van-radio name="0">否</van-radio>
                      <van-radio name="1">是</van-radio>
                    </van-radio-group>
                  </template>
                </van-field>

                <div class="title-divider">
                   <span>催办方式：</span> 
                </div>
                <van-field name="radio">
                  <template #input>
                    <van-radio-group v-model="type" direction="horizontal">
                      <van-radio name="mail">邮箱</van-radio>
                      <van-radio v-if="nodeDefMap[selectNodeId] && !nodeDefMap[selectNodeId].localProperties.allowSmsApproval" name="sms">短信</van-radio>
                      <van-radio v-if="nodeDefMap[selectNodeId] && nodeDefMap[selectNodeId].localProperties.allowSmsApproval" name="smsApproval">短信审批</van-radio>
                    </van-radio-group>
                  </template>
                </van-field>

                
                <div v-if="type!='smsApproval'"  class="title-divider">
                    <span>催办内容：</span>
                    <el-dropdown size="mini" class="dropdown" split-button type="primary"  @command="handleCommand">
                    可选变量
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="{催办人:promoter}">催办人</el-dropdown-item>
                      <el-dropdown-item command="{被催办人:appointee}">被催办人</el-dropdown-item>
                      <el-dropdown-item command="{流程编号:instId}">流程编号</el-dropdown-item>
                      <el-dropdown-item command="{流程标题:subject}">流程标题</el-dropdown-item>
                      <el-dropdown-item command="{流程发起人:sponsor}">流程发起人</el-dropdown-item>
                      <el-dropdown-item command="{任务节点名称:nodeName}">任务节点名称</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
                <div v-if="type!='smsApproval'"  class="opinion-text">
                   <van-field  v-model="contentMail" v-if="type=='mail'" :autosize="{minHeight: 80 }" type="textarea" 
                   placeholder="请输入催办内容"  show-word-limit class="textarea_boder"/>

                   <van-field  v-model="contentSms" v-if="type=='sms' || type=='smsApproval'" type="textarea" :autosize="{minHeight: 80 }"
                   placeholder="请输入催办内容"  show-word-limit class="textarea_boder"/>
                </div>

                <div v-if="type=='smsApproval'"  class="title-divider">
                    <span>短信审批备注：</span>
                    <el-dropdown size="mini" class="dropdown" split-button type="primary"  @command="handleCommand">
                    可选变量
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="{催办人:promoter}">催办人</el-dropdown-item>
                      <el-dropdown-item command="{被催办人:appointee}">被催办人</el-dropdown-item>
                      <el-dropdown-item command="{流程编号:instId}">流程编号</el-dropdown-item>
                      <el-dropdown-item command="{流程标题:subject}">流程标题</el-dropdown-item>
                      <el-dropdown-item command="{流程发起人:sponsor}">流程发起人</el-dropdown-item>
                      <el-dropdown-item command="{任务节点名称:nodeName}">任务节点名称</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
                
                <div v-if="type=='smsApproval'"  class="opinion-text">
                   <van-field  v-model="contentSms" v-if="type=='sms' || type=='smsApproval'" type="textarea" :autosize="{ minRows: 4, maxRows: 8}"  maxlength="300" 
                   placeholder="短信审批备注会显示在发出的短信内容中,可在备注中对流程信息做补充说明,但请勿涉及敏感内容。"  show-word-limit class="textarea_boder" />
                   注意：因为短信渠道未加密，发送的短信内容中不会包含详细批呈信息，请在短信催办前先与审批处理人做好沟通。
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
import { Notify,Form,Field,CheckboxGroup,Checkbox,Radio,RadioGroup,ActionSheet } from "vant";
import OpinionText from "@/components/flow/task/OpinionText.vue";
import EipUserSelector from "@/components/eipControl/selector/EipUserSelector.vue";
import utils from "@/utils.js";

export default {
 name: "taskUrgent",
 props: ["instId","defId","subject"],
  components: { 
    [Form.name]: Form,
    [Field.name]: Field,
    [CheckboxGroup.name]: CheckboxGroup,
    [Checkbox.name]: Checkbox,
    [RadioGroup.name]: RadioGroup,
    [Radio.name]: Radio,
    [ActionSheet.name]: ActionSheet,
  },
  data() {
    return {
      taskUrgentDialog:false,
      excutor:[],//节点审批人集合
      appointee:[],//被催办人
      type:"mail", //催办方式
      contentMail:"",//邮件催办内容
      contentSms:"",//短信催办内容
      selectNodeId:'',
      appointeeSecretary:"0",
      nodeList:[],
      nodeDefMap:{},
      style:"",
    };
  },
  methods: {
    //鼠标点击页面其他其他位置不关闭弹框
    handleClose(done) {
        this.appointee=[];
        this.taskUrgentDialog=true;
        //根据流程实例ID获取当前任务节点审批人
        let this_ =this;
        this.$store.dispatch("storeProcess/getExcutorNameByInstId", this.instId).then(res => {
          if(res){
             this_.nodeList = res;
             if(res.length==1){
                this_.selectNodeId =res[0].nodeId;
             }
             res.forEach(nodeDef => {
               this_.nodeDefMap[nodeDef.nodeId] = nodeDef;
             });
          }
        });
        //根据流程定义id获取流程信息
        this.$store.dispatch("storeProcess/defGet", this.defId).then(res => {
          if(res.urgentMailTel){
              this.contentMail = res.urgentMailTel;
          }
          if(res.urgentSmsTel){
              this.contentSms = res.urgentSmsTel;
          }
        });
    },
    //可选变量
    handleCommand(command) {
        if(this.type=="mail"){
            this.contentMail =this.contentMail+command;
        }else if(this.type=="sms" || this.type=="smsApproval"){
            this.contentSms =this.contentSms+command;
        }
    },
    //取消
    cancel() {
      this.taskUrgentDialog = false;
    },
    //确认
    confirm() {
        let content = "";//催办内容
        if(this.type=="mail"){
            content=this.contentMail;
        }else if(this.type=="sms"){
            content=this.contentSms;
        }

        if(!this.selectNodeId){
            Notify({type: "warning",message: "请选择催办的任务"});
            return;
        }

        if(this.appointee.length==0){
            Notify({type: "warning",message: "请选择被催办人"});
            return;
        }
        if(content==""){
            Notify({type: "warning",message: "请输入催办内容"});
            return;
        }
        let isAppointeeSecretary = false;
        if(this.appointeeSecretary == "1"){
          isAppointeeSecretary = true;
        }
        let appointeeId = "";//被催办人ID
        let appointeeName = "";//被催办人
        for(let i=0;i<this.appointee.length;i++){
            appointeeId = appointeeId+this.appointee[i].userId+",";
            appointeeName = appointeeName+this.appointee[i].fullname+",";
        }
        const loading = this.$loading({
          lock: true,
          text: '任务催办中，请耐心等待...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        let data = {"subject":this.subject,"type":this.type,"instId":this.instId,"content":content,"appointeeId":appointeeId.substring(0, appointeeId.length - 1),
        "appointee":appointeeName.substring(0, appointeeName.length- 1),'nodeName':this.nodeDefMap[this.selectNodeId].name,'nodeId':this.selectNodeId,
        "promoterId":JSON.parse(sessionStorage.getItem("currentUser")).userId,"promoter":JSON.parse(sessionStorage.getItem("currentUser")).username,
        "appointeeSecretary":isAppointeeSecretary};
        this.$store.dispatch("storeProcess/sendBpmTaskUrgent",data).then(()=>{
          loading.close();
          this.taskUrgentDialog = false;
        }).catch(() => {
          loading.close();
        });
    }
  },
}
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

.footer {
  height: 45px;
  position: fixed;
  bottom: 0;
  width: 100%;
}
.xh-star {
  color: red;
}

div>>>.el-dialog .el-dialog__body{
  padding: 0px ;
  height: calc(100% - 115px);
}

.opinion-text{
  padding: 5px;
}
>>>.van-radio{
  overflow:inherit;
}
>>>.van-checkbox{
  overflow:inherit;
}
.textarea_boder{
  border: 1px solid #DCDFE6;
}
.dropdown{
  float :right;
  margin:-8px;
}
div>>>.el-button--mini, .el-button--small {
    font-size: 14px;
    border-radius: 3px;
}
</style>