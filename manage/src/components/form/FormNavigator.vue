<template>
  <div class="navbar-default box-shadow flex">
    <el-page-header @back="formBack">
      <template v-slot:content
        >{{ title }}({{ formData.name }})</template
      >
    </el-page-header>
    <span>
      <el-button icon="icon-technology" v-if="formId" @click="includdingFile('')">引入脚本</el-button>
      <el-button icon="icon-list" v-if="formId" @click="historyRecord">表单历史记录</el-button>
      <el-button icon="icon-save" type="primary" @click="save('notPublish')">保存</el-button>
      <el-button icon="icon-release" @click="publish(1)" v-if="formId && formData.status == 'draft' && formData.isPrint != 'Y'"
        >发布</el-button
      >
      <el-button icon="icon-release" @click="newVersion" v-else-if="formId && formData.isPrint != 'Y'">发布新版</el-button>
      <el-button v-if="formId" @click="previewForm()">
        <el-tooltip content="先(保存|发布)再预览">
          <i class="icon-question" style="margin-right: 8px" /> </el-tooltip
        >预览
      </el-button>
      <el-button icon="el-icon-folder" @click="$emit('local-save')">导出本地</el-button>

      <el-upload
        class="upload-demo"
        style="display:inline-block"
        ref="upload"
        action="https://jsonplaceholder.typicode.com/posts/"
        :show-file-list="false"
        :on-change="fileOnChange"
        :auto-upload="false"
      >
        <el-button icon="el-icon-folder-opened" slot="trigger" size="small">本地导入</el-button>
      </el-upload>
    </span>
    <el-dialog
      title="表单数据"
      :visible.sync="dialogFormVisible"
      append-to-body
      class="urgent-text"
      :close-on-click-modal="false"
      width="1024"
      top="8vh"
    >
      <el-row style="height:500px;">
        <el-col :span="24" style="padding:5px;height:500px;">
          <codemirror ref="mycode" v-model="formHtml" :options="cmOptions" class="mycode" style="width: 99%;height:500px;"></codemirror>
        </el-col>
      </el-row>
    </el-dialog>
    <ht-sidebar-dialog
      title="引入脚本"
      :visible.sync="dialogincluddingFileVisible"
      append-to-body
      class="urgent-text includding-form"
      :close-on-click-modal="false"
      width="100%"
    >
      <el-row style="height:100%">
        <el-col :span="leftSpan" style="padding:5px;height:100%;" v-show="asideShowLeft">
          <codemirror ref="mycode" v-model="formHtml" :options="cmOptions" class="mycode" style="width: 99%;height:100%;"></codemirror>
        </el-col>
        <el-col :span="1">
          <div class="navbar-collapse" :class="{'navbar-collapse-right': !asideShowLeft}" @click="asideShowLeft = !asideShowLeft">
            <div class="navbar-collapse-bg">
              <i class="navbar-collapse-arrow" :class="{'el-icon-arrow-left': asideShowLeft, 'el-icon-arrow-right': !asideShowLeft}"></i>
            </div>
          </div>
        </el-col>
        <el-col :span="rightSpan" style="padding:5px;height:96%;" v-show="asideShowRight">
          <span>自定义JS脚本</span>&nbsp;&nbsp;
          <el-dropdown @command="variablesClick" size="mini">
            <el-button type="primary">
              常用变量
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="{value: 'currentUser.account'}">当前用户账号</el-dropdown-item>
              <el-dropdown-item :command="{value: 'currentUser.username'}">当前用户名称</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <br />
          <span style="color: red;">编辑的脚本内容会直接填充到【script】里面；如需使用到表单BO数据例：data.实体表名.实体表字段</span>
          <codemirror
            ref="mycode2"
            v-model="includeFiles.diyJs"
            :options="cmOptions2"
            class="code"
            style="width: 99%;height:100%;"
          ></codemirror>
        </el-col>
        <el-col :span="1">
          <div class="navbar-collapse" :class="{'navbar-collapse-right': !asideShowRight}" @click="asideShowRight = !asideShowRight">
            <div class="navbar-collapse-bg">
              <i class="navbar-collapse-arrow" :class="{'el-icon-arrow-left': asideShowRight, 'el-icon-arrow-right': !asideShowRight}"></i>
            </div>
          </div>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="includeFilesOk">确 定</el-button>
        <el-button
          @click="
            dialogincluddingFileVisible = false
            includeFiles.diyJs = ''
          "
          >取 消</el-button
        >
      </div>
    </ht-sidebar-dialog>
    <ht-load-data :url.sync="formHtmlUrl" context="form" @after-load-data="afterformHtml"></ht-load-data>
    <el-dialog
      title="表单历史记录"
      :visible.sync="historyRecordVisible"
      append-to-body
      class="urgent-text"
      :close-on-click-modal="false"
      width="64%"
      top="8vh"
    >
      <ht-table
        @load="loadData"
        :data="tableData"
        :pageResult="pageResult"
        :selectable="false"
        :show-export="false"
        ref="htTable"
        :show-custom-column="false"
      >
        <template>
          <ht-table-column type="index" width="50" align="center" label="序号" />
          <ht-table-column prop="formId" width="180" label="表单ID" />
          <ht-table-column prop="createTime" width="160" label="修改时间" :sortable="true" />
          <ht-table-column prop="version" width="100" label="表单版本" :sortable="true" />
          <ht-table-column label="操作">
            <template v-slot="{row}">
              <el-button type="primary" @click="getFormHistoryRecord(row)">查看表单数据</el-button>
              <el-button type="success" @click="updateFormHistoryRecord(row)">恢复</el-button>
              <el-button type="danger" @click="delFormHistoryRecord(row)">删除</el-button>
            </template>
          </ht-table-column>
        </template>
      </ht-table>
    </el-dialog>
  </div>
