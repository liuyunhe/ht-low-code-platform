<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      quick-search-props="name"
      :show-export="false"
      :show-custom-column="false"
      ref="htTable"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="showDialog()" icon="el-icon-plus">添加</el-button>
          <ht-delete-button url="${portal}/portalAppParam/v1/" :htTable="$refs.htTable">删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <!--<ht-table-column
          prop="id"
          label="ID"
          :sortable="true"
          :show-overflow-tooltip="true"
        >
          <template v-slot="{row}">
            <el-link
              type="primary"
              @click="showDialog(row)"
              title="查看详情"
            >{{row.id}}</el-link>
          </template>
        </ht-table-column>-->
        <ht-table-column
          prop="name"
          label="参数名称"
          :sortable="true"
          :show-overflow-tooltip="true"
        >
          <template v-slot="{row}">
            <el-link
              type="primary"
              @click="showDialog(row)"
              title="查看详情"
            >{{row.name}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column
          prop="alias"
          label="参数编码"
          :sortable="true"
          :show-overflow-tooltip="true"
        >
        </ht-table-column>
        <ht-table-column
          label="控件类型"
          :show-overflow-tooltip="true"
        ><template slot-scope="scope">
          <el-tag type="primary" v-if="scope.row.controlType=='textarea'">手动输入</el-tag>
          <el-tag type="success" v-if="scope.row.controlType=='date'">日期</el-tag>
          <el-tag type="success" v-if="scope.row.controlType=='dateTime'">日期时间</el-tag>
          <el-tag type="primary" v-if="scope.row.controlType=='number'">数字</el-tag>
          <el-tag type="info" v-if="scope.row.controlType=='attachment'">附件上传</el-tag>
          <el-tag type="warning" v-if="scope.row.controlType=='richText'">富文本</el-tag>
        </template>
        </ht-table-column>
        <ht-table-column
          prop="value"
          label="参数内容"
          :show-overflow-tooltip="true"
        >
        </ht-table-column>
      </template>
    </ht-table>
    <el-dialog
      width="70%"
      title="应用参数"
      class="sp-manager__dialog"
      :visible="dialogVisible"
      :before-close="beforeCloseDialog"
      :append-to-body="true"
    >
      <el-form v-form data-vv-scope="PortalAppParamForm">
        <ht-form-item label="应用ID">
          <ht-input v-model="PortalAppParam.appId" validate="required" :disabled="true"></ht-input>
        </ht-form-item>
        <ht-form-item label="参数名称">
          <ht-input v-model="PortalAppParam.name" validate="required" @change="getAlias" />
        </ht-form-item>
        <ht-form-item label="参数编码">
          <ht-input v-model="PortalAppParam.alias" validate="required" />
        </ht-form-item>
        <ht-form-item label="控件类型">
          <!--<ht-input v-model="PortalAppParam.controlType" validate="required" />-->
          <ht-select
                  v-model="PortalAppParam.controlType"
                  :options="controlTypeOptions"
                  validate="required"
                  :props="{ key: 'value', value: 'label' }"></ht-select>
        </ht-form-item>
        <ht-form-item label="参数内容" v-if="PortalAppParam.controlType">
          <ht-input type="textarea"
                    v-model="PortalAppParam.value"
                    v-if="PortalAppParam.controlType == 'textarea'"/>
          <ht-input type="number"
                    v-model="PortalAppParam.value"
                    v-if="PortalAppParam.controlType == 'number'"></ht-input>
          <ht-date v-model="PortalAppParam.value"
                   v-if="PortalAppParam.controlType == 'date'"
                   format="yyyy-MM-dd"></ht-date>
          <ht-date v-model="PortalAppParam.value"
                   v-if="PortalAppParam.controlType == 'dateTime'"
                   format="yyyy-MM-dd HH:mm:ss"></ht-date>
          <FileUpload v-model="PortalAppParam.value"
                      v-if="PortalAppParam.controlType == 'attachment'"
                      :accept="`.jpg,.jpeg,.png,.bmp,.pdf,.JPG,.JPEG,.PNG,.BMP,.PDF,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.rtf,.txt,.zip,.rar,.vsd,.dwg`"
                      ref="uploadFile">
          </FileUpload>
          <ht-editor v-model="PortalAppParam.value"
                     v-if="PortalAppParam.controlType == 'richText'"
                     model-name="PortalAppParam.value"></ht-editor>
        </ht-form-item>
      </el-form>
      <div slot="footer" style="text-align: center">
        <ht-submit-button
          url="${portal}/portalAppParam/v1/"
          :model="PortalAppParam"
          :request-method="saveMethod"
          scope-name="PortalAppParamForm"
          @after-save-data="afterSaveData"
        >{{$t("eip.common.save")}}</ht-submit-button>
        <el-button @click="beforeCloseDialog">{{$t("eip.common.cancel")}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import req from "@/request.js";
const HtEditor = () => import("@/components/common/HtEditor.vue");
const FileUpload = () => import("@/components/common/FileUpload.vue");
export default {
  props:["appId"],
  components: {
    HtEditor,
    FileUpload
  },
  data() {
    return {
      dialogVisible: false,
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      PortalAppParam: {},
      saveMethod: "POST",
      controlTypeOptions: [
              { label: '手动输入', value:'textarea'},
              { label: '日期', value: 'date'},
              { label: '日期时间', value:'dateTime'},
              { label: '数字', value: 'number'},
              { label: '附件上传', value: 'attachment'},
              { label: '富文本', value: 'richText'}],
      uploadUrl:window.context.portal + "/system/file/v1/upload",
      fileList:[],
    };
  },
  mounted() {
    this.$validator = this.$root.$validator;
  },
  watch: {
    appId: {
      handler : function(newVal,oldVal){
        if(newVal != oldVal){
          this.$refs.htTable.load();
        }
      }
    }
  },
  computed:{
    header: function(){
      if (this.$store.state.login && this.$store.state.login.currentUser) {
        return { Authorization: "Bearer  "+this.$store.state.login.currentUser.token};
      }
      return {};
    }
  },
  methods: {
    showDialog(row) {
      if (row) {
        this.PortalAppParam.appId = row.appId;
        let id = row.id;
        this.saveMethod = "PUT";
        this.$http.get("${portal}/portalAppParam/v1/" + id).then(
          resp => {
            this.PortalAppParam = resp.data;
            this.dialogVisible = true;
            let _this = this;
            setTimeout(function(){
              if(_this.PortalAppParam.controlType == 'attachment' && _this.PortalAppParam.value){
                _this.$refs.uploadFile.setFiles(JSON.parse(_this.PortalAppParam.value));
              }
            })
          },
          error => {
            reject(error);
          }
        );
      } else {
        this.PortalAppParam.appId = this.appId;
        this.saveMethod = "POST";
        this.dialogVisible = true;
      }
    },
    beforeCloseDialog() {
      this.PortalAppParam = {};
      this.dialogVisible = false;
      if(this.$refs.uploadFile){
        this.$refs.uploadFile.clearFiles();
      }
    },
    loadData(param, cb) {
      let querys = [{
        property:"APP_ID_",value:this.appId,operation:"EQUAL",relation:"AND",group:"main"
      }];
      if(!param){
        param = {};
        param.querys = querys;
      }else{
        if(param.querys){
          param.querys.push(querys[0]);
        }else{
          param.querys = querys;
        }
      }
      this.$http
        .post("${portal}/portalAppParam/v1/query", param)
        .then(
          resp => {
            let response = resp.data;
            this.data = response.rows;
            this.pageResult = {
              page: response.page,
              pageSize: response.pageSize,
              total: response.total
            };
          },
          error => {
            reject(error);
          }
        )
        .finally(() => cb());
    },
    afterSaveData() {
      setTimeout(() => {
        this.beforeCloseDialog();
        this.$refs.htTable.load();
      }, 500);
    },
    getAlias(){
      let name = this.PortalAppParam.name;
      req.get("${uc}/base/tools/v1/getPinyin?chinese="+name+"&type=0").then(resp=>{
        //this.PortalAppParam.alias = resp.data.value;
        this.$set(this.PortalAppParam,'alias',resp.data.value);
      })
    },
    onSuccess(param){
      this.PortalAppParam.value = JSON.stringify(param);
    },

  }
};
</script>

<style lang="scss" scoped>
.sp-manager__dialog /deep/ > .el-dialog > .el-dialog__body {
  height: calc(100% - 170px);
}
</style>
