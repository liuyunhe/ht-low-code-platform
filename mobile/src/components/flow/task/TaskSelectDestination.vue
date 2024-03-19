<template>
  <ht-sidebar-dialog
    title="选择目标节点"
    :visible.sync="relatedInformationDialog"
    :close-on-click-modal="false"
    append-to-body
    :before-close="closeDailog"
    width="100%"
  >
    <div class="record-content">
      <el-table
        :data="selectDesObj.afterNodes"
        style="width: 100%; max-height: 400px; overflow-y: auto"
        border
        header-cell-class-name="todo-header-row"
        row-class-name="todo-row"
        size="medium"
        :default-sort="{prop: 'createTime', order: 'descending'}"
      >
        <el-table-column
          v-if="selectDesObj.jumpType"
          label="选择节点"
          align="left"
        >
          <template slot-scope="scope">
            <el-radio v-model="selectNodeId" :label="scope.row.nodeId">{{
              scope.row.nodeName
            }}</el-radio>
          </template>
        </el-table-column>

        <el-table-column
          v-if="!selectDesObj.jumpType"
          label="目标节点"
          align="left"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.nodeName }}</span>
          </template>
        </el-table-column>

        <el-table-column
          v-if="selectDesObj.choiceExcutor"
          label="选择处理人"
          align="left"
        >
          <template slot-scope="scope">
            <el-select
              style="width: 100%"
              v-model="scope.row.selectUserIds"
              v-if="selectDesObj.choiceExcutor == 'candidate'"
              clearable
              multiple
              placeholder="请选择"
            >
              <el-option
                v-for="item in scope.row.excutorList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
            <EipUserSelector
              v-if="selectDesObj.choiceExcutor != 'candidate'"
              v-model="scope.row.selectUsers"
              :config="{isArray: true}"
              :append-to-body="true"
              :single="false"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="ht-dialog-footer">
      <van-grid clickable :column-num="columnNum">
        <van-grid-item icon="passed" @click="confirm" text="确定" />
        <van-grid-item
          v-if="
            (selectDesObj.help != '' || selectDesObj.helpGlobal != '') &&
            (selectDesObj.jumpType == 'free' ||
              selectDesObj.jumpType == 'select' ||
              selectDesObj.jumpType == 'free,select' ||
              selectDesObj.jumpType == 'select,free')
          "
          icon="question-o"
          @click="help"
          text="帮助"
        />
        <van-grid-item icon="close" @click="closeDailog" text="取消" />
      </van-grid>
    </div>
    <ht-sidebar-dialog
      title="帮助"
      :visible.sync="helpDialog"
      width="100%"
      :close-on-click-modal="false"
      append-to-body
      :before-close="close"
    >
      <div
        style="max-height: 600px; overflow: auto; padding: 5px"
        v-html="valHelp"
      ></div>
    </ht-sidebar-dialog>
  </ht-sidebar-dialog>
</template>

<script>
import {mapState, mapActions} from 'vuex'
import EipUserSelector from '@/components/eipControl/selector/EipUserSelector.vue'
import utils from '@/utils.js'
import {Notify, Dialog} from 'vant'

