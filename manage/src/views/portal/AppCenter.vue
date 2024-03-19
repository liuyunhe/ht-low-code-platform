<template>
  <div class="fullheight app_center_container">
    <div>
      <div>
        <el-input
          placeholder="请输入应用名称"
          v-model="searchForm.appName"
          @keyup.enter.native="search(1)"
          class="input-search"
          :clearable="true">
          <el-button slot="append" icon="el-icon-search" @click="search(1)"></el-button>
        </el-input>
        <el-checkbox v-model="searchForm.isPublish" @change="search(1)">已发布</el-checkbox>
        <el-checkbox v-model="searchForm.notPublish" @change="search(1)">未发布</el-checkbox>
        <el-divider direction="vertical"></el-divider>
        <el-button size="small" @click="importDialogVisible = true;" icon="el-icon-back">导入</el-button>
        <el-button size="small" @click="handleExport" icon="el-icon-right">导出</el-button>
        <el-button @click="auth()">设置权限</el-button>
      </div>
      <el-row class="content">
        <el-col :span="6">
          <el-card
                  shadow="hover"
                  class="card"
                  @click.native="add"
                  v-if="apps.length<24">
            <i class="el-icon-circle-plus-outline" style="font-size: 100px"></i>
          </el-card>
        </el-col>
        <el-col
            :span="6"
            v-for="app in apps"
            :key="app.id">
          <div class="card-item" :class="{ checked: app.checked }">
            <div class="sticky" @click="itemClick(app, $event)">
              <label class="card-checkbox">
                <input type="checkbox" />
                <span></span>
              </label>
            </div>
            <el-card
                    shadow="hover"
                    class="card"
                    :body-style="{ padding: '0px' }">
              <div class="card-background" :style="{background:app.iconColor?app.iconColor:'#1339E0'}">
                <el-image class="app-image" :src="app.icon" v-if="app.icon && app.icon.indexOf('icon')<0"></el-image>
                <i :class="app.icon?app.icon:'icon-hotent-H'" style="color:#FFFFFF;padding-top: 10px" v-else></i>
              </div>

              <span class="card-title">{{app.name}}</span>
              <div class="card-item-actions">
                <el-button round  @click="manage(app.id)" class="actions__btn">管理</el-button>
                <el-button round  @click="publish(app)" v-if="app.isPublish===0" class="actions__btn">发布</el-button>
                <el-button round  @click="view(app)" v-if="app.isPublish!==0" class="actions__btn">查看发布</el-button>
                <el-button round @click="tagSet(app)" class="actions__btn">标签</el-button>
                <el-button round  @click="auth(app)" class="actions__btn">权限</el-button>
                <el-popconfirm title="确定删除" @onConfirm="confirm(app.id)" class="actions__btn confirm__btn">
                  <el-button slot="reference" round type="danger">删除</el-button>
                </el-popconfirm>
              </div>
            </el-card>
          </div>
        </el-col>
      </el-row>
      <el-pagination
          background
          layout="prev, pager, next"
          :total="pageResult.total"
          :page-size="pageResult.pageSize"
          :current-page="pageResult.page"
          class="pagination"
          @current-change="currentChange">
      </el-pagination>
    </div>

    <el-dialog
        fullscreen
        :visible="dialogVisible"
        v-if="dialogVisible"
        class="form-editor-dialog">
      <el-container class="fullheight">
        <el-header class="header" style="height: 45px;">
          <div class="navbar-default box-shadow flex">
            <el-page-header @back="beforeClose" content="详情页面">
            </el-page-header>
            <ht-submit-button
                url="${portal}/portal/sysApp/v1/save"
                :model="appModel"
                scope-name="appModelForm"
                @after-save-data="afterSaveData"
                @before-save-data="beforeSaveData"
            >{{$t("eip.common.save")}}</ht-submit-button>
          </div>
        </el-header>
        <el-main>
          <el-tabs type="card" v-model="activeName">
            <el-tab-pane label="基础信息" name="base">
              <el-form v-form data-vv-scope="appModelForm">
                <ht-form-item label="应用名称">
                  <ht-input v-model="appModel.name" validate="required" width="260px" />
                </ht-form-item>
                <ht-form-item label="图标">
                  <div style="display: inline-flex;">
                    <div :style="{width: '30px',height: '30px',background:appModel.iconColor}">
                      <el-image class="image" :src="image" v-if="image"></el-image>
                      <i :class="appModel.icon" style="font-size:30px;color: #FFFFFF" class="app-icon"></i>
                    </div>
                    <iconDialog @selected="selectIcon" />
                    <el-upload
                            action="string"
                            :http-request="updateImage"
                            :show-file-list="false"
                            accept="image/gif,image/jpeg,image/png,image/jpg,image/bmp">
                      <el-button size="small">上传</el-button>
                    </el-upload>
                    <el-color-picker v-model="appModel.iconColor"></el-color-picker>
                  </div>
                </ht-form-item>
                <ht-form-item label="跳转模式">
                  <ht-select
                      v-model="appModel.type"
                      :options="typeOptions"
                      validate="required"
                      class="width-input"
                      @change="modeChange"
                  />
                </ht-form-item>
                <ht-form-item label="表单列表" v-if="appModel.type===2">
                  <eip-data-template-selector
                      v-model="templateData"
                      placeholder="请选择表单列表"
                      :single="true"
                      style="width: 200px"/>
                </ht-form-item>
                <ht-form-item label="自定义视图" v-if="appModel.type===3">
                  <eip-custom-view-selector
                      validate="required"
                      v-model="customQueryData"
                      :single="true"
                      style="width: 200px"/>
                </ht-form-item>
                <ht-form-item label="图表" v-if="appModel.type===4" >
                  <eip-chart-selector validate="required" :dataParam.sync="appModel.content" :chartType="2"></eip-chart-selector>
                </ht-form-item>
                <ht-form-item label="网页跳转" v-if="appModel.type===5">
                  <el-tooltip class="item" effect="dark" content="系统内网页可填写相对路径" placement="top">
                    <i class="el-icon-info"></i>
                  </el-tooltip>
                  <ht-input
                    v-model="appModel.content"
                    :validate="{required:true}"
                  ></ht-input>
                </ht-form-item>
                <ht-form-item label="表单" v-if="appModel.type===6">
                  <eip-form-selector
                    validate="required"
                    v-model="formData"
                    :single="true"
                    style="width: 200px"/>
                </ht-form-item>
                <ht-form-item label="模块" v-if="appModel.type===7">
                  <eip-module-selector
                    validate="required"
                    v-model="moduleData"
                    :single="true"
                    style="width: 20px"/>
                </ht-form-item>
                <ht-form-item label="流程" v-if="appModel.type===8">
                  <eip-flow-selector
                    validate="required"
                    v-model="flowData"
                    :single="true"
                    style="width: 200px">
                  </eip-flow-selector>
                </ht-form-item>
                <ht-form-item label="排序">
                  <ht-input v-model="appModel.sn" validate="required" type="number" width="260px" />
                </ht-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="应用说明" name="appDesc" v-if="appModel.id">
              <portal-app-param :appId="appModel.id"></portal-app-param>
            </el-tab-pane>
            <el-tab-pane label="菜单信息" name="menu" v-if="appModel.type===1" :disabled="appModel.id?false:true">
              <sys-app-menu :id="selectId"></sys-app-menu>
            </el-tab-pane>
          </el-tabs>
        </el-main>
      </el-container>
    </el-dialog>

    <el-dialog
      :visible="publishDialogVisible"
      width="30%"
      title="发布应用"
      :before-close="beforeClose">
      <el-form data-vv-scope="publishForm">
        <ht-form-item label="应用菜单">
          <tree-Select
            v-model="menu.id"
            :normalizer="normalizer"
            :multiple="false"
            :options="menus"
            noOptionsText=" "
            noChildrenText=" "
            placeholder="请选择父节点"
          />
        </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="savePublish" v-if="!selectedApp.isPublish">保 存</el-button>
        <el-button type="primary" @click="unPublish(selectedApp)" v-if="selectedApp.isPublish">取消发布</el-button>
        <el-button @click="publishDialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible="tagDialogVisible"
      width="30%"
      title="设置标签"
      :before-close="beforeClose">
      <el-form >
        <ht-form-item label="应用标签">
          <tree-Select
          :normalizer="normalizer"
          v-model="appTags"
          :multiple="true"
          :options="appTagList"
          :disableBranchNodes="true"
          placeholder="请选择应用标签"></tree-Select>
        </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="tagConfig">配置标签信息</el-button>
        <el-button type="primary" @click="appTagSave">{{$t("eip.common.save")}}</el-button>
        <el-button type="default" @click="beforeClose">{{$t("eip.common.cancel")}}</el-button>
      </div>
    </el-dialog>
    <eip-auth-dialog @onConfirm="authConfirm" ref="appAuth" />
    <el-dialog
      title="导入应用"
      :visible.sync="importDialogVisible"
      width="40%"
      top="30vh"
      :close-on-click-modal="false"
      v-if="importDialogVisible">
      <div style="height:150px;padding-left: 20px ;">
        <el-upload
          style="display: inline-block;"
          :action="uploadUrl"
          :on-success="handleUploadResult"
          :on-error="handleUploadResult"
          :headers="uploadHeaders"
          :on-exceed="onExceed"
          accept=".zip"
          :before-upload="beforeUpload"
          :limit="1"
          :auto-upload="false"
          ref="upload">
          <el-button size="small" icon="el-icon-upload">选择应用</el-button>
        </el-upload>
      </div>
      <span slot="footer" class="dialog-footer">
            <el-button
              type="primary"
              @click="uploadSubmit"
              element-loading-text="导入中..."
              v-loading.fullscreen.lock="fullscreenLoading">确 定</el-button>
            <el-button @click="importDialogVisible = false">取 消</el-button>
          </span>
    </el-dialog>
  </div>
