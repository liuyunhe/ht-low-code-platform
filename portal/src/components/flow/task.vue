<template>
  <el-container :class="defKey ? 'singleContainer' : 'container'">
    <el-header class="task_header notprint" height="40px">
      <div class="flex container__header">
        <h3 ref="flowSubject" v-auto-tooltip="{placement: 'bottom'}">
          {{ subject }}
        </h3>
        <!-- <auto-tooltip :content="subject" placement="bottom-start">
          <h3 ref="flowSubject">{{ subject }}</h3>
        </auto-tooltip> -->
        <div class="container__header-btngroup">
<!--           <el-button
            type="text"
            icon="el-icon-document-copy"
            v-if="isLook"
            @click="copeInst()"
            >复制</el-button
          >
          <el-button
            type="text"
            icon="icon-folder-add"
            v-if="!taskId && type != 'read' && !myReadType"
            @click="taskUrgent"
            >催办</el-button
          > -->
          <!-- 20221107 ninghua 注释掉右上角不维护的按钮 只留下抄送、流程图、处理记录 -->
<!--           <el-button
            type="text"
            icon="el-icon-search"
            v-if="type != 'read' && !myReadType"
            @click="urgentRecord"
          >
            催办记录</el-button
          >
          <el-button
            type="text"
            icon="el-icon-s-unfold"
            v-if="showModifyRecord"
            @click="openModifyRecord"
            >修改记录
          </el-button>
          <el-button type="text" icon="icon-trace" @click="taskFollow"
            >跟踪</el-button
          > -->
<!--           <el-button type="text" icon="icon-print" @click="showPrint"
            >预览</el-button
          > -->
          <!-- 2022-09-14:yigz 沟通功能转移到task.vue 中 -->
          <!-- <el-button type="text" icon="icon-communication" @click="taskToCommu"
            >沟通</el-button
          > -->
          <!-- 2022-10-19:yigz 在已办中，不允许进行沟通 -->
          <!-- 20231018 tanAn项目不需要抄送功能 -->
          <!-- <el-button
            type="text"
            icon="icon-folder"
            v-if="taskToCopable"
            @click="taskToCopyTo"
            >抄送</el-button
          > -->
          <el-button type="text" icon="icon-flow1" @click="taskImage"
            >流程图</el-button
          >
          <!--          ccwgq 合同审批单，当前只有合同和合同审批可用-->
          <!--          注释掉的是第一个版本的合同审批单，留着吧-->
          <!--          <el-button-->
          <!--            type="text"-->
          <!--            icon="el-icon-document"-->
          <!--            v-if="formKey == 'ht' || formKey == 'htsp' || formKey == 'htpkg'"-->
          <!--            @click="approvalFormPrint2"-->
          <!--            >审批单(原)</el-button-->
          <!--          >-->
          <!--          新版的合同审批单 采用了vue的渲染函数来写-->
<!--           <el-button
            type="text"
            icon="el-icon-document"
            v-if="['ht', 'htN', 'htsp', 'htpkg'].includes(formKey)"
            @click="approvalFormPrint"
            >审批单</el-button
          > -->
<!--           <el-button type="text" icon="icon-info" @click="relatedInformation"
            >相关信息</el-button
          > -->
          <el-button type="text" icon="icon-info" @click="processRecordDialog"
            >处理记录</el-button
          >
