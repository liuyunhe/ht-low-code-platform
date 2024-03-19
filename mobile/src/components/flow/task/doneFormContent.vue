<template>
  <div style="margin-bottom: 5px">
    <div class="divider"></div>
    <div class="done_form" style="margin-top:20px;background: #fff">
      <div :class="[(defId==undefined)?'form-container':'form-container-not']" ref="formContainer">
        <span>审批内容</span>
        <div
          class="urgent_state_div"
          v-if="urgentStateConf.conf && (urgentStateConf.conf.length >0)"
        >
          <span>紧急状态:</span>
          <span v-if="urgentStateConf.right =='w'">
            <label
              :style="'color:'+c.color"
              class="radio-inline"
              v-for="c in urgentStateConf.conf"
              :key="c.state"
            >
              <input :value="c.state" type="radio" v-model="urgentStateConf.value" />
              {{c.name}}
            </label>
          </span>
          <span v-if="urgentStateConf.right !='w'">
            <span
              v-show="c.state == urgentStateConf.value"
              :style="'color:'+c.color"
              v-for="c in urgentStateConf.conf"
              :key="c.state"
            >{{c.name}}</span>
          </span>
        </div>
        <div class="urgent_state_div" v-if="formHelpFile && (formHelpFile.length >0)">
          <el-button class="help" icon="el-icon-question" type="text" @click="previewHelpFile">帮助</el-button>
        </div>
      </div>
      <div class="form-content" v-if="showFormContent">
        <form v-if="html && formType=='INNER'" data-vv-scope="custom-form">
          <online-form
            class="custom-form"
            :html="html"
            :data="data"
            :permission="permission"
            :isView="isView"
          />
        </form>
        <div v-if="htmlSrc && formType=='FRAME'" class="tab-container ">
          <iframe
              v-iframetrigger
              id="frmFrame"
              name="frmFrame"
              style="height:100%;width:100%;border:0px"
              :src="htmlSrc"
          ></iframe>
        </div>
      </div>
      <!-- 预览压缩文件-->
      <!-- <FilePreview ref="filePreview" /> -->
    </div>
  </div>
