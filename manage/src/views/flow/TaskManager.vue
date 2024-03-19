<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      @row-click="rowClick"
      :data="data"
      :pageResult="pageResult"
      :selectable="false"
      :show-export="false"
      quick-search-props="name,procInstId,procDefName"
      ref="htTable"
      v-if="
        defaultFiledShowConf.procInstId && defaultFiledShowConf.procInstId.desc
      "
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button icon="el-icon-s-tools" @click="openSetDialog()"
            >字段显示配置</el-button
          >
        </el-button-group>
      </template>

      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column
          prop="procInstId"
          :label="defaultFiledShowConf.procInstId.desc"
          width="160"
          show-overflow-tooltip
          align="center"
        />
        <ht-table-column
          prop="subject"
          :label="defaultFiledShowConf.subject.desc"
          hidden
          align="center"
          show-overflow-tooltip
        />
        <ht-table-column
          prop="procDefName"
          :label="defaultFiledShowConf.procDefName.desc"
          align="center"
          :show-overflow-tooltip="true"
        />
        <ht-table-column
          prop="name"
          align="center"
          :label="defaultFiledShowConf.name.desc"
          :show-overflow-tooltip="true"
        />
        <ht-table-column
          prop="task.status_"
          :label="defaultFiledShowConf.status.desc"
          width="120"
          :filters="statusArray"
        >
          <template v-slot="{row}">
            <el-tag
              v-show="row.status == s.value"
              :type="s.type"
              v-for="s in statusArray"
              :key="s.value"
              >{{ s.text }}</el-tag
            >
          </template>
        </ht-table-column>
        <ht-table-column
          prop="createTime"
          :label="defaultFiledShowConf.createTime.desc"
          width="140"
        />
        <ht-table-column
          prop="ownerName"
          :label="defaultFiledShowConf.ownerName.desc"
          width="120"
        />
        <ht-table-column
          prop="assigneeName"
          :label="defaultFiledShowConf.assigneeName.desc"
          width="120"
        >
          <template slot-scope="scope">
            <el-popover placement="right" width="400" trigger="click">
              <el-table :data="scope.row.cList">
                <el-table-column
                  width="80"
                  property="typeName"
                  label="类型"
                ></el-table-column>
                <el-table-column width="320" property="names" label="名称">
                  <template slot-scope="scope1">
                    <span
                      class="owner-span"
                      v-for="s in scope1.row.list"
                      :key="s.type"
                    >
                      <el-tooltip
                        :disabled="scope1.row.type == 'user'"
                        class="item"
                        effect="light"
                        placement="top"
                        :content="s.users"
                      >
                        <el-button
                          :type="scope1.row.type != 'user' ? 'primary' : ''"
                          plain
                          size="mini"
                          >{{ s.type }}</el-button
                        >
                      </el-tooltip>
                    </span>
                  </template>
                </el-table-column>
              </el-table>
              <i
                class="el-icon-more"
                slot="reference"
                v-if="scope.row.identityList"
                @click="candidateDetail(scope.row)"
              ></i>
            </el-popover>
            <span v-if="scope.row && scope.row.assigneeName">{{
              scope.row.assigneeName
            }}</span>
          </template>
        </ht-table-column>
        <ht-table-column
          prop="prop1"
          :label="defaultFiledShowConf.prop1.desc"
          hidden
          width="120"
        />
        <ht-table-column
          prop="prop2"
          :label="defaultFiledShowConf.prop2.desc"
          hidden
          width="120"
        />
        <ht-table-column
          prop="prop3"
          :label="defaultFiledShowConf.prop3.desc"
          hidden
          width="120"
        />
        <ht-table-column
          prop="prop4"
          :label="defaultFiledShowConf.prop4.desc"
          hidden
          width="120"
        />
        <ht-table-column
          prop="prop5"
          :label="defaultFiledShowConf.prop5.desc"
          hidden
          width="120"
        />
        <ht-table-column
          prop="prop6"
          :label="defaultFiledShowConf.prop6.desc"
          hidden
          width="120"
        />

        <ht-table-column align="left" width="120" label="操作" :fixed="'right'">
          <template v-slot="{row}">
            <el-dropdown
              size="mini"
              split-button
              v-if="
                row.isBpmTask == '1' &&
                row.status != 'TRANSFORMING' &&
                row.status != 'APPROVELINEING' &&
                row.status != 'SIGNSEQUENCEING' &&
                row.status != 'SIGNLINEING' &&
                row.status != 'TRANSFORMEDINQU'
              "
              @command="handleCommand"
              @click="handleCommand({row: row, command: 'completeTask'})"
            >
              <span> <i class="el-icon-tickets"></i>处理 </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  icon="el-icon-menu"
                  :command="{row: row, command: 'handleUrgent'}"
                  >催办</el-dropdown-item
                >
                <el-dropdown-item
                  v-if="row.status != 'TRANSFORMED'"
                  icon="el-icon-menu"
                  :command="{row: row, command: 'modifyExcutor'}"
                  >更改执行人</el-dropdown-item
                >
                <el-dropdown-item
                  v-if="row.status != 'TRANSFORMED'"
                  icon="el-icon-menu"
                  :command="{row: row, command: 'jump'}"
                >
                  跳转
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </ht-table-column>
      </template>
    </ht-table>

    <el-dialog
      title="更改任务执行人"
      :visible="dialogVisible"
      width="800px"
      appendToBody
      :before-close="closeDialog"
      :close-on-click-modal="false"
    >
      <form v-form>
        <table cellspacing="0" cellpadding="0" border="0" class="form-table">
          <tbody>
            <tr>
              <th style="width: 100px">
                <span class="xh-star">*</span>执行人：
              </th>
              <td>
                <eip-user-selector
                  :appendToBody="true"
                  v-model="modifyparam.names"
                  :config="{
                    id: 'modifyparam.userIds',
                    account: 'modifyparam.userAccounts',
                  }"
                />
              </td>
            </tr>
            <tr>
              <th style="width: 100px">
                <span class="xh-star">*</span>通知方式：
              </th>
              <td>
                <MessageTypeSelector v-model="modifyparam.messageType" />
              </td>
            </tr>
            <tr>
              <th style="width: 100px">
                <span class="xh-star">*</span>通知内容：
              </th>
              <td colspan="3">
                <el-input
                  type="textarea"
                  :rows="2"
                  placeholder="请输入修改原因"
                  v-model="modifyparam.cause"
                ></el-input>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirm" size="small"
          >确 定</el-button
        >
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="字段显示配置"
      :visible.sync="filedConfDialogVisible"
      width="800px"
      appendToBody
      :close-on-click-modal="false"
      class="filed_conf"
      v-if="filedConfDialogVisible"
    >
      <form v-form data-vv-scope="conf-form">
        <table class="conf-table" cellspacing="0">
          <thead>
            <th style="width: 230px">字段名</th>
            <th style="width: 230px">标题名</th>
            <th style="width: 230px">是否在应用端显示</th>
          </thead>
          <tbody>
            <tr v-for="c in filedShowConfList" :key="c.name">
              <th>{{ c.name }}</th>
              <td>
                <ht-input
                  size="mini"
                  v-model="c.desc"
                  validate="required"
                  :maxlength="50"
                  :showWordLimit="true"
                />
              </td>
              <td>
                <el-switch
                  v-model="c.frontShow"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                ></el-switch>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveConf" size="small"
          >确 定</el-button
        >
        <el-button @click="filedConfDialogVisible = false" size="small"
          >取 消</el-button
        >
      </div>
    </el-dialog>
    <!-- 流程催办 -->
    <InstanceUrgent ref="instanceUrgent" />
    <!-- 跳转 -->
    <!--  <task-selection ref="taskSelection"/>-->
  </div>
