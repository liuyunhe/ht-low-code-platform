<template>
  <el-container class="home">
    <van-pull-refresh v-model="isLoading" @refresh="onRefresh" class="pull-refresh__wrap">
      <el-main>
        <div class="tab-bar">
          <el-row
            v-for="(grid, i) in gridList"
            :key="i"
            :gutter="grid.options.gutter"
          >
            <div v-if="grid.type == 'grid'">
              <el-col
                v-for="(columns, j) in grid.columns"
                :Key="j"
                :span="columns.span"
              >
                <ht-column
                  v-for="(cl, k) in columns.list"
                  :key="k"
                  :column-alias="cl.alias"
                ></ht-column>
              </el-col>
            </div>
            <div v-if="grid.type == 'tab'">
              <el-col :span="24">
                <ht-tabs-column :grid="grid"></ht-tabs-column>
              </el-col>
            </div>
            <div v-if="!grid.type">
              <el-col :span="24">
                <ht-column :column-alias="grid.alias"></ht-column>
              </el-col>
            </div>
          </el-row>
        </div>
        <tabBar :activeIndex="0"></tabBar>
      </el-main>
    </van-pull-refresh>
  </el-container>
</template>

<script>
import { pullRefresh } from "vant";
const tabBar = () => import("@/components/tabbar/TabBar.vue");
const HtColumn = () => import("@/components/eipControl/bus/HtColumn.vue");
const HtTabsColumn = () =>
  import("@/components/eipControl/bus/HtTabsColumn.vue");
export default {
  components: {
    tabBar,
    HtColumn,
    HtTabsColumn,
    [pullRefresh.name]: pullRefresh,
  },
  data() {
    return {
      layout: {},
      gridList: [],
      isLoading: false,
    };
  },
  created() {
    this.getLayout();
  },
  methods: {
    onRefresh() {
      this.getLayout();
    },
    getLayout() {
      let Base64 = require("js-base64").Base64;
      this.$store
        .dispatch("menu/myMobileHome")
        .then((data) => {
          this.layout = JSON.parse(Base64.decode(data.value) || "{}");
          if (this.layout && this.layout.list && this.layout.list.length > 0) {
            this.gridList = this.layout.list;
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
  },
};
</script>
<style lang="scss" scoped>
.pull-refresh__wrap{
  width: 100%;
}
.home{
  padding: 10px;
  background-color: rgba(236, 237, 239, 1);
}
</style>
