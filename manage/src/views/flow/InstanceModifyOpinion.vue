<template>
  <el-dialog
    title="修改审批意见"
    :visible.sync="commuDialog"
    :close-on-click-modal="false"
    appendToBody
  >
    <table cellspacing="0" cellpadding="0" border="0" class="form-table">
      <tbody>
        <tr>
          <th style="width: 100px;">
            <span class="xh-star">*</span>审批意见：
          </th>
          <td>
            <OpinionText v-if="commuDialog" :text="curModifyOpnion.opinion" ref="opinionText"/>
          </td>
        </tr>
        <tr>
          <th style="width: 100px;">
            意见附件：
          </th>
          <td colspan="3">
            <FileUpload ref="fileUpload"/>
          </td>
        </tr>
        <tr>
          <th style="width: 100px;"><span class="xh-star">*</span>修改原因：</th>
          <td colspan="3">
            <el-input
              type="textarea"
              :rows="2"
              placeholder="请输入修改原因"
              v-model="reason">
            </el-input>
          </td>
        </tr>
      </tbody>
    </table>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirm" size="small">确 定</el-button>
      <el-button @click="cancel" size="small">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState, mapActions } from "vuex";
import OpinionText from "@/components/common/OpinionText.vue";
import FileUpload from "@/components/common/HtFileUpload.vue";

import { Message } from "element-ui";
import utils from "@/hotent-ui-util.js";
import { Base64 } from "js-base64";

import req from "@/request.js";

export default {
  name: "instance-modify-opinion",
  components: { OpinionText,FileUpload},
  data() {
    return {
        commuDialog: false,
        curModifyOpnion:{},
        reason:''
    };
  },
  computed: mapState({
    rows: state => state.storeProcess.rows
  }),
  methods: {
    //鼠标点击页面其他其他位置不关闭弹框
    show(opinion) {
        this.curModifyOpnion = opinion;
        this.commuDialog = true;
    },
    //取消
    cancel() {
        this.commuDialog = false;
    },
    //确认
    confirm() {

      let newOpinion = this.$refs.opinionText.getOpinion();
      if(!newOpinion){
        this.$message.warning("意见不能为空");
        return ;
      }
      if(!this.reason){
        this.$message.warning("修改原因不能为空");
        return ;
      }
      this.curModifyOpnion.opinion =newOpinion;
      if(this.$refs.fileUpload.getFiles()!=""){
        this.curModifyOpnion.files = JSON.stringify(this.$refs.fileUpload.getFiles())
      }
      let obj = {opinions:JSON.stringify(this.curModifyOpnion),cause:this.reason};
      let this_ = this;
      req.post(window.context.bpmRunTime + '/runtime/instance/v1/updateFlowOpinions',obj).then(function (rep) {
          let data = rep.data;
          if(data.state){
            this_.$message.success("修改成功");
            this_.$emit('opinionModifysuccess',this_.curModifyOpnion);
            this_.commuDialog = false;
          }else{
            this_.$message.fail(data.message);
          }
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

div >>> .el-dialog__header {
  display: block;
}
</style>