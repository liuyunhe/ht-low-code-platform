<template>
  <ht-org-post-dialog
    :single="single"
    :data="data"
    dialog-titile="组织选择对话框"
    :table-columns="tableColumns"
    :pagination="pagination"
    :demensions="demensions"
    :default-demension="defaultDemension"
    :orgs="orgs"
    :load-org-tree="loadOrgTree"
    :append-to-body="appendToBody"
    :destroy-on-close="destroyOnClose"
    @load="handleLoad"
    @loadDemensions="loadDemensions"
    @changeDemension="changeDemension"
    @loadListData="loadListData"
    @onConfirm="onConfirm"
    quick-search-props="name,code"
    ref="htOrgPostDialog"
  />
</template>
<script>
import uc from "@/api/uc.js";

export default {
  name: "eip-org-dialog",
  props: {
    value: Array,
    name: String,
    single: Boolean,
    appendToBody: {
      type: Boolean,
      default: false
    },
    destroyOnClose: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      data: [],
      demensions: [],
      defaultDemension: null,
      orgs: [],
      tableColumns: [
        { prop: "name", label: "名称" },
        { prop: "code", label: "编码" },
        { prop: "pathName", label: "路径" }
      ],
      pagination: {
        page: 1,
        pageSize: 50,
        total: 0
      }
    };
  },
  mounted() {},
  methods: {
    loadDemensions() {
      if (this.demensions.length == 0) {
        uc.getAllDimension().then(data => {
          this.demensions = data;
          data.forEach(element => {
            if(element.isDefault==1){
              this.defaultDemension = element.id;
            }
          });
          if(!this.defaultDemension){
            this.defaultDemension = data[0].id;
          }
        });
      }
    },
    showDialog() {
      this.$refs.htOrgPostDialog.showDialog();
    },
    handleLoad(param, cb) {
      uc.queryOrgByFilter(param)
        .then(data => {
          this.data = data.rows;
          this.pagination.page = data.page;
          this.pagination.pageSize = data.pageSize;
          this.pagination.total = data.total;
          cb();
        })
        .finally(err => {
          cb();
        });
    },
    loadOrgTree(node, resolve) {
      if (node && node.data && node.data.isParent) {
        if (node.data.children) {
          resolve(node.data.children);
        } else {
          uc.getOrgsByParentIdAndDemension(
            node.data.id,
            node.data.demId,
            data => resolve(data)
          );
        }
      } else {
        resolve([]);
      }
    },
    changeDemension(currentDemensionId) {
      // 维度改变 重新获取组织
      uc.getOrgsByDemension(currentDemensionId, data => (this.orgs = data));
    },
    loadListData(nodedata) {
      // 获取当前组织及下级组织
      let queryFilter = {
        pageBean: this.pagination,
        querys: []
      };
      let query = {
        property: "path",
        value: nodedata.path,
        group: "main",
        operation: "RIGHT_LIKE",
        relation: "AND"
      };
      queryFilter.querys.push(query);
      this.handleLoad(queryFilter, () => {});
    },
    onConfirm(selection) {
      this.$emit("onConfirm", selection, this.name);
      this.$emit("input", selection);
    }
  }
};
</script>
