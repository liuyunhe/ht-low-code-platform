<template>
  <div class="inputs">
    <ht-checkbox
      v-model="inputVal"
      :options="options"
      :option-layout="optionLayout"
      :validate="inputValidate"
      :name="inputName"
      :linkage="linkage"
      :style="styles"
      :permission="permission_sub"
      v-dynamic-options="{cache:true}"
    />
  </div>
</template>
<script>
import utils from "@/utils.js";
import hotentUtils from "@/hotent-ui-util.js";
import sub_pio_mixin from "@/sub-permission-mixin.js";

export default {
  name: "eip-checkbox",
  props: [
    "validate",
    "value",
    "name",
    "permission",
    "cklist",
    "linkage",
    "ganged",
    "styles",
    "optionLayout"
  ],
  mixins: [sub_pio_mixin],//混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub）
  data() {
    return {
      options: []
    };
  },
  computed: {
    inputVal: {
      get: function() {
        return this.value;
      },
      set: function(val) {
        this.$emit("input", val);
      }
    },
    inputValidate: function() {
      var validateObj = this.$store.state.index.validate;
      return utils.addRequiredOrNot(
        this.permission_sub,
        this.validate,
        validateObj,
        this
      );
    },
    inputName: function() {
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
    }
  },
  mounted() {
    const _me = this;
    const exp = this.linkage;
    if (
      exp &&
      exp.length > 0 &&
      (this.$parent.isView || this.$parent.$parent.$parent.isView)
    ) {
      const pInst = utils.getOnlineFormInstance(_me);
      _me.traces = {};

      exp.forEach(m => {
        m.effect.forEach(m => {
          const path = `permission.fields.${m.target}`;
          const oldVal = utils.getValueByPath(pInst, path);
          _me.traces[path] = oldVal;
        });

        _me.$watch(
          "inputVal",
          function(newVal, oldVal) {
            if (newVal !== oldVal) {
              newVal.forEach(newValue => {
                if (newValue === m.value) {
                  m.effect.forEach(ef => {
                    const p = `permission.fields.${ef.target}`;
                    let val = _me.traces[p];
                    _me.$store.dispatch("index/linkageValidate", ef);
                    utils.setValueByPath(pInst, p, ef.type);
                  });
                }
              });
            }
          },
          { immediate: true }
        );
      });
    }
    this.loadOption();
  },
  created() {
    // 动态选项所绑定的关联查询返回了查询结果
    this.$on("dynamic-options:update", this.dynamicOptionResponse);
    this.$validator = this.$root.$validator;
  },
  methods: {
    //加载选项
    loadOption: function() {
      // 动态选项
      if (this.ganged && this.ganged.alias) {
        this.dynamicLoadOption();
      } else {
        // 静态选项
        this.options = this.cklist ? JSON.parse(this.cklist) : [];
      }
    },
    // 动态加载选项
    dynamicLoadOption: function() {
      const params = this.prepareLoadParams(this.ganged.bind);
      this.$emit("dynamic-options:load", this.ganged.alias, params);
    },
    // 准备查询参数
    prepareLoadParams: function(condition) {
      let params = {};
      if (condition && !hotentUtils.isEmpty(condition)) {
        // 获取当前控件是否在子表某行中
        let { index } = hotentUtils.getSubScopeElAndIndex(this.$el);

        const pInst = utils.getOnlineFormInstance(this);
        Object.keys(condition).forEach(k => {
          let val = null;
          // 主表
          if (index == null) {
            val = utils.getValueByPath(pInst, condition[k]);
          }
          // 子表
          else {
            val = utils.getValueByPath(pInst, condition[k], index);
          }
          if (!hotentUtils.isEmpty(val)) {
            params[k] = val;
          }
        });
      }
      return params;
    },
    // 动态加载选项返回值处理
    dynamicOptionResponse: function(alias, data) {
      if (
        this.ganged &&
        this.ganged.alias == alias &&
        this.ganged.valueBind &&
        this.ganged.labelBind
      ) {
        this.options = [];
        if (data && data.constructor == Array && data.length > 0) {
          data.forEach(d => {
            let key = d[this.ganged.valueBind];
            if(key.constructor != String){
              key = key.toString();
            }
            this.options.push({
              key: key,
              value: d[this.ganged.labelBind]
            });
          });
        }
      } else if (
        this.ganged &&
        this.ganged.alias &&
        (!this.ganged.valueBind || !this.ganged.labelBind)
      ) {
        this.$message.error(
          `下拉框【${this.inputName}】配置了动态选项，但是没有正确的配置选项绑定关系。`
        );
      }
    }
  }
};
</script>
<style lang="stylus" scoped>
label.el-checkbox {
  margin: 1px 30px 0 0;
}

div.el-checkbox-group[aria-invalid='true'] {
  border: 1px solid #f56c6c;
  padding: 0 0 10px 10px;
}
</style>