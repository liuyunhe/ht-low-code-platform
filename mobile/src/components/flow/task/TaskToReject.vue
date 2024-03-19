<template>
  <ht-sidebar-dialog
    :visible="rejectDialog"
    title="驳回设置"
    :close-on-click-modal="false"
    :before-close="cancel"
    append-to-body
    class="dialog-body"
    width="100%"
  >
    <div :style="this.style">
      <van-form @submit="confirm">
        <div class="title-divider">
          <span>驳回重提模式：</span>
        </div>
        <van-field name="radio">
          <template #input>
            <van-radio-group
              v-model="backHandMode"
              icon-size="22"
              direction="horizontal"
            >
              <van-radio v-if="!rejectConf.inGateway" name="normal"
                >重新审批</van-radio
              >
              <van-radio name="direct">回到本节点</van-radio>
              <span v-show="rejectConf.inGateway" class="xh-star"
                >(网关内驳回只能回到本节点)</span
              >
            </van-radio-group>
          </template>
        </van-field>

        <div class="title-divider">
          <span>驳回方式：</span>
        </div>

        <van-field name="radio">
          <template #input>
            <van-radio-group
              v-model="radio"
              @change="rejectModeClick"
              icon-size="22"
            >
              <van-radio
                name="backToStart"
                v-show="
                  rejectConf.canRejectToStart &&
                  (backHandMode == 'normal' || !rejectConf.inSubProcess)
                "
                >驳回发起人</van-radio
              >
              <van-radio
                v-if="
                  !rejectConf.afterGateway &&
                  !rejectConf.inGateway &&
                  !rejectConf.inSubProcess
                "
                v-show="rejectConf.canRejectPreAct"
                name="rejectPre"
                >驳回上一步</van-radio
              >
              <van-radio
                v-show="
                  rejectConf.canRejectToAnyNode &&
                  (!rejectConf.inSubProcess || backHandMode != 'normal')
                "
                name="reject"
                >驳回指定节点</van-radio
              >
            </van-radio-group>
          </template>
        </van-field>

        <div
          class="title-divider"
          v-show="isNode && rejectConf.canRejectToAnyNode"
        >
          <span>选择驳回节点：</span>
        </div>
        <van-field
          name="radio"
          v-show="isNode && rejectConf.canRejectToAnyNode"
        >
          <template #input>
            <el-select
              style="width: 80%"
              size="medium"
              v-show="isNode && rejectConf.canRejectToAnyNode"
              v-model="nodeId"
              placeholder="请选择"
            >
              <el-option
                v-for="bpmExeStack in canRejectNode"
                :key="bpmExeStack.nodeId"
                :label="bpmExeStack.name"
                :value="bpmExeStack.nodeId"
              ></el-option>
            </el-select>
          </template>
        </van-field>

        <div class="title-divider">
          <span>驳回意见：</span>
        </div>
        <div class="opinion-text">
          <OpinionText
            :text="text"
            ref="opinionRejectText"
            @getOpinion="getOpinion"
          />
        </div>
      </van-form>

      <div class="ht-dialog-footer">
        <van-grid clickable :column-num="2">
          <van-grid-item icon="passed" @click="confirm" text="确 认" />
          <van-grid-item icon="close" @click="cancel" text="取 消" />
        </van-grid>
      </div>
    </div>
  </ht-sidebar-dialog>
</template>

<script>
import flow from '@/api/flow.js'
import {Notify, Form, Field, Radio, RadioGroup, Divider} from 'vant'
import OpinionText from '@/components/flow/task/OpinionText.vue'
import utils from '@/utils.js'

