<template>
  <div class="tab-bar">
    <NavBar>
      <template slot="title">我的提醒</template>
      <template slot="right">
        <!-- <van-icon
          name="search"
          @click="searchVisible = !searchVisible"
          style="font-weight: 900"
          size="1.2rem"
        /> -->
      </template>
    </NavBar>
    <van-search
      placeholder="请输入标题或内容..."
      v-model="searchValue"
      show-action
      @change="onSearchChange"
      @input="onSearch"
      @search="onSearch"
      @cancel="onCancel"
      action-text="重置"
      style="padding-left: 10px"
    />
    <van-pull-refresh v-model="isDownLoading" @refresh="onRefresh()">
      <van-list
        ref="vanList"
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
        :immediate-check="false"
        :offset="20"
      >
        <div class="remind_class">
          <van-cell v-for="item in itemList" :key="item.id" class="remind_item">
            <template slot="title">
              <div class="flow_list_title" @click="remindDetail(item)">
                <i
                  :class="[item.receiveTime ? 'icon-read1' : 'icon-youjian']"
                  style="
                    float: left;
                    font-size: 18px;
                    color: #1989fa;
                    padding-top: 2px;
                  "
                ></i>
              </div>
              <div class="task_list_word" @click="remindDetail(item)">
                <div class="task_list_name">{{ item.subject }}</div>
                <div class="task_list_time" v-html="item.content">
                  {{ item.content }}
                </div>
              </div>
              <div class="remind_del" @click="hiddRdmind(item)"></div>
              <div class="no_more_remind" @click="remindNoMore(item)">
                不再提醒
              </div>
            </template>
          </van-cell>
        </div>
      </van-list>
      <!-- <tabBar ref="tabBar" :activeIndex="1"></tabBar> -->
    </van-pull-refresh>
  </div>
</template>
<script>
var $ = require('jquery')
import portal from '@/api/portal.js'
import {Search, PullRefresh, List, Notify, Dialog} from 'vant'
const tabBar = () => import('@/components/tabbar/TabBar.vue')
import NavBar from '@/components/navBar/NavBar.vue'
export default {
  components: {
    Dialog,
    Notify,
    tabBar,
    [Search.name]: Search,
    [PullRefresh.name]: PullRefresh,
    [List.name]: List,
    NavBar,
  },
  data() {
    return {
      searchValue: '',
      loading: false,
      finished: false,
      isLoading: false,
      isDownLoading: false,
      page: 1,
      itemList: [],
    }
  },
  created() {
    // this.onRefresh()
    this.getRemindList()
  },
  methods: {
    getRemindList() {
      let _self = this
      _self.itemList = []
      _self.isLoading = true
      this.$store
        .dispatch('form/getFormRemindDataByUser')
        .then((response) => {
          let rows = response
          _self.loading = false //数据请成功后
          _self.isDownLoading = false //数据请成功后
          _self.page++ //页码要增加1
          if (rows == null || rows.length === 0) {
            // 加载结束
            _self.finished = true
            return
          }

          // 将新数据与老数据进行合并
          //   _self.itemList = _self.itemList.concat(rows)
          //如果列表数据条数>=总条数，不再触发滚动加载
          //   if (_self.itemList.length >= response.total) {
          //     _self.finished = true
          //   }
          _self.itemList = rows
          _self.finished = true
        })
        .catch((error) => {})
        .finally(() => {
          _self.isDownLoading = false
          _self.isUpLoading = false
        })
    },
    // 不再提醒
    remindNoMore(item) {
      let _this = this
      var itemId = item.id
      this.$store.dispatch('form/deleteFormRemindDataById', itemId).then(() => {
        _this.getRemindList()
      })
    },
    //不显示提醒信息
    hiddRdmind(item) {
      var remindId = item.id
      for (var i = 0; i < this.itemList.length; i++) {
        if (remindId == this.itemList[i].id) {
          this.itemList.splice(i, 1)
        }
      }
    },
    onSearchChange(event) {
      this.onRefresh()
    },
    onSearch(event) {
      if (event !== '') {
        var search_List = []
        for (var i = 0; i < this.itemList.length; i++) {
          var itemTitle = this.itemList[i].subject
          var itemContent = this.itemList[i].content
          if (
            itemTitle.indexOf(event) != -1 ||
            itemContent.indexOf(event) != -1
          ) {
            search_List.push(this.itemList[i])
          }
        }
        this.itemList = search_List
      } else {
        this.getRemindList()
      }
    },
    onCancel() {
      this.searchValue = ''
      this.onRefresh()
    },
    //上拉加载
    //异步请求数据 ，我们的项目时封装好的方法，此处只是调用
    onLoad() {
      this.getRemindList()
    },
    onRefresh() {
      //下拉刷新
      this.finished = false
      this.page = 1
      this.itemList = []
      this.loading = true
      this.onLoad() //正常的请求数据的方法，数组重新赋值
    },
    // 2022-06-05:yigz 提醒信息详情
    remindDetail(item) {
      let _this = this
      let content_url =
        '/template/form/' +
        item.opemType +
        '/get/true?id=' +
        item.opemId +
        '&startFlow=false'
      _this.$router.push(content_url)
    },
  },
}
</script>
<style scoped>
::v-deep .van-pull-refresh__track {
  height: 100%;
  overflow-y: auto;
}
.van-cell__title {
  width: 100%;
}
.van-search {
  padding: 5px 2px;
}
.van-cell {
  padding: 10px;
  line-height: unset;
}
.flow_list_title {
  /* width: 35px; */
  float: left;
  font-size: 12px;
  text-align: center;
  margin-top: 2px;
}
.msg_list_icon_read {
  display: block;
  width: 100%;
  height: 45px;
  background: url(../assets/img/notice_read.png) no-repeat center top;
  background-size: 35px 35px;
}
.msg_list_icon_new {
  display: block;
  width: 100%;
  height: 45px;
  background: url(../assets/img/notice_wait.png) no-repeat center top;
  background-size: 35px 35px;
}
.task_list {
  display: block;
  padding: 10px 15px 10px 0;
  border-bottom: 1px solid #e9e9e9;
}
.task_list_word {
  width: calc(100% - 60px);
  padding-left: 8px;
  float: left;
}
.task_list_name {
  width: 100%;
  font-size: 16px;
  color: #333;
  font-family: 'Arial Normal', Arial;
  word-break: break-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0;
  font-weight: 400;
}
.task_list_time {
  font-size: 13px;
  font-family: 'Arial Normal', Arial;
  font-weight: 400;
  color: rgb(54, 143, 255);
}

.no_more_remind {
  margin: auto;
  float: right;
  margin-right: 10px;
  font-size: 12px;
  color: #aaa;
  margin-top: 12px;
  border: #aaa 1px solid;
  border-radius: 18px;
  padding-top: 6px;
  padding-bottom: 6px;
  padding-left: 10px;
  padding-right: 10px;
}
.remind_del {
  margin: auto;
  float: right;
  margin-right: 14px;
  color: #aaa;
  margin-top: 18px;
  width: 16px;
  height: 16px;
  background-size: cover;
  background-color: transparent;
  background: url('../assets/img/remind_del.png') no-repeat;
  background-size: cover;
  background-position: center;
}
.remind_class {
  width: 100vw;
}
.remind_item {
  margin: auto;
  border-radius: 10px;
  border: #eee 1px solid;
  margin-top: 8px;
  display: flex;
  align-content: center;
  justify-items: center;
  width: 96vw;
}
</style>
