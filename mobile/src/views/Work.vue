<template>
  <el-container class="work-container">
    <!-- <div class="tab-bar"> -->
    <div class="work-header__flow">
      <div class="title-divider">默认应用</div>
      <div class="work-header__items">
        <router-link to="/work/startFlowList" tag="div">
          <div class="container">
            <div class="container_icon icon__yellow__bg">
              <i class="icon-release"></i>
            </div>
            <div class="container_box">
              <p class="container_box_title">新建流程</p>
            </div>
          </div>
        </router-link>
        <router-link to="/work/myRequest" tag="div">
          <div class="container">
            <div class="container_icon icon__blue__bg">
              <i class="icon-huojian"></i>
            </div>
            <div class="container_box">
              <p class="container_box_title">我的请求</p>
            </div>
          </div>
        </router-link>
        <router-link to="/work/myMatters" tag="div">
          <div class="container">
            <div class="container_icon icon__blue__bg">
              <i class="icon-yiban1"></i>
            </div>
            <div class="container_box">
              <p class="container_box_title">待办已办</p>
            </div>
          </div>
        </router-link>
        <router-link to="/work/myNotice" tag="div">
          <div class="container">
            <div class="container_icon icon__blue__bg">
              <i class="icon-sync"></i>
            </div>
            <div class="container_box">
              <p class="container_box_title">我的抄送</p>
            </div>
          </div>
        </router-link>
        <router-link to="/work/MyTurnOutList" tag="div">
          <div class="container">
            <div class="container_icon icon__blue__bg">
              <i class="icon-jurassic_transform"></i>
            </div>
            <div class="container_box">
              <p class="container_box_title">我的转办</p>
            </div>
          </div>
        </router-link>
      </div>
    </div>
    <div class="apply-center__wrap">
      <div class="title-divider apply-center">应用中心</div>
      <van-tabs sticky swipeable :ellipsis="false" line-width="30">
        <van-tab
          v-for="(item, index) in appTree"
          :title="item.typeName"
          :key="index"
        >
          <!-- <div class="apply-center__items">
            <div
              v-for="(app, index2) in item.appList"
              :key="index2"
              :text="app.name"
              @click="clickGrid(app)"
              class="apply-center__item"
            >
              <i
                  :class="app.icon"
                  :style="{color: app.iconColor}"
                  class="app-icon"
                ></i>
              <div class="app-name">{{ app.name }}</div>
            </div>
          </div> -->
          <div class="apply-center__items apply-center__no-collapse">
                <div
                  v-for="(app, index2) in item.appList"
                  :key="index2"
                  :text="app.name"
                  @click="clickGrid(app)"
                  class="apply-center__item"
                >
                  <div :style="{background:app.iconColor}" class="app-icon__bg">
                    <i
                      :class="app.icon"
                      class="app-icon"
                    ></i>
                  </div>
                  <div class="app-name" 
                  :class="{
                    'name-style':app.name.length === 2,
                    'name-margin__left':app.name.length === 1,
                    'app-name__style':app.name.length >= 4
                     }" >{{ app.name }}</div>
                </div>
              </div>
          <van-collapse
            v-if="item.children.length > 0"
            v-model="activeCollapse"
          >
            <van-collapse-item
              v-for="(child, index3) in item.children"
              :key="index3"
              :title="child.typeName"
              :name="index3 + ''"
            >
              <div class="apply-center__items">
                <div
                  v-for="(app2, index4) in child.appList"
                  :key="index4"
                  @click="clickGrid(app2)"
                  class="apply-center__item"
                >
                  <div :style="{background:app2.iconColor}" class="app-icon__bg">
                    <i
                      :class="app2.icon"
                      class="app-icon"
                    ></i>
                  </div>
                  <div class="app-name" 
                  :class="{
                    'name-style':app2.name.length === 2,
                    'name-margin__left':app2.name.length === 1,
                    'app-name__style':app2.name.length >= 4
                     }" >{{ app2.name }}</div>
                </div>
              </div>
            </van-collapse-item>
          </van-collapse>
        </van-tab>
      </van-tabs>
      <!-- </div> -->
      <tabBar :activeIndex="2"></tabBar>
    </div>
    <ht-sidebar-dialog
      width="100%"
      :title="chartName"
      :visible="isChart"
      :before-close="beforeCloseDialog"
    >
      <eip-chart :id="chartId" v-if="isChart" />
    </ht-sidebar-dialog>
  </el-container>
</template>

