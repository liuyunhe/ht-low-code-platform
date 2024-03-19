<template>
  <div class="actiondiv">
    <div ref="btnRegion" class="actiondiv__header">
      <!--待办-->
      <template
        v-if="
          type != 'done' &&
          type != 'request' &&
          type != 'read' &&
          type != 'delegate' &&
          task_state != 'FOLLOW' &&
          myReadType != 'myRequest'
        "
      >
        <!--征询任务-->
        <div v-if="status == 'TRANSFORMEDINQU'">
          <div class="action-btn">
            <el-button type="primary" @click="submitRevoke('taskToInquReply')">征询回复</el-button>
          </div>
          <div class="action-btn">
            <el-button type="default" @click="submitRevoke('inqu')">征询</el-button>
          </div>
        </div>
        <!--加签任务-->
        <!-- 2022-08-31：yigz 加签 修改为 会签 -->
        <div v-else-if="status == 'USERADDSIGN'" class="action-btn">
          <el-button type="primary" @click="submitRevoke('userAddSign')">会签反馈</el-button>
        </div>
        <!--沟通任务-->
        <!-- 2022-10-08 yigz:原来的沟通反馈，文字修改未“会签反馈”，功能还是原来的沟通反馈功能 -->
        <div v-else-if="status == 'COMMU'" class="action-btn">
          <el-button type="primary" @click="submitRevoke('commuFeedBack')">会签反馈</el-button>
        </div>

        <!--正常待办任务-->
        <div v-else>
          <!--配置强制签收，并且可以签收的情况下。只显示签收按钮-->
          <!-- ninghua测试按钮点击跳转 -->
          <!-- <el-button @click="submitRevoke('taskToInquReply')">征询回复</el-button> -->
          <div
            class="action-btn"
            v-for="(item, index) in rowsBtn"
            :key="index"
            v-show="!forceLock || canLock != 1 || item.alias == 'lockUnlock'"
          >
            <!--常规按钮-->
            <el-button
              :type="getType(item.alias)"
              v-if="
                item.alias != 'lockUnlock' &&
                item.alias != 'hangUp' &&
                item.alias != 'cancelHangUp'
              "
              @click="submitRevoke(item.alias)"
              :disabled="disabled"
            >{{ item.name }}</el-button>
            <!--自由跳转-->
            <el-button
              :type="getType(item.alias)"
              v-if="item.alias == 'agree' && $route.query.type === 'free'"
              :disabled="disabled"
              @click="submitRevoke(item.alias)"
            >自由跳转</el-button>

            <!--签收/取消签收-->
            <el-button
              :type="getType(item.alias)"
              v-if="item.alias == 'lockUnlock'"
              :disabled="disabled"
              @click="submitRevoke(item.alias)"
            >{{ (canLock == 1 ? '' : '取消') + item.name }}</el-button>
            <!--挂起-->
            <el-button
              :type="getType(item.alias)"
              v-if="item.alias == 'hangUp' && !isHang"
              @click="hangUp"
            >{{ item.name }}</el-button>
            <!--取消挂起-->
            <el-button
              :type="getType(item.alias)"
              v-if="item.alias == 'cancelHangUp' && isHang"
              @click="cancelHangUp"
            >{{ item.name }}</el-button>
            <!-- 2022-10-09:yigz 原来的沟通功能，文字修改为 会签 -->
            <!-- TODO:后续转移到管理端中 -->
            <!-- ninghua 20221105 :给会签按钮加上是否是台账的判断 -->
            <!-- <el-button
              v-if="index == 0 && !isTaiZhang"
              :type="getType('commu')"
              @click="taskToCommu"
            >会签</el-button> -->
          </div>
        </div>
      </template>
      <!--已办或我的请求-->
      <template v-if="type == 'done' || type == 'request'">
        <el-button type="danger" v-if="sponsorRevoke" @click="submitRevoke('handleRevoke')">强制收回</el-button>
      </template>
      <!--yigz:2022-10-21 入库公文 暂时隐藏强制收回按钮,因为在入库公文中调用强制收回功能出现接口500问题 -->
      <!-- <template v-if="type !== 'read'">
        <el-button type="danger" @click="submitRevoke('handleRevoke')"
          >强制收回</el-button
        >
      </template>-->
      <!--抄送-->
      <template v-if="type !== 'read' && type !== undefined">
        <!-- yigz 2022-10-20:修复我的请求-运行中数据的 回复 按钮问题 -->
        <el-button v-if="type !== 'request'" type="primary" @click="submitRevoke('handleRead')">回复</el-button>
      </template>

      <!-- yigz 2022-11-05:抄送公文页面 “关闭”按钮改为“结束抄送” -->
      <!-- ninghua 20221121:结束抄送按钮单独设置回调 -->
      <el-button
        type="warning"
        @click="EndCC()"
        v-if="type == 'read' && currentRouteName !== 'instRead-done'"
      >结束抄送</el-button>
      <el-button
        type="default"
        @click="submitRevoke('taskClose')"
        v-else-if="
          currentRouteName == 'instRead-done' ||
          currentRouteName == 'task' ||
          currentRouteName == 'inst' ||
          currentRouteName == 'taskFromOtherPage'
        "
      >关闭</el-button>
      <!-- <OpinionText :text="text" v-show="false" ref="opinionText" />
      <FileUpload v-show="false"
        v-if="(isFile && approvalArea) || (type=='read' || status=='COMMU') &&
              status!='COPYTO' && status!='FOLLOW' && ((type!='done' && type!='request')) && (type!=undefined || taskId!=undefined)"
      ref="fileUpload" />-->

      <!--智能辅助-->
      <!-- ccwgq 2022-06-13 formKey增加了 htN -->
      <div
        v-if="['ht', 'htN', 'htsp', 'htbgN'].includes(formKey)"
        style="
          display: inline;
          float: right;
          padding-right: 20px;
          margin-right: 10px;
        "
      >
        <ai-compare
          ref="aiCompare"
          :getFormData="getFormData"
          :getFormKey="getFormKey"
          :defId="defId"
          :nodeId="nodeId"
          :instId="instId"
        ></ai-compare>
      </div>

      <div
        v-if="['ht', 'htN', 'htsp', 'htbgN'].includes(formKey)"
        style="
          display: inline;
          float: right;
          padding-right: 20px;
          margin-right: 10px;
        "
      >
        <ai-exam
          ref="aiExam"
          :getFormKey="getFormKey"
          :getFormData="getFormData"
          :defId="defId"
          :nodeId="nodeId"
          :instId="instId"
        ></ai-exam>
      </div>

      <div
        v-if="formKey == 'xdfgl'"
        style="
          display: inline;
          float: right;
          padding-right: 20px;
          margin-right: 10px;
        "
      >
        <opp-exam ref="oppExam" :getFormKey="getFormKey" :getFormData="getFormData"></opp-exam>
      </div>
      <!-- 2021-09-07 ccwgq 加入智能回填 -->
      <div
        v-if="['ht', 'htN', 'htsp', 'htbgN'].includes(formKey)"
        style="float: right; margin-right: 20px"
      >
        <ai-data :getFormData="getFormData.bind(this)" :getFormKey="getFormKey.bind(this)"></ai-data>
      </div>
    </div>
    <div class="actiondiv__body">
      <FormContent
        :tasks="tasks"
        :task_state="task_state"
        :formLoading.sync="disabled"
        ref="formContent"
        :instId="instId"
        :taskId="taskId"
        :type="type"
        :leaderId="leaderId"
        :readId="readId"
        :myReadType="myReadType"
        :readDoneId="readDoneId"
        :isLook="isLook"
      />
    </div>
    <div class="actiondiv__footer">
      <el-dialog
        :title="dailogTitle"
        :visible.sync="dialogFormVisible"
        :close-on-click-modal="false"
      >
        <el-input
          type="textarea"
          :autosize="{minRows: 4, maxRows: 4}"
          placeholder="请输入强制收回意见"
          v-model="opinion"
        ></el-input>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="saveRevoke" size="small">确 定</el-button>
          <el-button @click="exitRevoke" size="small">取 消</el-button>
        </div>
      </el-dialog>
      <!-- 强制收回设置 -->
      <taskToRevoke ref="taskToRevoke" :taskId="taskId" :instId="instId" />
      <!-- 加签反馈 -->
      <userAddSignReply
        ref="userAddSignReply"
        :defId="defId"
        :taskId="taskId"
        :instId="instId"
        :text="text"
      />
      <!-- 征询回复 -->
      <taskToInquReply
        ref="taskToInquReply"
        :defId="defId"
        :taskId="taskId"
        :instId="instId"
        :opinionField="opinionField"
        :appendOpinion="appendOpinion"
      />
      <!-- 沟通回复 -->
      <!-- 2022-10-20 ccwgq 补充一些参数 -->
      <taskToFeeBack
        ref="taskToFeeBack"
        :getFormKey="getFormKey"
        :getFormData="getFormData"
        :instId="instId"
        :taskId="taskId"
        :leaderId="leaderId"
        :isLook="isLook"
        :defId="defId"
      />
      <!-- 抄送回复 -->
      <taskToRead ref="taskToRead" :instId="instId" :taskId="taskId" />
      <!-- 保存设置 -->
      <taskToSave
        :getFormKey="getFormKey"
        ref="taskToSave"
        :taskId="taskId"
        :leaderId="leaderId"
        :instId="instId"
      />
      <!-- 同意设置 -->
      <taskToComplete
        ref="taskToComplete"
        :getFormKey="getFormKey"
        :taskId="taskId"
        :leaderId="leaderId"
        :action="actionName"
        :instId="instId"
        @nextTask="nextTask"
        :signatureField="signatureField"
        :signatureCover="signatureCover"
        :secretFree="secretFree"
      />
      <!-- 驳回设置 -->
      <TaskToReject
        ref="taskToReject"
        :taskId="taskId"
        :leaderId="leaderId"
        :opinion="text"
        :opinionField="opinionField"
        :appendOpinion="appendOpinion"
      />
      <!-- 转办设置 -->
      <TaskToDelegate ref="taskToDelegate" :taskId="taskId" />
      <!-- 流程抄送 -->
      <TaskToCopyTo ref="taskToCopyTo" :taskId="taskId" :instId="instId" :nodeId="nodeId" />
      <!-- 征询设置 -->
      <TaskToInqu ref="taskToInqu" :taskId="taskId" />
      <!-- 流程终止 -->
      <TaskToEndProcess ref="taskToEndProcess" :taskId="taskId" />
      <!-- 流转设置 -->
      <TaskToTrans ref="taskToTrans" :taskId="taskId" :files="opinionFiles" />
      <!-- 会签设置 -->
      <TaskToAddSign ref="taskToAddSign" :taskId="taskId" />
      <!-- 任务延期 -->
      <TaskToDelay ref="taskToDelay" :taskId="taskId" />
      <!-- 选择路径跳转 -->
      <TaskSelectDestination ref="taskSelectDestination" :taskId="taskId" />
      <!-- 并行审批设置 -->
      <TaskToApproveLine ref="taskToApproveLine" :taskId="taskId" />
      <!-- 顺序签署设置 -->
      <taskToSignSequence ref="taskToSignSequence" :taskId="taskId" />
      <!-- 并行签署设置 -->
      <taskToSignLine ref="taskToSignLine" :taskId="taskId" :execId="execId" />

      <!-- 发起沟通 -->
      <TaskToCommu
        ref="taskToCommu"
        :getFormKey="getFormKey"
        :instId="instId"
        :defId="defId"
        :taskId="taskId"
        :nodeId="nodeId"
        :text="text"
        :leaderId="leaderId"
      />
    </div>
  </div>
