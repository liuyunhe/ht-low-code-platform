<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      @row-click="rowClick"
      :data="data"
      :selection="true"
      :pageResult="pageResult"
      quick-search-props="name,alias"
      ref="columnTable"
      :show-export="false"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button
            size="small"
            @click="handleCommand({command: 'add'})"
            icon="el-icon-plus"
            >添加</el-button
          >
          <el-button size="small" icon="el-icon-upload2" @click="importColumn">导入</el-button>
          <el-button size="small" icon="el-icon-download" @click="exportColumn">导出</el-button>
          <ht-delete-button
            :url="deleteUrl"
            :htTable="$refs.columnTable"
            style="margin:0;"
            >删除</ht-delete-button
          >
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="id" label="主键" :sortable="true" hidden />
        <ht-table-column
          prop="name"
          label="栏目名称"
          :sortable="true"
          :show-overflow-tooltip="true"
        >
          <template v-slot="{row}">
            <el-link
              @click="handleCommand({row: row, command: 'edit'})"
              type="primary"
              title="点击编辑"
              >{{ row.name }}</el-link
            >
          </template>
        </ht-table-column>
        <ht-table-column prop="alias" label="别名" :sortable="true" />
        <ht-table-column prop="dataMode" label="数据加载方式" :sortable="true">
          <template v-slot="{row}">
            <el-tag v-if="row.dataMode == 1" type="info">自定义查询方式</el-tag>
            <!-- <el-tag v-if="row.dataMode == 2" type="success"
              >webservice方法</el-tag
            > -->
            <el-tag v-if="row.dataMode == 3" type="primary">RESTful接口</el-tag>
            <el-tag v-if="row.dataMode == 4" type="success">表单列表</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column
          prop="dataFrom"
          label="方法路径"
          :sortable="true"
          :show-overflow-tooltip="true"
        />
        <ht-table-column
          prop="isPublic"
          label="栏目使用平台"
          :filters="[
            {text: '管理端', value: 0},
            {text: '手机端', value: 1},
            {text: '应用端', value: 2}
          ]"
        >
          <template v-slot="{row}">
            <el-tag v-if="row.isPublic == 0" type="info">管理端</el-tag>
            <el-tag v-if="row.isPublic == 1" type="success">手机端</el-tag>
            <el-tag v-if="row.isPublic == 2" type="warning">应用端</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column prop="tenantId" label="数据类型" :sortable="true">
          <template v-slot="{row}">
            <el-tag v-if="row.tenantId != -1" type="warning">私有数据</el-tag>
            <el-tag v-if="row.tenantId == -1" type="success"
              >平台公用数据</el-tag
            >
          </template>
        </ht-table-column>
        <ht-table-column width="150" label="操作">
          <template v-slot="{row}">
            <el-dropdown
              size="mini"
              split-button
              @command="handleCommand"
              @click="handleCommand({row: row, command: 'preview'})"
            >
              <span> <i class="icon icon-monitor"></i>预览</span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  icon="el-icon-menu"
                  :command="{row: row, command: 'auth'}"
                  >展示授权</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </ht-table-column>
      </template>
    </ht-table>

    <el-dialog
      width="70%"
      top="6vh"
      :title="sidebarTitle"
      :visible="dialogVisible"
      :before-close="handleClose"
      :close-on-click-modal="false"
      :class="{'is-fullscreen__dialog': isScreenFull}"
    >
      <el-form v-model="column" data-vv-scope="editForm">
        <div v-if="!isScreenFull">
          <el-row>
            <el-col :span="12">
              <ht-form-item label="栏目名称" prop="name" label-width="100px">
                <ht-input
                  class="ht"
                  v-model="column.name"
                  autocomplete="off"
                  :validate="{required: true}"
                  placeholder="请输入名称"
                  :maxlength="50"
                  :showWordLimit="true"
                ></ht-input>
              </ht-form-item>
            </el-col>
            <el-col :span="12">
              <ht-form-item label="栏目别名" prop="code" label-width="100px">
                <ht-input
                  class="ht"
                  v-model="column.alias"
                  v-pinyin="column.name"
                  @change="removeStyle"
                  name="columnAlias"
                  autocomplete="off"
                  :validate="
                    'required:true|regex:^[a-zA-Z][a-zA-Z0-9_]*$,只能输入字母、数字、下划线，且以字母开头|isExist:${portal}/portal/sysIndexColumn/sysIndexColumn/v1/getByAlias?alias=,' +
                      (column.id || '')
                  "
                  placeholder="请输入别名"
                  :disabled="column.id ? true : false"
                  :maxlength="50"
                  :showWordLimit="true"
                ></ht-input>
              </ht-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <ht-form-item label="栏目分类" label-width="100px">
                <eip-sys-type-selector
                  typeKey="INDEX_COLUMN_TYPE"
                  v-model="column.catalogName"
                  :sys-type-id.sync="column.catalog"
                ></eip-sys-type-selector>
              </ht-form-item>
            </el-col>
            <el-col :span="12">
              <ht-form-item label="栏目类型" label-width="100px">
                <ht-select
                  v-model="column.colType"
                  :disabled="column.id ? true : false"
                  class="ht"
                  @change="colTypeChange"
                  :validate="{required: true}"
                  :options="[
                    {key: 0, value: '一般类型栏目'},
                    {key: 1, value: '图表类型栏目'},
                    {key: 2, value: '流程公示栏目'}
                  ]"
                ></ht-select>
              </ht-form-item>
            </el-col>
          </el-row>
          <ht-form-item
            label="选择流程"
            v-if="column.colType == 2"
            label-width="100px"
          >
            <span style="margin-right:20px">{{ column.flowName }}</span>
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-plus"
              @click="showFlowDialog"
              >选择</el-button
            >
          </ht-form-item>
          <ht-form-item
            label="选择图表类型"
            v-if="column.colType == 1"
            label-width="100px"
          >
            <ht-radio
              v-model="column.chartType"
              :options="[
                {key: 1, value: '流程统计分析报表'},
                {key: 2, value: '自定义图表'}
              ]"
            />
          </ht-form-item>
          <ht-form-item
            label="选择图表"
            v-if="column.colType == 1"
            label-width="100px"
            style="display:block;"
          >
            <eip-chart-selector
              :dataParam.sync="column.dataParam"
              :chartType="column.chartType"
            ></eip-chart-selector>
          </ht-form-item>
          <ht-form-item
            label="更多路径"
            v-if="column.colType != 1"
            :maxlength="50"
            label-width="100px"
          >
            <ht-input
              autocomplete="off"
              v-model="column.colUrl"
              class="ht"
              style="width:350px;"
              :validate="{max: 100}"
            ></ht-input>
          </ht-form-item>
          <ht-form-item
            label="数据加载方式"
            v-if="column.colType != 1"
            label-width="100px"
          >
            <el-input
              v-model="column.dataFrom"
              autocomplete="off"
              placeholder="请输入方法路径"
              :readonly="column.dataMode === 1"
            >
              <el-select
                v-model="column.dataMode"
                slot="prepend"
                placeholder="请选择"
                style="width:150px;"
              >
                <el-option label="自定义查询方式" :value="1"></el-option>
                <!-- <el-option label="webservice方法" :value="2"></el-option> -->
                <el-option label="RESTful接口" :value="3"></el-option>
                <el-option label="表单列表" :value="4"></el-option>
              </el-select>
              <el-button
                type="primary"
                v-if="
                  column.dataMode == 3 ||
                    column.dataMode == 2 ||
                    column.dataMode == 0
                "
                @click="showSetParamDialog()"
                slot="append"
                >参数设置</el-button
              >
              <el-button
                type="primary"
                v-else
                icon="el-icon-search"
                @click="selectQuery(column.dataMode)"
                slot="append"
                >选 择</el-button
              >
            </el-input>
          </ht-form-item>
          <ht-form-item
            label="请求类型"
            v-if="column.dataMode == 3 && column.colType != 1"
            label-width="100px"
          >
            <ht-radio
              v-model="column.requestType"
              :options="[
                {key: 'POST', value: 'POST'},
                {key: 'GET', value: 'GET'}
              ]"
            />
          </ht-form-item>
          <ht-form-item
            label="栏目使用平台"
            label-width="100px"
            style="display:block;"
          >
            <ht-radio
              v-model="column.isPublic"
              v-if="column.isPublic ? column.isPublic : (column.isPublic = '0')"
              :options="[
                {key: '0', value: '管理端'},
                {key: '1', value: '手机端'},
                {key: '2', value: '应用端'}
              ]"
            />
          </ht-form-item>
          <el-row>
            <el-col :span="12">
              <ht-form-item label="栏目高度" label-width="100px">
                <ht-input
                  v-model="column.colHeight"
                  type="number"
                  placeholder="输入高度"
                ></ht-input
                >(单位：px)
              </ht-form-item>
            </el-col>
            <el-col :span="12">
              <ht-form-item
                label="首页分页"
                v-if="column.colType != 1 || column.chartType != 2"
                label-width="100px"
              >
                <ht-radio
                  v-model="column.needPage"
                  v-if="
                    column.needPage ? column.needPage : (column.needPage = '0')
                  "
                  :options="[
                    {key: '0', value: '不分页'},
                    {key: '1', value: '分页'}
                  ]"
                />
              </ht-form-item>
            </el-col>
          </el-row>
          <ht-form-item label="描述" label-width="100px">
            <ht-input
              v-model="column.memo"
              :maxlength="50"
              :showWordLimit="true"
            ></ht-input>
          </ht-form-item>
        </div>
        <ht-form-item
          label="栏目模版"
          v-if="column.colType != 1 || column.chartType != 2"
          label-width="100px"
        >
          <el-link
            :underline="false"
            @click="isScreenFull = !isScreenFull"
            :title="isScreenFull ? '退出全屏' : '全屏'"
            class="fullscreen-icon"
          >
            <i
              class="top-link-icon"
              :class="[isScreenFull ? 'icon-restore' : 'icon-fullscreen']"
            ></i>
          </el-link>
          <codemirror
            ref="mycode"
            v-model="column.templateHtml2"
            :options="cmOptions"
            class="code"
          ></codemirror>
        </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
          request-method="POST"
          :url="saveUrl"
          :model="tempSaveObj"
          :is-submit="isSubmit"
          scope-name="editForm"
          @before-save-data="beforeSaveData"
          @after-save-data="afterSaveData"
          >{{ $t('eip.common.save') }}</ht-submit-button
        >
        <el-button @click="handleClose">{{
          $t('eip.common.cancel')
        }}</el-button>
      </div>
    </el-dialog>
    <ht-load-data
      :url="loadDataUrl"
      context="portal"
      @after-load-data="afterLoadData"
    ></ht-load-data>
    <index-column-setparam
      ref="indexColumnSetparam"
      :set-params="column.dataParam"
      @handleDataparamSave="handledataParamSave"
    ></index-column-setparam>

    <el-dialog
      class="form-editor-dialog"
      destroy-on-close
      :visible="previewShow"
      :before-close="() => (previewShow = false)"
    >
      <ht-column
        :column-alias="previewAlias"
        v-if="previewShow"
        :fromPreview="true"
        class="preview_column"
      />
    </el-dialog>

    <eip-auth-dialog @onConfirm="columnAuthConfirm" ref="columnAuth" />
    <custom-dialog-dialog
      @onConfirm="selectedCustomDialog"
      ref="customDialogDialog"
      :single="true"
      :styleType="styleType"
    />
    <eip-flow-dialog
      ref="eipFlowDialog"
      name="eipFlowDialog"
      @onConfirm="dialogOnConfirm"
      :single="true"
      append-to-body
    >
    </eip-flow-dialog>
    <eip-data-template-dialog
      :appendToBody="true"
      ref="dataTemplateDialog"
      :single="true"
      @onConfirm="onDataTemplate"
    >
    </eip-data-template-dialog>
    <el-dialog title="上传文件" :visible="uploadDialogVisible" :before-close="beforeClose" name="uploadDialog" width="40%" top="30vh" custom-class="upload-dialog">
      <el-upload :action="uploadUrl" :http-request="handleImport" accept=".zip"
      :file-list="fileList" :limit="1" :auto-upload="false" ref="elUpload" class="upload-dialog__content">
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
import {mapState} from 'vuex'
import portal from '@/api/portal.js'
import sysType from '@/api/sysType.js'
import utils from '@/hotent-ui-util.js'
import IndexColumnSetparam from '@/components/portal/IndexColumnSetparam.vue'
import EipChartSelector from '@/components/selector/EipChartSelector.vue'
import EipSysTypeSelector from '@/components/selector/EipSysTypeSelector.vue'
import HtColumn from '@/components/common/HtColumn.vue'
const eipAuthDialog = () => import('@/components/dialog/EipAuthDialog.vue')
import CustomDialogDialog from '@/components/dialog/CustomDialogDialog.vue'
const eipFlowDialog = () => import('@/components/dialog/EipFlowDialog.vue')
let Base64 = require('js-base64').Base64
const EipDataTemplateDialog = () =>
  import('@/components/dialog/EipDataTemplateDialog.vue')
