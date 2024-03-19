<template>
  <ht-demension
    v-model="value"
    :validate="validate"
    :name="name"
    select-label="name"
    :placeholder="placeholder"
    :permission="permission"
    :single="single"
    :config="config"
    :data="data"
    :table-columns="tableColumns"
    :pagination="pagination"
    quick-search-props="demName,demCode"
    :append-to-body="appendToBody"
    @load="handleLoad"
    @valueChange="valueChange"
  />
</template>
<script>
import utils from "@/hotent-ui-util.js";

export default {
  name: "my-demension",
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
        { prop: "name", label: "名称" },
        { prop: "code", label: "编码" },
        { prop: "demDesc", label: "描述" }
      ],
      pagination: {
        page: 1,
        pageSize: 50,
        total: 0
      }
    };
  },
  methods: {
    handleLoad(param, cb) {
      let _this=this;
      this.$http
        .post("${uc}/api/demension/v1/dems/getDemListAll", param)
        .then(function(response) {
          let data = response.data;
          _this.data = data.rows;
          _this.pagination.page = data.page;
          _this.pagination.pageSize = data.pageSize;
          _this.pagination.total = data.total;
          cb();
        })
        .catch(function(error) {
          cb();
        });
    },
    valueChange(value) {
      this.$emit("input", value);
    }
  }
};
</script>
