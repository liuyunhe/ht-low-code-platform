<template>
  <el-dialog
      title="修改权限"
      :visible="dialogVisible"
      :before-close="beforeClose"
      width="45%"
      :close-on-click-modal="false"
      append-to-body>
    <el-form>
      <ht-form-item label="所有人">
        <el-switch
            v-model="everyone.checked"
            active-color="#13ce66"
            inactive-color="#ff4949"/>
      </ht-form-item>
      <template v-if="!everyone.checked">
        <ht-form-item label="用户">
          <eip-user-selector
              v-model="user.name"
              :config="{id:'user.id',name: 'user.name'}"
              v-form
              append-to-body/>
        </ht-form-item>
        <ht-form-item label="组织">
          <eip-org-selector
              v-model="org.name"
              :config="{id:'org.id',name: 'org.name'}"
              v-form
              append-to-body/>
        </ht-form-item>
        <ht-form-item label="岗位">
          <eip-post-selector
              v-model="pos.name"
              :config="{id:'pos.id',name: 'pos.name'}"
              v-form
              append-to-body/>
        </ht-form-item>
        <ht-form-item label="角色">
          <eip-role-selector
              v-model="role.name"
              :config="{id:'role.id',name: 'role.name'}"
              v-form
              append-to-body/>
        </ht-form-item>
      </template>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="dialogVisible = false">返回</el-button>
    </div>
  </el-dialog>
</template>

<script>
  const eipUserSelector = () => import("@/components/selector/EipUserSelector.vue");
  const eipRoleSelector = () => import("@/components/selector/EipRoleSelector.vue");
  const eipOrgSelector = () => import("@/components/selector/EipOrgSelector.vue");
  const eipPostSelector = () => import("@/components/selector/EipPostSelector.vue");
  export default {
    components:{
      eipUserSelector,
      eipRoleSelector,
      eipOrgSelector,
      eipPostSelector
    },
    props: {
      condition: Object
    },
    data(){
      return {
        dialogVisible:false,
        everyone:{type:'everyone',title:'所有人',checked:true},
        user:{type:'user',title:'用户',id:'',name:''},
        org:{type:'org',title:'组织',id:'',name:''},
        pos:{type:'pos',title:'岗位',id:'',name:''},
        role:{type:'role',title:'角色',id:'',name:''}
      }
    },
    methods:{
      beforeClose(){
        this.dialogVisible = false;
        this.user = {type:'user',title:'用户',id:'',name:''};
        this.org = {type:'org',title:'组织',id:'',name:''};
        this.pos = {type:'pos',title:'岗位',id:'',name:''};
        this.role = {type:'role',title:'角色',id:'',name:''};
      },
      handleOpen(){
        this.dialogVisible = true;
        this.$nextTick(()=>{
          let rights = [...this.condition.right];
          for (let i=0;i<rights.length;i++){
            if(rights[i].type!=='everyone'){
              this[rights[i].type].id = rights[i].id;
              this[rights[i].type].name = rights[i].name;
            }
            this.everyone.checked = rights[i].checked?rights[i].checked:false;
          }
        })
      },
      initData(){
        this.user.id = "";
        this.user.name = "";
        this.pos.id = "";
        this.pos.name = "";
        this.org.id = "";
        this.org.name = "";
        this.role.id = "";
        this.role.name = "";
      },
      save(){
        let data = {...this.condition};
        data.right.splice(0,data.right.length);

        if (!this.everyone.checked){
         if (this.user.id){
           data.right.push(this.user);
         }
         if (this.org.id){
           data.right.push(this.org);
         }
          if (this.pos.id){
            data.right.push(this.pos);
          }
          if (this.role.id){
            data.right.push(this.role);
          }
        }else{
          data.right.push(this.everyone);
        }
        this.$emit('confirm',data);
        this.dialogVisible = false;
        this.beforeClose();
      }
    }
  }
</script>

<style scoped>

</style>
