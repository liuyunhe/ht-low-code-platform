<template>
  <el-main class="base-main">
    <div style="width: 100%">
      <div class="form-container" style="padding-left: 10px; padding-top: 8px">
        <span>审批内容</span>
        <div
          class="urgent_state_div"
          v-if="urgentStateConf.conf && urgentStateConf.conf.length > 0"
        >
          <span
            style="
              color: rgba(0, 0, 0, 0.9);
              font-weight: 500;
              margin-left: 14px;
            "
            >紧急状态:</span
          >
          <span v-if="urgentStateConf.right == 'w'">
            <label
              :style="'color:' + c.color"
              class="radio-inline"
              v-for="c in urgentStateConf.conf"
              :key="c.state"
            >
              <!--              todo:等待这里的变化信息回填表单-->
              <input
                :value="c.state"
                type="radio"
                v-model="urgentStateConf.value"
              />
              {{ c.name }}
            </label>
          </span>
          <span v-if="urgentStateConf.right != 'w'">
            <span
              v-show="c.state == urgentStateConf.value"
              :style="'color:' + c.color"
              v-for="c in urgentStateConf.conf"
              :key="c.state"
              >{{ c.name }}</span
            >
          </span>
        </div>
      </div>
      <div class="form-content">
        <form
          v-if="html && formType == 'INNER'"
          data-vv-scope="custom-form"
          v-form
        >
          <!--          todo:这个组件要接受数据-->
          <online-form
            class="custom-form"
            :html="html"
            :data="data"
            :permission="permission"
            :isView="isView"
          />
        </form>
        <div v-if="htmlSrc && formType == 'FRAME'">
          <iframe
            v-iframetrigger
            id="frmFrame"
            name="frmFrame"
            style="width: 100%; border: 0px"
            :src="htmlSrc"
          ></iframe>
        </div>
      </div>
    </div>
  </el-main>
</template>

<script>
import {Notify} from 'vant'
import {Loading} from 'element-ui'
import OnlineForm from '@/components/flow/OnlineForm.vue'
import form from '@/api/formContent.js'
import OuPrint from '../eipControl/ou/OuPrint.vue'

