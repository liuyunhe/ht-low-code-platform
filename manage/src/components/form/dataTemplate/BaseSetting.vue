<template>
  <el-container class="fullheight" style="border: 1px solid #eee">
    <el-form v-model="dataTemplate" data-vv-scope="editDataTemplateForm">
      <ht-form-item label="表单别名" prop="formKey" label-width="180px">
        <ht-input v-model="dataTemplate.formKey" disabled :validate="{required:true}"></ht-input>
      </ht-form-item>
      <ht-form-item label="报表名称" prop="name" label-width="180px">
        <ht-input v-model="dataTemplate.name" :validate="{required:true}" :maxlength="50" :showWordLimit="true"></ht-input>
      </ht-form-item>
      <ht-form-item label="报表别名" prop="alias" label-width="180px">
        <ht-input
          v-model="dataTemplate.alias"
          :disabled="!isEditable"
          v-pinyin="dataTemplate.name"
          name="dataAlias"
          :validate="{required:true, regex:{exp:'^[a-zA-Z][a-zA-Z0-9_]*$', message:'只能输入字母、数字、下划线，且以字母开头' }}"
          :maxlength="50"
          :showWordLimit="true"
        ></ht-input>
      </ht-form-item>
      <ht-form-item label="绑定流程" prop="subject" label-width="180px">
        <span style="margin-right:10px;">{{dataTemplate.subject}}</span>
        <el-button type="primary" size="mini" icon="el-icon-search" @click="showFormFlowDialog()">选择</el-button>
        <el-button
          v-if="dataTemplate.defId"
          type="danger"
          size="mini"
          icon="el-icon-delete"
          @click="clearFormFlow()"
        >清除</el-button>
        <form-flow-dialog
          ref="formFlowDialog"
          :boCode="dataTemplate.boDefAlias"
          :formKey="dataTemplate.formKey"
          :single="true"
          @onConfirm="formFlowDialogOnConfirm"
          append-to-body
        />
      </ht-form-item>

      <ht-form-item label="绑定手机端表单" prop="mobileFormName" label-width="180px">
        <template slot="label">
          <el-tooltip content="手机表单用于扫描二维码后,手机端的查看页面,配置了生成二维码按钮,必须配置手机表单">
            <i class="property-tip icon-question" />
          </el-tooltip>
          <span>绑定手机端表单</span>
        </template>

        <span style="margin-right:10px;">{{dataTemplate.mobileFormName}}</span>
        <el-button type="primary" size="mini" icon="el-icon-search" @click="selectMobileForm()">选择</el-button>
        <el-button
          v-if="dataTemplate.mobileFormAlias"
          type="danger"
          size="mini"
          icon="el-icon-delete"
          @click="clearMobileForm()"
        >清除</el-button>
        <EipFormDialog
          ref="eipFormDialog"
          :single="true"
          @onConfirm="dialogConfirm"
          formType="mobile"
          appendToBody
        />
      </ht-form-item>
      <ht-form-item label="是否分页" prop="needPage" label-width="180px">
        <ht-radio
          v-model="dataTemplate.needPage"
          :options="[{ key: 1, value: '分页'}, { key: 2, value: '不分页'}]"
          :validate="{'required':true}"
        />
      </ht-form-item>

      <ht-form-item v-if="dataTemplate.needPage==1" label="分页大小" label-width="180px">
        <ht-select
          v-model="dataTemplate.pageSize"
          :options="[{'key': 10, 'value':10},{'key': 20, 'value':20},{'key': 50, 'value':50},{'key': 100, 'value':100},{'key': 200, 'value':200},{'key': 300, 'value':300},{'key': 500, 'value':500}]"
          :validate="{'required':true}"
        />
      </ht-form-item>

      <ht-form-item label="是否需要初始化模板" label-width="180px">
        <ht-select
          v-model="dataTemplate.resetTemp"
          :options="[{'key': 1, 'value':'是'},{'key': 0, 'value':'否'}]"
          :validate="{'required':true}"
        />
      </ht-form-item>

      <ht-form-item label="是否允许外链" prop="allowShare" label-width="180px">
        <ht-radio
          v-model="dataTemplate.allowShare"
          :options="[{ key: 1, value: '是'}, { key: 2, value: '否'}]"
          :validate="{'required':true}"
        />
      </ht-form-item>

      <ht-form-item label="数据模板" label-width="180px">
        <ht-select
          v-model="dataTemplate.templateAlias"
          class="m-r"
          :options="templates"
          :props="{key:'alias',value:'templateName'}"
          :validate="{'required':true}"
        />
      </ht-form-item>
      <ht-form-item label="前置groovy脚本" prop="beforeScript" label-width="180px">
        <el-tag type='warning' effect="plain">获取表单主表子表内容，例:&nbsp;boData.getByKey("字段名");&nbsp;给表单主表子表内容赋值，例:&nbsp;boData.set("字段名","值");</el-tag>
        <codemirror
          v-model="dataTemplate.beforeScript"
          :options="cmOptions2"
          style="width:600px;"
        ></codemirror>
      </ht-form-item>
      <ht-form-item label="后置groovy脚本" prop="afterScript" label-width="180px">
        <codemirror
          v-model="dataTemplate.afterScript"
          :options="cmOptions2"
          style="width:600px;"
        ></codemirror>
      </ht-form-item>
    </el-form>
    <!-- 编辑报表模板对话框  -->
    <template-html-edit
      ref="templateHtmlEdit"
      name="templateHtmlEdit"
      :data="dataTemplate"
      append-to-body
    />

    <!-- 报表添加到菜单对话框  -->
    <template-add-to-menu
      ref="templateAddToMenu"
      name="templateAddToMenu"
      :alias="dataTemplate.alias"
      append-to-body
    />
  </el-container>
