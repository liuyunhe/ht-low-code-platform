<template>
  <ht-sidebar-dialog
      title="编辑委托"
      :visible="dialogVisible"
      width="32%"
      :before-close="beforeClose"
      :destroy-on-close="true">
    <el-form :model="data" data-vv-scope="delegation" v-form>
      <ht-form-item label="委托人">
        <eip-user-selector
            v-model="data.authName"
            :single="true"
            :config="{id:'data.authId'}"
            :validate="{required:true}"
            append-to-body/>
      </ht-form-item>
      <ht-form-item label="委托类型">
        <el-radio-group v-model="data.type">
          <el-radio-button :label="1">全权委托</el-radio-button>
          <el-radio-button :label="2">部分委托</el-radio-button>
        </el-radio-group>
      </ht-form-item>
      <ht-form-item label="标题">
        <ht-input v-model="data.subject" placeholder="请输入标题" :maxlength="50" :showWordLimit="true" :validate="{required:true}"/>
      </ht-form-item>
      <ht-form-item label="开始时间">
        <ht-date
            v-model="data.startDate"
            type="datetime"
            placeholder="选择日期时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            :validate="{required:true}" />
      </ht-form-item>
      <ht-form-item label="结束时间">
        <ht-date
            v-model="data.endDate"
            type="datetime"
            placeholder="选择日期时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            :validate="{required:true}" />
      </ht-form-item>
      <ht-form-item label="是否有效">
        <el-radio-group v-model="data.isEnabled">
          <el-radio-button label="Y">启用</el-radio-button>
          <el-radio-button label="N">禁止</el-radio-button>
        </el-radio-group>
      </ht-form-item>
      <ht-form-item label="被委托人">
        <eip-user-selector
            v-model="data.agent"
            :config="{id:'data.agentId'}"
            :validate="{required:true}"
            :single="true"
            append-to-body/>
      </ht-form-item>
    </el-form>
    <template v-if="data.type===2">
      <el-button type="primary" @click="showDialog" icon="el-icon-plus" style="margin-bottom: 10px">新增</el-button>
      <el-table
          :data="defList"
          style="width: 100%"
          border>
        <el-table-column
            prop="flowName"
            label="流程名称"/>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
                size="mini"
                type="danger"
                @click="deleteRow(scope.$index, data.defList)"
                icon="el-icon-delete">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>
    <div slot="footer" class="dialog-footer">
      <ht-submit-button
        :url="saveUrl"
        :model="data"
        :isSubmit="isSubmit"
        scope-name="delegation"
        @before-save-data="beforeSaveData"
        @after-save-data="afterSaveData">
      {{$t("eip.common.save")}}
    </ht-submit-button>
    <el-button @click="close('editDialogVisible')">{{$t("eip.common.cancel") }}</el-button>
    </div>
    <eip-flow-dialog ref="eipFlowDialog" @onConfirm="dialogOnConfirm" rightType="start" append-to-body/>
  </ht-sidebar-dialog>
</template>

<script>
  import flow from "@/api/flow.js";
  const eipUserSelector = () => import("@/components/selector/EipUserSelector.vue");
  const eipFlowDialog = () => import("@/components/dialog/EipFlowDialog.vue");
  export default {
    components:{
      eipUserSelector,
      eipFlowDialog
    },
    props:["editData"],
    data(){
      return {
        initData:{
          type:1,
          isEnabled:"Y"
        },
        data:{
          authName:"",
          type:1,
          subject:"",
          startData:"",
          endData:"",
          isEnabled:"Y",
          agent:"",
        },
        dialogVisible:false,
        saveUrl:window.context.bpmModel+"/flow/agent/v1/save",
        defList:[],
        isSubmit:false
      }
    },
    methods:{
      beforeClose(){
        this.dialogVisible = false;
      },
      handleOpen(){
        this.dialogVisible = true;
        this.$nextTick(()=>{
          if (!this.editData.subject){
            this.data = {...this.initData};
          }else{
            this.data = this.editData;
            this.defList = this.editData.defList;
          }
        });
      },
      close(){
        this.dialogVisible = false;
      },
      afterSaveData(){
        this.close();
        this.$emit("after-save",{});
      },
      showDialog(){
        this.$refs.eipFlowDialog.showDialog();
      },
      dialogOnConfirm(data){
        for (let i=0;i<data.length;i++){
          this.defList.push({flowKey:data[i].defKey,flowName:data[i].name});
        }
        this.defList = this.defList.unique("flowKey");
      },
      deleteRow(index, rows) {
        rows.splice(index, 1);
      },
      beforeSaveData(){
        this.isSubmit = true;
        if (this.defList.length<=0 && this.data.type===2){
          this.isSubmit = false;
          this.$message({type:'warning',message:'部分委托流程不能为空'});
          return;
        }
        if (Date.parse(this.data.startDate)>Date.parse(this.data.endDate)){
          this.isSubmit = false;
          this.$message({type:'warning',message:'开始日期不可大于结束日期'});
          return;
        }
        if (!this.data.startDate){
          this.isSubmit = false;
          this.$message({type:'warning',message:'请添加开始时间'});
          return;
        }
        if (!this.data.endDate){
          this.isSubmit = false;
          this.$message({type:'warning',message:'请添加结束时间'});
          return;
        }
        if (this.data.agent===this.data.authName){
          this.isSubmit = false;
          this.$message({type:'warning',message:'委托人与别委托人不能相同'});
          return;
        }
        this.data.defList = this.defList;
      }
    }
  }
</script>

<style lang="scss" scoped>
/deep/.el-dialog__body {
  height: calc(100% - 170px);
  overflow-y: auto;  
}
@media (max-width: 1024px) {
  /deep/ .el-dialog{
    width:40% !important;
  }
}
</style>
