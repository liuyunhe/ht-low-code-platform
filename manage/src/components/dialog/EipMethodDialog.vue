<template>
  <ht-tree-list-dialog
    :single="single"
    :data="data"
    :table-columns="tableColumns"
    :pagination="pagination"
    :tree-data="treeData"
    :default-expanded-keys="['-1','1']"
    dialog-title="选择接口"
    :append-to-body="appendToBody"
    @load="handleLoad"
    @loadListData="loadListData"
    @onConfirm="onConfirm"
    @reset="reset"
    quickSearchProps="name,alias,requestUrl"
    search-placeholder="接口名称、别名，请求地址"
    :destroy-on-close="destroyOnClose"
    ref="htTreeListDialog"
  />
</template>
<script>
import req from "@/request.js";
import portalApi from "@/api/portal.js";

export default {
  name: "eip-form-dialog",
  props: {
    value: Array,
    single: Boolean,
    name:String,
    formType: {
      type: String,
      default: "pc"
    },
    appendToBody: {
      type: Boolean,
      default: false
    },
    destroyOnClose:{
      type: Boolean,
      default: false
    },
    roleAlias:{
      type: String
    }
  },
  data() {
    return {
      data: [],
      treeData: null,
      tableColumns: [
        { prop: "name", label: "接口描述" },
        { prop: "alias", label: "接口别名" },
        { prop: "requestUrl", label: "接口地址" }
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
       portalApi.getMenuByRoleAlias(this.roleAlias).then(data => {
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
      // 参数说明  url  requestBodyParam  requestParam
      req
        .post("${portal}/sys/sysMethod/v1/listJson", param)
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
        property: "path",
        value: nodedata.path,
        group: "categoryGroup",
        operation: "RIGHT_LIKE",
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
