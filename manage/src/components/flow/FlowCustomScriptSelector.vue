<template>
  <el-dialog
      width="80%"
      title="自定脚本选择器"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      v-if="dialogVisible"
      top="8vh"
      append-to-body>
      <div style="width:100%;height:500px">
          <el-button @click="showScriptDialog('eipScriptDialog')">常用脚本</el-button>
          <el-button style="margin-right:10px" @click="showConditionBuild">条件脚本</el-button>
          <FlowVarSelector  :defId="bpmDefinition.id"   @node-click="varTreeOnConfirm" /><br/>
          <ht-input :rows="8" style="width: 100%;" type="textarea" v-model="curScript" permission="b"/>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleClose" size="medium">确 定</el-button>
        <el-button @click="dialogVisible = false" size="medium">取 消</el-button>
      </span>
      <FlowConditionBuildDialog  @onConfirm="conditionDialogConfirm" :defId="bpmDefinition.id" ref="flowConditionBuildDialog" />
       <!-- 常用脚本选择对话框  -->
      <eip-script-dialog ref="eipScriptDialog"  name="eipScriptDialog" @onConfirm="dialogOnConfirm" append-to-body
    />
    </el-dialog>
</template>

<script>
import req from "@/request.js";
import { mapState, mapActions } from "vuex";
import { Message } from 'element-ui';

import FlowVarSelector from "@/components/flow/FlowVarSelector.vue";
import FlowConditionBuildDialog from "@/components/flow/FlowConditionBuildDialog.vue";
const eipScriptDialog = () => import("@/components/dialog/EipScriptDialog.vue");

export default {
  name:"hsScript",
  components: {FlowVarSelector,FlowConditionBuildDialog,eipScriptDialog},
  data() {
    return {
      dialogVisible:false,//是否显示设置节点按钮侧边栏
      curScript:'',
      defId:''
    };
  },
  computed: mapState({
    bpmDefinition: state => state.flow.defConfigData.initData.bpmDefinition,
  }),
  methods: { 
    dialogOnConfirm(data) {
      this.curScript  = data;
    },
    showScriptDialog(ref) {
      this.$refs[ref].showDialog({});
    },
    conditionDialogConfirm(data) {
      this.curScript  = data;
    },
    showConditionBuild() {
      this.$refs.flowConditionBuildDialog.showDialog();
    },
    varTreeOnConfirm(data) {
      this.curScript = this.curScript+data.pathValue;
    },
    showDialog (param) {
       this.curScript = param ;
       this.dialogVisible = true;
    },
    handleClose(){
      if(!this.curScript){
          this.$message.error("脚本不能为空");
          return;
      }
      this.$emit('customScriptSelectorConfirm',this.curScript);
      this.dialogVisible=false;
    }
  },
  mounted() {
  
  }
};
</script>

<style lang="scss" scoped>
.div_list{
    height: 30px;
    background: #e2e2e2;
    line-height: 30px;
    font-weight: bold;
    padding-left: 10px;
    margin-bottom: 10px;
}
>>>label.el-checkbox {
    margin: 5px 10px 0 0;
}
.ht{
  width: 300px;
}
.form-inline{
  float: left;
  width: 100%;
}
.left-label {
    width: 18%;
    float: left;
}
.control-label {
    word-break: break-all;
    text-align: right;
    color: #545252;
    font-size: 12px;
    padding: 0px 10px !important;
    font-weight: bold;
    line-height: 35px;
}
div>>>.box-card{
  margin-bottom: 20px;
}

div>>>.box-card .clearfix{
  padding-top: 20px;
}

div>>>.el-collapse-item__header{
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    font-weight: bold;
}


</style>