<template>
  <el-container v-if="defId != ''">
    <el-header height="48px">
      <el-row>
        <el-col :span="12" :offset="6" class="top-subject-col">
          <h3>{{defName}}</h3>
        </el-col>
      </el-row>
    </el-header>
    <el-main>
      <el-card class="start-card">
        <FormContent
          ref="formContent"
          :formLoading.sync="disabled"
          :defId="defId"
          :proInstId="instId"
          myReadType="myReadType"
        />
      </el-card>
    </el-main>
    <div style="wdith:100%;text-align :center;padding-top:20px;">
      <el-button v-if="isShowStartBtn" type="primary" @click="start" :disabled="disabled">启动</el-button>
      <el-button type="defult" @click="saveDraft" :disabled="disabled">保存</el-button>
      <el-button type="defult" @click="back" :disabled="disabled">返回</el-button>
    </div>

    <!-- 选择路径跳转 -->
    <TaskSelectDestination
      ref="taskSelectDestination"
      taskId
      :defId="defId"
      :instId="instId"
      :leaderId="leaderId"
    />
  </el-container>
</template>

<script>
import req from "@/request.js";
import { mapState, mapActions } from "vuex";
import FormContent from "@/components/flow/formContent.vue";
import TaskSelectDestination from "@/components/flow/task/taskSelectDestination.vue";
import utils from "@/utils.js";
import { Base64 } from "js-base64";
import { debuglog } from "util";

