<template>
  <el-scrollbar class="fullheight">
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
        @refresh="loadData(id)"
        ref="htMenuTree">
      <!-- 作用域插槽：插槽prop -->
      <slot slot-scope="{ node, data }" :node="node" :data="data"></slot>
    </ht-tree>
  </el-scrollbar>
</template>

<script>
  import portalApi from "@/api/portal.js";
  export default {
    name: "sys-app-menu-tree",
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
      },
      id: String
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
      loadData(id,cb) {
        portalApi.getSysAppTree(id).then(data => {
          let top = [{name:"菜单",children:data}];
          this.treeData = top;
        }).finally(()=>{
          cb && cb()
        });
      }
    },
    watch:{
      id: {
        handler(newVal,oldVal) {
          if (newVal && oldVal!=newVal){
            this.loadData(newVal);
          }
        },
        deep: true
      },
    },
    mounted(){
      this.loadData(this.id);
    }
  }
</script>

<style scoped>
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
