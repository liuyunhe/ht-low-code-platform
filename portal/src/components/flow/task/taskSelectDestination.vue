<template>
<div class="bpm-btn-dialog">
  <el-dialog
    title="选择目标节点"
    :visible.sync="relatedInformationDialog"
    :close-on-click-modal="false"
    width="800px"
  >
    <div class="record-content">
      <el-table
        :data="selectDesObj.afterNodes"
        style="width: 100%;max-height:400px;overflow-y: auto;"
        border
        header-cell-class-name="todo-header-row"
        row-class-name="todo-row"
        size="medium"
        :default-sort="{prop: 'createTime', order: 'descending'}"
      >
        <el-table-column v-if="selectDesObj.jumpType" label="选择节点" align="left">
          <template slot-scope="scope">
            <el-radio v-model="selectNodeId" :label="scope.row.nodeId">{{scope.row.nodeName }}</el-radio>
          </template>
        </el-table-column>

        <el-table-column v-if="!selectDesObj.jumpType" label="目标节点" align="left">
          <template slot-scope="scope">
            <span>{{scope.row.nodeName }} </span>
          </template>
        </el-table-column>

        <el-table-column v-if="selectDesObj.choiceExcutor" width="500" label="选择处理人" align="left">
          <template slot-scope="scope">
            <el-select
              style="width:300px"
              v-model="scope.row.selectUserIds"
              v-if="selectDesObj.choiceExcutor =='candidate' &&  scope.row.nodeType != 'end' "
              clearable
              filterable
              multiple
              placeholder="请选择"
            >
              <el-option
                v-for="item in scope.row.excutorList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
            <ht-user-selector
              v-model="scope.row.selectUsers"
              v-if="selectDesObj.choiceExcutor !='candidate' &&  scope.row.nodeType != 'end' "
              permission="w"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button
        v-if="(selectDesObj.help!='' || selectDesObj.helpGlobal!='')
      && (selectDesObj.jumpType=='free' || selectDesObj.jumpType=='select' || selectDesObj.jumpType=='free,select' || selectDesObj.jumpType=='select,free')"
        class="help"
        icon="el-icon-question"
        type="text"
        @click="help"
      >帮助</el-button>
      <el-button type="primary" @click="confirm" size="small" :disabled="disabled">确 定</el-button>
      <el-button @click="closeDailog" size="small">取 消</el-button>
    </div>
    <el-dialog
      title="帮助"
      :visible.sync="helpDialog"
      width="55%"
      :close-on-click-modal="false"
      append-to-body
    >
      <div style="max-height:600px;overflow: auto;" v-html="valHelp"></div>
    </el-dialog>
  </el-dialog>
</div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import HtUserSelector from "@/components/control/HtUserSelector.vue";
import utils from "@/utils.js";
import { debuglog } from "util";

