<template>
  <div>
    <!--TODO 智能辅助组件-->
    <el-button type="danger" icon="el-icon-success" @click="showDialogExam()">
      <span>相对方预审</span>
    </el-button>
    <!-- 全屏 弹窗 -->
    <el-dialog
      :visible.sync="dialogExamVisible"
      width="98.5%"
      custom-class="ouai__dialog"
      title="相对方预审"
      :show-close="true"
      append-to-body
      :fullscreen="true"
    >
      <!-- 待预审文档 -->
      <el-row :gutter="10">
        <!-- :gutter 分栏间隔 -->
        <el-col :span="12">
          <el-card
            class="el-card"
            onclick=""
            :style="{height: leftHeight + 'px'}"
          >
            <div slot="header" class="clearfix">
              <span>相对方“{{ oppName }}”资料：</span>
            </div>
            <el-scrollbar
              ref="docSrollbar"
              :style="{height: dialogHeight - 120 + 'px'}"
            >
              <div v-show="showOppResult">
                <table
                  class="form-table"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                >
                  <tbody v-for="(item, $index) in oppInfoList" :key="$index">
                    <tr>
                      <th width="20%">
                        {{ item.key }}
                      </th>
                      <td width="80%">
                        {{ item.value }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </el-scrollbar>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="right-card" ref="rightCard">
            <div slot="header" class="clearfix">
              <span>预审结果：</span>
            </div>
            <div class="panel-heading" style="padding: 8px">
              <span>风控模型：</span>
              <ht-select
                v-model="currentModelId"
                :options="modelList"
                :props="{key: 'ID_', value: 'name'}"
                filterable
                @change="changeModel"
                :permission="resultLoading ? 'r' : 'w'"
              >
              </ht-select>
            </div>

            <div class="panel-heading" style="padding: 8px">
              <span>上次审核时间：{{ lastExamTime }}</span>
            </div>

            <el-scrollbar
              ref="rightScroll"
              :style="{
                height: rightHeight + 'px',
              }"
            >
              <div v-show="showOppResult">
                <div class="panel-heading" style="padding: 8px">
                  <b
                    >相对方“{{ oppName }}”的风险：<span style="color: red">
                      ( {{ oppRiskList.length }} )</span
                    ></b
                  >
                </div>
                <el-tabs el-tabs v-model="activeTabName" type="card" stretch>
                  <el-tab-pane label="选择规则" name="rules">
                    <div class="panel-heading" style="padding: 8px">
                      <b
                        >模型审核项目：<span style="color: #409eff">
                          ( {{ ruleList.length }} )</span
                        ></b
                      >
                    </div>
                    <el-table
                      :data="ruleList"
                      ref="ruleTable"
                      stripe
                      border
                      class="rule-table"
                      size="medium"
                      style="width: 100%"
                    >
                      <el-table-column
                        type="selection"
                        align="center"
                        width="40"
                      ></el-table-column>
                      <el-table-column
                        type="index"
                        align="center"
                        width="80"
                        label="序号"
                      ></el-table-column>
                      <el-table-column
                        prop="name"
                        label="规则"
                        style="width: 100%"
                      >
                      </el-table-column>
                    </el-table>
                  </el-tab-pane>
                  <el-tab-pane
                    label="审核结果"
                    name="result"
                    v-if="resultList.length"
                  >
                    <el-table
                      :data="resultList"
                      ref="resultTable"
                      stripe
                      border
                      class="rule-table"
                      size="medium"
                      style="width: 100%"
                    >
                      <el-table-column
                        type="index"
                        align="center"
                        width="80"
                        label="序号"
                      ></el-table-column>
                      <el-table-column
                        prop="name"
                        label="规则"
                        align="center"
                        style="width: 100%"
                      >
                        <template slot-scope="scope">
                          <div
                            v-if="scope.row.location > 0"
                            style="text-align: left; cursor: crosshair"
                          >
                            {{ scope.row.name }}
                            <span style="float: right">
                              <i
                                v-if="scope.row.isPass"
                                style="color: green"
                                class="el-icon-success"
                              ></i>
                              <i
                                v-if="
                                  scope.row.isPass !== undefined &&
                                  !scope.row.isPass
                                "
                                style="color: red"
                                class="el-icon-warning"
                              ></i>
                              {{ scope.row.opinion }}
                              <span
                              @click="openResultDetail(scope.row,$event)"
                                v-if="
                                  !!scope.row.resultUrl
                                "
                                >详情</span
                              >
                            </span>
                          </div>
                          <div v-else style="text-align: left">
                            {{ scope.row.name }}
                            <span style="float: right">
                              <i
                                v-if="scope.row.isPass"
                                style="color: green"
                                class="el-icon-success"
                              ></i>
                              <i
                                v-if="
                                  scope.row.isPass !== undefined &&
                                  !scope.row.isPass
                                "
                                style="color: red"
                                class="el-icon-warning"
                              ></i>
                              {{ scope.row.opinion }}
                              <span
                              style="color:skyblue;text-decoration:underline;cursor:default;"
                              @click="openResultDetail(scope.row,$event)"
                                v-show="
                                  !!scope.row.resultUrl
                                "
                                >详情</span
                              >
                            </span>
                          </div>
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-tab-pane>
                </el-tabs>
              </div>
            </el-scrollbar>
            <div
              ref="progress"
              v-show="showExamResult || resultLoading"
              class="item-view"
            >
              <p>
                审核计数:
                <span>{{ progressData.completeNum }}</span
                >/
                <span>{{ progressData.planNum }}</span>
              </p>
              <el-progress
                :text-inside="false"
                :stroke-width="6"
                :percentage="percentage"
              ></el-progress>
            </div>
            <!-- :status="setItemStatus(progressData)"  -->
          </el-card>
        </el-col>
      </el-row>

      <!-- solt 插槽使用 -->
      <span slot="footer" class="right-button dialog-footer">
        <el-button @click="closeDialog()">取消</el-button>
        <el-button type="primary" :loading="resultLoading" @click="startExam()"
          >预审</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
