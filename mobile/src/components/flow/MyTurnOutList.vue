<template>
  <div>
    <NavBar>
      <template slot="title">转办</template>
      <template slot="right">
        <van-icon name="search" @click="searchVisible=!searchVisible" style="font-weight: 900;" size="1.2rem"/>
      </template>
    </NavBar>
    <transition name="van-slide-right">
      <van-search placeholder="请输入标题..." v-model="searchValue" @change="onSearchChange" v-if="searchVisible" 
        show-action
        @input="onSearch"
        @cancel="onCancel"/>
    </transition>
    <!-- <van-tabs v-model="active" @change="onChangeTabs">
      <van-tab title="代理">
        <div class="roadWrapper" v-if="status=='agent'">
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
                    <div v-if="item.status=='running'" class="task_state">
                      <em class="task_ongoing"></em>
                      <p class="task_ongoing_word">进行</p>
                    </div>
                    <div v-if="item.status=='finish' " class="task_state">
                      <em class="task_over"></em>
                      <p class="task_over_word">完成</p>
                    </div>
                    <div class="task_list_word">
                      <p class="task_list_name">{{item.taskSubject}}</p>
                      <p class="task_list_name">{{item.assigneeName}}-{{item.createTime}}</p>
                      <div class="task_list_time">节点：{{item.taskName}}</div>
                    </div>
                  </template>
                </van-cell>
              </van-list>
            </van-pull-refresh>
          </div>
        </div>
      </van-tab>
    <van-tab title="我转办的">-->
    <div class="roadWrapper" v-if="status=='turn' ">
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
                <div v-if="item.status=='running'" class="task_state">
                  <em class="task_ongoing"></em>
                  <p class="task_ongoing_word">运行中</p>
                </div>
                <div v-if="item.status=='finish' " class="task_state">
                  <em class="task_over"></em>
                  <p class="task_over_word">完成</p>
                </div>
                <div class="task_list_word">
                  <div style="float: left;width: 100%;">
                    <div class="subject">
                      <strong>{{item.taskSubject}}</strong>
                    </div>
                    <el-button
                      style="float: right;margin-right: 3px;"
                      v-if="!item.finishTime"
                      type="danger"
                      @click="delBpmTaskMyDelegateById(item)"
                      size="mini"
                    >收回</el-button>
                  </div>
                  <p class="task_list_name">{{item.assigneeName}}-{{item.createTime}}</p>
                  <div class="task_list_time">节点：{{item.taskName}}</div>
                </div>
              </template>
            </van-cell>
          </van-list>
        </van-pull-refresh>
      </div>
    </div>
    <!-- </van-tab>
    </van-tabs>-->
  </div>
