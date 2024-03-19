<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      quick-search-props="name,alias"
      :default-querys="defaultQuerys"
      ref="columnTable"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="handleCommand({command:'add'})" icon="el-icon-plus">添加</el-button>
          <ht-delete-button :url="deleteUrl" :htTable="$refs.columnTable">删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="id" label="主键" :sortable="true" hidden />
        <ht-table-column
          prop="name"
          label="栏目名称"
          :sortable="true"
          :show-overflow-tooltip="true"
        />
        <ht-table-column prop="alias" label="别名" :sortable="true" />
        <ht-table-column prop="dataMode" label="数据加载方式" :sortable="true" >
          <template v-slot="{row}">
            <el-tag v-if="row.dataMode==0" type="info">Service方法</el-tag>
            <el-tag v-if="row.dataMode==1" type="info">自定义查询方式</el-tag>
            <el-tag v-if="row.dataMode==2" type="success">webservice方法</el-tag>
            <el-tag v-if="row.dataMode==3" type="warning">RESTful接口</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column prop="dataFrom" label="方法路径" :sortable="true" />
        <ht-table-column prop="isPublic" label="栏目使用平台" :sortable="true" >
          <template v-slot="{row}">
            <el-tag v-if="row.isPublic==0" type="info">管理端</el-tag>
            <el-tag v-if="row.isPublic==1" type="success">手机端</el-tag>
            <el-tag v-if="row.isPublic==2" type="warning">VUE前端</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column prop="supportRefesh" label="是否支持刷新" :sortable="true" >
          <template v-slot="{row}">
            <el-tag v-if="row.supportRefesh==0" type="warning">否</el-tag>
            <el-tag v-if="row.supportRefesh==1" type="success">是</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column width="150">
          <template v-slot:header>
            <span style="color: #2274af">操作</span>
          </template>
          <template v-slot="{row}">
            <el-dropdown
              size="mini"
              split-button
              @command="handleCommand"
              @click="handleCommand({row:row,command:'edit'})"
            >
              <span>
                <i class="el-icon-edit"></i>修改
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item icon="el-icon-menu" @click="previewTemplate(row.id, row.name, row.isPublic, row.alias)">预览</el-dropdown-item>
                <el-dropdown-item icon="el-icon-menu" @click="setAuth(row.id, 'user-selector')">授权</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </ht-table-column>
      </template>
    </ht-table>

    <ht-sidebar-dialog
      width="50%"
      :title="sidebarTitle"
      :visible="dialogVisible"
      :before-close="handleClose"
    >
      <el-form v-model="column" data-vv-scope="editForm">
        <ht-form-item label="栏目名称" prop="name" label-width="100px">
          <ht-input
            class="ht"
            v-model="column.name"
            autocomplete="off"
            :validate="{required:true}"
            placeholder="请输入名称"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="栏目别名" prop="code" label-width="100px">
          <ht-input
            class="ht"
            v-model="column.alias"
            autocomplete="off"
            :validate="{required:true}"
            placeholder="请输入别名"
            :disabled="column.id?true:false"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="栏目分类" label-width="100px">
            <eip-sys-type-selector typeKey="INDEX_COLUMN_TYPE" v-model="column.catalogName" :sys-type-id.sync="column.catalog"></eip-sys-type-selector>
        </ht-form-item>
        <ht-form-item label="栏目类型" label-width="100px">
          <ht-select
            v-model="column.colType"
            :disabled="column.id?true:false"
            class="ht"
            :validate="{required:true}"
            :options="[{key:0,value:'一般类型栏目'},{key:1,value:'图表类型栏目'},{key:2,value:'日历类型栏目'},{key:3,value:'滚动类型栏目'}]"
          ></ht-select>
        </ht-form-item>
        <ht-form-item label="选择图表类型" v-if="column.colType==1" label-width="100px">
          <ht-radio
            v-model="column.chartType"
            :options="[{ key: 1, value: '流程统计分析报表'}, { key: 2, value: '自定义图表'}]"
          />
        </ht-form-item>
        <ht-form-item label="选择图表" v-if="column.colType==1" label-width="100px"  style="display:block;">
          <eip-chart-selector :dataParam="column.dataParam" :chartType="column.chartType" @selectedChart="selectedChart"></eip-chart-selector>
        </ht-form-item>
         <ht-form-item label="更多路径" v-if="column.colType!=1" label-width="100px">
          <ht-input autocomplete="off" v-model="column.colUrl" class="ht"></ht-input>
        </ht-form-item>
         <ht-form-item label="展示效果" v-if="column.colType!=1" label-width="100px">
          <ht-select
            v-model="column.showEffect"
            class="ht"
            :options="[{key:0,value:'默认效果'},{key:1,value:'走马灯'},{key:2,value:'幻灯片'}]"
          ></ht-select>
        </ht-form-item>
         <ht-form-item label="数据加载方式" v-if="column.colType!=1" label-width="100px">
           <ht-radio
            v-model="column.dataMode"
            :options="[{ key: 0, value: 'Service方法'},{ key: 1, value: '自定义查询方式'}, { key: 2, value: 'webservice方法'}, { key: 3, value: 'RESTful接口'}]"
          />
        </ht-form-item>
         <ht-form-item label="请求类型" v-if="column.dataMode==3 && column.colType!=1" label-width="100px">
          <ht-radio
            v-model="column.requestType"
            :options="[{ key: 'POST', value: 'POST'}, { key: 'GET', value: 'GET'}]"
          />
        </ht-form-item>
         <ht-form-item label="方法路径" v-if="column.colType!=1" label-width="100px">
           <el-input v-model="column.dataFrom" autocomplete="off" placeholder="请输入方法路径">
             <el-select v-model="column.dataMode" slot="prepend" placeholder="请选择">
              <el-option label="Service方法" :value="0"></el-option>
              <el-option label="自定义查询方式" :value="1"></el-option>
              <el-option label="webservice方法" :value="2"></el-option>
              <el-option label="RESTful接口" :value="3"></el-option>
            </el-select>
            <el-button type="primary" v-if="column.dataMode==3||column.dataMode==2||column.dataMode==0" 
                @click="showSetParamDialog()" slot="append">参数设置</el-button>
            <el-button type="primary" v-if="column.dataMode==1" icon="el-icon-search"
                @click="selectQuery()" slot="append">选 择</el-button>
          </el-input> 
        </ht-form-item>
         <ht-form-item label="栏目使用平台" label-width="100px" style="display:block;">
          <ht-radio
            v-model="column.isPublic"
            :options="[{ key: 0, value: '管理端'}, { key: 1, value: '手机端'}, { key: 2, value: 'VUE前端'}]"
          />
        </ht-form-item>
         <ht-form-item label="栏目高度" label-width="100px">
          <ht-input v-model="column.colHeight" type="number" placeholder="输入高度"></ht-input>
        </ht-form-item>
         <ht-form-item label="是否支持刷新" v-if="column.colType!=1 || column.chartType!=2" label-width="100px">
          <ht-radio
            v-model="column.supportRefesh"
            :options="[{ key: 0, value: '否'}, { key: 1, value: '是'}]"
          />
        </ht-form-item>
         <ht-form-item label="刷新时间" v-if="column.colType!=1 || column.chartType!=2" label-width="100px">
          <ht-input v-model="column.refeshTime" type="number" placeholder="请输入数字"></ht-input>
        </ht-form-item>
         <ht-form-item label="首页分页" v-if="column.colType!=1 || column.chartType!=2" label-width="100px">
           <ht-radio
            v-model="column.needPage"
            :options="[{ key: 0, value: '不分页'}, { key: 1, value: '分页'}]"
          />
        </ht-form-item>
         <ht-form-item label="描述" label-width="100px">
          <ht-input v-model="column.memo"></ht-input>
        </ht-form-item>
         <ht-form-item label="栏目模版" v-if="column.colType!=1 || column.chartType!=2" label-width="100px">
             <ht-input 
            type="textarea" 
            :cols="100"
            :autosize="{minRows: 3}"
            v-model="column.templateHtml2" 
            :validate="{'required':true}"
            placeholder="请输入模板代码" 
            />
        </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
          request-method="POST"
          :url="saveUrl"
          :model="column"
          :is-submit="isSubmit"
          scope-name="editForm"
          @before-save-data="beforeSaveData"
          @after-save-data="afterSaveData"
        >{{$t('eip.common.save')}}</ht-submit-button>
        <el-button @click="handleClose">{{$t('eip.common.cancel')}}</el-button>
      </div>
    </ht-sidebar-dialog>
    <ht-load-data :url="loadDataUrl" context="portal" @after-load-data="afterLoadData"></ht-load-data>
    <index-column-setparam ref="indexColumnSetparam" :set-params='column.dataParam' @handleDataparamSave="handledataParamSave"></index-column-setparam>
  </div>
