<template>
  <el-container>
    <el-dialog
      width="60%"
      :title="title"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      :close-on-click-modal="false"
      append-to-body
    >
      <table class="form-table" cellspacing="0" cellpadding="0" border="0">
        <tbody>
          <tr>
            <th width="120px" class="is-required">模板名称:</th>
            <td width="80%">
              <span>{{ formData.name }}</span>
            </td>
          </tr>
          <tr>
            <th width="120px" class="is-required">模板分类:</th>
            <td>
              <span>{{ formData.typeKey }}</span>
            </td>
          </tr>
          <tr>
            <th width="120px" class="is-required">模板业务键:</th>
            <td>
              <span>{{ formData.key }}</span>
            </td>
          </tr>
          <tr>
            <th width="120px" class="is-required">是否默认模板:</th>
            <td>
              <span v-if="formData.isDefault == '1'">是</span>
              <span v-else>否</span>
            </td>
          </tr>
          <tr>
            <th width="120px" class="is-required">标题:</th>
            <td>
              <span>{{ formData.subject }}</span>
            </td>
          </tr>
          <tr>
            <th width="120px" class="is-required">纯文本:</th>
            <td>
              <span>{{ formData.plain }}</span>
            </td>
          </tr>
          <tr>
            <th width="120px" class="is-required">模板体HTML:</th>
            <td>
              <span>{{ formData.htmlTemplate }}</span>
            </td>
          </tr>
          <tr>
            <th width="120px" class="is-required">创建时间:</th>
            <td>
              <span>{{ formData.createTime }}</span>
            </td>
          </tr>
          <tr>
            <th width="120px" class="is-required">更新时间:</th>
            <td>
              <span>{{ formData.updateTime }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </el-dialog>
  </el-container>
</template>

<script>
import flow from "@/api/flow.js";
export default {
  props: ["msgDataId"],
  data() {
    return {
      title: "查看消息模板",
      dialogVisible: false,
      formData: {
        name: "",
        key: "",
        smsTemplateNo: "",
        voiceTemplateNo: "",
        htmlTemplate: "",
        plain: "",
        subject: ""
      }
    };
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
    },
    handleOpen() {
      this.dialogVisible = true;
      this.getDetails(this.msgDataId.id);
    },
    getDetails(id) {
      flow.getMsgDetails(id).then(resp => {
        this.formData = resp.data;
      });
    }
  }
};
</script>

<style scoped></style>
