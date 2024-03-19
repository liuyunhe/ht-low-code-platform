<template>
  <div>
    <div @click="handleClick">
      <div
        id="ht-chart"
        style="width: 360px; height: 400px; padding: 0 6px"
      ></div>
    </div>
    <el-dialog
      title="客户分布图"
      :visible.sync="dialogVisible"
      width="100%"
      top="0vh"
      :before-close="handleClose"
    >
      <div class="first-chart">
        <h3 class="pie-title">广东省</h3>
        <chart chartId="pie-chart__first" :option="gdOption" :chartStyle="chartStyle"></chart>
      </div>
      <div class="first-chart">
        <h3 class="pie-title">湖北省</h3>
        <chart chartId="pie-chart__second" :option="hbOption" :chartStyle="chartStyle"></chart>
      </div>
      <div class="first-chart">
        <h3 class="pie-title">浙江省</h3>
        <chart chartId="pie-chart__third" :option="zjOption" :chartStyle="chartStyle"></chart>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import echarts from 'echarts'
import Chart from '@/components/common/Chart'
const BASE_OPTION = {
    tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}:{c}家',
        },
        toolbox: {
          show: true,
        },
        legend: {
          type: 'scroll',
          orient: 'horizontal',
          left: '60px',
          align: 'left',
          top: '0px',
          textStyle: {
            color: '#8C8C8C',
          },
          height: 80,
        },
  }
export default {
  name: 'HtChart',
  components: {Chart},
  
  data() {
    return {
      dialogVisible: false,
      chartStyle:'width:300px; height:180px; margin-left:20px',
      gdOption: {
        ...BASE_OPTION,
        color: ['#37a2da','#32c5e9','#9fe6b8'],
        series: [
          {
            name: '广东省',
            type: 'pie',
            radius: [0, 60],

            data: [
              {value: 8, name: '广州'},
              {value: 10, name: '珠海'},
              {value: 12, name: '佛山'}
            ],
          },
        ],
      },
      hbOption:{
        ...BASE_OPTION,
        color: ['#ffdb5c','#ff9f7f','#fb7293'],
        series: [
          {
            name: '湖北省',
            type: 'pie',
            radius: [0, 60],

            data: [
              {value: 7, name: '武汉'},
              {value: 9, name: '宜昌'},
              {value: 6, name: '荆州'}
            ],
          },
        ],
      },
      zjOption:{
        ...BASE_OPTION,
        color: ['#e7bcf3','#8378ea','#ed7c2f'],
        series: [
          {
            name: '浙江省',
            type: 'pie',
            radius: [0, 60],

            data: [
              {value: 7, name: '杭州'},
              {value: 5, name: '台州'},
              {value: 8, name: '金华'}
            ],
          },
        ],
      }
    }
  },
  mounted() {
    this.initHtChart()
  },
  methods: {
    initHtChart() {
      let htChart = echarts.init(document.getElementById('ht-chart'))
      let data = {
        xData: [
          '广州',
          '珠海',
          '佛山',
          '武汉',
          '宜昌',
          '荆州',
          '杭州',
          '金华',
          '台州',
        ],
        yData: [8, 10, 12, 7, 9, 6, 7, 8, 5],
      }
      let option = {
        title: {
          text: '客户分布图',
          textStyle: {
            color: '#333',
            fontWeight: '800',
            fontSize: `20`,
          },
          left: 'center',
          top: '20px',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        grid: [
          {
            top: 100,
            bottom: 101,
          },
          {
            height: 60,
            bottom: 40,
          },
        ],
        xAxis: [
          {
            type: 'category',
            data: data.xData,
            gridIndex: 0,
            axisLabel: {
              color: '#333',
            },
            axisLine: {
              lineStyle: {
                color: '#e7e7e7',
              },
            },
            axisTick: {
              lineStyle: {
                color: '#e7e7e7',
              },
            },
            zlevel: 2,
          },
          {
            type: 'category',
            gridIndex: 1,
            axisLine: {
              show: false,
            },
            zlevel: 1,
          },
        ],
        yAxis: [
          {
            type: 'value',
            gridIndex: 0,
            axisLabel: {
              color: '#333',
            },
            splitLine: {
              lineStyle: {
                type: 'dashed',
              },
            },
            axisLine: {
              lineStyle: {
                color: '#ccc',
              },
            },
            axisTick: {
              lineStyle: {
                color: '#ccc',
              },
            },
          },
          {
            type: 'value',
            gridIndex: 1,
            axisLabel: {
              show: false,
            },
            axisLine: {
              show: false,
            },
            splitLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
          },
        ],
        series: [
          {
            data: data.yData,
            type: 'bar',
            label: {
              show: true,
              position: 'top',
              textStyle: {
                color: '#555',
              },
            },
            itemStyle: {
              normal: {
                color: (params) => {
                  let colors = [
                    '#4150d8',
                    '#28bf7e',
                    '#ed7c2f',
                    '#f2a93b',
                    '#f9cf36',
                    '#4a5bdc',
                    '#4cd698',
                    '#f4914e',
                    '#fcb75b',
                    '#ffe180',
                    '#b6c2ff',
                    '#96edc1',
                  ]
                  return colors[params.dataIndex]
                },
              },
            },
            xAxisIndex: 0,
            yAxisIndex: 0,
          },
          {
            data: [
              {
                name: '广东省',
                value: 1,
              },
            ],
            label: {
              show: true,
              position: 'inside',
              formatter: '{b}',
              offset: [0, 10],
              textStyle: {
                color: '#777',
              },
            },
            type: 'bar',
            barGap: 0,
            barWidth: '33.33%',
            itemStyle: {
              normal: {
                color: 'rgba(134,176,237, .5)',
              },
            },
            xAxisIndex: 1,
            yAxisIndex: 1,
          },
          {
            data: [
              {
                name: '湖北省',
                value: 1,
              },
            ],
            label: {
              show: true,
              position: 'inside',
              formatter: '{b}',
              offset: [0, 10],
              textStyle: {
                color: '#777',
              },
            },
            type: 'bar',
            barGap: 0,
            barWidth: '33.33%',
            itemStyle: {
              normal: {
                color: 'rgba(40,191,126, .5)',
              },
            },
            xAxisIndex: 1,
            yAxisIndex: 1,
          },
          {
            data: [
              {
                name: '浙江省',
                value: 1,
              },
            ],
            label: {
              show: true,
              position: 'inside',
              formatter: '{b}',
              offset: [0, 10],
              textStyle: {
                color: '#777',
              },
            },
            type: 'bar',
            barGap: 0,
            barWidth: '33.33%',
            itemStyle: {
              normal: {
                color: 'rgba(237,124,47, .5)',
              },
            },
            xAxisIndex: 1,
            yAxisIndex: 1,
          },
        ],
      }
      htChart.setOption(option)
    },
    handleClick() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
    },
  },
}
</script>

<style lang="scss" scoped>
/deep/.el-dialog {
  height: 100%;
  .el-dialog__body{
    padding: 10px 20px;
  }
  .first-chart{
    display: flex;
    flex-direction: column;
    justify-content: center;
    .pie-title{
      margin: 0;
    }
  }
}
</style>
