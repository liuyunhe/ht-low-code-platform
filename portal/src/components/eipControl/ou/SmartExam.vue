<template>
  <el-dialog
    title="智能审核"
    :visible.sync="dialogVisible"
    width="98.5%"
    append-to-body
    custom-class="ouai__dialog"
    @close="closeDialog"
  >
    <el-row :gutter="10">
      <!-- 待审核的文档 -->
      <el-col :span="16">
        <!-- TODO:样式加入 -->
        <el-card
          v-loading="pdfLoading"
          element-loading-text="pdf加载中..."
          class="left-card"
          ref="leftCard"
        >
          <div slot="header" class="clearfix">
            <span style="position: absolute; right: 20px; top: 8px">
              <file-upload-sample
                ref="fileUploadSample"
                @updateShowDocPdf="updateShowDocPdf"
                @updateShowDocImg="updateShowDocImg"
                @updateDocPdfSrc="updateDocPdfSrc"
                @updateDocImgSrc="updateDocImgSrc"
                @updateNumPages="updateNumPages"
              ></file-upload-sample
            ></span>
            <span>合同文本：{{ docPdfUrl }}</span>
          </div>
          <el-scrollbar
            ref="docSrollbar"
            :style="{height: dialogHeight - 170 + 'px'}"
          >
            <!--  先请求pdf,预审结果返回图片并覆盖方便定位  -->
            <div @click="getPos()" v-if="examResultImg" class="pdf-container">
              <img :src="examResultImg" alt="" />
            </div>
            <div @click="getPos()" v-else-if="docPdfUrl" class="pdf-container">
              <pdf
                style="margin-top: 40px"
                ref="docPdf"
                :src="docPdfUrl"
                v-for="i in doc.total"
                :page="i"
                :key="i"
                :rotate="doc.rotate"
                @page-loaded="pageLoaded($event)"
                @error="pdfError($event)"
              ></pdf></div
          ></el-scrollbar>
        </el-card>
      </el-col>
      <!-- 审核结果 -->
      <el-col :span="8">
        <el-card class="right-card">
          <div slot="header" class="clearfix">
            <span>预审结果：</span>
          </div>
          <div class="panel-heading" v-if="false">
            <el-button
              @click="openFormDialog"
              size="mini"
              icon="el-icon-plus"
              round
            >
              新增合同相对方
            </el-button>
          </div>
          <div class="panel-heading" style="padding: 8px">
            <span>风控模型：</span>
            <ht-select
              size="small"
              v-model="currentModelId"
              :options="modelList"
              filterable
              @change="changeModel"
              :permission="resultLoading ? 'r' : 'w'"
            >
              <template>
                <el-option
                  v-for="item in modelList"
                  :key="item.ID_"
                  :label="item.name"
                  :value="item.ID_"
                ></el-option>
              </template>
            </ht-select>
          </div>
          <div v-if="!!lastExamTime" class="panel-heading" style="padding: 8px">
            <span>上次审核时间：{{ lastExamTime }}</span>
          </div>
          <el-scrollbar ref="rightScroll" :style="{height: rightHeight + 'px'}">
            <div>
              <!-- TODO:最上方的分类统计 -->
              <div
                class="panel-heading"
                v-if="ruleList && ruleList.length >= 0"
                style="padding: 8px"
              >
                <b
                  >模型审核项目：<span style="color: #409eff">
                    ( {{ ruleList.length || 0 }} )</span
                  ></b
                >
              </div>
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
        </el-card>
      </el-col>
    </el-row>
    <!-- 底部按钮 -->
    <div slot="footer">
      <el-button-group>
        <el-button
          type="danger"
          @click="closeDialog()"
          :disabled="!taskTimer"
          round
          >取消</el-button
        >
        <!-- 是否处于加载中状态  -->
        <el-button
          type="primary"
          :disabled="!showDocPdf && !showDocImg"
          :loading="resultLoading"
          @click="startExam()"
          round
          >预审</el-button
        >
      </el-button-group>
    </div>
  </el-dialog>
</template>

