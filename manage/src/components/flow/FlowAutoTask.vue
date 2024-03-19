<template>
  <div class="form-inline">
    <label class="control-label">{{node.name}}({{node.nodeId}})</label>
    <el-button type="primary" size="mini" @click="editAutoService">设置自动任务</el-button>
    <br />
    <label
      v-if="JSON.stringify(autoTask)=='{}'"
      class="control-label"
      style="color:#dd6161;"
    >尚未配置自动任务</label>
    <div v-if="JSON.stringify(autoTask)!='{}' && autoTask.title=='消息节点'">
      <label class="control-label">自动消息节点：</label>
      <label
        style="display: block;text-align: left;"
        class="control-label"
      >{{autoTask.externalClass}}</label>
    </div>
    <div v-if="JSON.stringify(autoTask)!='{}' && autoTask.title=='脚本'">
      <label class="control-label">自动脚本节点：</label>
      <label style="display: block;text-align: left;" class="control-label">{{autoTask.script}}</label>
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
      <div style="width:100%;overflow: auto;">
        <div style="margin-bottom: 10px;">
          <el-button type="success" size="mini" @click="saveScript" icon="el-icon-check">保 存</el-button>
          <el-button type="danger" size="mini" @click="close" icon="el-icon-close">关 闭</el-button>
        </div>
        <el-tabs v-model="tabType" type="border-card"  :class="{'el-tab__hide-hedaer':isEdit}">
          <el-tab-pane label="消息任务" name="message" v-if="!isEdit || tabType=='message'">
            <el-form v-model="nodeMessage" data-vv-scope="settingSave">
              <table class="form-table" cellspacing="0" cellpadding="0" border="0">
                <tbody>
                  <tr>
                    <th width="130px">
                      <el-tooltip
                        class="item"
                        effect="dark"
                        content="该类必须实现IExternalData接口，程序会为你提供流程的一些信息<br>该实现类，通过已知流程信息，提供数据 map(String,Object)<br>系统会通过map中的key匹配文本消息中${key}的动态数据。"
                        placement="left-start"
                      >
                        <i class="el-icon-warning">外部数据类:</i>
                      </el-tooltip>
                    </th>
                    <td>
                      <ht-input
                        v-model="nodeMessage.externalClass"
                        class="ht"
                        placeholder="请输入外部数据类"
                        autocomplete="off"
                      ></ht-input>
                    </td>
                  </tr>
                </tbody>
              </table>
              <br />
              <el-tabs type="border-card">
                <el-tab-pane label="富文本消息">
                  <el-form v-model="nodeMessage" data-vv-scope="settingSave">
                    <table class="form-table" cellspacing="0" cellpadding="0" border="0">
                      <tbody>
                        <tr>
                          <th width="130px">通知类型:</th>
                          <td>
                            <MessageTypeSelector
                              class="ht_ce"
                              ref="messageTypeSelector"
                              v-model="nodeMessage.htmlSetting.msgType"
                            ></MessageTypeSelector>
                          </td>
                        </tr>
                        <tr>
                          <th width="130px">接收人配置:</th>
                          <td>
                            <table class="table table-bordered">
                              <thead>
                                <tr>
                                  <th width="50px">序号</th>
                                  <th>条件</th>
                                  <th width="120px">批次</th>
                                  <th width="80px">操作</th>
                                </tr>
                              </thead>
                              <tr
                                v-for="(userRule,$index) in nodeMessage.htmlSetting.ruleList"
                                :key="$index"
                              >
                                <td>{{$index+1}}</td>
                                <td>{{userRule.description}}</td>
                                <td>
                                  <ht-input
                                    v-model="userRule.groupNo"
                                    class="ht"
                                    placeholder="请输入批次"
                                    autocomplete="off"
                                  ></ht-input>
                                </td>
                                <td>
                                  <el-button
                                    size="mini"
                                    icon="el-icon-edit"
                                    @click="addUserCondition('htmlSetting',$index)"
                                  ></el-button>
                                  <el-button
                                    size="mini"
                                    icon="el-icon-delete"
                                    @click="deleteSetting(nodeMessage.htmlSetting.ruleList,$index)"
                                  ></el-button>
                                </td>
                              </tr>
                              <tr>
                                <td style="text-align: left;" colspan="4">
                                  <el-button
                                    size="mini"
                                    @click="addUserCondition('htmlSetting')"
                                  >新增人员规则</el-button>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <th width="130px">标题:</th>
                          <td>
                            <ht-input
                              v-model="nodeMessage.htmlSetting.subject"
                              class="ht"
                              placeholder="请输入标题"
                              autocomplete="off"
                            ></ht-input>
                          </td>
                        </tr>
                        <tr>
                          <th width="130px">文本内容:</th>
                          <td>
                            <vue-ueditor-wrap
                              v-model="nodeMessage.htmlSetting.content"
                              :config="myConfig"
                            ></vue-ueditor-wrap>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </el-form>
                </el-tab-pane>
                <el-tab-pane label="普通消息">
                  <el-form v-model="nodeMessage" data-vv-scope="settingSave">
                    <table class="form-table" cellspacing="0" cellpadding="0" border="0">
                      <tbody>
                        <tr>
                          <th width="130px">通知类型:</th>
                          <td>
                            <MessageTypeSelector
                              class="ht_ce"
                              ref="messageTypeSelector"
                              v-model="nodeMessage.plainTextSetting.msgType"
                            ></MessageTypeSelector>
                          </td>
                        </tr>
                        <tr>
                          <th width="130px">接收人配置:</th>
                          <td>
                            <table class="table table-bordered">
                              <thead>
                                <tr>
                                  <th width="50px">序号</th>
                                  <th>条件</th>
                                  <th width="120px">批次</th>
                                  <th width="80px">操作</th>
                                </tr>
                              </thead>
                              <tr
                                v-for="(userRule,$index) in nodeMessage.plainTextSetting.ruleList"
                                :key="$index"
                              >
                                <td>{{$index+1}}</td>
                                <td>{{userRule.description}}</td>
                                <td>
                                  <ht-input
                                    v-model="userRule.groupNo"
                                    class="ht"
                                    placeholder="请输入批次"
                                    autocomplete="off"
                                  ></ht-input>
                                </td>
                                <td>
                                  <el-button
                                    size="mini"
                                    icon="el-icon-edit"
                                    @click="addUserCondition('plainTextSetting',$index)"
                                  ></el-button>
                                  <el-button
                                    size="mini"
                                    icon="el-icon-delete"
                                    @click="deleteSetting(nodeMessage.plainTextSetting.ruleList,$index)"
                                  ></el-button>
                                </td>
                              </tr>
                              <tr>
                                <td style="text-align: left;" colspan="4">
                                  <el-button
                                    size="mini"
                                    @click="addUserCondition('plainTextSetting')"
                                  >新增人员规则</el-button>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <th width="130px">文本内容:</th>
                          <td>
                            <ht-input
                              type="textarea"
                              :rows="6"
                              class="ht"
                              v-model="nodeMessage.plainTextSetting.content"
                              placeholder="请输入文本内容"
                              autocomplete="off"
                            ></ht-input>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </el-form>
                </el-tab-pane>
              </el-tabs>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="脚本任务" name="scriptNode" v-if="!isEdit || tabType=='scriptNode'">
            <el-form v-model="scriptJson" data-vv-scope="scriptForm">
              <table class="form-table" cellspacing="0" cellpadding="0" border="0">
                <tbody>
                  <tr>
                    <th width="130px">脚本描述:</th>
                    <td>
                      <label>这个在脚本任务触发时执行，用户可以使用execution做操作。 例如设置流程变量:execution.setVariable("total", 100);</label>
                    </td>
                  </tr>
                  <tr>
                    <th width="130px">脚本内容:</th>
                    <td>
                      <!-- 常用脚本选择对话框  -->
                      <eip-script-dialog
                        ref="eipScriptDialogScript"
                        v-model="scriptJson.script"
                        append-to-body
                      />
                      <el-button @click="showDialog('eipScriptDialogScript')">常用脚本</el-button>
                      <!-- 条件脚本 -->
                      <el-button @click="showConditionBuild" size="small">条件脚本</el-button>
                      <!-- 可选变量对话框 -->
                      <FlowVarSelector :defId="node.defId" @node-click="varTreeOnConfirmScript" />
                      <br />
                      <br />
                      <ht-input
                        type="textarea"
                        :rows="15"
                        class="ht"
                        v-model="scriptJson.script"
                        placeholder="请输入脚本内容"
                        autocomplete="off"
                      ></ht-input>
                    </td>
                  </tr>
                </tbody>
              </table>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
      <!-- 条件脚本对话框 -->
      <FlowConditionBuildDialog
        @onConfirm="conditionDialogConfirm"
        :defId="node.defId"
        ref="flowConditionBuildDialog"
      />
      <!-- 人员配置选择器 -->
      <FlowNodeUserCondition
        @nodeUserConditionConfirm="nodeUserConditionConfirm"
        ref="flowNodeUserCondition"
      />
    </el-dialog>
  </div>
