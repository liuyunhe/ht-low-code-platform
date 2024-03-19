<template>
  <div>
    <h3 class="header">科目账户查询</h3>
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
          <el-form-item label="科目/账号名称">
            <el-input v-model="form.accountname" clearable></el-input>
          </el-form-item>
          <el-form-item label="科目/账号编号">
            <el-input v-model="form.accountno" clearable></el-input>
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
          row-key="accountno"
          border
          default-expand-all
          :tree-props="treeProps"
          v-loading="loading"
        >
          <el-table-column prop="accountno" label="科目编号 " width="180">
          </el-table-column>
          <el-table-column prop="accountname" label="科目名称 ">
          </el-table-column>
          <el-table-column prop="accounttype" label="科目类型" width="180">
            <template slot-scope="scope">
              <span v-if="scope.row.accounttype == 0">汇总科目</span>
              <span v-if="scope.row.accounttype == 1">账户汇总科目</span>
              <span v-if="scope.row.accounttype == 2">明细科目</span>
              <span v-if="scope.row.accounttype == 3">账户</span>
            </template>
          </el-table-column>
          <el-table-column prop="amountdir" label="余额方向 ">
            <template slot-scope="scope">
              <span v-if="scope.row.amountdir == 0">借方</span>
              <span v-if="scope.row.amountdir == 1">贷方</span>
              <span v-if="scope.row.amountdir == 2">往来</span>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="余额"> </el-table-column>
          <el-table-column prop="dailydebitamount" label="当日借方发生额 ">
          </el-table-column>
          <el-table-column prop="dailycreditamount" label="当日贷方发生额 ">
          </el-table-column>
          <el-table-column label="操作 ">
            <template slot-scope="scope">
              <el-button
              v-if="scope.row.children==0"
                @click="handleClick(scope.row)"
                type="text"
                size="small"
                >查询明细</el-button
              >
              <el-button
                type="text"
                size="small"
                @click="changeDetail(scope.row)"
                >查看账户</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>
<script>
import {
  listAccountingbook,
  queryAccAccountsJsonGridTree,
} from '@/api/finance.js'
export default {
  name: 'financeSubject',
  data() {
    return {
      form: {
        accountingbook:'',
        accountname:'',
        accountno:''
      },
      treeProps: {children: 'children', hasChildren: 'hasChildren'},
      bookList: [],
      tableData: [],
      loading: false,
      myaccountno:''
    }
  },
  beforeRouteLeave(to, from, next) {
    const name = to.name
    console.log(to)
    if (name == 'financeDetailed' || name == 'accountDetail') {
      let dataFrom = {
        accountingbook: this.form.accountingbook,
        accountname: this.form.accountname,
        accountno: this.form.accountno,
        myaccountno:to.params.accountno
      }
      localStorage.setItem('dataFrom', JSON.stringify(dataFrom))
    } else {
      localStorage.removeItem('dataFrom')
    }
    next()
  },
  created() {
    const dataFrom =this.dataFrom = localStorage.getItem('dataFrom')
    console.log('dataFrom',dataFrom)
    if (dataFrom) {
      this.form.accountingbook = JSON.parse(dataFrom).accountingbook
      this.form.accountname = JSON.parse(dataFrom).accountname
      this.form.accountno = JSON.parse(dataFrom).accountno
      this.myaccountno = JSON.parse(dataFrom).myaccountno
    }
    this.getlistAccountingbook()
  },
  methods: {
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
    getList() {
      console.log('来了')
      const data = this.form
      this.loading = true
      queryAccAccountsJsonGridTree(data).then((res) => {
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
    // 查询
    onQuery() {
      this.page = 1
      this.pageSize = 10
      this.getList()
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
    handleClick(row) {
      this.$router.push(
        '/ywzx/financeDetailed/' + row.accountingbook + '/' + row.accountno
      )
    },
    changeDetail(row) {
      this.$router.push(
        '/ywzx/accountDetail/' + row.accountingbook + '/' + row.accountno
      )
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
