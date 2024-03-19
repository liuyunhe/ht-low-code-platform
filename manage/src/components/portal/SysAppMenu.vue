<template>
  <el-container class="fullheight">
    <el-aside
      :width="width"
      style="border-right: 1px solid #eee;height: 800px">
      <sys-app-menu-tree
          highlight-current
          ref="sysAppMenuTree"
          :support-filter="true"
          :default-expand-all="true"
          :expand-on-click-node="false"
          @node-click="handleNodeClick"
          :id="id">
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span class="show-ellipsis" :title="node.label">{{ node.label}}</span>
          <el-dropdown @command="handleCommand">
            <span>
              <i class="icon-more" title="更多操作" />
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item icon="el-icon-plus" :command="{node:node,data,action:'add'}" v-if="!data.parentId || data.parentId==='0'">添加下级菜单</el-dropdown-item>
              <el-dropdown-item
                  v-if="data.id"
                  icon="el-icon-edit"
                  :command="{node:node,data,action:'edit'}"
              >编辑</el-dropdown-item>
              <el-dropdown-item
                  v-if="data.id"
                  icon="el-icon-delete"
                  :command="{node:node,data,action:'delete'}"
              >删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </span>
      </sys-app-menu-tree>
    </el-aside>
    <el-main v-show="editMenuFormVisible">
      <el-header>
        <ht-submit-button
            :url="saveUrl"
            :model="menu"
            scope-name="editMenuForm"
            @before-save-data="beforeSaveData"
            @after-save-data="afterSaveData"
        >保存</ht-submit-button>
      </el-header>
      <el-form data-vv-scope="editMenuForm" v-model="menu" size="mini">
        <ht-form-item v-if="hasParent && isShow" label="上级菜单" label-width="150px">
          <ht-input
              name="parent-menu-name"
              v-model="currentNodeData.name"
              autocomplete="off"
              disabled
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="菜单名称" label-width="150px">
          <ht-input
              name="menu-name"
              v-model="menu.name"
              autocomplete="off"
              :validate="'required'"
              :maxlength="50"
              :showWordLimit="true"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="别名" label-width="150px">
          <ht-input
              v-model="menu.alias"
              :disabled="menu.id? true:false"
              style="width:215px"
              :validate="'required|alpha_num'"
              :maxlength="30"
              v-pinyin="menu.name"
              :showWordLimit="true"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="跳转模式" label-width="150px">
          <ht-select
              v-model="menu.type"
              :options="[{key:1,value:'网页跳转'},{key:2,value:'表单列表'},{key:3,value:'自定义视图'},{key:4,value:'图表'},{key:6,value:'表单'}]"
              validate="required"
              class="width-input"
              @change="modeChange"
          />
        </ht-form-item>
        <ht-form-item label="网页链接" v-if="menu.type===1" label-width="150px">
          <ht-input
            v-model="menu.content"/>
        </ht-form-item>
        <ht-form-item label="表单列表" v-if="menu.type===2" label-width="150px">
          <eip-data-template-selector
              v-model="templateData"
              placeholder="请选择表单列表"
              :single="true"
              style="width: 200px"/>
        </ht-form-item>
        <ht-form-item label="自定义视图" v-if="menu.type===3" label-width="150px">
          <eip-custom-view-selector
              validate="required"
              v-model="customQueryData"
              :single="true"
              style="width: 200px"/>
        </ht-form-item>
        <ht-form-item label="图表" v-if="menu.type===4" label-width="150px">
          <eip-chart-selector validate="required" :dataParam.sync="menu.content" :chartType="2"></eip-chart-selector>
        </ht-form-item>
        <ht-form-item label="表单" v-if="menu.type===6" label-width="150px">
          <eip-form-selector
              validate="required"
              v-model="formData"
              :single="true"
              style="width: 200px"/>
        </ht-form-item>
        <ht-form-item label="排序" label-width="150px">
          <ht-input
              name="menu-sn"
              v-model="menu.sn"
              autocomplete="off"
              validate="required|numeric"
              :maxlength="50"
              :showWordLimit="true"
          ></ht-input>
        </ht-form-item>
      </el-form>
    </el-main>
    <el-main v-show="!editMenuFormVisible">
      <div class="form-empty">请选择一个菜单进行操作</div>
    </el-main>
  </el-container>
