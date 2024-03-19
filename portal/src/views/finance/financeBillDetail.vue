<template>
  <div>
    <h3 class="header">对账详情</h3>
    <div class="main">
      <!-- <div style="margin-bottom:20px">
        <el-form ref="form" :model="form" inline>
          <el-form-item label="科目/账号名称">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
          <el-form-item label="科目/账号编号">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
          <el-form-item label="日期">
            <el-date-picker
              v-model="form.value1"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onQuery">查询</el-button>
          </el-form-item>
        </el-form>
      </div> -->
      <!-- <div style="margin-bottom:10px">
        <el-button type="primary">对账</el-button>
      </div> -->
      <div>
        <el-table
          :data="tableData"
          style="width: 100%; margin-top: 20px"
          border
        >
          <!-- <el-table-column type="selection" width="55"> </el-table-column> -->
          <el-table-column prop="date" label="科目编号 "> </el-table-column>
          <el-table-column prop="name" label="科目类型"> </el-table-column>
          <el-table-column prop="address" label="余额方向 "> </el-table-column>
          <el-table-column prop="address" label="余额"> </el-table-column>
          <el-table-column prop="address" label="当日借方发生额 ">
          </el-table-column>
          <el-table-column prop="address" label="当日贷方发生额 ">
          </el-table-column>
          <!-- <el-table-column label="操作 " align="center">
            <template slot-scope="scope">
              <el-button
                @click="handleClick(scope.row)"
                type="text"
                size="small"
                >查询明细</el-button
              >
            </template>
          </el-table-column> -->
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
      <div class="btn">
        <el-button @click="goBack">返回</el-button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name:'financeBillDetail',
  data() {
    return {
      form: {},
      treeProps: {children: 'children'},
      tableData: [
        {
          id: 1,
          date: '2016-05-02',
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
      total: 5,
      page: 1,
      pageSize: 10,
      selectionList: [],
    }
  },
  methods: {
    // 查询
    onQuery() {},
    upLoad() {
      this.$router.push('/ywzx/financeUpload')
    },
    // 调整每页显示条数
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
    },
    // 调整第几页
    handleCurrentChange(val) {
      // console.log(`当前页: ${val}`);
    },
    select(selection) {
      this.selectionList = selection
      console.log(selection)
    },
    handleClick(row) {},
    goBack(){
        this.$router.back()
      } 
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
.btn {
  text-align: center;
  margin-top: 50px;
}
</style>
