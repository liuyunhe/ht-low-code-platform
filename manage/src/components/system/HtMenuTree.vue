<template>
  <el-scrollbar style="height:100%">
    <ht-tree
      :data="treeData"
      :props="defaultProps"
      :support-filter="supportFilter"
      :highlight-current="highlightCurrent"
      :default-expand-all="defaultExpandAll"
      :default-expanded-keys="['-1','1']"
      :default-checked-keys="defaultCheckedKeys"
      :node-key="nodeKey"
      :show-checkbox="showCheckbox"
      :render-content="renderContent"
      :expand-on-click-node="false"
      @node-click="handleNodeClick"
      @refresh="loadData"
      ref="htMenuTree"
    >
      <!-- 作用域插槽：插槽prop -->
      <slot slot-scope="{ node, data }" :node="node" :data="data"></slot>
    </ht-tree>
  </el-scrollbar>
</template>

<script>
import portalApi from "@/api/portal.js";

export default {
  name: "ht-menu-tree",
  props: {
    supportFilter: {
      type: Boolean,
      default: false
    },
    highlightCurrent: {
      type: Boolean,
      default: false
    },
    defaultExpandAll: {
      type: Boolean,
      default: false
    },
    showCheckbox: {
      type: Boolean,
      default: false
    },
    renderContent: {
      type: Function
    },
    defaultCheckedKeys: {
      type: Array
    },
    nodeKey: {
      type: String,
      default: "alias"
    }
  },
  data() {
    return {
      treeData: [],
      defaultProps: {
        children: "children",
        label: "name"
      }
    };
  },
  methods: {
    handleNodeClick(node) {
      this.$emit("node-click", node);
    },
    loadData(cb) {
      portalApi.getMenuTree().then(data => {
        data[0].children = data[0].children.filter(item => item.id!="2");
        this.treeData = data;
      }).finally(()=>{
        cb && cb()
      });
    }
  },
  mounted() {
    this.loadData();
  }
};
</script>
<style lang="scss" scoped>

/deep/ .el-tree .el-tree__empty-block {
  margin: 20px 20px;
}

/deep/ .el-tree {
  width: 100%;
}

/deep/ .el-scrollbar__wrap {
  overflow-x: hidden;
  margin-bottom: 0 !important;
}
</style>
