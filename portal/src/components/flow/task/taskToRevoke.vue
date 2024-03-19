<template>
  <div class="bpm-btn-dialog">
    <!-- ninghua 20221103  修改title为"是否确定强制收回" -->
    <el-dialog
      title="是否确定强制收回"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
    >
 <!--      <table cellspacing="0" cellpadding="0" border="0" class="form-table">
        <tbody>
          <tr>
            <th style="width: 160px!important;">
              <span class="xh-star">*</span>强制收回原因：
            </th>
            <td colspan="3">
              <OpinionText :text="text" ref="opinionText" />
            </td>
          </tr>
        </tbody>
      </table> -->
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
import flow from "@/api/flow.js";
export default {
  props:["instId","taskId"],
  name: "taskToRevoke",
  data() {
    return {
      dialogVisible: false,
      text: "",
      data: {},
      revokeUrl: "",
    };
  },
  components: {
    OpinionText,
  },
  methods: {
    showDialog(revokeUrl, data) {
      this.data = data;
      this.revokeUrl = revokeUrl;
      this.dialogVisible = true;
    },
    confirm() {
      //20221103  ninghua  去掉强制收回的意见框
      //let opinion = this.$refs.opinionText.getOpinion();
      // if (!opinion) {
      //   this.$message({ type: "warning", message: "请输入强制收回原因" });
      //   return;
      // }
      //this.data.cause = opinion;
      this.$store.dispatch(this.revokeUrl, this.data).then((value) => {
        this.dialogVisible = false;
        if (value) {
          this.$router.push("/task/" + value + "/0");
          setTimeout(() => {
            this.$root.$children[0].reload();
            this.$router.push({path:"/v-flow/v-todo"})
          }, 10);
        } else {
          this.$router.push("/v-flow/v-todo");
        }
      });
    },
    cancel() {
      this.dialogVisible = false;
    }
  },

};
</script>

<style lang="scss" scoped>
</style>