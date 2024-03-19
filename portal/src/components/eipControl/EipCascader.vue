<template>
  <div class="inputs" ref="inputs" v-express>
    <el-cascader
      :props="props"
      v-if="inputWriteable && permission_sub!='n'"
      v-validate="inputValidate"
      :name="inputName"
      :validate="validate"
      :placeholder="placeholder ? placeholder : '请选择'"
      v-model="inputVal"
      :ref="this.atter"
      clearable
      v-dynamic-options="{cache:true}"
    ></el-cascader>
    <ht-field-tail :fieldName="inputName" v-if="permission_sub!='n'" :readonly="!inputWriteable" :inputValue="inputVal"></ht-field-tail>
    <span style="display:none;" v-validate>
      <slot name="labeldesc">{{ inputName }}</slot>
    </span>
  </div>
</template>

<script>
import utils from "@/utils.js";
import hotentUtils from "@/hotent-ui-util.js";
import sub_pio_mixin from "@/sub-permission-mixin.js";

export default {
  name: "eip-cascader",
  props: [
    "validate",
    "value",
    "name",
    "permission",
    "atter",
    "inputType",
    "placeholder",
    "ganged",
  ],
  mixins: [sub_pio_mixin],//混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub）
  data() {
    let _this = this;
    return {
      lazyLoadResolve: null,
      props: {
        value: _this.ganged.valueBind,
        label: _this.ganged.labelBind,
        lazy: true,
        lazyLoad(node, resolve) {
          _this.dynamicLoadOption(node, resolve);
        },
      },
    };
  },
  computed: {
    inputVal: {
      get() {
        if (this.value) {
          if (this.value.constructor == String) {
            if (!this.value) {
              return "";
            }
            let cascaderModel = JSON.parse(this.value);
            if (!this.inputWriteable) {
              return cascaderModel.pathLabels.join("/");
            }
            return cascaderModel.path;
          }
          return this.value.path;
        } else {
          return this.value;
        }
      },
      set(val) {
        let selectValArr = this.$refs[this.atter].getCheckedNodes(false);
        if (selectValArr.length > 0 && selectValArr[0] !== null) {
          let result = {
            path: selectValArr[0].path,
            pathLabels: selectValArr[0].pathLabels,
          };
          this.$emit("input", JSON.stringify(result));
        }
      },
    },
    inputWriteable: function () {
      return utils.getWriteable(this.permission_sub);
    },
    inputValidate: function () {
      var validateObj = this.$store.state.index.validate;
      return utils.addRequiredOrNot(
        this.permission_sub,
        this.validate,
        validateObj,
        this
      );
    },
    inputName: function () {
      let labeldesc = "";
      if (
        this.$slots &&
        this.$slots.labeldesc &&
        this.$slots.labeldesc[0].children &&
        this.$slots.labeldesc[0].children[0].text
      ) {
        labeldesc = this.$slots.labeldesc[0].children[0].text;
        return this.name ? this.name : utils.getName() + "-" + labeldesc;
      } else {
        return this.name ? this.name : utils.getName();
      }
    },
  },
  created() {
    if (
      !this.ganged ||
      !this.ganged.alias ||
      !this.ganged.valueBind ||
      !this.ganged.labelBind
    ) {
      const msg = `级联控件【${this.inputName}】未正确的设置选项配置`;
      this.$message.error(msg);
      throw msg;
    }
    // 动态选项所绑定的关联查询返回了查询结果
    this.$on("dynamic-options:update", this.dynamicOptionResponse);
    this.$validator = this.$root.$validator;
  },
  methods: {
    // 动态加载选项
    dynamicLoadOption: function (node, resolve) {
      this.lazyLoadResolve = resolve;
      setTimeout(() => {
        const params = this.prepareLoadParams(this.ganged.bind, node);
        this.$emit("dynamic-options:load", this.ganged.alias, params);
      }, 0);
    },
    // 准备查询参数
    prepareLoadParams: function (condition, node) {
      let params = {};
      // 根节点，没有上一级节点时获取不到查询参数值
      if (node.level == 0) {
        return params;
      }

      if (condition && !hotentUtils.isEmpty(condition)) {
        Object.keys(condition).forEach((k) => {
          const val = node.data[condition[k]];
          if (!hotentUtils.isEmpty(val)) {
            params[k] = val;
          }
        });
      }
      return params;
    },
    // 动态加载选项返回值处理
    dynamicOptionResponse: function (alias, data) {
      if (this.lazyLoadResolve) {
        this.lazyLoadResolve(data);
        // 动态加载选项后触发组件视图更新
        this.$refs[this.atter].computePresentContent();
      }
    },
  },
};
</script>

<style scoped>
div[aria-invalid="true"] >>> .el-input__inner,
div[aria-invalid="true"] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
>>> .el-autocomplete {
  display: block;
}
</style>
