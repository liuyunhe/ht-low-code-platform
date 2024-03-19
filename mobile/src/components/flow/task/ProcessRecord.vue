<template>
  <el-main class="base-main">
    <div style="width:100%;">
      <div class="form-container" style="padding-left: 10px;padding-top: 8px;">
        <span>处理记录</span>
      </div>
      <div class="form-content">
        <div style="padding: 0 10px 5px;">
          <div class="xh_jl_s clearfix" v-for="(row,index) in opinions" :key="index">
            <div class="clearfix">
              <span class="contet_name">
                <span class="xh_index">{{opinions.length - index}}</span>
                <span v-show="row.auditorName">处理人：{{row.auditorName}}</span>
                <span v-show="!row.auditorName" style="color:#f5222d;">任务暂未处理</span>
              </span>
              <div class="xh_row" style="color:rgba(39,97,255,1)">
                <span class="opnion_status"  v-if="row.isRead==0 && row.statusVal=='待审批'">抄送</span>
                <span class="opnion_status"  v-if="row.isRead==1 && row.statusVal=='待审批'">入库</span>
                <span class="opnion_status"  v-if="row.statusVal!='待审批'">{{row.statusVal}}</span>
              </div>
            </div>
            <p class="opnion_org_name">{{row.taskName}}</p>
            <div v-show="row.opinion" style="padding: 0 0 6px;">
                <div class="xh_opinion">{{row.opinion}}</div> 
            </div>
            <div class="opnion_op_time clearfix">
                <span class="xh_time">操作时间：{{row.completeTime}}</span>
                <span class="opnion_remain_time">审批人：{{row.qualfiedNames}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-main>
</template>
<script>
import { mapState, mapActions } from "vuex";
import req from "@/request.js";
export default {
  name: "processRecord",
  components: {},
  props: ["instId"],
  data() {
    return {
      data: "" //instId
    };
  },
  watch: {
    instId: function(newVal, oldVal) {
      this.data = newVal; //newVal即是instId
      this.$store.dispatch("storeProcess/getOpinionsById", this.data);
    }
  },
  computed: mapState({
    opinions: state => state.storeProcess.opinions
  }),
  methods: {},
  created() {
    if (this.instId != undefined) {
      this.data = this.instId;
      this.$store.dispatch("storeProcess/getOpinionsById", this.data);
    }
  }
};
</script>

<style lang="stylus" scoped>
.form-container {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
}

.form-container > span {
  border-left: 3px solid #2761ff;
  font-weight: bold;
  font-size: 14px;
  padding-left: 10px;
  color: #666;
}

.form-content {
  padding-top: 20px;
}

.clearfix:after, .clearfix:before {
  display: table;
  content: ' ';
}

.clearfix:after {
  clear: both;
}

.xh_index {
  font-family: '微软雅黑';
  background-color: #d1d4db;
  font-size: 14px;
  font-weight: bold;
  line-height: 20px;
  border-radius: 10px;
  text-align: center;
  display: inline-block;
  min-width: 20px;
  margin-right :5px;
}

.xh_js_name {
  line-height: 20px;
}

.contet_name {
  width: 60%;
  float: left;
  font-size: 12px;
  font-family: '微软雅黑';
  font-weight: bold;
  color: rgba(0, 0, 0, 1);
  word-break: break-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  line-height: 20px;
}

.xh_jl_s {
  background-color: #f4f5f7;
  border-radius: 4px;
  margin-bottom: 10px;
  padding: 10px;
}
.xh_row{
    float: right;
    max-width: 40%;
    word-break: break-all;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}
.opnion_back {
    float: left;
    margin-right: 4px;
    width: 12px;
    height: 20px;
}
.opnion_status {
    font-size: 12px;
    font-family:  "微软雅黑";
    font-weight: 400;
    line-height: 20px;
}
.opnion_org_name {
    font-size: 12px;
    font-family: "微软雅黑";
    font-weight: 400;
    color: rgba(0,0,0,0.6);
    line-height: 12px;
}
.xh_opinion,.xh_opinion div{
    font-size: 15px;
    font-family:  "微软雅黑";
    font-weight: bold;
    color: rgba(0,0,0,1);
    word-wrap:break-word;
}

.opnion_op_time{
	height:12px;
	font-size: 12px;
    font-family: "微软雅黑";
	font-weight:400;
	color:rgba(0,0,0,0.6);
	line-height:20px;
}
.xh_time{
    width: 60%;
    float: left;
    word-break: break-all;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}
.opnion_remain_time {
    float: right;
    width: 40%;
    text-align: right;
    font-size: 12px;
    font-family:  "微软雅黑";
    font-weight: 400;
    color: rgba(0,0,0,0.6);
    line-height: 20px;
    word-break: break-all;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}
</style>