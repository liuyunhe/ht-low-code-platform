<template>
  <div>
    <h3 class="header">开销户查询</h3>
    <div class="main">
      <div>
        <el-form ref="form" :model="form" inline>
          <el-form-item label="账套名称">
            <el-select
              v-model="form.accountingbook"
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
          <el-form-item label="开销户时间">
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
          <el-form-item>
            <el-button type="primary" @click="onQuery">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-descriptions
        class="margin-top"
        title=""
        direction="vertical"
        :column="3"
        size="medium "
        border
      >
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-user-solid"></i>
            账套名称
          </template>
          {{tableData.accountingBookName}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-success"></i>
            开户数
          </template>
          {{tableData.openNum}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-error"></i>
            销户数
          </template>
          {{tableData.cancelNum}}
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>
<script>
import {listAccountingbook, queryOpenAndCancelAccounts} from '@/api/finance.js'
import {dataTime} from '@/utils/time.js'
export default {
  name:'financeAccount',
  data() {
    return {
      form: {},
      time: [],
      bookList: [],
      tableData: {},
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
          this.form.accountingbook = this.bookList[0].accountingbook
          this.form.beginDate = dataTime(new Date())
          this.form.endDate = dataTime(new Date())
          this.time.push(this.form.beginDate, this.form.endDate)
          this.getList()
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
      queryOpenAndCancelAccounts(data).then((res) => {
        const {data} = res
        console.log(data)
        if (data.state) {
          this.tableData = data.value
        }
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
</style>
