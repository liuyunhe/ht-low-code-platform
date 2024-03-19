<template>
  <div class="fullheight">
    <ht-table
      ref="identityTable"
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      quick-search-props="name,alias"
      :show-export="false"
      :defaultSorter="[{property: 'CREATE_TIME_', direction: 'DESC'}]"
      @row-click="rowClick"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button icon="el-icon-plus" @click="handleCommand({command: 'add'})">添加</el-button>
          <el-button icon="el-icon-back" @click="handleCommand({command: 'import'})">导入</el-button>
          <el-button icon="el-icon-right" @click="handleCommand({command: 'export'})">导出</el-button>
          <ht-delete-button :url="identityDeleteUrl" :htTable="$refs.identityTable" style="margin:0;">删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="name" label="名称" width="300" :sortable="true" :show-overflow-tooltip="true">
          <template v-slot="{row}">
            <el-link @click="handleCommand({row: row, command: 'edit'})" type="primary">{{ row.name }}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column prop="alias" label="别名" :sortable="true" />
        <ht-table-column
          prop="genType"
          label="生成类型"
          :filters="[{text: '递增', value: 0}, {text: '每天生成', value: 1}, {text: '每月生成', value: 2}, {text: '每年生成', value: 3}]"
        >
          <template v-slot="{row}">
            <el-tag type="success" v-if="row.genType === 0">递增</el-tag>
            <el-tag type="primary" v-if="row.genType === 1">每天生成</el-tag>
            <el-tag type="warning" v-if="row.genType === 2">每月生成</el-tag>
            <el-tag type="danger" v-if="row.genType === 3">每年生成</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column prop="regulation" label="规则" sortable />
        <ht-table-column prop="noLength" label="长度" sortable />
        <!-- <ht-table-column width="150" label="操作">
              <template v-slot="{row}">
                <el-button size="mini" class="el-icon-edit"  @click="handleCommand({row:row,command:'edit'})">编辑</el-button>
                <el-dropdown
                  size="mini"
                  split-button
                  @command="handleCommand"
                  @click="handleCommand({row:row,command:'edit'})"
                >
                  <span>
                    <i class="el-icon-edit"></i>编辑
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item icon="el-icon-menu" :command="{row:row,command:'get'}">查看</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
        </ht-table-column>-->
      </template>
    </ht-table>

    <el-dialog width="50%" :title="identiyTitle" :visible="dialogVisible" :before-close="handleClose" :close-on-click-modal="false" top="6vh">
      <el-form :disabled="identityDisabled" v-model="identity" data-vv-scope="editIdentityForm">
        <ht-form-item label="流水号名称" prop="name" label-width="120px" class="identity-input-width">
          <ht-input
            v-model="identity.name"
            autocomplete="off"
            :validate="{required: true}"
            placeholder="请输入名称"
            :maxlength="50"
            :showWordLimit="true"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="流水号别名" prop="alias" label-width="120px" class="identity-input-width">
          <ht-input
            v-model="identity.alias"
            v-pinyin="identity.name"
            autocomplete="off"
            :validate="{
              required: true,
              regex: {exp: '^[a-zA-Z][a-zA-Z0-9_]*$', message: '只能输入字母、数字、下划线，且以字母开头'}
            }"
            placeholder="请输入别名"
            :disabled="identity.id ? true : false"
            :maxlength="20"
            :showWordLimit="true"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="流水号规则" label-width="120px" class="identity-item-bottom identity-input-width">
          <ht-input
            width="100%"
            v-model="identity.regulation"
            :validate="{required: true}"
            placeholder="请输入流水号规则"
            :maxlength="100"
            :showWordLimit="true"
          />
        </ht-form-item>
        <ht-form-item label label-width="120px" class="identity-item-bottom">
          <ul>
            <li>{yyyy}{MM}{dd}{NO}</li>
            <li>{yyyy}:表示年份</li>
            <li>
              {MM} :表示月份，如果月份小于10，则加零补齐，如1月份表示为01。
            </li>
            <li>{mm} :表示月份，月份不补齐，如1月份表示为1。</li>
            <li>{DD} :表示日，如果小于10号，则加零补齐，如1号表示为01。</li>
            <li>{dd} :表示日，日期不补齐，如1号表示为1。</li>
            <li>{NO} :表示流水号，前面补零。</li>
            <li>{no} :表示流水号，后面补零。</li>
            <li>
              {xx.xxx} :表示表单中的字符，xx为业务对象别名，xxx为字段名称。例如：{student.name}
            </li>
          </ul>
        </ht-form-item>
        <ht-form-item label="生成类型" label-width="120px" class="identity-item-bottom identity-input-width">
          <ht-radio :validate="{required: true}" v-model="identity.genType" :options="genTypes" />
        </ht-form-item>
        <ht-form-item label label-width="120px" class="identity-item-bottom">
          <ul>
            <li>1.每天生成。每天从初始值开始计数。</li>
            <li>2.递增，流水号一直增加。</li>
          </ul>
        </ht-form-item>
        <ht-form-item label="流水号长度" label-width="120px" class="identity-item-bottom identity-input-width">
          <ht-input :validate="'required: true|regex:^[0-9]*$,只能输入数字'" v-model="identity.noLength" placeholder="请输入流水号长度" :maxlength="9"/>
        </ht-form-item>
        <ht-form-item label label-width="120px" class="identity-item-bottom">
          <ul>
            <li>
              这个长度表示当前流水号的长度数，只包括流水号部分{NO},如果长度为5，当前流水号为5，则在流水号前补4个0，表示为00005。
            </li>
            <li>
              {no}如果长度为5，当前流水号为501，则在流水号后面补5个0，表示为50100000。
            </li>
          </ul>
        </ht-form-item>
        <ht-form-item label="初始值" label-width="120px" class="identity-item-bottom identity-input-width">
          <ht-input :validate="'required: true|regex:^[0-9]*$,只能输入数字'" v-model="identity.initValue" placeholder="请输入初始值" />
        </ht-form-item>
        <ht-form-item label label-width="120px" class="identity-item-bottom">
          <ul>
            <li>
              这个初始值表示流水号部分{NO}的初始值。如 2015102700001,初始值为1，则流水号部分的初始值为00001
            </li>
          </ul>
        </ht-form-item>
        <ht-form-item label="步长" label-width="120px" class="identity-item-bottom identity-input-width">
          <ht-input :validate="'required: true|regex:^[0-9]*$,只能输入数字'" v-model="identity.step" placeholder="请输入步长"  :maxlength="4"/>
        </ht-form-item>
        <ht-form-item label label-width="120px" class="identity-item-bottom">
          <ul>
            <li>
              流水号每次递加的数字，默认步长为1。比如步长为2，则每次获取流水号则在原来的基础上加2。
            </li>
          </ul>
        </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
          v-show="!identityDisabled"
          :url="saveIdentityUrl()"
          :model="identity"
          :is-submit="isSubmit"
          :request-method="requestMethod"
          scope-name="editIdentityForm"
          @before-save-data="beforeSaveData"
          @after-save-data="afterSaveData"
          >{{ $t('eip.common.save') }}</ht-submit-button
        >
        <el-button @click="dialogCancle('dialogVisible')">{{ $t('eip.common.cancel') }}</el-button>
      </div>
    </el-dialog>
    <!-- 加载数据 用作编辑流水号和查看流水号-->
    <ht-load-data :url="loadDataUrl" context="portal" @after-load-data="afterLoadData"></ht-load-data>
    <el-dialog title="上传文件" :visible="uploadDialogVisible" :before-close="beforeClose" name="uploadDialog" top="30vh" width="40%" custom-class="upload-dialog">
      <el-upload :action="uploadUrl" :http-request="handleImport"
        accept=".zip" :file-list="fileList" :limit="1" :auto-upload="false" ref="elUpload" class="upload-dialog__content">
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
import sys from '@/api/portal.js'
import req from '@/request.js'
import portal from '@/api/portal.js'
export default {
  name: 'meta-identity',
  components: {},
  data() {
    return {
      identityDisabled: false,
      identiyTitle: '',
      loadDataUrl: '',
      dialogVisible: false,
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      isSubmit: true,
      identity: {
        name: '',
        alias: '',
        regulation: '',
        genType: '',
        noLength: '',
        initValue: '',
        step: ''
      },
      genTypes: [{key: 3, value: '每年生成'}, {key: 2, value: '每月生成'}, {key: 1, value: '每天生成 '}, {key: 0, value: '递增'}],
      uploadDialogVisible: false,
      fileList: [],
      uploadUrl: window.context.portal + '/sys/identity/v1/import'
    }
  },
  computed: {
    requestMethod: function() {
      return 'POST'
    },
    identityDeleteUrl: function() {
      return window.context.portal + '/sys/identity/v1/remove'
    }
  },
  methods: {
    //鼠标选中行改变复选框
    rowClick(row, column, event) {
      this.$refs.identityTable.$refs.htTable.toggleRowSelection(row)
    },
    beforeSaveData() {
      this.isSubmit = true
    },
    saveIdentityUrl: function() {
      return window.context.portal + '/sys/identity/v1/save'
    },
    afterSaveData() {
      this.dialogVisible = false
      this.$refs.identityTable.load()
    },
    afterLoadData(data) {
      // 编辑流水号
      if (this.dialogVisible) {
        this.identity = data
        setTimeout(() => this.$validator.validateAll('editIdentityForm'))
      }
    },
    dialogCancle(dialogVisible) {
      this.loadDataUrl = ''
      this[dialogVisible] = false
      setTimeout(() => (this.identityDisabled = false), 500)
    },
    handleClose() {
      this.loadDataUrl = ''
      this.dialogVisible = false
      setTimeout(() => (this.identityDisabled = false), 500)
    },
    showDialog(row) {
      this.dialogVisible = true
      if (row) {
        this.loadDataUrl = `/sys/identity/v1/getJson?id=${row.id}`
      }
    },
    handleNodeClick(node) {},
    loadData(param, cb) {
      sys
        .getIdentityPageJson(param)
        .then(response => {
          this.data = response.rows
          this.pageResult = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total
          }
        })
        .finally(() => cb())
    },
    export() {
      let selection = this.$refs.identityTable.$refs.htTable.selection
      if (!selection || selection.length == 0) {
        this.$message({type: 'warning', message: '请至少选择一条记录'})
        return
      }
      let ids = []
      for (let i = 0; i < selection.length; i++) {
        ids.push(selection[i].id)
      }
      req.download(window.context.portal + '/sys/identity/v1' + '/export?ids=' + ids.join(','))
    },
    beforeClose() {
      this.uploadDialogVisible = false
      this.fileList = [];
      this.loadData();
    },
    handleImport(param) {
      let formData = new FormData()
      formData.append('file', param.file)
      portal.importIdentity(formData).then(resp => {
        if (resp.state) {
          this.$message({type: 'success', message: resp.message})
          this.fileList = []
          this.uploadDialogVisible = false
          this.$refs.htTable.load(); //重新加载列表数据
        } else {
          //this.$message({type:"warning",message:"导入失败"})
          this.beforeClose()
        }
      })
    },
    handleCommand(params) {
      switch (params.command) {
        case 'edit':
          this.identiyTitle = '编辑流水号'
          this.showDialog(params.row)
          break
        case 'add':
          this.identity = {
            name: '',
            alias: '',
            regulation: '',
            genType: '',
            noLength: '',
            initValue: '',
            step: ''
          }
          this.identiyTitle = '添加流水号'
          this.showDialog()
          break
        case 'get':
          this.identiyTitle = '查看流水号'
          this.isSubmit = false
          this.identityDisabled = true
          this.showDialog(params.row)
          break
        case 'import':
          this.uploadDialogVisible = true
          break
        case 'export':
          this.export()
          break
        default:
          break
      }
    },
    uploadSubmit(){
      if(this.$refs.elUpload.uploadFiles.length == 0){
        this.$message({type:"warning",message:"请上传文件"});
      }
      this.$refs.elUpload.submit();
    }
  }
}
</script>
<style lang="scss" scoped>
ul {
  padding: 0px;
  margin: 0px;
}

li {
  list-style-type: none;
}

.identity-item-bottom {
  margin-bottom: 5px;
}

.identity-input-width .inputs {
  width: 100%;
}
@media (max-width: 1024px){
    /deep/ .search-container__col{
      flex-wrap: wrap;
      .el-button-group{
        margin-top: 10px;
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
/deep/ [name='uploadDialog']{
  // height:30%;
}
/deep/ .el-dialog.upload-dialog{
  height: unset;
  /deep/.el-dialog__body{
    height: unset;
  }
 .upload-dialog__content{
   height: 150px;
 }
  min-height: unset;
}
</style>