import {codemirror} from 'vue-codemirror'
import 'codemirror/theme/ambiance.css'
require('codemirror/mode/javascript/javascript')
export default {
  components: {
    IndexColumnSetparam,
    EipChartSelector,
    EipSysTypeSelector,
    HtColumn,
    codemirror,
    eipAuthDialog,
    CustomDialogDialog,
    eipFlowDialog,
    EipDataTemplateDialog
  },
  data() {
    return {
      isScreenFull: false,
      sidebarTitle: '',
      dialogVisible: false,
      previewShow: false,
      column: {},
      styleType: 0,
      blankObj: {
        name: '',
        alias: '',
        memo: '',
        catalog: '',
        catalogName: '',
        colType: '',
        dataMode: '',
        dataFrom: '',
        dataParam: '',
        dsAlias: '',
        colHeight: '',
        colUrl: '',
        templateHtml: '',
        isPublic: 0,
        supportRefesh: '',
        refeshTime: '',
        showEffect: '',
        requestType: '',
        needPage: 0,
        templateHtml2: '',
      },
      isSubmit: true,
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      loadDataUrl: '',
      previewAlias: '',
      cmOptions: {
        value: '',
        mode: 'vue',
        readOnly: false,
        smartIndent: true,
        tabSize: 2,
        theme: 'base16-light',
        lineNumbers: true,
        line: true,
        lineWrapping: true
      },
      curAuthColumnId: '',
      tempSaveObj: {},
      uploadDialogVisible:false,
      fileList:[],
      uploadUrl:`${window.context.portal}/portal/sysIndexColumn/sysIndexColumn/v1/uplaodColumn`, 
    }
  },
  mounted() {
    this.$validator = this.$root.$validator
  },
  computed: {
    deleteUrl: function() {
      return (
        window.context.portal +
        '/portal/sysIndexColumn/sysIndexColumn/v1/remove'
      )
    },
    saveUrl: function() {
      return (
        window.context.portal + '/portal/sysIndexColumn/sysIndexColumn/v1/save'
      )
    },
    codemirror() {
      return this.$refs.mycode.codemirror
    },
    ...mapState({
      currentUser: state => state.login.currentUser
    })
  },
  methods: {
    openScreenFull() {},
    //切换栏目类型
    colTypeChange() {
      if (this.column.colType != '1') {
        this.column.chartType = ''
      }
    },
    rowClick(row, column, event) {
      this.$refs.columnTable.$refs.htTable.toggleRowSelection(row)
    },
    preview(alias) {
      this.previewAlias = alias
      this.previewShow = true
    },
    handleClose() {
      this.dialogVisible = false
      this.loadDataUrl = ''
    },
    afterLoadData(data) {
      if (this.dialogVisible) {
        if (data.colType == 1) {
          data.chartType = 1
        } else if (data.colType == 4) {
          data.colType = 1
          data.chartType = 2
        }
        this.column = {...this.blankObj, ...data}
        this.column.templateHtml2 = Base64.decode(this.column.templateHtml)
        this.column.isPublic = '' + this.column.isPublic
        this.column.needPage = '' + this.column.needPage
        this.tempSaveObj = this.column
        setTimeout(() => this.$validator.validateAll('editForm'))
      }
    },
    showDialog(row) {
      this.dialogVisible = true
      if (row != undefined && row.id != '') {
        this.tempSaveObj = row
        this.loadDataUrl = `/portal/sysIndexColumn/sysIndexColumn/v1/getJson?id=${row.id}`
      } else {
        this.tempSaveObj = this.column
      }
    },
    loadData(param, cb) {
      portal
        .getIndexColumnPage(param)
        .then(response => {
          this.data = response.rows
          this.pageResult = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total
          }
        })
        .finally(() => cb && cb())
    },
    handleCommand(params) {
      switch (params.command) {
        case 'edit':
          this.sidebarTitle = '编辑栏目'
          this.showDialog(params.row)
          break
        case 'add':
          this.column = JSON.parse(JSON.stringify(this.blankObj))
          this.sidebarTitle = '添加栏目'
          this.showDialog()
          break
        case 'preview':
          if (params.row.isPublic == 2) {
            window.open(
              window.context.front +
                '/column/preview/' +
                params.row.alias +
                '?token=' +
                this.currentUser.token,
              // Base64.encode(this.currentUser.account),
              '_blank'
            )
          } else if (params.row.isPublic == 1) {
            window.open(
              window.context.mobile +
                '/htColumn/' +
                params.row.alias +
                '?token=' +
                this.currentUser.token,
              // Base64.encode(this.currentUser.account),
              '_blank'
            )
          } else {
            this.previewAlias = params.row.alias
            this.previewShow = true
          }
          break
        case 'auth':
          this.columnAuth(params.row)
          break
      }
    },
    async beforeSaveData() {
      let check = new RegExp('[\u4e00-\u9fa5]')
      let pattern = new RegExp(
        "[%--`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——| {}【】‘；：”“'。，、？]"
      )
      if (check.test(this.column.alias) || pattern.test(this.column.alias)) {
        this.$message({message: '请勿输入中文或特殊字符', type: 'warning'})
        document.getElementsByName('columnAlias')[0].style.border =
          '1px red solid'
        document.getElementsByName('columnAlias')[0].focus()
        this.isSubmit = false
      } else if (
        this.column.colType === 0 &&
        (this.column.dataMode === 2 || this.column.dataMode === 3) &&
        !this.column.templateHtml2
      ) {
        this.$message({message: '请填写栏目模板', type: 'warning'})
        this.isSubmit = false
      } else {
        this.column.templateHtml = Base64.encode(this.column.templateHtml2)
        this.tempSaveObj = this.column
        if (this.tempSaveObj.chartType == 2) {
          this.tempSaveObj.colType = 4
        }
        this.isSubmit = true
      }
    },
    afterSaveData() {
      this.dialogVisible = false
      this.$refs.columnTable.load()
    },
    showSetParamDialog() {
      this.$refs.indexColumnSetparam.showDialog()
    },
    handledataParamSave(val) {
      this.column.dataParam = val
    },
    columnAuth(row) {
      let this_ = this
      this.curAuthColumnId = row.id
      this.$http
        .get(
          '${portal}/sys/authUser/v1/getRightsAndDefaultRightType?id=' +
            row.id +
            '&objType=indexColumn'
        )
        .then(function(resp) {
          if (resp.data) {
            let conf = {
              right: resp.data.right,
              permissionList: resp.data.type,
              autoClose: false
            }
            this_.$refs.columnAuth.showDialog(conf)
          }
        })
    },
    columnAuthConfirm(data) {
      let param = {
        id: this.curAuthColumnId,
        objType: 'indexColumn',
        ownerNameJson: JSON.stringify(data)
      }
      let this_ = this
      this.$http
        .post('${portal}/sys/authUser/v1/saveRights', param)
        .then(function(resp) {
          if (resp.data) {
            if (resp.data.state) {
              this_.$message.success('授权成功')
              this_.$refs.columnAuth.closeDialog()
            } else {
              this_.$message.error(resp.data.message)
            }
          }
        })
    },
    selectQuery(op) {
      if (op == 1) {
        this.$refs.customDialogDialog.showDialog()
      } else if (op == 4) {
        this.$refs.dataTemplateDialog.showDialog()
      }
    },
    selectedCustomDialog(rsl) {
      this.column.dataFrom = JSON.stringify(rsl[0])
    },
    removeStyle() {
      document.getElementsByName('columnAlias')[0].style.border = ''
    },
    showFlowDialog() {
      this.$refs.eipFlowDialog.showDialog()
    },
    dialogOnConfirm(data, name) {
      if (name == 'eipFlowDialog') {
        let defKey = ''
        data.forEach(element => {
          defKey = element.defKey
          this.$set(this.column, 'flowKey', element.defKey)
          this.$set(this.column, 'flowName', element.name)
        })
        if (!defKey) {
          return
        }
        this.$confirm('是否加载流程展示栏目的默认配置？', '确认信息', {
          distinguishCancelAndClose: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          this.$set(
            this.column,
            'dataFrom',
            '${bpmRunTime}/runtime/instance/v1/query'
          )
          this.$set(this.column, 'dataMode', 3)
          let pam =
            '[{"name":"querys","type":"string","mode":"0","value":"[\\n {\\n \\"group\\": \\"advance\\",\\n \\"operation\\": \\"EQUAL\\",\\n \\"property\\": \\"proc_def_key_\\",\\n \\"relation\\": \\"AND\\",\\n \\"value\\": \\"' +
            defKey +
            '\\"\\n },\\n\\t\\t{\\n \\"group\\": \\"advance\\",\\n \\"operation\\": \\"EQUAL\\",\\n \\"property\\": \\"status_\\",\\n \\"relation\\": \\"AND\\",\\n \\"value\\": \\"end\\"\\n }\\n ]"},{"name":"sorter","type":"string","mode":"0","value":"[\\n {\\n \\"direction\\": \\"DESC\\",\\n \\"property\\": \\"create_time_\\"\\n }\\n ]"},{"name":"pageBean","type":"string","mode":"0","value":"{\\n \\"page\\": 1,\\n \\"pageSize\\": 10,\\n \\"total\\": 0\\n}"}]'
          this.$set(this.column, 'dataParam', pam)
          this.$set(this.column, 'requestType', 'POST')
          this.$set(this.column, 'isPublic', '2')
          this.$set(this.column, 'templateHtml2', '<homeInst :data="data"/>')
          this.$set(this.column, 'needPage', 1)
          //设置更多路径
          this.$set(this.column, 'colUrl', '/completeView/' + defKey)
        })
      }
    },
    onDataTemplate(res) {
      if (res.length == 1) {
        let obj = {name: res[0].name, alias: res[0].alias}
        this.$set(this.column, 'dataFrom', JSON.stringify(obj))
      }
    },
    exportColumn(){
      let selection = this.$refs.columnTable.$refs.htTable.selection;
      if(!selection || selection.length == 0){
        this.$message.warning("请至少选择一条记录");
        return ;
      }
      let ids = [];
      selection.forEach(column=>{
        ids.push(column.id);
      })
      this.$http.request({
        url:`${window.context.portal}/portal/sysIndexColumn/sysIndexColumn/v1/exportColumn`,
        data:ids,
        method:'post',
        responseType:"arraybuffer"
      });

    },
    beforeClose(){
      this.uploadDialogVisible = false;
      this.fileList.splice(0);
    },
    uploadSubmit(){
      if(this.$refs.elUpload.uploadFiles.length == 0){
        this.$message.warning("请上传文件");
        return ;
      }
      this.$refs.elUpload.submit();
    },
    importColumn(){
      this.uploadDialogVisible = true;
    },
    handleImport(param){
      let formData = new FormData();
      formData.append("file",param.file);
      portal.importColumn(formData).then(resp=>{
        if(resp.state){
          this.$message.success(resp.message);
          this.fileList.splice(0);
          this.uploadDialogVisible = false;
          this.$refs.columnTable.load();
        }else{
          this.beforeClose();
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
div[aria-invalid='true'] >>> .el-input__inner,
div[aria-invalid='true'] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
.el-select .el-input {
  width: 400px;
}

.code /deep/ .CodeMirror {
  font-family: monospace;
  /*height: 100px !important;*/
  color: black;
  direction: ltr;
  resize: both;
}
.preview_column {
  /deep/.container {
    padding-bottom: 5px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .container_icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      font-size: 20px;
      color: #fff;
      line-height: 50px;
      text-align: center;
    }
    .icon__blue__bg {
      background: rgba(54, 143, 255, 1);
    }
    .icon__pink__bg {
      background: rgba(255, 120, 110, 1);
    }
    .icon__deep__blue__bg {
      background: rgba(77, 119, 255, 1);
    }
    .icon__yellow__bg {
      background: rgba(255, 155, 89, 1);
    }
    .icon__purple__bg {
      background: rgba(82, 98, 255, 1);
    }
    .icon__green__bg {
      background: rgba(87, 202, 176, 1);
    }
    .container_box {
      text-align: center;
      .container_box_title,
      .container_box_count {
        margin: 6px 0 0 0;
        font-size: 12px;
        font-family: 'Microsoft YaHei';
        font-weight: 500;
        color: rgb(19, 18, 18);
      }
    }
  }
}
/deep/.el-dialog__wrapper {
  overflow: unset !important;
}
/deep/.el-dialog__body {
  padding: 10px 20px;
  color: #606266;
  font-size: 14px;
  word-break: break-all;
  height: calc(100% - 140px);
  overflow-y: auto;
}
/deep/.el-dialog {
  height: 90%;
  min-height: 400px;
}
/deep/.el-dialog__body .selector-table {
  height: 100% !important;
}
/deep/.el-dialog .el-dialog__body .select-tree-div {
  height: calc(100% - 60px);
  min-height: unset;
}
@media (max-height: 960px) {
  /deep/.el-dialog__body .el-container {
    height: 100% !important;
  }
}
.is-fullscreen__dialog {
  /deep/ .el-dialog {
    width: 100% !important;
    height: 100% !important;
    margin-top: 0vh !important;
    .el-dialog__body{
      padding-top: 20px;
    }
    .code .CodeMirror {
      height: 100%;
    }
  }
  
}

.fullscreen-icon{
  position: absolute;
  right: 0;
  top: -28px;
}
.top-link-icon {
    font-size: 15px;
    font-weight: bold;
    &:hover{
       color: #ff7717;
    }
  }
  /deep/ .el-dialog.upload-dialog{
    height:unset;
    /deep/ .el-dialog__body{
      height:unset;
    }
    .upload-dialog__content{
      height:150px;
    }
    min-height: unset;
  }

</style>
