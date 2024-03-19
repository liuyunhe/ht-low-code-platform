<template>
  <div>
    <h3 class="header">支付到账统计</h3>
    <div class="main">
      <div>
        <el-form ref="form" :model="form" inline>
          <el-form-item label="客户名称">
            <el-input v-model="form.custName" clearable></el-input>
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
          border stripe
          default-expand-all
          v-loading="loading"
        >
          <el-table-column prop="custName" label="客户名称 " width="280">
          </el-table-column>
          <el-table-column prop="settledAmount" label="结算金额 ">
          </el-table-column>
          <el-table-column prop="unSettledAmount" label="未结算金额"> </el-table-column>
        </el-table>
        <el-pagination
          class="right"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="form.page"
          :page-sizes="[10, 20, 30, 50, 100]"
          :page-size="form.pageSize"
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
  queryAccountForOrgName
} from '@/api/finance.js'
export default {
  name: 'financeSubject',
  data() {
    return {
      form: {
        custName: "", //客户名称（非必填）
        page: 1, //页码
        pageSize: 10 //页数
      },
      total:'',
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
    // const dataFrom =this.dataFrom = localStorage.getItem('dataFrom')
    // console.log('dataFrom',dataFrom)
    // if (dataFrom) {
    //   this.form.accountingbook = JSON.parse(dataFrom).accountingbook
    //   this.form.accountname = JSON.parse(dataFrom).accountname
    //   this.form.accountno = JSON.parse(dataFrom).accountno
    //   this.myaccountno = JSON.parse(dataFrom).myaccountno
    // }
    this.getList()
  },
  methods: {
    getList() {
      console.log('来了')
      const data = this.form
      this.loading = true
      queryAccountForOrgName(data).then((res) => {
        this.loading = false
        const {data} = res
        if (data.state) {
          this.tableData = data.value.rows
          this.total = data.value.total
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
    // 调整每页显示条数
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
      this.form.pageSize = val
      this.getList()
    },
    // 调整第几页
    handleCurrentChange(val) {
      // console.log(`当前页: ${val}`);
      this.form.page = val
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
