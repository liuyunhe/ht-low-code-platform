<template>
  <div class="bpm-btn-dialog">
    <el-dialog
      :visible.sync="dialogVisible"
      :title="dialogTitle"
      :close-on-click-modal="false"
      @opened="afterOpen"
    >
      <table cellspacing="0" cellpadding="0" border="0" class="form-table">
        <tbody>
          <tr>
            <th style="width: 120px">
              <span class="xh-star">*</span>审批意见：
            </th>
            <td colspan="3">
              <OpinionText
                :text="text"
                ref="opinionText"
                @getOpinion="getOpinion"
              />
            </td>
          </tr>
          <!-- 补充验证码 -->
          <tr v-show="ouSealable">
            <th style="width: 100px; text-align: left; padding-right: 5px">
              <span class="xh-star">*</span>用印验证码：
            </th>
            <td colspan="2">
              <el-input
                placeholder="请输入六位验证码"
                maxlength="6"
                oninput="value=value.replace(/[^\d]/g,'')"
                v-model="signatureCode"
              ></el-input>
            </td>
            <td>
              <el-button
                :disabled="signBtnDisabled"
                size="small"
                type="primary"
                @click="getSignCode"
                >{{ signBtnText }}</el-button
              >
            </td>
          </tr>
          <!-- 验证码结束 -->
          <tr v-if="action === 'agree' && signatureField && !secretFree">
            <th style="width: 100px">
              <span class="xh-star">*</span>签章密码：
            </th>
            <td colspan="3">
              <el-input v-model="signaturePassword" show-password></el-input>
            </td>
          </tr>
          <tr class="attach-upload">
            <th style="width: 120px">附件上传：</th>
            <td colspan="3">
              <FileUpload ref="fileUpload" />
            </td>
          </tr>
        </tbody>
      </table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirm" size="small"
          >确 定</el-button
        >
        <el-button @click="cancel" size="small">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import OpinionText from '@/components/common/opinionText.vue'
