<template>
  <div>
    <div class="footer">
      <span
        v-if="
          status != 'COMMU' &&
          status != 'TRANSFORMEDINQU' &&
          type != 'done' &&
          type != 'request' &&
          type != 'read'
        "
      >
        <span v-for="(item, index) in rowsBtn" :key="index">
          <!-- 有强制签收配置  且未签收，只显示签收按钮-->
          <span v-if="item.isLock == true && canLock == 1 && !disabled">
            <van-button
              type="info"
              style="width: 100%"
              v-if="item.alias == 'lockUnlock' && canLock == 1"
              @click="validateFormData('lockUnlock')"
              >签收</van-button
            >
          </span>
          <!-- 正常审批-->
          <span v-else-if="!disabled">
            <van-button
              type="info"
              class="vb_w"
              :style="{width: btnCountObj[bottomShowBtnLength]}"
              v-if="item.alias == 'agree'"
              @click="validateFormData('agree')"
              >{{ item.name }}</van-button
            >
            <van-button
              type="danger"
              class="vb_w"
              :style="{width: btnCountObj[bottomShowBtnLength]}"
              v-if="item.alias == 'reject'"
              @click="validateFormData('reject')"
              >{{ item.name }}</van-button
            >
            <van-button
              type="info"
              style="width: 50%"
              v-if="item.alias == 'agreeTrans'"
              @click="validateFormData('agreeTrans')"
              >{{ item.name }}</van-button
            >
            <van-button
              type="danger"
              style="width: 50%"
              v-if="item.alias == 'opposeTrans'"
              @click="validateFormData('opposeTrans')"
              >{{ item.name }}</van-button
            >
          </span>
          <van-action-sheet
            v-model="showBtns"
            cancel-text="取消"
            @cancel="onCancel"
            :actions="actions"
            @select="onSelect"
          />
          <van-button
            type="default"
            class="vb_w"
            :style="{width: btnCountObj[bottomShowBtnLength]}"
            v-if="item.alias == 'more' && !disabled"
            @click="moreClick"
            >{{ item.name }}</van-button
          >
          <span v-else-if="disabled">
            <van-button
              type="info"
              style="width: 100%"
              v-if="item.alias == 'cancelHangUp'"
              @click="checkInstStatus('cancelHangUp')"
              >{{ item.name }}</van-button
            >
          </span>
        </span>
      </span>
      <span v-if="status == 'TRANSFORMEDINQU'">
        <van-button
          type="info"
          style="width: 50%"
          @click="validateFormData('taskToInquReply')"
          >征询回复</van-button
        >
        <van-button
          type="default"
          style="width: 50%"
          @click="validateFormData('inqu')"
          >征询</van-button
        >
      </span>
      <span v-if="status == 'USERADDSIGN'">
        <van-button
          type="info"
          style="width: 100%"
          @click="validateFormData('userAddSign')"
          >加签反馈</van-button
        >
      </span>
      <span v-if="status == 'COMMU'">
        <van-button
          type="info"
          style="width: 100%"
          @click="validateFormData('commuFeedBack')"
          >沟通反馈</van-button
        >
      </span>
      <span v-if="type == 'read'">
        <van-button
          type="info"
          style="width: 100%"
          @click="validateFormData('handleRead')"
          >回复</van-button
        >
      </span>
      <span
        v-if="
          (type == 'done' || type == 'request') &&
          opinionMap[selectNodeId] &&
          opinionMap[selectNodeId].revoke &&
          opinionMap[selectNodeId].previousRevoke &&
          opinionMap[selectNodeId].opinionStatus != 'transAgree' &&
          opinionMap[selectNodeId].opinionStatus != 'opposeTrans'
        "
      >
        <van-button
          type="danger"
          style="width: 100%"
          @click="validateFormData('handleRevoke')"
          >撤回</van-button
        >
      </span>
    </div>
    <ht-sidebar-dialog
      :visible="dialogFormVisible"
      :before-close="exitRevoke"
      title="撤回"
      :close-on-click-modal="false"
      append-to-body
      class="dialog-body"
      width="100%"
    >
      <div>
        <van-form @submit="saveRevoke">
          <div class="title-divider"><span>从以下人员中撤回工作项：</span></div>
          <el-checkbox-group v-model="inApprovalTaskIds">
            <span v-for="taskSign in taskSignLines" :key="taskSign.taskId">
              <el-checkbox
                :label="taskSign.taskId"
                :disabled="
                  !(
                    taskSign.status == 'approval' ||
                    taskSign.status == 'withdrawApproval'
                  ) || taskSign.isRead
                "
                >{{ taskSign.executor | executorFormat }}</el-checkbox
              >
              <br />
            </span>
          </el-checkbox-group>
        </van-form>
        <div class="ht-dialog-footer">
          <van-grid clickable :column-num="2">
            <van-grid-item icon="passed" @click="saveRevoke" text="确 认" />
            <van-grid-item icon="close" @click="exitRevoke" text="取 消" />
          </van-grid>
        </div>
      </div>
    </ht-sidebar-dialog>
    <!-- 驳回设置 -->
    <TaskToReject
      ref="taskToReject"
      :taskId="taskId"
      :leaderId="leaderId"
      :opinion="text"
      :opinionField="opinionField"
    />
    <!-- 转办设置 -->
    <TaskToDelegate ref="taskToDelegate" :taskId="taskId" />
    <!-- 征询设置 -->
    <TaskToInqu ref="taskToInqu" :taskId="taskId" />
    <!-- 流转设置 -->
    <TaskToTrans ref="taskToTrans" :taskId="taskId" />
    <!-- 并行审批设置 -->
    <TaskToApproveLine ref="taskToApproveLine" :taskId="taskId" />
    <!-- 顺序签署设置 -->
    <TaskToSignSequence ref="taskToSignSequence" :taskId="taskId" />
    <!-- 并行签署设置 -->
    <TaskToSignLine ref="taskToSignLine" :taskId="taskId" :execId="execId" />
    <!-- 选择路径跳转 -->
    <TaskSelectDestination ref="taskSelectDestination" :taskId="taskId" />
    <!-- 加签设置 -->
    <TaskToAddSign ref="taskToAddSign" :taskId="taskId" />
    <ht-sidebar-dialog
      :visible="submitDialog"
      title="审批操作"
      :close-on-click-modal="false"
      :before-close="submitDialogCancel"
      append-to-body
      class="dialog-body"
      width="100%"
    >
      <div>
        <van-form v-form @submit="submitDialogConfirm">
          <div
            class="form-container"
            style="padding-left: 10px; padding-top: 8px"
          >
            <span>审批操作</span>
          </div>
          <div class="code-input" v-if="actionName == 'agree' && ouSealable">
            <el-row>
              <el-col :span="18">
                <van-field
                  required
                  v-model="signatureCode"
                  label="签章验证码"
                  type="number"
                  clearable
                  placeholder="请输入六位验证码"
                  maxlength="6"
                ></van-field>
              </el-col>
              <el-col :span="6" class="van-field">
                <el-button
                  :disabled="signBtnDisabled"
                  type="primary"
                  round
                  size="small"
                  @click="getSignCode"
                  >{{ signBtnText }}</el-button
                >
              </el-col>
            </el-row>
          </div>
          <div class="opinion-text">
            <OpinionText
              :text="text"
              opinion_r="16"
              ref="opinionText"
              @getOpinion="getOpinion"
            />
          </div>
          <div
            v-if="actionName == 'agree' && signatureField && !secretFree"
            class="form-container"
            style="padding-left: 10px; padding-top: 8px"
          >
            <span>签章操作</span>
          </div>
          <div v-if="actionName == 'agree' && signatureField && !secretFree">
            <van-field
              required
              v-model="signaturePassword"
              label="签章密码"
              type="password"
              clearable
              placeholder="请输入签章密码"
            />
          </div>
        </van-form>
        <div class="ht-dialog-footer">
          <van-grid clickable :column-num="2">
            <van-grid-item
              icon="passed"
              @click="submitDialogConfirm"
              text="确 认"
            />
            <van-grid-item
              icon="close"
              @click="submitDialogCancel"
              text="取 消"
            />
          </van-grid>
        </div>
      </div>
    </ht-sidebar-dialog>
  </div>
