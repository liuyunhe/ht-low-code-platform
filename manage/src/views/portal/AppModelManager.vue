<template>
  <el-container class="fullheight" style="border: 1px solid #eee">
    <ht-aside-tree
      type-key="appType"
      :is-default-auth="true"
      @node-click="handleNodeClick"
      @check="treeCheck"
    />
    <el-container>
      <el-main>
        <div class="fullheight">
          <ht-table
            @load="loadData"
            :data="data"
            :pageResult="pageResult"
            :selection="true"
            quick-search-props="name,content"
            :show-export="false"
            :show-custom-column="false"
            :default-querys="defaultQuerys"
            ref="htTable"
            @row-click="rowClick"
          >
            <template v-slot:toolbar>
              <el-button-group>
                <el-button
                  size="small"
                  @click="showDialog()"
                  icon="el-icon-plus"
                  >添加</el-button
                >
                <el-button
                  size="small"
                  @click="importDialogVisible = true"
                  icon="el-icon-back"
                  >导入</el-button
                >
                <el-button
                  size="small"
                  @click="handleExport"
                  icon="el-icon-right"
                  >导出</el-button
                >

                <el-tooltip placement="top">
                  <div slot="content">请先设置分类权限,再配置模块权限</div>
                  <el-button size="small" @click="auth()" icon="icon-question">
                  设置权限</el-button
                >
                </el-tooltip>
               
                <ht-delete-button
                  url="${portal}/portal/appModel/v1/remove"
                  :htTable="$refs.htTable"
                  style="margin: 0"
                  >删除</ht-delete-button
                >
              </el-button-group>
            </template>
            <template>
              <ht-table-column
                type="index"
                width="50"
                align="center"
                label="序号"
              />
              <ht-table-column
                prop="name"
                label="应用名称"
                :sortable="true"
                :show-overflow-tooltip="true"
              >
                <template v-slot="{row}">
                  <el-link
                    type="primary"
                    @click="showDialog(row.id)"
                    title="查看详情"
                    >{{ row.name }}</el-link
                  >
                </template>
              </ht-table-column>
              <ht-table-column
                prop="icon"
                label="图标"
                :sortable="true"
                :show-overflow-tooltip="true"
              >
                <template v-slot="{row}">
                  <i
                    :class="row.icon"
                    :style="{color: row.iconColor}"
                    class="app-icon"
                  ></i>
                </template>
              </ht-table-column>
              <ht-table-column
                prop="typeName"
                label="分类"
                :sortable="true"
                :show-overflow-tooltip="true"
              ></ht-table-column>
              <ht-table-column
                prop="mode"
                label="跳转模式"
                :sortable="true"
                :show-overflow-tooltip="true"
              >
                <template v-slot="{row}">
                  <el-tag type="success" v-if="row.mode === 1">站内地址</el-tag>
                  <el-tag type="primary" v-if="row.mode === 2">站外地址</el-tag>
                  <el-tag type="danger" v-if="row.mode === 3">表单列表</el-tag>
                  <el-tag type="warning" v-if="row.mode === 4">图表</el-tag>
                  <el-tag type="primary" v-if="row.mode === 5">新建流程</el-tag>
                </template>
              </ht-table-column>
              <ht-table-column
                prop="content"
                label="跳转内容"
                :sortable="true"
                :show-overflow-tooltip="true"
              >
                <template v-slot="{row}">
                  <span v-if="row.mode != 3 && row.mode != 4 && row.mode !=5">{{
                    row.content
                  }}</span>
                  <span
                    v-if="row.mode === 3 || row.mode === 5"
                    v-text="parseContent(row.content, row.mode)"
                  ></span>
                  <span
                    v-if="row.mode === 4"
                    v-text="parseName(row.name)"
                  ></span>
                </template>
              </ht-table-column>
              <ht-table-column
                prop="enable"
                label="是否启用"
                :sortable="true"
                :show-overflow-tooltip="true"
              >
                <template v-slot="{row}">
                  <el-tag v-if="row.enable === 0">未启用</el-tag>
                  <el-tag type="success" v-if="row.enable === 1">已启用</el-tag>
                </template>
              </ht-table-column>
              <ht-table-column
                prop="sn"
                label="排序"
                :sortable="true"
                :show-overflow-tooltip="true"
              ></ht-table-column>
              <ht-table-column width="150" label="操作">
                <template v-slot="{row}">
                  <el-button
                    v-if="row.enable === 0"
                    @click="updateEnable(row.id)"
                    >启用</el-button
                  >
                  <el-button
                    v-if="row.enable === 1"
                    @click="updateEnable(row.id)"
                    >禁用</el-button
                  >
                  <el-button @click="auth(row)">权限</el-button>
                </template>
              </ht-table-column>
            </template>
          </ht-table>

          <ht-sidebar-dialog
            width="32%"
            title="移动端应用"
            class="sp-manager__dialog"
            :visible="dialogVisible"
            :before-close="beforeCloseDialog"
          >
            <el-form v-form data-vv-scope="appModelForm">
              <ht-form-item label="分类">
                <template slot="label">
                  <el-tooltip placement="top">
                    <div slot="content">
                      <div>
                        请将应用挂在【应用中心】分类下的1级/2级下，3级及以下的分类不在移动端展示，请注意。
                      </div>
                    </div>
                    <i class="el-icon-question" /> </el-tooltip
                  >分类
                </template>
                <!-- <ht-input v-model="appModel.typeId" validate="required" /> -->
                <EipSysTypeSelector
                  placeholder="请选择分类"
                  typeKey="appType"
                  v-model="appModel.typeName"
                  :sys-type-id.sync="appModel.typeId"
                  :validate="{required: true}"
                  class="sys-type-selector"
                />
              </ht-form-item>
              <ht-form-item label="应用名称">
                <ht-input
                  v-model="appModel.name"
                  validate="required"
                  width="260px"
                />
              </ht-form-item>
              <ht-form-item label="图标">
                <div style="display: inline-flex">
                  <i
                    :class="appModel.icon"
                    :style="{color: appModel.iconColor}"
                    class="app-icon"
                  ></i>
                  <iconDialog @selected="selIcon" />
                  <el-color-picker
                    v-model="appModel.iconColor"
                  ></el-color-picker>
                </div>
              </ht-form-item>
              <ht-form-item label="跳转模式">
                <template slot="label">
                  <el-tooltip placement="top">
                    <div slot="content">
                      <div>
                        1、站内地址：可跳转到指定vue路由路径，如：跳转到我的待办，可填写为：/work/myMatters
                      </div>
                      <div>
                        2、跳转网页地址：跳转到站外的地址，如：http://www.hotent.com
                      </div>
                      <div>3、表单列表：跳转至指定的表单列表页面</div>
                      <div>4、图表：跳转至指定的图表页面</div>
                      <div>5、新建流程：跳转至启动流程页面</div>
                    </div>
                    <i class="el-icon-question" /> </el-tooltip
                  >跳转模式
                </template>
                <ht-select
                  v-model="appModel.mode"
                  :options="[
                    {key: 1, value: '站内地址'},
                    {key: 2, value: '跳转网页地址'},
                    {key: 3, value: '表单列表'},
                    {key: 4, value: '图表'},
                    {key: 5, value: '新建流程'},
                  ]"
                  validate="required"
                  class="width-input"
                  @change="modeChange"
                />
              </ht-form-item>
              <ht-form-item label="路由路径" v-if="appModel.mode === 1">
                <ht-input
                  v-model="appModel.content"
                  validate="required"
                  width="260px"
                  placeholder="请填写vue路由路径"
                />
              </ht-form-item>
              <ht-form-item label="网页地址" v-if="appModel.mode === 2">
                <ht-input
                  v-model="appModel.content"
                  validate="required"
                  width="260px"
                  placeholder="请填写http/https开头的站外地址"
                />
              </ht-form-item>

              <ht-form-item label="表单列表" v-if="appModel.mode === 3">
                <ht-input
                  v-model="appModel.tempName"
                  validate="required"
                  width="260px"
                  placeholder="请选择表单列表"
                  readonly
                >
                  <el-button
                    slot="append"
                    @click="$refs.dataTemplateDialog.showDialog()"
                    >选择</el-button
                  >
                </ht-input>
              </ht-form-item>

              <ht-form-item label="选择图表" v-if="appModel.mode === 4">
                <eip-chart-selector
                  validate="required"
                  :dataParam.sync="appModel.content"
                  :chartType="2"
                ></eip-chart-selector>
              </ht-form-item>
              <ht-form-item label="选择流程" v-if="appModel.mode === 5">
                <ht-input
                  v-model="appModel.tempName"
                  validate="required"
                  width="260px"
                  placeholder="请选择流程"
                >
                  <el-button
                    slot="append"
                    @click="$refs.eipFlowDialog.showDialog()"
                    >选择</el-button
                  >
                </ht-input>
              </ht-form-item>
              <ht-form-item label="排序">
                <ht-input
                  v-model="appModel.sn"
                  validate="required"
                  type="number"
                  width="260px"
                />
              </ht-form-item>
            </el-form>
            <div slot="footer" style="text-align: center">
              <ht-submit-button
                url="${portal}/portal/appModel/v1/save"
                :model="appModel"
                scope-name="appModelForm"
                @after-save-data="afterSaveData"
                @before-save-data="beforeSaveData"
                >{{ $t('eip.common.save') }}</ht-submit-button
              >
              <el-button @click="beforeCloseDialog">{{
                $t('eip.common.cancel')
              }}</el-button>
            </div>
          </ht-sidebar-dialog>
        </div>
      </el-main>
    </el-container>
    <DataTemplateDialog ref="dataTemplateDialog" @onConfirm="selDataTemplate" />
    <eipFlowDialog
      ref="eipFlowDialog"
      @onConfirm="setFlowData"
      v-show="false"
      :appendToBody="true"
      :single="true"
    ></eipFlowDialog>
    <eip-auth-dialog ref="appAuth" @onConfirm="authConfirm"></eip-auth-dialog>
    <el-dialog
      title="导入移动端应用"
      :visible.sync="importDialogVisible"
      width="40%"
      top="30vh"
      :close-on-click-modal="false"
      v-if="importDialogVisible"
    >
      <div style="height: 150px; padding-left: 20px">
        <el-upload
          style="display: inline-block"
          :action="uploadUrl"
          :on-success="handleUploadResult"
          :on-error="handleUploadResult"
          :headers="uploadHeaders"
          :on-exceed="onExceed"
          accept=".zip"
          :before-upload="beforeUpload"
          :limit="1"
          :auto-upload="false"
          ref="upload"
        >
          <el-button size="small" icon="el-icon-upload"
            >选择移动端应用</el-button
          >
        </el-upload>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          @click="uploadSubmit"
          element-loading-text="导入中..."
          v-loading.fullscreen.lock="fullscreenLoading"
          >确 定</el-button
        >
        <el-button @click="importDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </el-container>
