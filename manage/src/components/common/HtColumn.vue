<template>
  <div class="el-card box-card is-always-shadow" ref="col" v-show="canDisplay">
    <div class="el-card__header" v-if="!isTab">
      <div class="clearfix">
        <span>{{column.name}}</span>
        <div style="float:right;" class="btn">
          <el-button
            type="text"
            v-if="column.colUrl"
            @click="openMore(column.colUrl)"
            title="更多"
          >
            <i class="el-icon-more"></i>
          </el-button>
          <el-button type="text" @click="refresh" title="刷新">
            <i class="el-icon-refresh"></i>
          </el-button>
          <el-button type="text" @click="close" title="移除">
            <i class="el-icon-close"></i>
          </el-button>
        </div>
      </div>
    </div>
    <div class="column-body" ref="colBody" v-loading="loading">
      <v-runtime-template
        :template="column.html?column.html:html"
        ref="homeHtmlTemplate"
        v-if="isCommon"
      />
      <eip-chart :id="chartId" v-if="isChart" />
      <chart :option="reportOption" :index="1" v-if="isReport" />
      <custom-dialog-show-detail v-if="isCustomDialog" ref="customDialogShowDetail" 
              :alias="customDialog.alias" :custom-dialog="customDialog"/>
    </div>
    <div class="column-footer">
      <el-pagination
        v-if="column.needPage==1"
        :current-page.sync="pageBean.page"
        :page-size="pageBean.pageSize"
        :total="pageBean.total"
        layout="prev, pager, next,total"
      ></el-pagination>
    </div>
  </div>
</template>
<script>
import req from "@/request.js";
import portal from "@/api/portal.js";
import flow from "@/api/flow.js";
import VRuntimeTemplate from "v-runtime-template";
const eipChart = () => import("@/components/form/chart/EipChart.vue");
const chart = () => import("@/components/form/chart/Chart.vue");
import CustomDialogShowDetail from "@/views/form/customDialog/CustomDialogShowDetail.vue";
import HtChart from "./HtChart"

let Base64 = require("js-base64").Base64;
import {mapState} from "vuex";
import hotentUiUtils from "@/hotent-ui-util.js";

