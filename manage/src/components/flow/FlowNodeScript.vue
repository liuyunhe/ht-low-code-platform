<template>
  <div class="form-inline">
    <label class="control-label">{{node.name}}({{node.nodeId}})</label>
    <el-button type="primary" size="mini" @click="editTaskScript">设置事件脚本</el-button><br />
    <div v-if="eventScriptData && eventScriptData.bpmNodeDef && eventScriptData.bpmNodeDef.type  && eventScriptData.bpmNodeDef.type=='start'">
        <label class="control-label">开始事件：</label>
        <label v-if="!eventScriptData.eventScriptMap.START" class="control-label" style="color:#dd6161;">尚未配置开始事件</label>
        <div v-if="eventScriptData.eventScriptMap.START">
            <label style="display: block;text-align: left;" class="control-label">{{eventScriptData.eventScriptMap.START}}</label>
        </div>
    </div>
    <div v-if="eventScriptData && eventScriptData.bpmNodeDef && eventScriptData.bpmNodeDef.type  && eventScriptData.bpmNodeDef.type=='end'">
        <label class="control-label">结束事件：</label>
        <label v-if="!eventScriptData.eventScriptMap.END" class="control-label" style="color:#dd6161;">尚未配置结束事件</label>
        <div v-if="eventScriptData.eventScriptMap.END">
            <label style="display: block;text-align: left;" class="control-label">{{eventScriptData.eventScriptMap.END}}</label>
        </div>
    </div>
    <div v-if="eventScriptData && eventScriptData.bpmNodeDef && eventScriptData.bpmNodeDef.type  && 
    (eventScriptData.bpmNodeDef.type=='usertask' || eventScriptData.bpmNodeDef.type=='signtask')">
        <label class="control-label">前置事件：</label>
        <label v-if="!eventScriptData.eventScriptMap.CREATE" class="control-label" style="color:#dd6161;">尚未配置前置事件</label>
        <div v-if="eventScriptData.eventScriptMap.CREATE">
            <label style="display: block;text-align: left;" class="control-label">{{eventScriptData.eventScriptMap.CREATE}}</label>
        </div>
    </div>
    <div v-if="eventScriptData && eventScriptData.bpmNodeDef && eventScriptData.bpmNodeDef.type  && 
    (eventScriptData.bpmNodeDef.type=='usertask' || eventScriptData.bpmNodeDef.type=='signtask')">
        <label class="control-label">后置事件：</label>
        <label v-if="!eventScriptData.eventScriptMap.COMPLETE" class="control-label" style="color:#dd6161;">尚未配置后置事件</label>
        <div v-if="eventScriptData.eventScriptMap.COMPLETE">
            <label style="display: block;text-align: left;" class="control-label">{{eventScriptData.eventScriptMap.COMPLETE}}</label>
        </div>
    </div>
    <el-dialog
        width="70%"
        :title="titleSetting"
        :visible="dialogVisibleSetting"
        :before-close="close"
        :close-on-click-modal="false"
        append-to-body
        top="8vh"
      >
        <div style="width:100%;height: 550px;overflow: auto;">
            <div style="margin-bottom: 10px;">
                <el-button type="success" size="mini"  @click="saveScript"  icon="el-icon-check">保 存</el-button>
                <el-button type="danger" size="mini"  @click="close"  icon="el-icon-close">关 闭</el-button>
            </div>
            <el-tabs v-model="tabType" type="border-card" @tab-click="refreshCode()">
                <el-tab-pane label="开始事件" v-if="eventScriptData && eventScriptData.bpmNodeDef && eventScriptData.bpmNodeDef.type  && 
                    eventScriptData.bpmNodeDef.type == 'start'" name="start">
                    <el-form v-model="eventScriptMap" data-vv-scope="settingSave">
                        <table class="form-table" cellspacing="0" cellpadding="0" border="0">
                            <tbody>
                                <tr>
                                    <th width="130px">脚本描述:</th>
                                    <td>
                                        <label>该脚本在流程启动时执行，用户可以使用 execution 做操作。 例如设置流程变量：execution.setVariable("total", 100);</label>
                                    </td>
                                </tr>
                                <tr>
                                    <th width="130px">脚本内容:</th>
                                    <td>
                                        <!-- 常用脚本选择对话框  -->
                                        <eip-script-dialog ref="eipScriptDialogStart" v-model="eventScriptMap.START" append-to-body />
                                        <el-button @click="showDialog('eipScriptDialogStart')">常用脚本</el-button>
                                        <!-- 条件脚本 -->
                                        <el-button  @click="showConditionBuild" size="small">条件脚本</el-button>
                                        <!-- 可选变量对话框 -->
                                         <FlowVarSelector :defId="node.defId" @node-click="varTreeOnConfirmStart"/><br /><br />
                                         <codemirror
                                            ref="mycode"
                                            v-model="eventScriptMap.START"
                                            :options="cmOptions2"
                                            class="code"
                                            style="width: 99%;"
                                          ></codemirror>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </el-form>
                </el-tab-pane>
                <el-tab-pane label="结束事件" v-if="eventScriptData && eventScriptData.bpmNodeDef && eventScriptData.bpmNodeDef.type  && 
                eventScriptData.bpmNodeDef.type == 'end'" name="end">
                    <el-form v-model="eventScriptMap" data-vv-scope="settingSave">
                        <table class="form-table" cellspacing="0" cellpadding="0" border="0">
                            <tbody>
                                <tr>
                                    <th width="130px">脚本描述:</th>
                                    <td>
                                        <label>该脚本在流程启动时执行，用户可以使用 execution 做操作。 例如设置流程变量：execution.setVariable("total", 100);</label>
                                    </td>
                                </tr>
                                <tr>
                                    <th width="130px">脚本内容:</th>
                                    <td>
                                        <!-- 常用脚本选择对话框  -->
                                        <eip-script-dialog ref="eipScriptDialogEnd" v-model="eventScriptMap.END" append-to-body />
                                        <el-button @click="showDialog('eipScriptDialogEnd')">常用脚本</el-button>
                                        <!-- 条件脚本 -->
                                        <el-button  @click="showConditionBuild" size="small">条件脚本</el-button>
                                        <!-- 可选变量对话框 -->
                                         <FlowVarSelector :defId="node.defId" @node-click="varTreeOnConfirmEnd"/><br /><br />
                                         <codemirror
                                            ref="mycode"
                                            v-model="eventScriptMap.END"
                                            :options="cmOptions2"
                                            class="code"
                                            style="width: 99%;"
                                          ></codemirror>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </el-form>
                </el-tab-pane>
                <el-tab-pane v-if="eventScriptData && eventScriptData.bpmNodeDef && eventScriptData.bpmNodeDef.type  
                && (eventScriptData.bpmNodeDef.type == 'usertask' || eventScriptData.bpmNodeDef.type== 'signtask')" label="前置事件" name="create">
                    <el-form v-model="eventScriptMap" data-vv-scope="settingSave">
                        <table class="form-table" cellspacing="0" cellpadding="0" border="0">
                            <tbody>
                                <tr>
                                    <th width="130px">脚本描述:</th>
                                    <td>
                                        <label>该事件在 启动该任务 时执行，用户可以使用 task 做操作。 例如设置流程变量:task.setVariable("total", 100); 注：撤回发起人时不能用task这个变量。</label>
                                    </td>
                                </tr>
                                <tr>
                                    <th width="130px">脚本内容:</th>
                                    <td>
                                        <!-- 常用脚本选择对话框  -->
                                        <eip-script-dialog ref="eipScriptDialogCreate" v-model="eventScriptMap.CREATE" append-to-body />
                                        <el-button @click="showDialog('eipScriptDialogCreate')">常用脚本</el-button>
                                        <!-- 条件脚本 -->
                                        <el-button  @click="showConditionBuild" size="small">条件脚本</el-button>
                                        <!-- 可选变量对话框 -->
                                         <FlowVarSelector :defId="node.defId" @node-click="varTreeOnConfirmCreate"/><br /><br />
                                         <codemirror
                                            ref="mycode"
                                            v-model="eventScriptMap.CREATE"
                                            :options="cmOptions2"
                                            class="code"
                                            style="width: 99%;"
                                          ></codemirror>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </el-form>
                </el-tab-pane>
                <el-tab-pane v-if="eventScriptData && eventScriptData.bpmNodeDef && eventScriptData.bpmNodeDef.type  && 
                (eventScriptData.bpmNodeDef.type == 'usertask' || eventScriptData.bpmNodeDef.type== 'signtask')" label="后置事件" name="complete">
                    <el-form v-model="eventScriptMap" data-vv-scope="settingSave">
                        <table class="form-table" cellspacing="0" cellpadding="0" border="0">
                            <tbody>
                                <tr>
                                    <th width="130px">脚本描述:</th>
                                    <td>
                                        <label>该事件在 任务完成 时执行，用户可以使用 task 做操作。 例如设置流程变量:task.setVariable("total", 100);</label>
                                    </td>
                                </tr>
                                <tr>
                                    <th width="130px">脚本内容:</th>
                                    <td>
                                        <!-- 常用脚本选择对话框  -->
                                        <eip-script-dialog ref="eipScriptDialogComplete" v-model="eventScriptMap.COMPLETE" append-to-body />
                                        <el-button @click="showDialog('eipScriptDialogComplete')">常用脚本</el-button>
                                        <!-- 条件脚本 -->
                                        <el-button  @click="showConditionBuild" size="small">条件脚本</el-button>
                                        <!-- 可选变量对话框 -->
                                         <FlowVarSelector :defId="node.defId" @node-click="varTreeOnConfirmComplete"/><br /><br />
                                         <codemirror
                                            ref="mycode"
                                            v-model="eventScriptMap.COMPLETE"
                                            :options="cmOptions2"
                                            class="code"
                                            style="width: 99%;"
                                          ></codemirror>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </el-form>
                </el-tab-pane>
            </el-tabs>
        </div>
        <!-- 条件脚本对话框 -->
        <FlowConditionBuildDialog  @onConfirm="conditionDialogConfirm" :defId="node.defId" ref="flowConditionBuildDialog" />
      </el-dialog>
  </div>