</template>
<script>
import OnlineForm from "@/components/flow/OnlineForm.vue";
import form from "@/api/formContent.js";
import { Message } from "element-ui";
import { Loading } from "element-ui";
import FilePreview from "@/components/common/FilePreview.vue";
import req from "@/request.js";
export default {
  name: "formContent",
  props: [
    "instId",
    "taskId",
    "defId",
    "proInstId",
    "type",
    "nodeId",
    "pData",
    "formId",
    "didntSkipStart",
    "isFlowPrint"//是否打印模板进来的
  ],
  data() {
    return {
      headHigh:"141",
      dataInstId: "",
      html: null,
      data: null,
      permission: null,
      isView: false,
      formType: "INNER",
      htmlSrc: null,
      urgentStateConf: {},
      formHelpFile: "",
      src: "",
      files: [],
      fileId: "",
      fileTree: "",
      formMap: {},
      showFormContent: false,
    };
  },
  watch: {
    urgentStateValue: function (newVal, oldVal) {
      if (window.urgentStateValue) {
        window.urgentStateValue.new = newVal;
      }
    },
    nodeId: function (newVal, oldVal) {
      if (newVal && newVal != oldVal) {
        this.getInstFormData();
      }
    },
  },
  methods: {
    previewHelpFile() {
      let obj = {};
      obj.id = this.formHelpFile[0].id;
      obj.name = this.formHelpFile[0].name;
      obj.size = this.formHelpFile[0].size;
      this.$refs.filePreview.preview(obj);
    },
    getInstFormData() {
      let _me = this;
      _me.showFormContent = false;
      let loadingInstance = Loading.service({ fullscreen: true }); //开始
      let callBack = function (rep) {
        let handlerJs = function (rep) {
          const currentUser = _me.$store.state.login.currentUser;
          let data = _me.data;
          let _this = _me;
          if (rep && rep.diyJs) {
            eval(rep.diyJs);
          }
        };
        _me.showFormContent = true;
        if (JSON.stringify(rep) == "{}") {
          Message.error("此流程还没有设置全局表单,请先设置全局表单!");
          loadingInstance.close(); // 结束
          return;
        }
        if (rep.resultMsg == "formEmpty" || rep.result == "formEmpty") {
          Message.error("此流程还没有设置表单,请先设置表单!");
          loadingInstance.close(); // 结束
          return;
        }
        //_me.formId=rep.form.formId;
        if (rep.form && rep.form.type == "FRAME") {
          _me.htmlSrc = rep.form.formValue;
          _me.formType = rep.form.type;
        } else {
          form.preview(rep.form.formId, handlerJs);
          if (_me.pData && "latest" != rep.doneDataVersion) {
            _me.data = _me.pData;
          } else {
            _me.data = rep.data;
          }

          if (rep.permission) {
            const permissionObj = JSON.parse(rep.permission);
            let commonRight = "";
            //如果是管理端进入，则将页面字段的权限修改为可编辑
            if (_me.type == "manage") {
              commonRight = "w";
              //如果是查看实例，也是获取发起流程的表单和权限。只不过所有可见的权限要变成编辑
            } else {
              commonRight = "r";
            }
            if (permissionObj.fields && commonRight) {
              for (var key in permissionObj.fields) {
                const bodef = permissionObj.fields[key];
                if (bodef) {
                  for (var fname in bodef) {
                    if (
                      commonRight == "w" ||
                      (commonRight == "r" && bodef[fname] != "n")
                    ) {
                      bodef[fname] = commonRight;
                    }
                  }
                }
                permissionObj.fields[key] = bodef;
              }
            }
            if (permissionObj.table && commonRight) {
              for (var key in permissionObj.table) {
                const table = permissionObj.table[key];
                if (table) {
                  if (commonRight == "w") {
                    table["hidden"] = false;
                    table["add"] = true;
                    table["del"] = true;
                  } else if (commonRight == "r") {
                    table["add"] = false;
                    table["del"] = false;
                    table["required"] = false;
                    table["edit"] = false;
                  }
                }
                permissionObj.table[key] = table;
              }
            }

            _me.permission = permissionObj;
          }
          _me.html = rep.form.formHtml;
          if (rep.form.helpFile) {
            _me.formHelpFile = JSON.parse(rep.form.helpFile);
          }

          if (_me.html.split('ref="next_step_check_').length > 1) {
            _me.$root.$emit("startFlowBtnChange", false);
          }
        }
        loadingInstance.close(); // 结束
      };

      if (this.formMap[this.nodeId]) {
        callBack(this.formMap[this.nodeId]);
      }

      if (this.instId) {
        let isIncludData = _me.pData ? false : true;
        let parameter= {
              instId: this.instId,
              nodeId: this.nodeId,
              formId: this.formId,
              includData: isIncludData,
            }
        if (this.didntSkipStart) {
          this.headHigh=35;
          parameter.getStartForm=true;
        } 
         form.getInstFormAndBO(
           parameter
           ,
            callBack
          );
      }
    },
    hiddenContent() {
      this.headHigh="10";
      this.$refs.formContainer.className = "form-container-not";
    },
  },
  computed: {
    urgentStateValue: function () {
      return this.urgentStateConf.value;
    },
  },
  components: { OnlineForm, FilePreview },
  created() {
    if(this.isFlowPrint){
     this.headHigh="0";
    }
    var $ = require("jquery");
    let _me = this;
    this.$store
      .dispatch("storeProcess/getUrgentStateConf", {
        defId: this.defId,
        instId: this.instId,
        taskId: this.taskId,
      })
      .then((data) => {
        if (data.conf) {
          try {
            data.conf = JSON.parse(data.conf);
          } catch (error) {
            data.conf = eval("(" + data.conf + ")");
          }
          window.urgentStateValue = { old: data.value };
          if (!data.value) {
            for (let index = 0, c; (c = data.conf[index++]); ) {
              if (c.default) {
                data.value = c.state;
                break;
              }
            }
          }
          _me.urgentStateConf = data;
        }
      });
    this.getInstFormData();
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
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
  padding-bottom: 10px;
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

/deep/ div[aria-invalid="true"] + small,
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
  float: right;
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
.divider {
  height: 5px;
  position: fixed;
  background: #e9eef3;
  z-index: 100;
}
.tab-container {
  height: 600px;
}
@media print
{
	.done_form { padding: 0px !important; }
}
</style>