import FileUpload from '@/components/common/fileUpload.vue'
import flow from '@/api/flow.js'
import file from '@/api/ou/fileServer.js'
import {Base64} from 'js-base64'
export default {
  name: 'taskToComplete',
  props: [
    'getFormKey',
    /* ccwgq 增加一个属性控制 附件上传的显示 start */
    'allowUpload',
    /*  end */
    'taskId',
    'leaderId',
    'opinion',
    'action',
    'instId',
    'signatureField', //自动签章字段
    'signatureCover', //自动签章是否覆盖
    'secretFree' //自动签章时是否免密
  ],
  components: {
    OpinionText,
    FileUpload
  },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      text: '',
      boData: {},
      opinionField: '',
      appendOpinion: false,
      data: {},
      appendStr: true,
      wrap: '\n',
      initBoAttr: '',
      signaturePassword: '',
      isSignatureCallBack: false,
      signatureLoading: null,
      //  用印签章补充
      signatureCode: '',
      signBtnDisabled: false,
      signBtnTimer: null,
      signBtnLeft: 60,
      signBtnText: '获取',
      formatOpinion: '',
      opinionSortOrder: 'desc', //TODO:增加一个字段用来控制审批意见倒叙还是正序排序
      //ccwgq 加入 isLocked 锁定修改
      isLocked: false,
      //实体名称
      boDateKey: '',
      //签字意见属性
      signature_opinion: 'signature_opinion'
    }
  },
  // computed改为  普通模式
  computed: {
    signatureStatus() {
      return this.$store.state.storeProcess.signatureConfig.status
    },
    //是否启用电子签章
    ouSealable() {
      const foData = this.boData['ht']
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
    }
  },
  // computed: mapState({
  //   signatureStatus: (state) => state.storeProcess.signatureConfig.status,
  // }),
  watch: {
    signatureStatus: function(newVal, oldVal) {
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
    dialogVisible: function(newVal) {
      if (newVal) {
        //每次打开对话框都重新执行   2022-06-02 废弃
        // this.legalForceOpinion()
      }
    }
  },
  methods: {
    //TODO:正序倒序的控制由打开函数传入
    showDialog(opinionField, boData, appendOpinion, completeData) {
      this.dialogVisible = true
      if (this.action == 'agree' || this.action == 'agreeTrans') {
        this.dialogTitle = '审批同意'
      } else if (this.action == 'oppose' || this.action == 'opposeTrans') {
        this.dialogTitle = '审批反对'
      }

      // console.log('opinionField ===>', opinionField)
      // console.log('boData ===>', boData)
      // console.log('appendOpinion ===>', appendOpinion)
      // console.log('completeData ===>', completeData)
      this.data = completeData
      this.opinionField = opinionField
      this.boData = boData
      this.appendOpinion = appendOpinion
      this.boDateKey = this.getFile(opinionField)
    },
    //yigz 2022-09-30：获取实体名称
    getFile(opinionField) {
      if (opinionField != '' && opinionField.indexOf('.') != -1) {
        let filed = opinionField.split('.')
        let boFiled = filed[0]
        return boFiled
      } else {
        return ''
      }
    },
    afterOpen() {
      /* -----ccwgq 2021-1104 加入这一句 ------*/
      this.signatureCode = ''
      /* ----- 加入这一句 ------*/
      if (this.opinionField) {
        let con = document.querySelector(
          "[model-name='data." + this.opinionField + "']"
        )
        if (con && con.__vue__ && con.__vue__.isEditor) {
          this.wrap = '<br>'
        }
      }
      let param = {instId: this.instId, taskId: this.taskId}
      flow.getBpmSaveOpinionByTeam(param).then(resp => {
        if (resp.state && resp.value) {
          this.getOpinion(resp.value)
        } else {
          if (this.action == 'agree' || this.action == 'agreeTrans') {
            // ccwgq 2022-05-27 使用锁定解决系统的自动修改对护框的值导致我们的值再次被覆盖
            // if (this.isLocked) {
            //   this.isLocked = false
            // } else {
            // this.getOpinion('同意')
            // yigz 2022-09-30:获取签字意见中的富文本内容
            let boDateKey = this.boDateKey
            let signature_opinion_key = this.signature_opinion
            let origial_opioion = '同意'
            if (boDateKey != '') {
              if (this.boData[boDateKey][signature_opinion_key] != undefined) {
                origial_opioion = this.boData[boDateKey][signature_opinion_key]
              }
            }
            this.getOpinion(origial_opioion)
            // }
          } else if (this.action == 'oppose' || this.action == 'opposeTrans') {
            // if (this.isLocked) {
            //   this.isLocked = false
            // } else {
            // this.getOpinion('反对')
            // yigz 2022-09-30:获取签字意见中的富文本内容
            let boDateKey = this.boDateKey
            let signature_opinion_key = this.signature_opinion
            let origial_opioion = '反对'
            if (boDateKey != '') {
              if (this.boData[boDateKey][signature_opinion_key] != undefined) {
                origial_opioion = this.boData[boDateKey][signature_opinion_key]
              }
            }
            this.getOpinion(origial_opioion)
            // }
          }
          let opinionText = this.$refs.opinionText
          console.log(opinionText)
        }
      })
    },
    //获取意见
    getOpinion(opinion) {
      this.text = opinion
      let opinioValue = this.$refs.opinionText.getOpinion()
      //获取审批意见，审批人，审批时间
      if (this.opinionField) {
        let currentUser = this.$store.state.user.currentUserDetail.user
        let moment = require('moment')
        this.formatOpinion =
          opinioValue +
          this.wrap +
          currentUser.fullname +
          ' ' +
          moment().format('YYYY-MM-DD HH:mm:ss')
        //ccwgq 2022-05-30 回填的时机在确定按钮按下之后
        // let boData = this.boData
        // let filed = this.opinionField.split('.')
        // if (boData[filed[0]][filed[1]] == '<p><br/></p>') {
        //   boData[filed[0]][filed[1]] = ''
        // }
        //是否覆盖审批意见
        // if (this.appendOpinion) {
        //   if (opinioValue) {
        //     boData[filed[0]][filed[1]] =
        //       opinioValue +
        //       this.wrap +
        //       currentUser.fullname +
        //       ' ' +
        //       moment().format('YYYY-MM-DD HH:mm:ss')
        //   }
        // } else {
        //   if (opinioValue) {
        //     opinioValue +=
        //       this.wrap +
        //       currentUser.fullname +
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
        //           this.initBoAttr + this.wrap + this.wrap + opinioValue
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
    cancel() {
      this.dialogVisible = false
      this.getOpinion('')
    },
    //ccwgq 电子签章 验证码限定为数字 六位
    limitSignCode() {
      this.signatureCode = this.signatureCode.replace(/[^\.\d]/g, '')
      this.signatureCode = this.signatureCode.replace('.', '')
    },
    /**ccwgq 法务流程强制使用签字意见回填审批意见! start    2022-06-02 废弃*/
    legalForceOpinion() {
      const newVal = this.boData
      const dealKey = 'signature_opinion'
      //判断值是否是一个对象
      if (newVal?.__proto__?.constructor?.name == 'Object') {
        /**目前涉及七个流程:
         *日常咨询审批
         *风险事项审批
         *诉讼审批
         *非诉审批
         *提前介入
         *外聘律师聘用审批
         *合同预审审批
         */
        const formKeys = [
          'xmtqjrsp',
          'rczxsp',
          'fxsxsp',
          'sssp',
          'fssp',
          'wplspysp',
          'htyssp'
        ]
        const curKey = this.getFormKey()
        if (formKeys.includes(curKey)) {
          const foData = newVal[curKey]
          // console.log(newVal,foData);
          //获取到建模的值
          let text = foData.hasOwnProperty(dealKey) ? foData[dealKey] : ''
          text = $(text).text() //使用Jquery解决富文本的样式干扰，只要文字
          if (!!text) {
            //非空就给值!!
            this.isLocked = true
            this.$nextTick(() => {
              // this.getOpinion(text)
            })
          }
        }
      }
    },
    /**end */
    async confirm() {
      // ccwgq 2021-11-2 用印签章  与电子签名是并行的关系
      if (this.action == 'agree' && this.ouSealable) {
        const loadingInstance = this.$loading({
          text: '签章中'
        })
        const foData = this.boData['ht']
        const _this = this
        const ourId = foData['our_id']
        const cfcStaId = foData['cfc_sta_id']
        const contId = foData['id_']
        if (this.signatureCode === '') {
          loadingInstance.close()
          this.$message.error('请先输入验证码')
          return
        }
        // if (!/^[/d]{6}$/.test(this.signatureCode)) {
        //   this.$message.error("验证码格式错误");
        //   return;
        // }
        let url, res
        // 查到安心签上面的印章id后请求插入新表数据
        let postData = {
          checkCode: _this.signatureCode,
          businessType: 'contApply',
          businessId: foData['id_'],
          sealId: cfcStaId,
          orgId: ourId,
          sealColor: 1,
          crossPageStyle: 1 //骑缝章在左 2是右
        }
        url = `${window.context.sign}/sign/sign-param/v1/insertSignParam`
        res = await _this.$http.post(url, postData)
        if (res.data && !res.data.state) {
          console.log('插入数据失败')
          return
        }
        // 之后再去调用签章的接口
        const keyword = foData['sign_key_word']
        const orgId = '0'
        // console.log("keyword===>", keyword);
        // console.log("orgId===>", orgId);
        url = `${window.context.bpmRunTime}/eipx7/opun/runtime/sign/v1/v1/100001?businessType=1&id=${foData.id_}&keyword=${keyword}`
        res = await _this.$http.post(url)
        if (res.data && !res.data.state) {
          loadingInstance.close()
          //  签章接口失败
          return
        }
        _this.$message.success('签章成功!')
        loadingInstance.close()
        //todo:预览pdf
        //新窗口预览PDF
        const fileId = res.data.value
        file.getPdfPathById(fileId, data => {
          // console.log("resp===>", resp, resp.data);
          const pdfURL = window.context.portal + data.pdfUrl
          setTimeout(() => {
            window.open(pdfURL)
          }, 10)
        })
        this.doConfirm()
      } else if (
        this.action == 'agree' &&
        this.signatureField &&
        this.signatureCover
      ) {
        let _this = this
        this.isSignatureCallBack = false
        this.$store.dispatch('storeProcess/initSignature', {}).then(rep => {}) //点同意按钮先初始化状态
        this.$store
          .dispatch('storeProcess/doSignature', {
            status: 'start',
            field: this.signatureField,
            isCover: this.signatureCover,
            secretFree: this.secretFree,
            password: this.signaturePassword
          })
          .then(rep => {
            _this.signatureLoading = this.$loading({
              lock: true,
              text: '正在进行签章处理...',
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.7)'
            })
            // 设置5秒超时机制，如果超时则弹出提示
            setTimeout(function() {
              _this.signatureLoading.close()
              if (_this.isSignatureCallBack == false) {
                _this.$message({
                  type: 'warning',
                  message: '签章处理超时，请联系管理员确定是否配置签章控件。'
                })
                return
              }
            }, 5000)
          })
      } else {
        this.doConfirm()
      }
    },
    doConfirm() {
      if (this.$refs.fileUpload.getFiles() != '') {
        this.data.files = JSON.stringify(this.$refs.fileUpload.getFiles())
      }
      if (this.$refs.opinionText.getOpinion()) {
        this.data.opinion = this.$refs.opinionText.getOpinion()
      } else {
        this.$message({type: 'warning', message: '请输入审批意见'})
        return
      }
      //ccwgq 2022-06-01 这时执行意见反填(有意见反填字段才填)
      if (this.opinionField) {
        this.opinionBackToForm()
      }
      this.data.data = Base64.encode(JSON.stringify(this.boData))
      this.$store.dispatch('storeProcess/complete', this.data).then(() => {
        //this.$parent.nextTask();
        //this.$emit('nextTask')
        //ninghua 20221027 任务完成后回到待办
        this.$router.push({path:"/v-flow/v-todo"})
        //this.$router.go(-1)
      })
    },
    //ccwgq 2021-10-22  发送用印的验证码
    async getSignCode() {
      this.signBtnDisabled = false
      const _this = this
      const foData = _this.boData.ht
      const ourId = foData['our_id']
      const cfcStaId = foData['cfc_sta_id']
      const contId = foData['id_']
      let url, res
      //生成项目编号
      url = `${window.context.sign}/sign/sign-business/v1/generateProjectCode`
      const sendData = {
        businessType: 'contApply',
        businessId: foData.id_
      }
      res = await window.app.$http.post(url, sendData)
      console.log(res)
      if (!res.data || !res.data.state) {
        _this.$message.error('发送验证码失败')
        return
      }
      //查询验证码
      url = `${window.context.sign}/sign/sign-business/v1/queryProjectCode?businessType=contApply&businessId=${sendData.businessId}`
      res = await _this.$http.get(url)
      if (!res.data || !res.data.state) {
        _this.$message.error('发送验证码失败')
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
        code: ourId
      }
      res = await _this.$http.post(url, data)
      if (!res.data || !res.data.state) {
        _this.$message.error('发送验证码失败')
        return
      }
      _this.$message.success('验证码发送成功')
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
    }
  },
  created() {
    /**ccwgq 2022-05-27  */
  },
  mounted() {}
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/change-font.scss';
.attach-upload {
  display: none !important;
}
</style>