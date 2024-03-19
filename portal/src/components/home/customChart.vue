<template>
  <el-card shadow="never" id="chartCard">
    <el-row id="conditionArea" v-if="conditions.length >0">
      <div class="conditiondiv" v-for="cond in conditions" :key="cond.field">
        <div v-if="cond.defaultType =='1'">
          <span>{{cond.comment}}</span>
          <el-input
            v-if="cond.dbType !='date' "
            size="mini"
            style="width:160px;padding-right: 0;"
            clearable
            :placeholder="'请输入'+cond.comment"
            prefix-icon="el-icon-search"
            v-model="conditionValue[cond.field]"
            @keyup.enter.native="searchEnterFun"
          ></el-input>

          <el-date-picker
            v-if="cond.dbType =='date' && cond.condition=='BETWEEN'"
            v-model="conditionValue[cond.field]"
            type="datetimerange"
            align="right"
            size="mini"
            start-placeholder="开始日期"
            end-placeholder="截止日期"
            :default-time="['00:00:00', '23:59:59']"
          ></el-date-picker>

          <el-date-picker
            v-if="cond.dbType =='date' && cond.condition!='BETWEEN'"
            size="mini"
            v-model="conditionValue[cond.field]"
            type="datetime"
            style="width:160px;"
            placeholder="选择日期"
          ></el-date-picker>
        </div>
      </div>

      <div class="conditiondiv" style="text-align: center;float: right;width:230px;">
        <el-button size="mini" type="primary" icon="el-icon-search" @click="search">查询</el-button>
        <el-button size="mini" icon="el-icon-refresh" @click="reset">重置</el-button>
      </div>
    </el-row>

    <el-tabs type="card" style="margin-top:10px">
      <el-tab-pane label="查看图表">
        <div id="chartDiv" style="width:100%;float:left; margin-left: 0px;"></div>
      </el-tab-pane>
      <el-tab-pane label="查看数据">
        <el-table
          :data="chartData.rows"
          id="chartDataTable"
          style="width: 100%;overflow: auto"
          header-cell-class-name="todo-header-row"
          row-class-name="todo-row"
          size="small"
          v-loading="fullscreenLoading"
        >
          <el-table-column type="index" width="80" align="center" label="序号"></el-table-column>
          <el-table-column :label="showF.comment" :key="showF.field" v-for="showF in showFiled">
            <template slot-scope="scope">
              <span class="todo-subject">{{getValue(scope.row,showF)}}</span>
            </template>
          </el-table-column>
        </el-table>

        <el-row type="flex" justify="end" style="margin: 10px;">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pagination.page"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pagination.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
          ></el-pagination>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>
<script>
import { mapState } from "vuex";
import utils from "@/utils.js";

