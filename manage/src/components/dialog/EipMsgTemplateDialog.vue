<template>
  <ht-dialog
      single
      name="name"
      :data="data"
      :table-columns="tableColumns"
      :pagination="pagination"
      search-placeholder="模板编码,模板内容"
      dialog-title="消息模板对话框"
      quick-search-props="code,name"
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
    name: "eip-msg-template-dialog",
    data() {
      return {
        data: [],
        tableColumns: [
          { prop: "key", label: "模板编码" },
          { prop: "name", label: "模板名称"},
          { prop: "subject", label: "模板内容" }
        ],
        pagination: {
          page: 1,
          pageSize: 50,
          total: 0,
          showTotal: true
        }
      }
    },
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
    methods: {
      showDialog() {
        this.$refs.htDialog.showDialog();
      },
      handleLoad(queryFilter, cb) {
        req
          .post("${portal}/flow/MsgTemplate/v1/listJson", queryFilter)
          .then(response => {
            this.data = response.data.rows;
            this.pagination.page = response.data.page;
            this.pagination.pageSize = response.data.pageSize;
            this.pagination.total = response.data.total;
          }).finally(()=> cb());
      },
      onConfirm(selection) {
        this.$emit("onConfirm", selection[0].plain,this.name);
        if (this.value) {
          this.$emit("input", this.value + selection[0].plain);
        }else{
          this.$emit("input", selection[0].plain);
        }
      }
    }
  }
</script>

<style scoped>

</style>
