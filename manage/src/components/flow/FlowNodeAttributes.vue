<template>
  <div>
    <label class="control-label">{{node.name}}({{node.nodeId}})</label>
    <el-button
      style="margin-left: 20px"
      size="mini"
      type="primary"
      v-if="(propertie.jumpType=='free' || propertie.jumpType=='select' || propertie.jumpType=='free,select' ||
    propertie.jumpType=='select,free') && nodeAttr.jumpType=='' && node.type!='signTask'"
      @click="helpClick(node.nodeId,propertie.help)"
    >帮助</el-button>
    <br />
    <div v-if="node.type=='signTask'">
      <!-- 允许参考意见 -->
      <div class="form-inline">
        <el-tooltip class="item" effect="dark" content="选择否，则审批时不允许参考同环节其他会签人员的意见" placement="left">
          <div class="control-label left-label">
            <i class="el-icon-warning"></i>允许参考意见:
          </div>
        </el-tooltip>
        <div style="margin-top: 3px;">
        <ht-radio
          :options="[{key: true, value: '是' },{key: false, value: '否' }]"
          v-model="propertie.referOpinion"
        />
        </div>
      </div>
    </div>
    <!-- 允许发起人撤回 -->
    <div class="form-inline">
      <div class="control-label left-label">
        允许发起人撤回:
      </div>
      <div style="margin-top: 3px;">
        <ht-radio
          :options="[{key: true, value: '是' },{key: false, value: '否' }]"
          v-model="propertie.sponsorRevoke"
        />
      </div>
    </div>
    <!-- 允许本环节撤回 -->
    <div class="form-inline">
      <div class="control-label left-label">
        允许本环节撤回:
      </div>
      <div style="margin-top: 3px;">
        <ht-radio
          :options="[{key: true, value: '是' },{key: false, value: '否' }]"
          v-model="propertie.previousRevoke"
        />
      </div>
    </div>
    <!-- 允许批量处理 -->
    <div class="form-inline">
      <div class="control-label left-label">
        允许批量处理:
      </div>
      <div style="margin-top: 3px;">
        <ht-radio
          :options="[{key: true, value: '是' },{key: false, value: '否' }]"
          v-model="propertie.batchHandleRevoke"
        />
      </div>
    </div>
    <div v-if="node.type!='signTask'">
      <!-- 跳转类型 -->
      <div class="form-inline">
        <el-tooltip class="item" effect="dark" content="自由跳转优先级高于选择路径跳转" placement="left">
          <div class="control-label left-label">
            <i class="el-icon-warning"></i>跳转类型:
          </div>
        </el-tooltip>
        <ht-checkbox
          :options="[{key: 'free', value: '自由跳转' },{key: 'select', value: '选择路径跳转' }]"
          v-model="propertie.jumpType"
        />
        <br />
      </div>
      <!-- 选择处理人 -->
      <div class="form-inline">
        <el-tooltip class="item" effect="dark" content="自由选择优先级高于选择候选人" placement="left">
          <div class="control-label left-label">
            <i class="el-icon-warning"></i>选择处理人:
          </div>
        </el-tooltip>
        <ht-checkbox
          :options="[{key: 'free', value: '自由选择' },{key: 'candidate', value: '选择候选人' }]"
          v-model="propertie.choiceExcutor"
        />
        <br />
      </div>
    </div>
    <!-- 通知类型 -->
    <div class="form-inline">
      <div class="control-label left-label">通知类型:</div>
      <ht-checkbox style="width: 55%;" :options="defConfigData.nodeSetData.notifyType" v-model="propertie.notifyType" />
      <br />
    </div>
    <!-- 节点通知 -->
    <div>
      <div class="control-label left-label">消息通知：</div>
      <el-button size="small" @click="openMessage">设置</el-button>
    </div>
    <!-- 属性设置 -->
    <div class="form-inline">
      <div class="control-label left-label">属性设置:</div>
      <div>
        <el-checkbox v-if="node.type !='signTask'" v-model="propertie.skipExecutorEmpty">执行人为空跳过</el-checkbox>
        <el-checkbox v-model="propertie.allowSmsApproval">允许短信审批</el-checkbox>
        <el-checkbox
          v-if="defConfigData.initData.bpmDefinition.showUrgentState==1"
          v-model="propertie.allowEditUrgentState"
        >允许编辑紧急状态</el-checkbox>
        <br />
      </div>
      <!-- <ht-radio v-model="propertie.backMode"  :options='[{key: "normal", value: "驳回后按流程图执行" }]'/>
      <ht-radio v-model="propertie.backMode"  :options='[{key: "direct", value: "驳回后直接返回" }]' :readonly="node.type=='signTask'?true:false"/><br />-->
    </div>
    <!-- 填报属性 -->
    <div class="form-inline" style="margin-top: 5px;">
      <div class="control-label left-label">填报属性:</div>
      <div>
        <el-checkbox v-model="propertie.initFillData">初始化填报数据</el-checkbox>

        <br />
      </div>
    </div>

    <!-- 驳回处理人模式 -->
    <div class="form-inline" style="margin-top: 5px;">
      <div class="control-label left-label">驳回后处理人:</div>
      <div style="margin-top: 3px;">
        <ht-radio
          v-model="propertie.backUserMode"
          :options="[{key: 'history', value: '节点历史处理人' },{key: 'normal', value: '节点配置人' }]"
        />
      </div>
    </div>
    <!-- 驳回节点 -->
    <div class="form-inline">
      <el-tooltip
        class="item"
        effect="dark"
        content="不为空时只能驳回到此节点(设置的节点必须是可支持驳回的，不支持驳回的话，后台会自动过滤)"
        placement="left"
      >
        <div class="control-label left-label">
          <i class="el-icon-warning"></i>驳回节点:
        </div>
      </el-tooltip>
      <ht-select
        multiple
        v-model="propertie.backNode"
        :options="selectNodeList"
        :props="{key:'nodeId',value:'name'}"
      />
    </div>

    <!-- 前置处理器 -->
    <div class="form-inline">
      <el-tooltip
        class="item"
        effect="dark"
        content="流程任务前置处理器，eg：userService.add"
        placement="left"
      >
        <div class="control-label left-label">
          <i class="el-icon-warning"></i>前置处理器:
        </div>
      </el-tooltip>
      <ht-input
        v-model="propertie.prevHandler"
        @blur="checkHandler(propertie.prevHandler)"
        class="ht"
        placeholder="请输入前置处理器"
        autocomplete="off"
      ></ht-input>
      <br />
    </div>
    <!-- 后置处理器 -->
    <div class="form-inline" style="margin-bottom: 10px;">
      <el-tooltip
        class="item"
        effect="dark"
        content="流程任务后置处理器，eg：myService.sendMessage"
        placement="left"
      >
        <div class="control-label left-label">
          <i class="el-icon-warning"></i>后置处理器:
        </div>
      </el-tooltip>
      <ht-input
        v-model="propertie.postHandler"
        @blur="checkHandler(propertie.postHandler)"
        class="ht"
        placeholder="请输入后置处理器"
        autocomplete="off"
      ></ht-input>
      <br />
    </div>

    <div class="form-inline" style="margin-bottom: 10px;" v-if="boDefJson.length>0">
      <el-tooltip
              class="item"
              effect="dark"
              content="每个节点都可以配置 字段反填字段，可以从全局表单中选择一个字段作为反填对象"
              placement="left"
      >
        <div class="control-label left-label">
          <i class="el-icon-warning"></i>意见反填字段:
        </div>
      </el-tooltip>
      <el-select  
        desc="属性名称"  
        v-model="propertie.opinionField"
        filterable
        clearable
      >
        <el-option-group :label="fields.desc" v-for="fields in boDefJson" :key="fields.desc">
          <el-option v-show="!m.sub" :value="m.path+'.'+m.name" v-for="m in fields.children" :key="m.id" :label="m.desc"></el-option>
        </el-option-group>
      </el-select>
    </div>

    <div class="form-inline" style="margin-bottom: 10px;" v-if="boDefJson.length>0">
      <el-tooltip
              class="item"
              effect="dark"
              content="是否覆盖原来的值"
              placement="left"
      >
        <div class="control-label left-label">
          <i class="el-icon-warning"></i>审批意见覆盖:
        </div>
      </el-tooltip>
      <el-switch v-model="propertie.appendOpinion"> </el-switch>
      <br />
    </div>

    <div class="form-inline" style="margin-bottom: 10px;" v-if="boDefJson.length>0">
      <el-tooltip
              class="item"
              effect="dark"
              content="每个节点都可以配置签章反填字段（前提是所选字段在表单中必须是签章控件），可以从全局表单中选择一个字段作为反填对象（仅同意按钮生效）。"
              placement="left"
      >
        <div class="control-label left-label">
          <i class="el-icon-warning"></i>自动签章字段:
        </div>
      </el-tooltip>
      <el-select  
        desc="属性名称"  
        v-model="propertie.signatureField" 
        filterable 
        clearable
      >
        <el-option-group :label="fields.desc" v-for="fields in boDefJson" :key="fields.desc">
          <el-option v-show="!m.sub" :value="m.path+'.'+m.name" v-for="m in fields.children" :key="m.id" :label="m.desc"></el-option>
        </el-option-group>
      </el-select>
    </div>

    <!-- 自动签章覆盖 -->
    <div class="form-inline" style="margin-bottom: 10px;" v-if="boDefJson.length>0 &&　propertie.signatureField">
      <el-tooltip
              class="item"
              effect="dark"
              content="是否覆盖原来的值"
              placement="left"
      >
        <div class="control-label left-label">
          <i class="el-icon-warning"></i>自动签章覆盖:
        </div>
      </el-tooltip>
      <el-switch v-model="propertie.signatureCover"> </el-switch>
      <br />
    </div>

   

    <!-- 自动签章免密 -->
    <div class="form-inline" style="margin-bottom: 10px;" v-if="boDefJson.length>0 &&　propertie.signatureField">
      <el-tooltip
              class="item"
              effect="dark"
              content="自动签章时不需要密码验证"
              placement="left"
      >
        <div class="control-label left-label">
          <i class="el-icon-warning"></i>自动签章免密:
        </div>
      </el-tooltip>
      <el-switch v-model="propertie.secretFree"> </el-switch>
      <br />
    </div>
    

    <!-- 任务帮助提示 -->
    <FlowNodeHelp
      ref="flowNodeHelp"
      :nodeId="node.nodeId"
      :title="title"
      :value="value"
      @handle-save="handleHelpSave"
    ></FlowNodeHelp>
    <el-dialog
      :visible="messageVisible"
      title="节点通知设置"
      append-to-body
      :close-on-click-modal="false"
      :before-close="handleClose">
      <el-form v-form>
        <ht-form-item label="发送方式">
          <ht-input v-model="propertie.template" type="textarea"/>
          <el-button @click="$refs.eipMsgTemplateDialog.showDialog()">选择模板</el-button>
        </ht-form-item>
        <ht-form-item label="发送对象">
          <div>
            <span style="font-size: 14px;">手机号码：</span>
            <eip-bo-attr-selector
                append-to-body
                v-model="propertie.phone"
                :defId="defConfigData.curEditNode.defId"
                :prop="{children: 'children',label: 'comment'}"/><br>
          </div>
          <div style="margin: 10px 0 0 0">
            <span style="font-size: 14px">邮箱地址：</span>
            <eip-bo-attr-selector
                append-to-body
                v-model="propertie.email"
                :defId="defConfigData.curEditNode.defId"
                :prop="{children: 'children',label: 'comment'}"/><br>
          </div>

