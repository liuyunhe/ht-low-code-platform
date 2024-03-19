<template>
  <ht-dialog
      :single="single"
      :data="data"
      :table-columns="tableColumns"
      :pagination="pagination"
      search-placeholder="名称或别名"
      dialog-title="自定义视图对话框"
      quick-search-props="name,alias"
      :destroy-on-close="destroyOnClose"
      @load="handleLoad"
      @onConfirm="onConfirm"
      ref="htDialog"
      :append-to-body='true'
  />
</template>

<script>
  import form from "@/api/form.js";
  export default {
    name: "eip-custom-view-dialog",
    props: {
      value: Array,
      name: String,
      single: Boolean,
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
          { prop: "alias", label: "别名" },
          { prop: "sqlAlias", label: "sql别名" }
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
      handleClose(){},
      handleLoad(param, cb) {
        form.getCustomViews(param)
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
  }
</script>

<style scoped>

</style>
