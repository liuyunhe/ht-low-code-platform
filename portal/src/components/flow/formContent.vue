<template>
  <div style="margin-bottom: 5px">
    <div style="padding: 20px; background: #fff">
      <div
        :class="[!myReadType ? 'form-container' : 'form-container-not']"
        ref="formContainer"
        :style="status_style"
      >
        <span>审批内容</span>
        <div
          class="urgent_state_div"
          v-if="urgentStateConf.conf && urgentStateConf.conf.length > 0"
        >
          <span>紧急状态:</span>
          <span v-if="urgentStateConf.right == 'w'">
            <label
              :style="'color:' + c.color"
              class="radio-inline"
              v-for="c in urgentStateConf.conf"
              :key="c.state"
            >
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
        <div
          class="urgent_state_div"
          v-if="formHelpFile && formHelpFile.length > 0"
        >
          <el-button
            class="help"
            icon="el-icon-question"
            type="text"
            @click="previewHelpFile"
            >帮助</el-button
          >
        </div>
      </div>
      <div class="form-content">
        <form v-if="html && formType == 'INNER'" data-vv-scope="custom-form">
          <online-form
            class="custom-form"
            :html="html"
            :data="data"
            :permission="permission"
            :isView="isView"
            :initFillData="initFillData"
            :flowKey="flowKey"
            :formId="formId"
            :isLook="isLook"
            :key="formComponentKey"
          />
        </form>
        <div v-if="htmlSrc && formType == 'FRAME'" class="tab-container">
          <iframe
            v-iframetrigger
            id="frmFrame"
            name="frmFrame"
            style="height: 100%; width: 100%; border: 0px"
            :src="htmlSrc"
          ></iframe>
        </div>
      </div>
      <!-- 预览文件-->
      <FilePreview ref="filePreview" />
    </div>
  </div>
