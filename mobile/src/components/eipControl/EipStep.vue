<template>
	<div class="inputs">
		<el-steps :active="inputVal" :direction="direction" align-center finish-status="success">
		  <el-step v-for="item in stepList" :title="item.title" :description="item.description"></el-step>
		</el-steps>
	</div>
</template>
<script>
    import utils from "@/utils.js";
	export default {
		name: "ht-step",
		props: [
			'value',
			'direction',
			'content'
		],
		data() {
			return {
				active:1,
				stepList:[]
			};
		},
		computed:{
			inputVal:function(){
				if(!this.value){
				  return 1;
				}
				return this.value;
			}
		},
		mounted() {},
		created() {
			var contentjson = JSON.parse(this.content);
			this.stepList = contentjson;
		},
		methods: {}
	};
</script>
<style lang="stylus" scoped>
	
</style>
