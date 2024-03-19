<template>
	<div class="inputs" :style="styles">
		<span v-if="isrequired">*</span>
		<el-tooltip class="item" effect="dark" :disabled="noTips" placement="top-end">
			<div slot="content">
				<slot name="tipcontent"></slot>
			</div>
			<slot name="labeldesc"></slot>
		</el-tooltip>
	</div>
</template>
<script>
    import utils from "@/utils.js";
	export default {
		name: "ht-label",
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
			}
		},
		mounted() {},
		created() {},
		methods: {}
	};
</script>
<style lang="stylus" scoped>

</style>
