<template>
  <el-main class="base-main">
    <div
      style="
        width: 96%;
        margin: 0px auto 0;
        background-color: #fff;
        padding: 20px;
        margin-top: 20px;
      "
    >
      <div id="printData">
        <div class="form-container">
          <span>表单内容</span>
          <!--合同、合同审批和范本表单，pdf套打预览, lyzcw:2021-06-03 13:41 -->
          <div
            v-if="['ht', 'htN', 'htsp', 'fb', 'htbgN'].includes(formKey)"
            style="float: right; margin-right: 20px"
          >
            <el-tooltip placement="right" effect="light">
              <div slot="content">预览套打文件</div>
              <ou-print
                ref="ouPrint"
                :getFormKey="getFormKey"
                :getFormData="getFormData"
              ></ou-print>
            </el-tooltip>
          </div>
          <!-- TODO wude 部分表单可查看流程图逻辑待删除? -->
          <!-- lyzcw: 2021-07-29 部分表单可查看流程图 -->
          <div
            v-if="
              ['ht', 'htN', 'htsp', 'htpkg', 'fb', 'htbgN'].includes(formKey)
            "
            style="float: right; margin-right: 20px"
          >
            <el-tooltip placement="right" effect="light">
              <div slot="content">查看审批流程</div>
              <el-button @click="taskImage()" icon="icon-flow1" size="mini"
                >流程图</el-button
              >
            </el-tooltip>

            <TaskImage
              ref="taskImage"
              :bpmnInstId="selectBpmnInstId"
              :instId="selectInstanceId"
              :defId="selectDefId"
            />
          </div>
        </div>
        <div class="form-content">
          <form v-if="html" data-vv-scope="custom-form">
            <online-form
              class="custom-form"
              :html="html"
              :data="data"
              :permission="permission"
              :isView="isView"
              ref="onlineForm"
              :isPrint="print"
              @loadSuccess="loadSuccess"
            />
          </form>
        </div>
      </div>
      <div
        style="wdith: 100%; text-align: center; padding-top: 20px"
        ref="btnRegion"
      >
        <el-button
          type="success"
          v-if="startFlow && startFlow != 'false' && action != 'get'"
          @click="start"
          :disabled="disabled"
          >{{ startLable }}</el-button
        >
        <el-button
          type="primary"
          icon="el-icon-printer"
          v-if="isNavShow"
          @click="printDetail()"
          :disabled="disabled"
          >{{ printLable }}</el-button
        >
        <el-button
          type="primary"
          @click="boSave()"
          v-if="!(startFlow && startFlow != 'false' && action != 'get')&&isShow && action != 'editDraft'"
          :disabled="disabled"
          >保存</el-button
        >
        <!-- <el-button
          type="primary"
          @click="boSave()"
          v-if="$route.path.indexOf('spgl/add') > -1"
          :disabled="disabled"
          >稍后上架</el-button
        > -->
        <el-button
          type="primary"
          @click="boSaveAndDelDraft"
          v-if="action === 'editDraft'"
          :disabled="disabled"
          >保存并删除草稿</el-button
        >
        <el-button
          type="primary"
          @click="boSaveDraft"
          v-if="!id"
          :disabled="disabled"
          >保存至草稿</el-button
        >
        <el-button type="error" v-if="showCloseBtn" @click="closeOrReturn(closeBtnText=='关闭')"
          >{{closeBtnText}}</el-button
        >
        <el-button type="error" v-else @click="close(false)">返回</el-button>
      </div>
    </div>
  </el-main>
</template>
<script>
//TODO:执行一段脚本,能够修改表单权限对象
import OuPrint from '@/components/eipControl/ou/OuPrint.vue'
import OnlineForm from '@/components/flow/OnlineForm.vue'
import form from '@/api/form.js'
import utils from '@/utils.js'
import TaskImage from '@/components/flow/task/taskImage.vue'
import { baseHandlerJs } from '@/utils/handlerJs'

