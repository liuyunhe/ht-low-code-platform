<template>
  <el-main class="ht-table-panel" ref="tablePanel">
    <div class="toolbar-panel" ref="toolbarPanel">
      <el-row
        v-if="!justShowSearch"
        :class="{ 'ht-quick__search': !hideTableSearch }"
      >
        <el-col :span="22" class="search-container__col">
          <ht-input
            class="quick-search"
            v-if="quickSearchConfig && quickSearchConfig.length > 0"
            v-model.lazy="quickSearchWord"
            @keydown.enter.native="quickSearch"
            :placeholder="quickSearchPlaceholder"
            :autofocus="true"
            :disabled="loading || showAdvancedSearch"
            ref="quickSearch"
            :debounce="2000"
          >
            <el-button
              slot="append"
              :disabled="loading || showAdvancedSearch"
              icon="el-icon-search"
              @click="quickSearch"
            ></el-button>
          </ht-input>
          <el-divider
            v-if="quickSearchConfig && quickSearchConfig.length > 0"
            direction="vertical"
          ></el-divider>
          <slot name="toolbar"></slot>
        </el-col>
        <el-col :span="2" class="common-tools">
          <el-tooltip
            v-if="showCustomColumn"
            content="自定义列表项"
            placement="top"
          >
            <el-button
              icon="el-icon-s-tools"
              size="large"
              @click="customColumnDialogVisible = true"
            />
          </el-tooltip>
          <el-tooltip v-if="showExport" content="导出数据" placement="top">
            <el-button icon="el-icon-folder-checked" size="large" />
          </el-tooltip>
          <el-button
            type="text"
            style="margin-top: 2px"
            v-if="hasSearchPanel && !justShowSearch"
            @click="showAdvancedSearch = !showAdvancedSearch"
            >{{ showAdvancedSearch ? "基础搜索" : "高级搜索" }}</el-button
          >
        </el-col>
      </el-row>
    </div>
    <el-collapse-transition>
      <div v-show="showAdvancedSearch || justShowSearch" ref="searchPanel">
        <slot name="search"></slot>
      </div>
    </el-collapse-transition>
    <el-table
      :style="{ height: `${tableMaxHeight}` + 'px' }"
      :data="data"
      v-loading="loading"
      ref="htTable"
      stripe
      border
      :show-header="showHeader"
      :max-height="tableMaxHeight"
      :default-querys="defaultQuerys"
      :highlight-current-row="highlightCurrentRow"
      :header-row-class-name="headerRowClassName"
      @row-click="handleRowClick"
      @select="handleTableSelect"
      @select-all="handleTableSelect"
      @sort-change="handleSortChange"
      @filter-change="handleFilterChange"
      class="ht-table"
      size="mini"
    >
      <el-table-column
        type="selection"
        align="center"
        width="45"
        v-if="this.selectable"
      />
      <el-table-column
       width="50"
       label="序号"
       align="center"
      >
      <template slot-scope="scope">
        <span>{{((pagination.page-1)*pagination.pageSize)+scope.$index+1}}</span>
      </template>
      </el-table-column>
      <slot></slot>
    </el-table>
    <div v-if="!nopagination" class="pagination-panel" ref="paginationPanel">
      <el-row type="flex" :justify="paginationJustify">
        <el-pagination
          small
          :disabled="loading"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.page"
          :page-sizes="pageSizes"
          :page-size="pagination.pageSize"
          :pager-count="pagerCount"
          :background="$paginationBackground"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
        ></el-pagination>
      </el-row>
    </div>
    <el-dialog
      title="自定义列表项"
      :visible.sync="customColumnDialogVisible"
      :before-close="customColumnDialogCancel"
      width="700px"
      :close-on-click-modal="false"
      append-to-body
    >
      <ht-checkbox v-model="currentCustomColumns" :options="customColumns" />
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="customColumnDialogSure"
          >确 定</el-button
        >
        <el-button size="small" @click="customColumnDialogCancel"
          >取 消</el-button
        >
      </span>
    </el-dialog>
  </el-main>