export default {
  name: "startByKey",
  components: {
    FormContent,
    TaskSelectDestination
  },
  props: ["defKey"],
  data() {
    return {
      disabled: true,
      nodeDef: {},
      instId: "",
      leaderId: 0,
      flowId: "",
      defName:"",
      defId: "",
      isShowStartBtn: true,
    };
  },
  computed: mapState({
    // curOrgPost: state => state.user.postCharge,
    // defId: async function() {
    //   var defId = "";
    //   if (this.defKey) {
    //     var p = await this.getDef();
    //     p.then(res => {
    //       debugger;
    //       defId = res;
    //     });
    //     // return "1245909504526516224";
    //   }
    //   return defId;
    // }
  }),
  mounted() {
    let _this = this;
    //如果该字段的校验受另一个字段影响。则监听另一个字段控件发布的值改变事件
    this.$root.$on("startFlowBtnChange", function(value) {
      _this.isShowStartBtn = value;
    });
    //监听表单加载完成发布事件
    this.$root.$on("formLoading", function(value) {
      _this.disabled = value;
    });
  },
  methods: {
    async getDef() {
      let this_ = this;
      var promise = new Promise(function(resolve, reject) {
        req
          .get(
            window.context.bpmModel +
              "/flow/def/v1/getJson?defKey=" +
              this_.defKey
          )
          .then(function(res) {
            resolve(res.data.defId);
          });
      });
      return await promise;
    },
    // 准备数据
    handleData(formDataStr) {
      let data = { defId: this.defId };
      // URL表单
      if (formDataStr.constructor == Object) {
        data.formType = "frame";
        if (formDataStr.businessKey) {
          data.businessKey = formDataStr.businessKey;
        }
        if (formDataStr.sysCode) {
          data.sysCode = formDataStr.sysCode;
        }
        if (formDataStr.vars) {
          data.vars = formDataStr.vars;
        }
      } else if (formDataStr.constructor == String) {
        data.data = Base64.encode(formDataStr);
        data.formType = "inner";
      }
      data.supportMobile = 0;
      if (this.instId) {
        data.proInstId = this.instId;
      }
      if (this.curOrgPost && this.curOrgPost.org) {
        data.startOrgId = this.curOrgPost.org.id;
      }
      if (window.urgentStateValue) {
        data.urgentStateValue = window.urgentStateValue;
      }
      if (this.leaderId && this.leaderId != 0) {
        data.agentLeaderId = this.leaderId;
      }
      return data;
    },
    start() {
      const this_ = this;
      //获取VUE表单实例(判断是否是在线表单)
      if (document.getElementsByName("online-form")[0]) {
        let tables = document.getElementsByName("online-form")[0].__vue__
          .permission.table; //获取子表权限
        let boData = document.getElementsByName("online-form")[0].__vue__.data; //获取表单bo对象
        let zData = {};
        for (let k in boData) {
          zData = boData[k];
        }
        for (let key in tables) {
          //如果有导入属性，则表明不是子表而是数据报表，不做必填校验
          if (tables[key] && tables[key].hasOwnProperty("export")) {
            continue;
          }
          if (
            (tables[key].required == true || tables[key].required == "true") && zData["sub_" + key] &&
                  zData["sub_" + key].length == 0
          ) {
            this.$message({ message: "子表必填一条记录", type: "warning" });
            return;
          }
        }
      }
      utils
        .getOnlineFormData(true)
        .then(formDataStr => {
          utils.closeAllNotification();
          if (
            !this.nodeDef.localProperties.jumpType &&
            !this.nodeDef.localProperties.choiceExcutor
          ) {
            this.processStart(formDataStr);
          } else {
            this.$store
              .dispatch("storeProcess/getAfterJumpNodes", {
                taskId: "",
                data: Base64.encode(formDataStr),
                defId: this.defId || "",
                instId: this.instId || ""
              })
              .then(data => {
                if (
                  data.afterNodes.length == 0 ||
                  (data.afterNodes.length == 1 &&
                    data.afterNodes[0].excutorList != undefined &&
                    data.afterNodes[0].excutorList.length == 1)
                ) {
                  this.processStart(formDataStr);
                } else {
                  let formData = {};
                  if (formDataStr.constructor == Object) {
                    formData = formDataStr;
                    formData.data = "";
                  } else if (formDataStr.constructor == String) {
                    formData.data = Base64.encode(formDataStr);
                  }
                  this.$refs.taskSelectDestination.showDialog(formData, "", ""); //父组件调用子组件方法
                }
              });
          }
        })
        .catch(reason =>
          utils.handleGetFormDataReject(reason, true).then(() => this_.processStart())
        );
    },
    //流程发起
    processStart(formDataStr) {
      let formKey= this.$refs.formContent.formKey;
      let data = this.handleData(formDataStr);
      if (sessionStorage.getItem('formImportTempJson')) {
        data.updateSubTableJson = sessionStorage.getItem('formImportTempJson');
      }
      this.disabled = true;
      this.$store
        .dispatch("storeProcess/start", data)
        .then(row => {
          this.$store
            .dispatch("storeProcess/getInstanceByInstId", row.instId)
            .then(insts => {
              if (row.curBoPkVal) {
                sessionStorage.setItem('formImportTempRefId',row.curBoPkVal);
              }
              sessionStorage.removeItem('formImportTempJson')
              /* this.$router.push('/v-flow/v-done/' + this.defKey) */
              this.$router.go(-1)
              /* this.$router.push('/v-flow/v-done') */
              /* if (insts.status != "end") {
                this.$router.push("/v-flow/v-done");
                this.$router.push("/inst/" + row.instId + "/request");
              } else {
                this.$router.push("/instRead/" + row.instId + "/myRequest");
              }*/
            })
        })
        .finally(() => {
          this.disabled = false;
        });
    },
    //保存
    saveDraft() {
      let formKey= this.$refs.formContent.formKey;
      const this_ = this;
      utils
        .getOnlineFormData(true)
        .then(formDataStr => {
          utils.closeAllNotification();
          let data = this_.handleData(formDataStr);
          data.formKey=formKey;
          if (sessionStorage.getItem('formImportTempJson')) {
            data.updateSubTableJson = sessionStorage.getItem('formImportTempJson');
          }

          this_.$store.dispatch("storeProcess/saveDraft", data).then(row => {
            if (row.curBoPkVal) {
              sessionStorage.setItem('formImportTempRefId',row.curBoPkVal);
            }
            sessionStorage.removeItem('formImportTempJson');
            this_.isMyRequest = true;
            this_.$router.replace("/start/" + this_.defId + "/" + row.instId);
          }).catch( r => {
          });
        })
        .catch(reason =>
          utils.handleGetFormDataReject(reason).then(() => this.processStart())
        );
    },
    //返回
    back() {
      // wude 2022-11-30 菜单跳转时,校验是否有未提交的表单进行提示
      var formUpdataFlag = sessionStorage.getItem('formUpdataFlag')
      // if (formUpdataFlag == 'true') {
        // this.$confirm(
        //   '表单发生过变更,离开将导致录入数据丢失',
        //   '确定要离开当前页面吗?',
        //   {
        //     confirmButtonText: '确定',
        //     cancelButtonText: '取消',
        //     type: 'warning',
        //   }
        // )
        //   .then(() => {
        //     sessionStorage.setItem('formUpdataFlag', 'false')
        //     utils.closeAllNotification()
        //     this.$router.go(-1)
        //   })
        //   .catch(() => {})
      // } else {
        utils.closeAllNotification()
        this.$router.go(-1)
      // }
      //utils.closeAllNotification()
      //this.$router.go(-1)
      /* if (this.isMyRequest) {
        this.$router.push('/v-flow/v-request')
      } else {
        if (JSON.stringify(this.$route.query) == '{}') {
          this.$router.go(-1)
        } else {
          this.$router.push('/home')
        }
      } */
    },
    init() {
      let _me = this
      if (
        localStorage.selectMenuList &&
        localStorage.selectMenuList.length > 0
      ) {
        let selectMenuList = JSON.parse(localStorage.selectMenuList)
        let path = sessionStorage.menu_alias
        selectMenuList.forEach((element) => {
          console.log(
            element.alias.split('/')
          )

          if (element.alias.split('/')[1] != path) {
            element.alias = '/' + path + '/' + element.alias
          }
        })
        selectMenuList.push({name: _me.defName})
        _me.breadcrumbs = selectMenuList
        let selectMenu = selectMenuList[selectMenuList.length - 1]
        _me.pageTitle =
          selectMenuList[selectMenuList.length - 2].name +
            ' ' +
            selectMenu.name || ''
      }
    },
  },
  created() {
    var p = this.getDef();
    p.then(res => {
      this.defId = res;
      //取发起节点的属性用于判断是否可以选择路径跳转
      window.agentLeaderId = this.leaderId;
      this.$store
        .dispatch("storeProcess/getCurNodeProperties", {
          defId: this.defId || "",
          instId: this.instId || "",
          taskId: ""
        })
        .then(NodeDef => {
          this.nodeDef = NodeDef;
          if(NodeDef.nodeProperties && NodeDef.nodeProperties[0].initFillData){
            _this.initFillData = NodeDef.nodeProperties[0].initFillData;
            _this.$refs['formContent'].setInitFillData(_this.initFillData);
          }
        });
      //获取流程信息
      req
      .get(window.context.bpmModel +
        "/flow/def/v1/defGet?defId=" +
        this.defId
        )
        .then((res) => {
          this.defName = res.data.name
          this.init()
        })
    })
  },
}
</script>
<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
.el-main {
  padding: 0;
}

.el-header {
  padding: 0;
}

.top-subject-col > h3 {
  text-align: center;
  color: #666;
}

.top-btns-col {
  padding-right: 6px;
  height: 48px;
  line-height: 48px;
  text-align: right;
}

.top-btns-col > button {
  color: #666;
}

.top-btns-col > button /deep/ span {
  margin-left: 3px;
}

.top-btns-col > button:hover {
  color: $--theme-color;
}

.text {
  font-size: 14px;
}

.item {
  padding: 18px 0;
}

.start-card {
  background: #fff;
}
</style>
