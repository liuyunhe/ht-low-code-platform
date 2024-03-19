<template>
  <div>
    <el-form v-model="user">
      <ht-form-item label="姓名">{{user.fullname}}</ht-form-item>
      <ht-form-item label="账号">{{user.account}}</ht-form-item>
      <ht-form-item label="手机">{{user.mobile}}</ht-form-item>
      <ht-form-item label="邮箱">{{user.email}}</ht-form-item>
    </el-form>
    <el-collapse accordion>
      <el-collapse-item title="更多属性">
        <el-form v-model="user">
          <ht-form-item label="用户头像">
            <el-avatar  :size="120"  :src="photoUrl">
              <img :src="photoUrl" />
            </el-avatar>
          </ht-form-item>
          <ht-form-item label="性别">{{user.sex}}</ht-form-item>
          <ht-form-item label="地址">{{user.address}}</ht-form-item>
          <ht-form-item label="状态">
            <el-tag type="danger" v-if="user.status==0">禁用</el-tag>
            <el-tag v-if="user.status==1">正常</el-tag>
            <el-tag type="warning" v-if="user.status==-2">离职</el-tag>
          </ht-form-item>
          <ht-form-item label="角色">
            <template v-if="user.roleName">
              <el-tag v-for="roleName in user.roleName.split('|')" :key="roleName">{{roleName}}</el-tag>
            </template>
          </ht-form-item>
        </el-form>
      </el-collapse-item>
      <el-collapse-item title="所属岗位组织">
        <el-table :data="user.orgPostList" border style="width: 100%">
          <ht-table-column type="index" width="50" align="center" label="序号" />
          <ht-table-column prop="orgName" label="所属组织" />
          <ht-table-column prop="postName" label="所属岗位" />
          <ht-table-column prop="isMaster" label="主组织/主岗位" width="100">
            <template v-slot="{row}">
              <el-tag type="danger" v-if="row.isMaster=='0'">否</el-tag>
              <el-tag v-if="row.isMaster=='1'">是</el-tag>
            </template>
          </ht-table-column>
        </el-table>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
export default {
  name: "user-detail",
  props: ["user"],
   data() {
    return {
     photoUrl:"/img/defaultPhoto.jpg"
    }
  },
  mounted(){
    if(this.user.photo){
      this.$store.dispatch("menu/downloadImg", this.user.photo).then(res => {
      if (res != "") {
        this.photoUrl =  res;
      }});
    }
  },
  methods: {
    phonoError(e) {
      this.user.photo = "/img/defaultPhoto.jpg";
    }
  }
};
</script>
<style scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
</style>
