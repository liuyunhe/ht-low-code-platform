<template>
  <el-container class="fullheight" style="border: 1px solid #eee">
    <ht-aside-tree type-key="FORM_TYPE" @node-click="handleNodeClick" @check="check" />
    <el-container>
      <el-main>
        <ht-table @load="loadData" :data="data" :pageResult="pageResult" :selection="true" quick-search-props="name,alias" :show-export="false" :default-sorter="[{ direction: 'DESC', property: 'create_time_' }]" ref="htTable" @row-click="rowClick">
          <template v-slot:toolbar>
            <el-button-group>
              <el-button size="small" @click="handleFormSelectOpen" icon="el-icon-plus">添加</el-button>
              <el-button
                size="small"
                @click="
                  importDialogVisible = true;
                  flowTypeSelectorCatId = '';
                  flowTypeSelectorCatName = '';
                "
                icon="el-icon-back"
                >导入</el-button
              >
              <el-button size="small" @click="handExport" icon="el-icon-right">导出</el-button>
              <ht-delete-button :url="formDeleteUrl" :htTable="$refs.htTable" style="margin: 0">删除</ht-delete-button>
            </el-button-group>
          </template>
          <template>
            <ht-table-column type="index" width="50" align="center" label="序号" />
            <ht-table-column prop="name" label="名称" :sortable="true" :show-overflow-tooltip="true">
              <template slot-scope="scope">
                <el-link type="primary" @click="edit(scope.row)" title="查看详情">{{ scope.row.name }}</el-link>
              </template>
            </ht-table-column>
            <ht-table-column prop="alias" label="别名" :sortable="true" />
            <ht-table-column prop="boDefAlias" label="业务对象别名" :sortable="true" />
            <ht-table-column prop="typeName" label="分类" />
            <ht-table-column prop="subject" label="绑定流程名称" />
            <ht-table-column width="150" label="操作">
              <template v-slot="{ row }">
                <el-dropdown
                  size="mini"
                  split-button
                  @command="handleCommand"
                  @click="
                    handleCommand({
                      row: row,
                      command: 'preview',
                    })
                  "
                >
                  <span> 预览 </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :command="{ row: row, command: 'addToFront' }">发布为前端菜单</el-dropdown-item>
                    <el-dropdown-item :command="{ row: row, command: 'addToManager' }">发布为管理端菜单</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
            </ht-table-column>
          </template>
        </ht-table>
      </el-main>
    </el-container>

    <el-dialog title="导入数据报表" :visible.sync="importDialogVisible" width="40%" top="30vh" :close-on-click-modal="false" v-if="importDialogVisible">
      <div style="height: 150px; padding-left: 20px">
        <eip-sys-type-selector placeholder="请选择分类" type-key="FORM_TYPE" v-model="flowTypeSelectorCatName" :sys-type-id.sync="flowTypeSelectorCatId" :validate="{ required: true }" />
        <br /><br />
        <el-upload style="display: inline-block" :action="imporCheckUrl" :on-success="hadleUploadResult" :on-error="hadleUploadResult" :headers="uploadHeaders" :on-exceed="onExceed" accept=".zip" :before-upload="beforeUpload" :limit="1" :data="{ isCheck: true }" :auto-upload="false" ref="upload">
          <el-button size="small" icon="el-icon-upload">选择表单列表</el-button>
        </el-upload>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitImport" element-loading-text="拼命导入中" v-loading.fullscreen.lock="fullscreenLoading">确 定</el-button>
        <el-button @click="importDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>

    <!-- 添加数据报表 开始 -->
    <el-dialog width="60%" title="选择表单" :visible="selectFormVisible" :before-close="handleFormSelectClose" :close-on-click-modal="false" custom-class="form_dialog">
      <template>
        <ht-table @load="loadFormData" :data="formData" :pageResult="formPageResult" :selectable="false" :show-export="false" :show-custom-column="false" :default-sorter="[{ direction: 'DESC', property: 'updateTime' }]" quick-search-props="name,alias" v-if="selectFormVisible">
          <template>
            <ht-table-column type="index" width="50" align="center" label="序号" />
            <ht-table-column prop="name" label="名称" :show-overflow-tooltip="true" :sortable="true">
              <template slot-scope="scope">
                <el-link type="primary" @click="addFormTemplate(scope.row)" title="选择">{{ scope.row.name }}</el-link>
              </template>
            </ht-table-column>
            <ht-table-column prop="formKey" label="表单key" :sortable="true" />
            <ht-table-column prop="version" label="版本" :sortable="true" />
            <ht-table-column prop="typeName" label="分类" :sortable="true" />
          </template>
        </ht-table>
      </template>
    </el-dialog>
    <!-- 添加数据报表 结束 -->

    <!-- 编辑数据报表  开始-->
    <ht-sidebar-dialog width="100%" :show-close="false" :close-on-click-modal="false" :visible="datatemplateEditVisible" :before-close="handleClose" class="dt-edit__dialog">
      <template v-slot:title>
        <div class="flex" style="justify-content: space-between">
          <el-page-header @back="datatemplateEditVisible = false;share = {};showShareBtn = '';" :content="dataTemplateName"></el-page-header>
          <el-button-group>
            <el-button @click="handleTemplateDataSave" type="primary" icon="el-icon-check">保存</el-button>
            <el-button v-if="currentDataTemplateData.bpmDataTemplate && currentDataTemplateData.bpmDataTemplate.id" @click="handleTemplateDataPreview" icon="el-icon-view">预览</el-button>
            <el-button v-if="currentDataTemplateData.bpmDataTemplate && currentDataTemplateData.bpmDataTemplate.id" @click="handleTemplateEdit" icon="el-icon-edit">编辑模板</el-button>
            <el-button v-if="currentDataTemplateData.bpmDataTemplate && currentDataTemplateData.bpmDataTemplate.id" @click="addToMenu('manage')" icon="el-icon-plus">添加到后端菜单</el-button>
            <el-button v-if="currentDataTemplateData.bpmDataTemplate && currentDataTemplateData.bpmDataTemplate.id" @click="addToMenu('front')" icon="el-icon-plus">添加到前端菜单</el-button>
            <el-dropdown split-button  @command="handleShareCommand" v-if="currentDataTemplateData.bpmDataTemplate && currentDataTemplateData.bpmDataTemplate.id && showShareBtn == 1">
              <i class="el-icon-share">外链</i>
              <el-dropdown-menu slot="dropdown" >
                <el-dropdown-item v-clipboard:copy="share.frontAddUrl" v-clipboard:success="onCopy" v-clipboard:error="onError">复制地址</el-dropdown-item>
                <el-dropdown-item :command="{command:'qr'}">二维码</el-dropdown-item>
                <el-dropdown-item :command="{command:'set'}">设置有效期</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-button-group>
        </div>
      </template>
      <template>
        <el-tabs
          v-if="datatemplateEditVisible && tabsVisible"
          type="card"
          style="height: 100%;"
          v-model="activeName"
          @tab-click="handlePaneClick"
        >
          <el-tab-pane label="基本信息" name="baseSetting">
            <BaseSetting ref="BaseSetting" :focusAlias="focusAlias" :showShareBtn.sync="showShareBtn" :data.sync="currentDataTemplateData" />
          </el-tab-pane>

          <el-tab-pane label="显示字段" name="displaySetting">
            <DisplaySetting ref="DisplaySetting" :data.sync="currentDataTemplateData" />
          </el-tab-pane>

          <el-tab-pane label="查询字段" name="conditionSetting">
            <span slot="label">
              <el-tooltip content="流程字段不支持查询" placement="top">
                <i class="el-icon-info"></i>
              </el-tooltip>
              查询字段
            </span>
            <ConditionSetting ref="ConditionSetting" :data.sync="currentDataTemplateData" />
          </el-tab-pane>

          <el-tab-pane label="排序字段" name="sortSetting">
            <span slot="label">
              <el-tooltip content="流程字段不支持排序" placement="top">
                <i class="el-icon-info"></i>
              </el-tooltip>
              排序字段
            </span>
            <SortSetting ref="SortSetting" :data.sync="currentDataTemplateData" />
          </el-tab-pane>
          <el-tab-pane label="筛选字段" name="filterFiledSetting">
            <span slot="label">
              <el-tooltip content="日期类型与大文本类型不支持筛选" placement="top">
                <i class="el-icon-info"></i>
              </el-tooltip>
              筛选字段
            </span>
            <FilterFiledSetting ref="FilterFiledSetting" :data.sync="currentDataTemplateData" />
          </el-tab-pane>

          <el-tab-pane label="数据过滤" name="filterSetting">
            <FilterSetting ref="FilterSetting" :data.sync="currentDataTemplateData" />
          </el-tab-pane>

          <el-tab-pane label="功能按钮" name="manageSetting">
            <ManageSetting ref="ManageSetting" :data.sync="currentDataTemplateData" />
          </el-tab-pane>

          <el-tab-pane label="过滤树" name="filterTreeSetting">
            <filter-tree-setting ref="FilterTreeSetting" :data.sync="currentDataTemplateData" />
          </el-tab-pane>
          <el-tab-pane label="提醒设置" name="remindSetting">
            <RemindSetting ref="RemindSetting" :data.sync="currentDataTemplateData" />
          </el-tab-pane>
          <el-tab-pane label="汇总设置" name="SummarySetting">
            <summary-setting ref="SummarySetting" :data.sync="currentDataTemplateData" />
          </el-tab-pane>
          <el-tab-pane label="子表字段" name="subFields">
            <sub-fields ref="subFields" :data.sync="currentDataTemplateData" />
          </el-tab-pane>
        </el-tabs>
      </template>
    </ht-sidebar-dialog>
    <!-- 编辑数据报表  结束-->

    <!-- 数据报表预览 开始 -->
    <ht-sidebar-dialog width="100%" title="报表预览" :visible="previewDialogVisible" :before-close="handlePreviewClose">
      <TemplatePreviewDialog ref="TemplatePreviewDialog" :alias="currentPreviewTemplateAlias" />
    </ht-sidebar-dialog>
    <!-- 数据报表预览 结束 -->
    <el-dialog title="选择显示BO表" :visible.sync="boVisible" width="30%">
      <el-form>
        <ht-form-item label="BO表">
          <ht-select v-model="boId" :options="boData" :props="{ key: 'id', value: 'desc' }" />
        </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addFormTemplateByFormKey(selectFormKey, boId)" type="primary">确定</el-button>
        <el-button @click="boVisible = false">取消</el-button>
      </div>
    </el-dialog>
    <template-add-to-menu ref="templateAddToMenu" name="templateAddToMenu" :alias="selectAlias" append-to-body />
    <el-dialog :visible.sync="QRCodeDialog" width="340px" @opened="foundQRCode"  :center="true">
      <div id="QRCodeAnddDesc" style="text-align:center">
        <canvas id="QRCode" v-show="QRCodeShow"></canvas>
      </div>
      <span slot="footer" v-show="QRCodeShow">
        <el-button type="primary" v-clipboard:copy="share.mobileAddUrl" v-clipboard:success="onCopy" v-clipboard:error="onError">复制URL</el-button>
        <el-button type="success" @click="downloadQRCode">下载二维码</el-button>
      </span>
    </el-dialog>

    <el-dialog :visible.sync="shareLoseTimeDialog" top="20vh" width="400px">
      <div style="text-align:center">
        <el-date-picker
          v-if="shareLoseTimeDialog"
          v-model="share.tempLoseTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetime"
          placeholder="选择截止时间">
        </el-date-picker>
      </div>
      <span slot="footer" >
        <el-button type="primary" @click="saveShareLoseTime">确定</el-button>
        <el-button  @click="shareLoseTimeDialog = false">取消</el-button>
      </span>
    </el-dialog>



  </el-container>
