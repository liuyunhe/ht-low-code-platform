<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    :close-on-click-modal="false"
    class="manage-dialog__wrap"
    top="8vh"
  >
    <ht-table
      @load="loadData"
      :data="tableData"
      :selectable="false"
      :nopagination="true"
      :show-export="false"
      :show-custom-column="false"
      ref="htTable"
      v-if="dialogVisible"
    >
      <template
        v-slot:search
        v-if="customQuery.conditionfield && customQuery.conditionfield.length>0 && isShowSearch"
      >
        <ht-table-search-panel :divide="3">
          <ht-table-search-field
            v-for="(item,$index) in customQuery.conditionfield"
            :type="item.type"
            :key="$index"
            :label="item.comment"
            :prop="item.field"
          />
        </ht-table-search-panel>
      </template>
      <template v-if="customQuery.resultfield && customQuery.resultfield.length > 0">
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column
          v-for="(item,$index) in customQuery.resultfield"
          :key="$index"
          :prop="item.field"
          :label="item.comment"
          :show-overflow-tooltip="true"
        ></ht-table-column>
      </template>
    </ht-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { Message } from "element-ui";
import req from "@/request.js";
import utils from "@/hotent-ui-util.js";
import CustomQuery from "@/views/form/customquery/CustomQuery.js";

export default {
  name: "custom-query-show",
  data() {
    return {
      title: "",
      customQuery: {}, //关联查询定义
      isShowSearch: false, //是否显示高级搜索
      dialogVisible: false, //是否显示关联数据
      tableData: [] //ht-table列表数据
    };
  },
  methods: {
    //显示关联数据
    showDialog(alias, title) {
      alias &&
        CustomQuery.get(alias).then(
          query => {
            this.customQuery = { ...query };
            this.customQuery.resultfield = JSON.parse(
              this.customQuery.resultfield
            );
            this.customQuery.sortfield = JSON.parse(this.customQuery.sortfield);
            this.customQuery.conditionfield = JSON.parse(
              this.customQuery.conditionfield
            );
            this.isShowSearch = this.customQuery.conditionfield.some(
              c => c.defaultType == "1" && c.controllerType
            );
            this.title = title || "关联查询预览";
            this.dialogVisible = true;
          },
          () => {
            this.$message.error(
              `预览关联查询时出错，找不到别名为：${alias}的关联查询。`
            );
          }
        );
    },
    //加载数据
    loadData(param, cb) {
      // 构建上下文数据对象
      let ctx = {};
      param.querys &&
        param.querys.forEach(element => {
          ctx[element.property] = element.value;
        });
      CustomQuery.load(this.customQuery.alias, ctx)
        .then(data => {
          this.tableData = data;
        })
        .finally(() => cb());
    },
    //关闭关联数据
    handleClose() {
      this.customQuery = {};
      this.title = "";
      this.isShowSearch = false;
      this.tableData = [];
      this.dialogVisible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.el-main {
  padding-top: 0px;
}
</style>