</template>

<script>
import portal from "../../api/portal";
import uc from "@/api/uc.js";
import req from "@/request.js";
const iconDialog = () => import("@/components/dialog/IconDialog.vue");
const sysAppMenu = () => import("@/components/portal/SysAppMenu.vue");
const eipDataTemplateSelector = () => import("@/components/selector/EipDataTemplateSelector.vue");
const eipChartSelector = () => import("@/components/selector/EipChartSelector.vue");
const eipCustomViewSelector = () => import("@/components/selector/EipCustomViewSelector.vue");
const eipFormSelector = () => import("@/components/selector/EipFormSelector.vue");
const eipModuleSelector = () => import("@/components/selector/EipModuleSelector.vue");
const eipFlowSelector = () => import("@/components/selector/EipFlowSelector.vue");
const treeSelect = () => import("@riophae/vue-treeselect");
const eipAuthDialog = () => import("@/components/dialog/EipAuthDialog.vue");
const portalAppParam = () => import("@/views/portal/PortalAppParamManager.vue")
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { mapState } from "vuex";
export default {
  name: "app-center",
  components:{
    iconDialog,
    sysAppMenu,
    eipDataTemplateSelector,
    eipChartSelector,
    eipCustomViewSelector,
    eipFormSelector,
    eipModuleSelector,
    treeSelect,
    eipFlowSelector,
    eipAuthDialog,
    portalAppParam
  },
  data() {
    return {
      apps: [],
      pageResult: {
        page: 1,
        pageSize: 15,
        total: 0
      },
      dialogVisible: false,
      appModel:{
        name: "",
        icon: "",
        iconType: 1,
        iconColor: "#1339E0",
        type: "",
        content: ""
      },
      typeOptions:[
        {key:1,value:'常规应用'},
        {key:2,value:'表单列表'},
        {key:3,value:'自定义视图'},
        {key:4,value:'图表'},
        {key:5,value:"网页跳转"},
        {key:6,value:'表单'},
        {key:7,value:'流程模块'},
        {key:8,value:'流程'}
      ],
      selectId: "",
      activeName: "base",
      deleteUrl: window.context.portal + "/portal/sysApp/v1/remove",
      templateData: {},
      customQueryData: {},
      formData:{},
      moduleData: {},
      image: "",
      publishDialogVisible: false,
      menu: {
        id: "",
        name: ""
      },
      menus: [],
      selectedApp: {},
      flowData: {},
      searchForm: {
        appName: "",
        isPublish: false,
        notPublish: false
      },
      selectIdList: [],
      appTagList: [],
      tagDialogVisible: false,
      appTags: [],
      importDialogVisible: false,
      uploadUrl: window.context.portal + "/portal/sysApp/v1/import",
      fullscreenLoading: false,
    }
  },
  computed: mapState({
    uploadHeaders: function(mapState) {
      return { Authorization: "Bearer " + mapState.login.currentUser.token };
    },
  }),
  created(){
    this.loadData();
  },
  methods: {
    loadData(query){
      let loading = this.$loading({
        target: document.querySelector(".content")
      });
      let param = {
        pageBean: this.pageResult,
        querys: [],
        sorter:[{direction: 'ASC',property: 'sn_'}]
      }
      if (query) {
        param.querys = query;
      }
      param.sorter = [{
        property: "UPDATE_TIME_",
        direction: "DESC"
      }]
      portal.getSysAppList(param).then(data => {
        this.apps = data.rows;
        this.pageResult = {
          page: data.page,
          pageSize: data.pageSize,
          total: data.total
        }
      }).finally(() => {
        loading.close();
      })
    },
    loadMenus(){
      portal.getCurrentMenuByAlias("app_menu").then(data => {
        if (data.state){
          this.menus = data.value;
          if(data.value && data.value.length > 0){
            let defaultMenu = data.value.filter(item=>{
              return item.alias === 'default';
            })
            if(defaultMenu && defaultMenu.length != 0){
              this.menu.id = defaultMenu[0].id;
            }else{
              this.menu.id = data.value[0].id;
            }
          }
          this.removeEmptyChildren(this.menus);
        }
      })
    },
    add(){
      this.dialogVisible = false;
      this.$nextTick(() => {
        this.dialogVisible = true;
      })
      this.image = "";
      this.appModel = {
        name: "",
        icon: "",
        iconType: 1,
        iconColor: "#1339E0",
        type: "",
        content: ""
      }
    },
    publish(app){
      this.publishDialogVisible = true;
      this.loadMenus();
      this.selectedApp = {...app};
    },
    unPublish(app){
      app.isPublish = 0;
      portal.publishApp(app).then(data => {
        if (data.state){
          this.$message({type: 'success', message: data.message});
          this.loadData();
        }
      })
    },
    view(app) {
      this.publishDialogVisible = true;
      this.selectedApp = {...app};
      this.loadMenus();
      this.menu.id = this.selectedApp.menuId;
    },
    beforeClose(){
      this.$set(this, "templateData" , {});
      this.dialogVisible = false;
      this.publishDialogVisible = false;
      this.tagDialogVisible = false;
      this.appTags = [];
    },
    selectIcon(icon){
      this.image = "";
      this.appModel.icon = icon;
    },
    modeChange(){
      this.$set(this.appModel, "content", "");
    },
    afterSaveData(){
      this.$set(this, "templateData" , {});
      this.dialogVisible = false;
      this.loadData();
    },
    beforeSaveData(){
      if (this.appModel.type===2){
        let data = {
          id: this.templateData.id,
          key: this.templateData.alias,
          name: this.templateData.name
        }
        this.appModel.content = JSON.stringify(data);
      }else if (this.appModel.type === 3){
        let data = {
          id: this.customQueryData.id,
          alias: this.customQueryData.alias,
          sqlAlias: this.customQueryData.sqlAlias,
          name: this.customQueryData.name
        }
        this.appModel.content = JSON.stringify(data);
      }else if (this.appModel.type===6){
        let data = {
          id: this.formData.id,
          name: this.formData.name,
          key: this.formData.formKey
        }
        this.appModel.content = JSON.stringify(data);
      }else if (this.appModel.type===7){
        let data = {
          id: this.moduleData.id,
          name: this.moduleData.name
        }
        this.appModel.content = JSON.stringify(data);
      }else if (this.appModel.type===8){
        let data = {
          id: this.flowData.id,
          name: this.flowData.name,
          key: this.flowData.defKey
        }
        this.appModel.content = JSON.stringify(data);
      }
      if (this.image) {
        this.appModel.icon = this.image;
      }
    },
    afterDelete(){
      this.loadData();
    },
    manage(id){
      this.dialogVisible = true;
      this.selectId = id;
      portal.getSysApp(id).then(data => {
        this.appModel = data;
        this.image = "";
        if (this.appModel.icon && this.appModel.icon.indexOf("icon")<0){
          this.image = this.appModel.icon;
        }
        if (this.appModel.type===2)
          this.templateData = JSON.parse(this.appModel.content);
        else if (this.appModel.type === 3){
          this.customQueryData = JSON.parse(this.appModel.content);
        }else if (this.appModel.type===6){
          this.formData = JSON.parse(this.appModel.content);
        }else if (this.appModel.type===8) {
          this.flowData = JSON.parse(this.appModel.content);
        }else if (this.appModel.type === 7) {
          this.moduleData = JSON.parse(this.appModel.content);
        }
      })
    },
    confirm(id){
      portal.deleteSysApp(id).then(data => {
        if (data.state){
          this.$message({type: 'success', message:data.message});
        }
        this.loadData();
        this.selectIdList = [];
      })
    },
    updateImage(param){
      const formData = new FormData();
      formData.append("files", param.file);
      uc.fileUpload(formData).then(response => {
        this.$store.dispatch("menu/downloadImg", response.fileId).then(res => {
          if (res != "") {
            this.image = res;
            param.onSuccess();
          }
        }).catch(() => {
          param.onError();
        });
      }).catch(() => {
        param.onError();
      });
    },
    normalizer(node) {
      return {
        id: node.id,
        label: node.name,
        children: node.children,
        isDefaultExpanded: false
      };
    },
    removeEmptyChildren(menus) {
      menus.forEach(m => {
        if (m.children) {
          if (m.children.length < 1) {
            delete m.children;
          } else {
            this.removeEmptyChildren(m.children);
          }
        }
      });
    },
    savePublish() {
      if (!this.menu.id){
        this.$message.warning("请选择应用菜单");
        return;
      }
      this.selectedApp.isPublish = 1;
      this.selectedApp.menuId = this.menu.id;
      portal.publishApp(this.selectedApp).then(data => {
        if (data.state){
          this.$message({type: 'success', message: data.message});
          this.loadData();
          this.publishDialogVisible = false;
        }
      })
    },
    auth(app){
      let _this = this;
      let id = "";
      if (app){
        this.selectId = app.id;
        id = app.id;
      } else {
        if (this.selectIdList.length<=0) {
          this.$message.warning("请选择需要设置的应用");
          return;
        }else {
          id = this.selectIdList[0];
          this.selectId = "";
        }
      }
      portal.getRights(id,"app").then(function(resp) {
        if (resp.data) {
          let conf = {
            right: resp.data.right,
            permissionList: resp.data.type,
            autoClose: false
          };
          _this.$refs.appAuth.showDialog(conf);
        }
      });
    },
    batchSaveRights(data) {
      let param = {
        ids: this.selectIdList,
        objType: "app",
        ownerNameJson: JSON.stringify(data)
      }
      let _this = this;
      this.$http.post("${portal}/sys/authUser/v1/batchSaveRights", param).then(resp => {
        _this.showResponse(resp);
      })
    },
    saveRight(data) {
      let param = {
        id: this.selectId,
        objType: "app",
        ownerNameJson: JSON.stringify(data)
      };
      let _this = this;
      this.$http.post("${portal}/sys/authUser/v1/saveRights", param)
              .then(resp => {
                _this.showResponse(resp)
              });
    },
    showResponse(resp) {
      if (resp.data) {
        if (resp.data.state) {
          this.$message.success("授权成功");
          this.$refs.appAuth.closeDialog();
        } else {
          this.$message.error(resp.data.message);
        }
      }
    },
    authConfirm(data){
      if (this.selectId) {
        this.saveRight(data);
      }else {
        this.batchSaveRights(data);
      }
    },
    currentChange(page) {
      this.search(page);
    },
    search(page) {
      let query = [];
      if (this.searchForm.appName) {
        query.push({
          property: "name",
          operation: "LIKE",
          value: this.searchForm.appName,
          relation: "AND",
          group: "a"
        })
      }
      if (this.searchForm.isPublish) {
        query.push({
          property: "isPublish",
          operation: "EQUAL",
          value: 1,
          relation: "OR",
          group: "b"
        })
      }
      if (this.searchForm.notPublish) {
        query.push({
          property: "isPublish",
          operation: "EQUAL",
          value: 0,
          relation: "OR",
          group: "b"
        })
      }
      this.pageResult.page = page;
      this.loadData(query);
    },
    itemClick(item,$event) {
      $event.preventDefault();
      if (this.selectIdList.includes(item.id)) {
        this.selectIdList.remove(item.id);
        this.$set(item,"checked",false);
      }else {
        this.selectIdList.push(item.id);
        this.$set(item,"checked",true);
      }
    },
    tagSet(app){
      this.selectId = app.id;
      this.tagDialogVisible = true;
      this.loadAppTagsType();
      this.loadAppTags(app.id);
    },
    //加载旧数据
    loadAppTags(appId){
      req.get(window.context.portal + "/portal/sysApp/v1/getAppTagsById/"+appId).then(resp=>{
        if(resp.data.state && resp.data.value && resp.data.value.length != 0 ){
          this.appTags = [];
          resp.data.value.forEach(item=>{
            this.appTags.push(item.tagId);
          })
        }
      })
    },
    //获取标签分类
    loadAppTagsType(){
      req.get(window.context.portal + "/sys/sysType/v1/getTreeDateByTypeKey?typeKey=yybq").then(resp=>{
        this.appTagList = resp.data;
        this.loadSysTag();
      })
    },
    //加载标签到options
    loadSysTag(){
      this.appTagList.forEach(item=>{
        let querys = [{property: "type_id_", value: item.id, group: "main", operation: "EQUAL", relation: "AND"}];
        let filter = {querys:querys};
        req.post(window.context.portal + "/portal/sysTag/v1/query",filter).then(resp=>{
          item.children = resp.data.rows;
        })
      })
    },
    appTagSave(){
      req.post(window.context.portal + "/portal/sysApp/v1/saveAppTags/"+this.selectId,this.appTags.join(",")).then(resp=>{
        if(resp.data.state){
          this.$message({type:"success",message:resp.data.message});
          this.tagDialogVisible = false;
        }
      })
    },
    //跳转到标签配置页面
    tagConfig(){
      this.$router.push("/meta#sysTagManager")
    },
    handleExport() {
      if (this.selectIdList.length === 0) {
        this.$message.warning("请选择至少一项记录");
        return;
      }
      let url = `${window.context.portal}/portal/sysApp/v1/exportXml?ids=${this.selectIdList}`;
      req.download(url);
    },
    handleUploadResult(data) {
      if (data.state) {
        if (data.message.includes("已存在故跳过")) {
          this.$message({ type: "warning", message: data.message, showClose: true, duration: 5000, dangerouslyUseHTMLString: true });
        } else {
          this.$message({ type: "success", message: "导入成功" });
        }
      } else {
        this.$message({ type: "error", message: data.message });
      }
      this.importDialogVisible = false;
      this.fullscreenLoading = false;
      this.search(1);
    },
    beforeUpload(file) {
      if (!file.name.endsWith(".zip")) {
        this.$message.warning("只能导入zip文件!");
        return false;
      }
      this.fullscreenLoading = true;
    },
    onExceed(file) {
      this.$message.warning("只能选择一个zip文件!");
    },
    uploadSubmit() {
      if (
        !this.$refs.upload.uploadFiles ||
        this.$refs.upload.uploadFiles.length === 0
      ) {
        this.$message.warning("请选择要导入的应用!");
        return false;
      }
      this.$refs.upload.submit();
    }
  }
};
</script>