<!--          <el-checkbox v-model="checked">系统用户</el-checkbox><br>-->
        </ht-form-item>
        <ht-form-item label="发送时机">
          <el-radio-group v-model="propertie.sendType">
            <el-radio label="complete">任务完成时</el-radio>
            <el-radio label="create">任务产生时</el-radio>
<!--            <el-radio label="timing">定时发送</el-radio>-->
          </el-radio-group>
        </ht-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleCommit" size="medium">确 定</el-button>
        <el-button @click="messageVisible = false" size="medium">取 消</el-button>
    </span>
    </el-dialog>
    <eip-msg-template-dialog
        ref="eipMsgTemplateDialog"
        @onConfirm="templateConfirm"
        append-to-body/>
  </div>
</template>

<script>
import req from "@/request.js";
import { mapState, mapActions } from "vuex";
import { Message } from "element-ui";
const FlowNodeHelp = () => import("@/components/flow/FlowNodeHelp.vue");
const EipMsgTemplateDialog = () => import("@/components/dialog/EipMsgTemplateDialog.vue");
const EipBoAttrSelector = () => import("@/components/selector/EipBoAttrSelector.vue");
export default {
  name: "FlowNodeAttributes",
  components: {
    FlowNodeHelp,
    EipMsgTemplateDialog,
    EipBoAttrSelector
  },
  props: {
    //任务节点信息
    node: {
      type: Object,
      required: true
    },
    //节点属性批量勾选配置
    nodeAttr: {
      type: Object,
      required: true
    },
    //流程配置信息
    defConfigData: {
      type: Object,
      required: true
    },
    //全局表单bo字段
    boDefJson: {
      type: Array,
      default: ()=>{}
    }

  },
  watch: {
    propertie: {
      handler(newValue, oldValue) {
        let path =
          "nodeSetData.bpmDefSetting.nodePropertieMap." + this.node.nodeId;
        let obj = {};
        obj[path] = newValue;
        //更新vuex里面defConfigData配置数据
        this.$store.dispatch("flow/updateConfig", obj);
      },
      deep: true
    },
    nodePropertieMap: {
      handler(newValue, oldValue) {
        //更新vuex里面defConfigData配置数据
        this.$store.dispatch("flow/updateConfig", {
          "nodeSetData.bpmDefSetting.nodePropertieMap": newValue
        });
      },
      deep: true
    },
    nodeAttr: {
      handler(newValue, oldValue) {
        this.propertie.jumpType = newValue.jumpType; //批量勾选跳转类型
        this.propertie.notifyType = newValue.notify; //批量勾选通知类型
        if (newValue.backMode_all != "" && this.node.type != "signTask") {
          this.propertie.backMode = "direct"; //批量勾选驳回后返回
        } else {
          this.propertie.backMode = "normal";
        }
        if (newValue.skipExecutorEmpty_all != "") {
          this.propertie.skipExecutorEmpty = true; //批量勾选执行人为空时跳过
        } else {
          this.propertie.skipExecutorEmpty = false;
        }
      },
      deep: true
    }
  },
  data() {
    return {
      value: "", //帮助内容
      title: "", //帮助弹框标题
      approvalArea: [
        // { key: "approvalOpinion", value: "审批意见" },
        // { key: "zFile", value: "正文" },
        // { key: "file", value: "附件" },
        { key: "processRecord", value: "处理记录" }
        // { key: "imageBpm", value: "流程图" }
      ], //审批区域显示
      propertie: {

      }, //单个节点的配置信息
      selectNodeList: [], //可驳回的节点
      nodePropertieMap: {},
      messageVisible: false,
      checked:false
    };
  },
  methods: {
    //监听任务帮助对话框确认事件
    handleHelpSave(data) {
      if (this.title == "【全局任务节点】帮助提示") {
        this.nodePropertieMap = JSON.parse(
          JSON.stringify(
            this.defConfigData.nodeSetData.bpmDefSetting.nodePropertieMap
          )
        );
        for (let key in this.nodePropertieMap) {
          this.nodePropertieMap[key].helpGlobal = data; //获取全局任务节点任务帮助提示
        }
      } else {
        this.propertie.help = data; //获取单个任务节点任务帮助提示
      }
    },
    //点击帮助事件
    helpClick(nodeId, val) {
      let Base64 = require("js-base64").Base64;
      let name = "全局任务节点";
      if (nodeId != "") {
        name = "单个任务节点";
      }
      this.title = "【" + name + "】帮助提示";
      if (val != "") {
        this.value = Base64.decode(val, "utf-8"); //单个任务节点帮助内容
      } else {
        this.value = Base64.decode(this.propertie.helpGlobal); //全局任务节点帮助内容
      }
      setTimeout(() => {
        this.$refs.flowNodeHelp.showDialog(); //显示帮助富文本框
      });
    },
    //判断前置后置处理器是否存在
    checkHandler(handler) {
      debugger
      if (!handler) return;
      req
        .get("${bpmModel}/flow/node/v1/validHandler?handler=" + handler)
        .then(function(data) {
          data = data.data;
          if (data.result != "0") {
            Message.warning("接口" + handler + "有误，原因：" + data.msg);
          }
        });
    },
    //设置节点消息通知
    openMessage(){
      this.messageVisible = true;
    },
    handleClose(){
      this.messageVisible = false;
    },
    templateConfirm(data){
      this.$set(this.propertie,"template",data);
    },
    handleCommit(){
      this.messageVisible = false;
    }
  },
  mounted() {
    this.propertie = this.defConfigData.nodeSetData.bpmDefSetting.nodePropertieMap[
      this.node.nodeId
    ]; //获取单个节点的配置信息
    //获取可驳回节点
    for (let i = 0; i < this.defConfigData.nodeSetData.nodes.length; i++) {
      if (
        this.defConfigData.nodeSetData.nodes[i].type == "signTask" ||
        this.defConfigData.nodeSetData.nodes[i].type == "userTask" ||
        this.defConfigData.nodeSetData.nodes[i].type == "callActivity"
      ) {
        this.selectNodeList.push(this.defConfigData.nodeSetData.nodes[i]);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
>>> label.el-radio-horizontal {
  margin: 5px 10px 0 0;
}
>>> label.el-checkbox {
  margin: 5px 10px 0 0;
}
.ht {
  float: left;
  width: 70%;
}
.form-inline {
  float: left;
  width: 100%;
}
.left-label {
  width: 24%;
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
div >>> .box-card {
  margin-bottom: 20px;
}

div >>> .box-card .clearfix {
  padding-top: 20px;
}

div >>> .el-collapse-item__header {
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  font-weight: bold;
}

div >>> .el-button {
  padding: 7px;
  margin-right: 10px;
  margin-left: 0px !important;
}
</style>
