<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      :show-export="false"
      :quick-search-props="[{prop:'subject',label:'流程标题'},{prop:'procDefName',label:'流程名称'},{prop:'ID_',label:'流程编号'}]"
      ref="htTable"
      @row-click="rowClick"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <ht-delete-button :url="deleteUrl" :htTable="$refs.htTable" @after-delete="afterDelete">删除</ht-delete-button>
          <el-button icon="el-icon-document-add" @click="batchRestore()">恢复</el-button>
        </el-button-group>
      </template>
      <template v-slot:search>
        <ht-table-search-panel :divide="3">
          <ht-table-search-field label="流程编号" prop="ID_" />
          <ht-table-search-field label="流程标题" prop="subject" />
          <ht-table-search-field label="流程名称" prop="procDefName" />
          <ht-table-search-field
            type="daterange"
            label="创建时间"
            prop="createTime"
            operation="BETWEEN"
          />
        </ht-table-search-panel>
      </template>

      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column
          prop="id"
          label="流程编号"
          :hiden="true"
          width="160"
          show-overflow-tooltip
          :sortable="true"
        />
        <ht-table-column prop="subject" label="流程标题" :show-overflow-tooltip="true"></ht-table-column>
        <ht-table-column prop="procDefName" label="流程名称" hidden width="150" :sortable="true" />
        <ht-table-column prop="status" label="实例状态" width="115" :filters="statusArray">
          <template v-slot="{row}">
            <el-tag
              v-show="row.status==s.value"
              :type="s.type"
              v-for="s in statusArray"
              :key="s.value"
            >{{s.text}}</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column prop="createTime" label="创建时间" width="140" :sortable="true" />
        <ht-table-column prop="endTime" label="结束时间" hidden width="140" :sortable="true" />
        <ht-table-column prop="isForbidden" label="是否挂起" width="100" :filters="isForbidden">
          <template v-slot="{row}">
            <el-tag
              v-show="row.isForbidden==s.value"
              :type="s.type"
              v-for="s in isForbidden"
              :key="s.value"
            >{{s.text}}</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column prop="creator" label="发起人" width="120" />
        <ht-table-column
          prop="isDele"
          label="是否删除"
          width="100"
          :filters="[{text:'未删除', value:0},{text:'已删除', value:1}]"
        >
          <template v-slot="{row}">
            <el-tag type="danger" v-if="row.isDele =='1'">已删除</el-tag>
            <el-tag type="info" v-if="row.isDele =='0'">未删除</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column align="left" label="操作" width="120">
          <template v-slot="{ row }">
            <el-dropdown
              size="mini"
              split-button
              @command="handleCommand"
              @click="handleCommand({row:row,command:'detail'})"
            >
              <span>
                <i class="el-icon-tickets"></i>查看
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  icon="el-icon-menu"
                  :command="{row:row,command:'instanceUrgent'}"
                  v-if="row.isDele!='1' && row.status!='manualend' && row.status!='adminmanualend' && row.status!='end' && row.status!='draft'"
                >催办</el-dropdown-item>
                <el-dropdown-item
                  icon="el-icon-menu"
                  :command="{row:row,command:'restore'}"
                  v-if="row.isDele=='1'"
                >恢复</el-dropdown-item>
                <el-dropdown-item
                  v-if="row.isDele!='1' && row.isForbidden=='1'"
                  icon="el-icon-menu"
                  :command="{row:row,command:'isForbidden'}"
                >取消挂起</el-dropdown-item>
                <el-dropdown-item
                  icon="el-icon-menu"
                  v-if="row.isDele!='1' && row.isForbidden=='0' && row.status !='end' && row.status !='draft' && row.status !='manualend' && row.status !='adminmanualend'"
                  :command="{row:row,command:'isForbidden'}"
                >挂起</el-dropdown-item>

                <el-dropdown-item
                  icon="el-icon-menu"
                  v-if="row.isDele!='1' && row.status !='end' && row.status !='draft' && row.status !='manualend' && row.status !='adminmanualend'"
                  :command="{row:row,command:'end'}"
                >终止流程</el-dropdown-item>

                <el-dropdown-item
                  icon="el-icon-menu"
                  v-if="row.isDele!='1' && (row.status =='manualend' || row.status =='adminmanualend')"
                  :command="{row:row,command:'renew'}"
                >终止恢复</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </ht-table-column>
      </template>
    </ht-table>

    <ht-sidebar-dialog
      width="100%"
      :close-on-click-modal="false"
      :visible="dialogVisible"
      :before-close="handleClose"
      :append-to-body="true"
      title="查看明细"
    >
      <el-button
        style="float: right;z-index: 15000;position: relative;"
        @click="dialogVisible = false;"
        type="danger"
        icon="el-icon-refresh-left"
      >返回</el-button>
      <InstanceDetail v-if="dialogVisible" :instance="curInstance" />
    </ht-sidebar-dialog>
    <!-- 流程催办 -->
    <InstanceUrgent ref="instanceUrgent" />
  </div>
</template>
<script>
import flow from "@/api/flow.js";
import utils from "@/hotent-ui-util.js";
import req from "@/request.js";
const InstanceUrgent = () => import("@/views/flow/InstanceUrgent.vue");
import EipUserDialog from "@/components/dialog/EipUserDialog.vue";
const InstanceDetail = () => import("@/views/flow/InstanceDetail.vue");

