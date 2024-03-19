<template>
  <div class="fullheight">
    <div>
      <el-button @click="submit()">保存</el-button>
    </div>
    <el-container>
      <el-aside width="150px" style="line-height: 200px">
        <template>
          <el-scrollbar style="height:100%">
            <ht-tree
                :data="treeData"
                :props="defaultProps"
                :support-filter="false"
                :highlight-current="false"
                :default-expand-all="false"
                :default-expanded-keys="['-1','1']"
                node-key="id"
                :show-checkbox="true"
                :expand-on-click-node=false
                ref="htMenuTree"
            >
              <!-- 作用域插槽：插槽prop -->
              <slot slot-scope="{ node, data }" :node="node" :data="data"></slot>
            </ht-tree>
          </el-scrollbar>
        </template>
      </el-aside>
      <el-main>
        <ht-table
            @load="loadData"
            :data="data"
            :selection="true"
            :show-export="false"
            :show-custom-column="false"
            nopagination
            ref="resoureList"
        >
          <ht-table-column type="index" width="50" align="center" label="序号" />
          <ht-table-column prop="alias" label="别名" width="200"/>
          <ht-table-column prop="name" label="名称" width="200"/>
          <ht-table-column prop="requestUrl" label="请求地址"/>
          <ht-table-column width="150">
            <template v-slot:header>
              <span style="color: #2274af">操作</span>
            </template>
            <template v-slot="{row}">
              <el-button type="primary" @click="editShow(row.alias)">编辑</el-button>
            </template>
          </ht-table-column>
        </ht-table>
      </el-main>
    </el-container>
    <ht-sidebar-dialog
        width="40%"
        title="数据权限设置"
        :visible.sync="dialogVisible"
        :before-close="handleClose"
        append-to-body
    >
      <el-checkbox v-model="loginUser">只能查看登录用户创建的数据</el-checkbox>
      <el-checkbox v-model="loginUserOrgs">只能查看登录用户所在部门的用户创建的数据</el-checkbox>
      <el-checkbox v-model="loginUserSubOrgs">只能查看登录用户所在部门及夏季的用户创建的数据</el-checkbox><br/>
      <el-button @click="selectOrgDialog">选择组织</el-button>
      <el-table
            :data="selectOrgList"
            height="250"
            border
            style="width: 100%">
        <template>
          <ht-table-column
              prop="name"
              label="名称"
              width="300"
          />
          <ht-table-column label="操作" fixed="right">
            <template v-slot="{row}">
              <el-button type="text" @click="removeOrgList(row.code)">删除</el-button>
            </template>
          </ht-table-column>
        </template>
      </el-table>
      <div slot="footer" class="dialog-footer" >
        <el-button @click="handleClose()">取消</el-button>
        <el-button @click="dataPermissionSetting()" type="primary">保存</el-button>
      </div>
    </ht-sidebar-dialog>
    <eip-org-dialog
        ref="eipOrgDialog"
        name="eipOrgDialog"
        @onConfirm="dialogOnConfirm"
        append-to-body
    />
  </div>
</template>

<script>
  import utils from "@/hotent-ui-util.js";
  import uc from "@/api/uc.js";
  //资源分配的组件
  const HtMenuTree = () => import("@/components/system/HtMenuTree.vue");
  const eipOrgDialog = () => import("@/components/dialog/EipOrgDialog.vue");
  export default {
    name: "ResourceLicensing",
    data(){
      return{
        params:{
          arrMenuAlias:[],
          arrMethodAlias:[],
          dataPermission:'',
          roleAlias:''
        },
        data:[],
        treeData:[],
        dialogVisible:false,
        loginUser:false,   //当前登录用户
        loginUserOrgs:false,   //当前登录用户部门数据
        loginUserSubOrgs:false,
        orgNames:[],
        defaultProps: {
          children: "children",
          label: "name"
        },
        selectOrgList:[],   //自定义选择是组织
        selectRoleAlias:''   //当前编辑的接口权限
      }
    },
    props: ['roleAlias'],
    components: {
      HtMenuTree,
      eipOrgDialog
    },
    methods: {
      submit(){

        console.log(this.params);
        this.params.roleAlias = this.roleAlias;
        let  selectTree=this.$refs.htMenuTree.$refs.elTree.getCheckedNodes().map(obj => {return obj.alias})
        this.params.arrMenuAlias =selectTree;  //获取到下拉菜单选择的值
        if (this.$refs.resoureList.$refs.htTable.selection.length !=0){
          this.params.arrMethodAlias = this.$refs.resoureList.$refs.htTable.selection.extractByKey("alias")
        }else{
          this.params.dataPermission = ''
        }
        uc.roleSave(this.params).then(resp => {
          this.$message("新增成功")
        })
      },
      loadData(param, cb) {
        uc.getAllMethodByRoleAlias(this.assign)
          .then(response => {
            this.data = response;
          })
          .finally(() => cb());
      },
      handleClose(){
        this.dialogVisible = false
      },
      editShow(alias){
        this.dialogVisible = true;
        this.selectRoleAlias = alias;
      },
      selectOrgDialog(){
        this.$refs['eipOrgDialog'].showDialog();
      },
      dialogOnConfirm(param){
        this.selectOrgList = param
      },
      removeOrgList(code){
        for (var i = 0; i < this.selectOrgList.length; i++) {
          var selectOrg = this.selectOrgList[i];
          if (selectOrg.code === code){
            this.$delete(this.selectOrgList,i)
          }
        }
      },
      dataPermissionSetting(){
        // 数据权限设置点击保存时将二级弹窗的内容赋予到待提交的变量当中
        var dataPermissionParam = []
        if (this.loginUser){
          dataPermissionParam.push({"type":"loginUser","name":"当前登录用户数据"});
        }
        if (this.loginUserOrgs){
          dataPermissionParam.push({"type":"loginUserOrgs","name":"当前登录用户部门数据"});
        }
        if (this.loginUserSubOrgs){
          dataPermissionParam.push({"type":"loginUserSubOrgs","name":"当前登录用户部门及下级部门数据"});
        }
        if (this.selectOrgList!=null && this.selectOrgList.length!=0){
          var mySelectObj = [];
          this.selectOrgList.map((item,index) => {
            mySelectObj.push(Object.assign({},{id:item.id,name:item.name}))
          })
          dataPermissionParam.push({
            "type": "customOrgs",
            "name": "自定义选择组织",
            "orgs": mySelectObj
          })
        }
        /*if (this.params.dataPermission ==""){
          this.params.dataPermission+="{"+[this.selectRoleAlias]+":"+JSON.stringify(dataPermissionParam);
        }else{
          this.params.dataPermission+=","+[this.selectRoleAlias]+":"+JSON.stringify(dataPermissionParam);
        }*/
        // this.params.dataPermission.push({[this.selectRoleAlias]:dataPermissionParam});
        this.params.dataPermission[this.selectRoleAlias]=dataPermissionParam;
        this.dialogVisible = false;
      }
    },
    mounted() {
      uc.getAllMenuRoleAlias(this.roleAlias).then((resp) => {
        this.treeData = utils.tile2nest(resp);
      })
    }
  }
</script>

<style scoped>

</style>
