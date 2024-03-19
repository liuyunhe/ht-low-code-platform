<template>
  <el-container>
    <ht-sidebar-dialog
      width="28%"
      :title="title"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      append-to-body
    >
      <el-form :model="formData" data-vv-scope="templateForm">
            <ht-form-item label="名称" label-width="120px">
              <ht-input
                v-model="formData.name"
                :validate="{ required: true }"
                :maxlength="50"
                :showWordLimit="true"
              />
              <el-tooltip class="item" effect="dark" placement="top-end">
                <div slot="content">
                  <span>人员脚本用于流程设计中节点事件设置</span>
                </div>
                <i class="el-icon-question"></i>
              </el-tooltip>
            </ht-form-item>
            <ht-form-item label="脚本" class="is-required" label-width="120px">
              <div style="height: 35px;width: 100%;position: relative;float: left">
                <el-tooltip
                        class="item"
                        effect="dark"
                        :content="text"
                        placement="top-end"
                >
                  <el-button @click="executeScript" style="position: absolute;top: 1px">测试脚本</el-button>
                </el-tooltip>
              </div>
                <codemirror
                  ref="script"
                  v-model="formData.script"
                  :options="cmOptions"
                  class="mycode"
                  style="width: 99%;height:100%;position: relative;float: left"
                ></codemirror>
            </ht-form-item>
            <ht-form-item label="脚本分类" class="is-required" label-width="120px">
                <el-tooltip
                        class="item"
                        effect="dark"
                        :content="typeDesc"
                        placement="top-end"
                >
                  <el-select
                          v-model="formData.category"
                          filterable
                          allow-create
                          default-first-option
                          placeholder="请选择脚本分类">
                    <el-option
                            v-for="item in options"
                            :key="item"
                            :label="item"
                            :value="item">
                    </el-option>
                  </el-select>
                </el-tooltip>
            </ht-form-item>
            <ht-form-item label="备注" label-width="120px">
              <ht-input
                v-model="formData.memo"
              />
            </ht-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <ht-submit-button
          :url="saveUrl()"
          :model="formData"
          :is-submit="isSubmit"
          scope-name="templateForm"
          @before-save-data="beforeSaveData()"
          @after-save-data="afterSaveData"
          >保存</ht-submit-button
        >
        <el-button @click="handleClose">取 消</el-button>
      </div>
    </ht-sidebar-dialog>
  </el-container>
</template>

<script>
    import flow from "@/api/flow.js";

    export default {
  props: ["editData"],
  data() {
    return {
      categoryList: [{ key: "系统脚本", value: "系统脚本" }],
      dialogVisible: false,
      title: "",
      isSubmit: false,
      formData: {
        category: "",
        memo: "",
        name: "",
        script: ""
      },
      text:"请根据方法所需类型参数进行传参，避免执行失败",
      typeDesc:"可在下拉框输入新分类，保存后可自动新增分类选项",
      options: [],
      cmOptions: {
        value: "",
        mode: "groovy",
        readOnly: false,
        smartIndent: true,
        tabSize: 2,
        theme: "base16-light",
        lineNumbers: true,
        line: true
      },
    };
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
      this.formData = {
        category: "",
        memo: "",
        name: "",
        script: ""
      };
    },
    saveUrl() {
      return window.context.bpmRunTime + "/runtime/script/v1/save";
    },
    beforeSaveData() {
      if(!this.formData.script || this.formData.script == ""){
        this.$message({message:"脚本未填写",type:"warning"});
        return false;
      }
      if(!this.formData.category || this.formData.category == ""){
        this.$message({message:"脚本分类不能为空",type:"warning"});
        return false;
      }
      this.isSubmit = true;
    },
    afterSaveData() {
      this.handleClose();
      this.$emit("loadList");
    },
    handleOpen() {
      this.dialogVisible = true;
      this.title = this.editData.title;
      if (this.editData.data) {
        this.formData = this.editData.data;
      };
      this.getScriptType();
    },
    //执行脚本
    executeScript() {
      flow.executeScript(this.formData.script).then(resp => {
        if (resp.data.state) {
          this.$message({ message: resp.data.message, type: "success" });
        }
      });
    },
    //获取常用脚本分类
    getScriptType(){
      flow.getScriptType().then(resp=>{
        this.options=resp.data
      })
    }
  }
};
</script>

<style scoped></style>
