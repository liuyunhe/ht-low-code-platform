<template>
  <div class="fullheight">
    <ht-table
        @load="loadData"
        :data="data"
        :pageResult="pageResult"
        ref="htTable"
        :show-export="false"
        :show-custom-column="false"
        highlight-current-row
        quick-search-props="name">
      <template v-slot:toolbar>
        <el-button size="small" @click="edit()" icon="el-icon-plus">添加</el-button>
        <ht-delete-button
            :url="deleteUrl"
            :htTable="$refs.htTable"
            pk="id"
            style="margin:0;"
            parameter="ids">删除</ht-delete-button>
      </template>
      <ht-table-column type="index" width="50" align="center" label="序号" />
      <ht-table-column prop="name" align="center" label="名称">
        <template v-slot="{ row }">
          <el-link
              type="primary"
              @click="edit(row.id)"
              title="点击编辑"
          >{{row.name}}</el-link>
        </template>
      </ht-table-column>
      <ht-table-column prop="type" align="center" label="类型" :filters="typeArray">
        <template v-slot="{ row }">
          <el-tag v-if="row.type===1" type="success">文字</el-tag>
          <el-tag v-if="row.type===2">图片</el-tag>
        </template>
      </ht-table-column>
      <ht-table-column prop="content" align="center" label="内容">
        <template v-slot="{ row }">
          <div :style="{ color: row.color}" v-if="row.type===1">{{row.content}}</div>
          <el-avatar :size="30" :src="row.content" v-else/>
        </template>
      </ht-table-column>
      <ht-table-column label="操作" align="center">
        <template v-slot="{row}" width="100">
          <el-button @click="setType(row)">设置分类</el-button>
          <el-button @click="setProcess(row)">设置流程</el-button>
        </template>
      </ht-table-column>
    </ht-table>

    <ht-sidebar-dialog
        width="28%"
        :title="title"
        :visible.sync="dialogVisible"
        :before-close="handleClose">
      <el-form data-vv-scope="editForm">
        <ht-form-item label="名称">
          <ht-input
              v-model="watermark.name"
              validate="required"
              :maxlength="30"/>
        </ht-form-item>
        <ht-form-item label="类型">
          <ht-select
            v-model="watermark.type"
            validate="required"
            :options="[{key: 1, value: '文字'},{key: 2, value: '图片'}]"/>
        </ht-form-item>
        <ht-form-item label="内容">
          <ht-input
              v-model="watermark.content"
              validate="required"
              :maxlength="100"
              v-if="watermark.type===1"/>
          <template v-else>
            <el-avatar :size="50" :src="watermark.content"/><br>
            <el-upload
                action="string"
                :http-request="updateImage"
                :show-file-list="false"
                :before-upload="beforeUpload"
            >
              <el-button size="mini">上传</el-button>
            </el-upload>
          </template>

        </ht-form-item>
        <ht-form-item label="颜色" v-if="watermark.type===1">
          <div style="display: flex">
            <div :style="{ color: watermark.color, width: '100'}" class="color-item">{{ watermark.content }}</div>
            <el-color-picker v-model="watermark.color" show-alpha/>
          </div>
        </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
            :url="saveUrl"
            :model="watermark"
            scope-name="editForm"
            :isSubmit="isSubmit"
            @before-save-data="beforeSaveData"
            @after-save-data="afterSaveData">保 存</ht-submit-button>
        <el-button @click="handleClose">取 消</el-button>
      </div>
    </ht-sidebar-dialog>

    <watermark-type-dialog ref="watermarkTypeDialog" :id="selectRow.id"/>
    <watermark-set-process-dialog ref="watermarkSetProcessDialog" :id="selectRow.id"/>
  </div>

</template>

<script>
  import flow from "@/api/flow.js";
  import uc from "@/api/uc.js";
  const watermarkTypeDialog = () => import("@/components/flow/WatermarkTypeDialog.vue");
  const watermarkSetProcessDialog = () => import("@/components/flow/WatermarkSetProcessDialog");
  export default {
    name: "watermark-manager",
    components: {
      watermarkTypeDialog,
      watermarkSetProcessDialog
    },
    data() {
      return {
        data: [],
        pageResult: {
          page: 1,
          pageSize: 20,
          total: 0
        },
        deleteUrl: window.context.bpmModel + "/bpmModel/bpmWatermark/v1/remove",
        saveUrl: window.context.bpmModel + "/bpmModel/bpmWatermark/v1/save",
        dialogVisible: false,
        typeDialogVisible: false,
        title: "",
        watermark: {
          name: "",
          type: 1,
          content: "",
          color: "rgba(255, 69, 0, 0.68)"
        },
        typeArray: [
          { text: "文字", value: 1},
          { text: "图片", value: 2 }
        ],
        selectRow: {},
        isSubmit: true
      }
    },
    methods: {
      loadData(param, cb){
        flow.getWatermarkList(param).then(data => {
          this.data = data.rows;
          this.pageResult = {
            page: data.page,
            pageSize: data.pageSize,
            total: data.total
          }
        }).finally(() => {
          cb && cb();
        })
      },
      edit(id){
        this.dialogVisible = true;
        if (id){
          this.title = "编辑流程水印";
          flow.getWatermark(id).then(data => {
            this.watermark = data;
          });
        }else {
          this.title = "添加流程水印";
          this.watermark = {
            name: "",
            type: 1,
            content: "",
            color: "rgba(255, 69, 0, 0.68)"
          }
        }
      },
      handleClose(){
        this.dialogVisible = false;
        this.typeDialogVisible = false;
      },
      beforeSaveData(){
        this.isSubmit = true;
        if (this.watermark.type == 2 ){
          if (!this.watermark.content || this.watermark.content == undefined){
            this.$message.error("请上传图片");
            this.isSubmit = false;
          }
        }
      },
      afterSaveData(){
        this.dialogVisible = false;
        this.$refs.htTable.load();
      },
      setType(row){
        this.selectRow = {...row};
        this.$refs.watermarkTypeDialog.showDialog();
      },
      setProcess(row){
        this.selectRow = {...row};
        this.$refs.watermarkSetProcessDialog.showDialog();
      },
      updateImage(param){
        const formData = new FormData();
        formData.append("files", param.file);
        uc.fileUpload(formData)
          .then(response => {
            this.$store.dispatch("menu/downloadImg", response.fileId).then(res => {
              if (res != "") {
                this.$set(this.watermark,"content",res);
                param.onSuccess(); // 上传成功的图片会显示绿色的对勾
              }
            }).catch(() => {
              param.onError();
            });
          })
          .catch(() => {
            param.onError();
          });
      },
      beforeUpload(file){
        var fileType=file.name.substring(file.name.lastIndexOf('.')+1)
        if (fileType!="jpg" && fileType!="png"){
          this.$message.warning("只能上传jpg/png格式的文件");
          return false;
        }else {
          return true;
        }
      }
    }
  }
</script>

<style scoped>
.color-item{
  font-size: 14px;
  padding-right:6px;
}
</style>
