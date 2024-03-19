<template>
  <mobile-post-selector
    v-model="selectPos"
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
    quick-search-props="p.pos_name_,o.path_name_"
    v-if="permission_sub!='n'"
  />
</template>
<script>
import utils from "@/hotent-ui-util.js";
import sub_pio_mixin from "@/sub-permission-mixin.js";
import MobilePostSelector from "@/components/eipControl/selector/common/MobilePostSelector.vue";

export default {
  components: {
    MobilePostSelector
  },
  name: "eip-post-selector",
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
      default: true
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
        // { prop: "code", label: "编码" },
        { prop: "orgName", label: "所属组织" }
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      orgLength: 0,
      selectPos:""
    };
  },
  mounted() {
    this.$nextTick(()=>{
      if (!this.inputVal && this.selectCurrent) {
          if (this.$store.state.user.currentUserDetail == null) {
            this.$store
              .dispatch("user/loadCurrentUserDetail")
              .then(postCharge => {
                let pos = [];
                for (let key in postCharge.post){
                  pos.push(postCharge.post[key].postName);
                }
                this.selectPos = pos.join(",");
              });
          } else {
            this.selectPos = this.$store.state.user.postCharge.post.name;
          }
      }else{
        this.selectPos = this.value;
      }
    });
  },
  computed:{
    inputName: function() {
      let labeldesc = "";
      if (
        this.$parent.$slots &&
        this.$parent.$slots.label &&
        this.$parent.$slots.label[0].children &&
        this.$parent.$slots.label[0].children[0].text
      ) {
        labeldesc = this.$parent.$slots.label[0].children[0].text;
        return this.name ? this.name : utils.getName() + "-" + labeldesc;
      } else {
        return  this.name ? this.name : utils.getName();
      }
    },
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
