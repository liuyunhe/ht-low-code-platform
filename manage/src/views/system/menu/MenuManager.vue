<template>
  <el-container class="fullheight" style="border: 1px solid #eee">
    <ht-menu-manager
      ref="htMenuManager"
      @node-click="handleNodeClick"
      :showEdit="false"
      node-key="id"
      @menu-action="menuAction"
    />
    <el-container v-if="editMenuFormVisible">
      <el-header>
        <ht-submit-button
          url="/sys/sysMenu/v1/save"
          context="portal"
          :model="menu"
          scope-name="editMenuForm"
          @before-save-data="beforeSaveData"
          @after-save-data="afterSaveData"
          v-if=" !menu.id || (!menu.tenantId &&($store.state.login.currentUser.userAttrs.tenantId == -1 || !$store.state.login.currentUser.userAttrs.tenantId) ) || $store.state.login.currentUser.userAttrs.tenantId == menu.tenantId"
        >{{menu.id? '更新':'保存'}}</ht-submit-button>
      </el-header>
      <el-main>
        <el-form data-vv-scope="editMenuForm" :model="menu" size="mini" :inline="true">
          <ht-form-item v-if="hasParent" label="上级菜单" label-width="150px">
            <ht-input
              name="parent-menu-name"
              v-model="currentNodeData.name"
              autocomplete="off"
              disabled
            ></ht-input>
          </ht-form-item>
          <ht-form-item v-if="hasParent" label="上级菜单别名" label-width="150px">
            <ht-input
              name="parent-menu-alias"
              v-model="currentNodeData.alias"
              autocomplete="off"
              style="width:400px"
              disabled
            ></ht-input>
          </ht-form-item>
          <br/>
          <ht-form-item label="菜单名称" label-width="150px">
            <ht-input
              name="menu-name"
              v-model="menu.name"
              autocomplete="off"
              :validate="'required'"
              :maxlength="15"
              :showWordLimit="true"
            ></ht-input>
          </ht-form-item>
          <ht-form-item v-if="!isHref" label="别名" label-width="150px">
            <ht-input
              name="menu-alias"
              v-model="menu.alias"
              :disabled="menu.id? true:false"
              autocomplete="off"
              style="width:400px"
              :validate="'required|alpha_dash|isExist:${portal}/sys/sysMenu/v1/isMenuExistByAlias?alias=,'+menu.alias"
              :maxlength="50"
              :showWordLimit="true"
            ></ht-input>
          </ht-form-item>
          <ht-form-item label="Url地址" v-if="isHref" label-width="150px">
            <ht-input name="menu-href" v-model="menu.href" autocomplete="off" style="width:400px"></ht-input>
          </ht-form-item>
          <br />
          <ht-form-item v-if="false" label="图标" label-width="150px">
            <span class="icon iconfont" :class="menu.menuIcon"></span>
            <IconDialog @selected="icons" style="display:inherit" />
          </ht-form-item>
          <ht-form-item label="排序" label-width="150px">
            <ht-input
              name="menu-sn"
              v-model="menu.sn"
              autocomplete="off"
              validate="required|numeric"
              :maxlength="9"
              :showWordLimit="true"
            ></ht-input>
          </ht-form-item>
          <ht-form-item
            v-if="!isHref && !isFrontMenu"
            label="activeTab"
            label-width="150px"
            title="三级菜单默认显示的tab"
          >
            <ht-input
              name="menu-icon"
              v-model="menu.activeTab"
              autocomplete="off"
              style="width:400px"
              :maxlength="50"
              :showWordLimit="true"
            ></ht-input>
          </ht-form-item>
          <!-- <ht-form-item v-if="isHref" label="注意事项" label-width="150px">
            <div style="color:red;width:400px;">管理端菜单添加Url三级菜单时“Url地址”不需要填写，可以为空。</div>
          </ht-form-item> -->
          <br />
          <ht-form-item
            label="标签页风格"
            label-width="150px"
            title="默认使用菜单配置 菜单没有配置， 则使用全局配置， 全局配置也没有则使用默认样式"
          >
            <el-radio-group v-model="tabsStyle.tabType">
              <el-radio-button label="card">选项卡样式</el-radio-button>
              <el-radio-button label>默认样式</el-radio-button>
              <el-radio-button label="border-card">卡片化</el-radio-button>
            </el-radio-group>
          </ht-form-item>

          <el-table :data="menu.sysMethods" style="width: 100%">
            <el-table-column prop="name" label width="180">
              <template slot="header">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-plus"
                  circle
                  @click="addSysMethods"
                  title="添加接口"
                ></el-button><span class="is-required">请求方法描述</span>
              </template>
              <template slot-scope="scope">
                <ht-input
                  v-model="scope.row.name"
                  autocomplete="off"
                  validate="required"
                  placeholder="方法描述"
                  :maxlength="50"
                  :showWordLimit="true"
                ></ht-input>
              </template>
            </el-table-column>
            <el-table-column prop="alias" label width="180" >
              <template slot="header">
                  <span class="is-required">别名</span>
                <el-tooltip content="别名为字母数字组合，且以字母开头，不能包括特殊字符" placement="right">
                  <i class="icon-question" style="margin-right: 8px" />
                </el-tooltip>
              </template>
              <template slot-scope="scope">
                <ht-input
                  v-model="menu.sysMethods[scope.$index].alias"
                  :model-expression="'menu.sysMethods['+scope.$index+'].alias'"
                  v-pinyin="menu.sysMethods[scope.$index].name"
                  autocomplete="off"
                  :validate="{required:true,
                  regex:{
                    exp:'^[a-zA-z][a-zA-z0-9]+$',
                    message: '别名有误'
                  }}"
                  :disabled="scope.row.id? true:false"
                  placeholder="唯一别名"
                  :maxlength="50"
                  :showWordLimit="true"
                ></ht-input>
              </template>
            </el-table-column>
            <el-table-column prop="requestUrl" label width="auto">
              <template slot="header">
                  <span class="is-required">后台请求地址</span>
                <el-tooltip content="请求地址必须以/开头,并且只能包括英文、数字和/" placement="right">
                  <i class="icon-question" style="margin-right: 8px" />
                </el-tooltip>
              </template>
              <template slot-scope="scope">
                <ht-input
                  v-model="scope.row.requestUrl"
                  style="width:90%"
                  autocomplete="off"
                  :validate="{required:true,
                  regex:{
                    exp:'^/[a-zA-Z0-9\\\\\\/\\+]+$',
                    message: '请求地址输入有误'
                  }}"
                  placeholder="请输入后台请求地址"
                ></ht-input>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  circle
                  @click="removeSysMethod(scope.row)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form>
      </el-main>
    </el-container>
    <!-- 子级批量排序 -->
    <ht-sidebar-dialog
        width="28%"
        title="子菜单批量排序"
        :visible="batchSortDialog"
        :before-close="handleBatchSortClose"
        :append-to-body="true"
    >
      <table class="form-table" cellspacing="0" cellpadding="0" border="0">
        <tbody>
          <tr v-for="data in subMenuList" :key="data.id">
            <th width="90px">菜单名称:</th>
            <td>{{data.name}}</td>
            <th width="70px" class="is-required">排序:</th>
            <td width="90px">
              <ht-input v-model="data.sn" type="number" autocomplete="off" validate="required"/>
            </td>
          </tr>
        </tbody>
      </table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="save()" type="primary">{{$t("eip.common.save")}}</el-button>
        <el-button @click="handleBatchSortClose()">{{$t("eip.common.cancel") }}</el-button>
      </div>
    </ht-sidebar-dialog>
    <el-dialog
      width="400px"
      top="8vh"
      title="菜单移动"
      :visible="handleDialog"
      :before-close="handleClose"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-scrollbar>
        <ht-tree
          style="height: 500px;"
          :data="treeMenuData"
          :props="defaultMenuProps"
          @node-click="handleMenuNodeClick"
          :expand-on-click-node="false"
          ref="htTypeTree"
        ></ht-tree>
      </el-scrollbar>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSave">确 定</el-button>
        <el-button @click="handleClose">取 消</el-button>
      </div>
    </el-dialog>
    <el-container v-show="!editMenuFormVisible">
      <div class="form-empty">请选择一个菜单进行操作</div>
    </el-container>
    <!-- 导入 -->
    <el-dialog title="上传文件" :visible="uploadDialogVisible" :before-close="beforeClose">
      <el-upload :http-request="handleImport" accept=".zip" :file-list="fileList" :limit="1">
        <el-button size="small" type="primary">点击上传</el-button>
        <div slot="tip" class="el-upload__tip">只能上传zip文件</div>
      </el-upload>
    </el-dialog>
  </el-container>
