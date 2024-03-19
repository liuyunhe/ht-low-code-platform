<template>
  <el-tabs type="card">
    <el-tab-pane label="查看图表">
      <div
        v-if="showTable"
        :id="id"
        :style="{ width: '100%', height: customChart.height + 'px' }"
      ></div>
    </el-tab-pane>
    <el-tab-pane label="查看数据">
      <ht-table
        @load="loadData"
        :data="data"
        :pageResult="pageResult"
        ref="table"
        :default-querys="defaultQuery"
        :selectable="false"
        :show-export="false"
        :show-custom-column="false"
        :quick-search-props="quickSearchProp"
        v-if="showTable"
        :nopagination="true"
        height="500"
      >
        <ht-table-column
          v-for="xaxisField in customChart.xaxisField"
          :key="xaxisField.field"
          :prop="xaxisField.field.toUpperCase()"
          :label="xaxisField.comment"
        ></ht-table-column>
        <ht-table-column
          v-for="displayfield in customChart.displayfield"
          :key="displayfield.field"
          :prop="displayfield.field.toUpperCase()"
          :label="displayfield.comment"
        ></ht-table-column>
      </ht-table>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import echarts from "echarts";
import ecStat from "echarts-stat";
import form from "@/api/form.js";
export default {
  props: {
    id: {
      type: String,
      required: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initData();
    });
  },
  watch: {
    id: function(newV) {
      if (newV) {
        this.customChart = [];
        this.data = [];
        this.quickSearchProp = "";
        this.defaultQuery = [];
        this.showTable = false;
        this.initData();
      }
    }
  },
  data() {
    return {
      customChart: {},
      pageResult: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      data: [],
      showTable: false,
      quickSearchProp: "",
      defaultQuery: [],
      queryOpTransObj: {
        EQ: "EQUAL",
        BETWEEN: "BETWEEN",
        GE: "GREAT_EQUAL",
        LE: "LESS_EQUAL",
        LK: "LIKE",
        IN: "IN"
      }
    };
  },
  methods: {
    loadData(param, cb) {
      if (this.customChart.alias) {
        param.pageBean.pageSize = parseInt(
          (this.customChart.conf.maxLength && this.customChart.conf.maxLength != '0') ? this.customChart.conf.maxLength : 20
        );
        form
          .getListData(this.customChart.alias, param)
          .then(response => {
            this.data = response.rows;
            this.pageResult = {
              page: response.page,
              pageSize: response.pageSize,
              total: response.total
            };
            this.customChart.rows = this.data;
            this.buildChart(this.customChart);
          })
          .finally(() => {
            cb();
          });
      } else {
        cb();
      }
    },
    async initData() {
      let data = await form.getCustomChartById(this.id);
      if (!data) {
        this.$message.error("未获取到图表数据");
        return;
      }
      data.conditionfield = JSON.parse(data.conditionfield);
      data.displayfield = JSON.parse(data.displayfield);
      data.xaxisField = JSON.parse(data.xaxisField);
      data.sortfield = JSON.parse(data.sortfield);
      data.conf = JSON.parse(data.conf);
      this.customChart = data;
      this.initCondition();
      this.showTable = true;
    },
    initCondition() {
      let conditions = this.customChart.conditionfield;
      for (let i = 0; i < conditions.length; i++) {
        if (conditions[i].defaultType === "1") {
          this.quickSearchProp += conditions[i].field.toUpperCase() + ",";
        } else {
          this.defaultQuery.push({
            property: conditions[i].field,
            value: conditions[i].defaultValue,
            operation: this.queryOpTransObj[conditions[i].condition],
            group: "main"
          });
        }
      }
    },
    buildChart(data) {
      let myChart = echarts.init(document.getElementById(this.id), "default");
      let grid = this.getGrid();
      data.conf.title.text = data.name;
      data.conf.title.top = this.getTitlePosition();
      let option = {
        title: data.conf.title,
        tooltip: {},
        toolbox: { feature: { saveAsImage: {} } },
        legend: {},
        grid: grid,
        series: {}
      };
      switch (data.style) {
        case 1:
          option = this.buildLine(data, option);
          break;
        case 3:
          option = this.buildPie(data, option);
          break;
        case 4:
          option = this.buildRadar(data, option);
          break;
        case 5:
          option = this.buildFunnel(data, option);
          break;
        case 6:
          option = this.buildScatter(data, option);
          break;
        case 7:
          option = this.buildHeatmap(data, option);
          break;
        default:
          break;
      }
      this.adjustChatTitle(data, option);
      myChart.setOption(option);
    },
    buildLine(data, option) {
      let displayField = this.customChart.displayfield;
      let legendData = [];
      let xAxisData = [];
      let seriesData = [];
      let xAxisField = {};
      let series = this.customChart.conf.series;
      if (this.customChart.xaxisField)
        xAxisField = this.customChart.xaxisField[0];

      for (let i = 0, d; (d = displayField[i++]); ) {
        if (d) {
          let arr = [];
          let type = d.type;
          legendData.push(d.comment);
          for (let j = 0, res; (res = data.rows[j++]); ) {
            if (i === 1) {
              let value = res[xAxisField.field.toUpperCase()];
              if (
                xAxisField.dbType === "date" &&
                value &&
                typeof value === "number"
              )
                value = new Date(value).format(defaultFmt);
              xAxisData.push(value);
            }
            if (res) {
              let value = res[d.field.toUpperCase()];
              arr.push(value);
            }
          }
          let se = {
            name: d.comment,
            type: d.type,
            data: arr,
            stack: series.stack ? "one" : null
          };
          if (!series.doubleYAxis) {
            se.yAxisIndex = d.yAxis === 1 ? 0 : 1;
          }
          if (type === "line") {
            se.smooth = series.smooth;
          }
          seriesData.push(se);
        }
      }
      option.series = seriesData;
      option.tooltip = {
        trigger: "axis"
      };
      option.legend.y = 50;
      // option.grid = {
      //   left: "3%",
      //   right: "4%",
      //   bottom: "3%",
      //   containLabel: true
      // };
      if (series.showType || !series.doubleYAxis) {
        option.xAxis = [{ type: "category", data: xAxisData }];
        option.yAxis = series.doubleYAxis
          ? [{ type: "value" }]
          : [{ type: "value" }, { type: "value" }];
      } else {
        option.xAxis = [{ type: "value" }];
        option.yAxis = [{ type: "category", data: xAxisData }];
      }

      //柱状图的时候两端留空。避免柱状图挡住y轴。折线图则不留空，
      if (data.style === 2) option.xAxis[0]["boundaryGap"] = true;
      if (data.conf) {
        let obj = data.conf;
        if (obj.yMin === 2) option.yAxis[0]["min"] = "dataMin";
        if (obj.xShowAll === 2)
          option.xAxis[0]["axisLabel"] = {
            interval: 0, //横轴信息全部显示
            rotate: 30
          };
      }
      if (data.rows.length > 20 && !series.dataZoom) {
        option.dataZoom = [
          {
            start: 0,
            end: 10,
            handleIcon:
              "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
            handleSize: "80%",
            handleStyle: {
              color: "#fff",
              shadowBlur: 3,
              shadowColor: "rgba(0, 0, 0, 0.6)",
              shadowOffsetX: 2,
              shadowOffsetY: 2
            }
          }
        ];
        option.grid.bottom = 50;
      } else {
        //option.grid.bottom = "3%";
        delete option.dataZoom;
      }
      option.legend = data.conf.legend;
      option.legend.data = legendData;
      return option;
    },
    buildPie(data, option) {
      let displayField = data.displayfield;
      let legendData = [];
      let seriesData = [];
      let xAxisField = data.xaxisField;
      let series = data.conf.series;
      if (xAxisField) xAxisField = xAxisField[0];
      if (series.showType) {
        let duration = 100 / data.rows.length;
        for (let j = 0; j < data.rows.length; j++) {
          let value = [];
          for (let i = 0; i < displayField.length; i++) {
            value.push({
              name: displayField[i].comment,
              value: data.rows[j][displayField[i].field.toUpperCase()]
            });
            if (j === 0) {
              legendData.push(displayField[i].comment);
            }
          }
          seriesData.push({
            name: data.rows[j][xAxisField.field.toUpperCase()],
            type: "pie",
            data: value,
            radius: [series.radius[0] + "%", series.radius[1] + "%"],
            center: [
              Number(series.center[0]) + j * duration + "%",
              series.center[1] + "%"
            ],
            roseType: series.roseType,
            selectedMode: series.selectedMode,
            label: {
              position: series.label.position
            },
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)"
              }
            }
          });
        }
      } else {
        let duration = 100 / displayField.length;
        for (let i = 0; i < displayField.length; i++) {
          let value = [];
          for (let j = 0; j < data.rows.length; j++) {
            value.push({
              name: data.rows[j][xAxisField.field.toUpperCase()],
              value: data.rows[j][displayField[i].field.toUpperCase()]
            });
            if (i === 0) {
              legendData.push(
                data.rows[j][xAxisField.field.toUpperCase()] + ""
              );
            }
          }
          seriesData.push({
            name: displayField[i].comment,
            type: "pie",
            data: value,
            radius: [series.radius[0] + "%", series.radius[1] + "%"],
            center: [
              Number(series.center[0]) + i * duration + "%",
              series.center[1] + "%"
            ],
            roseType: series.roseType,
            selectedMode: series.selectedMode,
            label: {
              position: series.label.position
            },
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)"
              }
            }
          });
        }
      }

      option.series = seriesData;
      option.tooltip = {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      };
      option.legend = data.conf.legend;
      option.legend.data = legendData;
      return option;
    },
    buildRadar(data, option) {
      let displayField = data.displayfield;
      let legendData = [];
      let xAxisField = data.xaxisField;
      let arr = [];
      let seriesData = [];
      let indicator = [];
      let series = data.conf.series;
      if (xAxisField) xAxisField = xAxisField[0];

      if (series.showType) {
        for (let j = 0; j < data.rows.length; j++) {
          let value = [];
          for (let i = 0; i < displayField.length; i++) {
            value.push(data.rows[j][displayField[i].field.toUpperCase()]);
            if (j === 0) {
              indicator.push({
                name: displayField[i].comment
              });
            }
          }
          legendData.push(data.rows[j][xAxisField.field.toUpperCase()] + "");
          arr.push({
            name: data.rows[j][xAxisField.field.toUpperCase()],
            value: value,
            areaStyle: {
              opacity: "0"
            }
          });
        }
        seriesData = [
          {
            type: "radar",
            data: arr,
            itemStyle: {
              emphasis: {
                areaStyle: {
                  opacity: series.areaStyle ? "0" : "0.5"
                }
              }
            }
          }
        ];
      } else {
        for (let i = 0; i < displayField.length; i++) {
          let value = [];
          for (let j = 0; j < data.rows.length; j++) {
            value.push(data.rows[j][displayField[i].field.toUpperCase()]);
            if (i === 0) {
              indicator.push({
                name: data.rows[j][xAxisField.field.toUpperCase()]
              });
            }
          }
          legendData.push(displayField[i].comment);
          arr.push({
            name: displayField[i].comment,
            value: value,
            areaStyle: {
              opacity: "0"
            }
          });
        }
        seriesData = [
          {
            type: "radar",
            data: arr,
            itemStyle: {
              emphasis: {
                areaStyle: {
                  opacity: series.areaStyle ? "0" : "0.5"
                }
              }
            }
          }
        ];
      }

      option.series = seriesData;
      option.radar = {
        center: [series.center[0] + "%", series.center[1] + "%"],
        radius: series.radius,
        indicator: indicator
      };
      option.legend = data.conf.legend;
      option.legend.data = legendData;
      return option;
    },
    buildFunnel(data, option) {
      let displayField = data.displayfield;
      let legendData = [];
      let xAxisField = data.xaxisField;
      let seriesData = [];
      let series = data.conf.series;
      if (xAxisField) xAxisField = xAxisField[0];

      //列数据展示
      if (series.showType) {
        let duration = 100 / data.rows.length;
        for (let j = 0; j < data.rows.length; j++) {
          let value = [];
          for (let i = 0; i < displayField.length; i++) {
            value.push({
              name: displayField[i].comment,
              value: data.rows[j][displayField[i].field.toUpperCase()]
            });
            if (j === 0) {
              legendData.push(displayField[i].comment);
            }
          }
          seriesData.push({
            name: data.rows[j][xAxisField.field.toUpperCase()],
            type: "funnel",
            data: value,
            width: duration - 5 + "%",
            left: j * duration + "%",
            funnelAlign: series.funnelAlign,
            sort: series.sort,
            label: {
              position: series.label.position
            }
          });
        }
      } else {
        //行数据展示
        let duration = 100 / displayField.length;
        for (let i = 0; i < displayField.length; i++) {
          let value = [];
          for (let j = 0; j < data.rows.length; j++) {
            value.push({
              name: data.rows[j][xAxisField.field.toUpperCase()],
              value: data.rows[j][displayField[i].field.toUpperCase()]
            });
            if (i === 0) {
              legendData.push(
                data.rows[j][xAxisField.field.toUpperCase()] + ""
              );
            }
          }
          seriesData.push({
            name: displayField[i].comment,
            type: "funnel",
            data: value,
            width: duration - 5 + "%",
            left: i * duration + "%",
            funnelAlign: series.funnelAlign,
            sort: series.sort,
            label: {
              position: series.label.position
            }
          });
        }
      }

      option.series = seriesData;

      option.legend = data.conf.legend;
      option.legend.data = legendData;
      this.adjustChatTitle(data, option);
      return option;
    },
    buildScatter(data, option) {
      let displayField = data.displayfield;
      let legendData = [];
      let xAxisData = [];
      let xAxisField = data.xaxisField;
      let seriesData = [];
      let series = data.conf.series;
      if (xAxisField) xAxisField = xAxisField[0];

      if (series.showType) {
        for (let j = 0; j < data.rows.length; j++) {
          let value = [];
          for (let i = 0; i < displayField.length; i++) {
            if (j === 0) {
              xAxisData.push(displayField[i].comment);
            }
            value.push([
              displayField[i].comment,
              data.rows[j][displayField[i].field.toUpperCase()]
            ]);
          }
          legendData.push(data.rows[j][xAxisField.field.toUpperCase()] + "");
          seriesData.push({
            name: data.rows[j][xAxisField.field.toUpperCase()],
            type: "scatter",
            data: value
          });
        }
      } else {
        for (let i = 0; i < displayField.length; i++) {
          let value = [];
          for (let j = 0; j < data.rows.length; j++) {
            if (i === 0) {
              xAxisData.push(
                data.rows[j][xAxisField.field.toLocaleUpperCase()]
              );
            }
            value.push([
              data.rows[j][xAxisField.field.toLocaleUpperCase()],
              data.rows[j][displayField[i].field.toLocaleUpperCase()]
            ]);
          }
          legendData.push(displayField[i].comment);
          seriesData.push({
            name: displayField[i].comment,
            type: "scatter",
            data: value
          });
          if (displayField[i].regression && displayField[i].regression!=='none'){
            let myRegression = ecStat.regression(displayField[i].regression,value);
            myRegression.points.sort(function(a, b) {
              return a[0] - b[0];
            });
            seriesData.push({
              name: 'line',
              type: 'line',
              showSymbol: false,
              data: myRegression.points,
              markPoint: {
                itemStyle: {
                  color: 'transparent'
                },
                label: {
                  show: true,
                  position: 'left',
                  formatter: myRegression.expression,
                  color: '#333',
                  fontSize: 14
                },
                data: [{
                  coord: myRegression.points[myRegression.points.length - 1]
                }]
              }
            })
          }
        }
      }

      option.series = seriesData;
      option.xAxis = {
        type: data.conf.series.xAxisType
      };
      if (data.conf.series.xAxisType==='category'){
        option.xAxis.data = xAxisData
      }
      option.yAxis = {};

      option.legend = data.conf.legend;
      option.legend.data = legendData;
      return option;
    },
    buildHeatmap(data, option) {
      let displayField = data.displayfield;
      let legendData = [];
      let rows = [];
      let columns = [];
      let arr = [];
      let max = 0;
      let xAxisField = data.xaxisField;
      if (xAxisField) xAxisField = xAxisField[0];

      for (let i = 0; i < data.rows.length; i++) {
        for (let j = 0; j < displayField.length; j++) {
          if (i === 0) {
            columns.push(displayField[j].comment);
          }
          arr.push([i, j, data.rows[i][displayField[j].field.toUpperCase()]]);
          if (data.rows[i][displayField[j].field.toUpperCase()] > max) {
            max = data.rows[i][displayField[j].field.toUpperCase()];
          }
        }
        rows.push(data.rows[i][xAxisField.field.toUpperCase()]);
      }
      option.series = [
        {
          name: "sss",
          type: "heatmap",
          data: arr,
          label: {
            normal: {
              show: true
            }
          }
        }
      ];
      option.xAxis = {
        type: "category",
        data: rows,
        splitArea: {
          show: true
        }
      };
      option.yAxis = {
        type: "category",
        data: columns,
        splitArea: {
          show: true
        }
      };
      option.visualMap = {
        min: 0,
        max: max,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: "0%"
      };
      option.tooltip = {
        position: "top"
      };

      option.legend = data.conf.legend;
      option.legend.data = legendData;
      return option;
    },
    getGrid() {
      let top = 0;
      let bottom = 0;
      let grid = {};
      if (this.customChart.conf.title.show) {
        if (this.customChart.conf.title.top === "top") {
          top += 7;
          if (this.customChart.conf.title.subtext) {
            top += 5;
          }
        } else if (this.customChart.conf.title.top === "bottom") {
          bottom += 16;
        }
      }
      if (this.customChart.conf.legend.show) {
        if (this.customChart.conf.legend.top === "top") {
          top += 7;
        } else if (this.customChart.conf.legend.top === "bottom") {
          bottom += 10;
        }
      }
      if (top !== 0) {
        grid.top = top + "%";
      } else {
        grid.top = "5%";
      }
      if (bottom !== 0) {
        grid.bottom = bottom + "%";
      }
      return grid;
    },
    getTitlePosition() {
      if (this.customChart.conf.title.top === "top") {
        return this.customChart.conf.legend.show &&
          this.customChart.conf.legend.top === "top"
          ? "20"
          : "auto";
      } else if (this.customChart.conf.title.top === "bottom") {
        return this.customChart.conf.legend.show &&
          this.customChart.conf.legend.top === "bottom"
          ? "84%"
          : "88%";
      } else {
        return this.customChart.conf.title.top;
      }
    },
    adjustChatTitle(data, option) {
      option.legend.top = 30;
      option.grid.top = 80;
      if (data.conf && data.conf.title && data.conf.title.subtext) {
        option.legend.top = 50;
        option.grid.top = 100;
      }
    }
  }
};
</script>

<style scoped>
>>> .el-table--scrollable-y{
  max-height: 100% !important;
  height: 100% !important;
}
</style>