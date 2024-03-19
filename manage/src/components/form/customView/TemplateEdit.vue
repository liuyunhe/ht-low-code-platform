<template>
  <el-dialog
      title="编辑模板"
      :visible="dialogVisible"
      :before-close="beforeClose"
      :close-on-click-modal="false"
      width="60%"
      append-to-body>
    <el-form>
      <ht-form-item label="别名">
        <ht-input v-model="data.alias" :disabled="true"/>
      </ht-form-item>
      <ht-form-item label="模板内容">
        <codemirror
          ref="mycode"
          v-model="data.template"
          :options="cmOptions"
          class="mycode"
          style="width: 100%;height:500px;"
        ></codemirror>
      </ht-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="save" type="primary">保存</el-button>
      <el-button @click="close">返回</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import form from "@/api/form.js";
  export default {
    props:{
      id:String
    },
    data(){
      return {
        dialogVisible:false,
        data:{},
        cmOptions: {
          value: "",
          mode: "vue",
          readOnly: false,
          smartIndent: true,
          tabSize: 2,
          theme: "base16-light",
          lineNumbers: true,
          line: true
        },
      }
    },
    methods:{
      beforeClose(){
        this.dialogVisible = false;
      },
      handleOpen(){
        this.dialogVisible = true;
        this.$nextTick(()=>{
          form
            .getQueryViewTemplate(this.id)
            .then(response=>{
              this.data = response;
            });
        })
      },
      save(){
        form.saveQueryViewTemplate(this.id,this.data.template).then(response=>{
          if(response.state){
            this.$message({message:response.message,type:'success'});
            this.close();
            this.$emit('closeViewEdit');
          }else{
            this.$message.error(response.message);
          }
        })
      },
      close(){
        this.dialogVisible = false;
      },
    }
  }
</script>

<style  lang="scss"  scoped>
@import "@/assets/css/element-variables.scss";
@import "@/assets/css/form-editor.scss";

.mycode >>>.CodeMirror {
    font-family: monospace;
    height: 500px !important;;
    color: black;
    direction: ltr;
}
</style>
