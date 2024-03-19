<template>
  <el-dialog
    :title="title"
    :append-to-body="appendToBody"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    :close-on-click-modal="false"
    width="50%"
  >
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :showCustomColumn="false"
      :showExport="false"
      :selection="true"
      ref="chartTable"
      @row-click="rowClick"
    >
      <ht-table-column prop="name" label="名称" :sortable="true" />
      <template v-if="chartType===2">
        <ht-table-column prop="alias" label="别名" :sortable="true"/>
        <ht-table-column prop="objName" label="表名称"/>
        <ht-table-column
            prop="style"
            label="图表类型"
            width="120"
        >
          <template v-slot="{ row }">
            <el-tag v-if="row.style === 1 || row.style === 2"
            >折线图/柱状图</el-tag
            >
            <el-tag type="warning" v-if="row.style === 3">饼图</el-tag>
            <el-tag type="danger" v-if="row.style === 4">雷达图</el-tag>
            <el-tag type="info" v-if="row.style === 5">漏斗图</el-tag>
            <el-tag type="success" v-if="row.style === 6">散点图</el-tag>
            <el-tag type="warning" v-if="row.style === 7">热力图</el-tag>
          </template>
        </ht-table-column>
      </template>

    </ht-table>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="onConfirm">确定</el-button>
      <el-button @click="handleClose">取消</el-button>
    </div>
  </el-dialog>
</template>
<script>
const htSysTypeTree = () => import("@/components/common/HtSysTypeTree.vue");
import req from "@/request.js";
export default {
  name: "eip-chart-dialog",
  components: {
    htSysTypeTree
  },
  props: {
    chartType: {
      type: Number
    },
    appendToBody: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      pageResult: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      data: [],
      dialogVisible: false,
      selectedNode: null
    };
  },
  computed: {
    title: function() {
      return this.chartType == 1 ? "统计报表选择器" : "自定义图表选择器";
    }
  },
  methods: {
    handleCurrentChange() {
      alert("jj");
    },
    //鼠标选中行改变复选框
    rowClick(row, column, event){
      this.$refs.chartTable.$refs.htTable.toggleRowSelection(row);
    },
    loadData(param, cb) {
      let url = "";
      if (this.chartType == 2) {
        url = window.context.form + "/form/customChart/v1/list";
      } else {
        url =
          window.context.bpmRunTime +
          "/runtime/report/v1/listJson?isPublic=true";
      }
      req
        .post(url, param)
        .then(response => {
          this.data = response.data.rows;
          this.pageResult = {
            page: response.data.page,
            pageSize: response.data.pageSize,
            total: response.data.total
          };
        })
        .finally(() => cb && cb());
    },
    showDialog() {
      this.dialogVisible = true;
      this.$nextTick(()=>{
        this.$refs.chartTable.load();
      })
    },
    handleClose() {
      this.dialogVisible = false;
    },
    handleNodeClick(node) {
      this.selectedNode = node;
    },
    onConfirm() {
      let selectedList = this.$refs.chartTable.$refs.htTable.selection;
      if (selectedList.length == 0) {
        this.$message({ message: "请选择一项!", type: "warning" });
        return;
      }
      this.$emit("onConfirm", selectedList);
      this.dialogVisible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
>>> .el-dialog {
  width: 300px;
  height: 500px;
}
>>> .el-dialog__header {
  border-bottom: 1px solid darkgrey;
}
>>> .el-dialog__body {
  padding: 0px;
  height: 380px;
}
>>> .el-dialog__footer {
  position: absolute;
  text-align: center;
  bottom: 0px;
  left: 0px;
  right: 0px;
}
</style>
