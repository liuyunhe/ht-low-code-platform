<template>
  <el-dialog
    width="60%"
    :title="title"
    :visible="dialogVisible"
    :before-close="handleClose"
    append-to-body
  >
    <el-form :model="form" data-vv-scope="templateForm">
      <el-row>
        <el-col :span="8">
          <ht-form-item label="模板名称" label-width="90px">
            <ht-input
              v-model="form.templateName"
              autocomplete="off"
              :validate="{ required: true }"
              :maxlength="50"
              :showWordLimit="true"
            ></ht-input>
          </ht-form-item>
        </el-col>
        <el-col :span="8">
          <ht-form-item label="模板别名" label-width="90px">
            <ht-input
              v-if="form.id"
              disabled
              v-pinyin="form.templateName"
              v-model="form.alias"
              autocomplete="off"
            ></ht-input>
            <ht-input
              v-else
              v-pinyin="form.templateName"
              v-model="form.alias"
              autocomplete="off"
              :validate="{ required: true }"
            />
          </ht-form-item>
        </el-col>
        <el-col :span="8">
          <ht-form-item label="类型" label-width="90px">
            <ht-select
              v-model="form.templateType"
              :options="templateType"
              :validate="{ required: true }"
            ></ht-select>
          </ht-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="22">
          <ht-form-item label="模板描述" label-width="90px">
            <ht-input
              style="width: 97%"
              v-model="form.templateDesc"
              autocomplete="off"
              :validate="{ required: true }"
              :maxlength="200"
              :showWordLimit="true"
            ></ht-input>
          </ht-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="22">
          <ht-form-item label="模板内容" label-width="90px">
            <codemirror ref="scriptText" v-validate="{required:true}" v-model="form.html" :options="cmOptions" class="code"  style="width: 99%;height:100%;"></codemirror>
          </ht-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <ht-submit-button
              :url="saveUrl()"
              :model="form"
              :is-submit="isSubmit"
              scope-name="templateForm"
              @before-save-data="beforeSaveData()"
              @after-save-data="afterSaveData"
      >保存</ht-submit-button
      >
      <el-button @click="handleClose">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: ["dialogData"],
  data() {
    return {
      title: "",
      dialogVisible: false,
      isSubmit: false,
      form: {
        html: "",
        alias: "",
        templateDesc: "",
        templateName: "",
        templateType: "",
        source: ""
      },
      templateType: [
        { key: "macro", value: "宏模板" },
        { key: "queryDataTemplate", value: "查询模板" },
        { key: "dataTemplate", value: "业务数据模板" },
        { key: "formDesign", value: "表单设计模板" }
      ],
      cmOptions: {
        value: "",
        mode: "vue",
        readOnly: false,
        tabSize: 2,
        theme: 'base16-light',
        lineNumbers: true,
        line: true,
      }
    };
  },
  methods: {
    //保存地址
    saveUrl() {
      return window.context.form + "/form/template/v1/save";
    },
    //保存前
    beforeSaveData() {
      this.isSubmit = true;
      if(this.form.source != "system"){
        this.form.source = "custom";
      }
    },
    //保存后
    afterSaveData() {
      this.dialogVisible = false;
      this.init();
      this.$emit("loadData");
    },
    init(){
      this.form = {
        html: "",
        alias: "",
        templateDesc: "",
        templateName: "",
        templateType: "",
        source: ""
      };
    },
    //关闭对话
    handleClose() {
      this.dialogVisible = false;
      this.$emit("loadData");
      this.init();
    },
    //打开对话
    openDialog() {
      this.title = this.dialogData.title;
      if (this.dialogData.formData) {
        this.form = this.dialogData.formData;
      }
      this.dialogVisible = true;
    }
  }
};
</script>

<style scoped></style>
