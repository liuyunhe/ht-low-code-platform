<template>
  <el-container class="fullheight" style="border: 1px solid #eee">
    <ht-aside-tree cat-id="7" @node-click="handleNodeClick" @check="check" />
    <el-container>
      <el-main>
        <ht-table
          @load="loadData"
          :data="data"
          :pageResult="pageResult"
          :selection="true"
          quick-search-props="name,formKey"
          :default-querys="[{property:'formType',value:'mobile'}]"
          :default-sorter="[{direction: 'DESC',property: 'updateTime'}]"
          :show-export="false"
          @row-click="rowClick"
          ref="htTable"
          @select="tableSelect"
          @select-all="tableSelect"
        >
          <template v-slot:toolbar>
            <el-button-group>
              <el-button size="small" @click="openAddDailog" icon="el-icon-plus">添加</el-button>
              <el-button
                size="small"
                @click="
                  importDialogVisible = true;
                  formTypeSelectorCatId = '';
                  formTypeSelectorCatName = '';
                "
                icon="el-icon-back"
              >导入</el-button>
              <el-button size="small" @click="handExport" icon="el-icon-right">导出</el-button>
              <el-button @click="openTypeSetDialog()">设置分类</el-button>
              <ht-delete-button style="margin: 0px" :url="formDeleteUrl" :htTable="$refs.htTable">删除</ht-delete-button>
            </el-button-group>
          </template>
          <template>
            <ht-table-column type="index" width="50" align="center" label="序号" />
            <ht-table-column prop="name" label="名称" :sortable="true" :show-overflow-tooltip="true">
              <template v-slot="{row}">
                <el-link
                  @click="handleCommand({row:row,command:'edit'})"
                  type="primary"
                >{{row.name}}</el-link>
              </template>
            </ht-table-column>
            <ht-table-column prop="formKey" label="别名" :sortable="true" />
            <ht-table-column
              prop="status"
              label="状态"
              width="80"
              :filters="[{text:'草稿', value:'draft'},{text:'已发布', value:'deploy'}]"
            >
              <template v-slot="{row}">
                <el-tag type="info" v-if="row.status=='deploy'">已发布</el-tag>
                <el-tag type="danger" v-if="row.status=='draft'">草稿</el-tag>
              </template>
            </ht-table-column>
            <ht-table-column prop="version" label="版本" width="250">
              <template v-slot="{row}">
                <el-tag type="info">主版本:{{row.version}}</el-tag>
                <el-tag
                  style="margin-left:10px;cursor:pointer"
                  title="查看表单的所有版本"
                  @click="formVersionVisible=true;formKey = row.formKey;"
                  type="info"
                >版本管理({{row.version}})</el-tag>
              </template>
            </ht-table-column>
            <ht-table-column prop="typeName" label="分类" :sortable="true" />
            <ht-table-column prop="desc" label="描述" :hidden="true" />
            <ht-table-column width="150" label="操作">
              <template v-slot="{row}">
                <el-dropdown
                  size="mini"
                  split-button
                  @command="handleCommand"
                  @click="handleCommand({row:row,command:'preview'})"
                >
                  <span>
                    <i class="el-icon-tickets"></i>预览
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                      icon="el-icon-menu"
                      :command="{row:row,command:'publish'}"
                      v-if="row.status=='draft'"
                    >发布</el-dropdown-item>
                    <el-dropdown-item icon="el-icon-menu" :command="{row:row,command:'copy'}">复制</el-dropdown-item>
                    <el-dropdown-item
                      v-if="row.status == 'deploy'"
                      icon="el-icon-menu"
                      :command="{row:row,command:'formRight'}"
                    >表单权限</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
            </ht-table-column>
          </template>
        </ht-table>
      </el-main>
      <FlowFormAuth ref="flowFormAuth" />
    </el-container>
    <!-- 添加表单  -->
    <el-dialog
      width="30%"
      title="新建表单"
      :visible="dialogVisible"
      :before-close="handleClose"
      destroy-on-close
    >
      <el-form :model="bpmForm" data-vv-scope="addBpmForm">
        <ht-form-item label="选择数据模型" label-width="120px">
          <eip-bo-selector v-model="bpmForm.bos" placeholder="请选择数据模型" :validate="{required:true}"></eip-bo-selector>
        </ht-form-item>

        <ht-form-item label="表单名称" label-width="120px">
          <ht-input
            v-model="bpmForm.formName"
            autocomplete="off"
            :validate="{required:true}"
            placeholder="请输入名称"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="表单别名" label-width="120px">
          <ht-input
            v-model="bpmForm.formKey"
            v-pinyin="bpmForm.formName"
            autocomplete="off"
            :validate="{required:true,alpha_num:true,isExist:'${form}/form/form/v1/checkKey?key='}"
            placeholder="请输入别名"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="表单分类" label-width="120px">
          <EipSysTypeSelector
            placeholder="请选择表单分类"
            cat-id="7"
            v-model="bpmForm.typeName"
            :sys-type-id.sync="bpmForm.typeId"
            :validate="{required:true}"
          />
        </ht-form-item>
        <ht-form-item label="描述" label-width="120px">
          <ht-input type="textarea" v-model="bpmForm.desc" placeholder="请输入描述" />
        </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="toFormDesigner()">下一步</el-button>
        <el-button @click="dialogVisible=false;">{{$t('eip.common.cancel')}}</el-button>
      </div>
    </el-dialog>
    <eip-bo-dialog
      ref="eipBoDialog"
      name="eipBoDialog"
      @onConfirm="handleDialogSure"
      :single="false"
      append-to-body
    />
    <el-dialog
      class="form-editor-dialog"
      fullscreen
      destroy-on-close
      :visible="formEditorDialogVisible"
      :before-close="handleCloseFormEditor"
    >
      <FormDesigner
        :visibleDialog.sync="formEditorDialogVisible"
        :form-id.sync="formId"
        :form-def-id.sync="formDefId"
        :bos="bpmForm.bos"
        :add-bpm-form="bpmForm"
        :form-type="'mobile'"
      />
    </el-dialog>
    <el-dialog
      title="表单版本管理"
      class="form-version__dialog"
      width="60%"
      destroy-on-close
      :visible.sync="formVersionVisible"
      :before-close="handleCloseFormVersion"
      top="8vh"
    >
      <FormVersionManager :visible.sync="formVersionVisible" :form-key="formKey" />
    </el-dialog>
    <eip-sys-type-dialog
      ref="typeSetDialog"
      name="typeSetDialog"
      :cat-id="'7'"
      @onConfirm="sysTypeDialogOnConfirm"
    />
    <el-dialog
      width="60%"
      title="复制表单"
      :visible="dialogSaveCopyVisible"
      :before-close="handleCloseSaveCopy"
      :destroy-on-close="true"
    >
      <form v-form data-vv-scope="saveCopyForm">
        <table class="form-table" cellspacing="0" cellpadding="0" border="0">
          <tbody>
            <tr>
              <th width="140px">原表单名称:</th>
              <td>{{formRow.name}}</td>
              <th width="140px" class="is-required">新表单名称</th>
              <td>
                <ht-input v-model="newForm.name" :validate="{required:true}" />
              </td>
            </tr>
            <tr>
              <th width="140px" class="is-required">原表单别名:</th>
              <td>{{formRow.formKey}}</td>
              <th width="140px" class="is-required">新表单别名</th>
              <td>
                <ht-input
                  v-model="newForm.formKey"
                  v-pinyin="newForm.name"
                  autocomplete="off"
                  :validate="{required:true,regex:{exp:'^[a-zA-Z][a-zA-Z0-9_]*$', message:'只能输入字母、数字、下划线，且以字母开头' },isExist:'${form}/form/form/v1/checkKey?key='}"
                  placeholder="请输入别名"
                ></ht-input>
              </td>
            </tr>
            <tr>
              <th width="140px" class="is-required">原表单分类:</th>
              <td>{{formRow.typeName}}</td>
              <th width="140px" class="is-required">新表单分类</th>
              <td>
                <EipSysTypeSelector
                  placeholder="请选择表单分类"
                  cat-id="7"
                  v-model="newForm.typeName"
                  :sys-type-id.sync="newForm.typeId"
                  :validate="{required:true}"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
          url="${form}/form/form/v1/saveCopy"
          :model="newForm"
          scope-name="saveCopyForm"
          @after-save-data="afterSaveData"
        >{{$t('eip.common.save')}}</ht-submit-button>
        <el-button @click="handleCloseSaveCopy">{{$t('eip.common.cancel')}}</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="导入表单"
      :visible.sync="importDialogVisible"
      width="40%"
      top="30vh"
      :close-on-click-modal="false"
      v-if="importDialogVisible"
    >
      <div style="height:150px;padding-left: 20px ;">
        <eip-sys-type-selector
          placeholder="请选择分类"
          type-key="FORM_TYPE"
          v-model="formTypeSelectorCatName"
          :sys-type-id.sync="formTypeSelectorCatId"
          :validate="{ required: true }"
        />
        <br />
        <br />
        <el-upload
          style="display: inline-block;"
          :action="imporCheckUrl"
          :on-success="hadleUploadResult"
          :on-error="hadleUploadResult"
          :headers="uploadHeaders"
          :on-exceed="onExceed"
          accept=".zip"
          :before-upload="beforeUpload"
          :limit="1"
          :data="{ isCheck: true }"
          :auto-upload="false"
          ref="upload"
        >
          <el-button size="small" icon="el-icon-upload">选择表单</el-button>
        </el-upload>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          @click="submitImport"
          element-loading-text="拼命导入中"
          v-loading.fullscreen.lock="fullscreenLoading"
        >确 定</el-button>
        <el-button @click="importDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </el-container>
