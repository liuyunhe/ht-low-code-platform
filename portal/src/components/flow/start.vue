<template>
  <div>
    <el-container>
      <el-header height="48px">
        <el-row>
          <el-col :span="24" class="top-subject-col">
            <h3>{{ defName }}</h3>
            <!--lyzcw: 2022-08-02 预览流程说明帮助文件-->
            <div
              style="float: right; margin-right: 20px"
              v-if="
                this.$refs.formContent != undefined
                  ? this.$refs.formContent.formHelpFile &&
                    this.$refs.formContent.formHelpFile.length > 0
                  : false
              "
            >
              <el-button
                type="text"
                icon="icon-question"
                @click="this.$refs.formContent.previewHelpFile"
                >流程说明</el-button
              >
            </div>

            <div
              v-if="['ht', 'htN', 'htsp', 'htbgN'].includes(formKey)"
              style="float: right; margin-right: 20px"
            >
              <ai-data
                :getFormData="getFormData.bind(this)"
                :getFormKey="getFormKey.bind(this)"
              ></ai-data>
            </div>
            <!--智能辅助-->

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
              <opp-exam
                ref="oppExam"
                :getFormKey="getFormKey"
                :getFormData="getFormData"
              ></opp-exam>
            </div>

            <div
              v-if="['ht', 'htN', 'htsp', 'htbgN', 'fb'].includes(formKey)"
              style="float: right; margin-right: 20px"
            >
              <el-tooltip placement="top" effect="light">
                <div slot="content">预览套打文件</div>
                <ou-print
                  ref="ouPrint"
                  :getFormKey="getFormKey"
                  :getFormData="getFormData"
                ></ou-print>
              </el-tooltip>
            </div>

            <!-- lyzcw: 2022-06-24 部分表单可查看流程图 -->
            <div style="float: right; margin-right: 20px">
              <el-tooltip placement="right" effect="light">
                <div slot="content">查看审批流程</div>
                <el-button @click="taskImage()" icon="icon-flow1" size="mini"
                  >流程图</el-button
                >
              </el-tooltip>

              <TaskImage
                ref="taskImage"
                :bpmnInstId="null"
                :instId="instId"
                :defId="defId"
              />
            </div>
          </el-col>
        </el-row>
      </el-header>
      <el-main>
        <el-card class="start-card">
          <FormContent
            ref="formContent"
            :formLoading.sync="disabled"
            :defId="defId"
            :instId="localInstId"
            type="start"
            :copyInstId="copyInstId"
            v-show="show"
          />
        </el-card>
      </el-main>
      <div
        class="start-btn-group"
        style="wdith: 100%; text-align: center; padding-top: 20px"
      >
        <!-- ccwgq 2022-06-07  启动按钮文字改为提交 -->
        <el-button v-if="isShowStartBtn" type="primary" @click="start"
          >提交</el-button
        >
        <el-button type="defult" @click="saveDraft">保存</el-button>
        <el-button type="defult" @click="back">关闭</el-button>
      </div>

      <!-- 选择路径跳转 -->
      <TaskSelectDestination
        ref="taskSelectDestination"
        taskId
        :defId="defId"
        :instId="localInstId"
        :leaderId="leaderId"
      />
    </el-container>
    <el-dialog
      title="选择任务节点"
      :visible.sync="dialogVisible"
      width="50%"
      append-to-body
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="toMyTodo"
    >
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="任务id" width="180"></el-table-column>
        <el-table-column
          prop="subject"
          label="任务名称"
          width="180"
        ></el-table-column>
        <el-table-column prop="name" label="节点" width="180"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button @click="handleTask(scope.row)" type="text" size="small"
              >处理</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import req from '@/request.js'
