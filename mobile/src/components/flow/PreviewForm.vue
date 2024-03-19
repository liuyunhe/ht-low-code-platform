<template>
  <el-main class="base-main">
    <div style="width:100%;">
      <div class="form-container" style="padding-left: 5px;padding-top: 8px;">
        <span>审批内容</span>
      </div>
      <div class="form-content">
        <form v-if="html" data-vv-scope="custom-form" v-form>
          <online-form
            class="custom-form"
            :html="html"
            :data="data"
            :permission="permission"
            :isView="isView"
          />
        </form>
      </div>
    </div>
  </el-main>
</template>
<script>
import OnlineForm from "@/components/flow/OnlineForm.vue";
import form from "@/api/formContent.js";

export default {
  name: "previewForm",
  props: ["formId"],
  data() {
    return {
      dataInstId: "",
      html: null,
      data: null,
      permission: null,
      isView: true
    };
  },
  components: { OnlineForm },
  created() {
    var $ = require("jquery");
    let _me = this;
    let handlerJs = function(rep) {
      const currentUser = _me.$store.state.login.currentUser;

      let data = _me.data;
      eval(rep.diyJs);
    };

    let handler = function(rep) {
      form.preview(rep.bpmForm.id, handlerJs);
      _me.data = rep.data;
      if (rep.permission) {
        _me.permission = rep.permission;
      }
      _me.html = rep.bpmForm.formHtml;
    };
    if (this.formId) {
      form.previewDesignVue(this.formId, handler);
    }
  }
};
</script>

<style lang="stylus" scoped>
>>> .form-table {
  width: 100%;
  border-top: 1px solid #ebeef5;
  border-left: 1px solid #ebeef5;
}

>>> .form-table > thead > tr > th, >>> .form-table > tbody > tr > th {
  text-align: right;
  color: #666;
  font-weight: normal;
}

>>> .form-table > tbody > tr > th.group-th {
  text-align: left;
  background: #f9f9f9;
  font-weight: bold;
}

>>> .form-table > thead > tr.sub-table-header > th {
  text-align: center;
  background: #fafafa;
}

>>> .form-table > tbody > tr > th > span, >>> .form-table > thead > tr > th > span {
  color: #f00;
}

>>> .form-table > tbody > tr > th, >>> .form-table > tbody > tr > td, >>> .form-table > tfoot > tr > td, >>> .form-table > thead > tr > th {
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  padding: 10px;
  min-width: 0;
  box-sizing: border-box;
  text-overflow: ellipsis;
  vertical-align: middle;
  position: relative;
}

>>> .form-table-noBorder {
  border-top: 0px solid #ebeef5;
  border-left: 0px solid #ebeef5;
}

>>> .form-table-noBorder > tbody > tr > th, >>> .form-table-noBorder > tbody > tr > td, >>> .form-table-noBorder > tfoot > tr > td, >>> .form-table-noBorder > thead > tr > th {
  border-right: 0px solid #ebeef5;
  border-bottom: 0px solid #ebeef5;
}

>>> .form-table > tfoot > tr > td {
  padding: 5px 10px;
}

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
  padding: 20px 0;
  background-color:#fff;
}

>>> div[aria-invalid='true'] + small, >>> small.error-message {
  display: block;
  margin-top: 8px;
  color: #f56c6c;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
}
</style>
