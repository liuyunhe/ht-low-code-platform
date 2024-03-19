<template>
  <div>
    <ht-role-selector
      v-model="value"
      :validate="validate"
      select-label="name"
      :placeholder="placeholder"
      :permission="permission_sub"
      :single="single"
      :config="config"
      :name="inputName"
      :data="data"
      :table-columns="tableColumns"
      :pagination="pagination"
      :append-to-body="appendToBody"
      @load="handleLoad"
      @valueChange="valueChange"
      quick-search-props="name,code"
      v-if="permission_sub!='n'"
    >
      <span style="display:none;"  v-validate>
      <slot name="labeldesc">{{inputName}}</slot>
    </span>
    </ht-role-selector>
  </div>
</template>
<script>
import utils from "@/hotent-ui-util.js";
import sub_pio_mixin from "@/sub-permission-mixin.js";

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
  mixins: [sub_pio_mixin],//混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission）
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
  computed:{
    inputName: function() {
      let labeldesc = "";
      if(this.$slots && this.$slots.labeldesc && this.$slots.labeldesc[0].children && this.$slots.labeldesc[0].children[0].text){
        labeldesc = this.$slots.labeldesc[0].children[0].text;
        return this.name ? this.name : utils.getName()+ "-" +labeldesc;
      }else{
        return this.name ? this.name : utils.getName();
      }
    }
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