<!--           <el-button
            type="text"
            icon="icon-question"
            @click="this.$refs.flowAction.$refs.formContent.previewHelpFile"
            v-if="
              this.$refs.flowAction != undefined
                ? this.$refs.flowAction.$refs.formContent.formHelpFile &&
                  this.$refs.flowAction.$refs.formContent.formHelpFile.length >
                    0
                : false
            "
            >流程说明</el-button
          > -->
        </div>
      </div>
    </el-header>
    <div class="container__content" ref="print">
      <FlowAction
        ref="flowAction"
        v-if="type != 'doneList'"
        :instId="procInstId"
        :type="type"
        :taskId="taskId"
        :task_state="task_state"
        :execId="execId"
        :defId="defId"
        :status="status"
        :tasks="tasks"
        :readId="readId"
        :myReadType="myReadType"
        :readDoneId="readDoneId"
        :choiceExcutor="choiceExcutor"
        :jumpType="jumpType"
        :instStatus="instStatus"
        :leaderId="leaderId"
        :approvalArea="approvalArea"
        :referOpinion="referOpinion"
        :nodeType="nodeType"
        :nodeId="nodeId"
        :isLook="isLook"
        :sponsorRevoke="sponsorRevoke"
        :opinionField="opinionField"
        :appendOpinion="appendOpinion"
        :signatureField="signatureField"
        :signatureCover="signatureCover"
        :secretFree="secretFree"
        :defKey="flowDefKey"
        :lastRouterName="lastRouterName"
      />

      <DoneAction
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
        :lastRouterName="lastRouterName"
      />
      <!-- <ProcessRecord :instId="procInstId"/> -->
    </div>
    <!-- 2022-09-14:yigz 沟通功能转移到task.vue 中 -->
    <!-- 发起沟通 -->
    <!-- <TaskToCommu ref="taskToCommu" :instId="procInstId" :defId="defId" /> -->
    <!-- 跟踪设置 -->
    <TaskFollow ref="taskFollow" :instId="procInstId" :defId="defId" />
    <!-- 流程图 -->
    <TaskImage ref="taskImage" :bpmnInstId="bpmnInstId" :instId="procInstId" />
    <!-- 相关信息 -->
    <RelatedInformation ref="relatedInformation" :instId="procInstId" />
    <!-- 流程抄送-->
    <TaskToCopyTo
      ref="taskToCopyTo"
      :taskId="copyTaskId"
      :instId="procInstId"
      :nodeId="nodeId"
    />
    <!-- 流程催办 -->
    <TaskUrgent
      ref="taskUrgent"
      :instId="procInstId"
      :defId="defId"
      :subject="subject"
    />
    <!-- 催办记录 -->
    <UrgentRecord
      ref="urgentRecord"
      :promoterId="promoterId"
      :instId="procInstId"
    />
    <!-- 修改记录 -->
    <ModifyRecord ref="modifyRecord" :instId="procInstId" />
    <FlowPrint
      ref="flowPrint"
      :formKey="formKey"
      :instId="procInstId"
      @printWordTemplate="printWordTemplate"
      @previewWordTemplate="previewWordTemplate"
      @printHtml="printHtml"
    />
    <!-- 处理记录 -->
    <ProcessRecordDialog
      ref="processRecordDialog"
      :instId="procInstId"
      :taskId="taskId"
      :referOpinion="referOpinion"
      :nodeType="nodeType"
      :defId="defId"
      :nodeId="nodeId"
    />
    <!--    审批单-->
    <ApprFormPrint
      ref="apprFormPrint"
      :subject="subject"
      :bpmn-inst-id="bpmnInstId"
      :inst-id="procInstId"
      :def-id="defId"
      :task-id="taskId"
      :leader-id="leaderId"
      :formKey="formKey"
    ></ApprFormPrint>
    <ApprovalFormPrint
      ref="approvalFormPrint"
      :subject="subject"
      :bpmn-inst-id="bpmnInstId"
      :inst-id="procInstId"
      :def-id="defId"
      :task-id="taskId"
      :leader-id="leaderId"
      :formKey="formKey"
    />
    <!-- word预览弹出框 -->
    <el-dialog
      title="word预览"
      :visible.sync="previewWordDialog"
      width="90%"
      style="margin-top: -100px !important"
    >
      <iframe
        :src="previewWordPdfSrc"
        name="previewWord"
        style="width: 100%; border: 0"
        align="middle"
        :height="previewWordHeight"
      ></iframe>
    </el-dialog>
  </el-container>
</template>

