<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      :quick-search-props="[{prop:'name',label:'岗位名称'},{prop:'p.CODE_',label:'岗位编码'},{prop:'j.NAME_',label:'职务名称'}]"
      :show-custom-column="false"
      :show-export="false"
      ref="htTable"
      @row-click="rowClick"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="showDialog()" icon="el-icon-plus">添加</el-button>
          <ht-delete-button
            :url="demDeleteUrl"
            :htTable="$refs.htTable"
            parameter="postCodes"
            pk="code"
            @after-delete="afterDelete"
            style="margin:0;"
          >删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column
          prop="name"
          label="岗位名称"
          :sortable="true"
          :show-overflow-tooltip="true"
          width="200"
        >
          <template v-slot="{row}">
            <el-link
              type="primary"
              @click="handleCommand({row:row,command:'assignMenu'})"
              title="点击编辑"
            >{{row.name}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column prop="code" label="岗位编码" width="150" :show-overflow-tooltip="true"/>
        <ht-table-column prop="jobName" label="职务名称" width="200" :show-overflow-tooltip="true"/>
        <ht-table-column prop="pathName" label="组织路径" :show-overflow-tooltip="true" />
        <ht-table-column label="操作" width="150">
          <template v-slot="{row}">
            <el-button size="mini" @click="handleCommand({row:row,command:'disPersonnel'})">分配人员</el-button>
          </template>
        </ht-table-column>
      </template>
    </ht-table>

    <ht-sidebar-dialog
      width="32%"
      :title="(diaType == 'add'?'添加':'编辑')+'岗位'"
      :visible="dialogVisible"
      :before-close="handleClose"
      :append-to-body="true"
    >
      <el-form v-model="orgPost" data-vv-scope="editDemForm" v-form>
        <ht-form-item label="职务名称" label-width="100px" v-if="diaType==='add'">
<!--          <ht-select-->
<!--            v-model="orgPost.jobCode"-->
<!--            class="m-r"-->
<!--            :options="jobs"-->
<!--            :props="{key:'groupCode',value:'name'}"-->
<!--            :validate="{required:true}"-->
<!--          />-->
          <eip-job-selector
              v-model="orgPost.jobName"
              :config="{code: 'orgPost.jobCode'}"
              :validate="{required:true}"
              :single="true"
              append-to-body/>
        </ht-form-item>
        <ht-form-item label="岗位名称" prop="name" label-width="100px">
          <ht-input
            v-model="orgPost.name"
            autocomplete="off"
            :validate="{required:true,regex: {
                        exp: '^[\\s\\S]{1,21}$',
                        message: '内容超出输入限制'
                      }}"
            placeholder="请输入名称"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="岗位编码" prop="code" label-width="100px">
          <ht-input
            v-model="orgPost.code"
            v-pinyin="orgPost.name"
            autocomplete="off"
            :validate="{required:true,alpha_dash:true,regex: {
                        exp: '^[\\s\\S]{1,30}$',
                        message: '内容超出输入限制'
                      }}"
            placeholder="请输入别名"
            :disabled="diaType!='add'"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="岗位组织" label-width="100px">
          <ht-input v-model="orgPost.orgName" readonly placeholder="选择岗位组织" :validate="{required:true}" />
          <el-button @click="selectOrg" type="primary" size="mini">选择岗位组织</el-button>
        </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
          :url="saveRoleUrl"
          :model="orgPost"
          :isSubmit="isSubmit"
          :requestMethod="requestMethod"
          scopeName="editDemForm"
          @before-save-data="beforeSaveData"
          @after-save-data="afterSaveData"
        >{{$t('eip.common.save')}}</ht-submit-button>
        <el-button @click="dialogCancle('dialogVisible')">{{$t('eip.common.cancel')}}</el-button>
      </div>
    </ht-sidebar-dialog>

    <ht-sidebar-dialog
      width="40%"
      title="查看岗位详情"
      :visible="diaType==='showInfo'"
      :before-close="handleClose"
    >
      <table class="form-table" cellspacing="0" cellpadding="0" border="0">
        <tbody>
          <tr>
            <th width="150px">岗位名称（编码）:</th>
            <td>{{orgPost.name}}({{orgPost.id}})</td>
          </tr>
          <tr>
            <th width="150px">所属职务（编码）:</th>
            <td>{{orgPost.jobName}}({{orgPost.relDefId}})</td>
          </tr>
          <tr>
            <th width="150px">所属组织（编码）:</th>
            <td>{{orgPost.orgName}}({{orgPost.orgId}})</td>
          </tr>
          <tr>
            <th width="150px">岗位人员:</th>
            <td>
              <el-table :data="postUser" style="width: 100%" height="200" border="true">
                <el-table-column prop="fullName" label="姓名" width="100" />
                <el-table-column prop="pathName" label="人员所属组织全路径" />
              </el-table>
            </td>
          </tr>
        </tbody>
      </table>
    </ht-sidebar-dialog>

    <ht-load-data :url="loadDataUrl" context="uc" @after-load-data="afterLoadData" v-if="dialogVisible"></ht-load-data>

    <!-- 组织选择对话框  -->
    <eip-org-dialog ref="eipOrgDialog" @onConfirm="eipOrgDialogOk" single append-to-body />

    <distrubutive-user ref="distrubutiveUser"></distrubutive-user>
  </div>
