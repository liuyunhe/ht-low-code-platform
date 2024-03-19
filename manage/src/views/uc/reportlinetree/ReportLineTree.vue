<template>
  <el-scrollbar style="height:100%;width: 100%">
    <ht-tree
      :data="treeData"
      :props="defaultProps"
      :support-filter="supportFilter"
      :default-expand-all="defaultExpandAll"
      node-key="id"
      :show-checkbox="showCheckbox"
      :render-content="renderContent"
      :expand-on-click-node="false"
      @node-click="handleNodeClick"
      @check="check"
    >
      <!-- 作用域插槽：插槽prop -->
      <slot slot-scope="{ node, data }" :node="node" :data="data"></slot>
    </ht-tree>
  </el-scrollbar>
</template>

<script>
import sysType from "@/api/sysType.js";
import utils from "@/hotent-ui-util.js";

export default {
  name: "ht-sys-type-tree",
  props: {
    typeId: {
      type: String | Number,
      default: ""
    },
    typeKey: {
      type: String | Number,
      default: ""
    },
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
    defaultExpandedKeys: {
      type: Array,
      default() {
        return [];
      }
    },
    showCheckbox: {
      type: Boolean,
      default: false
    },
    renderContent: {
      type: Function
    }
  },
  data() {
    return {
      treeData: [],
      defaultProps: {
        children: "children",
        label: "name"
      },
      _defaultExpandedKeys: []
    };
  },
  watch: {
    defaultExpandedKeys: {
      handler(newVal, oldVal) {
        if (newVal && newVal != oldVal) {
          this._defaultExpandedKeys = newVal;
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    handleNodeClick(node) {
      this.$emit("node-click", node);
    },
    check(data, checkedObj) {
      this.$emit("check", data, checkedObj);
    },
    loadData() {
      if (this.typeId) {
        sysType.getUserRelByTypeId(this.typeId).then(data => {
          this.treeData = utils.tile2nest(data);
        });
      }
    }
  },
  mounted() {
    this._defaultExpandedKeys = [this.typeId];
    this.loadData();
  }
};
</script>
<style lang="scss" scoped>
>>> .el-tree .el-tree__empty-block {
  margin: 20px 20px;
}
>>> .el-scrollbar__wrap {
  overflow-x: hidden;
}
</style>
