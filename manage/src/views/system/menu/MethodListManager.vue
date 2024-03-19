<template>
  <el-container class="fullheight" style="border: 1px solid #eee">
    <ht-menu-manager ref="htMenuManager" @node-click="handleNodeClick" hide-menu />
    <el-container>
      <el-main>
        <ht-table
          @load="loadData"
          @row-click="rowClick"
          :data="data"
          :pageResult="pagination"
          :selection="true"
          :default-sorter="[{direction: 'DESC',property: 'id'}]"
          quick-search-props="name,requestUrl"
          ref="htTable"
          :show-export="false"
        >
          <template v-slot:toolbar></template>
          <template>
            <ht-table-column type="index" width="50" align="center" label="序号" />
            <ht-table-column prop="id" label="主键" :sortable="true" hidden />
            <ht-table-column prop="name" label="名称" :sortable="true" :show-overflow-tooltip="true" />
            <ht-table-column prop="alias" label="别名" :sortable="true" />
            <ht-table-column prop="requestUrl" label="接口地址" :sortable="true" />
          </template>
        </ht-table>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
import portalApi from "@/api/portal.js";
import req from "@/request.js";
const HtMenuManager = () => import("@/components/system/HtMenuManager.vue");
const EipSysTypeSelector = () =>
  import("@/components/selector/EipSysTypeSelector.vue");
export default {
  name: "MenuManager",
  components: {
    HtMenuManager,
    EipSysTypeSelector
  },
  data() {
    return {
      editMenuFormVisible: false,
      treeData: [],
      defaultProps: {
        children: "children",
        label: "name"
      },
      data: [],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      pathQuery: null
    };
  },
  watch: {},
  mounted() {},
  methods: {
    rowClick(row, column, event){
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    handleNodeClick(nodedata) {
      // 根据组织获取下级组织
      // 获取当前组织及下级组织
      let queryFilter = {
        pageBean: this.pagination,
        querys: []
      };
      this.pathQuery = {
        property: "path",
        value: nodedata.path,
        group: "categoryGroup",
        operation: "RIGHT_LIKE",
        relation: "AND"
      };
      this.loadData(queryFilter, () => {});
    },
    loadData(param, cb) {
      if (this.pathQuery) {
        param.querys.push(this.pathQuery);
      }
      // 参数说明  url  requestBodyParam  requestParam
      req
        .post("${portal}/sys/sysMethod/v1/listJson", param)
        .then(data => {
          let response = data.data;
          this.data = response.rows;
          this.pagination = {
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
>>> .error-small {
  color: #f56c6c;
  font-size: 12px;
  line-height: 1;
  padding-top: 0;
  margin-top: 0;
  position: absolute;
  top: 80%;
  left: 0;
}
>>> .el-table td,
th {
  padding: 13px 0;
}

>>> .el-form-item__content {
  width: 250px;
}

.form-empty {
  position: absolute;
  text-align: center;
  width: 300px;
  font-size: 20px;
  top: 200px;
  left: 50%;
  margin-left: -150px;
  color: #ccc;
}
</style>
