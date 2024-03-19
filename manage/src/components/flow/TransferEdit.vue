<template>
  <el-dialog
      title="添加移交记录"
      :visible="dialogVisible"
      width="35%"
      :close-on-click-modal="false"
      :before-close="beforeClose">
      <el-form v-form>
        <ht-form-item label="移交人">
          <eip-user-selector
              v-model="data.transferName"
              :single="true"
              :config="{id:'data.transfer'}"
              :validate="{required:true}"
              append-to-body
              @input="input"/>
        </ht-form-item>
        <ht-form-item label="被移交人">
          <eip-user-selector
              v-model="data.transferedName"
              :single="true"
              :config="{id:'data.transfered'}"
              :validate="{required:true}"
              append-to-body/>
        </ht-form-item>
      </el-form>
    <ht-table
        @load="loadData"
        :data="flowData"
        :pageResult="pageResult"
        :show-export="false"
        :show-custom-column="false"
        :quick-search-props="[{prop:'text.creator_',label:'申请人'},{prop:'text.subject_',label:'标题'}]"
        ref="table">
      <ht-table-column type="index" width="50" align="center" label="序号" />
      <ht-table-column
          prop="creator"
          label="申请人"
          :show-overflow-tooltip="true"
      />
      <ht-table-column
          prop="subject"
          label="流程标题"
          :show-overflow-tooltip="true"
      />
      <ht-table-column
          prop="createTime"
          label="创建时间"
          :show-overflow-tooltip="true"
      />
    </ht-table>
    <el-dialog
      :visible="reasonDialogVisible"
      title="移交原因"
      :before-close="beforeReasonClose"
      :close-on-click-modal="false"
      append-to-body>
      <ht-input
          type="textarea"
          v-model="expression"
          :autosize="{ minRows: 2, maxRows: 4}"
          placeholder="移交原因"
      />
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirm">确 定</el-button>
        <el-button @click="reasonDialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="transfer">移交</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>

  </el-dialog>
</template>

<script>
  import flow from "@/api/flow.js";
  const eipUserSelector = () => import("@/components/selector/EipUserSelector.vue");
  export default {
    components:{
      eipUserSelector
    },
    data(){
      return {
        dialogVisible:false,
        reasonDialogVisible:false,
        pageResult:{
          page:0,
          pageSize:50,
          total:0
        },
        flowData:[],
        data:{},
        selectUsers:{},
        expression:""
      }
    },
    methods:{
      beforeClose(){
        this.dialogVisible = false;
        this.flowData = [];
        this.data = {};
      },
      beforeReasonClose(){
        this.reasonDialogVisible = false;
        this.expression = "";
      },
      loadData(param,cb){
        if (this.data.transfer!=null){
          flow
            .getInstList(this.data.transfer,param)
            .then(response=>{
              this.flowData = response.rows;
              this.pageResult={
                pageSize:response.pageSize,
                page:response.page,
                total:response.total
              };
            })
            .finally(()=>{
              cb();
            });
         }else{
          cb();
        }
      },
      handleOpen(){
        this.dialogVisible = true;
      },
      transfer(){
        let selectRows = this.$refs.table.$refs.htTable.selection;
        if(this.data.transfer && this.data.transfer === this.data.transfered){
          this.$message({type:"warning",message:"移交人和被移交人不能为同一人!"});
          return ;
        }
        if(!this.data.transfer){
          this.$message({type:"warning",message:'移交人不能为空！'});
          return ;
        }
        if(!this.data.transfered){
          this.$message({type:"warning",message:'被移交人不能为空'});
          return ;
        }
        let instjson = "";
        if(selectRows){
          let instArr = [];
          for (let i = 0; i < selectRows.length; i++) {
            instArr.push({"instId":selectRows[i].id,"defId":selectRows[i].procDefId});
          }
          if(instArr.length>0){
            instjson = JSON.stringify(instArr);
          }
        }
        if(!instjson){
          this.$message({type:"warning",message:'请选择要移交的流程！'});
          return;
        }
        this.data.insts=instjson;
        this.reasonDialogVisible = true;
      },
      input(value){
        this.$refs.table.load();
      },
      confirm(){
        let _this = this;
        this.data.type="离职移交";
        this.data.reason = this.expression;
        if(!this.data.reason){
          this.$message({type:"warning",message:'移交原因必填！'});
          return ;
        }
        if(this.data.insts){
          this.data.isadmin = "y";
          flow
            .turnOver(this.data)
            .then(function(response) {
              if(response.state){
                _this.$message({type:"success",message:"移交成功"});
                _this.beforeClose();
                _this.beforeReasonClose();
                _this.$emit("after-save",{});
              }else{
                this.$message.error(response.message);
              }
            });
        }
      }
    }
  }
</script>

<style scoped>
  >>>.el-table--scrollable-y .el-table__body-wrapper{
    max-height: 373px !important;
  }
  >>>.ht-table{
    height:410px !important;
  }
  >>>.ht-table-panel{
    height:83% !important;
  }
</style>
