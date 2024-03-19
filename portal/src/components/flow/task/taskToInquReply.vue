<template>
  <div class="bpm-btn-dialog">
    <el-dialog title="征询回复" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <table cellspacing="0" cellpadding="0" border="0" class="form-table">
        <tbody>
          <tr>
            <th style="width: 100px">
              <span class="xh-star">*</span>审批意见：
            </th>
            <td colspan="3">
              <OpinionText :text="text" ref="opinionText" @getOpinion="getOpinion" />
            </td>
          </tr>
          <tr class="attach-upload">
            <th style="width: 100px">附件上传：</th>
            <td colspan="3">
              <FileUpload ref="FileUpload" />
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
import FileUpload from "@/components/common/fileUpload.vue";
export default {
  name: "taskToInquReply",
  props: ["instId", "taskId","defId","opinionField","appendOpinion"],
  data() {
    return {
      dialogVisible: false,
      text: "",
      boData:{},
      wrap:"\n",
      initBoAttr:"",
      appendStr:true,
       formatOpinion: '',
      opnionSortOrder: 'desc', //TODO:增加一个字段用来控制审批意见倒叙还是正序排序
    };
  },
  components: {
    OpinionText,
    FileUpload,
  },
  methods: {
    getOpinion(opinion) {
      this.text = opinion;
      let opinioValue=this.$refs.opinionText.getOpinion();
      if(this.opinionField && document.querySelector("[model-name='data."+this.opinionField+"']")){
        let currentUser= this.$store.state.user.currentUserDetail.user;
        let moment = require("moment");

         this.formatOpinion =
          opinioValue +
          this.wrap +
          currentUser.fullname +
          ' ' +
          moment().format('YYYY-MM-DD HH:mm:ss')

        // let boData = this.boData;
        // let filed=this.opinionField.split(".");
        // if(boData[filed[0]][filed[1]] == '<p><br/></p>'){
        //   boData[filed[0]][filed[1]] = "";
        // }
        // //是否覆盖审批意见
        // if (this.appendOpinion){
        //   if (opinioValue){boData[filed[0]][filed[1]]=opinioValue+this.wrap+currentUser.fullname+" "+moment().format("YYYY-MM-DD HH:mm:ss");
        //   }
        // }else{
        //   if (opinioValue){
        //     opinioValue+=this.wrap+currentUser.fullname+" "+moment().format("YYYY-MM-DD HH:mm:ss");
        //   }
        //   if (this.appendStr){
        //     this.initBoAttr=boData[filed[0]][filed[1]];
        //   }
        //   if (filed.length==2){
        //     if(this.initBoAttr){
        //       if(opinion){
        //         boData[filed[0]][filed[1]]=this.initBoAttr+this.wrap+this.wrap+opinioValue;
        //       }else{
        //         boData[filed[0]][filed[1]]=this.initBoAttr
        //       }
        //     }else{
        //       boData[filed[0]][filed[1]]=opinioValue;
        //     }
        //   }
        //   this.appendStr=false;
        // }
        /*else if (filed.length==3 &&boData[filed[0]][filed[1]].length>0){//处理子表
          for (let i = 0; i <boData[filed[0]][filed[1]].length ; i++) {
            boData[filed[0]][filed[1]][i][filed[2]]=opinioValue;
          }
        }*/
      }
    },
     //ccwgq 审批意见回填到表单
    opinionBackToForm() {
      let boData = this.boData
      let filed = this.opinionField.split('.')
      if (boData[filed[0]][filed[1]] == '<p><br/></p>') {
        boData[filed[0]][filed[1]] = ''
      }
      //是否覆盖审批意见
      if (this.appendOpinion) {
        if (this.formatOpinion) {
          boData[filed[0]][filed[1]] = this.formatOpinion
        }
      } else {
        if (this.appendStr) {
          this.initBoAttr = boData[filed[0]][filed[1]]
        }
        if (filed.length == 2) {
          if (this.initBoAttr) {
            //根据选项控制是否正序或者倒叙
            if (this.opnionSortOrder == 'desc') {
              boData[filed[0]][filed[1]] =
                this.formatOpinion + this.wrap + this.wrap + this.initBoAttr
            } else {
              boData[filed[0]][filed[1]] =
                this.initBoAttr + this.wrap + this.wrap + this.formatOpinion
            }
          } else {
            boData[filed[0]][filed[1]] = this.formatOpinion
          }
        }
        this.appendStr = false
      }
      /*else if (filed.length==3 &&boData[filed[0]][filed[1]].length>0){//处理子表
          for (let i = 0; i <boData[filed[0]][filed[1]].length ; i++) {
            boData[filed[0]][filed[1]][i][filed[2]]=opinioValue;
          }
        }*/
    },
    showDialog() {
      if(this.opinionField && document.querySelector("[model-name='data."+this.opinionField+"']")){
        let con = document.querySelector("[model-name='data."+this.opinionField+"']").__vue__;
        if(con && con.isEditor){
          this.wrap = "<br>";
        }
      }
      this.dialogVisible = true;
      this.boData = this.$parent.$refs.formContent.data;
    },
    confirm() {
      let opinion = this.$refs.opinionText.getOpinion();
      if (!opinion) {
        this.$message({ type: "warning", message: "请输入反馈意见" });
        return;
      }
       //ccwgq 2022-06-01 这时执行意见反填(有意见反填字段才填)
      if(this.opinionField){
         this.opinionBackToForm();
      }
      let files = this.$refs.FileUpload.getFiles();
      let zfiles = "";
      this.$refs.FileUpload.isFinishUpload();
      if(files && files!=""){
          files = JSON.stringify(files);
      }
      let data = {
        procDefId: this.defId,
        procInstId: this.instId,
        status:"inqu_reply",
        taskId:this.taskId,
        opinion: opinion,
        files: files,
        zfiles: zfiles,
        formData: JSON.stringify(this.$parent.$refs.formContent.data)
      };
      this.$store.dispatch("storeProcess/taskToInquReply", data).then(() => {
          if (this.token != null) {
            window.close();
          } else {
            this.$router.go(-1);
          }
        });
    //ninghua  20221028  征询回复完成后回到待办
    this.$router.push({path:"/v-flow/v-todo"})
    },
    cancel(){
        this.dialogVisible = false;
    }
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/change-font.scss";
.attach-upload{
  display: none !important;
}
</style>