</template>
<script>
import form from '@/api/form.js'
import req from '@/request.js'
import utils from '@/hotent-ui-util.js'

import {mapState, mapActions} from 'vuex'
import {Base64} from 'js-base64'
const MessageTypeSelector = () =>
  import('@/components/flow/MessageTypeSelector.vue')
const eipUserSelector = () =>
  import('@/components/selector/EipUserSelector.vue')
const InstanceUrgent = () => import('@/views/flow/InstanceUrgent.vue')

export default {
  components: {
    MessageTypeSelector,
    eipUserSelector,
    InstanceUrgent,
  },
  data() {
    return {
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name',
      },
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0,
      },
      curSlectTaskId: '',
      statusArray: [
        {text: '待办', value: 'NORMAL', type: 'success'},
        {text: '委托', value: 'AGENT', type: 'info'},
        {text: '征询', value: 'TRANSFORMEDINQU', type: 'info'},
        {text: '转办', value: 'DELIVERTO', type: 'success'},
        {text: '接收流转', value: 'TRANSFORMED'},
        {text: '沟通', value: 'COMMU'},
        {text: '流转源', value: 'TRANSFORMING', type: 'warning'},
        {text: '被驳回', value: 'BACK', type: 'danger'},
        {text: '跟踪', value: 'FOLLOW', type: 'info'},
        {text: '并行审批源', value: 'APPROVELINEING', type: 'success'},
        {text: '接收并行审批', value: 'APPROVELINEED', type: 'success'},
        {text: '顺序签署源', value: 'SIGNSEQUENCEING', type: 'info'},
        {text: '接收顺序签署', value: 'SIGNSEQUENCEED', type: 'info'},
        {text: '并行签署源', value: 'SIGNLINEING', type: 'info'},
        {text: '接收并行签署', value: 'SIGNLINEED', type: 'info'},
        {text: '抄送', value: 'COPYTO', type: 'info'},
        {text: '用户加签', value: 'USERADDSIGN', type: 'info'},
        {text: '会签加签', value: 'ADDSIGN'},
      ],
      dialogVisible: false,
      filedConfDialogVisible: false,
      modifyparam: {type: 'sms'},
      defaultFiledShowConf: {},
      defaultFiledShowConfList: [
        {name: 'subject', desc: '标题', frontShow: true},
        {name: 'procInstId', desc: '流程编号', frontShow: false },
        {name: 'procDefName', desc: '流程名称', frontShow: true},
        {name: 'name', desc: '任务名称', frontShow: true},
        {name: 'status', desc: '类型', frontShow: true},
        {name: 'createTime', desc: '创建时间', frontShow: true},
        {name: 'creator', desc: '创建人', frontShow: true},
        {name: 'urgentStateValue', desc: '紧急状态', frontShow: true},
        {name: 'ownerName', desc: '所属人', frontShow: false},
        {name: 'assigneeName', desc: '待审批人', frontShow: false},
        {name: 'prop1', desc: '扩展1', frontShow: false},
        {name: 'prop2', desc: '扩展2', frontShow: false},
        {name: 'prop3', desc: '扩展3', frontShow: false},
        {name: 'prop4', desc: '扩展4', frontShow: false},
        {name: 'prop5', desc: '扩展5', frontShow: false},
        {name: 'prop6', desc: '公文编号', frontShow: true},
      ],
      filedShowConfList: [],
      editFiledConf: {
        name: '待办列表字段显示配置',
        alias: 'taskListFiledConf',
        encrypt: '1',
        description: '应用端待办列表字段显示配置',
        value: '',
      },
      typeNameConf: {
        org: '组织',
        job: '职务',
        position: '岗位',
        role: '角色',
        user: '用户',
      },
    }
  },
  computed: mapState({
    account: (state) => state.login.currentUser.account,
    token: (state) => state.login.currentUser.token,
    frontUrl: function (state) {
      return (
        window.context.front +
        '/task/' +
        this.curSlectTaskId +
        '/0?token=' +
        this.token +
        '&showMenu=true'
        // Base64.encode(this.account)
      )
    },
  }),
  methods: {
    rowClick(row, column, event) {
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row)
    },
    //查看候选人详情
    candidateDetail(row) {
      let this_ = this
      this.$http
        .get(
          '${bpmRunTime}/runtime/task/v1/getCandidatesListByTaskId?taskId=' +
            row.id
        )
        .then(function (resp) {
          if (resp.data) {
            let temp = {}
            let tempList = []
            resp.data.forEach((c) => {
              c.groupType = c.groupType ? c.groupType : c.type
              if (!temp[c.groupType]) {
                temp[c.groupType] = []
              }
              temp[c.groupType].push({type: c.name, users: c.userNames})
            })
            for (const type in temp) {
              tempList.push({
                type: type,
                typeName: this_.typeNameConf[type],
                list: temp[type],
              })
            }
            this_.$set(row, 'cList', tempList)
          }
        })
    },
    //流程催办
    handleUrgent(row) {
      this.$refs.instanceUrgent.handleOpen(
        row.procInstId,
        row.procDefId,
        row.subject,
        row.nodeId
      ) //父组件调用子组件方法
    },
    openSetDialog() {
      let this_ = this
      this.$http
        .get('${portal}/sys/sysProperties/v1/getJson?id=taskListFiledConf')
        .then(function (resp) {
          if (resp.data) {
            this_.editFiledConf = resp.data
            this_.filedShowConfList = JSON.parse(this_.editFiledConf.value)
          } else {
            this_.filedShowConfList = JSON.parse(
              JSON.stringify(this_.defaultFiledShowConfList)
            )
          }
          this_.filedConfDialogVisible = true
        })
    },
    saveConf() {
      let this_ = this
      utils
        .validateForm(this, 'conf-form')
        .then((r) => {
          this.editFiledConf.value = JSON.stringify(this.filedShowConfList)
          this.$http
            .post('${portal}/sys/sysProperties/v1/save', this.editFiledConf)
            .then(function (resp) {
              if (resp.data && resp.data.state) {
                this_.editFiledConf = resp.data
                this_.formatConfListToObj()
                this_.$message({
                  type: 'success',
                  message: '保存成功',
                  onClose: function () {
                    window.location.reload()
                    this_.filedConfDialogVisible = false
                  },
                })
              }
            })
        })
        .catch((items) => {
          this.$message.error(`还有内容未填写，无法保存。`)
        })
    },
    closeDialog() {
      this.dialogVisible = false
    },
    confirm() {
      let this_ = this
      let param = JSON.parse(JSON.stringify(this.modifyparam))
      if (!param.userIds) {
        this.$message.warning('执行人不能为空！')
        return
      }

      if (!param.messageType) {
        this.$message.warning('通知类型不能为空！')
        return
      }

      if (!param.cause) {
        this.$message.warning('通知内容不能为空！')
        return
      }
      param.userIds = param.userIds.split(',')
      req
        .post(
          window.context.bpmRunTime + '/runtime/task/v1/setTaskExecutors',
          param
        )
        .then((response) => {
          let data = response.data
          if (data.state) {
            this_.$message.success(data.message)
            this_.$refs.htTable.load()
            this_.dialogVisible = false
          } else {
            this_.$message.fail(data.message)
          }
        })
    },
    completeTask(id) {
      this.curSlectTaskId = id
      window.open(this.frontUrl, '_blank')
    },
    modifyExcutor(id) {
      this.modifyparam = {taskId: id}
      this.dialogVisible = true
    },
    loadData(param, cb) {
      if (this.$refs.htTable && this.$refs.htTable.quickSearchWord) {
        if (param.querys && param.querys.length > 0) {
          let temp = param.querys[0]
          for (let index = 1; index < 7; index++) {
            let query = JSON.parse(JSON.stringify(temp))
            query.property = 'prop' + index
            query.relation = 'OR'
            param.querys.push(query)
          }
        }
      }
      req
        .post(window.context.bpmRunTime + '/runtime/task/v1/list', param)
        .then((data) => {
          let response = data.data
          this.data = response.rows
          this.pageResult = {
            page: response.page,
            pageSize: response.pageSize || 50,
            total: response.total,
          }
        })
        .finally(() => cb())
    },
    handleCommand(params) {
      switch (params.command) {
        case 'modifyExcutor':
          this.modifyExcutor(params.row.id)
          break
        case 'handleUrgent':
          this.handleUrgent(params.row)
          break
        case 'completeTask':
          this.completeTask(params.row.id)
          break
        case 'jump':
          this.openJumpDialog(params.row.id)
          break
      }
    },
    formatConfListToObj() {
      let editConfObj = {}
      let tempList = JSON.parse(JSON.stringify(this.filedShowConfList))
      tempList.forEach((c) => {
        let key = c.name
        editConfObj[key] = c
      })
      this.$set(this, 'defaultFiledShowConf', editConfObj)
    },
    openJumpDialog(id) {
      this.curSlectTaskId = id
      window.open(this.frontUrl + '&type=free&showMenu=true', '_blank')
    },
  },
  created() {
    let this_ = this
    this.$http
      .get(
        '${portal}/sys/sysProperties/v1/getDecryptByAlias?alias=taskListFiledConf'
      )
      .then(function (resp) {
        if (resp.data) {
          this_.filedShowConfList = JSON.parse(resp.data.value)
        } else {
          this_.filedShowConfList = JSON.parse(
            JSON.stringify(this_.defaultFiledShowConfList)
          )
        }
        this_.formatConfListToObj()
      })
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
.aside-width {
  width: $--aside-width !important;
}

.conf-table > thead > tr > th,
.conf-table > thead > th,
.conf-table > tbody > tr > th,
.conf-table > tfoot > tr > th,
.table > thead > tr > td,
.conf-table > tbody > tr > td {
  border-top: 1px solid #e7eaec;
  border-left: 1px solid #e7eaec;
  line-height: 1.42857;
  padding: 4px 8px;
  vertical-align: middle;
}
.conf-table {
  border-bottom: 1px solid #e7eaec;
  border-right: 1px solid #e7eaec;
  width: 100%;
  max-height: 400px;
  overflow: auto;
  text-align: center;
  display: block;
}
.filed_conf >>> .el-dialog__body {
  padding: 10px 20px;
}

.owner-span >>> .el-button {
  padding: 5px 10px;
}
</style>
