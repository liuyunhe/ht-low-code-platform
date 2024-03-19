<template>
  <ht-sidebar-dialog
      title="编辑秘书"
      :visible="dialogVisible"
      width="28%"
      :before-close="beforeClose">
    <el-form v-form>
      <ht-form-item label="领导姓名">
        <eip-user-selector
            v-model="data.leaderName"
            :config="{id:'data.leaderId'}"
            :validate="{required:true}"
            append-to-body
            :single="true"/>
      </ht-form-item>
      <ht-form-item label="秘书姓名">
        <eip-user-selector
            v-model="data.secretaryName"
            :config="{id:'data.secretaryId'}"
            :validate="{required:true}"
            append-to-body/>
      </ht-form-item>
      <ht-form-item label="是否启用">
        <el-radio-group v-model="data.enabled">
          <el-radio-button label="1">是</el-radio-button>
          <el-radio-button label="2">否</el-radio-button>
        </el-radio-group>
      </ht-form-item>

      <ht-form-item label="共享权限">
          <ht-checkbox v-model="data.shareRight"
                      :options='[{"key":"1","value":"流程发起"},{"key":"2","value":"任务审批"}]' />
      </ht-form-item>

      <el-form-item label="共享类型:" label-width="100px" :required="true">
        <el-radio-group v-model="data.shareType">
          <el-radio-button label="1">流程定义</el-radio-button>
          <el-radio-button label="2">流程分类</el-radio-button>
        </el-radio-group>
      </el-form-item>

    </el-form>
    <el-button type="primary" @click="showDialog" style="margin-bottom: 10px" icon="el-icon-plus">新增</el-button>
    <el-table
        :height="350"
        :data="data.shareType==='1'?flowList:catList"
        style="width: 100%"
        border>
        <el-table-column
          prop="name"
          :label="(data.shareType=='1'?'定义':'分类')+'名称'"/>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="danger"
              @click="deleteRow(scope.$index, data.shareType==='1'?flowList:catList)"
              icon="el-icon-delete">删除</el-button>
          </template>
        </el-table-column>
    </el-table>
    <div slot="footer" class="dialog-footer" :style="isIe ? 'bottom: 0px' : ''">
      <el-button @click="save()" type="primary">{{$t("eip.common.save")}}</el-button>
      <el-button @click="close()">{{$t("eip.common.cancel") }}</el-button>
    </div>
    <eip-flow-dialog ref="eipFlowDialog" @onConfirm="dialogOnConfirm" append-to-body/>
    <eip-sys-type-dialog
        cat-id="6"
        ref="flowTypeDialog"
        @onConfirm="sysTypeDialogOnConfirm"
        append-to-body
        show-checkbox/>
  </ht-sidebar-dialog>
</template>

<script>
  import flow from "@/api/flow.js"
  const eipUserSelector = () => import("@/components/selector/EipUserSelector.vue");
  const eipFlowDialog = () => import("@/components/dialog/EipFlowDialog.vue");
  const eipSysTypeDialog = () => import("@/components/dialog/EipSysTypeDialog.vue");
  export default {
    components:{
      eipUserSelector,
      eipFlowDialog,
      eipSysTypeDialog
    },
    props:{
      editData:{},
    },
    updated(){
      if(((navigator.appName == 'Microsoft Internet Explorer') || ((navigator.appName == 'Netscape') && (new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) != null)))) {
        this.isIe = true
      }
    },
    data(){
      return{
        initData:{
          enabled:"1",
          shareType:"1",
          shareRight:"1,2"
        },
        entityList:[],
        flowList:[],
        catList:[],
        data:{},
        dialogVisible:false,
        isIe: false
      }
    },
    methods:{
      beforeClose(){
        this.dialogVisible = false;
        this.entityList = [];
        this.catList=[];
        this.flowList=[];
      },
      handleOpen(){
        this.dialogVisible = true;
        this.$nextTick(()=>{
          if (!this.editData.leaderName){
            this.data = {...this.initData};
          }else{
            this.data = this.editData;
            this.initList();
          }
        })
      },
      initList(){
        let entityKey = this.data.shareKey.split(",");
        let entityName = this.data.shareName.split(",");
        this.flowList = [];
        this.catList = [];
        if (this.data.shareType==="1"){
          for (let i=0;i<entityKey.length;i++){
            this.flowList.push({key:entityKey[i],name:entityName[i]});
          }
        }else{
          for (let i=0;i<entityKey.length;i++){
            this.catList.push({key:entityKey[i],name:entityName[i]});
          }
        }
      },
      close(){
        this.$set(this,"flowList",[]);
        this.$set(this,"catList",[]);
        this.dialogVisible = false;
        this.isIe = false;
      },
      save(){
        if(!this.data.leaderId){
          this.$message({type:"warning",message:'请选择领导'});
          return;
        }
        if(!this.data.secretaryId){
          this.$message({type:"warning",message:'请选择秘书'});
          return;
        }
        if (this.data.secretaryId.indexOf(',')!==0){
          this.data.secretaryId=","+this.data.secretaryId+",";
        }
        if(!this.data.shareRight){
          this.$message({type:"warning",message:'请选择共享的权限'});
          return;
        }
        if(this.data.secretaryId.indexOf(","+this.data.leaderId+",")>-1){
          this.$message({type:"warning",message:'领导的秘书不能包含领导'});
          return;
        }
        if (this.data.shareType==="1"){
          this.entityList = this.flowList;
        }else{
          this.entityList = this.catList;
        }
        if(!this.entityList || this.entityList.length===0){
          this.$message({type:"warning",message:'请选择要共享的流程'+(this.data.shareType ==='1'?'定义':'分类')});
          return;
        }
        this.data.shareKey = '';
        this.data.shareName = '';
        for(let i=0;i<this.entityList.length;i++){
          if(i===0){
            this.data.shareName +=this.entityList[i].name;
            this.data.shareKey +=this.entityList[i].key;
          }else{
            this.data.shareName +=','+this.entityList[i].name;
            this.data.shareKey +=','+this.entityList[i].key;
          }
        }

        let _this = this;
        flow
          .saveSecretary(this.data)
          .then(resp=>{
            if(!resp.state){
              _this.$message.error(resp.message);
            }else{
              _this.$message({type:"success",message:resp.message});
              _this.beforeClose();
              _this.close();
              _this.$emit("after-save",{});
            }
          });
      },
      deleteRow(index, rows) {
        rows.splice(index, 1);
      },
      showDialog(){
        if (this.data.shareType==="1"){
          this.$refs.eipFlowDialog.showDialog();
        }else{
          this.$refs.flowTypeDialog.showDialog();
        }
      },
      dialogOnConfirm(data){
        for (let i=0;i<data.length;i++){
          this.flowList.push({key:data[i].defKey,name:data[i].name});
        }
        this.flowList = this.flowList.unique("key");
      },
      sysTypeDialogOnConfirm(data){
        for (let i=0;i<data.length;i++){
          this.catList.push({key:data[i].id,name:data[i].name});
        }
        this.catList = this.catList.unique("key");
      }
    }
  }
</script>

<style scoped>

</style>
