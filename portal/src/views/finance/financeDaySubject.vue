<template>
  <div>
    <h3 class="header">科目日汇总</h3>
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
          <el-form-item label="账户号/科目编号">
            <el-input v-model="form.accountno" clearable></el-input>
          </el-form-item>
          <el-form-item label="日期">
            <el-date-picker
              v-model="form.totaldate"
              type="date"
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
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
          ref="theTable"
          :data="tableData"
          style="width: 100%; margin-bottom: 20px"
          row-key="accountNo"
          border 
          default-expand-all
          :tree-props="treeProps"
          v-loading="loading"
        >
          <el-table-column prop="accountNo" label="科目编号 "  >
          </el-table-column>
          
          <el-table-column prop="year" label="年份" >
          </el-table-column>
          <el-table-column prop="amount" label="余额合计 "> </el-table-column>
          <el-table-column prop="debitAmount" label="借方发生额合计"> </el-table-column>
          <el-table-column prop="debitCount" label="借方笔数合计 ">
          </el-table-column>
          <el-table-column prop="creditAmount" label="贷方发生额合计 ">
          </el-table-column>
          <el-table-column prop="creditCount" label="贷方笔数合计 ">
          </el-table-column>
          <el-table-column prop="integralAmount" label="积数合计 ">
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间 ">
          </el-table-column>
        </el-table>
        <!-- <el-pagination
          class="right"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="page"
          :page-sizes="[10, 20, 30, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination> -->
      </div>
    </div>
  </div>
</template>
<script>
import {
  listAccountingbook,
  queryAccountDailySummary
} from '@/api/finance.js'

export default {
  name:'financeDaySubject',
  data() {
    return {
      form: {
        totaldate: "", //业务日期
        accountingbook: "", //账套(当前默认)
        accountno: "" //账户号/科目编号
      },
      treeProps: {children: 'children', hasChildren: 'hasChildren'},
      tableData: [],
      bookList: [],
      loading: false,
    }
  },
  created(){
    const that = this
    that.getlistAccountingbook()
  },
  methods: {
    // 查询按钮
    onQuery() {
      this.getList()
    },
    // 获取账套列表
    getlistAccountingbook() {
      listAccountingbook().then((res) => {
        const {data} = res
        if (data.state) {
          this.bookList = data.value
          if (this.bookList.length > 0&&this.form.accountingbook=='') {
            this.form.accountingbook = this.bookList[0].accountingbook
          }
          this.getList()
        }
      })
    },
    // 获取列表信息
    getList() {
      console.log('来了')
      const data = this.form
      this.loading = true
      queryAccountDailySummary(data).then((res) => {
        console.log("res=>",res)
        this.loading = false
        const {data} = res
        if (data.state) {
          this.tableData = data.value
          
          if (this.form.accountname || this.form.accountno) {
            this.loop(this.tableData,this.form.accountno,this.form.accountname)
          }else {
            this.forArr(this.tableData, false)
          }
        }
      })
    },
    forArr(arr, isExpand) {
      arr.forEach((i) => {
        this.$nextTick(() => {
          this.$refs.theTable.toggleRowExpansion(i, isExpand)
        })
        if (i.children) {
          this.forArr(i.children, isExpand)
        }
      })
    },
    // 递归循环查询
    loop(data, accountno, accountname) {
      data.map((item) => {
        if (item.accountno == accountno|| item.accountno == accountname) {
          this.$nextTick(() => {
            this.$refs.theTable.toggleRowExpansion(item, false)
          })
          if(item.children){
            this.forArr(item.children,false)
          }
        }else if(item.children){
          this.loop(item.children,this.form.accountno,this.form.accountname)
        }
      })
    },
    // 调整每页显示条数
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
    },
    // 调整第几页
    handleCurrentChange(val) {
      // console.log(`当前页: ${val}`);
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
