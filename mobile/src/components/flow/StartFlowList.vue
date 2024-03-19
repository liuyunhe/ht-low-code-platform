<template>
  <div>
    <NavBar>
      <template slot="title">新建流程</template>
      <template slot="right">
        <van-icon name="search" @click="searchVisible=!searchVisible" style="font-weight: 900;" size="1.2rem"/>
      </template>
    </NavBar>
    <transition name="van-slide-right">
      <van-search placeholder="请输入名称或key..." v-model="searchValue" @change="onSearchChange" v-if="searchVisible" 
        show-action
        @input="onSearch"
        @cancel="onCancel"
      />
    </transition>
    <div class="roadWrapper">
      <div class="road">
        <van-pull-refresh v-model="isDownLoading" @refresh="onRefresh()">
          <van-list
            v-model="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
            :immediate-check="false"
            :offset="20"
          >
            <van-cell v-for="item in itemList" :key="item.id" @click="showItem(item)">
              <template slot="title">
                <div class="flow_list_title">
                  <van-icon name="cluster" size="2.5rem" color="#199cb5"/>
                </div>
                <div class="task_list_word" v-if="item.supportMobile == 1">
                  <div class="task_list_name"><strong>{{item.name}}</strong></div>
                  <div class="task_list_time">{{item.defKey}}</div>
                </div>
                <div class="task_list_word" v-if="item.supportMobile == 0">
                  <div class="task_list_name" style="color: rgb(150, 151, 153)"><strong>{{item.name}}</strong></div>
                  <div class="task_list_time" style="color: rgb(150, 151, 153)">{{item.defKey}}</div>
                </div>
              </template>
            </van-cell>
          </van-list>
        </van-pull-refresh>
      </div>
    </div>
    
    <el-dialog
      title="选择发起人"
      :visible.sync="showSelectStartor"
      width="90%"
      :before-close="handleSelectStartorClose">

        <el-select v-model="leaderId" class="selectStartor" size="medium">
            <el-option
                v-for="leader in leaders"
                :key="leader.id"
                :label="leader.name"
                :value="leader.id"
              ></el-option>
          </el-select>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handerStartor()">确 定</el-button>
        <el-button @click="showSelectStartor = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import flow from "@/api/flow.js";
import NavBar from "@/components/navBar/NavBar.vue";
import { Search, pullRefresh, List, Cell, Button, Icon,Dialog,Notify } from "vant";
export default {
  components: {
    NavBar,
    Notify,
    [Search.name]: Search,
    [pullRefresh.name]: pullRefresh,
    [List.name]: List,
    [Cell.name]: Cell,
    [Button.name]: Button,
    [Icon.name]: Icon,
    [Dialog.name]: Dialog,
  },
  data() {
    return {
      active: 0,
      searchValue: "",
      flag_scroll: false,
      loading: false,
      finished: false,
      isLoading: false,
      isDownLoading: false,
      page: 1,
      itemList: [],
      idsMap: {},
      showSelectStartor: false,
      leaders: [],
      leaderId: '',
      selectDefId: '',
      searchVisible:false
    };
  },
  created() {
    this.onRefresh();
  },
  methods: {
    onSearchChange(event) {
      this.onRefresh();
    },
    onSearch(event) {
      this.onRefresh();
    },
    onCancel(){
      this.searchValue = '';
      this.onRefresh();
    },
    //上拉加载
    //异步请求数据 ，我们的项目时封装好的方法，此处只是调用
    onLoad() {
      let params = {
        pageBean: {
          page: this.page,
          pageSize: this.pageSize,
          showTotal: true
        },
        querys: []
      };
      if (this.searchValue) {
        params.querys.push({
          property: "name_",
          value: this.searchValue,
          operation: "LIKE",
          relation: "OR",
          grou: "quickSearch"
        });
        params.querys.push({
          property: "def_key_",
          value: this.searchValue,
          operation: "LIKE",
          relation: "OR",
          grou: "quickSearch"
        });
      }
      let _self = this;
      flow
        .myMobileProcess(params)
        .then(response => {
          let rows = response.rows;
          _self.loading = false; //数据请成功后
          _self.isDownLoading = false; //数据请成功后
          _self.page++; //页码要增加1
          if (rows == null || rows.length === 0) {
            // 加载结束
            _self.finished = true;
            return;
          }

          // 将新数据与老数据进行合并
          _self.itemList = _self.itemList.concat(rows);
          //如果列表数据条数>=总条数，不再触发滚动加载
          if (_self.itemList.length >= response.total) {
            _self.finished = true;
          }
        })
        .catch(error => {})
        .finally(() => {
          _self.isDownLoading = false;
          _self.isUpLoading = false;
        });
    },
    onRefresh() {
      //下拉刷新
      this.finished = false;
      this.page = 1;
      this.itemList = [];
      this.loading = true;
      this.onLoad(); //正常的请求数据的方法，数组重新赋值
    },
    showItem(row) {
      if (row.supportMobile == 0){
        Notify({ type: 'danger', message: '手机端未配置表单' });
      }else if (!row.leaders || row.leaders.length==0) {
          this.$router.push("/work/agentStart/" + row.defId+"/0");
      }else{
         this.leaderId = '';
         this.leaders = [];
         let _this = this;
         this.selectDefId = row.defId;
         row.leaders.forEach(identity => {
            _this.leaders.push({id:identity.id,name:identity.name});
         });
         this.showSelectStartor = true;
      }
    },
    handleSelectStartorClose(){
      this.showSelectStartor = false;
      this.leaderId = '';
      this.selectDefId = '';
    },
    handerStartor(){
      if(!this.leaderId){
        Notify({ type: "danger" ,message: "请选择发起人" });
      }else{
        this.showSelectStartor = false;
        this.$router.push("/work/agentStart/" +this.selectDefId+"/"+this.leaderId);
      }
    },
  }
};
</script>
<style scoped>
::v-deep .van-pull-refresh__track{
  height: 100%;
  overflow-y:auto ;
}
.van-cell__title {
  width: 100%;
}
.van-search {
  padding: 5px 2px;
}
.flow_list_title {
  width: 35px;
  float: left;
  font-size: 12px;
  text-align: center;
  margin-top: 2px;
}
.flow_list_icon {
  display: block;
  width: 100%;
  height: 35px;
  background: url(../../assets/img/icon_4.png) no-repeat center top;
  background-size: 35px 35px;
}
.flow_list_word {
  padding-top: 3px;
  word-break: break-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.task_list {
  display: block;
  padding: 10px 15px 10px 0;
  border-bottom: 1px solid #e9e9e9;
}
.task_list_word {
  width: calc(100% - 60px);
  padding-left: 15px;
  float: left;
  min-height: 45px;
}
.task_list_name {
  width: 100%;
  font-size: 15px;
  color: #252525;
  word-break: break-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  line-height: 19px;
  margin: 0;
}
.selectStartor {
  width: 70%;
  margin-left: 10%;
}
</style>