export default {
  name: 'taskSelectDestination',
  props: ['taskId', 'defId', 'instId', 'leaderId'],
  components: {EipUserSelector},
  data() {
    return {
      relatedInformationDialog: false,
      helpDialog: false,
      disabled: false,
      selectNodeId: '',
      files: '',
      zfiles: '',
      formData: '',
      opinion: '',
      columnNum: '2',
      selectDesObj: {},
      token: utils.getUrlKey('token'),
      valHelp: '',
    }
  },
  computed: mapState({
    curOrgPost: (state) => state.user.postCharge,
  }),
  methods: {
    close() {
      this.helpDialog = false
    },
    //帮助
    help() {
      this.helpDialog = true
    },
    //鼠标点击页面其他其他位置不关闭弹框
    showDailog(formData, files, zfiles, opinion) {
      this.columnNum = '2'
      this.files = files
      this.zfiles = zfiles
      this.opinion = opinion
      this.formData = formData
      this.selectNodeId = ''
      this.selectDesObj = {}
      this.relatedInformationDialog = true
      this.$store
        .dispatch('storeProcess/getAfterJumpNodes', {
          taskId: this.taskId || '',
          data: formData.data || formData,
          defId: this.defId || '',
          instId: this.instId || '',
        })
        .then((data) => {
          let Base64 = require('js-base64').Base64
          this.selectDesObj = data
          if (this.selectDesObj.afterNodes.length == 1) {
            this.selectNodeId = this.selectDesObj.afterNodes[0].nodeId
          }
          if (this.selectDesObj.helpGlobal == 'null') {
            this.selectDesObj.helpGlobal = ''
          }
          if (this.selectDesObj.help == 'null') {
            this.selectDesObj.help = ''
          }
          if (
            this.selectDesObj.helpGlobal != '' &&
            this.selectDesObj.help != ''
          ) {
            this.valHelp = Base64.decode(this.selectDesObj.help, 'utf-8')
          } else if (
            this.selectDesObj.helpGlobal == '' &&
            this.selectDesObj.help != ''
          ) {
            this.valHelp = Base64.decode(this.selectDesObj.help, 'utf-8')
          } else if (this.selectDesObj.helpGlobal != '') {
            this.valHelp = Base64.decode(this.selectDesObj.helpGlobal, 'utf-8')
          }
          if (
            (this.selectDesObj.help != '' ||
              this.selectDesObj.helpGlobal != '') &&
            (this.selectDesObj.jumpType == 'free' ||
              this.selectDesObj.jumpType == 'select' ||
              this.selectDesObj.jumpType == 'free,select' ||
              this.selectDesObj.jumpType == 'select,free')
          ) {
            this.columnNum = '3'
          }
        })
    },
    closeDailog() {
      this.relatedInformationDialog = false
    },
    confirm() {
      let data = {
        data: this.formData.data || this.formData,
        taskId: this.taskId || '',
        defId: this.defId || '',
        proInstId: this.instId || '',
        actionName: 'agree',
        files: this.files,
        zfiles: this.zfiles,
        formType: 'inner',
        opinion: this.opinion,
        agentLeaderId: this.leaderId,
        isSendNodeUsers: '1',
      }
      if (this.formData.businessKey) {
        data.formType = 'frame'
        data.businessKey = this.formData.businessKey
        data.sysCode = this.formData.sysCode
        if (this.formData.vars) {
          data.vars = this.formData.vars
        }
      }
      //如果用户选择看目标节点，则将节点的跳转类也传到后台

      data.destination = this.selectNodeId
      if (
        !data.destination &&
        this.selectDesObj.afterNodes &&
        this.selectDesObj.afterNodes.length == 1
      ) {
        data.destination = this.selectDesObj.afterNodes[0].nodeId
      }
      if (this.selectDesObj.jumpType) {
        data.jumpType =
          this.selectDesObj.jumpType == 'select' ? 'select' : 'free'
      }

      let nodeUsers = []
      //遍历所有的节点将其所选择的节点。
      if (this.selectDesObj && this.selectDesObj.choiceExcutor == 'candidate') {
        for (
          let index = 0;
          index < this.selectDesObj.afterNodes.length;
          index++
        ) {
          const node = this.selectDesObj.afterNodes[index]
          if (node.selectUserIds && node.selectUserIds.length > 0) {
            const excutorList = node.excutorList
            const selectusers = []
            for (let index = 0; index < excutorList.length; index++) {
              const user = excutorList[index]
              if (user && node.selectUserIds.indexOf(user.id) > -1) {
                selectusers.push(user)
              }
            }
            nodeUsers.push({nodeId: node.nodeId, executors: selectusers})
          }
        }
      } else if (this.selectDesObj) {
        for (
          let index = 0;
          index < this.selectDesObj.afterNodes.length;
          index++
        ) {
          const node = this.selectDesObj.afterNodes[index]
          if (node.selectUsers && node.selectUsers.length > 0) {
            const excutorList = node.selectUsers
            const selectusers = []
            for (let index = 0; index < excutorList.length; index++) {
              const user = excutorList[index]
              selectusers.push({
                id: user.id,
                name: user.fullname,
                type: 'user',
              })
            }
            nodeUsers.push({nodeId: node.nodeId, executors: selectusers})
          }
        }
      }

      if (nodeUsers.length > 0) {
        data.nodeUsers = JSON.stringify(nodeUsers)
      }
      if (window.urgentStateValue) {
        data.urgentStateValue = window.urgentStateValue
      }
      if (this.taskId) {
        Dialog.confirm({
          title: '提示',
          overlayClass: 'overlay',
          message: '确认办理此任务?',
        })
          .then(() => {
            const loading = this.$loading({
              lock: true,
              text: '任务处理中，请耐心等待...',
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.7)',
            })
            this.disabled = true
            this.$store.dispatch('storeProcess/complete', data).then(() => {
              loading.close()
              if (this.token != null) {
                window.close()
              } else {
                this.$router.go(-1)
              }
            })
          })
          .catch(() => {
            loading.close()
            this.disabled = false
          })
      } else {
        if (this.curOrgPost && this.curOrgPost.org) {
          data.startOrgId = this.curOrgPost.org.id
        }
        data.supportMobile = 1
        this.disabled = true
        this.$store.dispatch('storeProcess/start', data).then(() => {
          if (JSON.stringify(this.$route.query) == '{}') {
            this.$router.go(-1)
          } else {
            this.$router.push('/work')
          }
        })
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
>>> .el-dialog__header {
  padding: 10px 20px;
  background: #F8F8F8;
  height: 24px;
  line-height: 24px;
  border-bottom: 1px solid #eee;
  border-radius: 2px 2px 0 0;
}

>>> .el-dialog__headerbtn {
  top: 12px;
}

>>>.el-input {
  position: relative;
  font-size: 14px;
  display: inline-block;
  width: 98%;
}

.record-container {
  border-bottom: 1px solid #ebeef5;
  padding: 20px 0 10px;
}

.record-container > span {
  border-left: 3px solid #2761ff;
  font-weight: bold;
  font-size: 14px;
  padding-left: 10px;
  color: #666;
}

.record-content {
  padding: 5px;
}

.form-table {
  width: 100%;
  border-top: 1px solid #ebeef5;
  border-left: 1px solid #ebeef5;
}

.form-table th {
  text-align: right;
  color: #666;
}

.form-table th > span {
  color: #f00;
}

.form-table th, .form-table td {
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  padding: 10px;
  min-width: 0;
  box-sizing: border-box;
  text-overflow: ellipsis;
  vertical-align: middle;
  position: relative;
}

.recordInformation {
  text-align: right;
  width: 15%;
}

.overstriking {
  font-weight: 700;
}

.help {
  float: left;
}

div>>>.el-radio__label {
  font-size: 14px;
  padding-left: 4px;
}

div>>>.el-table .cell, .el-table--border td:first-child .cell, .el-table--border th:first-child .cell {
  padding-left: 3px !important;
}

>>>.el-dialog__body {
  padding: 0px;
  color: #606266;
  font-size: 14px;
}

.ht-dialog-footer {
  height: 45px;
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 9999;
}

div>>>.el-input__icon {
  height: 100%;
  width: 15px;
  text-align: center;
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
  line-height: 40px;
}

div>>>.van-grid-item__icon {
  font-size: 15px !important;
}

div>>>.van-grid-item__content {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  height: 45px;
  padding: 16px 8px;
  background-color: #f5f5f5 !important;
}
</style>
