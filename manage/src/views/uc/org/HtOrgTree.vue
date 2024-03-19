<template>
  <el-scrollbar style="height:100%">
    <ht-tree
      :data="treeData"
      :props="defaultProps"
      :highlight-current="highlightCurrent"
      node-key="id"
      :show-checkbox="showCheckbox"
      :render-content="renderContent"
      :expand-on-click-node="false"
      @node-click="handleNodeClick"
      @check="check"
      :support-filter="supportFilter"
      :default-expanded-keys="defaultExpandedKeys"
      @node-expand="nodeExpend"
      @node-collapse="nodeCollapse"
      @refresh="loadData"
      ref="htTree"
    >
      <!-- 作用域插槽：插槽prop -->
      <slot slot-scope="{ node, data }" :node="node" :data="data"></slot>
    </ht-tree>
  </el-scrollbar>
</template>

<script>
import org from "@/api/org.js";
import utils from "@/hotent-ui-util.js";
export default {
  name: "ht-org-tree",
  props: {
    defId: {
      type: String | Number,
      required: true
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
      defaultExpandedKeys:["0"]
    };
  },
  methods: {
    handleNodeClick(node) {
      this.$emit("node-click", node);
    },
    check(data, checkedObj) {
      this.$emit("check", data, checkedObj);
    },
    loadData(cb) {
      var param = {
        demId: this.defId
      };
      org.getByParentAndDemToTree(param).then(data => {
        this.treeData = utils.tile2nest(data);
      }).finally(()=>{
        cb && cb();
      });
    },
    nodeExpend(data){
      this.defaultExpandedKeys.push(data.id); // 在节点展开是添加到默认展开数组
    },
    nodeCollapse(data){
      this.defaultExpandedKeys.splice(this.defaultExpandedKeys.indexOf(data.id),1);
    }
  },
  mounted() {
    this.loadData();
  }
};
</script>
<style lang="scss" scoped>
>>> .el-tree .el-tree__empty-block {
  margin: 20px 20px;
}

>>> .el-tree {
  width: 100%;
}

>>> .el-scrollbar__wrap {
  overflow-x: hidden;
}
</style>
