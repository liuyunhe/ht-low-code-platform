<template>
  <div>
    <h3 class="header">账户详情</h3>
    <div class="main">
      <el-descriptions title="" size="medium" :column="5" border direction="vertical" class="mt-30">
        <el-descriptions-item label="科目编号">{{
          dataDetail.accountno
        }}</el-descriptions-item>
        <el-descriptions-item v-if="dataDetail.courseno" label="上级科目编号">{{
          dataDetail.courseno
        }}</el-descriptions-item>
        <el-descriptions-item label="科目名称">{{
          dataDetail.accountname
        }}</el-descriptions-item>
        <el-descriptions-item label="科目类型">
          <span v-if="dataDetail.accounttype == 0">汇总科目</span>
          <span v-if="dataDetail.accounttype == 1">账户汇总科目</span>
          <span v-if="dataDetail.accounttype == 2">明细科目</span>
          <span v-if="dataDetail.accounttype == 3">账户</span>
        </el-descriptions-item>
        <el-descriptions-item label="余额方向">
          <span v-if="dataDetail.amountdir == 0">借方</span>
          <span v-if="dataDetail.amountdir == 1">贷方</span>
          <span v-if="dataDetail.amountdir == 2">往来</span>
        </el-descriptions-item>
        <el-descriptions-item label="余额">
          {{ dataDetail.amount }}
        </el-descriptions-item>
        <el-descriptions-item label="日借方发生额合计">
          {{ dataDetail.dailydebitamount }}
        </el-descriptions-item>
        <el-descriptions-item label="日借方笔数合计">
          {{ dataDetail.dailydebitcount }}
        </el-descriptions-item>
        <el-descriptions-item label="历史借方发生额合计">
          {{ dataDetail.totaldebitamount }}
        </el-descriptions-item>
        <el-descriptions-item label="历史借方笔数合计">
          {{ dataDetail.totaldebitcount }}
        </el-descriptions-item>
        <el-descriptions-item label="日贷方发生额合计">
          {{ dataDetail.dailycreditamount }}
        </el-descriptions-item>
        <el-descriptions-item label="日贷方笔数合计">
          {{ dataDetail.dailycreditcount }}
        </el-descriptions-item>
        <el-descriptions-item label="历史贷方发生额合计">
          {{ dataDetail.totalcreditamount }}
        </el-descriptions-item>
        <el-descriptions-item label="历史贷方笔数合计">
          {{ dataDetail.totalcreditcount }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <span v-if="dataDetail.status==1">正常</span>
          <span v-if="dataDetail.status==2">销户</span>
          <span v-if="dataDetail.status==3">挂起</span>
          <span v-if="dataDetail.status==4">挂失</span>
          <span v-if="dataDetail.status==5">冻结</span>
        </el-descriptions-item>
        <el-descriptions-item label="开户日期">
          {{ dataDetail.opendate }}
        </el-descriptions-item>
        <el-descriptions-item v-if="dataDetail.status==2" label="销户日期">
          {{ dataDetail.closedate }}
        </el-descriptions-item>
      </el-descriptions>
      <div class="btn">
        <el-button @click="goBack">返回</el-button>
      </div>
    </div>
  </div>
</template>
  <script>
import {queryAccountDetail} from '@/api/finance.js'
export default {
  name: 'accountDetail',
  data() {
    return {
      form: {},
      dataDetail: {},
    }
  },
  created() {
    const accountingbook = this.$route.params.accountingbook
    const accountno = this.$route.params.accountno
    this.form.accountno = accountno
    this.form.accountingbook = accountingbook
    this.getList()
  },
  methods: {
    getList() {
      const data = this.form
      this.loading = true
      queryAccountDetail(data).then((res) => {
        this.loading = false
        const {data} = res
        console.log(data)
        if (data.state) {
          this.dataDetail = data.value
        }
      })
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
.mt-30 {
  margin-top: 30px;
}
.right {
  text-align: right;
  margin-top: 20px;
}
.btn {
  text-align: center;
  margin-top: 50px;
}
</style>
  