</template>
<script>
import request from '@/request.js'
import form from '@/api/form.js'
import {mapState} from 'vuex'
import {Base64} from 'js-base64'
import controlsApi from '@/api/controlsConfig.js'
import {Message} from 'element-ui'

export default {
  props: ['widgetForm', 'formData', 'formId'],
  data() {
    return {
      leftSpan: 13, //引入脚本左侧宽度
      rightSpan: 9, //引入脚本右侧宽度
      asideShowLeft: true, //引入脚本左侧默认显示
      asideShowRight: true, //引入脚本右侧默认显示
      params: null,
      dialogFormVisible: false, //查看表单数据dialog
      dialogincluddingFileVisible: false, //引入脚本dialog
      historyRecordVisible: false, //表单历史记录dialog
      newVersionConfig: false,
      formHtmlUrl: '', //获取表单HTML url
      formHtml: '', //获取表单HTML
      formExpand:"",//表单json数据
      tableData: [], //表单历史记录列表数据
      pageResult: {
        page: 1,
        pageSize: 10,
        total: 0,
        showTotal: true
      },
      includeFiles: {diyFile: '', diyCss: '', diyJs: ''}, //引入脚本和样式对象
      cmOptions: {
        value: '',
        mode: 'vue',
        readOnly: false,
        smartIndent: true,
        tabSize: 2,
        theme: 'base16-light',
        lineNumbers: true,
        line: true
      },
      cmOptions2: {
        value: '',
        mode: 'javascript',
        readOnly: false,
        smartIndent: true,
        tabSize: 2,
        theme: 'base16-light',
        lineNumbers: true,
        line: true
      },
      clickCount: 0,
      publishTimer: null,
    }
  },
  computed: {
    ...mapState({
      currentUser: state => state.login.currentUser
    }),
    title: function() {
      return this.formData.formType == 'pc' ? 'PC表单设计' : '手机表单设计'
    }
  },
  watch: {
    asideShowLeft: function(newVal, oldVal) {
      if (newVal != oldVal) {
        this.asideshowHandler()
      }
    },
    asideShowRight: function(newVal, oldVal) {
      if (newVal != oldVal) {
        this.asideshowHandler()
      }
    }
  },
  methods: {
    asideshowHandler() {
      if (this.asideShowLeft && !this.asideShowRight) {
        this.leftSpan = 22
        this.rightSpan = 0
      }
      if (!this.asideShowLeft && this.asideShowRight) {
        this.leftSpan = 0
        this.rightSpan = 22
      }
      if (!this.asideShowLeft && !this.asideShowRight) {
        this.leftSpan = 0
        this.rightSpan = 0
      }
      if (this.asideShowLeft && this.asideShowRight) {
        this.leftSpan = 13
        this.rightSpan = 9
      }
    },
    fileOnChange(file, fileList) {
      this.$confirm('导入后会覆盖掉之前选择的数据建模,以导入文件的绑定信息为准, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          var reader = new FileReader()
          reader.readAsText(file.raw)
          let _this = this
          reader.onload = function() {
            let json = JSON.parse(this.result)
            _this.$emit('load-local', json)
          }
        })
        .catch(() => {})
    },
    //表单返回
    formBack() {
      this.$confirm('您确认离开当前编辑页面？', '现在离开，内容不会自动保存', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        this.$emit('close-dialog')
      })
    },
    //查看表单数据
    getFormHistoryRecord(row) {
      const this_ = this
      this_.dialogFormVisible = true
      request.get('${form}/form/form/v1/getFormHistoryRecord?id=' + row.id).then(function(rep) {
        if (rep) {
          this_.formHtml = row.formHtml
        }
      })
    },
    //恢复表单数据
    updateFormHistoryRecord(row) {
      const this_ = this
      request.get('${form}/form/form/v1/updateFormHistoryRecord?id=' + row.id).then(function(rep) {
        if (rep.data.state) {
          Message.success(rep.data.message)
          // let param = {
          //   pageBean: {page: 1, pageSize: 20, showTotal: true},
          //   querys: [
          //     {
          //       property: 'formId',
          //       value: row.formId,
          //       operation: 'EQUAL',
          //       relation: 'AND'
          //     }
          //   ]
          // }
          // this_.loadData(param)
          this_.$emit('close-dialog')
        }
      })
    },
    //删除表单数据
    delFormHistoryRecord(row) {
      const this_ = this
      request.remove('${form}/form/form/v1/delFormHistoryRecord?id=' + row.id).then(function(rep) {
        if (rep.data.state) {
          Message.success('删除成功')
          let param = {
            pageBean: {page: 1, pageSize: 20, showTotal: true},
            querys: [
              {
                property: 'formId',
                value: row.formId,
                operation: 'EQUAL',
                relation: 'AND'
              }
            ]
          }
          this_.loadData(param)
        }
      })
    },
    variablesClick(data) {
      this.includeFiles.diyJs += data.value
    },
    //加载表单历史记录列表数据
    loadData(param, cb) {
      const this_ = this
      let queryUrl = '${form}/form/form/v1/formHistoryRecordlistJson'
      let pageBean = {
        pageBean: param.pageBean,
        querys: [
          {
            property: 'formId',
            value: this_.formData.id, // 兼容旧数据
            operation: 'EQUAL',
            relation: 'OR'
          },
          {
            property: 'formKey',
            value: this_.formData.formKey,
            operation: 'EQUAL',
            relation: 'OR'
          }
        ]
      }
      request
        .post(queryUrl, pageBean)
        .then(response => {
          this_.tableData = response.data.rows
          this_.pageResult = {
            page: response.data.page,
            pageSize: response.data.pageSize,
            total: response.data.total
          }
        })
        .finally(() => cb && cb())
    },
    //打开引入表单历史记录列表对话框
    historyRecord() {
      const this_ = this
      this_.historyRecordVisible = true
      let param = {
        pageBean: {page: 1, pageSize: 10, showTotal: true},
        querys: [
          {
            property: 'formId',
            value: this_.formData.id,
            operation: 'EQUAL',
            relation: 'AND'
          }
        ]
      }
      this_.loadData(param)
    },
    afterformHtml(data) {
      if (data && data.bpmForm) {
        this.formHtml = data.bpmForm.formHtml
        this.formExpand = data.bpmForm.expand
        this.includeFiles.diyJs = data.bpmForm.diyJs || ''
      }
    },
    //打开引入脚本对话框
    includdingFile(formId) {
      if (!formId) {
        formId = this.formData.id
      }
      this.dialogincluddingFileVisible = true
      this.formHtmlUrl = '/form/form/v1/previewDesignVue?formId=' + formId
      this.includeFiles = this.formData.includeFiles
        ? Base64.decode(this.formData.includeFiles, 'utf-8')
        : {diyFile: ' ', diyCss: ' ', diyJs: ' '}
    },
    //引入脚本和样式对象保存
    includeFilesOk() {
      if (!this.formHtml) {
        this.$message.warning('模板HTML不能为空！')
        return
      }
      this.dialogincluddingFileVisible = false
      form
        .saveFormJs({
          formId: this.formData.id,
          diyJs: this.includeFiles.diyJs,
          formHtml: Base64.encode(this.formHtml, 'utf-8'),
          formExpand:Base64.encode(this.formExpand, 'utf-8')
        })
        .then(resp => {
          if (resp.state) {
            this.$message.success(resp.message)
          }
        })
    },
    //布局字段中嵌入了布局字段的情况
    isSave(list) {
      let flag = false
      //不需要绑定表单属性的控件
      let ctrlTypeList = [
        'grid',
        'text',
        'accordion',
        'tab',
        'immediate-single',
        'immediate-textarea',
        'image',
        'iframe',
        'amap',
        'dataView',
        'table'
      ]
      for (let i = 0; i < list.length; i++) {
        if (list[i].ctrlType == 'grid' || list[i].ctrlType == 'accordion' || list[i].ctrlType == 'tab') {
          for (let j = 0; j < list[i].columns.length; j++) {
            if (list[i].columns[j].list.length > 0) {
              for (let k = 0; k < list[i].columns[j].list.length; k++) {
                if (
                  list[i].columns[j].list[k].name == '' &&
                  ctrlTypeList.indexOf(list[i].columns[j].list[k].ctrlType) == -1 &&
                  !list[i].columns[j].list[k].options.noBindModel
                ) {
                  this.$message.error('【' + list[i].desc + '中的' + list[i].columns[j].list[k].desc + '】未绑定属性值')
                  flag = true
                  return flag
                }
              }
            }
          }
        }
      }
      return flag
    },
    getPostData() {
      if (this.widgetForm.list.length == 0) {
        this.$message.error('请拖拽表单控件')
        return
      }
      //不需要绑定表单属性的控件
      let ctrlTypeList = [
        'grid',
        'text',
        'accordion',
        'tab',
        'immediate-single',
        'immediate-textarea',
        'image',
        'iframe',
        'amap',
        'dataView',
        'table'
      ]
      let amap = 0
      for (let i = 0; i < this.widgetForm.list.length; i++) {
        if (this.widgetForm.list[i].ctrlType == 'amap') {
          amap++
          if (amap > 1) {
            this.$message({
              type: 'error',
              message: '表单中只能存在一个地图控件!'
            })
            return
          }
        }
        if (
          this.widgetForm.list[i].ctrlType == 'grid' ||
          this.widgetForm.list[i].ctrlType == 'accordion' ||
          this.widgetForm.list[i].ctrlType == 'tab'
        ) {
          for (let j = 0; j < this.widgetForm.list[i].columns.length; j++) {
            if (this.widgetForm.list[i].columns[j].span.length > 20) {
              this.$message({
                message: 'tab布局控件第' + (j + 1) + '个标签配置项字符长度超出20！',
                type: 'error'
              })
              return
            }
            if (this.widgetForm.list[i].columns[j].list.length > 0) {
              for (let k = 0; k < this.widgetForm.list[i].columns[j].list.length; k++) {
                if (this.widgetForm.list[i].columns[j].list[k].ctrlType == 'amap') {
                  amap++
                  if (amap > 1) {
                    this.widgetForm.list[i].columns[j].list.splice(k, 1)
                    this.$message({
                      type: 'error',
                      message: '已存在高德地图控件!'
                    })
                    return
                  }
                }
                //判断布局字段中是否嵌入了布局字段
                if (
                  this.widgetForm.list[i].columns[j].list[k].name == '' &&
                  (this.widgetForm.list[i].columns[j].list[k].ctrlType == 'grid' ||
                    this.widgetForm.list[i].columns[j].list[k].ctrlType == 'accordion' ||
                    this.widgetForm.list[i].columns[j].list[k].ctrlType == 'tab')
                ) {
                  let flag = this.isSave(this.widgetForm.list[i].columns[j].list) //布局字段中嵌入了布局字段
                  if (flag) {
                    return
                  }
                } else if (
                  this.widgetForm.list[i].columns[j].list[k].name == '' &&
                  ctrlTypeList.indexOf(this.widgetForm.list[i].columns[j].list[k].ctrlType) == -1 &&
                  !this.widgetForm.list[i].columns[j].list[k].options.noBindModel
                ) {
                  this.$message.error(
                    '【' + this.widgetForm.list[i].desc + '中的' + this.widgetForm.list[i].columns[j].list[k].desc + '】未绑定属性值'
                  )
                  return
                }
              }
            }
          }
        }
      }
      var resp = this.judgeWidgetFormList(this.widgetForm.list)
      if (resp) {
        const formDef = {
          expand: JSON.stringify(this.widgetForm),
          rev: this.formData.rev
        }
        formDef.name = this.formData.name
        formDef.key = this.formData.formKey
        formDef.type = this.formData.typeName
        formDef.typeId = this.formData.typeId
        if (this.formData.defId) {
          formDef.id = this.formData.defId
        }
        let bpmFormVo = {
          bpmFormDef: formDef,
          bpmForm: this.formData
        }
        if (this.newVersionConfig) {
          bpmFormVo.newForm = 'newForm'
        }
        return bpmFormVo
      }
    },
    publish(i) {
      if (i == 1) {
        this.save()
      }
      i++
      if (this.isPublish) {
        this.$http.post('${form}/form/form/v1/publish', {}, {formId: this.formId}).then(response => {
          if (response.data.state) {
            this.$message({
              type: 'success',
              message: response.data.message
            })
            this.formData.status = 'deploy';
            //清除定时器
            if(this.publishTimer) {
              clearTimeout(this.publishTimer);
              this.publishTimer = null;
            }
            this.$emit('close-dialog');
          }
        })
      } else {
        this.publishTimer = setTimeout(() => this.publish(i), 500)
      }
    },
    newVersion() {
      this.newVersionConfig = true
      this.save()
    },
    save(param) {
      this.notPublish = true
      if (param) {
        this.notPublish = false
      }
      //先校验表单的基本属性
      this.$emit('saveValidate')
    },
    saveEnd() {
      let params = this.getPostData()
      this.newVersionConfig = false
      if (params) {
        const this_ = this
        //保存表单是先判断是否有表单模板，没有表单模板先初始化表单模板
        form.isTemplateByAlias('fieldControl').then(resp => {
          if (resp.data.value != undefined) {
            //保存表单
            this_.saveForm(params, this_)
          } else {
            //初始化表单模板
            form.initTemplate().then(response => {
              if (response.data.state) {
                //保存表单
                this_.saveForm(params, this_)
              }
            })
          }
        })
      }
    },
    //保存表单
    saveForm(params, this_) {
      if (this.clickCount > 0) {
        this.$message({
          type: 'warning',
          message: '操作过快，请两秒钟后再进行尝试！'
        })
        return false
      }
      if (this.clickCount == 0) {
        ++this.clickCount
        request.post('${form}/form/form/v1/saveForm', params).then(
          response => {
            this_.$message.success(response.data.message)
            this_.$emit('close-dialog', response.data.value)
            if (this.notPublish) {
              this.isPublish = true
            }
            setTimeout(() => {
              this.clickCount = 0
            }, 2000)
          },
          error => {
            this.$message.error(error.response.data.message || '表单保存失败！请检查表单模板是否正确')
            this.isPublish = false
            setTimeout(() => {
              this.clickCount = 0
            }, 2000)
          }
        )
      }
    },
    previewForm() {
      if (this.currentUser && this.currentUser.account) {
        let url = ''
        if (this.formData.formType == 'pc') {
          url = window.context.front + '/previewForm/' + this.formId + '?token=' + this.currentUser.token
          // Base64.encode(this.currentUser.account);
        } else {
          url = window.context.mobile + '/previewForm/' + this.formId + '?token=' + this.currentUser.token
          // Base64.encode(this.currentUser.account);
        }
        window.open(url, '_blank')
      }
    },
    genHtml() {
      request.post('${form}/form/form/v1/generateFrom', this.getPostData()).then(response => {
        this.$message.success(response.data.message)
        this.$emit('close-dialog')
      })
    },
    editHtml() {},
    isUpload() {},
    addStyle(listValue) {
      if (listValue.columns.length > 2) {
        listValue.columns.forEach((v, i) => {
          if (v.style && v.style.includes('border')) {
            // lyzcw:2021-11-30，如果用户指定了右边框属性，就要显示右边框
            if (i < listValue.columns.length - 1 && !v.style.includes('border-right')) {
            //if (i < listValue.columns.length - 1 && !v.style.includes('border-right: none')) {
              v.style += ' border-right: none; '
            }
          }
        })
      }
    },

    judgeWidgetFormList(widgetFormList) {
      // 判断表单当中，有必须绑定属性的控件没有绑定属性
      let resultVal = true
      let fieldList = []
      for (var i = 0; i < widgetFormList.length; i++) {
        var listValue = this.widgetForm.list[i]
        if (listValue.columns) {
          this.addStyle(listValue)
          // 栅格布局的字段保存  tab 折叠
          for (var j = 0; j < listValue.columns.length; j++) {
            var listValue1 = []
            //非布局字段
            var fieldListValue1 = listValue.columns[j].list.filter(c => {
              !controlsApi.isLayoutComponents(c.ctrlType) && !c.options.noBindModel && c.options.noBindModel != undefined
            })
            listValue1 = listValue1.concat(fieldListValue1)
            //栅格-折叠-tab布局/表格布局
            var gridListValue1 = listValue.columns[j].list.filter(c => c.ctrlType == 'grid' || c.ctrlType == 'table' || c.ctrlType == 'tab' || c.ctrlType == 'accordion')
            for (let k = 0; k < gridListValue1.length; k++) {
              //栅格-折叠-tab布局
              var columnsObj = gridListValue1[k].columns
              if(columnsObj){
                for (let l = 0; l < columnsObj.length; l++) {
                  var list = columnsObj[l].list
                  list = list.filter(c => {
                    if(c.ctrlType=="table"){
                      c.rows.forEach(item => {
                        item.cols.forEach(obj => {
                          listValue1 = listValue1.concat(obj.list)
                        })
                      })
                    }else{
                      var obj = c.columns;
                      if(obj){
                        for (let l = 0; l < obj.length; l++) {
                          var list = obj[l].list
                          list = list.filter(n => {
                            return !n.options.noBindModel
                          })
                          listValue1 = listValue1.concat(list)
                        }
                      }
                    }
                  })
                  listValue1 = listValue1.concat(list)
                }
              }
              //表格布局
              if(!columnsObj){
                columnsObj = gridListValue1[k].rows
                columnsObj.forEach(item => {
                  item.cols.forEach(obj => {
                    listValue1 = listValue1.concat(obj.list)
                  })
                })
              }
            }
            fieldList = fieldList.concat(listValue1)
            //子表布局
            var subtableListValue1 = listValue.columns[j].list.filter(c => c.ctrlType == 'subtable' || c.ctrlType == 'subDiv')

            for (let k = 0; k < subtableListValue1.length; k++) {
              var subObj = subtableListValue1[k]
              if (subObj.list) {
                if (!this.subUnique(subObj)) {
                  return false
                }
              }
            }
            resultVal = this.validateFields(listValue1)
            if (!resultVal) {
              return false
            }

            //数据视图
            var dataViewListValue1 = listValue.columns[j].list.filter(c => c.ctrlType == 'dataView')

            for (let h = 0; h < dataViewListValue1.length; h++) {
              var dataView = dataViewListValue1[h]
              if (dataView.templateKey == '') {
                this.$message.error('请绑定表单列表')
                return false
              }
            }

            for (let f = 0; f < fieldList.length; f++) {
              for (let v = 0; v < listValue.columns[j].list.length; v++) {
                if (listValue.columns[j].list[v].fieldPath == fieldList[f].fieldPath && fieldList[f].target) {
                  this.$message.error('字段属性【' + fieldList[f].title + '】,绑定了多个布局控件')
                  return false
                }
              }
            }
            // if (listValue.ctrlType == "grid") {
            fieldList = fieldList.concat(listValue.columns[j].list)
            // }
          }
        } else if (listValue.list) {
          let _this = this
          let fieldNum = 0
          try {
            listValue.list.forEach((v, index) => {
              if ((listValue.ctrlType == 'subtable' || listValue.ctrlType == 'subDiv') && fieldNum == 0) {
                if (v.ctrlType != 'sunDiv' && v.ctrlType != 'suntable') {
                  fieldNum++
                } else if (listValue.list.length - 1 == index && fieldNum == 0) {
                  throw new Error('请给子表添加字段!')
                }
              }
              if (v.ctrlType == 'grid') {
                _this.addStyle(v)
              }
            })
          } catch (e) {
            this.$message({type: 'error', message: e.message})
            return false
          }
          var res = this.subUnique(listValue)
          if (!res) {
            return false
          }
        } else if ((!listValue.options || !listValue.options.noBindModel) && !listValue.rows) {
          fieldList.push(listValue)
          // 不使用布局
          resultVal = this.validateField(listValue)
          if (!resultVal) {
            break
          }
        } else if (listValue.rows && listValue.rows.length > 0) {
          listValue.rows.forEach(item => {
            item.cols.forEach(obj => {
              fieldList = fieldList.concat(obj.list)
            })
          })
          // 表格布局
          resultVal = this.validateRowFields(listValue)
          if (!resultVal) {
            break
          }
        } else if (listValue.templateKey) {
          if (listValue.templateKey == '') {
            //数据视图
            this.$message.error('请绑定表单列表')
            return false
          }
        }
      }
      let obj = this.unique(fieldList)
      if (this.unique(fieldList)) {
        let repeatArray = fieldList.filter(item => {
          return item.fieldPath === obj.fieldPath
        })
        let desc = ''
        let title = repeatArray[0].title
        if (!title) {
          title = repeatArray[0].fieldPath
        }
        repeatArray.forEach(item => {
          desc = desc + item.desc + ','
        })
        this.$message.error('属性【' + title + '】,绑定了多个控件')
        return false
      }
      return resultVal
    },
    subUnique(listValue) {
      let res = true
      if (!listValue.options.boSubEntity) {
        this.$message.error(listValue.desc + '请绑定实体')
        return false
      }
      if (listValue.list.length == 0) {
        this.$message.error(listValue.desc + '请至少绑定一个子表字段')
        return false
      }
      //获取孙表字段
      let sunList = listValue.list.filter(c => c.ctrlType == 'suntable' || c.ctrlType == 'sunDiv')
      for (let k = 0; k < sunList.length; k++) {
        if (!sunList[k].options.boSubEntity) {
          this.$message.error(sunList[k].desc + '请绑定实体')
          return false
        }
        if (sunList[k].list.length == 0) {
          this.$message.error(sunList[k].desc + '请至少绑定一个孙表字段')
          return false
        }
        let sunFieldList = this.getField(sunList[k])
        if (this.unique(sunFieldList)) {
          let repeatArray = sunFieldList.filter(item => {
            return item.fieldPath === obj.fieldPath
          })
          let desc = ''
          let title = repeatArray[0].title
          if (!title) {
            title = repeatArray[0].fieldPath
          }
          repeatArray.forEach(item => {
            desc = desc + item.desc + ','
          })
          this.$message.error(listValue.desc + '孙表中属性【' + title + '】,绑定了多个控件【' + desc + '】,只能绑定一个')
          return false
        }
        if (!this.validateFields(sunFieldList)) {
          return false
        }
      }

      let subFieldList = this.getField(listValue)
      let obj = this.unique(subFieldList)
      if (obj) {
        let repeatArray = subFieldList.filter(item => {
          return item.fieldPath === obj.fieldPath
        })
        let desc = ''
        let title = repeatArray[0].title
        if (!title) {
          title = repeatArray[0].fieldPath
        }
        repeatArray.forEach(item => {
          desc = desc + item.desc + ','
        })
        this.$message.error(listValue.desc + '子表中属性【' + title + '】,绑定了多个控件【' + desc + '】,只能绑定一个')
        return false
      }
      if (!this.validateFields(subFieldList)) {
        return false
      }
      return res
    },
    getField(listValue) {
      //获取布局中栅格布局
      let gridListValue1 = listValue.list.filter(c => c.ctrlType == 'grid')
      //获取布局中基础字段
      let subFieldList = listValue.list.filter(c => c.ctrlType != 'grid' && (c.ctrlType != 'suntable' || c.ctrlType != 'sunDiv'))
      for (let k = 0; k < gridListValue1.length; k++) {
        let columnsObj = gridListValue1[k].columns
        for (let l = 0; l < columnsObj.length; l++) {
          let list = columnsObj[l].list
          subFieldList = subFieldList.concat(list)
        }
      }
      return subFieldList
    },
    unique(arr) {
      var hash = {}
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].fieldPath && hash[arr[i].fieldPath]) {
          return arr[i]
        }
        hash[arr[i].fieldPath] = true
      }
      return false
    },
    validateRowFields(field) {
      let resultVal = true
      for (var k = 0; k < field.rows.length; k++) {
        let cols = field.rows[k].cols
        for (var c = 0; c < cols.length; c++) {
          for (let l = 0; l < cols[c].list.length; l++) {
            resultVal = this.validateField(cols[c].list[l])
            if (!resultVal) {
              return false
            }
          }
        }
      }
      return true
    },
    validateFields(fields) {
      let resultVal = true
      for (var k = 0; k < fields.length; k++) {
        resultVal = this.validateField(fields[k])
        if (!resultVal) {
          return false
        }
      }
      return true
    },
    validateField(field) {
      if ((!field.options || !field.options.noBindModel) && field.name == '') {
        this.$message.error('请绑定属性值')
        return false
      }
      if (field.ctrlType == 'selector' && !field.options.selector.type.alias) {
        this.$message.error('选择器控件请绑定选择器')
        return false
      }
      return true
    }
  }
}
</script>
<style lang="scss" scoped>
.navbar-default {
  height: 100%;
  background-image: none;
  background: #fff;
  border-radius: 0px;
  box-shadow: 0px 2px 5px rgba(86, 96, 117, 0.15);
  border-bottom: 1px solid #ededed;
  justify-content: space-between;
  padding: 0 10px;
}

.navbar-default span {
  color: #666;
  font-size: 14px;
  line-height: 48px;
  font-weight: bold;
  margin-left: 20px;
}

.navbar-default button {
  margin-right: 10px;
}
/deep/ .CodeMirror {
  font-family: monospace;
  height: 100% !important;
  color: black;
  direction: ltr;
  .CodeMirror-scroll {
    height: 100%;
  }
}
.includding-form .el-dialog .el-dialog__body {
  padding: 10px 5px;
}
@media (max-width: 1024px) {
  .urgent-text {
    /deep/ .el-dialog {
      width: 78% !important;
    }
  }
}
</style>
