<template>
  <ht-sidebar-dialog
    :visible="delegateDialog"
    title="转办设置"
    :close-on-click-modal="false"
    append-to-body
    :before-close="cancel"
    class="dialog-body"
    width="100%"
  >
    <div :style="this.style">
      <van-form v-form @submit="confirm">
        <div class="title-divider">
          <span>转办人员：</span>
        </div>

        <div class="opinion-text">
          <EipUserSelector
            v-model="users"
            :config="{id: 'userIds', fullname: 'users'}"
            :append-to-body="true"
            single
          />
        </div>

        <div class="title-divider">
          <span>转办说明：</span>
        </div>
        <div class="opinion-text">
          <OpinionText
            :text="text"
            ref="opinionText"
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
import {Notify, Form} from 'vant'
import OpinionText from '@/components/flow/task/OpinionText.vue'
import EipUserSelector from '@/components/eipControl/selector/EipUserSelector.vue'
import utils from '@/utils.js'

export default {
  name: 'taskToDelegate',
  props: ['taskId'],
  components: {
    [Form.name]: Form,
    OpinionText,
    EipUserSelector,
  },
  data() {
    return {
      delegateDialog: false,
      users: '',
      userIds: '',
      style: '',
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
      this.delegateDialog = true
    },
    //取消
    cancel() {
      this.delegateDialog = false
      this.getOpinion('')
    },
    //确认
    confirm() {
      if (this.users == '' || this.users == null) {
        Notify({
          type: 'warning',
          message: '请选择转办人员',
        })
        return
      } else if (this.$refs.opinionText.getOpinion() == '') {
        Notify({
          type: 'warning',
          message: '请填写转办说明',
        })
        return
      }
      //ccwgq 2022-06-14 只有存在意见反填字段才回填
      if (this.opinionField) {
        this.opinionBackToForm()
      }
      let files = ''
      let data = {
        taskId: this.taskId,
        messageType: 'inner',
        opinion: this.$refs.opinionText.getOpinion(),
        files: files,
        userId: this.userIds,
        formData: JSON.stringify(this.$parent.$parent.$refs.formContent.data),
      }
      const loading = this.$loading({
        lock: true,
        text: '任务转办中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)',
      })
      this.$store
        .dispatch('storeProcess/delegate', data)
        .then(() => {
          loading.close()
          if (this.token != null) {
            this.$router.push('/work/myMatters')
          } else {
            Notify({
              type: 'success',
              message: data.message,
            })
            this.$router.push('/work/myMatters')
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
  margin-bottom: 8px;
}

div>>>.el-dialog .el-dialog__body {
  padding: 0px;
  height: calc(100% - 115px);
}

.van-field {
  padding: 10px 26px;
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
</style>