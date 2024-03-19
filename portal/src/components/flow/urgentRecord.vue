<template>
<div class="bpm-btn-dialog">
  <el-dialog
    title="催办记录"
    :visible.sync="urgentRecordDialog"
    :close-on-click-modal="false"
  >
    <el-table
        :data="rows"
        style="width: 100%"
        border
        header-cell-class-name="todo-header-row"
        row-class-name="todo-row"
        size="medium"
        :default-sort="{prop: 'urgrntDate', order: 'descending'}"
      >
        <el-table-column prop="instId" width="90" label="流程编号" align="center"></el-table-column>
        <el-table-column prop="subject" show-overflow-tooltip  width="150" label="流程标题" align="center"></el-table-column>
        <el-table-column prop="nodeName" show-overflow-tooltip  width="100" label="任务名称" align="center"></el-table-column>
        
        <el-table-column prop="content" show-overflow-tooltip  label="催办内容" align="center"></el-table-column>
        <el-table-column prop="urgrntDate" width="150"  label="催办日期" align="center"></el-table-column>
        <el-table-column prop="appointee" show-overflow-tooltip width="120" label="被催办人" align="center"></el-table-column>
        <el-table-column prop="promoter" show-overflow-tooltip width="90" label="催办人" align="center"></el-table-column>
        
        <el-table-column width="80" align="center" label="催办类型">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.type=='mail'" size="small">邮件</el-tag>
              <el-tag v-if="scope.row.type=='sms'" size="small">短信</el-tag>
              <el-tag v-if="scope.row.type=='smsApproval'" size="small">短信审批</el-tag>
            </template>
        </el-table-column>
      </el-table>
      <el-footer style="padding-top:10px;" height="45px">
        <el-row type="flex" justify="end">
          <el-pagination @size-change="handleSizeChange"
                              @current-change="handleCurrentChange"
                              :current-page="pagination.page"
                              :page-sizes="[10, 20, 50, 100]"
                              :page-size="pagination.pageSize"
                              layout="total, sizes, prev, pager, next, jumper"
                              :total="total"></el-pagination>
        </el-row>
      </el-footer>
  </el-dialog>
</div>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  name: "urgentRecord",
  props: ["promoterId","instId"],
  components: {},
  data() {
    return {
        urgentRecordDialog:false
    };
  },
  computed: mapState({
    rows: state => state.storeProcess.rows,
    pagination: state => state.storeProcess.pagination,
    total: state => state.storeProcess.total
  }),
  methods: {
    //鼠标点击页面其他其他位置不关闭弹框
    handleClose(done) {
        this.urgentRecordDialog = true;
        this.search();
    },
    handleSizeChange: function (size) {//每页下拉显示数据
          this.$store.dispatch("storeProcess/setPaginationSize",size);
          this.search();
    },
    handleCurrentChange: function(currentPage){//点击第几页
          this.$store.dispatch("storeProcess/setPaginationPageNum",currentPage);
          this.search();
    },
    search(){
      let pageBean = {"pageBean":this.pagination,"querys":[{property: "PROMOTER_ID_", value: this.promoterId, operation: "EQUAL", relation: "AND"},
      {property: "INST_ID_", value: this.instId, operation: "EQUAL", relation: "AND"}]};    
      this.$store.dispatch("storeProcess/getUrgrntById",pageBean);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
/deep/el-table th.todo-header-row {
  background-color: #fafafa;
  font-size: 13px;
}

/deep/.el-table tr.todo-row {
  font-size: 13px;
}

/deep/.el-container {
  background-color: #fff;
  }

/deep/.el-row {
  margin-bottom: 20px;
}

/deep/.el-header {
  border-bottom: 1.5px solid #ededed;
}

.top-title {
  line-height:58px;
  margin-left:20px;
  font-size :16px;
  color: #a2a2a2;
}
/deep/.el-tree {
    position: relative;
    cursor: default;
    background: #FFF;
    color: $--color-text-primary;
    font-size :13px;
}
/deep/.el-dialog__body {
    padding: 10px 20px;
    color: $--color-text-regular;
    font-size: 14px;
}
</style>