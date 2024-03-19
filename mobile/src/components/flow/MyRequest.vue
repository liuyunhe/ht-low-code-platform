<template>
  <div>
    <NavBar>
      <template slot="title">我的请求</template>
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
      <van-tab title="全部">
        <div class="roadWrapper" v-if="status=='all'">
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
                  <MyRequestListItem :item="item"></MyRequestListItem>
                </van-cell>
              </van-list>
            </van-pull-refresh>
          </div>
        </div>
      </van-tab>

      <van-tab title="运行中">
        <div class="roadWrapper" v-if="status=='running'">
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
                  <MyRequestListItem :item="item"></MyRequestListItem>
                </van-cell>
              </van-list>
            </van-pull-refresh>
          </div>
        </div>
      </van-tab>

      <van-tab title="结束">
        <div class="roadWrapper" v-if="status=='end'">
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
                  <MyRequestListItem :item="item"></MyRequestListItem>
                </van-cell>
              </van-list>
            </van-pull-refresh>
          </div>
        </div>
      </van-tab>

      <van-tab title="草稿">
        <div class="roadWrapper" v-if="status=='draft'">
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
                  <MyRequestListItem :item="item"></MyRequestListItem>
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
import flow from "@/api/flow.js";
import NavBar from "@/components/navBar/NavBar.vue";
import MyRequestListItem from "@/components/flow/MyRequestListItem.vue";
import { Tab, Tabs, Search, pullRefresh, List, Cell, Button, Icon } from "vant";
import { Notify } from "vant";
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
    MyRequestListItem
  },
  data() {
    return {
      active: 0,
      status: "all",
      searchValue: "",
      flag_scroll: false,
      loading: false,
      finished: false,
      isLoading: false,
      isDownLoading: false,
      page: 1,
      itemList: [],
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
    onChangeTabs(event) {
      switch (this.active) {
        case 0:
          this.status = "all";
          break;
        case 1:
          this.status = "running";
          break;
        case 2:
          this.status = "end";
          break;
        case 3:
          this.status = "draft";
          break;
        default:
          this.status = "all";
          break;
      }
    },
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
      if (this.status != "all") {
        params.querys.push({
          property: "status_",
          value: this.status,
          operation: "EQUAL",
          relation: "AND"
        });
      } else {
        params.querys = [];
      }
      if (this.searchValue) {
        params.querys.push({
          property: "subject_",
          value: this.searchValue,
          operation: "LIKE",
          relation: "OR",
          group: "quickSearch"
        });
        params.querys.push({
          property: "proc_def_name_",
          value: this.searchValue,
          operation: "LIKE",
          relation: "OR",
          group: "quickSearch"
        });
      }
      let _this = this;
      if (this.status == "draft") {
        flow
          .myMobileDraft(params)
          .then(res => {
            _this.loadData(res, _this);
          })
          .catch(error => {})
          .finally(() => {
            _this.isDownLoading = false;
            _this.isUpLoading = false;
          });
      } else {
        flow
          .myMobileRequest(params)
          .then(res => {
            _this.loadData(res, _this);
          })
          .catch(error => {})
          .finally(() => {
            _this.isDownLoading = false;
            _this.isUpLoading = false;
          });
      }
    },
    loadData(response, _self) {
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
    },
    onRefresh() {
      //下拉刷新
      this.finished = false;
      this.page = 1;
      this.itemList = [];
      this.loading = true;
      this.onLoad(); //正常的请求数据的方法，数组重新赋值
    },
    showItem(item) {
      if (item.status == "draft") {
        this.$router.push("/work/startFlow/" + item.procDefId + "/" + item.id);
      } else {
        this.$router.push("/inst/" + item.id + "/request");
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
.van-search {
  padding: 5px 2px;
}
</style>