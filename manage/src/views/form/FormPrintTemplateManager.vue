<template>
<div>
  <ht-table
    @load="loadData"
    :data="data"
    quick-search-props="fileName"
    :page-result="pageResult"
    :default-querys="[{ property: 'formKey', value: formKey }]"
    :show-export="false"
    :show-custom-column="false"
    ref="htTable"
  >
    <template v-slot:toolbar>
      <el-button-group>
        <el-upload
          ref="printTemplateFile"
          class="upload-demo"
          :action="actionUrl"
          :headers="header"
          :show-file-list="false"
          :on-success="success"
          :on-progress="progress"
          :before-upload="beforeAvatarUpload"
          multiple
        >
          <el-tooltip placement="top" effect="light">
            <div slot="content">附件格式支持：docx</div>
            <el-button icon="el-icon-plus">
              <el-tooltip effect="light">
                <div slot="content">
                  <p>
                      <span class="word-template-state">主表字段设置</span>
                  </p>
                  <table cellspacing="0" cellpadding="0" width="100%">
                      <tbody>
                          <tr class="firstRow">
                              <td width="294" valign="top" style="padding: 0px;">
                                  <p>
                                      <span class="word-template-state">姓名</span><span class="word-template-state">:</span> <strong><span class="word-template-state">{{</span></strong><span class="word-template-state">xm<strong>}}</strong></span>
                                  </p>
                                  <p>
                                      <span class="word-template-state">客户 ID:</span> <strong><span class="word-template-state">{{</span></strong><span class="word-template-state">id_<strong>}}</strong></span>
                                  </p>
                              </td>
                              <td width="66" valign="top" style="padding: 0px;"></td>
                              <td width="360" valign="top" style="padding: 0px;">
                                  年龄:<strong>{{</strong>nl<strong>}}</strong>&nbsp;
                                  <p>
                                      出生日期:<strong>{{</strong>csrq<strong>}}</strong>
                                  </p>
                              </td>
                          </tr>
                      </tbody>
                  </table>
                  <p>
                      <br/>
                  </p>
                  <p>
                      <span class="word-template-state">子表字段设置：</span>
                  </p>
                  <p>
                    <span class="word-template-state">建模关系为一对多：</span>
                  </p>
                  <table cellspacing="0" cellpadding="0" width="54">
                      <tbody>
                          <tr class="firstRow">
                              <td width="100" colspan="3" valign="top" style="border: 1px solid rgb(166, 166, 166); background: rgb(242, 242, 242); padding: 0px 5px; word-break: break-all;">
                                  <p>
                                      <strong><span class="word-template-state">{{</span></strong><span class="word-template-state">sub_zsttest}}</span><span class="word-template-state">子实体test</span>
                                  </p>
                              </td>
                          </tr>
                          <tr>
                              <td width="33" valign="top" style="border-right: 1px solid rgb(166, 166, 166); border-bottom: 1px solid rgb(166, 166, 166); border-left: 1px solid rgb(166, 166, 166); border-image: initial; border-top: none; background: rgb(242, 242, 242); padding: 0px 5px;">
                                  <p>
                                      <span class="word-template-state">字段1</span>
                                  </p>
                              </td>
                              <td width="33" valign="top" style="border-top: none; border-left: none; border-bottom: 1px solid rgb(166, 166, 166); border-right: 1px solid rgb(166, 166, 166); background: rgb(242, 242, 242); padding: 0px 5px;">
                                  <p>
                                      <span class="word-template-state">字段2</span>
                                  </p>
                              </td>
                              <td width="33" valign="top" style="border-top: none; border-left: none; border-bottom: 1px solid rgb(166, 166, 166); border-right: 1px solid rgb(166, 166, 166); background: rgb(242, 242, 242); padding: 0px 5px;">
                                  <p>
                                      <span class="word-template-state">字段3</span>
                                  </p>
                              </td>
                          </tr>
                          <tr>
                              <td width="33" valign="top" style="border-right: 1px solid rgb(166, 166, 166); border-bottom: 1px solid rgb(166, 166, 166); border-left: 1px solid rgb(166, 166, 166); border-image: initial; border-top: none; padding: 0px 5px;">
                                  <p style="text-align:left">
                                      <span class="word-template-state">{</span><span class="word-template-state">sub_zsttest</span><span class="word-template-state">.zd1}</span>
                                  </p>
                              </td>
                              <td width="33" valign="top" style="border-top: none; border-left: none; border-bottom: 1px solid rgb(166, 166, 166); border-right: 1px solid rgb(166, 166, 166); padding: 0px 5px;">
                                  <p>
                                      <span class="word-template-state">{</span><span class="word-template-state">sub_zsttest</span><span class="word-template-state">.zd2}</span>
                                  </p>
                              </td>
                              <td width="33" valign="top" style="border-top: none; border-left: none; border-bottom: 1px solid rgb(166, 166, 166); border-right: 1px solid rgb(166, 166, 166); padding: 0px 5px;">
                                  <p>
                                      <span class="word-template-state">{</span><span class="word-template-state">sub_zsttest</span><span class="word-template-state">.zd3}</span>
                                  </p>
                              </td>
                          </tr>
                      </tbody>
                  </table>
                  <p>
                    <span class="word-template-state">建模关系为一对一：</span>
                  </p>
                  <p>
                    <span class="word-template-state">字段一： {{</span><span class="word-template-state">sub_zsttest.zd1}}</span>
                    <span class="word-template-state" style="margin-left: 15px">字段二： {{</span><span class="word-template-state">sub_zsttest.zd2}}</span>
                  </p>
                  <p>
                    <span style="color: red;">常用标签类型：文本（<span>{{</span>var<span>}}</span>）、图片（<span>{{</span>var<span>}}</span>）、富文本（<span>{{</span>+var<span>}}</span>）</span>
                  </p>
                </div>
                <i class="icon-question" style="margin-right: 8px" />
              </el-tooltip>word模板
            </el-button>
          </el-tooltip>
        </el-upload>
      </el-button-group>
      <el-button icon="el-icon-download"  @click="downloadTemplate()" >模板下载</el-button>
      <el-button icon="el-icon-plus" @click="addFormTemplate()" >表单模板</el-button>
      <ht-delete-button :url="formDeleteUrl" :htTable="$refs.htTable">删除</ht-delete-button>
    </template>
    <template>
      <ht-table-column type="index" width="50" align="center" label="序号" />
      <ht-table-column
        prop="fileName"
        label="名称"
        :show-overflow-tooltip="true"
      />
      <ht-table-column
        prop="createTime"
        label="创建时间"
        :show-overflow-tooltip="true"
      />
      <ht-table-column prop="isMain" width="80" label="主版本">
        <template v-slot="{ row }">
          <el-tag v-if="row.isMain == 'Y'">是</el-tag>
          <el-tag type="danger" v-else>否</el-tag>
        </template>
      </ht-table-column>
      <ht-table-column prop="printType" width="120" label="打印类型">
        <template v-slot="{ row }">
          <el-tag v-if="row.printType == 'word'" type="success">word套打</el-tag>
          <el-tag v-if="row.printType == 'form'" type="warning">表单模板</el-tag>
        </template>
      </ht-table-column>
      <ht-table-column width="150" label="操作" align="left">
        <template v-slot="{ row }">
          <el-dropdown
            size="mini"
            split-button
            @command="handleCommand"
            @click="handleCommand({ row: row, command: 'download' })"
          >
            <span v-if="row.printType == 'word'"> <i class="el-icon-tickets"></i>下载</span>
            <span v-if="row.printType == 'form'"> <i class="el-icon-tickets"></i>编辑</span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                icon="el-icon-menu"
                :command="{ row: row, command: 'setMainVersion' }"
                v-if="row.isMain == 'N'"
                >设为主版本</el-dropdown-item
             >
              <el-dropdown-item
                icon="el-icon-menu"
                :command="{ row: row, command: 'setScriptStr' }"
               v-if="row.printType == 'word'"
                >编写脚本</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </ht-table-column>
    </template>
    <el-dialog
        title="编写脚本"
        :visible.sync="scriptStrDialog"
        width="70%"
        append-to-body
      >
          <span v-if="scriptStrDialog">
            <table class="form-table" cellspacing="0" cellpadding="0" border="0">
              <tbody>
                  <tr>
                      <th width="12%">脚本描述:</th>
                      <td>
                          <label>该脚本在 打印模板 时执行，用户可以使用 boMap 做操作。 例如 获取模板字段数据：boMap.get("sex");  设置模板字段数据: boMap.put("sex", "男");</label>
                      </td>
                  </tr>
                  <tr>
                      <th width="12%">脚本内容:</th>
                      <td>
                        <codemirror
                            v-model="scriptStr"
                            :options="cmOptions2"
                            style="width:98%;"
                        ></codemirror>
                      </td>
                  </tr>
              </tbody>
          </table>
        </span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="scriptStrDialog = false">取 消</el-button>
          <el-button type="primary" @click="updateScriptStr">确 定</el-button>
        </span>
      </el-dialog>

    <el-dialog
      width="60%"
      title="添加表单打印模板"
      :visible="dialogSaveCopyVisible"
      :before-close="handleCloseSaveCopy"
      :destroy-on-close="true"
      :append-to-body="true"
    >
      <form v-form data-vv-scope="saveCopyForm">
        <table class="form-table" cellspacing="0" cellpadding="0" border="0">
          <tbody>
            <tr>
              <th width="140px">表单名称:</th>
              <td>{{ oldForm.name }}</td>
              <th width="140px" class="is-required">表单打印模板名称</th>
              <td>
                <ht-input
                  v-model="newForm.name"
                  :validate="{ required: true }"
                />
              </td>
            </tr>
            <tr>
              <th width="140px">表单别名:</th>
              <td>{{ oldForm.formKey }}</td>
              <th width="140px" class="is-required">表单打印模板别名</th>
              <td>
                <ht-input
                  v-model="newForm.formKey"
                  v-pinyin="newForm.name"
                  autocomplete="off"
                  :validate="{
                    required: true,
                    isExist: '${form}/form/form/v1/checkKey?key=',
                    regex:{exp:'^[a-zA-Z][a-zA-Z0-9_]*$'}
                  }"
                  placeholder="请输入别名"
                ></ht-input>
              </td>
            </tr>
            <tr>
              <th width="140px">表单分类:</th>
              <td>{{ oldForm.typeName }}</td>
              <th width="140px" class="is-required">表单打印模板分类</th>
              <td>
                <EipSysTypeSelector
                  placeholder="请选择表单分类"
                  cat-id="7"
                  v-model="newForm.typeName"
                  :sys-type-id.sync="newForm.typeId"
                  :validate="{ required: true }"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="save()">保存</el-button>
        <el-button @click="handleCloseSaveCopy">
          {{ $t("eip.common.cancel") }}
        </el-button>
      </div>
    </el-dialog>
    <el-dialog
      class="form-editor-dialog"
      fullscreen
      :destroy-on-close="true"
      :visible.sync="formEditorDialogVisible"
      :before-close="handleCloseFormEditor"
      :close-on-press-escape="false"
      :append-to-body="true"
    >
      <FormDesigner
        :visibleDialog.sync="formEditorDialogVisible"
        :form-id.sync="formId"
        :form-def-id.sync="formDefId"
        :bos="bpmForm.bos"
        :add-bpm-form="bpmForm"
      />
    </el-dialog>
  </ht-table>
  </div>
