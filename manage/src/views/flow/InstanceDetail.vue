<template>
  <div class="fullheight">
    <el-tabs type="card" style="height: 100%;" v-model="activeName">
      <el-tab-pane label="审批记录" name="approvalManage">
        <ht-table
          @load="loadData"
          :data="opinionData"
          :nopagination="true"
          ref="htTable"
          :show-export="false"
          :show-custom-column="false"
          :selectable="false"
        >
          <template>
            <ht-table-column type="index" width="50" align="center" label="序号" />
            <ht-table-column prop="taskName" label="审批节点" width="150" />
            <ht-table-column prop="auditorName" label="执行人" width="120" />
            <ht-table-column prop="qualfiedNames" label="待执行人" width="120" />
            <ht-table-column label="审批操作" width="110">
              <template v-slot="{row}">
                <span :style="'color:'+handleStatus(row).color">{{handleStatus(row).val}}</span>
              </template>
            </ht-table-column>
            <ht-table-column prop="opinion" label="意见" />
            <ht-table-column prop="completeTime" label="操作时间" width="140" />
            <ht-table-column prop="durMs" label="停留时长" width="110">
              <template v-slot="{row}">
                <span
                  v-if="row && row.status!='start_commu' && row.status!='awaiting_check'"
                >{{row.durMs | timeLag}}</span>
              </template>
            </ht-table-column>
            <ht-table-column label="操作" align="center" width="80">
              <template v-slot="{row,index}">
                <el-button
                  v-if="row.status !='awaiting_check'"
                  @click="modifyOpinion(row,index)"
                  size="small"
                >修改</el-button>
                <!-- <el-button size="small" type="danger" @click="handleDetele(row,index)">删除</el-button> -->
              </template>
            </ht-table-column>
          </template>
        </ht-table>
      </el-tab-pane>
      <el-tab-pane label="业务表单" name="form">
        <div style="height:100%;">
          <iframe
            frameborder="0"
            name="frmFrame"
            scrolling="no"
            width="100%"
            height="100%"
            :src="htmlSrc"
          ></iframe>
        </div>
      </el-tab-pane>
      <el-tab-pane label="流程图" name="flowImage">
        <FlowImage ref="taskImage" :instId="instance.id" />
      </el-tab-pane>
      <el-tab-pane label="实例信息" name="instDetail">
        <table
          class="table table-bordered"
          style="border-spacing: 0;width: 100%;max-height: 400px;overflow: initial;"
        >
          <tbody>
            <tr>
              <th width="20%">实例标题</th>
              <td width="30%">{{instance.subject}}</td>
              <th width="20%">是否正式数据</th>
              <td width="30%">{{instance.isFormmal=='Y'?'是':'否'}}</td>
            </tr>
            <tr>
              <th>流程实例ID(proInstId)</th>
              <td>{{instance.id}}</td>
              <th>BPMN流程实例ID(bpmnInstId)</th>
              <td>{{instance.bpmnInstId}}</td>
            </tr>
            <tr>
              <th>流程定义ID(procDefId)</th>
              <td>{{instance.procDefId}}</td>
              <th>BPM流程定义ID(bpmnDefId)</th>
              <td>{{instance.bpmnDefId}}</td>
            </tr>
            <tr>
              <th>流程定义KEY(procDefKey)</th>
              <td>{{instance.procDefKey}}</td>
              <th>流程名称</th>
              <td>{{instance.procDefName}}</td>
            </tr>
            <tr>
              <th>关联数据的业务主键</th>
              <td>{{instance.bizKey}}</td>
              <th>创建人</th>
              <td>{{instance.creator}}</td>
            </tr>
            <tr>
              <th>创建时间</th>
              <td>{{instance.createTime}}</td>
              <th>结束时间</th>
              <td>{{instance.endTime}}</td>
            </tr>
            <tr>
              <th>审批用时</th>
              <td>{{instance.duration}}</td>
              <th>父实例ID</th>
              <td>{{instance.parentInstId}}</td>
            </tr>
          </tbody>
        </table>
      </el-tab-pane>

      <el-tab-pane label="表单修改记录" name="modifyRecored">
        <div style="height:calc(100% - 30px);margin:10px;" v-if="activeName == 'modifyRecored'">
          <ht-table
            @load="loadRecordData"
            :data="data"
            :pageResult="pageResult"
            quick-search-props="userName,taskName"
            ref="recordhtTable"
            :show-export="false"
            :show-custom-column="false"
            :defaultQuerys="[
            { property: 'instId', value: instance.id, operation: 'EQUAL'}
          ]"
          >
            <template v-slot:toolbar>
              <el-button-group>
                <ht-delete-button
                  :url="deleteUrl"
                  :htTable="$refs.recordhtTable"
                  @after-delete="$refs.recordhtTable.load();"
                >删除</ht-delete-button>
              </el-button-group>
            </template>
            <template>
              <ht-table-column type="index" width="50" align="center" label="序号" />
              <ht-table-column prop="userName" label="修改人"  width="140" />
              <ht-table-column prop="taskName" label="任务名称"  width="140" />
              <ht-table-column prop="reason" label="审批意见" show-overflow-tooltip width="200" />
              <ht-table-column prop="modifyTime" label="修改时间" width="160" />
              <ht-table-column prop="detail" label="修改详情" show-overflow-tooltip>
                 <template v-slot="{row}">
                    <el-link type="primary" @click="openModifyDetail(row)" title="查看明细" >{{row.detail}}</el-link>
                  </template>
              </ht-table-column>
            </template>
          </ht-table>
        </div>
      </el-tab-pane>
    </el-tabs>
    <InstanceModifyOpinion @opinionModifysuccess="handleModifySuccess" ref="instanceModifyOpinion" />
    <el-dialog
      width="60%"
      title="修改明细"
      :visible.sync="modifyDialogVisible"
      top="8vh"
      :append-to-body="true"
      :close-on-click-modal="false"
    >
      <el-form v-if="modifyDialogVisible" v-model="curRow" data-vv-scope="editRoleForm">
           <ht-input style="width:100%" type="textarea" v-model="curRow.detail" :rows="20" :readonly="true" />
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import flow from "@/api/flow.js";
import utils from "@/hotent-ui-util.js";
import req from "@/request.js";
import EipUserDialog from "@/components/dialog/EipUserDialog.vue";
import InstanceModifyOpinion from "@/views/flow/InstanceModifyOpinion.vue";
const FlowImage = () => import("@/components/flow/FlowImage.vue");

