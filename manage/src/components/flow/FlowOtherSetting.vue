<template>
  <div class="flowOther-height">
    <el-card class="other-set__card" shadow="never">
      <div slot="header">
        <el-button size="mini" type="primary" icon="el-icon-check" @click="save"
          >保存</el-button
        >
      </div>
      <el-scrollbar class="scrollbar-fullheight">
        <table
          class="form-table other-set__table"
          cellspacing="0"
          cellpadding="0"
          border="0"
        >
          <tbody>
            <tr>
              <th>标题规则:</th>
              <td>
                <FlowVarSelector
                  type="1"
                  :defId="defId"
                  @node-click="subjectRuleConfirm"
                />
                <el-tooltip
                  class="item"
                  effect="dark"
                  content='脚本配置是为了满足用户自定义动态标题的需求，用法示例：{描述:Groovy脚本}，表单变量取值：bxsqb.getString("sqr")；流程变量取值：{标题变量:varTitile==null||varTitile==""?"没值":varTitile}'
                  placement="right"
                >
                  <span class="control-label left-label"
                    >脚本配置说明
                    <i class="el-icon-warning"></i>
                  </span>
                </el-tooltip>
                <br />
                <br />
                <ht-input
                  type="textarea"
                  style="width: 100%"
                  v-model="prop.subjectRule"
                  autocomplete="off"
                  :rows="6"
                  :showWordLimit="true"
                  :maxlength="600"
                ></ht-input>
              </td>
            </tr>
            <tr>
              <th>流程描述:</th>
              <td>
                <ht-input
                  type="textarea"
                  style="width: 100%"
                  v-model="prop.description"
                  autocomplete="off"
                  :showWordLimit="true"
                  :maxlength="200"
                ></ht-input>
              </td>
            </tr>
            <tr>
              <th>通知类型:</th>
              <td>
                <ht-checkbox
                  v-model="prop.notifyType"
                  :options="handlerTypes"
                />
              </td>
            </tr>
            <tr>
              <th>测试通知类型:</th>
              <td>
                <ht-checkbox
                  v-model="prop.testNotifyType"
                  :options="handlerTypes"
                />
              </td>
            </tr>
            <tr>
              <th>参数设置:</th>
              <td>
                <el-checkbox
                  v-model="prop.skipFirstNode"
                  :disabled="prop.firstNodeUserAssign"
                  >跳过第一个节点</el-checkbox
                >
                <el-checkbox v-model="prop.allowTransTo"
                  >任务允许转办</el-checkbox
                >
                <el-checkbox v-model="prop.allowExecutorEmpty"
                  >允许执行人为空</el-checkbox
                >
                <el-checkbox v-model="prop.testStatus">是否正式</el-checkbox>
                <el-checkbox v-model="prop.showUrgentState"
                  >显示紧急状态</el-checkbox
                >
                <el-checkbox v-model="prop.readRevoke"
                  >允许已阅撤回</el-checkbox
                >
                <el-checkbox v-model="prop.showModifyRecord"
                  >显示表单留痕</el-checkbox
                >
              </td>
            </tr>
            <tr>
              <th>跳过类型:</th>
              <td>
                <ht-checkbox
                  v-model="prop.skipRules"
                  :options="skipConditionList"
                />
              </td>
            </tr>
            <tr>
              <th>办结抄送:</th>
              <td>
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="如果允许流程结束时抄送给某批人，则需要进行设置。"
                  placement="right"
                >
                  <span class="control-label left-label">
                    <el-button type="primary" @click="setEndNotify"
                      >设置</el-button
                    >
                    <i class="el-icon-warning"></i>
                  </span>
                </el-tooltip>
              </td>
            </tr>
            <tr>
              <th>人工催办内容模板:</th>
              <td>
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="如果人工催办的催办内容需用到邮件模板，则需要进行设置。"
                  placement="right"
                >
                  <span class="control-label left-label">
                    <el-button type="success" @click="urgentMailTelClick"
                      >邮件模板设置</el-button
                    >
                    <i class="el-icon-warning" style="margin-right: 10px"></i>
                  </span>
                </el-tooltip>
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="如果人工催办的催办内容需用到短信模板，则需要进行设置。"
                  placement="right"
                >
                  <span class="control-label left-label">
                    <el-button type="warning" @click="urgentSmsTelClick"
                      >短信模板设置</el-button
                    >
                    <i class="el-icon-warning"></i>
                  </span>
                </el-tooltip>
              </td>
            </tr>
            <tr>
              <th>状态:</th>
              <td>
                <el-radio
                  v-model="prop.status"
                  v-for="item in statusArr"
                  :key="item.key"
                  :label="item.key"
                  style="margin-right: 10px"
                >
                  <el-tooltip
                    class="item"
                    effect="dark"
                    :content="item.title"
                    placement="right"
                  >
                    <span
                      class="control-label left-label"
                      style="font-size: 14px"
                    >
                      {{ item.value }}
                      <i class="el-icon-warning"></i>
                    </span>
                  </el-tooltip>
                </el-radio>
              </td>
            </tr>
            <tr>
              <th>
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="外部子流程取主流程的设置参数。"
                  placement="right"
                >
                  <div class="control-label left-label">
                    任务审批时表单版本
                    <i class="el-icon-warning"></i>:
                  </div>
                </el-tooltip>
              </th>
              <td>
                <!-- <ht-radio v-model="prop.useMainForm"  :options="useMainFormArr" /> -->
                <el-radio
                  v-model="prop.useMainForm"
                  v-for="item in useMainFormArr"
                  :key="item.key"
                  :label="item.key"
                  style="margin-right: 10px"
                >
                  <el-tooltip
                    class="item"
                    effect="dark"
                    :content="item.title"
                    placement="right"
                  >
                    <span
                      class="control-label left-label"
                      style="font-size: 14px"
                    >
                      {{ item.value }}
                      <i class="el-icon-warning"></i>
                    </span>
                  </el-tooltip>
                </el-radio>
              </td>
            </tr>
            <tr>
              <th>查看已办数据版本:</th>
              <td>
                <el-radio-group v-model="prop.doneDataVersion">
                  <el-radio label="history">历史版本</el-radio>
                  <el-radio label="latest">最新版本</el-radio>
                </el-radio-group>
              </td>
            </tr>
            <tr>
              <th>自动发起流程:</th>
              <td>
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="设置流程自动发起的发起人，表单数据和发起时机。"
                  placement="right"
                >
                  <span class="control-label left-label">
                    <el-button
                      type="primary"
                      @click="$refs.flowAutoStartSetting.show()"
                      >设置</el-button
                    >
                    <i class="el-icon-warning"></i>
                  </span>
                </el-tooltip>
              </td>
            </tr>
            <tr>
              <th>
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="范围选择不能为空"
                  placement="right"
                >
                  <div class="control-label left-label">
                    审批历史查看范围
                    <i class="el-icon-warning"></i>:
                  </div>
                </el-tooltip>
              </th>
              <td>
                <span>审批人：</span>
                <el-select
                  v-model="checkLimit"
                  multiple
                  placeholder="请选择"
                  style="width: 270px"
                >
                  <el-option
                    v-for="item in checkOpnionLimits"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
                <span>发起人：</span>
                <el-select
                  v-model="startLimit"
                  multiple
                  placeholder="请选择"
                  style="width: 270px"
                >
                  <el-option
                    v-for="item in checkOpnionLimits"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </td>
            </tr>
          </tbody>
        </table>
      </el-scrollbar>
    </el-card>

    <el-dialog
      title="办结抄送设置"
      :visible.sync="dialogEndNotifyVisible"
      append-to-body
      class="urgent-text"
      :close-on-click-modal="false"
    >
      <div style="margin-bottom: 10px">
        <el-button
          type="primary"
          size="mini"
          @click="addLine"
          icon="el-icon-plus"
          >新 增</el-button
        >
      </div>
      <el-form data-vv-scope="settingSave">
        <el-table :data="procNotifyList" border ref="htTableSetting">
          <el-table-column label="人员配置">
            <template v-slot="{row, $index}">
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th width="50px">序号</th>
                    <th>条件</th>
                    <th width="130px">批次</th>
                    <th width="120px">操作</th>
                  </tr>
                </thead>
                <tr
                  v-for="(userRule, userIndex) in row.userAssignRules"
                  :key="userIndex"
                >
                  <td>{{ userIndex + 1 }}</td>
                  <td>{{ userRule.description }}</td>
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
                      @click="addUserCondition($index, userIndex)"
                    ></el-button>
                    <el-button
                      size="mini"
                      icon="el-icon-delete"
                      @click="deleteSetting(row.userAssignRules, userIndex)"
                    ></el-button>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: left" colspan="4">
                    <el-button size="mini" @click="addUserCondition($index)"
                      >新增人员规则</el-button
                    >
                  </td>
                </tr>
              </table>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250">
            <template v-slot="{row, $index}">
              <MessageTypeSelector
                class="ht_ce"
                ref="messageTypeSelector"
                v-model="row.msgTypes"
              ></MessageTypeSelector>
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="deleteSetting(procNotifyList, $index)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveEndNotify">确 定</el-button>
        <el-button @click="dialogEndNotifyVisible = false">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="邮件模板设置"
      :visible.sync="dialogUrgentMailTelVisible"
      append-to-body
      class="urgent-text"
      :close-on-click-modal="false"
    >
      <FlowVarSelector
        type="1"
        :defId="defId"
        @node-click="urgentMailTelConfirm"
      />
      <br />
      <br />
      <ht-input
        type="textarea"
        :rows="8"
        v-model="urgentMailTel"
        autocomplete="off"
      ></ht-input>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          @click="
            dialogUrgentMailTelVisible = false
            prop.urgentMailTel = urgentMailTel
          "
          >确 定</el-button
        >
        <el-button
          @click="
            dialogUrgentMailTelVisible = false
            urgentMailTel = ''
          "
          >取 消</el-button
        >
      </div>
    </el-dialog>

    <el-dialog
      title="短信模板设置"
      :visible.sync="dialogUrgentSmsTelVisible"
      append-to-body
      class="urgent-text"
      :close-on-click-modal="false"
    >
      <FlowVarSelector
        type="1"
        :defId="defId"
        @node-click="urgentSmsTelConfirm"
      />
      <br />
      <br />
      <ht-input
        type="textarea"
        :rows="8"
        v-model="urgentSmsTel"
        autocomplete="off"
      ></ht-input>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          @click="
            dialogUrgentSmsTelVisible = false
            prop.urgentSmsTel = urgentSmsTel
          "
          >确 定</el-button
        >
        <el-button
          @click="
            dialogUrgentSmsTelVisible = false
            urgentSmsTel = ''
          "
          >取 消</el-button
        >
      </div>
    </el-dialog>

    <!-- 加载其他设置数据 -->
    <ht-load-data
      :url="loadDataUrl"
      context="bpmModel"
      @after-load-data="afterLoadData"
    ></ht-load-data>
    <!-- 人员配置选择器 -->
    <FlowNodeUserCondition
      @nodeUserConditionConfirm="nodeUserConditionConfirm"
      ref="flowNodeUserCondition"
    />
    <FlowAutoStartSetting :defId="defId" ref="flowAutoStartSetting" />
  </div>
