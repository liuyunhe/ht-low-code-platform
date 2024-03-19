<template>
  <ht-dialog
    :single="single"
    :data="data"
    :table-columns="tableColumns"
    :pagination="pagination"
    search-placeholder="流程名称、流程key"
    dialog-title="流程选择器"
    quick-search-props="name,defKey"
    :append-to-body="appendToBody"
    :destroy-on-close="destroyOnClose"
    @load="handleLoad"
    @onConfirm="onConfirm"
    ref="htDialog"
  />
</template>
<script>
import flow from "@/api/flow.js";

export default {
  name: "form-flow-dialog",
  props: {
    formKey: String,
    boCode: String,
    single: Boolean,
    appendToBody: {
      type: Boolean,
      default: false
    },
    destroyOnClose:{
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      data: [],
      tableColumns: [
        { prop: "name", label: "流程名称" },
        { prop: "defKey", label: "流程key" }
      ],
      pagination: {
        page: 1,
        pageSize: 50,
        total: 0
      }
    };
  },
  methods: {
    showDialog() {
      this.$refs.htDialog.showDialog();
    },
    handleLoad(param, cb) {
      flow.formDeflist(this.boCode,this.formKey,param)
        .then(data => {
          this.data = data.rows;
          this.pagination.page = data.page;
          this.pagination.pageSize = data.pageSize;
          this.pagination.total = data.total;
        }).finally(() => {
          cb();
        });
    },
    onConfirm(selection) {
      this.$emit("onConfirm", selection,this.name);
      this.$emit("input", selection);
    }
  }
};
</script>