import {mapState} from 'vuex'
import FormContent from '@/components/flow/formContent.vue'
import TaskSelectDestination from '@/components/flow/task/taskSelectDestination.vue'
import utils from '@/utils.js'
import {Base64} from 'js-base64'
import OuPrint from '@/components/eipControl/ou/OuPrint.vue'
import AiExam from '@/components/eipControl/ou/AiExam.vue'
import OppExam from '@/components/eipControl/ou/OppExam.vue'
import AiData from '@/components/eipControl/ou/AiData.vue'
import TaskImage from '@/components/flow/task/taskImage.vue'
export default {
  name: 'start',
  components: {
    FormContent,
    TaskSelectDestination,
    OuPrint,
    AiExam,
    OppExam,
    AiData,
    TaskImage,
  },
  props: ['defId', 'instId', 'leaderId', 'copyInstId'],
  data() {
    return {
      tableData: [],
      dialogVisible: false,
      disabled: true,
      nodeDef: {},
      flowId: '',
      isShowStartBtn: true,
      isMyRequest: false,
      defName: '',
      initFillData: false,
      reloadForm: false,
      btnAlias: '',
      data: null,
      show: false,
      localInstId: this.instId,
      formKey: '',
    }
  },
  computed: mapState({
    curOrgPost: (state) => state.user.postCharge,
  }),
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      //判断用户是否具有流程启动权限
      const userId = vm.$store.state.login.currentUser.userId,
        instId = to.params.instId,
        defId = to.params.defId,
        leadId = to.params.leaderId

      let url = `${window.context.bpmModel}/flow/defAuthorize/v1/startRight?userId=${userId}&defId=${defId}&leadId=${leadId}`
      // 发起的是流程草稿时
      if (instId) {
        url = `${url}&instId=${instId}`
      }

      req.get(url).then((resp) => {
        if (!resp.data || !resp.data.state || !resp.data.value) {
          vm.$alert('您没有该流程的启动权限', '无权限', {
            confirmButtonText: '返回主页',
            callback: (action) => {
              vm.$router.push('/home')
            },
          })
        } else {
          vm.show = true
        }
      })
    })
  },
  mounted() {
    let _this = this
    //如果该字段的校验受另一个字段影响。则监听另一个字段控件发布的值改变事件
    this.$root.$on('startFlowBtnChange', function (value) {
      _this.isShowStartBtn = value
    })
    //监听表单加载完成发布事件
    this.$root.$on('formLoading', function (value) {
      _this.disabled = value
      if (_this.$refs.formContent) {
        // 赋值formKey
        _this.formKey = _this.getFormKey()
      }
    })
  },
  methods: {
    //lyzcw: 流程图 2022-06-24
    async taskImage() {
      // lyzcw：某些表单打开时，获取表单字段，2021-07-29
      var this_ = this //ccwgq   修复缺失this_导致的报错
      if (this_.defId == '' || this_.defId == undefined) {
        this.$message.warning('没有审批流程信息')
        //     return false;
      } else {
        this.$refs.taskImage.handleOpen() //父组件调用子组件方法
      }
    },
    //2021-09-14 ccwgq 判断是否使用智能回填功能
    useAiData(formKey) {
      //todo:打包合同暂时不考虑
      let ableFormKeys = [
        'ht',
        'lytz_zs',
        'lyjh',
        'jrtzlyjh',
        'lytz',
        'fbxmthgltz',
        'lxtz_hh',
        'lytz_wtgl',
        'lytz_tg',
        'lytz_gqzy',
        'lytz_gqtz',
        'lytz_dd',
      ]
      return ableFormKeys.includes(formKey)
    },
    getFormData() {
      let _this = this
      let boData = _this.$refs.formContent.data
      return boData
    },
    getFormKey() {
      let _this = this
      let formKey = _this.$refs.formContent.formKey
      return formKey
    },
    hiddenOpertion() {
      let _this = this
      _this.$refs.formContent.hiddenContent()
    },
    //处理任务
    handleTask(row) {
      this.$router.push('/task/' + row.id + '/0')
    },
    // 准备数据
    handleData(formDataStr) {
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
      data.supportMobile = 0
      if (this.instId) {
        data.proInstId = this.instId
      }
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
            this.$message({message: '子表必填一条记录', type: 'warning'})
            return
          }
        }
      }
      utils
        .getOnlineFormData(true)
        .then((formDataStr) => {
          //执行按钮前置脚本
          if (
            typeof formDataStr === 'object' &&
            (formDataStr.hasOwnProperty('businessKey') ||
              formDataStr.hasOwnProperty('sysCode'))
          ) {
            this.data = formDataStr
          } else {
            this.data = JSON.parse(formDataStr)
          }
          let scriptResult = this.runBeforeScript()

          if (scriptResult === false) return
          if (scriptResult.then && typeof scriptResult.then == 'function') {
            scriptResult.then(
              () => {
                //接口返回成功则正常执行按钮操作
                _this.startNext()
              },
              (fail) => {
                //接口返回失败则终止按钮操作，并给与提示
                _this.$message.warning(fail)
                return
              }
            )
          } else {
            //执行前置脚本返回true时正常执行按钮操作
            _this.startNext()
          }
        })
        .catch((reason) =>
          utils
            .handleGetFormDataReject(reason, true)
            .then(() => this.processStart())
        )
    },
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
    startNext() {
      utils.getOnlineFormData(false).then((formDataStr) => {
        utils.closeAllNotification()
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
              instId: this.instId || '',
            })
            .then((data) => {
              if (
                data.afterNodes.length == 0 ||
                (data.afterNodes.length == 1 &&
                  data.afterNodes[0].excutorList != undefined &&
                  data.afterNodes[0].excutorList.length == 1)
              ) {
                this.processStart(formDataStr)
              } else {
                let formData = {}
                if (formDataStr.constructor == Object) {
                  formData = formDataStr
                  formData.data = ''
                } else if (formDataStr.constructor == String) {
                  formData.data = Base64.encode(formDataStr)
                }
                this.$refs.taskSelectDestination.showDialog(formData, '', '') //父组件调用子组件方法
              }
            })
        }
      })
    },
    //流程发起
    processStart(formDataStr) {
      let formKey = this.$refs.formContent.formKey
      let data = this.handleData(formDataStr)
      if (sessionStorage.getItem('formImportTempJson')) {
        data.updateSubTableJson = sessionStorage.getItem('formImportTempJson')
      }
      this.disabled = true
      this.$store
        .dispatch('storeProcess/start', data)
        .then((row) => {
          if (row.curBoPkVal) {
            sessionStorage.setItem('formImportTempRefId', row.curBoPkVal)
          }
          sessionStorage.removeItem('formImportTempJson')
          /*ccwgq 2022-0607 流程启动后回到新建流程页面 start */
          this.$router.push('/v-flow/v-flowList')
          /*  end  */
          /*   注释的内容   
          if (row.tasks && row.tasks.length > 0) {
            if (row.tasks.length == 1) {
              this.$router.push("/task/" + row.tasks[0].id + "/0");
            } else {
              //弹出窗口让用户自己选择去哪个待办
              this.tableData = row.tasks;
              this.dialogVisible = true;
            }
          } else {
            if (row.inst.status != "end") {
              this.$router.push("/inst/" + row.instId + "/request");
            } else {
              this.$router.push("/instRead/" + row.instId + "/myRequest");
            }
          }*/
          // this.$store
          //   .dispatch("storeProcess/getInstanceByInstId", row.instId)
          //   .then((insts) => {

          //     if (insts.status != "end") {
          //       this.$router.push("/inst/" + row.instId + "/request");
          //     } else {
          //       this.$router.push("/instRead/" + row.instId + "/myRequest");
          //     }
          //   });
        })
        .catch(() => {
          //启动失败了！！！！
        })
        .finally(() => {
          this.disabled = false
        })
    },
    //保存
    saveDraft() {
      this.btnAlias = 'saveDraft'
      let scriptResult = this.runBeforeScript()
      let formKey = this.$refs.formContent.formKey
      this.disabled = true
      const this_ = this
      utils
        .getOnlineFormData(false)
        .then((formDataStr) => {
          utils.closeAllNotification()
          let data = this_.handleData(formDataStr)
          data.formKey = formKey
          if (sessionStorage.getItem('formImportTempJson')) {
            data.updateSubTableJson =
              sessionStorage.getItem('formImportTempJson')
          }
          this_.$store
            .dispatch('storeProcess/saveDraft', data)
            .then((row) => {
              if (row.curBoPkVal) {
                sessionStorage.setItem('formImportTempRefId', row.curBoPkVal)
              }
              sessionStorage.removeItem('formImportTempJson')
              this_.isMyRequest = true
              this_.localInstId = row.instId
              this_.$router.replace('/start/' + this_.defId + '/' + row.instId)
            })
            .finally(() => {
              //保存完成后,需要重新加载bo数据,不然第二次保存的时候会因为版本号不同而导致保存失败
              this.$refs.formContent.init(true)
            })
        })
        .catch((reason) => {
          this.disabled = false
          utils.handleGetFormDataReject(reason)
        })
    },
    //预览保存
    saveDraft_print(file) {
      let formKey = this.$refs.formContent.formKey
      const this_ = this
      utils
        .getOnlineFormData(false)
        .then((formDataStr) => {
          utils.closeAllNotification()
          let data = this_.handleData(formDataStr)
          data.formKey = formKey
          if (sessionStorage.getItem('formImportTempJson')) {
            data.updateSubTableJson =
              sessionStorage.getItem('formImportTempJson')
          }

          this_.$store
            .dispatch('storeProcess/saveDraft_print', data)
            .then((row) => {
              if (row.curBoPkVal) {
                sessionStorage.setItem('formImportTempRefId', row.curBoPkVal)
              }
              sessionStorage.removeItem('formImportTempJson')
              /* 流程实例Id */
              var instId = row.instId
              /* 调用子组件生成pdf */
              /* this_.$refs.ouPrintPreview.getPdf(instId,file); */
              document
                .getElementById('print_preview')
                .__vue__.getPdf(instId, file)
            })
            .catch((r) => {})
        })
        .catch((reason) =>
          utils.handleGetFormDataReject(reason).then(() => this.processStart())
        )
    },
    //返回
    back() {
      // wude 2022-11-30 菜单跳转时,校验是否有未提交的表单进行提示
      var formUpdataFlag = sessionStorage.getItem('formUpdataFlag')
      // if (formUpdataFlag == 'true') {
        // this.$confirm(
        //   '表单发生过变更,离开将导致录入数据丢失',
        //   '确定要离开当前页面吗?',
        //   {
        //     confirmButtonText: '确定',
        //     cancelButtonText: '取消',
        //     type: 'warning',
        //   }
        // )
        //   .then(() => {
        //     sessionStorage.setItem('formUpdataFlag', 'false')
        //     utils.closeAllNotification()
        //     this.$router.go(-1)
        //   })
        //   .catch(() => {})
      // } else {
        utils.closeAllNotification()
        this.$router.go(-1)
      // }
      //utils.closeAllNotification()
      /*
      //ccwgq 2022-09-23 判断是否从首页的栏目设计进入，返回需要复原的
      if ((this.$route.query?.from ?? '') === 'home') {
        this.$store.dispatch('menu/setColumnInfo', {
          restore: true,
        })
      }
      this.$router.go(-1)

      */
      //this.$router.push('/v-flow/v-todo')
      /* if (this.instId) {
        this.$router.push("/v-flow/v-request");
      } else {
        if (JSON.stringify(this.$route.query) == "{}") {
          this.$router.push("/v-flow/v-flowList");
        } else {
          this.$router.push("/home");
        }
      } */
    },
    toMyTodo() {
      this.$router.push('/v-flow/v-todo')
    },
    init() {
      let _me = this
      if (
        localStorage.selectMenuList &&
        localStorage.selectMenuList.length > 0
      ) {
        let selectMenuList = JSON.parse(localStorage.selectMenuList)
        let path = sessionStorage.menu_alias
        selectMenuList.forEach((element) => {
          if (element.alias.split('/')[1] != path) {
            element.alias = '/' + path + '/' + element.alias
          }
        })
        selectMenuList.push({name: _me.defName})
        _me.breadcrumbs = selectMenuList
        let selectMenu = selectMenuList[selectMenuList.length - 1]
        _me.pageTitle =
          selectMenuList[selectMenuList.length - 2].name +
            ' ' +
            selectMenu.name || ''
      }
    },
  },
  created() {
    //监听表单数据请求完成
    let _this = this

    //取发起节点的属性用于判断是否可以选择路径跳转
    window.agentLeaderId = this.leaderId
    this.$store
      .dispatch('storeProcess/getCurNodeProperties', {
        defId: this.defId || '',
        instId: this.instId || '',
        taskId: '',
      })
      .then((NodeDef) => {
        this.nodeDef = NodeDef
        if (
          NodeDef.nodeProperties &&
          NodeDef.nodeProperties.length > 0 &&
          NodeDef.nodeProperties[0].initFillData
        ) {
          _this.initFillData = NodeDef.nodeProperties[0].initFillData
          _this.$refs['formContent'].setInitFillData(_this.initFillData)
        }
      })
    //获取流程信息
    req
      .get(window.context.bpmModel + '/flow/def/v1/defGet?defId=' + this.defId)
      .then((res) => {
        this.defName = res.data.name
        this.init()
      })
  },
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
.el-main {
  padding: 0;
}

.el-header {
  padding: 0;
}

.top-subject-col > h3 {
  text-align: center;
  color: #141414;
  font-size: 16px;
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

.start-card {
  background: #fff;
}
// /** ccwgq 2022-05-30 修改字体大小 start*/
/deep/ .start-btn-group {
  * {
    font-size: 11pt !important;
    // color: black;
    font-family: MicroSoft YaHei;
  }
  margin-bottom: 15px; //底部预留一点距离
}
/**  end */
</style>
