<template>
  <ht-role-selector
    v-model="value"
    :validate="validate"
    select-label="name"
    :placeholder="placeholder"
    :permission="permission"
    :single="single"
    :config="config"
    :data="data"
    :table-columns="tableColumns"
    :pagination="pagination"
    :append-to-body="appendToBody"
    @load="handleLoad"
    @valueChange="valueChange"
    quick-search-props="name,code"
  />
</template>
<script>
import utils from "@/hotent-ui-util.js";

export default {
  name: "eip-role-selector",
  props: {
    validate: [String, Object],
    value: String,
    name: String,
    placeholder: String,
    permission: String,
    single: Boolean,
    config: Object,
    appendToBody: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      data: [],
      tableColumns: [
        { prop: "name", label: "名称", width: "300" },
        { prop: "code", label: "编码" }
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
    handleLoad(queryFilter, cb) {
      let _this=this;
      this.$http.post("${uc}/api/role/v1/roles/getRolePage", queryFilter).then(
        response => {
          let data = response.data;
          _this.data = data.rows;
          _this.pagination.page = data.page;
          _this.pagination.pageSize = data.pageSize;
          _this.pagination.total = data.total;
          cb();
        },
        error => {
          cb();
        }
      );
    },
    valueChange(value) {
      this.$emit("input", value);
    }
  }
};
</script>