export default {
  name: "taskSelectDestination",
  props: ["taskId", "defId", "instId", "leaderId"],
  components: { HtUserSelector },
  data() {
    return {
      relatedInformationDialog: false,
      helpDialog: false,
      disabled: false,
      selectNodeId: "",
      files: "",
      zfiles: "",
      formData: "",
      opinion: "",
      selectDesObj: {},
      token: utils.getUrlKey("token"),
      valHelp: "",
      proInstId: "" //处理人时传过来的流程实例ID
    };
  },
  computed: mapState({
    curOrgPost: state => state.user.postCharge
  }),
  methods: {
    //帮助
    help() {
      this.helpDialog = true;
    },
    //鼠标点击页面其他其他位置不关闭弹框
    showDialog(formData, files, zfiles, opinion, instId, jumpType) {
      if (this.$route.query.type === "free"){
          jumpType = "free";
      }
      this.proInstId = instId;
      this.files = files;
      this.zfiles = zfiles;
      this.opinion = opinion;
      this.formData = formData;
      this.selectNodeId = "";
      this.selectDesObj = {};
      this.jumpType = jumpType;
      this.relatedInformationDialog = true;
      this.$store
        .dispatch("storeProcess/getAfterJumpNodes", {
          taskId: this.taskId || "",
          data: formData.data || formData,
          defId: this.defId || "",
          instId: this.instId || "",
          type: this.jumpType || ""
        })
        .then(data => {
          let Base64 = require("js-base64").Base64;
          this.selectDesObj = data;
          //此操作为改节点为设置自由跳转，通过manage端的任务跳转按钮跳过来时可提供自由跳转功能
          if (this.$route.query.type === "free"){
            this.selectDesObj.jumpType = this.jumpType;
            this.selectDesObj.choiceExcutor = this.jumpType;
          }
          if (this.selectDesObj.afterNodes.length == 1) {
            this.selectNodeId = this.selectDesObj.afterNodes[0].nodeId;
          }
          if (this.selectDesObj.helpGlobal == "null") {
            this.selectDesObj.helpGlobal = "";
          }
          if (this.selectDesObj.help == "null") {
            this.selectDesObj.help = "";
          }
          if (
            this.selectDesObj.helpGlobal != "" &&
            this.selectDesObj.help != ""
          ) {
            this.valHelp = Base64.decode(this.selectDesObj.help, "utf-8");
          } else if (
            this.selectDesObj.helpGlobal == "" &&
            this.selectDesObj.help != ""
          ) {
            this.valHelp = Base64.decode(this.selectDesObj.help, "utf-8");
          } else if (this.selectDesObj.helpGlobal != "") {
            this.valHelp = Base64.decode(this.selectDesObj.helpGlobal, "utf-8");
          }
        });
    },
    closeDailog() {
      this.relatedInformationDialog = false;
    },
    confirm() {
      let data = {
        data: this.formData.data || this.formData,
        taskId: this.taskId || "",
        defId: this.defId || "",
        proInstId: this.instId || "",
        actionName: "agree",
        files: this.files,
        zfiles: this.zfiles,
        formType: "inner",
        opinion: this.opinion,
        agentLeaderId: this.leaderId,
        isSendNodeUsers: "1"
      };
      if (this.formData.businessKey) {
        data.formType = "frame";
        data.businessKey = this.formData.businessKey;
        data.sysCode = this.formData.sysCode;
        if (this.formData.vars) {
          data.vars = this.formData.vars;
        }
      }
      //如果用户选择看目标节点，则将节点的跳转类也传到后台

      data.destination = this.selectNodeId;
      if (
        !data.destination &&
        this.selectDesObj.afterNodes &&
        this.selectDesObj.afterNodes.length == 1
      ) {
        data.destination = this.selectDesObj.afterNodes[0].nodeId;
      }
      if (this.selectDesObj.jumpType) {
        data.jumpType =
          this.selectDesObj.jumpType == "select" ? "select" : "free";
      }

      let nodeUsers = [];
      //遍历所有的节点将其所选择的节点。
      if (this.selectDesObj && this.selectDesObj.choiceExcutor == "candidate") {
        for (
          let index = 0;
          index < this.selectDesObj.afterNodes.length;
          index++
        ) {
          const node = this.selectDesObj.afterNodes[index];
          if (node.selectUserIds && node.selectUserIds.length > 0) {
            const excutorList = node.excutorList;
            const selectusers = [];
            for (let index = 0; index < excutorList.length; index++) {
              const user = excutorList[index];
              if (user && node.selectUserIds.indexOf(user.id) > -1) {
                selectusers.push(user);
              }
            }
            nodeUsers.push({ nodeId: node.nodeId, executors: selectusers });
          }
        }
      } else if (this.selectDesObj) {
        for (
          let index = 0;
          index < this.selectDesObj.afterNodes.length;
          index++
        ) {
          const node = this.selectDesObj.afterNodes[index];
          if (node.selectUsers && node.selectUsers.length > 0) {
            const excutorList = node.selectUsers;
            const selectusers = [];
            for (let index = 0; index < excutorList.length; index++) {
              const user = excutorList[index];
              selectusers.push({
                id: user.id,
                name: user.fullname,
                type: "user"
              });
            }
            nodeUsers.push({ nodeId: node.nodeId, executors: selectusers });
          }
        }
      }

      if (nodeUsers.length > 0) {
        data.nodeUsers = JSON.stringify(nodeUsers);
      }
      if (window.urgentStateValue) {
        data.urgentStateValue = window.urgentStateValue;
      }
      if (this.taskId) {
        this.$confirm("确认办理此任务?", "提示", {
          cancelButtonText: "取消",
          confirmButtonText: "确定",
          type: "warning",
          closeOnClickModal: false
        }).then(() => {
          this.disabled = true;
          this.$store
            .dispatch("storeProcess/complete", data)
            .then(() => {
              //如果是模块开发进来的，则跳转到待办列表
              if(this.$route.name.indexOf("reportModuleInst") != -1){
                //数据视图
                this.$router.push("/statement/template/preview/"+this.$route.params.templateKey+"/todo/"+this.$route.params.defKey+"/true");
              }else if(this.$route.name.indexOf("sysModuleInst") != -1){
                //从模块开发的待办中心进来
                 this.$router.push("/v-flow/v-todo/" + this.$route.params.defKey);
              }else{
                this.$router.push("/inst/" + this.proInstId + "/doneList");
              }
              // if(this.token!=null){
              //   window.close();
              // }else{
              //   this.$router.go(-1);
              // }
            })
            .catch(() => {
              this.disabled = false;
            });
        });
      } else {
        if (this.curOrgPost && this.curOrgPost.org) {
          data.startOrgId = this.curOrgPost.org.id;
        }
        this.disabled = true;
        data.supportMobile = 1;
        this.$store
          .dispatch("storeProcess/start", data)
          .then(() => {
            if (this.token != null) {
              window.close();
            } else {
              this.$router.go(-1);
            }
          })
          .catch(() => {
            this.disabled = false;
          });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
.record-container {
  border-bottom: 1px solid #ebeef5;
  padding: 20px 0 10px;
}

.record-container > span {
  border-left: 3px solid $--theme-color;
  font-weight: bold;
  font-size: 14px;
  padding-left: 10px;
  color: #666;
}

.record-content {
  padding: 10px 0;
}

.form-table {
  width: 100%;
  border-top: 1px solid #ebeef5;
  border-left: 1px solid #ebeef5;
}

.form-table th {
  text-align: right;
  color: #666;
}

.form-table th > span {
  color: #f00;
}

.form-table th, .form-table td {
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  padding: 10px;
  min-width: 0;
  box-sizing: border-box;
  text-overflow: ellipsis;
  vertical-align: middle;
  position: relative;
}

.recordInformation {
  text-align: right;
  width: 15%;
}

.overstriking {
  font-weight: 700;
}

.help {
  float: left;
}

/deep/.el-dialog__body {
  padding: 10px 20px;
  color: $--color-text-regular;
  font-size: 14px;
}
</style>