export default {
  name: 'templateForm',
  props: ['templateKey', 'action', 'isShare', 'openType'],
  data() {
    return {
      alias_new: 'statement',
      html: null,
      data: null,
      dataBack: null, // 2022-11-30 wude 新增data的备份
      permission: null,
      reloadOnlineForm: false,
      isView: true,
      disabled: false,
      boAlias: '',
      id: '',
      startFlow: false,
      recordId: '',
      defKey: '',
      formKey: '',
      fillField: '',
      fillValue: '',
      bindList: [],
      print: false,
      isShow: true,
      tempAlias: '',
      startLable: '发起流程',
      printLable: '打印',
      //其他表单预览打开标识，lyzcw:2021-05-30 20:09
      viewType: '',
      // 部分表单可查看流程图，lyzcw:2021-07-29 16:44
      selectBpmnInstId: '',
      selectInstanceId: '',
      selectDefId: '',
      showCloseBtn: false,
      closeBtnText:'关闭'
    }
  },
  components: {OnlineForm, OuPrint, TaskImage,
  },
  computed:{
    isNavShow:function(){
      return window.context.isShow
    }
  },
  updated() {
    let result = window.location.href.split('?')[0].split('/')
    if (
      result[result.length - 1] == 'get' ||
      result[result.length - 2] == 'get'
    ) {
      this.isShow = false
    }
    //判断是否显示发起流程按钮
    if (
      window.location.href.split('?')[1] &&
      window.location.href.split('?')[1].split('&')
    ) {
      if (
        window.location.href.split('?')[1].split('&')[1] &&
        window.location.href.split('?')[1].split('&')[1] == 'startFlow=false'
      ) {
        this.startFlow = false
      }
    }
  },
  methods: {
    //lyzcw: 流程图 2021-07-29
    async taskImage() {
      // lyzcw：某些表单打开时，获取表单字段，2021-07-29
      var this_ = this //ccwgq   修复缺失this_导致的报错
      await this.getFormFields()
      if (this_.selectDefId == '' || this_.selectInstanceId == '') {
        this.$message.warning('该合同所没有审批流程信息')
        //     return false;
      } else {
        this.$refs.taskImage.handleOpen() //父组件调用子组件方法
      }
    },
    getFormFields() {
      let this_ = this
      let boData = this_.data
      if (['ht', 'htsp', 'htN'].includes(this_.formKey)) {
        this_.selectDefId = boData.ht.def_id
        this_.selectInstanceId = boData.ht.inst_id
      } else if (this_.formKey == 'fb') {
        this_.selectDefId = boData.htfb.def_id
        this_.selectInstanceId = boData.htfb.inst_id
      } else if (this_.formKey == 'htpkg') {
        this_.selectDefId = boData.dbht.def_id
        this_.selectInstanceId = boData.dbht.inst_id
      } else if (this_.formKey == 'htbgN') {
        this_.selectDefId = boData.htbg.def_id
        this_.selectInstanceId = boData.htbg.inst_id
      }
    },
    getFormData() {
      let this_ = this
      let boData = this_.data
      return boData
    },
    getFormKey() {
      let this_ = this
      return this_.formKey
    },

    loadSuccess() {
      if (this.$route.query.isPrint) {
        this.printDetail()
      }
    },
    printDetail() {
      this.$refs.btnRegion.style.display = 'none'
      setTimeout(() => {
        document.getElementsByTagName('body')[0].style.zoom = 0.8
        window.print()
        this.$refs.btnRegion.style.display = 'block'
        if (this.$route.query.isPrint) {
          this.close(false)
        }
        document.getElementsByTagName('body')[0].style.zoom = 1
      }, 500)
    },
    //启动
    start() {
      utils
        .getOnlineFormData(true)
        .then((formDataStr) => this.processStart(formDataStr))
        .catch((reason) =>
          utils.handleGetFormDataReject(reason).then(() => this.processStart())
        )
    },
    processStart(formDataStr) {
      utils.closeAllNotification()
      let data = {flowKey: this.defKey}
      if (formDataStr) {
        data.data = Base64.encode(formDataStr)
      }
      this.disabled = true
      this.$store
        .dispatch('storeProcess/start', data)
        .then(() => {
          this.close(true)
        })
        .catch(() => {
          this.disabled = false
        })
    },
    //保存
    boSave(delDraftId) {
      utils
        .getOnlineFormData(true)
        .then((formDataStr) => {
          utils.closeAllNotification()
          let _me = this
          // for (let i=0; i<_me.$validator.errors.items.length; i++) {
          //   if(_me.$validator.errors.items[i].rule == "required"){
          //     this.$message.warning("请将信息填写完整");
          //     return false;
          //   }
          // }
          let data = {
            boAlias: this.boAlias,
            boData: utils.parseToJson(formDataStr),
          }
          //数据视图控件
          // if (this.fillField && this.fillField != "") {
          //   let fillField = this.fillField;
          //   data.boData[this.boAlias][fillField] = this.fillValue;
          // }
          this.disabled = true

          if (delDraftId) {
            data.delDraftId = delDraftId
          }
          data.formKey = this.formKey
          data.templateKey = this.templateKey
          this.$store.dispatch('form/boSave', data).then((result) => {
            if (result.state) {
              //当操作为编辑是，点击保存成功后提示继续编辑还是返回
              if (this.action === 'edit' || this.action === 'add') {
                this.$message.success(result.message)
                this.$confirm('保存成功，是否退出？', '提示', {
                  confirmButtonText: '立即退出',
                  cancelButtonText: '继续操作',
                  type: 'warning',
                })
                  .then(() => {
                    this.close(false)
                  })
                  .catch(() => {
                    this.$refs.onlineForm.init()
                    this.disabled = false
                    if (this.action === 'editDraft') {
                      this.editDraftHandler()
                    } else {
                      this.handler()
                    }
                  })
              } else {
                this.close(true)
              }
            } else {
              this.disabled = false
            }
          })
        })
        .catch((reason) => utils.handleGetFormDataReject(reason))
    },
    boSaveAndDelDraft() {
      this.boSave(this.draftId)
    },
    //保存
    boSaveDraft() {
      const this_ = this
      utils
        .getOnlineFormData(false)
        .then((formDataStr) => {
          utils.closeAllNotification()
          let _me = this
          let data = {
            tempAlias: this.tempAlias,
            dataJson: formDataStr,
          }
          if (this.draft) {
            data.id = this.draft.id
            data.title = this.draft.title
            data.createBy = this.draft.createBy
            data.createTime = this.draft.createTime
          }
          //数据视图控件
          // if(this.bindList && this.bindList.length >0) {
          //   for(var i=0;i<this.bindList.length;i++){
          //     data.boData[this.boAlias][this.bindList[i].key] = this.bindList[i].value;
          //   }
          // }
          this.disabled = true
          this.$store.dispatch('form/boSaveDraft', data).then((result) => {
            if (result.state) {
              this.$message.success(result.message)
              let dataViewFlag = false
              //数据视图随机添加到其他菜单下面时获取当前菜单的别名  并且当前数据视图不是表单里的数据视图  dataViewFlag
              if (
                sessionStorage.menu_alias &&
                !(this_.fillField && this_.fillField != '')
              ) {
                this.alias_new = sessionStorage.menu_alias
              }
              //判断当前数据视图是不是表单里的数据视图
              if (this.bindList && this.bindList.length > 0) {
                dataViewFlag = true
              }
              if (_me.isShare) {
                _me.close(true)
                return
              }
              let path = ''
              if (this.openType == 'new') {
                path = `/statement/draftList/${this.tempAlias}/${dataViewFlag}?isNew=true`
              } else {
                path =
                  '/' +
                  this.alias_new +
                  '/draftList/' +
                  this.tempAlias +
                  '/' +
                  dataViewFlag
              }
              this.$router.push(path)
              // this.$router.push("/statement/draftList");
            } else {
              this.disabled = false
              this.$message.error(result.message)
            }
          })
        })
        .catch((reason) => utils.handleGetFormDataReject(reason))
    },

    //关闭窗口
    close(isDelay) {
      utils.closeAllNotification()
      let _me = this
      let url = window.location.href
      let arr = url.split('?')
      if (isDelay) {
        setTimeout(function () {
          if (_me.isShare) {
            _me.$router.push('/messageFillPage/1')
            return
          }
          if (arr.length > 1) {
            let param = url.split('?')[1].split('&')
            if (param.includes('isNewPage=true')) {
              _me.$router.push('/messageFillPage/1')
              return
            }
          }
          if (_me.openType == 'new') {
            //跳转到草稿
            let dataViewFlag = false
            if (_me.bindList && _me.bindList.length > 0) {
              dataViewFlag = true
            }
            _me.$router.push(
              `/statement/draftList/${_me.tempAlias}/${dataViewFlag}?isNew=true`
            )
          } else {
            _me.$router.go(-1)
          }
        }, 2000)
      } else {
        if (_me.isShare) {
          _me.$router.push('/messageFillPage/1')
        } else {
          if (_me.openType == 'new') {
            window.close()
            // lyzcw: 其他页面预览打开时，修改打开类型，2021-05-28
          } else if (_me.viewType == 'preview') {
            _me.$router.go(-1)
          } else {
            if (_me.$route.path.indexOf('dzgl') > -1) { 
              _me.$router.go(-1);
              return
            }
            //打印取消之后会导致路由发生变化,不能直接回到上一个页面
            let menuAlias = 'statement'
            //发布到其它菜单的别名
            if (sessionStorage.menu_alias) {
              menuAlias = sessionStorage.menu_alias
            }
            let url = '/' + menuAlias + '/template/preview/' + _me.templateKey
            if (_me.$route.meta && _me.$route.meta.single) {
              url += '/true'
            }
            _me.$router.push(url)    
          }

          // _me.$router.go(-1);
        }
      }
    },
    //ccwgq 2022-08-26 直接关闭窗口/返回上一页
    closeOrReturn(isClose) {
     if(isClose){
       window.close && window.close()
       return
     }
     else{
      if((this.$route.query?.from ?? '') == 'home'){
        this.$store.dispatch('menu/setColumnInfo',{restore:true})
        this.$router.push('/home')
        return;
      }
      this.$router.go(-1)
     }
    },
    handler() {
      let _me = this
      let data = {
        formKey: _me.formKey,
        boAlias: _me.boAlias,
        id: _me.id ? _me.id : '',
        action: _me.action,
        recordId: _me.recordId ? _me.recordId : '',
        dataKey: _me.templateKey ? _me.templateKey : '',
      }
      _me.$store.dispatch('form/getTemplateForm', data).then((rep) => {
        if (rep.result) {
          _me.data = rep.data
          //数据视图控件
          if (_me.bindList && _me.bindList.length > 0) {
            for (var i = 0; i < _me.bindList.length; i++) {
              if (_me.data[_me.boAlias][_me.bindList[i].key] == '') {
                // 回填数据
                _me.data[_me.boAlias][_me.bindList[i].key] =
                  _me.bindList[i].value
              }
            }
          }
          //是否是数据报表明细
          if (rep.permission && _me.action == 'get') {
            const permissionObj = rep.permission
            let commonRight = ''
            //如果是管理端进入，则将页面字段的权限修改为可编辑
            if (_me.type == 'manage') {
              commonRight = 'w'
              //如果是查看实例，也是获取发起流程的表单和权限。只不过所有可见的权限要变成编辑
            } else {
              commonRight = 'r'
            }
            if (permissionObj.fields && commonRight) {
              for (var key in permissionObj.fields) {
                const bodef = permissionObj.fields[key]
                if (bodef) {
                  for (var fname in bodef) {
                    if (
                      commonRight == 'w' ||
                      (commonRight == 'r' && bodef[fname] != 'n')
                    ) {
                      bodef[fname] = commonRight
                    }
                  }
                }
                permissionObj.fields[key] = bodef
              }
            }
            if (permissionObj.table && commonRight) {
              for (var key in permissionObj.table) {
                const table = permissionObj.table[key]
                if (table) {
                  if (commonRight == 'w') {
                    table['hidden'] = false
                    table['add'] = true
                    table['del'] = true
                  } else if (commonRight == 'r') {
                    table['add'] = false
                    table['del'] = false
                    table['required'] = false
                    table['edit'] = false
                  }
                }
                permissionObj.table[key] = table
              }
            }
            _me.permission = permissionObj
          } else {
            _me.permission = rep.permission
          }
          _me.html = rep.form.formHtml
          this.handlerJs(rep.form)
        }
      })
    },
    handlerJs(rep) {
      let _me = this
      _me.reloadOnlineForm = true

      setTimeout(() => {
        baseHandlerJs(rep,_me)
      }, 10)
    },
    editDraftHandler() {
      let _me = this
      _me.$store.dispatch('form/getTempDraftData', _me.draftId).then((rep) => {
        if (rep.result) {
          _me.data = rep.data
          _me.draft = rep.draft
          if (rep.permission) {
            _me.permission = rep.permission
          }
          _me.html = rep.form.formHtml
          this.handlerJs(rep.form)
        }
      })
    },
    init() {
      var $ = require('jquery')
      this.id = utils.getUrlKey('id')
      this.startFlow = utils.getUrlKey('startFlow')
      this.recordId = utils.getUrlKey('recordId')
      let bindList = utils.getUrlKey('bindList')
      // lyzcw: 其他页面预览打开时，修改打开类型，2021-05-28
      let viewType = utils.getUrlKey('openType')
      if (viewType) {
        this.viewType = viewType
      }

      if (bindList) {
        this.bindList = JSON.parse(Base64.decode(decodeURIComponent(bindList)))
      }
      this.draftId = utils.getUrlKey('draftId')
      this.isView = this.action !== 'get'
      let _me = this

      this.$store
        .dispatch('form/getBpmDataTemplateInfo', {
          templateKey: this.templateKey,
        })
        .then((result) => {
          if (result.state) {
            if (result.value.allowShare == 2 && _me.isShare) {
              _me.$router.push('/messageFillPage/5')
              return
            }
            _me.boAlias = result.value.boDefAlias
            _me.defKey = result.value.defId
            _me.formKey = result.value.formKey
            _me.tempAlias = result.value.alias
            if (result.value.manageField) {
              let re = JSON.parse(result.value.manageField)
              re.forEach((item) => {
                if (item.name == 'startFlow') {
                  this.startFlow = true
                  this.startLable = item.desc
                } else if (item.name == 'print') {
                  this.printLable = item.desc
                }
              })
            } else {
              this.startFlow = true
            }
            this.reloadOnlineForm = false
            //如果编辑的是草稿数据
            if (this.action === 'editDraft') {
              this.editDraftHandler()
            } else {
              this.handler()
            }
          }
        })
    },
  },
  created() {
    this.init()
        // console.log("templateForm.this：", this );
  },
  watch: {
    templateKey: function (n, o) {
      if (n && o && n != o) {
        this.init()
      }
    },
    //控件的联动会导致表单的permission发生变化，联动显示会变成'w'，需要改回原来的权限
    permission: {
      handler(newVal, oldVal) {
        if (this.formKey && this.action == 'get') {
          for (let key in newVal.fields[this.formKey]) {
            if (newVal.fields[this.formKey][key] == 'w') {
              newVal.fields[this.formKey][key] = 'r'
            }
          }
        }
      },
      deep: true,
    },
    // 2022-11-30 wude 监听数据变化,设置表单未提交的标识为true
    data: {
      handler(newVal) {
        console.log("表单数据别修改==>",newVal)
        let dataJson
        if(newVal) dataJson = JSON.stringify(newVal)
        if (!this.dataBack) {
          this.dataBack = dataJson
        }
        // 修改过
        if(sessionStorage.getItem('formUpdataFlag') == "true") return;
        if (dataJson != this.dataBack) {
          sessionStorage.setItem('formUpdataFlag', 'true');
          window.onbeforeunload = function(e){
              console.log('this._beforeUnload_time：', e)
              e = e || window.event
              e.preventDefault();
              if (e) {
                e.returnValue = '关闭提示'
              }
              // debugger
              return '关闭提示'
          };
          /* window.addEventListener('beforeunload', (e) => this.beforeunloadHandler(e)) */
        }
      },
      deep: true,
      immediate: false,
    },
  },
  //ccwgq 2022-09-21 调整关闭返回的逻辑
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      const close = vm.$route.query.close
      if (close !== undefined && close == 'window') {
        vm.showCloseBtn = true
        vm.closeBtnText='关闭'
      }
      else if(close =='toLast'){
        //返回上一页
        vm.showCloseBtn = true
        vm.closeBtnText='返回'
      }
    })
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
/deep/.el-form-item {
  margin-bottom: 15px !important;
  margin-top: 10px !important;
  margin-right: 10px !important;
}
.base-main {
  background-color: #e9eef3;
  height: 100%;
}