</template>

<script>
import req from "@/request.js";
import { mapState, mapActions } from "vuex";
import { Message } from "element-ui";
const eipScriptDialog = () => import("@/components/dialog/EipScriptDialog.vue");
const MessageTypeSelector = () =>
  import("@/components/flow/MessageTypeSelector.vue");
const FlowVarSelector = () => import("@/components/flow/FlowVarSelector.vue");
const FlowConditionBuildDialog = () =>
  import("@/components/flow/FlowConditionBuildDialog.vue");
const FlowNodeUserCondition = () =>
  import("@/components/flow/FlowNodeUserCondition.vue");
export default {
  name: "FlowNodeScript",
  components: {
    MessageTypeSelector,
    eipScriptDialog,
    FlowVarSelector,
    FlowConditionBuildDialog,
    FlowNodeUserCondition
  },
  props: {
    //任务节点信息
    node: {
      type: Object,
      required: true
    },
    //流程配置信息
    defConfigData: {
      type: Object,
      required: true
    },
    //脚本任务配置的信息
    autoTask: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      curEditSetting: "", //修改接收人配置的时候用于判断是修改富文本消息的还是修改普通消息的
      curEditRuleIndex: "", //下标，用于记录修改接收人配置的时候是哪条数据
      tabType: "message", //scriptNode:脚本任务，message：消息任务
      dialogVisibleSetting: false,
      titleSetting: "设置自动任务",
      scriptJson: { script: "" }, //初始化脚本任务信息
      nodeMessage: {
        htmlSetting: { msgType: "", content: "", ruleList: [] },
        plainTextSetting: { msgType: "", content: "", ruleList: [] }
      }, //初始化消息任务信息
      myConfig: {
        initialFrameHeight: 240,
        UEDITOR_HOME_URL: window.location.origin +'/'+ window.location.pathname.split('/')[1]+'/static/ueditor/',
        toolbars: [
          [
            // 'source', //源代码
            'undo', //撤销
            'bold', //加粗
            'indent', //首行缩进
            'italic', //斜体
            'underline', //下划线
            'strikethrough', //删除线
            'subscript', //下标
            'fontborder', //字符边框
            'superscript', //上标
            'formatmatch', //格式刷
            'forecolor',//字体颜色
            'justifyleft', //居左对齐
            'justifycenter', //居中对齐
            'justifyright', //居右对齐
            'justifyjustify', //两端对齐
            'fontfamily', //字体
            'fontsize', //字号
            'insertorderedlist', //有序列表
            'insertunorderedlist', //无序列表
            'lineheight',//行间距
            'inserttable', //插入表格
          ]
        ],
        // 初始容器宽度
        initialFrameWidth: "100%",
        zIndex:9999,
        enableAutoSave: false,
        readonly : false
      },
      isEdit: false //是否编辑自动任务节点
    };
  },
  methods: {
    //添加接收人配置选择（消息任务）
    addUserCondition(setting, index) {
      this.curEditSetting = setting;
      this.curEditRuleIndex = index;
      let conf = {};
      if (index != undefined) {
        let ruleList = this.nodeMessage[setting].ruleList;
        let userRule = ruleList[index];
        conf.userRule = JSON.parse(JSON.stringify(userRule));
      }
      conf = {
        ...conf,
        ...{
          nodeType: "signTask",
          nodeId: this.node.nodeId,
          defId: this.node.defId
        }
      };
      this.$refs.flowNodeUserCondition.showDialog(conf);
    },
    //获取接收人配置返回的值
    nodeUserConditionConfirm(res) {
      if (this.curEditRuleIndex != undefined) {
        this.nodeMessage[this.curEditSetting].ruleList.splice(
          this.curEditRuleIndex,
          1,
          res
        );
      } else {
        this.nodeMessage[this.curEditSetting].ruleList.push(res);
      }
      this.$forceUpdate();
    },
    //监听条件脚本确认事件(脚本任务)
    conditionDialogConfirm(data) {
      this.scriptJson.script = this.scriptJson.script + data;
    },
    //显示条件脚本对话框
    showConditionBuild() {
      this.$refs.flowConditionBuildDialog.showDialog();
    },
    //监督可选变量的返回值(脚本任务)
    varTreeOnConfirmScript(data) {
      this.scriptJson.script = this.scriptJson.script + data.pathValue;
    },
    //显示常用脚本
    showDialog(action) {
      this.$refs[action].showDialog();
    },
    //设置自动任务
    editAutoService() {
      let Base64 = require("js-base64").Base64;
      this.dialogVisibleSetting = true;
      //根据定义id和节点id查询该自动任务节点是否已经配置过
      let this_ = this;
      req
        .get(
          "${bpmModel}/flow/node/v1/autoTaskManager?defId=" +
            this.node.defId +
            "&nodeId=" +
            this.node.nodeId
        )
        .then(function(data) {
          data = data.data;
          if (data.bpmPluginContext) {
            this_.isEdit = true;
            this_.tabType = data.bpmPluginContext.type;
            if (this_.tabType == "message") {
              req
                .get(
                  "${bpmModel}/flow/node/v1/autoTaskPluginGet?defId=" +
                    this_.node.defId +
                    "&nodeId=" +
                    this_.node.nodeId +
                    "&pluginType=message"
                )
                .then(function(data) {
                  data = data.data;
                  if (data.bpmPluginDefJson) {
                    let val = Base64.decode(data.bpmPluginDefJson, "utf-8");
                    this_.nodeMessage = JSON.parse(val);
                  } else {
                    this_.nodeMessage = {
                      htmlSetting: { msgType: "", content: "", ruleList: [] },
                      plainTextSetting: {
                        msgType: "",
                        content: "",
                        ruleList: []
                      }
                    };
                  }
                });
            } else {
              req
                .get(
                  "${bpmModel}/flow/node/v1/autoTaskPluginGet?defId=" +
                    this_.node.defId +
                    "&nodeId=" +
                    this_.node.nodeId +
                    "&pluginType=scriptNode"
                )
                .then(function(data) {
                  data = data.data;
                  if (data.bpmPluginDefJson) {
                    let val = Base64.decode(data.bpmPluginDefJson, "utf-8");
                    this_.scriptJson = JSON.parse(val);
                  } else {
                    this_.scriptJson = { script: "" };
                  }
                });
            }
          } else {
            //第一次进入，默认初始化消息自动任务
            this_.tabType = "message";
            this_.nodeMessage = {
              htmlSetting: { msgType: "", content: "", ruleList: [] },
              plainTextSetting: { msgType: "", content: "", ruleList: [] }
            };
          }
        });
    },
    //保存自动任务
    saveScript() {
      const this_ = this;
      let formName  = this_.tabType == "message"?"settingSave" :"scriptForm";
      this_.$validator.validateAll(formName).then(result => {
        if (result) {
          if (!this_.isEdit) {
            this_.$confirm(
              "自动节点支持一种任务节点类型（脚本、消息等）， 保存所选择的任务类型后无法修改。",
              "提示",
              {
                cancelButtonText: "取消",
                confirmButtonText: "确定",
                type: "warning",
                closeOnClickModal: false
              }
            ).then(() => {
              this_.save();
            });
          } else {
            this_.save();
          }
        } else {
          let arr = this_.$validator.errors.items.filter(
            item => item.scope == "settingSave"
          );
          let errorLength = arr.length;
          this_.$message({
            showClose: true,
            message: `有${errorLength}个字段未通过校验，请正确填写表单内容。`,
            type: "warning"
          });
        }
      });
    },
    save() {
        let this_ = this;
      //消息任务
      if (this_.tabType == "message") {
        this_.nodeMessage.pluginType = "message";
        if (!this_.nodeMessage.htmlSetting) this_.nodeMessage.htmlSetting = {};
        let param = {
          defId: this_.node.defId,
          nodeId: this_.node.nodeId,
          jsonStr: JSON.stringify(this_.nodeMessage)
        };
        let isHtmlEmpt = false;
        if(!this_.nodeMessage.htmlSetting.content || !this_.nodeMessage.htmlSetting.msgType || !this_.nodeMessage.htmlSetting.subject ||
        !this_.nodeMessage.htmlSetting.ruleList || this_.nodeMessage.htmlSetting.ruleList.length == 0){
          isHtmlEmpt = true;
        }

        let isTextEmpt = false;
        if(!this_.nodeMessage.plainTextSetting.content || !this_.nodeMessage.plainTextSetting.msgType || 
        !this_.nodeMessage.plainTextSetting.ruleList || this_.nodeMessage.plainTextSetting.ruleList.length == 0){
          isTextEmpt = true;
        }

        if (isTextEmpt && isHtmlEmpt) {
          this.$message.error("富文本和普通消息至少要有一种配置完整，才能发送");
          return;
        }

        let url = "${bpmModel}/flow/node/v1/autoTaskPluginSave";
        req.post(url, param).then(function(data) {
          data = data.data;
          if (data.state) {
            this_.dialogVisibleSetting = false;
            let autoTask = {
              pluginType: "message",
              htmlSetting: this_.nodeMessage.htmlSetting,
              plainTextSetting: this_.nodeMessage.plainTextSetting,
              title: "消息节点",
              externalClass: this_.nodeMessage.externalClass
            };
            this_.$emit("update:autoTask", autoTask); //子组件更新父组件的值
            Message.success("消息任务配置成功");
          } else {
            Message.error(data.message);
          }
        });
      } else if (this_.tabType == "scriptNode") {
        //脚本任务
        this_.scriptJson.pluginType = "scriptNode";
        let param = {
          defId: this_.node.defId,
          nodeId: this_.node.nodeId,
          jsonStr: JSON.stringify(this_.scriptJson)
        };
        let url = "${bpmModel}/flow/node/v1/autoTaskPluginSave";
        req.post(url, param).then(function(data) {
          data = data.data;
          if (data.state) {
            this_.dialogVisibleSetting = false;
            let autoTask = {
              pluginType: "scriptNode",
              script: this_.scriptJson.script,
              title: "脚本"
            };
            this_.$emit("update:autoTask", autoTask); //子组件更新父组件的值
            Message.success("脚本任务配置成功");
          } else {
            Message.error(data.message);
          }
        });
      }
    },
    //关闭自动任务设置列弹框
    close() {
      this.dialogVisibleSetting = false;
    },
    //删除
    deleteSetting(list, index) {
      list.splice(index, 1);
    }
  },
  mounted() {
    this.$validator = this.$root.$validator;
  }
};
</script>

<style lang="scss" scoped>
div >>> .el-dialog__body {
  padding: 10px 20px;
  color: #606266;
  font-size: 14px;
  word-break: break-all;
}
.ht_ce {
  margin-top: -10px !important;
}
.div_list {
  height: 30px;
  background: #e2e2e2;
  line-height: 30px;
  font-weight: bold;
  padding-left: 10px;
  margin-bottom: 10px;
}
>>> label.el-checkbox {
  margin: 5px 10px 0 0;
}
.ht {
  width: 100%;
}
.form-inline {
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
.table > thead > tr > th,
.table > thead > th,
.table > tr > th,
.table > tfoot > tr > th,
.table > thead > tr > td,
.table > tr > td,
.table > tfoot > tr > td {
  border-top: 1px solid #e7eaec;
  border-left: 1px solid #e7eaec;
  line-height: 1.42857;
  padding: 4px 8px;
  vertical-align: middle;
  text-align: center;
}
.table {
  border-bottom: 1px solid #e7eaec;
  border-right: 1px solid #e7eaec;
  width: 100%;
  border-spacing: 0;
}
/deep/ .el-tab__hide-hedaer > .el-tabs__header{
  display: none;
}
</style>