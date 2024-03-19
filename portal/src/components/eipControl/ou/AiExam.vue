<template>
  <div>
    <!--   刚开始只显示按按钮 -->
    <el-button type="danger" icon="el-icon-success" @click="showDialogExam()">
      <span>智能预审</span>
    </el-button>
    <!--   弹窗  全屏   -->
    <el-dialog
      :visible.sync="dialogExamVisible"
      width="98.5%"
      custom-class="ouai__dialog"
      title="智能预审"
      :show-close="true"
      append-to-body
    >
      <!-- 待预审文档 -->
      <el-row :gutter="10">
        <!-- :gutter 分栏间隔 -->
        <el-col :span="17">
          <el-card
            v-loading="pdfLoading"
            element-loading-text="pdf加载中..."
            class="el-card"
            onclick=""
            ref="leftCard"
          >
            <div slot="header" class="clearfix">
              <span>合同文本：{{ docUrl }}</span>
            </div>
            <el-scrollbar
              ref="docSrollbar"
              :style="{height: dialogHeight - 170 + 'px'}"
            >
              <!--  先请求pdf,预审结果返回图片并覆盖方便定位  -->
              <div @click="getPos()" v-if="examResultImg" class="pdf-container">
                <img :src="examResultImg" alt="" />
              </div>
              <div @click="getPos()" v-else class="pdf-container">
                <pdf
                  style="margin-top: 40px"
                  ref="docPdf"
                  v-for="i in numPages"
                  :src="docPdfSrc"
                  :page="i"
                  :key="i"
                  :rotate="pageRotate"
                  @progress="loadedRatio = $event"
                  @page-loaded="pageLoaded($event)"
                  @num-pages="pageTotalNum = $event"
                  @error="pdfError($event)"
                  @link-clicked="page = $event"
                >
                </pdf>
              </div>
            </el-scrollbar>
          </el-card>
        </el-col>
        <el-col :span="7">
          <el-card class="el-card el-card__right" onclick="">
            <div slot="header" class="clearfix">
              <span>预审结果：</span>
            </div>
            <div class="panel-heading" style="padding: 8px">
              <span>风控模型：</span>
              <ht-select
                size="small"
                v-model="currentModelId"
                :options="modelList"
                :props="{key: 'ID_', value: 'name'}"
                filterable
                @change="changeModel"
                :permission="resultLoading ? 'r' : 'w'"
              >
              </ht-select>
            </div>

            <div
              v-if="!!lastExamTime"
              class="panel-heading"
              style="padding: 8px"
            >
              <span>上次审核时间：{{ lastExamTime }}</span>
            </div>

            <el-scrollbar
              ref="el-scrollbar"
              :style="{height: rightHeight + 'px'}"
            >
              <!--  -->
              <div>
                <!-- TODO:完成分类统计 -->
                <!-- <div class="panel-heading" style="padding: 8px">
                  <b
                    >合同文本校验：<span style="color: red">
                      ( {{ textErrorList.length }} )</span
                    >
                  </b>
                </div>
                <table
                  class="form-table other-set__table"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                >
                  <tbody v-for="(item, $index) in textErrorList" :key="$index">
                    <tr
                      v-if="item.location > 0"
                      style="cursor: crosshair"
                      @click="scrollDoc(item.location)"
                    >
                      <td width="100%">
                        <div style="text-align: left">
                          {{ item.name }} <span style="color: red">错误</span>
                          <span style="float: right">
                            <i style="color: red" class="el-icon-warning"></i>
                            {{ item.opinion }}
                            <a
                              v-if="
                                item.resultUrl !== undefined &&
                                  item.resultUrl != ''
                              "
                              :href="item.resultUrl"
                              >详情</a
                            >
                          </span>
                        </div>
                      </td>
                    </tr>
                    <tr v-else>
                      <td width="100%">
                        <div style="text-align: left">
                          {{ item.name }} <span style="color: red">错误</span>
                          <span style="float: right">
                            <i style="color: red" class="el-icon-warning"></i>
                            {{ item.opinion }}
                            <a
                              v-if="
                                item.resultUrl !== undefined &&
                                  item.resultUrl != ''
                              "
                              :href="item.resultUrl"
                              >详情</a
                            >
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div class="panel-heading" style="padding: 8px">
                  <b
                    >缺失要素项：<span style="color: red">
                      ( {{ missFactorList.length }} )</span
                    ></b
                  >
                </div>

                <table
                  class="form-table"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                >
                  <tbody v-for="(item, $index) in missFactorList" :key="$index">
                    <tr
                      v-if="item.location > 0"
                      style="cursor: crosshair"
                      @click="scrollDoc(item.location)"
                    >
                      <td width="100%">
                        <div style="text-align: left">
                          {{ item.name }} <span style="color: red">缺失</span>
                          <span style="float: right">
                            <i style="color: red" class="el-icon-warning"></i>
                            {{ item.opinion }}
                            <a
                              v-if="
                                item.resultUrl !== undefined &&
                                  item.resultUrl != ''
                              "
                              :href="item.resultUrl"
                              >详情</a
                            >
                          </span>
                        </div>
                      </td>
                    </tr>
                    <tr v-else>
                      <td width="100%">
                        <div style="text-align: left">
                          {{ item.name }} <span style="color: red">缺失</span>
                          <span style="float: right">
                            <i style="color: red" class="el-icon-warning"></i>
                            {{ item.opinion }}
                            <a
                              v-if="
                                item.resultUrl !== undefined &&
                                  item.resultUrl != ''
                              "
                              :href="item.resultUrl"
                              >详情</a
                            >
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table> -->
                <!-- TODO: 多相对方改为List的格式
                例如:相对方“公司A”的风险
                ......
                相对方“公司B”的风险
                ......
                 -->
                <!-- <div class="panel-heading" style="padding: 8px">
                  <b
                    >相对方“{{ oppQueryList[0].oppName }}”的风险：<span
                      style="color: red"
                    >
                      ( {{ oppRiskList.length }} )</span
                    ></b
                  >
                </div> -->

                <!--<table
                  class="form-table"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                >
                  <tbody v-for="(item, $index) in oppRiskList" :key="$index">
                    <tr
                      v-if="item.location > 0"
                      style="cursor: crosshair"
                      @click="scrollDoc(item.location)"
                    >
                      <td width="100%">
                        <div style="text-align: left">
                          {{ item.name }} <span style="color: red">风险</span>
                          <span style="float: right">
                            <i style="color: red" class="el-icon-warning"></i>
                            {{ item.opinion }}
                          </span>
                        </div>
                      </td>
                    </tr>
                    <tr v-else>
                      <td width="100%">
                        <div style="text-align: left">
                          {{ item.name }} <span style="color: red">风险</span>
                          <span style="float: right">
                            <i style="color: red" class="el-icon-warning"></i>
                            {{ item.opinion }}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table> -->

                <div class="panel-heading" style="padding: 8px">
                  <b
                    >模型审核项目：<span style="color: #409eff">
                      ( {{ ruleList.length }} )</span
                    ></b
                  >
                </div>
                <!-- 2022-02-17页签控制分开选中的规则和审核的结果 -->
                <el-tabs v-model="activeTabName" type="card" stretch>
                  <!-- 选择的规则区域 -->
                  <el-tab-pane label="选择规则" name="rules">
                    <el-table
                      :data="ruleList"
                      ref="ruleTable"
                      stripe
                      border
                      class="rule-table"
                      size="medium"
                      style="width: 100%"
                      @selection-change="handleTableChange"
                    >
                      <el-table-column
                        type="selection"
                        align="center"
                        width="40"
                      ></el-table-column>
                      <el-table-column
                        type="index"
                        align="center"
                        width="40"
                        label="序号"
                      ></el-table-column>
                      <el-table-column
                        label="规则"
                        align="left"
                        header-align="center"
                        style="width: 100%"
                      >
                        <template v-slot="scope">
                          <div>
                            <span>
                              <span style="text-align: left">{{
                                scope.row.name
                              }}</span>
                              <el-tooltip
                                :content="scope.row.notes"
                                placement="bottom"
                                effect="light"
                                popper-class="ruleTips"
                              >
                                <i
                                  style="margin-left: 3px"
                                  class="el-icon-question"
                                ></i></el-tooltip
                            ></span>
                          </div>
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-tab-pane>
                  <!-- 返回的结果区域 -->
                  <el-tab-pane
                    label="审核结果"
                    name="result"
                    v-if="resultList.length > 0"
                  >
                    <el-table
                      :data="resultList"
                      ref="resultTable"
                      stripe
                      border
                      class="rule-table"
                      size="medium"
                      style="width: 100%"
                      @selection-change="handleTableChange"
                    >
                      <el-table-column
                        type="index"
                        align="center"
                        width="60"
                        label="序号"
                      ></el-table-column>
                      <el-table-column
                        label="规则"
                        align="left"
                        header-align="center"
                        style="width: 100%"
                      >
                        <template slot-scope="scope">
                          <!--  location  ------>
                          <div
                            v-if="typeof scope.row.isPass != 'undefined'"
                            style="text-align: left; cursor: crosshair"
                            @click="scrollDoc(scope.row.location)"
                          >
                            <!--   规则 -->
                            <el-tooltip
                              effect="light"
                              placement="bottom-start"
                              :content="scope.row.notes"
                            >
                              <span style="cursor: text">{{
                                scope.row.name
                              }}</span>
                            </el-tooltip>
                            <span style="float: right">
                              <AiExamIcon :data="scope.row" />
                              <span>{{ scope.row.opinion }}</span>
                              <a
                                v-if="!!scope.row.resultUrl"
                                :href="scope.row.resultUrl"
                                target="_blank"
                                >详情</a
                              >
                            </span>
                          </div>
                          <div v-else>
                            <el-tooltip
                              effect="light"
                              placement="bottom-start"
                              :content="scope.row.notes"
                            >
                              <span style="cursor: text">{{
                                scope.row.name
                              }}</span>
                            </el-tooltip>
                          </div>
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-tab-pane>
                </el-tabs>
              </div>
            </el-scrollbar>
            <div style="min-height: 31px">
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
            </div>
          </el-card>
        </el-col>
      </el-row>
      <!-- wgq；放入右侧 -->
      <!-- solt 插槽使用 -->
      <span slot="footer" ref="bottom-btn">
        <el-button-group>
          <el-button type="danger" size="medium" round @click="closeDialog()"
            >取消</el-button
          >
          <!-- 是否处于加载中状态  -->
          <el-button
            type="success"
            size="medium"
            round
            :loading="resultLoading"
            @click="startExam()"
            >预审</el-button
          >
        </el-button-group>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import req from '@/request.js'
