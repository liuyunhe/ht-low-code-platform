<template>
    <div>
      <el-switch
      style="display: block"
      v-validate="inputValidate"
      v-model="inputVal"
      active-color="#13ce66"
      inactive-color="#ff4949"
      :active-value="activeValue"
      :inactive-value="inactiveValue"
      :active-text="activeText"
      :inactive-text="inactiveText"
      :disabled="permission_sub == 'r'"
      v-if="permission_sub!='n'"
      >
    </el-switch>
    <ht-field-tail v-if="permission_sub!='n'" v-show="permission_sub == 'b'"  :fieldName="inputName" ></ht-field-tail>
    </div>
</template>
<script>
import utils from "@/hotent-ui-util.js";
import sub_pio_mixin from "@/sub-permission-mixin.js";
export default {
  name: "eip-switch",
  props:[ 
    "validate",
    "value",
    "name",
    "permission",
    "activeValue",
    "inactiveValue",
    "activeText",
    "inactiveText"
    ],
  mixins: [sub_pio_mixin],//混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub_sub）
  data() {
    return {
      inputName:null,
      newValidate:null
    };
  },
   computed: {
    inputVal: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      }
    },
    inputValidate: function() {
      if(this.newValidate){
        return this.newValidate;
      }
      return this.validate;
    },
   },
 mounted() {
    const { subScopeEl, index } = hotentUiUtils.getSubScopeElAndIndex(this.$el);
    //如果是编辑或者必填的情况下。但是该行不允许编辑，则将权限修改为只读
    if (subScopeEl && (subScopeEl.getAttribute("row_readonly") == 'true' || subScopeEl.getAttribute("row_readonly") === true) && (this.permission_sub =='w'|| this.permission_sub =='b' )) {
      this.permission_sub = 'r';
    }
  },
  created() {
    this.inputName = this.name ? this.name : utils.getName();
  }
};
</script>
<style lang="scss" scoped>
div[aria-invalid='true'] /deep/ .el-input__inner, div[aria-invalid='true'] /deep/ .el-input__inner:focus {
  border-color: #f56c6c;
}
/deep/ .el-switch{
  line-height: unset;
  height: unset;
}
</style>
