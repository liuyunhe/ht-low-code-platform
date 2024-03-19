<template>
	<div style="padding-top:5px;padding-bottom:5px;height:100%">
		<van-tabs class="van-tabs__box">
			<van-tab v-for="item in dataList" :title="item.name" :key="item.name">
				<home-news-list :classifyId='item.portalNewsId' v-if="item.type=='0'"/>
				<homeCarousel :classifyId='item.portalNewsId' v-else></homeCarousel>
			</van-tab>
		</van-tabs>
		<!-- <el-tabs >
			<el-tab-pane v-for="item in dataList" :label="item.name" :key="item.name">
				<home-news-list :classifyId='item.portalNewsId' v-if="item.type=='0'"/>
				<homeCarousel :classifyId='item.portalNewsId' v-else></homeCarousel>
			</el-tab-pane>
		</el-tabs> -->
	</div>
</template>

<script>
import { Tab, Tabs } from 'vant';
const homeNewsList = () => import("@/components/eipControl/bus/homeNewsList.vue");
const homeCarousel = () => import("@/components/eipControl/bus/homeCarousel.vue");
export default {
	name: 'indexNewsColumn',
	components: {
		homeNewsList,
		homeCarousel,
		[Tab.name]:Tab,
		[Tabs.name]:Tabs
		},
	props:['dataList']
}
</script>

<style lang="scss" scoped>
/deep/ .van-tab{
	font-size: 15px;
	height: 25px;
	justify-content: flex-start;
}
/deep/.van-tabs--line .van-tabs__wrap{
	height: 28px;
	padding: 0 16px;
}
/deep/.van-tab--active{
	font-weight: 800;
	position: relative;
	&::after{
		position: absolute;
		content: '';
		left: 14px;
		bottom: -1px;
		width: 30px;
		height: 1px;
		background:rgb(25, 137, 250) ;
		transition: 0.3;
	}
}
/deep/.van-tabs__box{
	height: 100%;
	.van-tabs__content{
		height: calc(100% - 32px);
		overflow: auto;
	}
}
/deep/.van-tabs__line{
	display: none;
}
</style>
