<template>
  <mobile-job-selector
    v-model="value"
    :validate="validate"
    :name="inputName"
    select-label="name"
    :placeholder="placeholder"
    :permission="permission_sub"
    :single="single"
    :config="config"
    :data="data"
    :table-columns="tableColumns"
    :pagination="pagination"
    quick-search-props="name,code"
    :append-to-body="appendToBody"
    @load="handleLoad"
    @valueChange="valueChange"
    v-if="permission_sub!='n'"
  />
</template>
<script>
import utils from "@/hotent-ui-util.js";
import sub_pio_mixin from "@/sub-permission-mixin.js";
import MobileJobSelector from "@/components/eipControl/selector/common/MobileJobSelector.vue";
export default {
  components: {
    MobileJobSelector
  },
  name: "eip-job-selector",
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
      default: true
    }
  },
  mixins: [sub_pio_mixin],//混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission）
  data() {
    return {
      data: [],
      tableColumns: [
        { prop: "name", label: "名称" },
        { prop: "code", label: "编码",width: "150" }
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      }
    };
  },
  computed:{
    inputName: function() {
      let labeldesc = "";
      if (
        this.$parent.$slots &&
        this.$parent.$slots.label &&
        this.$parent.$slots.label[0].children &&
        this.$parent.$slots.label[0].children[0].text
      ) {
        labeldesc = this.$parent.$slots.label[0].children[0].text;
        return this.name ? this.name : utils.getName() + "-" + labeldesc;
      } else {
        return  this.name ? this.name : utils.getName();
      }
    },
  },
  methods: {
    handleLoad(param, cb) {
      let _this=this;
      this.$http
        .post("${uc}/api/job/v1/jobs/getJobPage", param)
        .then(response => {
          let data = response.data;
          _this.data = data.rows;
          _this.pagination.page = data.page;
          _this.pagination.pageSize = data.pageSize;
          _this.pagination.total = data.total;
        })
        .finally(() => {
          cb();
        });

    },
    valueChange(value) {
      this.$emit("input", value);
    }
  }
};
</script>