</template>

<script>
  import styles from "@/assets/css/element-variables.scss";
  const sysAppMenuTree  = () => import("@/components/portal/SysAppMenuTree");
  const eipDataTemplateSelector = () => import("@/components/selector/EipDataTemplateSelector.vue");
  const eipChartSelector = () => import("@/components/selector/EipChartSelector.vue");
  const eipCustomViewSelector = () => import("@/components/selector/EipCustomViewSelector.vue");
  const eipFormSelector = () => import("@/components/selector/EipFormSelector.vue");
  export default {
    name: "sys-app-menu",
    props:{
      id: String
    },
    components: {
      sysAppMenuTree,
      eipDataTemplateSelector,
      eipChartSelector,
      eipCustomViewSelector,
      eipFormSelector
    },
    data(){
      return{
        width: styles.aside_width,
        hasParent: true,
        isShow: true,
        currentNodeData:{},
        menu:{name: "", alias: ""},
        isFrontMenu: "",
        tabsStyle: {},
        saveUrl: window.context.portal + "/portal/sysAppMenu/v1/save",
        templateData:{},
        customQueryData:{},
        formData: {},
        editMenuFormVisible:false
      }
    },
    methods:{
      handleNodeClick(node){
        if (node.name==='菜单')
          return;
        this.menu = node;
        this.isShow = false;
      },
      handleCommand(param){
        switch (param.action) {
          case "add":
            this.add(param.node);
            break;
          case "edit":
            this.edit(param.node);
            break;
        }
      },
      add(node){
        this.editMenuFormVisible = true
        this.menu = {name: "", alias: ""};
        this.currentNodeData = node.data;
        this.menu.appId = this.id;
        this.isShow = true;
        if (node.data.name==="菜单"){
          //是否显示上级菜单
          this.hasParent = false;
          this.menu.parentId = "0";
        }else{
          this.menu.parentId = node.data.id;
        }
      },
      edit(node){
        this.isShow = false;
        this.editMenuFormVisible = true
        this.menu = node.data;
        if (node.data.type===2){
          //数据报表
          this.templateData = JSON.parse(node.data.content);
        }else if (node.data.type===3){
          //自定义图表
          this.currentNodeData = JSON.parse(node.data.content);
        }else if (node.data.type===6){
          //表单
          this.formData = JSON.parse(node.data.content);
        }
      },
      beforeSaveData(){
        if (this.menu.type===2){
          let data = {
            id: this.templateData.id,
            key: this.templateData.alias,
            name: this.templateData.name
          }
          this.menu.content = JSON.stringify(data);
        }else if (this.menu.type === 3){
          let data = {
            id: this.customQueryData.id,
            alias: this.customQueryData.alias,
            sqlAlias: this.customQueryData.sqlAlias,
            name: this.customQueryData.name
          }
          this.menu.content = JSON.stringify(data);
        }else if (this.menu.type === 6){
          let data = {
            id: this.formData.id,
            name: this.formData.name,
            key: this.formData.formKey
          }
          this.menu.content = JSON.stringify(data);
        }
      },
      afterSaveData(){
        this.$refs.sysAppMenuTree.loadData(this.id);
        this.editMenuFormVisible = false;
      },
      modeChange(){
        this.$set(this.menu, "content", "");
      }
    }
  }
</script>

<style scoped>
  >>> .navbar-collapse {
    position: relative;
    top: -60%;
    cursor: pointer;
    width:20px;
  }

  >>> .el-dropdown {
    display: none;
  }

  >>> .el-tree-node__content:hover .el-dropdown {
    display: inline-block;
  }

  >>> .custom-tree-node {
    width: calc(100% - 40px);
    /* flex: 1; */
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }

  .custom-tree-node i {
    visibility: hidden;
    font-weight: bold;
  }

  .custom-tree-node:hover i {
    visibility: visible;
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
