<template>
  <div>
    <h3 class="header">科目余额平衡查询</h3>
    <div class="main">
      <div>
        <el-form ref="form" :model="form" inline>
          <el-form-item label="账套名称">
            <el-select
              v-model="form.accountingBook"
              placeholder="请选择账套名称"
              clearable
            >
              <el-option
                v-for="(item, index) in bookList"
                :key="index"
                :label="item.accountingname"
                :value="item.accountingbook"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="科目级别">
            <el-select
              v-model="form.accountDegree"
              placeholder="请选择活动区域"
              clearable
            >
              <el-option label="一级科目" value="1"></el-option>
              <el-option label="二级科目" value="2"></el-option>
              <el-option label="三级科目" value="3"></el-option>
              <el-option label="四级科目" value="4"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="活动时间">
            <el-date-picker
              v-model="time"
              type="daterange"
              format="yyyy 年 MM 月 dd 日"
              value-format="yyyy-MM-dd"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              clearable
              @change="getTime"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onQuery">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div>
        <el-table
          :data="tableData"
          style="width: 100%"
          show-summary
          v-loading="loading"
        >
          <el-table-column type="index" label="序号" width="50">
          </el-table-column>
          <el-table-column prop="accountName" label="科目名称" align="center">
          </el-table-column>
          <el-table-column prop="accountNo" label="科目编号" align="center">
          </el-table-column>
          <el-table-column prop="accountDegree" label="科目级别" align="center">
          </el-table-column>
          <el-table-column label="期初余额 " align="center">
            <el-table-column prop="beginAmout" label="借方" align="center">
            </el-table-column>
            <el-table-column prop="name" label="贷方" align="center">
            </el-table-column>
          </el-table-column>
          <el-table-column label="本期发生额" align="center">
            <el-table-column prop="thisDebitAmount" label="借方" align="center">
            </el-table-column>
            <el-table-column
              prop="thisCreditAmount"
              label="贷方"
              align="center"
            >
            </el-table-column>
          </el-table-column>
          <el-table-column label="期末余额" align="center">
            <el-table-column prop="endAmount" label="借方" align="center">
            </el-table-column>
            <el-table-column prop="name" label="贷方" align="center">
            </el-table-column>
          </el-table-column>
        </el-table>
        <el-pagination
          class="right"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="page"
          :page-sizes="[10, 20, 30, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>
<script>
import {listAccountingbook, queryAccountBalanceList} from '@/api/finance.js'
import {dataTime} from '@/utils/time.js'
export default {
  name: 'financeBalance',
  data() {
    return {
      form: {},
      tableData: [],
      bookList: [],
      time: [],
      total: 5,
      page: 1,
      pageSize: 10,
      loading: false,
    }
  },
  created() {
    this.getlistAccountingbook()
  },
  methods: {
    getlistAccountingbook() {
      listAccountingbook().then((res) => {
        const {data} = res
        if (data.state) {
          this.bookList = data.value
          if (this.bookList.length > 0) {
            this.form.accountingBook = this.bookList[0].accountingbook
            this.form.beginDate = dataTime(new Date())
            this.form.endDate = dataTime(new Date())
            this.time.push(this.form.beginDate, this.form.endDate)
            this.getList()
          }
        }
      })
    },
    getTime(val) {
      this.form.beginDate = val[0]
      this.form.endDate = val[1]
    },
    // 查询
    onQuery() {
      this.page = 1
      this.pageSize = 10
      this.getList()
    },
    getList() {
      const data = this.form
      data.page = this.page
      data.pageSize = this.pageSize
      this.loading = true
      queryAccountBalanceList(data).then((res) => {
        const {data} = res
        this.loading = false
        console.log(data)
        if (data.state) {
          this.tableData = data.value.rows
          this.total = data.value.total
        }
      })
    },
    // 调整每页显示条数
    handleSizeChange(val) {
      this.pageSize = val
      this.page = 1
      this.getList()
    },
    // 调整第几页
    handleCurrentChange(val) {
      this.page = val
      this.getList()
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
.right {
  text-align: right;
  margin-top: 20px;
}
</style>
