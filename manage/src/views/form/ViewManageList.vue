<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      @row-click="rowClick"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      quick-search-props="desc,viewName"
      :show-export="false"
      :show-custom-column="false"
      ref="htTable"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="edit()" icon="el-icon-plus">添加</el-button>
          <el-button size="small" @click="importDialogVisible = true;" icon="el-icon-back">导入</el-button>
          <el-button size="small" @click="handleExport" icon="el-icon-right">导出</el-button>
          <ht-delete-button :url="deleteUrl" :htTable="$refs.htTable" style="margin:0;">删除</ht-delete-button>
        </el-button-group>
      </template>
      <ht-table-column type="index" width="50" align="center" label="序号" />
      <ht-table-column prop="desc" label="描述">
        <template slot-scope="scope">
          <el-link type="primary" @click="edit(scope.row.id)" title="查看详情">{{scope.row.desc}}</el-link>
        </template>
      </ht-table-column>
      <ht-table-column prop="viewName" label="视图名称" :sortable="true" />
      <ht-table-column prop="dsAlias" label="数据源别名" :sortable="true" />
      <ht-table-column prop="sql" label="SQL语句" />
      <ht-table-column prop="status" label="状态" >
        <template slot-scope="scope">
          <el-tag type="info" v-if="scope.row.status === 0">未生成视图</el-tag>
          <el-tag type="priamry" v-if="scope.row.status === 1">已生成视图</el-tag>
        </template>
      </ht-table-column>
      <ht-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button @click="createPhysicalView(scope.row.id)" icon="el-icon-view">生成视图</el-button>
        </template>
      </ht-table-column>
    </ht-table>

     <ht-sidebar-dialog
      width="28%"
      :title="(model.id? '编辑':'添加')+'视图'"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
    >
      <el-form v-model="model" data-vv-scope="editModelForm" >
        <ht-form-item label="描述" label-width="120px">
          <ht-input
            v-model="model.desc"
            autocomplete="off"
            :validate="{required:true}"
            placeholder="请输入描述"
            :maxlength="50"
            :showWordLimit="true"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="视图名称" label-width="120px">
          <ht-input
            v-model="model.viewName"
            autocomplete="off"
            :disabled="model.id? true:false"
            :validate="viewNameValidate"
            placeholder="请输入视图名称"
            :maxlength="50"
            :showWordLimit="true"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="数据源" label-width="120px">
          <ht-select
              v-model="model.dsAlias"
              :options="dataSources"
              :disabled="model.id? true:false"
              :props="{key:'alias',value:'name'}"
              :validate="{required:true}"
              @change="dsChange"
            />
        </ht-form-item>
        <ht-form-item label="sql语句">
          <el-tooltip class="item" effect="dark" :content="content" placement="top-start">
            <i class="el-icon-question"/>
          </el-tooltip>
            <ht-input
              type="textarea"
              v-model="model.sql"
              :autosize="{ minRows: 10, maxRows: 10}"
              :validate="{required:true, regex:{exp:'^[^;]*$', message:'请不要以;结尾'}}"
              @change="handleSqlChange"
            />
            &nbsp;&nbsp;<el-button type="primary" @click="checkSql" >验证SQL</el-button>
          </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
          url="/form/viewManage/v1/save/0"
          context="form"
          :model="model"
          scope-name="editModelForm"
          :is-submit="checkState"
          @before-save-data="beforeSaveData"
          @after-save-data="afterSaveData"
        >{{$t('eip.common.save')}}</ht-submit-button>
        <ht-submit-button
          url="/form/viewManage/v1/save/1"
          context="form"
          :model="model"
          scope-name="editModelForm"
          :is-submit="checkState"
          @before-save-data="beforeSaveData"
          @after-save-data="afterSaveData"
        >保存并生成视图</ht-submit-button>
        <el-button @click="handleClose()">{{$t('eip.common.cancel')}}</el-button>
      </div>
    </ht-sidebar-dialog>
    <ht-load-data
      :url="loadDataUrl"
      context="form"
      @after-load-data="afterLoadData"
    ></ht-load-data>
    <el-dialog
        title="导入视图"
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
          <el-button size="small" icon="el-icon-upload">选择视图</el-button>
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
import form from "@/api/form.js";
import req from "@/request";
import { mapState } from "vuex";

