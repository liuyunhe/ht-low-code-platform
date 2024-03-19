<template>
  <ht-tree-dialog
    dialog-title="选择分类"
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
import sysType from "@/api/sys.js";
export default {
  name: "eip-sys-type-dialog",
  components: {
  },
  props: {
    name,
    catId: {
      type: String,
      default: ""
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
      default: false
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
      if (this.catId) {
        sysType.getSysTypeByCatId(this.catId).then(data => {
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
        this.$message.error("请选择");
        return;
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