</template>
<script>
import utils from "@/hotent-ui-util.js";
import _ from "lodash";

export default {
  name: "ht-table",
  props: {
    justShowSearch: {
      //为true时只显示高级搜索中的查询条件
      type: Boolean,
      default: false
    },
    paginationJustify: {
      type: String,
      default: "start",
      validator: function(value) {
        return (
          ["start", "end", "center", "space-around", "space-between"].indexOf(
            value
          ) !== -1
        );
      }
    },
    data: Array,
    showHeader: {
      type: Boolean,
      default: true
    },
    pageResult: {
      type: Object,
      default: () => {
        return { page: 1, pageSize: 50, total: 0 };
      }
    },
    pageSizes: {
      type: Array,
      default: () => {
        return [10, 20, 50, 100, 200, 300, 500];
      }
    },
    pagerCount: {
      type: Number,
      default: 11
    },
    nopagination: {
      type: Boolean,
      default: false
    },
    highlightCurrentRow: {
      type: Boolean,
      default: false
    },
    selectable: {
      type: Boolean,
      default: true
    },
    quickSearchProps: [String, Array],
    headerRowClassName: [String, Function],
    debounce: {
      type: Number,
      default: 1500
    },
    showExport: {
      type: Boolean,
      default: true
    },
    showCustomColumn: {
      type: Boolean,
      default: true
    },
    defaultQuerys: {
      type: Array,
      default() {
        return [];
      }
    },
    defaultSorter: {
      type: Array,
      default() {
        return [];
      }
    },
    isLoadTable: {
      //是否默认在mounted函数中请求table数据
      type: Boolean,
      default: true
    },
    customTableHeight: [String, Number] //自定义传入固定高度
  },
  data() {
    return {
      querys: [],
      sorter: null,
      quickSearchWord: null,
      quickSearchPlaceholder: "请输入搜索内容",
      quickSearchConfig: null,
      hasSearchPanel: false,
      filters: {},
      pagination: { ...this.pageResult },
      tableMaxHeight: 400,
      showAdvancedSearch: false,
      loading: false,
      columns: [],
      customColumns: [],
      customColumnsHashCode: null,
      currentCustomColumns: null,
      customColumnDialogVisible: false,
      selection: []
    };
  },
  created() {
    // 从插槽中获取到当前表格的所有列
    this.$slots.default.forEach(n => {
      if (n && n.componentOptions) {
        const pd = n.componentOptions.propsData;
        // 将当前表格的列放入一个数组
        this.columns.push(pd);
        // 将当前有有prop和label的列放入自定义列表项的数组中
        if (pd.prop && pd.label) {
          this.customColumns.push({
            key: pd.prop,
            value: pd.label,
            checked: !(pd.hidden === true || pd.hidden === "")
          });
        }
      }
    });
    // 获取当前自定义列表项的hashCode
    this.customColumnsHashCode = utils.hashCode(
      JSON.stringify(this.customColumns)
    );
    this.quickSearchProps && this.generateQuickSearchConfig();
    this.$on("advance-search", data => this.advanceSearch(data));
  },
  computed: {
    calDefaultQuerys: function() {
      let calQuerys = [];
      let query = {
        group: "defaultQueryGroup",
        operation: "EQUAL",
        relation: "AND"
      };
      this.defaultQuerys.forEach(c => {
        calQuerys.push({ ...query, ...c });
      });
      return calQuerys;
    },
    hideTableSearch() {
      const hasToolBar = this.$slots.toolbar && this.$slots.toolbar.length > 0;
      const hasQuickSearch =
        this.quickSearchConfig && this.quickSearchConfig.length > 0;
      return !this.showAdvancedSearch && !hasToolBar && !hasQuickSearch;
    }
  },
  watch: {
    justShowSearch: {
      handler(val) {
        if (val) {
          this.showAdvancedSearch = true;
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.debounceQuickSearch = _.debounce(() => {
      this.quickSearch();
    }, this.debounce);
    // 判断是否有高级搜索面板
    this.hasSearchPanel = !!this.$scopedSlots.search;
    if (this.isLoadTable) {
      this.load();
    }
    this.calcTableHeight();
    this.$watch("showAdvancedSearch", (n, o) => {
      if (n !== o) {
        if (n) {
          this.quickSearchWord = null;
        }
        // 显示或收起搜索面板时，重新计算表格高度
        this.calcTableHeight(500);
      }
    });
    this.$watch("pageResult", (n, o) => {
      if (n !== o) {
        this.pagination = { ...n };
      }
    });
    /**
     * 统一使用回车查询
    this.$watch("quickSearchWord", (n, o) => {
      if (n !== o) {
        this.debounceQuickSearch();
      }
    });
     */
    this.$root.$on("resize", () => {
      this.calcTableHeight(500);
    });
    this.initialCustomColumn();
  },
  methods: {
    quickSearch() {
      // 先删除快速查询的查询条件
      this.clearQueryByGroupName("quick");
      this.clearQueryByGroupName("advance");
      this.quickSearchWord &&
        this.quickSearchConfig.forEach(c => {
          let query = {
            property: c.prop,
            value: this.quickSearchWord.trim(),
            group: "quick",
            relation: "OR",
            operation: "LIKE"
          };
          this.querys.push(query);
        });
      this.load();
    },
    advanceSearch(data) {
      if (this.loading || !this.showAdvancedSearch) {
        return;
      }
      this.clearQueryByGroupName("quick");
      this.clearQueryByGroupName("advance");
      data &&
        data.forEach(d => {
          let query = {
            property: d.prop,
            value: d.value,
            group: "advance",
            relation: d.relation,
            operation: d.operation
          };
          query.value && this.querys.push(query);
        });
      this.load();
    },
    // 加载数据
    load(doNotResetPage) {
      this.loading = true;
      // 默认重置页码为第一页
      if (!doNotResetPage) {
        this.pagination.page = 1;
      }
      let param = {
        pageBean: this.pagination
      };

      if (this.sorter && this.sorter.length > 0) {
        param.sorter = this.sorter;
      }
      // 处理排序字段
      if (this.defaultSorter.length > 0) {
        if (!param.sorter) {
          param.sorter = [];
        }
        this.defaultSorter.forEach(item => {
          param.sorter.remove(item);
        });
        param.sorter = param.sorter.concat(this.defaultSorter);
      }
      // 处理过滤条件
      this.handleFilters();

      if (this.querys && this.querys.length > 0) {
        param.querys = this.querys;
      }

      // 处理查询条件
      if (this.calDefaultQuerys.length > 0) {
        if (!param.querys) {
          param.querys = [];
        }
        this.calDefaultQuerys.forEach(item => {
          param.querys.remove(item);
        });
        param.querys = param.querys.concat(this.calDefaultQuerys);
      }

      const me = this;
      // 防止外部没有回调，设置10秒后自动取消加载中的状态
      const finalTickCB = setTimeout(function() {
        me.loading = false;
      }, 10000);

      if (this.nopagination) {
        param.pageBean = {};
      }
      this.$emit("load", { ...param }, () => {
        // 外部已经回调的情况下，取消倒计时
        clearTimeout(finalTickCB);
        me.loading = false;
        setTimeout(() => {
          me.$refs.quickSearch &&
            me.$refs.quickSearch.$children[0].$el.children[0].focus();
        });
      });
    },
    // 通过列属性获取列标签
    getColumnLabelByProp(prop) {
      let label = null;
      if (!prop) {
        return label;
      }
      this.columns.forEach(c => {
        if (c.prop && c.prop === prop) {
          label = c.label;
        }
      });
      return label;
    },
    // 构建快速搜索配置项
    generateQuickSearchConfig() {
      let labelAry = [];
      if (typeof this.quickSearchProps == "string") {
        const props = utils.stringSplit(this.quickSearchProps, ",");
        this.quickSearchConfig = [];
        props.forEach(prop => {
          const label = this.getColumnLabelByProp(prop);
          if (label) {
            labelAry.push(label);
            this.quickSearchConfig.push({ prop, label });
          }
        });
      }
      if (typeof this.quickSearchProps == "object") {
        this.quickSearchProps.forEach(prop => {
          if (prop && prop.label) {
            labelAry.push(prop.label);
          }
        });
        this.quickSearchConfig = [...this.quickSearchProps];
      }
      this.quickSearchPlaceholder = `请输入${labelAry.join(",")}来搜索`;
    },
    // 通过分组名称清除对应查询条件
    clearQueryByGroupName(groupName) {
      // 待删除的查询条件
      let toDelete = [];
      this.querys &&
        this.querys.forEach(query => {
          if (query.group == groupName) {
            toDelete.push(query);
          }
        });
      toDelete.forEach(d => {
        this.querys.remove(d);
      });
    },
    handleFilters() {
      this.clearQueryByGroupName("filter");
      // 将过滤条件添加查询参数数组中
      if (this.filters && Object.keys(this.filters).length > 0) {
        Object.keys(this.filters).forEach(k => {
          const filter = this.filters[k];
          let query = {
            property: k,
            value: filter[0],
            group: "filter",
            relation: "AND"
          };
          if (filter.length == 1) {
            query.operation = "EQUAL";
            this.querys.push(query);
          } else if (filter.length > 1) {
            query.operation = "IN";
            query.value = filter;
            this.querys.push(query);
          }
        });
      }
    },
    handleSizeChange(pageSize) {
      this.pagination = { ...this.pagination, pageSize };
      this.load();
    },
    handleCurrentChange(page) {
      this.pagination = { ...this.pagination, page };
      // 翻页时不重置页码
      this.load(true);
    },
    handleRowClick(row, column, event) {
      this.$emit("row-click", row, column, event);
    },
    handleTableSelect(selection, row) {
      this.selection = selection;
      if (row) {
        this.$emit("select", selection, row);
      } else {
        this.$emit("select-all", selection);
      }
    },
    handleSortChange(column) {
      if (!column.order) {
        this.sorter = null;
      } else {
        this.sorter = [
          {
            property: column.prop,
            direction: column.order == "ascending" ? "ASC" : "DESC"
          }
        ];
      }
      this.load();
      this.$emit("sort-change", column);
    },
    handleFilterChange(m) {
      this.filters = { ...this.filters, ...m };
      Object.keys(this.filters).forEach(k => {
        if (!this.filters[k] || this.filters[k].length == 0) {
          delete this.filters[k];
        }
      });
      this.load();
      this.$emit("filter-change", m);
    },
    // 初始化自定义列表项
    initialCustomColumn() {
      // 优先获取localStorage中的设置
      if (this.customColumnsHashCode) {
        this.currentCustomColumns = this.getLocalStorage(
          this.customColumnsHashCode
        );
      }
      // 没有localStorage时，根据表格列是否初始化隐藏来获取
      if (!this.currentCustomColumns) {
        let ccols = [];
        this.customColumns.forEach(cs => {
          cs.checked && ccols.push(cs.key);
        });
        this.currentCustomColumns = ccols.join(",");
      }
      this.applyCustomColumn();
    },
    // 将自定义列表项应用到当前表格、自定义列表项数组中
    applyCustomColumn() {
      const currentCustomColumnsAry = this.currentCustomColumns.split(",");
      // 同步选中状态到自定义列表数组中
      this.customColumns.forEach(cs => {
        cs.checked = currentCustomColumnsAry.some(cca => cca == cs.key);
      });
      // 同步选中状态到当前表格
      this.$slots.default.forEach(v => {
        if (
          v &&
          v.componentInstance &&
          v.componentInstance.prop &&
          v.componentInstance.label
        ) {
          v.componentInstance.hiddenCol = !currentCustomColumnsAry.some(
            cca => cca == v.componentInstance.prop
          );
        }
      });
      this.$nextTick(() => {
        this.$refs.htTable.doLayout();
      });
    },
    // 自定义列表项确定按钮
    customColumnDialogSure() {
      this.applyCustomColumn();
      // 同步选中状态到localStorage中
      if (this.customColumnsHashCode) {
        this.setLocalStorage(
          this.customColumnsHashCode,
          this.currentCustomColumns
        );
      }
      this.customColumnDialogVisible = false;
    },
    // 自定义列表项取消按钮
    customColumnDialogCancel() {
      // 取消对话框时，可能用户已经勾选或去掉了一些选项，这里需要还原这些勾选操作
      let currentCustomColumnAry = [];
      this.customColumns.forEach(cc => {
        cc.checked && currentCustomColumnAry.push(cc.key);
      });
      this.currentCustomColumns = currentCustomColumnAry.join(",");
      this.customColumnDialogVisible = false;
    },
    // 从localStorage中获取用于存放自定义列表项的对象
    getObjectFromLocalStorage() {
      if (localStorage) {
        let customColumnSetting = localStorage.getItem("customColumnSetting");
        if (!customColumnSetting) {
          customColumnSetting = "{}";
        }
        try {
          customColumnSetting = JSON.parse(customColumnSetting);
        } catch (e) {}
        if (!customColumnSetting || typeof customColumnSetting != "object") {
          customColumnSetting = {};
        }
        return customColumnSetting;
      }
      return null;
    },
    setLocalStorage(key, value) {
      let customColumnSetting = this.getObjectFromLocalStorage();
      if (customColumnSetting) {
        customColumnSetting[key] = value;
        localStorage.setItem(
          "customColumnSetting",
          JSON.stringify(customColumnSetting)
        );
      }
    },
    getLocalStorage(key) {
      let customColumnSetting = this.getObjectFromLocalStorage();
      if (customColumnSetting) {
        return customColumnSetting[key];
      }
      return null;
    },
    calcTableHeight(delay) {
      // 动态计算表格的高度，自适应当前容器
      setTimeout(() => {
        if (!this.$refs.tablePanel) {
          return;
        }
        const tablePanelHeight = this.$refs.tablePanel.$el.clientHeight;
        const toolbarPanelHeight = this.$refs.toolbarPanel.clientHeight || 0;
        const searchPanelHeight =
          this.$refs.searchPanel && this.$refs.searchPanel.clientHeight
            ? this.$refs.searchPanel.clientHeight
            : 0;
        const paginationPanelHeight =
          (this.$refs.paginationPanel &&
            this.$refs.paginationPanel.clientHeight) ||
          0;
        const tableHeight =
          tablePanelHeight -
          (searchPanelHeight > 0 ? 20 : 5) -
          toolbarPanelHeight -
          searchPanelHeight -
          paginationPanelHeight;
        this.tableMaxHeight = this.customTableHeight
          ? this.customTableHeight
          : tableHeight;
      }, delay || 0);
    }
  }
};
</script>
<style lang="scss" scoped>
.ht-table-panel {
  padding: 0px;
  height: 100%;
  overflow: hidden;
}

.ht-table {
  width: 100%;
}

.search-container__col {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  flex-direction: row;
  align-items: center;
}

.ht-quick__search {
  margin-bottom: 15px;
}

.quick-search {
  width: 400px;
  margin-right: 20px;
}

.quick-search + .el-divider {
  margin-right: 20px;
}

>>> .el-input__inner,
>>> .el-input-group__append {
  border-radius: 0;
}

.common-tools > .el-link {
  float: right;
  margin-right: 15px;
}

.common-tools > .el-button {
  float: right;
  padding: 6px 3px;
  border-radius: 0;
}

.common-tools > .el-button + .el-button {
  margin-right: 5px;
}

.common-tools > .el-button >>> i {
  font-weight: bold;
  font-size: 16px;
}

>>> .ht-table .sort-caret.descending {
  bottom: 0px;
}

>>> .ht-table .sort-caret.ascending {
  top: -2px;
}

>>> .ht-table .caret-wrapper {
  height: 20px;
}

>>> .ht-table .el-table__column-filter-trigger {
  line-height: 20px;
}

.pagination-panel {
  padding: 10px 0;
}

.pagination-panel >>> .el-input__inner {
  height: 23px !important;
  line-height: 23px !important;
}
</style>
