<template>
  <el-container>
    <el-container style="border-left:1px solid #E7EAEC">
      <el-main>
        <el-row>
          <el-col :span="6">
            <el-button type="primary" size="small" @click="operating('0','add')" icon="el-icon-plus" style="margin-left:0">{{$t('common.add')}}</el-button>
<!--            <el-button type="danger" size="small" @click="remove" icon="el-icon-delete" style="margin-left:3px;">删除</el-button>-->
            <eip-popconfirm-button
                type="danger"
                title="确定删除吗？"
                icon="el-icon-delete"
                @onConfirm="remove"
                style="margin-left:3px;">{{$t('common.delete')}}</eip-popconfirm-button>
          </el-col>
          <el-col :span="18">
            <el-input
                size="small"
                style="width:380px"
                clearable
                placeholder="代理人，被代理人"
                prefix-icon="el-icon-search"
                v-model="tableData"
            ></el-input>
            <el-button style="margin-left: 20px" size="small" type="primary" icon="el-icon-search" @click="search('find')">查询</el-button>
            <el-button size="small" icon="el-icon-refresh" @click="reset">重置</el-button>
          </el-col>
        </el-row>
        <el-table
            :data="rows"
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
<!--          <el-table-column prop="userName"  label="被代理人"  align="center" ></el-table-column>-->
          <el-table-column prop="agentName"  label="代理人"  align="center" ></el-table-column>
          <el-table-column   label="是否启用"  align="center" >
            <template slot-scope="scope">
              <el-tag size="small"  type="success" v-if="scope.row.isUsable===1">启用</el-tag>
              <el-tag size="small" type="danger" v-if="scope.row.isUsable===0">禁用</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop=""  label="操作" align="center" width="200">
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
      rows: state => state.deputy.rows,
      pagination: state => state.deputy.pagination,
      total: state => state.deputy.total
    }),
    methods: {
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
          this.$store.dispatch("deputy/remove",ids.join(",")).then((res)=>{
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
      // 查询
      search(str) {
        this.openFullScreen();
        if(str=='find'){
          this.$store.dispatch("deputy/setPaginationPageNum",1);
        }
        let querys = []; //查询条件
        let queryFilter = {};
        let pageBean = {"pageBean":this.pagination};
        if (this.tableData == "") {
          this.$store.dispatch("deputy/getBpmDeputyList",pageBean).then(()=>{
            this.fullscreenLoading = false;
          });
        }else{
          querys = [{property: "user_name_", value: this.tableData, group: "main", operation: "LIKE", relation: "OR"}];
          querys.push({property: "agent_name_", value: this.tableData, group: "main", operation: "LIKE", relation: "OR"});
          queryFilter = {"pageBean":this.pagination,querys};
          this.$store.dispatch("deputy/getBpmDeputyList",queryFilter).then(()=>{
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
          this.$router.push("/bpmDeputy/bpmDeputySetting");
        }
        else if(action == "edit"){
          this.$router.push("/bpmDeputy/bpmDeputySetting/" + id);
        }
      },
      handleSizeChange: function (size) {//每页下拉显示数据
        this.$store.dispatch("deputy/setPaginationSize",size);
        this.search();
      },
      handleCurrentChange: function(currentPage){//点击第几页
        this.$store.dispatch("deputy/setPaginationPageNum",currentPage);
        this.search();
      },
    },
    created() {
      let pagination={pageBean:{"page":1,"pageSize":10,"showTotal":true}};
      this.$store.dispatch("deputy/getBpmDeputyList",pagination).then(()=>{
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

  .el-row {
    margin-bottom: 20px;
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

