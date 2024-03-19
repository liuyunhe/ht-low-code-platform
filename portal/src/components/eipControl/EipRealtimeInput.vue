<template>
  <div class="inputs" ref="inputs">
    <el-input
      v-if="permission_sub!='n'"
      size="small"
      v-validate="inputValidate"
      :name="inputName"
      placeholder="请输入内容"
      style="width:90%;"
      clearable
      v-model="inputValue"
			v-html='this.inputValue'
			readonly
      @clear="clear"
    >
	</el-input>
	<span style="display:none;"  v-validate>
	  <slot name="labeldesc">{{inputName}}</slot>
	</span>
  </div>
</template>
<script>
import utils from "@/utils.js";
import { Message, Loading } from 'element-ui';
import { Base64 } from "js-base64";
import i18n from '@/lang/index.js';
import req from "@/request.js";
import sub_pio_mixin from "@/sub-permission-mixin.js";

export default {
  name: "ht-realtime-input",
  props: ["value", "name", "permission","option"],
  mixins: [sub_pio_mixin],//混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub）
  data() {
    return {
      inputValue:"",
      newValidate:null
    };
  },
  components: {

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
    inputWriteable: function() {
      return utils.getWriteable(this.permission_sub);
    },
    inputValidate: function() {
      if(this.newValidate){
        return this.newValidate;
      }
      var validateObj= this.$store.state.index.validate;
      return utils.addRequiredOrNot(this.permission_sub, this.validate ,validateObj ,this);
    },
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
  mounted() {
    if(this.value){
      this.inputValue = this.value;
    }
	let _me = this;
	if(this.option.script){
		let htCustomScript = Base64.decode(this.option.script);
		const formVm = utils.getOnlineFormInstance(_me);
		function evil() {
			let Fn = Function('req','data','i18n','Message','Loading','formVm','_this', htCustomScript); //一个变量指向Function，防止有些前端编译工具报错
			let result = Fn(req,formVm.data,i18n,Message,Loading,formVm,_me);
			return result;
		}
		let resultValue = evil();
		if(resultValue){
			this.inputValue = resultValue;
		}
	}
  },
  destroyed() {

  },
  created() {
    this.$validator = this.$root.$validator;
  },
  methods: {
    clear(){
		this.inputValue = "";
	}
  }
};
</script>
<style lang="stylus" scoped>
div[aria-invalid='true'] >>> .el-input__inner, div[aria-invalid='true'] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
.form-table {
  width: 100%;
  border-top: 1px solid #ebeef5;
  border-left: 1px solid #ebeef5;
}

.form-table th {
  text-align: left ;
  color: #666;
}

.form-table th > span {
  color: #f00;
}

.form-table th, .form-table td {
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  padding: 10px;
  min-width: 0;
  box-sizing: border-box;
  text-overflow: ellipsis;
  vertical-align: middle;
  position: relative;
}
</style>