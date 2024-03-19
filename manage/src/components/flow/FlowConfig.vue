<template>
  <div class="fullheight">
    <div style="float: left;width: calc(100% - 420px);height:calc(100% - 20px);margin: 10px;">
      <div style="overflow: auto;height: 100%;background:#eee;">
        <div
          v-if="defConfigData && defConfigData.initData && defConfigData.initData.bpmDefLayout"
          :style="{position:flowCanvasStyle.position,width:flowCanvasStyle.width+'px',height:flowCanvasStyle.height+'px',background:flowCanvasStyle.background}"
        >
          <div
            v-show="layout.nodeType != 'subProcess'"
            v-for="layout in defConfigData.initData.bpmDefLayout.listLayout"
            :key="layout.nodeId"
            class="flowNode"
            :nodeid="layout.nodeId"
            @click="toEditNode(layout)"
            :name="layout.name"
            :nodetype="layout.nodeType.key"
            :style="layout.nodeStyle"
          >
            <el-tag
              class="badge"
              style="margin-top:51px;display: inline-block;"
              v-if="layout.nodeId==defConfigData.curEditNode.nodeId"
            >正在编辑</el-tag>
          </div>
        </div>
      </div>
    </div>
    <el-aside style="width:390px;margin-right:10px;">
      <el-button
        type="primary"
        style="float: right;z-index: 15000;position: fixed;top:8px;right:15px"
        @click="saveDefSetting()"
        element-loading-text="拼命保存中"
        v-loading.fullscreen.lock="fullscreenLoading"
        size="small"
        icon="el-icon-document-checked"
      >保存配置</el-button>
      <el-tabs
        v-if="defConfigData.nodeSetData &&  defConfigData.nodeSetData.bpmDefSetting"
        v-model="curActiveSet"
      >
        <el-tab-pane label="基础配置" name="basic">
          <el-collapse accordion v-model="curCollapse">
            <el-collapse-item title="全局设置" name="1">
              <el-scrollbar class="scrollbar-fullheight" style="height:400px">
                <div class="fullheight">
                  <el-card class="box-card">
                    <FlowFormConfig title="全局表单" type="1" :defkey="topDefKey" :defId="defId" label-width="90px" />
                  </el-card>
                  <el-card class="box-card">
                    <FlowFormConfig title="实例表单" type="2" :defkey="topDefKey" :defId="defId" label-width="90px" />
                  </el-card>
                  <el-card class="box-card">
                    <el-form data-vv-scope="settingSave">
                      <ht-form-item label="全局事件" label-width="90px">
                        <el-button icon type="primary" size="mini" @click="setRestFul">设置接口事件</el-button>
                      </ht-form-item>
                    </el-form>
                  </el-card>
                </div>
              </el-scrollbar>
            </el-collapse-item>

            <el-collapse-item title="节点表单" name="2">
              <el-button
                style="margin-bottom: 10px;"
                @click="editAllNodes('forms')"
                size="small"
              >{{isEditAllNode_forms?'隐藏所有节点':'设置所有节点'}}</el-button>
              <br />
              <el-scrollbar
                class="scrollbar-fullheight"
                style="max-height:400px"
                :wrapStyle="[{maxHeight:'400px'}]"
              >
                <el-card
                  class="box-card"
                  v-show="node.nodeId == defConfigData.curEditNode.nodeId || isEditAllNode_forms"
                  v-for="node in defConfigData.nodeSetData.nodes"
                  :key="node.nodeId"
                >
                  <FlowFormConfig :nodeId="node.nodeId" :nodeType="node.type" :title="node.name" :defId="defId" :defkey="topDefKey" v-if="node.nodeId == defConfigData.curEditNode.nodeId || isEditAllNode_forms"/>
                </el-card>
              </el-scrollbar>
            </el-collapse-item>
            <el-collapse-item title="节点审批人员" name="3">
              <el-button
                style="margin-bottom: 10px;"
                @click="editAllNodes('nodeUser')"
                size="small"
              >{{isEditAllNode_nodeUser?'隐藏所有节点人员':'设置所有节点人员'}}</el-button>
              <br />
              <el-scrollbar
                class="scrollbar-fullheight"
                style="max-height:400px"
                :wrapStyle="[{maxHeight:'400px'}]"
              >
                <el-card
                  class="box-card"
                  v-show="(node.nodeId == defConfigData.curEditNode.nodeId || isEditAllNode_nodeUser) && node.type !='start'"
                  v-for="node in defConfigData.nodeSetData.nodes"
                  :key="node.nodeId"
                >
                  <FlowNodeUserConfig :nodeId="node.nodeId" :title="node.name"  v-if="(node.nodeId == defConfigData.curEditNode.nodeId || isEditAllNode_nodeUser) && node.type !='start'"/>
                </el-card>
              </el-scrollbar>
            </el-collapse-item>
            <el-collapse-item title="节点抄送人员" name="4">
              <el-button
                style="margin-bottom: 10px;"
                @click="editAllNodes('nodeReadUser')"
                size="small"
              >{{isEditAllNode_nodeReadUser?'隐藏所有节点人员':'设置所有节点人员'}}</el-button>
              <br />
              <el-scrollbar
                class="scrollbar-fullheight"
                style="max-height:400px"
                :wrapStyle="[{maxHeight:'400px'}]"
              >
                <el-card
                  class="box-card"
                  v-show="(node.nodeId == defConfigData.curEditNode.nodeId || isEditAllNode_nodeReadUser) && node.type !='start'"
                  v-for="node in defConfigData.nodeSetData.nodes"
                  :key="node.nodeId"
                >
                  <FlowNodeCopyToUserConfig :nodeId="node.nodeId" :title="node.name"  v-if="(node.nodeId == defConfigData.curEditNode.nodeId || isEditAllNode_nodeReadUser) && node.type !='start'"/>
                </el-card>
              </el-scrollbar>
            </el-collapse-item>
            <el-collapse-item title="节点属性" name="5">
              <el-button
                style="margin-bottom: 10px;"
                @click="editAllNodes('properties')"
                size="small"
              >{{isEditAllNode_properties?'隐藏所有节点属性':'设置所有节点属性'}}</el-button>
              <br />
              <el-scrollbar
                class="scrollbar-fullheight"
                style="max-height:400px"
                :wrapStyle="[{maxHeight:'400px'}]"
              >
                <!-- 批量勾选 -->
                <el-card
                  class="box-card"
                  v-show="isEditAllNode_properties"
                  style="padding-bottom: 10px;"
                >
                  <label class="control-label">批量勾选:</label>
                  <el-button
                    style="margin-left: 20px"
                    size="mini"
                    v-if="nodeAttr.jumpType!=''"
                    type="primary"
                    @click="helpGlobalClick()"
                  >帮助</el-button>
                  <br />
                  <ht-checkbox
                    :options="[{key: 'free', value: '自由跳转' },{key: 'select', value: '选择路径跳转' }]"
                    v-model="nodeAttr.jumpType"
                  />
                  <br />
                  <ht-checkbox
                    :options="defConfigData.nodeSetData.notifyType"
                    v-model="nodeAttr.notify"
                  />
                  <br />
                  <!-- <ht-checkbox :options='[{key: "backMode_all", value: "驳回后返回" }]' v-model="nodeAttr.backMode_all" /> -->
                  <ht-checkbox
                    :options="[{key: 'skipExecutorEmpty_all', value: '执行人为空时跳过' }]"
                    v-model="nodeAttr.skipExecutorEmpty_all"
                  />
                </el-card>
                <!-- 每个节点的节点属性配置 -->
                <el-card
                  class="box-card"
                  v-show="(node.nodeId == defConfigData.curEditNode.nodeId || isEditAllNode_properties)"
                  v-for="node in defConfigData.nodeSetData.nodes"
                  :key="node.nodeId"
                >
                  <!-- 节点属性配置 -->
                  <FlowNodeAttributes
                    :boDefJson="boDefJson"
                    ref="flowNodeAttributes"
                    :node="node"
                    :nodeAttr="nodeAttr"
                    :defConfigData="defConfigData"
                    v-if="(node.nodeId == defConfigData.curEditNode.nodeId || isEditAllNode_properties)"
                  />
                </el-card>
              </el-scrollbar>
            </el-collapse-item>

            <el-collapse-item title="会签规则配置" name="7" v-if="autoCollapsePaneName =='7'">
              <el-card class="box-card">
                <FlowSignConfig />
              </el-card>
            </el-collapse-item>

            <el-collapse-item
              :title="curSelectNodeType =='EXCLUSIVEGATEWAY'?'分支条件配置':'条件同步配置'"
              name="6"
              v-if="autoCollapsePaneName=='6'"
            >
              <el-scrollbar
                class="scrollbar-fullheight"
                style="max-height:400px"
                :wrapStyle="[{maxHeight:'400px'}]"
              >
                <el-card class="box-card">
                  <FlowBranchConditionList />
                </el-card>
              </el-scrollbar>
            </el-collapse-item>
            <el-collapse-item title="子流程设置" name="8" v-if="autoCollapsePaneName=='8'">
              <el-button style="margin-bottom: 10px;" @click="setSubflow" size="small">设置外部子流程</el-button>
            </el-collapse-item>
          </el-collapse>
        </el-tab-pane>
        <el-tab-pane label="更多配置" name="gloable">
          <el-collapse v-model="activeNames" @change="handleChange" accordion>
            <el-collapse-item title="节点按钮" name="1">
              <el-button
                style="margin-bottom: 10px;"
                @click="editAllNodes('btns')"
                size="small"
              >{{isEditAllNode_btns?'隐藏所有节点按钮':'设置所有节点按钮'}}</el-button>
              <br />
              <el-scrollbar
                class="scrollbar-fullheight"
                style="max-height:400px"
                :wrapStyle="[{maxHeight:'400px'}]"
              >
                <!-- 每个节点的节点按钮配置 -->
                <el-card
                  class="box-card"
                  v-show="(node.nodeId == defConfigData.curEditNode.nodeId || isEditAllNode_btns)"
                  v-for="node in defConfigData.nodeSetData.nodes"
                  :key="node.nodeId"
                >
                  <!-- 节点按钮配置 -->
                  <FlowNodeBtns ref="flowNodeBtns" :node="node" :defConfigData="defConfigData" v-if="(node.nodeId == defConfigData.curEditNode.nodeId || isEditAllNode_btns)"></FlowNodeBtns>
                </el-card>
              </el-scrollbar>
            </el-collapse-item>
            <el-collapse-item title="节点事件" name="2">
              <el-button
                style="margin-bottom: 10px;"
                @click="editAllNodes('restful')"
                size="small"
              >{{isEditAllNode_restful?'隐藏所有节点事件':'设置所有节点事件'}}</el-button>
              <br />
              <el-scrollbar
                class="scrollbar-fullheight"
                style="max-height:400px"
                :wrapStyle="[{maxHeight:'400px'}]"
              >
                <!-- 每个节点的节点事件配置 -->
                <el-card
                  class="box-card"
                  v-show="(node.nodeId == defConfigData.curEditNode.nodeId || isEditAllNode_restful)"
                  v-for="node in defConfigData.nodeSetData.nodes"
                  :key="node.nodeId"
                >
                  <!-- 节点事件配置 -->
                  <FlowNodeRestfuls
                    ref="flowNodeRestfuls"
                    :node="node"
                    :defConfigData="defConfigData"
                    v-if="(node.nodeId == defConfigData.curEditNode.nodeId || isEditAllNode_restful)"
                  ></FlowNodeRestfuls>
                </el-card>
              </el-scrollbar>
            </el-collapse-item>
            <el-collapse-item
              v-if="defConfigData.curEditNode.nodeType=='CUSTOMSIGNTASK' || defConfigData.curEditNode.nodeType=='USERTASK' || defConfigData.curEditNode.nodeType=='SIGNTASK'"
              title="跳转规则设置"
              name="3"
            >
              <el-scrollbar
                class="scrollbar-fullheight"
                style="max-height:400px"
                :wrapStyle="[{maxHeight:'400px'}]"
              >
                <!-- 每个节点的跳转规则配置 -->
                <el-card class="box-card">
                  <!-- 跳转规则配置 -->
                  <FlowNodeJumpRule
                    ref="flowNodeJumpRule"
                    :node="defConfigData.curEditNode"
                    :nodeDefList="nodeDefList"
                    :nodeDef.sync="nodeDef"
                    @upRuleData="upRuleData"
                    :defConfigData="defConfigData"
                  ></FlowNodeJumpRule>
                </el-card>
              </el-scrollbar>
            </el-collapse-item>
            <el-collapse-item
              v-if="defConfigData.curEditNode.nodeType=='CUSTOMSIGNTASK' || defConfigData.curEditNode.nodeType=='USERTASK' || defConfigData.curEditNode.nodeType=='SIGNTASK'
              || defConfigData.curEditNode.nodeType=='START' || defConfigData.curEditNode.nodeType=='END'"
              title="事件脚本设置"
              name="4"
            >
              <el-scrollbar
                class="scrollbar-fullheight"
                style="max-height:400px"
                :wrapStyle="[{maxHeight:'400px'}]"
              >
                <!-- 每个节点的事件脚本设置 -->
                <el-card class="box-card">
                  <!-- 事件脚本设置 -->
                  <FlowNodeScript
                    ref="flowNodeScript"
                    :node="defConfigData.curEditNode"
                    :eventScriptData.sync="eventScriptData"
                    :defConfigData="defConfigData"
                  ></FlowNodeScript>
                </el-card>
              </el-scrollbar>
            </el-collapse-item>
            <el-collapse-item
              v-if="defConfigData.curEditNode.nodeType=='CUSTOMSIGNTASK' ||  defConfigData.curEditNode.nodeType=='USERTASK' || defConfigData.curEditNode.nodeType=='SIGNTASK'"
              title="催办设置"
              name="6"
            >
              <el-scrollbar
                class="scrollbar-fullheight"
                style="max-height:400px"
                :wrapStyle="[{maxHeight:'400px'}]"
              >
                <!-- 每个节点的催办配置 -->
                <el-card class="box-card">
                  <!-- 催办配置 -->
                  <FlowNodeRemind
                    ref="flowNodeRemind"
                    :node="defConfigData.curEditNode"
                    :nodeList="nodeList"
                    :reminders.sync="reminders"
                    :defConfigData="defConfigData"
                  ></FlowNodeRemind>
                </el-card>
              </el-scrollbar>
            </el-collapse-item>
            <el-collapse-item
              v-if="defConfigData.curEditNode.nodeType=='SERVICETASK'"
              title="自动任务设置"
              name="7"
            >
              <el-scrollbar
                class="scrollbar-fullheight"
                style="max-height:400px"
                :wrapStyle="[{maxHeight:'400px'}]"
              >
                <!-- 每个自动任务的设置 -->
                <el-card class="box-card">
                  <!-- 自动任务设置 -->
                  <FlowAutoTask
                    ref="flowAutoTask"
                    :node="defConfigData.curEditNode"
                    :autoTask.sync="autoTask"
                    :defConfigData="defConfigData"
                  ></FlowAutoTask>
                </el-card>
              </el-scrollbar>
            </el-collapse-item>

            <el-collapse-item
              v-if="defConfigData.curEditNode.nodeType=='CUSTOMSIGNTASK' ||  defConfigData.curEditNode.nodeType=='USERTASK' || defConfigData.curEditNode.nodeType=='SIGNTASK'"
              title="触发新流程设置"
              name="8"
            >
              <el-scrollbar
                class="scrollbar-fullheight"
                style="max-height:400px"
                :wrapStyle="[{maxHeight:'400px'}]"
              >
                <el-card class="box-card">
                  <!-- 触发新流程配置 -->
                  <FlowNodeStartNewFlow
                    v-if="startNewFlowConfMap[curSelectNodeId]"
                    ref="flowNodeStartNewFlow"
                    :node="defConfigData.curEditNode"
                    :confList.sync="startNewFlowConfMap[curSelectNodeId]"
                    :defConfigData="defConfigData"
                    :flowVar="flowVar"
                  />
                </el-card>
              </el-scrollbar>
            </el-collapse-item>

          </el-collapse>
        </el-tab-pane>
      </el-tabs>
    </el-aside>
  </div>
