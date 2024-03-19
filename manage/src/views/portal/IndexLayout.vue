<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      quick-search-props="name,memo"
      ref="layoutTable"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="handleCommand({command:'add'})" icon="el-icon-plus">添加</el-button>
          <ht-delete-button :url="deleteUrl" :htTable="$refs.layoutTable">删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="id" label="主键" :sortable="true" hidden />
        <ht-table-column
          prop="name"
          label="布局名称"
          width="300"
          :sortable="true"
          :show-overflow-tooltip="true"
        />
        <ht-table-column prop="memo" label="布局描述" :sortable="true" />
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
                <el-dropdown-item icon="el-icon-menu" :command="{row:row,command:'design'}">设计</el-dropdown-item>
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
      <el-form v-model="layout" data-vv-scope="editForm">
        <ht-form-item label="布局名称" prop="name" label-width="100px">
          <ht-input
            v-model="layout.name"
            autocomplete="off"
            :validate="{required:true}"
            placeholder="请输入名称"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="排序" prop="code" label-width="100px">
          <ht-input
            type="number"
            :min="1"
            v-model="layout.sn"
            autocomplete="off"
            :validate="{required:true,alpha_num:true}"
            placeholder="请输入排序"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="描述" label-width="100px">
          <ht-input
            v-model="layout.memo"
            autocomplete="off"
            placeholder="请输入描述信息"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="模板" label-width="100px">
          <ht-input 
            type="textarea" 
            :cols="80"
            :autosize="{minRows: 6}"
            v-model="layout.templateHtml2" 
            :validate="{'required':true}"
            placeholder="请输入模板代码" 
            />
        </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
          request-method="POST"
          :url="saveUrl"
          :model="layout"
          :is-submit="isSubmit"
          scope-name="editForm"
          @before-save-data="beforeSaveData"
          @after-save-data="afterSaveData"
        >{{$t('eip.common.save')}}</ht-submit-button>
        <el-button @click="handleClose">{{$t('eip.common.cancel')}}</el-button>
      </div>
    </ht-sidebar-dialog>
    <ht-load-data :url="loadDataUrl" context="portal" @after-load-data="afterLoadData"></ht-load-data>

    <el-dialog
      class="form-editor-dialog"
      fullscreen
      destroy-on-close
      :visible="designShow"
      :before-close="() => designShow=false"
    >
    </el-dialog>
  </div>
</template>
<script>
import portal from "@/api/portal.js";
import utils from "@/hotent-ui-util.js";
let Base64 = require('js-base64').Base64;
export default {
    data() {
    return {
      designShow:false,
      sidebarTitle:'',
      dialogVisible: false,
      layout: {
        name: "",
        memo: "",
        templateHtml:"",
        templateHtml2:""
      },
      isSubmit: true,
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      loadDataUrl: "",
      menuPerm: {},
      allowRoles: []
    };
  },
  mounted() {
    this.$validator = this.$root.$validator;
  },
  computed: {
    deleteUrl: function() {
      return (
        window.context.portal + "/portal/sysIndexLayout/sysIndexLayout/v1/remove"
      );
    },
    saveUrl: function() {
      return (
        window.context.portal + "/portal/sysIndexLayout/sysIndexLayout/v1/save"
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
        this.layout = {...this.layout, ...data};
        this.layout.templateHtml2=Base64.decode(this.layout.templateHtml);

        setTimeout(() => this.$validator.validateAll("editForm"));
      }
    },
    showDialog(row) {
      this.dialogVisible = true;
      if (row) {
        this.loadDataUrl = `/portal/sysIndexLayout/sysIndexLayout/v1/getJson?id=${row.id}`;
      }
    },
    loadData(param, cb) {
      portal.getIndexLayoutPage(param)
        .then(response => {
          this.data = response.rows;
          this.pageResult = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total
          };
        })
        .finally(() => cb());
    },
    handleCommand(params) {
      switch (params.command) {
        case "edit":
          this.designShow = true;
          break;
          this.sidebarTitle = "编辑布局";
          this.showDialog(params.row);
          break;
        case "add":
           this.layout= {
                name: "",
                memo: "",
                sn:"",
                templateHtml:"",
                templateHtml2:""
                },
          this.sidebarTitle = "添加布局";
          this.showDialog();
          break;
        case "design":
          this.designShow = true;
          break;
      }
    },
    async beforeSaveData() {
      this.layout.templateHtml = Base64.encode(this.layout.templateHtml2);
      this.isSubmit = true;
    },
    afterSaveData() {
      this.dialogVisible = false;
      this.$refs.layoutTable.load();
    }
  }
};
</script>
<style scoped>
div[aria-invalid="true"] >>> .el-input__inner,
div[aria-invalid="true"] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
.form-editor-dialog >>> .el-dialog__header {
  display: none;
}

.form-editor-dialog >>> .el-dialog__body {
  padding: 0;
  height: 100%;
}
</style>