</template>
<script>
import { mapState } from "vuex";
import form from "@/api/form.js";
import req from "@/request.js";
const htAsideTree = () => import("@/components/common/HtAsideTree.vue");
const EipSysTypeSelector = () =>
  import("@/components/selector/EipSysTypeSelector.vue");
const FormDesigner = () => import("@/components/form/FormDesigner.vue");
const EipBoSelector = () => import("@/components/selector/EipBoSelector.vue");
const FlowFormAuth = () => import("@/components/flow/FlowFormAuth.vue");
const FormVersionManager = () => import("@/views/form/FormVersionManager.vue");
const eipSysTypeDialog = () =>
  import("@/components/dialog/EipSysTypeDialog.vue");
const eipBoDialog = () => import("@/components/dialog/EipBoDialog.vue");

export default {
  components: {
    htAsideTree,
    EipSysTypeSelector,
    FormDesigner,
    EipBoSelector,
    FlowFormAuth,
    FormVersionManager,
    eipSysTypeDialog,
    eipBoDialog,
  },
  data() {
    return {
      formTypeSelectorCatName: "",
      fullscreenLoading: false,
      importDialogVisible: false,
      asideShow: true,
      treeData: [],
      defaultProps: {
        children: "children",
        label: "name",
      },
      data: [],
      pageResult: {
        page: 1,
        pageSize: 20,
        total: 0,
      },
      dialogVisible: false,
      formEditorDialogVisible: false,
      dialogSaveCopyVisible: false,
      formId: null,
      formDefId: null,
      bpmForm: {
        formKey: "",
        bos: "",
        desc: "",
        formType: "mobile",
      },
      typeIdQuery: null,
      formVersionVisible: false,
      formKey: null,
      updateTableData: [],
      formRow: {},
      newForm: { id: "", name: "", formKey: "", typeId: "", typeName: "" },
    };
  },
  watch: {
    formEditorDialogVisible: function (newVal, oldVal) {
      if (newVal == false && oldVal == true) {
        this.handleCloseFormEditor();
      }
    },
  },
  computed: {
    ...mapState({
      currentUser: (state) => state.login.currentUser,
      formDeleteUrl: function () {
        return `${window.context.form}/form/form/v1/remove`;
      },
      uploadHeaders: function (mapState) {
        return { Authorization: "Bearer " + mapState.login.currentUser.token };
      },
      imporCheckUrl: function (mapState) {
        return (
          window.context.form +
          "/form/form/v1/importCheck?typeId=" +
          this.formTypeSelectorCatId
        );
      },
    }),
  },
  mounted() {
    this.$validator = this.$root.$validator;
    if (this.$route.query.formId && this.$route.query.defId) {
      let row = {
        id: this.$route.query.formId,
        defId: this.$route.query.defId,
      };
      this.handleCommand({ row: row, command: "edit" });
      this.$router.push("form#mobileFormManager");
    }
  },
  methods: {
    handleImportSuccess() {
      this.$message.success("表单导入成功");
      this.importDialogVisible = false;
      this.$refs.htTable.load();
      this.$refs.upload.clearFiles();
    },
    submitImport() {
      if (
        !this.$refs.upload.uploadFiles ||
        this.$refs.upload.uploadFiles.length == 0
      ) {
        this.$message.warning("请选择要导入的表单!");
        return false;
      }
      if (!this.formTypeSelectorCatId) {
        this.$message.warning("请选择要导入的分类!");
        return false;
      }
      this.$refs.upload.submit();
    },
    onExceed(file) {
      this.$message.warning("只能选择一个zip文件!");
    },
    hadleUploadResult(response, file, fileList) {
      var height =
        (document.documentElement.clientHeight || document.body.clientHeight) *
          0.85 +
        "px";
      this.fullscreenLoading = false;
      let this_ = this;
      if (response.state) {
        this_.handleImportSuccess();
      } else {
        if (response.message) {
          if (response.message.indexOf("是否继续为其新增版本") > 0) {
            this.$confirm(
              '<div style="overflow-x:hidden;overflow-y:auto ;max-height:' +
                height +
                '">' +
                response.message +
                "</div>",
              "提示",
              {
                cancelButtonText: "取消",
                dangerouslyUseHTMLString: true,
                confirmButtonText: "确定",
                type: "warning",
                closeOnClickModal: false,
              }
            )
              .then(() => {
                this_.fullscreenLoading = true;
                this_.$http
                  .post(
                    `${window.context.form}/form/form/v1/importSave?cacheFileId=` +
                      response.value +
                      "&confirmImport=true&typeId=" +
                      this.formTypeSelectorCatId
                  )
                  .then(function (resp) {
                    this_.fullscreenLoading = false;
                    let data = resp.data;
                    if (data.state) {
                      this_.handleImportSuccess();
                    } else {
                      this_.$message.error(data.message);
                    }
                  });
              })
              .catch((action) => {
                this_.$http.post(
                  `${window.context.form}/form/form/v1/importSave?confirmImport=false&cacheFileId=` +
                    response.value
                );
                this_.importDialogVisible = false;
                this.$refs.upload.clearFiles();
              });
          } else {
            this.$message.error(response.message);
          }
        }
      }
    },
    beforeUpload(file) {
      if (!file.name.endsWith(".zip")) {
        this.$message.warning("只能导入zip文件!");
        return false;
      }
      this.imporActionUrl = this.imporCheckUrl;
      this.fullscreenLoading = true;
    },
    //表格选中数据
    tableSelect(selection) {
      this.updateTableData = selection;
    },
    handExport() {
      let selection = this.$refs.htTable.$refs.htTable.selection;
      if (selection.length == 0) {
        this.$message.warning("请选择至少一项记录");
        return;
      }
      let ids = [];
      for (let item of selection) {
        ids.push(item["id"]);
      }
      if (ids.length == 0) {
        this.$message.warning("请选择至少一项记录");
        return;
      }
      let url = `${window.context.form}/form/form/v1/exportForm?formIds=${ids}`;
      req.download(url);
    },
    handleDialogSure(data, boo) {
      if (Array.isArray(data)) {
        this.bpmForm.bos = data;
        this.bpmForm.templateConf = {};
      } else {
        this.bpmForm.bos = data.selection;
        this.bpmForm.templateConf = data.templateConf;
      }
      this.bpmForm.formType = "mobile";
      //this.bpmForm.name = this.bpmForm.formName;
      this.formId = "";
      this.formDefId = "";
      this.formEditorDialogVisible = true;
      if (!boo) {
        this.$refs.eipBoDialog.handleClose();
      }
    },
    //设置分类
    openTypeSetDialog() {
      this.updateTableData = this.$refs.htTable.$refs.htTable.selection;
      if (this.updateTableData.length == 0) {
        this.$message({
          message: "请先选择需要设置分类的数据",
          type: "warning",
        });
        return;
      }
      this.$refs.typeSetDialog.showDialog({});
    },
    sysTypeDialogOnConfirm(data) {
      var id = [];
      for (let i = 0; i < this.updateTableData.length; i++) {
        id.push(this.updateTableData[i].id);
      }
      let this_ = this;
      this.$http
        .get(
          "${portal}/sys/sysType/v1/updateEntitySysType?typeID=" +
            data.id +
            "&entityIds=" +
            id.join(",")
        )
        .then(function (resp) {
          if (resp.data && resp.data.state) {
            this_.$message({ message: resp.data.message, type: "success" });
            setTimeout(function () {
              this_.dialogVisible = false;
              this_.$refs.htTable.load();
            }, 3000);

            return;
          }
          this_.$message.error(resp.data.message);
        });
    },
    handleCloseFormVersion() {
      this.formVersionVisible = false;
    },
    formAuth(formKey) {
      let param = {
        flowKey: "",
        formKey: formKey,
        nodeId: "",
        parentflowKey: "",
        type: "1",
      };
      this.$refs.flowFormAuth.showDialog(param);
    },
    handleNodeClick(node) {
      if (node.typeKey == "FORM_TYPE") {
        this.typeIdQuery = null;
      } else {
        this.bpmForm.typeName = node.name;
        this.typeIdQuery = {
          property: "typeId",
          value: node.id,
          group: "typeId",
          operation: "EQUAL",
          relation: "AND",
        };
      }
      this.$refs.htTable.load();
    },
    check(data, checkObj) {
      if (checkObj.checkedKeys.length == 0) {
        this.typeIdQuery = null;
      } else {
        this.typeIdQuery = {
          property: "typeId",
          value: checkObj.checkedKeys.join(","),
          group: "typeId",
          operation: "IN",
          relation: "AND",
        };
      }
      this.$refs.htTable.load();
    },
    rowClick(row, column, event) {
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    loadData(param, cb) {
      let _param = {};
      _param = { ..._param, ...param };
      if (this.typeIdQuery) {
        _param.querys.push(this.typeIdQuery);
      }

      form
        .getPageJson(_param)
        .then((response) => {
          this.data = response.rows;

          this.pageResult = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total,
          };
        })
        .finally(() => cb());
    },
    handleCommand(params) {
      this.formRow = params.row;
      switch (params.command) {
        case "edit":
          this.bpmForm.bos = [];
          this.formId = params.row.id;
          this.formDefId = params.row.defId;
          this.formEditorDialogVisible = true;
          break;
        case "preview":
          if (this.currentUser && this.currentUser.account) {
            window.open(
              window.context.mobile +
                "/previewForm/" +
                params.row.id +
                "?token=" +
                this.currentUser.token,
              // Base64.encode(this.currentUser.account),
              "_blank"
            );
          }
          break;
        case "publish":
          this.$confirm("是否确定发布表单?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
            .then(() => {
              this.$http
                .post(
                  "${form}/form/form/v1/publish",
                  {},
                  { formId: params.row.id }
                )
                .then((response) => {
                  if (response.data.state) {
                    this.$message({
                      type: "success",
                      message: response.data.message,
                    });
                    this.$refs.htTable.load();
                  } else {
                    this.$message.$error(response.data.message);
                  }
                });
            })
            .catch(() => {});

          break;
        case "formRight":
          this.formAuth(params.row.formKey);
          break;
        case "mobileForm":
          this.$confirm("是否确定生成手机表单?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
            .then(() => {
              this.createMobileForm(params.row);
            })
            .catch(() => {});

          break;
        case "copy":
          this.saveCopy();
          break;
        default:
          break;
      }
    },
    saveCopy() {
      this.newForm.id = this.formRow.id;
      this.dialogSaveCopyVisible = true;
    },
    handleCloseSaveCopy() {
      this.newForm = { id: "", name: "", formKey: "", typeId: "", typeName: "" };
      this.dialogSaveCopyVisible = false;
      this.$refs.htTable.load();
    },
    afterSaveData() {
      this.handleCloseSaveCopy();
    },
    handleClose() {
      this.dialogVisible = false;
    },
    openAddDailog() {
      this.$refs.eipBoDialog.showDialog([], "mobile");
      // this.dialogVisible = true;
      this.$set(this.bpmForm, "formKey", "");
      this.$set(this.bpmForm, "bos", "");
      this.$set(this.bpmForm, "desc", "");
      this.$set(this.bpmForm, "formName", "");
      this.$set(this.bpmForm, "name", "");
      if (this.bpmForm.typeName) {
        this.$set(this.bpmForm, "typeName", this.bpmForm.typeName);
      } else {
        this.$set(this.bpmForm, "typeName", "");
      }
      this.$set(this.bpmForm, "typeId", "");
      this.$set(this.bpmForm, "id", "");
      this.$set(this.bpmForm, "defId", "");
      this.$set(this.bpmForm, "rev", 1);
    },
    handleCloseFormEditor() {
      this.formEditorDialogVisible = false;
      this.$refs.htTable.load();
    },
    toFormDesigner() {
      this.$validator.validateAll("addBpmForm").then((result) => {
        if (result) {
          this.bpmForm.formType = "mobile";
          this.bpmForm.name = this.bpmForm.formName;
          this.formId = "";
          this.formDefId = "";
          this.formEditorDialogVisible = true;
          this.handleClose();
        } else {
          this.$message.error("表单未正确填写");
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.form-editor-dialog >>> .el-dialog__header {
  display: none;
}

.form-version__dialog /deep/ > .el-dialog > .el-dialog__body {
  padding: 0 10px;
}

.form-editor-dialog >>> .el-dialog__body {
  padding: 0;
  height: 100%;
}
@media (max-width: 1366px){
    /deep/ .search-container__col{
      flex-wrap: wrap;
      .el-button-group{
        margin-top: 10px;
      }
  }
}
</style>