import pdf from 'vue-pdf'
import AiExamIcon from '@/components/eipControl/ou/AiExamIcon'
import dialogHeight from './dialog_height'
//定义一组需要设置为响应式的属性
const reactiveKeys = ['name', 'type_id', 'notes']
/* 浏览组件 */
/**
 * 关于智能预审组件接口调用的设计思路：
 *       1.第一次创建一个审核的任务请求，创建成功后就返回一个任务的id 失败隐藏进度条并结束按钮的加载状态
 *       2.请求成功后，每5s携带任务的id到后端查询审核完成的数量，并计算进度条的完成进度
 *       3.完成后 进度条百分之百，且按钮结束加载状态
 */
export default {
  name: 'ai-exam',
  components: {
    pdf,
    AiExamIcon,
  },
  props: {
    /** 实例id */
    instId: null,
    /**定义id */
    defId: null,
    /**节点id */
    nodeId: null,
    /**为了获取表单的内容*/
    getFormData: {
      type: Function,
      default: null,
    },
    /**为了获取表单的key*/
    getFormKey: {
      type: Function,
      default: null,
    },
  },
  mixins: [dialogHeight],
  data() {
    return {
      /**整个弹窗是否可见*/
      dialogExamVisible: false,
      /**唯一的表单key*/
      formKey: '',
      /**文档路径*/
      docUrl: '',
      /*选择的规则*/
      selectRuleList: [],
      /*历史审核时选择的规则*/
      oldSelectRuleList: [],
      /*从接口拿回的模型列表*/
      modelList: [],
      // 当前选中的模型的id
      currentModelId: '',
      // 当前选中模型的名称
      currentModelName: '',
      /**要素规则列表*/
      ruleList: [],
      /**审核返回结果的列表  */
      resultList: [],
      /**文本校验错误*/
      textErrorList: [],
      // 要素项缺失错误
      missFactorList: [],
      /**相对方风险*/
      oppRiskList: [],
      // 合同ID
      contractId: '',
      /** 用一个对象存放我方的全部信息 */
      ourParty: {
        name: '', //我方的名字
        role: '', //?我方的主体地位,参考数字字典中的主体地位取值
      },
      /**相对方列表,用于相关请求接口数据的存放*/
      oppQueryList: [],
      // 相对方ID
      oppId: '',
      /* ===历史审核信息===   */
      /**上一次审核的时间*/
      lastExamTime: '',
      /**  上一次审核任务ID*/
      lastExamTaskId: '',
      /**上一次审核任务规则列表*/
      lastExamRuleList: [],
      /* ===历史审核信息===   */
      //当前审核的任务id
      currentExamTaskId: 0,
      //  pdf页码
      numPages: 1,
      // 预审按钮的是否处于按钮的加载状态
      resultLoading: false,
      //  文档的pdf路径
      docPdfSrc: '',
      // // pdf列表
      // pdfList: [],
      pdfImg: {}, //作为一个对象
      // 当前页数
      pageNum: 1,
      // 总页数
      pageTotalNum: 1,
      // 旋转角度
      pageRotate: 0,
      // 加载进度
      loadedRatio: 0,
      // 加载的页数
      curPageNum: 0,
      // 进度条
      progressData: {
        planNum: 0, //计划审核的数量
        completeNum: 0, //实际完成的数量
        color: ['#1bf8f3', '#3196e8', '#feb046', '#e8484f', '#9174e4'],
      },
      // 进度的颜色
      progressColor: ['#1bf8f3', '#3196e8', '#feb046', '#e8484f', '#9174e4'],
      // 是否显示结果
      showExamResult: false,
      resultCounter: 0, //结果计数，主要为了连续5次为空自动中断当前的审核任务
      // 是否禁用智能审核的按钮
      examButton: false,
      /**任务计时器编号*/
      taskTimer: null,
      // 请求审核结果失败计数,
      taskFailCounter: 0,
      //控制loading状态
      pdfLoading: false,
      //验证滚动位置
      position: 0,
      //  预审结果图片
      examResultImg: null,
      //pdf请求
      pdfRequest: null,
      //激活的tab页签
      activeTabName: 'rules',
      //完成的任务数量
      doneRules: 0,
    }
  },
  computed: {
    //  右侧滚动区域的高度
    rightHeight() {
      let gap = 0
      if (this.showExamResult || this.resultLoading) {
        gap = 27
      }
      return this.dialogHeight - 165 - 86 - gap
    },
    percentage() {
      let val = this.progressData.completeNum / this.progressData.planNum
      if (isNaN(val) || val == 0) {
        return 0
      } else return parseFloat(Number(val * 100).toFixed(2))
    },
  },
  watch: {
    'resultList.length': function (nVal, oVal) {
      if (nVal > 0 && oVal == 0) {
        this.activeTabName = 'result'
      }
    },
    //页面打开的时候要把resultList置空
    dialogExamVisible: function (nVal, oVal) {
      if (!oVal && nVal) {
        this.resultList = []
      }
      if (oVal && !nVal) {
        this.showExamResult = false
      }
    },
    resultCounter: function (val) {
      if (val === 5) {
        clearInterval(this.taskTimer)
        this.resultLoading = false
        this.$message.warning('未有返回结果')
      }
    },
  },
  //销毁组件前清除定时器
  beforeDestroy() {
    clearInterval(this.taskTimer)
  },
  methods: {
    /**校验数字是否小于360
     * @deprecated
     */
    _checkLessThan360(val) {
      var _this = this
      val = typeof val === 'string' ? parseInt(val) : val
      let isPass = val <= 360
      // _this.progressData.completeNum = isPass
      //   ? _this.progressData.completeNum + 1
      //   : _this.progressData.completeNum
      _this.resultList.forEach((res, index, arr) => {
        if (res.ruleKey == 'payDeadlineLimit') {
          res.location = -1
          res.isPass = isPass
          res.opinion = isPass ? '' : '请检查'
        }
      })
      return isPass
    },
    /**@description 校验融资利息是否是买方
     * @deprecated
     */
    _checkInterestParty(val) {
      var isPass
      isPass = val === '买方'

      var _this = this
      _this.resultList.forEach((res, index, arr) => {
        if (res.ruleKey == 'financingInterestNumber') {
          res.location = -1
          res.isPass = isPass
          res.opinion = isPass ? '' : '请检查'
        }
      })
      return isPass
    },
    /**
     * @deprecated
     * @description 检验合同金额的大小写校验一致
     * @param {string} lower 提取出的小写的值
     * @param {string} upper 提出出的大写的值
     */
    _checkLowCapMoney(lower, upper) {
      var _this = this

      var lowerVal = lower.split(',').reduce((pre, cur) => pre + cur, '')
      var trans = _this.$root.$Formulas.CURRENCY(lowerVal)
      if (!/元整$/.test(upper)) {
        upper = upper + '元整'
      }
      var isPass = trans == upper
      _this.progressData.completeNum++
      _this.resultList.push({
        ruleKey: 'validMoney',
        resultUrl: '',
        isPass: isPass,
        location: -1,
        opinion: isPass ? '' : '请检查',
      })
      return isPass
    },
    /*   ===== 校验部分结束   ===== */
    /**@description 多选表格选择时触发
     * @param {object} selection 选中的项目
     */
    handleTableChange(selection) {
      let _this = this
      _this.selectRuleList = []
      // 先计算选择了哪些结果
      if (_this.$refs.ruleTable.selection.length > 0) {
        _this.$refs.ruleTable.selection.forEach((m, i) => {
          _this.selectRuleList.push(m.rule_key)
        })
      }
    },
    /** @description 获取智能审核合同风控模型*/
    getModels() {
      let _this = this
      _this.formKey = _this.getFormKey()
      const param = [{key: 'type_id', value: 'ht'}]
      this.$http
        .post(
          '${form}/form/customQuery/v1/doQuery?alias=syfkmxlb&page=1',
          param
        )
        .then(
          (resp) => {
            if (resp.data.rows) {
              _this.modelList = resp.data.rows
              if (_this.modelList.length > 0) {
                //  默认第一个风控模型为选择的
                _this.currentModelId = _this.modelList[0]['ID_']
                _this.currentModelName = _this.modelList[0]['name']
                _this.changeModel()
              }
            }
          },
          (error) => {
            _this.$message({
              message: '获取风控模型失败！',
              type: 'error',
            })
          }
        )
    },
    /**
     * @description 自动获得上次审核的结果，并在左侧显示上次的进度*/
    getLastExam() {
      let _this = this
      //w  wugq:原来旧的获取上次审核id是Post方法，现在已经更替为get方法，不再需要此参数
      //w const param = [{key: 'REF_ID_', value: _this.contractId}]

      //w
      this.$http
        .get(
          '${bpmRunTime}/eipx7/opun/runtime/ai/v1/contractId?contractId=' +
            _this.contractId
        )
        .then((resp) => {
          //  state为true且taskId有值
          if (resp.data.state && resp.data.value.taskId) {
            //  获取到上次审核的时间以及审核的id
            _this.lastExamTime = resp.data.value.dateTime
            _this.lastExamTaskId = resp.data.value.taskId
            _this.currentModelId = resp.data.value.modelId
            //  选择正确的模型
            _this.changeModel()
            _this.lastExamRuleList = resp.data.value.ruleList
            //  上次计划的任务数量
            let lastPlanNum
            if (_this.lastExamRuleList.length) {
              lastPlanNum = _this.lastExamRuleList.length
            }
            //  提醒用户是否继续未完成的审核结果
            if (_this.lastExamTaskId && _this.dialogExamVisible) {
              _this
                .$confirm('检测到上次审核任务，是否展示审核结果？', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'info',
                })
                .then(() => {
                  _this.resultLoading = true
                  //还原上次选择的规则列表
                  _this.progressData.planNum = _this.lastExamRuleList.length
                  _this.showExamResult = true
                  _this.progressData.completeNum = 0
                  //TODO:这里的代码待优化,其实是求差集
                  _this.ruleList.forEach((m, i) => {
                    if (!_this.lastExamRuleList.includes(m.rule_key)) {
                      _this.$refs.ruleTable.toggleRowSelection(
                        _this.ruleList[i],
                        false
                      )
                    }
                  })
                  // 计划数量
                  _this.taskTimer = setInterval(() => {
                    _this.getExamResult(_this.lastExamTaskId)
                  }, 5000)
                })
                .catch(() => {})
            } else {
              //  TODO：如果用户不继续审核上一次未完成的
            }
          } else {
            //  返回的state为false
            //
          }
        })
      _this.resultLoading = false
    },
    /** @description 经过选择后改变了当前选择的模型*/
    changeModel() {
      let _this = this
      //  错误要素
      _this.textErrorList = []
      //  缺失要素
      _this.missFactorList = []
      // 相对方风险
      _this.oppRiskList = []

      if (this.currentModelId) {
        this.modelList.forEach((item) => {
          if (item.ID_ === _this.currentModelId) {
            _this.currentModelName = item.name
          }
        })
        const param = [{key: 'REF_ID_', value: _this.currentModelId}]

        // 获取得到不同模型的风控规则
        this.$http
          .post(
            '${form}/form/customQuery/v1/doQuery?alias=fkmxgzlb&page=1',
            param
          )
          .then(
            (resp) => {
              if (resp.data.rows) {
                _this.ruleList = resp.data.rows
                _this.progressData.planNum = _this.ruleList.length
                _this.progressData.completeNum = 0
                // 钩子函数在回调后执行
                if (_this.dialogExamVisible == true) {
                  this.$nextTick(function () {
                    _this.ruleList.forEach((row) => {
                      //设置选中
                      this.$refs.ruleTable.toggleRowSelection(row, true)
                    })
                  })
                }
              }
            },
            (error) => {
              _this.$message({
                message: '获取风控模型失败！',
                type: 'error',
              })
            }
          )
      }
    },
    /** @description 确保计划完成数是响应式的
     *
     */
    /**@author ccwgq
     * @description 获取审核的结果
     * @param {string} taskId 任务id
     * */
    getExamResult(taskId) {
      let _this = this
      req
        .get(
          '${bpmRunTime}/eipx7/opun/runtime/ai/v1/examResult?taskId=' + taskId
        )
        .then((resp) => {
          this.resultLoading = true
          if (resp.data.state) {
            let data = resp.data
            _this.progressData.completeNum = data.value.doneRules //   完成的规则数
            if (data.value) {
              _this.resultList = data.value.ruleDetail // 获得审核的具体结果
              //base64转图片
              if (data.value.img) {
                let img = data.value.img
                let arr = img.split(',')
                let mime = 'image/png'
                let bstr = atob(arr[0])
                let n = bstr.length
                let u8arr = new Uint8Array(n)
                while (n--) {
                  u8arr[n] = bstr.charCodeAt(n)
                }
                _this.examResultImg = window.URL.createObjectURL(
                  new Blob([u8arr], {type: mime})
                )
              }
            }
            _this.taskFailCounter = 0 //每次能成功请求审核结果就把失败计数器置零
            //   页面元素渲染
            // let timer1 = setTimeout(() => {
            // _this.showExamResult = false;
            //  结果置空
            _this.textErrorList = []
            _this.missFactorList = []
            _this.oppRiskList = []
            _this.resultList.forEach((rst) => {
              _this.showExamResult = false //处理过程中不展示此次预审的结果
              _this.ruleList.forEach((rule) => {
                // 修改对象属性,使其成为响应式
                if (rule.rule_key == rst.ruleKey) {
                  reactiveKeys.forEach((key) => {
                    if (rule.hasOwnProperty(key)) {
                      _this.$set(rst, key, rule[key])
                    }
                  })
                }
              })
              //为了响应式渲染,不得直接给数组赋值
              if (!rst.isPass) {
                //错误的选项分类处理
                switch (rst.ruleKey) {
                  case 'htwbxy':
                    _this.textErrorList.push(rst)
                    break
                  case 'qsysxxy':
                    _this.missFactorList.push(rst)
                    break
                  case 'xdffx':
                    _this.oppRiskList.push(rst)
                    break
                  default:
                    break
                }
              }
              // 分类好了再去显示审核结果
              _this.showExamResult = true
            })

            _this.resultCounter =
              _this.doneRules === data.value.doneRules
                ? _this.resultCounter + 1
                : 0
          } else {
            // 请求预审失败后就要停止审核
            _this.taskFailCounter++
            _this.resultLoading = false
          }
          if (this.resultCounter === 5) {
            clearInterval(this.taskTimer)
            this.resultLoading = false
            this.resultCounter = 0
            this.$message.warning(
              this.doneRules == 0 ? '未有返回结果' : '剩余结果无法查询'
            )
          }
        })
        .catch((err) => {
          //请求失败计数,连续超过三次清除请求
          _this.taskFailCounter++
        })
        .finally(() => {
          //已完成任务或者出现了异常 || 连续三次失败判定于不可用
          if (
            _this.progressData.completeNum >= _this.progressData.planNum ||
            _this.taskFailCounter > 2
          ) {
            //清除定时器
            clearInterval(_this.taskTimer)
            // 解除按钮加载状态
            _this.resultLoading = false
          }
          if (this.taskFailCounter > 2) {
            this.$message.warning('请求预审失败')
          }
        })
    },
    /**
     * @author lyzcw
     * @description el-scrollbar文档自滚动
     * @param {number} yPos 滚动传入的y轴坐标
     */
    scrollDoc(yPos) {
      //100的偏移量是多次测试得出的一个比较理想的值
      if (typeof yPos === 'number' && yPos >= 0) {
        this.$refs['docSrollbar'].wrap.scrollTop = yPos - 100
      }
    },
    /**
     * @author lyzcw
     * @description 获得当前scrollbar的y轴坐标
     */
    getPos() {
      // console.log(
      //   "return this.$refs['docSrollbar'].wrap.scrollTop：",
      //   this.$refs["docSrollbar"].wrap.scrollTop
      // );
      return this.$refs['docSrollbar'].wrap.scrollTop
    },

    // 关闭弹窗 点击取消按钮后   点击X关闭不调用此函数  并且只有点击按钮才清除数据
    closeDialog() {
      const _this = this
      _this.docPdfSrc = ''
      _this.pageNum = 1
      _this.pageTotalNum = 1
      _this.pageRotate = 0
      _this.loadedRatio = 0
      _this.curPageNum = 0
      //  退出就清除定时器
      _this.examResultImg = null
      clearInterval(_this.taskTimer)
      _this.activeTabName = 'rules'
      _this.resultLoading = false
      _this.progressData.completeNum = 0
      _this.dialogExamVisible = false
      _this.doneRules=0;
    },
    /**展示弹窗的审核结果*/
    showDialogExam() {
      let _this = this
      setTimeout(() => {
        _this.getPdf()
        _this.getModels()
      }, 30)
    },
    //  开始审核
    startExam() {
      //开始预审时防止一些变量不是初始状态
      let _this = this
      this.resultLoading = true
      this.textErrorList = []
      this.oppRiskList = []
      this.missFactorList = []
      //  进度条完成数重置
      this.progressData.completeNum = 0
      this.progressData.planNum = 0
      this.resultCounter = 0
      this.doneRules=0;
      //  计算选择的规则
      _this.handleTableChange()
      if (_this.selectRuleList.length <= 0) {
        _this.$message.error('请至少选择一条审核规则')
        return
      }
      //不显示上次或者已经预审的结果
      _this.showResult = false
      /*//********exam start********** */
      //! 目前由于后台的参数校验还需保留原来单个相对方的参数格式
      let querys = {
        docUrl: _this.docUrl,
        contractId: _this.contractId,
        ourRole: _this.ourParty.role,
        ourParty: _this.ourParty.name,
        oppId: _this.oppQueryList[0].oppId,
        oppName: _this.oppQueryList[0].oppName,
        modelId: _this.currentModelId,
        modelName: _this.currentModelName,
        ruleList: _this.selectRuleList,
        oppList: _this.oppQueryList,
      }
      // 如果非必选参数有值的话，就加入请求
      // /  >>>>>>>>>>>  加入可选参数 >>>>>>>>>>>.
      if (_this.oppQueryList.length && _this.oppQueryList[0].humanName) {
        querys.humanName = _this.humanName
      }
      if (_this.oppQueryList.length && _this.oppQueryList[0].uni_soc_cdt_cd) {
        querys.uni_soc_cdt_cd = _this.uni_soc_cdt_cd
      }
      if (_this.oppQueryList.length && _this.oppQueryList[0].legalPersonName) {
        querys.legalPersonName = _this.legalPersonName
      }
      //图片的宽度
      let width = _this.$refs['leftCard'].$el.offsetWidth - 2
      if (width) {
        querys.width = width
      }
      //  >>>>>>>>>>>  加入可选参数结束 >>>>>>>>>>>>>
      this.resultList = [] //置空上次审核的结果
      _this.progressData.planNum = _this.selectRuleList.length
      _this.$http
        .post('${bpmRunTime}/eipx7/opun/runtime/ai/v1/exam', querys)
        .then((resp) => {
          if (resp.data && resp.data.state) {
            // 请求成功  覆盖上次预审结果id
            _this.currentExamTaskId = resp.data.taskId
            //wugq:  定时器轮询   每5s一次
            _this.progressData.planNum = _this.selectRuleList.length
            if (_this.currentExamTaskId) {
              _this.taskTimer = setInterval(() => {
                _this.getExamResult(_this.currentExamTaskId)
              }, 5000)
            }
          } else {
            //?  原文找不到，状态false 未来可改进
            _this.resultLoading = false
          }
        })
        .catch((err) => {
          _this.resultLoading = false //  请求失败，按钮结束加载状态
        })
      /*********完成审核请求 end******* */
      // 计划完成度  选择多少规则，计划完成的审核数量
    },
    //  页数加载
    pageLoaded(e) {
      this.curPageNum = e
    },
    // vue-pdf发生错误
    pdfError(error) {
      //
    },

    /** 原来的getPdf方法包含了表单的校验和请求pdf,违背代码的单一原则,
     * 拆分为validateData和getPdf
     */
    async getPdf() {
      let _this = this
      let boData = _this.getFormData()
      _this.formKey = _this.getFormKey()
      // 取出对象
      let foData
      //2021-11-23  支持多相对方后实际formKey只会有ht,但是考虑原来的设计，保持不动
      //2022-06-13 新的合同表单 formKey为 htN
      if ( ['ht','htN','htsp'].includes(_this.formKey)) {
        foData = boData.ht
      } else if (_this.formKey === 'htbgN') {
        foData = boData.htbg
      } else {
        foData={}
      }
      //   如果foData不是对象，肯定上面的代码和formKey出了问题
      if (typeof foData !== 'object') {
        //
        _this.$message.error('智能审核错误')
      }
      // 注意模板可有可没有  没有就要使用默认的模板id
      let templateId =
        foData.template_id == null || foData.template_id == ''
          ? `${window.context.defaultTemplateId}`
          : foData.template_id
      // 我方主体
      _this.ourParty.role = foData.role
      //如果一些关键参数不存在就发出警告
      if (!templateId) {
        this.$message({
          message: '请选择合同范本',
          type: 'warning',
        })
        return
      }
      if (!_this.instId) {
        _this.$message({
          message: '请先保存草稿',
          type: 'warning',
        })
        return
      }
      if (!_this.ourParty.role) {
        _this.$message({
          message: '请选择我方主体地位',
          type: 'warning',
        })
        return
      }
      // 我方名称
      _this.ourParty.name = foData.our_nm
      //相对方id
      const oppIdList = foData['sub_htxdf'].map((sub) => sub.id_)
      //  相对方的名称
      const oppNameList = foData['sub_htxdf'].map((sub) => sub.name)
      if (oppIdList.length === 0) {
        this.$message({
          message: '请至少选择一个相对方',
          type: 'warning',
        })
        return
      }
      //相对方存入
      foData['sub_htxdf'].forEach((opp) => {
        _this.oppQueryList.push({
          oppId: opp.id_,
          oppName: opp.name,
          oppRole: opp.role,
          humanName: opp.auth_rep ? opp.auth_rep : '',
          legalPersonName: opp.legal_rep ? opp.legal_rep : '',
          certificateNames: opp.certificate_type_nm
            ? opp.certificate_type_nm
            : '',
          uni_soc_cdt_cd: opp.uni_soc_cdt_cd ? opp.uni_soc_cdt_cd : '',
        })
      })
      // 合同id
      _this.contractId = foData.id_
      // 表单校验完成开始打开预审弹窗
      _this.dialogExamVisible = true
      if (_this.docPdfSrc) {
        return
      }
      //显示加载组件
      _this.pdfLoading = true
      //  获取打印模板的地址url
      // 加载pdf
      let url, res
      url =
        `${window.context.form}/form/printTemplate/v1/wordPrint?` +
        `id=${templateId}&defId=${_this.defId}` +
        `&nodeId=&procInstId=${_this.instId}`
      res = await req.get(url)
      if (!res.data.state) {
        _this.$nextTick(() => {
          _this.pdfLoading = false
        })
        _this.$message.error('智能审核失败')
        return
      }
      url =
        `${window.context.portal}/file/onlinePreviewController/v1/onlinePreview` +
        `?fileId=${res.data.value}`
      res = await _this.$http.get(url)
      let data = res.data
      if (data.result == 'error') {
        _this.$massage.error('附件不存在')
        return
      }
      res = await req.get(
        `${window.context.portal}${data.pdfUrl}`,
        'arraybuffer'
      )
      let type = res.headers['content-type']
      if (type) {
        _this.docPdfSrc = window.URL.createObjectURL(
          new Blob([res.data], {type: type})
        )
      } else {
        _this.docPdfSrc = window.URL.createObjectURL(new Blob([res.data]))
      }
      //pdf加载
      _this.docUrl = window.context.portal + data.pdfUrl
      var loadingTask = pdf.createLoadingTask(_this.docPdfSrc)
      loadingTask
        .then((pdf) => {
          _this.docPdfSrc = loadingTask
          _this.numPages = pdf.numPages
        })
        .catch((err) => {
          _this.$message.error('pdf加载失败')
          //
        })
      // loadingInstance.close()
      _this.pdfLoading = false
      _this.getLastExam()
    },
    /**  初始化函数,调用表单校验,获取pdf等功能 */
    _initVm() {},
    /**  校验从表单中获取的数据是否满足预期
     * @return Boolean
     */
    validateData() {
      let _this = this
      let boData = _this.getFormData()
      // 取出期望的对象
      let foData
      //2021-11-23  支持多相对方后实际formKey只会有ht,但是考虑原来的设计，保持不动
       //2022-06-13 新的合同表单 formKey为 htN
      if ( ['ht','htN','htsp'].includes(_this.formKey)) {
        foData = boData.ht
      } else if (_this.formKey === 'htbgN') {
        foData = boData.htbg
      } else {
        foData={}
      }
      //   如果foData不是一个对象，肯定是上面的代码和formKey出了问题
      if (typeof foData !== 'object') {
        //
        _this.$message.error('审核错误')
      }
      // 注意模板可有可没有  没有就要使用默认的模板id(sso.js)
      let templateId =
        foData.template_id == null || foData.template_id == ''
          ? `${window.context.defaultTemplateId}`
          : foData.template_id
      // 我方主体
      _this.ourParty.role = foData.role
      //如果一些关键参数不存在就发出警告
      if (!templateId) {
        this.$message({
          message: '请选择合同范本',
          type: 'warning',
        })
        return
      }
      if (!_this.instId) {
        _this.$message({
          message: '请先保存草稿',
          type: 'warning',
        })
        return
      }
      if (!_this.ourParty.role) {
        _this.$message({
          message: '请选择我方主体地位',
          type: 'warning',
        })
        return
      }
      // 我方名称
      _this.ourParty.name = foData.our_nm
      //相对方id
      const oppIdList = foData['sub_htxdf'].map((sub) => sub.id_)
      //  相对方的名称
      const oppNameList = foData['sub_htxdf'].map((sub) => sub.name)
      if (oppIdList.length === 0) {
        this.$message({
          message: '请至少选择一个相对方',
          type: 'warning',
        })
        return
      }
      //相对方存入
      foData['sub_htxdf'].forEach((opp) => {
        _this.oppQueryList.push({
          oppId: opp.id_,
          oppName: opp.name,
          oppRole: opp.role,
          humanName: opp.auth_rep ? opp.auth_rep : '',
          legalPersonName: opp.legal_rep ? opp.legal_rep : '',
          certificateNames: opp.certificate_type_nm
            ? opp.certificate_type_nm
            : '',
          uni_soc_cdt_cd: opp.uni_soc_cdt_cd ? opp.uni_soc_cdt_cd : '',
        })
      })
      // 合同id
      _this.contractId = foData.id_
      // 表单校验完成开始打开预审弹窗
      _this.dialogExamVisible = true
      //
      if (_this.docPdfSrc) {
        return
      }
    },
    /** TODO:获取pdf,替换原来复杂的getPdf */
    async getPdf2() {},

    //* progress start */

    // 进度条显示的文字
    setProgressText(row) {
      return () => {
        return row.completeNum + '/' + row.planNum
      }
    },
    // 进度条显示的状态
    setProgressStatus(data) {
      if (data.planNum > data.completeNum) {
        return 'exception'
      } else if (data.planNum == data.completeNum) {
        return 'success'
      } else {
        return 'warning'
      }
    },
    /* //*  progress end */
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
  .ouai__dialog {
    /* height: calc(100%-0px); */
    background: $--color-white;
    margin: 0 !important; // 改为全屏显示
    padding: 0px 10px 10px 10px !important; /* padding: 10px */
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
      padding-bottom: 0px;
    }
  }
}

.rule-table {
  width: 100%;
  padding: 10px 0px !important;
}

.el-card /deep/ {
  .el-card__body {
    padding: 0px 10px 10px 10px;
    overflow-x: hidden;
  }
  .el-card__footer {
    height: 0px !important;
  }
}

.el-card__right {
  position: relative;
}

.right-button {
  position: absolute;
  right: 10px;
  bottom: 10px;
  height: 33px;
}

/deep/ .el-scrollbar__wrap {
  overflow-x: hidden;
  margin: 10px;
}

>>> label.el-checkbox-horizontal {
  margin: 5px 5px 0 0;
}
.ht_ce {
  margin-top: -10px !important;
}

.flowOther-height {
  height: calc(100% - 20px);
  overflow: hidden;
  margin: 10px;
}

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

.other-set__table th,
div.el-card__header {
  background: #f9f9f9;
}

.other-set__table th,
.other-set__table td {
  padding: 8px 15px !important;
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
