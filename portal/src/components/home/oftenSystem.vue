<template>
  <el-card shadow="never" style="height: 140px;">
    <div slot="header" class="clearfix">
      <b>常用系统</b>
      <el-button class="more-button" type="text">更多</el-button>
      <i class="el-icon-setting tools-icon"></i>
    </div>
    <div>
      <el-row>
        <el-col
          :span="4"
          class="often-system"
          v-for="(system, index) in oftenSystems"
          :key="system.name"
          :offset="index > 0 ? 1 : 0"
        >
          <img :src="system.icon" width="50">
          <div>{{system.name}}</div>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>
<script>
export default {
  data() {
    return {
      oftenSystems: [
        { name: "ERP", icon: require("@/assets/img/s1.png") },
        { name: "知识库", icon: require("@/assets/img/s2.png") },
        { name: "CRM", icon: require("@/assets/img/s3.png") },
        { name: "门户", icon: require("@/assets/img/s4.png") },
        { name: "员工自助", icon: require("@/assets/img/s5.png") }
      ]
    };
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
.often-system {
  margin: 5px;
  padding: 8px;
  cursor: pointer;
}

.often-system /deep/ div {
  text-align: center;
  font-weight: bold;
  font-size: 12px;
  white-space: nowrap;
}

.often-system:hover /deep/ div {
  color: $--theme-color;
}
</style>