export default {
  name: 'formContent',
  props: [
    'instId',
    'taskId',
    'defId',
    'proInstId',
    'type',
    'readId',
    'readDoneId',
    'myReadType',
    'leaderId',
    'tasks'
  ],
  data() {
    return {
      buttons: [],
      dataInstId: '',
      html: null,
      data: null,
      permission: null,
      isView: true,
      formType: 'INNER',
      htmlSrc: null,
      urgentStateConf: {},
      formHelpFile: '',
      src: '',
      iframeSrc: '',
      files: [],
      fileId: '',
      fileTree: '',
      formData: ''
    }
  },

  watch: {
    tasks: function(newVal, oldVal) {
      if (newVal) {
        this.init()
      }
    },
    urgentStateValue: function(newVal, oldVal) {
      if (window.urgentStateValue) {
        window.urgentStateValue.new = newVal
      }
    }
  },
  updated: function() {
    this.$nextTick(function() {
      let oIframe = document.getElementById('frmFrame')
      if (oIframe) {
        let deviceWidth = document.documentElement.clientWidth
        let deviceHeight = document.documentElement.clientHeight
        oIframe.style.width = Number(deviceWidth) - 0 + 'px' //数字是页面布局宽度差值
        oIframe.style.height = Number(deviceHeight) - 0 + 'px' //数字是页面布局高度差
      }
    })
  },
  methods: {
    init() {
      const loadingInstance = this.$loading({
        lock: true,
        text: '表单数据加载中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      var $ = require('jquery')
      let _me = this
      let handlerJs = function(rep) {
        const currentUser = _me.$store.state.login.currentUser

        let data = _me.data
        if (rep && rep.diyJs) {
          eval(rep.diyJs)
        }
      }

      let handler = function(rep) {
        //发起流程的时候得到按钮对象
        if (rep.buttons) {
          _me.buttons = rep.buttons
        }
        if (_me.myReadType == 'agent') {
          Notify({
            type: 'warning',
            message: '此流程已被委托,没有审批权'
          })
        }
        if (JSON.stringify(rep) == '{}') {
          Notify({
            type: 'danger',
            message: '此流程未设置全局手机表单'
          })
          loadingInstance.close() // 结束
          _me.$router.go(-1)
          return
        }
        if (rep.resultMsg == 'formEmpty' || rep.result == 'formEmpty') {
          Notify({
            type: 'danger',
            message: '此流程还未设置手机表单'
          })
          loadingInstance.close() // 结束
          // 返回上一页
          _me.$router.go(-1)
          return
        }
        //_me.formId=rep.form.formId;
        if (rep.form && rep.form.type == 'FRAME') {
          _me.htmlSrc = rep.form.formValue
          _me.formType = rep.form.type
        } else {
          form.preview(rep.form.formId, handlerJs)
          if (_me.formData && 'latest' != rep.doneDataVersion) {
            _me.data = JSON.parse(Base64.decode(_me.formData))
          } else {
            _me.data = rep.data
          }

          if (rep.permission) {
            const permissionObj = JSON.parse(rep.permission)
            //如果是管理端进入，则将页面字段的权限修改为可编辑
            if (permissionObj.fields && _me.type == 'manage') {
              for (var key in permissionObj.fields) {
                const bodef = permissionObj.fields[key]
                if (bodef) {
                  for (var fname in bodef) {
                    bodef[fname] = 'w'
                  }
                }
                permissionObj.fields[key] = bodef
              }
            }
            _me.permission = permissionObj
          }
          _me.html = rep.form.formHtml
          if (rep.form.helpFile) {
            _me.formHelpFile = JSON.parse(rep.form.helpFile)
          }

          if (_me.html.split('ref="next_step_check_').length > 1) {
            _me.$root.$emit('startFlowBtnChange', false)
          }
        }
        loadingInstance.close() // 结束
      }
      this.$store
        .dispatch('storeProcess/getUrgentStateConf', {
          defId: this.defId,
          instId: this.instId,
          taskId: this.taskId
        })
        .then(data => {
          if (data.conf) {
            try {
              data.conf = JSON.parse(data.conf)
            } catch (error) {
              data.conf = eval('(' + data.conf + ')')
            }
            window.urgentStateValue = {old: data.value}
            if (!data.value) {
              for (let index = 0, c; (c = data.conf[index++]); ) {
                if (c.default) {
                  data.value = c.state
                  break
                }
              }
            }
            _me.urgentStateConf = data
          }
        })
      if (this.taskId && JSON.stringify(this.tasks) != '{}') {
        if (
          !this.tasks.bpmTask &&
          !this.tasks.state &&
          this.tasks.message == '此任务已被处理或不存在！'
        ) {
          this.$router.push('/work/myMatters')
          return
        }
        if (this.tasks.bpmTask.bpmnInstId) {
          form.taskDetail(
            {taskId: this.taskId, leaderId: this.leaderId},
            handler
          )
        } else {
          form.getInstFormAndBO(this.tasks.bpmTask.procInstId, handler)
        }
      } else if (this.instId) {
        this.isView = false
        if ('request' == this.type) {
          form.getInstFormAndBO(
            {instId: this.instId, getStartForm: true},
            handler
          )
        } else if ('start' == this.type) {
          this.isView = true
          form.getFormAndBO(
            {defId: this.defId, proInstId: this.instId},
            handler
          )
        } else if ('read' == this.type || this.myReadType) {
          const this_ = this
          if (this.readId) {
            //知会待办
            //根据待办知会任务主键ID获取任务ID
            this.$store
              .dispatch('storeProcess/getBpmTaskNoticeById', this_.readId)
              .then(row => {
                if (row.taskId) {
                  //根据任务Id获取审批历史数据（只有一条）
                  this.$store
                    .dispatch('storeProcess/getTaskKeyByTaskId', row.taskId)
                    .then(res => {
                      if (res.formData) {
                        this_.formData = res.formData
                      }
                      let isIncludData = res.formData ? false : true
                      form.getInstFormAndBO(
                        {
                          instId: this_.instId,
                          nodeId: res.taskKey,
                          includData: isIncludData
                        },
                        handler
                      )
                    })
                } else if (row.nodeId) {
                  let data = {nodeId: row.nodeId, instId: this_.instId}
                  //根据任务节点ID和流程实例ID获取审批历史数据（只有一条）
                  this.$store
                    .dispatch('storeProcess/getTaskKeyByNodeId', data)
                    .then(res => {
                      if (res.formData) {
                        this_.formData = res.formData
                      }
                      let isIncludData = res.formData ? false : true
                      form.getInstFormAndBO(
                        {
                          instId: this_.instId,
                          nodeId: res.taskKey,
                          includData: isIncludData
                        },
                        handler
                      )
                    })
                } else {
                  form.getInstFormAndBO(this_.instId, handler)
                }
              })
          } else if (this.readDoneId) {
            //知会已办
            //根据已办知会任务主键ID获取任务ID
            this.$store
              .dispatch(
                'storeProcess/getBpmTaskNoticeDoneById',
                this_.readDoneId
              )
              .then(row => {
                if (row.taskId) {
                  //根据任务Id获取审批历史数据（只有一条）
                  this.$store
                    .dispatch('storeProcess/getTaskKeyByTaskId', row.taskId)
                    .then(res => {
                      if (res.formData) {
                        this_.formData = res.formData
                      }
                      let isIncludData = res.formData ? false : true
                      form.getInstFormAndBO(
                        {
                          instId: this_.instId,
                          nodeId: res.taskKey,
                          includData: isIncludData
                        },
                        handler
                      )
                    })
                } else if (row.taskKey) {
                  let data = {nodeId: row.taskKey, instId: this_.instId}
                  //根据任务节点ID和流程实例ID获取审批历史数据（只有一条）
                  this.$store
                    .dispatch('storeProcess/getTaskKeyByNodeId', data)
                    .then(res => {
                      if (res.formData) {
                        this_.formData = res.formData
                      }
                      let isIncludData = res.formData ? false : true
                      form.getInstFormAndBO(
                        {
                          instId: this_.instId,
                          nodeId: res.taskKey,
                          includData: isIncludData
                        },
                        handler
                      )
                    })
                } else {
                  form.getInstFormAndBO(this_.instId, handler)
                }
              })
          } else {
            form.getInstFormAndBO(this.instId, handler)
          }
        } else {
          form.getInstFormAndBO(this.instId, handler)
        }
      } else if (this.defId) {
        let data = {}
        if (this.proInstId != undefined) {
          data = {defId: this.defId, proInstId: this.proInstId}
        } else {
          data = {defId: this.defId}
        }
        form.getFormAndBO(data, handler)
      }
    }
  },
  computed: {
    urgentStateValue: function() {
      return this.urgentStateConf.value
    },
    parentName: function() {
      return this.$parent.$options.name
    }
  },
  components: {OnlineForm, Notify, Loading, OuPrint},
  created() {
    this.init()
  },
  mounted() {

  }
}
</script>

<style lang="stylus" scoped>
>>> .form-table {
  width: 100%;
  border-top: 1px solid #ebeef5;
  border-left: 1px solid #ebeef5;
}

>>> .form-table > thead > tr > th, >>> .form-table > tbody > tr > th {
  text-align: right;
  color: #666;
  font-weight: normal;
}

>>> .form-table > tbody > tr > th.group-th {
  text-align: left;
  background: #f9f9f9;
  font-weight: bold;
}

>>> .form-table > thead > tr.sub-table-header > th {
  text-align: center;
  background: #fafafa;
}

>>> .form-table > tbody > tr > th > span, >>> .form-table > thead > tr > th > span {
  color: #f00;
}

>>> .form-table > tbody > tr > th, >>> .form-table > tbody > tr > td, >>> .form-table > tfoot > tr > td, >>> .form-table > thead > tr > th {
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  padding: 10px;
  min-width: 0;
  box-sizing: border-box;
  text-overflow: ellipsis;
  vertical-align: middle;
  position: relative;
}

>>> .form-table-noBorder {
  border-top: 0px solid #ebeef5;
  border-left: 0px solid #ebeef5;
}

>>> .form-table-noBorder > tbody > tr > th, >>> .form-table-noBorder > tbody > tr > td, >>> .form-table-noBorder > tfoot > tr > td, >>> .form-table-noBorder > thead > tr > th {
  border-right: 0px solid #ebeef5;
  border-bottom: 0px solid #ebeef5;
}

>>> .form-table > tfoot > tr > td {
  padding: 5px 10px;
}

.form-container {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
}

.form-container > span {
  border-left: 3px solid #2761ff;
  font-weight: bold;
  font-size: 14px;
  padding-left: 10px;
  color: #666;
}

.form-content {
  padding-top: 20px;
}

>>> div[aria-invalid='true'] + small, >>> small.error-message {
  display: block;
  margin-top: 8px;
  color: #f56c6c;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
}
/* ccwgq 深度修改el-row样式*/
>>> .el-form >>>.el-row{
  z-index:0;
}
</style>
