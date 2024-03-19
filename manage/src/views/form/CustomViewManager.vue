<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      @row-click="rowClick"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      quick-search-props="name,alias"
      :show-export="false"
      :show-custom-column="false"
      ref="table"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="edit()" icon="el-icon-plus">添加</el-button>
<!--          <el-button size="small" @click="dialogVisible = true" icon="el-icon-download">导入</el-button>-->
<!--          <el-button size="small" @click="handleExport" icon="el-icon-upload2">导出</el-button>-->
          <ht-delete-button :url="deleteUrl" :htTable="$refs.table" style="margin:0;">删除</ht-delete-button>
        </el-button-group>
      </template>
      <ht-table-column type="index" width="50" align="center" label="序号" />
      <ht-table-column prop="name" label="名称">
        <template slot-scope="scope">
          <el-link type="primary" @click="edit(scope.row.id)" title="查看详情">{{scope.row.name}}</el-link>
        </template>
      </ht-table-column>
      <ht-table-column prop="alias" label="别名" :sortable="true" />
      <ht-table-column prop="dsName" label="数据源" :sortable="true" />
      <ht-table-column prop="sql" label="SQL语句" />
      <ht-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button @click="jumpToViewList(scope.row.alias)" icon="el-icon-view">视图列表</el-button>
        </template>
      </ht-table-column>
    </ht-table>
    <custom-view-edit :id="selectedId" ref="customChartEdit" @after-save="afterSave" @beforeClose="editBeforeClose"/>
    <el-dialog title="上传文件" :visible="dialogVisible" :before-close="beforeClose" width="40%" top="30vh"  name="uploadDialog" custom-class="upload-dialog">
      <el-upload :action="uploadUrl" :http-request="handleImport" accept=".zip" :file-list="fileList" :limit="1" 
                :auto-upload="false" ref="elUpload" class="upload-dialog__content">
        <el-button size="small" icon="el-icon-upload">点击上传</el-button>
        <div slot="tip" class="el-upload__tip">只能上传zip文件</div>
      </el-upload>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="uploadSubmit" >上传</el-button>
        <el-button type="default" @click="beforeClose">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import form from "@/api/form.js";
import req from "@/request.js";
const customViewEdit = () => import("@/components/form/customView/CustomViewEdit.vue");
export default {
  components: {
    customViewEdit
  },
  data() {
    return {
      data: [],
      pageResult: {
        page: 0,
        pageSize: 50,
        total: 0
      },
      selectedId: "",
      deleteUrl: window.context.form + "/form/query/querySqldef/remove",
      dialogVisible: false,
      file: {},
      uploadUrl: window.context.form + "/form/query/querySqldef/import",
      fileList: []
    };
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.table.$refs.htTable.toggleRowSelection(row);
    },
    loadData(param, cb) {
      form
        .getCustomViewList(param)
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
      this.$refs.customChartEdit.handleOpen();
      if (id) {
        this.selectedId = id;
      } else {
        this.selectedId = "";
      }
    },
    jumpToViewList(alias) {
      this.$router.push({
        path: "/reportManager/viewList",
        query: { alias: alias }
      });
    },
    afterSave() {
      this.$refs.table.load();
    },
    handleExport() {
      let formIds = this.getSelectKeys("id");
      if (!formIds) {
        this.$message({ message: "请选择至少一项记录", type: "warning" });
        return;
      }
      let url = `${window.context.form}/form/query/querySqldef/export?ids=${formIds}`;
      req.download(url);
    },
    handleImport(param) {
      let formData = new FormData();
      formData.append("file", param.file);
      form.importCustomSql(formData).then(data => {
        if (data.state) {
          this.$message({ type: "success", message: data.message });
          param.onSuccess();
          this.loadData();
          this.dialogVisible = false;
          this.fileList = [];
        } else {
          param.onError();
        }
      });
    },
    getSelectKeys(key) {
      if (!this.$refs.table.$refs.htTable.selection) {
        this.$message("请选择的数据!");
        return;
      }
      let ids = [];
      for (
        let i = 0;
        i < this.$refs.table.$refs.htTable.selection.length;
        i++
      ) {
        ids.push(this.$refs.table.$refs.htTable.selection[i][key]);
      }
      return ids.join(",");
    },
    beforeClose() {
      this.dialogVisible = false;
    },
    editBeforeClose(){
      this.$refs.table.load();
    },
    uploadSubmit(){
      if(this.$refs.elUpload.uploadFiles.length == 0){
        this.$message({type:"warning",message:"请上传文件"});
      }
      this.$refs.elUpload.submit();
    }
  }
};
</script>

<style lang="scss" scoped>
  @media (max-width: 1024px){
    /deep/ .search-container__col{
      flex-wrap: wrap;
      .el-button-group{
        margin-top: 10px;
      }
  }
}
/deep/ .el-dialog.upload-dialog{
 .upload-dialog__content{
   height: 150px;
 }
}
</style>
