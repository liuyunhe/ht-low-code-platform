<template>
  <div>
    <h3 class="header">对账管理</h3>
    <div class="main">
      <div>
        <el-button type="primary" @click="checkBill">对账</el-button>
      </div>
      <div style="margin-top: 20px">
        <el-form ref="form" :model="form" inline>
          <el-form-item label="账套名称">
            <el-select
              v-model="form.accountingBook"
              placeholder="请选择账套名称"
            >
              <el-option
                v-for="(item, index) in bookList"
                :key="index"
                :label="item.accountingname"
                :value="item.accountingbook"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="商户名称">
            <el-input v-model="form.merchantName"></el-input>
          </el-form-item>
          <el-form-item label="日期">
            <el-date-picker
              v-model="form.accountDate"
              type="date"
              placeholder="选择日期"
              format="yyyy 年 MM 月 dd 日"
              value-format="yyyy-MM-dd"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onQuery">查询</el-button>
          </el-form-item>
        </el-form>
        <el-table
          :data="tableData"
          style="width: 100%"
          border
          @selection-change="select"
          v-loading="loading"
        >
          <el-table-column type="selection" width="55" align="center">
          </el-table-column>
          <el-table-column prop="custName" label="名称 " align="center">
          </el-table-column>
          <!-- <el-table-column prop="accountingBook" label="账套名称"> 

          </el-table-column> -->
          <el-table-column
            prop="creditAmount"
            label="记账总金额 "
            align="center"
          >
          </el-table-column>
          <el-table-column prop="creditCount" label="记账总笔数" align="center">
          </el-table-column>
          <el-table-column
            prop="totalAmount"
            label="渠道总金额 "
            align="center"
          >
          </el-table-column>
          <el-table-column prop="totalCount" label="渠道总笔数 " align="center">
          </el-table-column>
          <el-table-column prop="stateStr" label="状态 " align="center">
          </el-table-column>
          <!-- <el-table-column prop="errorMsg" label="失败原因">
          </el-table-column> -->
          <el-table-column prop="channelTypeStr" label="来源 " align="center">
          </el-table-column>
          <!-- <el-table-column prop="totalDate" label="日期 ">
          </el-table-column> -->
          <el-table-column label="操作 " align="center">
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.state == 2"
                @click="errReason(scope.row)"
                type="text"
                size="small"
              >
                失败原因
              </el-button>
              <el-button
                @click="handleClick(scope.row)"
                type="text"
                size="small"
              >
                查询明细
              </el-button>
              <el-button
                v-if="scope.row.state == 2"
                @click="handMove(scope.row)"
                type="text"
                size="small"
              >
                手动对账
              </el-button>
            </template>
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
import {
  listAccountingbook,
  queryMerchantAccountInfo,
  merchantTotalAccount,
} from '@/api/finance.js'
export default {
  name: 'financeBill',
  data() {
    return {
      form: {},
      tableData: [],
      bookList: [],
      total: 5,
      page: 1,
      pageSize: 10,
      selectionList: [],
      loading: false,
    }
  },
  beforeRouteLeave(to, from, next) {
    const name = to.name
    console.log(to)
    if (name == 'financeBillDetail' || name == 'financeBilldetailList') {
      let dataFrom = {
        accountingBook: this.form.accountingBook,
        accountDate: this.form.accountDate,
        merchantName: this.form.merchantName,
        pageSize: this.pageSize,
        page: this.page,
      }
      localStorage.setItem('dataFrom', JSON.stringify(dataFrom))
    } else {
      localStorage.removeItem('dataFrom')
    }
    next()
  },
  created() {
    const dataFrom = localStorage.getItem('dataFrom')
    console.log(dataFrom)
    if (dataFrom) {
      this.form.accountingBook = JSON.parse(dataFrom).accountingBook
      this.form.accountDate = JSON.parse(dataFrom).accountDate
      this.form.merchantName = JSON.parse(dataFrom).merchantName
      this.pageSize = JSON.parse(dataFrom).pageSize
      this.page = JSON.parse(dataFrom).page
      this.onQuery()
    }
    this.getlistAccountingbook()
  },
  methods: {
    getlistAccountingbook() {
      listAccountingbook().then((res) => {
        const {data} = res
        if (data.state) {
          this.bookList = data.value
        }
      })
    },
    // 查询
    onQuery() {
      this.loading = true
      const data = {
        accountingBook: this.form.accountingBook,
        accountDate: this.form.accountDate,
        merchantName: this.form.merchantName,
        pageSize: this.pageSize,
        page: this.page,
      }
      queryMerchantAccountInfo(data).then((res) => {
        const {data} = res
        this.loading = false
        if (data.state) {
          this.tableData = data.value.rows
          this.total = data.value.total
        }
      })
    },
    // 调整每页显示条数
    handleSizeChange(val) {
      this.page = 1
      this.pageSize = val
      this.onQuery()
    },
    // 调整第几页
    handleCurrentChange(val) {
      // console.log(`当前页: ${val}`);
      this.page = val
      this.onQuery()
    },
    select(selection) {
      this.selectionList = selection
      console.log(selection)
    },
    checkBill() {
      if (this.selectionList.length > 0) {
        const merchantTotalAccountDetailDTOList = []
        this.selectionList.map((item) => {
          let obj = {
            accountDate: item.totalDate,
            merchantCode: item.custId,
          }
          merchantTotalAccountDetailDTOList.push(obj)
        })
        const data = {
          accountingBook: this.form.accountingBook,
          merchantTotalAccountDetailDTOList: merchantTotalAccountDetailDTOList,
        }
        merchantTotalAccount(data).then((res) => {
          const {data} = res
          if (data.state) {
            this.$message.success('对账完成')
            this.onQuery()
          }
        })
      } else {
        this.$message.warning('请先选择对账信息')
      }
    },
    handleClick(row) {
      this.$router.push('/ywzx/financeBillDetail')
    },
    handMove(row) {
      this.$router.push(
        '/ywzx/financeBilldetailList/' +
          this.form.accountingBook +
          '/' +
          row.totalDate +
          '/' +
          row.custId
      )
    },
    errReason(row) {
      this.$notify.error({
        title: '失败原因',
        message: row.errorMsg,
      })
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
.el-dialog__title {
  font-size: 16px !important;
}
</style>
