<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      quick-search-props="subject,senderName,content"
      :default-sorter="[{direction: 'DESC',property: 'CREATE_TIME_'}]"
      ref="htTable"
      :show-export="false"
      @row-click="rowClick"
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
            <el-link type="primary" @click="openDetail(row)" title="查看明细">{{row.subject}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column prop="type" label="消息类型" width="100" :filters="typeArray">
          <template v-slot="{row}">
            <el-tag
              v-show="row.type==s.value"
              type="info"
              v-for="s in typeArray"
              :key="s.value"
            >{{s.text}}</el-tag>
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

        <!--<ht-table-column prop="senderName" label="发送人" width="120" />-->
        <ht-table-column prop="content" label="消息内容" :show-overflow-tooltip="true" />
        <ht-table-column prop="retryCount" width="80" label="重试次数" />
        <ht-table-column prop="createTime" label="记录时间" width="140" />

        <ht-table-column align="left" width="180" label="操作" :fixed="'right'">
          <template v-slot="{row}">
            <el-button size="mini" @click="reinvoke(row.id)">重调</el-button>
            <el-button size="mini" v-show="!row.isSuccess" @click="signSuccess(row.id)">标记为成功</el-button>
          </template>
        </ht-table-column>
      </template>
    </ht-table>
    <ht-sidebar-dialog
      width="28%"
      title="日志明细"
      :visible="dialogVisible"
      :before-close="handleClose"
    >
      <el-form v-model="curRow" data-vv-scope="editRoleForm">
        <ht-form-item label="类型" prop="name" label-width="80px">
          <el-tag
            v-show="curRow.type==s.value"
            :type="s.type"
            v-for="s in typeArray"
            :key="s.value"
          >{{s.text}}</el-tag>
        </ht-form-item>

        <!--<ht-form-item label="发送人" prop="name" label-width="80px">{{curRow.senderName}}</ht-form-item>-->
        <ht-form-item label="接收人" prop="receivers" label-width="80px">
          <ht-input type="textarea" v-model="curRow.receivers" :rows="2" :readonly="true" />
        </ht-form-item>
        <ht-form-item label="标题" prop="subject" label-width="80px">{{curRow.subject}}</ht-form-item>
        <ht-form-item label="消息内容" prop="content" label-width="80px">
          <ht-input type="textarea" v-model="curRow.content" :rows="2" :readonly="true" />
        </ht-form-item>
        <ht-form-item label="状态" prop="isSuccess" label-width="80px">
          <el-tag
            v-show="curRow.isSuccess==s.value"
            :type="s.type"
            v-for="s in statusArray"
            :key="s.value"
          >{{s.text}}</el-tag>
        </ht-form-item>
        <ht-form-item label="异常信息" prop="exception" label-width="80px">
          <ht-input type="textarea" v-model="curRow.exception" :rows="2" :readonly="true" />
        </ht-form-item>
        <ht-form-item label="重试次数" prop="name" label-width="80px">{{curRow.retryCount}}</ht-form-item>
        <ht-form-item label="记录时间" prop="createTime" label-width="80px">{{curRow.createTime}}</ht-form-item>
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
        { text: "成功", value: 1, type: "info" }
      ],
      typeArray: [
        { text: "内部消息", value: "inner" },
        { text: "邮件", value: "mail" },
        { text: "短信", value: "sms" },
        { text: "语音", value: "voice" },
        { text: "微信", value: "wxEnterprise" },
        { text: "钉钉", value: "dingTalk" },
      ]
    };
  },
  computed: {
    deleteUrl: function() {
      return window.context.portal + "/portal/messageLog/v1/removes";
    }
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    handleClose() {
      this.dialogVisible = false;
    },
    openDetail(row) {
      this.curRow = row;
      this.dialogVisible = true;
    },
    loadData(param, cb) {
      req
        .post(window.context.portal + "/portal/messageLog/v1/list", param)
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
        .post(window.context.portal + "/portal/messageLog/v1/reinvoke/" + id)
        .then(function(response) {
          let data = response.data;
          if (data.state) {
            this_.$message.success(data.message);
            this_.$refs.htTable.load();
          } else {
            this_.$message.fail(data.message);
          }
        });
    },
    signSuccess(id) {
      let this_ = this;
      req
        .post(
          window.context.portal + "/portal/messageLog/v1/signSuccess/" + id
        )
        .then(function(response) {
          let data = response.data;
          if (data.state) {
            this_.$message.success(data.message);
            this_.$refs.htTable.load();
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
</style>
