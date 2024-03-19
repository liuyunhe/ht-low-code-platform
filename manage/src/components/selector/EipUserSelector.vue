<template>
  <ht-user-selector
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
    :roles="roles"
    :load-org-tree="loadOrgTree"
    :append-to-body="appendToBody"
    @load="handleLoad"
    @valueChange="valueChange"
    @loadDemensions="loadDemensions"
    @changeDemension="changeDemension"
    @loadOrgUser="loadOrgUser"
    @loadRoleUser="loadRoleUser"
    select-label="fullname"
    quick-search-props="fullname,account,email"
  />
</template>
<script>
import utils from "@/hotent-ui-util.js";
export default {
  name: "eip-user-selector",
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
      orgId:"",
      page:"",
      data: [],
      demensions: [],
      defaultDemension: "",
      orgs: [],
      roles: [],
      tableColumns: [
        { prop: "fullname", label: "名称", width: "120" },
        { prop: "account", label: "账号", width: "120" },
        { prop: "mobile", label:"手机", width:"120"},
        { prop: "email", label: "邮件" }
      ],
      pagination: {
        page: 1,
        pageSize: 50,
        total: 0,
        showTotal: true
      }
    };
  },
  mounted() {},
  methods: {
    handleLoad(param, cb) {
      if(!param.org_id_ && (this.orgId && this.orgId!="0")){
        param.org_id_ = this.orgId;
        //切换每页显示条数时（第一次进来）
        if(param.pageBean){
          if(param.pageBean.page>1 && this.page){
            param.pageBean.page = this.page;
            this.page = "";
          }
        }
      }
      let queryFilter = param;
      if (param.org_id_ ) {
        if(param.pageBean){
          queryFilter.pageBean = {
            page: param.pageBean.page,
            pageSize: param.pageBean.pageSize,
            total: 0,
            showTotal: true
          };
        }
        if(param.org_id_!="0"){
          let query = {
          property: "org_id_",
          value: param.org_id_,
          group: "main",
          operation: "EQUAL",
          relation: "AND"
          };
          if (!queryFilter.querys) {
            queryFilter.querys = [];
          }
          queryFilter.querys.push(query);
        }
      }
      if (param.role_id_) {
        let query = {
          property: "role_id_",
          value: param.role_id_,
          group: "main",
          operation: "EQUAL",
          relation: "AND"
        };
        if (!queryFilter.querys) {
          queryFilter.querys = [];
        }
        queryFilter.querys.push(query);
      }
      //必须设置分页。以免请求全部数据而导致前端卡死。
      if (!queryFilter.pageBean) {
         queryFilter.pageBean = {
          page: 1,
          pageSize: 50,
          total: 0,
          showTotal: true
        };
      }
      let _this = this;
      this.$http
        .post("${uc}/api/user/v1/users/queryByType", queryFilter)
        .then(rep => {
          let data = rep.data;
          _this.data = data.rows;
          _this.pagination.page = data.page;
          _this.pagination.pageSize = data.pageSize;
          _this.pagination.total = data.total;
        })
        .finally(() => {
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
      // 维度改变 重新获取组织
      let _this = this;
      this.$http
        .post("${uc}/api/org/v1/orgs/getByParentAndDem", {
          demId: currentDemensionId
        })
        .then(rep => {
          _this.orgs = utils.tile2nest(rep.data);
        })
        .catch(function(error) {});
    },
    loadOrgUser(org) {
      this.orgId = org.id;
      this.page =1;
      // 根据组织获取用户
      this.handleLoad({ org_id_: org.id }, () => {});
    },
    loadRoleUser(role) {
      // 根据角色获取用户
      this.handleLoad({ role_id_: role.id }, () => {});
    },
    loadDemensions() {
      if (this.demensions.length == 0) {
        let _this = this;
        this.$http
          .get("${uc}/api/demension/v1/dems/getAll")
          .then(rep => {
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

        this.$http
          .post("${uc}/api/role/v1/roles/getAll")
          .then(rep => {
            _this.roles = utils.tile2nest(rep.data);
          })
          .catch(function(error) {});
      }
    }
  }
};
</script>
