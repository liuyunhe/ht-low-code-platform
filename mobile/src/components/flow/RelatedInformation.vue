<template>
  <ht-sidebar-dialog
      :visible="relatedInformationDialog"
      title="相关信息"
      :close-on-click-modal="false"
      append-to-body
      class="dialog-body"
      width="100%"
      :before-close="cancel"
    >
    <div>
        <van-field label="标题" :value="relatedInformation.subject" readonly />
        <van-field label="申请人" :value="relatedInformation.name" readonly />
        <van-field label="所属组织" :value="relatedInformation.deptName" readonly />
        <van-field label="流程编号" :value="instId" readonly />
        <van-field label="审批模板" :value="relatedInformation.template" readonly />
        <!-- <van-collapse v-model="activeNames"> -->
          <!-- <van-collapse-item name="1"> -->
            <div class="title-divider">阅读记录</div>
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
                        <div class="task_list_name"><strong>{{item.taskName}}</strong></div>
                        <p class="task_list_name">{{item.readerName}}（{{item.orgPath}}）-{{item.readTime}}</p>
                      </template>
                    </van-cell>
                  </van-list>
                </van-pull-refresh>
              </div>
            </div>
          <!-- </van-collapse-item> -->
        <!-- </van-collapse> -->
    </div>
  </ht-sidebar-dialog>
</template>
<script>
import { mapState, mapActions } from "vuex";
import flow from "@/api/flow.js";
import { pullRefresh, List, Cell, Button, Icon, Field,Collapse,CollapseItem,Checkbox } from "vant";
import { Notify } from "vant";
export default {
 name: "relatedInformation",
 props: ["instId"],
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
    [Checkbox.name]: Checkbox,
  },
  data() {
    return {
        activeNames:[0],
        relatedInformationDialog:false,
        checked:true,
        flag_scroll: false,
        loading: false,
        finished: false,
        isLoading: false,
        isDownLoading: false,
        page: 1,
        itemList: [],
    };
  },
  computed: mapState({
    relatedInformation: state => state.storeProcess.relatedInformation
  }),
  methods: {
    isChecked(checked){
        this.checked=checked;
        this.onRefresh();
    },
    //鼠标点击页面其他其他位置不关闭弹框
    handleClose(done) {
        this.relatedInformationDialog = true;
         this.$store.dispatch("storeProcess/getRelatedInformationById", this.instId);
        this.onRefresh();
    },
     //取消
    cancel() {
      this.relatedInformationDialog = false;
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
        querys: [],
        params:{},
      };
      let pageBean ={};
      if(this.checked){
        params.params["distinct"] = "1";
        params.querys.push({property: "procInstId", value: this.instId, operation: "EQUAL", relation: "AND"});
      }else{
        params.querys.push({property: "procInstId", value: this.instId, operation: "EQUAL", relation: "AND"});
      }
      let _self = this;
      flow.getByRecordInstId(params)
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

  }
};
</script>
<style scoped>
::v-deep .van-pull-refresh__track{
  height: 100%;
  overflow-y:auto ;
}
div>>>.van-field__label {
  color:rgba(0,0,0,1);
  -webkit-box-flex: 0;
  -webkit-flex: none;
  flex: none;
  box-sizing: border-box;
  width: 80px;
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
  padding-left: 10px;
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
.ht-dialog-footer {
    position: absolute;
    bottom: 0px;
    left: 0;
    right: 0;
    text-align: center;
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