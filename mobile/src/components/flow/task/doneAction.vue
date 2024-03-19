<template>
  <div>
    <div v-if="opinionList && opinionList.length>0">
      <div class="action-container">
        <span>操作区域</span>
      </div>
      <div style="margin-top:10px;">
        <el-radio
          v-for="op in opinionList"
          :key="op.taskKey"
          v-model="selectNodeId"
          :label="op.taskKey"
        >{{op.taskName}}</el-radio>
      </div>
    </div>
    <DoneFormContent
      ref="doneFormContent"
      v-if="opinionMap[selectNodeId]|| didntSkipStart"
      :instId="instId"
      :nodeId="selectNodeId"
      :taskId="didntSkipStart ?  null:opinionMap[selectNodeId].taskId "
      :pData="didntSkipStart ?  null:opinionMap[selectNodeId].formData"
      :didntSkipStart="didntSkipStart"
    />
  </div>
</template>
<script>
import DoneFormContent from '@/components/flow/task/doneFormContent.vue'
import {mapState} from 'vuex'
import utils from '@/utils.js'
import {Base64} from 'js-base64'
import req from '@/request.js'
import {RadioGroup, Radio} from 'vant'

export default {
  components: {
    DoneFormContent,
    [RadioGroup.name]: RadioGroup,
    [Radio.name]: Radio
  },
  props: [
    'instId',
    'type',
    'taskId',
    'defId',
    'status',
    'choiceExcutor',
    'jumpType',
    'instStatus',
    'leaderId'
  ],
  data() {
    return {
      opinion: '撤回',
      token: utils.getUrlKey('token'),
      opinionMap: {},
      opinionList: [],
      selectNodeId: '',
      didntSkipStart: false
    }
  },
  methods: {},
  created() {
    let queryFilter = {}
    let pageBean = {pageBean: this.pagination}
    let querys = [
      {
        property: 'wfInst.id_',
        value: this.instId,
        group: 'typeId',
        operation: 'IN',
        relation: 'AND'
      }
    ]
    queryFilter = {pageBean: this.pagination, querys}
    let _this = this
    this.$store
      .dispatch('storeProcess/getDoneByInstId', queryFilter)
      .then(data => {
        if (data.data && data.data.rows) {
          data.data.rows.forEach(opinion => {
            //判断当前是否在第一个节点,并且流程设置为不跳过第一个节点
            if (
              data.data.rows.length == 1 &&
              opinion.opinionStatus == 'start'
            ) {
              this.didntSkipStart = true
            }
            if (
              opinion.opinionStatus != 'signRecoverCancel' &&
              opinion.opinionStatus != 'retracted' &&
              opinion.opinionStatus != 'start' &&
              opinion.opinionStatus != 'end' &&
              !_this.opinionMap[opinion.taskKey] &&
              opinion.opinionStatus != 'awaiting_check' &&
              opinion.opinionStatus != 'copyto' &&
              opinion.opinionStatus != 'awaiting_feedback' &&
              opinion.opinionStatus != 'copyto_reply' &&
              opinion.opinionStatus != 'start_commu' &&
              opinion.opinionStatus != 'end_revoke'
            ) {
              if (
                opinion.opinionStatus == 'skip' &&
                opinion.skipType != 'first'
              ) {
                return true
              }
              if (opinion.formData) {
                opinion.formData = JSON.parse(Base64.decode(opinion.formData))
              }
              _this.opinionMap[opinion.taskKey] = opinion
              _this.opinionList.push(opinion)
              _this.selectNodeId = _this.opinionList[0].taskKey
            }
          })
        }
      })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
@media print {
  .no-print {
    display: none;
  }
}
.action-container {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.action-container > span {
  border-left: 3px solid $--theme-color;
  font-weight: bold;
  font-size: 14px;
  padding-left: 10px;
  color: #666;
}

.action-content {
  padding: 20px 0;
}

.action-group {
  padding-top: 10px;
}

.action-btn {
  float: left;
  padding-right: 5px;
}
.btn_region {
  position: fixed;
  z-index: 100;
  background: #f5f5f5;
}
.btn_region_in {
  margin: 0 auto;
  // background-color: #fff;
}
.region {
  padding-top: 10px;
}
.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 30px;
  height: 30px !important;
  margin-top: -40px;
}
</style>
