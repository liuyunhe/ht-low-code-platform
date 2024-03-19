<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :page-result="pageBean"
      :selection="true"
      :default-sorter="[{direction:'DESC',property:'update_time_'}]"
      quick-search-props="name,category"
      ref="htTable"
      :show-export="false"
      :show-custom-column="false"
      @row-click="rowClick"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="handleOpen('添加常用脚本')">添加</el-button>
          <ht-delete-button :url="formDeleteUrl()" :htTable="$refs.htTable" style="margin:0;">删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="name" label="名称" :show-overflow-tooltip="true" :sortable="true">
          <template slot-scope="scope">
            <el-link type="primary" @click="handleOpen('编辑常用脚本', scope.row)">{{scope.row.name}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column prop="category" :show-overflow-tooltip="true" label="脚本类型">
          <template slot-scope="scope">
            <span>
              <el-tag type="info">{{scope.row.category}}</el-tag>
            </span>
          </template>
        </ht-table-column>
        <ht-table-column
          prop="memo"
          width="400"
          label="备注"
          :show-overflow-tooltip="true"
          :sortable="true"
        />
      </template>
    </ht-table>

    <!-- 脚本编辑 -->
    <script-edit :editData="editData" @loadList="loadList" ref="scriptEdit"></script-edit>
  </div>
</template>

<script>
import flow from "@/api/flow.js";
const scriptEdit = () => import("@/views/flow/help/ScriptEdit.vue");
export default {
  components: {
    scriptEdit
  },
  data() {
    return {
      pageBean: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      editData: {},
      data: []
    };
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    handleOpen(param, row) {
      this.editData.title = param;
      this.editData.data = row;
      this.$refs.scriptEdit.handleOpen();
    },
    formDeleteUrl() {
      return window.context.bpmRunTime + "/runtime/script/v1/remove?ids";
    },
    loadList() {
      this.$refs.htTable.load();
    },
    loadData(param, cb) {
      if (!param) {
        this.pageBean.total = 0;
        param = { pageBean: "" };
        param.pageBean = this.pageBean;
      }
      flow
        .getScriptList(param)
        .then(resp => {
          this.data = resp.data.rows;
          this.pageBean = {
            page: resp.data.page,
            pageSize: resp.data.pageSize,
            total: resp.data.total
          };
        })
        .finally(() => cb());
    }
  }
};
</script>
