<template>
	<el-form-item class="inputs" :label="labeldesc">
		<el-tooltip class="item" effect="dark" :disabled="noTips" placement="top-end">
			<div slot="content">
				<slot name="tipcontent"></slot>
			</div>
			<slot name="fieldControl"></slot>
		</el-tooltip>
	</el-form-item>
</template>
<script>
    import utils from "@/utils.js";
	export default {
		name: "ht-form-item",
		props: [
			"value",
			"name",
			"permission",
			"styles",
			"validate",
			"tips",
			"tipcontent"
		],
		data() {
			return {

			};
		},
		computed: {
			isrequired: function() {
				if(!this.validate){
					return false;
				}
				let ary = this.validate.split("|");
				if (ary.some((item) => item === "required")) {
					return true;
				}
				var validateObj = this.$store.state.index.validate;
				ary = utils.addRequiredOrNot(
					this.permission,
					this.validate,
					validateObj,
					this
				).split("|");
				if (ary.some((item) => item === "required")) {
					return true;
				}
				return false;
			},
			inputValidate: function() {
				
    	},
			noTips: function(){
				if(this.$slots && this.$slots.tipcontent && this.$slots.tipcontent[0].children &&  this.$slots.tipcontent[0].children.length ){
				  return false;
				}
				return true;
			},
			labeldesc: function(){
				if(this.isrequired){
						return  "*" + this.$slots.labeldesc[0].children[0].text;
				}
				
				return this.$slots.labeldesc[0].children[0].text ;
			}
		},
		mounted() {},
		created() {},
		methods: {}
	};
</script>
<style lang="stylus" scoped>

</style>