export default {
  name: "ht-column",
  components: { VRuntimeTemplate, eipChart, chart ,CustomDialogShowDetail,HtChart},
  props: {
    columnAlias: {
      type: String,
      required: true
    },
    // 是否来自于预览页面
    fromPreview:{
      type:Boolean,
      default:false
    },
    //是否存在tab标签中
    isTab:{
      type:Boolean,
      default:false
    },
  },
  data() {
    return {
      isCommon: false,
      isChart: false,
      isReport: false,
      isCustomDialog:false,
      chartId: "",
      reportOption: {},
      loading: true,
      html: "<span>本栏目无模板</span>",
      data: {},
      column: {},
      customDialog:{alias:""},
      pageBean: { page: 1, pageSize: 10, total: 0, showTotal: true },
      canDisplay:true
    };
  },
  watch: {
    "column.colHeight": function(val) {
      if (val && val > 0) {
        this.$refs.colBody.style.height = val + "px";
      }
    },
    "pageBean.page": function(val) {
      if (val && val > 0 && this.column.needPage == 1) {
        this.load();
      }
    }
  },
  mounted() {
    this.load();
  },
  computed: {
    ...mapState({
      token: state => state.login.currentUser.token
    })
  },
  methods: {
    goToFront(path){
      let url = window.context.front+path+"?token="+this.token;
      window.open(url, "_blank");
    },
    openMore(url) {
      this.$router.push({ path: url });
    },
    refresh() {
      this.load();
    },
    close() {
      this.$refs.col.remove();
    },
    load() {
      this.loading = true;
      let this_ = this;
      portal.getColumnByAlias(this.columnAlias).then(data => {
        this_.column = data;
        //计算该栏目是否展示
        if(this_.fromPreview){
          this_.canDisplay=true;
        }else{
          this_.canDisplay=this_.column.displayRights;
        }
        //如果无展示权限，则不进行栏目数据渲染了，并隐藏整个组件
        if(!this_.canDisplay){
          this.loading = false;
          return;
        }

        if (this_.column.colType && (this_.column.colType == 1 || this_.column.colType == 4)) {
          let dataParam = JSON.parse(this_.column.dataParam);
          if (dataParam.chartType == 2) {
            this_.chartId = dataParam.id;
            this_.isChart = true;
            this_.loading = false;
          } else {
            this_.isReport = true;
            this_.getChartsData(dataParam);
          }
        } else {
          //自定义对话框
          if(this_.column.dataMode === 1){
            this_.getCustomDialogData();
          }
          //restful查询
          else if(this_.column.dataMode === 3){
            this_.isCommon = true;
            this_.getDataToParse();
          }else{
            this.isCommon = true;
            this.dencodeHtml();
            this.loading = false;
          }
        }
      });
    },
    //图标
    getChartsData(dataParam) {
      flow.getEchartsData(dataParam.id).then(
        response => {
          if (response && response.value) {
            let opt = response.value;
            if (opt.constructor == Array) {
              opt = opt[0];
            }
            this.reportOption = { ...opt };
          }
          this.loading = false;
        },
        err => {
          this.loading = false;
          this.html = `<span style='color:red;'>${err}</span>`;
        }
      );
    },
    getDataToParse() {
      let column = this.column;
      if (!column.dataFrom) {
        this.dencodeHtml();
        this.loading = false;
        return;
      }
      //post请求参数
      let queryParams = {};
      //如果需要分页
      if (column.needPage === 1) {
        queryParams.pageBean = this.pageBean;
      }
      //get请求参数
      let urlParam = "";
      if (column.dataParam) {
        let ctx = {};
        const  curUserDetail= this.$store.state.user.currentUserDetail;
        if (curUserDetail.user) {
          ctx.curUserAccount = curUserDetail.user.account;
          ctx.curUserId = curUserDetail.user.id;
        }
        column.dataParam =  hotentUiUtils.parseExp(column.dataParam, ctx);
      }
      let dataParam = JSON.parse(column.dataParam || "[]");
      if (dataParam) {
        for (var i = 0; i < dataParam.length; i++) {
          var value = dataParam[i]["value"];
          var name = dataParam[i]["name"];
          if (column.requestType == "POST") {
            try {
              value = JSON.parse(value);
            } catch (e) {}
            queryParams[name] = value;
            //如果参数中也设置了分页
            if (name === "pageBean") {
              this.pageBean = value;
            }
          } else {
            urlParam =
              i > 0
                ? urlParam + "&" + name + "=" + value
                : "?" + name + "=" + value;
          }
        }
      }
      //请求获取数据
      if (column.requestType && column.requestType == "POST") {
        req.post(column.dataFrom, queryParams).then(
          response => {
            this.data = response.data;
            this.loading = false;
            if (this.column.needPage === 1) {
              this.pageBean.page = this.data.page || 1;
              this.pageBean.pageSize = this.data.pageSize || 10;
              this.pageBean.total = this.data.total || 0;
            }
            this.dencodeHtml();
          },
          err => {
            this.loading = false;
            this.html = `<span style='color:red;'>${err}</span>`;
          }
        );
      } else {
        req.get(column.dataFrom + urlParam).then(
          response => {
            this.data = response.data;
            this.loading = false;
            this.dencodeHtml();
          },
          err => {
            this.loading = false;
            this.html = `<span style='color:red;'>${err}</span>`;
          }
        );
      }
    },
    getCustomDialogData(){
      let this_ = this;
      let dataFrom = JSON.parse(this.column.dataFrom||"{}");
      if(!dataFrom.alias){
        this_.loading = false;
        this_.isCommon = true;
        this.dencodeHtml();
        return;
      }
      let url = "${form}/form/customDialog/v1/getByAlias?alias="+dataFrom.alias;
      req.get(url).then(function(customDialog) {
        customDialog = customDialog.data;
        //格式化对话框的显示字段、返回字段、条件字段、排序字段
        customDialog.displayfield = JSON.parse(customDialog.displayfield);
        for (let i = 0; i < customDialog.displayfield.length; i++) {
          customDialog.displayfield[i].field = customDialog.displayfield[
            i
          ].field.toUpperCase();
        }
        customDialog.resultfield = JSON.parse(customDialog.resultfield);
        customDialog.sortfield = JSON.parse(customDialog.sortfield);
        customDialog.conditionfield = JSON.parse(customDialog.conditionfield);
        //列表
        if (customDialog.style == 0) {
          this_.customDialog = customDialog;
          this_.isCustomDialog=true;
          this_.loading = false;
          setTimeout(() => {
            this_.$refs.customDialogShowDetail.initData(); //显示自定义对话框列表预览弹框
          });
        }
      });
    },
    dencodeHtml() {
      if (this.column.templateHtml) {
        this.column.html = Base64.decode(this.column.templateHtml);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
.el-card {
  margin-bottom: 20px;
  border-radius: 10px;
}
.column-body {
  padding: 10px;
  height: 100%;
  overflow-y: auto;
}
.column-footer {
  text-align: center;
  color: grey;
}
.el-card__header{
  padding-top: 13px;
  padding-bottom: 13px;
}
.el-card__header span{
  font-size: 18px;
  font-weight:900;
  border-left:5px solid #409eff;
  padding-left: 5px;
}
// 首页数据台样式
/deep/.container {
  padding-bottom: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .container_icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    font-size: 20px;
    color: #fff;
    line-height: 40px;
    text-align: center;
    .flow-icon{
      font-size: 20px;
    }
  }
  .icon__blue__bg {
    background: rgba(54, 143, 255, 1);
  }
  .icon__pink__bg {
    background: rgba(255, 120, 110, 1);
  }
  .icon__deep__blue__bg {
    background: rgba(77, 119, 255, 1);
  }
  .icon__yellow__bg {
    background: rgba(255, 155, 89, 1);
  }
  .icon__purple__bg {
    background: rgba(82, 98, 255, 1);
  }
  .icon__green__bg {
    background: rgba(87, 202, 176, 1);
  }
  .container_box {
    text-align: center;
    .container_box_title,
    .container_box_count {
      margin: 6px 0 0 0;
      font-size: 13px;
      font-family: 'Microsoft YaHei';
      font-weight: 500;
      color: rgb(19, 18, 18);
    }
    .container_box_count{
      margin-top: 0;
    }
  }
}
/* 我的首页栏目样式 */
/deep/.my-home {
  background-image: url('../../assets/img/home_bg.png');
  background-repeat: no-repeat;
  background-position: center;
  height: 208px;
  text-align: center;
  margin-top: -17px;
  .my-home__title {
    font-weight: 550;
    font-size: 17px;
    padding-top: 20px;
    color: #fff;
  }
  .my-home__btn {
    width: 117px;
    height: 32px;
    line-height: 32px;
    color: #3db3d7;
    border: 1px solid #fff;
    background: #fff;
    border-radius: 16px;
    margin: 20px auto;
  }
}
.btn /deep/ i{
  font-size: 15px;
  font-weight: 900;
  color: #9e9e9e;
}
.btn /deep/ .el-button{
  padding: 3px 0;
}
.btn /deep/ i:hover{
  transform: scale(1.4);
  -webkit-transform : scale(1.5);  
  -moz-transform : scale(1.5); 
  color:$--theme-color;
}
</style>

