<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      quick-search-props="name,flowKey,flowName,desc"
      :show-export="false"
      :show-custom-column="false"
      ref="htTable"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="showDialog()" icon="el-icon-plus">添加</el-button>
          <ht-delete-button url="${portal}/system/flowUploadProperties/v1/remove" :htTable="$refs.htTable" style="margin:0;">删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="name" label="名称" :sortable="true" :show-overflow-tooltip="true">
          <template v-slot="{row}">
            <el-link type="primary" @click="showDialog(row.id)" title="查看详情">{{row.name}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column prop="flowName" label="流程名称" :sortable="true" :show-overflow-tooltip="true">
          <template v-slot="{row}">
            {{getShowName(row.flowName)}}
          </template>
        </ht-table-column>
        <ht-table-column
          prop="uploadType"
          label="存储类型"
          width="150"
          :filters="[
            { text: '磁盘', value: 'folder' },
            { text: '数据库', value: 'database' },
            { text: 'FTP服务器', value: 'ftp' },
            { text: '阿里云OSS', value: 'aliyunOss' }
          ]"
        >
          <template v-slot="{ row }">
            <el-tag type="info" v-if="row.uploadType == 'folder'"
              >磁盘</el-tag
            >
            <el-tag type="success" v-if="row.uploadType == 'database'"
              >数据库</el-tag
            >
            <el-tag type="warning" v-if="row.uploadType == 'ftp'"
              >FTP服务器</el-tag
            >
            <el-tag type="warning" v-if="row.uploadType == 'aliyunOss'"
            >阿里云OSS</el-tag
            >
          </template>
        </ht-table-column>
        <ht-table-column width="120" prop="location" label="存储位置" :sortable="true" :show-overflow-tooltip="true">
        </ht-table-column>
        <ht-table-column width="180" prop="ftpUrl" label="FTP上传地址" :sortable="true" :show-overflow-tooltip="true">
        </ht-table-column>
        <ht-table-column
          prop="status"
          label="状态"
          width="120"
          :filters="[
            { text: '启用', value: 'enable' },
            { text: '禁用', value: 'disable' }
          ]"
        >
          <template v-slot="{ row }">
            <el-tag type="success" v-if="row.status == 'enable'"
              >启用</el-tag
            >
            <el-tag type="danger" v-if="row.status == 'disable'"
              >禁用</el-tag
            >
          </template>
        </ht-table-column>
        <ht-table-column width="180" prop="desc" label="描述" :sortable="true" :show-overflow-tooltip="true">
        </ht-table-column>
      </template>
    </ht-table>
    <ht-sidebar-dialog
      width="35%"
      title="流程附件上传配置"
      class="sp-manager__dialog"
      :visible="dialogVisible"
      :before-close="beforeCloseDialog"
    >
      <el-form v-form data-vv-scope="flowUploadPropertiesForm">
        <ht-form-item label="名称">
          <ht-input v-model="flowUploadProperties.name" validate="required" />
        </ht-form-item>
        <ht-form-item label="流程名称" class="is-required">
            <el-tag
              :key="flow.key"
              v-for="flow in selectedFlows"
              closable
              :disable-transitions="false"
              @close="handleClose(flow)">
              {{flow.name}}
            </el-tag>
            <el-button type="primary" size="mini" icon="el-icon-search" @click="showFlowDialog()">选择</el-button>
            <el-popconfirm
                title="您确定要清空嘛？"
                @onConfirm ="cleanSelectedFlows()"
                class="dialog-popconfirm"
            >
              <el-button type="danger" size="mini" icon="el-icon-delete" slot="reference">清空选择</el-button>
            </el-popconfirm>
             <!-- 流程选择对话框  -->
              <eip-flow-dialog
                ref="eipFlowDialog"
                name="eipFlowDialog"
                @onConfirm="dialogOnConfirm"
                append-to-body
              />
        </ht-form-item>
        <ht-form-item label="上传方式" stylestyle="width:120px;">
          <el-radio-group v-model="flowUploadProperties.uploadType" validate="required">
            <el-radio label="folder">文件目录</el-radio>
            <el-radio label="ftp">FTP服务器</el-radio>
            <el-radio label="database">数据库</el-radio>
            <el-radio label="aliyunOss">阿里云OSS</el-radio>
          </el-radio-group>
        </ht-form-item>
        <ht-form-item v-if="flowUploadProperties.uploadType=='folder'" label="存储位置" stylestyle="width:120px;">
          <ht-input v-model="flowUploadProperties.location" validate="required" />
        </ht-form-item>
        <ht-form-item v-if="flowUploadProperties.uploadType=='ftp'" label="根目录" stylestyle="width:120px;">
          <ht-input v-model="flowUploadProperties.location" validate="required" />
        </ht-form-item>
        <ht-form-item v-if="flowUploadProperties.uploadType=='ftp'" label="上传地址" stylestyle="width:120px;">
          <ht-input type="textarea" v-model="flowUploadProperties.ftpUrl" placeholder="上传地址" validate="required"/>
        </ht-form-item>
        <ht-form-item v-if="flowUploadProperties.uploadType=='ftp'" label="端口号" stylestyle="width:120px;">
          <ht-input v-model="flowUploadProperties.ftpPort" validate="required" />
        </ht-form-item>
        <ht-form-item v-if="flowUploadProperties.uploadType=='ftp'" label="用户名" stylestyle="width:120px;">
          <ht-input v-model="flowUploadProperties.ftpUserName" validate="required" />
        </ht-form-item>
        <ht-form-item v-if="flowUploadProperties.uploadType=='ftp'" label="密码" stylestyle="width:120px;">
          <ht-input v-model="flowUploadProperties.ftpPassword" type="password" validate="required" />
        </ht-form-item>

        <ht-form-item v-if="flowUploadProperties.uploadType=='aliyunOss'" label="访问域名" stylestyle="width:120px;">
          <ht-input v-model="flowUploadProperties.aliyunOssEndpoint" placeholder="http://oss-cn-guangzhou.aliyuncs.com" validate="required"/>
        </ht-form-item>
        <ht-form-item v-if="flowUploadProperties.uploadType=='aliyunOss'" label="密钥Id" stylestyle="width:120px;">
          <ht-input type="password" v-model="flowUploadProperties.aliyunOssAccessKeyId" placeholder="" validate="required"/>
        </ht-form-item>
        <ht-form-item v-if="flowUploadProperties.uploadType=='aliyunOss'" label="密钥Secret" stylestyle="width:120px;">
          <ht-input type="password" v-model="flowUploadProperties.aliyunOssAccessKeySecret" placeholder="" validate="required"/>
        </ht-form-item>
        <ht-form-item v-if="flowUploadProperties.uploadType=='aliyunOss'" label="主目录" stylestyle="width:120px;">
          <ht-input v-model="flowUploadProperties.location" placeholder="hotent" validate="required"/>
        </ht-form-item>

        <ht-form-item label="状态" stylestyle="width:120px;">
          <el-radio-group v-model="flowUploadProperties.status" validate="required">
            <el-radio label="enable">启用</el-radio>
            <el-radio label="disable">禁用</el-radio>
          </el-radio-group>
        </ht-form-item>
        <ht-form-item label="描述" stylestyle="width:120px;">
          <ht-input type="textarea" v-model="flowUploadProperties.desc" placeholder="请输入描述" />
        </ht-form-item>
      </el-form>
      <div slot="footer" style="text-align: center">
        <ht-submit-button
          url="${portal}/system/flowUploadProperties/v1/save"
          :model="flowUploadProperties"
          scope-name="flowUploadPropertiesForm"
          :isSubmit="isSubmit"
          @before-save-data="beforeSaveData"
          @after-save-data="afterSaveData"
        >{{$t("eip.common.save")}}</ht-submit-button>
        <el-button @click="beforeCloseDialog">{{$t("eip.common.cancel")}}</el-button>
      </div>
    </ht-sidebar-dialog>
  </div>
