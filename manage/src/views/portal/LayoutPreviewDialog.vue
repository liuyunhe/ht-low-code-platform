<template>
  <el-dialog class="form-editor-dialog" fullscreen destroy-on-close :visible.sync="dialogVisible">
    <el-container>
        <el-header class="header" style="height: 45px;">
        <div class="navbar-default box-shadow flex">
          <span>布局预览</span>
          <div>
            <el-button type="danger" @click="close">关闭</el-button>
          </div>
        </div>
      </el-header>
      <el-main v-if="dialogVisible" class="layout-main__preview">
        <el-row v-for="(grid, i) in gridList" :key="i" :gutter="grid.options.gutter">
          <div v-if="grid.type=='grid'">
            <el-col v-for="(columns, j) in grid.columns" :Key="j" :span="columns.span">
              <ht-column v-for="(cl, k) in columns.list" :key="k" :column-alias="cl.alias" :fromPreview="true"></ht-column>
            </el-col>
          </div>
          <div v-if="grid.type=='tab'">
            <el-col :span="24">
              <ht-tabs-column :grid="grid" ></ht-tabs-column>
            </el-col>
          </div>
          <div v-if="!grid.type">
            <el-col :span="24">
              <ht-column :column-alias="grid.alias" :fromPreview="true"></ht-column>
            </el-col>
          </div>
        </el-row>
      </el-main>
    </el-container>
  </el-dialog>
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
      gridList: [],
      dialogVisible: false,
    };
  },
  methods: {
    showDialog(layoutId) {
      this.dialogVisible = true;
      this.loadData(layoutId);
    },
    loadData(layoutId) {
      portal.getLayoutMngById(layoutId).then(data => {
        this.layout = JSON.parse(Base64.decode(data.designHtml) || "{}");
        if (this.layout && this.layout.list && this.layout.list.length > 0) {
          this.gridList = this.layout.list;
        }
      });
    },
    close(){
      this.dialogVisible = false;
      this.layout = {};
      this.gridList = [];
    },
  }
};
</script>
<style scoped>
.layout-main__preview{
  margin: 0 auto;
}
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
</style>
