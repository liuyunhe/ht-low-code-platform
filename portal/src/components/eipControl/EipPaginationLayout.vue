<template>
  <div v-show="pageIndex===showIndex">
    <slot></slot>
  </div>
</template>
<script>
import PageBus from "@/components/eipControl/bus/PageBus.js";
export default {
  name: "eip-pagination-layout",
  components: {},
  props: ["pageIndex"],
  data() {
    return {
      showIndex: 0
    };
  },
  mounted() {
    const this_ =this;
    //监听分页组件分页数量改变事件.
    PageBus.$on("pageAlter", content => {
      this_.showIndex = content;
    });
  },
  methods: {},
  watch: {}
};
</script>
