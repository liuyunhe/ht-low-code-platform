<template>
<div class="bpm-btn-dialog">
  <el-dialog title="流程终止" :visible.sync="endProcessDialog" :close-on-click-modal="false">
    <table cellspacing="0" cellpadding="0" border="0" class="form-table">
      <tbody>
        <tr>
          <th style="width: 100px;">
            <span class="xh-star">*</span>终止原因：
          </th>
          <td colspan="3">
            <OpinionText ref="opinionText"/>
          </td>
        </tr>
        <tr class="attach-upload">
          <th style="width: 100px;">附件上传：</th>
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
import req from "@/request.js";
export default {
  name: "taskToEndProcess",
  props: ["taskId"],
  components: { OpinionText, FileUpload },
  data() {
    return {
      endProcessDialog: false,
      token:utils.getUrlKey("token"),
      flowThis:""//flowAction的this
    };
  },
  computed: mapState({
    currentUser: state => state.login.currentUser
  }),
  methods: {
    //鼠标点击页面其他其他位置不关闭弹框
    handleClose(_this) {
      this.flowThis = _this;
      this.endProcessDialog = true;
    },
    //执行前置脚本
    runBeforeScript(){
      let _this = this;
      let item = utils.indexOfList(_this.flowThis.rowsBtn, "alias", _this.flowThis.btnAlias);
      return _this.tempScript(item.beforeScript);
    },
    //执行前置脚本
    tempScript(script) {
      let _this = this;
      let _req = req;
      let boData = _this.flowThis.$refs.formContent.data;
      let tempScript = "var tempFunction = function(_req,data,_this){ " + script + "};";
      let result = eval(tempScript + "tempFunction(_req,boData,_this);");
      if (result && result.then && typeof result.then == "function") {
        return result;
      }
      if (result === false) return false;
      return true;
    },
    //取消
    cancel() {
      this.endProcessDialog = false;
    },
    //确认
    confirm() {
      if (this.$refs.opinionText.getOpinion() == "") {
        Message.warning("请填写终止原因");
        return;
      }
      let _this = this;
      let scriptResult = this.runBeforeScript();
      //执行前置脚本返回false时终止按钮操作
      if (scriptResult === false) return;
      //执行前置脚本返回的接口时先执行前置事件接口
      if (scriptResult.then && typeof scriptResult.then == "function") {
        scriptResult.then(() => {
            //接口返回成功则正常执行按钮操作
            _this.funcDoNext();
          }, (fail) => {
            //接口返回失败则终止按钮操作，并给与提示
            _this.$message.warning(fail);
            return;
          }
        );
      } else {
        //执行前置脚本返回true时正常执行按钮操作
        _this.funcDoNext();
      }
    },
    funcDoNext(){
      let files = "";
      if (this.$refs.fileUpload.getFiles() != "") {
        files = JSON.stringify(this.$refs.fileUpload.getFiles());
      }
      this.$store.dispatch("login/validAndCompletedCurrent").then(() => {
        let data = {
          taskId: this.taskId,
          endReason: this.$refs.opinionText.getOpinion(),
          messageType: "inner",
          account: this.currentUser.account,
          files: files,
          busDataObjectNode: {test:"我是测试数据,请在这里封装您需要的数据"}
        };
        this.$store.dispatch("storeProcess/doEndProcess", data).then(() => {
          this.endProcessDialog = false;
          if(this.token!=null){
            //this.$router.push("/v-flow/v-todo");
            window.close();
          }else{
            //终止流程后返回到待办页面
            this.$router.push("/v-flow/v-todo");
            //this.$router.go(-1);
          }
        });
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