export default {
  data() {
    return {
      data: [],
      pageResult: {
        page: 0,
        pageSize: 50,
        total: 0
      },
      selectedId: "",
      deleteUrl: window.context.form + "/form/viewManage/v1/remove",
      dialogVisible: false,
      loadDataUrl: "",
      model:{},
      dataSources: [],
      isChecked:false,
      content: "请输入符合生成视图的SQL，如联表查询时存在重复字段将会导致验证通过但最后保存并生成视图时出错！",
      checkState: false,
      importDialogVisible: false,
      uploadUrl: window.context.form + "/form/viewManage/v1/import",
      fullscreenLoading: false,
      viewNameValidate: {required:true,alpha_dash:true,regex:{exp:'^[a-zA-Z][a-zA-Z0-9_]*$', message:'只能输入字母、数字、下划线，且以字母开头' }}
    };
  },
  computed: mapState({
    uploadHeaders: function(mapState) {
      return { Authorization: "Bearer " + mapState.login.currentUser.token };
    },
  }),
  mounted() {
    form.getDataSource().then(resp => {
      this.dataSources = resp.data;
    });
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    checkSql() {
      if (!this.model.sql) {
        this.$message({ type: "warning", message: "请输入sql语句" });
        return;
      }
      if (!this.model.dsAlias) {
        this.$message({ type: "warning", message: "请选择数据源" });
        return;
      }
      if (this.model.sql.endsWith(";")) {
        this.$message({ type: "warning", message: "请不要以;结尾" });
        return;
      }
      let param = { sql: this.model.sql, dsName: this.model.dsAlias };
      form.checkSql(param).then(response => {
        if (response.state) {
          this.$message({ type: "success", message: response.message });
          this.checkState = response.state;
        }
      })
    },
    loadData(param, cb) {
      form
        .getViewManageList(param)
        .then(response => {
          this.data = response.rows;
          this.pageResult = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total
          };
        })
        .finally(() => {
          cb();
        });
    },
    edit(id) {
      this.dialogVisible = true;
      if(id){
        this.loadDataUrl = `/form/viewManage/v1/getJson?id=${id}`;
      }else{
        this.model = {};
        this.loadDataUrl="";
      }
    },
    afterLoadData(data){
      this.model=data;
    },
    beforeSaveData(){
      if(!this.checkState){
        this.$message({type: "warning", message: "请先验证SQL！"})
      }
    },
    afterSaveData() {
      this.dialogVisible = false;
      this.checkState = false;
      this.$refs.htTable.load();
    },
    handleClose(){
      this.dialogVisible = false;
    },
    createPhysicalView(id){
      form.createPhysicalViewByViewMngId(id).then(response => {
        if (response.state) {
          this.$message({ type: "success", message: response.message });
          this.$refs.htTable.load();
        }
      })
    },
    handleExport() {
      let selection = this.$refs.htTable.$refs.htTable.selection;
      if (selection && selection.length === 0) {
        this.$message.warning("请选择至少一项记录");
        return;
      }
      let ids = selection.map(item => item.id);
      let url = `${window.context.form}/form/viewManage/v1/exportXml?ids=${ids}`;
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
      this.$refs.htTable.querys = [];
      this.$refs.htTable.load();
      this.importDialogVisible = false;
      this.fullscreenLoading = false;
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
        this.$message.warning("请选择要导入的视图!");
        return false;
      }
      this.$refs.upload.submit();
    },
    dsChange(dsAlias,dataSource){
      if(!dsAlias || (dataSource.dbType !== 'oracle' && dataSource.dbType !== 'dm' && dataSource.dbType !== 'dm8')){
        this.viewNameValidate =  {required:true,alpha_dash:true,regex:{exp:'^[a-zA-Z][a-zA-Z0-9_]*$', message:'只能输入字母、数字、下划线，且以字母开头' }}
      }else{
        this.viewNameValidate =  {required:true,alpha_dash:true,regex:{exp:'^[A-Z][A-Z0-9_]*$', message:'只能输入大写字母、数字、下划线，且以大写字母开头' }}
      }
    },
    handleSqlChange(){
      this.checkState = false;
    }
  }
};
</script>

<style scoped>
</style>
