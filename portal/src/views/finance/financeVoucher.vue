<template>
  <div>
    <h3 class="header">记账凭证查询</h3>
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
          <el-form-item label="凭证类型">
            <el-select
              v-model="form.voucherType"
              placeholder="请选择凭证类型"
              clearable
            >
              <el-option label="全部" value=""></el-option>
              <el-option label="银收" value="1"></el-option>
              <el-option label="银付" value="2"></el-option>
              <el-option label="转账" value="3"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="凭证起止时间">
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
          <el-form-item label="凭证起止编号">
            <el-col :span="11">
              <el-form-item prop="date1">
                <el-input v-model="form.beginSysVoucherNo" clearable></el-input>
              </el-form-item>
            </el-col>
            <el-col class="line" :span="1">-</el-col>
            <el-col :span="11">
              <el-form-item prop="date2">
                <el-input v-model="form.endSysVoucherNo" clearable></el-input>
              </el-form-item>
            </el-col>
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
          v-loading="loading"
          border
        >
          <el-table-column prop="topCourseNo" label="一级科目" align="center">
          </el-table-column>
          <el-table-column prop="accountNo" label="末级科目" align="center">
          </el-table-column>
          <el-table-column prop="operationTypes" label="借贷" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.operationTypes == 0">借</span>
              <span v-if="scope.row.operationTypes == 1">贷</span>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="发生额" align="center">
          </el-table-column>
          <el-table-column prop="billName" label="票种" align="center">
          </el-table-column>
          <el-table-column prop="billNo" label="票据号" align="center">
          </el-table-column>
          <el-table-column prop="flowNo" label="凭证编号" align="center">
          </el-table-column>
          <el-table-column prop="abstractStr" label="	摘要" align="center">
          </el-table-column>
          <el-table-column prop="voucherName" label="凭证类型" align="center">
          </el-table-column>
          <el-table-column prop="voucherDate" label="凭证日期" align="center">
          </el-table-column>
          <el-table-column prop="append" label="附件张数" align="center">
          </el-table-column>
          <el-table-column prop="totalAmount" label="合计" align="center">
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
import {listAccountingbook, queryAccVoucherDetailInfos} from '@/api/finance.js'
import {dataTime} from '@/utils/time.js'
export default {
  name:'financeVoucher',
  data() {
    return {
      form: {
        voucherType: '',
      },
      tableData: [],
      bookList: [],
      total: 5,
      page: 1,
      pageSize: 10,
      num: '2016020000000010',
      time: [],
      loading: false,
    }
  },
  created() {
    this.getlistAccountingbook()
  },
  methods: {
    // 查询
    onQuery() {
      this.page = 1
      this.pageSize = 10
      this.getList()
    },
    getlistAccountingbook() {
      listAccountingbook().then((res) => {
        const {data} = res
        if (data.state) {
          this.bookList = data.value
          this.form.accountingBook = this.bookList[0].accountingbook
          this.form.beginDate = dataTime(new Date())
          this.form.endDate = dataTime(new Date())
          this.time.push(this.form.beginDate, this.form.endDate)
          this.getList()
        }
      })
    },
    getList() {
      const data = this.form
      data.page = this.page
      data.pageSize = this.pageSize
      this.loading = true
      queryAccVoucherDetailInfos(data).then((res) => {
        const {data} = res
        this.loading = false
        console.log(data)
        if (data.state) {
          this.tableData = data.value.rows
          this.total = data.value.total
        }
      })
    },
    getTime(val) {
      this.form.beginDate = val[0]
      this.form.endDate = val[1]
    },
    // 调整每页显示条数
    handleSizeChange(val) {
      this.pageSize = val
      this.page=1
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
.table {
  margin-bottom: 30px;
}
</style>
