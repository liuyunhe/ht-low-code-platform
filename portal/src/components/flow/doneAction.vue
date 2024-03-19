<template>
  <div id="display_none" style="width: 100%">
    <div
      v-if="
        status != 'COPYTO' &&
          status != 'FOLLOW' &&
          (type != undefined || taskId != undefined) &&
          opinionList &&
          opinionList.length > 0
      "
      class="btn_region no-print"
      :style="
        'top:' +
          btn_region_t +
          'px' +
          ';height:' +
          btn_region_h +
          'px' +
          ';width:' +
          btn_region_w +
          'px'
      "
      ref="btnRegion"
    >
      <div class="btn_region_in" :style="'width:' + btn_region_in_w">
        <br />
        <div class="action-container">
          <span>操作区域</span>
        </div>
        <div>
          <table style="width: 100%">
            <tbody>
              <tr>
                <!-- <td class="region">审批节点：</td> -->
                <td width="95%" class="action-group action-btn">
                  <el-radio
                    v-for="op in opinionList"
                    :key="op.taskKey"
                    v-model="selectNodeId"
                    :label="op.taskKey"
                    >{{ op.taskName }}</el-radio
                  >
                </td>
              </tr>
              <tr>
                <!-- <td></td> -->
                <td width="95%" class="action-group action-btn">
                  <el-button
                    v-if="
                      opinionMap[selectNodeId] &&
                        opinionMap[selectNodeId].revoke &&
                        opinionMap[selectNodeId].previousRevoke &&
                        opinionMap[selectNodeId].opinionStatus !=
                          'transAgree' &&
                        opinionMap[selectNodeId].opinionStatus !=
                          'opposeTrans' &&
                        opinionMap[selectNodeId].status != 'end'
                    "
                    type="danger"
                    @click="
                      taskSignLines.length > 0 ? handleRevoke() : openRevoke()
                    "
                    size="small"
                    :disabled="disabled"
                    >强制收回</el-button
                  >
                  <el-button type="default" @click="taskClose">关闭</el-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <el-dialog
      title="强制收回"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
      width="28%"
    >
      <el-container v-if="taskSignLines.length > 0">
        <el-header style="text-align: left; font-size: 12px">
          <span>从以下人员中强制收回工作项</span>
        </el-header>
        <el-main>
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
        </el-main>
      </el-container>
      <!--<div v-else>
            <h1>是否强制收回？</h1>
          </div>-->
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveRevoke" size="small"
          >确 定</el-button
        >
        <el-button @click="exitRevoke" size="small">取 消</el-button>
      </div>
    </el-dialog>
    <DoneFormContent
      ref="doneFormContent"
      v-if="opinionMap[selectNodeId] || didntSkipStart"
      :instId="instId"
      :nodeId="selectNodeId"
      :taskId="didntSkipStart ? null : opinionMap[selectNodeId].taskId"
      :pData="didntSkipStart ? null : opinionMap[selectNodeId].formData"
      :didntSkipStart="didntSkipStart"
      :type="type"
      :style="{marginTop: btn_region_h + 'px'}"
    />

    <!-- <ProcessRecord v-if="opinionMap[selectNodeId] && opinionMap[selectNodeId].approvalArea
      && opinionMap[selectNodeId].approvalArea.indexOf('processRecord')!=-1"
      :instId="instId"
      :defId="defId"
      :nodeType="opinionMap[selectNodeId].nodeType!=undefined ? opinionMap[selectNodeId].nodeType :''"
      :taskId="opinionMap[selectNodeId].taskId!=undefined ? opinionMap[selectNodeId].taskId :''"
      :nodeId="opinionMap[selectNodeId].taskKey!=undefined ? opinionMap[selectNodeId].taskKey :''"
      :referOpinion="opinionMap[selectNodeId].referOpinion!=undefined ? opinionMap[selectNodeId].referOpinion :true"
    /> -->
    <!-- 流程图 -->
    <!-- <ImageBpm :instId="instId"/> -->
    <taskToRevoke ref="taskToRevoke" :instId="instId" :taskId="taskId" />
  </div>
