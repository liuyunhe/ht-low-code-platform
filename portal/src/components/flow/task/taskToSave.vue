<template>
  <div class="bpm-btn-dialog">
    <el-dialog
      :visible.sync="dialogVisible"
      title="保存设置"
    >
      <table cellspacing="0" cellpadding="0" border="0" class="form-table">
        <tbody>
          <tr>
            <td style="width: 100px">保存类型</td>
            <td colspan="3">
              <el-radio v-model="saveType" label="1">仅保存表单数据</el-radio>
              <!-- 20221105 ninghua  判断如果是台账的话，不显示保存意见选项 -->
              <el-radio v-if = "!isTaiZhang"  v-model="saveType" label="2" @change="getBpmSaveOpinion"
                >保存表单数据和意见</el-radio
              >
            </td>
          </tr>
          <tr v-show="saveType == '2'">
            <th style="width: 100px">
              <span class="xh-star">*</span>审批意见：
            </th>
            <td colspan="3">
              <OpinionText
                :text="text"
                ref="opinionText"
              />
            </td>
          </tr>

          <tr class="attach-upload">
            <th style="width: 100px">附件上传：</th>
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
import OpinionText from "@/components/common/opinionText.vue";
//import FileUpload from "@/components/common/fileUpload.vue";
import { Base64 } from "js-base64";
import flow from "@/api/flow.js";
import utils from "@/utils.js";
export default {
  name: "taskToSave",
  props: ["taskId", "leaderId", "instId","getFormKey"],
  components: {
    OpinionText,
  },
  data() {
    return {
      dialogVisible: false,
      text: "",
      opinion: "",
      saveType: "1",
      data: {},
      //isTaiZhang:false//判断是否是台账
    };
  },
  computed:{
    //20221105  ninghua 判断当前是否是台账
    isTaiZhang(){
      let fmk = this.getFormKey()
      if(fmk=='ssswtz'||fmk === 'fsswtz'|| fmk =='lyjhhtz' || fmk == 'wplsbatz'){
        return true
      }
    }
  },
  methods: {
    showDialog(data) {
      this.data = data;
      this.dialogVisible = true;
    },
    cancel() {
      this.dialogVisible = false;
    },
    confirm() {
      if (this.saveType == 2) {
        if (this.$refs.opinionText.getOpinion()) {
          this.data.opinion = this.$refs.opinionText.getOpinion();
        } else {
          this.$message({ type: "warning", message: "请输入审批意见" });
          return;
        }
      }
      this.$store.dispatch("storeProcess/saveTaskDraft", this.data).then(() => {
        if (this.saveType == 2) {
          let bpmSaveOpinion = {
            procInstId: this.instId,
            taskId: this.taskId,
            opinion: this.$refs.opinionText.getOpinion(),
          };

          //暂存审批意见
          flow.createBpmSaveOpinion(bpmSaveOpinion).then((data) => {
            if (data.state) {
              utils.reload();
              //20221102  ninghua 保存后跳转到待办
              this.$router.push({path:"/v-flow/v-todo"})
            }
          });
        } else {
          utils.reload();
          //20221102  ninghua 保存后跳转到待办
          this.$router.push({path:"/v-flow/v-todo"})
        }
      });
      //20221102  ninghua 保存后跳转到待办
      //this.$router.push({path:"/v-flow/v-todo"})
    },
    getBpmSaveOpinion(){
      let opinion = this.$refs.opinionText.getOpinion();
      let me_ = this;
      if(!opinion){
        flow.getBpmSaveOpinionByTeam({
          instId:me_.instId,
          taskId:me_.taskId
        }).then(resp=>{
          if(resp.state && resp.value){
            me_.$refs.opinionText.opinion = resp.value
            me_.$refs.opinionText.opinionInput();
          }
        })
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/change-font.scss";
.attach-upload{
  display: none !important;
}
</style>