/deep/ .form-table {
  width: 100%;
  border-top: 1px solid #ebeef5;
  border-left: 1px solid #ebeef5;
}

/deep/ .form-table > thead > tr > th,
/deep/ .form-table > tbody > tr > th {
  text-align: right;
  color: #666;
  font-weight: normal;
}

/deep/ .form-table > tbody > tr > th.group-th {
  text-align: left;
  background: #f9f9f9;
  font-weight: bold;
}

/deep/ .form-table > thead > tr.sub-table-header > th {
  text-align: center;
  background: #fafafa;
}

/deep/ .form-table > tbody > tr > th > span,
/deep/ .form-table > thead > tr > th > span {
  color: #f00;
}

/deep/ .form-table > tbody > tr > th,
/deep/ .form-table > tbody > tr > td,
/deep/ .form-table > tfoot > tr > td,
/deep/ .form-table > thead > tr > th {
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  padding: 10px;
  min-width: 0;
  box-sizing: border-box;
  text-overflow: ellipsis;
  vertical-align: middle;
  position: relative;
}

/deep/ .form-table > tfoot > tr > td {
  padding: 5px 10px;
}

.form-container {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.form-container > span {
  border-left: 3px solid $--theme-color;
  font-weight: bold;
  font-size: 14px;
  padding-left: 10px;
  color: #666;
}

.form-content {
  padding: 11px 0;
}

/deep/ div[aria-invalid='true'] + small,
/deep/ small.error-message {
  display: block;
  margin-top: 8px;
  color: #f56c6c;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
}
.form-empty {
  position: absolute;
  text-align: center;
  width: 100%;
  font-size: 20px;
  top: 200px;
  color: #ccc;
}
</style>
