<template>
  <div>
    <NavBar>
      <template slot="title">我的抄送</template>
      <template slot="right">
        <van-icon name="search" @click="searchVisible=!searchVisible" style="font-weight: 900;" size="1.2rem"/>
      </template>
    </NavBar>
    <transition name="van-slide-right">
      <van-search placeholder="请输入名称或标题..." v-model="searchValue" @change="onSearchChange" v-if="searchVisible" 
        show-action
        @input="onSearch"
        @cancel="onCancel"/>
    </transition>
    <van-tabs v-model="active" @change="onChangeTabs">
      <van-tab title="抄送">
        <div class="roadWrapper" v-if="status=='wait'">
          <div class="road">
            <van-pull-refresh v-model="isDownLoading" @refresh="onRefresh()">
              <van-list
                v-model="loading"
                :finished="finished"
                finished-text="没有更多了"
                @load="onLoad()"
                :immediate-check="false"
                :offset="20"
              >
                <van-cell v-for="item in itemList" :key="item.id" @click="showItem(item)">
                  <MyNoticeListItem :item="item" :status="status"></MyNoticeListItem>
                </van-cell>
              </van-list>
            </van-pull-refresh>
          </div>
        </div>
      </van-tab>

      <van-tab title="已阅">
        <div class="roadWrapper" v-if="status=='read'">
          <div class="road">
            <van-pull-refresh v-model="isDownLoading" @refresh="onRefresh()">
              <van-list
                v-model="loading"
                :finished="finished"
                finished-text="没有更多了"
                @load="onLoad()"
                :immediate-check="false"
                :offset="20"
              >
                <van-cell v-for="item in itemList" :key="item.id" @click="showItem(item)">
                  <MyNoticeListItem :item="item" :status="status"></MyNoticeListItem>
                </van-cell>
              </van-list>
            </van-pull-refresh>
          </div>
        </div>
      </van-tab>

      <van-tab title="我抄送的">
        <div class="roadWrapper" v-if="status=='mine'">
          <div class="road">
            <van-pull-refresh v-model="isDownLoading" @refresh="onRefresh()">
              <van-list
                v-model="loading"
                :finished="finished"
                finished-text="没有更多了"
                @load="onLoad()"
                :immediate-check="false"
                :offset="20"
              >
                <van-cell v-for="item in itemList" :key="item.id" @click="showItem(item)">
                  <div v-if="status=='mine' " class="notice_state">
                    <em class="notice_send"></em>
                    <p class="notice_send_word">我抄送的</p>
                  </div>
                  <div class="notice_list_word">
                    <div style="float: left;width: 100%;">
                      <div class="subject">
                        <strong>{{item.subject}}</strong>
                      </div>
                      <el-button
                        style="float: right;margin-right: 3px;"
                        v-if="item.isRevoke==0"
                        type="danger"
                        @click="delBpmTaskNoticeById(item)"
                        size="mini"
                      >撤回</el-button>
                    </div>
                    <p class="notice_list_name" v-if="item.isRead==0">
                      <van-tag type="danger">抄送</van-tag>-
                      <van-tag v-if="item.isRevoke==0" type="warning">未撤回</van-tag>
                      <van-tag v-if="item.isRevoke==1" type="primary">已撤回</van-tag>
                    </p>
                    <p class="notice_list_name" v-if="item.isRead==1">
                      <van-tag type="success">已阅</van-tag>-
                      <van-tag v-if="item.isRevoke==0" type="warning">未撤回</van-tag>
                      <van-tag v-if="item.isRevoke==1" type="primary">已撤回</van-tag>
                    </p>
                    <div class="notice_list_time">{{item.createTime}}</div>
                  </div>
                </van-cell>
              </van-list>
            </van-pull-refresh>
          </div>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import NavBar from "@/components/navBar/NavBar.vue";
