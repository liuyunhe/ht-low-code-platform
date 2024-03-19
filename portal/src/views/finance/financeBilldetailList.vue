<template>
  <div>
    <h3 class="header">对账管理</h3>
    <div class="main">
      <el-table
        :data="tableData"
        style="width: 100%; margin-top: 20px"
        border
      >
        <el-table-column type="index" align="center"> </el-table-column>
        <el-table-column prop="transNo" label="订单编号 "> </el-table-column>
        <el-table-column label="应到金额">
          <template slot-scope="scope">
            <span>{{ scope.row.transAmount - scope.row.totalFeeAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="withdrawAmount" label="实到金额 ">
        </el-table-column>
        <el-table-column prop="description" label="订单描述"> </el-table-column>
        <el-table-column prop="transTime" label="交易时间"> </el-table-column>
      </el-table>
      <div class="btn">
        <el-button @click="goBack">返回</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import {merchantDetailAccount} from '@/api/finance.js'
export default {
  name: 'financeBilldetailList',
  data() {
    return {
      form: {},
      tableData: [
        {
          id: 1,
          date: '100/200',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄',
        },
        {
          id: 2,
          date: '2016-05-04',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1517 弄',
        },
        {
          id: 3,
          date: '2016-05-01',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1519 弄',
        },
        {
          id: 4,
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1516 弄',
        },
      ],
    }
  },
  created() {
    console.log(this.$route)
    const params = this.$route.params
    this.wholeLoading = this.$loading({
      lock: true,
      text: 'Loading',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)',
    })

    this.merchantDetailAccount(params)
  },
  methods: {
    merchantDetailAccount(data) {
      this.loading = true
      merchantDetailAccount(data).then((res) => {
        const {data} = res
        this.wholeLoading.close()
        if (data.state) {
          this.tableData = data.value
          if(data.value.length==0){
            this.$router.back()
          }
        }
      })
    },
    // 查询
    onQuery() {},
    // 调整每页显示条数
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
    },
    // 调整第几页
    handleCurrentChange(val) {
      // console.log(`当前页: ${val}`);
    },
    goBack() {
      this.$router.back()
    },
  },
}
</script>
<style scoped>
.header {
  padding: 10px 20px;
  margin-bottom: 0;
  border-bottom: 1px solid #ccc;
  margin-top: 8px;
  background: #fff;
  font-size: 14px;
}
.main {
  padding: 10px 20px 20px 20px;
}
.btn {
  text-align: center;
  margin-top: 50px;
}
</style>