</template>
<script>
import form from '@/api/form.js';
import $ from 'jquery';
import { mapState, mapActions } from 'vuex';
const htAsideTree = () => import('@/components/common/HtAsideTree.vue');
const BaseSetting = () => import('@/components/form/dataTemplate/BaseSetting.vue');
const DisplaySetting = () => import('@/components/form/dataTemplate/DisplaySetting.vue');
const ConditionSetting = () => import('@/components/form/dataTemplate/ConditionSetting.vue');
const SortSetting = () => import('@/components/form/dataTemplate/SortSetting.vue');
const FilterSetting = () => import('@/components/form/dataTemplate/FilterSetting.vue');
const ManageSetting = () => import('@/components/form/dataTemplate/ManageSetting.vue');
const TemplatePreviewDialog = () => import('@/components/form/dataTemplate/TemplatePreviewDialog.vue');
const filterTreeSetting = () => import('@/components/form/dataTemplate/FilterTreeSetting.vue');
const eipSysTypeSelector = () => import('@/components/selector/EipSysTypeSelector.vue');
const FilterFiledSetting = () => import('@/components/form/dataTemplate/FilterFiledSetting.vue');
const RemindSetting = () => import('@/components/form/dataTemplate/RemindSetting.vue');
const SummarySetting = () => import('@/components/form/dataTemplate/SummarySetting.vue');
const SubFields = () => import('@/components/form/dataTemplate/SubFields.vue');
const TemplateAddToMenu = () => import('@/components/form/dataTemplate/TemplateAddToMenu.vue');
import req from '@/request.js';
import QRCode from "qrcode";