<script>
import ai from '@/api/ou/aiServer'
import fileUploadSample from '@/components/common/fileUploadSample'
import pdf from 'vue-pdf'
import AiExamIcon from '@/components/eipControl/ou/AiExamIcon'
import dialogHeight from './dialog_height'
//定义一组需要设置为响应式的属性
const reactiveKeys = ['name', 'type_id', 'notes']
export default {
  name: 'SmartExam',
  components: {
    fileUploadSample,
    pdf,
    AiExamIcon,
  },
  mixins: [dialogHeight],
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      docPdfUrl: '', //文档PDf路径,
      docImgUrl: '', //文档图片路径,
      docObj: null,
      showDocPdf: false,
      showDocImg: false,
      /**选择的规则*/
      selectRuleList: [],
      /**历史审核时选择的规则*/
      oldSelectRuleList: [],
      /**从接口拿回的模型列表*/
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
      resultCounter: 0, //审核结果计数器，为了实现连续为空自动中断审核
      //  文档信息
      doc: {
        total: 1, //总页数
        current: 1, //当前页数
        rotate: 0, //文档旋转角度
        loadedRatio: 0, //加载进度
        loadingPages: 0,
      },
      // 预审按钮的是否处于按钮的加载状态
      resultLoading: false,
      // 进度条
      progressData: {
        planNum: 0, //计划审核的数量
        completeNum: 0, //实际完成的数量
        color: ['#1bf8f3', '#3196e8', '#feb046', '#e8484f', '#9174e4'],
      },
      showExamResult: false,
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
      doneRules: 0,
      // visibleHeight: parseInt($(document.documentElement).innerHeight()) || 500
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', false)
      },
    },
    rightHeight() {
      let gap = 0
      if (this.showExamResult || this.resultLoading) {
        gap = 27
      }
      return this.dialogHeight - 165 - 53 - gap
    },
    percentage() {
      let val = this.progressData.completeNum / this.progressData.planNum
      if (isNaN(val) || val == 0) {
        return 0
      } else return parseFloat(Number(val * 100).toFixed(2))
    },
  },
  watch: {
    'resultList.length': function (val) {},
    docPdfUrl: function (val) {
      if (!!val && this.$refs.docPdf && this.$refs.docPdf.$forceUpdate) {
        this.$refs.docPdf.$forceUpdate()
      }
    },
    //连续五次清空计数器
    resultCounter: function (val) {
      if (val === 5) {
        clearInterval(this.taskTimer)
        this.resultLoading = false
        this.$message.warning('未有返回结果')
      }
    },
  },
  mounted() {
    this.getModels()
    // window.addEventListener('resize', this.computeHeight)
  },
  methods: {
    // computeHeight() {
    //   this.dialogHeight =
    //     parseInt($(document.documentElement).innerHeight()) || 500
    // },
    /* upload components callbacks start!*/
    updateShowDocPdf(nVal) {
      this.showDocPdf = nVal
    },
    updateShowDocImg(nVal) {
      this.showDocImg = nVal
    },
    updateDocPdfSrc(task, url) {
      this.docObj = task
      this.docPdfUrl = url
    },
    updateDocImgSrc(task, url) {
      this.docObj = task
      this.docImgUrl = url
    },
    updateNumPages(nVal) {
      this.doc.total = nVal
    },
    /* upload components callbacks end!*/
    closeDialog() {
      // console.log('关闭对话框====》')
      const origanData = this.$options.data()
      const keys = [
        'selectRuleList',
        'docPdfUrl',
        'docImgUrl',
        'showDocPdf',
        'showDocImg',
        'progressData',
        'resultLoading',
        'resultList',
        'activeTabName',
        'examResultImg',
        'showExamResult',
        'dialogVisible',
        'doneRules',
      ]
      keys.forEach((key) => {
        key in origanData && (this[key] = origanData[key])
      })
      // this.selectRuleList = origanData.selectRuleList
      // this.docPdfUrl = origanData.docPdfUrl
      // this.docImgUrl = origanData.docImgUrl
      // this.showDocPdf = origanData.showDocPdf
      // this.showDocImg = origanData.showDocImg
      // this.progressData = origanData.progressData
      // this.resultLoading = origanData.resultLoading
      // this.resultList = origanData.resultList
      // this.activeTabName = origanData.activeTabName
      // this.examResultImg = ''
      // this.showExamResult = false
      clearInterval(this.taskTimer)
      // this.dialogVisible = false
    },
    /**滚动文档*/
    scrollDoc(yPos) {
      this.$refs['docSrollbar'].wrap.scrollTop = yPos - 100
    },
    /** @description 获取智能审核合同风控模型*/
    getModels() {
      ai.getRiskModels((data) => {
        if (data.rows && data.rows.length > 0) {
          const rows = data.rows
          this.modelList = rows
          this.currentModelId = rows[0]['ID_']
          this.currentModelName = rows[0]['name']
          this.changeModel()
        } else {
          this.$message.error('获取风控模型失败')
        }
      })
    },
    //改变当前的风控模型
    changeModel(val) {
      val = val || this.currentModelId
      //错误要素和缺失要素置空
      //  错误要素
      this.textErrorList = []
      //  缺失要素
      this.missFactorList = []

      const obj = this.modelList.find(function (item) {
        return item.ID_ == val
      })
      this.currentModelName = obj.name
      ai.getModelRulesById(this.currentModelId, (data) => {
        if (data.rows) {
          this.ruleList = data.rows
          this.progressData.planNum = this.ruleList.length
          this.progressData.completeNum = 0
          if (this.visible == true) {
            this.$nextTick(function () {
              this.ruleList.forEach((row) => {
                //设置选中
                this.$refs.ruleTable.toggleRowSelection(row, true)
              })
            })
          }
        } else {
          //
        }
      })
    },
    /**@author ccwgq
     * @description 获取审核的结果
     * @param {string} taskId 任务id
     * */
    getExamResult(taskId) {
      ai.getExamResultByTaskId(
        taskId,
        (data) => {
          if (data.state && data.value) {
            //错误计数器置零
            this.taskFailCounter = 0
            this.resultList = data.value.ruleDetail
            // this.doneRules=data.value.doneRules;
            if (this.resultList.length > 0) {
              this.activeTabName = 'result'
            }
            this.resultCounter =
              this.doneRules === data.value.doneRules
                ? this.resultCounter + 1
                : 0
            //进度条
            if (this.resultList.length >= 0) {
              this.progressData.completeNum = this.resultList.length
            }
            //图片的base64处理
            if (!!data.value.img) {
              this.examResultImg = this.base2Image(data.value.img)
            }
            //列表置空
            this.textErrorList = []
            this.missFactorList = []
            this.showExamResult = false
            this.doneRules = data.value.doneRules
            this.resultList.forEach((rst) => {
              this.ruleList.forEach((rule) => {
                if (rule.rule_key == rst.ruleKey) {
                  reactiveKeys.forEach((key) => {
                    if (rule.hasOwnProperty(key)) {
                      this.$set(rst, key, rule[key])
                    }
                  })
                }
              })
              //为了响应式渲染,不得直接给数组赋值
              if (!rst.isPass) {
                //错误的选项分类处理
                switch (rst.ruleKey) {
                  case 'htwbxy':
                    this.textErrorList.push(rst)
                    break
                  case 'qsysxxy':
                    this.missFactorList.push(rst)
                    break
                  case 'xdffx':
                    // this.oppRiskList.push(rst)
                    //以后有需要再说
                    break
                  default:
                    break
                }
              }
            })
            // 分类好了再去显示审核结果
            this.showExamResult = true
          } else {
            //请求失败
            this.taskFailCounter++
            this.resultLoading = false
          }
          if (this.resultCounter === 5) {
            clearInterval(this.taskTimer)
            this.resultLoading = false
            this.resultCounter = 0
            this.$message.warning(
              this.doneRules == 0 ? '未有返回结果' : '剩余结果无法查询'
            )
          }
        },
        () => {
          if (
            this.progressData.completeNum >= this.progressData.planNum ||
            this.taskFailCounter > 2
          ) {
            //清除定时器
            clearInterval(this.taskTimer)
            // 解除按钮加载状态
            this.resultLoading = false
          }
          if (this.taskFailCounter > 2) {
            this.$message.error('请求审核失败')
          }
        }
      )
    },
    /**
     * @author lyzcw
     * @description 获得当前scrollbar的y轴坐标
     */
    getPos() {
      return this.$refs['docSrollbar'].wrap.scrollTop
    },
    //ccwgq 开始审核
    startExam() {
      let width = 700 //返回结果的图片的宽度
      //  计算选择的规则
      this.handleTableChange()
      if (this.selectRuleList.length <= 0) {
        this.$message.error('请至少选择一条审核规则')
        return
      }
      this.resultLoading = true
      this.textErrorList = []
      this.oppRiskList = []
      this.missFactorList = []
      this.resultList = []
      //  进度条完成数重置
      this.progressData.completeNum = 0
      this.progressData.planNum = 0
      this.showExamResult = false
      const params = {
        docUrl: this.docPdfUrl,
        ruleList: this.selectRuleList,
      }
      this.doneRules = 0
      ai.commonSmartExam(params, (data) => {
        if (data.state) {
          this.currentExamTaskId = data.taskId
          this.progressData.planNum = this.selectRuleList.length
          if (!!this.currentExamTaskId) {
            this.taskTimer = setInterval(() => {
              this.getExamResult(this.currentExamTaskId)
            }, 5000)
          }
        } else {
          //审核失败
        }
      })
    },
    handleTableChange(selection) {
      this.selectRuleList = [] //清空选中的规则
      //重新计算这个值
      if (this.$refs.ruleTable.selection.length > 0) {
        this.$refs.ruleTable.selection.forEach((m, i) => {
          this.selectRuleList.push(m.rule_key)
        })
      }
    },
    //  页数加载
    pageLoaded(e) {
      this.curPageNum = e
    },
    // vue-pdf发生错误
    pdfError(error) {
      console.log(error)
    },
    //* progress start */

    // 进度条显示的文字
    setProgressText(row) {},
    // 进度条显示的状态
    setProgressStatus(data) {},
    openFormDialog() {
      this.formData = this.$options.data().formData
      this.formDialog = true
    },
    base2Image(data) {
      let arr = data.split(',')
      let mime = 'image/png'
      let bstr = atob(arr[0])
      let n = bstr.length
      let u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return window.URL.createObjectURL(new Blob([u8arr], {type: mime}))
    },
  },
  beforeDestroy() {
    //销毁组件前清除定时器
    clearInterval(this.taskTimer)
    // window.removeEventListener('resize', this.computeHeight)
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
      height: auto;
      padding-bottom: 5px;
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
  // margin: 0 10px;
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
.left-card {
  /deep/ .el-card__header {
    position: relative;
  }
}
</style>
