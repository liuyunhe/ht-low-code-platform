<template>
  <el-popover placement="bottom-start" v-model="visible">
    <ht-tree
      style="max-height:400px;width:300px;overflow: auto;"
      v-if="visible"
      :data="data"
      :node-key="nodeKey"
      :expand-on-click-node="false"
      :props="props"
      :support-filter="supportFilter"
      :default-expand-all="defaultExpandAll"
      @node-click="handleNodeClick"
    ></ht-tree>
    <el-button slot="reference">选择变量</el-button>
  </el-popover>
</template>

<script>
import utils from "@/hotent-ui-util.js";

export default {
  props: {
    data: {
      type: Array,
      default: () => {
        return [];
      }
    },
    buttonLabel: {
      type: String,
      default: "选择变量"
    },
    supportFilter: {
      type: Boolean,
      default: false
    },
    defaultExpandAll: {
      type: Boolean,
      default: true
    },
    nodeKey: {
      type: String,
      default: "id"
    },
    props: {
      type: Object,
      default: () => {
        return { children: "children", label: "label" };
      }
    }
  },
  data() {
    return {
      visible: false
    };
  },
  methods: {
    handleNodeClick(selection, node) {
      if (selection && selection.children && selection.children.length > 0) {
        return;
      }
      this.visible = false;
      this.$emit("node-click", selection, node);
    }
  }
};
</script>

<style  scoped>
div >>> .el-dialog__body {
  padding: 10px;
}
</style>