<template>
  <ht-dialog
    single
    name="name"
    :data="data"
    :table-columns="tableColumns"
    :pagination="pagination"
    search-placeholder="脚本名称,脚本内容"
    dialog-title="常用对话框"
    quick-search-props="name,script"
    :append-to-body="appendToBody"
    :destroy-on-close="destroyOnClose"
    @load="handleLoad"
    @onConfirm="onConfirm"
    ref="htDialog"
  />
</template>
<script>
import req from "@/request.js";

export default {
  name: "eip-script-dialog",
  props: {
    value: String,
    name: String,
    appendToBody: {
      type: Boolean,
      default: false
    },
    destroyOnClose: {
      type: Boolean,
      default: false
    },
    script: {
      type: String,
      default: ""
    }

  },
  data() {
    return {
      data: [],
      tableColumns: [
        { prop: "name", label: "名称"},
        { prop: "script", label: "脚本" },
        { prop: "memo", label: "备注" }
      ],
      pagination: {
        page: 1,
        pageSize: 50,
        total: 0,
        showTotal: true
      }
    };
  },
  methods: {
    showDialog() {
      this.$refs.htDialog.showDialog();
    },
    handleLoad(queryFilter, cb) {
      req
        .post("${bpmRunTime}/runtime/script/v1/list", queryFilter)
        .then(response => {
          this.data = response.data.rows;
          this.pagination.page = response.data.page;
          this.pagination.pageSize = response.data.pageSize;
          this.pagination.total = response.data.total;
        }).finally(()=> cb());
    },
    onConfirm(selection) {
      this.$emit("onConfirm", selection[0].script,this.name);
      if (this.value) {
        this.$emit("input", this.value + selection[0].script);
      }else{
        this.$emit("input", selection[0].script);
      }
    }
  }
};
</script>
