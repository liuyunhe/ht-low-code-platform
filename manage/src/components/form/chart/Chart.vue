<template>
  <div :id="'chart'+index" style="height: 360px;width: 100%"></div>
</template>

<script>
import echarts from "echarts";
export default {
  props: {
    option: {
      type: Object,
      default: () => {}
    },
    index: {
      type: Number,
      default: -1
    },
    //是否转换options
    isConvertOption:{
      type: Boolean,
      default: false
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
      let chart = echarts.init(document.getElementById("chart" + this.index));
      let myOption = {};
      if (this.isConvertOption){
        if (this.option && this.option.series && this.option.series[0].type === "pie") {
          myOption = {
            title: {
              text: this.option.name,
              subtext: this.option.subtext
            },
            tooltip: {
              trigger: "item",
              formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
              data: this.option.legend
            },
            series: this.option.series
          };
        }else {
          myOption = {
            title: {
              text: this.option.name,
              subtext: this.option.subtext,
              top: 20
            },
            tooltip: {
              trigger: "axis",
              axisPointer: {
                type: "shadow"
              }
            },
            calculable: true,
            legend: {
              x: "right",
              data: this.option.legend
            },
            toolbox: {
              show: true,
              orient: "vertical",
              y: "center",
              right: 20,
              itemGap: 13,
              feature: {
                mark: { show: true },
                magicType: {
                  show: true,
                  type: ["line", "bar", "stack", "tiled"]
                },
                restore: { show: true },
                saveAsImage: { show: true },
                dataZoom: {
                  yAxisIndex: "none"
                },
                dataView: {
                  show: true,
                  readOnly: true,
                  optionToContent: function(opt) {
                    let axisData = opt.xAxis[0].data;
                    let series = opt.series;
                    let tdHeaders = "<th></th>"; //表头
                    series.forEach(function(item) {
                      tdHeaders += "<th>" + item.name + "</th>"; //组装表头
                    });
                    let table =
                      '<div class="table-responsive"><table class="table table-bordered table-striped table-hover" style="text-align:center"><tbody><tr>' +
                      tdHeaders +
                      "</tr>";
                    let tdBodys = ""; //数据
                    for (let i = 0, l = axisData.length; i < l; i++) {
                      for (let j = 0; j < series.length; j++) {
                        tdBodys += "<td>" + series[j].data[i] + "</td>"; //组装表数据
                      }
                      table +=
                        '<tr><td style="padding: 0 10px">' +
                        axisData[i] +
                        "</td>" +
                        tdBodys +
                        "</tr>";
                      tdBodys = "";
                    }
                    table += "</tbody></table></div>";
                    return table;
                  }
                }
              }
            },
            grid: {
              y: 80,
              y2: 40,
              x2: 40
            },
            xAxis: [
              {
                type: "category",
                data: this.option.xAxis
              }
            ],
            yAxis: [
              {
                type: "value"
              }
            ],
            series: this.option.series
          };
        }
      }else{
        myOption = this.option;
      }
      chart.setOption(myOption);
    }
  }
};
</script>

<style scoped>
</style>
