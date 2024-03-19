<template>
  <div class="bpm-btn-dialog">
    <el-dialog
      :visible.sync="dialogVisible"
      title="抄送回复"
      :close-on-click-modal="false"
      ><table cellspacing="0" cellpadding="0" border="0" class="form-table">
        <tbody>
          <tr>
            <th style="width: 100px">
              <span class="xh-star">*</span>审批意见：
            </th>
            <td colspan="3">
              <OpinionText :text="text" ref="opinionText" />
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
      </div></el-dialog
    >
  </div>
</template>

<script>
import OpinionText from "@/components/common/opinionText.vue";
import FileUpload from "@/components/common/fileUpload.vue";
export default {
  mame: "taskToRead",
  components: {
    OpinionText,
    FileUpload,
  },
  props: ["taskId", "instId"],
  data() {
    return {
      dialogVisible: false,
      opinion: "",
      text: "",
    };
  },
  methods: {
    showDialog() {
      this.dialogVisible = true;
    },
    confirm() {
      if (!this.$refs.opinionText.getOpinion()) {
        this.$message({ type: "warning", message: "请输入回复意见" });
        return;
      }
      let files = this.$refs.FileUpload.getFiles();
      let zfiles = "";
      this.$refs.FileUpload.isFinishUpload();
      if (files && files != "") {
        files = JSON.stringify(files);
      }
      let data = {
        instId: this.instId,
        taskId: this.taskId,
        opinion: this.$refs.opinionText.getOpinion(),
        files: files,
        zfiles: zfiles,
      };
      this.$store.dispatch("storeProcess/doNextCopyto", data).then(() => {
        if (this.token != null) {
          window.close();
        } else {
          this.$router.go(-1);
        }
      });
    },
    cancel() {
      this.dialogVisible = false;
    },
  },
  //   handleRead() {
  //       if (!this.isShowMore) {
  //         this.showMoreOperations();
  //         return false;
  //       }
  //       if (this.$refs.opinionText.getOpinion() == "") {
  //         Message.warning("请输入回复意见");
  //       } else {
  //         let files = "";
  //         let zfiles = "";
  //         this.$refs.fileUpload.isFinishUpload();

  //         //this.$refs.zfileUpload.isFinishUpload();

  //         //if (this.$refs.zfileUpload && this.$refs.zfileUpload.getFiles() != "") {
  //         //zfiles = JSON.stringify(this.$refs.zfileUpload.getFiles());
  //         //}
  //         if (this.$refs.fileUpload && this.$refs.fileUpload.getFiles() != "") {
  //           files = JSON.stringify(this.$refs.fileUpload.getFiles());
  //         }
  //         let data = {
  //           instId: this.instId,
  //           taskId: this.taskId,
  //           opinion: this.$refs.opinionText.getOpinion(),
  //           files: files,
  //           zfiles: zfiles
  //         };
  //         this.$store.dispatch("storeProcess/doNextCopyto", data).then(() => {
  //           if (this.token != null) {
  //             window.close();
  //           } else {
  //             this.$router.go(-1);
  //           }
  //         });
  //       }
  //     },
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/change-font.scss";
.attach-upload{
  display: none !important;
}
</style>
