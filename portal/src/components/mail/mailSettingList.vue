<template>
<el-container class="fullheight">
    <h3 class="flow_table_title">邮件配置管理列表</h3>
  <el-row class="mail-setting-list__row">
			<el-button type="primary" size="small" icon="el-icon-plus" @click="operating('0','add')">新增</el-button>
			<el-button @click="deleted" type="danger" size="small" icon="el-icon-delete" style="margin-left:10px" :disabled="multipleSelection.length < 1">删除</el-button>
          <el-input
            size="small"
            style="width:380px"
            clearable
            placeholder="请输入关键词 用户名称/邮箱地址"
            prefix-icon="el-icon-search"
            v-model="tableData"
            class="search-input"
            @keyup.enter.native="searchEnterFun"
          >
            <el-button slot="append" icon="el-icon-search" @click="search('find')"></el-button>
          </el-input>
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
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column prop="nickName" align="center" label="用户名称" sortable>
          <template slot-scope="scope">
            <span class="todo-subject" @click="operating(scope.row.id,'get')">{{scope.row.nickName}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="mailAddress" align="center" label="邮箱地址" sortable></el-table-column>
		<el-table-column
      	fixed="right"
      	label="操作"
      	width="300"
        align="left">
      	<template slot-scope="scope">
          <el-button @click="setDefault(scope.row.id)" size="small" v-if="scope.row.isDefault==0" icon="el-icon-info" plain>设为默认</el-button>
        	<el-button @click="operating(scope.row.id,'edit')" size="small" icon="el-icon-edit" plain>修改</el-button>
			    <el-button @click="testConnect(scope.row.id)" size="small" icon="el-icon-setting" plain>测试</el-button>
      	</template>
    	</el-table-column>
      </el-table>
    </el-main>
    <el-footer height="45px">
      <el-row type="flex" justify="end">
        <el-pagination
      	@size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.page"
      	:page-sizes="[10, 20, 50, 100]"
      	:page-size="pagination.pageSize"
      	layout="total, sizes, prev, pager, next, jumper"
      	:total="total">
    	</el-pagination>
      </el-row>
    </el-footer>
  </el-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { Message } from 'element-ui';

export default {
	name: "mailSetting",
	data(){
		return {
      tableData:"",
      fullscreenLoading: true,
      multipleSelection: []
		}
  },
  computed: mapState({
    rows: state => state.mail.mailSettingRows,
    pagination: state => state.mail.mailSettingPagination,
    total: state => state.mail.mailSettingTotal
  }),
	methods: {
     //回车查询
    searchEnterFun: function(e) {
      var keyCode = window.event ? e.keyCode : e.which
      if (keyCode == 13) {
        this.search('find')
      }
    },
        rowClick(row, column, event){
            this.$refs.htTable.toggleRowSelection(row);
        },
    //Loading 加载中
    openFullScreen() {
      this.fullscreenLoading = true;
    },
    handleSizeChange: function (size) {//每页下拉显示数据
          this.$store.dispatch("mail/setMailSettingPaginationSize",size);
          this.search();
    },
    handleCurrentChange: function(currentPage){//点击第几页
          this.$store.dispatch("mail/setMailSettingPaginationPageNum",currentPage);
          this.search();
    },
    search(str) {
      this.openFullScreen();
      if(str=='find'){
          this.$store.dispatch("mail/setMailSettingPaginationPageNum",1);
        }
        let querys = []; //查询条件
        let queryFilter = {};
        let pageBean = {"pageBean":this.pagination};
        if (this.tableData == "") {
          this.$store.dispatch("mail/getMailSettingByPagination",pageBean).then(()=>{
            this.fullscreenLoading = false;
          });
        }else if(this.tableData != "") {
          querys=[
            { property: "nickName", value: this.tableData, group: "main", operation: "LIKE", relation: "OR"},
            { property: "mailAddress", value: this.tableData, group: "main", operation: "LIKE", relation: "OR"}
          ];
          queryFilter = {"pageBean":this.pagination,querys};
          this.$store.dispatch("mail/getMailSettingByPagination",queryFilter).then(()=>{
              this.fullscreenLoading = false;
            });
        }
    },
    reset() {
      this.tableData="";
      this.search();
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    deleted() {
      if(this.multipleSelection==null || this.multipleSelection.length==0){
        this.$message.warning("请选择邮箱删除!");
        return false;
      }
      this.$confirm('此操作将删除该配置, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$store.dispatch("mail/deleteMaliSettingById",this.multipleSelection).then(()=>{
            this.search();
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
    },
	  operating(id,action) {
      if (action == "edit") {
        this.$router.push("/mail/settingEdit/" + id);
      }
      else if(action == "add"){
        this.$router.push("/mail/settingAdd");
      }
      else{
        this.$router.push("/mail/settingGet/" + id);
      }
    },
    setDefault(id) {
      this.$store.dispatch("mail/setMailSettingDefaultById", id).then(()=>{
        this.search();
      });

    },
    testConnect(id) {
      Message.info("测试连接可能需要点时间,请耐心等候下。");
      this.$store.dispatch("mail/testMailConnectById",id).then(()=>{
        this.search();
      });

    }

  },
  created() {
    let pageBean = {"pageBean":{"page":"1","pageSize":"10","showTotal":"true"}}; //初次加载默认pageBean
    this.$store.dispatch("mail/getMailSettingByPagination",pageBean).then(()=>{
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
.mail-setting-list__row{
  margin: 10px 0 0 20px;
  .search-input{
    margin-left: 10px;
  }
}
.el-table /deep/ tr.todo-row {
  font-size: 13px;
  color: $--color-text-regular;
}

.el-container {
  background-color: #fff;
}

.el-header {
  border-bottom: 1.5px solid #ededed;
}
.i{
  margin-right:4px;
}
.todo-subject {
  cursor: pointer;
}

.todo-subject {
  color: $--theme-color;
}
</style>
