<template>
  <div>
    <h3 class="header">处理异常</h3>
    <div class="main">
      <div>
        <div class="mb-20">
          <el-button type="primary" @click="change('modify')">修改</el-button>
          <!-- TODO:删除功能完善，增加二次确认 -->
          <el-button type="danger" @click="toDelete('delete')">删除</el-button>
          <el-button @click="goBack" class="ml-10">返回</el-button>
          <div style="float: right;">
            <el-button type="primary" @click="replaceAll">批量替换</el-button>
          </div>
          <el-dialog :visible.sync="showDialog" title="批量替换" width="500px" :show-close="false">
            <el-form :model="form" ref="Form" :rules="rules" label-width="80px" label-position="left" @submit="onSubmit">
              <el-row>
                <el-col :span="24">
                  <el-form-item label="替换前" prop="source">
                    <el-input v-model="form.source"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item label="替换后" prop="target">
                    <el-input v-model="form.target"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24" style="text-align: center;">
                  <el-button @click="cancel">取消</el-button>
                  <el-button @click="onSubmit" style="margin-left: 10px;" type="primary">确定</el-button>
                </el-col>
              </el-row>
            </el-form>
          </el-dialog>
        </div>

        <el-table
          :data="tableData"
          style="width: 100%"
          border
          @selection-change="handleSelectionChange"
          v-loading="loading"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column type="index" label="序号" width="55">
          </el-table-column>
          <!-- <el-table-column prop="state" label="状态" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.state == 2" style="color: #e6a23c"
                >处理中</span
              >
              <span v-if="scope.row.state == 3" style="color: #f56c6c"
                >处理失败</span
              >
            </template>
          </el-table-column>
          <el-table-column prop="province" label="省" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.province_state != 2">{{
                scope.row.province
              }}</span>
              <el-input
                v-model="scope.row.province"
                v-else
                size="small"
                :placeholder="scope.row.province_errmsg"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="city" label="市" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.city_state != 2">{{ scope.row.city }}</span>
              <el-input
                v-model="scope.row.city"
                v-else
                size="small"
                :placeholder="scope.row.city_errmsg"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="area" label="区" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.area_state != 2">{{ scope.row.area }}</span>
              <el-input
                v-model="scope.row.area"
                v-else
                size="small"
                :placeholder="scope.row.area_errmsg"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="street_town" label="街道/乡镇" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.street_town_state != 2">{{
                scope.row.street_town
              }}</span>
              <el-input
                v-model="scope.row.street_town"
                v-else
                size="small"
                :placeholder="scope.row.street_town_errmsg"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column
            prop="community_name"
            label="小区名称"
            align="center"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.community_name_state != 2">{{
                scope.row.community_name
              }}</span>
              <el-input
                v-model="scope.row.community_name"
                v-else
                size="small"
                :placeholder="scope.row.community_name_errmsg"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="building_no" label="楼名称" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.building_no_state != 2">{{
                scope.row.building_no
              }}</span>
              <el-input
                v-model="scope.row.building_no"
                v-else
                size="small"
                :placeholder="scope.row.building_no_errmsg"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="unit_no" label="单元" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.unit_no_state != 2">{{
                scope.row.unit_no
              }}</span>
              <el-input
                v-model="scope.row.unit_no"
                v-else
                size="small"
                :placeholder="scope.row.unit_no_errmsg"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="room_no" label="房间编号" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.room_no_state != 2">{{
                scope.row.room_no
              }}</span>
              <el-input
                v-model="scope.row.room_no"
                v-else
                size="small"
                :placeholder="scope.row.room_no_errmsg"
              ></el-input>
            </template>
          </el-table-column> -->
          <el-table-column
            prop="meter_no"
            label="表号"
            width="150"
            align="center"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.meter_no_state != 2">{{
                scope.row.meter_no
              }}</span>
              <el-tooltip
                v-else
                effect="dark"
                :content="scope.row.meter_no_errmsg"
                placement="top-start"
              >
                <el-input
                  v-model="scope.row.meter_no"
                  size="small"
                  :placeholder="scope.row.meter_no_errmsg"
                ></el-input>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            prop="contract_number"
            label="合同编号"
            align="center"
            width="150"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.contract_number_state != 2">{{
                scope.row.contract_number
              }}</span>
              <el-tooltip
                v-else
                effect="dark"
                :content="scope.row.contract_number_errmsg"
                placement="top-start"
              >
                <el-input
                  v-model="scope.row.contract_number"
                  size="small"
                  :placeholder="scope.row.contract_number_errmsg"
                ></el-input>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            prop="service_companies"
            label="服务公司"
            align="center"
            width="150"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.service_companies_state != 2">{{
                scope.row.service_companies
              }}</span>
              <el-tooltip
                v-else
                effect="dark"
                :content="scope.row.service_companies_errmsg"
                placement="top-start"
              >
                <el-input
                  v-model="scope.row.service_companies"
                  size="small"
                  :placeholder="scope.row.service_companies_errmsg"
                ></el-input>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            prop="meter_type"
            label="表类型"
            align="center"
            width="150"
          >
            <template slot-scope="scope">
              <div v-if="scope.row.meter_type_state != 2">
                <span v-if="scope.row.meter_type === 'water'">自来水</span>
                <span v-if="scope.row.meter_type === 'gas'">天然气</span>
                <span v-if="scope.row.meter_type === 'heating'">供热</span>
              </div>
              <el-input
                v-model="scope.row.meter_type"
                v-else
                size="small"
                :placeholder="scope.row.meter_type_errmsg"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column
            prop="contacts_name"
            label="联系人姓名"
            align="center"
            width="150"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.contacts_name_state != 2">{{
                scope.row.contacts_name
              }}</span>
              <el-tooltip
                v-else
                effect="dark"
                :content="scope.row.contacts_name_errmsg"
                placement="top-start"
              >
                <el-input
                  v-model="scope.row.contacts_name"
                  size="small"
                  :placeholder="scope.row.contacts_name_errmsg"
                ></el-input>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            prop="nature_of_user"
            label="用户性质"
            align="center"
            width="150"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.nature_of_user_state != 2">{{
                scope.row.nature_of_user
              }}</span>
              <el-tooltip
                v-else
                effect="dark"
                :content="scope.row.nature_of_user_errmsg"
                placement="top-start"
              >
                <el-input
                  v-model="scope.row.nature_of_user"
                  size="small"
                  :placeholder="scope.row.nature_of_user_errmsg"
                ></el-input>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            prop="contacts_phone"
            label="联系电话"
            align="center"
            width="150"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.contacts_phone_state != 2">{{
                scope.row.contacts_phone
              }}</span>
              <el-tooltip
                v-else
                effect="dark"
                :content="scope.row.contacts_phone_errmsg"
                placement="top-start"
              >
                <el-input
                  v-model="scope.row.contacts_phone"
                  size="small"
                  :placeholder="scope.row.contacts_phone_errmsg"
                ></el-input>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            prop="contacts_id"
            label="身份证号"
            width="150"
            align="center"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.contacts_id_state != 2">{{
                scope.row.contacts_id
              }}</span>
              <el-tooltip
                v-else
                effect="dark"
                :content="scope.row.contacts_id_errmsg"
                placement="top-start"
              >
                <el-input
                  v-model="scope.row.contacts_id"
                  size="small"
                  :placeholder="scope.row.contacts_id_errmsg"
                ></el-input>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            prop="address"
            label="地址"
            width="250"
            align="center"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.address_state != 2">{{
                scope.row.address
              }}</span>
              <el-tooltip
                v-else
                effect="dark"
                :content="scope.row.address_errmsg"
                placement="top-start"
              >
                <el-input
                  v-model="scope.row.address"
                  size="small"
                  :placeholder="scope.row.address_errmsg"
                ></el-input>
              </el-tooltip>
            </template>
          </el-table-column>
          <!-- <el-table-column
            prop="accounting_area"
            label="实供面积"
            align="center"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.accounting_area_state != 2">{{
                scope.row.accounting_area
              }}</span>
              <el-input
                v-model="scope.row.accounting_area"
                v-else
                size="small"
                :placeholder="scope.row.accounting_area_errmsg"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.remark_state != 2">{{
                scope.row.remark
              }}</span>
              <el-input
                v-model="scope.row.remark"
                v-else
                size="small"
                :placeholder="scope.row.remark_errmsg"
              ></el-input>
            </template>
          </el-table-column> -->
        </el-table>
        <el-pagination
          class="el-page"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pageNumber"
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
import {searchError, errorHandle,replaceDetail} from '@/api/dataWash.js'
export default {
  name: 'dataWashDetailList',
  data() {
    return {
      id: '',
      flowCode: '',
      tableData: [],
      newTableData: [],
      loading: false,
      pageNumber: 1,
      pageSize: 50,
      total: 0,
      showDialog:false,
      form:{
        batchId:'',
        flowCode:'',
        source:'',
        target:''
      },
      rules: {
        source: [
          { required: true, message: "请输入内容", trigger: "blur" }
        ],
        target: [
          { required: true, message: "请输入内容", trigger: "change" }
        ],
      },
    }
  },
  created() {
    this.id = this.$route.params.id
    this.flowCode = this.$route.params.flowCode
    this.getList()
  },
  methods: {
    // 确认提交
    onSubmit(){
      let _this = this
      _this.$refs.Form.validate((validate)=>{
        if(validate){
          const loading = _this.$loading({
            lock: true,
            text: 'Loading',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          console.log("校验成功");
          // _this.$message.warning('功能开发中。。。')
          _this.form.batchId = this.$route.params.id
          console.log("路由参数=>",_this.$route.params)
          if(_this.$route?.params?.flowCode){
            _this.form.flowCode = _this.$route.params.flowCode
          }
          replaceDetail(_this.form).then((res)=>{
            console.log("替换接口返回=>",res)
            if(res.data?.state){
              loading.close()
              _this.$message.success('替换成功')
              _this.goBack()
            }else{
              loading.close()
              _this.$message.error(res.data?.message)
            }
          })
        }else{
          console.log("校验失败");
        }
      })
    },
    // 取消
    cancel(){
      this.showDialog = false
    },
    // 弹出对话框
    replaceAll() {
      const _this = this
      _this.form = {
        batchId:'',
        flowCode:'',
        source:'',
        target:''
      },
      _this.showDialog = true
    },
    goBack() {
      this.$router.back()
    },
    getList() {
      this.loading = true
      const data = {
        batchId: this.id,
        flowCode: this.flowCode,
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
      }
      searchError(data).then((res) => {
        this.loading = false
        const {data} = res
        const {value} = data
        if (data.state) {
          this.tableData = value.data
          this.total = value.count
        }
        console.log(value)
      })
    },
    handleSizeChange(val) {
      this.pageNumber = 1
      this.currentPage = 1
      this.pageSize = val
      this.getList()
      console.log(`每页 ${val} 条`)
    },
    handleCurrentChange(val) {
      this.pageNumber = val
      this.getList()
      console.log(`当前页: ${val}`)
    },
    handleSelectionChange(row) {
      this.newTableData = row
      console.log(row)
    },
    // 删除功能
    toDelete(flag){
      const _this = this
      if (!_this.newTableData.length > 0) {
        _this.$message.warning('至少需要选择一条进行删除')
        return
      }
      let length_ = _this.newTableData.length
      _this.$confirm(`确定删除这${length_}条数据吗？`)
      .then(()=>{
        _this.change(flag)
      })
      .catch(()=>{})
    },
    // 20231025 ninghua 新增参数区分修改还是删除 删除"delete"， 修改"modify"
    change(flag) {
      console.log(this.tableData)
      if (this.newTableData.length > 0) {
        const data = {
          batchId: this.id,
          flowCode: this.flowCode,
          data: this.newTableData,
          flag:flag,
        }
        const loading = this.$loading({
          lock: true,
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)',
        })
        errorHandle(data).then((res) => {
          const {data} = res
          loading.close()
          if (data.state) {
            this.$message.success('处理成功')
            this.$router.go(-1)
            // this.getList()
          } else {
            this.$message.error(data.message)
          }
        })
      } else {
        this.$message.warning('至少需要选择一条进行修改')
      }
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
.btn {
  text-align: center;
  margin-top: 50px;
}
.el-page {
  text-align: right;
  margin-top: 20px;
}
.mb-20 {
  margin-bottom: 20px;
}
.ml-10{
  margin-left: 10px;
}
.mb-right {
  float: right;
}
</style>
