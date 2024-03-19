<template>
  <ht-tree-list-dialog
    :single="single"
    :data="data"
    :table-columns="tableColumns"
    :pagination="pagination"
    :tree-data="treeData"
    :default-expanded-keys="['6']"
    dialog-title="表单列表选择"
    :append-to-body="appendToBody"
    @load="handleLoad"
    @loadListData="loadListData"
    @onConfirm="onConfirm"
    @reset="reset"
    quickSearchProps="name,alias"
    search-placeholder="名称、别名"
    :destroy-on-close="destroyOnClose"
    ref="htTreeListDialog"
  />
</template>
<script>
import form from "@/api/form.js";
import sysType from "@/api/sysType.js";
import req from "@/request.js";

export default {
  name: "eip-data-template-dialog",
  props: {
    value: Array,
    single: {
      type: Boolean,
      default: true
    },
    defKey: {
      type: String,
      default: ""
    },
    type: {
      type: String,
      default: ""
    },
    name: String,
    formType: {
      type: String,
      default: "pc"
    },
    appendToBody: {
      type: Boolean,
      default: false
    },
    destroyOnClose: {
      type: Boolean,
      default: false
    },
    rightType: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      data: [],
      treeData: null,
      tableColumns: [
        { prop: "name", label: "名称" },
        { prop: "alias", label: "别名" },
        { prop: "boDefAlias", label: "业务对象别名" },
        { prop: "typeName", label: "分类" }
      ],
      querys: [],
      pagination: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      typeIdQuery: null
    };
  },
  mounted() {},
  methods: {
    loadTreeData() {
      sysType.getSysTypeByCatId("7").then(data => {
        this.treeData = data;
      });
    },
    showDialog() {
      this.loadTreeData();
      this.$refs.htTreeListDialog.showDialog();
    },
    handleClose() {
      this.$refs.htTreeListDialog.handleClose();
    },
    handleLoad(param, cb) {
      if (this.typeIdQuery) {
        param.querys.push(this.typeIdQuery);
      }
      param.params = param.params || {};
      if (this.defKey != "") {
        if (this.type == "flow") {
          param.querys.push({
            property: "defId",
            value: this.defKey,
            operation: "EQUAL",
            relation: "AND"
          });
        } else {
          param.querys.push({
            property: "formKey",
            value: this.defKey,
            operation: "EQUAL",
            relation: "AND"
          });
        }
      }
      // 参数说明  url  requestBodyParam  requestParam
      form
        .getDataTemplateData(param)
        .then(response => {
          this.data = response.rows;
          this.pagination = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total
          };
        })
        .finally(() => cb());
    },
    loadListData(nodedata) {
      let queryFilter = {
        pageBean: this.pagination,
        querys: []
      };
      this.typeIdQuery = {
        property: "typeId",
        value: nodedata.id,
        group: "categoryGroup",
        operation: "LIKE",
        relation: "AND"
      };
      this.handleLoad(queryFilter, () => {});
    },
    onConfirm(selection) {
      this.$emit("onConfirm", selection, this.name);
      this.$emit("input", selection);
    },
    reset() {
      /**
       * 点击重置按钮
       * 1. 清空树条件  this.typeIdQuery = "";
       * 2. 清空树选中状态
       * */
      if (this.typeIdQuery) {
        this.$refs.htTreeListDialog.$refs.tree.$refs.elTree.currentNode.node.isCurrent = false;
      }
      this.typeIdQuery = "";
    }
  }
};
</script>