<script>
import FormContent from '@/components/flow/formContent.vue'
import RelatedInformation from '@/components/flow/relatedInformation.vue'
import FlowAction from '@/components/flow/flowAction.vue'
import DoneAction from '@/components/flow/doneAction.vue'
import ProcessRecord from '@/components/flow/processRecord.vue'
import TaskToCopyTo from '@/components/flow/task/taskToCopyTo.vue'
// import TaskToCommu from '@/components/flow/task/taskToCommu.vue'
import TaskFollow from '@/components/flow/task/taskFollow.vue'
import TaskImage from '@/components/flow/task/taskImage.vue'
import UrgentRecord from '@/components/flow/urgentRecord.vue'
import ModifyRecord from '@/components/flow/modifyRecord.vue'
import TaskUrgent from '@/components/flow/task/taskUrgent.vue'
import FlowPrint from '@/components/flow/flowPrint.vue'
import ProcessRecordDialog from '@/components/flow/processRecordDialog.vue'
import req from '@/request.js'
import utils from '@/utils.js'
import {Loading} from 'element-ui'
import {mapState, mapActions} from 'vuex'
import watermark from '@/watermark.js'
import ApprFormPrint from '../eipControl/ou/ApprFormPrint'
import ApprovalFormPrint from '../eipControl/ou/approvalFormPrint'
import {Base64} from 'js-base64'
export default {
  name: 'task',
  components: {
    ApprFormPrint,
    ApprovalFormPrint,
    FormContent,
    FlowAction,
    ProcessRecord,
    // TaskToCommu,
    TaskFollow,
    TaskImage,
    RelatedInformation,
    TaskToCopyTo,
    UrgentRecord,
    ModifyRecord,
    TaskUrgent,
    DoneAction,
    FlowPrint,
    ProcessRecordDialog,
  },
  props: [
    'task_state',
    'instId',
    'type',
    'taskId',
    'readId',
    'leaderId',
    'readDoneId',
    'myReadType',
    'noSingle',
    'defKey',
  ],
  data() {
    return {
      sponsorRevoke: false, //允许发起人强制收回（默认不勾选）
      isLook: false,
      tasks: {}, //任务详情
      procInstId: this.instId,
      copyTaskId: this.taskId,
      defId: '',
      bpmnInstId: '',
      subject: '',
      status: '',
      instStatus: '',
      choiceExcutor: '',
      show: true,
      jumpType: '',
      promoterId: '',
      execId: '',
      selectNodeId: '',
      approvalArea: '', //审批区域显示的内容
      referOpinion: true, //允许参考意见 (选择否，则审批时不允许参考同环节其他会签人员的意见)
      nodeType: '', //当前任务类型
      nodeId: '', //当前任务节点
      showModifyRecord: false, //是否显示表单修改记录
      formKey: '',
      opinionField: '', //审批意见反填字段
      appendOpinion: '', //是否覆盖审批意见
      signatureField: '', //自动签章字段
      signatureCover: false, //自动签章是否覆盖
      secretFree: false, //自动签章时是否免密
      previewWordDialog: false,
      previewWordHeight: 600,
      previewWordPdfSrc: '',
      flowDefKey: '',
      //ccwgq 2022-09-02 from路由的name
      lastRouterName: '',
    }
  },
  computed: {
    //ccwgq 2022-10-27 已办列表里可以使用抄送功能
    taskToCopable() {
      //要显示的key列表
      const showKeyList = ['dfht','fb','htyssp',
      'fssp','flwscbsp','fxsxsp','daily_approve',
      'xmtqjrsp','sssp','wplspysp'];
      //要隐藏的key列表
      const hideKeyList = ['wplsbatz','fsswtz','ssswtz','lyjhhtz']
      if (this.type === 'doneList') {
        return showKeyList.includes(this.formKey)
      } else {
        return !hideKeyList.includes(this.formKey)
      }
    },
  },
  mounted() {
    this.previewWordHeight = document.documentElement.clientHeight - 80
  },
  methods: {
    //复制流程
    copeInst() {
      this.$confirm(
        '此操作将把当前实例数据复制到新流程待启动,是否继续?',
        '提示',
        {
          confirmButtonText: '继续',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(() => {
          this.$router.push('/agentStart/' + this.defId + '/0/' + this.instId)
        })
        .catch(() => {})
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
    //表单修改记录
    openModifyRecord() {
      this.$refs.modifyRecord.handleClose() //父组件调用子组件方法
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
    //处理记录信息
    processRecordDialog() {
      this.$refs.processRecordDialog.handleClose() //父组件调用子组件方法
    },

    // lyzcw: 自定义打印预览：从表单获取套打模板ID
    ouPrint() {
      let this_ = this
      let boData =
        this.$refs.flowAction == undefined
          ? this.$refs.doneAction.getFormData()
          : this.$refs.flowAction.getFormData()
      //lyzcw: 2021-08-26 合同和合同变更如果有合同附件，直接预览该附件，多附件只预览第一个，并提示到在表单里预览
      var contJsonStr
      if (['ht', 'htN', 'htsp'].includes(this.formKey)) {
        contJsonStr = boData.ht.cont_json
      } else if (this.formKey == 'htbgN') {
        contJsonStr = boData.htgb.cont_json
      }
      if (typeof contJsonStr == 'string') {
        try {
          var contJson = JSON.parse(contJsonStr)
          if (typeof contJson == 'object' && contJson) {
            if (contJson.size > 0) {
              this.$message.warning(
                '合同附件有多个，这是第一个附件，其他请在表单的“合同附件里预览”'
              )
            }
            var obj = {}
            console.log('预览获取的合同附件json：', JSON.stringify(contJson))
            obj.id = contJson[0].response.fileId
            obj.name = contJson[0].name
            obj.size = contJson[0].size
            // 直接预览合同附件
            this.$refs.flowAction.$refs.formContent.$refs.filePreview.preview(
              obj
            )
            return
          }
        } catch (e) {
          console.log('error：' + '解析预览附件异常' + '!!!' + e)
        }
      }

      //  根据formKey判断
      let templateId
      if (['ht', 'htN', 'htsp'].includes(this.formKey)) {
        templateId =
          boData.ht.template_id == null || boData.ht.template_id == ''
            ? `${window.context.defaultTemplateId}`
            : boData.ht.template_id
      } else if (this.formKey == 'htbgN') {
        templateId =
          boData.htbg.template_id == null || boData.htbg.template_id == ''
            ? `${window.context.defaultTemplateId}`
            : boData.htbg.template_id
      } else if (this.formKey == 'fb') {
        templateId = boData.htfb.template_id
      }
      if (!templateId || templateId === '') {
        this.$message.warning('请选择模板')
        return
      }
      Loading.service('表单打印中')
      //console.log("boData.ht：", boData.ht);
      var url =
        '${form}/form/printTemplate/v1/wordPrint?id=' +
        templateId +
        '&defId=' +
        this.defId +
        '&nodeId=' +
        this.nodeId +
        '&procInstId=' +
        this.procInstId
      req.get(url).then((res) => {
        let loadingInstance = Loading.service('表单打印中')
        if (!res.data.state) {
          this.$message({
            message: res.data.message,
            type: 'warning',
          })
          this.$nextTick(() => {
            // 以服务的方式调用的 Loading 需要异步关闭
            loadingInstance.close()
          })
        } else {
          let url =
            window.context.portal +
            '/file/onlinePreviewController/v1/onlinePreview?fileId=' +
            res.data.value
          this.$http.get(url).then((resp) => {
            let data = resp.data
            if (data.result == 'error') {
              Message.error('附件不存在')
            } else {
              req
                .get(window.context.portal + data.pdfUrl, 'arraybuffer')
                .then((response) => {
                  console.log(
                    '请求预览文件window.context.portal + data.pdfUrl：',
                    window.context.portal + data.pdfUrl
                  )
                  console.log('请求预览文件response：', response)

                  let type = response.headers['content-type']
                  if (type) {
                    this.previewWordPdfSrc = window.URL.createObjectURL(
                      new Blob([response.data], {type: type})
                    )
                  } else {
                    this.previewWordPdfSrc = window.URL.createObjectURL(
                      new Blob([response.data])
                    )
                  }
                  this.previewWordDialog = true
                })
              Loading.service('表单打印中').close()
            }
          })
        }
      })
    },
    //2021-10-26  ccwgq: 二次开发 合同审批单
    approvalFormPrint() {
      this.$refs.approvalFormPrint.handleOpen()
    },
    approvalFormPrint2() {
      this.$refs.apprFormPrint.handleOpen()
    },
    //相关信息
    showPrint() {
      let this_ = this
      if (!this.formKey || this.formKey == '') {
        if (!this.nodeId) {
          this.nodeId = ''
        }
        var url =
          '${bpmRunTime}/runtime/instance/v1/printBoAndFormKey?defId=' +
          this.defId +
          '&nodeId=' +
          this.nodeId +
          '&procInstId=' +
          this.procInstId
        req.get(url).then((res) => {
          if (res.data) {
            // console.log('data====>', rep.data)
            this.formKey = res.data.formKey
            let param = {
              pageBean: {page: 1, pageSize: 20, total: 0},
              querys: [
                {
                  group: 'defaultQueryGroup',
                  operation: 'EQUAL',
                  relation: 'AND',
                  property: 'formKey',
                  value: this.formKey,
                },
              ],
            }
            req
              .post(
                req.getContext().form + '/form/printTemplate/v1/getPrintList',
                param
              )
              .then((response) => {
                if (response.data.rows && response.data.rows.length > 0) {
                  this.$refs.flowPrint.handleOpen() //父组件调用子组件方法
                } else {
                  this_.printHtml()
                }
              })
          }
        })
        // lyzcw：合同表单，直接从表单中获取套打模板ID
      } else if (['ht', 'htN', 'htsp', 'fb', 'htbgN'].includes(this.formKey)) {
        this_.ouPrint()
      } else {
        let param = {
          pageBean: {page: 1, pageSize: 20, total: 0},
          querys: [
            {
              group: 'defaultQueryGroup',
              operation: 'EQUAL',
              relation: 'AND',
              property: 'formKey',
              value: this.formKey,
            },
          ],
        }
        req
          .post(
            req.getContext().form + '/form/printTemplate/v1/getPrintList',
            param
          )
          .then((response) => {
            if (response.data.rows && response.data.rows.length > 0) {
              this.$refs.flowPrint.handleOpen() //父组件调用子组件方法
            } else {
              this_.printHtml()
            }
          })
      }
    },
    //未设置word套打模板，直接调用打印
    printHtml(data) {
      if (this.type != 'doneList') {
        this.$refs.flowAction.hiddenOpertion()
      } else {
        this.$refs.doneAction.hiddenOpertion()
      }

      setTimeout(() => {
        document.getElementsByTagName('body')[0].style.zoom = 0.8
        window.print()
        utils.reload()
        document.getElementsByTagName('body')[0].style.zoom = 1
      }, 500)
    },
    previewWordTemplate(data) {
      if (!data) {
        this.$message({
          message: '请选择打印模板',
          type: 'warning',
        })
        return false
      }
      if (data && data.printType == 'form') {
        this.$message({
          message: '请选择word套打模板',
          type: 'warning',
        })
        return false
      }
      Loading.service('表单打印中')
      var url =
        '${form}/form/printTemplate/v1/wordPrint?id=' +
        data.id +
        '&defId=' +
        this.defId +
        '&nodeId=' +
        this.nodeId +
        '&procInstId=' +
        this.procInstId
      req.get(url).then((res) => {
        let loadingInstance = Loading.service('表单打印中')
        if (!res.data.state) {
          this.$message({
            message: res.data.message,
            type: 'warning',
          })
          this.$nextTick(() => {
            // 以服务的方式调用的 Loading 需要异步关闭
            loadingInstance.close()
          })
        } else {
          let url =
            window.context.portal +
            '/file/onlinePreviewController/v1/onlinePreview?fileId=' +
            res.data.value
          this.$http.get(url).then((resp) => {
            let data = resp.data
            if (data.result == 'error') {
              Message.error('附件不存在')
            } else {
              req
                .get(window.context.portal + data.pdfUrl, 'arraybuffer')
                .then((response) => {
                  let type = response.headers['content-type']
                  if (type) {
                    this.previewWordPdfSrc = window.URL.createObjectURL(
                      new Blob([response.data], {type: type})
                    )
                  } else {
                    this.previewWordPdfSrc = window.URL.createObjectURL(
                      new Blob([response.data])
                    )
                  }
                  this.previewWordDialog = true
                })
              Loading.service('表单打印中').close()
            }
          })
        }
      })
    },
    printWordTemplate(data) {
      if (!data) {
        this.$message({
          message: '请选择打印模板',
          type: 'warning',
        })
        return false
      }
      if (data && data.printType == 'form') {
        this.$message({
          message: '请选择word套打模板',
          type: 'warning',
        })
        return false
      }
      Loading.service('表单打印中')
      var url =
        '${form}/form/printTemplate/v1/wordPrint?id=' +
        data.id +
        '&defId=' +
        this.defId +
        '&nodeId=' +
        this.nodeId +
        '&procInstId=' +
        this.procInstId
      req.get(url).then((res) => {
        let loadingInstance = Loading.service('表单打印中')
        if (!res.data.state) {
          this.$message({
            message: res.data.message,
            type: 'warning',
          })
          this.$nextTick(() => {
            // 以服务的方式调用的 Loading 需要异步关闭
            loadingInstance.close()
          })
        } else {
          req
            .download(
              '${portal}/system/file/v1/downloadFile?fileId=' + res.data.value
            )
            .then((r) => {
              this.$nextTick(() => {
                // 以服务的方式调用的 Loading 需要异步关闭
                loadingInstance.close()
              })
            })
        }
      })
    },
  },
  created() {
    //不是待办进来
    if (!this.taskId && this.type != 'read' && !this.myReadType) {
      //是否是查看实例页面
      this.isLook = true
    }
    window.agentLeaderId = this.leaderId
    let this_ = this
    if (this.instId == undefined) {
      this.$store
        .dispatch('storeProcess/getNotice', this.taskId)
        .then((tasks) => {
          this_.tasks = tasks
          this_.procInstId = tasks.bpmTask.procInstId
          this_.defId = tasks.bpmTask.procDefId
          this_.bpmnInstId = tasks.bpmTask.bpmnInstId
          this_.subject = tasks.bpmTask.subject
          this_.status = tasks.bpmTask.status
          this_.execId = tasks.bpmTask.execId
          this_.instStatus = tasks.bpmTask.instStatus
          this_.flowDefKey = tasks.bpmTask.procDefKey
          if (tasks.curNodeDef && tasks.curNodeDef.nodeProperties) {
            this.nodeType = tasks.curNodeDef.type
            this.nodeId = tasks.curNodeDef.nodeId

            /*ccwgq 2022-06-13 由于nodeProperties是数组导致取不到当前设置意见反填字段造成问题
            默认先采用parentDefKey叫local_的那个对象作为节点属性*/
            let useNodePropertyList = tasks.curNodeDef.nodeProperties.filter(
              (item) => item.parentDefKey == 'local_'
            )
            let nodeProperties =
              useNodePropertyList[0] ||
              tasks.curNodeDef.nodeProperties[0] ||
              tasks.curNodeDef.localProperties
            this.choiceExcutor = nodeProperties.choiceExcutor
            this.jumpType = nodeProperties.jumpType
            this.approvalArea = nodeProperties.approvalArea
            this.referOpinion = nodeProperties.referOpinion
            this.opinionField = nodeProperties.opinionField
            this.signatureField = nodeProperties.signatureField
              ? nodeProperties.signatureField
              : ''
            this.signatureCover = nodeProperties.signatureCover
              ? nodeProperties.signatureCover
              : false
            this.secretFree = nodeProperties.secretFree
              ? nodeProperties.secretFree
              : false
            this.appendOpinion = nodeProperties.appendOpinion
          } else {
            // yigz 2022-10-20 会签（之前的沟通）取不到 this.opinionField属性，通过formData里面取值
            if (tasks.opinionList && tasks.opinionList.length > 0) {
              if (tasks.opinionList[0] && tasks.opinionList[0].length > 0) {
                let formDataTmp = tasks.opinionList[0][0].formData
                let formDataJson = Base64.decode(formDataTmp)
                if (formDataJson) {
                  let opinionFieldEntity = JSON.parse(formDataJson)
                  let opinionFieldTemp = Object.keys(opinionFieldEntity)
                  if (opinionFieldTemp && opinionFieldTemp.length > 0) {
                    this.opinionField =
                      opinionFieldTemp[0] + '.' + 'signature_opinion'
                  }
                }
              }
            }
          }
          //是否显示表单修改记录
          if (tasks.showModifyRecord) {
            this_.showModifyRecord = true
          }
          //表单formKey
          this_.formKey = tasks.formKey
          if (!this.bpmnInstId && this.status != 'COMMU') {
            this.$store.dispatch('storeProcess/noticeTurnDode', this.taskId) //知会任务待办转已办
          }
        })
      this.$store.dispatch('storeProcess/addReadRecord', this.taskId) //添加阅读记录
    } else {
      //根据实例id获取实例对象
      this.$store
        .dispatch('storeProcess/getInstanceByInstId', this.instId)
        .then((insts) => {
          this.approvalArea = 'processRecord'
          this.defId = insts.procDefId
          this.bpmnInstId = insts.bpmnInstId
          this.subject = insts.subject
          this.instStatus = insts.status
          //是否显示表单修改记录
          if (insts.showModifyRecord) {
            this.showModifyRecord = true
          }
          //表单formKey
          this.formKey = insts.bpmFormKey

          //我的请求列表页面进来的
          if (this.type == 'request') {
            //根据流程实例Id获取发起节点并判断是否允许发起人强制收回
            let url =
              req.getContext().bpmRunTime +
              '/runtime/instance/v1/getSponsorRevokeByInstId?instId=' +
              this.instId
            req.get(url).then((req) => {
              this.sponsorRevoke = req.data.value
            })
          }
        })
      //知会任务待办转已办(待阅列表进来的)
      if (this.readId && !this.myReadType) {
        //this.$store.dispatch('storeProcess/noticeTurnDode', this.readId)
        console.log("抄送公文进来的")
      }
      //获取知会任务待办详情
      if (this.readId) {
        this.$store
          .dispatch('storeProcess/getBpmTaskNoticeById', this.readId)
          .then((row) => {
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
          .then((row) => {
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
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.lastRouterName = from.name
    })
  },
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';

.container {
  margin-top: -8px !important;
  height: 100%;

  .task_header {
    width: calc(100% - 40px);
    background: $--background-color-secondary;
  }
  .container__header {
    //ccwgq 2022-05-30 修改字体大小
    * {
      font-size: 11pt !important;
      // color: black;
      font-family: MicroSoft YaHei;
    }
    width: 100%;
    justify-content: space-between;
  }
  .container__header-btngroup {
    margin-right: 10px;
  }
  .container__content {
    margin-top: 40px;
    height: 100%;
  }
}

.singleContainer {
  margin-top: 0px !important;
  height: 100%;

  .task_header {
    width: calc(100% - 40px);
    background: $--background-color-secondary;
  }
  .container__header {
    width: 100%;
    justify-content: space-between;
  }
  .container__header-btngroup {
    margin-right: 10px;
  }
  .container__content {
    margin-top: 40px;
    height: 100%;
  }
}

.el-header {
  padding: 0;
}

.top-subject-col > h3 {
  text-align: left;
  color: #666;
}
.flow-subject {
  text-align: right;
  color: #666;
  margin-top: 18px;
}

.top-btns-col {
  padding-right: 6px;
  height: 48px;
  line-height: 48px;
  text-align: right;
}

.top-btns-col > button {
  color: #666;
}

.top-btns-col > button /deep/ span {
  margin-left: 3px;
}

.top-btns-col > button:hover {
  color: $--theme-color;
}

.text {
  font-size: 14px;
}

.item {
  padding: 18px 0;
}
@page {
  margin: auto 5mm;
  size: auto;
}
.task-card {
  width: 1360px;
  background: #fff;
  padding-top: 140px;
}
.task-card_not {
  width: 1360px;
  background: #fff;
  padding-top: 20px;
}
.task_header {
  position: fixed;
  z-index: 100;
  padding: 0px !important;
}
.btn_region_in {
  background-color: $--background-color-secondary;
}
.watermark {
  display: flex;
  position: fixed;
}
@media print {
  .watermark {
    display: flex;
  }
  .notprint {
    display: none;
  }
}
/**ccwgq 2022-05-30 修改字体的大小 */
/deep/ .action-btn {
  * {
    font-size: 11pt !important;
    //     // color: black;
    font-family: MicroSoft YaHei;
  }
}
/deep/ .container__header-btngroup {
  * {
    font-size: 11pt !important;
    //     // color: black;
    font-family: MicroSoft YaHei;
  }
}
/deep/ .actiondiv__header {
  * {
    font-size: 11pt !important;
    //     // color: black;
    font-family: MicroSoft YaHei;
  }
}
/deep/ .bpm-btn-dialog {
  .el-dialog__header {
    * {
      font-size: 20px !important;
      //     // color: black;
      font-family: MicroSoft YaHei;
    }
  }
  .el-dialog__body {
    * {
      font-size: 11pt !important;
      //     // color: black;
      font-family: MicroSoft YaHei;
    }
    table {
      tbody {
        th {
          min-width: 120px !important;
        }
      }
    }
  }
  .el-dialog__footer {
    * {
      font-size: 11pt !important;
      //     // color: black;
      font-family: MicroSoft YaHei;
    }
  }
}
</style>