export default {
  name: 'taskToReject',
  props: ['taskId', 'leaderId', 'opinion', 'opinionField', 'appendOpinion'],
  components: {
    [Form.name]: Form,
    [Field.name]: Field,
    [Radio.name]: Radio,
    [RadioGroup.name]: RadioGroup,
    [Divider.name]: Divider,
    OpinionText,
  },
  data() {
    return {
      rejectTaskId: '', //要驳回的任务ID
      rejectDialog: false,
      radio: 'backToStart',
      nodeId: '',
      isNode: false,
      backHandMode: 'normal',
      token: utils.getUrlKey('token'),
      canRejectNode: [],
      style: '',
      rejectConf: {},
      isSameNode: true,
      title: '驳回',
      fullscreenLoading: true,
      boData: {},
      // wrap: "<br/><br/>",
      initBoAttr: '',
      appendStr: true,
      text: '',
      //2022-06-14 ccwgq 移动端 意见反填相关增加字段
      formatOpinion: '', //每次被格式化处理的意见
      opinionSortOrder: 'desc', //意见按时间倒序
      wrap: '\n', //换行分割
    }
  },
  computed: {},
  watch: {
    backHandMode: function (n, o) {
      if (this.rejectConf.inSubProcess) {
        if (n == 'normal') {
          this.radio = 'backToStart'
        } else {
          this.radio = 'reject'
        }
      }
      if (!this.isSameNode) {
        if (n == 'normal') {
          this.canRejectNode = this.rejectConf.allowNormalNode
        } else {
          this.canRejectNode = this.rejectConf.allowDirectNode
        }
        let flag = false
        this.canRejectNode.forEach((n) => {
          if (n.nodeId == this.nodeId) {
            flag = true
            return
          }
        })
        if (!flag) {
          this.nodeId = ''
        }
      }
    },
  },
  methods: {
    //选择驳回的任务节点
    rejectModeClick(value) {
      if (value == 'reject') {
        this.isNode = true
      } else {
        this.isNode = false
      }
    },
    //鼠标点击页面其他其他位置不关闭弹框
    handleClose() {
      this.rejectDialog = true
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
      let boData = this.boData
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
    //打开驳回设置页面
    handleOpen(parentTaskId, _this) {
      if (
        this.opinionField &&
        document.querySelector("[model-name='data." + this.opinionField + "']")
      ) {
        let con = document.querySelector(
          "[model-name='data." + this.opinionField + "']"
        ).__vue__
        if (con && con.isEditor) {
          this.wrap = '<br>'
        }
      }
      this.boData = _this.$parent.$refs.formContent.data
      if (parentTaskId) {
        this.rejectTaskId = parentTaskId
      }
      let data = {taskId: this.taskId, backModel: 'reject'}
      let this_ = this
      this.$store
        .dispatch('storeProcess/taskToReject', data)
        .then(function (resp) {
          setTimeout(() => {
            if (this_.opinion) {
              this_.$refs.opinionRejectText.setOpinion(this_.opinion)
            }
          }, 1000)

          this_.rejectConf = resp
          let normalNodeIds = []
          resp.allowNormalNode.forEach((element) => {
            normalNodeIds.push(element.nodeId)
          })
          if (resp.allowNormalNode) {
            resp.allowDirectNode.forEach((element) => {
              if (normalNodeIds.indexOf(element.nodeId) < 0) {
                this_.isSameNode = false
              }
            })
          }
          if (resp.inGateway) {
            this_.backHandMode = 'direct'
          }
          if (this_.backHandMode == 'normal') {
            this_.canRejectNode = resp.allowNormalNode
          } else {
            this_.canRejectNode = resp.allowDirectNode
          }

          // 只有驳回发起人的情况
          if (
            this_.rejectConf.canRejectToStart &&
            !this_.rejectConf.canRejectPreAct &&
            !this_.rejectConf.canRejectToAnyNode
          ) {
            this_.radio = 'backToStart'
            this_.rejectDialog = true
            this_.fullscreenLoading = false
            return
          }
          // 只有驳回上一步的情况
          if (
            !this_.rejectConf.canRejectToStart &&
            this_.rejectConf.canRejectPreAct &&
            !this_.rejectConf.canRejectToAnyNode
          ) {
            this_.radio = 'rejectPre'
            this_.rejectDialog = true
            this_.fullscreenLoading = false
            return
          }

          // 只有驳回指定节点的情况并且指定节点只有一个
          if (
            !this_.rejectConf.canRejectToStart &&
            !this_.rejectConf.canRejectPreAct &&
            this_.rejectConf.canRejectToAnyNode &&
            this_.canRejectNode.length == 1
          ) {
            this_.nodeId = this_.canRejectNode[0].nodeId
            this_.radio = 'reject'
            this_.rejectDialog = true
            this_.fullscreenLoading = false
            return
          }
          if (
            this_.rejectConf.canRejectToStart &&
            (this_.backHandMode == 'normal' || !this_.rejectConf.inSubProcess)
          ) {
            this_.radio = 'backToStart'
          } else if (
            !this_.rejectConf.afterGateway &&
            !this_.rejectConf.inGateway &&
            !this_.rejectConf.inSubProcess &&
            this_.rejectConf.canRejectPreAct
          ) {
            this_.radio = 'rejectPre'
          } else if (
            this_.rejectConf.canRejectToAnyNode &&
            (!this_.rejectConf.inSubProcess || this_.backHandMode != 'normal')
          ) {
            this_.radio = 'reject'
            this_.isNode = true
          }
          this_.title = '驳回设置'
          this_.rejectDialog = true
          this_.fullscreenLoading = false
        })
    },
    //取消
    cancel() {
      this.rejectDialog = false
    },
    //确认
    confirm() {
      if (!this.radio) {
        Notify({
          type: 'warning',
          message: '请选择驳回方式',
        })
        return
      }
      if (this.radio == 'reject' && !this.nodeId) {
        Notify({
          type: 'warning',
          message: '请选择驳回节点',
        })
        return
      }
      if (!this.opinion && this.$refs.opinionRejectText.getOpinion() == '') {
        Notify({
          type: 'warning',
          message: '请填写驳回意见',
        })
        return
      }
      //ccwgq 2022-06-14 只有存在意见反填字段才回填
      if (this.opinionField) {
        this.opinionBackToForm()
      }
      utils
        // lyzcw: 驳回不校验，2021-05-25 9:30
        .getOnlineFormData(false)
        .then((formDataStr) => this.submitConfirm(formDataStr))
        .catch((reason) =>
          utils.handleGetFormDataReject(reason).then(() => this.submitConfirm())
        )
    },
    submitConfirm(formDataStr) {
      if (formDataStr && formDataStr.constructor != String) {
        formDataStr = JSON.stringify(formDataStr)
      }
      if (this.radio == 'rejectPre') {
        this.nodeId = ''
      }
      let files = ''
      if (this.$refs.fileUpload && this.$refs.fileUpload.getFiles() != '') {
        files = JSON.stringify(this.$refs.fileUpload.getFiles())
      }
      let data = {
        taskId: this.taskId,
        rejectTaskId: this.rejectTaskId,
        actionName: this.radio == 'rejectPre' ? 'reject' : this.radio,
        backHandMode: this.backHandMode,
        opinion: this.opinion || this.$refs.opinionRejectText.getOpinion(),
        destination: this.nodeId,
        agentLeaderId: this.leaderId,
        files: files,
      }
      if (window.urgentStateValue) {
        data.urgentStateValue = window.urgentStateValue
      }
      if (formDataStr) {
        data.data = Base64.encode(formDataStr)
      }
      const loading = this.$loading({
        lock: true,
        text: '任务驳回中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)',
      })
      this.$store
        .dispatch('storeProcess/rejectComplete', data)
        .then(() => {
          this.rejectDialog = false
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
  margin-bottom: 5px;
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
</style>