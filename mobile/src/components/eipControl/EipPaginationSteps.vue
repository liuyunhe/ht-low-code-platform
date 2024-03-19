<template>
  <el-steps :active="active" finish-status="success" align-center>
    <el-step v-for="(col, colIndex) in columns" :key="colIndex" :title="col.name"></el-step>
  </el-steps>
</template>
<script>
import PageBus from "@/components/eipControl/bus/PageBus.js";
export default {
  name: "Eip-pagination-steps",
  components: {},
  props: ["columns"],
  data() {
    return {
      active:0
    };
  },
  mounted() {
    //监听分页组件分页数量改变事件.
    PageBus.$on("pageAlter", content => {
      this.active = content;
    });
  },
  methods: {},
  watch: {}
};
</script>
