<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      :quick-search-props="[{prop: 'mq.name_', label: '租户名称'}]"
      :show-export="false"
      :show-custom-column="false"
      :default-sorter="[{ direction: 'DESC', property: 'updateTime' }]"
      ref="htTable"
      @row-click="rowClick"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="showDialog('','','')" icon="el-icon-plus">添加租户</el-button>
          <!-- <ht-delete-button url="${uc}/uc/tenantManage/v1/remove" :htTable="$refs.htTable">删除</ht-delete-button> -->
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="name" label="租户名称" :sortable="true" :show-overflow-tooltip="true">
          <template v-slot="{row}">
            <el-link type="primary" @click="showDialog(row.id,row.name,row.code,row.status)" title="查看详情">{{row.name}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column prop="typeName" label="租户类型" :sortable="true" :show-overflow-tooltip="true">
        </ht-table-column>
        <ht-table-column prop="code" label="租户别名" :sortable="true" :show-overflow-tooltip="true">
        </ht-table-column>
        <ht-table-column
          prop="mq.status_"
          label="状态"
          width="110"
          :filters="[{text:'草稿', value:'draft'},{text:'禁用', value:'disabled'},{text:'启用', value:'enable'}]"
        >
          <template v-slot="{row}">
             <el-tag type="info" v-if="row.status=='draft'">草稿</el-tag>
            <el-tag type="warning" v-if="row.status=='disabled'">禁用</el-tag>
            <el-tag type="success" v-if="row.status=='enable'">启用</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column prop="shorthand" label="租户简称" :sortable="true" :show-overflow-tooltip="true">
        </ht-table-column>
        <ht-table-column width="180" label="操作">
          <template v-slot="{row}">
            <el-dropdown
              size="mini"
              split-button
              @command="handleCommand"
              @click="handleCommand({row:row,command:'assignUser'})"
              v-if="row.id!='-1'"
            >
            <span>
              <i class="el-icon-user"></i>设置管理员
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="row.id!='-1'" icon="el-icon-user" :command="{row:row,command:'copyAddress'}">复制地址</el-dropdown-item>
              <el-dropdown-item v-if="row.id!='-1' && row.status=='draft' || row.status=='disabled'" icon="el-icon-delete" :command="{row:row,command:'delete'}">删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
            <el-button style="margin-right: 30px" v-if="row.id == '-1'"  @click="handleCommand({row:row,command:'assignUser'})">
              <span>
              <i class="el-icon-user"></i>设置管理员
            </span>
            </el-button>
          </template>
        </ht-table-column>
      </template>
    </ht-table>
    <ht-sidebar-dialog
      width="100%"
      :close-on-click-modal="false"
      :visible="dialogVisible"
      :before-close="handleClose"
      append-to-body
      class="tenant_conf"
    >
    <el-container class="fullheight">
        <el-header height="48px" style="padding:0">
          <div
            class="flex"
            style="float:left;justify-content: center;background: #f5f5f5;height: 47px;width:180px;border-bottom:1px solid #eee;border-right:1px solid #eee"
          >
            <el-page-header @back="handleClose" content="租户管理"></el-page-header>
          </div>
          <div
            class="flex"
            style="float:left;justify-content: space-between;height: 47px;width:calc(100% - 181px);border-bottom:1px solid #eee;"
          >
            <el-breadcrumb separator=">" style="margin-left:20px;">
              <el-breadcrumb-item :to="{ path: '/' }">租户信息</el-breadcrumb-item>
              <el-breadcrumb-item>{{curSelectTenantName}}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </el-header>
        <el-main style="padding:0">
          <el-tabs
            class="tenant-edit-container"
            v-if="dialogVisible"
            type="card"
            style="height: 100%;"
            tab-position="left"
            v-model="activeName"
            @tab-click="handlePaneClick"
            @tab-remove="handlePaneRemove"
            :before-leave="beforePaneleave"
            ref="tenantEditTables"
          >
            <el-tab-pane label="租户信息" name="tenantInfo">
                <tenant-info-manager ref="tenantInfoManager" @after-add-success="addSuccess" :tenantId="curSelectTenantId?curSelectTenantId:'add'"></tenant-info-manager>
            </el-tab-pane>

            <el-tab-pane label="禁用菜单" v-if="curSelectTenantId && curSelectTenantStatus!='draft' && curSelectTenantId!=-1" name="ignoreMenu">
                <el-button
                  style="float: right;z-index: 15000;position: fixed;top:8px;right:15px"  type="primary"
                  @click="saveTenantIgnoreMenu">保存禁用菜单信息</el-button>

                <div class="fullheight tenant-ignore-tree">
                    <ht-tree
                        ref="tenantIgnoreMenuTree"
                        :data="baseMenuList"
                        :props="{label:'name'}"
                         show-checkbox
                        node-key="alias"
                        :default-expanded-keys="menuTreeExpanded"
                        :default-checked-keys="tenantIgnoreMenus"
                        support-filter
                        @node-click="handleNodeClick"
                      ></ht-tree>
                </div>
            </el-tab-pane>
            <el-tab-pane label="组织管理" v-if="curSelectTenantId && curSelectTenantStatus!='draft'" name="orgManage">
                <el-tabs
                  type="card"
                  class="tenant-org-container"
                  v-model="currentOrgManager"
                  style="height: 100%;"
                  @tab-click="tabClick"
                >
                  <el-tab-pane label="维度管理" name="henantDemension">
                      <demension v-if="henantDemension" ref="henantDemension" :tenantId="curSelectTenantId"></demension>
                  </el-tab-pane>
                  <el-tab-pane label="组织管理" name="henantOrgManager">
                      <organization v-if="henantOrgManager" ref="henantOrgManager" :tenantId="curSelectTenantId"></organization>
                  </el-tab-pane>
                  <el-tab-pane label="职务管理" name="henantJobManager">
                      <jobManager v-if="henantJobManager" ref="henantJobManager" :tenantId="curSelectTenantId"></jobManager>
                  </el-tab-pane>
                  <el-tab-pane label="岗位管理" name="henantPostManager">
                      <postManager v-if="henantPostManager" ref="henantPostManager" :tenantId="curSelectTenantId"></postManager>
                  </el-tab-pane>
                  <el-tab-pane label="组织参数管理" name="henantPrgParamManager">
                      <prgParamManage v-if="henantPrgParamManager" ref="henantPrgParamManager" :tenantId="curSelectTenantId"></prgParamManage>
                  </el-tab-pane>
              </el-tabs>
            </el-tab-pane>
            <el-tab-pane label="用户管理" v-if="curSelectTenantId && curSelectTenantStatus!='draft'" name="userManage">
                <user-list-manager ref="userListManager" :tenantId="curSelectTenantId"></user-list-manager>
            </el-tab-pane>
            <el-tab-pane label="角色管理" v-if="curSelectTenantId && curSelectTenantStatus!='draft'" name="roleManage">
                <role-manager ref="roleManager" :tenantId="curSelectTenantId"></role-manager>
            </el-tab-pane>
            <el-tab-pane label="汇报线" v-if="curSelectTenantId && curSelectTenantStatus!='draft'" name="relLine">
                <report-line ref="reportLine" :tenantId="curSelectTenantId"></report-line>
            </el-tab-pane>
            <el-tab-pane label="实例管理" v-if="curSelectTenantId && curSelectTenantStatus!='draft'" name="instance">
                <instance-manager ref="instanceManager" :tenantId="curSelectTenantId"></instance-manager>
            </el-tab-pane>
            <el-tab-pane label="在线集成" v-if="curSelectTenantId && curSelectTenantStatus!='draft'" name="onlineCom">
                 <sys-external-unite ref="sysExternalUnite" :tenantId="curSelectTenantId"></sys-external-unite>
            </el-tab-pane>
          </el-tabs>
        </el-main>
      </el-container>


    </ht-sidebar-dialog>
    <!-- 租户用户管理 -->
    <tenant-auth-manager ref="tenantAuthManager"></tenant-auth-manager>

    <!-- 租户访问地址 -->
    <tenant-access-address ref="tenantAccessAddress"></tenant-access-address>
  </div>
</template>
<script>
import ElButton from "../../../node_modules/element-ui/packages/button/src/button.vue";

const tenantInfoManager = () => import("@/views/system/TenantInfoManager.vue");
const tenantAuthManager = () => import("@/views/uc/TenantAuthManager.vue");
const demension = () => import("@/views/uc/org/Demension.vue");
const organization = () => import("@/views/uc/org/Organization.vue");
const jobManager = () => import("@/views/uc/org/JobManager.vue");
const postManager = () => import("@/views/uc/org/PostManager.vue");
const prgParamManage = () => import("@/views/uc/org/PrgParamManage.vue");
const userListManager = () => import("@/views/uc/UserListManager.vue");
const RoleManager = () => import("@/views/uc/RoleManager.vue");
const reportLine = () => import("@/views/uc/ReportLine.vue");
const instanceManager = () => import("@/views/flow/InstanceManager.vue");
const sysExternalUnite = () => import("@/views/system/sysExternalUnite/SysExternalUnite.vue");
const tenantAccessAddress = () => import("@/components/tenant/TenantAccessAddress.vue");
export default {
  name: "tenantManager",
  data() {
    return {
      dialogVisible: false,
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      tenantManage: {code:'',name:''},
      tenantTypeList: [],
      currentTabName: 'basic',
      currentOrgManager:"henantOrgManager",
      tenantParam: {}, //当前租户的参数值
      tenantParams: [], //系统的所有组合类型参数
      activeName: "tenantInfo",
      curSelectTenantId: "",
      curSelectTenantStatus: "draft",
      curSelectTenantAlias: "",
      curSelectTenantName: "",
      // 配置页面是否需要刷新缓存
      tenantConfigShouldRefresh: false,
      baseMenuList: [],//系统默认菜单
      tenantIgnoreMenus:[],//租户被禁用菜单别名列表
      menuTreeExpanded:[],
      henantDemension: true,
      henantOrgManager: true,
      henantJobManager: true,
      henantPostManager: true,
      henantPrgParamManager: true
    };
  },
  components: {
      ElButton,
      tenantInfoManager,
    tenantAuthManager,
    demension,
    organization,
    jobManager,
    postManager,
    prgParamManage,
    userListManager,
    RoleManager,
    reportLine,
    instanceManager,
    sysExternalUnite,
    tenantAccessAddress,
  },
  mounted() {
    this.$validator = this.$root.$validator;
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    handlePaneClick: function(data) {
      const this_ = this;
      if (data.alias) {
        this.currentTabComponent = data.alias;
      }
      //租户基本信息
      if (data.name == "tenantInfo") {
        this.tenantConfigShouldRefresh = false;
      }
      if(data.name == "orgManage"){
        this.$refs.henantOrgManager.reloadTree();
      }
    },
    handlePaneRemove: function(data) {
      this.activeName = "tenantInfo";
      this.tenantConfigShouldRefresh = true;
    },
    beforePaneleave(activeName, oldActiveName) {

    },
    beforeCloseDialog(){
      this.$refs.htTable.load();
    },
    handleClose() {
      this.$store.dispatch("tenant/actionTenantId", null);
      this.dialogVisible = false;
      this.tenantManage = {};
      this.curSelectTenantId = '';
      this.curSelectTenantStatus = 'draft';
      this.curSelectTenantName = '';
      this.curSelectTenantAlias = '';
      this.$refs.htTable.load(true);
    },
    showDialog(id,name,code,status) {
      this.activeName = "tenantInfo";
      this.currentTabName = 'basic';
      this.curSelectTenantId = '';
      this.curSelectTenantAlias = '';
      this.curSelectTenantName = name;
      if (id) {
        this.curSelectTenantId = id;
        this.curSelectTenantAlias = code;
    	  this.$store.dispatch("tenant/actionTenantId", id);
        this.dialogVisible = true;
        this.initIgnoreMenus();
      } else {
        this.dialogVisible = true;
      }
      this.curSelectTenantStatus = status?status:'draft';
    },
    //初始化租户禁用菜单
    initIgnoreMenus(){
      this.$http.get("${portal}/sys/sysMenu/v1/getTree?tenantId=-1&ignoreAlias=tenant,sysPwdStrategy,mobile_menu").then(response => {
        this.baseMenuList = response.data;
        let aliasList = [];
        this.getExpandTreeMenu(response.data,aliasList,2);
        this.menuTreeExpanded = aliasList;
      }).then(params => {
        this.$http.get("${uc}/uc/tenantIgnoreMenu/v1/getIgnoreMenuCodes?tenantId="+this.curSelectTenantId).then(response => {
          if (response.data && response.data.constructor == Array) {
            this.tenantIgnoreMenus = response.data;
          }else{
            this.tenantIgnoreMenus = [];
          }
        });
      });
    },
    handleCommand(params) {
      switch (params.command) {
        case "edit":
          this.showDialog(params.row.id,params.row.name,params.row.code,params.row.status);
          break;
        case "delete":
          this.deleteById(params.row)
          break;
        case "assignUser":
          this.$refs.tenantAuthManager.showDialog(params.row.typeId,params.row.id);
          break;
        case "copyAddress":
          this.$refs.tenantAccessAddress.showDialog(params.row.code);
        default:
          break;
      }
    },
    loadData(param, cb) {
    	this.$http.post("${uc}/uc/tenantManage/v1/listJson", param).then(resp => {
            let response = resp.data;
            this.data = response.rows;
            this.pageResult = {
              page: response.page,
              pageSize: response.pageSize,
              total: response.total
            };
        }, error => {
            reject(error);
        }).finally(() => cb());
    },
    deleteById(row) {
      let that = this;
    	this.$confirm("是否确认删除？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
          .then(() => {
            that.$http.remove("${uc}/uc/tenantManage/v1/remove?ids="+row.id).then(resp => {
                let response = resp.data;
                if(!response.state){
                  that.$message.error(response.message);
                }else{
                  that.$message.success(response.message);
                  that.$refs.htTable.load();
                }
            }, error => {
                reject(error);
            });
          })
          .catch(() => {});
    },
    handleNodeClick(){

    },
    addSuccess(tenant){
      this.curSelectTenantId = tenant.id;
      this.curSelectTenantName = tenant.name;
      this.curSelectTenantAlias = tenant.code;
      this.curSelectTenantStatus = tenant.status;
      this.$store.dispatch("tenant/actionTenantId", tenant.id);
      this.initIgnoreMenus();
      this.$refs.htTable.load();
    },
    //保存租户禁用菜单信息
    saveTenantIgnoreMenu(){
       let that = this;
       let checkedKeys = this.$refs.tenantIgnoreMenuTree.$refs.elTree.getCheckedKeys();
       if(!checkedKeys){
         checkedKeys = [];
       }
       this.$http.post("${uc}/uc/tenantIgnoreMenu/v1/saveByTenantId", checkedKeys).then(resp => {
            let response = resp.data;
            if(!response.state){
              that.$message.error(response.message);
            }else{
              that.$message.success(response.message);
            }
        }, error => {
            reject(error);
        });
    },
    //设置菜单默认展开
    getExpandTreeMenu(treeMenu,aliasList,level){
      let _this = this;
      if (treeMenu && treeMenu.constructor == Array && level>0) {
        level--;
        treeMenu.forEach(menu => {
          if(menu.children && menu.children.constructor == Array && menu.children.length>0){
            aliasList.push(menu.alias);
            this.getExpandTreeMenu(menu.children,aliasList,level);
          }
        });
      }
    },
    tabClick(data, event) {
      //点击tab卡片
      this[data.name] = false;
      this.$nextTick(() => {
        this[data.name] = true;
      });
    },
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";

div[aria-invalid="true"] >>> .el-input__inner,
div[aria-invalid="true"] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
div.tenant_conf >>> .el-dialog__header {
  display: none;
}
div.tenant_conf  >>> .el-dialog__header,
div.tenant_conf  >>> .el-dialog__body {
  height: 100%;
  padding: 0;
}

div >>> .el-tabs__content > .el-tab-pane {
  height: 100%;
}

div >>> .el-form-item__error {
  display: none;
}
.tenant-edit-container /deep/ > .el-tabs__header {
  width: 180px;
  background: #f5f5f5;
  border-right: 1px solid #eee;
  margin-right: 0;
}

.tenant-edit-container
  /deep/
  > .el-tabs__header
  > .el-tabs__nav-wrap
  > .el-tabs__nav-scroll
  > .el-tabs__nav {
  border: none;
}

.tenant-edit-container
  /deep/
  > .el-tabs__header
  > .el-tabs__nav-wrap
  > .el-tabs__nav-scroll
  > .el-tabs__nav
  > .el-tabs__item {
  border: none !important;
  color: #666;
  font-weight: bold;
  margin: 5px 0;
  padding-left: 30px !important;
}

.tenant-edit-container
  /deep/
  > .el-tabs__header
  > .el-tabs__nav-wrap
  > .el-tabs__nav-scroll
  > .el-tabs__nav
  > .el-tabs__item.is-active {
  background: $--color-primary;
  color: #fff;
}
.tenant-edit-container /deep/ > .el-tabs__content {
  height: calc(100% - 3px);
}
div >>> .tenant-ignore-tree{
  padding: 15px 20px;
  overflow: auto;
}
div >>> .el-tab-pane .el-table{
  height: calc(100% - 120px) !important;
  max-height: calc(100% - 120px) !important;
}

div >>> .el-tab-pane .el-table > .el-table__body-wrapper{
  height: calc(100% - 37px) !important;
  max-height: calc(100% - 37px) !important;
}

.tenant-org-container /deep/ > .el-tabs__content {
  height: calc(100% - 38px);
}
</style>