</template>
<script>
import { mapState } from "vuex";
import { Loading } from "element-ui";
import utils from "@/hotent-ui-util.js";
import req from "@/request.js";
import form from "@/api/form.js";
const EipSysTypeSelector = () => import("@/components/selector/EipSysTypeSelector.vue");
const FormDesigner = () => import("@/components/form/FormDesigner.vue");

export default {
  name: "FormPrintTemlateManager",
  props: {
    formKey: {
      type: String,
      required: true
    },
    visible: {
      type: Boolean
    },
    formRow:{
      type: Object
    }
  },
  components: {
    EipSysTypeSelector,
    FormDesigner
  },
  data() {
    return {
      selecRow:{},
      scriptStr:"",
      scriptStrDialog:false,
      dialogSaveCopyVisible: false,
      formEditorDialogVisible: false,
      formId: null,
      formDefId: null,
      bpmForm: {
        formKey: "",
        bos: "",
        desc: ""
      },
      newForm: { id: "", name: "", formKey: "", typeId: "", typeName: "" },
      oldForm:{},
      data: [],
      pageResult: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      cmOptions2: {
        value: "",
        mode: "groovy",
        readOnly: false,
        smartIndent:true,
        tabSize: 1,
        theme: 'base16-light',
        lineNumbers: true,
        line: true,
      },
    };
  },
  computed: {
    ...mapState({
      currentUser: state => state.login.currentUser,
      header: state => {
        return { Authorization: `Bearer ${state.login.currentUser.token}` };
      },
      actionUrl: function() {
        return `${window.context.portal}/system/file/v1/upload`;
      },
      formDeleteUrl: function() {
        return `${window.context.form}/form/printTemplate/v1/removes`;
      }
    })
  },
  mounted() {
    this.$validator = this.$root.$validator;
    this.$root.$emit("resize");
    this.oldForm = this.formRow;
  },
  methods: {
    updateScriptStr(){
      this.selecRow.scriptStr=this.scriptStr;
      req.request({"url":"${form}/form/printTemplate/v1/","data":this.selecRow,"method":"PUT"}).then(res => {
        if(res.data.state){
            this.$message({
              message: '保存成功',
              type: 'success'
            });
        }else{
           this.$message.error('保存失败');
        }

        this.scriptStrDialog=false;
      });
    },
    downloadTemplate(){
      window.location.href = window.context.manage + '/static/docx/打印设置模板.docx';
    },
    handleCommand(params) {
      switch (params.command) {
        case "setMainVersion":
          var url =
            "${form}/form/printTemplate/v1/setDefaultVersion?id=" +
            params.row.id +
            "&formKey=" +
            params.row.formKey +
            "&printType=" +
            params.row.printType;
          req.get(url).then(res => {
            this.$message({
              type: "success",
              message: res.data.message
            });
            this.$refs.htTable.load();
          });
          break;
        case "download":
          if(params.row.printType == "word"){
            req.download(
              "${portal}/system/file/v1/downloadFile?fileId=" + params.row.fileId
            );
          }else if(params.row.printType == "form"){
            //编辑表单
            this.bpmForm.bos = [];
            this.formId = params.row.formId;
            this.formDefId = params.row.defId;
            this.formEditorDialogVisible = true;
          }
          break;
          case "setScriptStr":
          this.selecRow=params.row;
          this.scriptStr=params.row.scriptStr;
          this.scriptStrDialog=true;
          break;
        default:
          break;
      }
    },
    progress() {
      Loading.service("文件上传中");
    },
    setParamIsMain(param){
      let files = this.$refs.printTemplateFile.uploadFiles;
      if(files && files.length>0){
          if(files[0].name!=param.fileName){
            param['isMain'] = '';
          }
          let  successSize = 0;
          files.forEach(f =>{
            if(f.status=='success'){
              ++successSize;
            }
          })
          if(successSize==files.length){
            this.$refs.printTemplateFile.clearFiles();
          }
        }
    },
    success(response) {
      let loadingInstance = Loading.service("文件上传中");
      if (response.success) {
        let param = {
          fileId: response.fileId,
          fileName: response.fileName,
          formKey: this.formKey,
          printType: "word"
        };
        this.setParamIsMain(param);
        req.post("${form}/form/printTemplate/v1/save", param).then(response => {
          this.$message({
            type: "success",
            message: "上传模板成功"
          });
          var param = {
            sorter: [{ direction: "DESC", property: "createTime" }],
            querys: [
              {
                group: "defaultQueryGroup",
                operation: "EQUAL",
                relation: "AND",
                property: "formKey",
                value: this.formKey
              }
            ]
          };
          this.$refs.htTable.load();
        });
      } else {
        this.$message({
          type: "error",
          message: "模板上传失败"
        });
      }
      this.$nextTick(() => {
        // 以服务的方式调用的 Loading 需要异步关闭
        loadingInstance.close();
      });
    },
    beforeAvatarUpload(file) {
      var FileExt = file.name.replace(/.+\./, "");
      if ("docx" != FileExt.toLowerCase()) {
        this.$message({
          type: "warning",
          message: "请上传后缀名为docx的文档"
        });
        return false;
      }
    },
    close() {
      this.$emit("update:visible", false);
    },
    loadData(param, cb) {
      req
        .post("${form}/form/printTemplate/v1/getPrintList", param)
        .then(response => {
          this.data = response.data.rows;
          this.pageResult = {
            page: response.data.page,
            pageSize: response.data.pageSize,
            total: response.data.total
          };
        })
        .finally(() => cb());
    },
    handleClose() {
      this.dialogVisible = false;
    },
    //添加表单模板
    addFormTemplate(){
      this.newForm.id = this.oldForm.id;
      this.dialogSaveCopyVisible = true;
    },
    handleCloseSaveCopy() {
      this.newForm = { id: "", name: "", formKey: "", typeId: "", typeName: "" };
      this.dialogSaveCopyVisible = false;
    },
    save(){
      utils.validateForm(this, "saveCopyForm")
              .then(() =>{
                form.savePrintTemplate(this.newForm).then(resp =>{
                  if(resp.state){
                    this.dialogSaveCopyVisible = false;
                    this.handleCloseSaveCopy();
                    this.$refs.htTable.load();
                  }
                })
              })
              .catch(reason =>{
                let rules = reason.map(obj => {
                  return obj.rule;
                });
                if (rules.includes("isExist")) {
                  this.$message.error("已存在同名模板");
                }
                if (rules.includes("regex")) {
                  this.$message.error("只能输入字母、数字、下划线，且以字母开头");
                }
              })
    },
    handleCloseFormEditor() {
      this.formEditorDialogVisible = false;
      this.$refs.htTable.load();
    },
  }
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
div >>> .el-form-item__error {
  display: none;
}
.word-template-state{
  font-family:Hei
}
</style>
