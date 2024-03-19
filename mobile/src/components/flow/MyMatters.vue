<template>
  <div>
    <NavBar>
      <template slot="title"
        >待办已办</template
      >
      <template slot="right">
        <van-icon
          name="search"
          @click="searchVisible = !searchVisible"
          style="font-weight: 900"
          size="1.2rem"
        />
      </template>
    </NavBar>
    <transition name="van-slide-right">
      <van-search
        placeholder="请输入名称或标题..."
        v-model="searchValue"
        @change="onSearchChange"
        v-if="searchVisible"
        show-action
        @input="onSearch"
        @cancel="onCancel"
      />
    </transition>
    <van-tabs v-model="active" @change="onChangeTabs">
      <van-tab title="待办" :disabled="disabledWait">
        <div class="roadWrapper" v-if="status == 'wait'">
          <div class="road">
            <van-pull-refresh v-model="isDownLoading" @refresh="onRefresh()">
              <!-- ccwgq 2022-04-21 加入这个div可以
              处理部分浏览器无法触发load回调的问题 -->
              <!--<div style="overflow-y:scroll;height:100%">-->
              <van-list
                v-model="loading"
                :finished="finished"
                finished-text="没有更多了"
                @load="onLoad"
                :immediate-check="false"
                :offset="20"
              >
              <div class="van-clearfix">
                <van-cell
                  v-for="item in itemList"
                  :key="item.id"
                  @click="showItem(item)"
                >
                  <template slot="title">
                    <div class="task_state">
                      <em
                        :class="
                          item.supportMobile == 1 ? 'task_ongoing' : 'task_over'
                        "
                      ></em>
                      <p
                        :class="
                          item.supportMobile == 1
                            ? 'task_ongoing_word'
                            : 'task_over_word'
                        "
                        type="success"
                      >
                        {{ statusArray[item.status] }}
                      </p>
                    </div>
                    <div class="task_list_word">
                      <div class="task_list_name">
                        <strong
                          :style="
                            item.supportMobile == 1
                              ? ''
                              : ' color: rgb(150, 151, 153);'
                          "
                          >{{ item.subject }}</strong
                        >
                      </div>
                      <div class="task_list_name">
                        <div style="float: left">
                          <van-tag
                            v-if="item.supportMobile == 1"
                            type="success"
                            >{{ item.creator }}</van-tag
                          >
                          <van-tag v-if="item.supportMobile != 1">{{
                            item.creator
                          }}</van-tag>
                        </div>
                        <div
                          :style="
                            'margin-top: 2px;float: left;' +
                              item.supportMobile ==
                            1
                              ? ''
                              : ' color: rgb(150, 151, 153);'
                          "
                        >
                          -{{ item.createTime }}
                        </div>
                      </div>
                      <div style="float:left">
                        <!-- ccwgq 2022-03-23 加入节点名称 -->
                        <span style="font-size:12px;color:#a8a8a8;"
                          >节点:{{ item.name }}</span
                        >
                      </div>
                      <div class="task_list_time">
                        <!-- {{ item.createTime | countDate }} -->
                        <span
                          style="float: right"
                          v-if="item.urgentStateValue == 1"
                        >
                          <van-tag plain type="danger">非常紧急</van-tag>
                        </span>
                        <span
                          style="float: right"
                          v-if="item.urgentStateValue == 2"
                        >
                          <van-tag plain type="warning">比较紧急</van-tag>
                        </span>
                        <span
                          style="float: right"
                          v-if="item.urgentStateValue == 3"
                        >
                          <van-tag plain type="success">一般</van-tag>
                        </span>
                      </div>
                    </div>
                  </template>
                </van-cell>
                </div>
              </van-list>
              <!-- </div> -->
            </van-pull-refresh>
          </div>
        </div>
      </van-tab>
      <van-tab title="已办" :disabled="disabledDown">
        <div class="roadWrapper" v-if="status == 'down'">
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
                <van-cell
                  v-for="item in itemList"
                  :key="item.id"
                  @click="showItem(item)"
                >
                  <template slot="title">
                    <div v-if="item.status == 'running'" class="task_state">
                      <em class="task_ongoing"></em>
                      <p
                        :class="
                          item.supportMobile == 1
                            ? 'task_ongoing_word'
                            : 'task_over_word'
                        "
                      >
                        运行中
                      </p>
                    </div>
                    <div
                      v-if="item.status == 'end' || item.status == 'manualend'"
                      class="task_state"
                    >
                      <em class="task_over"></em>
                      <p class="task_over_word">结束</p>
                    </div>
                    <div
                      v-if="
                        item.status == 'revoke' ||
                          item.status == 'revokeToStart'
                      "
                      class="task_state"
                    >
                      <em class="task_over"></em>
                      <p class="task_over_word">撤销</p>
                    </div>
                    <div
                      v-if="
                        item.status == 'backToStart' || item.status == 'back'
                      "
                      class="task_state"
                    >
                      <em class="task_withdraw"></em>
                      <p class="task_withdraw_word">驳回</p>
                    </div>
                    <div class="task_list_word">
                      <div class="task_list_name">
                        <strong>{{ item.subject }}</strong>
                      </div>
                      <div style="float: left" class="task_list_name">
                        <div style="float: left">
                          <van-tag type="success">{{ item.creator }}</van-tag>
                        </div>
                        <div style="margin-top: 2px; float: left">
                          -{{
                            item.createTime | dateformat('yyyy-MM-dd HH:mm:ss')
                          }}
                        </div>
                      </div>
                      <div class="task_list_time">
                        节点：{{ item.taskName }}
                      </div>
                      <div
                        class="task_list_time"
                        v-if="
                          item.status == 'end' || item.status == 'manualend'
                        "
                      >
                        持续时间：{{ formatDuring(item.duration) }}
                      </div>
                    </div>
                  </template>
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
// import VConsole from 'vconsole'
import flow from '@/api/flow.js'
import NavBar from '@/components/navBar/NavBar.vue'
import {Tab, Tabs, Search, pullRefresh, List, Cell, Button, Icon} from 'vant'
import {Notify} from 'vant'
const STATUS = {
  NORMAL: '待办',
  TRANSFORMED: '流转',
  TRANSFORMEDINQU: '征询',
  DELIVERTO: '转办',
  FOLLOW: '跟踪',
  COMMU: '沟通',
  BACK: '驳回',
  ADDSIGN: '会签加签',
  AGENT: '委托',
  SHARE: '共享',
  BACKSHARE: '驳回共享',
  APPROVELINEED: '并行审批',
  SIGNSEQUENCEED: '顺序签署',
  SIGNLINEED: '并行签署',
  USERADDSIGN: '用户加签'
}
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
  props: {
    activeNumber: {
      type: String,
      default: '0'
    }
  },
  data() {
    return {
      disabledWait: this.activeNumber != '0',
      disabledDown: this.activeNumber == '0',
      active: Number(this.activeNumber),
      status: this.activeNumber == '0' ? 'wait' : 'down',
      searchValue: '',
      flag_scroll: false,
      loading: false,
      finished: false,
      isLoading: false,
      isDownLoading: false,
      page: 1,
      itemList: [],
      idsMap: {},
      searchVisible: false,
      statusArray: STATUS
    }
  },
  created() {
    this.onRefresh()
  },
  watch: {
    status: function(newVal, oldVal) {
      if (newVal != oldVal) {
        this.searchValue = ''
        this.onRefresh()
      }
    },
    // loading(val){
    //   console.log('loading===>',val)
    // }
  },
  mounted(){
   console.log(navigator)
  },
  methods: {
    formatDuring(mss) {
      let days = Math.floor(mss / (1000 * 60 * 60 * 24))
      let hours = Math.floor((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      let minutes = Math.floor((mss % (1000 * 60 * 60)) / (1000 * 60))
      let seconds = Math.round((mss % (1000 * 60)) / 1000)
      return days + '天' + hours + '小时' + minutes + '分钟' + seconds + '秒'
    },

    onChangeTabs(event) {
      switch (this.active) {
        case 0:
          this.status = 'wait'
          break
        case 1:
          this.status = 'down'

          break
        default:
          this.status = 'wait'
          break
      }
    },
    onSearchChange(event) {
      this.onRefresh()
    },
    onSearch(event) {
      this.onRefresh()
    },
    onCancel() {
      this.searchValue = ''
      this.searchVisible = false
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
      }
      let _self = this
      if (this.status == 'wait') {
        if (this.searchValue) {
          params.querys.push({
            property: 'bt.subject_',
            value: this.searchValue,
            operation: 'LIKE',
            relation: 'OR',
            grou: 'quickSearch'
          })
          params.querys.push({
            property: 'bt.proc_def_name_',
            value: this.searchValue,
            operation: 'LIKE',
            relation: 'OR',
            grou: 'quickSearch'
          })
        }
        flow
          .getMobileTodoList(params)
          .then(response => {
            _self.loading=false;
            _self.loadData(response, _self)
          })
          .catch(error => {})
          .finally(() => {
            _self.isDownLoading = false
            _self.isUpLoading = false
          })
      } else {
        if (this.searchValue) {
          params.querys.push({
            property: 'subject_',
            value: this.searchValue,
            operation: 'LIKE',
            relation: 'OR',
            grou: 'quickSearch'
          })
          params.querys.push({
            property: 'proc_def_name_',
            value: this.searchValue,
            operation: 'LIKE',
            relation: 'OR',
            grou: 'quickSearch'
          })
        }
        flow
          .getMobileDoneList(params)
          .then(response => {
            _self.loadData(response, _self)
          })
          .catch(error => {})
          .finally(() => {
            _self.isDownLoading = false
            _self.isUpLoading = false
          })
      }
    },
    loadData(response, _self) {
      if (_self.status == 'wait') {
        _self.disabledWait = true
        _self.disabledDown = false
      } else if (_self.status == 'down') {
        _self.disabledWait = false
        _self.disabledDown = true
      }
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
      if (_self.status == 'wait') {
        _self.disabledWait = true
        _self.disabledDown = false
      } else if (_self.status == 'down') {
        _self.disabledWait = false
        _self.disabledDown = true
      }
    },
    onRefresh() {
      //下拉刷新
      this.finished = false
      this.page = 1
      this.itemList = []
      this.loading = true
      this.onLoad() //正常的请求数据的方法，数组重新赋值
    },
    //进入审批页面
    showItem(row) {
      if (this.status == 'wait') {
        // if (row.supportMobile != 1) {
        //   Notify({ type: 'warning', message: '此待办未绑定手机表单' });
        //   return;
        // }
        if (row.status == 'SHARE' || row.status == 'BACKSHARE') {
          if (row.identityList && row.identityList.length == 1) {
            this.$router.push('/task/' + row.id + '/' + row.identityList[0].id)
          } else {
            let html =
              '<select ref=' +
              Math.random() +
              ' id="approvalLeaderSelect" style="width: 200px;height: 30px;border-radius: 4px;margin: 20px 70px;" ><option value="">请选择</option>'
            row.identityList.forEach(identity => {
              html +=
                '<option value="' +
                identity.id +
                '">' +
                identity.name +
                '</option>'
            })
            html += '</select>'
            let this_ = this
            this.$alert(html, '请选择一个领导代为审批', {
              dangerouslyUseHTMLString: true,
              beforeClose: function(action, instance, done) {
                if (action == 'confirm') {
                  let se = document.getElementById('approvalLeaderSelect')
                  if (se.selectedIndex == 0) {
                    Notify({
                      type: 'warning',
                      message: '请选择代为审批的领导'
                    })
                  } else {
                    instance.close()
                    this_.$router.push(
                      '/task/' + row.id + '/' + se[se.selectedIndex].value
                    )
                  }
                } else {
                  instance.close()
                }
              }
            })
          }
        } else if (
          row.status == 'AGENT' &&
          row.ownerId != row.assigneeId &&
          row.ownerId == this.$store.state.login.currentUser.userId
        ) {
          //委托任务
          this.$router.push('/instRead/' + row.procInstId + '/agent')
        } else {
          this.$router.push('/task/' + row.id + '/0')
        }
      } else if (this.status == 'down') {
        //判断是否显示撤回按钮
        if (row.opinionStatus != 'inqu') {
          this.$router.push('/inst/' + row.id + '/doneList')
        } else {
          this.$router.push('/inst/' + row.id)
        }
      }
    }
  }
}
</script>
<style scoped>
::v-deep .van-pull-refresh__track{
  height: 100%;
  overflow-y:auto ;
}
.van-cell{
  padding: 10px;
  line-height: unset;
}
.van-cell__title {
  width: 100%;
}
.van-search {
  padding: 5px 2px;
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
