<template>
  <ht-sidebar-dialog
    :visible="urgentRecordDialog"
    title="催办记录"
    :close-on-click-modal="false"
    append-to-body
    class="dialog-body"
    width="100%"
    :before-close="cancel"
  >
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
              <van-cell v-for="item in itemList" :key="item.id">
                <template slot="title">
                  <div class="task_state">
                      <em class="task_ongoing"></em>
                      <p class="task_ongoing_word" v-if="item.type=='mail'" type="success">邮件</p>
                      <p class="task_ongoing_word" v-if="item.type=='sms'" type="success">短信</p>
                      <p class="task_ongoing_word" v-if="item.type=='smsApproval'" type="success">短信审批</p>
                    </div>
                    <div class="task_list_word">
                      <div class="task_list_name"><strong>{{item.subject}}</strong></div>
                      <div
                        style="float: left;"
                        class="task_list_name"
                      ><div style="float: left;"><van-tag type="success">{{item.appointee}}</van-tag></div>
                      <div style="margin-top: 2px;float: left;">-{{item.nodeName}}</div></div>
                      <div class="task_list_time">{{item.urgrntDate}}</div>
                    </div>
                </template>
              </van-cell>
            </van-list>
          </van-pull-refresh>
        </div>
    </div>
  </ht-sidebar-dialog>
</template>
<script>
import { mapState, mapActions } from "vuex";
import flow from "@/api/flow.js";
import {
  pullRefresh,
  List,
  Cell,
  Button,
  Icon,
  Field,
  Collapse,
  CollapseItem,
  Checkbox
} from "vant";
import { Notify } from "vant";
export default {
  name: "urgentRecord",
  props: ["promoterId","instId"],
  components: {
    Notify,
    [pullRefresh.name]: pullRefresh,
    [List.name]: List,
    [Cell.name]: Cell,
    [Button.name]: Button,
    [Icon.name]: Icon,
    [Field.name]: Field,
    [Collapse.name]: Collapse,
    [CollapseItem.name]: CollapseItem,
    [Checkbox.name]: Checkbox
  },
  data() {
    return {
        urgentRecordDialog:false,
        loading: false,
        finished: false,
        isDownLoading: false,
        page: 1,
        itemList: [],
    };
  },
  methods: {
    //鼠标点击页面其他其他位置不关闭弹框
    handleClose(done) {
        this.urgentRecordDialog = true;
        this.onRefresh();
    },
         //取消
    cancel() {
      this.urgentRecordDialog = false;
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
        querys: [{property: "PROMOTER_ID_", value: this.promoterId, operation: "EQUAL", relation: "AND"},
        {property: "INST_ID_", value: this.instId, operation: "EQUAL", relation: "AND"}],
        params:{},
      };
      
      let _self = this;
      flow.getUrgrntById(params)
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
        .catch(error => {
          Notify({ type: "error", message: "获取资源列表异常{" + error + "}" });
        })
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
    }
  }
};
</script>
<style s scoped>
::v-deep .van-pull-refresh__track{
  height: 100%;
  overflow-y:auto ;
}
div>>>.el-dialog__header {
  padding: 10px 20px;
  background: #F8F8F8;
  height: 24px;
  line-height: 24px;
  border-bottom: 1px solid #eee;
  border-radius: 2px 2px 0 0;
}
div>>>.el-dialog__headerbtn {
  top: 12px;
}

.van-cell__title{
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
  width: 35px;
  float: left;
  font-size: 12px;
  text-align: center;
  margin-top: 2px;
}
.task_ongoing {
  display: block;
  width: 100%;
  height: 35px;
  background: url(../../../assets/img/task_ongoing.png) no-repeat center top;
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
div>>>.van-grid-item__icon {
  font-size: 15px;
}

div>>>.van-grid-item__content {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    height: 45px;
    padding: 16px 8px;
    background-color: #f5f5f5;
}
div>>>.el-dialog .el-dialog__body{
  padding: 0px ;
  height: calc(100% - 115px);
}
.title-divider{
    margin: 0;
    padding: 10px 10px 10px;
    color: rgba(69, 90, 100, 0.6);
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
    background: #F7F8FA;
}

.van-field{
  padding: 10px 26px;
}
div>>>.van-collapse-item__content {
    padding: 0px;
    color:rgba(0,0,0,0.7);
    font-size: 13px;
    line-height: 1.5;
    background-color: #fff;
}
div>>>.van-cell:not(:last-child)::after {
    position: absolute;
    box-sizing: border-box;
    content: ' ';
    pointer-events: none;
    right: 0;
    bottom: 0;
    left: 0 !important;
    left: 16px;
    border-bottom: 1px solid #ebedf0;
    -webkit-transform: scaleY(.5);
    transform: scaleY(.5);
}
</style>