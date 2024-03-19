<template>
<div class="bpm-btn-dialog">
  <el-dialog
    title="相关信息"
    :visible.sync="relatedInformationDialog"
    :close-on-click-modal="false"
  >
    <table cellspacing="0" cellpadding="0" border="0" class="form-table">
      <tbody>
        <tr c>
          <td class="recordInformation">标题：</td>
          <td class="overstriking" colspan="3">{{relatedInformation.subject}}</td>
        </tr>
        <tr>
          <td class="recordInformation">申请人：</td>
          <td class="overstriking">{{relatedInformation.name}}</td>
          <td class="recordInformation">所属组织：</td>
          <td class="overstriking">{{relatedInformation.deptName}}</td>
        </tr>
        <tr>
          <td class="recordInformation">流程编号：</td>
          <td class="overstriking">{{instId}}</td>
          <td class="recordInformation">审批模板：</td>
          <td class="overstriking">{{relatedInformation.template}}</td>
        </tr>
      </tbody>
    </table>
    <div>
    <div class="record-container">
      <span>阅读记录</span>
      <el-checkbox v-model="checked" style="float :right;" @change="isChecked(checked)">隐藏重复信息</el-checkbox>
    </div>
    <div class="record-content">
    <el-table
        :data="rows"
        style="width: 100%"
        border
        header-cell-class-name="todo-header-row"
        row-class-name="todo-row"
        size="medium"
        :default-sort="{prop: 'createTime', order: 'descending'}"
      >
        <el-table-column type="index" width="60" align="center" label="序号"></el-table-column>
        <el-table-column prop="taskName" label="任务名称" align="center"></el-table-column>
        <el-table-column prop="readerName" label="阅读人" align="center"></el-table-column>
        <el-table-column prop="readTime" label="阅读时间" align="center"></el-table-column>
        <el-table-column prop="orgPath" label="所属组织" align="center"></el-table-column>
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
    </div>
  </div>
  </el-dialog>
</div>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  name: "relatedInformation",
  props: ["instId"],
  components: {},
  data() {
    return {
        relatedInformationDialog:false,
        checked:true
    };
  },
  computed: mapState({
    rows: state => state.storeProcess.rows,
    pagination: state => state.storeProcess.pagination,
    total: state => state.storeProcess.total,
    relatedInformation: state => state.storeProcess.relatedInformation
  }),
  methods: {
    isChecked(checked){
        let pageBean ={};
        this.checked=checked;
        if(checked){
             pageBean = {"pageBean":{"page":"1","pageSize":"10","showTotal":"true"}, "params":{"distinct": "1"},
             "querys":[{property: "procInstId", value: this.instId, operation: "EQUAL", relation: "AND"}]};
           
        }else{
              pageBean = {"pageBean":{"page":"1","pageSize":"10","showTotal":"true"},"querys":[{property: "procInstId", value: this.instId, operation: "EQUAL", relation: "AND"}]};
        }
         this.$store.dispatch("storeProcess/getByRecordInstId",pageBean);
    },
    //鼠标点击页面其他其他位置不关闭弹框
    handleClose(done) {
        this.relatedInformationDialog = true;
        this.$store.dispatch("storeProcess/getRelatedInformationById", this.instId);
        let pageBean = {"pageBean":{"page":"1","pageSize":"10","showTotal":"true"},
            "params":{"distinct": "1"},"querys":[{property: "procInstId", value: this.instId, operation: "EQUAL", relation: "AND"}]}; //初次加载默认pageBean
        this.$store.dispatch("storeProcess/getByRecordInstId",pageBean);
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
      let pageBean ={};
      if(this.checked){
        pageBean = {"pageBean":this.pagination,
            "params":{"distinct": "1"},"querys":[{property: "procInstId", value: this.instId, operation: "EQUAL", relation: "AND"}]};    
      }else{
        pageBean = {"pageBean":this.pagination,"querys":[{property: "procInstId", value: this.instId, operation: "EQUAL", relation: "AND"}]};    
      }
      this.$store.dispatch("storeProcess/getByRecordInstId",pageBean);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
.record-container {
  border-bottom: 1px solid #ebeef5;
  padding: 20px 0 10px;
}

.record-container > span {
  border-left: 3px solid $--theme-color;
  font-weight: bold;
  font-size: 14px;
  padding-left: 10px;
  color: #666;
}

.record-content {
  padding: 20px 0;
}
.form-table {
  width: 100%;
  border-top: 1px solid #ebeef5;
  border-left: 1px solid #ebeef5;
}

.form-table th {
  text-align: right;
  color: #666;
}

.form-table th > span {
  color: #f00;
}

.form-table th, .form-table td {
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  padding: 10px;
  min-width: 0;
  box-sizing: border-box;
  text-overflow: ellipsis;
  vertical-align: middle;
  position: relative;
}
.recordInformation{
    text-align: right;
    width: 15%;
}
.overstriking{
	font-weight: 700;
  
}
</style>