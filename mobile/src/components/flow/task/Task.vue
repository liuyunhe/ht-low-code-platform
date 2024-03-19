<template>
  <div class="xh_pop_box_01">
    <NavBar>
      <template slot="title">{{ subject }}</template>
      <template slot="right">
        <van-icon
          name="ellipsis"
          @click="show = !show"
          style="font-weight: 900;"
          size="1.2rem"
        />
        <van-action-sheet
          ref="vanSheet"
          v-model="show"
          cancel-text="取消"
          @cancel="onCancel"
          :actions="actions"
          @select="onSelect"
        />
      </template>
    </NavBar>
    <div class="xh_mb" v-if="type != 'doneList'">
      <!-- 审批内容 -->
      <FormContent
        ref="formContent"
        :instId="instId"
        :taskId="taskId"
        :type="type"
        :leaderId="leaderId"
        :readId="readId"
        :readDoneId="readDoneId"
        :myReadType="myReadType"
        :tasks="tasks"
      />
    </div>
    <div
      style="width:100%;margin-top: 10px;background-color: #fff;position: fixed;bottom:0;z-index: 61;"
      v-if="
        (type != undefined || taskId != undefined) &&
          status != 'FOLLOW' &&
          instStatus != 'end' &&
          instStatus != 'manualend'
      "
    >
      <!-- <div class="form-container" style="padding-left: 10px;padding-top: 8px;">
        <span>审批操作</span>
      </div>
      <div class="form-content">
        <div style="padding: 0 10px 5px;"> -->
      <!-- 操作按钮 -->
      <FlowAction
        v-if="type != 'doneList'"
        :instId="procInstId"
        :type="type"
        :taskId="taskId"
        :execId="execId"
        :defId="defId"
        :status="status"
        :readId="readId"
        :myReadType="myReadType"
        :readDoneId="readDoneId"
        :choiceExcutor="choiceExcutor"
        :jumpType="jumpType"
        :instStatus="instStatus"
        :leaderId="leaderId"
        :approvalArea="approvalArea"
        :nodeType="nodeType"
        :nodeId="nodeId"
        :tasks="tasks"
        :opinionField="opinionField"
        :appendOpinion="appendOpinion"
        :signatureField="signatureField"
        :signatureCover="signatureCover"
        :secretFree="secretFree"
      />
      <!-- </div>
      </div> -->
    </div>
    <doneAction
      v-if="type == 'doneList'"
      ref="doneAction"
      :instId="procInstId"
      :type="type"
      :taskId="taskId"
      :defId="defId"
      :status="status"
      :choiceExcutor="choiceExcutor"
      :jumpType="jumpType"
      :instStatus="instStatus"
      :leaderId="leaderId"
    />
    <!-- <div style="margin-top: 10px;width:100%;background-color: #fff;">
      <ProcessRecord :instId="procInstId" />
    </div> -->
    <!-- ccwgq : 预览 -->
    <ou-print
      ref="ouPrint"
      :defId="defId"
      :instId="procInstId"
      :type="type == 'doneList' ? 'done' : 'task'"
      @handleAdd="addOuPrint"
      @handleRemove="removeOuPrint"
    ></ou-print>
    <!-- 催办 -->
    <TaskUrgent
      ref="taskUrgent"
      :defId="defId"
      :instId="procInstId"
      :subject="subject"
    />
    <!-- 跟踪 -->
    <TaskFollow ref="taskFollow" :defId="defId" :instId="procInstId" />
    <!-- 沟通 -->
    <TaskToCommu ref="taskToCommu" :defId="defId" :instId="procInstId" />
    <!-- 抄送 -->
    <TaskToCopyTo
      ref="taskToCopyTo"
      :taskId="copyTaskId"
      :instId="procInstId"
    />
    <!-- 相关信息 -->
    <RelatedInformation ref="relatedInformation" :instId="procInstId" />
    <!-- 催办记录 -->
    <UrgentRecord
      ref="urgentRecord"
      :promoterId="promoterId"
      :instId="procInstId"
    />
    <!-- 流程图 -->
    <TaskImage ref="taskImage" :instId="procInstId" />
    <!-- 审批记录 -->
    <ProcessRecordDialog ref="processRecordDialog" :instId="procInstId" />
  </div>