</template>
<script>
import portal from "@/api/portal.js";
import sysType from "@/api/sysType.js";
import utils from "@/hotent-ui-util.js";
const IndexColumnSetparam = () => import("@/components/portal/IndexColumnSetparam.vue");
const EipChartSelector = () => import("@/components/selector/EipChartSelector.vue");
const EipSysTypeSelector = () => import("@/components/selector/EipSysTypeSelector.vue");
let Base64 = require('js-base64').Base64;
export default {
    components:{IndexColumnSetparam,EipChartSelector,EipSysTypeSelector},
    props:{
      isPublic:{type:String,default:'0'}
    },
    data() {
    return {
      sidebarTitle:'',
      dialogVisible: false,
      column:{},
      blankObj: {
        name: "",
        alias:"",
        memo: "",
        catalog: "",
        catalogName:"",
        colType: "",
        dataMode: "",
        dataFrom: "",
        dataParam: "",
        dsAlias: "",
        colHeight: "",
        colUrl: "",
        templateHtml: "",
        isPublic: 0,
        supportRefesh: "",
        refeshTime: "",
        showEffect: "",
        memo: "",
        requestType: "",
        needPage:0,
        templateHtml2:""
      },
      isSubmit: true,
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      loadDataUrl: ""
    };
  },
  mounted() {
    this.$validator = this.$root.$validator;
  },
  computed: {
    defaultQuerys:function(){
      return [{property: 'is_public', value: this.isPublic, operation: 'EQUAL'}]
    },
    deleteUrl: function() {
      return (
        window.context.portal + "/portal/sysIndexColumn/sysIndexColumn/v1/remove"
      );
    },
    saveUrl: function() {
      return (
        window.context.portal + "/portal/sysIndexColumn/sysIndexColumn/v1/save"
      );
    } 
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
      this.loadDataUrl="";
    },
    afterLoadData(data) {
      if (this.dialogVisible) {
        this.column = {...this.blankObj, ...data};
        this.column.templateHtml2=Base64.decode(this.column.templateHtml);
        setTimeout(() => this.$validator.validateAll("editForm"));
      }
    },
    showDialog(row) {
      this.dialogVisible = true;
      if (row) {
        this.loadDataUrl = `/portal/sysIndexColumn/sysIndexColumn/v1/getJson?id=${row.id}`;
      }
    },
    loadData(param, cb) {
      portal.getIndexColumnPage(param)
        .then(response => {
          this.data = response.rows;
          this.pageResult = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total
          };
        })
        .finally(() => cb&&cb());
    },
    handleCommand(params) {
      switch (params.command) {
        case "edit":
          this.sidebarTitle = "编辑栏目";
          this.showDialog(params.row);
          break;
        case "add":
          this.column = this.blankObj;
          this.sidebarTitle = "添加栏目";
          this.showDialog();
          break;
      }
    },
    async beforeSaveData() {
      this.column.templateHtml = Base64.encode(this.column.templateHtml2);
      this.isSubmit = true;
    },
    afterSaveData() {
      this.dialogVisible = false;
      this.$refs.columnTable.load();
    },
    showSetParamDialog(){
      this.$refs.indexColumnSetparam.showDialog();
    },
    handledataParamSave(val){
      this.column.dataParam = val;
    },
    selectQuery(){

    },
    selectedChart(data){
        this.column.dataParam = data;
    }
  }
};
</script>
<style scoped>
div[aria-invalid="true"] >>> .el-input__inner,
div[aria-invalid="true"] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
.el-select .el-input {
    width: 400px;
  }
</style>