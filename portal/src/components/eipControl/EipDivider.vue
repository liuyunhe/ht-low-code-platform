<template>
  <!-- <el-divider :content-position="contentPosition">
      <slot></slot>
  </el-divider> -->
  <!-- 重写el-divider 组件 -->
  <div class="el-divider el-divider--horizontal" :style="'background-color:'+ color">
    <div :class="'el-divider__text is-'+contentPosition" >
     <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: "eip-divider",
  props: ["contentPosition","color"],
  data() {
    return {};
  },
  created() {},
};
</script>