export default {
  props: ["id"],
  data() {
    return {
      queryOpTransObj: {
        EQ: "equal",
        BETWEEN: "between",
        GE: "great_equal",
        LE: "less_equal",
        LK: "like",
        IN: "in"
      },
      fullscreenLoading: false,
      dialogVisible: false,
      customChart: "",
      conditions: [],
      showFiled: [],
      pagination: { page: 1, pageSize: 10, showTotal: true },
      chartData: {},
      conditionValue: {}
    };
  },
  created() {
    let this_ = this;
    this.$store.dispatch("form/getCustomChart", this.id).then(function(data) {
      if (data) {
        data.conditionfield = JSON.parse(data.conditionfield);
        data.displayfield = JSON.parse(data.displayfield);
        data.xaxisField = JSON.parse(data.xaxisField);
        data.sortfield = JSON.parse(data.sortfield);
        for (var i = 0, c; (c = data.conditionfield[i++]); ) {
          c.condition = this_.queryOpTransObj[c.condition].toUpperCase();
        }
        this_.conditions = data.conditionfield;
        this_.customChart = data;
        this_.showFiled = JSON.parse(
          JSON.stringify(
            this_.customChart.xaxisField.concat(this_.customChart.displayfield)
          )
        );
        setTimeout(function() {
          var chartHeight = document.getElementById("chartCard").offsetHeight;
          var selectArea =
            document.getElementById("conditionArea") &&
            document.getElementById("conditionArea").offsetHeight
              ? document.getElementById("conditionArea").offsetHeight
              : 0;
          document.getElementById("chartDiv").style.height =
            chartHeight - selectArea - 65 + "px";
          document.getElementById("chartDataTable").style.height =
            chartHeight - selectArea - 95 + "px";
          this_.search();
        }, 20);
      }
    });
  },
  methods: {
    buildQuerys() {
      let queryFilter = { pageBean: this.pagination, querys: [], sorter: [] };
      for (var i = 0, c; (c = this.conditions[i++]); ) {
        let queryValue = "";
        if (c.defaultType != "1" && c.defaultValue) {
          queryValue = c.defaultValue;
        } else if (c.defaultType == "1" && this.conditionValue[c.field]) {
          queryValue = this.conditionValue[c.field];
        }
        if (queryValue) {
          queryFilter.querys.push({
            property: c.field,
            operation: c.condition,
            value: queryValue
          });
        }
      }

      for (var i = 0, s; (s = this.customChart.sortfield[i++]); ) {
        queryFilter.sorter.push({
          property: s.field,
          direction: s.sortType.toUpperCase()
        });
      }
      return queryFilter;
    },
    getValue(r, s) {
      var value = r[s.field.toUpperCase()];
      if (s.dbType == "date") {
        var filter = this.$options.filters["dateformat"];
        value = filter(value, "YYYY-MM-DD HH:mm:ss");
      }
      return value;
    },
    //重置
    reset() {
      this.conditionValue = {};
      this.search();
    },
    handleSizeChange: function(size) {
      //每页下拉显示数据
      this.pagination.pageSize = size;
      this.search();
    },
    handleCurrentChange: function(currentPage) {
      //点击第几页
      this.pagination.page = currentPage;
      this.search();
    },

    //查询
    search() {
      let queryFilter = this.buildQuerys(); //查询条件
      let param = { id: this.id, filter: queryFilter };
      let this_ = this;
      this.$store.dispatch("form/getChartData", param).then(function(data) {
        if (data) {
          this_.chartData = data;
          this_.pagination = {
            pageSize: data.pageSize,
            page: data.page,
            total: data.total
          };
          this_.buildChart(data.rows);
        }
      });
    },
    //根据自定义图表的相关设置以及数据生产图表
    buildChart(data) {
      const echarts = require("echarts");
      var myChart = echarts.init(document.getElementById("chartDiv"));
      this.$root.$on("resize", () => {
        myChart.resize(); //监测图表自适应
      });
      myChart.clear();
      var displayfield = this.customChart.displayfield;
      var legendData = [];
      var xAxisData = [];
      var seriesData = [];
      var xaxisField = this.customChart.xaxisField;
      if (xaxisField) xaxisField = xaxisField[0];
      for (var i = 0, d; (d = displayfield[i++]); ) {
        if (d) {
          var arr = [];
          if (this.customChart.style == 3) {
            for (var j = 0, res; (res = data[j++]); ) {
              if (res) {
                var value = res[xaxisField.field.toUpperCase()];
                if (
                  xaxisField.dbType == "date" &&
                  value &&
                  typeof value == "number"
                )
                  value = new Date(value).format("yyyy-MM-dd HH:mm:dd");
                legendData.push(value);
                arr.push({
                  value: res[d.field.toUpperCase()],
                  name: value
                });
              }
            }
            seriesData.push({
              name: d.comment,
              type: "pie",
              radius: "75%",
              center: ["50%", "55%"],
              data: arr,
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: "rgba(0, 0, 0, 0.5)"
                }
              }
            });
          } else {
            var type = this.customChart.style == 1 ? "line" : "bar";
            legendData.push(d.comment);
            for (var j = 0, res; (res = data[j++]); ) {
              if (i == 1) {
                var value = res[xaxisField.field.toUpperCase()];
                if (
                  xaxisField.dbType == "date" &&
                  value &&
                  typeof value == "number"
                )
                  value = new Date(value).format(defaultFmt);
                xAxisData.push(value);
              }
              if (res) {
                var value = res[d.field.toUpperCase()];
                /*if(d.dbType=='date' && value && (typeof value=="number")) value=new Date(value).format(defaultFmt);*/
                arr.push(value);
              }
            }
            seriesData.push({
              name: d.comment,
              type: type,
              areaStyle: { normal: {} },
              data: arr
            });
          }
        }
      }
      var option = {};
      if (this.customChart.style == 3) {
        option = {
          title: {
            text: this.customChart.name,
            x: "center",
            y: 10,
            textStyle: {
              fontSize: 24
            }
          },
          tooltip: {
            trigger: "item",
            formatter: "{a} <br/>{b} : {c} ({d}%)"
          },
          toolbox: {
            feature: {
              saveAsImage: {}
            }
          },
          legend: {
            orient: "vertical",
            left: "left",
            data: legendData
          },
          series: seriesData
        };
      } else {
        option = {
          title: {
            text: this.customChart.name,
            x: "center",
            y: 10,
            textStyle: {
              fontSize: 24
            }
          },
          tooltip: {
            trigger: "axis"
          },
          legend: {
            data: legendData,
            y: 50
          },
          toolbox: {
            feature: {
              saveAsImage: {}
            }
          },
          grid: {
            y: 110,
            left: "3%",
            right: "4%",
            bottom: "3%",
            containLabel: true
          },
          xAxis: [
            {
              type: "category",
              boundaryGap: false, //类目起始和结束两端空白策略，默认为true留空，false则顶头
              data: xAxisData
            }
          ],
          yAxis: [
            {
              type: "value"
            }
          ],
          series: seriesData
        };
        //柱状图的时候两端留空。避免柱状图挡住y轴。折线图则不留空，
        if (this.customChart.style == 2) option.xAxis[0]["boundaryGap"] = true;
        if (this.customChart.conf) {
          var obj = JSON.parse(this.customChart.conf);
          if (obj.yMin == 2) option.yAxis[0]["min"] = "dataMin";
          if (obj.xShowAll == 2)
            option.xAxis[0]["axisLabel"] = {
              interval: 0, //横轴信息全部显示
              rotate: 30
            };
        }
        if (
          (this.customChart.style == 2 || this.customChart.style == 1) &&
          data.length > 20
        ) {
          option.dataZoom = [
            {
              type: "inside",
              start: 0,
              end: 10
            },
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
          option.grid.bottom = "3%";
          delete option.dataZoom;
        }
      }
      myChart.setOption(option);
    },
    //回车查询
    searchEnterFun: function(e) {
      var keyCode = window.event ? e.keyCode : e.which;
      if (keyCode == 13) {
        this.search();
      }
    }
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
.conditiondiv {
  display: inline-block;
  padding-top: 10px;
}

.conditiondiv >div >span {
  display: inline-block;
  margin-right: 8px;
  width: 60px;
  text-align: right;
}

/deep/.el-tabs__item {
  height: 30px;
  line-height: 30px;
}

.todo-subject {
  cursor: pointer;
}

.todo-subject {
  color: $--theme-color;
}

/deep/.el-tabs__header {
  margin: 0px;
}
</style>
