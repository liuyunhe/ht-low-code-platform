<template>
  <div>
    <ht-org-selector
      v-model="value"
      :validate="validate"
      :name="inputName"
      :placeholder="placeholder"
      :permission="permission_sub"
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
      v-if="permission_sub!='n'"
    >
      <span style="display:none;"  v-validate>
      <slot name="labeldesc">{{inputName}}</slot>
    </span>
    </ht-org-selector>
  </div>
</template>
<script>
import utils from "@/hotent-ui-util.js";
import sub_pio_mixin from "@/sub-permission-mixin.js";

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
    },
    selectCurrent: Boolean
  },
  mixins: [sub_pio_mixin],//混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission）
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
  computed:{
    inputName: function() {
      let labeldesc = "";
      if(this.$slots && this.$slots.labeldesc && this.$slots.labeldesc[0].children && this.$slots.labeldesc[0].children[0].text){
        labeldesc = this.$slots.labeldesc[0].children[0].text;
        return this.name ? this.name : utils.getName()+ "-" +labeldesc;
      }else{
        return this.name ? this.name : utils.getName();
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      // 没有值而且需要显示当前组织
      if (!this.value && this.selectCurrent) {
        let org = null;
        if (this.$store.state.user.currentOrgDetail == null) {
          this.$store
            .dispatch("user/loadCurrentUserDetail")
            .then(currentOrgDetail => {
              org = currentOrgDetail.org[0];
            })
            .then(() => {
              this.initCurrentOrg(org);
            });
        } else {
          org = this.$store.state.user.currentUserDetail.org[0];
          this.initCurrentOrg(org);
        }
      }
    });
  },
  methods: {
    initCurrentOrg(org) {
      if (org && this.config) {
        // 配置了id的绑定关系，则回填到指定属性上
        if (this.config.hasOwnProperty("id")) {
          utils.setValueByConfigKey(this, this.config, "id", org.orgId);
        }
        // 配置了code的绑定关系，则回填到指定的属性上
        if (this.config.hasOwnProperty("code")) {
          utils.setValueByConfigKey(this, this.config, "code", org.orgCode);
        }
        // 配置了name的绑定关系，则回填到指定的属性上
        if (this.config.hasOwnProperty("name")) {
          utils.setValueByConfigKey(this, this.config, "name", org.orgName);
        }
         // 配置了pathName的绑定关系，则回填到指定的属性上
        if (this.config.hasOwnProperty("pathName")) {
          utils.setValueByConfigKey(this, this.config, "pathName", org.pathName);
        }
      }
      org && setTimeout(()=>{
        this.$emit("input", org.orgName);
      })
    },
    handleLoad(param, cb) {
      let _this = this;
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
      let _this = this;
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
        let _this = this;
        this.$http
          .get("${uc}/api/demension/v1/dems/getAll")
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
