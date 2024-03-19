<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      quick-search-props="subject,procInstId,procDefKey,taskName"
      ref="htTable"
      :default-sorter="[{direction: 'DESC',property: 'callTime'}]"
      :show-export="false"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <ht-delete-button :url="deleteUrl" :htTable="$refs.htTable" @after-delete="afterDelete">删除</ht-delete-button>
        </el-button-group>
      </template>

      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="subject" label="标题" :sortable="true" :show-overflow-tooltip="true">
          <template v-slot="{row}">
            <el-link
              type="primary"
              :show-overflow-tooltip="true"
              @click="openDetail(row)"
              title="查看明细"
            >{{row.subject}}</el-link>
          </template>
        </ht-table-column>

        <ht-table-column prop="isSuccess" label="状态" width="80" :filters="statusArray">
          <template v-slot="{row}">
            <el-tag
              v-show="row.isSuccess==s.value"
              :type="s.type"
              v-for="s in statusArray"
              :key="s.value"
            >{{s.text}}</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column prop="procInstId" label="实例ID" width="100" />
        <ht-table-column prop="procDefKey" label="流程key" width="100" />
        <ht-table-column prop="taskName" width="120" label="任务名称" />
        <ht-table-column prop="retryCount" width="70" label="重试次数" />
        <ht-table-column prop="callTime" label="记录时间" width="140" />
        <ht-table-column align="left" width="180" label="操作">
          <template v-slot="{row}">
            <el-button size="mini" @click="reinvoke(row.id)">重调</el-button>
            <el-button size="mini" v-show="!row.isSuccess" @click="signSuccess(row.id)">标记为成功</el-button>
          </template>
        </ht-table-column>
      </template>
    </ht-table>
    <ht-sidebar-dialog
      width="30%"
      title="日志明细"
      :visible="dialogVisible"
      :before-close="handleClose"
    >
      <el-form v-model="curRow" data-vv-scope="editRoleForm">
        <ht-form-item label="类型" prop="name" label-width="80px">
          <el-tag
            v-show="curRow.eventType==s.value"
            :type="s.type"
            v-for="s in typeArray"
            :key="s.value"
          >{{s.text}}</el-tag>
        </ht-form-item>
        <ht-form-item label="标题" prop="subject" label-width="80px">{{curRow.subject}}</ht-form-item>
        <ht-form-item label="定义key" prop="subject" label-width="80px">{{curRow.procDefKey}}</ht-form-item>
        <ht-form-item label="实例ID" prop="subject" label-width="80px">{{curRow.procInstId}}</ht-form-item>
        <ht-form-item
          v-if="curRow.eventType=='taskCreate' || curRow.eventType=='taskComplete'"
          label="任务ID"
          prop="content"
          label-width="80px"
        >{{curRow.taskKey}}</ht-form-item>
        <ht-form-item
          v-if="curRow.eventType=='taskCreate' || curRow.eventType=='taskComplete'"
          label="任务名称"
          prop="content"
          label-width="80px"
        >{{curRow.taskName}}</ht-form-item>
        <ht-form-item label="接口地址" prop="content" label-width="80px">{{curRow.url}}</ht-form-item>
        <ht-form-item label="内容" prop="params" label-width="80px">
          <ht-input type="textarea" v-model="curRow.params" :rows="10" :readonly="true" />
        </ht-form-item>
        <ht-form-item label="状态" prop="isSuccess" label-width="80px">
          <el-tag
            v-show="curRow.isSuccess==s.value"
            :type="s.type"
            v-for="s in statusArray"
            :key="s.value"
          >{{s.text}}</el-tag>
        </ht-form-item>
        <ht-form-item
          v-if="curRow.isSuccess !='1'"
          label="异常信息"
          prop="exception"
          label-width="80px"
        >
          <ht-input type="textarea" v-model="curRow.exception" :rows="2" :readonly="true" />
        </ht-form-item>
        <ht-form-item label="重试次数" prop="name" label-width="80px">{{curRow.retryCount}}</ht-form-item>
        <ht-form-item label="记录时间" prop="callTime" label-width="80px">{{curRow.callTime}}</ht-form-item>
      </el-form>
    </ht-sidebar-dialog>
  </div>
</template>
<script>
import req from "@/request.js";
export default {
  components: {},
  data() {
    return {
      defaultProps: {
        children: "children",
        label: "name"
      },
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      curRow: {},
      dialogVisible: false,
      statusArray: [
        { text: "失败", value: 0, type: "danger" },
        { text: "成功", value: 1, type: "success" }
      ],
      typeArray: [
        { text: "任务创建", value: "taskCreate" },
        { text: "任务完成", value: "taskComplete" },
        { text: "流程发起", value: "startEvent" },
        { text: "流程结束", value: "endEvent" }
      ]
    };
  },
  computed: {
    deleteUrl: function() {
      return window.context.bpmRunTime + "/portal/messageLog/v1/removes";
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
    },
    openDetail(row) {
      this.curRow = row;
      this.dialogVisible = true;
    },
    loadData(param, cb) {
      req
        .post(
          window.context.bpmRunTime + "/runtime/bpmCallLog/v1/list",
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
    afterDelete() {
      this.$refs.htTable.load();
    },
    reinvoke(id) {
      let this_ = this;
      req
        .post(window.context.bpmRunTime + "/runtime/bpmCallLog/v1/reinvoke/" + id)
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
    signSuccess(id) {
      let this_ = this;
      req
        .post(
          window.context.bpmRunTime + "/runtime/bpmCallLog/v1/signSuccess/" + id
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
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
.aside-width {
  width: $--aside-width !important;
}

div >>> .el-form-item--small {
  margin-bottom: 10px;
}
</style>
