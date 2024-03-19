<template>
  <el-container class="fullheight">
    <ht-table
      ref="i18nMessageTable"
      @load="loadData"
      @row-click="rowClick"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      :quick-search-props="[{prop: 'key', label: '资源KEY'}, {prop: 'val', label: '国际化内容'}]"
      :show-export="false"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" icon="el-icon-plus" @click="showDialog('add')">添加</el-button>
          <!--<el-button
                  size="small"
                  icon="el-icon-tickets"
                  @click="showDialog('resources')"
              >选择国际化资源</el-button>-->
          <el-button size="small" icon="el-icon-refresh" @click="showDialog('init')">初始化</el-button>

          <ht-delete-button
            size="small"
            :url="i18nMessageTypeDeleteUrl"
            :htTable="$refs.i18nMessageTable"
            pk="key_"
            parameter="key"
            style="margin:0;"
            >删除</ht-delete-button
          >
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="key_" label="资源KEY" :show-overflow-tooltip="true">
          <template v-slot="{row}">
            <el-link @click="showDialog('edit', row)" type="primary">{{ row.key_ }}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column :prop="item.type" :label="item.desc" :show-overflow-tooltip="true" v-for="item in types" :key="item.id" />
      </template>
    </ht-table>

    <el-dialog width="40%" :title="i18nMessageTitle" :visible="dialogVisible" :before-close="handleClose"  :close-on-click-modal="false">
      <el-form v-model="i18nMessage" data-vv-scope="editi18nMessageForm">
        <table class="form-table" cellspacing="0" cellpadding="0" border="0">
          <tbody>
            <tr>
              <th width="120px" class="is-required">资源KEY:</th>
              <td class="i18nMessage-input-width">
                <ht-input
                  v-model="i18nMessage.key_"
                  autocomplete="off"
                  :maxlength="200"
                  :validate="{
                    required: true,
                    regex: {exp: '^[a-zA-Z][a-zA-Z0-9._-]*$', message: '只能输入字母、数字、下划线和点，且以字母开头'}
                  }"
                  :disabled="oldKey ? true : false"
                  @blur="isKey()"
                ></ht-input>
              </td>
            </tr>
            <tr>
              <th width="120px">
                <el-tooltip class="item" effect="dark" content="资源值至少填写一个" placement="right-start">
                  <span class="el-icon-question" style="margin-left: 10px">资源:</span>
                </el-tooltip>
              </th>
              <td>
                <table class="form-table I18nTable" cellspacing="0" cellpadding="0" border="0">
                  <tbody>
                    <tr>
                      <th width="30%">类型</th>
                      <th width="30%">描述</th>
                      <th width="30%">资源值</th>
                    </tr>
                    <tr v-for="item in types" :key="item.id">
                      <td>{{ item.type }}</td>
                      <td>{{ item.desc }}</td>
                      <td>
                        <ht-input v-model="item.val"></ht-input>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
          :url="savei18nMessageUrl()"
          :model="i18nMessage"
          :is-submit="isSubmit"
          request-method="POST"
          scope-name="editi18nMessageForm"
          @before-save-data="beforeSaveData"
          @after-save-data="afterSaveData"
          >{{ $t('eip.common.save') }}</ht-submit-button
        >
        <el-button @click="dialogCancle('dialogVisible')">{{ $t('eip.common.cancel') }}</el-button>
      </div>
    </el-dialog>
    <!-- 加载数据 用作编辑数据源和查看数据源-->
    <ht-load-data :url="loadDataUrl" requestMethod="post" context="portal" @after-load-data="afterLoadData"></ht-load-data>
    <!-- 国际化资源选择对话框  -->
    <eip-i18n-dialog ref="eipI18nDialog" @onConfirm="dialogOnConfirm" append-to-body />
  </el-container>
</template>
<script>
import sys from '@/api/portal.js'

