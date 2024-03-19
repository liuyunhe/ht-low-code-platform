<template>
  <el-pagination
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
    :current-page="currentPage"
    :page-sizes="pageSizes"
    :page-size="pageSize"
    :layout="layout"
    :hide-on-single-page="hideOnSinglePage"
    :total="total"
  ></el-pagination>
</template>
<script>
import utils from "@/hotent-ui-util.js";
import SubPagination from "@/components/eipControl/bus/SubPagination.js";

export default {
  name: "eip-sub-pagination",
  props: {
    currentPage: {
      type: Number,
      default: 1,
    },
    layout: {
      type: String,
      default: "total, sizes, prev, pager, next, jumper",
    },
    pageSizes: {
      type: Array,
      default: function () {
        return [15, 50, 100, 200, 300];
      },
    },
    pageSize: {
      type: Number,
      default: 15,
    },
    hideOnSinglePage: {
      type: Boolean,
      default: false,
    },
    rows: {
      type: Array,
      default: function () {
        return [];
      },
    },
    dataSubname: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      myCurrentPage: 1,
      myPageSize: 100,
      total: 0,
    };
  },
  watch: {
    currentPage: {
      handler: function (newVal) {
        this.myCurrentPage = newVal;
      },
      immediate: true,
    },
    pageSize: {
      handler: function (newVal) {
        this.myPageSize = newVal;
      },
      immediate: true,
    },
    rows: {
      handler: function (newVal, oldVal) {
        if (!newVal || newVal.constructor != Array) {
          throw "EipSubPagination组件的rows属性只能传入数组";
        }
        // 子表数据变化时更新分页总数
        this.total = newVal.length;
      },
      immediate: true,
    },
  },
  mounted() {
    this.paginationChange();
  },
  destroyed() {
    SubPagination.clear(this.dataSubname);
  },
  methods: {
    paginationChange() {
      // 分页变化时，以dataPath为key设置到公共的js对象中
      SubPagination.set(this.dataSubname, {
        rows: this.rows,
        currentPage: this.myCurrentPage,
        pageSize: this.myPageSize,
      });
    },
    handleCurrentChange(val) {
      this.myCurrentPage = val;
      this.paginationChange();
    },
    handleSizeChange(val) {
      this.myPageSize = val;
      this.paginationChange();
    },
  },
};
</script>