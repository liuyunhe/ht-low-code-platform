<template>
  <div id="homePage">
    <v-runtime-template :template="html" ref="homeHtmlTemplate"/>
  </div>
</template>

<script>
import VRuntimeTemplate from "v-runtime-template";

import homeTodo from "@/components/home/homeTodo.vue";
import todayMeeting from "@/components/home/todayMeeting.vue";
import oftenFlow from "@/components/home/oftenFlow.vue";
import homeNotice from "@/components/home/homeNotice.vue";
import homeNews from "@/components/home/homeNews.vue";
import homeCarousel from "@/components/home/homeCarousel.vue";
import oftenSystem from "@/components/home/oftenSystem.vue";
import customChart from "@/components/home/customChart.vue";
import contractModel from "@/components/home/ou/contractModel.vue";
export default {
  name: "customHome",
  props: ["html", "data"],
  components: {
    VRuntimeTemplate,
    homeTodo,
    todayMeeting,
    oftenFlow,
    homeNotice,
    homeNews,
    homeCarousel,
    oftenSystem,
    customChart,
    contractModel
  },
  data() {
    return {};
  },
  methods: {
    //刷新列表
    forceUpdateHtml() {
      this.$refs.homeHtmlTemplate.$forceUpdate();
    },
    refreshList(columnName) {
      this.$parent.getColumnData(columnName);
    },
    //打开更多
    openMore(url) {
      this.$router.push({ path: url });
    },
    //点开详情
    handleRowClick(url) {
      this.$router.push(url);
    },
    taskListClick(row){
      if (row.status=='SHARE' || row.status=='BACKSHARE') {
         if (row.identityList && row.identityList.length==1) {      
            this.$router.push("/task/" + row.id+"/"+row.identityList[0].id);   
         }else{
            let html='<select ref='+Math.random()+' id="approvalLeaderSelect" style="width: 200px;height: 30px;border-radius: 4px;margin: 20px 70px;" ><option value="">请选择</option>';
             row.identityList.forEach(identity => {
                html+='<option value="'+identity.id+'">'+identity.name+'</option>';
             });
             html+='</select>';
             let this_ =this;
             this.$alert(html, '请选择一个领导代为审批', {
                dangerouslyUseHTMLString: true,
                beforeClose:function(action, instance, done){
                  if(action=='confirm'){
                    let se = document.getElementById('approvalLeaderSelect');
                    if(se.selectedIndex==0){
                      this.$message.warning("请选择代为审批的领导");
                    }else{
                      instance.close();
                      this_.$router.push("/task/" + row.id+"/"+se[se.selectedIndex].value);
                    }
                  }else{
                    instance.close();
                  }
                }
            });
         }
      } else {
         this.$router.push("/task/" + row.id+"/0");
      }
    }
  },
  created() {
    this.$nextTick(function() {
      this.$refs.homeHtmlTemplate.$options["methods"] = {};
    });
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
.el-card /deep/ .el-card__header {
  padding: 15px;
}

/deep/.el-card /deep/ .el-card__header b {
  border-left: 3px solid #00f;
  padding: 0 0 0 10px;
}

/deep/.el-card .el-card__body {
  padding: 0 10px;
}

/deep/ .more-button {
  float: right;
  padding: 3px 0;
  color: #999;
  font-weight: bold;
  font-size: 13px;
}

/deep/ .tools-icon {
  float: right;
  padding: 3px 10px;
  color: #999;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
}

/deep/ .more-button:hover, /deep/ .tools-icon:hover {
  color: $--theme-color;
}

.near-col /deep/ .el-card {
  margin-bottom: 15px;
}

/deep/ .el-table::before {
  height: 0px;
}

/deep/ .el-card__header {
  padding: 10px 20px;
}

/deep/ .el-badge__content.is-fixed {
  top: 8px;
  right: 0px;
}

/deep/.el-table__row > td {
  padding: 4px 0;
}

/deep/.custom_column .el-col .el-card {
  height: 100%;
}

/deep/.often-flow-container {
  padding: 10px 10px 0px 10px;
}

/deep/.often-flow-container .el-tag {
  margin: 0 5px 5px 0;
  color: $--color-text-regular;
  cursor: pointer;
}

/deep/.often-flow-container .el-tag:hover {
  color: $--theme-color;
}
</style>