const eipI18nDialog = () => import('@/components/dialog/EipI18nDialog.vue')
export default {
  name: 'i18n-i18nMessage',
  components: {eipI18nDialog},
  data() {
    return {
      i18nMessage: {},
      i18nMessageTitle: '',
      loadDataUrl: '',
      dialogVisible: false,
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      isSubmit: true,
      types: [],
      newTypes: [],
      oldKey: ''
    }
  },
  mounted() {
    // 因为resize事件在整个项目中只能监听一次，所以这里通过全局广播发送这个事件
    this.$root.$emit('resize')
    //查询所有语种类型
    sys.geti18nMessageTypeAll().then(data => {
      if (data && data.length > 0) {
        this.types = data
        this.types.forEach(element => {
          delete element.id
        })
      }
    })
  },
  computed: {
    i18nMessageTypeDeleteUrl: function() {
      return window.context.portal + '/i18n/custom/i18nMessage/v1/delByKey'
    }
  },
  methods: {
    rowClick(row, column, event) {
      this.$refs.i18nMessageTable.$refs.htTable.toggleRowSelection(row)
    },
    dialogOnConfirm(data) {
      this.$message({
        type: 'success',
        message: JSON.stringify(data),
        showClose: true
      })
    },
    isKey() {
      if (this.oldKey || !this.i18nMessage.key_) return
      sys.getByMessKey(this.i18nMessage.key_).then(rep => {
        if (rep && rep.key_ == this.i18nMessage.key_) {
          this.$message.error('资源Key【' + rep.key_ + '】已存在')
          this.i18nMessage.key_ = ''
        }
      })
    },
    beforeSaveData() {
      this.isSubmit = true
      this.i18nMessage.vals = ''
      this.i18nMessage.types = ''
      var noData = true
      this.types.forEach(item => {
        this.i18nMessage.types = this.i18nMessage.types + item.type + ','
        if (item.val && item.val != '') {
          noData = false
          this.i18nMessage.vals = this.i18nMessage.vals + ','
        } else {
          this.i18nMessage.vals = this.i18nMessage.vals + item.val + ','
        }
      })
      if (noData) {
        this.$message.error('资源中资源值至少有一个！')
        this.isSubmit = false
        return
      }
      this.i18nMessage.key = this.i18nMessage.key_
      this.i18nMessage.mesTypeInfo = this.types
    },
    savei18nMessageUrl: function() {
      return window.context.portal + '/i18n/custom/i18nMessage/v1/save' + '?oldKey=' + this.oldKey
    },
    afterSaveData() {
      this.dialogVisible = false
      this.$refs.i18nMessageTable.load(true)
      this.oldKey = ''
    },
    afterLoadData(data) {
      this.i18nMessage = data
      this.types = data.mesTypeInfo
      // 编辑数据源
      if (this.dialogVisible) {
        setTimeout(() => this.$validator.validateAll('editi18nMessageForm'))
      }
    },
    dialogCancle(dialogVisible) {
      this.loadDataUrl = ''
      this[dialogVisible] = false
    },
    handleClose() {
      this.loadDataUrl = ''
      this.dialogVisible = false
    },
    showDialog(command, row) {
      switch (command) {
        case 'add':
          this.oldKey = ''
          if (this.types.length > 0) {
            this.types.forEach(element => {
              delete element.val
            })
          }
          this.dialogVisible = true
          this.i18nMessage = {}
          this.i18nMessageTitle = '添加国际化资源支持的语言类型'
          break
        case 'edit':
          this.oldKey = row.key_
          this.loadDataUrl = '/i18n/custom/i18nMessage/v1/getI18nMessageJson?key=' + row.key_
          this.dialogVisible = true
          this.i18nMessageTitle = '编辑国际化资源支持的语言类型'
          break
        case 'del':
          this.$confirm('是否确认删除？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            sys.i18nMessageDelByKey(row.key_).then(
              data => {
                if (data.state) {
                  this.$message.success(data.message)
                  this.$refs.i18nMessageTable.load(true)
                } else {
                  this.$message.error(data.message || '删除失败')
                }
              },
              error => {
                this.$message.error(error || '删除失败')
              }
            )
          })
          break
        case 'resources':
          this.$refs['eipI18nDialog'].showDialog()
          break
        case 'init':
          this.$confirm('是否确认初始化？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            sys.i18nMessageInit().then(data => {
              if (data.state) {
                this.$message.success('初始化成功')
                this.$refs.i18nMessageTable.load(true)
              } else {
                this.$message.error(data.message || '初始化失败')
              }
            })
          })
          break
        case 'clearAll':
          this.$confirm('是否确认清除国际化缓存数据？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            sys.i18nMessageClearCache().then(data => {
              this.$message.success('清除缓存成功')
              this.$refs.i18nMessageTable.load(true)
            })
          })
          break
      }
    },
    handleNodeClick(node) {},
    loadData(param, cb) {
      sys
        .getI18nMessagePageJson(param)
        .then(response => {
          this.data = response.rows
          this.pageResult = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total
          }
        })
        .finally(() => cb())
    }
  }
}
</script>

<style lang="scss" scoped>
.el-main {
  padding: 0px;
}
.i18nMessage-input-width .inputs {
  width: 100%;
}
.I18nTable th {
  text-align: center;

  background-color: #f4f4f5;
}
.form-table > tbody > tr > th > span,
.form-table > thead > tr > th > span {
  color: #666666;
}
@media (max-width: 1024px){
  /deep/ .search-container__col{
      flex-wrap: wrap;
      .el-button-group{
        margin-top: 10px;
      }
  }
}
</style>