const MyNoticeListItem = () => import("@/components/flow/MyNoticeListItem.vue");
import flow from "@/api/flow.js";
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
    [Icon.name]: Icon,
    MyNoticeListItem
  },
  data() {
    return {
      active: 2,
      status: "mine",
      searchValue: "",
      flag_scroll: false,
      loading: false,
      finished: false,
      isLoading: false,
      isDownLoading: false,
      noticeTyle: "getMyNoticeReadList",
      page: 1,
      itemList: [],
      isRetrieveBpmTask: false, //是否点击了撤回按钮
      searchVisible:false
    };
  },
  created() {
    this.onRefresh();
  },
  watch: {
    status: function(newVal, oldVal) {
      if (newVal != oldVal) {
        this.searchValue = "";
        this.onRefresh();
      }
    }
  },
  methods: {
    //根据ID主键ID删除抄送任务
    delBpmTaskNoticeById(row) {
      this.isRetrieveBpmTask = true;
      Dialog.confirm({
        title: "提示",
        message: "确认撤回此任务?"
      })
        .then(() => {
          this.$store
            .dispatch("storeProcess/delBpmTaskNoticeById", row.id)
            .then(() => {
              this.onRefresh();
              this.isRetrieveBpmTask = false;
            });
        })
        .catch(() => {
          this.isRetrieveBpmTask = false;
        });
    },
    onChangeTabs(event) {
      switch (this.active) {
        case 0:
          this.status = "wait";
          this.noticeTyle = "getNoticeTodoReadList";
          break;
        case 1:
          this.noticeTyle = "getNoticeDoneReadList";
          this.status = "read";
          break;
        case 2:
          this.noticeTyle = "getMyNoticeReadList";
          this.status = "mine";
          break;
        default:
          this.noticeTyle = "getNoticeTodoReadList";
          this.status = "wait";
          break;
      }
    },
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
      if (this.status == "read") {
        if (this.searchValue) {
          params.querys.push({
            property: "subject_",
            value: this.searchValue,
            operation: "LIKE",
            relation: "OR",
            group: "main1"
          });
          params.querys.push({
            property: "proc_def_name_",
            value: this.searchValue,
            operation: "LIKE",
            relation: "OR",
            group: "main1"
          });
        }
      } else {
        if (this.searchValue) {
          params.querys.push({
            property: "bpm_pro_inst.subject_",
            value: this.searchValue,
            operation: "LIKE",
            relation: "OR",
            group: "main1"
          });
          params.querys.push({
            property: "bpm_pro_inst.proc_def_name_",
            value: this.searchValue,
            operation: "LIKE",
            relation: "OR",
            group: "main1"
          });
        }
      }

      let _self = this;
      flow
        .getNoticesList(params, this.noticeTyle)
        .then(response => {
          let rows = response.rows;
          _self.loading = false; //数据请成功后
          _self.isDownLoading = false; //数据请成功后
          _self.page++; //页码要增加1
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
    loadData(response, _self) {},
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
    showItem(row) {
      if (!this.isRetrieveBpmTask) {
        if (this.status == "wait") {
              //沟通和跟踪任务
            if (row.status == "FOLLOW" || row.status == "COMMU") {
              let url = "/task/" + row.id + "/0";
              this.$router.push(url);
            }else{
                this.$router.push('/inst/' + row.procInstId + '/read/' + row.id);
            }
        } else if (this.status == "read") {
          //已阅
          this.$router.push("/inst/" + row.procInstId + "/read/done/" + row.id);
        } else if (this.status == "mine") {
          //我抄送的
          this.$router.push(
            "/myRead/" + row.procInstId + "/" + row.id + "/myReadType"
          );
        }
      }
    }
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
.van-search {
  padding: 5px 2px;
}
.notice_list {
  display: block;
  padding: 10px 15px 10px 0;
  border-bottom: 1px solid #e9e9e9;
}
.notice_list_word {
  width: calc(100% - 60px);
  padding-left: 10px;
  float: left;
  min-height: 54px;
}
.notice_list_name {
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
.notice_list_time {
  font-size: 12px;
  color: #a8a8a8;
  padding-top: 3px;
}
.notice_state {
  width: 48px;
  float: left;
  font-size: 12px;
  text-align: center;
  margin-top: 2px;
}
.notice_unread {
  display: block;
  width: 100%;
  height: 35px;
  background: url(../../assets/img/notice_wait.png) no-repeat center top;
  background-size: 35px 35px;
}
.notice_unread_word {
  color: #7ec311;
  padding-top: 3px;
  word-break: break-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0;
}
.notice_read {
  display: block;
  width: 100%;
  height: 35px;
  background: url(../../assets/img/notice_read.png) no-repeat center top;
  background-size: 35px 35px;
}
.notice_read_word {
  color: #c1c1c1;
  padding-top: 3px;
  word-break: break-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0;
}
.notice_send {
  display: block;
  width: 100%;
  height: 35px;
  background: url(../../assets/img/work_sendIcon.png) no-repeat center top;
  background-size: 35px 35px;
}
.notice_send_word {
  color: #5e8cca;
  padding-top: 3px;
  word-break: break-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0;
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
}
</style>