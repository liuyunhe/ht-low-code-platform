<template>
	<el-container class="fullheight">
  <el-container style="border-left:1px solid #E7EAEC">
    <h3 class="flow_table_title">秘书管理列表</h3>
    <el-row class="secretary-list__row">
          <el-button type="primary" size="small" @click="operating('0','add')" icon="el-icon-plus" style="margin-left:0">{{$t('common.add')}}</el-button>
<!--          <el-button type="danger" size="small" @click="remove" icon="el-icon-delete" style="margin-left:3px;">删除</el-button>-->
          <eip-popconfirm-button
              type="danger"
              title="确定删除吗？"
              icon="el-icon-delete"
              @onConfirm="remove"
              :disabled="checkBoxData.length < 1"
              style="margin-left:10px;">{{$t('common.delete')}}</eip-popconfirm-button>
          <el-input
            size="small"
            style="width:380px;margin-left:10px"
            clearable
            placeholder="根据秘书姓名，定义/分类名称快速查询"
            prefix-icon="el-icon-search"
             v-model="tableData"
             @keyup.enter.native="searchEnterFun"
          ></el-input>
          <el-button style="margin-left: 10px" size="small" type="primary" icon="el-icon-search" @click="search('find')">查询</el-button>
          <el-button size="small" icon="el-icon-refresh" @click="reset">重置</el-button>
      </el-row>
    <el-main>
      <el-table
        :data="rows"
        ref="htTable"
        @row-click="rowClick"
        stripe
        border
        style="width: 100%"
        header-cell-class-name="todo-header-row"
        row-class-name="todo-row"
        size="medium"
        v-loading="fullscreenLoading"
        @selection-change="handleChecked"
      >
        <el-table-column type="selection"   sortable width="50"></el-table-column>
        <el-table-column type="index" sortable width="50" label="序号"></el-table-column>
        <el-table-column width="250px" prop="secretaryName"  label="秘书姓名"  align="center" ></el-table-column>
        <el-table-column  width="120px"  label="共享类型"  align="center" >
          <template slot-scope="scope">
            <el-tag size="small"  type="success" v-if="scope.row.shareType=='1'">定义</el-tag>
            <el-tag size="small" type="danger" v-if="scope.row.shareType=='2'">分类</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="shareName"  label="定义/分类名称"  align="center" ></el-table-column>
        <el-table-column prop="enabled"  label="是否启用"  align="center" >
          <template slot-scope="scope">
            <el-tag size="small"  type="success" v-if="scope.row.enabled=='1'">启用</el-tag>
            <el-tag size="small" type="danger" v-if="scope.row.enabled=='0'">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column  prop=""  label="操作" align="center" width="120">
          <template slot-scope="scope">
            <el-button @click="operating(scope.row.id,'edit')" size="small" icon="el-icon-edit" plain>修改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-main>
    <el-footer height="45px">
      <el-row type="flex" justify="end">
        <el-pagination @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      :current-page="pagination.page"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="10"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
      </el-row>
    </el-footer>
    </el-container>
  </el-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import EipPopconfirmButton from "@/components/eipControl/EipPopconfirmButton";

export default {
	name:"agentList",
  components:{
	  EipPopconfirmButton
  },
	data(){
		return {
      tableData:"",
      fullscreenLoading: true,
      checkBoxData: [],
		};
  },
  computed: mapState({
    rows: state => state.agent.rows,
    pagination: state => state.agent.pagination,
    total: state => state.agent.total
  }),
	methods: {
      rowClick(row, column, event){
        this.$refs.htTable.toggleRowSelection(row);
      },
    remove(){
      var ids=[];
      if(this.checkBoxData && this.checkBoxData.length>0){
        for (let index = 0; index < this.checkBoxData.length; index++) {
         ids.push(this.checkBoxData[index].id);
        }
      }
      //数组去重
       //this.checkBoxData = Array.from(new Set(this.checkBoxData));
      if(ids.length > 0){
        this.$store.dispatch("agent/secretaryRemove",ids).then((res)=>{
                     this.search();
                });
      }else{
        this.$message({
          message: '请选择要删除的数据',
          type: 'warning'
        });
      }
    },
    handleChecked(value){
       this.checkBoxData = value;
    }
    ,
    //Loading 加载中
    openFullScreen() {
      this.fullscreenLoading = true;
    },
     //回车查询
    searchEnterFun: function(e) {
      var keyCode = window.event ? e.keyCode : e.which
      if (keyCode == 13) {
        this.search('find')
      }
    },
    // 查询
    search(str) {
        this.openFullScreen();
        if(str=='find'){
          this.$store.dispatch("agent/setPaginationPageNum",1);
        }
        let querys = []; //查询条件
        let queryFilter = {};
        let pageBean = {"pageBean":this.pagination};
        if (this.tableData == "") {
              this.$store.dispatch("agent/getSecretarylist",pageBean).then(()=>{
                  this.fullscreenLoading = false;
              });
        }else{
              querys = [{property: "secretary_Name_", value: this.tableData, group: "ssmain", operation: "LIKE", relation: "OR"},
                        {property: "share_Name_", value: this.tableData, group: "ssmain", operation: "LIKE", relation: "OR"}];
              queryFilter = {"pageBean":this.pagination,querys};
              this.$store.dispatch("agent/getSecretarylist",queryFilter).then(()=>{
                    this.fullscreenLoading = false;
              });
        }
    },
    //重置
    reset(){
        this.tableData ="";
        this.search("find");
    },
		operating(id,action) {
      var title = action == "edit" ? "编辑委托" : action == "add" ? "添加委托" : "查看委托";
      if (action == "add") {
        this.$router.push("/secretary/secretaryEdit/0");
      }
      else if(action == "edit"){
       this.$router.push("/secretary/secretaryEdit/" + id);
      }
      else{
        this.$router.push("/agent/agentGet/" + id);
      }
    },
    handleSizeChange: function (size) {//每页下拉显示数据
          this.$store.dispatch("agent/setPaginationSize",size);
          this.search();
    },
    handleCurrentChange: function(currentPage){//点击第几页
          this.$store.dispatch("agent/setPaginationPageNum",currentPage);
          this.search();
    },
  },
  created() {
    let pagination={pageBean:{"page":1,"pageSize":10,"showTotal":true}};
    this.$store.dispatch("agent/getSecretarylist",pagination).then(()=>{
        this.fullscreenLoading = false;
    });
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
.el-table /deep/ th.todo-header-row {
  background-color: #fafafa;
  font-size: 13px;
}

.el-table /deep/ tr.todo-row {
  font-size: 13px;
  color: $--color-text-regular;
}

.el-container {
  background-color: #fff;
}

.secretary-list__row {
  margin: 10px 0 0 20px;
}

.el-header {
  border-bottom: 1.5px solid #ededed;
}

.todo-subject {
  cursor: pointer;
}

.todo-subject {
  color: $--theme-color;
}
.el-dropdown {
    vertical-align: top;
  }
  .el-dropdown + .el-dropdown {
    margin-left: 15px;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }
</style>
