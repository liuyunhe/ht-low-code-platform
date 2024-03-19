<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :show-export="false"
      :show-custom-column="false"
      :selectable="false"
      :nopagination="true"
      ref="htTable"
    >
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="name" label="模块名" :show-overflow-tooltip="true">
          <template v-slot="{row}">
            <el-link type="primary" @click="openDetail(row)" title="查看明细">{{row.moduleType}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column prop="type" label="保存时间" width="150">
          <template v-slot="{row}">
            <el-tag
              v-show="row.saveDays==s.value"
              type="info"
              v-for="s in typeArray"
              :key="s.value"
            >{{s.text}}</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column prop="isSuccess" label="状态" width="120">
          <template v-slot="{row}">
            <el-tag
              v-show="row.status==s.value"
              :type="s.type"
              v-for="s in statusArray"
              :key="s.value"
            >{{s.text}}</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column prop="remark" label="备注" width="500" />
      </template>
    </ht-table>

    <ht-sidebar-dialog
      width="28%"
      title="编辑日志配置"
      :visible="dialogVisible"
      :before-close="handleClose"
    >
      <el-form v-model="curRow" data-vv-scope="editForm">
        <ht-form-item label="模块名" prop="name" label-width="80px">{{curRow.moduleType}}</ht-form-item>
        <ht-form-item label="保存时间" prop="receivers" label-width="80px">
          <ht-radio
            v-model="curRow.saveDays"
            :options="[{ key: 3, value: '三天(3天)'}, { key: 7, value: '一周(7天)'}, { key: 30, value: '一个月(30天)' }, { key: 90, value: '三个月(90天)' }, { key: 180, value: '半年(180天)' }, { key: 365, value: '一年(365天)' }]"
          />
        </ht-form-item>
        <ht-form-item label="状态" prop="subject" label-width="80px">
          <ht-radio
            v-model="curRow.status"
            :options="[{ key: '0', value: '关闭'}, { key: '1', value: '开启' }]"
          />
        </ht-form-item>
        <ht-form-item label="备注" prop="content" label-width="80px">
          <ht-input type="textarea" v-model="curRow.remark" :rows="2"
                    :maxlength="200"
                    :showWordLimit="true"/>
        </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
          :url="saveUrl"
          :model="curRow"
          request-method="POST"
          scope-name="editForm"
          @after-save-data="dialogVisible = false;$refs.htTable.load();"
        >保存</ht-submit-button>
        <el-button @click="dialogVisible=false">取消</el-button>
      </div>
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
        { text: "关闭", value: "0", type: "danger" },
        { text: "开启", value: "1", type: "info" }
      ],
      typeArray: [
        { text: "三天", value: "3" },
        { text: "一周", value: "7" },
        { text: "一个月", value: "30" },
        { text: "三个月", value: "90" },
        { text: "半年", value: "180" },
        { text: "一年", value: "365" }
      ]
    };
  },
  computed: {
    saveUrl: function() {
      return window.context.portal + "/sys/sysLogsSettings/v1/save";
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
    },
    openDetail(row) {
      this.curRow = JSON.parse(JSON.stringify(row));
      this.dialogVisible = true;
    },
    loadData(param, cb) {
      req
        .post(window.context.portal + "/sys/sysLogsSettings/v1/list", param)
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
