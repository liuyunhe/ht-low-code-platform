<template>
  <ht-sidebar-dialog
    :visible="transDialog"
    title="流转设置"
    :close-on-click-modal="false"
    :before-close="cancel"
    append-to-body
    class="dialog-body"
    width="100%"
  >
    <div :style="this.style">
      <van-form v-form @submit="confirm">
        <div class="title-divider">
          <span>流转人员：</span>
        </div>

        <div class="opinion-text">
          <EipUserSelector
            v-model="users"
            :config="{id: 'userIds', fullname: 'users'}"
            :append-to-body="true"
            :single="false"
          />
        </div>

        <div class="title-divider">
          <span>流转意见：</span>
        </div>
        <div class="opinion-text">
          <OpinionText
            :text="text"
            ref="opinionText"
            @getOpinion="getOpinion"
          />
        </div>

        <van-collapse v-model="activeNames">
          <van-collapse-item name="1">
            <div slot="title">其他设置</div>

            <div class="title-divider">
              <span>任务通过规则：</span>
            </div>

            <van-field name="radio">
              <template #input>
                <van-radio-group
                  v-model="radioVote"
                  @change="setVote"
                  icon-size="22"
                  direction="horizontal"
                >
                  <van-radio name="1">全票通过</van-radio>
                  <van-radio name="2">一票否决</van-radio>
                  <van-radio name="3">一票同意</van-radio>
                  <van-radio name="4">自定义</van-radio>
                </van-radio-group>
              </template>
            </van-field>

            <div v-show="isHight" class="title-divider">
              <span>计票策略：</span>
            </div>
            <van-field v-show="isHight" name="radio">
              <template #input>
                <van-radio-group
                  v-model="decideType"
                  icon-size="22"
                  direction="horizontal"
                >
                  <van-radio name="agree">同意票</van-radio>
                  <van-radio name="refuse">否决票</van-radio>
                </van-radio-group>
              </template>
            </van-field>

            <div class="title-divider">
              <span>投票类型：</span>
            </div>
            <van-field name="radio">
              <template #input>
                <van-radio-group
                  v-model="voteType"
                  @change="voteTypeChange"
                  icon-size="22"
                  direction="horizontal"
                >
                  <van-radio name="amount">绝对票</van-radio>
                  <van-radio name="percent">百分比</van-radio>
                </van-radio-group>
              </template>
            </van-field>

            <div v-show="isHight" class="title-divider">
              <span>票数：</span>
            </div>
            <van-field v-show="isHight" name="radio">
              <template #input>
                <el-input
                  style="width: 100px"
                  type="number"
                  v-model="voteAmount"
                ></el-input
                ><span v-show="isVoteAmount">%</span>
              </template>
            </van-field>

            <div class="title-divider">
              <span>流转类型：</span>
            </div>
            <van-field name="radio">
              <template #input>
                <van-radio-group
                  v-model="signType"
                  icon-size="22"
                  direction="horizontal"
                >
                  <van-radio name="parallel">并行</van-radio>
                  <van-radio name="seq">串行</van-radio>
                </van-radio-group>
              </template>
            </van-field>

            <div class="title-divider">
              <span>流转结束后的动作：</span>
            </div>
            <van-field name="radio">
              <template #input>
                <van-radio-group
                  v-model="action"
                  icon-size="22"
                  direction="horizontal"
                >
                  <van-radio name="submit">提交</van-radio>
                  <van-radio name="back">返回</van-radio>
                </van-radio-group>
              </template>
            </van-field>
          </van-collapse-item>
        </van-collapse>
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
import {
  Notify,
  Form,
  Field,
  Radio,
  RadioGroup,
  Collapse,
  CollapseItem,
} from 'vant'
import OpinionText from '@/components/flow/task/OpinionText.vue'
import EipUserSelector from '@/components/eipControl/selector/EipUserSelector.vue'
import utils from '@/utils.js'

