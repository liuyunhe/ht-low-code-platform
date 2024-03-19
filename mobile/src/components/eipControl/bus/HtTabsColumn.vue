<template>
  <div v-if="grid.type=='tab'" ref="tabs">
    <el-col :span="24" v-if="gridShow">
      <el-tabs
        class="widget-col"
        :v-model="activeName"
        :justify="grid.options.justify"
        :tab-position="grid.options.align"
        :type="grid.options.ctrlType"
        @tab-click="handleClick"
        ref="tabs"
      >
        <el-tab-pane v-for="(col, colIndex) in grid.columns" :key="colIndex" :name="colIndex + ''">
          <template slot="label">
            <el-tooltip
              class="item"
              v-if="col.span.length > 10"
              effect="dark"
              :content="col.span"
              placement="top-start"
            >
              <a>{{col.span.substring(0,10)}}</a>
            </el-tooltip>
            <span v-else>{{col.span}}</span>
          </template>
          <div v-if="isColumn"  v-loading="loading" class="ht-tab-pane">
            <ht-column
              v-for="(column, columnIndex) in col.list"
              :key="columnIndex"
              isTab
              :column-alias="column.alias"
              :fromPreview="true"
            ></ht-column>
          </div>
        </el-tab-pane>
        <el-tab-pane name="more" class="more-btn" disabled>
          <span slot="label">
            <el-button style="padding: 3px 0" type="text" title="更多" v-if="colUrl" @click.stop="$router.push({ path: colUrl });">
              <i class="el-icon-more" style="font-weight:bold;"></i>
            </el-button>
            <el-button style="padding: 3px 0" type="text" @click.stop="refresh" title="刷新">
              <i class="el-icon-refresh" style="font-weight:bold;"></i>
            </el-button>
            <el-button style="padding: 3px 0" type="text" @click.stop="gridShow=false" title="移除">
              <i class="el-icon-close" style="font-weight:bold;"></i>
            </el-button>
          </span>
        </el-tab-pane>
      </el-tabs>
    </el-col>
  </div>
</template>
<script>
import req from "@/request.js";
const HtColumn = () => import("@/components/eipControl/bus/HtColumn.vue");
export default {
  props: {
    grid: {
      type: Object
    }
  },
  components: { HtColumn },
  data() {
    return {
      gridShow: true,
      colUrl:"",
      activeName:"",
      isColumn:true,
      loading:false
    };
  },
  mounted() {
    // console.log(this.grid);
    this.activeName =this.grid.columns[0].span;
    this.load();
  },
  methods: {
    refresh() {
      this.loading =true;
      this.isColumn =false;
       var self = this;
    setTimeout(function() {
        self.isColumn =true;
      self.loading =false;
    }.bind(this), 200)
    },
    handleClick(tab, event) {
      if(this.grid.columns[tab.index].list.length !=0){
        this.load(this.grid.columns[tab.index].list[0].alias);
      }
    },
    load(alias) {
      if(!alias){
        alias =this.grid.columns[0].list[0].alias;
        this.activeName =this.grid.columns[0].span;
      }
      const this_ =this;
      req.get(window.context.portal+"/portal/sysIndexColumn/sysIndexColumn/v1/getByAlias?alias="+alias).then(response => {
           this_.colUrl = response.data.colUrl;
      })
    },
    close() {
      this.dialogVisible = false;
    },
    tabsClose() {
      this.$refs.tabs.remove();
    },
  },
};
</script>
<style scoped>
.navbar-default {
  height: 100%;
  background-image: none;
  background: #fff;
  border-radius: 0px;
  box-shadow: 0px 2px 5px rgba(86, 96, 117, 0.15);
  border-bottom: 1px solid #ededed;
  justify-content: space-between;
}

.navbar-default span {
  color: #666;
  font-size: 14px;
  line-height: 48px;
  font-weight: bold;
  margin-left: 20px;
}

.navbar-default button {
  margin-right: 10px;
}
.header {
  padding: 0;
  background: #fff;
  z-index: 7;
}

.controler-container {
  margin-right: 3px;
  box-shadow: 2px 0 5px #ededed;
}

.property-container {
  margin-left: 3px;
  box-shadow: -2px 0 5px #ededed;
}

.widget-form-container {
  background: #fafafa;
  position: relative;
  padding: 0 5px;
  margin-top: 1px;
}

.footer-container {
  border-top: 1px solid #ededed;
}
.form-editor-dialog >>> .el-dialog__header {
  display: none;
}

.form-editor-dialog >>> .el-dialog__body {
  padding: 0;
  height: 100%;
}
.widget-col {
  margin-bottom: 20px;
}
.widget-col >>> .el-tabs__nav{
  width: 100%;
}
.ht-tab-pane >>> .el-card{
  margin-bottom: 0px;
}
.widget-col >>> .el-tabs__nav .el-tabs__item:last-child {
  float: right;
}
.widget-col >>> .el-tabs__header{
  border-bottom: 0px;
}
.widget-col >>> .el-tabs__content{
  padding: 0px;
}
</style>