</template>

<script>
import NavBar from '@/components/navBar/NavBar.vue'
import TaskImage from '@/components/flow/task/TaskImage.vue'
import {mapState, mapActions} from 'vuex'
import FormContent from '@/components/flow/FormContent.vue'
import ProcessRecordDialog from '@/components/flow/task/ProcessRecordDialog.vue'
import UrgentRecord from '@/components/flow/task/UrgentRecord.vue'
import FlowAction from '@/components/flow/task/FlowAction.vue'
import TaskUrgent from '@/components/flow/task/TaskUrgent.vue'
import TaskFollow from '@/components/flow/task/TaskFollow.vue'
import TaskToCommu from '@/components/flow/task/TaskToCommu.vue'
import TaskToCopyTo from '@/components/flow/task/TaskToCopyTo.vue'
import RelatedInformation from '@/components/flow/RelatedInformation.vue'
import doneAction from '@/components/flow/task/doneAction.vue'
import OuPrint from '@/components/eipControl/ou/OuPrint.vue'
import utils from '@/utils.js'
import {Base64} from 'js-base64'
import {Notify} from 'vant'

export default {
  name: 'task',
  components: {
    NavBar,
    FormContent,
    Notify,
    ProcessRecordDialog,
    FlowAction,
    TaskUrgent,
    TaskFollow,
    TaskToCommu,
    TaskToCopyTo,
    RelatedInformation,
    UrgentRecord,
    TaskImage,
    doneAction,
    OuPrint
  },
  props: [
    'instId',
    'type',
    'taskId',
    'readId',
    'leaderId',
    'readDoneId',
    'myReadType',
    'isShare'
  ],
  data() {
    return {
      show: false, //共用按钮是否显示
      actions: [
        {
          name: '预览',
          color: '#2161ff'
        },
        {name: '跟踪', color: '#2161ff'},
        {name: '沟通', color: '#2161ff'},
        {name: '抄送', color: '#2161ff'},
        {name: '流程图', color: '#2161ff'},
        {name: '相关信息', color: '#2161ff'},
        {name: '审批记录', color: '#2161ff'}
      ],
      procInstId: this.instId, //流程实例ID
      copyTaskId: this.taskId, //流程任务ID
      defId: '', //流程定义ID
      bpmnInstId: '',
      subject: '', //流程标题
      status: '', //流程状态
      instStatus: '',
      choiceExcutor: '', //选择处理人
      jumpType: '', //跳转类型
      promoterId: '', //当前用户ID
      execId: '', //并行签署设置用的
      approvalArea: '', //审批区域显示的内容
      text: '', //审批意见
      nodeType: '', //当前任务类型
      nodeId: '', //当前任务节点
      tasks: {}, //任务详情
      opinionField: '', //审批意见反填字段
      appendOpinion: '', //是否覆盖审批意见
      signatureField: '', //自动签章字段
      signatureCover: false, //自动签章是否覆盖
      secretFree: false //自动签章时是否免密
    }
  },
  methods: {
    //点击右上角图标事件
    iconClick() {
      this.show = true
    },
    //选中选项时触发，禁用或加载状态下不会触发
    onSelect(item) {
      switch (item.name) {
        case '预览':
          this.$refs.ouPrint.showPrint()
          break
        case '催办':
          this.taskUrgent()
          break
        case '跟踪':
          this.taskFollow()
          break
        case '沟通':
          this.taskToCommu()
          break
        case '抄送':
          this.taskToCopyTo()
          break
        case '相关信息':
          this.relatedInformation()
          break
        case '催办记录':
          this.urgentRecord()
          break
        case '流程图':
          this.taskImage()
          break
        case '审批记录':
          this.$refs.processRecordDialog.showDialog()
          break
      }
      this.show = false
    },
    // ccwgq-->添加预览按钮
    removeOuPrint(e) {
      let that = this
      Array.prototype.forEach.call(that.actions, (item, index) => {
        if (item.name === '预览') {
          Array.prototype.splice.call(that.actions, index, 1)
        }
      })
    },
    addOuPrint(e) {
      let that = this
      if (
        Array.prototype.filter.call(that.actions, (item, index) => {
          return item.name == '预览'
        }).length === 0
      ) {
        that.actions.unshift({
          name: '预览',
          color: '#2161ff'
        })
      }
    },
    //取消按钮点击时触发
    onCancel() {
      this.show = false
    },
    //流程催办
    taskUrgent() {
      this.$store.dispatch('storeProcess/isEnd', this.procInstId).then(() => {
        this.$refs.taskUrgent.handleClose() //父组件调用子组件方法
      })
    },
    //催办记录
    urgentRecord() {
      this.$refs.urgentRecord.handleClose() //父组件调用子组件方法
    },
    //流程抄送
    taskToCopyTo() {
      if (this.type && this.type == 'doneList') {
        this.selectNodeId = this.$refs.doneAction.getSelectNodeId()
      }
      this.$refs.taskToCopyTo.handleClose(this.selectNodeId, this.copyTaskId) //父组件调用子组件方法
    },
    //发起沟通
    taskToCommu() {
      this.$store.dispatch('storeProcess/isEnd', this.procInstId).then(() => {
        this.$refs.taskToCommu.handleClose() //父组件调用子组件方法
      })
    },
    //跟踪设置
    taskFollow() {
      this.$store.dispatch('storeProcess/isEnd', this.procInstId).then(() => {
        this.$refs.taskFollow.handleOpen() //父组件调用子组件方法
      })
    },
    //流程图
    taskImage() {
      this.$refs.taskImage.handleOpen() //父组件调用子组件方法
    },
    //相关信息
    relatedInformation() {
      this.$refs.relatedInformation.handleClose() //父组件调用子组件方法
    },
    //相关信息
    printHtml() {
      this.show = false
      setTimeout(() => {
        var test = Print('#printTest1', {
          'no-print': 'top-btns-col no-print'
        })
        var printData = test.dom.innerHTML
        window.document.body.innerHTML = printData
        window.print()
        utils.reload()
      }, 0)
      return false
    }
  },
  created() {
    if (!this.taskId && this.type != 'read' && !this.myReadType) {
      this.actions.push({name: '催办', color: '#2161ff'})
    }
    if (this.type != 'read' && !this.myReadType) {
      this.actions.push({name: '催办记录', color: '#2161ff'})
    }
    //如果是通过二维码分享的，则只能查看流程图和审批记录
    if (this.isShare) {
      this.actions = [
        {name: '流程图', color: '#2161ff'},
        {name: '相关信息', color: '#2161ff'},
        {name: '审批记录', color: '#2161ff'}
      ]
    }
    if (this.instId == undefined) {
      this.$store
        .dispatch('storeProcess/getNotice', this.taskId)
        .then(tasks => {
          this.tasks = tasks
          this.procInstId = tasks.bpmTask.procInstId
          this.defId = tasks.bpmTask.procDefId
          this.bpmnInstId = tasks.bpmTask.bpmnInstId
          this.subject = tasks.bpmTask.subject
          this.status = tasks.bpmTask.status
          this.execId = tasks.bpmTask.execId
          this.instStatus = tasks.bpmTask.instStatus

          if (tasks.curNodeDef && tasks.curNodeDef.nodeProperties) {
            this.nodeType = tasks.curNodeDef.type
            this.nodeId = tasks.curNodeDef.nodeId
            /*ccwgq 2022-06-13 由于nodeProperties是数组导致取不到当前设置意见反填字段造成问题
            默认先采用parentDefKey叫local_的那个对象作为节点属性*/
            let useNodePropertyList=tasks.curNodeDef.nodeProperties.filter((item)=>item.parentDefKey=="local_")
            let nodeProperties =
             useNodePropertyList[0]|| tasks.curNodeDef.nodeProperties[0] ||
              tasks.curNodeDef.localProperties
            this.choiceExcutor = nodeProperties.choiceExcutor
            this.jumpType = nodeProperties.jumpType
            this.approvalArea = nodeProperties.approvalArea
            this.opinionField = nodeProperties.opinionField
            this.appendOpinion = nodeProperties.appendOpinion
            this.signatureField = nodeProperties.signatureField
              ? nodeProperties.signatureField
              : ''
            this.signatureCover = nodeProperties.signatureCover
              ? nodeProperties.signatureCover
              : false
            this.secretFree = nodeProperties.secretFree
              ? nodeProperties.secretFree
              : false
          }
          if (!this.bpmnInstId && this.status != 'COMMU') {
            this.$store.dispatch('storeProcess/noticeTurnDode', this.taskId) //知会任务待办转已办
          }
        })
      this.$store.dispatch('storeProcess/addReadRecord', this.taskId) //添加阅读记录
    } else {
      this.$store
        .dispatch('storeProcess/getInstanceByInstId', this.instId)
        .then(insts => {
          this.defId = insts.procDefId
          this.bpmnInstId = insts.bpmnInstId
          this.subject = insts.subject
          this.instStatus = insts.status
        })
      //知会任务待办转已办(待阅列表进来的)
      if (this.readId && !this.myReadType) {
        this.$store.dispatch('storeProcess/noticeTurnDode', this.readId)
      }
      //获取知会任务待办详情
      if (this.readId) {
        this.$store
          .dispatch('storeProcess/getBpmTaskNoticeById', this.readId)
          .then(row => {
            if (row.taskId) {
              this.copyTaskId = row.taskId
            } else if (row.nodeId) {
              this.selectNodeId = row.nodeId
            }
          })
      }
      //获取知会任务已办详情
      if (this.readDoneId) {
        this.$store
          .dispatch('storeProcess/getBpmTaskNoticeDoneById', this.readDoneId)
          .then(row => {
            if (row.taskId) {
              this.copyTaskId = row.taskId
            } else if (row.nodeId) {
              this.selectNodeId = row.taskKey
            }
          })
      }
    }
    //获取当前用户ID
    this.promoterId = JSON.parse(sessionStorage.getItem('currentUser')).userId
  },
  watch: {
    // actions: {
    //   handler: function(val) {
    //     this.$refs.vanSheet.$forceUpdate()
    //   },
    //   deep: true
    // }
  }
}
</script>
<style lang="stylus" scoped>
div>>>.van-icon {
    position: relative;
    display: inline-block;
    font: normal normal normal 14px/1 vant-icon;
    font-size: 20px;
    text-rendering: auto;
    -webkit-font-smoothing: antialiased;
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

.form-content {
  padding-top: 10px;
}

.xh_su {
  text-align: left;
  padding-top: 20px;
  padding-left: 15px;
  padding-bottom: 45px;
  border-top: 1px solid #f1f4f7;
  background: #fff;
  border-bottom: 1px dashed #f1f2f5;
}

.xh_bd {
  line-height: 22px;
  font-size: 16px;
  color: rgba(0,0,0,0.85);
  background-size: 4px 13px;
  position: absolute;
  font-weight: bold;
  word-wrap: break-word;
  float: left;
}

.xh_pop_box_01 {
  width: 100%;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1500;
  background: #FFFFFF;
  overflow-y: auto;
}

.xh_mb {
  background-color: #fff;
  padding-bottom: 50px;
}
</style>