export default {
  name: 'taskToTrans',
  props: ['taskId'],
  components: {
    [Form.name]: Form,
    [Field.name]: Field,
    [Radio.name]: Radio,
    [RadioGroup.name]: RadioGroup,
    [Collapse.name]: Collapse,
    [CollapseItem.name]: CollapseItem,
    OpinionText,
    EipUserSelector,
  },
  data() {
    return {
      activeNames: [],
      transDialog: false,
      opinion: '',
      style: '',
      users: '',
      userIds: '',
      radioVote: '1', //任务通过规则
      decideType: 'agree', //计票策略
      voteType: 'percent', //投票类型
      voteAmount: '100', //票数
      signType: 'parallel', //流转类型
      action: 'submit', //流转结束后的动作
      isHight: false,
      isVoteAmount: false,
      token: utils.getUrlKey('token'),
      text: '', //意见内容
      boData: '', //boData数据
      opinionField: '', //要回填的字段
      appendStr: true,
      initBoAttr: '',
      appendOpinion: false, //是否覆盖审批意见
      //2022-06-14 ccwgq 移动端 意见反填相关增加字段
      formatOpinion: '', //每次被格式化处理的意见
      opinionSortOrder: 'desc', //意见按时间倒序
      wrap: '\n', //换行分割
    }
  },
  methods: {
    //选择投票类型
    voteTypeChange(value) {
      if (value == 'percent') {
        this.isVoteAmount = true
      } else {
        this.isVoteAmount = false
      }
    },
    //选择任务通过规则
    setVote(value) {
      this.voteType = 'amount'
      this.voteAmount = '1'
      if (value == '1') {
        this.isHight = false
      } else if (value == '2') {
        this.isHight = false
        this.decideType = 'refuse'
      } else if (value == '3') {
        this.isHight = false
        this.decideType = 'agree'
      } else if (value == '4') {
        this.isHight = true
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
    //鼠标点击页面其他其他位置不关闭弹框
    handleClose(opinionField, boData, appendOpinion) {
      this.opinionField = opinionField
      this.boData = boData
      this.appendOpinion = appendOpinion
      this.transDialog = true
      this.activeNames = []
    },
    //取消
    cancel() {
      this.transDialog = false
      this.getOpinion('')
    },
    //确认
    confirm() {
      if (this.users == '' || this.users == null) {
        Notify({
          type: 'warning',
          message: '请选择流转人员',
        })
        return
      } else if (this.$refs.opinionText.getOpinion() == '') {
        Notify({
          type: 'warning',
          message: '请填写流转意见',
        })
        return
      }
      //ccwgq 2022-06-14 只有存在意见反填字段才回填
      if (this.opinionField) {
        this.opinionBackToForm()
      }
      const loading = this.$loading({
        lock: true,
        text: '任务流转中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)',
      })
      let data = {
        taskId: this.taskId,
        opinion: this.$refs.opinionText.getOpinion(),
        userIds: this.userIds,
      }
      data.action = this.action
      data.decideType = this.decideType
      data.signType = this.signType
      data.voteAmount = this.voteAmount
      data.voteType = this.voteType
      let this_ = this
      utils.getOnlineFormData(false).then(
        (formDataStr) => {
          data.data = Base64.encode(formDataStr)
          this_.$store
            .dispatch('storeProcess/taskToTrans', data)
            .then(() => {
              loading.close()
              if (this_.token != null) {
                this_.transDialog = false
                window.close()
              } else {
                Notify({
                  type: 'success',
                  duration: 1000,
                  message: data.message,
                  onClose: function () {
                    this_.transDialog = false
                    this_.$router.push('/work/myMatters')
                  },
                })
              }
            })
            .catch(() => {
              loading.close()
            })
        },
        (reason) => {
          loading.close()
          if (reason == 1) {
            Notify({
              type: 'error',
              message: '未获取到表单信息.',
            })
          } else if (reason == 5) {
            Notify({
              type: 'error',
              message: '处理业务数据超时！',
            })
          }
        }
      )
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
  margin-bottom: 5px;
}

div>>>.el-dialog .el-dialog__body {
  padding: 0px;
  height: calc(100% - 115px);
}

>>>.van-collapse-item__content {
  padding: 0;
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