</template>

<script>
import flow from "@/api/flow.js";
import req from "@/request.js";
import { mapState, mapActions } from "vuex";
const FlowFormConfig = () => import("@/components/flow/FlowFormConfig.vue");
const FlowNodeUserConfig = () =>
  import("@/components/flow/FlowNodeUserConfig.vue");
const FlowNodeAttributes = () =>
  import("@/components/flow/FlowNodeAttributes.vue");
const FlowNodeBtns = () => import("@/components/flow/FlowNodeBtns.vue");
const FlowNodeCopyToUserConfig = () =>
  import("@/components/flow/FlowNodeCopyToUserConfig.vue");
const FlowNodeRestfuls = () => import("@/components/flow/FlowNodeRestfuls.vue");
const FlowBranchConditionList = () =>
  import("@/components/flow/FlowBranchConditionList.vue");
const FlowNodeRemind = () => import("@/components/flow/FlowNodeRemind.vue");
const FlowNodeJumpRule = () => import("@/components/flow/FlowNodeJumpRule.vue");
const FlowSignConfig = () => import("@/components/flow/FlowSignConfig.vue");
const FlowNodeScript = () => import("@/components/flow/FlowNodeScript.vue");
const FlowAutoTask = () => import("@/components/flow/FlowAutoTask.vue");
const FlowNodeStartNewFlow = () => import("@/components/flow/FlowNodeStartNewFlow.vue");

