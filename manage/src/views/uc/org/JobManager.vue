<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      :show-custom-column="false"
      :show-export="false"
      :quick-search-props="[{prop:'name', label:'名称'},{prop:'CODE_',label:'别名'}]"
      ref="htTable"
      @row-click="rowClick"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="showDialog()" icon="el-icon-plus">添加</el-button>
          <ht-delete-button
            :url="demDeleteUrl"
            :htTable="$refs.htTable"
            @after-delete="afterDelete"
            style="margin:0"
          >删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column
          prop="name"
          label="名称"
          width="500"
          :sortable="true"
          :show-overflow-tooltip="true"
        >
          <template v-slot="{row}">
            <el-link
              type="primary"
              @click="handleCommand({row:row,command:'assignMenu'})"
              title="点击编辑"
            >{{row.name}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column prop="groupCode" label="别名" />
        <ht-table-column prop="postLevel" label="级别" />
        <ht-table-column prop="description" label="描述" show-overflow-tooltip />
      </template>
    </ht-table>

    <ht-sidebar-dialog
      width="28%"
      :title="dialogTitle"
      :visible="dialogVisible"
      :before-close="handleClose"
      :append-to-body="true"
    >
      <el-form v-model="job" data-vv-scope="editForm">
        <ht-form-item label="职务名称" prop="name" label-width="100px">
          <ht-input
            v-model="job.name"
            autocomplete="off"
            :validate="{required:true,regex: {
                        exp: '^[\\s\\S]{1,21}$',
                        message: '内容超出输入限制'
                      }}"
            placeholder="请输入名称"
            :disabled="readOnly"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="职务别名" prop="code" label-width="100px">
          <ht-input
            v-model="job.code"
            v-pinyin="job.name"
            autocomplete="off"
            :validate="{required:true,alpha_dash:true,regex: {
                        exp: '^[\\s\\S]{1,30}$',
                        message: '内容超出输入限制'
                      }}"
            placeholder="请输入别名"
            :disabled="job.id?true:false || readOnly"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="职务等级" prop="code" label-width="100px">
          <ht-input
            v-model="job.postLevel"
            autocomplete="off"
            placeholder="职务等级"
            :validate="{regex: {
                        exp: '^[\\s\\S]{0,30}$',
                        message: '内容超出输入限制'
                      }}"
            :disabled="job.id?true:false || readOnly"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="描述" label-width="100px">
          <ht-input
            type="textarea"
            v-model="job.description"
            :disabled="readOnly"
            placeholder="请输入描述"
          />
        </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" v-if="!readOnly">
        <ht-submit-button
          :url="saveRoleUrl"
          :model="job"
          :isSubmit="isSubmit"
          :requestMethod="requestMethod"
          scopeName="editForm"
          @before-save-data="beforeSaveData"
          @after-save-data="afterSaveData"
        >{{$t('eip.common.save')}}</ht-submit-button>
        <el-button @click="dialogCancle('dialogVisible')">{{$t('eip.common.cancel')}}</el-button>
      </div>
    </ht-sidebar-dialog>
  </div>
</template>
<script>
import org from "@/api/org.js";
import EipUserDialog from "@/components/dialog/EipUserDialog.vue";

export default {
  components: {
    EipUserDialog
  },
  computed: {
    demDeleteUrl: function() {
      return window.context.uc + "/api/job/v1/job/deleteJobByIds";
    },
    saveRoleUrl: function() {
      let preUrl = window.context.uc + "/api/job/v1/job";
      if (this.job.id) {
        preUrl += "/updateJob";
      } else {
        preUrl += "/addJob";
      }
      return preUrl;
    },
    requestMethod: function() {
      return this.job.id ? "PUT" : "POST";
    }
  },
  data() {
    return {
      dialogVisible: false,
      dialogVisibleMenuPerm: false,
      job: {
        name: "",
        code: ""
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
      readOnly: false,
      dialogTitle: "添加职务"
    };
  },
  mounted() {
    this.$validator = this.$root.$validator;
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    setDemDefault(row) {
      org.setDemDefault(row.code).then(() => {
        this.$refs.htTable.load();
      });
    },
    handleClose() {
      this.dialogVisible = false;
      this.loadDataUrl = "";
    },
    handleCloseMenuPerm() {
      this.dialogVisibleMenuPerm = false;
    },
    showDialog(row) {
      this.dialogVisible = true;
      if (row) {
         // 编辑角色
        this.dialogTitle = "编辑职务";
        this.job = JSON.parse(JSON.stringify(row));
        setTimeout(() => this.$validator.validateAll("editDemForm"));
      } else {
        this.dialogTitle = "添加职务";
        this.job = { name: "", code: "",description:"",code:'' };
      }
    },
    dialogCancle(dialogVisible) {
      this[dialogVisible] = false;
    },
    loadData(param, cb) {
      org
        .getJobPage(param)
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
          this.readOnly = true;
          this.showDialog(params.row);
          break;
        case "assignMenu":
          this.showDialog(params.row);
          break;
        case "setDemDefault":
          this.setDemDefault(params.row);
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
      if (this.dialogVisible) {
        this.job = data;
        setTimeout(() => this.$validator.validateAll("editDemForm"));
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