</template>
<script>
import AiCompare from '@/components/eipControl/ou/AiCompare.vue'
import AiExam from '@/components/eipControl/ou/AiExam.vue'
import OppExam from '@/components/eipControl/ou/OppExam.vue'
//import ImageBpm from '@/components/flow/imageBpm.vue'
import FormContent from '@/components/flow/formContent.vue'
//import OpinionText from "@/components/common/opinionText.vue";
//import FileUpload from "@/components/common/fileUpload.vue";
import {mapState} from 'vuex'
//import {Message} from 'element-ui'
import TaskToReject from '@/components/flow/task/taskToReject.vue'
import TaskToDelegate from '@/components/flow/task/taskToDelegate.vue'
import TaskToCopyTo from '@/components/flow/task/taskToCopyTo.vue'
import TaskToInqu from '@/components/flow/task/taskToInqu.vue'
import TaskToEndProcess from '@/components/flow/task/taskToEndProcess.vue'
import TaskToTrans from '@/components/flow/task/taskToTrans.vue'
import TaskToAddSign from '@/components/flow/task/taskToAddSign.vue'
import TaskToDelay from '@/components/flow/task/taskToDelay.vue'
import TaskSelectDestination from '@/components/flow/task/taskSelectDestination.vue'
import TaskToApproveLine from '@/components/flow/task/taskToApproveLine.vue'
import taskToSignSequence from '@/components/flow/task/taskToSignSequence.vue'
import taskToSignLine from '@/components/flow/task/taskToSignLine.vue'
import taskToComplete from '@/components/flow/task/taskToComplete.vue'
import taskToSave from '@/components/flow/task/taskToSave.vue'
import taskToRead from '@/components/flow/task/taskToRead.vue'
import taskToFeeBack from '@/components/flow/task/taskToFeeBack.vue'
import taskToInquReply from '@/components/flow/task/taskToInquReply.vue'
import userAddSignReply from '@/components/flow/task/userAddSignReply.vue'
import taskToRevoke from '@/components/flow/task/taskToRevoke.vue'
import utils from '@/utils.js'
import {Base64} from 'js-base64'
//import moment from 'moment' //日期格式化插件
//import form from '@/api/form.js'
import flow from '@/api/flow.js'
//import i18n from '@/lang/index.js'
import req from '@/request.js'
import AiData from '@/components/eipControl/ou/AiData.vue'
import TaskToCommu from '@/components/flow/task/taskToCommu.vue'
export default {
  components: {
    AiCompare,
    AiExam,
    OppExam,
    AiData,
    //ImageBpm,
    FormContent,
    //OpinionText,
    //FileUpload,
    TaskToReject,
    TaskToDelegate,
    TaskToCopyTo,
    TaskToInqu,
    TaskToEndProcess,
    TaskToTrans,
    TaskToAddSign,
    TaskToDelay,
    TaskSelectDestination,
    TaskToApproveLine,
    taskToSignSequence,
    taskToSignLine,
    taskToComplete,
    taskToSave,
    taskToRead,
    taskToFeeBack,
    taskToInquReply,
    userAddSignReply,
    taskToRevoke,
    TaskToCommu
  },
  props: [
    'tasks', //任务详情
    'task_state',
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
    'myReadType',
    'readId', //知会任务待办抄送任务的主键ID
    'readDoneId', //知会任务已办抄送任务的主键ID
    'approvalArea', //审批区域显示的内容
    'referOpinion', //允许参考意见 (选择否，则审批时不允许参考同环节其他会签人员的意见)
    'nodeType', //当前任务类型
    'nodeId', //当前任务节点
    'modelId', //当前合同范本ID
    'isLook',
    'sponsorRevoke', //允许发起人强制收回（默认不勾选）
    'opinionField', //当前节点审批意见回填字段
    'appendOpinion', //是否覆盖审批意见
    'signatureField', //自动签章字段
    'signatureCover', //自动签章是否覆盖
    'secretFree', //自动签章时是否免密,
    'defKey',
    'lastRouterName' //上次路由的name
  ],
  data() {
    return {
      isMk: false, //是否是模块化开发进来
      isDd: false, // 是否是只显示审批页面
      isGdt: false, //是否有滚动条
      dialogFormVisible: false,
      dailogTitle: '',
      opinion: '',
      isHand: '',
      state: '',
      canLock: '',
      formData: '',
      actionName: '',
      text: '',
      disabled: true,
      btnAlias: '', //选择的按钮
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
        'SIGNLINEED'
      ],
      isHang: false,
      opinionFiles: '',
      appendStr: true,
      initBoAttr: '',
      formKey: '',
      keyList: [],
      isTaiZhang: false, //判断是否是台账
      //当前路由名称
      currentRouteName: '',
      flowKey: ''
    }
  },
  watch: {
    status: function(newVal, oldVal) {
      this.state = newVal //newVal即是status
      if (
        this.state != 'COPYTO' &&
        this.state != 'FOLLOW' &&
        this.state != 'COMMU'
      ) {
        let params = {
          taskId: this.taskId,
          leaderId: this.leaderId,
          nodeType: this.nodeType
        }
        //判断是否是普通用户任务加签后的待办任务
        if (this.tasks.bpmTask.parentId != '0') {
          params.isAddSign = true
        }
        //通过流程实例ID和任务ID获取审批意见
        if (this.taskId && this.instId) {
          let bpmSaveOpinion = {instId: this.instId, taskId: this.taskId}
          flow.getBpmSaveOpinionByTeam(bpmSaveOpinion).then(data => {
            if (data.state) {
              if (data.value != '') {
                this.text = data.value
              }
            }
          })
        }
        this.$store.dispatch('storeProcess/taskDetail', params) //获取操作按钮
        this.$store
          .dispatch('storeProcess/canLock', {
            taskId: this.taskId,
            leaderId: this.leaderId
          })
          .then(canLock => {
            //获取任务是否能锁定
            if (
              canLock == 4 &&
              this.$router.history.current.fullPath.indexOf('token') > -1
            ) {
              canLock = '5'
            }
            this.canLock = canLock
          })
      }
    },
    //ninghua 20221105给formKey添加监听，用来改变is_TaiZhang的值
    formKey: function(newVal, oldVal) {
      console.log('getFormKey 111 ===>', this.getFormKey)
      if (newVal) {
        this.formKey = newVal
        this.is_TaiZhang(this.formKey)
      }
    },
    //start_commu feedback
    approvalArea: function(newVal, oldVal) {
      //审批区域显示的内容
      if (newVal) {
        this.approvalArea = newVal
        if (this.approvalArea) {
          if (this.approvalArea.indexOf('approvalOpinion') == -1) {
            this.isApprovalOpinion = false
          }
          if (this.approvalArea.indexOf('zFile') == -1) {
            this.iszFile = false
          }
          if (this.approvalArea.indexOf('file') == -1) {
            this.isFile = false
          }
          if (this.approvalArea.indexOf('processRecord') == -1) {
            this.isProcessRecord = false
          }
          if (this.approvalArea.indexOf('imageBpm') == -1) {
            this.isImageBpm = false
          }
        }
      }
    }
  },
  computed: mapState({
    rowsBtn: state => state.storeProcess.rowsBtn,
    forceLock: state => state.storeProcess.forceLock,
    isShowApprovalArea: function() {
      if (
        (this.status != 'COPYTO' &&
          this.status != 'FOLLOW' &&
          (this.type != undefined || this.taskId != undefined) &&
          this.instStatus != 'end' &&
          this.instStatus != 'manualend') ||
        this.status == 'COMMU'
      ) {
        return true
      }
      return false
    }
  }),

  beforeDestroy() {
    //组件注销移除事件监听器，以防多次调用
    this.$root.$off('formLoading')
  },
  mounted() {
    const this_ = this
    this_.currentRouteName = this_.$route.name
    //监听表单加载完成发布事件
    this_.$root.$on('formLoading', function(value) {
      this_.disabled = value
      //检查当前挂起状态，判断是否禁用按钮
      this_.checkInstStatus()
      if (this_.$refs.formContent) {
        // 赋值formKey
        this_.formKey = this_.$refs.formContent.formKey
        // this_.flowKey = this.$refs.formContent.flowKey
        // console.log(this.flowKey)
      }
    })
  },
  methods: {
    //ninghua 2022-11-5修改 判断是否是台账
    is_TaiZhang(fmk) {
      if (
        fmk == 'ssswtz' ||
        fmk === 'fsswtz' ||
        fmk == 'lyjhhtz' ||
        fmk == 'wplsbatz'
      ) {
        this.isTaiZhang = true
      }
    },
    getFormData() {
      let this_ = this
      let boData = this_.$refs.formContent.data
      return boData
    },
    getFormKey() {
      let this_ = this
      let formKey = this_.$refs.formContent.formKey
      this_.formKey = formKey
      this.$forceUpdate()
      return formKey
    },
    // 通过按钮别名获取按钮主题类型
    getType(alias) {
      let type = 'default'
      switch (alias) {
        case 'agree':
        case 'agreeTrans':
        case 'commu':
          type = 'primary'
          break
        case 'oppose':
        case 'opposeTrans':
        case 'reject':
        case 'endProcess':
          type = 'danger'
          break
      }
      return type
    },
    // //暂存审批意见
    // createBpmSaveOpinion(flag) {
    //   //点击保存暂存审批意见时，没有填写审批意见不处理
    //   if (this.$refs.opinionText.getOpinion() == "" && flag) {
    //     return;
    //   }
    //   if (this.$refs.opinionText.getOpinion() == "") {
    //     Message.warning("请输入审批意见内容");
    //   } else {
    //     let bpmSaveOpinion = { procInstId: this.instId, taskId: this.taskId, opinion: this.$refs.opinionText.getOpinion() };
    //     flow.createBpmSaveOpinion(bpmSaveOpinion).then(data => {
    //       if (data.state) {
    //         if (!flag) {
    //           this.$message({ type: "success", message: data.message });
    //         }
    //       }
    //     });
    //   }
    // },
    //获取意见
    // getOpinion(opinion) {
    //   this.text = opinion;
    //   let opinioValue = this.$refs.opinionText.getOpinion();
    //   if (this.opinionField) {
    //     let currentUser = this.$store.state.user.currentUserDetail.user;
    //     let moment = require("moment");

    //     let boData = this.$refs.formContent.data;
    //     let filed = this.opinionField.split(".");
    //     if (boData[filed[0]][filed[1]] == '<p><br/></p>') {
    //       boData[filed[0]][filed[1]] = "";
    //     }
    //     //是否覆盖审批意见
    //     if (this.appendOpinion) {
    //       if (opinioValue) {
    //         boData[filed[0]][filed[1]] = opinioValue + "\n" + currentUser.fullname + " " + moment().format("YYYY-MM-DD HH:mm:ss");
    //       }
    //     } else {
    //       if (opinioValue) {
    //         opinioValue += "\n" + currentUser.fullname + " " + moment().format("YYYY-MM-DD HH:mm:ss");
    //       }
    //       if (this.appendStr) {
    //         this.initBoAttr = boData[filed[0]][filed[1]];
    //       }
    //       if (filed.length == 2) {
    //         if (this.initBoAttr) {
    //           if (opinion) {
    //             boData[filed[0]][filed[1]] = this.initBoAttr + "\n\n" + opinioValue;
    //           } else {
    //             boData[filed[0]][filed[1]] = this.initBoAttr
    //           }
    //         } else {
    //           boData[filed[0]][filed[1]] = opinioValue;
    //         }
    //       }
    //       this.appendStr = false;
    //     }
    //   }
    // },
    //保存按钮
    saveDraftBtn() {
      //this.$refs.taskToSave.showDialog();
      this.$store
        .dispatch('storeProcess/canLock', {
          taskId: this.taskId,
          leaderId: this.leaderId
        })
        .then(canLock => {
          //获取任务是否能锁定
          if (
            canLock == 4 &&
            this.$router.history.current.fullPath.indexOf('token') > -1
          ) {
            canLock = '5'
          }
          if (canLock == 4) {
            this.$message.warning('任务已被其他人签收了')
          } else {
            this.taskSaveDraft() //保存表单内容
            //this.createBpmSaveOpinion(true);//暂存审批意见
          }
        })
    },
    //同意按钮
    agreeBtn() {
      this.$store
        .dispatch('storeProcess/canLock', {
          taskId: this.taskId,
          leaderId: this.leaderId
        })
        .then(canLock => {
          //获取任务是否能锁定
          if (
            canLock == 4 &&
            this.$router.history.current.fullPath.indexOf('token') > -1
          ) {
            canLock = '5'
          }
          if (canLock == 4) {
            this.$message.warning('任务已被其他人签收了')
          } else {
            this.taskAgree()
          }
        })
    },
    checkInstStatus(callback) {
      let this_ = this
      this.$http
        .get(
          '${bpmRunTime}/runtime/instance/v1/getDefStatus?instId=' +
            (this.instId || '') +
            '&taskId=' +
            (this.taskId || '')
        )
        .then(function(resp) {
          if (resp.data) {
            resp.data += ''
            if (resp.data.indexOf('1') > -1) {
              this_.disabled = true
              this_.isHang = true
              this_.$message.warning('当前流程实例已被挂起，无法审批')
            } else if (resp.data.indexOf('3') > -1) {
              this_.disabled = true
              this_.$message.warning('当前流程定义已被禁止实例，无法审批')
            } else {
              callback && callback()
            }
          } else if (callback) {
            callback()
          }
        })
    },
    //ninghua 20221121 结束抄送事件
    EndCC() {
      this.$store
        .dispatch('storeProcess/noticeTurnDode', this.readId)
        .then(() => {
          this.$router.push('/v-flow/v-todoRead')
        })
    },
    //提交事件
    submitRevoke(alias) {
      let _this = this
      //获取VUE表单实例(判断是否是在线表单)
      if (document.getElementsByName('online-form')[0]) {
        let tables = document.getElementsByName('online-form')[0].__vue__
          .permission.table //获取子表权限
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
            this.$message({message: '子表必填一条记录', type: 'warning'})
            return
          }
        }
      }
      this.pressAction = true
      this.btnAlias = alias
      //关闭
      if (this.btnAlias == 'taskClose') {
        utils.closeAllNotification()
        //ccwgq 2022-09-23 先判断是不是从首页的栏目中跳转过来的
        if ((this.$route.query?.from ?? '') === 'home') {
          this.$store.dispatch('menu/setColumnInfo', {restore: true})
        }
        //判断菜单是否是模块开发配置出来的
        if (this.$route.name.indexOf('reportModuleInst') != -1) {
          this.$router.push(
            '/statement/template/preview/' +
              this.$route.params.templateKey +
              '/todo/' +
              this.$route.params.defKey +
              '/true'
          )
        } else if (this.$route.name.indexOf('sysModuleInst') != -1) {
          this.$router.push('/v-flow/v-todo/' + this.$route.params.defKey)
        } else if (
          this.type == 'done' ||
          this.type == 'request' ||
          this.myReadType == 'myRequest'
        ) {
          // this.$router.push('/v-flow/v-request')
          //ccwgq 2022-09-02 万一是从v-searchflow进来的呢
          if (this.lastRouterName === 'searchFlow') {
            this.$router.push('/v-flow/v-searchflow')
          } else if (this.lastRouterName === 'home') {
            this.$router.push('/home')
          } else {
            this.$router.push('/v-flow/v-request')
          }
        } else if (
          this.state == 'COMMU' ||
          this.state == 'FOLLOW' ||
          this.$route.name == 'instRead-read'
        ) {
          // this.$router.push('/v-flow/v-todoRead') //待阅
          //ccwgq 2022-09-02 万一是从v-searchflow进来的呢
          if (this.lastRouterName === 'searchFlow') {
            this.$router.push('/v-flow/v-searchflow')
          } else if (this.lastRouterName === 'home') {
            this.$router.push('/home')
          }
          // 20221102  ninguha  修复会签关闭回到待办
          else if (this.lastRouterName === 'todo') {
            this.$router.push({path: '/v-flow/v-todo'})
          } else {
            this.$router.push('/v-flow/v-todoRead')
          }
        } else if (this.$route.name == 'instRead-done') {
          // this.$router.push('/v-flow/v-doneRead') //已阅
          //ccwgq 2022-09-02 万一是从v-searchflow进来的呢
          if (this.lastRouterName === 'searchFlow') {
            this.$router.push('/v-flow/v-searchflow')
          } else if (this.lastRouterName === 'home') {
            this.$router.push('/home')
          } else {
            this.$router.push('/v-flow/v-doneRead')
          }
        } else if (this.$route.name == 'myRead-type') {
          // this.$router.push('/v-flow/v-myRead') //我抄送的
          //ccwgq 2022-09-02 万一是从v-searchflow进来的呢
          if (this.lastRouterName === 'searchFlow') {
            this.$router.push('/v-flow/v-searchflow')
          } else if (this.lastRouterName === 'home') {
            this.$router.push('/home')
          } else {
            this.$router.push('/v-flow/v-myRead')
          }
        } else if (
          this.$route.name == 'instRead' &&
          this.$route.params.myReadType == 'delegate'
        ) {
          // this.$router.push('/v-flow/v-myDelegate')
          //ccwgq 2022-09-02 万一是从v-searchflow进来的呢
          if (this.lastRouterName === 'searchFlow') {
            this.$router.push('/v-flow/v-searchflow')
          } else if (this.lastRouterName === 'home') {
            this.$router.push('/home')
          } else {
            this.$router.push('/v-flow/v-myDelegate')
          }
        } else {
          if (JSON.stringify(this.$route.query) == '{}') {
            // this.$router.push('/v-flow/v-todo')
            //ccwgq 2022-09-02 万一是从v-searchflow进来的呢
            if (this.lastRouterName === 'searchFlow') {
              this.$router.push('/v-flow/v-searchflow')
            } else if (this.lastRouterName === 'home') {
              this.$router.push('/home')
            } else {
              this.$router.push('/v-flow/v-todo')
            }
          } else {
            this.$router.push('/home')
          }
        }
      } else if (this.btnAlias == 'saveDraft') {
        // todo 保存
        this.saveDraftBtn()
      } else if (this.btnAlias == 'agree') {
        // todo
        this.agreeBtn()
      } else if (this.btnAlias == 'handleRead') {
        //抄送回复
        this.handleRead()
      } else if (this.btnAlias == 'handleRevoke') {
        //强制收回
        this.handleRevoke()
      } else if (this.btnAlias == 'commuFeedBack') {
        //沟通反馈
        this.commuFeedBack()
      } else if (this.btnAlias == 'taskToInquReply') {
        //征询回复
        this.taskToInquReply()
      } else if (this.btnAlias == 'userAddSign') {
        //普通节点加签反馈
        this.userAddSign()
      } else if (this.btnAlias == 'reject') {
        //todo 驳回
        this.taskToReject()
      } else if (this.btnAlias == 'delegate') {
        //转办
        this.taskToDelegate()
      } else if (this.btnAlias == 'inqu') {
        //征询
        this.taskToInqu()
      } else if (this.btnAlias == 'endProcess') {
        // todo 流程终止
        this.taskToEndProcess()
      } else if (this.btnAlias == 'startTrans') {
        //todo 流转
        this.taskToTrans()
      } else if (this.btnAlias == 'addSign') {
        //todo 加签
        this.taskToAddSign()
      } else if (this.btnAlias == 'taskDelay') {
        //todo 任务延期
        // this.taskToDelay();
      } else if (this.btnAlias == 'agreeTrans') {
        //todo 同意（流转）
        this.taskAgreeTrans()
      } else if (this.btnAlias == 'opposeTrans') {
        //todo 反对（流转）
        this.taskOpposeTrans()
      } else if (this.btnAlias == 'oppose') {
        //todo 反对
        this.taskOppose()
      } else if (this.btnAlias == 'lockUnlock') {
        //签收
        this.$store
          .dispatch('storeProcess/canLock', this.taskId)
          .then(canLock => {
            //获取任务是否能锁定
            if (
              canLock == 4 &&
              this.$router.history.current.fullPath.indexOf('token') > -1
            ) {
              canLock = '5'
            }
            if (canLock == 4) {
              this.$message.warning('任务已被其他人签收了')
            } else {
              this.lockUnlock()
            }
          })
      } else if (this.btnAlias == 'approveLine') {
        //并行审批
        this.taskApproveLine()
      } else if (this.btnAlias == 'signSequence') {
        // 顺序签署
        this.taskSignSequence()
      } else if (this.btnAlias == 'signLine') {
        // 并行签署
        this.taskSignLine()
      } else if (this.btnAlias == 'taskToCommu') {
        //会签(沟通)
        this.taskToCommu()
      }
    },
    //执行前置脚本
    runBeforeScript() {
      let _this = this
      let item = utils.indexOfList(_this.rowsBtn, 'alias', _this.btnAlias)
      //console.log(item)
      return _this.tempScript(item.beforeScript)
    },
    //执行前置脚本
    tempScript(script) {
      let _this = this
      let _req = req
      let boData = _this.$refs.formContent.data
      let tempScript =
        'var tempFunction = function(_req,data,_this){ ' + script + '};'
      let result = eval(tempScript + 'tempFunction(_req,boData,_this);')
      if (result && result.then && typeof result.then == 'function') {
        return result
      }
      if (result === false) return false
      return true
    },
    //保存
    taskSaveDraft() {
      const this_ = this
      utils
        .getOnlineFormData(false)
        .then(formDataStr => this_.saveDraftSubmit(formDataStr))
        .catch(reason =>
          utils.handleGetFormDataReject(reason).then(() => {
            this.saveDraftSubmit()
          })
        )
    },
    saveDraftSubmit(formDataStr) {
      let _this = this
      let scriptResult = this.runBeforeScript()
      //执行前置脚本返回false时终止按钮操作
      if (scriptResult === false) {
        return
      }
      //执行前置脚本返回的接口时先执行前置事件接口
      if (scriptResult.then && typeof scriptResult.then == 'function') {
        scriptResult.then(
          () => {
            //接口返回成功则正常执行按钮操作
            _this.funcSaveDraft(formDataStr)
          },
          fail => {
            //接口返回失败则终止按钮操作，并给与提示
            _this.$message.warning(fail)
            return
          }
        )
      } else {
        //执行前置脚本返回true时正常执行按钮操作
        _this.funcSaveDraft(formDataStr)
      }
    },
    //保存草稿
    funcSaveDraft(formDataStr) {
      utils.closeAllNotification()
      let data = this.handleFormData(formDataStr)
      data.defId = this.defId
      data.approval = true
      data.formKey = this.$refs.formContent.formKey
      this.$refs.taskToSave.showDialog(data)
      // this.$store.dispatch("storeProcess/saveTaskDraft", data).then(() => {
      //   utils.reload();
      // });
    },
    //抄送回复
    handleRead() {
      this.$refs.taskToRead.showDialog()
    },
    // 准备要提交的数据
    handleFormData(formDataStr) {
      //let files = "";
      let zfiles = ''
      // this.$refs.fileUpload.isFinishUpload();
      // if (this.$refs.fileUpload && this.$refs.fileUpload.getFiles() != "") {
      //   files = JSON.stringify(this.$refs.fileUpload.getFiles());
      // }
      //let opinion = "";
      // if (this.$refs.opinionText && this.$refs.opinionText.getOpinion() != "") {
      //   opinion = this.$refs.opinionText.getOpinion();
      // }

      let data = {
        taskId: this.taskId,
        actionName: this.actionName,
        destination: '',
        //files: files,
        zfiles: zfiles,
        //opinion: opinion,
        jumpType: '',
        agentLeaderId: this.leaderId,
        nodeUsers: '[]'
      }
      if (formDataStr) {
        // URL表单
        if (formDataStr.constructor == Object) {
          data.formType = 'frame'
          if (formDataStr.businessKey) {
            data.businessKey = formDataStr.businessKey
          }
          if (formDataStr.sysCode) {
            data.sysCode = formDataStr.sysCode
          }
          if (formDataStr.vars) {
            data.vars = formDataStr.vars
          }
        } else if (formDataStr.constructor == String) {
          data.data = Base64.encode(formDataStr)
          data.formType = 'inner'
        }
      }

      if (window.urgentStateValue) {
        data.urgentStateValue = window.urgentStateValue
      }

      return data
    },
    handleClose() {
      this.dialogFormVisible = true
    },
    //获取任务锁定状态
    lockUnlock() {
      this.$store
        .dispatch(
          'storeProcess/lockUnlock',
          this.taskId + '&leaderId=' + this.leaderId
        )
        .then(() => {
          // this.$router.go(this.$router.currentRoute);
          utils.reload()
        })
    },
    //强制收回
    handleRevoke(id, status) {
      if (status == 'revokeToStart') {
        this.$message.warning('已强制收回，不能再强制收回')
        return false
      }
      // if (this.$refs.opinionText.getOpinion() == "") {
      //   this.$message.warning("请填写强制收回意见");
      //   return false;
      // }
      let data = {
        instanceId: this.instId,
        isHandRevoke: this.isHand
        //cause: this.$refs.opinionText.getOpinion()
      }
      let revokeUrl = 'storeProcess/revokeInstanceBtn'
      this.$refs.taskToRevoke.showDialog(revokeUrl, data)
      //ninghua 20221028 增加按钮后的跳转
      //ninghua  20221104  解决我的请求中强制收回失败：注释下一行代码
      //this.$router.push({path:"/v-flow/v-todo"})

      // this.$confirm("确认" + this.dailogTitle + "?", "提示", {
      //   cancelButtonText: "取消",
      //   confirmButtonText: "确定",
      //   type: "warning",
      //   closeOnClickModal: false
      // }).then(() => {
      //   this.$store
      //     .dispatch("storeProcess/revokeInstanceBtn", data)
      //     .then(isHandRevoke => {
      //       if (this.token != null) {
      //         window.close();
      //       } else {
      //         this.$router.push("/v-flow/v-todo");
      //       }
      //     });
      // });
    },
    saveRevoke() {
      if (this.opinion == '') {
        this.$message.warning('请填写强制收回意见')
        return false
      }
      let data = {
        instanceId: this.instId,
        isHandRevoke: this.isHand,
        cause: this.opinion
      }
      this.$store.dispatch('storeProcess/revokeInstanceBtn', data).then(() => {
        if (this.token != null) {
          window.close()
        } else {
          this.$router.go(-1)
        }
      })
      this.dialogFormVisible = false
      this.opinion = ''
    },
    exitRevoke() {
      this.dialogFormVisible = false
      this.opinion = ''
    },
    //沟通反馈
    commuFeedBack() {
      // console.log('formContent.data', this.$refs.formContent)

      let boDateKey = this.$refs.formContent.flowKey
      let boData = this.getFormData()
      // boData[formKey][signature_opinion_key]
      // console.log(
      //   'online-form ===>',
      //   document.getElementsByName('online-form')[0].__vue__
      // )
      // console.log('boData ===>', boData)
      // console.log('boData[boDateKey] ===>', boData['' + boDateKey])
      // this.text = this.$refs.formContent.data.formKey

      this.text =
        this.$refs.formContent.data[this.opinionField?.split('.')?.[0] ?? '']
          ?.signature_opinion ?? ''
      this.$refs.taskToFeeBack.showDialog({
        text: this.text,
        boData: this.getFormData()
      })
    },
    userAddSign() {
      // console.log('userAddSign')
      this.text =
        this.$refs.formContent.data[this.opinionField?.split('.')?.[0] ?? '']
          ?.signature_opinion ?? ''
      utils.getOnlineFormData(false).then(formDataStr => {
        let data = this.handleFormData(formDataStr)
        data.defId = this.defId
        // data.approval = true
        data.formKey = this.$refs.formContent.formKey
        this.$refs.userAddSignReply.showDialog(data, this.text)
      })
      // if (this.$refs.opinionText.getOpinion() == "") {
      //   Message.warning("请输入意见内容");
      // } else {
      //   let files = "";
      //   let zfiles = "";
      //   this.$refs.fileUpload.isFinishUpload();
      //   if (this.$refs.fileUpload && this.$refs.fileUpload.getFiles() != "") {
      //     files = JSON.stringify(this.$refs.fileUpload.getFiles());
      //   }
      //   let data = {
      //     procDefId: this.defId,
      //     procInstId: this.instId,
      //     status: "inqu_reply",
      //     taskId: this.taskId,
      //     opinion: this.$refs.opinionText.getOpinion(),
      //     files: files,
      //     zfiles: zfiles
      //   };
      //   this.$store.dispatch("storeProcess/userAddSign", data).then(() => {
      //     if (this.token != null) {
      //       window.close();
      //     } else {
      //       this.$router.go(-1);
      //     }
      //   });
      // }
    },
    //征询回复
    taskToInquReply() {
      this.$refs.taskToInquReply.showDialog()
      // if (this.$refs.opinionText.getOpinion() == "") {
      //   Message.warning("请输入意见内容");
      // } else {
      //   let files = "";
      //   let zfiles = "";
      //   this.$refs.fileUpload.isFinishUpload();
      //   if (this.$refs.fileUpload && this.$refs.fileUpload.getFiles() != "") {
      //     files = JSON.stringify(this.$refs.fileUpload.getFiles());
      //   }
      //   let data = {
      //     procDefId: this.defId,
      //     procInstId: this.instId,
      //     status: "inqu_reply",
      //     taskId: this.taskId,
      //     opinion: this.$refs.opinionText.getOpinion(),
      //     files: files,
      //     zfiles: zfiles,
      //     formData: JSON.stringify(this.$refs.formContent.data)
      //   };
      //   this.$store.dispatch("storeProcess/taskToInquReply", data).then(() => {
      //     if (this.token != null) {
      //       window.close();
      //     } else {
      //       this.$router.go(-1);
      //     }
      //   });
      // }
    },
    //驳回设置
    taskToReject() {
      // 审批附件数据
      // if (this.$refs.fileUpload && this.$refs.fileUpload.getFiles() != "") {
      //   this.opinionFiles = JSON.stringify(this.$refs.fileUpload.getFiles());
      // }
      let parentTaskId = '' //用户任务加签后的父任务ID
      if (this.nodeType == 'USERTASK' && this.tasks.bpmTask.parentId != '0') {
        //用户任务加签
        parentTaskId = this.tasks.bpmTask.parentId
      }
      this.text =
        this.$refs.formContent.data[this.opinionField?.split('.')[0] ?? '']
          ?.signature_opinion ?? ''
      this.$refs.taskToReject.handleOpen(parentTaskId, this, this.text) //父组件调用子组件方法
    },
    //转办设置
    taskToDelegate() {
      this.$refs.taskToDelegate.handleClose(
        this.opinionField,
        this.$refs.formContent.data,
        this.appendOpinion,
        this
      ) //父组件调用子组件方法
    },
    //征询设置
    taskToInqu() {
      if (this.status != 'TRANSFORMEDINQU') {
        this.$refs.taskToInqu.showType()
      }
      this.$refs.taskToInqu.handleClose(
        this.opinionField,
        this.$refs.formContent.data,
        this.appendOpinion
      ) //父组件调用子组件方法
    },
    //流程终止
    taskToEndProcess() {
      this.$refs.taskToEndProcess.handleClose(this) //父组件调用子组件方法
      //ninghua 20221118 注释掉以下代码 解决强制归档失败的bug
      //this.$router.push({path: '/v-flow/v-todo'})
    },
    //流转设置
    taskToTrans() {
      // if (this.$refs.fileUpload && this.$refs.fileUpload.getFiles() != "") {
      //   this.opinionFiles = JSON.stringify(this.$refs.fileUpload.getFiles());
      // }
      this.$refs.taskToTrans.handleClose(
        this,
        this.opinionField,
        this.$refs.formContent.data,
        this.appendOpinion
      ) //父组件调用子组件方法
    },
    //会签设置
    taskToAddSign() {
      this.$refs.taskToAddSign.handleClose(this.nodeType, this.instId, this) //父组件调用子组件方法
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
      if (!this.text) {
        if (this.actionName == 'opposeTrans' || this.actionName == 'oppose') {
          this.text = '反对'
        } else {
          this.text = '同意'
        }
      }
      const this_ = this
      // debugger
      utils
        .getOnlineFormData(true)
        .then(formDataStr => this_.doNextSubmit(formDataStr))
        .catch(reason => {
          utils.handleGetFormDataReject(reason).then(() => this.doNextSubmit())
        })
    },
    // doNext执行。formDataStr：字符串格式的表单数据。
    doNextSubmit(formDataStr) {
      let _this = this
      let scriptResult = this.runBeforeScript()
      //执行前置脚本返回false时终止按钮操作
      if (scriptResult === false) return
      //执行前置脚本返回的接口时先执行前置事件接口
      if (scriptResult.then && typeof scriptResult.then == 'function') {
        scriptResult.then(
          () => {
            //接口返回成功则正常执行按钮操作
            _this.funcDoNext(formDataStr)
          },
          fail => {
            //接口返回失败则终止按钮操作，并给与提示
            _this.$message.warning(fail)
            return
          }
        )
      } else {
        //执行前置脚本返回true时正常执行按钮操作
        _this.funcDoNext(formDataStr)
      }
    },
    funcDoNext(formDataStr) {
      utils.closeAllNotification()
      let data = this.handleFormData(formDataStr)
      data.formKey = this.$refs.formContent.formKey
      data.opinion = this.text
      if (this.nodeType == 'USERTASK' && this.tasks.bpmTask.parentId != '0') {
        //用户任务加签
        if (this.actionName == 'oppose') {
          data.addSignAction = 'opposeTrans'
        } else if (this.actionName == 'agree') {
          data.addSignAction = 'agreeTrans'
        }
      }
      if (
        (this.choiceExcutor ||
          this.jumpType ||
          this.$route.query.type === 'free') &&
        !this.taskStatusArray.includes(this.status)
      ) {
        this.$store
          .dispatch('storeProcess/getAfterJumpNodes', {
            taskId: this.taskId,
            data: data.data,
            defId: '',
            instId: '',
            type: this.$route.query.type || this.jumpType
          })
          .then(res => {
            //debugger
            if (
              res.afterNodes.length == 0 ||
              (res.afterNodes.length == 1 &&
                res.afterNodes[0].excutorList != undefined &&
                res.afterNodes[0].excutorList.length == 1)
            ) {
              this.$refs.taskToComplete.showDialog(
                this.opinionField,
                this.$refs.formContent.data,
                this.appendOpinion,
                data
              )
            } else {
              this.$refs.taskSelectDestination.showDialog(
                data.data,
                data.files,
                data.zfiles,
                data.opinion,
                this.instId,
                this.jumpType
              )
            }
          })
      } else {
        //this.disabled = true;
        let tipMsg = '确认办理此任务?'
        if (this.actionName == 'agree' && this.status == 'SIGNSEQUENCEED') {
          this.$http
            .get(
              '${bpmRunTime}/runtime/task/v1/nextExecutor?taskId=' + this.taskId
            )
            .then(response => {
              if (response.data.state && response.data.value) {
                tipMsg = `下一步的执行人为：${response.data.value.name}。<br/> 您确定要提交吗？`
              }
              this.$refs.taskToComplete.showDialog(
                this.opinionField,
                this.$refs.formContent.data,
                this.appendOpinion,
                data
              )
            })
          return
        }
        this.$refs.taskToComplete.showDialog(
          this.opinionField,
          this.$refs.formContent.data,
          this.appendOpinion,
          data
        )
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
    hiddenOpertion() {
      if (this.$refs.btnRegion) {
        this.$refs.btnRegion.style.display = 'none'
      }
      this.$refs.formContent.hiddenContent()
    },
    //是否显示滚动条
    isScroll() {
      //屏幕宽度
      let window_width = $(window).width()
      //审批页面宽度
      let from_w = $('main')[0].clientWidth
      //有滚动条
      if (window_width > from_w) {
        return true
      }
      return false
    },
    //挂起
    hangUp() {
      flow.forbiddenInstance(this.instId).then(data => {
        if (data.state) {
          this.$message({type: 'success', message: data.message})
          this.checkInstStatus()
        }
      })
    },
    //取消挂起
    cancelHangUp() {
      flow.unForbiddenInstance(this.instId).then(data => {
        if (data.state) {
          this.$message({type: 'success', message: data.message})
          this.checkInstStatus(() => {
            this.isHang = false
            this.disabled = false
          })
        }
      })
    },
    //沟通
    taskToCommu() {
      // console.log(this.$refs.formContent.data[this.opinionField.split('.')[0]].signature_opinion)
      this.text =
        this.$refs.formContent.data[this.opinionField?.split('.')?.[0] ?? '']
          ?.signature_opinion ?? ''
      this.$store.dispatch('storeProcess/isEnd', this.instId).then(() => {
        this.$refs.taskToCommu.handleClose(this.text) //父组件调用子组件方法
        //TODO:未来使用showDialog的方法传递参数
        this.$refs.taskToCommu.showDialog({formKey: this.formKey})
      })
    },
    //跳转到下一个任务
    nextTask() {
      // 2022-11-30 wude 跳转到上一页,并且将表单修改标识置为false
      sessionStorage.setItem('formUpdataFlag', 'false');
      this.$router.go(-1)
      return
      let _this = this
      if (_this.$route.name.indexOf('reportModuleInst') != -1) {
        _this.$router.push(
          '/statement/template/preview/' +
            _this.$route.params.templateKey +
            '/todo/' +
            _this.$route.params.defKey +
            '/true'
        )
      } else {
        this.$store
          .dispatch('storeProcess/getNextTaskByDefId', {
            defId: this.defId,
            defKey: this.defKey
          })
          .then(resp => {
            if (resp.state) {
              //跳转到新的待办页面
              if (resp.value) {
                this.handleOpenTask(resp.value)
              } else {
                this.$message({
                  type: 'success',
                  message: '该流程所属任务已处理完成'
                })
                setTimeout(() => {
                  if (this.$route.name.indexOf('sysModuleInst') != -1) {
                    _this.$router.push(
                      '/v-flow/v-todo/' + _this.$route.params.defKey
                    )
                  } else {
                    _this.$router.push('/v-flow/v-todo/')
                  }
                }, 10)
              }
            }
          })
      }
    },
    handleOpenTask(row) {
      if (row.status == 'SHARE' || row.status == 'BACKSHARE') {
        if (row.identityList && row.identityList.length == 1) {
          let url = '/task/' + row.id + '/' + row.identityList[0].id
          this.openAndReload(url)
        } else {
          let html =
            '<select ref=' +
            Math.random() +
            ' id="approvalLeaderSelect" style="width: 200px;height: 30px;border-radius: 4px;margin: 20px 70px;" ><option value="">请选择</option>'
          row.identityList.forEach(identity => {
            html +=
              '<option value="' +
              identity.id +
              '">' +
              identity.name +
              '</option>'
          })
          html += '</select>'
          let this_ = this
          this.$alert(html, '请选择一个领导代为审批', {
            dangerouslyUseHTMLString: true,
            beforeClose: function(action, instance, done) {
              if (action == 'confirm') {
                let se = document.getElementById('approvalLeaderSelect')
                if (se.selectedIndex == 0) {
                  this.$message.warning('请选择代为审批的领导')
                } else {
                  instance.close()
                  this_.openAndReload(
                    '/task/' + row.id + '/' + se[se.selectedIndex].value
                  )
                }
              } else {
                instance.close()
              }
            }
          })
        }
      } else if (
        row.status == 'AGENT' &&
        row.ownerId != row.assigneeId &&
        row.ownerId == this.$store.state.login.currentUser.userId
      ) {
        //委托任务
        this.$router.push('/instRead/' + row.procInstId + '/agent')
      } else if (row.status == 'FOLLOW') {
        //跟踪任务
        this.$router.push('/taskRead/' + row.id + '/FOLLOW')
      } else {
        let url = '/task/' + row.id + '/0'
        if (this.$route.name.indexOf('reportModuleInst') != -1) {
          url =
            '/reportModuleInst/' +
            row.id +
            '/0' +
            '/' +
            this.$route.params.defKey +
            '/true/' +
            this.$route.templateKey
        } else if (this.$route.name.indexOf('sysModuleInst') != -1) {
          url =
            '/sysModuleInst/' +
            row.id +
            '/0' +
            '/' +
            this.$route.params.defKey +
            '/true'
        }
        this.openAndReload(url)
      }
    },
    openAndReload(url) {
      this.$router.push(url)
      setTimeout(() => {
        this.$root.$children[0].reload()
      }, 10)
    }
  },
  created() {
    //console.log(this.taskId)
    this.currentRouteName = this.$route.name
    //兼容只显示审批页面时
    if (this.$route.meta.single) {
      this.isDd = true
    }

    if (this.type == 'done') {
      this.dailogTitle = '强制收回'
      this.isHand = true
    } else if (this.type == 'request') {
      this.dailogTitle = '强制收回到发起人'
      this.isHand = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';

.actiondiv {
  width: 100%;
  height: 100%;

  .actiondiv__header {
    position: fixed;
    height: 50px;
    background: $--background-color-secondary;
    width: calc(100% - 40px);
    z-index: 999;
  }

  .actiondiv__body {
    height: calc(100% - 50px);
    padding-top: 50px;
  }
}

@media print {
  .no-print {
    display: none;
  }
  .actiondiv__body {
    padding-top: 0px !important;
  }
}
.action-container {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.action-container > span {
  border-left: 3px solid $--theme-color;
  font-weight: bold;
  font-size: 14px;
  padding-left: 10px;
  color: #666;
}

.action-content {
  padding: 20px 0;
}

.action-group {
  padding-top: 10px;
}

.action-btn {
  float: left;
  padding-right: 5px;
}
/** ccwgq 2022-05-27 设置流程中审批对话框的字体大小 start */
/deep/ .el-dialog {
  * {
    font-size: 11pt;
    // color: black;
    font-family: MicroSoft YaHei;
  }
}
/** end */
/deep/ .bpm-btn-dialog {
  tbody {
    th {
      width: 120px !important;
    }
  }
}
</style>