</template>
<script>
import flow from "@/api/flow.js";
import NavBar from "@/components/navBar/NavBar.vue";
import { Tab, Tabs, Search, pullRefresh, List, Cell, Button, Icon } from "vant";
import { Notify } from "vant";
import { Dialog } from "vant";
export default {
  components: {
    NavBar,
    Notify,
    [Tabs.name]: Tabs,
    [Tab.name]: Tab,
    [Search.name]: Search,
    [pullRefresh.name]: pullRefresh,
    [List.name]: List,
    [Cell.name]: Cell,
    [Button.name]: Button,
    [Icon.name]: Icon
  },
  data() {
    return {
      active: 0,
      status: "turn",
      searchValue: "",
      flag_scroll: false,
      loading: false,
      finished: false,
      isLoading: false,
      isDownLoading: false,
      page: 1,
      itemList: [],
      idsMap: {},
      isRetrieveBpmTask:false,//是否点击了收回按钮
      searchVisible:false
    };
  },
  // mounted() {
  //   window.addEventListener('scroll', this.handleScroll, true)
  // },
  created() {
    this.isRetrieveBpmTask=false;
    this.onRefresh();
  },
  // watch: {
  //   status: function(newVal, oldVal) {
  //     if (newVal != oldVal) {
  //       this.searchValue = "";
  //       this.onRefresh();
  //     }
  //   }
  // },
  methods: {
    // onChangeTabs(event) {
    //   switch (this.active) {
    //     case 0:
    //       this.status = "agent";
    //       break;
    //     case 1:
    //       this.status = "turn";

    //       break;
    //     default:
    //       this.status = "agent";
    //       break;
    //   }
    // },
    onSearchChange(event) {
      this.onRefresh();
    },
    onSearch(event) {
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
      if (this.status == "agent") {
        params.querys.push({
          property: "turn_type_",
          value: "agent",
          operation: "EQUAL",
          relation: "AND"
        });
      } else {
        params.querys.push({
          property: "turn_type_",
          value: "turn",
          operation: "EQUAL",
          relation: "AND"
        });
      }
      if (this.searchValue) {
        params.querys.push({
          property: "subject_",
          value: this.searchValue,
          operation: "LIKE",
          relation: "AND",
          group: "quickSearch"
        });
      }
      let _self = this;
      flow
        .getMobileDelegate(params)
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
    onCancel(){
      this.searchValue = '';
      this.onRefresh();
    },
    //进入审批页面
    showItem(row) {
      if(!this.isRetrieveBpmTask){
        this.$router.push("/inst/" + row.procInstId);
      }
    },
    //根据任务ID收回转办任务
    delBpmTaskMyDelegateById(row) {
      this.isRetrieveBpmTask = true;
      Dialog.confirm({
        title: "提示",
        message: "确认收回此任务?"
      }).then(() => {
        this.$store
          .dispatch("storeProcess/retrieveBpmTask", row.taskId)
          .then(() => {
            this.onRefresh();
            this.isRetrieveBpmTask = false;
          });
      }).catch(() => {
        this.isRetrieveBpmTask = false;
      });
    }
  }
};
</script>
<style   scoped>
::v-deep .van-pull-refresh__track{
  height: 100%;
  overflow-y:auto ;
}
.van-cell__title {
  width: 100%;
}
.van-cell {
  padding-right: 0px !important;
  position: relative;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  box-sizing: border-box;
  width: 100%;
  padding: 10px 16px;
  overflow: hidden;
  color: #323233;
  font-size: 14px;
  line-height: 15px;
  background-color: #fff;
}
.van-search {
  padding: 5px 8px;
  background-color: #f5f5f5 !important;
}
.task_list {
  display: block;
  padding: 10px 15px 10px 0;
  border-bottom: 1px solid #e9e9e9;
}
.task_list_word {
  width: calc(100% - 46px);
  padding-left: 10px;
  float: left;
  min-height: 54px;
}
.subject {
  float: left;
  width: 75%;
  font-size: 15px;
  color: #252525;
  word-break: break-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  line-height: 19px;
  margin: 0;
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
.task_list_time {
  font-size: 12px;
  color: #a8a8a8;
  padding-top: 3px;
}
.task_state {
  width: 36px;
  float: left;
  font-size: 12px;
  text-align: center;
  margin-top: 2px;
}
.task_ongoing {
  display: block;
  width: 100%;
  height: 35px;
  background: url(../../assets/img/task_ongoing.png) no-repeat center top;
  background-size: 35px 35px;
}
.task_ongoing_word {
  color: #7ec311;
  padding-top: 3px;
  word-break: break-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0;
}
.task_over {
  display: block;
  width: 100%;
  height: 35px;
  background: url(../../assets/img/task_over.png) no-repeat center top;
  background-size: 35px 35px;
}
.task_over_word {
  color: #c1c1c1;
  padding-top: 3px;
  word-break: break-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0;
}
.task_withdraw {
  display: block;
  width: 100%;
  height: 35px;
  background: url(../../assets/img/task_withdraw.png) no-repeat center top;
  background-size: 35px 35px;
}
.task_withdraw_word {
  color: #f36060;
  padding-top: 3px;
  word-break: break-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0;
}
.task_draft {
  display: block;
  width: 100%;
  height: 35px;
  background: url(../../assets/img/task_draft.png) no-repeat center top;
  background-size: 35px 35px;
}
.task_draft_word {
  color: #5e8cca;
  padding-top: 3px;
  word-break: break-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0;
}
.task_undo {
  display: block;
  width: 100%;
  height: 35px;
  background: url(../../assets/img/task_undo.png) no-repeat center top;
  background-size: 35px 35px;
}
.task_undo_word {
  color: #a68d93;
  padding-top: 3px;
  word-break: break-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0;
}
</style>