<template>
  <ht-sidebar-dialog
      title="代理人设置"
      :visible="dialogVisible"
      width="28%"
      :before-close="beforeClose">
      <el-form v-form>
        <ht-form-item label="被代理人">
          <eip-user-selector
              v-model="data.userName"
              :config="{id:'data.userId'}"
              :validate="{required:true}"
              append-to-body
              :single="true"
              @input="input">
          </eip-user-selector>
        </ht-form-item>
        <ht-form-item label="是否接收邮件">
          <el-radio-group v-model="data.isMail">
            <el-radio-button :label="1">是</el-radio-button>
            <el-radio-button :label="0">否</el-radio-button>
          </el-radio-group>
        </ht-form-item>
        <ht-form-item label="代理人">
          <eip-user-selector
              v-model="data.agentName"
              :config="{id:'data.agentId'}"
              :validate="{required:true}"
              append-to-body
              :single="true">
          </eip-user-selector>
        </ht-form-item>
        <ht-form-item label="是否可用">
          <el-radio-group v-model="data.isUsable">
            <el-radio-button :label="1">是</el-radio-button>
            <el-radio-button :label="0">否</el-radio-button>
          </el-radio-group>
        </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="save()" type="primary">{{$t("eip.common.save")}}</el-button>
        <el-button @click="close()">{{$t("eip.common.cancel") }}</el-button>
      </div>
  </ht-sidebar-dialog>
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
        initData:{
          isMail:1,
          isUsable:1
        },
        dialogVisible:false,
        isSubmit:true,
        data:{
          isMail:1,
          isUsable:1
        }
      }
    },
    props:{
      editData:{
        type:Object,
        default:()=>{}
      }
    },
    methods:{
      beforeClose(){
        this.dialogVisible = false;
      },
      handleOpen(){
        this.dialogVisible = true;
        this.$nextTick(()=>{
          if (!this.editData.userName){
            this.data = {...this.initData};
          }else{
            this.data = this.editData;
          }
        })
      },
      close(){
        this.data = {};
        this.dialogVisible = false;
      },
      save(){
        if(!this.data.userId){
          this.$message({message:'请选择被代理人！',type:"warning"});
          return;
        }
        if(!this.data.agentId){
          this.$message({message:'请选择代理人！',type:"warning"});
          return ;
        }
        if(this.data.userId===this.data.agentId){
          this.$message({message:'代理人和被代理人不能是同一人！',type:"warning"});
          return ;
        }
        let _this = this;
        flow
          .getUserById(this.data.userId)
          .then(function(rep){
            if(rep){
              if(_this.data.agentId!== rep.agentId){
                _this.$confirm("确定将用户【"+_this.data.userName+"】的代理人由【"+rep.agentName+"】修改为【"+_this.data.agentName+"】吗？", '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                }).then(function () {
                  _this.toSave();
                });
              }else{
                _this.toSave();
              }
            }else{
              _this.toSave();
            }
          });
      },
      toSave(){
        let _this = this;
        flow
          .saveAgent(this.data)
          .then(rep=>{
            if(rep && rep.state){
              _this.$message({type:"success",message:rep.message});
              _this.afterSave();
            }else{
              _this.$message.error(rep.message);
            }
          });
      },
      afterSave(){
        this.close();
        this.$emit("after-save",{});
      },
      async input(value){
        if(this.data.userId){
          let resp = await flow.getUserById(this.data.userId);
          if (resp){
            this.data = {...resp};
          }else{
            this.data.id = "";
            this.data.agentId = "";
            this.data.agentName = "";
          }
        }
      }
    }
  }
</script>

<style scoped>

</style>
