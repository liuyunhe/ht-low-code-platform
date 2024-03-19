<template>
  <ht-post-selector
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
    :defaultDemension="defaultDemension"
    :orgs="orgs"
    :load-org-tree="loadOrgTree"
    :append-to-body="appendToBody"
    @load="handleLoad"
    @valueChange="valueChange"
    @loadDemensions="loadDemensions"
    @changeDemension="changeDemension"
    @loadPosts="loadPosts"
    select-label="name"
    quick-search-props="p.pos_name_,p.code_,o.path_name_"
  />
</template>
<script>
import utils from "@/hotent-ui-util.js";

export default {
  name: "my-post-selector",
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
      },
      orgLength: 0
    };
  },
  methods: {
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
    },
    handleLoad(param, cb) {
      let _this=this;
      this.$http
        .post("${uc}/api/org/v1/orgPosts/getOrgPostPage", param)
        .then(res => {
          let response = res.data;
          _this.data = response.rows;
          _this.pagination.page = response.page;
          _this.pagination.pageSize = response.pageSize;
          _this.pagination.total = response.total;
          cb();
        }),
        error => {
          cb();
        };
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
    loadPosts(org) {
      // 获取当前组织下的岗位
      let queryFilter = {
        pageBean: this.pagination,
        querys: []
      };
      let query = {
        property: "orgId",
        value: org.id,
        group: "main",
        operation: "EQUAL",
        relation: "AND"
      };
      queryFilter.querys.push(query);
      this.handleLoad(queryFilter, () => {});
    }
  }
};
</script>
