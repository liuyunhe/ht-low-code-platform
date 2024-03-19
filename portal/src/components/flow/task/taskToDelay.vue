<template>
<div class="bpm-btn-dialog">
  <el-dialog
    title="任务延期"
    :visible.sync="delayDialog"
    :close-on-click-modal="false"
  >
    <table cellspacing="0" cellpadding="0" border="0" class="form-table">
      <tbody>
        <tr>								
							<th>时间计算方式：</th>
							<td>
									<span v-if="dueTime.dateType=='worktime'">工作日</span>
									<span v-if="dueTime.dateType=='caltime'">日历日</span>
							</td>	
							
							<th>已用时间：</th>
							<td>
              		<span style="color:black" >{{percent}}</span>
							</td>	
        </tr>
        <tr>								
            <th>任务开始时间：</th>
            <td>
            {{ dueTime.startTime | dateformat('YYYY-MM-DD HH:mm:ss') }}
            </td>	
            
            <th>到期时间：</th>
            <td>
              {{ dueTime.expirationDate | dateformat('YYYY-MM-DD HH:mm:ss')  }}
            </td>							
        </tr>
        <tr>
          <th>
            <span class="xh-star">*</span>增加任务时间（小时）：
          </th>
          <td colspan="3" >
            <el-input-number v-model="addDueTime" :min="0"></el-input-number>
          </td>	
        </tr>
        <tr>
          <th>
            <span class="xh-star">*</span>预计到期时间：
          </th>
          <td colspan="3" >
            <span v-if="expirationDate2">{{ expirationDate2  | dateformat('YYYY-MM-DD HH:mm:ss') }}</span>
          </td>	
				</tr>
        <tr>
          <th style="width: 160px;">
            <span class="xh-star">*</span>延期说明：
          </th>
          <td colspan="3">
            <OpinionText  ref="opinionText"/>
          </td>
        </tr>
        <tr class="attach-upload">
          <th style="width: 160px;">附件上传：</th>
          <td colspan="3">
            <FileUpload ref="fileUpload"/>
          </td>
        </tr>
      </tbody>
    </table>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirm" size="small">确 定</el-button>
      <el-button @click="cancel" size="small">取 消</el-button>
    </div>
  </el-dialog>
</div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import OpinionText from "@/components/common/opinionText.vue";
import FileUpload from "@/components/common/fileUpload.vue";
import { Message } from "element-ui";
import utils from "@/utils.js";
export default {
  name: "taskToDelay",
  props: ["taskId"],
  components: { OpinionText,FileUpload},
  data() {
    return {
        delayDialog:false,
        percent:"", //已用时间
        addDueTime:0,//延期时间（小时）
        expirationDate2:"",//延期后的时间 yyyy-mm-dd HH:mm:ss
        id:"",
        confirmData:{},
        addMinute:0 //延期时间（分钟）
    };
  },
  watch: {
    addDueTime: function(newVal,oldVal){
      if(newVal!=0){
        this.addMinute = newVal*60;
        let data = {"id":this.id,"time":newVal*60};
        this.$store.dispatch("storeProcess/getExpirationDate",data).then(data => {
          this.expirationDate2 = data;
        });
      }else{
        this.addMinute = 0;
        this.expirationDate2="";
      }
    }
  },
  computed: mapState({
    dueTime: state => state.storeProcess.dueTime
  }),
  methods: {
    //鼠标点击页面其他其他位置不关闭弹框
    handleClose(done) {
        this.delayDialog = true;
        this.$store.dispatch("storeProcess/bpmTaskDueTime",this.taskId).then(data => {
            this.confirmData = data;
            this.id = data.id;
            let percent = (data.dueTime - data.remainingTime)*100/data.dueTime;
            this.percent = parseFloat(percent.toFixed(2));
            if(percent>100){
              this.percent = 100;
            }
            this.percent = this.percent + "%";
        });
    },
    //取消
    cancel() {
        this.delayDialog = false;
    },
    //确认
    confirm() {
      if(this.addDueTime==0){
         Message.warning("请填写延期时间");
         return;
      }else if(this.$refs.opinionText.getOpinion()==""){
        Message.warning("请填写延期说明");
        return;
      };
      let files ="";
      if(this.$refs.fileUpload.getFiles()!=""){
        files = JSON.stringify(this.$refs.fileUpload.getFiles())
      }
      let data = {"id":this.confirmData.id,"parentId":this.confirmData.parentId,"instId":this.confirmData.instId,
      "dateType":this.confirmData.dateType,"taskId":this.confirmData.taskId,"dueTime":this.confirmData.dueTime,
      "addDueTime":this.addMinute,"startTime":this.confirmData.startTime,"expirationDate":this.confirmData.expirationDate,
      "remainingTime":this.confirmData.remainingTime,"status":this.confirmData.status,"userId":this.confirmData.userId,
      "userName":this.confirmData.userName,"isNew":this.confirmData.isNew,"createTime":this.confirmData.createTime,
      "remark":this.$refs.opinionText.getOpinion(),"fileId":files}
      this.$store.dispatch("storeProcess/dueTimeSave",data).then(()=>{
           this.delayDialog = false;
           utils.reload();
      });
    }
  }
};
</script>

<style lang="stylus" scoped>
.el-dialog__footer {
    padding: 10px 20px;
    padding-top: 10px;
    text-align: right;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
}
.form-table {
  width: 100%;
  border-top: 1px solid #ebeef5;
  border-left: 1px solid #ebeef5;
}

.form-table th {
  text-align: right;
  color: #666;
}

.form-table th > span {
  color: #f00;
}

.form-table th, .form-table td {
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  padding: 10px;
  min-width: 0;
  box-sizing: border-box;
  text-overflow: ellipsis;
  vertical-align: middle;
  position: relative;
}

.xh-star {
  color: red;
}
</style>

<style lang="scss" scoped>
@import "@/assets/css/change-font.scss";
.attach-upload{
  display: none !important;
}
</style>