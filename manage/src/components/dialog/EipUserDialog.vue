<template>
  <ht-user-dialog
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
    @loadOrgUser="loadOrgUser"
    @onConfirm="onConfirm"
    @reset="reset"
    quick-search-props="fullname,account,email"
    select-label="fullname"
    ref="htUserDialog"
  />
</template>
<script>
import utils from "@/hotent-ui-util.js";

export default {
  name: "eip-user-dialog",
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
        { prop: "fullname", label: "名称", width: "120" },
        { prop: "account", label: "账号", width: "120" },
        { prop: "email", label: "邮件", width: "260" }
      ],
      pagination: {
        page: 1,
        pageSize: 50,
        total: 0,
        showTotal: true
      },
      curCheckedOrgId: ""
    };
  },
  mounted() {},
  methods: {
    showDialog(selectors) {
      this.$http
        .get("${uc}/api/demension/v1/dems/getAll")
        .then(rep => {
          let data = rep.data;
          this.demensions = data;
          data.forEach(element => {
            if(element.isDefault==1){
              this.defaultDemension = element.id;
            }
          });
          if(!this.defaultDemension){
            this.defaultDemension = data[0].id;
          }
          this.$refs.htUserDialog.showDialog(selectors);
        })
        .catch(function(error) {});
    },
    reset(org) {
      // 根据组织获取用户
      this.curCheckedOrgId = "";
    },
    handleLoad(param, cb) {
      let queryFilter = param;
      queryFilter.querys = queryFilter.querys || [];
      // if (queryFilter.querys.length > 0 && queryFilter.pageBean) {
      //   queryFilter.pageBean.page = 1;
      // }
      if (this.curCheckedOrgId) {
        queryFilter.pageBean = {
          page: 1,
          pageSize: 50,
          total: 0,
          showTotal: true
        };
        let query = {
          property: "org_id_",
          value: this.curCheckedOrgId,
          group: "orgQuery",
          operation: "EQUAL",
          relation: "AND"
        };
        queryFilter.querys.push(query);
      }

      this.$http
        .post("${uc}/api/user/v1/users/queryByType", queryFilter)
        .then(rep => {
          let data = rep.data;
          this.data = data.rows;
          this.pagination.page = data.page;
          this.pagination.pageSize = data.pageSize;
          this.pagination.total = data.total;
        })
        .finally(() => {
          cb();
        });
    },
    loadOrgTree(node, resolve) {
      if (node && node.data && node.data.isParent) {
        if (node.data.children) {
          resolve(node.data.children);
        } else {
          this.$http
            .post("${uc}/api/org/v1/orgs/getByParentAndDem", {
              demId: node.data.demId,
              parentId: node.data.id
            })
            .then(rep => {
              resolve(rep.data);
            })
            .catch(function(error) {});
        }
      } else {
        resolve([]);
      }
    },
    changeDemension(currentDemensionId) {
      this.$http
        .post("${uc}/api/org/v1/orgs/getByParentAndDem", {
          demId: currentDemensionId
        })
        .then(rep => {
          this.orgs = utils.tile2nest(rep.data);
        })
        .catch(function(error) {});
    },
    loadOrgUser(org) {
      // 根据组织获取用户
      this.curCheckedOrgId = org.id;
      if (this.$refs.htUserDialog && this.$refs.htUserDialog.$refs.selector) {
        this.$refs.htUserDialog.$refs.selector.load();
      }
    },
    onConfirm(selection) {
      this.$emit("onConfirm", selection, this.name);
      this.$emit("input", selection);
    }
  }
};
</script>