</template>
<script>
import portal from '../../api/portal'

const EipChartSelector = () =>
  import('@/components/selector/EipChartSelector.vue')
const htAsideTree = () => import('@/components/common/HtAsideTree.vue')
const EipSysTypeSelector = () =>
  import('@/components/selector/EipSysTypeSelector.vue')
const iconDialog = () => import('@/components/dialog/IconDialog.vue')
const DataTemplateDialog = () =>
  import('@/components/dialog/DataTemplateDialog.vue')
import util from '@/hotent-ui-util.js'
const eipFlowDialog = () => import('@/components/dialog/EipFlowDialog.vue')
const eipAuthDialog = () => import('@/components/dialog/EipAuthDialog.vue')
import req from '@/request'
import {mapState} from 'vuex'
export default {
  components: {
    htAsideTree,
    EipSysTypeSelector,
    iconDialog,
    DataTemplateDialog,
    EipChartSelector,
    eipFlowDialog,
    eipAuthDialog,
  },
  data() {
    return {
      dialogVisible: false,
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0,
      },
      appModel: {
        icon: '',
        iconColor: '',
        content: '',
        typeName: '',
        typeId: '',
      },
      defaultQuerys: [],
      selectNode: '',
      selectNodeId: '',
      selectedId: '',
      importDialogVisible: false,
      uploadUrl: window.context.portal + '/portal/appModel/v1/import',
      fullscreenLoading: false,
    }
  },
  computed: mapState({
    uploadHeaders: function (mapState) {
      return {Authorization: 'Bearer ' + mapState.login.currentUser.token}
    },
  }),
  mounted() {
    this.$validator = this.$root.$validator
  },
  methods: {
    rowClick(row, column, event) {
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row)
    },
    rowClick2(row, column, event) {
      this.$refs.dataTemplateDialog.$refs.htTable.toggleRowSelection(row)
    },
    handleNodeClick(item) {
      let list = util.nest2tile([item])
      let ids = []
      list.forEach((e) => {
        ids.push(e.id)
      })
      if (item.id != '1285867753718288384') {
        this.selectNode = item.name
        this.selectNodeId = item.id
      }
      this.$set(this.defaultQuerys, 0, {
        property: 'TYPE_ID_',
        value: ids.join(','),
        operation: 'IN',
      })
      this.$refs.htTable.load()
    },
    treeCheck(item, list) {
      if (list && list.checkedKeys && list.checkedKeys.length > 0) {
        this.$set(this.defaultQuerys, 0, {
          property: 'TYPE_ID_',
          value: list.checkedKeys.join(','),
          operation: 'IN',
        })
        this.$refs.htTable.load()
      }
    },
    parseContent(val, type) {
      let j = JSON.parse(val)
      let name = "";
      if (type===3) {
        name = "表单列表"
      }else {
        name = "新建流程"
      }
      return '【'+name+'】' + j.name
    },
    parseName(val) {
      return '【图表】' + val
    },
    showDialog(id) {
      if (id) {
        this.$http
          .get('${portal}/portal/appModel/v1/getJson?id=' + `${id}`)
          .then(
            (resp) => {
              this.appModel = resp.data
              this.dialogVisible = true
              if (this.appModel.mode === 3) {
                let json = JSON.parse(resp.data.content)
                this.$set(this.appModel, 'tempAlias', json.alias)
                this.$set(this.appModel, 'tempName', json.name)
              } else if (this.appModel.mode === 5) {
                let json = JSON.parse(resp.data.content)
                this.$set(this.appModel, 'tempName', json.name)
              }
            },
            (error) => {
              reject(error)
            }
          )
      } else {
        this.dialogVisible = true
        this.appModel.icon = 'icon-application'
        this.appModel.iconColor = this.getRandomColor()
        this.appModel.typeName = this.selectNode
        this.appModel.typeId = this.selectNodeId
      }
    },
    getRandomColor() {
      var colorValue = '0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F'
      var color = '#'
      var colorArray = colorValue.split(',')
      for (var i = 0; i < 6; i++) {
        color += colorArray[Math.floor(Math.random() * 16)]
      }
      return color
    },
    beforeCloseDialog() {
      this.appModel = {icon: '', iconColor: '', content: '', typeId: ''}
      this.selectNode = ''
      this.dialogVisible = false
    },
    loadData(param, cb) {
      this.$http
        .post('${portal}/portal/appModel/v1/listJson', param)
        .then(
          (resp) => {
            let response = resp.data
            this.data = response.rows
            this.pageResult = {
              page: response.page,
              pageSize: response.pageSize,
              total: response.total,
            }
          },
          (error) => {
            reject(error)
          }
        )
        .finally(() => cb())
    },
    beforeSaveData() {
      if (this.appModel.mode === 3) {
        this.appModel.content = JSON.stringify({
          alias: this.appModel.tempAlias,
          name: this.appModel.tempName,
        })
      }
    },
    afterSaveData() {
      setTimeout(() => {
        this.beforeCloseDialog()
        this.$refs.htTable.load()
      }, 500)
    },
    selDataTemplate(val) {
      this.$set(this.appModel, 'tempAlias', val.alias)
      this.$set(this.appModel, 'tempName', val.name)
    },
    selIcon(item) {
      this.$set(this.appModel, 'icon', item)
    },
    modeChange() {
      this.$set(this.appModel, 'content', '')
    },
    updateEnable(id) {
      this.$http
        .get('${portal}/portal/appModel/v1/updateEnable/' + id)
        .then((resp) => {
          console.log(resp)
          if (resp.data.state) {
            this.$message.success(resp.data.message)
            this.$refs.htTable.load()
          }
        })
    },
    setFlowData(data) {
      if (!data) {
        return
      }
      this.appModel.content = JSON.stringify({
        id: data[0].id,
        name: data[0].name,
      })
      this.appModel.tempName = data[0].name
      this.$forceUpdate()
    },
    async auth(app) {
      let _this = this
      let id = ''
      if (app) {
        id = app.id
        this.selectedId = id
        let resp = await portal.getRights(app.typeId, 'app')
        if (!resp.data.right || resp.data.right.length < 0) {
          this.$message.warning('请先设置所属分类权限')
          return
        }
      } else {
        if (this.$refs.htTable.$refs.htTable.selection.length <= 0) {
          this.$message.warning('请选择需要设置的应用')
          return
        } else {
          id = this.$refs.htTable.$refs.htTable.selection[0].id
          this.selectedId = ''
        }
      }

      portal.getRights(id, 'app').then((resp) => {
        if (resp.data) {
          let conf = {
            right: resp.data.right,
            permissionList: resp.data.type,
            autoClose: false,
          }
          _this.$refs.appAuth.showDialog(conf)
        }
      })
    },
    authConfirm(data) {
      if (this.selectedId) {
        this.saveRight(data)
      } else {
        this.batchSaveRights(data)
      }
    },
    saveRight(data) {
      let param = {
        id: this.selectedId,
        objType: 'app',
        ownerNameJson: JSON.stringify(data),
      }
      let _this = this
      this.$http
        .post('${portal}/sys/authUser/v1/saveRights', param)
        .then((resp) => {
          _this.showResponse(resp)
        })
    },
    batchSaveRights(data) {
      let param = {
        ids: this.$refs.htTable.$refs.htTable.selection.map((item) => item.id),
        objType: 'app',
        ownerNameJson: JSON.stringify(data),
      }
      let _this = this
      this.$http
        .post('${portal}/sys/authUser/v1/batchSaveRights', param)
        .then((resp) => {
          _this.showResponse(resp)
        })
    },
    showResponse(resp) {
      if (resp.data) {
        if (resp.data.state) {
          this.$message.success('授权成功')
          this.$refs.appAuth.closeDialog()
        } else {
          this.$message.error(resp.data.message)
        }
      }
    },
    handleExport() {
      let selection = this.$refs.htTable.$refs.htTable.selection
      if (selection && selection.length === 0) {
        this.$message.warning('请选择至少一项记录')
        return
      }
      let ids = selection.map((item) => item.id)
      let url = `${window.context.portal}/portal/appModel/v1/exportXml?ids=${ids}`
      req.download(url)
    },
    handleUploadResult(data) {
      if (data.state) {
        if (data.message.includes('已存在故跳过')) {
          this.$message({
            type: 'warning',
            message: data.message,
            showClose: true,
            duration: 5000,
            dangerouslyUseHTMLString: true,
          })
        } else {
          this.$message({type: 'success', message: '导入成功'})
        }
      } else {
        this.$message({type: 'error', message: data.message})
      }
      this.importDialogVisible = false
      this.fullscreenLoading = false
      this.$refs.htTable.querys = []
      this.$refs.htTable.load()
    },
    beforeUpload(file) {
      if (!file.name.endsWith('.zip')) {
        this.$message.warning('只能导入zip文件!')
        return false
      }
      this.fullscreenLoading = true
    },
    onExceed(file) {
      this.$message.warning('只能选择一个zip文件!')
    },
    uploadSubmit() {
      if (
        !this.$refs.upload.uploadFiles ||
        this.$refs.upload.uploadFiles.length === 0
      ) {
        this.$message.warning('请选择要导入的应用!')
        return false
      }
      this.$refs.upload.submit()
    },
  },
}
</script>

<style lang="scss" scoped>
.sp-manager__dialog /deep/ > .el-dialog > .el-dialog__body {
  height: calc(100% - 170px);
}
.width-input {
  width: 260px;
}
.app-icon {
  font-size: 25px;
  margin-right: 10px;
  cursor: pointer;
}
.app-icon:hover {
  transform: scale(1.2);
  -webkit-transform: scale(1.2);
  -moz-transform: scale(1.2);
  -o-transform: scale(1.2);
  -ms-transform: scale(1.2);
}
.sp-manager__dialog .ht-form-item >>> .el-form-item__label {
  width: 110px !important;
}
@media (max-width: 1024px) {
  /deep/ .el-dialog {
    width: 40% !important;
  }
  /deep/ .search-container__col {
    flex-wrap: wrap;
    .el-button-group {
      margin-top: 10px;
    }
  }
}
</style>
