<template>
  <div>
    <NavBar>
      <template slot="title"
        >新建流程</template
      >
      <template slot="right">
        <ou-print
          :defId="defId"
          :instId="proInstId"
          type="start"
          v-if="usePrintView"
          @handleRemove="removeOuPrint"
        ></ou-print>
      </template>
    </NavBar>
    <div style="padding-bottom: 40px; background-color: #fff">
      <FormContent
        ref="formContent"
        :defId="defId"
        :instId="proInstId"
        type="start"
      />
    </div>
    <div class="footer">
      <van-grid clickable :column-num="2">
        <van-grid-item
          v-if="isShowStartBtn"
          icon="passed"
          @click="start"
          text="启动"
        />
        <van-grid-item icon="coupon-o" @click="saveDraft" text="保存" />
      </van-grid>
      <!-- 选择路径跳转 -->
      <TaskSelectDestination
        ref="taskSelectDestination"
        taskId
        :defId="defId"
        :instId="instId"
        :leaderId="leaderId"
      />
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/navBar/NavBar.vue'
import {mapState, mapActions} from 'vuex'
import FormContent from '@/components/flow/FormContent.vue'
import TaskSelectDestination from '@/components/flow/task/TaskSelectDestination.vue'
import OuPrint from '@/components/eipControl/ou/OuPrint.vue'
import utils from '@/utils.js'
import {Base64} from 'js-base64'
import req from '@/request.js'
import {debuglog} from 'util'
import {Notify} from 'vant'
import process from '@/api/process.js'
export default {
  name: 'start',
  components: {
    NavBar,
    FormContent,
    Notify,
    TaskSelectDestination,
    OuPrint
  },
  props: ['defId', 'instId', 'leaderId'],
  data() {
    return {
      disabled: false,
      nodeDef: {},
      flowId: '',
      proInstId: '',
      btnAlias: '',
      isShowStartBtn: true,
      //ccwgq-->使用ouprint
      usePrintView: true
    }
  },
  computed: mapState({
    curOrgPost: state => state.user.postCharge,
    currentUserId: state => state.login.currentUser.userId,
    state: state => state
  }),
  mounted() {
    let _this = this
    //如果该字段的校验受另一个字段影响。则监听另一个字段控件发布的值改变事件
    this.$root.$on('startFlowBtnChange', function(value) {
      _this.isShowStartBtn = value
    })
    this.checkStartRight()
  },
  methods: {
    //执行前置脚本
    runBeforeScript() {
      let _this = this
      let item = utils.indexOfList(
        _this.$refs.formContent.buttons,
        'alias',
        _this.btnAlias
      )
      return _this.tempScript(item.beforeScript)
    },
    //执行前置脚本
    tempScript(script) {
      let _this = this.$refs.formContent
      let _req = req
      let boData = this.$refs.formContent.data
      let tempScript =
        'var tempFunction = function(_req,data,_this){ ' + script + '};'
      let result = eval(tempScript + 'tempFunction(_req,boData,_this);')
      if (result && result.then && typeof result.then == 'function') {
        return result
      }
      if (result === false) return false
      return true
    },
    // 准备数据
    handleData(formDataStr) {
      let _this = this
      let scriptResult = this.runBeforeScript()
      if (scriptResult === false) return
      if (scriptResult.then && typeof scriptResult.then == 'function') {
        scriptResult.then(
          () => {
            //接口返回成功则正常执行按钮操作
            return _this.startNext(formDataStr)
          },
          fail => {
            //接口返回失败则终止按钮操作，并给与提示
            Notify({type: 'warning', message: fail})
            return
          }
        )
      } else {
        //执行前置脚本返回true时正常执行按钮操作
        return _this.startNext(formDataStr)
      }
    },
    startNext(formDataStr) {
      let data = {defId: this.defId}
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
      if (this.instId) {
        data.proInstId = this.instId
      }
      data.supportMobile = 1
      if (this.curOrgPost && this.curOrgPost.org) {
        data.startOrgId = this.curOrgPost.org.id
      }
      if (window.urgentStateValue) {
        data.urgentStateValue = window.urgentStateValue
      }
      if (this.leaderId && this.leaderId != 0) {
        data.agentLeaderId = this.leaderId
      }
      return data
    },
    //启动
    start() {
      this.btnAlias = 'startFlow'
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
            Notify({type: 'warning', message: '子表必填一条记录'})
            return
          }
        }
      }
      utils
        .getOnlineFormData(true)
        .then(formDataStr => {
          if (
            !this.nodeDef.localProperties.jumpType &&
            !this.nodeDef.localProperties.choiceExcutor
          ) {
            this.processStart(formDataStr)
          } else {
            this.$store
              .dispatch('storeProcess/getAfterJumpNodes', {
                taskId: '',
                data: Base64.encode(formDataStr),
                defId: this.defId || '',
                instId: this.instId || ''
              })
              .then(data => {
                if (
                  data.afterNodes.length == 0 ||
                  (data.afterNodes.length == 1 &&
                    data.afterNodes[0].excutorList != undefined &&
                    data.afterNodes[0].excutorList.length == 1)
                ) {
                  this.processStart(formDataStr)
                } else {
                  let formData = {}
                  if (formDataStr.businessKey) {
                    formData = formDataStr
                    formData.data = ''
                  } else {
                    formData.data = Base64.encode(formDataStr)
                  }
                  this.$refs.taskSelectDestination.showDailog(formData, '', '') //父组件调用子组件方法
                }
              })
          }
        })
        .catch(reason => {
          utils
            .handleGetFormDataReject(reason, true)
            .then(() => this.processStart())
        })
    },
    //流程发起
    processStart(formDataStr) {
      const loading = this.$loading({
        lock: true,
        text: '流程启动中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      let data = this.handleData(formDataStr)
      if (data) {
        this.disabled = true
        this.$store
          .dispatch('storeProcess/start', data)
          .then(() => {
            loading.close()
            if (JSON.stringify(this.$route.query) == '{}') {
              this.$router.go(-1)
            } else {
              this.$router.push('/work')
            }
          })
          .catch(() => {
            loading.close()
            this.disabled = false
          })
      } else {
        loading.close()
      }
    },
    //保存
    saveDraft() {
      this.btnAlias = 'saveDraft'
      const loading = this.$loading({
        lock: true,
        text: '流程保存中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      utils.getOnlineFormData(false).then(
        formDataStr => {
          let data = this.handleData(formDataStr)
          if (data) {
            this.$store
              .dispatch('storeProcess/saveDraft', data)
              .then(() => {
                loading.close()
                if (JSON.stringify(this.$route.query) == '{}') {
                  this.$router.go(-1)
                } else {
                  this.$router.push('/work')
                }
              })
              .catch(() => {
                loading.close()
              })
          } else {
            loading.close()
          }
        },
        reason => {
          loading.close()
          if (reason == 1) {
            Notify({type: 'warning', message: '未获取到表单信息'})
          } else if (reason == 5) {
            Notify({type: 'warning', message: '处理业务数据超时'})
          }
        }
      )
    },
    //返回
    back() {
      if (JSON.stringify(this.$route.query) == '{}') {
        this.$router.go(-1)
      } else {
        this.$router.push('/work')
      }
    },
    //检查是否有启动权限
    checkStartRight() {
      process
        .checkStartRight(this.currentUserId, this.defId, this.leaderId)
        .then(resp => {
          if (!resp.data || !resp.data.state || !resp.data.value) {
            this.$dialog
              .alert({
                title: '无权限',
                message: '您没有该流程的启动权限'
              })
              .then(() => {
                this.$router.go(-1)
              })
          }
        })
    },
    //ccwgq-->触发ouprint的移除
    removeOuPrint(e) {
      this.usePrintView = false
    }
  },
  created() {
    this.proInstId = this.instId || ''
    //取发起节点的属性用于判断是否可以选择路径跳转
    this.$store
      .dispatch('storeProcess/getCurNodeProperties', {
        defId: this.defId || '',
        instId: this.instId || '',
        taskId: ''
      })
      .then(NodeDef => {
        this.nodeDef = NodeDef
      })
  }
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
  background-color: #f5f5f5;
}

.footer {
  height: 45px;
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 999;
}
</style>