export default {
  components: {
    EipUserDialog,
    InstanceDetail,
    InstanceUrgent
  },
  data() {
    return {
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      loadDataUrl: "",
      dialogVisible: false,
      statusArray: [
        { text: "运行中", value: "running", type: "success" },
        { text: "结束", value: "end", type: "info" },
        { text: "草稿", value: "draft", type: "info" },
        { text: "驳回", value: "back", type: "danger" },
        { text: "驳回到发起人", value: "backToStart", type: "danger" },
        { text: "撤回", value: "revoke", type: "warning" },
        { text: "撤回到发起人", value: "revokeToStart", type: "warning" },
        { text: "人工终止", value: "manualend", type: "info" },
        { text: "管理员结束", value: "adminmanualend", type: "info" }
      ],
      curInstance: ""
    };
  },
  computed: {
    isForbidden: function() {
      return [
        { text: "正常", value: 0, type: "info" },
        { text: "挂起", value: 1, type: "danger" }
      ];
    },
    deleteUrl: function() {
      return window.context.bpmRunTime + "/runtime/instance/v1/remove";
    },
    saveRoleUrl: function() {
      let preUrl = window.context.uc + "/api/role/v1/role";
      if (this.role.id) {
        preUrl += "/updateRole";
      } else {
        preUrl += "/addRole";
      }
      return preUrl;
    }
  },

  mounted() {
    this.$validator = this.$root.$validator;
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    batchRestore() {
      let elTable = this.$refs.htTable;
      if (this.$refs.htTable.$refs && this.$refs.htTable.$refs.htTable) {
        elTable = this.$refs.htTable.$refs.htTable;
      }
      if (elTable && elTable.selection && elTable.selection.length == 0) {
        this.$message.warning("请选择至少一项记录");
        return;
      }

      let ids = [];

      for (let item of elTable.selection) {
        if (item.isDele ==1) {
          ids.push(item["id"]);
        }
      }

      if (ids.length == 0) {
        this.$message.warning("所选记录不包含已删除记录，无需恢复");
        return;
      }
      this.restore(ids.join(","));
    },
    handleClose() {
      this.dialogVisible = false;
    },
    handleCloseMenuPerm() {
      this.dialogVisibleMenuPerm = false;
    },
    dialogCancle(dialogVisible) {
      this[dialogVisible] = false;
    },
    loadData(param, cb) {
      flow
        .getInstPage(param)
        .then(response => {
          this.data = response.rows;
          this.pageResult = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total
          };
        })
        .finally(() => cb());
    },
    handleCommand(params) {
      switch (params.command) {
        case "detail": //查看
          this.curInstance = params.row;
          this.dialogVisible = true;
          break;
        case "restore": //恢复
          this.restore(params.row.id);
          break;
        case "isForbidden": //挂起/取消挂起
          this.forbiddenOrUnForbiddenInst(params.row);
          break;
        case "instanceUrgent": //实例ID催办
          this.instanceUrgent(params.row);
          break;
        case "end": //终止流程
          this.endProcess(params.row);
          break;
        case "renew": //终止流程
          this.renewProcess(params.row);
          break;
        default:
          break;
      }
    },
    //终止流程
    endProcess(row) {
      let this_ = this;
      this.$prompt("", "请输入终止原因", {
        inputPattern: /^[\s\S]*.*[^\s][\s\S]*$/,
        showCancelButton: false,
        inputErrorMessage: "终止原因不能为空"
      })
        .then(({ value }) => {
          this_.$http
            .get(
              "${bpmRunTime}/runtime/instance/v1/doEndProcessById?id=" +
                row.id +
                "&reason=" +
                value
            )
            .then(function(resp) {
              let data = resp.data;
              if (data.state) {
                this_.$message.success("操作成功");
                this_.$refs.htTable.load();
              } else {
                this_.$message.error(data.mesage || "操作失败");
              }
            });
        })
        .catch(() => {});
    },
    //终止恢复流程
    renewProcess(row) {
      let this_ = this;
      this.$prompt("", "请输入终止恢复原因", {
        inputPattern: /^[\s\S]*.*[^\s][\s\S]*$/,
        showCancelButton: false,
        inputErrorMessage: "终止恢复原因不能为空"
      })
        .then(({ value }) => {
          this_.$http
            .get(
              "${bpmRunTime}/runtime/instance/v1/renewProcess?id=" +
                row.id +
                "&reason=" +
                value
            )
            .then(function(resp) {
              let data = resp.data;
              if (data.state) {
                this_.$message.success("操作成功");
                this_.$refs.htTable.load();
              } else {
                this_.$message.error(data.mesage || "操作失败");
              }
            });
        })
        .catch(() => {});
    },
    //流程催办
    instanceUrgent(row) {
      this.$refs.instanceUrgent.handleOpen(row.id, row.procDefId, row.subject); //父组件调用子组件方法
    },
    forbiddenOrUnForbiddenInst(row) {
      let this_ = this;
      flow.forbiddenOrUnForbiddenInst(row).then(response => {
        if (response.state) {
          this_.$message.success(response.message);
          row.isForbidden = row.isForbidden == "1" ? "0" : "1";
        }
      });
    },
    restore(id) {
      let this_ = this;
      req
        .get(
          window.context.bpmRunTime + "/runtime/instance/v1/restore?id=" + id
        )
        .then(function(response) {
          let data = response.data;
          if (data.state) {
            this_.$message.success(data.message);
            this_.$refs.htTable.load(true);
          } else {
            this_.$message.fail(data.message);
          }
        });
    },
    afterDelete() {
      this.$refs.htTable.load();
    }
  }
};
</script>
<style scoped>
div[aria-invalid="true"] >>> .el-input__inner,
div[aria-invalid="true"] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}

div >>> .el-dialog__header {
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
</style>