</template>
<script>
const eipFlowDialog = () => import("@/components/dialog/EipFlowDialog.vue");
export default {
  components: {
    eipFlowDialog,
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
      selectedFlows:[],
      flowUploadProperties: {uploadType:'ftp',status:'enable',encryptName:1},
      isSubmit:false,
    };
  },
  mounted() {
    this.$validator = this.$root.$validator;
  },
  methods: {
    showFlowDialog() {
      this.$refs.eipFlowDialog.showDialog();
    },
    showDialog(id) {
      this.selectedFlows = [];
      let _this = this;
      if (id) {
    	  this.$http.get("${portal}/system/flowUploadProperties/v1/getJson?id="+`${id}`).then(resp => {
              _this.flowUploadProperties = resp.data;
              _this.flowUploadProperties.encryptName = 1;
              _this.dialogVisible = true;
              _this.initSelectFlow(resp.data);
          }, error => {
              reject(error);
          })
      } else {
        this.flowUploadProperties = {uploadType:'ftp',status:'enable',encryptName:1};
        this.dialogVisible = true;
      }
    },
    initSelectFlow(properties){
      let _this = this;
      if(properties.flowKey){
        const flowKeys = properties.flowKey.split(',');
        const flowNames = properties.flowName.split(',');
        for (let i = 0; i < flowKeys.length; i++) {
          const key = flowKeys[i];
          if(key){
            _this.selectedFlows.push({key:key,name:flowNames[i]});
          }
        }
      }
    },
    beforeCloseDialog() {
      this.flowUploadProperties = {  };
      this.dialogVisible = false;
      this.selectedFlows = [];
    },
    handleClose(flow) {
      this.selectedFlows.splice(this.selectedFlows.indexOf(flow), 1);
    },
    dialogOnConfirm(data) {
      let _this = this;
      data.forEach(ele => {
        let isIn = false;
        _this.selectedFlows.forEach(sele =>{
          if(sele.key==ele.defKey){
            isIn = true;
          }
        });
        if(!isIn){
          _this.selectedFlows.push({key:ele.defKey,name:ele.name});
        }
      });
    },
    loadData(param, cb) {
    	this.$http.post("${portal}/system/flowUploadProperties/v1/listJson", param).then(resp => {
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
    beforeSaveData() {
      this.isSubmit = true;
      if(!this.selectedFlows || this.selectedFlows.length<1){
        this.$message.warning ("请选择流程！");
        this.isSubmit = false;
        return ;
      }
      if(!this.flowUploadProperties.status){
        this.$message.warning ("请选择状态！");
        this.isSubmit = false;
        return ;
      }
      let flowKeys = '';
      let flowNames = '';
      this.selectedFlows.forEach(flow =>{
        if(flowKeys){
          flowKeys += ',';
          flowNames += ',';
        }
        flowKeys += flow.key;
        flowNames += flow.name;
      });
      this.flowUploadProperties.flowKey = flowKeys;
      this.flowUploadProperties.flowName = flowNames;
    },
    afterSaveData() {
      setTimeout(() => {
        this.beforeCloseDialog();
        this.$refs.htTable.load();
      }, 500);
    },
    getShowName(name){
      if(name){
        name = name.substr(1);
        name = name.substr(0, name.length - 1);
      }
      return name;
    },
    cleanSelectedFlows(){
      // 流程附件上传配置，清楚选择的流程
      this.selectedFlows = [];
    }
  }
};
</script>

<style lang="scss" scoped>
.el-tag + .el-tag {
  margin-left: 5px;
  margin-right: 5px;
}
.sp-manager__dialog /deep/ > .el-dialog > .el-dialog__body {
  height: calc(100% - 170px);
}

.sp-manager__dialog >>> .dialog-popconfirm {
  margin-left: 3px;
}
@media (max-width: 1024px) {
  /deep/ .el-dialog{
    width: 45% !important;
  }
}
</style>
