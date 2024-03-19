<template>
  <div class="form-inline">
    <label class="control-label">{{node.name}}({{node.nodeId}})</label>
    <el-button type="primary" size="mini" @click="editTaskReminder">设置催办</el-button>
    <br />
    <label
      v-if="!reminders.reminderList || reminders.reminderList.length==0"
      class="control-label"
      style="color:#dd6161;"
    >尚未配置催办任务</label>
    <div v-if="reminders.reminderList && reminders.reminderList.length > 0">
      <label
        style="display: block;text-align: left;"
        class="control-label"
        v-for="taskReminder in reminders.reminderList"
        :key="taskReminder.name"
      >{{taskReminder.name}}</label>
      <div class="control-label" style="text-align: right;">查看更多信息请编辑</div>
      <br />
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
        <div style="width:65%;float: left;height:100%;overflow: auto;">
          <div style="margin-bottom: 10px;">
            <el-button type="primary" size="mini" @click="addRemind" icon="el-icon-right">新 增</el-button>
            <el-button type="success" size="mini" @click="saveRemind" icon="el-icon-check">保 存</el-button>
            <el-button type="danger" size="mini" @click="close" icon="el-icon-close">关 闭</el-button>
          </div>
          <el-form v-model="reminder" data-vv-scope="settingSave">
            <el-tabs v-model="tabType" type="border-card">
              <el-tab-pane label="催办基本信息" name="information">
                <table class="form-table" cellspacing="0" cellpadding="0" border="0">
                  <tbody>
                    <tr>
                      <th width="130px" class="is-required">催办名称:</th>
                      <td colspan="3">
                        <ht-input
                          v-model="reminder.name"
                          placeholder="请输入催办名称"
                          autocomplete="off"
                          validate="required"
                          style="width: 400px"
                        ></ht-input>
                      </td>
                    </tr>
                    <tr>
                      <th width="130px">
                        <el-tooltip content="脚本取值格式为{表单名}.data.{字段名}" placement="top">
                          <i class="el-icon-info"></i>
                        </el-tooltip>
                        日期类型:
                      </th>
                      <td colspan="3">
                        <ht-select v-model="reminder.dateScriptType" :options="options"/>
                        <flow-var-selector
                          :defId="node.defId"
                          @node-click="varTreeOnConfirm($event, 'typeScript')"
                          :removeSub="true"
                          :includeBpmConstants="false"
                          v-if="reminder.dateScriptType==='2'"
                        />
                        <codemirror
                            v-model="reminder.typeScript"
                            :options="cmOptions"
                            v-if="reminder.dateScriptType==='2'"/>
                        <ht-select
                          v-else
                          v-model="reminder.dateType"
                          :options="[{key:'caltime',value:'日历日'},{key: 'worktime',value:'工作日'}]"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th width="130px" class="is-required">相对节点:</th>
                      <td>
                        <ht-select
                          clearable
                          v-model="reminder.relNodeId"
                          :options="nodeList"
                          :props="{key:'nodeId',value:'name'}"
                          validate="required"
                        />
                      </td>
                      <th width="130px">节点事件:</th>
                      <td>
                        <ht-select
                          clearable
                          v-model="reminder.relNodeEvent"
                          :options="[{key:'create',value:'创建'},{key:'complete',value:'完成'}]"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th width="140px" class="is-required">
                        <el-tooltip content="脚本取值格式为{表单名}.data.{字段名}" placement="top">
                          <i class="el-icon-info"></i>
                        </el-tooltip>
                        相对到期时间:
                      </th>
                      <td colspan="3">
                        <ht-select v-model="reminder.durationType" :options="options"/>
                        <flow-var-selector
                                :defId="node.defId"
                                @node-click="varTreeOnConfirm($event, 'durationScript')"
                                :removeSub="true"
                                :includeBpmConstants="false"
                                v-if="reminder.durationType==='2'"
                        />
                        <codemirror
                            v-model="reminder.durationScript"
                            :options="cmOptions"
                            v-if="reminder.durationType==='2'"/>

                        <template v-else>
                          <ht-duration v-model="reminder.dueTime" validate="required" v-if="reminder.dateType === 'caltime'"/>
                          <template v-if="reminder.dateType === 'worktime'">
                          <ht-input type="number" v-model="reminder.dueTime" />分钟
                          </template>
                        </template>
                      </td>
                    </tr>
                    <tr>
                      <th width="130px">到期动作:</th>
                      <td colspan="3">
                        <ht-select
                          clearable
                          v-model="reminder.dueAction"
                          :options="[{key:'no-action',value:'无动作'},{key:'auto-next',value:'执行同意操作'},{key:'end-process',value:'结束该流程'},{key:'call-method',value:'调用指定方法'}]"
                        />
                      </td>
                    </tr>
                    <tr v-if="reminder.dueAction=='call-method'">
                      <th width="130px">执行脚本:</th>
                      <td colspan="3">
                        <!-- 常用脚本选择对话框  -->
                        <el-button @click="showDialog('eipScriptDialogDueScript')">常用脚本</el-button>
                        <eip-script-dialog
                          ref="eipScriptDialogDueScript"
                          v-model="reminder.dueScript"
                          append-to-body
                        />
                        <br />
                        <ht-input
                          type="textarea"
                          :rows="5"
                          v-model="reminder.dueScript"
                          placeholder="请输入执行脚本"
                          autocomplete="off"
                          class="ht_tr"
                        ></ht-input>
                      </td>
                    </tr>
                    <tr>
                      <th width="130px">
                        <el-tooltip
                          class="item"
                          effect="dark"
                          content="return true,则执行该条催办；return false,表示不执行该催办。如果表达式为空，将视为返回true。"
                          placement="left-start"
                        >
                          <i class="el-icon-warning">条件表达式:</i>
                        </el-tooltip>
                      </th>
                      <td colspan="3">
                        <!-- 常用脚本选择对话框  -->
                        <el-button @click="showDialog('eipScriptDialogCondition')">常用脚本</el-button>
                        <eip-script-dialog
                          ref="eipScriptDialogCondition"
                          v-model="reminder.condition"
                          append-to-body
                        />
                        <br />
                        <ht-input
                          type="textarea"
                          :rows="5"
                          class="ht_tr"
                          v-model="reminder.condition"
                          placeholder="请输入条件表达式"
                          autocomplete="off"
                        ></ht-input>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </el-tab-pane>
              <el-tab-pane label="消息设置" name="news">
                <table class="form-table" cellspacing="0" cellpadding="0" border="0">
                  <tbody>
                    <tr>
                      <th width="130px">催办类型:</th>
                      <td>
                        <el-checkbox class="ht_ce" v-model="reminder.isSendMsg">催办期间定时发送消息</el-checkbox>
                        <el-checkbox
                          v-if="reminder.isSendMsg"
                          class="ht_ce"
                          v-model="reminder.sendPerson"
                        >催办秘书</el-checkbox>
                      </td>
                    </tr>
                    <tr v-if="reminder.isSendMsg">
                      <th width="130px" class="is-required">发送相对时间:</th>
                      <td>
                        <ht-select v-model="reminder.relTimeType" :options="options"/>
                        <codemirror
                            v-model="reminder.relTimeScript"
                            :options="cmOptions"
                            v-if="reminder.relTimeType==='2'"/>
                          <template v-else>
                            <ht-duration v-model="reminder.msgSendTime" validate="required" v-if="reminder.dateType === 'caltime'"/>
                            <template v-if="reminder.dateType === 'worktime'" ><ht-input type="number" v-model="reminder.msgSendTime" />分钟</template>
                          </template>
                        <!-- <ht-duration v-model="reminder.msgSendTime" validate="required" /> -->
                      </td>
                    </tr>
                    <tr v-if="reminder.isSendMsg">
                      <th width="130px" class="is-required">发送信息次数:</th>
                      <td>
                        <ht-select
                          clearable
                          v-model="reminder.msgCount"
                          :options="[{key:'1',value:'1次'},{key:'2',value:'2次'},{key:'3',value:'3次'},{key:'4',value:'4次'},{key:'5',value:'5次'},
                              {key:'6',value:'6次'},{key:'7',value:'7次'},{key:'8',value:'8次'},{key:'9',value:'9次'},{key:'10',value:'10次'}]"
                          validate="required"
                        />
                      </td>
                    </tr>
                    <tr v-if="reminder.isSendMsg">
                      <th width="130px" class="is-required">发送消息间隔:</th>
                      <td>
                        <ht-duration v-model="reminder.msgInterval" validate="required" />
                      </td>
                    </tr>
                    <tr v-if="reminder.isSendMsg">
                      <th width="130px">消息类型:</th>
                      <td>
                        <MessageTypeSelector
                          class="ht_ce"
                          ref="messageTypeSelector"
                          v-model="reminder.msgType"
                        ></MessageTypeSelector>
                      </td>
                    </tr>
                    <tr v-if="reminder.isSendMsg">
                      <th width="130px">富文本模板:</th>
                      <td>
                        <vue-ueditor-wrap v-model="reminder.htmlMsg" :config="myConfig"></vue-ueditor-wrap>
                      </td>
                    </tr>
                    <tr v-if="reminder.isSendMsg">
                      <th width="130px">普通文本内容:</th>
                      <td>
                        <ht-input
                          type="textarea"
                          :rows="5"
                          class="ht_tr"
                          v-model="reminder.plainMsg"
                          placeholder="请输入普通文本内容"
                          autocomplete="off"
                        ></ht-input>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </el-tab-pane>
            </el-tabs>
          </el-form>
        </div>
        <div style="float: left;width:31%;margin-left: 10px;height:100%;overflow: auto;">
          <div class="div_list">催办列表</div>
          <el-table
            :data="remindersCopy.reminderList"
            border
            ref="htTableSetting"
            @row-click="orgRowClick"
          >
            <el-table-column prop="name" label="催办名称" />
            <el-table-column label="操作" width="90">
              <template v-slot="{$index}">
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteSetting(remindersCopy.reminderList,$index)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import req from "@/request.js";
import { mapState, mapActions } from "vuex";
import { Message } from "element-ui";
const eipScriptDialog = () => import("@/components/dialog/EipScriptDialog.vue");
const MessageTypeSelector = () => import("@/components/flow/MessageTypeSelector.vue");
const FlowVarSelector = () => import("@/components/flow/FlowVarSelector.vue");
export default {
  name: "FlowNodeRemind",
  components: { MessageTypeSelector, eipScriptDialog, FlowVarSelector },
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
    //催办配置的信息
    reminders: {
      type: Object,
      required: true
    },
    //流程所有节点
    nodeList: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      tabType: "information", //催办设置 information：催办基本信息，news：消息设置
      titleSetting: "设置催办", //某个节点催办的标题
      dialogVisibleSetting: false, //是否显示设置节点催办侧边栏
      reminder: {
        dateType: "caltime",
        relNodeEvent: "create",
        dueAction: "no-action",
        msgType: "",
        relNodeId: "",
        isAdd: true,
        isSendMsg: false,
        dueTime: 0,
        durationType: 1,
        relTimeType: 1,
        dateScriptType: 1
      }, //初始化催办基本信息、消息设置
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
      isSave: false, //判断是否可以保存
      remindersCopy: [], //复制一份最开始的催办配置的信息
      cmOptions: {
        value: "",
        mode: "groovy",
        readOnly: false,
        smartIndent:true,
        tabSize: 1,
        theme: 'base16-light',
        lineNumbers: true,
        line: true,
        autoRefresh: true
      },
      options: [{key:'1', value:'常规'},{key: '2', value:'脚本'}]
    };
  },
  methods: {
    //显示常用脚本
    showDialog(action) {
      this.$refs[action].showDialog();
    },
    //设置催办
    editTaskReminder() {
      this.remindersCopy = JSON.parse(JSON.stringify(this.reminders));
      this.isSave = false;
      this.dialogVisibleSetting = true;
      this.reminder = {
        dateType: "caltime",
        relNodeEvent: "create",
        dueAction: "no-action",
        msgType: "",
        relNodeId: "",
        isAdd: true,
        isSendMsg: false,
        dueTime: 0,
        durationType: '1',
        relTimeType: '1',
        dateScriptType: '1'
      }; //初始化催办基本信息、消息设置
    },
    //点击催办列表某一条数据时触发
    orgRowClick(row, column, event) {
      if (column.label != "操作") {
        //判断催办秘书是否选中 1：选中，2：未选中
        if (row.sendPerson == "1") {
          row.sendPerson = true;
        } else {
          row.sendPerson = false;
        }
        this.reminder = row;
        this.isSave = true;
      }
    },
    //保存催办
    saveRemind() {
      const this_ = this;
      //判断是否有新增的数据
      if (!this_.isSave) {
        Message.warning("请先新增催办信息再保存");
        return;
      } else {
        //校验是否有必填字段没有填写
        for (let x = 0; x < this_.remindersCopy.reminderList.length; x++) {
          if (
            !this_.remindersCopy.reminderList[x].name ||
            !this_.remindersCopy.reminderList[x].relNodeId ||
            !this_.remindersCopy.reminderList[x].dueTime ||
            (this_.remindersCopy.reminderList[x].isSendMsg &&
              (!this_.remindersCopy.reminderList[x].msgSendTime ||
                !this_.remindersCopy.reminderList[x].msgCount ||
                !this_.remindersCopy.reminderList[x].msgInterval))
          ) {
            this_.$message({
              showClose: true,
              message:
                "催办列表第" + (x+1) + "行有字段未通过校验，请正确填写表单内容。",
              type: "warning",
            });
            return;
          }
        }
        let remindersCopyJson = JSON.stringify(this_.remindersCopy); //转json字符串
        req
          .post(
            "${bpmModel}/flow/plugins/v1/remindersSave?defId=" +
              this_.node.defId +
              "&nodeId=" +
              this_.node.nodeId,
            remindersCopyJson
          )
          .then(function(data) {
            data = data.data;
            if (data.state) {
              Message.success(
                this_.remindersCopy.reminderList.length +
                  "条催办，已经保存成功！"
              );
              this_.$emit("update:reminders", this_.remindersCopy); //子组件更新父组件的值
              this_.reminder = {
                dateType: "caltime",
                relNodeEvent: "create",
                dueAction: "no-action",
                msgType: "",
                relNodeId: "",
                isAdd: true,
                isSendMsg: false,
                dueTime: 0
              }; //初始化催办基本信息、消息设置
              this_.dialogVisibleSetting = false;
            } else {
              Message.error("催办保存出现异常：" + data.message);
            }
          });
      }
    },
    //新增催办
    addRemind() {
      const this_ = this;
      this_.$validator.validateAll("settingSave").then(result => {
        if (result) {
             if (this_.reminder.dueTime == 0) {
            this_.$message({
              showClose: true,
              message: `相对到期时间不能小于1分钟`,
              type: "warning",
            });
            return;
          }
          if(this_.reminder.isSendMsg && (!this_.reminder.msgSendTime ||this_.reminder.msgSendTime ==0)){
             this_.$message({
              showClose: true,
              message: `发送相对时间不能小于1分钟`,
              type: "warning",
            });
            return;
          }
          //判断条件
          if (
            this_.reminder.relNodeId == this_.node.nodeId &&
            this_.reminder.relNodeEvent == "complete"
          ) {
            Message.warning("无法设置本节点完成后执行催办操作");
            return;
          }
          if (this_.reminder.isSendMsg && !this_.reminder.msgType) {
            Message.warning("请选择消息类型");
            return;
          }

          if (this_.reminder.isSendMsg && !this_.reminder.htmlMsg && !this_.reminder.plainMsg) {
            Message.warning("请输入消息内容");
            return;
          }

          //新增数据
          if (this_.reminder.isAdd) {
            this_.isSave = true;
            delete this_.reminder.isAdd;
            if (!this_.remindersCopy.reminderList)
              this_.remindersCopy.reminderList = [];
            this_.remindersCopy.reminderList.push(this.reminder); //新增催办基本信息、消息设置
            this_.reminder = {
              dateType: "caltime",
              relNodeEvent: "create",
              dueAction: "no-action",
              msgType: "",
              relNodeId: "",
              isAdd: true,
              isSendMsg: false,
              dueTime: 0
            }; //初始化催办基本信息、消息设置
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
    //关闭设置节点催办列弹框
    close() {
      this.dialogVisibleSetting = false;
    },
    //删除催办
    deleteSetting(list, index) {
      list.splice(index, 1);
      this.isSave = true;
      this.reminder = {
        dateType: "caltime",
        relNodeEvent: "create",
        dueAction: "no-action",
        msgType: "",
        relNodeId: "",
        isAdd: true,
        isSendMsg: false,
        dueTime: 0
      }; //初始化催办基本信息、消息设置
    },
    varTreeOnConfirm(node, type) {
      console.info(node)
      let method = "";
      if (node.dataType==='number')
        method = ".asDouble()";
      else
        method = '.asText()';
      this.reminder[type] = this.reminder[type] || "";
      this.$set(this.reminder, type, this.reminder[type] + node.path+".data."+node.name+method);
      this.$forceUpdate();
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
.ht_tr {
  width: 100%;
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
  width: 300px;
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
>>>.CodeMirror {
  height: 200px;
  // width: 500px;
}
</style>
