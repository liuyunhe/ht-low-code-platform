<template>
    <ht-tree-list-dialog
    :single="single"
    :data="data"
    :table-columns="tableColumns"
    :pagination="pagination"
    :tree-data="treeData"
    :default-expanded-keys="['6']"
    dialog-title="选择流程"
    :append-to-body="appendToBody"
    @load="handleLoad"
    @loadListData="loadListData"
    @onConfirm="onConfirm"
    @reset="reset"
    quickSearchProps="name,defKey"
    search-placeholder="流程名称、流程key"
    :destroy-on-close="destroyOnClose"
    ref="htTreeListDialog"
  />
</template>
<script>
import req from "@/request.js";
import sysType from "@/api/sysType.js";

export default {
  name: "eip-form-dialog",
  props: {
    value: Array,
    single: Boolean,
    name: String,
    formType: {
      type: String,
      default: "pc",
    },
    appendToBody: {
      type: Boolean,
      default: false,
    },
    destroyOnClose: {
      type: Boolean,
      default: false,
    },
    rightType: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      data: [],
      treeData: null,
      tableColumns: [
        { prop: "name", label: "流程名称" },
        { prop: "defKey", label: "流程key" },
      ],
      pagination: {
        page: 1,
        pageSize: 50,
        total: 0,
      },
      typeIdQuery: null,
    };
  },
  mounted() {},
  methods: {
    loadTreeData() {
      sysType.getSysTypeByCatId("6").then((data) => {
        this.treeData = data;
      });
    },
    showDialog(params) {
      this.loadTreeData();
      if (!params) {
        params = [];
      }
      this.$refs.htTreeListDialog.showDialog(params);
    },
    handleLoad(param, cb) {
      if (this.typeIdQuery) {
        param.querys.push(this.typeIdQuery);
      }
      param.params = param.params || {};
      if (this.rightType) {
        param.params["bpmDefAuthorizeRightType"] = this.rightType;
      }
      // 参数说明  url  requestBodyParam  requestParam
      req
        .post("${bpmModel}/flow/def/v1/listJson", param)
        .then((data) => {
          let response = data.data;
          this.data = response.rows;
          this.pagination = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total,
          };
        })
        .finally(() => cb());
    },
    loadListData(nodedata) {
      // 根据组织获取下级组织
      // 获取当前组织及下级组织
      let queryFilter = {
        pageBean: this.pagination,
        querys: [],
      };
      this.typeIdQuery = {
        property: "typeId",
        value: nodedata.id,
        group: "categoryGroup",
        operation: "EQUAL",
        relation: "AND",
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
    },
  },
};
</script>
<style lang="scss" scoped>
/deep/.el-dialog__wrapper {
  overflow: unset !important;
}
</style>
