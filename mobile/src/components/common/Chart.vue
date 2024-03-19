<template>
  <div :id="chartId" :style="style"></div>
</template>

<script>
import echarts from "echarts";
export default {
  props: {
    option: {
      type: Object,
      default: () => {}
    },
    chartId:{
      type:String,
      default:'chart-id'
    },
    chartStyle:{
      type:String,
      default:'width:100%;height:360px'
    }
  },
  data() {
    return {
      style: this.chartStyle
    }
  },
  watch: {
    option: {
      handler: function(newVal, oldVal) {
        this.initChart();
      },
      deep: true
    }
  },
  mounted() {
    this.initChart();
  },
  methods: {
    initChart() {
      let chart = echarts.init(document.getElementById(this.chartId));
      chart.setOption(this.option);
    }
  }
};
</script>

<style scoped>
</style>
