<template>
  <el-main class="base-main">
    <div>
      <div class="form-content">
        <form v-if="html" data-vv-scope="custom-form">
          <online-form
            class="custom-form"
            :html="html"
            :data="data"
            :permission="permission"
            :isView="isView"
          />
        </form>
      </div>
    </div>
  </el-main>
</template>
<script>
import OnlineForm from "@/components/flow/OnlineForm.vue";
//import form from "@/api/formContent.js";
import utils from "@/utils.js";
import { baseHandlerJs } from '@/utils/handlerJs'

export default {
  name: "formContent",
  props: ["templateKey","action"],
  data() {
    return {
      html: null,
      data: null,
      permission: null,
      isView: true,
      disabled: false,
      boAlias:"",
      id:"",
      startFlow: false,
      defKey:"",
      mobileFormAlias: ""
    };
  },
  components: { OnlineForm },
  methods: {
    
  },
  created() {
    this.id = utils.getUrlKey("id");
    this.startFlow = utils.getUrlKey("startFlow");
    let _me = this;
    let handlerJs = baseHandlerJs
    
    let handler = function(){
      let data = {formKey:_me.mobileFormAlias,boAlias:_me.boAlias,id:_me.id?_me.id:'',action:_me.action}
      _me.$store
      .dispatch("form/getTemplateForm", data)
      .then(rep => {
        if(rep.result){
            _me.data = rep.data;
            if (rep.permission) {
              _me.permission = rep.permission;
            }
            _me.html = rep.form.formHtml;
        }
      });
    };

    this.$store
    .dispatch("form/getBpmDataTemplateInfo", {templateKey:this.templateKey})
    .then(result => {
      if(result.state){
          _me.boAlias = result.value.boDefAlias;
          _me.defKey = result.value.defId;
          _me.mobileFormAlias = result.value.mobileFormAlias;

          handler();
      }
    });
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
.base-main {
  background-color: #e9eef3;
}

/deep/ .form-table {
  width: 100%;
  border-top: 1px solid #ebeef5;
  border-left: 1px solid #ebeef5;
}

/deep/ .form-table > thead > tr > th, /deep/ .form-table > tbody > tr > th {
  text-align: right;
  color: #666;
  font-weight: normal;
}

/deep/ .form-table > tbody > tr > th.group-th {
  text-align: left;
  background: #f9f9f9;
  font-weight: bold;
}

/deep/ .form-table > thead > tr.sub-table-header > th {
  text-align: center;
  background: #fafafa;
}

/deep/ .form-table > tbody > tr > th > span, /deep/ .form-table > thead > tr > th > span {
  color: #f00;
}

/deep/ .form-table > tbody > tr > th, /deep/ .form-table > tbody > tr > td, /deep/ .form-table > tfoot > tr > td, /deep/ .form-table > thead > tr > th {
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  padding: 10px;
  min-width: 0;
  box-sizing: border-box;
  text-overflow: ellipsis;
  vertical-align: middle;
  position: relative;
}

/deep/ .form-table > tfoot > tr > td {
  padding: 5px 10px;
}

.form-container {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.form-container > span {
  border-left: 3px solid  $--theme-color;
  font-weight: bold;
  font-size: 14px;
  padding-left: 10px;
  color: #666;
}

.form-content {
  padding: 11px 0;
}

/deep/ div[aria-invalid='true'] + small, /deep/ small.error-message {
  display: block;
  margin-top: 8px;
  color: #f56c6c;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
}
</style>
