<template>
  <el-scrollbar style="height:90%">
    <ht-tree
      :data="treeData"
      :props="defaultProps"
      :support-filter="supportFilter"
      :highlight-current="highlightCurrent"
      :default-expand-all="defaultExpandAll"
      :default-expanded-keys="_defaultExpandedKeys"
      node-key="id"
      :show-checkbox="showCheckbox"
      :render-content="renderContent"
      :expand-on-click-node="false"
      @refresh="handleRefresh"
      @node-click="handleNodeClick"
      @check="check"
      ref="htTree"
    >
      <!-- 作用域插槽：插槽prop -->
      <slot slot-scope="{ node, data }" :node="node" :data="data"></slot>
    </ht-tree>
  </el-scrollbar>
</template>

<script>
import sysType from "@/api/sysType.js";
/**
 * catId  typeKey
 * 1	REPORT_TYPE	报表分类
 * 10	USER_REL_TYPE	用户关系分类
 * 11	WORK_ITEM_TYPE	工作台分类
 * 12	REPORT_LINE	汇报线分类
 * 2	INDEX_COLUMN_TYPE	首页栏目分类
 * 3	DEMENSION_TYPE	组分类
 * 4	MAIL_TYPE	邮件分类
 * 5	DIC	数据字典
 * 6	FLOW_TYPE	流程分类
 * 7	FORM_TYPE	表单分类
 * 8	ENT_TYPE	业务实例
 * 9	DEF_TYPE	业务定义
 *
 */
export default {
  name: "ht-sys-type-tree",
  props: {
    catId: {
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
    loadData(cb) {
      if (this.catId) {
        sysType.getSysTypeByCatId(this.catId).then(data => {
          this.treeData = data;
          cb && cb();
        });
      }
      if (this.typeKey) {
        sysType.getTypesByKey(this.typeKey).then(data => {
          this.treeData = data;
          cb && cb();
        });
      }
    },
    handleRefresh(cb) {
      this.loadData(cb);
    }
  },
  mounted() {
    this._defaultExpandedKeys = [this.catId];
    this.loadData();
  }
};
</script>
<style lang="scss" scoped>
/deep/ .el-tree .el-tree__empty-block {
  margin: 20px 20px;
}

/deep/ .el-scrollbar__wrap {
  overflow-x: hidden;
  margin-bottom: 0 !important;
}
</style>