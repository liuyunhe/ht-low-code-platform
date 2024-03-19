<template>
  <el-row style="padding-top: 10px;padding-bottom: 10px;">
    <el-col :span="12" :push="2">
      <span style="font-weight:bold;font-size:14px;">{{pageNum+1}}/{{pageSize}}</span>
    </el-col>
    <el-col :span="4">
      <el-button
        v-if="pageNum!=0"
        class="step_change_btn"
        @click="back"
        type="success"
        :style="'background-color:'+backButton.color+';border-color:'+backButton.color"
        :icon="backButton.icon"
      >{{backButton.name}}</el-button>
      <el-button
        v-if="pageNum<pageSize-1"
        class="step_change_btn"
        @click="next"
        type="success"
        :style="'background-color:'+nextButton.color+';border-color:'+nextButton.color"
        :icon="nextButton.icon"
      >{{nextButton.name}}</el-button>
      <!-- <el-button v-if="pageNum==pageSize-1" @click="end" type="success">完成</el-button> -->
    </el-col>
  </el-row>
</template>
<script>
import PageBus from "@/components/eipControl/bus/PageBus.js";
export default {
  name: "eip-pagination",
  components: {},
  props: ["pageSize", "backButton", "nextButton"],
  data() {
    return {
      pageNum: 0
    };
  },
  mounted() {
    //加载完毕触发一次默认值
    //this.sendMsg(1);
  },
  methods: {
    end() {
      this.pageNum = this.pageSize;
      this.sendMsg(this.pageNum);
    },
    back() {
      this.pageNum -= 1;
      this.sendMsg(this.pageNum);
    },
    next() {
      this.pageNum += 1;
      this.sendMsg(this.pageNum);
    },
    //分页值被改变则通知所有分页组件
    sendMsg(val) {
      PageBus.$emit("pageAlter", val);
      this.$emit("updatePageIndex", 1);
    }
  },
  watch: {}
};
</script>
<style lang="stylus" scoped>
.step_change_btn {
  height: 32px;
  width: 80px;
  padding: 0px;
}
div>>>.el-col-4 {
    width: auto;
}
</style>
