<template>
  <div>
    <ht-post-selector
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
      v-if="permission_sub!='n'"
    >
      <span style="display:none;"  v-validate>
      <slot name="labeldesc">{{inputName}}</slot>
    </span>
    </ht-post-selector>
  </div>
</template>
<script>
import utils from "@/hotent-ui-util.js";
import sub_pio_mixin from "@/sub-permission-mixin.js";

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
    },
    selectCurrent:Boolean
  },
  mixins: [sub_pio_mixin],//混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission）
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
      orgLength: 0,
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
      if (!this.value && this.selectCurrent) {
          let post = [];
          if (this.$store.state.user.currentUserDetail == null) {
            this.$store
              .dispatch("user/loadCurrentUserDetail")
              .then(postCharge => {
                  for (let key in postCharge.post){
                      post = postCharge.post[key];
                  }
              })
                .then(() => {
                this.initCurrentPost(post);
            });
          } else {
            let postMap =  this.$store.state.user.currentUserDetail.post;
            if (postMap) {
              for (const key in postMap) {
                 post = postMap[key];
              }
            }
            this.initCurrentPost(post);
          }
      }
  },
  methods: {
      initCurrentPost(post) {
          this.$emit("input", post.postName);
          if (post && this.config) {
              // 配置了id的绑定关系，则回填到指定属性上
              if (this.config.hasOwnProperty("id")) {
                  utils.setValueByConfigKey(this, this.config, "id", post.postId);
              }
              // 配置了code的绑定关系，则回填到指定的属性上
              if (this.config.hasOwnProperty("code")) {
                  utils.setValueByConfigKey(this, this.config, "code", post.postCode);
              }
              // 配置了name的绑定关系，则回填到指定的属性上
              if (this.config.hasOwnProperty("name")) {
                  utils.setValueByConfigKey(this, this.config, "name", post.postName);
              }
          }
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