</template>

<script>
import flow from '@/api/flow.js'
import req from '@/request.js'

const statusOptions = [
  {key: 'deploy', value: '已发布', title: '可以发起和审批。'},
  {key: 'forbidden', value: '禁止', title: '禁止发起,已发起的可以继续审批。'},
  {key: 'forbidden_instance', value: '禁止实例', title: '禁止发起和审批。'},
]

const useMainForms = [
  {
    key: 'mainVersion',
    value: '表单主版本',
    title: '表单主版本：任务审批时使用绑定表单的主版本。',
  },
  {
    key: 'startVersion',
    value: '启动时版本',
    title: '启动时版本：任务审批时使用流程启动时绑定的表单版本。',
  },
]

import model from '@/api/flow.js'
const FlowVarSelector = () => import('@/components/flow/FlowVarSelector.vue')
const MessageTypeSelector = () =>
  import('@/components/flow/MessageTypeSelector.vue')
const FlowNodeUserCondition = () =>
  import('@/components/flow/FlowNodeUserCondition.vue')

const FlowAutoStartSetting = () =>
  import('@/components/flow/FlowAutoStartSetting.vue')

import {mapState, mapActions} from 'vuex'
import {Message} from 'element-ui'
export default {
  props: ['defId'],
  components: {
    FlowVarSelector,
    MessageTypeSelector,
    FlowNodeUserCondition,
    FlowAutoStartSetting,
  },
  data() {
    return {
      curEditSetting: '', //下标，用于记录是哪一条办结抄送的人员配置
      procNotifyList: [{userAssignRules: [], msgTypes: ''}], //办结抄送的配置信息
      curEditRuleIndex: '', //下标，用于记录修改某一条办结抄送人员配置的时候是哪条数据
      dialogEndNotifyVisible: false, //办结抄送设置对话框是否显示
      loadDataUrl: '',
      prop: {urgentMailTel: '', urgentSmsTel: ''},
      handlerTypes: [],
      skipConditionList: [],
      statusArr: statusOptions,
      useMainFormArr: useMainForms,
      dialogUrgentMailTelVisible: false,
      dialogUrgentSmsTelVisible: false,
      urgentMailTel: '',
      urgentSmsTel: '',
      checkOpnionLimits: [
        {value: 'all', label: '查看全部'},
        {value: 'self', label: '本人操作'},
        {value: 'back', label: '退回自己'},
        {value: 'end', label: '显示终止恢复'},
      ],
      checkLimit: ['all', 'end'],
      startLimit: ['self', 'back', 'end'],
    }
  },
  watch: {
    checkLimit: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal && newVal.length === 0) {
          this.$set(this, 'checkLimit', oldVal)
        }
      },
    },
    startLimit: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal && newVal.length === 0) {
          this.$set(this, 'startLimit', oldVal)
        }
      },
    },
  },
  computed: mapState({
    defConfigData: (state) => state.flow.defConfigData,
  }),
  methods: {
    //保存办结抄送配送的信息
    saveEndNotify() {
      const this_ = this
      let validate = true
      this.procNotifyList.forEach((n) => {
        if (
          !n.msgTypes ||
          !n.userAssignRules ||
          n.userAssignRules.length == 0
        ) {
          validate = false
        }
      })
      if (!validate) {
        Message.warning('人员配置或通知类型不能为空')
        return
      }
      let url = '${bpmModel}/flow/plugins/v1/procNotifySave?defId=' + this.defId
      req.post(url, this.procNotifyList).then(function (data) {
        data = data.data
        if (data.state) {
          Message.success('办结抄送配置成功')
          this_.dialogEndNotifyVisible = false
        } else {
          Message.error(data.message)
        }
      })
    },
    //新增办结抄送
    addLine() {
      let procNotify = {userAssignRules: [], msgTypes: ''}
      this.procNotifyList.push(procNotify)
    },
    //添加人员配置（办结抄送）
    addUserCondition(setting, index) {
      this.curEditSetting = setting
      this.curEditRuleIndex = index
      let conf = {}
      if (index != undefined) {
        let userAssignRules = this.procNotifyList[setting].userAssignRules
        let userRule = userAssignRules[index]
        conf.userRule = JSON.parse(JSON.stringify(userRule))
      }
      conf = {...conf, ...{nodeType: '', nodeId: '', defId: this.defId}}
      this.$refs.flowNodeUserCondition.showDialog(conf)
    },
    //获取人员配置返回的值（办结抄送）
    nodeUserConditionConfirm(res) {
      if (this.curEditRuleIndex != undefined) {
        this.procNotifyList[this.curEditSetting].userAssignRules.splice(
          this.curEditRuleIndex,
          1,
          res
        )
      } else {
        this.procNotifyList[this.curEditSetting].userAssignRules.push(res)
      }
      this.$forceUpdate()
    },
    //删除
    deleteSetting(list, index) {
      list.splice(index, 1)
    },
    //办结抄送设置
    setEndNotify() {
      this.dialogEndNotifyVisible = true
      this.procNotifyList = [{userAssignRules: [], msgTypes: ''}] //清空办结抄送的配置信息
      const this_ = this
      req
        .get('${bpmModel}/flow/plugins/v1/procNotifyEdit?defId=' + this_.defId)
        .then(function (data) {
          data = data.data
          if (data) {
            this_.procNotifyList = data
          }
        })
    },
    save() {
      if (this.prop.subjectRule.length > 600) {
        this.$message.warning('超出限制长度！')
        return false
      }
      if (this.checkLimit) {
        this.prop.checkLimit = this.checkLimit.join(',')
      }
      if (this.startLimit) {
        this.prop.startLimit = this.startLimit.join(',')
      }
      var param = {
        bpmProp: JSON.parse(JSON.stringify(this.prop)),
        description: this.prop.description,
        defId: this.defId,
        rev: this.defConfigData.initData.bpmDefinition.rev,
      }
      if (!param.bpmProp.testStatus) {
        param.bpmProp.testStatus = 'test'
      } else {
        param.bpmProp.testStatus = 'run'
      }
      model.flowOtherSettingSave(param).then(
        (data) => {
          if (data.state) {
            this.$message.success(data.message)
            let param = {defId: this.defId, topDefKey: this.topDefKey || ''}
            //重新获取流程最新版本，以免保存流程配置的时候提示不是最新版本
            this.$store.dispatch('flow/updateDefRev', this.defId)
          }
        },
        (error) => {
          this.$message.error(error || '保存失败')
        }
      )
    },
    urgentSmsTelConfirm(data) {
      this.urgentSmsTel = this.urgentSmsTel + data.pathValue
    },
    urgentMailTelConfirm(data) {
      this.urgentMailTel = this.urgentMailTel + data.pathValue
      ro
    },
    urgentSmsTelClick() {
      this.dialogUrgentSmsTelVisible = true
      if (!this.prop.urgentSmsTel) return
      this.urgentSmsTel = this.prop.urgentSmsTel
    },
    urgentMailTelClick() {
      this.dialogUrgentMailTelVisible = true
      if (!this.prop.urgentMailTel) return
      this.urgentMailTel = this.prop.urgentMailTel
    },
    subjectRuleConfirm(data) {
      this.prop.subjectRule = this.prop.subjectRule + data.pathValue
    },
    afterLoadData(data) {
      this.prop = data.prop
      if (data.prop.checkLimit) {
        this.checkLimit = data.prop.checkLimit.split(',')
      }
      if (data.prop.startLimit) {
        this.startLimit = data.prop.startLimit.split(',')
      }
      if (data.prop.testStatus == 'test') {
        this.prop.testStatus = false
      } else {
        this.prop.testStatus = true
      }
      for (let key in data.handlerTypes) {
        this.handlerTypes.push({key: key, value: data.handlerTypes[key]})
      }
      data.skipConditionList.forEach((item) => {
        this.skipConditionList.push({key: item.type, value: item.title})
      })
    },
  },
  created() {
    this.loadDataUrl = '/flow/def/v1/getOtherParam?defId=' + this.defId
  },
}
</script>

<style lang="scss" scoped>
>>> label.el-checkbox-horizontal {
  margin: 5px 5px 0 0;
}
.ht_ce {
  margin-top: -10px !important;
}

.flowOther-height {
  height: calc(100% - 20px);
  overflow: hidden;
  margin: 10px;
}

.other-set__card {
  height: calc(100% - 5px);
}

.other-set__card /deep/ > div.el-card__header {
  padding: 8px 20px;
}

.other-set__card /deep/ > div.el-card__body {
  height: calc(100% - 65px);
  padding: 10px 0 10px 10px;
}

.other-set__table th,
.other-set__card /deep/ > div.el-card__header {
  background: #f9f9f9;
}

.other-set__table th,
.other-set__table td {
  padding: 8px 15px !important;
}
</style>
