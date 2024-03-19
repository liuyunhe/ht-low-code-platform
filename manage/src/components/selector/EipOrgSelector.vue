<template>
  <ht-org-selector
    v-model="value"
    :validate="validate"
    :name="name"
    :placeholder="placeholder"
    :permission="permission"
    :single="single"
    :config="config"
    :data="data"
    :table-columns="tableColumns"
    :pagination="pagination"
    :demensions="demensions"
    :default-demension="defaultDemension"
    :orgs="orgs"
    :load-org-tree="loadOrgTree"
    :append-to-body="appendToBody"
    @load="handleLoad"
    @valueChange="valueChange"
    @changeDemension="changeDemension"
    @loadDemensions="loadDemensions"
    @loadOrgs="loadOrgs"
    select-label="name"
    quick-search-props="name,code"
  />
</template>
<script>
import utils from "@/hotent-ui-util.js";

export default {
  name: "eip-org-selector",
  props: {
    validate: [String, Object],
    value: String,
    name: String,
    placeholder: String,
    permission: String,
    single: Boolean,
    config: Object,
    appendToBody: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      data: [],
      demensions: [],
      defaultDemension: "",
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
      },
      orgLength: 0
    };
  },
  mounted() {},
  methods: {
    handleLoad(param, cb) {
      let _this=this;
      this.$http
        .post("${uc}/api/org/v1/orgs/getOrgPage", param)
        .then(function(response) {
          let data = response.data;
          _this.data = data.rows;
          _this.pagination.page = data.page;
          _this.pagination.pageSize = data.pageSize;
          _this.pagination.total = data.total;
        })
        .finally(err => {
          cb();
        });
    },
    valueChange(value) {
      this.$emit("input", value);
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
            .then(function(rep) {
              resolve(rep.data);
            })
            .catch(function(error) {});
        }
      } else {
        resolve([]);
      }
    },
    changeDemension(currentDemensionId) {
      // 维度改变 重新获取组织
      let _this=this;
      this.$http
        .post("${uc}/api/org/v1/orgs/getByParentAndDem", {
          demId: currentDemensionId
        })
        .then(function(rep) {
          _this.orgs = utils.tile2nest(rep.data);
        })
        .catch(function(error) {});
    },
    loadOrgs(org) {
      // 获取当前组织及下级组织
      let queryFilter = {
        pageBean: this.pagination,
        querys: []
      };
      let query = {
        property: "path",
        value: org.path,
        group: "main",
        operation: "RIGHT_LIKE",
        relation: "AND"
      };
      queryFilter.querys.push(query);
      this.handleLoad(queryFilter, () => {});
    },
    loadDemensions() {
      if (this.demensions.length == 0) {
        let _this=this;
        this.$http
          .get('${uc}/api/demension/v1/dems/getAll')
          .then(function(rep) {
            let data = rep.data;
            _this.demensions = data;
            data.forEach(element => {
              if(element.isDefault==1){
                _this.defaultDemension = element.id;
              }
            });
            if(!_this.defaultDemension){
              _this.defaultDemension = data[0].id;
            }
          })
          .catch(function(error) {});
      }
    }
  }
};
</script>