</template>
<script>
import OpinionText from '@/components/flow/task/OpinionText.vue'
import TaskToReject from '@/components/flow/task/TaskToReject.vue'
import TaskToInqu from '@/components/flow/task/TaskToInqu.vue'
import TaskToDelegate from '@/components/flow/task/TaskToDelegate.vue'
import TaskToTrans from '@/components/flow/task/TaskToTrans.vue'
import TaskToApproveLine from '@/components/flow/task/TaskToApproveLine.vue'
import TaskToSignLine from '@/components/flow/task/TaskToSignLine.vue'
import TaskToSignSequence from '@/components/flow/task/TaskToSignSequence.vue'
import TaskSelectDestination from '@/components/flow/task/TaskSelectDestination.vue'
import TaskToAddSign from '@/components/flow/task/TaskToAddSign.vue'
import {mapState} from 'vuex'
import req from '@/request.js'
import utils from '@/utils.js'
import {Base64} from 'js-base64'
import {Notify, Form, Dialog, Button, Field} from 'vant'

const BTN_COUNT_OBJ = {
  1: '100%', // 底部显示按钮个数
  2: '50%',
  3: '33.33%',
  4: '25%',
}
export default {
  name: 'flowAction',
  components: {
    [Form.name]: Form,
    OpinionText,
    TaskToReject,
    TaskToInqu,
    TaskToDelegate,
    TaskToTrans,
    TaskToApproveLine,
    TaskToSignLine,
    TaskToSignSequence,
    TaskSelectDestination,
    [Button.name]: Button,
    [Field.name]: Field,
    TaskToAddSign,
  },
  props: [
    'instId',
    'type',
    'taskId',
    'execId',
    'defId',
    'status',
    'choiceExcutor',
    'jumpType',
    'instStatus',
    'leaderId',
    'readId', //知会任务待办抄送任务的主键ID
    'readDoneId', //知会任务已办抄送任务的主键ID
    'approvalArea', //审批区域显示的内容
    'nodeType', //当前任务类型
    'nodeId', //当前任务节点
    'tasks', //任务详情
    'opinionField', //当前节点审批意见回填字段
    'appendOpinion', //是否覆盖审批意见
    'signatureField', //自动签章字段
    'signatureCover', //自动签章是否覆盖
    'secretFree', //自动签章时是否免密
  ],
  data() {
    return {
      bottomShowBtnLength: null,
      btnCountObj: BTN_COUNT_OBJ,
      rowsBtn: [],
      showBtns: false,
      actions: [],
      submitDialogData: null,
      submitDialog: false,
      dialogFormVisible: false,
      opinion: '',
      state: '',
      canLock: '',
      formData: '',
      actionName: '',
      text: '',
      disabled: false, //是否挂起
      btnAilas: '', //选择的按钮
      token: utils.getUrlKey('token'),
      isApprovalOpinion: true, //是否显示审批意见
      iszFile: true, //是否显示正文
      isFile: true, //是否显示附件
      isProcessRecord: true, //是否显示处理记录
      isImageBpm: true, //是否显示流程图
      taskStatusArray: [
        'APPROVELINEING',
        'APPROVELINEED',
        'SIGNSEQUENCEING',
        'SIGNSEQUENCEED',
        'SIGNLINEING',
        'SIGNLINEED',
      ],
      selectNodeId: '', //当前任务节点ID
      opinionMap: {}, //当前任务节点对象
      opinionList: [], //此流程所有任务节点
      inApprovalTaskIds: [],
      taskSignLines: [],
      opinionFiles: '',
      appendStr: true,
      initBoAttr: '',
      signaturePassword: '',
      isSignatureCallBack: false,
      signatureLoading: null,
      signatureCode: '', //签章验证码
      signBtnDisabled: false,
      signBtnTimer: null,
      signBtnLeft: 60,
      signBtnText: '获取',
      formatOpinion: '',
      opinionSortOrder: 'desc',
      wrap: '\n',
    }
  },
  watch: {
    status: {
      handler(newVal, oldVal) {
        this.state = newVal //newVal即是status
        if (this.status == 'TRANSFORMEDINQU') {
          this.btnAilas = 'taskToInquReply'
        } else if (this.status == 'COMMU') {
          this.btnAilas = 'commuFeedBack'
        }
        if (
          this.state != 'COPYTO' &&
          this.state != 'FOLLOW' &&
          this.state != 'COMMU'
        ) {
          const this_ = this
          this.$store
            .dispatch(
              'storeProcess/taskDetail',
              this.taskId + '&reqParams=&leaderId=' + this.leaderId
            )
            .then((res) => {
              this_.rowsBtn = res
              if (this_.rowsBtn && this.rowsBtn.length) {
                this_.bottomShowBtnLength = this_.rowsBtn.filter((it) => {
                  return (
                    it.alias === 'agree' ||
                    it.alias === 'reject' ||
                    it.alias === 'more'
                  )
                }).length
              }
              this_.checkInstStatus()
            }) //获取操作按钮
          this.$store
            .dispatch('storeProcess/canLock', {
              taskId: this.taskId,
              leaderId: this.leaderId,
            })
            .then((canLock) => {
              //获取任务是否能锁定
              if (
                canLock == 4 &&
                this.$router.history.current.fullPath.indexOf('token') > -1
              ) {
                canLock = '5'
              }
              this.canLock = canLock
              //获取任务是否能锁定，1为能锁定，审批按钮为默认勾选签收
              if (canLock == 1) {
                // this.btnAilas = "lockUnlock";
              }
            })
        }
      },
    },
    signatureStatus: function (newVal, oldVal) {
      if (newVal != 'start') {
        this.isSignatureCallBack = true
      }
      if (newVal === 'success' && oldVal === 'ing') {
        this.doConfirm()
      } else if (newVal === 'success' && oldVal === 'fail') {
      }
      if (this.signatureLoading != null) {
        this.signatureLoading.close()
      }
    },
  },
  computed: {
    currentUser() {
      return this.$store.state.login.currentUser
    },
    signatureStatus() {
      return this.$store.state.storeProcess.signatureConfig.status
    },
    //ccwgq  2022-04-26 是否需要用印签章
    ouSealable() {
      let boData = this.$parent.$refs.formContent.data
      const foData = boData['ht']
      if (typeof foData !== 'object') {
        return false
      } else {
        return (
          this.signatureField &&
          foData.is_seal == '1' &&
          foData.sta_type == '92' &&
          !this.signatureCover &&
          this.secretFree
        )
      }
    },
  },
  created() {
    if (this.instId) {
      let queryFilter = {}
      let pageBean = {pageBean: this.pagination}
      let querys = [
        {
          property: 'wfInst.id_',
          value: this.instId,
          group: 'typeId',
          operation: 'IN',
          relation: 'AND',
        },
      ]
      queryFilter = {pageBean: this.pagination, querys}
      let _this = this
      this.$store
        .dispatch('storeProcess/getDoneByInstId', queryFilter)
        .then((data) => {
          if (data.data && data.data.rows) {
            data.data.rows.forEach((opinion) => {
              if (
                opinion.opinionStatus != 'signRecoverCancel' &&
                opinion.opinionStatus != 'retracted' &&
                opinion.opinionStatus != 'start' &&
                opinion.opinionStatus != 'end' &&
                !_this.opinionMap[opinion.taskKey] &&
                opinion.opinionStatus != 'awaiting_check' &&
                opinion.opinionStatus != 'copyto' &&
                opinion.opinionStatus != 'feedback' &&
                opinion.opinionStatus != 'copyto_reply' &&
                opinion.opinionStatus != 'start_commu' &&
                opinion.opinionStatus != 'end_revoke'
              ) {
                if (
                  opinion.opinionStatus == 'skip' &&
                  opinion.skipType != 'first'
                ) {
                  return true
                }
                if (opinion.formData) {
                  opinion.formData = JSON.parse(Base64.decode(opinion.formData))
                }
                _this.opinionMap[opinion.taskKey] = opinion
                _this.opinionList.push(opinion)
                _this.selectNodeId = _this.opinionList[0].taskKey
              }
            })
          }
        })
    }
  },
  methods: {
    onSelect(item) {
      this.validateFormData(item.className)
      this.showBtns = false
    },
    //取消按钮点击时触发
    onCancel() {
      this.showBtns = false
    },
    //更多按钮
    moreClick() {
      this.actions = []
      const showBtnAlias = [
        'saveDraft',
        'inqu',
        'addSign',
        'delegate',
        'startTrans',
        'endProcess',
        'hangUp',
        'oppose',
      ]
      for (let i = 0; i < this.rowsBtn.length; i++) {
        let btn = this.rowsBtn[i]
        //无强制签收配置  且有签收按钮
        if (btn.isLock == false && btn.alias == 'lockUnlock') {
          this.actions.push({
            name: (this.canLock == 1 ? '' : '取消') + btn.name,
            color: '#2161ff',
            className: btn.alias,
          })
        } else if (showBtnAlias.indexOf(btn.alias) > -1) {
          //正常审批
          this.actions.push({
            name: btn.name,
            color: '#2161ff',
            className: btn.alias,
          })
        }
      }
      this.showBtns = true
    },
    //打开审批意见输入对话框
    submitDialogOpen() {
      this.submitDialog = true
    },
    //关闭审批意见输入对话框
    submitDialogCancel() {
      this.text = '' //清空审批意见
      this.submitDialog = false
    },
    //确认
    async submitDialogConfirm() {
      // if (this.actionName == 'agree' && this.signatureField) {
      //   let _this = this
      //   this.isSignatureCallBack = false
      //   this.$store.dispatch('storeProcess/initSignature', {}).then(rep => {}) //点同意按钮先初始化状态
      //   this.$store
      //     .dispatch('storeProcess/doSignature', {
      //       status: 'start',
      //       field: this.signatureField,
      //       isCover: this.signatureCover,
      //       secretFree: this.secretFree,
      //       password: this.signaturePassword
      //     })
      //     .then(rep => {
      //       _this.signatureLoading = this.$loading({
      //         lock: true,
      //         text: '正在进行签章处理...',
      //         spinner: 'el-icon-loading',
      //         background: 'rgba(0, 0, 0, 0.7)'
      //       })
      //       // 设置5秒超时机制，如果超时则弹出提示
      //       setTimeout(function() {
      //         _this.signatureLoading.close()
      //         if (_this.isSignatureCallBack == false) {
      //           Notify({
      //             type: 'warning',
      //             message: '签章处理超时，请联系管理员确定是否配置签章控件。'
      //           })
      //           return
      //         }
      //       }, 5000)
      //     })
      // } else {
      //   this.doConfirm()
      // }
      //ccwgq 2022-04-26 更改签章逻辑
      if (this.actionName == 'agree' && this.ouSealable) {
        let boData = this.$parent.$refs.formContent.data
        const loadingInstance = this.$loading({
          text: '签章中',
        })
        const foData = boData['ht']
        const ourId = foData['our_id']
        const cfcStaId = foData['cfc_sta_id']
        const contId = foData['id_']
        if (this.signatureCode === '') {
          Notify({type: 'warning', message: '请先输入验证码'})
          // this.$message.error('请先输入验证码')
          return
        }
        let url, res
        // 查到安心签上面的印章id后请求插入新表数据
        let postData = {
          checkCode: this.signatureCode,
          businessType: 'contApply',
          businessId: foData['id_'],
          sealId: cfcStaId,
          orgId: ourId,
          sealColor: 1,
          crossPageStyle: 1, //骑缝章在左 2是右
        }
        url = `${window.context.sign}/sign/sign-param/v1/insertSignParam`
        res = await this.$http.post(url, postData)
        if (res.data && !res.data.state) {
          console.log('插入数据失败')
          loadingInstance.close()
          return
        }
        // 之后再去调用签章的接口
        const keyword = foData['sign_key_word']
        const orgId = '0'
        // console.log("keyword===>", keyword);
        // console.log("orgId===>", orgId);
        url = `${window.context.bpmRunTime}/eipx7/opun/runtime/sign/v1/v1/100001?businessType=1&id=${foData.id_}&keyword=${keyword}`
        res = await this.$http.post(url)
        if (res.data && !res.data.state) {
          loadingInstance.close()
          //  签章接口失败
          return
        }
        Notify({type: 'success', message: '签章成功'})
        // _this.$message.success('签章成功!')
        loadingInstance.close()
        this.doConfirm()
        //TODO:移动端新窗口打开合同附件
      } else if (
        this.actionName == 'agree' &&
        this.signatureField &&
        this.signatureCover
      ) {
        let _this = this
        this.isSignatureCallBack = false
        this.$store.dispatch('storeProcess/initSignature', {}).then((rep) => {}) //点同意按钮先初始化状态
        this.$store
          .dispatch('storeProcess/doSignature', {
            status: 'start',
            field: this.signatureField,
            isCover: this.signatureCover,
            secretFree: this.secretFree,
            password: this.signaturePassword,
          })
          .then((rep) => {
            _this.signatureLoading = this.$loading({
              lock: true,
              text: '正在进行签章处理...',
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.7)',
            })
            // 设置5秒超时机制，如果超时则弹出提示
            setTimeout(function () {
              _this.signatureLoading.close()
              if (_this.isSignatureCallBack == false) {
                Notify({
                  type: 'warning',
                  message: '签章处理超时，请联系管理员确定是否配置签章控件。',
                })
                return
              }
            }, 5000)
          })
      } else {
        this.doConfirm()
      }
      //  this.doConfirm()
    },
    doConfirm() {
      if (this.btnAilas == 'taskToInquReply') {
        //征询回复
        this.taskToInquReplySubmit()
      } else if (this.btnAilas == 'commuFeedBack') {
        //沟通反馈
        this.commuFeedBackSubmit()
      } else if (this.btnAilas == 'handleRead') {
        //抄送回复
        this.handleReadSubmit()
      } else if (this.btnAilas == 'endProcess') {
        //流程终止
        this.taskToEndProcessSubmit()
      } else if (this.btnAilas == 'handleRevoke') {
        //撤回
        this.handleRevokeSubmit()
      } else if (this.btnAilas == 'userAddSign') {
        this.userAddSign()
      } else {
        const this_ = this
        if (!this_.text) {
          if (
            this_.actionName == 'opposeTrans' ||
            this_.actionName == 'oppose'
          ) {
            Notify({type: 'warning', message: '请输入反对意见'})
            return
          }
          this_.text = '同意'
        }
        //如果存在反填字段，意见在此时反填
        if (this.opinionField) {
          this.opinionBackToForm()
        }
        utils.getOnlineFormData(true).then(
          (formDataStr) => {
            this_.doNextSubmit(formDataStr)
          },
          (reason) => {
            utils
              .handleGetFormDataReject(reason)
              .then(() => this_.doNextSubmit())
          }
        )
      }
    },
    //获取意见
    getOpinion(opinion) {
      this.text = opinion
      let opinioValue = this.$refs.opinionText.getOpinion()
      if (this.opinionField) {
        let currentUser = this.$store.state.login.currentUser
        let moment = require('moment')
        this.formatOpinion =
          opinioValue +
          this.wrap +
          currentUser.username +
          ' ' +
          moment().format('YYYY-MM-DD HH:mm:ss')
        //ccwgq 2022-06-14 回填的时机在确定按钮按下之后

        // let boData = this.$parent.$refs.formContent.data
        // let filed = this.opinionField.split('.')
        // if (boData[filed[0]][filed[1]] == '<p><br/></p>') {
        //   boData[filed[0]][filed[1]] = ''
        // }
        // //是否覆盖审批意见
        // if (this.appendOpinion) {
        //   if (opinioValue) {
        //     boData[filed[0]][filed[1]] =
        //       opinioValue +
        //       '\n' +
        //       currentUser.username +
        //       ' ' +
        //       moment().format('YYYY-MM-DD HH:mm:ss')
        //   }
        // } else {
        //   if (opinioValue) {
        //     opinioValue +=
        //       '\n' +
        //       currentUser.username +
        //       ' ' +
        //       moment().format('YYYY-MM-DD HH:mm:ss')
        //   }
        //   if (this.appendStr) {
        //     this.initBoAttr = boData[filed[0]][filed[1]]
        //   }
        //   if (filed.length == 2) {
        //     if (this.initBoAttr) {
        //       if (opinion) {
        //         boData[filed[0]][filed[1]] =
        //           this.initBoAttr + '\n\n' + opinioValue
        //       } else {
        //         boData[filed[0]][filed[1]] = this.initBoAttr
        //       }
        //     } else {
        //       boData[filed[0]][filed[1]] = opinioValue
        //     }
        //   }
        //   this.appendStr = false
        // }
        /*else if (filed.length==3 &&boData[filed[0]][filed[1]].length>0){//处理子表
          for (let i = 0; i <boData[filed[0]][filed[1]].length ; i++) {
            boData[filed[0]][filed[1]][i][filed[2]]=opinioValue;
          }
        }*/
      }
    },
    //ccwgq 审批意见回填到表单
    opinionBackToForm() {
      // debugger
      let boData = this.$parent.$refs.formContent.data
      let filed = this.opinionField.split('.')
      if (boData[filed[0]][filed[1]] == '<p><br/></p>') {
        boData[filed[0]][filed[1]] = ''
      }
      //是否覆盖审批意见
      if (this.appendOpinion) {
        if (this.formatOpinion) {
          boData[filed[0]][filed[1]] = this.formatOpinion
        }
      } else {
        if (this.appendStr) {
          this.initBoAttr = boData[filed[0]][filed[1]]
        }
        if (filed.length == 2) {
          if (this.initBoAttr) {
            //根据选项控制是否正序或者倒叙
            if (this.opinionSortOrder == 'desc') {
              boData[filed[0]][filed[1]] =
                this.formatOpinion + this.wrap + this.wrap + this.initBoAttr
            } else {
              boData[filed[0]][filed[1]] =
                this.initBoAttr + this.wrap + this.wrap + this.formatOpinion
            }
          } else {
            boData[filed[0]][filed[1]] = this.formatOpinion
          }
        }
        this.appendStr = false
      }
      /*else if (filed.length==3 &&boData[filed[0]][filed[1]].length>0){//处理子表
          for (let i = 0; i <boData[filed[0]][filed[1]].length ; i++) {
            boData[filed[0]][filed[1]][i][filed[2]]=opinioValue;
          }
        }*/
    },
    //执行前置脚本
    tempScript(script) {
      let _this = this
      let _req = req
      let boData = _this.$parent.$refs.formContent.data
      var script =
        'var tempFunction = function(_req,data,_this){ ' + script + '};'
      var result = eval(script + 'tempFunction(_req,boData,_this);')
      if (result && result.then && typeof result.then == 'function') {
        return result
      }
      if (result === false) return false
      return true
    },
    //保存按钮
    saveDraftBtn() {
      this.$store
        .dispatch('storeProcess/canLock', {
          taskId: this.taskId,
          leaderId: this.leaderId,
        })
        .then((canLock) => {
          //获取任务是否能锁定
          if (
            canLock == 4 &&
            this.$router.history.current.fullPath.indexOf('token') > -1
          ) {
            canLock = '5'
          }
          if (canLock == 4) {
            Notify({type: 'warning', message: '任务已被其他人签收了'})
          } else {
            this.taskSaveDraft()
          }
        })
    },
    //同意按钮
    agreeBtn() {
      this.$store
        .dispatch('storeProcess/canLock', {
          taskId: this.taskId,
          leaderId: this.leaderId,
        })
        .then((canLock) => {
          //获取任务是否能锁定
          if (
            canLock == 4 &&
            this.$router.history.current.fullPath.indexOf('token') > -1
          ) {
            canLock = '5'
          }
          if (canLock == 4) {
            Notify({type: 'warning', message: '任务已被其他人签收了'})
          } else {
            this.taskAgree()
          }
        })
    },
    checkInstStatus(ailas) {
      this.btnAilas = ailas
      if (this.btnAilas == 'hangUp') {
        // 流程挂起操作
        this.hangUp()
      } else if (this.btnAilas == 'cancelHangUp') {
        // 取消流程挂起操作
        this.cancelHangUp()
      } else {
        let this_ = this
        this.$http
          .get(
            '${bpmRunTime}/runtime/instance/v1/getDefStatus?instId=' +
              (this.instId || '') +
              '&taskId=' +
              (this.taskId || '')
          )
          .then(function (resp) {
            if (resp.data) {
              resp.data += ''
              if (resp.data.indexOf('1') > -1) {
                this_.disabled = true
                Notify({
                  type: 'warning',
                  message: '当前流程实例已被挂起，无法审批',
                })
              } else if (resp.data.indexOf('3') > -1) {
                this_.disabled = true
                Notify({
                  type: 'warning',
                  message: '当前流程定义已被禁止实例，无法审批',
                })
              } else {
                this.validateFormData(ailas)
              }
            } else if (ailas) {
              this.validateFormData(ailas)
            }
          })
      }
    },
    //提交事件
    validateFormData(ailas) {
      let _this = this
      //获取VUE表单实例(判断是否是在线表单)
      if (document.getElementsByName('online-form')[0]) {
        let tables =
          document.getElementsByName('online-form')[0].__vue__.permission.table //获取子表权限
        let boData = document.getElementsByName('online-form')[0].__vue__.data //获取表单bo对象
        let zData = {}
        for (let k in boData) {
          zData = boData[k]
        }
        for (let key in tables) {
          //如果有导入属性，则表明不是子表而是数据报表，不做必填校验
          if (tables[key] && tables[key].hasOwnProperty('export')) {
            continue
          }
          if (
            (tables[key].required == true || tables[key].required == 'true') &&
            zData['sub_' + key] &&
            zData['sub_' + key].length == 0
          ) {
            Notify({type: 'warning', message: '子表必填一条记录'})
            return
          }
        }
      }
      let me_ = this
      //签收和取消签收不做表单数据校验,
      //ccwgq 2021-10-12 驳回不做数据校验
      if (['lockUnlock', 'reject'].includes(ailas)) {
        me_.submitFormData(ailas)
        return
      }
      utils.getOnlineFormData(true).then(
        (formDataStr) => {
          me_.submitFormData(ailas)
        },
        (reason) => {
          utils
            .handleGetFormDataReject(reason)
            .then(() => me_.submitFormData(ailas))
        }
      )
    },
    submitFormData(ailas) {
      this.btnAilas = ailas
      if (this.btnAilas == 'saveDraft') {
        //保存
        let _this = this
        let item = utils.indexOfList(_this.rowsBtn, 'alias', _this.btnAilas)
        let beforeScript = item.beforeScript //前置脚本
        let scriptResult = this.tempScript(beforeScript)
        //执行前置脚本返回false时终止按钮操作
        if (scriptResult === false) return
        //执行前置脚本返回的接口时先执行前置事件接口
        if (scriptResult.then && typeof scriptResult.then == 'function') {
          scriptResult.then(
            function (success) {
              //接口返回成功则正常执行按钮操作
              _this.saveDraftBtn()
            },
            function (fail) {
              //接口返回失败则终止按钮操作，并给与提示
              Notify({type: 'warning', message: fail})
              return
            }
          )
        } else {
          //执行前置脚本返回true时正常执行按钮操作
          _this.saveDraftBtn()
        }
      } else if (this.btnAilas == 'agree') {
        //同意
        let _this = this
        let item = utils.indexOfList(_this.rowsBtn, 'alias', _this.btnAilas)
        let beforeScript = item.beforeScript //前置脚本
        let scriptResult = this.tempScript(beforeScript)
        //执行前置脚本返回false时终止按钮操作
        if (scriptResult === false) return
        //执行前置脚本返回的接口时先执行前置事件接口
        if (scriptResult.then && typeof scriptResult.then == 'function') {
          scriptResult.then(
            function (success) {
              //接口返回成功则正常执行按钮操作
              _this.agreeBtn()
            },
            function (fail) {
              //接口返回失败则终止按钮操作，并给与提示
              Notify({type: 'warning', message: fail})
              return
            }
          )
        } else {
          //执行前置脚本返回true时正常执行按钮操作
          _this.agreeBtn()
        }
      } else if (this.btnAilas == 'handleRead') {
        //抄送回复
        this.handleRead()
      } else if (this.btnAilas == 'handleRevoke') {
        //撤回
        if (this.taskSignLines.length > 0) {
          this.handleRevoke()
        } else {
          this.openRevoke()
        }
      } else if (this.btnAilas == 'commuFeedBack') {
        //沟通反馈
        this.commuFeedBack()
      } else if (this.btnAilas == 'taskToInquReply') {
        //征询回复
        this.taskToInquReply()
      } else if (this.btnAilas == 'userAddSign') {
        //普通节点加签反馈
        this.submitDialogOpen()
      } else if (this.btnAilas == 'reject') {
        //驳回
        let _this = this
        let item = utils.indexOfList(_this.rowsBtn, 'alias', _this.btnAilas)
        let beforeScript = item.beforeScript //前置脚本
        let scriptResult = this.tempScript(beforeScript)
        //执行前置脚本返回false时终止按钮操作
        if (scriptResult === false) return
        //执行前置脚本返回的接口时先执行前置事件接口
        if (scriptResult.then && typeof scriptResult.then == 'function') {
          scriptResult.then(
            function (success) {
              //接口返回成功则正常执行按钮操作
              this.taskToReject()
            },
            function (fail) {
              //接口返回失败则终止按钮操作，并给与提示
              Notify({type: 'warning', message: fail})
              return
            }
          )
        } else {
          //执行前置脚本返回true时正常执行按钮操作
          this.taskToReject()
        }
      } else if (this.btnAilas == 'delegate') {
        //转办
        this.taskToDelegate()
      } else if (this.btnAilas == 'inqu') {
        //征询
        this.taskToInqu()
      } else if (this.btnAilas == 'endProcess') {
        //流程终止
        let _this = this
        let item = utils.indexOfList(_this.rowsBtn, 'alias', _this.btnAilas)
        let beforeScript = item.beforeScript //前置脚本
        let scriptResult = this.tempScript(beforeScript)
        //执行前置脚本返回false时终止按钮操作
        if (scriptResult === false) return
        //执行前置脚本返回的接口时先执行前置事件接口
        if (scriptResult.then && typeof scriptResult.then == 'function') {
          scriptResult.then(
            function (success) {
              //接口返回成功则正常执行按钮操作
              this.taskToEndProcess()
            },
            function (fail) {
              //接口返回失败则终止按钮操作，并给与提示
              Notify({type: 'warning', message: fail})
              return
            }
          )
        } else {
          //执行前置脚本返回true时正常执行按钮操作
          this.taskToEndProcess()
        }
      } else if (this.btnAilas == 'startTrans') {
        //流转
        let _this = this
        let item = utils.indexOfList(_this.rowsBtn, 'alias', _this.btnAilas)
        let beforeScript = item.beforeScript //前置脚本
        let scriptResult = this.tempScript(beforeScript)
        //执行前置脚本返回false时终止按钮操作
        if (scriptResult === false) return
        //执行前置脚本返回的接口时先执行前置事件接口
        if (scriptResult.then && typeof scriptResult.then == 'function') {
          scriptResult.then(
            function (success) {
              //接口返回成功则正常执行按钮操作
              this.taskToTrans()
            },
            function (fail) {
              //接口返回失败则终止按钮操作，并给与提示
              Notify({type: 'warning', message: fail})
              return
            }
          )
        } else {
          //执行前置脚本返回true时正常执行按钮操作
          this.taskToTrans()
        }
      } else if (this.btnAilas == 'addSign') {
        let _this = this
        let item = utils.indexOfList(_this.rowsBtn, 'alias', _this.btnAilas)
        let beforeScript = item.beforeScript //前置脚本
        let scriptResult = this.tempScript(beforeScript)
        //执行前置脚本返回false时终止按钮操作
        if (scriptResult === false) return
        //执行前置脚本返回的接口时先执行前置事件接口
        if (scriptResult.then && typeof scriptResult.then == 'function') {
          scriptResult.then(
            function (success) {
              //接口返回成功则正常执行按钮操作
              _this.taskToAddSign()
            },
            function (fail) {
              //接口返回失败则终止按钮操作，并给与提示
              Notify({type: 'warning', message: fail})
              return
            }
          )
        } else {
          //执行前置脚本返回true时正常执行按钮操作
          _this.taskToAddSign()
        }
      } else if (this.btnAilas == 'taskDelay') {
        //任务延期
        let _this = this
        let item = utils.indexOfList(_this.rowsBtn, 'alias', _this.btnAilas)
        let beforeScript = item.beforeScript //前置脚本
        let scriptResult = this.tempScript(beforeScript)
        //执行前置脚本返回false时终止按钮操作
        if (scriptResult === false) return
        //执行前置脚本返回的接口时先执行前置事件接口
        if (scriptResult.then && typeof scriptResult.then == 'function') {
          scriptResult.then(
            function (success) {
              //接口返回成功则正常执行按钮操作
              this.taskToDelay()
            },
            function (fail) {
              //接口返回失败则终止按钮操作，并给与提示
              Notify({type: 'warning', message: fail})
              return
            }
          )
        } else {
          //执行前置脚本返回true时正常执行按钮操作
          this.taskToDelay()
        }
      } else if (this.btnAilas == 'agreeTrans') {
        //同意（流转）
        let _this = this
        let item = utils.indexOfList(_this.rowsBtn, 'alias', _this.btnAilas)
        let beforeScript = item.beforeScript //前置脚本
        let scriptResult = this.tempScript(beforeScript)
        //执行前置脚本返回false时终止按钮操作
        if (scriptResult === false) return
        //执行前置脚本返回的接口时先执行前置事件接口
        if (scriptResult.then && typeof scriptResult.then == 'function') {
          scriptResult.then(
            function (success) {
              //接口返回成功则正常执行按钮操作
              _this.taskAgreeTrans()
            },
            function (fail) {
              //接口返回失败则终止按钮操作，并给与提示
              Notify({type: 'warning', message: fail})
              return
            }
          )
        } else {
          //执行前置脚本返回true时正常执行按钮操作
          this.taskAgreeTrans()
        }
      } else if (this.btnAilas == 'opposeTrans') {
        //反对（流转）
        let _this = this
        let item = utils.indexOfList(_this.rowsBtn, 'alias', _this.btnAilas)
        let beforeScript = item.beforeScript //前置脚本
        let scriptResult = this.tempScript(beforeScript)
        //执行前置脚本返回false时终止按钮操作
        if (scriptResult === false) return
        //执行前置脚本返回的接口时先执行前置事件接口
        if (scriptResult.then && typeof scriptResult.then == 'function') {
          scriptResult.then(
            function (success) {
              //接口返回成功则正常执行按钮操作
              this.taskOpposeTrans()
            },
            function (fail) {
              //接口返回失败则终止按钮操作，并给与提示
              Notify({type: 'warning', message: fail})
              return
            }
          )
        } else {
          //执行前置脚本返回true时正常执行按钮操作
          this.taskOpposeTrans()
        }
      } else if (this.btnAilas == 'oppose') {
        //反对
        let _this = this
        let item = utils.indexOfList(_this.rowsBtn, 'alias', _this.btnAilas)
        let beforeScript = item.beforeScript //前置脚本
        let scriptResult = this.tempScript(beforeScript)
        //执行前置脚本返回false时终止按钮操作
        if (scriptResult === false) return
        //执行前置脚本返回的接口时先执行前置事件接口
        if (scriptResult.then && typeof scriptResult.then == 'function') {
          scriptResult.then(
            function (success) {
              //接口返回成功则正常执行按钮操作
              this.taskOppose()
            },
            function (fail) {
              //接口返回失败则终止按钮操作，并给与提示
              Notify({type: 'warning', message: fail})
              return
            }
          )
        } else {
          //执行前置脚本返回true时正常执行按钮操作
          this.taskOppose()
        }
      } else if (this.btnAilas == 'lockUnlock') {
        //签收
        this.$store
          .dispatch('storeProcess/canLock', this.taskId)
          .then((canLock) => {
            //获取任务是否能锁定
            if (
              canLock == 4 &&
              this.$router.history.current.fullPath.indexOf('token') > -1
            ) {
              canLock = '5'
            }
            if (canLock == 4) {
              Notify({type: 'warning', message: '任务已被其他人签收了'})
            } else {
              this.lockUnlock()
            }
          })
      } else if (this.btnAilas == 'approveLine') {
        //并行审批
        this.taskApproveLine()
      } else if (this.btnAilas == 'signSequence') {
        // 顺序签署
        this.taskSignSequence()
      } else if (this.btnAilas == 'hangUp') {
        this.hangUp()
      } else {
        // 并行签署
        this.taskSignLine()
      }
    },
    //保存
    taskSaveDraft() {
      const loading = this.$loading({
        lock: true,
        text: '表单数据保存中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)',
      })
      utils.getOnlineFormData(false).then(
        (formDataStr) => {
          let data = this.handleFormData(formDataStr)
          data.defId = this.defId
          data.approval = true
          //2022-07-06 yigz:修复提醒消息不产生问题 => 接口需要添加formKey参数
          data.formKey = this.$parent.$refs.formContent.$parent.tasks.formKey
          this.$store
            .dispatch('storeProcess/saveDraft', data)
            .then(() => {
              loading.close()
              if (JSON.stringify(this.$route.query) == '{}') {
                this.$router.go(-1)
              } else {
                this.$router.push('/home')
              }
            })
            .catch(() => {
              loading.close()
            })
        },
        (reason) => {
          loading.close()
          utils.handleGetFormDataReject(reason)
        }
      )
    },
    //抄送回复
    handleRead() {
      this.submitDialogOpen()
    },
    handleReadSubmit() {
      if (this.$refs.opinionText.getOpinion() == '') {
        Notify({type: 'warning', message: '请输入回复意见'})
      } else {
        let files = ''
        let zfiles = ''
        // this.$refs.fileUpload.isFinishUpload();
        // this.$refs.zfileUpload.isFinishUpload();

        // if (this.$refs.zfileUpload && this.$refs.zfileUpload.getFiles() != "") {
        //   zfiles = JSON.stringify(this.$refs.zfileUpload.getFiles());
        // }
        // if (this.$refs.fileUpload && this.$refs.fileUpload.getFiles() != "") {
        //   files = JSON.stringify(this.$refs.fileUpload.getFiles());
        // }
        let data = {
          instId: this.instId,
          taskId: this.taskId,
          opinion: this.$refs.opinionText.getOpinion(),
          files: files,
          zfiles: zfiles,
        }
        this.$store.dispatch('storeProcess/doNextCopyto', data).then(() => {
          if (this.token != null) {
            window.close()
          } else {
            this.$router.go(-1)
          }
        })
      }
    },
    // 准备要提交的数据
    handleFormData(formDataStr) {
      let files = ''
      let zfiles = ''
      //   this.$refs.fileUpload.isFinishUpload();
      //   this.$refs.zfileUpload.isFinishUpload();

      //   if (this.$refs.zfileUpload && this.$refs.zfileUpload.getFiles() != "") {
      //     zfiles = JSON.stringify(this.$refs.zfileUpload.getFiles());
      //   }
      //   if (this.$refs.fileUpload && this.$refs.fileUpload.getFiles() != "") {
      //     files = JSON.stringify(this.$refs.fileUpload.getFiles());
      //   }
      let opinion = ''
      if (this.$refs.opinionText && this.$refs.opinionText.getOpinion() != '') {
        opinion = this.$refs.opinionText.getOpinion()
      }

      let data = {
        taskId: this.taskId,
        actionName: this.actionName,
        destination: '',
        files: files,
        zfiles: zfiles,
        opinion: opinion,
        jumpType: '',
        agentLeaderId: this.leaderId,
        nodeUsers: '[]',
      }
      if (formDataStr) {
        if (formDataStr.businessKey) {
          data.businessKey = formDataStr.businessKey
          data.sysCode = formDataStr.sysCode
          data.formType = 'frame'
          if (formDataStr.vars) {
            data.vars = formDataStr.vars
          }
        } else {
          data.data = Base64.encode(formDataStr)
          data.formType = 'inner'
        }
      }

      if (window.urgentStateValue) {
        data.urgentStateValue = window.urgentStateValue
      }

      return data
    },
    //获取任务锁定状态
    lockUnlock() {
      this.$store.dispatch('storeProcess/lockUnlock', this.taskId).then(() => {
        // this.$router.go(this.$router.currentRoute);
        utils.reload()
      })
    },
    //签署撤回撤回到上一个节点
    handleRevoke() {
      let curOpinion = this.opinionMap[this.selectNodeId]
      if (curOpinion.needGetRevokeTasks) {
        let data = {
          instanceId: this.instId,
          nodeId: curOpinion.taskKey,
          taskId: curOpinion.taskId,
        }
        this.$store
          .dispatch('storeProcess/getSignLinesInstIdNodeId', data)
          .then((data) => {
            this.taskSignLines = data
            this.dialogFormVisible = true
          })
          .catch(() => {
            this.dialogFormVisible = false
          })
      } else {
        this.dialogFormVisible = true
      }
    },
    openRevoke() {
      this.submitDialogOpen()
    },
    handleRevokeSubmit() {
      if (this.$refs.opinionText.getOpinion() == '') {
        Notify({type: 'warning', message: '请输入撤回内容'})
      } else {
        // Dialog.confirm({
        //   title: "提示",
        //   message: "确认是否撤回?"
        // }).then(() => {
        this.saveRevoke()
        // }).catch(() => {
        //     this.text="";
        // });
      }
    },
    //撤回
    saveRevoke() {
      let curOpinion = this.opinionMap[this.selectNodeId]
      let data = {
        instanceId: this.instId,
        cause: this.text,
        taskId: curOpinion.taskId,
        revokeNodeId: this.selectNodeId,
      }
      //用户任务1,直接使用撤回到发起人的逻辑
      if (!curOpinion.revokeStart) {
        data.isHandRevoke = true
      } else {
        data.isHandRevoke = false
      }
      //正常撤回
      let revokeUrl = 'storeProcess/revokeInstance'
      // 签署撤回
      if (
        curOpinion.signType &&
        curOpinion.signType != 'AfterSign' &&
        curOpinion.opinionStatus != 'deliverto' &&
        this.instStatus != 'end'
      ) {
        revokeUrl = 'storeProcess/revokeCustomSign'
        data = {
          currentTaskIds: this.inApprovalTaskIds.join(','),
          instanceId: this.instId,
          cause: this.text,
          targetTaskId: curOpinion.taskId,
          targetNodeId: this.selectNodeId,
          signType: curOpinion.signType,
        }
      }
      const loading = this.$loading({
        lock: true,
        text: '任务撤回中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)',
      })
      this.$store
        .dispatch(revokeUrl, data)
        .then((value) => {
          loading.close()
          this.dialogFormVisible = false
          this.text = ''
          this.$router.go(-1)
        })
        .catch(() => {
          loading.close()
        })
    },
    //取消从以下人员中撤回工作项
    exitRevoke() {
      this.dialogFormVisible = false
      this.text = ''
    },
    //沟通反馈
    commuFeedBack() {
      this.submitDialogOpen()
    },
    commuFeedBackSubmit() {
      if (this.$refs.opinionText.getOpinion() == '') {
        Notify({type: 'warning', message: '请输入意见内容'})
      } else {
        let files = ''
        let zfiles = ''
        // this.$refs.fileUpload.isFinishUpload();
        // this.$refs.zfileUpload.isFinishUpload();

        // if (this.$refs.zfileUpload && this.$refs.zfileUpload.getFiles() != "") {
        //   zfiles = JSON.stringify(this.$refs.zfileUpload.getFiles());
        // }
        // if (this.$refs.fileUpload && this.$refs.fileUpload.getFiles() != "") {
        //   files = JSON.stringify(this.$refs.fileUpload.getFiles());
        // }
        const loading = this.$loading({
          lock: true,
          text: '任务反馈中，请耐心等待...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)',
        })
        let data = {
          instId: this.instId,
          taskId: this.taskId,
          opinion: this.$refs.opinionText.getOpinion(),
          files: files,
          zfiles: zfiles,
        }
        this.$store
          .dispatch('storeProcess/doNextcommu', data)
          .then(() => {
            loading.close()
            if (this.token != null) {
              window.close()
            } else {
              this.$router.go(-1)
            }
          })
          .catch(() => {
            loading.close()
          })
      }
    },
    userAddSign() {
      if (this.$refs.opinionText.getOpinion() == '') {
        Notify({type: 'warning', message: '请输入意见内容'})
      } else {
        let files = ''
        let zfiles = ''
        let data = {
          procDefId: this.defId,
          procInstId: this.instId,
          status: 'inqu_reply',
          taskId: this.taskId,
          opinion: this.$refs.opinionText.getOpinion(),
          files: files,
          zfiles: zfiles,
        }
        this.$store.dispatch('storeProcess/userAddSign', data).then(() => {
          if (this.token != null) {
            window.close()
          } else {
            this.$router.go(-1)
          }
        })
      }
    },
    //征询回复
    taskToInquReply() {
      this.submitDialogOpen()
    },
    taskToInquReplySubmit() {
      if (this.$refs.opinionText.getOpinion() == '') {
        Notify({type: 'warning', message: '请输入意见内容'})
      } else {
        let files = ''
        let zfiles = ''
        // this.$refs.fileUpload.isFinishUpload();
        // this.$refs.zfileUpload.isFinishUpload();

        // if (this.$refs.zfileUpload && this.$refs.zfileUpload.getFiles() != "") {
        //   zfiles = JSON.stringify(this.$refs.zfileUpload.getFiles());
        // }
        // if (this.$refs.fileUpload && this.$refs.fileUpload.getFiles() != "") {
        //   files = JSON.stringify(this.$refs.fileUpload.getFiles());
        // }
        const loading = this.$loading({
          lock: true,
          text: '任务回复中，请耐心等待...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)',
        })
        let data = {
          procDefId: this.defId,
          procInstId: this.instId,
          status: 'inqu_reply',
          taskId: this.taskId,
          opinion: this.$refs.opinionText.getOpinion(),
          files: files,
          zfiles: zfiles,
          formData: JSON.stringify(this.$parent.$refs.formContent.data),
        }
        this.$store
          .dispatch('storeProcess/taskToInquReply', data)
          .then(() => {
            loading.close()
            if (this.token != null) {
              window.close()
            } else {
              this.$router.go(-1)
            }
          })
          .catch(() => {
            loading.close()
          })
      }
    },
    //驳回设置
    taskToReject() {
      // if (this.$refs.opinionText.getOpinion() == "") {
      //   Notify({
      //     type: "warning",
      //     message: "请填写驳回审批意见"
      //   });
      //   return;
      // }
      let parentTaskId = '' //用户任务加签后的父任务ID
      if (this.nodeType == 'USERTASK' && this.tasks.bpmTask.parentId != '0') {
        //用户任务加签
        parentTaskId = this.tasks.bpmTask.parentId
      }
      this.$refs.taskToReject.handleOpen(parentTaskId, this) //父组件调用子组件方法
    },
    //转办设置
    taskToDelegate() {
      this.$refs.taskToDelegate.handleClose(
        this.opinionField,
        this.$parent.$refs.formContent.data,
        this.appendOpinion
      ) //父组件调用子组件方法
    },
    // //流程抄送
    // taskToCopyTo() {
    //   this.$refs.taskToCopyTo.handleClose(); //父组件调用子组件方法
    // },
    //征询设置
    taskToInqu() {
      if (this.status != 'TRANSFORMEDINQU') {
        this.$refs.taskToInqu.showType()
      }
      this.$refs.taskToInqu.handleClose(
        this.opinionField,
        this.$parent.$refs.formContent.data,
        this.appendOpinion
      ) //父组件调用子组件方法
    },
    //流程终止
    taskToEndProcess() {
      this.submitDialogOpen()
    },
    taskToEndProcessSubmit() {
      if (this.$refs.opinionText.getOpinion() == '') {
        Notify({type: 'warning', message: '请填写终止原因'})
        return
      }
      const loading = this.$loading({
        lock: true,
        text: '任务终止中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)',
      })
      let files = ''
      this.$store
        .dispatch('login/validAndCompletedCurrent')
        .then(() => {
          let data = {
            taskId: this.taskId,
            endReason: this.$refs.opinionText.getOpinion(),
            messageType: 'inner',
            account: this.currentUser.account,
            files: files,
          }
          this.$store
            .dispatch('storeProcess/doEndProcess', data)
            .then(() => {
              loading.close()
              this.endProcessDialog = false
              if (this.token != null) {
                window.close()
              } else {
                this.$router.go(-1)
              }
            })
            .catch(() => {
              loading.close()
            })
        })
        .catch(() => {
          loading.close()
        })
    },
    //流转设置
    taskToTrans() {
      this.$refs.taskToTrans.handleClose(
        this.opinionField,
        this.$parent.$refs.formContent.data,
        this.appendOpinion
      ) //父组件调用子组件方法
    },
    //加签设置
    taskToAddSign() {
      this.$refs.taskToAddSign.handleClose(this.nodeType, this.instId) //父组件调用子组件方法
    },
    //任务延期
    taskToDelay() {
      this.$refs.taskToDelay.handleClose() //父组件调用子组件方法
    },
    //并行审批
    taskApproveLine() {
      this.$refs.taskToApproveLine.handleClose() //父组件调用子组件方法
    },
    // 顺序签署
    taskSignSequence() {
      this.$refs.taskToSignSequence.handleClose() //父组件调用子组件方法
    },
    // 并行签署
    taskSignLine() {
      this.$refs.taskToSignLine.handleClose() //父组件调用子组件方法
    },
    doNext() {
      this.submitDialogOpen()
    },
    doNextSubmit(formDataStr) {
      const this_ = this
      let data = this_.handleFormData(formDataStr)

      data.opinion = this_.text
      //2022-07-06 yigz:修复提醒消息不产生问题 => 接口需要添加formKey参数
      data.formKey = this_.$parent.$refs.formContent.$parent.tasks.formKey
      if (this.nodeType == 'USERTASK' && this.tasks.bpmTask.parentId != '0') {
        //用户任务加签
        if (this.actionName == 'oppose') {
          data.addSignAction = 'opposeTrans'
        } else if (this.actionName == 'agree') {
          data.addSignAction = 'agreeTrans'
        }
      }
      const loading = this.$loading({
        lock: true,
        text: '任务处理中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)',
      })
      if (
        (this_.choiceExcutor || this_.jumpType) &&
        this_.instStatus != 'back' &&
        this_.instStatus != 'backToStart' &&
        !this_.taskStatusArray.includes(this_.status)
      ) {
        this_.$store
          .dispatch('storeProcess/getAfterJumpNodes', {
            taskId: this_.taskId,
            data: data.data,
            defId: '',
            instId: '',
          })
          .then((res) => {
            if (
              res.afterNodes.length == 0 ||
              (res.afterNodes.length == 1 &&
                res.afterNodes[0].excutorList != undefined &&
                res.afterNodes[0].excutorList.length == 1)
            ) {
              this_.$store
                .dispatch('storeProcess/complete', data)
                .then(() => {
                  loading.close()
                  if (this_.token != null) {
                    window.close()
                  } else {
                    this_.$router.go(-1)
                  }
                })
                .catch(() => {
                  loading.close()
                })
            } else {
              loading.close()
              this_.$refs.taskSelectDestination.showDailog(
                data.data,
                data.files,
                data.zfiles,
                data.opinion
              )
            }
          })
      } else {
        this_.$store
          .dispatch('storeProcess/complete', data)
          .then(() => {
            loading.close()
            if (this_.token != null) {
              window.close()
            } else {
              this_.$router.go(-1)
            }
          })
          .catch(() => {
            loading.close()
          })
      }
    },
    //同意
    taskAgree() {
      this.actionName = 'agree'
      this.doNext()
    },
    //同意（流转）
    taskAgreeTrans() {
      this.actionName = 'agreeTrans'
      this.doNext()
    },
    //反对
    taskOppose() {
      this.actionName = 'oppose'
      this.doNext()
    },
    //反对（流转）
    taskOpposeTrans() {
      this.actionName = 'opposeTrans'
      this.doNext()
    },
    //挂起
    hangUp() {
      let this_ = this
      req
        .get(
          '${bpmRunTime}/runtime/instance/v1/forbiddenInstance?instId=' +
            this.instId
        )
        .then((resp) => {
          if (resp.data.state) {
            Notify({type: 'success', message: resp.data.message})
            this.$store.dispatch(
              'storeProcess/taskDetail',
              this.taskId + '&reqParams=&leaderId=' + this.leaderId
            ) //获取操作按钮
            this_.$set(this_, 'disabled', true)
          }
        })
    },
    // 取消挂起
    cancelHangUp() {
      let this_ = this
      req
        .get(
          '${bpmRunTime}/runtime/instance/v1/unForbiddenInstance?instId=' +
            this.instId
        )
        .then((resp) => {
          if (resp.data.state) {
            Notify({type: 'success', message: resp.data.message})
            this.$store.dispatch(
              'storeProcess/taskDetail',
              this.taskId + '&reqParams=&leaderId=' + this.leaderId
            ) //获取操作按钮
            this_.$set(this_, 'disabled', false)
          }
        })
    },
    //ccwgq 2021-10-22  发送用印的验证码
    async getSignCode() {
      this.signBtnDisabled = false
      let boData = this.$parent.$refs.formContent.data
      const foData = boData['ht']
      const ourId = foData['our_id']
      const cfcStaId = foData['cfc_sta_id']
      const contId = foData['id_']
      let url, res
      //生成项目编号
      url = `${window.context.sign}/sign/sign-business/v1/generateProjectCode`
      const sendData = {
        businessType: 'contApply',
        businessId: foData.id_,
      }
      res = await window.app.$http.post(url, sendData)
      if (!res.data || !res.data.state) {
        Notify({type: 'warning', message: '发送验证码失败'})
        // this.$message.error('发送验证码失败')
        return
      }
      //查询验证码
      url = `${window.context.sign}/sign/sign-business/v1/queryProjectCode?businessType=contApply&businessId=${sendData.businessId}`
      res = await this.$http.get(url)
      if (!res.data || !res.data.state) {
        Notify({type: 'warning', message: '发送验证码失败'})
        // this.$message.error('发送验证码失败')
        return
      }
      const projectCode = res.data.value
      //发送验证码
      url = `${window.context.sign}/sms/sms-info/v1`
      const data = {
        projectCode: projectCode,
        isSendVoice: 0,
        businessType: 'contApply',
        businessId: foData.id_,
        code: ourId,
      }
      res = await this.$http.post(url, data)
      if (!res.data || !res.data.state) {
        Notify({type: 'warning', message: '发送验证码失败'})
        // this.$message.error('发送验证码失败')
        return
      }
      Notify({type: 'success', message: '验证码发送成功'})
      // this.$message.success('验证码发送成功')
      //
      // 发送成功后验证码
      this.signBtnTimer = setInterval(() => {
        if (this.signBtnLeft > 0) {
          this.signBtnDisabled = true
          this.signBtnText = `${this.signBtnLeft}s重发`
          this.signBtnLeft--
        } else {
          this.signBtnText = this.$options.data().signBtnText
          this.signBtnDisabled = false
          clearInterval(this.signBtnTimer)
          this.signBtnLeft = 60
        }
      }, 1000)
    },
  },
}
</script>
<style lang="stylus" scoped>
div>>>.van-grid-item__icon {
  font-size: 15px;
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
  background-color: #eee;
}

