<template>
  <div class="tab-bar">
    <van-search
      placeholder="请输入标题或内容在当前页面筛选..."
      v-model="searchValue"
      show-action
      @change="onSearchChange"
      @input="onSearch"
      @search="onSearch"
      @cancel="onCancel"
      action-text="重置"
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
        <van-cell
          v-for="item in itemList"
          :key="item.id"
          @click="showItem(item)"
        >
          <template slot="title">
            <div class="flow_list_title">
              <i
                :class="[item.receiveTime ? 'icon-read1' : 'icon-youjian']"
                style="
                  float: left;
                  font-size: 18px;
                  color: #1989fa;
                  padding-top: 2px;
                "
              ></i>
              <!-- <i v-if="item.receiveTime" class="msg_list_icon_read"></i> -->
              <!-- <em v-if="!item.receiveTime" class="msg_list_icon_new"></em> -->
            </div>
            <div class="task_list_word">
              <div class="task_list_name">{{ item.subject }}</div>
              <div class="task_list_time">
                {{ item.owner + ' ' + item.createTime }}
              </div>
            </div>
          </template>
        </van-cell>
      </van-list>
      <tabBar ref="tabBar" :activeIndex="1"></tabBar>
    </van-pull-refresh>
  </div>
</template>
<script>
var $ = require('jquery')
import portal from '@/api/portal.js'
import {Search, PullRefresh, List, Notify, Dialog} from 'vant'
const tabBar = () => import('@/components/tabbar/TabBar.vue')
export default {
  components: {
    Dialog,
    Notify,
    tabBar,
    [Search.name]: Search,
    [PullRefresh.name]: PullRefresh,
    [List.name]: List,
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
    this.onRefresh()
  },
  methods: {
    onSearchChange(event) {
      this.onRefresh()
    },
    onSearch(event) {
      this.onRefresh()
    },
    onCancel() {
      this.searchValue = ''
      this.onRefresh()
    },
    //上拉加载
    //异步请求数据 ，我们的项目时封装好的方法，此处只是调用
    onLoad() {
      let params = {
        pageBean: {
          page: this.page,
          pageSize: this.pageSize,
          showTotal: true,
        },
        querys: [],
        sorter: [
          {direction: 'DESC', property: 'receiver_name_'},
          {direction: 'DESC', property: 'CREATE_TIME_'},
        ],
      }
      if (this.searchValue) {
        params.querys.push({
          property: 'subject',
          value: '%' + this.searchValue + '%',
          operation: 'LIKE',
          relation: 'OR',
          grou: 'quickSearch',
        })
        params.querys.push({
          property: 'content',
          value: '%' + this.searchValue + '%',
          operation: 'LIKE',
          relation: 'OR',
          grou: 'quickSearch',
        })
      }
      let _self = this
      portal
        .getMessageList(params)
        .then((response) => {
          let rows = response.rows
          _self.loading = false //数据请成功后
          _self.isDownLoading = false //数据请成功后
          _self.page++ //页码要增加1
          if (rows == null || rows.length === 0) {
            // 加载结束
            _self.finished = true
            return
          }

          // 将新数据与老数据进行合并
          _self.itemList = _self.itemList.concat(rows)
          //如果列表数据条数>=总条数，不再触发滚动加载
          if (_self.itemList.length >= response.total) {
            _self.finished = true
          }
        })
        .catch((error) => {})
        .finally(() => {
          _self.isDownLoading = false
          _self.isUpLoading = false
        })
    },
    onRefresh() {
      //下拉刷新
      this.finished = false
      this.page = 1
      this.itemList = []
      this.loading = true
      this.onLoad() //正常的请求数据的方法，数组重新赋值
    },
    showItem(item) {
      let _this = this
      this.$http
        .get('${portal}/innermsg/messageReceiver/v1/get?id=' + item.id)
        .then(
          (response) => {
            // lyzcw: 2022-04-29 替换消息提醒里的内网地址为sso定义的公网地址
            let msgContent = response.data.content
            let pattern =
              /(https?:\/\/)([0-9a-z.]+)(:[0-9]+)?(\/fvue\/navigationMsg)([/0-9a-z.]+)?(\?[0-9a-z&=]+)?(#[0-9-a-z]+)?/
            msgContent = msgContent.replace(
              pattern,
              window.context.host + 'mobilevue$5/0'
            )

            Dialog.alert({
              title: item.subject,
              message: msgContent,
            }).then(() => {
              if (!item.receiveTime) {
                _this.$refs.tabBar.refreshMsgbadge()
                _this.onRefresh()
              }
            })
          },
          (error) => {}
        )
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
</style>
