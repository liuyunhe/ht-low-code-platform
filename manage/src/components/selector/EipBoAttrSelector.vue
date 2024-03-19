<template>
  <div class="inputs">
    <ht-input
        ref="htInput"
        v-model="inputVal"
        @focus="showDialog"
        @clear="clear"
        :placeholder="placeholder">
      <el-button slot="append" icon="el-icon-search" @click="showDialog"></el-button>
    </ht-input>
    <ht-tree-dialog
        dialog-title="选择分类"
        :data="treeData"
        :show-checkbox="showCheckbox"
        :append-to-body="appendToBody"
        :props="prop"
        default-expand-all
        :leaf-only="false"
        :include-half-checked="false"
        @onConfirm="onConfirm"
        ref="htTreeDialog"
    />
  </div>

</template>

<script>
  import flow from "@/api/flow.js";
  export default {
    name: "eip-bo-attr-selector",
    props: {
      name,
      defId: {
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
      },
      placeholder: {
        type: String,
        default: "请选择属性"
      },
      value: {
        type: String
      },
      prop:{
        type:Object,
        default: () => {
          return {
            children: 'children',
            label: 'name'
          }
        }
      }
    },
    data() {
      return {
        treeData:null
      };
    },
    computed: {
      inputVal: {
        get() {
          return this.value;
        },
        set(val) {
          this.$emit("input", val);
        }
      }
    },
    created() {
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
        if (this.defId) {
          flow.getVarTree(this.defId).then(data => {
            this.treeData = data;
          })
        }
      },
      onConfirm(checkedNodes) {
        if (!checkedNodes || checkedNodes.parentId === "0") {
          this.$refs.htTreeDialog.showDialog();
          this.$message.error("不能选择一级分类");
          return false;
        }
        this.inputVal = checkedNodes.path+"."+checkedNodes.name;
        this.$emit("input", checkedNodes.path+"."+checkedNodes.name);
        // this.$emit("onConfirm", checkedNodes,checkedNodes.path+"."+checkedNodes.name);
      },
      clear() {
        this.$emit("input", null);
      }
    }
  }
</script>

<style scoped>
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
  div[aria-invalid="true"] >>> .el-input__inner,
  div[aria-invalid="true"] >>> .el-input__inner:focus {
    border-color: #f56c6c;
  }
</style>
