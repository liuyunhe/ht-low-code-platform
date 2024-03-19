<template>
  <ht-dialog
    :single="single"
    :data="data"
    :table-columns="tableColumns"
    :pagination="pagination"
    search-placeholder="名称或编码"
    dialog-title="职务对话框"
    quick-search-props="name,code"
    :append-to-body="appendToBody"
    :destroy-on-close="destroyOnClose"
    @load="handleLoad"
    @onConfirm="onConfirm"
    ref="htDialog"
  />
</template>
<script>
import uc from "@/api/uc.js";

export default {
  name: "eip-job-dialog",
  props: {
    value: Array,
    name: String,
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
        { prop: "name", label: "名称" },
        { prop: "code", label: "编码" }
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
      uc.getJobPage(param)
        .then(data => {
          this.data = data.rows;
          this.pagination.page = data.page;
          this.pagination.pageSize = data.pageSize;
          this.pagination.total = data.total;
          cb();
        })
        .catch(err => {
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