import Notify from '@/components/eipControl/ou/Notify'
import req from '@/request.js'
import ai from '@/api/ou/aiServer'
import dialogHeight from './dialog_height'
/* 浏览组件 */
export default {
  name: 'opp-exam',
  mixins: [dialogHeight],
  props: {
    // 获取表单数据
    getFormData: {
      type: Function,
      default: null,
    },
    //获取表单key
    getFormKey: {
      type: Function,
      default: null,
    },
  },
  data() {
    return {
      /**表单key */
      formKey: '',
      /**选择的规则*/
      selectRules: [],
      /**历史选中的规则 */
      oldselectRules: [],
      /** 风控模型列表  */
      modelList: [],
      /**规则列表 */
      ruleList: [],
      /**结果列表 */
      resultList: [],
      // 相对方风险
      oppRiskList: [],
      // 合同ID(相对方中不应存在合同ID)
      contractId: '',
      // 相对方名称
      oppName: '',
      // 相对方ID
      oppId: '',
      taskFailCounter: 0, //请求结果接口连续错误计数器
      //resultLoading: false, //加载结果
      // 进度条
      progressData: {
        planNum: 0,
        completeNum: 0,
        color: ['#1bf8f3', '#3196e8', '#feb046', '#e8484f', '#9174e4'],
      },
      resultCounter: 0, //返回结果的计数
      //相对方信息列表
      oppInfoList: [],
      // 上次审核时间
      lastExamTime: '',
      // 上次审核任务ID
      lastExamTaskId: '',
      // 审核任务列表
      lastExamTaskList: [],
      // 当前模型的id
      currentModelId: '',
      // 当前模型的名字
      currentModelName: '',
      //   页数
      numPages: 1,
      //   弹窗显示控制
      dialogExamVisible: false,
      // 预审按钮的是否处于按钮的加载状态
      resultLoading: false,
      //当前激活的标签
      activeTabName: 'rules',
      showOppResult: true,
      //人员
      humanName: '',
      //法人
      legalPersonName: '',
      //资质证书
      certificateName: '',
      //统一社会应用代码
      uni_soc_cdt_cd: '',
      doneRules: 0, //完成的规则数
    }
  },
  computed: {
    showExamResult() {
      return this.resultList.length > 0
    },
    leftHeight() {
      return this.dialogHeight - 120
    },
    rightHeight() {
      let gap = 0
      if (this.showExamResult || this.resultLoading) {
        gap = 27
      }
      return this.dialogHeight - 165 - 129 - gap
    },
    percentage() {
      let val = this.progressData.completeNum / this.progressData.planNum
      if (isNaN(val) || val == 0) {
        return 0
      } else return parseFloat(Number(val * 100).toFixed(2))
    },
  },
  mounted() {
    this.getModels()
  },
  beforeDestroy() {
    //销毁组件立刻清除定时器
    clearInterval(this.taskTimer)
  },
  watch: {
    dialogExamVisible: function (val) {
      !val && this.closeDialog()
    },
    //连续五次请求结果的数组长度不变就清空计数器
    // resultCounter: function (val) {
    //   if (val === 5) {
    //     clearInterval(this.taskTimer)
    //     this.resultLoading = false
    //     this.$message.warning('未有返回结果')
    //   }
    // },
  },
  methods: {
    /*  调用接口获取相对方风控模型列表*/
    getModels() {
      ai.getOppRiskModels((data) => {
        if (data.rows) {
          this.modelList = data.rows
          if (this.modelList.length > 0) {
            //当前的模型为返回数据的第一个模型
            this.currentModelId = this.modelList[0]['ID_']
            this.currentModelName = this.modelList[0]['name']
            this.changeModel()
          }
        } else {
          this.$message({
            message: '获取风控模型失败！',
            type: 'error',
          })
        }
      })
    },
    /**  改变当前选中的风控模型 */
    changeModel() {
      this.oppRiskList = []
      this.activeTabName = 'rules'
      this.resultList = []
      if (this.currentModelId) {
        const foundModel = this.modelList.find(
          (model) => model.ID_ == this.currentModelId
        )
        if (foundModel) {
          this.currentModelName = foundModel.name
        }
        ai.getModelRulesById(this.currentModelId, (data) => {
          if (data.rows) {
            this.ruleList = data.rows
            //返回结果后完成审核数置空,计划完成的任务数量为选中的任务数量
            this.progressData.planNum = this.ruleList.length
            this.progressData.completeNum = 0
            // 钩子函数在回调后执行
            if (this.dialogExamVisible == true) {
              this.$nextTick(function () {
                this.ruleList.forEach((row) => {
                  this.$refs.ruleTable.toggleRowSelection(row, true)
                })
              })
            }
          } else {
            this.$message({
              message: '获取风控模型失败！',
              type: 'error',
            })
          }
        })
      }
    },
    //  获取最近的一次审核结果
    getLastExam() {
      let _this = this
      _this.$http
        .get(
          '${bpmRunTime}/eipx7/opun/runtime/ai/v1/oppId?oppId=' +
            _this.oppId +
            '&contractId=123456'
        )
        .then((resp) => {
          // console.log('历史审核返回的数据=-=====》', resp.data)
          if (resp.data && resp.data.state) {
          } else {
            // console.error('上次审核任务不存在')
          }
        })
    },

    //  ccwgq:不管是开始预审还是查询结果都是请求同样一个返回的结果
    getExamResult(taskId) {
      // ai.getExamResultByTaskId((data)=>{

      // })
      req
        .get(
          '${bpmRunTime}/eipx7/opun/runtime/ai/v1/examResult?taskId=' + taskId
        )
        .then((resp) => {
          if (resp.data.state) {
            let data = resp.data
            if (data.value) {
              // this.doneRules=data.value.doneRules;
              this.resultList = data.value.ruleDetail // 获得审核的具体结果
              this.resultList.forEach((res) => {
                const item = this.ruleList.filter(
                  (rule) => rule.rule_key == res.ruleKey
                )[0]
                res.name = item.name
                res.notes = item.notes
              })
              //过滤出有风险的项目（包含未知项目）
              if (this.resultList.length) {
                this.activeTabName = 'result'
              }
              //结果计数器将在请求的结果长度不变的情况下+1
              this.doneRules === data.value.doneRules
                ? (this.resultCounter++)
                : (this.resultCounter=0)
              this.doneRules = data.value.doneRules
              if (this.resultCounter === 5) {
                clearInterval(this.taskTimer)
                this.resultLoading = false
                this.resultCounter=0;
                this.$message.warning(
                  this.doneRules == 0 ? '未有返回结果' : '剩余结果无法查询'
                )
              }
              this.progressData.completeNum = this.resultList.length
              this.oppRiskList = this.resultList.filter((res) => !res.isPass)
              this.progressData.completeNum = data.value.doneRules //   完成的规则数
            }
            //审核结果失败统计器置零
            this.taskFailCounter = 0
          } else {
            // 请求预审失败后就要停止审核
            this.taskFailCounter++
            this.$message.warning('请求预审失败')
            this.resultLoading = false
          }
        })
        .catch((err) => {
          this.taskFailCounter++
        })
        .finally(() => {
          if (
            this.progressData.completeNum >= this.progressData.planNum ||
            this.taskFailCounter > 2
          ) {
            //清除定时器
            this.taskTimer && clearInterval(this.taskTimer)
            // 解除按钮加载状态
            this.resultLoading = false
          }
        })
    },
    /**关闭弹窗 */
    closeDialog() {
      const origanData = this.$options.data()
      this.dialogExamVisible = false
      // this.progressData.completeNum = 0
      // this.progressData.planNum = 0
      const keys = [
        'resultLoading',
        'activeTabName',
        'resultList',
        'progressData',
        'doneRules',
      ]
      keys.forEach((key) => {
        this[key] = origanData[key]
      })
      clearInterval(this.taskTimer)
    },
    showDialogExam() {
      let _this = this
      //每次得先把列表置空
      _this.oppInfoList = []
      //获得表单的数据
      let boData = _this.getFormData()
      boData = boData.d_opposite_parties
      // console.log('boData====>', boData)
      //合同id直接赋值相对方的id
      _this.contractId = boData.id_
      //相对方id
      _this.oppId = boData.id_ == undefined ? '-1' : boData.id_
      _this.oppName = boData.name === undefined ? '' : boData.name
      //TODO:确定参与人员取值,至今仍未清楚具体取哪个值
      _this.humanName = ''

      _this.legalPersonName =
        boData.legal_rep === undefined ? '' : boData.legal_rep
      //资质证书
      _this.certificateName =
        boData.certificate_type_nm === undefined
          ? ''
          : boData.certificate_type_nm
      //统一社会信用代码
      _this.uni_soc_cdt_cd =
        boData.uni_soc_cdt_cd === undefined ? '' : boData.ciertificate_num
      if (_this.oppName == '') {
        _this.$message({
          message: '请输入相对方！',
          type: 'error',
        })
      } else {
        _this.oppInfoList.push({key: '相对方名称', value: _this.oppName})
        var certificate_type = boData.certificate_type
        // console.log('certificate_type ', certificate_type)
        certificate_type = certificate_type.replace('00', '统一社会信用代码')
        certificate_type = certificate_type.replace('01', '居民身份证')
        _this.oppInfoList.push({key: '证件类型', value: certificate_type})

        _this.oppInfoList.push({
          key: '证件号码',
          value: boData.ciertificate_num,
        })
        _this.oppInfoList.push({
          key: '法定代表人',
          value: boData.legal_rep,
        })
        _this.dialogExamVisible = true
        _this.changeModel()
        _this.getLastExam()
      }
    },
    startExam() {
      let _this = this
      //预审按钮至于加载状态
      _this.resultLoading = false
      _this.selectRules = []
      _this.activeTabName = 'rules'
      _this.progressData = this.$options.data().progressData
      this.resultCounter = 0
      //TODO:把表格选中的规则加入到选择列表中
      if (this.$refs.ruleTable.selection.length > 0) {
        this.$refs.ruleTable.selection.forEach((m, i) => {
          _this.selectRules.push(m.rule_key)
        })
      }

      if (_this.selectRules.length == 0) {
        _this.$message.error('请至少选择一条审核规则')
        return
      }

      _this.progressData.planNum = this.selectRules.length

      //相对方list
      const oppList = [
        {
          oppId: this.oppId,
          oppName: this.oppName,
          oppRole: '00',
          humanNames: this.humanName,
          legalPersonNames: this.legalPersonName,
          certificateNames: this.certificateName,
          uni_soc_cdt_cdes: this.uni_soc_cdt_cd,
        },
      ]

      _this.resultLoading = true
      _this.doneRules = 0
      //console.log("this.selectRules：", this.selectRules);
      //_this.selectRules = this.$refs.ruleTable.selection;
      /*********开始请求审核 begin********** */
      let taskId = ''
      let querys = {
        contractId: '123456',
        oppId: _this.oppId,
        oppName: _this.oppName,
        modelId: _this.currentModelId,
        modelName: _this.currentModelName,
        ruleList: _this.selectRules,
        oppList: oppList,
      }

      /************    可选参数  ************************/

      if (_this.humanName) {
        querys.humanName = _this.humanName
      }
      if (_this.legalPersonName) {
        querys.legalPersonName = _this.legalPersonName
      }
      if (_this.uni_soc_cdt_cd) {
        querys.uni_soc_cdt_cd = _this.uni_soc_cdt_cd
      }
      if (_this.certificateName) {
        querys.certificateName = _this.certificateName
      }

      /************************** 可选参数  结束    *******************/

      // console.log('打印请求的参数信息====》', querys)
      req
        .post('${bpmRunTime}/eipx7/opun/runtime/ai/v1/oppExam', querys)
        .then((resp) => {
          // console.log('打印返回的数据信息======》', resp.data)
          if (resp.data && resp.data.state) {
            taskId = resp.data.taskId
          } else {
            this.$message({type: 'warning', message: '请求预审失败'})
            _this.resultLoading = false
            return
          }
          // 轮询审核的结果
          if (taskId) {
            // console.log('任务id记录成功，请求审核的结果=======》', taskId)
            _this.taskTimer = setInterval(() => {
              _this.getExamResult(taskId)
            }, 5000)
          }
        })
    },
    //ccwgq 加入resultUrl返回详情结果小窗显示
    openResultDetail(row,e){
      const data={
        oppKey:row.ruleKey,
        resultUrl:Object.assign({},row.resultUrl)
      }
      Notify({
        propsData:{data}
      })
    }
  },
}
</script>
<style lang="scss">
.el-tooltip__popper {
  width: fit-content !important;
}
.el-card__right .el-card__body {
  height: 100%;
}
</style>
<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
.el-dialog__wrapper /deep/ {
  padding-bottom: 0px;
  .ouai__dialog {
    background: $--color-white;
    margin: 0px !important;
    padding: 10px;
    border-radius: 3px;
    .el-dialog__header {
      background: $--color-white;
      padding: 10px;
      height: 25px !important;
      padding: 10px !important;
    }
    .el-dialog__body {
      width: 100%;
      background: $--color-white;
      height: calc(100%);
      margin: 0 auto;
      padding: 0;
      overflow: hidden;
    }
    .el-dialog__footer {
      height: auto;
      padding-bottom: 0px;
    }
  }
}

.rule-table {
  width: 100%;
  padding: 10px 0px !important;
}

.right-button {
  position: absolute;
  right: 10px;
  bottom: 10px;
  height: 33px;
}
// .ht_ce {
//   margin-top: -10px !important;
// }

.other-set__card {
  height: calc(100% - 5px);
}

div.el-card__header {
  padding: 8px 20px;
}

div.el-card__body {
  height: calc(100% - 65px);
  padding: 10px 0 10px 10px;
}

// 进度条
.item-view {
  margin-top: 0.8rem;
  margin-bottom: 0.1rem;
  font-size: 12px;
  height: 24px;
  p {
    margin: 0;
  }
}
/deep/ .el-progress {
  width: 100%;
}
/deep/ .el-progress-bar__outer {
  border-radius: 0;
  background-color: #ccc;
}

/deep/ .el-progress-bar__inner {
  border-radius: 0;
  color: #3a3e63;
}

/deep/ .el-progress-bar {
  margin: 0;
  padding: 0;
  width: 82%;
}
/deep/ .el-progress__text {
  color: #3a3e63;
  float: none;
  display: inline-block;
}
</style>
