<template>
  <div>
    <el-form
      label-position="right"
      :label-width="labelWidth"
      :model="bpmForm"
      size="mini"
    >
      <ht-form-item :label="title">
        <el-select v-model="bpmForm.pc.type" placeholder="请选择表单类型" @change="handleTypeChange">
          <el-option label="在线表单" value="INNER"></el-option>
          <el-option label="URL表单" value="FRAME"></el-option>
        </el-select>
      </ht-form-item>
      <ht-form-item label="PC端" v-show="bpmForm.pc.type == 'INNER'">
        <el-tag v-if="bpmForm.pc.name">{{ bpmForm.pc.name }}</el-tag>
        <span v-if="!bpmForm.pc.name" class="operation_text">请选择</span>
        <el-button
          icon="el-icon-search"
          @click="selectForm(bpmForm.pc)"
        ></el-button>
        <el-button
          v-if="bpmForm.pc.name"
          @click="clearForm(bpmForm.pc)"
          icon="el-icon-refresh-left"
        ></el-button>
      </ht-form-item>
      <ht-form-item v-show="bpmForm.pc.type == 'INNER'" label="手机端">
        <el-tag v-if="bpmForm.mb.name">{{ bpmForm.mb.name }}</el-tag>
        <span v-if="!bpmForm.mb.name" class="operation_text">请选择</span>
        <el-button
          icon="el-icon-search"
          @click="selectForm(bpmForm.mb)"
        ></el-button>
        <el-button
          v-if="bpmForm.mb.name"
          @click="clearForm(bpmForm.mb)"
          icon="el-icon-refresh-left"
        ></el-button>
      </ht-form-item>

      <ht-form-item v-show="bpmForm.pc.type == 'FRAME'" label="PC端URL">
        <el-input v-model="bpmForm.pc.formValue"></el-input>
      </ht-form-item>
      <ht-form-item v-show="bpmForm.pc.type == 'FRAME'" label="移动端URL">
        <el-input v-model="bpmForm.mb.formValue"></el-input>
      </ht-form-item>

      <ht-form-item label="设置" v-if="type != '2' || bpmForm.pc.name">
        <el-button
          v-if="bpmForm.pc.name"
          size="mini"
          @click="formAuth()"
          icon="icon-permission"
          >授权</el-button
        >
        <el-button
          v-if="showAuthorizeSubData"
          size="mini"
          @click="authorizeSubData()"
          icon="icon-permission"
          >子表数据授权</el-button
        >
        <el-button
          v-if="type != '2' && bpmForm.pc.name"
          size="mini"
          @click="setFormExtraConf"
          icon="icon-feedback"
          >扩展映射字段</el-button
        >
        <el-upload
          v-if="type != '2'"
          class="upload-demo"
          :action="actionUrl"
          :on-remove="handleRemove"
          :file-list="files"
          :headers="header"
          :on-success="success"
          ref="fileUp"
          :limit="1"
        >
          <el-button
            style="margin-top: 8px"
            size="mini"
            v-if="!bpmForm.pc.helpFile"
            icon="icon-query"
            >审批帮助</el-button
          >
        </el-upload>
      </ht-form-item>
    </el-form>

    <EipFormDialog
      ref="eipFormDialog"
      :single="true"
      @onConfirm="dialogConfirm"
      :formType="curSelectForm.formType"
      :pcFormKey="bpmForm.pc.formValue"
      appendToBody
    />
    <FlowFormAuth ref="flowFormAuth" />
    <FlowFormExtraPropSet
      @formPropSetConfirm="formPropSetConfirm"
      ref="flowFormExtraPropSet"
    />
    <!-- 子表数据授权设置 -->
    <FlowFormRightSubSetting
      ref="flowFormRightSubSetting"
      :nodeId="nodeId"
      :defId="defId"
      parentDefKey="local_"
      :flowKey="defkey"
    />
  </div>
</template>

<script>
import flow from '@/api/flow.js'
import req from '@/request.js'
import {mapState, mapActions} from 'vuex'
const FlowFormAuth = () => import('@/components/flow/FlowFormAuth.vue')
const FlowFormRightSubSetting = () =>
  import('@/components/flow/FlowFormRightSubSetting.vue')
const FlowFormExtraPropSet = () =>
  import('@/components/flow/FlowFormExtraPropSet.vue')
const EipFormDialog = () => import('@/components/dialog/EipFormDialog.vue')
const HtFileUpload = () => import('@/components/common/HtFileUpload.vue')

