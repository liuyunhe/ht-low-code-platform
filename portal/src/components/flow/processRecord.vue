<template>
  <div style="background: #fff; padding: 20px">
    <div class="record-container"><span>处理记录</span></div>
    <div class="record-content">
      <el-table
        :data="processData"
        :row-key="getRowKeys"
        style="width: 100%"
        border
        header-cell-class-name="done-header-row"
        row-class-name="done-row"
        :span-method="objectSpanMethod"
        size="medium"
      >
        <!-- <el-table-column width="70" align="center" label="序号">
          <template slot-scope="scope">
            <span>{{ scope.$index + 1 }}</span>
          </template>
        </el-table-column> -->
        <el-table-column
          prop="Nosort"
          width="70"
          label="序号"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="taskName"
          label="节点名"
          width="200"
          align="center"
          show-overflow-tooltip
        ></el-table-column>

        <!-- <el-table-column
          prop="qualfiedNames"
          label="待审批人"
          show-overflow-tooltip
          width="110"
          align="center"
        >
          <template slot-scope="{row}">
            <span
              v-if="
                row.status != 'awaiting_check' &&
                qualfiedsName(row.qualfiedNames, true) < 2
              "
              >{{ row.qualfiedNames }}</span
            >
            <span
              v-if="
                row.status === 'awaiting_check' &&
                row.qualfieds &&
                row.qualfieds.length === 1 &&
                !row.qualfieds[0].users
              "
              >{{ row.qualfiedNames }}</span
            >
            <el-popover
              placement="right"
              popper-class="right-popover"
              trigger="hover"
              v-if="
                row.status == 'awaiting_check' ||
                qualfiedsName(row.qualfiedNames, true) > 1
              "
            >
              <div>
                <p class="qualfied_names">名称</p>
                <div
                  class="btn__wrap"
                  v-if="isQualfiedListHasUser(row.qualfieds)"
                >
                  <p v-for="(item, index) in row.qualfieds" :key="index">
                    <el-tooltip
                      class="item"
                      effect="light"
                      placement="top"
                      v-if="item.users"
                      :content="item.users"
                    >
                      <el-button plain size="mini">{{ item.name }}</el-button>
                    </el-tooltip>
                    <el-button v-if="!item.users" plain size="mini">{{
                      item.name
                    }}</el-button>
                  </p>
                </div>
                <div class="btn__wrap" v-else>
                  <p
                    v-for="(item, index) in qualfiedsName(
                      row.qualfiedNames,
                      false
                    )"
                    :key="index"
                  >
                    <el-button plain size="mini">{{ item }}</el-button>
                  </p>
                </div>
              </div>
              <i
                class="el-icon-more qualfied-more__icon"
                slot="reference"
                v-if="
                  isQualfiedListHasUser(row.qualfieds) ||
                  qualfiedsName(row.qualfiedNames, true) > 1
                "
              ></i>
            </el-popover>
          </template>
        </el-table-column> -->

        <el-table-column
          label="处理人名"
          width="120"
          align="center"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div>
              {{
                scope.row.auditorName == null || scope.row.auditorName == ''
                  ? scope.row.qualfiedNames
                  : scope.row.auditorName
              }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="操作状态"
          width="140"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <!-- <span
              v-if="scope.row.isRead == 0 && scope.row.statusVal == '待审批'"
              >抄送</span
            >
            <span
              v-if="scope.row.isRead == 1 && scope.row.statusVal == '待审批'"
              >入库</span
            >
            <span v-if="scope.row.statusVal != '待审批'">{{
              scope.row.statusVal
            }}</span> -->
            <span
              v-if="scope.row.completeTime == null || scope.row.completeTime == ''"
              >未查看</span
            >
            <span
              v-if="
                scope.row.completeTime !== null &&
                  getStatusByStatusStr(scope.row.status) == 10
              "
              >已查看</span
            >
            <span
              v-if="
                scope.row.completeTime !== null &&
                  getStatusByStatusStr(scope.row.status) == 20
              "
              >已处理</span
            >
          </template>
        </el-table-column>

        <!-- <el-table-column label="处理意见" show-overflow-tooltip align="center">
          <template slot-scope="scope">
            <strong
              ><span style="white-space: pre-wrap">{{
                scope.row.opinion
              }}</span></strong
            >
            <br />
            <div
              class="div_fj"
              v-if="scope.row.files && scope.row.files.length != 0"
            >
              <div class="title">附件：</div>
              <div
                v-for="(item, index) in scope.row.files"
                :key="index"
                style="cursor: pointer"
              >
                <el-tag @click="search(item)">{{ item.name }}</el-tag>
              </div>
            </div>
            <br />
            <div
              class="div_fj"
              v-if="scope.row.zfiles && scope.row.zfiles.length != 0"
            >
              <span class="title">正文：</span>
              <span
                style="float: left"
                v-for="(item, index) in scope.row.zfiles"
                :key="index"
              >
                <span v-if="index == 0">
                  <span class="files fj_right" @click="search(item)">{{
                    item.name
                  }}</span>
                  <br />
                </span>
                <span v-if="index != 0">
                  <span class="files fj_left" @click="search(item)">{{
                    item.name
                  }}</span>
                  <br />
                </span>
              </span>
            </div>
          </template>
        </el-table-column> -->
        <el-table-column
          prop="createTime"
          label="任务接收时间"
          width="170"
          align="center"
          show-overflow-tooltip
        ></el-table-column>

        <el-table-column
          prop="completeTime"
          label="操作时间"
          width="200"
          align="center"
          show-overflow-tooltip
        >
        </el-table-column>

        <el-table-column
          align="center"
          label="耗时"
          width="120"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>{{ formatTimeLag(scope.row) }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column label="操作" width="90" align="center">
            <template slot-scope="scope">
                <el-button v-if="scope.row.formData && scope.row.status != 'awaiting_check'" @click="previewNodeForm(scope.row)" >表单</el-button>
            </template>
        </el-table-column> -->
      </el-table>
    </div>

    <el-dialog
      :visible.sync="previewNodeFormDialogVisible"
      :title="opinionTaskName + '-审批表单'"
      width="80%"
      :close-on-click-modal="false"
      :before-close="closeFromDialog"
    >
      <DoneFormContent
        ref="doneFormContent"
        v-if="opinionSelectNodeId"
        :instId="opinionInstId"
        :nodeId="opinionSelectNodeId"
        :taskId="opinionTaskId"
        :defId="opinionProcDefId"
        :pData="opinionFormData"
      />
      <br />
    </el-dialog>

    <!-- 预览文件-->
    <FilePreview ref="filePreview" />
  </div>
</template>
<script>
import {mapState, mapActions} from 'vuex'
import req from '@/request.js'
import FilePreview from '@/components/common/FilePreview.vue'
import DoneFormContent from '@/components/flow/doneFormContent.vue'
import {Base64} from 'js-base64'
export default {
  name: 'processRecord',
  components: {FilePreview, DoneFormContent},
  props: {
    instId: String,
    taskId: String,
    referOpinion: Boolean,
    nodeType: String,
    defId: String,
    nodeId: String,
    myReadType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      src: '',
      data: {taskId: '', referOpinion: false},
      fileId: '',
      fileTree: '',
      // 获取row的key值
      getRowKeys(row) {
        return row.id
      },
      previewNodeFormDialogVisible: false,
      opinionSelectNodeId: '',
      opinionInstId: '',
      opinionTaskId: '',
      opinionFormData: '',
      opinionTaskName: '',
      opinionProcDefId: '',
      spanArr: [],
      pos: 0,
      isInitData: false,
      //未查看状态数组
      // 待反馈、征询
      notViewStatusArr: ['awaiting_feedback', 'inqu'],
      //已查看状态数组
      //加签、发起沟通、弃权、重新提交、驳回取消、被撤回、通过取消、不通过取消、流转、转办任务、转办任务回收、人工终止、终止恢复、传阅回复、征询、共享、征询回复、并行审批、发起并行签署、发起顺序签署、发起并行签署、签收、取消签收、办结撤回、委托
      viewedStatusArr: [
        'addsign',
        'start_commu',
        // 'awaiting_feedback',
        'abandon',
        'reSubmit',
        'signBackCancel',
        'signRecoverCancel',
        'retracted',
        'signLineRetracted',
        'passCancel',
        'notPassCancel',
        'transforming',
        'deliverto',
        'deliverto_cancel',
        'manual_end',
        'renew_end',
        'copyto',
        'copyto_reply',
        // 'inqu',
        'SHAER',
        'inqu_reply',
        'approveLineing',
        'signSequenceing',
        'signLineing',
        'lockTask',
        'unLockTask',
        'end_revoke',
        'AGENT'
      ],
      //已处理状态数组
      //同意、提交、加签反馈、反对、驳回、驳回发起人、撤回、撤销流转、撤回发起人、会签通过、会签不通过、转办同意、转办反对、流转同意、流转反对、加签同意、加签反对、跳过执行、结束、已反馈、并行审批同意、并行审批反对、顺序签署同意、顺序签署反对、并行签署同意、并行签署反对、
      processedStatusArr: [
        'start',
        'agree',
        'user_add_sign_back',
        'oppose',
        'reject',
        'backToStart',
        'revoker',
        'transRevoker',
        'revoker_to_start',
        'signPass',
        'signNotPass',
        'delivertoAgree',
        'delivertoOppose',
        'transAgree',
        'transOppose',
        'addsignAgree',
        'addsignOppose',
        'skip',
        'end',
        'feedback',
        'approveLineAgree',
        'approveLineOppose',
        'signSequenceAgree',
        'signSequenceOppose',
        'signLineAgree',
        'signLineOppose'
      ]
    }
  },
  watch: {
    instId: function(newVal, oldVal) {
      this.data.instId = newVal //newVal即是instId
      this.data.taskId = this.taskId
      this.data.referOpinion = this.referOpinion
      this.data.nodeType = this.nodeType
      this.data.defId = this.defId
      this.data.nodeId = this.nodeId
      if (this.myReadType === 'request') {
        this.data.isRequest = true
      }
      this.$store.dispatch('storeProcess/getOpinionsById', this.data)
    }
  },
  computed: mapState({
    // opinions: state => state.storeProcess.opinions,
    processData(state) {
      var s = state.storeProcess.opinions
      let keys = [] // 唯一值的数组
      if (s.length > 0) {
        s.forEach((item, index) => {
          if (!keys.includes(item.taskKey)) {
            keys.push(item.taskKey)
          }
        })
        console.log(keys)
        let temp = []
        keys.forEach(item => {
          // 将同一名称的数据放在相邻位置
          s.forEach(cell => {
            if (item == cell.taskKey) {
              temp.push(cell)
            }
          })
        })
        //***************************************** */
        for (let i = 0; i < temp.length; i++) {
          temp[i].num = i + 1
        }
        s = JSON.parse(JSON.stringify(temp))
        this.getSpanArr(s)
        return s
      }
    }
  }),

  methods: {
    // 2022-09-14:yigz 根据状态标识统一定义操作状态
    getStatusByStatusStr(statusStr) {
      let status = false
      if (this.viewedStatusArr.indexOf(statusStr) != -1) {
        status = 10
      }
      if (this.processedStatusArr.indexOf(statusStr) != -1) {
        status = 20
      }
      if (this.notViewStatusArr.indexOf(statusStr) != -1) {
        status = 30
      }
      return status
    },


    objectSpanMethod({row, column, rowIndex, columnIndex}) {
      // this.getSpanArr(this.abc)
      if (columnIndex === 0 || columnIndex === 1) {
        // 对前三列进行操作
        const _row = this.spanArr[rowIndex] // 合并行数
        const _col = _row > 0 ? 1 : 0 // 合并列数，1：不改变，0：被消除
        return {
          rowspan: _row,
          colspan: _col
        }
      } else {
        return {
          rowspan: 1,
          colspan: 1
        }
      }
      // if (!this.isInitData) {
      //   this.spanArr = []
      //   this.pos = 0
      //   this.getSpanArr(this.opinions)
      //   this.isInitData = true
      // }
      // if (columnIndex === 1) {
      //   const _row = this.spanArr[rowIndex]

      //   const _col = _row > 0 ? 1 : 0
      //   return {
      //     rowspan: _row,
      //     colspan: _col
      //   }
      // } else {
      //   return {
      //     rowspan: 0,
      //     colspan: 0
      //   }
      // }
    },
    getSpanArr(data) {
      let position // 当前合并的行位置（连续相同名称的第一条数据位置）
      this.spanArr = []
      data.forEach((item, index) => {
        if (index === 0) {
          // 第一行， 不进行处理
          this.spanArr.push(1)
          position = 0
        } else {
          if (
            data[index].taskKey === data[index - 1].taskKey ||
            data[index].num === data[index - 1].num
          ) {
            // 当条数据跟上一条数据名称相同，要合并
            this.spanArr[position] += 1 // 首条相同名称行合并行数增加
            this.spanArr.push(0) // 当前行消除
          } else {
            // 不需要处理的数据
            this.spanArr.push(1)
            position = index
          }
        }
      })
      // 表格序号
      let Nosort = 0
      let _this = this
      for (let n in _this.spanArr) {
        if (_this.spanArr[n] > 0) {
          Nosort += 1
          _this.$set(data[n], 'Nosort', Nosort)
        }
      }
      // for (var i = 0; i < data.length; i++) {
      //   if (i === 0) {
      //     this.spanArr.push(1)
      //     this.pos = 0
      //   } else {
      //     // 判断当前元素与上一个元素是否相同
      //     if (
      //       data[i].taskName != '' &&
      //       data[i - 1].taskName != '' &&
      //       data[i].taskName == data[i - 1].taskName
      //     ) {
      //       this.spanArr[this.pos] += 1
      //       this.spanArr.push(0)
      //     } else {
      //       this.spanArr.push(1)
      //       this.pos = i
      //     }
      //   }
      // }
    },

    qualfiedsName(names, isLength) {
      if (names && isLength) {
        return names.split(',').length
      }
      if (names && !isLength) {
        return names.split(',')
      }
    },
    isQualfiedListHasUser(data) {
      if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
          if (data[i].users) {
            return true
          }
        }
        return false
      }
    },
    closeFromDialog() {
      this.previewNodeFormDialogVisible = false
      this.opinionSelectNodeId = ''
      this.opinionInstId = ''
      this.opinionTaskId = ''
      this.opinionFormData = ''
      this.opinionTaskName = ''
    },
    previewNodeForm(row) {
      this.previewNodeFormDialogVisible = true
      this.opinionSelectNodeId = row.taskKey
      this.opinionInstId = row.procInstId
      this.opinionTaskId = row.taskId
      this.opinionProcDefId = row.procDefId
      this.opinionTaskName = row.taskName
      this.opinionFormData = JSON.parse(Base64.decode(row.formData))
    },
    //查看附件
    formatTimeLag(row) {
      let endTimes = 0
      if (!row.completeTime) {
        endTimes = new Date().getTime()
      } else {
        endTimes = new Date(row.completeTime).getTime()
      }
      let difference = endTimes - new Date(row.createTime).getTime()
      let r = ''
      ////计算出相差天数
      let days = Math.floor(difference / (24 * 3600 * 1000))
      //计算出小时数
      let leave1 = difference % (24 * 3600 * 1000) //计算天数后剩余的毫秒数
      let hours = Math.floor(leave1 / (3600 * 1000))
      //计算相差分钟数
      let leave2 = leave1 % (3600 * 1000) //计算小时数后剩余的毫秒数
      let minutes = Math.floor(leave2 / (60 * 1000))
      //计算相差秒数
      let leave3 = leave2 % (60 * 1000) //计算分钟数后剩余的毫秒数
      let seconds = Math.round(leave3 / 1000)
      if (days > 0) r += days + '天'
      if (hours > 0) r += hours + '小时'
      if (days > 0) {
        return r
      }
      if (minutes > 0) r += minutes + '分钟'
      if (hours > 0) {
        return r
      }
      if (seconds > 0) r += seconds + '秒'
      if (minutes == 0 && seconds >= 0) {
        return '小于1分钟'
      }
      //r.slice(0, r.indexOf('时'));
      return r
    },
    search(item) {
      this.$refs.filePreview.preview(item)
    },
    getOpinion(opinion) {
      return Base64.decode(opinion)
    }
  },
  created() {
    if (this.instId) {
      this.data.instId = this.instId
      this.data.taskId = this.taskId
      this.data.referOpinion = this.referOpinion
      this.data.nodeType = this.nodeType
      this.data.defId = this.defId
      this.data.nodeId = this.nodeId
      // this.handleData()
      //类型为我的请求时添加参数isRequest进行过滤
      if (this.myReadType === 'request') {
        this.data.isRequest = true
      }
      this.$store.dispatch('storeProcess/getOpinionsById', this.data)
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
.div_fj {
  text-align: left;
  padding: 5px 0px;
}

.fj_left {
  padding: 0 15px;
  border-left: 1px solid #d8d8d8;
}

.fj_right {
  padding: 0 15px 0 0;
}

.title {
  display: block;
  color: #a2a2a2;
  font-weight: bold;
}

.record-container {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.record-container > span {
  border-left: 3px solid $--theme-color;
  font-weight: bold;
  font-size: 14px;
  padding-left: 10px;
  color: #666;
}

.record-content {
  padding: 20px 0;
}

.files {
  cursor: pointer;
  font-size: 12px;
  color: #5eade6;
}

.files:hover {
  color: $--theme-color;
}

/deep/.el-table .cell.el-tooltip {
  min-width: 50px;
}

/deep/.el-table .cell {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: break-all;
  line-height: 23px;
  padding-left: 10px;
  padding-right: 10px;
}
/deep/.owner-span {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.btn__wrap {
  display: flex;
  flex-wrap: wrap;
  p {
    margin: 0;
  }
}
.qualfied-more__icon {
  &:hover {
    cursor: pointer;
  }
}
</style>