</template>
<script>
import org from "@/api/org.js";
const eipOrgDialog = () => import("@/components/dialog/EipOrgDialog.vue");
const EipJobSelector = () => import("@/components/selector/EipJobSelector.vue");
import distrubutiveUser from "./DistrubutiveUser";
export default {
  components: {
    eipOrgDialog,
    distrubutiveUser,
    EipJobSelector
  },
  computed: {
    demDeleteUrl: function() {
      return window.context.uc + "/api/org/v1/orgPost/deleteOrgPost";
    },
    saveRoleUrl: function() {
      let preUrl = window.context.uc + "/api/org/v1/orgPost";
      if (this.orgPost.id) {
        preUrl += "/updateOrgPost";
      } else {
        preUrl += "/saveOrgPost";
      }
      return preUrl;
    },
    requestMethod: function() {
      return "POST";
    }
  },
  data() {
    return {
      dialogVisible: false,
      dialogVisibleMenuPerm: false,
      orgPost: {
        name: "",
        code: "",
        jobCode: "",
        jobName:"",
        orgName:"",
        orgCode: ""
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
      allowRoles: [],
      diaType: "",
      jobs: [],
      postUser: [],
      readOnly: true,
      tempOrgPost: {}
    };
  },
  mounted() {
    this.$validator = this.$root.$validator;
  },
  methods: {
      rowClick(row, column, event){
          this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
      },
    selectOrg() {
      this.$refs["eipOrgDialog"].showDialog();
    },
    setDemDefault(row) {
      org.setDemDefault(row.code).then(() => {
        this.$refs.htTable.load();
      });
    },
    handleClose() {
      this.dialogVisible = false;
      this.diaType = "close";
      this.loadDataUrl = "";
    },
    handleCloseMenuPerm() {
      this.dialogVisibleMenuPerm = false;
    },
    showDialog(row) {
      this.dialogVisible = true;
      this.orgPost=this.$options.data().orgPost;
      if (row) {
        this.loadDataUrl = `/api/org/v1/orgPost/getOrgPost?postCode=${encodeURIComponent(row.code)}`;
      } else {
        this.loadDataUrl="";
        this.diaType = "add";
      }
      if (this.diaType === "showInfo") {
        this.dialogVisible = false;
      }
    },
    dialogCancle(dialogVisible) {
      this[dialogVisible] = false;
    },
    loadData(param, cb) {
      org
        .getOrgPostPage(param)
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
      this.readOnly = false;
      switch (params.command) {
        case "showInfo":
          this.diaType = "showInfo";
          // this.showDialog(params.row)
          this.orgPost = params.row;
          org.getFullname(params.row.id).then(resp => {
            this.postUser = resp;
          });
          break;
        case "assignMenu":
          this.diaType = "edit";
          this.showDialog(params.row);
          break;
        case "disPersonnel":
          this.$refs.distrubutiveUser.showDialog(
            params.row.id,
            params.row.code
          );
          break;
        default:
          break;
      }
    },
    async beforeSaveData() {
      this.isSubmit = true;
    },
    afterSaveData() {
      this.dialogVisible = false;
      this.$refs.htTable.load();
    },
    afterDelete() {
      this.$refs.htTable.load();
    },
    afterLoadData(data) {
      // 编辑角色
      if (this.dialogVisible || this.diaType === "showInfo") {
        this.orgPost = data.value;
        this.tempOrgPost = JSON.parse(JSON.stringify(this.orgPost));
        setTimeout(() => this.$validator.validateAll("editDemForm"));
      }
    },
    eipOrgDialogOk(data) {
      if (data.length > 1) {
        this.$message.error("岗位组织不能选择多个");
        return;
      }
      if (
        this.tempOrgPost.orgId &&
        this.tempOrgPost.orgId != data[0].id
      ) {
        let this_ = this;
        this.$confirm(
          "修改所属组织，保存后当前岗位下的人员会一并转移到新组织下",
          "提示",
          {
            cancelButtonText: "取消",
            confirmButtonText: "确定",
            type: "warning",
            closeOnClickModal: false
          }
        ).then(() => {
          this_.orgPost.orgCode = data[0].code;
          this_.$set(this.orgPost, "orgName", data[0].name);
        });
      } else {
        this.orgPost.orgCode = data[0].code;
        this.$set(this.orgPost, "orgName", data[0].name);
      }
    }
  }
};
</script>
<style scoped>
div[aria-invalid="true"] >>> .el-input__inner,
div[aria-invalid="true"] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
</style>