</template>
<script>
import OnlineForm from '@/components/flow/OnlineForm.vue'
import form from '@/api/formContent.js'
import {Message} from 'element-ui'
import {Loading} from 'element-ui'
import FilePreview from '@/components/common/FilePreview.vue'
import req from '@/request.js'
import { baseHandlerJs } from '@/utils/handlerJs'

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
    'formLoading',
    'task_state',
    'tasks',
    'isLook',
    'copyInstId',
    'task_state2',
  ],
  data() {
    return {
      buttons: [],
      status_style: '',
      dataInstId: '',
      html: null,
      data: null,
      dataBack: null, // 2022-11-30 wude 新增data的备份
      permission: null,
      isView: true,
      formType: 'INNER',
      htmlSrc: null,
      urgentStateConf: {},
      formHelpFile: '',
      src: '',
      files: [],
      fileId: '',
      fileTree: '',
      formData: '',
      initFillData: false,
      formId: '',
      formTaskAuth: '',
      flowKey: '',
      taskDetailLoading: '',
      topDivHeight: '99px', //空div的高度 用于撑开页面下的div内容
      formKey: '', //表单key
      formComponentKey: new Date().getTime(),
      task_state3: '',
    }
  },
  watch: {
    tasks: function (newVal, oldVal) {
      if (newVal) {
        this.init()
      }
    },
    urgentStateValue: function (newVal, oldVal) {
      if (window.urgentStateValue) {
        window.urgentStateValue.new = newVal
      }
    },
    // 2022-11-30 wude 监听数据变化,设置表单未提交的标识为true
    data: {
      handler(newVal) {
        console.log("表单数据别修改")
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
  created() {
    if (this.isPlmeformPage) {
      this.topDivHeight = 0
    }
    console.log('type ===>', this.data)
    //待办的时候,watch已经监听了tasks,可以不用初始化
    if (!this.taskId) {
      this.init()
    }
    if (this.type == 'request') {
      this.topDivHeight = '20px'
    }
  },
  methods: {
    /**
     * 修改样式
     * @param divheight  最上面div的高度
     */
    updateStyle(divheight) {
      this.topDivHeight = divheight
    },
    previewHelpFile() {
      let obj = {}
      obj.id = this.formHelpFile[0].id
      obj.name = this.formHelpFile[0].name
      obj.size = this.formHelpFile[0].size
      this.$refs.filePreview.preview(obj)
    },
    setInitFillData(isInitFillData) {
      this.initFillData = isInitFillData
    },
    hiddenContent() {
      this.$refs.formContainer.className = 'form-container-not'
    },
    init(updateFormComponent) {
      this.task_state3 = this.task_state
      console.log('init ===>', this.task_state3)
      if (this.task_state == 'FOLLOW') {
        this.status_style = 'padding-top:0px !important;'
      }
      
      let _me = this
      if (_me.tasks) {
        _me.initFillData = _me.tasks.initFillData
      }
      let readOnly = false
      if (
        _me.tasks &&
        _me.tasks.bpmTask &&
        (_me.tasks.bpmTask.status === 'COMMU' ||
          _me.tasks.bpmTask.status === 'TRANSFORMEDINQU' ||
          _me.tasks.bpmTask.status === 'FOLLOW')
      ) {
        readOnly = true
      }

      //获取流程定义key
      _me.getFlowKey()
      
      let handlerJs = baseHandlerJs
      // let handlerJs = function (rep) {
      //   let _this = _me
      //   const currentUser = _me.$store.state.login.currentUser
      //   let data = _me.data
      //   let permission = _me.permission
      //   //TODO:将流程的信息封装到到一个实体对象并提供到表单脚本的上下文环境中
      //   //注入自己的上下文变量
      //   //ccwgq 2022-10-18 拿到表单的权限js脚本
      //   if (rep.formTaskAuth) {
      //     _me.formTaskAuth = rep.formTaskAuth
      //   }
      //   if (rep && rep.diyJs) {
      //     eval(rep.diyJs)
      //   }
      //   let taskStatus = _me.$parent.status || ''

      //   //TODO:执行自定义的Js逻辑修改permission
      //   let scriptList = []
      //   //定义自定义的JS脚本，注入上下文
      //   const customScript = function (scriptStr, permission) {
      //     function evil() {
      //       let Fn = Function('_this', 'permission', scriptStr) //一个变量指向Function，防止有些前端编译工具报错
      //       let result = Fn(_me, permission)
      //       return result
      //     }
      //     return evil()
      //   }
      //   if (_me.formTaskAuth ?? '') {
      //     try {
      //       scriptList = JSON.parse(_me.formTaskAuth)
      //     } catch {}
      //   }
      //   if (taskStatus == 'COMMU' && scriptList.length) {
      //     //如果是会签时,执行对应的JS脚本
      //     let obj = scriptList.filter((item) => item.task == 'COMMUS')
      //     if (obj.length == 1) {
      //       const script = Base64.decode(obj[0]['diyJs'])
      //       customScript(script, _me.permission)
      //       _me.$set(_me, 'permission', _me.permission)
      //     }
      //   }
      // }

      let handler = function (rep) {
        //发起流程的时候得到按钮对象
        if (rep.buttons) {
          _me.buttons = rep.buttons
        }
        if (_me.taskDetailLoading) {
          _me.taskDetailLoading.close()
        }
        if (_me.myReadType == 'agent') {
          Message.warning('此流程已被委托,没有审批权')
        }
        if (!rep) {
          return
        }
        if (JSON.stringify(rep) == '{}') {
          Message.error('此流程还没有设置全局表单,请先设置全局表单!')
          return
        }
        if (rep.resultMsg == 'formEmpty' || rep.result == 'formEmpty') {
          Message.error('此流程还没有设置表单,请先设置表单!')
          return
        }
        _me.formKey = rep.form.formKey
        //_me.formId=rep.form.formId;
        if (rep.form && rep.form.type == 'FRAME') {
          _me.htmlSrc = rep.form.formValue
          _me.formType = rep.form.type
          //表单加载完成发布事件 审批按钮才可以点击
          _me.$root.$emit('formLoading', false)
        } else {
          _me.formId = rep.form.formId
          form.preview(rep.form.formId, (rep)=>handlerJs(rep,_me));
          if (_me.formData) {
            _me.data = JSON.parse(Base64.decode(_me.formData))
          } else {
            _me.data = rep.data
          }

          if (rep.permission) {
            const permissionObj = JSON.parse(rep.permission)
            let commonRight = ''
            //如果是管理端进入，则将页面字段的权限修改为可编辑
            if (_me.type == 'manage') {
              commonRight = 'w'
              //如果是查看实例，也是获取发起流程的表单和权限。只不过所有可见的权限要变成编辑
            } else if (
              'request' == _me.type ||
              _me.myReadType == 'myRequest' ||
              _me.myReadType == 'delegate' ||
              _me.myReadType == 'myRead' ||
              _me.readDoneId ||
              _me.type == 'read' ||
              readOnly
            ) {
              commonRight = 'r'
            }
            if (permissionObj.fields && commonRight) {
              for (var key in permissionObj.fields) {
                const bodef = permissionObj.fields[key]
                if (bodef) {
                  for (var fname in bodef) {
                    if (bodef[fname] == 'n') continue
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
          }
          _me.html = rep.form.formHtml
          if (rep.form.helpFile) {
            _me.formHelpFile = JSON.parse(rep.form.helpFile)
          }
          if (_me.html.split('ref="next_step_check_').length > 1) {
            _me.$root.$emit('startFlowBtnChange', false)
          }
          //表单加载完成发布事件 审批按钮才可以点击
          _me.$root.$emit('formLoading', false)
          if (updateFormComponent) {
            _me.formComponentKey = new Date().getTime()
          }
        }
      }
      this.$store
        .dispatch('storeProcess/getUrgentStateConf', {
          defId: this.defId,
          instId: this.instId,
          taskId: this.taskId,
        })
        .then((data) => {
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
      if (this.taskId && this.tasks && JSON.stringify(this.tasks) != '{}') {
        if (
          !this.tasks.bpmTask &&
          !this.tasks.state &&
          this.tasks.message == '此任务已被处理或不存在！'
        ) {
          _me.$router.push('/v-flow/v-todo')
          return
        }
        this.taskDetailLoading = Loading.service({
          fullscreen: true,
          lock: true,
          text: '表单数据加载中，请耐心等待...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)',
        }) //开始

        if (this.tasks.bpmTask.bpmnInstId) {
          form.taskDetail(
            {taskId: this.taskId, leaderId: this.leaderId},
            handler
          )
        } else {
          // 2022-10-18:yigz 获取表单实时数据
          let inst_data = {
            instId: this.tasks.bpmTask.procInstId,
            nodeId: this.tasks.bpmTask.nodeId,
            includData: true,
          }
          // form.getInstFormAndBO(this.tasks.bpmTask.procInstId, handler)
          form.getInstFormAndBO(inst_data, handler)
        }
      } else if (
        this.taskId &&
        window.location.href.indexOf('/task/' + this.taskId + '/0') != -1
      ) {
        form.taskDetail({taskId: this.taskId, leaderId: this.leaderId}, handler)
        let params = {
          taskId: this.taskId,
          leaderId: this.leaderId,
        }
        this.$store.dispatch('storeProcess/taskDetail', params) //获取操作按钮
      } else if (this.instId) {
        if ('start' != this.type) {
          this.isView = false
        }
        //查看我发起的，也使用发起流程的表单。只不过把编辑和必填权限改成只读
        if ('request' == this.type || 'myRequest' == this.myReadType) {
          form.getFormAndBO({proInstId: this.instId}, handler)
        } else if ('read' == this.type || this.myReadType) {
          const this_ = this
          if (this.readId) {
            //知会待办
            //根据待办知会任务主键ID获取任务ID
            this.$store
              .dispatch('storeProcess/getBpmTaskNoticeById', this_.readId)
              .then((row) => {
                if (row.taskId) {
                  //根据任务Id获取审批历史数据（只有一条）
                  this.$store
                    .dispatch('storeProcess/getTaskKeyByTaskId', row.taskId)
                    .then((res) => {
                      if (res.formData) {
                        this_.formData = res.formData
                      }
                      let isIncludData = res.formData ? false : true
                      form.getInstFormAndBO(
                        {
                          instId: this_.instId,
                          nodeId: res.taskKey,
                          includData: isIncludData,
                        },
                        handler
                      )
                    })
                } else if (row.nodeId) {
                  let data = {nodeId: row.nodeId, instId: this_.instId}
                  //根据任务节点ID和流程实例ID获取审批历史数据（只有一条）
                  this.$store
                    .dispatch('storeProcess/getTaskKeyByNodeId', data)
                    .then((res) => {
                      if (res.formData) {
                        this_.formData = res.formData
                      }
                      let isIncludData = res.formData ? false : true
                      form.getInstFormAndBO(
                        {
                          instId: this_.instId,
                          nodeId: res.taskKey,
                          includData: isIncludData,
                        },
                        handler
                      )
                    })
                } else {
                  //查看我发起的，也使用发起流程的表单
                  form.getFormAndBO({proInstId: this.instId}, handler)
                  // form.getInstFormAndBO(this_.instId, handler);
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
              .then((row) => {
                if (row.taskId) {
                  //根据任务Id获取审批历史数据（只有一条）
                  this.$store
                    .dispatch('storeProcess/getTaskKeyByTaskId', row.taskId)
                    .then((res) => {
                      if (res.formData) {
                        this_.formData = res.formData
                      }
                      let isIncludData = res.formData ? false : true
                      form.getInstFormAndBO(
                        {
                          instId: this_.instId,
                          nodeId: res.taskKey,
                          includData: isIncludData,
                        },
                        handler
                      )
                    })
                } else if (row.taskKey) {
                  let data = {nodeId: row.taskKey, instId: this_.instId}
                  //根据任务节点ID和流程实例ID获取审批历史数据（只有一条）
                  this.$store
                    .dispatch('storeProcess/getTaskKeyByNodeId', data)
                    .then((res) => {
                      if (res.formData) {
                        this_.formData = res.formData
                      }
                      let isIncludData = res.formData ? false : true
                      form.getInstFormAndBO(
                        {
                          instId: this_.instId,
                          nodeId: res.taskKey,
                          includData: isIncludData,
                        },
                        handler
                      )
                    })
                } else {
                  //查看我发起的，也使用发起流程的表单
                  form.getFormAndBO({proInstId: this.instId}, handler)
                  // form.getInstFormAndBO(this.instId, handler);
                }
              })
          } else {
            //查看我发起的，也使用发起流程的表单
            form.getFormAndBO({proInstId: this.instId}, handler)
            // form.getInstFormAndBO(this.instId, handler);
          }
        } else {
          //查看我发起的，也使用发起流程的表单
          form.getFormAndBO({proInstId: this.instId}, handler)
          // form.getInstFormAndBO(this.instId, handler);
        }
      } else if (this.defId) {
        let data = {}
        if (this.proInstId != undefined) {
          data = {defId: this.defId, proInstId: this.proInstId}
        } else if (this.copyInstId) {
          data = {defId: this.defId, copyInstId: this.copyInstId}
        } else {
          data = {defId: this.defId}
        }
        form.getFormAndBO(data, handler)
      }
    },
    getFlowKey() {
      if (this.defId || this.instId || this.taskId) {
        let url = '${bpmRunTime}/runtime/instance/v1/getFlowKey'
        if (this.defId) {
          url = url + '?defId=' + this.defId
        } else if (this.instId) {
          url = url + '?procInstId=' + this.instId
        } else if (this.taskId) {
          url = url + '?taskId=' + this.taskId
        }
        let _me = this
        try {
          _me.$http.get(url, 'json', false).then((resp) => {
            const rep = resp.data
            console.log('getFlowKey ===>', rep)
            if (rep.state) {
              _me.flowKey = rep.value
            }
          })
        } catch (error) {}
      }
    },
  },
  computed: {
    urgentStateValue: function () {
      return this.urgentStateConf.value
    },
    isPlmeformPage() {
      return this.$route.query.hasOwnProperty('plmeform')
    },
  },
  components: {OnlineForm, FilePreview},
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
@import '@/assets/css/change-font.scss';
@media print {
  .no-print {
    display: none;
  }
  .approve_content {
    padding: 0px !important;
  }
  .form-container-not {
    padding: 0px 0px 10px 0px !important;
  }
}
/deep/.el-form-item {
  margin-bottom: 15px !important;
  margin-top: 10px !important;
  margin-right: 10px !important;
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

/deep/ .form-table-noBorder {
  border-top: 0px solid #ebeef5;
  border-left: 0px solid #ebeef5;
}

/deep/ .form-table-noBorder > tbody > tr > th,
/deep/ .form-table-noBorder > tbody > tr > td,
/deep/ .form-table-noBorder > tfoot > tr > td,
/deep/ .form-table-noBorder > thead > tr > th {
  border-right: 0px solid #ebeef5;
  border-bottom: 0px solid #ebeef5;
}

/deep/ .form-table > tfoot > tr > td {
  padding: 5px 10px;
}

.form-container {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.form-container-not {
  border-bottom: 1px solid #ebeef5;
  padding: 30px 0 10px 0;
}

.form-container-not > span {
  border-left: 3px solid $--theme-color;
  font-weight: bold;
  font-size: 14px;
  padding-left: 10px;
  color: #666;
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

.urgent_state_div {
  display: inline-block;
  float: none; //  不能同时使用right
}

.urgent_state_div > span {
  font-weight: bold;
  font-size: 14px;
  color: #666;
  padding-right: 5px;
}

/deep/.el-radio__label {
  padding-left: 5px;
}

/deep/.el-radio__input.is-checked + .el-radio__label {
  color: none !important;
}

/deep/.text-fixed p {
  margin: 0;
  margin-bottom: -2px;
}
.tab-container {
  height: 600px;
}
// .brStyle {
//   // nulldivstyle: #fff;
// }
</style>
