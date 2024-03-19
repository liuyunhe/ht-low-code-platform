<template>
<div class="bpm-btn-dialog">
  <el-dialog
    title="任务催办"
    :visible.sync="taskUrgentDialog"
    :close-on-click-modal="false"
  >
    <table cellspacing="0" cellpadding="0" border="0" class="form-table">
      <tbody>

        <tr v-if="nodeList && nodeList.length>1">
          <th style="width: 140px;">
            <span class="xh-star">*</span>催办节点：
          </th>
          <td>
              <el-radio v-model="selectNodeId" v-for="item in nodeList" :key="item.nodeId" :label="item.nodeId">{{item.name}}</el-radio>
          </td>
        </tr>

        <tr>
          <th style="width: 140px;">
            <span class="xh-star">*</span>被催办人：
          </th>
          <td>
            <el-checkbox-group v-if="nodeDefMap[selectNodeId]" v-model="appointee">
              <el-checkbox v-for="item in nodeDefMap[selectNodeId].assigneeUsers" :label="item" :key="item.id">{{item.fullname}}</el-checkbox>
            </el-checkbox-group>
            <span style="color:red;" v-if="nodeDefMap[selectNodeId] && nodeDefMap[selectNodeId].assigneeUsers.length==0 && isTaskUser">请先选择催办节点</span>
            <span style="color:red;" v-if="!isTaskUser">要催办的任务无审批人</span>
          </td>
        </tr>

        <tr>
          <th style="width: 140px;">
            <span class="xh-star"></span>是否催办秘书：
          </th>
          <td>
            <el-radio v-model="appointeeSecretary" label="0">否</el-radio>
            <el-radio v-model="appointeeSecretary" label="1">是</el-radio>
          </td>
        </tr>

        <tr>
          <th style="width: 140px;">
            <span class="xh-star">*</span>催办方式：
          </th>
          <td>
            <el-radio v-model="type" label="mail">邮箱</el-radio>
            <el-radio v-if="nodeDefMap[selectNodeId] && !nodeDefMap[selectNodeId].localProperties.allowSmsApproval" v-model="type" label="sms">短信</el-radio>
            <el-radio v-if="nodeDefMap[selectNodeId] && nodeDefMap[selectNodeId].localProperties.allowSmsApproval" v-model="type" label="smsApproval">短信审批</el-radio>
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
          </td>
        </tr>
        
        <tr v-if="type!='smsApproval'" >
          <th style="width: 140px;">
            <span class="xh-star">*</span>催办内容：
          </th>
          <td colspan="3">
            <el-input v-if="type=='mail'" type="textarea" :autosize="{ minRows: 4, maxRows: 8}"
              placeholder="请输入催办内容" v-model="contentMail"></el-input>
            <el-input v-if="type=='sms' || type=='smsApproval'" type="textarea" :autosize="{  minRows: 4, maxRows: 8}"
              placeholder="请输入催办内容" v-model="contentSms"></el-input>
          </td>
        </tr>

        <tr v-if="type=='smsApproval'" >
          <th style="width: 140px;">
            <span class="xh-star">*</span>短信审批备注：
          </th>
          <td colspan="3">
            <el-input  type="textarea" :autosize="{ minRows: 4, maxRows: 8}"
              placeholder="短信审批备注会显示在发出的短信内容中,可在备注中对流程信息做补充说明,但请勿涉及敏感内容。" v-model="contentSms"></el-input>
              注意：因为短信渠道未加密，发送的短信内容中不会包含详细批呈信息，请在短信催办前先与审批处理人做好沟通。
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
import { debuglog } from 'util';
import { Message } from "element-ui";
export default {
  name: "taskUrgent",
  props: ["instId","defId","subject"],
  components: {},
  data() {
    return {
        isTaskUser:true,//是否有任务审批人
        taskUrgentDialog:false,
        excutor:[],//节点审批人集合
        appointee:[],//被催办人
        type:"mail", //催办方式
        contentMail:"",//邮件催办内容
        contentSms:"",//短信催办内容
        selectNodeId:'',
        appointeeSecretary:"0",
        nodeList:[],
        nodeDefMap:{}
    };
  },
  methods: {
    //鼠标点击页面其他其他位置不关闭弹框
    handleClose(done) {
        this.appointee=[];
        this.taskUrgentDialog=true;
        this.isTaskUser = true;
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
          //要催办的任务无审批人
          if(res.length==0){
            this.isTaskUser=false;
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
            Message.warning("被催办人不能为空");
            return;
        }

        if(this.appointee.length==0){
            Message.warning("请选择被催办人");
            return;
        }
        if(content==""){
            Message.warning("请输入催办内容");
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
        let data = {"subject":this.subject,"type":this.type,"instId":this.instId,"content":content,"appointeeId":appointeeId.substring(0, appointeeId.length - 1),
        "appointee":appointeeName.substring(0, appointeeName.length- 1),'nodeName':this.nodeDefMap[this.selectNodeId].name,'nodeId':this.selectNodeId,
        "promoterId":JSON.parse(sessionStorage.getItem("currentUser")).userId,"promoter":JSON.parse(sessionStorage.getItem("currentUser")).username,"appointeeSecretary":isAppointeeSecretary};
        this.$store.dispatch("storeProcess/sendBpmTaskUrgent",data).then(()=>{
           this.taskUrgentDialog = false;
        });
    }
  },
}
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
.dropdown{
  float :right;
  margin:-8px;
}
>>>.el-checkbox {
    color: $--color-text-regular;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    margin-right: 30px;
    margin-left: 0px !important;
}
</style>