export default {
  props: {
    labelWidth: {
      type: String,
      default: '100px',
    },
    defId: String,
    title: String,
    type: String,
    nodeId: String,
    defkey: String,
    nodeType: String,
  },
  components: {
    FlowFormAuth,
    FlowFormExtraPropSet,
    EipFormDialog,
    HtFileUpload,
    FlowFormRightSubSetting,
  },
  data() {
    return {
      tempSettting: {},
      bpmForm: {},
      showAuthorizeSubData: false,
      formDialogVisible: false,
      formListData: [],
      tableColumns: [
        {prop: 'formKey', label: '表单key'},
        {prop: 'name', label: '表单名称', width: '300'},
        {prop: 'version', label: '版本号'},
      ],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0,
      },
      curSelectForm: {},
      files: [],
    }
  },
  computed: mapState({
    defConfigData: (state) => state.flow.defConfigData,
    header: (state) => {
      return {Authorization: `Bearer ${state.login.currentUser.token}`}
    },
    actionUrl: function () {
      return window.context.portal + '/system/file/v1/upload'
    },
  }),
  watch: {
    bpmForm: {
      handler(newValue, oldValue) {
        this.updateForm()
      },
      deep: true,
    },
  },
  mounted() {
    const this_ = this
    //监听保存流程配置的点击事件
    this.$root.$on('nodeSetUpdate', function (value) {
      if (this_.nodeType) {
        this_.bpmForm.pc.formValue = this_.bpmForm.pc.formValue || ''
        //判断是否显示子表数据授权按钮
        if (
          (this_.nodeType == 'userTask' || this_.nodeType == 'signTask') &&
          this_.bpmForm.pc.formValue != ''
        ) {
          this_.showAuthorizeSubData = true
        } else {
          this_.showAuthorizeSubData = false
        }
      }
    })
    //打开配件节点表单时，判断是否显示子表数据授权按钮
    if (
      this_.bpmForm.pc.formValue &&
      (this_.nodeType == 'userTask' || this_.nodeType == 'signTask')
    ) {
      this_.showAuthorizeSubData = true
    }
  },
  methods: {
    handleTypeChange(val) {
      if (this.bpmForm.pc.formValue || this.bpmForm.mb.formValue) {
        let this_ = this
        this.$confirm('更换表单类型会清除之前的表单配置，是否确认更换？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            if (val == 'FRAME') {
              if (this_.bpmForm.mb.formValue) {
                this_.doClearForm(this_.bpmForm.mb)
              }
              this_.doClearForm(this_.bpmForm.pc)
            }else{
              this_.$set(this_.bpmForm.pc, 'name', '')
              this_.$set(this_.bpmForm.pc, 'formValue', '')
              this_.$set(this_.bpmForm.mb, 'name', '')
              this_.$set(this_.bpmForm.mb, 'formValue', '')
            }
        }).catch(() => {
          this.$set(this_.bpmForm.pc,'type',val == 'INNER' ?'FRAME':'INNER');         
        });
      } 
    },
    //打开子表数据授权
    authorizeSubData() {
      this.$refs.flowFormRightSubSetting.showDialog()
    },
    dialogCancel() {},
    formPropSetConfirm(conf) {
      this.bpmForm.pc.formExtraConf = JSON.stringify(conf)
    },
    setFormExtraConf() {
      let param = {
        formkey: this.bpmForm.pc.formValue,
        propConf: this.bpmForm.pc.formExtraConf,
      }
      this.$refs.flowFormExtraPropSet.showDialog(param)
    },
    dialogConfirm(data) {
      if (data && data.length > 0) {
        data = data[0]
        if (
          this.curSelectForm.formValue &&
          this.curSelectForm.formValue != data.formKey &&
          this.curSelectForm.formType == 'pc'
        ) {
          let this_ = this
          this.$confirm(
            '更换表单将会清除之前表单权限配置和手机表单，是否确认更换？',
            '提示',
            {
              cancelButtonText: '取消',
              confirmButtonText: '确定',
              type: 'warning',
              closeOnClickModal: false,
            }
          ).then(() => {
            if (this_.bpmForm.mb.formValue) {
              this_.doClearForm(this_.bpmForm.mb)
            }
            this.doClearForm(this_.curSelectForm, function () {
              this_.curSelectForm.formValue = data.formKey
              this_.curSelectForm.name = data.name
              this_.formDialogVisible = false
              this_.$message.success('表单设置已清除')
            })
          })
        } else {
          this.curSelectForm.formValue = data.formKey
          this.curSelectForm.name = data.name
          this.formDialogVisible = false
        }
      }
    },
    selectForm(form) {
      if (form.formType == 'mobile' && !this.bpmForm.pc.formValue) {
        this.$message.warning(
          '请先选择pc表单，才能根据pc表单的数据建模筛选手机表单'
        )
        return
      }
      this.curSelectForm = form
      this.$refs.eipFormDialog.showDialog()
    },
    formAuth() {
      let param = {
        flowKey: this.defConfigData.initData.bpmDefinition.defKey,
        formKey: this.bpmForm.pc.formValue,
        nodeId: this.nodeId,
        parentflowKey: this.defkey == undefined ? '' : this.defkey,
        type: this.type,
      }
      this.$refs.flowFormAuth.showDialog(param)
    },
    clearForm(form, callBack) {
      if (form.formType == 'pc') {
        this.$confirm(
          '此操作清除之前表单权限配置和手机表单，是否确认操作？',
          '提示',
          {
            cancelButtonText: '取消',
            confirmButtonText: '确定',
            type: 'warning',
            closeOnClickModal: false,
          }
        ).then(() => {
          this.doClearForm(form)
          if (this.bpmForm.mb.formValue) {
            this.doClearForm(this.bpmForm.mb)
          }
        })
      } else {
        this.doClearForm(form)
      }
    },
    doClearForm(form, callBack) {
      let nodeId = form.nodeId || ''
      let this_ = this
      let parentFlowKey = this.defkey == undefined ? '' : this.defkey
      req
        .get(
            '${form}/form/rights/v1/remove?flowKey=' +
            this.defConfigData.initData.bpmDefinition.defKey +
            '&nodeId=' +
            nodeId +
            '&parentFlowKey=' +
            parentFlowKey
        )
        .then(function (resp) {
          let data = resp.data
          if (data.state) {
            this_.$set(form, 'name', '')
            this_.$set(form, 'formValue', '')
            this_.showAuthorizeSubData = false
            if (callBack) {
              callBack()
            } else {
              this_.$message.success('表单设置已清除')
            }
          } else {
            this_.$message.fail(data.message)
          }
        })
    },
    success(response, file, fileList) {
      this.files = []
      for (let i = 0; i < fileList.length; i++) {
        if (fileList[i].response) {
          let value = fileList[i].response
          let arrarFile = {}
          arrarFile.id = value.fileId
          arrarFile.name = value.fileName
          arrarFile.size = value.size
          this.files.push(arrarFile)
        }
      }
      this.bpmForm.pc.helpFile = JSON.stringify(this.files)
    },
    handleRemove(file, fileList) {
      this.$set(this.bpmForm.pc, 'helpFile', '')
    },
    updateForm() {
      //保持pc端和移动端表单的类型一致
      this.bpmForm.mb.type = this.bpmForm.pc.type

      if (this.type == '1') {
        this.$store.dispatch('flow/updateConfig', {
          'nodeSetData.bpmDefSetting.globalForm': this.bpmForm.pc,
        })
        this.$store.dispatch('flow/updateConfig', {
          'nodeSetData.bpmDefSetting.globalMobileForm': this.bpmForm.mb,
        })
      } else if (this.type == '2') {
        this.$store.dispatch('flow/updateConfig', {
          'nodeSetData.bpmDefSetting.instForm': this.bpmForm.pc,
        })
        this.$store.dispatch('flow/updateConfig', {
          'nodeSetData.bpmDefSetting.instMobileForm': this.bpmForm.mb,
        })
      } else {
        let pcPath = 'nodeSetData.bpmDefSetting.formMap.' + this.nodeId
        let mbPath = 'nodeSetData.bpmDefSetting.mobileFormMap.' + this.nodeId
        let pcForm = {}
        pcForm[pcPath] = this.bpmForm.pc
        let mbForm = {}
        mbForm[mbPath] = this.bpmForm.mb
        this.$store.dispatch('flow/updateConfig', pcForm)
        this.$store.dispatch('flow/updateConfig', mbForm)
      }
    },
  },
  created() {
    if (this.defConfigData.nodeSetData.bpmDefSetting) {
      this.tempSettting = JSON.parse(
        JSON.stringify(this.defConfigData.nodeSetData.bpmDefSetting)
      )
      if (this.type == '1') {
        this.bpmForm = {
          pc: this.tempSettting.globalForm,
          mb: this.tempSettting.globalMobileForm,
        }
      } else if (this.type == '2') {
        this.bpmForm = {
          pc: this.tempSettting.instForm,
          mb: this.tempSettting.instMobileForm,
        }
      } else {
        this.bpmForm = {
          pc: this.tempSettting.formMap[this.nodeId],
          mb: this.tempSettting.mobileFormMap[this.nodeId],
        }
      }
      if (this.bpmForm.pc && this.bpmForm.pc.helpFile) {
        this.files = JSON.parse(this.bpmForm.pc.helpFile)
      }
    }
  },
}
</script>

<style  scoped>
div >>> .box-card {
  margin-bottom: 20px;
}

div >>> .box-card .clearfix {
  padding-top: 20px;
}

div >>> .el-collapse-item__header {
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  font-weight: bold;
}

div >>> .el-button {
  padding: 7px;
  margin-left: 10px;
}
.upload-demo {
  display: inline-block;
}

.upload-demo >>> .el-upload {
  display: inline;
}
.upload-demo >>> .el-upload-list__item {
  margin-top: 5px !important;
}
.upload-demo >>> .el-upload-list__item-name {
  white-space: normal;
}
</style>
