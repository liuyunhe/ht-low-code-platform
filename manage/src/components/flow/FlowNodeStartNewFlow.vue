<template>
  <div class="form-inline">
    <label class="control-label">{{ node.name }}({{ node.nodeId }})</label>
    <el-button type="primary" size="mini" @click="editTaskReminder">设置</el-button>
    <br />
    <label v-if="!confList || confList.length == 0" class="control-label" style="color: #dd6161">尚未配置自动触发新流程程</label>
    <div v-if="confList && confList.length > 0">
      <label style="display: block; text-align: left" class="control-label" v-for="taskReminder in confList" :key="taskReminder.name">{{ taskReminder.name }}</label>
      <div class="control-label" style="text-align: right">查看更多信息请编辑</div>
      <br />
    </div>
    <el-dialog width="80%" top="8vh" :title="'【' + node.name + '】触发新流程设置'" :visible="dialogVisibleSetting" :before-close="close" :close-on-click-modal="false" append-to-body>
      <div style="width: 100%; height: 550px">
        <div style="width: 96%; float: left; height: 100%; overflow: auto">
          <div style="margin-bottom: 10px">
            <el-button type="success" size="mini" @click="addRemind" icon="el-icon-check">保 存</el-button>
            <el-button type="danger" size="mini" @click="clear" icon="el-icon-delete">清 空</el-button>
            <el-button type="danger" size="mini" @click="close" icon="el-icon-close">关 闭</el-button>
          </div>
          <el-form v-model="reminder" data-vv-scope="settingSave">
            <table class="form-table" cellspacing="0" cellpadding="0" border="0">
              <tbody>
                <tr>
                  <th width="110px" class="is-required">名称:</th>
                  <td>
                    <el-input v-model="reminder.name" placeholder="请输入配置名称" width="100%" />
                  </td>
                  <th width="110px" class="is-required">触发动作:</th>
                  <td>
                    <el-radio v-model="reminder.triggerAction" label="agree">同意</el-radio>
                    <el-radio v-model="reminder.triggerAction" label="reject">驳回</el-radio>
                    <el-radio v-model="reminder.triggerAction" label="oppose">反对</el-radio>
                  </td>
                </tr>

                <tr>
                  <th width="110px" class="is-required">选择流程:</th>
                  <td colspan="3">
                    <div @click="selectDef">
                      <el-input v-model="reminder.defName" placeholder="选择触发的新流程" validate="required" :readonly="true" />
                    </div>
                  </td>
                </tr>
                <tr>
                  <th width="110px" class="is-required">流程发起人:</th>
                  <td colspan="3">
                    <div @click="addUserCondition">
                      <el-input v-model="reminder.userRule.description" autosize type="textarea" placeholder="设置流程发起人" validate="required" :readonly="true" />
                    </div>
                  </td>
                </tr>

                <tr>
                  <th width="110px">对应字段:</th>
                  <td colspan="3" style="padding: 8px">
                    <el-button size="mini" icon="el-icon-plus" @click="addFormVarConf()">添加</el-button>
                    <table class="table table-bordered var-conf-table" style="width: 100%">
                      <thead>
                        <tr>
                          <th width="45%">主流程字段</th>
                          <th width="45%">新流程字段</th>
                          <th width="10%">操作</th>
                        </tr>
                      </thead>
                      <tr v-for="(userRule, userIndex) in reminder.formVarConf" :key="userIndex">
                        <td>
                          <FlowVarSelector type="3" :varData="flowVar" v-model="userRule.oldVar" />
                        </td>
                        <td>
                          <FlowVarSelector type="3" v-if="defVarMap[reminder.defKey]" :varData="defVarMap[reminder.defKey]" v-model="userRule.newVar" />
                        </td>
                        <td>
                          <el-button size="mini" icon="el-icon-delete" @click="reminder.formVarConf.splice(userIndex, 1)"></el-button>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </el-form>
        </div>
      </div>
    </el-dialog>
    <!-- 人员配置选择器 -->
    <FlowNodeUserCondition @nodeUserConditionConfirm="nodeUserConditionConfirm" ref="flowNodeUserCondition" />
    <eip-flow-dialog ref="eipFlowDialog" name="eipFlowDialog" @onConfirm="handleDialogSure" :single="true" append-to-body />
  </div>
