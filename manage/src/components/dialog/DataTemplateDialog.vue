<template>
  <el-dialog
    title="选择表单列表"
    :append-to-body="true"
    :visible.sync="dialogVisible"
    :before-close="()=>dialogVisible=false"
    :close-on-click-modal="false"
    width="50%"
  >
    <el-container>
      <el-main>
        <ht-table
          @load="loadData"
          :data="data"
          :pageResult="pageResult"
          :selection="true"
          quick-search-props="name,alias"
          :show-export="false"
          :showCustomColumn="false"
          :default-sorter="[{ direction: 'DESC', property: 'create_time_' }]"
          ref="htTable"
          @row-click="rowClick"
        >
          <template>
            <ht-table-column type="index" width="50" align="center" label="序号" />
            <ht-table-column prop="name" label="名称" :sortable="true" :show-overflow-tooltip="true">
              <template slot-scope="scope">
                <el-link
                  type="primary"
                  @click="onConfirm(scope.row)"
                  title="选择"
                >{{ scope.row.name }}</el-link>
              </template>
            </ht-table-column>
            <ht-table-column prop="alias" label="别名" :sortable="true" />
            <ht-table-column prop="boDefAlias" label="业务对象别名" :sortable="true" />
            <ht-table-column prop="typeName" label="分类" />
            <ht-table-column prop="subject" label="绑定流程名称" />
          </template>
        </ht-table>
      </el-main>
    </el-container>
  </el-dialog>
</template>
<script>
import form from "@/api/form.js";
export default {
  name: "data-template-dialog",
  data() {
    return {
      pageResult: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      data: [],
      dialogVisible: false
    };
  },
  methods: {
    showDialog() {
      this.dialogVisible = true;
    },
    //鼠标选中行改变复选框
    rowClick(row, column, event){
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    loadData(param, cb) {
      param.querys || (param.querys = []);
      param.querys.push({
        group: "main",
        property: "mobileFormAlias",
        operation: "NOTNULL",
        relation: "AND"
      });
      if (!param.sorter) {
        param.sorter = [
          {
            direction: "DESC",
            property: "UPDATE_TIME_"
          }
        ];
      } else {
        param.sorter.push({
          direction: "DESC",
          property: "UPDATE_TIME_"
        });
      }
      form
        .getDataTemplateData(param)
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
    onConfirm(selectedNode) {
      this.$emit("onConfirm", {
        alias: selectedNode.alias,
        name: selectedNode.name
      });
      this.dialogVisible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
div[aria-invalid="true"] >>> .el-input__inner,
div[aria-invalid="true"] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
</style>
