<template>
  <el-container class="fullheight">
    <el-header height="48px">
      <el-row >
          <div class="top-left">
              <h3 class="title" style="line-height:20px">新闻/发文列表</h3>
          </div>
          <div class="top-right">
              <el-button @click="back" style="margin-top :8px;" plain size="small" type="danger" icon="el-icon-back">返回</el-button>
          </div>
      </el-row>
    </el-header>
    <el-main>
      <el-row>
        <el-col :span="24">
          <el-input
            size="medium"
            style="width:380px;"
            clearable
            placeholder="请输入关键词 主题/拟稿人"
            prefix-icon="el-icon-search"
            v-model="tableData"
            @keyup.enter.native="searchEnterFun"
          ></el-input>
          <span style="margin-left: 20px;margin-right:8px">发布时间</span>
        <el-date-picker
          v-model="date"
          type="datetimerange"
          align="right"
          size="medium"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']">
        </el-date-picker>

          <el-button style="margin-left: 20px" size="small" type="primary" icon="el-icon-search" @click="search('find')">查询</el-button>
          <el-button size="small" @click="reset"  icon="el-icon-refresh">重置</el-button>
        </el-col>
      </el-row>
      <!-- default-sort  排序 -->
      <el-table
        :data="rows"
        style="width: 100%"
        header-cell-class-name="todo-header-row"
        row-class-name="todo-row"
        size="medium"
        v-loading="fullscreenLoading"
        :default-sort="{prop: 'createTime', order: 'descending'}"
      >
        <el-table-column type="index" width="50" align="center" label="序号"></el-table-column>
        <el-table-column label="主题" show-overflow-tooltip>
          <template slot-scope="scope">
            <span class="news-subject" @click="openHomeNewsParticulars(scope.row.id)">{{scope.row.title}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="drafter" label="拟稿人" align="center" width="100"></el-table-column>
        <el-table-column label="开始时间" show-overflow-tooltip width="100">
          <template slot-scope="scope">
            <span>{{scope.row.createTime | dateformat('yyyy-MM-dd')}}</span>
          </template>
        </el-table-column>
        <el-table-column label="结束时间" show-overflow-tooltip width="100">
          <template slot-scope="scope">
            <span>{{scope.row.endTime | dateformat('yyyy-MM-dd')}}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-main>
    <el-footer height="45px">
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
    <homeNewsParticulars ref="homeNewsParticulars" :id="selectId"></homeNewsParticulars>
  </el-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import utils from "@/utils.js";
import homeNewsParticulars from "@/components/home/homeNewsParticulars.vue";
export default {
  name: "newsList",
  props: [ "type"],
  components:{homeNewsParticulars},
  data() {
    return {
        tableData:"",
        date: "",
        fullscreenLoading: true,
        selectId:null
    };
  },
  computed: mapState({
    rows: state => state.menu.rows,
    pagination: state => state.menu.pagination,
    total: state => state.menu.total
  }),
  methods: {
    //返回首页
    back(){
       this.$router.go(-1);
    },
    //Loading 加载中
    openFullScreen() {
        this.fullscreenLoading = true;
    },
    handleSizeChange: function (size) {//每页下拉显示数据
        this.$store.dispatch("menu/setPaginationSize",size);
        this.search();
    },
    handleCurrentChange: function(currentPage){//点击第几页
        this.$store.dispatch("menu/setPaginationPageNum",currentPage);
        this.search();
    },
    //回车查询
    searchEnterFun:function(e){
        var keyCode = window.event? e.keyCode:e.which;
        if(keyCode == 13){
            this.search("find");
        }
    },
    // 查询
    search(str) {
      this.openFullScreen();
      if(str=='find'){
        this.$store.dispatch("menu/setPaginationPageNum",1);
      }
      let querys = []; //查询条件
      let queryFilter = {};
      let pageBean = {"pageBean":this.pagination,"querys":[]};
      let beginDate="";//开始时间
      let endDate="";//结束时间
      let group="main";//判断条件
      let moment = require("moment");
      if (this.tableData == ""  &&  (this.date == "" || this.date ==null)) {
        if(this.type){
          let queryOB={"property":"classifyId","value":this.type,"group":"advance","relation":"AND","operation":"EQUAL"};
          querys.push(queryOB);
        }
        queryFilter = {"pageBean":this.pagination,"querys":querys,sorter:[{"property":"createTime","direction":"DESC"}]};
        this.$store.dispatch("menu/getNewsPaginationList",queryFilter).then(()=>{
          this.fullscreenLoading = false;
        });
      }else{
        if (this.tableData != ""  &&  (this.date != "" && this.date !=null)) {
          group="time";
        }
        if(this.date !=null && this.date !="" && this.tableData != ""){
          beginDate = moment(this.date[0].getTime()).format('YYYY-MM-DD HH:mm:ss');
          endDate = moment(this.date[1].getTime()).format('YYYY-MM-DD HH:mm:ss');
          querys = [{property: "title", value: this.tableData, group: "main", operation: "LIKE", relation: "OR"},
            {property: "drafter", value: this.tableData, group: "main", operation: "LIKE", relation:  "OR"},

            {property: "createTime", value: [beginDate,endDate], group: group,operation:"BETWEEN",relation: "AND"}];
        }else if(this.date !=null && this.date !=""){
          beginDate = moment(this.date[0].getTime()).format('YYYY-MM-DD HH:mm:ss');
          endDate = moment(this.date[1].getTime()).format('YYYY-MM-DD HH:mm:ss');
          querys = [{property: "createTime", value: [beginDate,endDate], group: group,operation:"BETWEEN",relation: "AND"}];
        }else{
          querys = [{property: "title", value: this.tableData, group: "main", operation: "LIKE", relation: "OR"},
            {property: "drafter", value: this.tableData, group: "main", operation: "LIKE", relation:  "OR"},
          ];
        }
        let queryOB={};
        if(this.type){
          queryOB={"property":"classifyId","value":this.type,"group":"advance","relation":"AND","operation":"EQUAL"};
          querys.push(queryOB);
        }
        queryFilter = {"pageBean":this.pagination,"querys":querys,sorter:[{"property":"createTime","direction":"DESC"}]};
        this.$store.dispatch("menu/getNewsPaginationList",queryFilter).then(()=>{
          this.fullscreenLoading = false;
        });
      }
    },
    //重置
    reset(){
        this.tableData ="";
        this.date ="";
        this.search("find");
    },
    handleRowClick(row) {
        this.$router.push("/news/" + row.id);
    },
    openHomeNewsParticulars(id){
      this.selectId = id;
      this.$refs.homeNewsParticulars.openDialog();
    }
  },
  created() {
    /*let pageBean = {"pageBean":{"page":"1","pageSize":"10","showTotal":"true"},"querys":[{property: "FSfxysp", value: this.type, group: "main", operation: "EQUAL", relation: "AND"}]}; //初次加载默认pageBean
    this.$store.dispatch("menu/getNewsPagination",pageBean).then(()=>{  //页面加载调用tudo.js里面的分页方法
          this.fullscreenLoading = false;
    }); */
    let query = [];
    if(this.type){
      query = [{
        property:'classifyId',
        value:this.type,
        group:'advance',
        relation:'AND',
        operation:'EQUAL'
      }];
    }
    let pageBean = {"pageBean":{"page":"1","pageSize":"10","showTotal":"true"},"querys":query,"sorter":[{"property":"createTime","direction":"DESC"}]};
    this.$store.dispatch("menu/getNewsPaginationList",pageBean).then(()=>{
      this.fullscreenLoading = false;
    })
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

.top-left{
    float: left;
    display :inline-block;
}
.top-right{
    float: right;
    display :inline-block;
}
</style>
