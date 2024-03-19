<template>
 <el-tabs v-model="activeTab" type="card">
    <el-tab-pane label="对话框选择器" name="first">
		<DialogDemo/>
	</el-tab-pane>
    <el-tab-pane label="图标库" name="second">
		<Iconfont/>
	</el-tab-pane>
  </el-tabs>
	
</template>

<script>
const DialogDemo = () =>
  import("@/views/demo/DialogDemo.vue");
  const Iconfont = () =>
  import("@/views/demo/Iconfont.vue");
export default {
	name: "Demo",
	components:{
		DialogDemo,
		Iconfont

	},
	data(){
		return {
			activeTab:"first"
		}
	}
}
</script>

<style lang="scss" scoped>

</style>