.action-btn {
  float: left;
  padding-right: 5px;
}

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

.ht-dialog-footer {
  height: 45px;
  position: fixed;
  bottom: 0;
  width: 100%;
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

.title-divider {
  margin: 0;
  padding: 10px 10px 10px;
  color: rgba(69, 90, 100, 0.6);
  font-weight: normal;
  font-size: 14px;
  line-height: 16px;
  background: #F7F8FA;
}

.van-field {
  padding: 10px 26px;
}

.footer {
  height: 45px;
  position: fixed;
  bottom: 0;
  width: 100%;
}

.xh-star {
  color: red;
}

.van-radio-group .van-radio {
  margin-bottom: 8px;
}

div>>>.el-dialog .el-dialog__body {
  padding: 0px;
  height: calc(100% - 115px);
}

.opinion-text {
  padding: 5px;
}

>>>.el-col-2 {
  width: 14.33333%;
}

>>>.el-col-22 {
  width: 85.66667%;
}

>>>.v-modal {
  z-index: z-index;
}

.form-container {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
}

.form-container > span {
  border-left: 3px solid #2761ff;
  font-weight: bold;
  font-size: 14px;
  padding-left: 10px;
  color: #666;
}

.footer {
  height: 44px;
  bottom: 0;
  width: 100%;
}

.vb_w {
  // width: 33.333%;
}
</style>
