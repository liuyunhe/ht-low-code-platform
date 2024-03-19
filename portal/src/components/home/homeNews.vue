<template>
  <el-card shadow="never">
    <div slot="header" class="clearfix">
      <b>新闻动态</b>
      <el-button class="more-button" type="text" @click="newsDialog">更多</el-button>
    </div>
    <el-table :data="rows" :height="275" style="width: 100%" size="medium"  :default-sort="{prop: 'fkssj', order: 'descending'}">
      <el-table-column label="新闻主题" show-overflow-tooltip >
          <template slot-scope="scope">
            <span class="news-subject" @click="handleRowClick(scope.row)">{{scope.row.fbt}}</span>
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
    name:"news",
    data() {
    return {
    };
  },
  computed: mapState({
    rows: state => state.menu.rows
  }),
  created() {
    let moment = require("moment");
    let pageBean = {"pageBean":{"page":"1","pageSize":"5","showTotal":"true"},
    "querys":[{property: "FSfxysp", value: "0", group: "main", operation: "EQUAL", relation: "AND"},
     {property: "FJssj", value: moment().format('YYYY-MM-DD') , group: "main",operation:"GREAT_EQUAL",relation: "AND"}]}; //初次加载默认pageBean
    this.$store.dispatch("menu/getNewsPagination",pageBean);
  },
  methods: {
    //跳转新闻动态列表
    newsDialog() {
      this.$router.push("/newsList/0");
    },
    //查看新闻动态详情
    handleRowClick(row) {
      this.$router.push("/news/" + row.id);
    }
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
.news-subject {
  cursor: pointer;
}
.news-subject {
  color: $--theme-color;
}
</style>