</template>
<script>
import portalApi from "@/api/portal.js";
const HtMenuManager = () => import("@/components/system/HtMenuManager.vue");
const EipSysTypeSelector = () =>
  import("@/components/selector/EipSysTypeSelector.vue");
import IconDialog from "@/components/dialog/IconDialog.vue";
import req from "@/request.js";
export default {
  name: "MenuManager",
  components: {
    HtMenuManager,
    EipSysTypeSelector,
    IconDialog
  },
  data() {
    return {
      isFrontMenu:false,
      isHref: false, //是否是添加URL菜单
      editMenuFormVisible: false,
      treeMenuData: [],
      defaultMenuProps: {
        children: "children",
        label: "name"
      },
      treeData: [],
      defaultProps: {
        children: "children",
        label: "name"
      },
      data: [],
      pageResult: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      handleDialog: false,
      dialogVisible: false,
      menu: { alias: "", tabsStyle: "", sysMethods: [], open: true, href: "" },
      tabsStyle: { tabType: null },
      currentNodeData: {},
      hasParent: false,
      batchSortDialog:false,//子菜单批量排序侧边弹框
      subMenuList:[],//子菜单集合
      uploadDialogVisible: false,
      fileList: [],
      parentMenuId: '',
    };
  },
  methods: {
    handleBatchSortClose() {
      this.batchSortDialog = false;
    },
    //保存子菜单批量排序
    save(){
     portalApi.saveBatch(this.subMenuList).then(data => {
        this.batchSortDialog = false;
        this.$refs.htMenuManager.$refs.htMenuTree.loadData();
        this.$message({
          showClose: true,
          message: data.message,
          type: "success"
        });
      });
    },
    //移动菜单确认事件
    handleSave() {},
    handleMenuNodeClick(node) {
    },
    handleClose() {
      this.handleDialog = false;
    },
    icons(icon) {
      this.menu.menuIcon = icon;
    },
    async handleNodeClick(data) {
      if (data.href) {
        this.isHref = true;
      } else {
        this.isHref = false;
      }
      this.getEditData(data);
      this.currentNodeData = data;
    },
    menuAction(command) {
      //判断是否是添加前端下级菜单
      if (command.node.key == "3" && command.action != "addHref") {
        this.isFrontMenu = true;
      } else {
        this.isFrontMenu = false;
      }
      //判断是否是添加URL菜单
      if (command.action == "addHref") {
        this.isHref = true;
      } else if (command.action == "edit" && command.href) {
        this.isHref = true;
      } else {
        this.isHref = false;
      }
      this.action = command.action;
      this.editMenuFormVisible = false;
      let node = command.node;
      let data = command.data;
      let action = command.action;
      this.currentNodeData = data;
      this.menu = {
        ...this.menu,
        ...{
          href: "",
          name: "",
          alias: "",
          menuIcon: "",
          sn: "",
          activeTab: "",
          tabsStyle: "",
          sysMethods: []
        }
      };
      delete this.menu.tenantId;
      switch (action) {
        case "batchSort":
          this.subMenuList = [...data.children];
          this.batchSortDialog = true;
          break;
        case "add":
          this.menu.id = "";
          this.menu.parentId = data.id;
          this.hasParent = true;
          this.menu.path = data.path;
          this.editMenuFormVisible = true;
          this.tabsStyle = { tabType: null };
          break;
        case "addHref":
          const key =
            Date.parse(new Date()) + "_" + Math.ceil(Math.random() * 99999);
          this.menu.alias = "href/template/" + key;
          this.menu.id = "";
          this.menu.parentId = data.id;
          this.hasParent = true;
          this.menu.path = data.path;
          this.editMenuFormVisible = true;
          this.tabsStyle = { tabType: null };
          break;
        case "edit":
          this.getEditData(data);
          break;
        case "delete":
          this.$confirm(`是否删除菜单[${data.name}]?`, "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "success"
          })
            .then(() => {
              this.removeMenuById(data.id);
            })
            .catch(() => {});

          break;
        case "moveto":
          const this_ = this;
          portalApi.getMenuTree().then(data => {
            this_.handleDialog = true;
            this_.treeMenuData = data;
          });
          // this.$message("暂未提供该功能");

          break;
        case "export":
            this.exportFile(data);
            break;
          case "import":
            this.importFile(data);
        default:
          break;
      }
    },
    exportFile(data){
      let id = data.id;
      let url = window.context.portal+"/sys/sysMenu/v1/export?parentMenuId="+id;
      req.download(url);
    },
    handleImport(param){
      let formData = new FormData();
      formData.append("file",param.file);
      portalApi.importSysMenus(formData,this.parentMenuId).then(resp=>{
        if(resp.state){
          this.$message({type:"success",message:"导入成功"});
          this.uploadDialogVisible = false;
          this.fileList = [];
          this.$refs.htMenuManager.$refs.htMenuTree.loadData();
        }else{
          this.beforeClose();
        }
      })
    },
    beforeClose(){
      this.uploadDialogVisible = false;
      this.fileList = [];
    },
    importFile(data){
      this.parentMenuId = data.id;
      this.uploadDialogVisible = true;
    },
    getEditData(data) {
      this.editMenuFormVisible = false;
      this.hasParent = false;
      this.$http
        .get("${portal}/sys/sysMenu/v1/getJson?id=" + data.id)
        .then(response => {
          this.menu = response.data;
          this.editMenuFormVisible = true;
          this.$validator.validate();
          if (this.menu.tabsStyle) {
            this.tabsStyle = JSON.parse(this.menu.tabsStyle);
          } else {
            this.tabsStyle = { tabType: null };
          }
        });
    },
    removeMenuById(id) {
      portalApi.removeMenuById(id).then(
        data => {
          this.$refs.htMenuManager.$refs.htMenuTree.loadData();
          this.$message({
            showClose: true,
            message: "删除成功",
            type: "success"
          });
        },
        error => {}
      );
    },
    beforeSaveData() {
      if (this.tabsStyle.tabType) {
        this.menu.tabsStyle = JSON.stringify(this.tabsStyle);
      }
    },
    afterSaveData() {
      let msg = "是否继续添加下级菜单?";
      if (this.menu.id) {
        msg = "是否继续编辑菜单?";
      }
      this.$confirm(msg, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "success"
      })
        .then(() => {
          if (!this.menu.id) {
            this.menu = {
              ...this.menu,
              ...{
                href: "",
                name: "",
                alias: "",
                menuIcon: "",
                tabsStyle: "",
                sn: "",
                activeTab: "",
                sysMethods: []
              }
            };
          }
        })
        .catch(() => {
          if (!this.menu.id) {
            this.menu = {
              ...this.menu,
              ...{
                href: "",
                name: "",
                alias: "",
                menuIcon: "",
                sn: "",
                activeTab: "",
                tabsStyle: "",
                sysMethods: []
              }
            };
          }
          this.editMenuFormVisible = false;
        });
      this.$refs.htMenuManager.$refs.htMenuTree.loadData();
    },
    addSysMethods() {
      this.menu.sysMethods.push({ name: "", alias: "", requestUrl: "" });
    },
    removeSysMethod(row) {
      this.menu.sysMethods.remove(row);
    }
  }
};
</script>

<style lang="scss" scoped>
>>> .error-small {
  color: #f56c6c;
  font-size: 12px;
  line-height: 1;
  padding-top: 0;
  margin-top: 0;
  position: absolute;
  top: 80%;
  left: 0;
}
>>> .el-table td,
th {
  padding: 13px 0;
}

>>> .el-form-item__content {
  width: 250px;
}

.form-empty {
  position: absolute;
  text-align: center;
  width: 300px;
  font-size: 20px;
  top: 200px;
  left: 50%;
  margin-left: -150px;
  color: #ccc;
}
</style>
