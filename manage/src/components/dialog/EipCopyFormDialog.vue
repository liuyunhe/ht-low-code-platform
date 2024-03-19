<template>
  <ht-tree-list-dialog
    :single="single"
    :data="data"
    :table-columns="tableColumns"
    :pagination="pagination"
    :tree-data="treeData"
    :default-expanded-keys="['7']"
    dialog-title="选择表单"
    @load="handleLoad"
    @loadListData="loadListData"
    @onConfirm="onConfirm"
    @reset="reset"
    quickSearchProps="name,formKey"
    search-placeholder="表单名称、表单key"
    ref="htTreeListDialog"
    :destroy-on-close="destroyOnClose"
    :append-to-body="appendToBody"
  />
</template>
<script>
import req from "@/request.js";
import sysType from "@/api/sysType.js";

export default {
  name: "eip-copy-form-dialog",
  props: {
    value: Array,
    name:String,
    single: Boolean,
    formType: {
      type: String,
      default: "pc"
    },
    formId: {
      type: String,
      default: ""
    },
    boDefIds:String,
    appendToBody: {
      type: Boolean,
      default: false
    },
    destroyOnClose:{
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      data: [],
      treeData: null,
      tableColumns: [
        { prop: "formKey", label: "表单key" },
        { prop: "name", label: "表单名称" },
        { prop: "version", label: "版本号" }
      ],
      pagination: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      typeIdQuery: null
    };
  },
  mounted() {
    
  },
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
    handleLoad(param, cb) {
      if (this.typeIdQuery) {
        param.querys.push(this.typeIdQuery);
      }
      this.$set(param,"sorter",[{property: "UPDATE_TIME_", direction: "DESC"}]);
      // 参数说明  url  requestBodyParam  requestParam
      req
        .post("${form}/form/form/v1/getRelationList", param, {
          status: "deploy",
          formType: this.formType,
          boDefIds: this.boDefIds,
          id: this.formId,
        })
        .then(data => {
          let response = data.data;
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
      // 根据组织获取下级组织
      // 获取当前组织及下级组织
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
      this.$emit("onConfirm", selection,this.name);
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