</template>

<script>
const FormFlowDialog = () =>
  import("@/components/form/dataTemplate/FormFlowDialog.vue");
const TemplateHtmlEdit = () =>
  import("@/components/form/dataTemplate/TemplateHtmlEdit.vue");
const TemplateAddToMenu = () =>
  import("@/components/form/dataTemplate/TemplateAddToMenu.vue");

const EipFormDialog = () => import("@/components/dialog/EipFormDialog.vue");

import utils from "@/hotent-ui-util.js";
export default {
  name: "base-setting",
  props: ["data", "focusAlias","showShareBtn"],
  components: {
    FormFlowDialog,
    TemplateHtmlEdit,
    TemplateAddToMenu,
    EipFormDialog
  },
  data() {
    return {
      dataTemplate: { alias: "" },
      templates: [],
      isEditable: true,
      cmOptions1: {
        value: "",
        mode: "groovy",
        readOnly: false,
        smartIndent:true,
        tabSize: 1,
        theme: 'base16-light',
        lineNumbers: true,
        line: true,
      },
      cmOptions2: {
        value: "",
        mode: "groovy",
        readOnly: false,
        smartIndent:true,
        tabSize: 1,
        theme: 'base16-light',
        lineNumbers: true,
        line: true,
      },
    };
  },
  mounted() {
    this.dataTemplate = this.data.bpmDataTemplate;
    this.dataTemplate.beforeScript = this.dataTemplate.beforeScript || "";
    this.dataTemplate.afterScript = this.dataTemplate.afterScript || "";
    this.templates = this.data.templates;
    this.initData();
  },
  watch:{
    focusAlias: function(newVal, oldVal) {
      if(newVal){
        document.getElementsByName("dataAlias")[0].focus();
        document.getElementsByName("dataAlias")[0].style.border = "1px solid red";
      }else{
        document.getElementsByName("dataAlias")[0].style.border = "";
      }
    },
    'dataTemplate.allowShare': function(newVal, oldVal) {
      if (newVal) {
        this.$emit('update:showShareBtn',newVal);
      }
    }
  },
  methods: {
    clearMobileForm() {
      this.dataTemplate.mobileFormAlias = "";
      this.dataTemplate.mobileFormName = "";
    },
    selectMobileForm() {
      this.$refs.eipFormDialog.showDialog();
    },
    dialogConfirm(data) {
      if (data && data.length > 0) {
        data = data[0];
        this.dataTemplate.mobileFormAlias = data.formKey;
        this.dataTemplate.mobileFormName = data.name;
      }
    },
    //初始化处理
    initData() {
      if (this.dataTemplate.id) {
        this.isEditable = false;
      }
      if (this.dataTemplate.needPage === null) {
        this.dataTemplate.needPage = 1;
        if (this.dataTemplate.pageSize == null) {
          this.dataTemplate.pageSize = 20;
        }
      }
      if (this.dataTemplate.allowShare == null) {
        this.dataTemplate.allowShare = 2;
      }
      if (this.dataTemplate.resetTemp == null) {
        this.$set(this.dataTemplate, "resetTemp", 1);
      }
    },
    //显示流程选择器
    showFormFlowDialog() {
      this.$refs.formFlowDialog.showDialog({});
    },
    //回填绑定流程
    formFlowDialogOnConfirm(selection) {
      if (!selection || selection.length == 0) {
        this.dataTemplate.defId = "";
        this.dataTemplate.subject = "";
      } else {
        this.dataTemplate.defId = selection[0].defKey;
        this.dataTemplate.subject = selection[0].name;
      }
    },
    //显示模板编辑器
    showHtmlEditDialog() {
      this.$refs.templateHtmlEdit.showDialog({});
    },
    //显示添加到菜单dialog
    showAddToMenuDialog(type) {
      this.$refs.templateAddToMenu.showDialog(type,"addReport");
    },
    //清除绑定流程
    clearFormFlow() {
      this.dataTemplate.defId = "";
      this.dataTemplate.subject = "";
    },
    validateForm(callback) {
      utils
        .validateForm(this, "editDataTemplateForm")
        .then(r => {
          callback();
        })
        .catch(items => {
          this.$message.error(`请完整填写报表基本信息。`);
        });
    }
  } ,
  created() {
    this.$validator = this.$root.$validator;
  },
};
</script>
<style lang="scss" scoped>
div>>>.CodeMirror {
    font-family: monospace;
    height: 350px !important;
    color: black;
    direction: ltr;
}
</style>
