<template>
  <ht-dialog
    :single="single"
    :data="data"
    :table-columns="tableColumns"
    :pagination="pagination"
    search-placeholder="通过资源KEY，资源值查询"
    dialog-title="国际化资源对话框"
    quick-search-props="key,val"
    @load="handleLoad"
    @onConfirm="onConfirm"
    ref="htDialog"
    select-label="key_"
    :destroy-on-close="destroyOnClose"
  />
</template>
<script>
import portal from "@/api/portal.js";

export default {
  name: "eip-I18n-dialog",
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
      ],
      pagination: {
        page: 1,
        pageSize: 50,
        total: 0
      }
    };
  },
  mounted(){
    this.tableColumns=[];
    this.tableColumns.push({ prop: "key_", label: "资源KEY" });
    //查询所有语种类型
    portal.geti18nMessageTypeAll().then(data => {
      if (data && data.length > 0) {
        data.forEach(item => {
          this.tableColumns.push({ prop: item.type, label: item.desc });
        });
        console.log(JSON.stringify(this.tableColumns));
      }
    });
  },
  methods: {
    showDialog() {
      this.$refs.htDialog.showDialog();
    },
    handleLoad(param, cb) {
      portal.getI18nMessagePageJson(param)
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
