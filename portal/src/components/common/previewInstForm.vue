<template>
  <el-main class="base-main">
    <div
      style="width:1200px;margin: 32px auto 0;background-color: #fff;padding:20px;"
    >
      <div class="form-container">
        <span>审批内容</span>
      </div>
      <div class="form-content">
        <form v-if="html" data-vv-scope="custom-form">
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
import OnlineForm from '@/components/flow/OnlineForm.vue'
import form from '@/api/formContent.js'
import { baseHandlerJs } from '@/utils/handlerJs'

export default {
  name: 'formContent',
  props: ['defId', 'instId'],
  data() {
    return {
      dataInstId: '',
      html: null,
      data: null,
      permission: null,
      isView: true
    }
  },
  components: {OnlineForm},
  created() {
    let _me = this
    let handlerJs = baseHandlerJs

    let handler = function(rep) {
      form.preview(rep.form.formId, (rep)=>handlerJs(rep,_me));
      _me.data = rep.data
      if (rep.permission) {
        _me.permission = JSON.parse(rep.permission)
      }
      _me.html = rep.form.formHtml
    }
    if (this.instId) {
      form.getInstFormAndBO(this.instId, handler)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
/deep/.el-form-item {
  margin-bottom: 15px !important;
  margin-top: 10px !important;
  margin-right: 10px !important;
}
.base-main {
  background-color: #e9eef3;
}

/deep/ .form-table {
  width: 100%;
  border-top: 1px solid #ebeef5;
  border-left: 1px solid #ebeef5;
}

/deep/ .form-table > thead > tr > th,
/deep/ .form-table > tbody > tr > th {
  text-align: right;
  color: #666;
  font-weight: normal;
}

/deep/ .form-table > tbody > tr > th.group-th {
  text-align: left;
  background: #f9f9f9;
  font-weight: bold;
}

/deep/ .form-table > thead > tr.sub-table-header > th {
  text-align: center;
  background: #fafafa;
}

/deep/ .form-table > tbody > tr > th > span,
/deep/ .form-table > thead > tr > th > span {
  color: #f00;
}

/deep/ .form-table > tbody > tr > th,
/deep/ .form-table > tbody > tr > td,
/deep/ .form-table > tfoot > tr > td,
/deep/ .form-table > thead > tr > th {
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  padding: 10px;
  min-width: 0;
  box-sizing: border-box;
  text-overflow: ellipsis;
  vertical-align: middle;
  position: relative;
}

/deep/ .form-table > tfoot > tr > td {
  padding: 5px 10px;
}

/deep/ .form-table-noBorder {
  border-top: 0px solid #ebeef5;
  border-left: 0px solid #ebeef5;
}
/deep/ .form-table-noBorder > tbody > tr > th,
/deep/ .form-table-noBorder > tbody > tr > td,
/deep/ .form-table-noBorder > tfoot > tr > td,
/deep/ .form-table-noBorder > thead > tr > th {
  border-right: 0px solid #ebeef5;
  border-bottom: 0px solid #ebeef5;
}

.form-container {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.form-container > span {
  border-left: 3px solid $--theme-color;
  font-weight: bold;
  font-size: 14px;
  padding-left: 10px;
  color: #666;
}

.form-content {
  padding: 11px 0;
}

/deep/ div[aria-invalid='true'] + small,
/deep/ small.error-message {
  display: block;
  margin-top: 8px;
  color: #f56c6c;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
}
</style>