export default {
  components: {
    htAsideTree,
    BaseSetting,
    DisplaySetting,
    ConditionSetting,
    SortSetting,
    FilterSetting,
    ManageSetting,
    TemplatePreviewDialog,
    filterTreeSetting,
    RemindSetting,
    eipSysTypeSelector,
    FilterFiledSetting,
    SummarySetting,
    SubFields,
    TemplateAddToMenu,
  },
  data() {
    return {
      uploadHeaders: { Authorization: 'Bearer ' + this.$store.state.login.currentUser.token },
      asideShow: true,
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name',
      },
      pageResult: {
        page: 1,
        pageSize: 20,
        total: 0,
      },
      data: [],
      selectTypeIds: '',
      fullscreenLoading: false,
      importDialogVisible: false,
      flowTypeSelectorCatId: '', //数据报表分类ID
      flowTypeSelectorCatName: '', //数据报表分类名称
      datatemplateEditVisible: false,
      selectFormVisible: false,
      formEditorDialogVisible: false,
      previewDialogVisible: false,
      templateId: null,
      selectFormKey: null,
      formData: [],
      formPageResult: {
        page: 1,
        pageSize: 20,
        total: 0,
      },
      currentDataTemplateData: {},
      activeName: 'baseSetting',
      currentPreviewTemplateAlias: '',
      focusAlias: false,
      boVisible: false,
      boData: [],
      boId: '',
      selectAlias: '',
      QRCodeShow:false,
      QRCodeDialog:false,
      showShareBtn:"",
      tabsVisible: true,
      share:{
        loseTime:'',
        frontAddUrl: '',
        mobileAddUrl:'',
        tempLoseTime:''
      },
      shareLoseTimeDialog:false
    };
  },
  watch:{
    showShareBtn: function(newVal, oldVal) {
      if (newVal == 1 && !this.share.id) {
        this.getShareManage();
      }
    }
  },
  computed: mapState({
    imporCheckUrl: function (mapState) {
      return window.context.form + '/form/dataTemplate/v1/importCheck?typeId=' + this.flowTypeSelectorCatId;
    },
    frontUrl: function (state) {
      return (
        window.context.front + '/statement/template/preview/' + this.currentPreviewTemplateAlias + '/true' + '?token=' + state.login.currentUser.token
        // Base64.encode(state.login.currentUser.account)
      );
    },
    formDeleteUrl: function () {
      return `${window.context.form}/form/dataTemplate/v1/remove`;
    },
    dataTemplateName: function () {
      return this.currentDataTemplateData.bpmDataTemplate && this.currentDataTemplateData.bpmDataTemplate.name ? this.currentDataTemplateData.bpmDataTemplate.name : '';
    },
  }),
  mounted() {},
  methods: {
    handleShareCommand(params){
      if (!params) {
        return;
      }
      switch (params.command) {
        case 'qr':
          const this_ = this;
          if (!this.currentDataTemplateData.bpmDataTemplate || !this.currentDataTemplateData.bpmDataTemplate.mobileFormAlias) {
            this_.$message.warning('请先绑定手机表单并保存!');
            return;
          }else if(this.currentDataTemplateData.bpmDataTemplate || this.currentDataTemplateData.bpmDataTemplate.mobileFormAlias){
            req.get(window.context.form+"/form/form/v1/checkKey?key="+this_.currentDataTemplateData.bpmDataTemplate.mobileFormAlias).then(res=>{
              if(!res.data){
                this_.$message.warning('绑定手机表单的不存在');
                return;
              }else{
                this_.QRCodeDialog = true;
              }
            })
          }
          break;
        case 'set':
          this.$set(this.share,"tempLoseTime",this.share.loseTime)
          this.shareLoseTimeDialog = true;
          break;
        default:
          break;
      }
    },
    downloadQRCode(){
      let canvas = document.getElementById("QRCode");
      let a = document.createElement("a");
      a.download =this.currentDataTemplateData.bpmDataTemplate.name+ "_二维码.jpg";
      a.href = canvas.toDataURL();
      a.dispatchEvent(new MouseEvent('click'))
    },
    foundQRCode(){
      let msg = document.getElementById("QRCode");
      QRCode.toCanvas(msg, this.share.mobileAddUrl, function (error) {
        console.log(error);
      });
      this.QRCodeShow = true;
    },
    onCopy(e) {
      this.$message.success('内容已复制到剪切板！');
    },
    onError(e) {
      this.$message.error('抱歉，复制失败！');
    },
    rowClick(row, column, event) {
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    //导出
    handExport() {
      let elTable = this.$refs.htTable;
      if (this.$refs.htTable.$refs && this.$refs.htTable.$refs.htTable) {
        elTable = this.$refs.htTable.$refs.htTable;
      }
      if (elTable && elTable.selection && elTable.selection.length == 0) {
        this.$message.warning('请选择至少一项记录');
        return;
      }

      let ids = [];

      for (let item of elTable.selection) {
        ids.push(item['id']);
      }

      if (ids.length == 0) {
        this.$message.warning('请选择至少一项记录');
        return;
      }
      let url = `${window.context.form}/form/dataTemplate/v1/exportXml?ids=${ids}`;
      req.download(url);
    },
    submitImport() {
      if (!this.$refs.upload.uploadFiles || this.$refs.upload.uploadFiles.length == 0) {
        this.$message.warning('请选择要导入的表单列表');
        return false;
      }
      if (!this.flowTypeSelectorCatId) {
        this.$message.warning('请选择要导入的分类');
        return false;
      }
      this.$refs.upload.submit();
    },
    hadleUploadResult(response, file, fileList) {
      var height = (document.documentElement.clientHeight || document.body.clientHeight) * 0.85 + 'px';
      this.fullscreenLoading = false;
      let this_ = this;
      if (response.state) {
        this_.handleImportSuccess();
      } else {
        if (response.message && response.message.indexOf('是否覆盖') > 0) {
          this.$confirm('<div style="overflow-x:hidden;overflow-y:auto ;max-height:' + height + '">' + response.message + '</div>', '提示', {
            cancelButtonText: '取消',
            dangerouslyUseHTMLString: true,
            confirmButtonText: '确定',
            type: 'warning',
            closeOnClickModal: false,
          })
            .then(() => {
              this_.fullscreenLoading = true;
              req.post(window.context.form + '/form/dataTemplate/v1/importSave?cacheFileId=' + response.value + '&confirmImport=' + true + '&typeId=' + this.flowTypeSelectorCatId).then(function (resp) {
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
              req.post(window.context.form + '/form/dataTemplate/v1/importSave?cacheFileId=' + response.value + '&confirmImport=' + false);
              this_.importDialogVisible = false;
              this.$refs.upload.clearFiles();
            });
        } else {
          this.$message.error(response.message || '表单列表导入失败');
        }
      }
    },
    handleImportSuccess() {
      this.$alert('如果报表对应表单不存在请先导入表单，报表才能正常使用', '表单列表导入成功', {
        confirmButtonText: '关闭',
        type: 'success',
      }).then(() => {
        this.importDialogVisible = false;
        this.$refs.htTable.load();
        this.$refs.upload.clearFiles();
      });
    },
    onExceed(file) {
      this.$message.warning('只能选择一个zip文件!');
    },
    beforeUpload(file) {
      if (!file.name.endsWith('.zip')) {
        this.$message.warning('只能导入zip文件!');
        return false;
      }
      this.imporActionUrl = this.imporCheckUrl;
      this.fullscreenLoading = true;
    },
    handleNodeClick(node) {
      if (node.id == '7') {
        this.selectTypeIds = '';
      } else {
        this.selectTypeIds = node.id;
      }
      this.$refs.htTable.load();
    },
    check(data, checkObj) {
      this.selectTypeIds = checkObj.checkedKeys.join(',');
      this.$refs.htTable.load();
    },
    loadData(param, cb) {
      if (this.selectTypeIds) {
        param.querys = param.querys || [];
        let hasTypeQuery = false;
        for (const query of param.querys) {
          if (query.property == 'typeId') {
            query.value = this.selectTypeIds;
            hasTypeQuery = true;
            break;
          }
        }
        if (!hasTypeQuery) {
          param.querys.push({
            group: 'main',
            operation: 'IN',
            property: 'typeId',
            relation: 'AND',
            value: this.selectTypeIds,
          });
        }
      }
      if (!param.sorter) {
        param.sorter = [
          {
            direction: 'DESC',
            property: 'UPDATE_TIME_',
          },
        ];
      } else {
        param.sorter.push({
          direction: 'DESC',
          property: 'UPDATE_TIME_',
        });
      }
      form
        .getDataTemplateData(param)
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
    loadFormData(param, cb) {
      form
        .getFormData(param)
        .then((response) => {
          this.formData = response.rows;

          this.formPageResult = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total,
          };
        })
        .finally(() => cb());
    },
    handleCommand(params) {
      switch (params.command) {
        case 'edit':
          this.templateId = params.row.id;
          this.editFormTemplate(this.templateId);
          break;
        case 'delete':
          break;
        case 'preview':
          this.preview(params.row);
          break;
        case 'assignMenu':
          break;
        case 'addToFront':
          // 发布为前端菜单
          this.selectAlias = params.row.alias;
          this.$refs.templateAddToMenu.showDialog('front', 'addReport');
          break;
        case 'addToManager':
          // 发布为管理端菜单
          this.selectAlias = params.row.alias;
          this.$refs.templateAddToMenu.showDialog('manage', 'addReport');
          break;
        default:
          break;
      }
    },
    edit(params) {
      this.templateId = params.id;
      this.editFormTemplate(this.templateId, params.boDefId);
    },
    preview(params) {
      this.currentPreviewTemplateAlias = params.alias;
      this.handleTemplateDataPreview();
    },
    //报表预览
    handleTemplateDataPreview() {
      window.open(this.frontUrl, '_blank');
      //this.previewDialogVisible = true;
    },
    //编辑报表模板
    handleTemplateEdit() {
      this.$refs.BaseSetting.showHtmlEditDialog();
    },
    //数据报表添加到菜单
    addToMenu(type) {
      this.$refs.BaseSetting.showAddToMenuDialog(type);
    },
    handlePreviewClose() {
      this.previewDialogVisible = false;
      this.currentPreviewTemplateId = '';
    },
    handleClose() {
      this.dialogVisible = false;
    },
    handleFormSelectOpen() {
      this.selectFormVisible = true;
      this.selectFormKey = null;
    },
    handleFormSelectClose() {
      this.selectFormVisible = false;
    },
    addFormTemplate(row) {
      this.selectFormKey = row.formKey;
      this.boData = [];
      form
        .getBODefByFormId(row.defId)
        .then((data) => {
          if (data.length > 1) {
            this.boVisible = true;
            this.boData = data;
          }
        })
        .then(() => {
          if (this.boData.length <= 1) {
            this.addFormTemplateByFormKey(row.formKey, '');
          }
        });
    },
    addFormTemplateByFormKey(formKey, boId) {
      this.selectFormVisible = false;
      form.getBpmDataTemplate(formKey, boId).then((response) => {
        this.currentDataTemplateData = response;
        this.currentPreviewTemplateAlias = response.data.alias;
        this.boVisible = false;
        this.datatemplateEditVisible = true;
      });
    },
    editFormTemplate: function (templateId, boId) {
      form.getBpmDataTemplateById(templateId, boId).then((response) => {
        this.currentDataTemplateData = response;
        this.currentPreviewTemplateAlias = response.data.alias;
        this.datatemplateEditVisible = true;
        //重新执行Setting组件内的mounted，加载初始数据
        this.tabsVisible = false;
        this.$nextTick(() => {
          this.tabsVisible = true;
        })
      });
    },
    getShareManage: function () {
      if(this.showShareBtn == 1 && !this.share.id){
        let me_ = this;
        this.share.url ="/statement/template/form/"+this.currentPreviewTemplateAlias+"/add/false/true";
        this.$http.post('${portal}/portal/shorturlManage/v1/getShortUrlByLong',this.share).then(function(resp){
          if (resp.data && resp.data.state) {
              resp.data.value.loseTime = resp.data.value.loseTime || '';
              resp.data.value.frontAddUrl = window.context.front+ "/"+resp.data.value.shortUrl;
              resp.data.value.mobileAddUrl = window.context.mobile+ "/"+resp.data.value.shortUrl;
              me_.share = resp.data.value;
          }else{
            me_.$message.error('获取表单外链短链接失败：'+resp.data.message);
          }
        })
      }
    },
    saveShareLoseTime(){
      let me_ = this;
      this.share.loseTime = this.share.tempLoseTime;
      this.$http.post('${portal}/portal/shorturlManage/v1/updateShorturlManage',this.share).then(function(resp){
        if (resp.data && resp.data.state) {
            me_.$message.success('设置成功');
            me_.shareLoseTimeDialog = false;
        }
      })
    },
    handlePaneClick: function (data) {
      if (data.name=='manageSetting'){
        this.currentDataTemplateData.displaySettingFields=JSON.stringify(this.$refs.DisplaySetting.displayFields);
      }
      if (data.alias) {
        this.currentTabComponent = data.alias;
      }
      if (data.name == 'defConfig') {
        this.flowConfigShouldRefresh = false;
      }
    },
    //保存数据视图
    handleTemplateDataSave: function () {
      let this_ = this;
      this.$refs.BaseSetting.validateForm(function () {
        this_.saveTemolate();
      });
    },
    async saveTemolate() {
      this.$refs.DisplaySetting.saveDisplayField(); //保存显示列数据
      if(!this.$refs.DisplaySetting.validateDisplayField()){
        return ;
      }
      let result = this.$refs.ConditionSetting.saveConditionField(); //保存查询条件数据
      if ('false' == result) {
        return;
      }
      this.$refs.SortSetting.saveSortField(); //保存排序数据
      this.$refs.subFields.saveSubField(); //保存子表数据
      if (!this.$refs.ManageSetting.validateManageField()) {
        return;
      }
      this.$refs.FilterSetting.saveFilterField(); //保存按钮数据
      this.$refs.ManageSetting.saveManageField(); //保存按钮数据
      this.$refs.FilterFiledSetting.saveFilteringField();
      this.$refs.FilterTreeSetting.saveFilterTreeField();
      this.$refs.SummarySetting.saveSummaryField();
      let res = await this.$refs.RemindSetting.saveRemindSettingList();
      if (!res) {
        this.activeName = 'remindSetting';
        return;
      }
      let templateData = JSON.parse(JSON.stringify(this.currentDataTemplateData.bpmDataTemplate));
      let sortArr = JSON.parse(templateData.sortField);
      for (let s = 0; s < sortArr.length; s++) {
        if (!sortArr[s].sort) {
          this.$message({ type: 'error', message: '请选择排序方式' });
          return false;
        }
      }
      if (!templateData.alias) {
        this.$message.error('报表别名不能为空，请输入报表别名！');
        return;
      }
      if (!templateData.name) {
        this.$message.error('报表名称不能为空，请输入报表名称！');
        return;
      }
      if (templateData.resetTemp == 1 && !templateData.templateAlias) {
        this.$message.error('请选择数据模板！');
        return;
      }
      //判断是否添加模糊查询
      let isIndistinct = 'hide';
      let conditionAllName = '';
      let conditionAllDesc = '';
      let conditionFields = this.$refs.ConditionSetting.conditionFields;
      for (var i = 0; i < conditionFields.length; i++) {
        if (conditionFields[i].mg) {
          isIndistinct = 'show';
          conditionAllName += conditionFields[i].na + ',';
          conditionAllDesc += conditionFields[i].cm + '/';
        }
      }
      if (conditionAllName != '') {
        conditionAllName = conditionAllName.substring(0, conditionAllName.length - 1);
      }
      if (conditionAllDesc != '') {
        conditionAllDesc = conditionAllDesc.substring(0, conditionAllDesc.length - 1);
      }
      templateData.isIndistinct = isIndistinct;
      templateData.conditionAllName = conditionAllName;
      templateData.conditionAllDesc = conditionAllDesc;
      //添加表单字段
      if (this.currentDataTemplateData.formField) {
        templateData.formField = JSON.stringify(this.currentDataTemplateData.formField);
      }
      let _this = this;
      form.saveTemplateData(JSON.stringify(templateData)).then((response) => {
        if (response.state) {
          this.$message.success(response.message);
          if (!templateData.id) {
            this.edit(response.value);
            _this.$refs.htTable.load(true);
          }
          this.focusAlias = false;
        } else {
          this.focusAlias = true;
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

.form-editor-dialog >>> .el-dialog__body {
  padding: 0;
  height: 100%;
}

.dt-edit__dialog /deep/ > .el-dialog > .el-dialog__header {
  padding: 8px 20px;
}
@media (max-width: 1280px) {
  /deep/ .search-container__col {
    flex-wrap: wrap;
    .el-button-group {
      margin-top: 10px;
    }
  }
}
/deep/.el-dialog__wrapper {
  overflow: unset !important;
}
/deep/.form_dialog .el-dialog__body {
  padding: 10px;
  height: calc(100% - 100px);
  overflow-y: auto;
}
/deep/.form_dialog .el-dialog {
  height: 90%;
  min-height: 400px;
  margin-top: 6vh !important;
}
/deep/.form_dialog .el-dialog__body .selector-table {
  height: 100% !important;
}
/deep/.form_dialog .el-dialog .el-dialog__body .select-tree-div {
  height: calc(100% - 60px);
  min-height: unset;
}
@media (max-height: 960px) {
  /deep/.form_dialog .el-dialog__body .el-container {
    height: 100% !important;
  }
}
</style>
