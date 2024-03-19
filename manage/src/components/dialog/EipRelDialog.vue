<template>
  <ht-tree-dialog
    dialog-title="选择汇报线"
    :data="treeData"
    :show-checkbox="showCheckbox"
    :append-to-body="appendToBody"
    :props="{children: 'children',label: 'name'}"
    default-expand-all
    :leaf-only=false
    :include-half-checked=false
    @onConfirm="onConfirm"
    ref="htTreeDialog"
  />
</template>
<script>
import sysType from "@/api/sysType.js";
export default {
  name: "eip-rel-dialog",
  components: {
  },
  props: {
    value: Array,
    name: String,
    groupKey: {
      type: String,
      default: "REPORT_LINE"
    },
    typeKey: {
      type: String,
      default: ""
    },
    appendToBody: {
      type: Boolean,
      default: false
    },
    showCheckbox: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      treeData:null
    };
  },
  methods: {
    showDialog() {
      this.loadTreeData();
      this.$refs.htTreeDialog.showDialog();
    },
    handleClose() {
      this.$refs.htTreeDialog.handleClose();
    },
    loadTreeData(){
      if (this.groupKey) {
        sysType.getRelType(this.groupKey).then(data => {
          this.treeData = data;
        });
      }
      if (this.typeKey) {
        sysType.getTypesByKey(this.typeKey).then(data => {
          this.treeData = data;
        });
      }
    },
    onConfirm(checkedNodes) {
      if (!checkedNodes || checkedNodes.parentId == "0") {
        this.$refs.htTreeDialog.showDialog();
        this.$message.error("不能选择一级分类");
        return false;
      }
      this.$emit("onConfirm", checkedNodes,this.name);
    }
  }
};
</script>

<style lang="scss" scoped>
>>> .el-dialog {
  width: 300px;
  height: 500px;
}
>>> .el-dialog__header {
  border-bottom: 1px solid darkgrey;
}
>>> .el-dialog__body {
  padding: 0px;
  height: 380px;
}
>>> .el-dialog__footer {
  position: absolute;
  text-align: center;
  bottom: 0px;
  left: 0px;
  right: 0px;
}
</style>