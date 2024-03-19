<template>
  <el-dialog
    title="编辑模板"
    :visible.sync="dialogVisible"
    width="65%"
    appendToBody
    :close-on-click-modal="false"
    top="8vh"
    :before-close="handleClose">
      <el-form v-model="dataTemplate" data-vv-scope="editTemplateHtmlForm">
          <ht-form-item label="报表别名" prop="alias" label-width="180px">
            <ht-input
              v-model="dataTemplate.alias"
              disabled
              :validate="{required:true}"
            ></ht-input>
          </ht-form-item>
          <ht-form-item label="报表模板" prop="name" label-width="180px">
            <codemirror
              ref="template"
              :value="dataTemplate.templateHtml"
              :options="cmOptions"
              class="code">
            </codemirror>
          </ht-form-item>
      </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="onConfirm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import form from "@/api/form.js";
import { codemirror } from 'vue-codemirror';
import "codemirror/theme/ambiance.css";
require("codemirror/mode/javascript/javascript"); 

export default {
  name: "template-html-edit",
  props: ["data"],
  components: { codemirror },
  data() {
    return {
      dataTemplate: {},
      dialogVisible: false,
      cmOptions:{
        value:'',
        mode:"text/javascript",
        lineNumbers: true,
        line: true,
        lineWiseCopyCut: true,
        showCursorWhenSelecting: true,
      },
    };
  },
  computed: {
    codemirror() {
      return this.$refs.template.codemirror;
    }
  },
  watch:{
    data:{
      handler(newVal, oldVal) {
        if ( newVal != oldVal) {
          this.dataTemplate = newVal;
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    onConfirm(selection) {
       this.dataTemplate.templateHtml = this.codemirror.getValue();
       form.saveTemplateHtml(this.dataTemplate).then(response => {
          if(response.state){
            this.dialogVisible = false;
            this.$message.success(response.message);
          }else{
            this.$message.error(response.message);
          }
      });
    },
    handleClose(){
      this.dialogVisible = false;
    },
    showDialog(){
      this.dialogVisible = true;
    },
  },
};
</script>
<style scoped>

</style>
