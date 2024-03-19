<template>
  <el-container class="fullheight">
    <el-container>
      <el-main>
        <ht-table
         ref="executeJobTable"
          @load="loadData"
          :data="data"
          :pageResult="pageResult"
          :selection="true"
          quick-search-props="jobName,trigName"
          :show-export="false"
        >
          <template v-slot:toolbar>
            <el-button size="small" icon="icon-withdraw"  @click="back()">返回</el-button>
            <ht-delete-button
            size="small"
            :url="executeJobDeleteUrl"
            :htTable="$refs.executeJobTable"
          >删除</ht-delete-button>
          </template>
          <template v-slot:search>
            <!-- <el-date-picker
              v-model="startTime"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
              end-placeholder="结束日期">
            </el-date-picker> -->
            <ht-table-search-panel :divide="3">
              <ht-table-search-field label="触发名称" prop="trigName" />
              <ht-table-search-field type="daterange" label="开始时间" prop="startTime" operation= "BETWEEN" />
              <!--  type="daterange" -->
            </ht-table-search-panel>
          </template>
          <template>
            <ht-table-column type="index" width="50" align="center" label="序号" />
            <ht-table-column
              prop="jobName"
              label="执行名称"
              width="300"
              :sortable="true"
              :show-overflow-tooltip="true"
            />
            <ht-table-column prop="trigName" label="触发名称" sortable />
            <ht-table-column prop="startTime" label="开始时间" sortable />
            <ht-table-column prop="endTime" label="结束时间" sortable />
            <ht-table-column prop="content" label="日志内容"  />
            <ht-table-column
              prop="state"
              label="状态"
              :filters="[{text:'失败', value:0},{text:'正常', value:1}]"
            >
              <template v-slot="{row}">
                <el-tag  type="success" v-if="row.state==1">正常</el-tag>
                <el-tag type="primary" v-if="row.state==0">失败</el-tag>
              </template>
            </ht-table-column>
          </template>
        </ht-table>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
import sys from "@/api/portal.js";
export default {
  name:"executeJobList",
  props: {
    jobName: String
  },
  components: {
  },
  data() {
    return {
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      executeJob:{},
      startTime:''
    };
  },
  watch:{
    // startTime: function(newVal, oldVal) {
    //   if (newVal != oldVal) {
    //     this.$refs.executeJobTable.querys.push({property: "startTime", operation: "BETWEEN", value: newVal, relation: "AND"});
    //   }
    // }
  },
  computed:{
    executeJobDeleteUrl: function() {
      return window.context.portal + "/job/scheduler/v1/delJobLog";
    },
  },
  activated: function(){
      this.$refs.executeJobTable.load();
  },
  mounted(){
     // 因为resize事件在整个项目中只能监听一次，所以这里通过全局广播发送这个事件
    window.onresize = () => {
      this.$root.$emit("resize");
    };
  },
  methods: {
    back(){
      if (this.$route.params.trigName) {
        this.$router.push({
            name: "schedulerTriggerList",
            params: { jobName: this.$route.params.jobName, tobName: "触发器列表" }
          });
      }else{
        this.$router.push('/schedulerManager');
      }
    },
    loadData(param, cb) {
      let trigName ="";
      if (this.$route.params.trigName) {
        trigName=this.$route.params.trigName;
      }
      sys
        .getSchedulerPageJsonbyJobName(window.context.portal + "/job/scheduler/v1/listJson?jobName="+this.$route.params.jobName+"&trigName="+trigName,param)
        .then(response => {
          this.data = response.rows;
          this.pageResult = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total
          };
        })
        .finally(() => cb());
    }
  }
};
</script>

<style scoped>
.el-main {
  padding:0px;
}
</style>
