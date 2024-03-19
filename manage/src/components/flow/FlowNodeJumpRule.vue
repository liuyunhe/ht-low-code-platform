<template>
  <div class="form-inline">
    <label class="control-label">{{node.name}}({{node.nodeId}})</label>
    <el-button type="primary" size="mini" @click="editNodeRules">设置跳转规则</el-button><br />
    <label v-if="!nodeDef.jumpRuleList || nodeDef.jumpRuleList.length==0" class="control-label" style="color:#dd6161;">尚未配置节点跳转规则</label>
    <div v-if="nodeDef.jumpRuleList && nodeDef.jumpRuleList.length > 0">
        <label style="display: block;text-align: left;" class="control-label" v-for="rule in nodeDef.jumpRuleList" :key="rule.name">【{{rule.ruleName}}】跳转至：{{rule.targetNode}}</label>
        <div class="control-label" style="text-align: right;">查看更多信息请编辑</div><br />
    </div>
    <el-dialog
        width="70%"
        top="8vh"
        :title="titleSetting"
        :visible="dialogVisibleSetting"
        :before-close="close"
        :close-on-click-modal="false"
        append-to-body
      >
        <div style="width:100%;height: 550px;">
          <div style="width:60%;float: left;height:100%;overflow: auto;">
            <div class="div_list">跳转规则设置</div>
            <div style="margin-bottom: 10px;">
              <el-button type="primary" size="mini"  @click="addRule" icon="el-icon-right">新 增</el-button>
              <el-button type="success" size="mini"  @click="saveRule"  icon="el-icon-check">保 存</el-button>
              <el-button type="danger" size="mini"  @click="close"  icon="el-icon-close">关 闭</el-button>
            </div>
            <el-form v-model="curRule" data-vv-scope="settingSave">
                <table class="form-table" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                        <tr>
                          <th width="130px">当前节点名称:</th>
                          <td>
                              <label>{{nodeDefCopy.name}}</label>
                          </td>
                        </tr>
                        <tr>
                          <th width="130px" class="is-required">规则名称:</th>
                          <td>
                              <ht-input v-model="curRule.ruleName" style="width:100%" placeholder="请输入规则名称" autocomplete="off" validate="required"></ht-input>
                          </td>
                        </tr>
                        <tr>
                          <th width="130px" class="is-required">跳转节点名称:</th>
                          <td>
                            <ht-select
                              clearable
                              v-model="curRule.targetNode"
                              :options="nodeDefList.filter(item=>{ let result = this.filterNodeType.filter(nodeType=>nodeType==item.nodeType); return !result||result.length==0 })"
                               :props="{key:'nodeId',value:'name'}"
                              validate="required"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th width="130px" class="is-required">
                              <el-tooltip class="item" effect="dark" content="这个脚本需要使用返回语句(return)返回布尔值，返回true流程将跳转到指定的节点。" placement="left-start">
                                <i class="el-icon-warning">规则表达式:</i>
                              </el-tooltip>
                          </th>
                          <td>
                            <!-- 常用脚本选择对话框  -->
                            <eip-script-dialog ref="eipScriptDialogCondition" v-model="curRule.condition" append-to-body />
                            <el-button @click="showDialog('eipScriptDialogCondition')">常用脚本</el-button>
                            <!-- 条件脚本 -->
                            <el-button  @click="showConditionBuild" size="small">条件脚本</el-button>
                            <!-- 可选变量对话框 -->
                             <FlowVarSelector :defId="node.defId" @node-click="varTreeOnConfirm"/><br /><br />
                            <ht-input type="textarea" :rows="10" class="ht_tr" v-model="curRule.condition" placeholder="请输入规则表达式" autocomplete="off" validate="required"></ht-input>
                          </td>
                        </tr>
                    </tbody>
                </table>
            </el-form>
          </div>
          <div style="float: left;width:36%;margin-left: 10px;height:100%;overflow: auto;">
            <div class="div_list">跳转规则列表</div>
            <el-table
              :data="nodeDefCopy.jumpRuleList"
              border
              ref="htTableSetting"
              @row-click="orgRowClick"
            >
              <el-table-column prop="ruleName"  label="规则名称"/>
              <el-table-column prop="targetNode"  label="目标节点"/>
              <el-table-column label="操作" width="90" >
                <template v-slot="{row,$index}">
                    <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteSetting(nodeDefCopy.jumpRuleList,$index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
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
import M from 'minimatch';
const eipScriptDialog = () => import("@/components/dialog/EipScriptDialog.vue");
const MessageTypeSelector = () => import("@/components/flow/MessageTypeSelector.vue");
const FlowVarSelector = () => import("@/components/flow/FlowVarSelector.vue");
const FlowConditionBuildDialog  = () => import("@/components/flow/FlowConditionBuildDialog.vue");
export default {
  name:"FlowNodeJumpRule",
  components: {MessageTypeSelector,eipScriptDialog,FlowVarSelector,FlowConditionBuildDialog },
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
    //跳转规则配置的信息
    nodeDef:{
      type: Object,
      required: true
    },
    //跳转规则配置流程跳转节点
    nodeDefList:{
      type: Array,
      required: true
    },
  },
  data() {
    return {
      titleSetting:"设置跳转规则",//某个节点跳转规则的标题
      dialogVisibleSetting:false,//是否显示设置节点跳转规则侧边栏
      isSave:false,//判断是否可以保存
      nodeDefCopy:{},//复制一份最开始的跳转规则配置的信息
      filterNodeType: ["EXCLUSIVEGATEWAY","SUBPROCESS","CALLACTIVITY","PARALLELGATEWAY","INCLUSIVEGATEWAY","SUBSTARTGATEWAY","SUBENDGATEWAY","SUBMULTISTARTGATEWAY"], // 过滤节点  分支
      curRule:{"ruleName":"","targetNode":"","condition":"","isAdd":true},//初始化跳转规则信息
    };
  },
  methods: {
    //监听条件脚本确认事件
    conditionDialogConfirm(data) {
      this.curRule.condition = this.curRule.condition+data;
    },
    //显示条件脚本对话框 
    showConditionBuild() {
        this.$refs.flowConditionBuildDialog.showDialog();
    },
    //监督可选变量的返回值
    varTreeOnConfirm(data){
        this.curRule.condition = this.curRule.condition+data.pathValue;
    },
    //显示常用脚本
    showDialog(action){
      this.$refs[action].showDialog();
    },
    //设置跳转规则
    editNodeRules(){
      this.nodeDefCopy = JSON.parse(JSON.stringify(this.nodeDef));//复制一份最开始的跳转规则配置的信息
      this.isSave=false;
      this.dialogVisibleSetting=true;
    },
    //点击跳转规则列表某一条数据时触发
    orgRowClick(row, column, event) {
      if(column.label !="操作"){
        this.curRule = row;
        this.isSave=true;
      }
    },
    //保存跳转规则
    saveRule(){
        //判断是否有新增的数据
        if(!this.isSave){
            Message.warning("请先新增跳转规则再保存");
            return;
        }else{
            const this_ = this;
            req.post("${bpmModel}/flow/node/v1/ruleSave?nodeId="+this_.node.nodeId+"&defId="+this_.node.defId,this_.nodeDefCopy.jumpRuleList).then(function(response){
                response = response.data;
                if(response.state){
                    Message.success(response.message);
                    this_.$emit("update:nodeDef",this_.nodeDefCopy);//子组件更新父组件的值
                    this_.$emit("upRuleData",this_.nodeDefCopy);//更新规则数据，防止点击其他节点时，当前保存的规则数据未更新显示
                    this_.dialogVisibleSetting = false;
                }else{
                    Message.error(response.message);
                }
            });
        }
    },
    //新增跳转规则
    addRule(){
      const this_ = this;
      this_.$validator.validateAll("settingSave").then(result => {
        if (result) {
            if(this_.curRule.isAdd){
                delete this_.curRule.isAdd;
                this_.isSave=true;
                this_.nodeDefCopy.jumpRuleList.push(this_.curRule);
                this_.isSave=true;
                this_.curRule={"ruleName":"","targetNode":"","condition":"","isAdd":true};//初始化跳转规则信息
            }
        } else {
            let arr = this_.$validator.errors.items.filter(item=>item.scope=="settingSave");
            let errorLength = arr.length;
            this_.$message({
                showClose: true,
                message: `有${errorLength}个字段未通过校验，请正确填写表单内容。`,
                type: "warning"
            });
        }
      });
    },
    //关闭设置节点跳转规则列弹框
    close(){
       this.dialogVisibleSetting=false;
    },
    //删除跳转规则
    deleteSetting(list,index){
      list.splice(index,1);
      this.isSave=true;
      this.curRule={"ruleName":"","targetNode":"","condition":"","isAdd":true};//初始化跳转规则信息
    },
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
.ht_tr{
  width: 100%;
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
  width: 300px;
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