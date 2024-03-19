<template>
  <div>
    <h3 class="header">科目明细账查询</h3>
    <div class="main">
      <div>
        <el-form ref="form" :model="form" inline>
          <el-form-item label="账套名称">
            <el-select
              v-model="form.accountingbook"
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
          <el-form-item label="科目/账号">
            <el-input v-model="form.accountNo" clearable></el-input>
          </el-form-item>
          <el-form-item label="查询类型">
            <el-select
              v-model="form.onDateOrFlowNo"
              placeholder="请选择查询类型"
              @change="getChage"
              clearable
            >
              <el-option label="记账时间" value="0"></el-option>
              <el-option label="流水号" value="1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="记账时间" v-if="isShow == 0">
            <el-date-picker
              v-model="time"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              clearable
              @change="getTime"
              format="yyyy 年 MM 月 dd 日"
              value-format="yyyy-MM-dd"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="流水号" v-if="isShow == 1">
            <el-col :span="11">
              <el-form-item prop="date1">
                <el-input v-model="form.flowNoBegin" clearable></el-input>
              </el-form-item>
            </el-col>
            <el-col class="line" :span="1">-</el-col>
            <el-col :span="11">
              <el-form-item prop="date2">
                <el-input v-model="form.flowNoEnd" clearable></el-input>
              </el-form-item>
            </el-col>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onQuery">查询</el-button>
            <el-button type="primary">导出</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div>
        <el-table
          :data="tableData"
          style="width: 100%"
          show-summary
          v-loading="loading"
          border
        >
          <el-table-column type="index" label="序号" width="50">
          </el-table-column>
          <el-table-column prop="flowno" label="流水号" align="center">
          </el-table-column>
          <el-table-column prop="ondate" label="日期" align="center">
          </el-table-column>
          <el-table-column prop="voucherno" label="凭证号" align="center">
          </el-table-column>
          <el-table-column
            prop="operationTypes"
            label="借贷标识 "
            align="center"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.operationTypes == 0">借</span>
              <span v-if="scope.row.operationTypes == 1">贷</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="amount"
            label="金额"
            align="center"
          ></el-table-column>
          <el-table-column prop="amountdir" label="余额方向" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.amountdir == 0">借</span>
              <span v-if="scope.row.amountdir == 1">贷</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="creditamount"
            label="余额"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="abstracts"
            label="摘要"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="billname"
            label="票据名称"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="billno"
            label="票据号码"
            align="center"
          ></el-table-column>
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
import {listAccountingbook, listAccDetailListPage} from '@/api/finance.js'
import {dataTime} from '@/utils/time.js'
export default {
  name: 'financeDetailed',
  data() {
    return {
      form: {},
      tableData: [],
      isShow: '3',
      total: 5,
      page: 1,
      pageSize: 10,
      loading: false,
      bookList: [],
      time: []
    }
  },
  created() {
    const accountingbook = this.$route.params.accountingbook
    const accountno = this.$route.params.accountno
    if (accountingbook && accountno) {
      this.form.accountNo = accountno
      this.form.accountingbook = accountingbook
    }
    this.getlistAccountingbook(accountingbook, accountno)
  },
  methods: {
    getlistAccountingbook(accountingbook, accountno) {
      listAccountingbook().then(res => {
        const {data} = res
        if (data.state) {
          this.bookList = data.value
          if (!accountingbook || !accountno) {
            this.form.accountingbook = this.bookList[0].accountingbook
          }
          this.form.beginDate = dataTime(new Date())
          this.form.endDate = dataTime(new Date())
          this.time.push(this.form.beginDate, this.form.endDate)
          this.isShow = this.form.onDateOrFlowNo = '0'
          // this.getList()
        }
      })
    },
    getTime(val) {
      this.form.beginDate = val[0]
      this.form.endDate = val[1]
    },
    getList() {
      const data = this.form
      data.page = this.page
      data.pageSize = this.pageSize
      this.loading = true
      listAccDetailListPage(data).then(res => {
        const {data} = res
        this.loading = false
        if (data.state) {
          this.tableData = data.value.rows
          this.total = data.value.total
        }
      })
    },
    getChage(val) {
      this.isShow = val
      if (val == '') {
        this.isShow = '3'
      }
    },
    // 查询
    onQuery() {
      this.page = 1
      this.pageSize = 10
      this.getList()
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
    }
  }
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
