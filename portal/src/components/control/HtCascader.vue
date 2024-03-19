<template>
	  
		<div class="inputs" ref="inputs" v-express>
		  <el-tooltip :placement="tooltipplacement||$tooltipplacement" :disabled="inputWriteable && !errors.has('custom-form.'+inputName)">
		    <div  slot="content">{{errors.first('custom-form.'+inputName)}}</div>
		    <el-cascader 
					:props="props"
					v-if="inputWriteable"
					v-validate="inputValidate"
					:name="inputName"
					:placeholder="placeholder?placeholder:'请选择'"
					v-model="inputVal"
					:ref="this.atter"
					></el-cascader>
		  </el-tooltip>
		  <span v-if="!inputWriteable">{{inputVal}}</span>
		  <span style="display:none;" v-validate>
		    <slot name="labeldesc">{{inputName}}</slot>
		  </span>
		</div>
</template>
<script>
    import utils from "@/utils.js";
    export default {
			name: "ht-cascader",
			props: [
			  "validate",
			  "value",
			  "name",
			  "permission",
			  "htfuncexp",
			  "atter",
			  "inputType",
			  "htDatecalc",
			  "bindIdentityjson",
			  "placeholder",
			  "tooltipplacement",
				"ganged"
			],
      data() {
				let _this = this;
        return {
					config:null,
          props: {
						value:_this.ganged.valueBind,
						label:_this.ganged.labelBind,
            lazy: true,
            lazyLoad (node, resolve) {
							const _promise = _this.search(node);
							_promise.then(function(nodes){
									resolve(nodes);
								});
						}	
          }
        };
      },
			computed:{
				  inputVal: {
				    get() {
							if(this.value.constructor == String){
								if(!this.value){
									return "";
								}
								let cascaderModel = JSON.parse( this.value);
								if(!this.inputWriteable){
									return cascaderModel.pathLabels.join("/");
								}
								
								return cascaderModel.path;
							}
				      return this.value.path;
				    },
				    set(val) {
							let selectValArr = this.$refs[this.atter].getCheckedNodes(false);
							let result =  {path:selectValArr[0].path,pathLabels:selectValArr[0].pathLabels};
				      this.$emit("input",JSON.stringify(result));
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
				  }
			},
			created() {
				
			},
			methods:{
				async search(node){
					if (!this.config) {
						const res =  await this.$store.dispatch("form/getByAliasCq", this.ganged.alias);
						this.config = res;
						this.restfulUlr = this.config.url;
					}
					var str = this.config;
					var ganged = this.ganged;
					if (node) {
						let param = ""
						if(node && node.data){
							param = node.data[this.ganged.valueBind]
						};
						if (str.dsType == "dataSource") {
							let Base64 = require("js-base64").Base64;
							if (JSON.stringify(ganged.bind) === "{}") {
								str.queryData = Base64.encode(
									JSON.stringify([{ key: ganged.valueBind, value: param}])
								);
							} else {
								var queryData = [];
								for (var key in ganged.bind) {
									queryData.push({ key: key, value: param });
								}
								str.queryData = Base64.encode(JSON.stringify(queryData));
							}
						} else {
							var conditionfield = JSON.parse(str.conditionfield);
							var params = {};
							conditionfield.forEach(ele => {
									params[ele.field] = "";
									if(node && node.data){
										params[ele.field] = node.data[ganged.bind[ele.field]];
									}
							});
							str.url = this.restfulUlr + utils.queryParams(params,true);
						}
					} else {
						str.queryData = "";
					}
					
					const queryRes = await this.$store.dispatch("form/selectQuery", str);
					return queryRes.rows;
					
				}
			}
			
    };
</script>
<style lang="stylus" scoped>

</style>
