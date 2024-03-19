<template>
  <div>
    <h3 class="header">地址查询</h3>
    <div class="main">
      <div>
        <el-form ref="form" :model="form" inline label-width="80px">
          <el-form-item label="地址">
            <el-input v-model="form.address" placeholder="请输入省/市/区/详细地址"></el-input>
          </el-form-item>
          <el-form-item label="联系人">
            <el-input v-model="form.contactName"></el-input>
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="form.contactPhone"></el-input>
          </el-form-item>
          <el-form-item label="证件号码">
            <el-input v-model="form.contactCertNo"></el-input>
          </el-form-item>
          <el-form-item label="合同编码">
            <el-input v-model="form.contractCode"></el-input>
          </el-form-item>
          <el-form-item label="合同类型">
            <el-select
              v-model="form.contractType"
              placeholder=""
              clearable
            >
              <el-option label="自来水" value="water"></el-option>
              <el-option label="燃气" value="gas"></el-option>
              <el-option label="热力" value="heating"></el-option>
            </el-select>
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
          <el-table-column type="index" label="序号" width="50" align="center">
          </el-table-column>
          <el-table-column prop="province" label="省" align="center">
          </el-table-column>
          <el-table-column prop="city" label="市" align="center">
          </el-table-column>
          <el-table-column prop="area" label="区" align="center">
          </el-table-column>
          <el-table-column prop="streetTown" label="街道/乡镇" align="center">
          </el-table-column>
          <el-table-column prop="communityName" label="小区名称" show-overflow-tooltip align="center">
          </el-table-column>
          <el-table-column prop="buildingNo" label="楼号" align="center">
          </el-table-column>
          <el-table-column prop="unitNo" label="单元号" align="center">
          </el-table-column>
          <el-table-column prop="floorNo" label="层号" align="center">
          </el-table-column>
          <el-table-column prop="roomNo" label="房间号" align="center">
          </el-table-column>
          <el-table-column prop="address" label="详细地址" show-overflow-tooltip align="center">
          </el-table-column>
          <el-table-column prop="accountingArea" label="核算面积" align="center">
            <template slot-scope="scope">
              <span >{{  scope.row.accountingArea == 'null' ? '' :  scope.row.accountingArea }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="longitude" label="经度" show-overflow-tooltip align="center">
          </el-table-column>
          <el-table-column prop="latitude" label="维度" show-overflow-tooltip align="center">
          </el-table-column>
          <el-table-column prop="altitude" label="海拔" align="center">
          </el-table-column>
          <el-table-column prop="state" label="状态" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.state == 1">成功</span>
              <span v-if="scope.row.state == 2">数据重复</span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" show-overflow-tooltip align="center">
          </el-table-column>
          <el-table-column label="操作" align="center" width="100px">
            <template slot-scope="scope">
              <el-button
                @click.native.prevent="handleDetail(scope.row)"
                type="text"
                size="small">
                详情
              </el-button>
              <el-button
                @click.native.prevent="handleEdit(scope.row)"
                type="text"
                size="small">
                编辑
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
import {listAccountingbook, queryAddressList} from '@/api/finance.js'
import {dataTime} from '@/utils/time.js'
export default {
  name: 'financeBalance',
  data() {
    return {
      form: {
        address:null,
        contractCode:null,
        contractType:null,
        contactName:null,
        contactPhone:null,
        contactCertNo:null
      },
      tableData: [
        {
          "LONGITUDE": "117.084961",
          "STATE": "1",
          "isStartFlow": true,
          "UNIT_NO": "1单元",
          "ALTITUDE": "0",
          "STREET_TOWN": "",
          "COMMUNITY_NAME": "你好啊，你是哪里",
          "FLOOR_NO": "",
          "ROOM_NO": "102室",
          "unify_id": "729469262359433216",
          "AREA": "泰山区",
          "CITY": "泰安市",
          "BUILDING_NO": "人啊1号楼",
          "ADDRESS": "山东省泰安市泰山区你好啊，你是哪里人啊1号楼01单元0102室",
          "ACCOUNTING_AREA": "null",
          "CREATE_BY": "-1",
          "PROVINCE": "山东省",
          "CREATE_TIME": "2023-10-25 13:02:59",
          "LATITUDE": "36.195438"
        }
      ],
      bookList: [],
      time: [],
      total: 5,
      page: 1,
      pageSize: 10,
      loading: false,
    }
  },
  created() {
    this.getList()
    // this.getlistAccountingbook()
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
      queryAddressList(data).then((res) => {
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
    handleDetail(row) {
      console.log(row)
      this.$router.push(`/ywzx/template/form/dzgl/get/true?id=${row.unifyId}&startFlow=false`)
     },
    handleEdit(row) {
      this.$router.push(`/ywzx/template/form/dzgl/edit/true?id=${row.unifyId}&startFlow=false`)
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
</style>
