<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :page-result="pageBean"
      :selection="true"
      quick-search-props="methodName,methodDesc,classInsName"
      ref="htTable"
      :show-export="false"
      :show-custom-column="false"
      @row-click="rowClick"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="conditoinScriptTest()">脚本测试</el-button>
          <el-button size="small" @click="handleOpen('添加人员脚本')">添加</el-button>
          <ht-delete-button :url="formDeleteUrl()" :htTable="$refs.htTable" style="margin:0;">删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column
          prop="methodName"
          label="脚本别名"
          :sortable="true"
          width="300px"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            <el-link
              type="primary"
              @click="handleOpen('编辑人员脚本', scope.row)"
            >{{scope.row.methodName}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column
          prop="methodDesc"
          label="脚本描述"
          :sortable="true"
          :show-overflow-tooltip="true"
        />
        <ht-table-column
          prop="classInsName"
          label="实例名"
          :sortable="true"
          width="200px"
          :show-overflow-tooltip="true"
        />
        <ht-table-column
          prop="enable"
          label="是否有效"
          width="120px"
          :filters="[{text:'无效', value:0},{text:'有效', value:1}]"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.enable == 1">
              <el-tag type="info">有效</el-tag>
            </span>
            <span v-else>
              <el-tag type="warning">无效</el-tag>
            </span>
          </template>
        </ht-table-column>
        <ht-table-column prop="type" label="类型" width="120">
          <template slot-scope="scope">
            <span v-if="scope.row.type == 2">
              <el-tag type="info">人员脚本</el-tag>
            </span>
          </template>
        </ht-table-column>
      </template>
    </ht-table>

    <!--脚本测试-->
    <condition-script-details ref="conditionScriptDetails"></condition-script-details>
    <FlowHrScriptSelector ref="flowHrScriptSelector" append-to-body />
    <!-- 编辑页 -->
    <condition-script-edit :editData="editData" ref="conditionScriptEdit" @loadData="loadData"></condition-script-edit>
  </div>
</template>

<script>
import flow from "@/api/flow.js";
const conditionScriptEdit = () =>
  import("@/views/flow/help/ConditionScriptEdit.vue");
const conditionScriptDetails = () =>
  import("@/views/flow/help/ConditionScriptDetails.vue");
const FlowHrScriptSelector = () => import("@/components/flow/FlowHrScriptSelector.vue");
export default {
  components: {
    conditionScriptEdit,
    conditionScriptDetails,
    FlowHrScriptSelector
  },
  data() {
    return {
      pageBean: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      data: [],
      editData: {}
    };
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    formDeleteUrl() {
      return window.context.bpmRunTime + "/runtime/conditionScript/v1/remove";
    },
    handleOpen(param, row, status) {
      this.editData.data = row;
      this.editData.status = status;
      this.editData.title = param;
      this.$refs.conditionScriptEdit.handleOpen();
    },
    conditoinScriptTest() {
      this.$refs.flowHrScriptSelector.showDilaog({test:true});
    },
    loadData(param, cb) {
      if (!param) {
        this.pageBean.total = 0;
        param = { pageBean: "" };
        param.pageBean = this.pageBean;
      }
      flow
        .getConditionScriptList(param)
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