</template>
<script>
// import ProcessRecord from "@/components/flow/processRecord.vue";
import ImageBpm from '@/components/flow/imageBpm.vue'
import DoneFormContent from '@/components/flow/doneFormContent.vue'
import OpinionText from '@/components/common/opinionText.vue'
import FileUpload from '@/components/common/fileUpload.vue'
import {mapState} from 'vuex'
import {Message} from 'element-ui'
import TaskToReject from '@/components/flow/task/taskToReject.vue'
import TaskToDelegate from '@/components/flow/task/taskToDelegate.vue'
import TaskToCopyTo from '@/components/flow/task/taskToCopyTo.vue'
import TaskToInqu from '@/components/flow/task/taskToInqu.vue'
import taskToRevoke from '@/components/flow/task/taskToRevoke.vue'
import TaskToEndProcess from '@/components/flow/task/taskToEndProcess.vue'
import utils from '@/utils.js'
import {Base64} from 'js-base64'
import req from '@/request.js'

export default {
  components: {
    ImageBpm,
    // ProcessRecord,
    DoneFormContent,
    OpinionText,
    FileUpload,
    TaskToReject,
    TaskToDelegate,
    TaskToCopyTo,
    TaskToInqu,
    TaskToEndProcess,
    taskToRevoke
  },
  props: [
    'instId',
    'type',
    'taskId',
    'defId',
    'status',
    'choiceExcutor',
    'jumpType',
    'instStatus',
    'leaderId',
    'lastRouterName' //跳转的路由(from)的name
  ],
  data() {
    return {
      btn_region_t: 115,
      btn_region_in_w: '98%',
      btn_region_h: 140,
      btn_region_w: '',
      dialogFormVisible: false,
      dailogTitle: '',
      opinion: '强制收回',
      isHand: '',
      state: '',
      canLock: '',
      formData: '',
      actionName: '',
      text: '',
      disabled: false,
      btnAilas: '', //选择的按钮
      token: utils.getUrlKey('token'),
      opinionMap: {},
      opinionList: [],
      selectNodeId: '',
      inApprovalTaskIds: [],
      taskSignLines: [],
      didntSkipStart: false
    }
  },
  watch: {},
  computed: {
    ...mapState({
      rowsBtn: state => state.storeProcess.rowsBtn
    })
  },
  mounted() {
    //单选操作按钮默认选择第一个
    if (this.rowsBtn.length > 0 && this.canLock != 1) {
      this.btnAilas = this.rowsBtn[0].alias
    } else if (this.rowsBtn.length == 0 && this.canLock != 1) {
      if (this.type == 'done' || this.type == 'request') {
        this.btnAilas = 'handleRevoke'
      } else if (this.type == 'read') {
        this.btnAilas = 'handleRead'
      }
    }
    this.$set(
      this,
      'btn_region_w',
      document.getElementById('display_none').offsetWidth
    )
    //监听处理
    this.$watch('')
  },
  methods: {
    //lyzcw:2021-08-30 添加合同表单处理需要的表单数据
    getFormData() {
      let this_ = this
      let boData = this_.$refs.doneFormContent.data
      return boData
    },
    getFormKey() {
      let this_ = this
      let formKey = this_.$refs.doneFormContent.formKey
      this_.formKey = formKey
      return formKey
    },
    //关闭按钮
    taskClose() {
      //ccwgq 2022-09-23 先判断是不是从首页的栏目中跳转过来的
      if ((this.$route.query?.from ?? '') === 'home') {
        this.$store.dispatch('menu/setColumnInfo', {restore: true})
      }
      //判断是否是模块开发配置出来的
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
      } else if (JSON.stringify(this.$route.query) == '{}') {
        // this.$router.push('/v-flow/v-done')
        //ccwgq 2022-09-02 万一是从v-searchflow进来的呢
        if (this.lastRouterName === 'searchFlow') {
          this.$router.push('/v-flow/v-searchflow')
        } else if (this.lastRouterName === 'home') {
          this.$router.push('/home')
        } else {
          this.$router.push('/v-flow/v-done')
        }
      } else {
        this.$router.push('/home')
      }
    },
    //获取当前任务节点
    getSelectNodeId() {
      return this.selectNodeId
    },
    //强制收回到上一个节点
    handleRevoke() {
      let curOpinion = this.opinionMap[this.selectNodeId]
      if (curOpinion.needGetRevokeTasks) {
        let data = {
          instanceId: this.instId,
          nodeId: curOpinion.taskKey,
          taskId: curOpinion.taskId
        }
        this.$store
          .dispatch('storeProcess/getSignLinesInstIdNodeId', data)
          .then(data => {
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
      // this.$confirm('确认是否强制收回?', '提示', {
      //     confirmButtonText: '确定',
      //     cancelButtonText: '取消',
      //     type: 'warning'
      // }).then(() => {
      //     this.saveRevoke();
      // }).catch(() => {
      //     this.opinion="";
      // });
      this.saveRevoke()
    },
    saveRevoke() {
      let curOpinion = this.opinionMap[this.selectNodeId]
      console.log('saveRevoke ===>', curOpinion)
      let data = {
        instanceId: this.instId,
        taskId: curOpinion.taskId,
        revokeNodeId: this.selectNodeId
      }
      //用户任务1,直接使用强制收回到发起人的逻辑
      if (!curOpinion.revokeStart) {
        data.isHandRevoke = true
      } else {
        data.isHandRevoke = false
      }
      //正常强制收回
      let revokeUrl = 'storeProcess/revokeInstance'
      // 签署强制收回
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
          targetTaskId: curOpinion.taskId,
          targetNodeId: this.selectNodeId,
          signType: curOpinion.signType
        }
      }
      this.$refs.taskToRevoke.showDialog(revokeUrl, data)

      // this.$store.dispatch(revokeUrl,data).then(value=>{
      //   this.dialogFormVisible=false;
      //   this.opinion="";
      //   if(value){
      //     this.$router.push("/task/"+value+"/0");
      //     setTimeout(()=>{
      //       this.$root.$children[0].reload();
      //     },10);
      //   }else{
      //     this.$router.push("/v-flow/v-todo");
      //   }
      // });
    },
    exitRevoke() {
      this.dialogFormVisible = false
      this.opinion = ''
    },
    hiddenOpertion() {
      if (this.$refs.btnRegion) {
        this.$refs.btnRegion.style.display = 'none'
      }
      this.$refs.doneFormContent.hiddenContent()
    }
  },
  created() {
    //兼容只显示审批页面时
    if (this.$route.meta.single) {
      this.btn_region_t = 48
      this.btn_region_in_w = '100%'
    }
    let queryFilter = {}
    let pageBean = {pageBean: this.pagination}
    let querys = [
      {
        property: 'wfInst.id_',
        value: this.instId,
        group: 'typeId',
        operation: 'IN',
        relation: 'AND'
      }
    ]
    queryFilter = {pageBean: this.pagination, querys}
    let _this = this
    this.$store
      .dispatch('storeProcess/getDoneByInstId', queryFilter)
      .then(data => {
        if (data.data && data.data.rows) {
          data.data.rows.forEach(opinion => {
            //判断当前是否在第一个节点,并且流程设置为不跳过第一个节点
            if (
              data.data.rows.length == 1 &&
              opinion.opinionStatus == 'start'
            ) {
              this.didntSkipStart = true
            }
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
            // if (
            //   opinion.opinionStatus != 'signRecoverCancel' &&
            //   opinion.opinionStatus != 'retracted' &&
            //   opinion.opinionStatus != 'start' &&
            //   opinion.opinionStatus != 'end' &&
            //   !_this.opinionMap[opinion.taskKey] &&
            //   opinion.opinionStatus != 'awaiting_check' &&
            //   opinion.opinionStatus != 'copyto' &&
            //   opinion.opinionStatus != 'awaiting_feedback' &&
            //   opinion.opinionStatus != 'copyto_reply' &&
            //   opinion.opinionStatus != 'start_commu' &&
            //   opinion.opinionStatus != 'end_revoke'
            // ) {
            //   if (
            //     opinion.opinionStatus == 'skip' &&
            //     opinion.skipType != 'first'
            //   ) {
            //     return true
            //   }
            //   if (opinion.formData) {
            //     opinion.formData = JSON.parse(Base64.decode(opinion.formData))
            //   }
            //   _this.opinionMap[opinion.taskKey] = opinion
            //   _this.opinionList.push(opinion)
            //   _this.selectNodeId = _this.opinionList[0].taskKey
            // }
          })
        }
      })
  },
  filters: {
    executorFormat: function(value) {
      return value.name + '  ' + value.account + '  ' + value.orgName
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
@media print {
  .no-print {
    display: none;
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
.btn_region {
  position: fixed;
  z-index: 100;
  background: #f5f5f5;
}
.btn_region_in {
  margin: 0 auto;
  // background-color: #fff;
}
.region {
  padding-top: 10px;
}
.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 30px;
  height: 30px !important;
  margin-top: -40px;
}
</style>