<script>
const eipChart = () => import('@/components/eipControl/bus/EipChart.vue')
import {Grid, GridItem, Image, Tab, Tabs, Collapse, CollapseItem} from 'vant'
const tabBar = () => import('@/components/tabbar/TabBar.vue')
import req from '@/request.js'
export default {
  components: {
    eipChart,
    [Grid.name]: Grid,
    [GridItem.name]: GridItem,
    [Image.name]: Image,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [Collapse.name]: Collapse,
    [CollapseItem.name]: CollapseItem,
    tabBar,
  },
  data() {
    return {
      chartId: '',
      chartName: '',
      isChart: false,
      appTree: [],
      activeCollapse: ['0', '1', '2', '3'],
    }
  },
  mounted() {
    this.$route.path !== '/' &&
      this.$store.dispatch('user/loadCurrentUserDetail')
    this.getSysType()
  },
  methods: {
    beforeCloseDialog() {
      this.isChart = false
    },
    getSysType() {
      req
        .get('${portal}/portal/appModel/v1/getApp?typeKey=appType')
        .then((resp) => {
          if (resp.data && resp.data.length > 0) {
            this.appTree = resp.data
          }
        })
    },
    clickGrid(app) {
      if (app.mode === 1) {
        this.$router.push(app.content)
      } else if (app.mode === 2) {
        window.location.href = app.content
      } else if (app.mode === 3) {
        let json = JSON.parse(app.content)
        this.$router.push(`/template/preview/${json.alias}`)
      } else if (app.mode === 4) {
        let json = JSON.parse(app.content)
        this.chartId = json.id
        this.chartName = '【图表】' + json.name
        this.isChart = true
      } else if (app.mode === 5) {
        let json = JSON.parse(app.content)
        this.$router.push('work/agentStart/' + json.id + '/0')
      }
    },
  },
}
</script>
<style lang="scss" scoped>
/deep/.van-tabs__wrap--scrollable .van-tabs__nav--complete{
  padding-left: 2px;
}
/deep/.van-cell{
  padding: 10px 13px;
}
.work-container {
  display: flex;
  flex-direction: column;
  background: #ecedef;
  .work-header__flow {
    background: #fff;
    width: calc(100% - 46px);
    height: 90px;
    border-radius: 10px;
    padding: 20px 13px;
    margin: 10px;
    .work-header__items {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }
  }
  /deep/.container {
    padding-bottom: 5px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .container_icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      font-size: 20px;
      color: #fff;
      line-height: 40px;
      text-align: center;
    }
    .icon__blue__bg {
      background: rgba(54, 143, 255, 1);
    }
    .icon__yellow__bg {
      background: rgba(255, 155, 89, 1);
    }
    .container_box {
      text-align: center;
      .container_box_title,
      .container_box_count {
        margin: 6px 0 0 0;
        font-size: 13px;
        font-family: 'Microsoft YaHei';
        font-weight: 500;
        color: rgb(19, 18, 18);
      }
      .container_box_count {
        margin-top: 0;
      }
    }
  }
}
.work_box {
  padding: 15px;
  background: #fff;
}
.work_linkTit {
  font-size: 16px;
  color: #262626;
  line-height: 20px;
}
.work_link_cell {
  width: 25%;
  float: left;
  text-align: center;
  padding-top: 20px;
}
.work_link_img {
  width: 32px;
  height: 32px;
}
.work_link_text {
  display: block;
  font-size: 14px;
  color: #5e5d5d;
  line-height: 20px;
}
.work_requestIcon,
.work_approvalIcon,
.work_transferIcon,
.work_sendIcon,
.work_moreIcon {
  display: block;
  width: 100%;
  height: 50px;
  background: url(../assets/img/work_requestIcon.png) no-repeat center top;
  background-size: 50px 50px;
}
.work_approvalIcon {
  background: url(../assets/img/work_approvalIcon.png) no-repeat center top;
}
.work_transferIcon {
  background: url(../assets/img/work_transferIcon.png) no-repeat center top;
}
.work_sendIcon {
  background: url(../assets/img/work_sendIcon.png) no-repeat center top;
}
.work_moreIcon {
  background: url(../assets/img/work_flowIcon.png) no-repeat center top;
}
.tab-bar {
  margin: 9px;
}
.title-divider {
  margin: 0;
  color: #333;
  font-weight: 700;
  font-size: 16px;
  line-height: 16px;
}
.apply-center__wrap {
  margin:  0 10px 10px 10px;
}
.apply-center {
  height: 30px;
  background: #fff;
  border-radius: 10px 10px 0 0;
  padding: 20px 13px 0 13px;
}
.app-icon {
  font-size: 35px;
}
/deep/.van-tab {
  font-size: 15px;
  color: #828080;
  font-weight: 400;
}
/deep/.van-tab--active {
  color: #000;
}
/deep/.van-tabs {
  background-color: #fff;
}
/deep/.van-tabs--line .van-tabs__wrap {
  height: 28px;
}
/deep/.van-tabs__line {
  background-color: rgba(54, 143, 255, 1);
  height: 1px;
}
.default-grid {
  background-color: #fff;
  padding-top: 5px;
  padding-bottom: 5px;
}
.van-tabs >>> .van-tabs__content {
  padding-top: 5px;
  padding-bottom: 5px;
}
.van-tabs >>> .first-app-grid {
  padding-bottom: 5px;
}
/deep/ .van-tabs__content {
  margin-top: 5px;
  border-top: 1px solid rgba(236, 237, 239, 1);
}
/deep/.van-collapse-item--border::after {
  border-top: 1px solid #ccc;
}
/deep/.van-grid-item__content--surround::after {
  border-width: 0;
}
/deep/.van-hairline--top::after {
  border-top-width: 0;
}
/deep/.van-grid-item__content::after {
  border: none;
}
.apply-center__items{
  display: flex;
  flex-wrap: wrap;
  .app-icon__bg{
    width: 40px;
    height: 40px;
    border-radius: 6px;
    line-height: 40px;
    text-align: center;
    .app-icon{
      color: #fff;
      font-size: 20px;
    }
  }
  .apply-center__item{
    width: 20%;
    margin-left: 3px;
  }
}
.apply-center__no-collapse{
  padding: 10px 16px;
}
.app-name {
  color: #828080;
  font-size: 13px;
  margin-top: 6px;
  width: 52px;
  word-wrap: break-word;
}
.name-style{
  margin-left: 6px;
}
.name-margin__left{
  margin-left: 12px;
}
.app-name__style{
  margin-left: -5px;
}
</style>
