<template>
  <div style="padding-top: 10px;">
    <NavBar>
      <template slot="title">{{templateInfo.name}}</template>
    </NavBar>
    <span v-if="html">
      <template-dynamic-view
        :templateKey="templateKey"
        :html="html"
        :taskType="taskType"
        :single="single"
        :dataView="dataView"
        :isJoinFlow="isJoinFlow"
        :parameterqQuerys="parameterqQuerys"
        :templateInfo="templateInfo"
      />
    </span>
    <div class="loaded-fail__div" v-if="loadedFail">报表不存在...</div>
  </div>
</template>

<script>
import NavBar from "@/components/navBar/NavBar.vue";
import { mapState, mapActions } from "vuex";
import { Message } from "element-ui";
import { Loading } from "element-ui";
import HtCheckbox from "@/components/control/HtCheckbox.vue";
import HtDialog from "@/components/control/HtDialog.vue";
import TemplateDynamicView from "@/components/dataTemplate/TemplateDynamicView.vue";
import HtDialogBtn from "@/components/control/htDialogBtn.vue";
import VRuntimeTemplate from "v-runtime-template";
import utils from "@/utils.js";
import { Base64 } from "js-base64";

export default {
  name: "templatePreview",
  props: {
    templateKey: String,
    parameterqQuerys: String,
    single: String,
    taskType: {
      default: ""
    },
    defKey: String,
    dataView: Object,
    isJoinFlow: {
      default: false
    }
  },
  data() {
    return {
      html: "",
      templateInfo: {},
      tableData: { selectRows: [], querys: "" },
      dialogExportVisible: false,
      exportData: { getType: "all", expField: [] },
      displayFields: [],
      exportSellection: [],
      searchForm: { F_xb: "", F_xm: "" },
      queryForm: {
        queryData: ""
      },
      formType: false,
      labelPosition: "left",
      incons: "el-icon-arrow-down",
      options: {
        fullscreen: true,
        lock: true
      },
      loadedFail: false,

    };
  },
  computed: {
    ...mapState({
      dialogSubVisible: state => state.form.bpmTemplateSubData.dialogSubVisible,
      tabs: state => state.form.bpmTemplateSubData.tabs,
      ents: state => state.form.bpmTemplateSubData.ents,
      refId: state => state.form.bpmTemplateSubData.refId
    })
  },
  components: {
    NavBar,
    VRuntimeTemplate,
    HtCheckbox,
    HtDialog,
    HtDialogBtn,
    TemplateDynamicView
  },
  watch: {
    templateKey: function(newVal) {
      if (newVal) {
        this.init();
      }
    }
  },
  created() {
    this.init();
  },
  methods: {
    // 根据当前formKey初始化
    init() {
      const loading = this.$loading(this.options);
      let _me = this;
      this.$store.dispatch("form/getBpmDataTemplateInfo", {
        templateKey: this.templateKey
      }).then(result => {
        if (result.state) {
          _me.templateInfo = result.value;
          loading.close();
        }
      });
      this.$store
        .dispatch("form/getTemplateDataListForm", this.templateKey)
        .then(result => {
          if (result.state) {
            _me.html = result.value;
          }else{
            this.loadedFail = true;
          }
        })
        .finally(() => {
          loading.close();
        });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
/deep/ th.todo-header-row {
  background-color: #fafafa;
  font-size: 13px;
}

/deep/ tr.todo-row {
  font-size: 13px;
  color: $--color-text-regular;
}

.el-container {
  background-color: #fff;
}

.el-row {
  margin-bottom: 20px;
}

.el-header {
  border-bottom: 1.5px solid #ededed;
}

.i {
  margin-right: 4px;
}

.todo-subject {
  cursor: pointer;
}

.todo-subject:hover {
  color: $--theme-color;
}

/deep/ .el-dialog__body {
  padding: 15px 10px;
}

/deep/ .el-checkbox {
  margin-left: 15px;
}

/deep/ .el-radio {
  margin-left: 15px;
}

/deep/ .el-button{
  margin-left: 0px;
}
.loaded-fail__div {
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  color: #f56c6c;
}
</style>
