<template>
  <span >
    <slot></slot>
  </span>
</template>
<script>
export default {
  name: "eip-font",
  data() {
    return {

    };
  },
  created() {
  }
};
</script>
<style lang="stylus" scoped>
div[aria-invalid='true'] >>> .el-input__inner, div[aria-invalid='true'] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
</style>