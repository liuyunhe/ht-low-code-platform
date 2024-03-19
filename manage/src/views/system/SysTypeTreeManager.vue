<template>
  <el-row class="fullheight">
    <el-col :span="6" class="fullheight">
      <el-card shadow="hover" class="fullheight">
        <template v-slot:header>点击分类标识</template>
        <ht-tree
          :data="options"
          :props="{label:'name'}"
          support-filter
          @node-click="handleNodeClick"
        ></ht-tree>
      </el-card>
    </el-col>
    <el-col :span="18" class="fullheight">
      <el-card shadow="hover" class="fullheight">
        <template v-slot:header>分类管理</template>
        <ht-aside-tree
          v-if="catId"
          :cat-id="catId"
          :has-navbar-collapse="false"
          :default-expanded-keys="defaultExpandedKeys"
          :has-footer="false"
          width="35%"
        />
      </el-card>
      <div class="form-empty">鼠标经过分类树有设置按钮可弹出操作菜单</div>
    </el-col>
  </el-row>
</template>
<script>
import portalApi from "@/api/portal.js";
const htAsideTree = () => import("@/components/common/HtAsideTree.vue");
export default {
  components: {
    htAsideTree
  },
  data() {
    return {
      catId: "",
      options: []
    };
  },
  computed: {
    defaultExpandedKeys: function() {
      let defaultExpandedKeys = [];
      defaultExpandedKeys.push(this.catId);
      return defaultExpandedKeys;
    }
  },
  mounted() {
    this.handleSelectOptions();
  },
  methods: {
    handleSelectOptions() {
      portalApi.getSysCat().then(data => {
        this.options = data.sysCategoryList;
        this.catId = data.sysCategory.id;
      });
    },
    handleNodeClick(data) {
      this.catId = data.id;
    }
  }
};
</script>

<style lang="scss" scoped>
.form-empty {
  position: absolute;
  text-align: center;
  width: 300px;
  font-size: 20px;
  top: 200px;
  left: 65%;
  margin-left: -150px;
  color: #ccc;
}
>>> .el-card__body{
  height: 100%;
}
</style>
