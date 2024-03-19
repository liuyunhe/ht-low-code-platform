<template>
  <el-main class="base-main">
    <el-header v-if="!single" class="form_header" style="height: 20px;">
      <div class="btn_region_in">
        <el-row style="float:right;">
          <el-col :span="12" class="top-btns-col no-print">
            <el-button type="text" icon="el-icon-view" @click="viewBoData"
              >查看数据</el-button
            >
          </el-col>
        </el-row>
      </div>
    </el-header>
    <div class="form">
      <div v-if="!single" class="form-container"><span>审批内容</span></div>
      <div class="form-content">
        <form
          v-if="html"
          data-vv-scope="custom-form"
          style="padding-bottom:5px"
          v-form
        >
          <online-form
            class="custom-form preview-form"
            :html="html"
            :data="data"
            :permission="permission"
            :isView="isView"
            :initFillData="true"
          />
        </form>
      </div>
    </div>
    <ht-sidebar-dialog
      width="45%"
      title="查看数据"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
    >
      <div style="height:100%;overflow:auto;">
        <pre>{{ JSON.stringify(data, null, 4) }}</pre>
      </div>
    </ht-sidebar-dialog>
  </el-main>
</template>
<script>
import OnlineForm from "@/components/flow/OnlineForm.vue";
import form from "@/api/formContent.js";
import { Base64 } from "js-base64";
import { baseHandlerJs } from '@/utils/handlerJs'

export default {
  name: "formContent",
  props: ["formId", "single"],
  data() {
    return {
      dataInstId: "",
      html: null,
      data: null,
      extData: null,
      permission: null,
      isView: true,
      dialogVisible: false,
      formTaskAuth:''
    };
  },
  components: { OnlineForm },
  created() {
    var $ = require("jquery");
    let _me = this;
    // 2022-11-30 wude 替换成同意处理js脚本的方法
    let handlerJs = baseHandlerJs
    
    let handler = function(rep) {
      form.preview(rep.bpmForm.id, (rep)=>handlerJs(rep,_me));
      if (_me.extData) {
        _me.data = _me.extData;
      } else {
        _me.data = rep.data;
      }

      if (rep.permission) {
        _me.permission = rep.permission;
      }
      _me.html = rep.bpmForm.formHtml;
    };
    if (this.formId) {
      form.previewDesignVue(this.formId, handler);
    }

    this.$watch(
      "data",
      function(newVal, oldVal) {
        // 表单数据传递给父页面
        window.parent.postMessage({ formData: newVal }, "*");
      },
      { deep: true }
    );
  },
  methods: {
    viewBoData() {
      this.dialogVisible = true;
    },
    handleClose() {
      this.dialogVisible = false;
    },
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (to.query.formData && to.query.formData != "e30=") {
        vm.extData = JSON.parse(Base64.decode(to.query.formData));
      }
    });
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
// /deep/.el-main{
//   // 隐藏滚动条
//   // &::-webkit-scrollbar {
//   //   width: 0;
//   //   background-color: transparent;
//   // }
// }
//form表单间距
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

/deep/ .form-table > tfoot > tr > td {
  padding: 5px 10px;
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

/deep/ div[aria-invalid="true"] + small,
/deep/ small.error-message {
  display: block;
  margin-top: 8px;
  color: #f56c6c;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
}

.form_header {
  width: 80%;
  margin: 12px auto 0;
}

.form {
  width: 80%;
  margin: 12px auto 0;
  background-color: #fff;
  padding: 20px;
  height: calc(100% - 124px);
  overflow-y: auto;
}
.preview-form{
  /deep/.el-input{
    width: 100% !important;
  }
}

</style>