</template>

<script>
import req from "@/request.js";
import { mapState, mapActions } from "vuex";
import { Message } from 'element-ui';
const eipScriptDialog = () => import("@/components/dialog/EipScriptDialog.vue");
const MessageTypeSelector = () => import("@/components/flow/MessageTypeSelector.vue");
const FlowVarSelector = () => import("@/components/flow/FlowVarSelector.vue");
const FlowConditionBuildDialog  = () => import("@/components/flow/FlowConditionBuildDialog.vue");
export default {
  name:"FlowNodeScript",
  components: {MessageTypeSelector,eipScriptDialog,FlowVarSelector,FlowConditionBuildDialog},
  props: {
    //任务节点信息
    node:{
      type: Object,
      required: true
    },
    //流程配置信息
    defConfigData:{
      type: Object,
      required: true
    },
    //事件脚本配置的信息
    eventScriptData:{
      type: Object,
      required: true
    },
  },
  data() {
    return {
        tabType:"create",//start：开始事件配置；end：结束事件配置；complete：后置事件配置；create：前置事件配置；
        dialogVisibleSetting:false,
        titleSetting:"设置事件脚本",//某个节点事件脚本的标题
        eventScriptDataCopy:{},//复制一份最开始的事件脚本配置的信息
        eventScriptMap:{START:"",END:"",CREATE:"",COMPLETE:""},//初始化事件脚本信息
        cmOptions2: {
          value: "",
          mode: "groovy",
          readOnly: false,
          smartIndent:true,
          tabSize: 1,
          theme: 'base16-light',
          lineNumbers: true,
          line: true,
        }
    };
  },
  methods: {
    //监听条件脚本确认事件
    conditionDialogConfirm(data) {
      if(this.tabType=="end"){//如果是结束事件点击的条件脚本，返回结果则绑定给结束事件
         this.eventScriptMap.END=this.eventScriptMap.END+data;
      }else if(this.tabType=="start"){//如果是开始事件点击的条件脚本，返回结果则绑定给开始事件
         this.eventScriptMap.START=this.eventScriptMap.START+data;
      }else if(this.tabType=="create"){//如果是前置事件点击的条件脚本，返回结果则绑定给前置事件
         this.eventScriptMap.CREATE=this.eventScriptMap.CREATE+data;
      }else if(this.tabType=="complete"){//如果是后置事件点击的条件脚本，返回结果则绑定给后置事件
         // this.eventScriptMap.COMPLETE=this.eventScriptMap.COMPLETE+data;
         this.$set(this.eventScriptMap,"COMPLETE",this.eventScriptMap.COMPLETE+data);
      }
    },
    //显示条件脚本对话框 
    showConditionBuild() {
        this.$refs.flowConditionBuildDialog.showDialog();
    },
    //监督可选变量的返回值(开始事件)
    varTreeOnConfirmStart(data){
      this.eventScriptMap.START = this.eventScriptMap.START+data.pathValue;
    },
    //监督可选变量的返回值(结束事件)
    varTreeOnConfirmEnd(data){
      this.eventScriptMap.END = this.eventScriptMap.END+data.pathValue;
    },
    //监督可选变量的返回值(前置事件)
    varTreeOnConfirmCreate(data){
      this.eventScriptMap.CREATE = this.eventScriptMap.CREATE+data.pathValue;
    },
    //监督可选变量的返回值(后置事件)
    varTreeOnConfirmComplete(data){
      this.eventScriptMap.COMPLETE = this.eventScriptMap.COMPLETE+data.pathValue;
    },
    //显示常用脚本
    showDialog(action){
      this.$refs[action].showDialog();
    },
    //设置事件脚本
    editTaskScript(){
      this.eventScriptMap = {START:"",END:"",CREATE:"",COMPLETE:""};
      this.eventScriptDataCopy = JSON.parse(JSON.stringify(this.eventScriptData));
      if(this.eventScriptDataCopy.eventScriptMap.START){
        this.eventScriptMap.START=this.eventScriptDataCopy.eventScriptMap.START;
      }
      if(this.eventScriptDataCopy.eventScriptMap.END){
        this.eventScriptMap.END=this.eventScriptDataCopy.eventScriptMap.END;
      }
      if(this.eventScriptDataCopy.eventScriptMap.CREATE){
        this.eventScriptMap.CREATE=this.eventScriptDataCopy.eventScriptMap.CREATE;
      }
     if(this.eventScriptDataCopy.eventScriptMap.COMPLETE){
        this.$set(this.eventScriptMap,"COMPLETE",this.eventScriptDataCopy.eventScriptMap.COMPLETE)
         // this.eventScriptMap.COMPLETE=this.eventScriptDataCopy.eventScriptMap.COMPLETE;
      }
      if(this.eventScriptDataCopy.bpmNodeDef.type=="end"){
        this.tabType="end";
      }else if(this.eventScriptDataCopy.bpmNodeDef.type=="start"){
        this.tabType="start";
      }else{
        this.tabType="create";
      }
      this.dialogVisibleSetting=true;
    },
    //保存事件脚本
    saveScript(){
        const this_ =this;
        let eventScriptArray = [];
        if(JSON.stringify(this_.eventScriptMap) =="{}"){
            Message.warning("请至少添加一个事件脚本");
            return;
        }
        for(let key in this_.eventScriptMap){
            let object = {"scriptType":key,"content":this_.eventScriptMap[key]};
            eventScriptArray.push(object);
        }
        let param = {
            defId : this_.node.defId,
            nodeId : this_.node.nodeId,
            eventScriptArray : JSON.stringify(eventScriptArray)
        };
        this_.eventScriptDataCopy.eventScriptMap =  this_.eventScriptMap;
        req.post("${bpmModel}/flow/node/v1/eventScriptSave", param).then(function(response){
            response = response.data;
            if(response.state){
                Message.success(response.message);
                this_.$emit("update:eventScriptData",this_.eventScriptDataCopy);//子组件更新父组件的值
                this_.dialogVisibleSetting = false;
            }else{
                Message.error(response.message);
            }
        })
    
    },
    //关闭设置节点事件脚本列弹框
    close(){
       this.dialogVisibleSetting=false;
    },
    // 刷新codemirror编辑器内容
    refreshCode(){
      this.$refs.mycode.refresh();
    }
  },
  mounted() {
    this.$validator = this.$root.$validator;
  }
};
</script>

<style lang="scss" scoped>
div>>>.el-dialog__body {
    padding: 10px 20px;
    color: #606266;
    font-size: 14px;
    word-break: break-all;
}
.ht_ce{
  margin-top: -10px !important;
}
.div_list{
    height: 30px;
    background: #e2e2e2;
    line-height: 30px;
    font-weight: bold;
    padding-left: 10px;
    margin-bottom: 10px;
}
>>>label.el-checkbox {
    margin: 5px 10px 0 0;
}
.ht{
  width: 100%;
}
.form-inline{
  float: left;
  width: 100%;
}
.left-label {
    width: 18%;
    float: left;
}
.control-label {
    word-break: break-all;
    text-align: right;
    color: #545252;
    font-size: 12px;
    padding: 0px 10px !important;
    font-weight: bold;
    line-height: 35px;
}
div>>>.box-card{
  margin-bottom: 20px;
}

div>>>.box-card .clearfix{
  padding-top: 20px;
}

div>>>.el-collapse-item__header{
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    font-weight: bold;
}

div>>>.el-button{
   padding: 7px;
   margin-right: 10px;
   margin-left: 0px !important;
}
</style>