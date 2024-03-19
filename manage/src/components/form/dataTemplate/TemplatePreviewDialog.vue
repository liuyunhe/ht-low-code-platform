<template>
  <v-runtime-template :template="html"/>
</template>
<script>
import form from "@/api/form.js";
import VRuntimeTemplate from "v-runtime-template";
import { Base64 } from "js-base64";

export default {
  name: "templatePreview",
  components: {
    VRuntimeTemplate,
  },
  props: {
    alias: String,
  },
  data() {
    return {
      templateInfo:{},
      data: [],
      html: '',
      pageResult: {
        page: 1,
        pageSize: 20,
        total: 0
      },
    };
  },
  watch: {
    alias: function(newVal) {
      if (newVal) {
        this.init();
      }
    }
  },
  mounted() {
    if(this.alias){
      this.init();
    }
  },
  methods: {
    init(){
      let _me = this;
      form.getTemplateDataListForm(this.alias)
        .then(result => {
        if (result.state) {
            _me.html = result.value;
        }
      });
      form.getBpmDataTemplateInfo(this.alias)
        .then(result => {
          if (result.state) {
            _me.templateInfo = result.value;
            if (_me.templateInfo.displayField) {
              let displayField = JSON.parse( _me.templateInfo.displayField);
              for (var i = 0; i < displayField.length; i++) {
                if (displayField[i].type) {
                  this.displayFields.push(displayField[i]);
                }
              }
            }
          }
      });
    },
    loadData(param, cb) {
      form
        .getDataTemplateData(param)
        .then(response => {
          this.data = response.rows;

          this.pageResult = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total
          };
        })
        .finally(() => cb());
    },
    handleCommand(params) {
      switch (params.command) {
        case "edit":
          this.templateId = params.row.id;
          this.editFormTemplate(this.templateId);
          break;
        case "delete":
          break;
        case "assignUser":
          break;
        case "assignMenu":
          break;
        default:
          break;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.el-main {
  padding-top: 0px;
}

.form-editor-dialog >>> .el-dialog__header {
  display: none;
}

.form-editor-dialog >>> .el-dialog__body {
  padding: 0;
  height: 100%;
}

div >>> .el-dialog__body {
  height: calc(100% - 10px);
  padding: 10px;
}
</style>