</template>

<script>
import req from '@/request.js';
import { mapState, mapActions } from 'vuex';
import { Message } from 'element-ui';
const eipScriptDialog = () => import('@/components/dialog/EipScriptDialog.vue');
const FlowNodeUserCondition = () => import('@/components/flow/FlowNodeUserCondition.vue');
const eipFlowDialog = () => import('@/components/dialog/EipFlowDialog.vue');
const FlowVarSelector = () => import('@/components/flow/FlowVarSelector.vue');

export default {
  name: 'FlowStartConf',
  components: {
    eipScriptDialog,
    FlowNodeUserCondition,
    eipFlowDialog,
    FlowVarSelector,
  },
  props: {
    //任务节点信息
    node: {
      type: Object,
      required: true,
    },
    //流程配置信息
    defConfigData: {
      type: Object,
      required: true,
    },
    //所有的自动触发新流程的配置
    confList: {
      type: Array,
      required: true,
    },
    flowVar: {
      type: Array,
      required: false,
    },
  },
  data() {
    return {
      dialogVisibleSetting: false, //是否显示设置节点新流程触发设置侧边栏
      reminder: {
        name: '',
        triggerAction: 'agree',
        userRule: { description: '' },
        defName: '',
        defKey: '',
        formVarConf: [],
        isAdd: true,
      },
      isSave: false, //判断是否可以保存
      confListCopy: [], //复制一份最开始的新流程触发设置配置的信息
      defVarMap: {},
    };
  },
  watch: {
    'reminder.defKey': function (n, o) {
      if (n && !this.defVarMap[n]) {
        this.getNewDefVar();
      }
    },
  },
  methods: {
    getNewDefVar() {
      let me_ = this;
      req
        .post(window.context.bpmModel + '/flow/node/v1/varTree', {
          flowKey: this.reminder.defKey,
          nodeId: this.node.nodeId,
          includeBpmConstants: false,
          removeSub: true,
          bpmForm: true,
        })
        .then((response) => {
          me_.$set(me_.defVarMap, me_.reminder.defKey, response.data || []);
        });
    },
    handleDialogSure(data) {
      if ((data && data.length > 0 && this.reminder.defKey == data[0].defKey) || !this.reminder.defKey) {
        this.reminder.defName = data[0].name;
        this.reminder.defKey = data[0].defKey;
        return;
      }
      this.$confirm(`更换流程将会清空对应字段的配置,是否确定更换?`).then(() => {
        if (data && data.length > 0) {
          this.reminder.defName = data[0].name;
          this.reminder.defKey = data[0].defKey;
        } else {
          this.reminder.defName = '';
          this.reminder.defKey = '';
        }
        this.reminder.formVarConf = [];
      });
    },
    selectDef() {
      this.$refs.eipFlowDialog.showDialog();
    },
    addFormVarConf() {
      if (!this.reminder.defKey) {
        Message.warning('要先选择要触发的流程才能配置对应字段');
        return;
      }
      this.reminder.formVarConf.push({});
    },
    nodeUserConditionConfirm(res) {
      this.reminder.userRule = res;
    },
    //添加人员配置（办结抄送）
    addUserCondition() {
      let conf = {};
      if (this.reminder && this.reminder.userRule && this.reminder.userRule.description) {
        conf.userRule = JSON.parse(JSON.stringify(this.reminder.userRule));
      }
      conf = { ...conf, ...{ nodeType: '', nodeId: '', defId: this.defId } };
      this.$refs.flowNodeUserCondition.showDialog(conf);
    },
    //编辑触发新流程设置
    editTaskReminder() {
      this.confListCopy = JSON.parse(JSON.stringify(this.confList));
      this.confListCopy.forEach((conf) => {
        conf.formVarConf = conf.formVarConf ? JSON.parse(conf.formVarConf) : [];
        conf.userRule = conf.userRule ? JSON.parse(conf.userRule) : {};
      });
      if (this.confListCopy.length > 0) {
        this.reminder = this.confListCopy[0];
      } else {
        this.restConf();
      }
      this.isSave = true;
      this.dialogVisibleSetting = true;
    },
    //列表某一条数据时触发
    orgRowClick(row, column, event) {
      if (column.label != '操作') {
        row.formVarConf = row.formVarConf || [];
        row.userRule = row.userRule || { description: '' };
        row.startDef = row.startDef || {};
        this.reminder = row;
        this.isSave = true;
      }
    },
    //保存新流程触发设置
    saveRemind() {
      const this_ = this;
      //判断是否有新增的数据
      if (!this_.isSave) {
        Message.warning('请先新增新流程触发设置信息再保存');
        return;
      } else {
        let saveConf = JSON.parse(JSON.stringify(this_.confListCopy));
        //校验是否有必填字段没有填写
        for (let x = 0; x < saveConf.length; x++) {
          if (this.validateData(saveConf[x])) {
            this_.$message({
              showClose: true,
              message: '列表第' + (x + 1) + '行有字段未通过校验，请正确填写表单内容。',
              type: 'warning',
            });
            return;
          }
          saveConf[x].formVarConf = JSON.stringify(saveConf[x].formVarConf);
          saveConf[x].userRule = JSON.stringify(saveConf[x].userRule);
        }
        let remindersCopyJson = JSON.stringify(saveConf); //转json字符串
        req.post('${bpmModel}/flow/plugins/v1/startNewFlowSave?defId=' + this_.node.defId + '&nodeId=' + this_.node.nodeId, remindersCopyJson).then(function (data) {
          data = data.data;
          if (data.state) {
            Message.success('保存成功！');
            this_.$emit('update:confList', saveConf); //子组件更新父组件的值
            this_.restConf();
            this_.dialogVisibleSetting = false;
          } else {
            Message.error('新流程触发设置保存出现异常：' + data.message);
          }
        });
      }
    },
    validateData(data) {
      //新增数据
      let errMsg = [];
      if (!data.name) {
        errMsg.push('名称');
      }
      if (!data.defKey) {
        errMsg.push('新流程');
      }
      if (!data.userRule || !data.userRule.description) {
        errMsg.push('流程发起人');
      }
      return errMsg.join(',');
    },
    //新增新流程触发设置
    addRemind() {
      if (this.validateData(this.reminder)) {
        Message.warning(this.validateData(this.reminder) + '不能为空');
        return;
      }
      this.isSave = true;
      delete this.reminder.isAdd;
      this.confListCopy = [];
      this.confListCopy.push(this.reminder); //新增新流程触发设置基本信息、消息设置
      this.restConf();
      this.saveRemind();
    },
    clear() {
      this.$confirm(`是否确定清空该节点已有配置?`).then(() => {
        this.confListCopy = [];
        this.restConf();
        this.saveRemind();
      });
    },
    //关闭设置节点新流程触发设置列弹框
    close() {
      this.dialogVisibleSetting = false;
    },
    //删除新流程触发设置
    deleteSetting(list, index) {
      list.splice(index, 1);
      this.isSave = true;
      this.restConf();
    },
    //初始化设置
    restConf() {
      this.reminder = {
        name: '',
        triggerAction: 'agree',
        userRule: { description: '' },
        defName: '',
        defKey: '',
        formVarConf: [],
        isAdd: true,
      };
    },
  },
  mounted() {
    this.$validator = this.$root.$validator;
  },
};
</script>

<style lang="scss" scoped>
div >>> .el-dialog__body {
  padding: 10px 20px;
  color: #606266;
  font-size: 14px;
  word-break: break-all;
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

div >>> .el-button {
  padding: 7px;
  margin-right: 10px;
  margin-left: 0px !important;
}

.table {
  border-bottom: 1px solid #e7eaec;
  border-right: 1px solid #e7eaec;
}

.var-conf-table th,
.var-conf-table td {
  border-top: 1px solid #e7eaec;
  border-left: 1px solid #e7eaec;
  line-height: 1.4em;
  padding: 4px;
  vertical-align: middle;
  text-align: center;
}

.var-conf-table > thead > tr > th,
.var-conf-table > tbody > tr > th {
  background: #fafafa;
  height: 30px;
}

.table {
  border-bottom: 1px solid #e7eaec;
  border-right: 1px solid #e7eaec;
  border-collapse: collapse;
}
</style>