import htUiUtil from "@/hotent-ui-util.js";

export default {
  props: ["defId", "topDefKey"],
  components: {
    FlowFormConfig,
    FlowNodeUserConfig,
    FlowNodeAttributes,
    FlowNodeBtns,
    FlowNodeCopyToUserConfig,
    FlowAutoTask,
    FlowNodeRestfuls,
    FlowBranchConditionList,
    FlowNodeRemind,
    FlowNodeJumpRule,
    FlowSignConfig,
    FlowNodeScript,
    FlowNodeStartNewFlow
  },
  data() {
    return {
      autoTask: {}, //当前自动任务的配置信息
      autoTaskData: {}, //自动任务配置，用于鼠标点击不同自动任务时获取不同的自动任务配置
      flowCanvasStyle: {},
      eventScriptData: {}, //事件脚本配置当前节点信息
      scriptData: {}, //事件脚本配置，用于鼠标点击不同节点任务时获取不同的事件脚本配置
      ruleData: {}, //跳转规则配置，用于鼠标点击不同节点任务时获取不同的跳转规则配置
      reminderData: {}, //催办设置，用于鼠标点击不同节点任务时获取不同的催办设置
      nodeDef: {}, //跳转规则配置当前节点信息
      nodeDefList: [], //跳转规则配置流程跳转节点
      activeNames: "", //更多设置手风琴绑定的model
      nodeList: [], //催办配置流程所有节点
      reminders: {}, //催办配置当前节点的信息
      startNewFlowConfMap: {}, //催办配置当前节点的信息
      nodeAttr: {
        jumpType: "",
        notify: "",
        backMode_all: "",
        skipExecutorEmpty_all: ""
      }, //节点属性批量勾选配置
      curActiveSet: "basic",
      isEditAllNode_forms: false, //节点表单
      isEditAllNode_btns: false, //节点按钮
      isEditAllNode_nodeUser: false, //节点人员
      isEditAllNode_nodeReadUser: false, //节点抄送人员
      isEditAllNode_properties: false, //节点属性
      isEditAllNode_restful: false, //节点事件
      fullscreenLoading: false,
      curSelectNodeId: "", //点击任务节点时获取节点ID
      curSelectNodeType: "", //点击任务节点时获取节点类型
      curCollapse: "",
      autoCollapsePaneName: "", //自动展开的选项卡名称
      boDefJson: [], //表单字段
      flowVar:null
    };
  },
  computed: mapState({
    defConfigData: state => state.flow.defConfigData,
    //仅仅做备份比对使用，勿更新此对象里的数据
    copyDefConfigData: state => state.flow.copyDefConfigData,
  }),
  watch: {
    curSelectNodeId: {
      handler(newValue, oldValue) {
        //消息任务和自动任务
        if (this.curSelectNodeType == "SERVICETASK") {
          //自动任务设置
          if (newValue && JSON.stringify(this.autoTaskData) != "{}") {
            let data = this.autoTaskData[newValue]; //获取当前鼠标点击的节点任务的催办信息
            //判断当前鼠标点击的节点任务的催办信息是否有值，没有则重新查询
            if (data) {
              if (data == "无数据") {
                this.autoTask = {};
              } else {
                this.autoTask = data;
              }
            } else {
              this.getAutoTask(this.defId, newValue); //获取脚本的设置
            }
          }
        }
        //EXCLUSIVEGATEWAY：分支；SERVICETASK：消息任务和自动任务；PARALLELGATEWAY：同步；INCLUSIVEGATEWAY：条件同步；CALLACTIVITY：外部子流程；
        if (
          this.curSelectNodeType != "CALLACTIVITY" &&
          this.curSelectNodeType != "SERVICETASK" &&
          this.curSelectNodeType != "PARALLELGATEWAY" &&
          this.curSelectNodeType != "EXCLUSIVEGATEWAY" &&
          this.curSelectNodeType != "INCLUSIVEGATEWAY"
        ) {
          //跳转规则设置
          if (newValue && JSON.stringify(this.ruleData) != "{}") {
            let data = this.ruleData[newValue]; //获取当前鼠标点击的节点任务的跳转规则信息
            //判断当前鼠标点击的节点任务的跳转规则信息是否有值，没有则重新查询
            if (data) {
              this.nodeDef = data.nodeDef; //获取跳转规则配置当前节点信息
              this.nodeDefList = data.nodeDefList;
              for (let i = 0; i < this.nodeDefList.length; i++) {
                if (this.nodeDef.name == this.nodeDefList[i].name) {
                  this.nodeDefList.splice(i, 1);
                  break;
                }
              }
            } else {
              this.getNodeJumpRule(this.defId, newValue); //获取任务节点的跳转规则设置
            }
          }
          //催办设置
          if (newValue && JSON.stringify(this.reminderData) != "{}") {
            let data = this.reminderData[newValue]; //获取当前鼠标点击的节点任务的催办信息
            //判断当前鼠标点击的节点任务的催办信息是否有值，没有则重新查询
            this.getReminders(this.defId, newValue); //获取任务节点的催办设置
          }

          this.getStartNewFlowConf(this.defId, newValue); //获取自动触发新流程的配置

          
          //事件脚本设置
          if (newValue && JSON.stringify(this.scriptData) != "{}") {
            let data = this.scriptData[newValue]; //获取当前鼠标点击的节点任务的事件脚本信息
            //判断当前鼠标点击的节点任务的事件脚本信息是否有值，没有则重新查询
            if (data) {
              //任务类型大写转换成小写
              if (data.bpmNodeDef.type) {
                data.bpmNodeDef.type = data.bpmNodeDef.type.toLowerCase();
              }
              this.eventScriptData = data;
            } else {
              this.getNodeScript(this.defId, newValue); //获取任务节点的事件脚本设置
            }
          }
          //如果节点绑定了表单，则获取节点表单对应的bo数据，且以PC端表单为准
          if(this.defConfigData.nodeSetData.bpmDefSetting.nodeForms && this.curSelectNodeId){
            let curSelectNodeId = this.curSelectNodeId;
            let nodeFormKey = '';
            this.defConfigData.nodeSetData.bpmDefSetting.nodeForms.forEach(nodeForm => {
              if(nodeForm.type == 'INNER' && nodeForm.formType == 'pc' && curSelectNodeId == nodeForm.nodeId && nodeForm.formValue){
                nodeFormKey = nodeForm.formValue;
                return ;
              }
            });
            if(!nodeFormKey){
              nodeFormKey = this.defConfigData.nodeSetData.bpmDefSetting.globalForm.formValue;
            }
            this.getBoDefJson(nodeFormKey);
          }
        }
      },
      deep: true
    },
    'defConfigData.nodeSetData.bpmDefSetting.globalForm.formValue':{
      handler(newValue, oldValue){
        if (newValue && oldValue!=newValue && this.defConfigData.nodeSetData.bpmDefSetting.globalForm.type == 'INNER'){
          this.getBoDefJson(newValue);
        }else{
          this.boDefJson=[];
        }
      }
    }
    },
  methods: {
    //获取自动任务设置
    getBoDefJson(formkey){
      req.get(window.context.form+'/form/form/v1/getBoJsonByFormKey?formkey='+formkey).then(response => {
        let data = response.data;
        let  list = [];
        if(data){
          for(let index=0,pf;pf=data[index++];){
            //只返回主表字段
            pf.children=pf.children.filter(item => item.nodeType!="sub" )
            list.push(pf);
            /*for(let s=0,f;f=pf.children[s++];){
			  //子表
			  if(f.children){
				f.sub=true;
				//nodeType  "sub"
				f.children=f.children.filter(item => item.nodeType!="sub" )
				console.log(f.children);
				list.push(f);
			  }
			}*/
          }
        }
        this.boDefJson=list;
      });
    },
    getAutoTask(defId, nodeId) {
      const this_ = this;
      //获取自动任务的配置信息
      req
        .get(
          "${bpmModel}/flow/node/v1/getNodeAutoTask?defId=" +
            defId +
            "&nodeId=" +
            nodeId,
          {}
        )
        .then(function(data) {
          data = data.data;
          if (data) {
            this_.autoTask = data;
            this_.autoTaskData[nodeId] = data;
          } else {
            this_.autoTask = {};
            this_.autoTaskData[nodeId] = "无数据";
          }
        });
    },
    //获取任务节点的事件脚本设置
    getNodeScript(defId, nodeId) {
      const this_ = this;
      //获取事件脚本的配置信息
      req
        .get(
          "${bpmModel}/flow/node/v1/eventScriptEdit?defId=" +
            defId +
            "&nodeId=" +
            nodeId
        )
        .then(function(data) {
          data = data.data;
          if (data) {
            //任务类型大写转换成小写
            if (data.bpmNodeDef.type) {
              data.bpmNodeDef.type = data.bpmNodeDef.type.toLowerCase();
            }
            this_.eventScriptData = data;
            this_.scriptData[nodeId] = data;
          }
        });
    },
    //获取任务节点的跳转规则设置
    getNodeJumpRule(defId, nodeId) {
      const this_ = this;
      //获取任务跳转规则的配置信息
      req
        .get(
          "${bpmModel}/flow/node/v1/ruleEdit?definitionId=" +
            defId +
            "&nodeId=" +
            nodeId
        )
        .then(function(data) {
          data = data.data;
          if (data) {
            this_.nodeDef = data.nodeDef; //获取跳转规则配置当前节点信息
            this_.nodeDefList = data.nodeDefList;
            for (let i = 0; i < this_.nodeDefList.length; i++) {
              if (this_.nodeDef.name == this_.nodeDefList[i].name) {
                this_.nodeDefList.splice(i, 1);
                break;
              }
            }
            this_.ruleData[nodeId] = data;
          }
        });
    },
    //获取任务节点的催办设置
    getReminders(defId, nodeId) {
      const this_ = this;
      //获取任务催办的配置信息
      req
        .get(
          "${bpmModel}/flow/plugins/v1/remindersJson?defId=" +
            defId +
            "&nodeId=" +
            nodeId,
          {}
        )
        .then(function(data) {
          data = data.data;
          this_.reminders = data.reminders;
          this_.reminderData[nodeId] = data;
        });
      //获取催办配置流程所有节点
      req
        .get("${bpmModel}/flow/node/v1/getNodes?defId=" + defId)
        .then(function(data) {
          data = data.data;
          this_.nodeList = data;
        });
    },
    //获取任务节点的催办设置
    getStartNewFlowConf(defId, nodeId) {
      const this_ = this;
      //获取当前流程的变量，触发新流程配置可能使用
      if (this.flowVar  ==  null) {
          req
          .post(window.context.bpmModel + "/flow/node/v1/varTree", {
            defId: defId,
            nodeId: nodeId,
            includeBpmConstants: false,
            removeSub: true,
            bpmForm:true
          })
          .then(response => {
            response.data = response.data || [];
            this_.flowVar = response.data;
          });
      }
      if (this.startNewFlowConfMap &&  this.startNewFlowConfMap.hasOwnProperty(nodeId)) {
        return;
      }
      req
        .get(
          "${bpmModel}/flow/plugins/v1/startNewFlowJson?defId=" +
            defId +
            "&nodeId=" +
            nodeId,
          {}
        )
        .then(function(data) {
          this_.$set(this_.startNewFlowConfMap,nodeId,data.data ||[]);
        });
    },

    //更多设置手风琴中的某一个时触发  如：点击催办设置
    handleChange(val) {
      const this_ = this;
      let defId = this_.defId;
      let nodeId = this_.curSelectNodeId;
      //点击催办设置时
      if (val == "6" && nodeId != "") {
        this_.getReminders(defId, nodeId); //获取任务节点的催办设置
        //点击跳转规则设置时
      } else if (val == "3" && nodeId != "") {
        this.getNodeJumpRule(defId, nodeId); //获取任务跳转规则的配置信息
      } else if (val == "4" && nodeId != "") {
        this.getNodeScript(defId, nodeId); //获取任务节点的事件脚本设置
      } else if (val == "7" && nodeId != "") {
        this.getAutoTask(defId, nodeId); //获取自动任务的设置
      }
    },
    //设置全局任务节点的节点事件
    setRestFul() {
      this.$refs.flowNodeRestfuls[0].setRestFul(); //调用设置任务节点的事件的方法
    },
    //点击帮助事件
    helpGlobalClick() {
      this.$refs.flowNodeAttributes[0].helpClick("", "");
    },
    toEditNode(layout) {
      this.autoCollapsePaneName = "";
      layout.defId = this.defId;
      this.curSelectNodeType = layout.nodeType;
      this.curSelectNodeId = layout.nodeId;
      if (
        "EXCLUSIVEGATEWAY" == layout.nodeType ||
        "INCLUSIVEGATEWAY" == layout.nodeType
      ) {
        this.curCollapse = "6";
        //此处为了防止用户在2个分支之间切换，而配置的条件不切换到额问题
        setTimeout(() => {
          this.autoCollapsePaneName = "6";
        }, 1);
      } else if ("SIGNTASK" == layout.nodeType) {
        setTimeout(() => {
          this.autoCollapsePaneName = "7";
        }, 1);
      } else if ("CALLACTIVITY" == layout.nodeType) {
        this.curCollapse = "8";
        setTimeout(() => {
          this.autoCollapsePaneName = "8";
        }, 1);
      }

      this.$store.dispatch("flow/updateConfig", { curEditNode: layout });
      this.isEditAllNode_forms = false;
      this.isEditAllNode_btns = false;
      this.isEditAllNode_nodeUser = false;
      this.isEditAllNode_nodeReadUser = false;
      this.isEditAllNode_properties = false;
      this.isEditAllNode_restful = false;
    },
    editAllNodes(name) {
      if (this["isEditAllNode_" + name]) {
        this["isEditAllNode_" + name] = false;
      } else {
        this["isEditAllNode_" + name] = true;
      }
    },
    setSubflow() {
      this.$confirm(
        "此操作会丢失当前流程未保存的配置，是否继续前往设置子流程？",
        "警告",
        {
          cancelButtonText: "取消",
          confirmButtonText: "确定",
          type: "warning",
          closeOnClickModal: false
        }
      ).then(() => {
        this.$root.$emit("set-sub-flow", {
          defId: this.defConfigData.curEditNode.defId,
          nodeId: this.defConfigData.curEditNode.nodeId
        });
      });
    },
    saveDefSetting() {
      if (!this.defConfigData.nodeSetData.bpmDefSetting.globalForm || !this.defConfigData.nodeSetData.bpmDefSetting.globalForm.formValue) {
        this.$confirm("尚未配置全局表单，可能导致流程发起异常，是否确认保存?", "提醒", {
            confirmButtonText: "继续保存",
            cancelButtonText: "设置表单",
            type: "warning",
          }).then(() => {
             this.doSaveDefSetting();
          }).catch(()=>{
            this.curActiveSet = 'basic';
            this.curCollapse = '1';
          })
      }else{
        this.doSaveDefSetting();
      }
    },
    removeNotChangeConf(){
      let tempConf = JSON.parse(JSON.stringify(this.defConfigData));
      if (!tempConf.nodeSetData || !this.copyDefConfigData || !this.copyDefConfigData.nodeSetData ) {
        return;
      }
      let nodeFormKeys = [];
      //比对节点表单
      if (tempConf.nodeSetData.bpmDefSetting.formMap) {
        for (const nodeId in tempConf.nodeSetData.bpmDefSetting.formMap) {
          let nodeForm = tempConf.nodeSetData.bpmDefSetting.formMap[nodeId];
          if (nodeForm.type == 'INNER' && nodeForm.formValue) {
            nodeFormKeys.push(nodeForm.formValue);
          }
          if (htUiUtil.objectEquals(nodeForm,this.copyDefConfigData.nodeSetData.bpmDefSetting.formMap[nodeId])) {
            delete tempConf.nodeSetData.bpmDefSetting.formMap[nodeId];
          }
        }
      }

      if (tempConf.nodeSetData.bpmDefSetting.mobileFormMap) {
        for (const nodeId in tempConf.nodeSetData.bpmDefSetting.mobileFormMap) {
          let nodeMbForm = tempConf.nodeSetData.bpmDefSetting.mobileFormMap[nodeId];
          if (nodeMbForm.type == 'INNER' && nodeMbForm.formValue) {
            nodeFormKeys.push(nodeMbForm.formValue);
          }
          if (htUiUtil.objectEquals(nodeMbForm,this.copyDefConfigData.nodeSetData.bpmDefSetting.mobileFormMap[nodeId])) {
            delete tempConf.nodeSetData.bpmDefSetting.mobileFormMap[nodeId];
          }
        }
      }

      if (tempConf.nodeSetData.bpmDefSetting.nodePropertieMap) {
        for (const nodeId in tempConf.nodeSetData.bpmDefSetting.nodePropertieMap) {
          if (htUiUtil.objectEquals(tempConf.nodeSetData.bpmDefSetting.nodePropertieMap[nodeId],this.copyDefConfigData.nodeSetData.bpmDefSetting.nodePropertieMap[nodeId])) {
            delete tempConf.nodeSetData.bpmDefSetting.nodePropertieMap[nodeId];
          }
        }
      }

      if (tempConf.nodeSetData.nodeReadUserMap) {
        for (const nodeId in tempConf.nodeSetData.nodeReadUserMap) {
          if (htUiUtil.objectEquals(tempConf.nodeSetData.nodeReadUserMap[nodeId],this.copyDefConfigData.nodeSetData.nodeReadUserMap[nodeId])) {
            delete tempConf.nodeSetData.nodeReadUserMap[nodeId];
          }
        }
      }

      if (tempConf.nodeSetData.nodeRestfulMap) {
        for (const nodeId in tempConf.nodeSetData.nodeRestfulMap) {
          if (htUiUtil.objectEquals(tempConf.nodeSetData.nodeRestfulMap[nodeId],this.copyDefConfigData.nodeSetData.nodeRestfulMap[nodeId])) {
            delete tempConf.nodeSetData.nodeRestfulMap[nodeId];
          }
        }
      }

      if (tempConf.nodeSetData.nodeUserMap) {
        for (const nodeId in tempConf.nodeSetData.nodeUserMap) {
          if (htUiUtil.objectEquals(tempConf.nodeSetData.nodeUserMap[nodeId],this.copyDefConfigData.nodeSetData.nodeUserMap[nodeId])) {
            delete tempConf.nodeSetData.nodeUserMap[nodeId];
          }
        }
      }
      tempConf.nodeFormKeys = nodeFormKeys;
      return tempConf;
    },
    doSaveDefSetting() {
      let tempConf =  this.removeNotChangeConf();
      let tempSetting = tempConf.nodeSetData.bpmDefSetting;
      delete tempSetting.nodeForms;
      delete tempSetting.nodeProperties;
      tempSetting.parentDefKey = this.topDefKey;
      let param = {
        defSettingJson: JSON.stringify(tempSetting),
        userJson: JSON.stringify(tempConf.nodeSetData.nodeUserMap),
        userReadJson: JSON.stringify(tempConf.nodeSetData.nodeReadUserMap),
        restfulJson: JSON.stringify(tempConf.nodeSetData.nodeRestfulMap),
        defId: this.defId,
        rev: tempConf.initData.bpmDefinition.rev,
        topDefKey: this.topDefKey,
        nodeFormKeys:tempConf.nodeFormKeys.join(',')
      };
      let this_ = this;
      this.fullscreenLoading = true;
      req
        .post(window.context.bpmModel + "/flow/node/v1/saveDefConf", param)
        .then(response => {
          let data = response.data;
          if (data.state) {
            this_.$message.success(data.message);
            this_.init();
            this_.flowVar = null;
            this.$root.$emit("nodeSetUpdate",tempSetting);//发布点击保存流程配置事件
          }
        })
        .finally(response => {
          this.fullscreenLoading = false;
        });
    },
    init() {
      let param = { defId: this.defId, topDefKey: this.topDefKey || "" };
      let this_ = this;
      this.$store.dispatch("flow/getDefSetting", param).then(function(data) {
        const rnd = new Date().getTime();
        let url = window.context.bpmModel +"/flow/def/v1/image?defId=" +this_.defId +"&bpmnInstId=&taskId=&rnd=" +rnd;
        let tenantId = '-1';
        try {
          if(this_.$store.state.login.currentUser.userAttrs.tenantId){
            tenantId = this_.$store.state.login.currentUser.userAttrs.tenantId;
          }
        } catch (error) {}
        if(tenantId!='-1'){
            url = url + '&tenantId='+tenantId;
        }
        let backgroundUrl =
          "url('" +url+"') no-repeat";
        let flowCanvasStyle = {
          position: "relative",
          background: backgroundUrl,
          width: data.initData.bpmDefLayout.width,
          height: data.initData.bpmDefLayout.height
        };
        this_.flowCanvasStyle = flowCanvasStyle;
      });
    },
    upRuleData(nodeDef){
      if(this.ruleData[nodeDef.nodeId]){
        this.ruleData[nodeDef.nodeId]['nodeDef'] = nodeDef;
      }
    }
  },
  created() {
    if (this.defId) {
      this.init();
    }
  }
};
</script>

<style  scoped>
.control-label {
  word-break: break-all;
  color: #545252;
  font-size: 12px;
  padding: 0px 0px !important;
  font-weight: bold;
  line-height: 35px;
}
.panel {
  margin-bottom: 20px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.panel-default > .panel-heading {
  color: #333;
  background-color: #f5f5f5;
  border-color: #ddd;
}
.panel-heading {
  padding: 10px 15px;
  border-bottom: 1px solid transparent;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
}
div >>> .el-collapse-item__content {
  padding-bottom: 0px;
}
div >>> .box-card {
  margin-bottom: 10px;
}

div >>> .el-card .el-card__body {
  padding: 10px 10px 0px 10px;
}

div >>> .el-collapse-item__header {
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  font-weight: bold;
}
</style>
