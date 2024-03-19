<template>
  <el-main class="base-main">
    <NavBar>
      <template slot="title">{{ form.name }}</template>
    </NavBar>
    <div style="margin: 0px auto 0">
      <div id="printData">
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
            />
          </form>
        </div>
      </div>
      <div style="wdith: 100%; text-align: center; padding-top: 20px">
        <el-button
          type="success"
          v-if="startFlow && startFlow != 'false'"
          @click="start"
          :disabled="disabled"
          >发起流程</el-button
        >
        <el-button
          type="primary"
          @click="boSave()"
          v-if="isShow && action != 'editDraft'"
          :disabled="disabled"
          >保存</el-button
        >
        <el-button type="error" @click="close(false)">返回</el-button>
      </div>
    </div>
  </el-main>
</template>
<script>
import NavBar from '@/components/navBar/NavBar.vue'
import OnlineForm from '@/components/flow/OnlineForm.vue'
import form from '@/api/form.js'
import utils from '@/utils.js'
import {Notify} from 'vant'
export default {
  name: 'formContent',
  props: ['templateKey', 'action', 'single', 'isShare'],
  data() {
    return {
      html: null,
      data: null,
      permission: null,
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
      print: false,
      isShow: true,
      tempAlias: '',
      form: {}
    }
  },
  components: {OnlineForm, NavBar},
  updated() {
    let result = window.location.href.split('?')[0].split('/')
    if (
      result[result.length - 1] == 'get' ||
      result[result.length - 2] == 'get'
    ) {
      this.isShow = false
    }
    if (this.$route.query.isPrint) {
      this.printDetail()
    }
  },
  methods: {
    printDetail() {
      let url = window.location.href
      let result = url.split('?')[0].split('/')
      if (!this.$route.query.isPrint && result[result.length - 1] == 'edit') {
        this.print = true
        this.$router.push({
          name: 'onlineForm',
          params: {
            isPrint: true,
            permission: this.permission,
            html: this.html,
            data: this.data
          }
        })
      } else {
        if (this.html) {
          if (document.getElementById('printData')) {
            document.body.innerHTML = document.getElementById(
              'printData'
            ).innerHTML
            window.print()
            if (this.$route.query.isPrint) {
              this.$router.go(-1)
            }
            setTimeout(function() {
              location.reload()
            }, 200)
          }
        } else {
          setTimeout(() => {
            this.printDetail()
          }, 500)
        }
      }
    },
    //启动
    start() {
      utils
        .getOnlineFormData(true)
        .then(formDataStr => this.processStart(formDataStr))
        .catch(reason =>
          utils.handleGetFormDataReject(reason).then(() => this.processStart())
        )
    },
    processStart(formDataStr) {
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
        .getOnlineFormData(false)
        .then(formDataStr => {
          let data = {
            boAlias: this.boAlias,
            boData: utils.parseToJson(formDataStr)
          }
          //数据视图控件
          if (this.fillField && this.fillField != '') {
            let fillField = this.fillField
            data.boData[this.boAlias][fillField] = this.fillValue
          }
          this.disabled = true

          if (delDraftId) {
            data.delDraftId = delDraftId
          }
          data.formKey = this.formKey
          this.$store.dispatch('form/boSave', data).then(result => {
            if (result.state) {
              Notify({
                type: 'success',
                message: result.message
              })
              this.close(true)
            } else {
              this.disabled = false
              Notify({
                type: 'danger',
                message: result.message
              })
            }
          })
        })
        .catch(reason => utils.handleGetFormDataReject(reason))
    },
    boSaveAndDelDraft() {
      this.boSave(this.draftId)
    },
    //保存
    boSaveDraft() {
      utils
        .getOnlineFormData(false)
        .then(formDataStr => {
          let _me = this
          let data = {
            tempAlias: this.tempAlias,
            dataJson: formDataStr
          }
          if (this.draft) {
            data.id = this.draft.id
          }
          //数据视图控件
          if (this.fillField && this.fillField != '') {
            let fillField = this.fillField
            data.boData[this.boAlias][fillField] = this.fillValue
          }
          this.disabled = true
          this.$store.dispatch('form/boSaveDraft', data).then(result => {
            if (result.state) {
              if (_me.isShare) {
                _me.close(true)
                return
              }
              this.$message.success(result.message)
              this.$router.push('/statement/draftList')
            } else {
              this.disabled = false
              this.$message.error(result.message)
            }
          })
        })
        .catch(reason => utils.handleGetFormDataReject(reason))
    },

    //关闭窗口
    close(isDelay) {
      let _me = this
      let url = window.location.href
      let arr = url.split('?')
      if (isDelay) {
        setTimeout(function() {
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
          _me.$router.go(-1)
        }, 2000)
      } else {
        if (_me.isShare) {
          _me.$router.push('/messageFillPage/1')
        } else {
          _me.$router.go(-1)
        }
      }
    },
    handlerJs(rep) {
      let _me = this
      _me.reloadOnlineForm = true
      const currentUser = _me.$store.state.login.currentUser

      let data = _me.data
      let _this = _me
      setTimeout(() => {
        eval(rep.diyJs)
      }, 10)
    }
  },
  created() {
    var $ = require('jquery')
    this.id = utils.getUrlKey('id')
    this.startFlow = utils.getUrlKey('startFlow')
    this.recordId = utils.getUrlKey('recordId')
    this.fillField = utils.getUrlKey('fillField')
    this.fillValue = utils.getUrlKey('fillValue')
    this.draftId = utils.getUrlKey('draftId')
    let _me = this
    let handler = function() {
      let data = {
        formKey: _me.mobileFormAlias,
        boAlias: _me.boAlias,
        id: _me.id ? _me.id : '',
        action: _me.action,
        recordId: _me.recordId ? _me.recordId : '',
        dataKey: _me.templateKey ? _me.templateKey : ''
      }
      _me.$store.dispatch('form/getTemplateForm', data).then(rep => {
        if (rep.result) {
          _me.form = rep.form
          _me.data = rep.data
          if (rep.permission) {
            _me.permission = rep.permission
          }
          _me.html = rep.form.formHtml
          _me.handlerJs(_me.form)
        }
      })
    }
    let editDraftHandler = function() {
      _me.$store.dispatch('form/getTempDraftData', _me.draftId).then(rep => {
        if (rep.result) {
          _me.data = rep.data
          _me.draft = rep.draft
          if (rep.permission) {
            _me.permission = rep.permission
          }
          _me.html = rep.form.formHtml
        }
      })
    }

    this.$store
      .dispatch('form/getBpmDataTemplateInfo', {
        templateKey: this.templateKey
      })
      .then(result => {
        if (result.state) {
          if (result.value.allowShare == 2 && _me.isShare) {
            _me.$router.push('/messageFillPage/5')
            return
          }
          _me.boAlias = result.value.boDefAlias
          _me.defKey = result.value.defId
          _me.formKey = result.value.formKey
          _me.tempAlias = result.value.alias
          _me.mobileFormAlias = result.value.mobileFormAlias
          if (result.value.manageField) {
            let re = JSON.parse(result.value.manageField)
            re.forEach(item => {
              if (item.name == 'startFlow') {
                this.startFlow = true
              }
            })
          } else {
            this.startFlow = true
          }
          //如果编辑的是草稿数据
          if (this.action === 'editDraft') {
            editDraftHandler()
          } else {
            handler()
          }
        }
      })
  },
  //ccwgq 2021-12-09 data更新触发
  watch: {
    data: function(nVal) {
      this.$emit('update-data', nVal)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';

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
  padding: 8px 0 8px 0;
  padding-left: 5px;
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
  background-color: #fff;
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
