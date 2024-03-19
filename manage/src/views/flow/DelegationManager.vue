<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      :show-export="false"
      :show-custom-column="false"
      quick-search-props="subject"
      ref="table"
      @row-click="rowClick"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="edit()" icon="el-icon-plus">添加</el-button>
          <ht-delete-button :url="deleteUrl" :htTable="$refs.table" style="margin:0;">删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="subject" label="标题" :sortable="true" :show-overflow-tooltip="true">
          <template v-slot="{row}">
            <el-link type="primary" @click="edit(row.id)" title="点击编辑">{{row.subject}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column prop="authName" label="委托人" :show-overflow-tooltip="true" />
        <ht-table-column label="受委托人" :show-overflow-tooltip="true" :formatter="formatterAgent" />
        <ht-table-column
          prop="isEnabled"
          label="是否有效"
          width="90"
          :filters="[
            { text: '有效', value: 'Y' },
            { text: '禁用', value: 'N' }
          ]"
        >
          <template v-slot="{ row }">
            <el-tag type="info" v-if="row.isEnabled === 'Y'">有效</el-tag>
            <el-tag type="danger" v-if="row.isEnabled === 'N'">禁用</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column
          prop="type"
          label="委托类型"
          width="90"
          :filters="[
            { text: '全权委托', value: 1 },
            { text: '部分委托', value: 2 }
          ]"
        >
          <template v-slot="{ row }">
            <el-tag type="info" v-if="row.type === 1">全权委托</el-tag>
            <el-tag type="success" v-if="row.type === 2">部分委托</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column
          prop="startDate"
          label="开始时间"
          width="160"
          :sortable="true"
          :show-overflow-tooltip="true"
        />
        <ht-table-column
          prop="endDate"
          label="结束时间"
          width="160"
          :sortable="true"
          :show-overflow-tooltip="true"
        />
      </template>
    </ht-table>

    <delegation-edit :editData="editData" ref="delegationEdit" @after-save="handleLoad" />

    <ht-sidebar-dialog
      title="查看委托"
      :visible="detailDialogVisible"
      width="35%"
      :before-close="beforeDetailClose"
    >
      <delegation-detail :detailData="detailData" />
    </ht-sidebar-dialog>
  </div>
</template>

<script>
import flow from "@/api/flow.js";
const delegationEdit = () => import("@/components/flow/DelegationEdit.vue");
const delegationDetail = () => import("@/components/flow/DelegationDetail.vue");
const htSubmitButton = () => import("@/components/common/HtSubmitButton.vue");
export default {
  components: {
    delegationEdit,
    delegationDetail,
    htSubmitButton
  },
  data() {
    return {
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      editDialogVisible: false,
      detailDialogVisible: false,
      selectedId: "",
      detailData: {},
      editData: {},
      deleteUrl: window.context.bpmModel + "/flow/agent/v1/remove",
      saveUrl: window.context.bpmModel + "/flow/agent/v1/save"
    };
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.table.$refs.htTable.toggleRowSelection(row);
    },
    loadData(param, cb) {
      flow
        .getDelegationList(param)
        .then(response => {
          this.data = response.rows;
          this.pageResult = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total
          };
        })
        .finally(() => {
          cb();
        });
    },
    formatterAgent(row) {
      if (row.type === "3") {
        return "条件委托暂时无法计算出委托人";
      } else {
        return row.agent;
      }
    },
    beforeDetailClose() {
      this.detailDialogVisible = false;
    },
    edit(id) {
      if (id != null) {
        flow.getDelegationById(id).then(data => {
          this.editData = data;
          this.$refs.delegationEdit.handleOpen();
        });
      } else {
        this.editData = {};
        this.$refs.delegationEdit.handleOpen();
      }
    },
    detail(id) {
      this.detailDialogVisible = true;
      flow.getDelegationById(id).then(data => {
        this.detailData = data;
      });
    },
    close(dialogVisible) {
      this[dialogVisible] = false;
    },
    handleLoad() {
      this.$refs.table.load();
    }
  }
};
</script>

<style scoped>
</style>