<style lang="scss" scoped>
.app_center_container{
    height: 100%;
    overflow: auto;
}
.card {
  margin: 5px;
  min-height: 200px;
  text-align: center;
}
.card i {
  font-size: 60px;
  display: block;
  margin: 10px 0;
}
.card-item-actions {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        background: #fafafa;
        justify-content: center;
        padding: 10px 10px 0 10px;
        margin-top: 22px;
        .actions__btn{
            margin-bottom: 10px;
        }
        .confirm__btn{
            margin-left: 10px;
        }
    }
    .pagination {
        // position: absolute;
        // bottom: 0;
        margin-top: 20px;
    }
.form-editor-dialog >>> .el-dialog__header {
  display: none;
}
.form-editor-dialog >>> .el-dialog__body {
  padding: 0;
  height: 100%;
}
.navbar-default {
  height: 100%;
  background-image: none;
  background: #fff;
  border-radius: 0px;
  box-shadow: 0px 2px 5px rgba(86, 96, 117, 0.15);
  border-bottom: 1px solid #ededed;
  justify-content: space-between;
}
.navbar-default span {
  color: #666;
  font-size: 14px;
  line-height: 48px;
  font-weight: bold;
  margin-left: 20px;
}
.header {
  padding: 0;
  background: #fff;
  z-index: 7;
}
.card-title {
  font-weight: bold;
  font-size: 20px;
}
.card-background {
  width: 80px;
  height: 80px;
  margin: 10px auto;
  border-radius: 15px;
}
.image {
  width: 30px;
  height: 30px;
}
.app-image {
  width: 60px;
  height: 60px;
  margin: 10px;
}
.input-search {
  width: 400px;
  margin: 0px 12px 0 6px;
}
  .card-item {
    cursor: default;
    display: block;
    position: relative;
  }
  .sticky {
    width: 1px;
    height: 0px;
    position: absolute;
    top: 0;
    right: 5px;
    border-left: 40px solid #fff;
    border-top: 40px solid #ededed;
  }
  .card-checkbox {
    position: absolute;
    top: -35px;
    right: 0;
  }
.card-checkbox input[type="checkbox"] {
  opacity: 0;
}
.card-checkbox input[type="checkbox"] + span::after {
  opacity: 1;
  content: "";
  position: absolute;
  width: 6px;
  height: 11px;
  background: transparent;
  right: 7px;
  border: 2px solid #fff;
  border-top: none;
  border-left: none;
  -webkit-transform: rotate(35deg);
  -moz-transform: rotate(35deg);
  -o-transform: rotate(35deg);
  -ms-transform: rotate(35deg);
  transform: rotate(35deg);
}
.card-item.checked .el-card {
  outline: 1px solid #5492f5;
}
.card-item.checked .sticky {
  border-top-color: #5492f5;
}
</style>
