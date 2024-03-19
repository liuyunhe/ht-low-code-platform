<template>
  <el-card shadow="never">
    <div slot="header" class="clearfix">
      <b>今日会议</b>
      <el-dropdown>
        <span class="el-dropdown-link">
          近一周会议
          <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>近一月会议</el-dropdown-item>
          <el-dropdown-item>近半年会议</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-table :data="meeting" :height="180" style="width: 100%" size="medium" :default-sort="{prop: 'kssj', order: 'descending'}">
      <el-table-column label="会议主题" show-overflow-tooltip>
        <template slot-scope="scope">
          <span class="meeting-subject" @click="handleRowClick(scope.row)">{{scope.row.hymc}}</span>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" show-overflow-tooltip width="150">
          <template slot-scope="scope">
            <span>{{scope.row.kssj | dateformat('YYYY-MM-DD HH:mm')}}</span>
          </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
<script>
import { mapState, mapActions } from "vuex";
export default {
  data() {
    return {
     
    };
  },
  computed: mapState({
    meeting: state => state.menu.meeting
  }),
  created() {
    let pageBean = {"pageBean":{"page":"1","pageSize":"3","showTotal":"true"}};
    this.$store.dispatch("menu/getMeetingPagination",pageBean);
  },
  methods: {
    //
    meetingDialog() {
      this.$router.push("/meetingList/0");
    },
    //处理会议待办任务
    handleRowClick(row) {
      this.$router.push("/task/" + row.taskId);
    }
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
.el-card__header .el-dropdown {
  float: right;
  color: #999;
  font-weight: bold;
  font-size: 13px;
  cursor: pointer;
}

.el-card__header .el-dropdown:hover {
  color: $--theme-color;
}
.meeting-subject {
  cursor: pointer;
}
.meeting-subject {
  color: $--theme-color;
}
</style>
