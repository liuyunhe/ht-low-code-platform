<template>
  <el-card shadow="never">
    <div slot="header" class="clearfix">
      <b>发文公告</b>
      <el-button class="more-button" type="text" @click="noticeDialog">更多</el-button>
    </div>
    <el-table :data="notice" :height="275" style="width: 100%" size="medium" :default-sort="{prop: 'fkssj', order: 'descending'}">
      <el-table-column prop="fzz" label="发起人" width="100"></el-table-column>
      <el-table-column label="公告主题" show-overflow-tooltip >
          <template slot-scope="scope">
            <span class="notice-subject" @click="handleRowClick(scope.row)">{{scope.row.fbt}}</span>
          </template>
      </el-table-column>
      <el-table-column label="发布时间" show-overflow-tooltip width="100">
          <template slot-scope="scope">
            <span>{{scope.row.fkssj | dateformat('YYYY-MM-DD')}}</span>
          </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
<script>
import { mapState, mapActions } from "vuex";
export default {
    name:"notice",
    data() {
    return {

    };
  },
  computed: mapState({
    notice: state => state.menu.notice
  }),
  created() {
    let moment = require("moment");
    let pageBean = {"pageBean":{"page":"1","pageSize":"5","showTotal":"true"},
    "querys":[{property: "FSfxysp", value: "1", group: "main", operation: "EQUAL", relation: "AND"},
    {property: "FJssj", value: moment().format('YYYY-MM-DD') , group: "main",operation:"GREAT_EQUAL",relation: "AND"}]}; //初次加载默认pageBean
    this.$store.dispatch("menu/getNoticePagination",pageBean);
  },
  methods: {
    //跳转发文公共列表
    noticeDialog() {
      this.$router.push("/newsList/1");
    },
    //查看发文公共详情
    handleRowClick(row) {
      this.$router.push("/news/" + row.id);
    }
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
.notice-subject {
  cursor: pointer;
}
.notice-subject {
  color: $--theme-color;
}
</style>

