<template>
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
            <el-checkbox-group v-model="checkedNodes">
              <el-checkbox  v-for="node in nodeList"  :label="node.nodeId" :key="node.nodeId">
                {{node.name}}
              </el-checkbox>
            </el-checkbox-group>
          </td>
        </tr>

        <tr>
          <th style="width: 140px;">
            <span class="xh-star">*</span>被催办人：
          </th>
          <td>
            <span v-for="node in checkedNodes" :key="node">
              <el-checkbox-group v-if="nodeDefMap[node]" v-model="appointee">
                <el-checkbox v-for="(item,$index) in nodeDefMap[node].assigneeUsers" :label="item" :key="$index">{{item.fullname}}</el-checkbox>
              </el-checkbox-group>
            </span>
            <span style="color:red;" v-if="checkedNodes.length==0 && isTaskUser">请先选择催办节点</span>
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
            <el-radio v-model="type" label="sms">短信</el-radio>
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
      <el-button type="primary" @click="confirm" :disabled="disabled" size="small">确 定</el-button>
      <el-button @click="cancel" size="small">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { Message } from "element-ui";
import req from "@/request.js";
export default {
  name: "instanceUrgent",
  components: {},
  data() {
    return {
        disabled:false,
        isTaskUser:true,//是否有任务审批人
        taskUrgentDialog:false,
        excutor:[],//节点审批人集合
        appointee:[],//被催办人
        type:"mail", //催办方式
        contentMail:"",//邮件催办内容
        contentSms:"",//短信催办内容
        selectNodeId:'',
        checkedNodes:[],//选择了要催办的任务
        appointeeSecretary:"0",
        nodeList:[],
        nodeDefMap:{},
        instId:"",
        defId:"",
        subject:""
    };
  },
  methods: {
    //鼠标点击页面其他其他位置不关闭弹框
    handleOpen(instId,defId,subject,nodeId) {
        this.instId = instId;
        this.defId = defId;
        this.subject = subject;
        this.appointee=[];
        this.taskUrgentDialog=true;
        this.checkedNodes = [];
        this.isTaskUser = true;
        //根据流程实例ID获取当前任务节点审批人
        let this_ =this;
        req.get(window.context.bpmRunTime + '/runtime/instance/v1/getExcutorNameByInstId?instId='+instId).then(res => {
          res = res.data;
          if(res){
            //任务管理催办
            if(nodeId){
              res.forEach(nodeDef => {
                if(nodeId == nodeDef.nodeId){
                  this_.nodeList = nodeDef;
                  this_.checkedNodes.push(nodeDef.nodeId);
                  //给每个用户添加对应的任务节点
                  for(let i = 0;i<nodeDef.assigneeUsers.length;i++){
                    nodeDef.assigneeUsers[i].nodeId =  nodeDef.nodeId;
                    nodeDef.assigneeUsers[i].nodeName =  nodeDef.name;
                  }
                  this_.nodeDefMap[nodeDef.nodeId] = nodeDef;
                }
              });
            }else if(!nodeId){//实例管理催办
             this_.nodeList = res;
             if(res.length==1){
                this_.checkedNodes.push(res[0].nodeId);
             }
             res.forEach(nodeDef => {
                //给每个用户添加对应的任务节点
                for(let i = 0;i<nodeDef.assigneeUsers.length;i++){
                  nodeDef.assigneeUsers[i].nodeId =  nodeDef.nodeId;
                  nodeDef.assigneeUsers[i].nodeName =  nodeDef.name;
                }
                this_.nodeDefMap[nodeDef.nodeId] = nodeDef;
             });
            }
          }
          //要催办的任务无审批人
          if(res.length==0){
            this.isTaskUser=false;
          }
        });
        //根据流程定义id获取流程信息
        req.get(window.context.bpmModel + '/flow/def/v1/defGet?defId='+defId).then(res => {
          res = res.data;
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
        if(this.checkedNodes.length==0){
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
        let appointeeObj = {};
        //给每个任务匹配对应的被催办人信息
        for(let j =0;j<this.checkedNodes.length;j++){
          appointeeObj[this.checkedNodes[j]] = [];
          for(let i=0;i<this.appointee.length;i++){
            if(this.appointee[i].nodeId == this.checkedNodes[j]){
              appointeeObj[this.checkedNodes[j]].push(this.appointee[i])
            }
          }
        }
        let data = {"subject":this.subject,"type":this.type,"instId":this.instId,"content":content,"promoterId":JSON.parse(sessionStorage.getItem("currentUser")).userId,
        "appointeeObj":appointeeObj,"promoter":JSON.parse(sessionStorage.getItem("currentUser")).username,"appointeeSecretary":isAppointeeSecretary};
        const this_ = this;
        this_.disabled =true;
        req.post(window.context.bpmRunTime + '/runtime/instance/v1/sendUrgentByInstId', data).then(response => {
          if (response.data.state) {
            Message.success({
              duration: 1500, message: response.data.message, onClose: function () {
                this_.taskUrgentDialog = false;
                this_.disabled = false;
              }
            });
          }
        }).catch(() => {
          this_.disabled = false;
        });
    }
  },
}
</script>

<style lang="stylus" scoped>
.dropdown{
  float :right;
  margin:-8px;
}
>>>.el-checkbox {
    color: #606266;
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
div>>>.el-dialog__header {
  display: block !important;
}
</style>