
<template>
  <div>
    <!-- <el-tabs value="0" type="card">
      <el-tab-pane
        v-for="(item,index) in list"
        :key="index"
        :label="item.typeName"
        :name="index+''"
        style="margin-bottom: 31px;"
      > -->
    <div v-for="(it, index) in list" :key="index" style="height: 3%">
      <!-- <div style="display: inline-block;width: 2%;float:left;margin-top: 9px;width: 20px">
            <span :class="it.icon ? it.icon:'iconfont icon-read1'" style="width: 2px"></span>
          </div> -->
      <div style="width: 98%" class="news">
        <div class="news_item">
          <p class="news_item__left">
            <i
              :class="it.icon ? it.icon : 'iconfont icon-read1'"
              style="width: 20px;margin-top: 7px;"
            ></i>
            <el-link
              :underline="false"
              @click="openParticulars(it.id)"
              style="font-size:14px;font-family:Microsoft YaHei;font-weight:normal;color:#171616;line-height:30px;"
              >{{ it.title }}
              <span class="news_item__right" v-if="!it.titleDescription">
                {{ it.drafter }} | {{ it.createTime }}
              </span>
            </el-link>
          </p>
        </div>
        <div v-if="it.titleDescription">
          <span
            style="font-size:12px;font-family:Microsoft YaHei;font-weight:400;color:#797979;line-height:30px;"
            >{{ it.titleDescription }}</span
          >
          <span
            style="float:right;font-family:Microsoft YaHei;font-weight:400;color:rgba(169,173,183,1);line-height:30px;"
            >{{ it.drafter }} | {{ it.createTime }}</span
          >
        </div>

        <div
          style="margin-top:2px;height:1px;background:rgba(235,238,245,1);"
        ></div>
      </div>
    </div>

    <!-- </el-tab-pane>
    </el-tabs> -->
    <homeNewsParticulars ref="homeNewsParticulars" :id="selectId" />
  </div>
</template>
<script>
import req from "@/request.js";
import homeNewsParticulars from "@/components/home/homeNewsParticulars.vue";
export default {
  props: {
    classifyId: {
      default: "all",
    },
  },
  data() {
    return {
      list: [],
      selectId: null,
    };
  },
  components: { homeNewsParticulars },
  created() {
    this.init();
  },

  methods: {
    openParticulars(id) {
      this.selectId = id;
      this.$refs.homeNewsParticulars.openDialog();
    },
    init() {
      req
        .get(
          window.context.portal +
            "/portalNewsNotice/v1/getNews?classifyId=" +
            this.classifyId
        )
        .then((response) => {
          this.list = response.data;
        });
    },
  },
};
</script>
<style lang="scss" scoped>
.news{
  padding: 0 10px;
  &:hover{
    background:#f5f5f5;
  }
}
.news_item {
  width: 100%;
  font-size: 14px;
  font-family: Microsoft YaHei;
  font-weight: 400;
  color: #171616;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  
  .news_item__left {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    margin: 0;
  }
  .news_item__right {
    margin: 0 0 0 20px;
    font-family: Microsoft YaHei;
    font-weight: 400;
    color: rgba(169, 173, 183, 1);
    line-height: 30px;
  }
}
</style>