import { Base64 } from "js-base64";
import { mapState, mapActions } from "vuex";

export default {
  name: "instance-detail",
  props: ["instance"],
  components: {
    EipUserDialog,
    InstanceModifyOpinion,
    FlowImage,
    htmlSrc: ""
  },
  data() {
    return {
      activeName: "approvalManage",
      dialogVisible: false,
      modifyDialogVisible: false,
      opinionData: [],
      statusConf: {
        start: { val: "提交", color: "#2761ff" },
        agree: { val: "通过", color: "#2761ff" },
        awaiting_check: { val: "待审批", color: "#2761ff" },
        feedback: { val: "沟通反馈", color: "#2761ff" },
        transAgree: { val: "征询回复", color: "#2761ff" },
        reject: { val: "驳回", color: "#2761ff" },
        admin_agree: { val: "通过", color: "#2761ff" },
        admin_manual_end: { val: "结束", color: "#fd0d00" },
        revoker: { val: "撤回", color: "#fd0d00" },
        copyto_reply: { val: "抄送回复", color: "rgba(0,0,0,0.65)" },
        end: { val: "结束", color: "rgba(0,0,0,0.65)" },
        skip: { val: "跳过", color: "rgba(0,0,0,0.65)" },
        manual_end: { val: "人工终止", color: "#fd0d00" },
        reSubmit: { val: "驳回提交", color: "#2761ff" },
        flow_turnover: { val: "流程移交", color: "#2761ff" }
      },
      curModifyIndex: "-1",
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      curRow:{}
    };
  },
  computed: mapState({
    account: state => state.login.currentUser.account,
    token: state => state.login.currentUser.token,
    htmlSrc: function(state) {
      return (
        window.context.front +
        "/formManage/" +
        this.instance.id +
        "/manage?token=" +
        this.token
        // Base64.encode(this.account)
      );
    },
    deleteUrl: function() {
      return window.context.bpmRunTime + "/bpm/boDataModifyRecord/v1/remove";
    }
  }),
  methods: {
    openModifyDetail(row) {
      this.curRow = row;
      this.modifyDialogVisible = true;
    },
    loadRecordData(param, cb) {
      let this_ = this;
      this.$http
        .post(
          window.context.bpmRunTime + "/bpm/boDataModifyRecord/v1/listJson",
          param
        )
        .then(data => {
          let response = data.data;
          this.data = response.rows;
          this.pageResult = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total
          };
        })
        .finally(() => cb());
    },
    modifyOpinion(row, index) {
      this.curModifyIndex = index;
      this.$refs.instanceModifyOpinion.show(row);
    },
    handleModifySuccess(row) {
      this.opinionData.splice(this.curModifyIndex, 1, row);
    },
    handleStatus(row) {
      if (row && row.status && this.statusConf[row.status]) {
        return this.statusConf[row.status];
      }
      return { val: row.statusVal, color: "#2761ff" };
    },
    dialogCancle(dialogVisible) {
      this[dialogVisible] = false;
    },
    loadData(param, cb) {
      let this_ = this;
      req
        .get(
          window.context.bpmRunTime +
            "/runtime/instance/v1/instanceFlowOpinions?instId=" +
            this.instance.id
        )
        .then(response => {
          this_.opinionData = response.data;
        })
        .finally(() => cb());
    },
    handleCommand(params) {
      switch (params.command) {
        case "detail": //查看
          this.showDialog(params.row);
          break;
        case "restore": //恢复
          break;
        case "isForbidden": //挂起/取消挂起
          this.forbiddenOrUnForbiddenInst(params);
          break;
        default:
          break;
      }
    },
    forbiddenOrUnForbiddenInst(row) {
      flow.forbiddenOrUnForbiddenInst(row).then(response => {
        if (response.state) {
          row.isForbidden = row.isForbidden == "1" ? "0" : "1";
        }
      });
    },
    handleDetele(row, index) {
      let html =
        "<textarea ref=" +
        Math.random() +
        ' id="approvalLeaderSelect" class="layui-layer-input" style="width: 100%;height: 100px;"></textarea>';
      let this_ = this;
      this.$alert(html, "请输入删除原因", {
        dangerouslyUseHTMLString: true,
        beforeClose: function(action, instance, done) {
          if (action == "confirm") {
            let se = document.getElementById("approvalLeaderSelect");
            if (!se.value) {
              this.$message.warning("请输入原因");
            } else {
              req
                .post(
                  window.context.bpmRunTime +
                    "/runtime/instance/v1/delFlowOpinions?id=" +
                    row.id +
                    "&adminpose=" +
                    row.adminInterPose +
                    "&status=" +
                    row.status,
                  se.value
                )
                .then(function(rep) {
                  let data = rep.data;
                  if (data.state) {
                    this_.opinionData.splice(index, 1);
                    instance.close();
                    this_.$message.success("删除成功");
                  } else {
                    this_.$message.fail(data.message);
                  }
                });
            }
          } else {
            instance.close();
          }
        }
      }).catch(() => {});
    }
  }
};
</script>
<style scoped>
div[aria-invalid="true"] >>> .el-input__inner,
div[aria-invalid="true"] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
div .el-dialog__header {
  display: none;
}
div >>> .el-dialog__header,
div >>> .el-dialog__body {
  height: calc(100% - 10px);
  padding: 10px;
}

div >>> .el-tabs__content > .el-tab-pane {
  height: 100%;
}
div >>> .el-tabs__content {
  height: calc(100% - 50px);
}

.table > thead > tr > th,
.table > thead > th,
.table > tbody > tr > th,
.table > tfoot > tr > th,
.table > thead > tr > td,
.table > tbody > tr > td,
.table > tfoot > tr > td {
  border-top: 1px solid #e7eaec;
  border-left: 1px solid #e7eaec;
  line-height: 1.42857;
  padding: 8px;
  vertical-align: middle;
}
.table > tbody > tr > th {
  text-align: right;
}
.table {
  border-bottom: 1px solid #e7eaec;
  border-right: 1px solid #e7eaec;
}
</style>