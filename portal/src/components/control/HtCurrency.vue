<template>
  <div class="inputs" ref="inputs" v-express>
    <el-tooltip :placement="tooltipplacement||$tooltipplacement" :disabled="inputWriteable && !errors.has('custom-form.'+inputName)">
      <div  slot="content">{{errors.first('custom-form.'+inputName)}}</div>
      <el-input-number 
          size="small"
          v-if="inputWriteable"
          v-validate="inputValidate"
          :name="inputName"
          :placeholder="placeholder?placeholder:'请输入内容'"
          clearable
          v-model="inputVal"
          :ref="this.atter"
          controls-position="right"
          :min="min" 
          :max="max"
          :step="step">
      </el-input-number>
    </el-tooltip>
    <span v-if="!inputWriteable && option.filterthousandBit=='thousandBit'"> {{inputVal | numFilter(option.filterthousandBit) }} </span>
    <span v-else-if="!inputWriteable && option.filtercurrency=='currency'"> {{inputVal | numFilter(option.filtercurrency) }} </span>
		<span v-else-if="!inputWriteable"> {{inputVal}} </span>
    <span style="display:none;" v-validate>
      <slot name="labeldesc">{{inputName}}</slot>
    </span>
  </div>
</template>
<script>
import utils from "@/utils.js";
import FormMath from "@/math.js";
import { Message } from "element-ui";

export default {
  name: "ht-input",
  props: [
    "validate",
    "value",
    "name",
    "permission",
    "atter",
    "inputType",
    "placeholder",
    "tooltipplacement",
		"htfuncexp",
		"option"
  ],
  data() {
    return {
    };
  },
  computed: {
    inputVal: {
      get() {
        return this.value;
      },
      set(val) {
		if(this.option.decimalDigits){
			val = val.toFixed(this.option.decimalDigits);
		}
        this.$emit("input", val);
      }
    },
    inputWriteable: function() {
      return utils.getWriteable(this.permission);
    },
    inputValidate: function() {
      var validateObj = this.$store.state.index.validate;
      return utils.addRequiredOrNot(
        this.permission,
        this.validate,
        validateObj,
        this
      );
    },
    inputName: function() {
      let labeldesc = "";
      if(this.$slots && this.$slots.labeldesc && this.$slots.labeldesc[0].children && this.$slots.labeldesc[0].children[0].text ){
        labeldesc = this.$slots.labeldesc[0].children[0].text;
        return this.name ? this.name : utils.getName()+ "-" +labeldesc;
      }else{
        return this.name ? this.name : utils.getName();
      }
    },
	min: function(){
		return this.option.min || 0;
	},
	max: function(){
		return this.option.max || 999999;
	},
	step: function(){
		return this.option.step || 1;
	}
  },
  mounted() {
		let _me = this;
		const exp = this.htfuncexp;
		if (exp) {
		  const elAttr = this.$refs.inputs.getAttribute("attr");
		  
		  const fields = FormMath.parseFuncexpField(exp);
		  const formVm = utils.getOnlineFormInstance(_me);
		  formVm.$on(elAttr, function(args) {
		    if (args.hasOwnProperty("index")) {
		      const subScopeEl = utils.getParentElementByAttribute(
		        _me.$el,
		        "data-subname"
		      );
		      if (!subScopeEl) {
		        throw "要计算子表行数据的输入框不在包含data-subname属性的元素中.";
		      }
		      const index = subScopeEl.dataset["index"];
		      if (index === undefined) {
		        throw "要计算的子表行未获取到index属性.";
		      }
		      if (index === args.index) {
		        _me.$emit("input", args.result);
		      }
		    } else {
		      _me.$emit("input", args.result);
		    }
		  });
		  fields.forEach(ele => {
		    if (formVm.watchMap.has(ele)) {
		      let ary = formVm.watchMap.get(ele);
		      ary.push({ target: elAttr, exp });
		      formVm.watchMap.set(ele, ary.unique("target"));
		    } else {
		      formVm.watchMap.set(ele, [{ target: elAttr, exp }]);
		    }
		  });
		}
  },
  beforeDestroy() {
  },
  created() {

    this.$validator = this.$root.$validator;
  },
  destroyed() {
    sessionStorage.removeItem(this.atter);
  }
};
</script>
<style lang="stylus" scoped>
div[aria-invalid='true'] >>> .el-input__inner, div[aria-invalid='true'] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
</style>