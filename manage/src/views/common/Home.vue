<template>
  <el-container>
    <el-main class="home-content">
      <el-row v-for="(grid, i) in gridList" :key="i" :gutter="grid.options.gutter">
        <div v-if="grid.type=='grid'">
          <el-col v-for="(columns, j) in grid.columns" :Key="j" :span="columns.span">
            <ht-column v-for="(cl, k) in columns.list" :key="k" :column-alias="cl.alias"/>
          </el-col>
        </div>
        <div v-if="grid.type=='tab'">
            <el-col :span="24">
              <ht-tabs-column :grid="grid" ></ht-tabs-column>
              </el-col>
        </div>
        <div v-if="!grid.type">
          <el-col :span="24">
            <ht-column :column-alias="grid.alias" />
          </el-col>
        </div>
      </el-row>
    </el-main>
  </el-container>
</template>
<script>
import portal from "@/api/portal.js";
let Base64 = require("js-base64").Base64;
import HtColumn from "@/components/common/HtColumn.vue";
import HtTabsColumn from "@/components/common/HtTabsColumn.vue";
export default {
  components: { HtColumn,HtTabsColumn },
  data() {
    return {
      layout: {},
      gridList: []
    };
  },
  created() {
    portal.getHomeLayout().then(data => {
      this.layout = JSON.parse(Base64.decode(data.value) || "{}");
      if (this.layout && this.layout.list && this.layout.list.length > 0) {
        this.gridList = this.layout.list;
      }
    });
  },
  methods: {}
};
</script>
<style lang="scss" scoped>
.home-content{
  padding-top: 5px;
  /deep/ .el-card{
    margin-bottom: 5px;
  }
}
  /deep/.el-main,/deep/.column-body{
     // 隐藏滚动条
      &::-webkit-scrollbar {
        width: 0;
        background-color: transparent;
      }
  }
@media (max-width: 1152px) {
  /deep/.flow_item {
    padding: 0 10px !important;
    .flow_item__bg{
        width: 32px !important;
        height: 32px !important;
        margin-top: 4px;
        span{
            font-size: 22px !important;
            padding: 6px !important;
        }
    }
    .flow_item__count{
        font-size: 14px !important;
        line-height: 26px !important;
    }
    .flow_item__text{
        zoom: 0.9;
        line-height: 26px !important;
    }
  }
}
</style>