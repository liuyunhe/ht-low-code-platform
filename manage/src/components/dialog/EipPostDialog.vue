<template>
  <ht-org-post-dialog
    dialog-title="岗位选择对话框"
    :single="single"
    :data="data"
    :table-columns="tableColumns"
    :pagination="pagination"
    :demensions="demensions"
    :default-demension="defaultDemension"
    :orgs="orgs"
    :load-org-tree="loadOrgTree"
    :append-to-body="appendToBody"
    :destroy-on-close="destroyOnClose"
    @load="handleLoad"
    @changeDemension="changeDemension"
    @loadDemensions="loadDemensions"
    @loadListData="loadListData"
    @onConfirm="onConfirm"
    quick-search-props="p.pos_name_,p.code_,o.path_name_"
    ref="htOrgPostDialog"
  />
</template>
<script>
import uc from "@/api/uc.js";

export default {
  name: "eip-post-dialog",
  props: {
    value: Array,
    single: Boolean,
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
      demensions: [],
      defaultDemension: null,
      orgs: [],
      tableColumns: [
        { prop: "name", label: "名称" },
        { prop: "code", label: "编码" },
        { prop: "orgName", label: "所属组织" }
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
      uc.getOrgPostPage(param)
        .then(response => {
          this.data = response.rows;
          this.pagination.page = response.page;
          this.pagination.pageSize = response.pageSize;
          this.pagination.total = response.total;
          cb();
        })
        .catch(err => {
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
      // 获取当前组织下的岗位
      let queryFilter = {
        pageBean: this.pagination,
        querys: []
      };
      let query = {
        property: "orgId",
        value: nodedata.id,
        group: "main",
        operation: "EQUAL",
        relation: "AND"
      };
      queryFilter.querys.push(query);
      this.handleLoad(queryFilter, () => {});
    },
    onConfirm(selection) {
      this.$emit("onConfirm", selection,this.name);
      this.$emit("input", selection);
    }
  }
};
</script>
