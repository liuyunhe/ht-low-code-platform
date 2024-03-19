<template>
  <div>
    <h3 class="header">商户进件</h3>
    <div class="main" v-if="isShow">
      <el-descriptions
        class="margin-top mt-30"
        :column="3"
        border
        v-for="(item, index) in rates"
        :key="index"
      >
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-bank-card"></i>
            收方商户编号
          </template>
          <el-input v-model="item.outVendorId" clearable></el-input>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-bank-card"></i>
            外部用户编号
          </template>
          <el-input v-model="item.outUserId" clearable></el-input>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-user"></i>
            渠道名称
          </template>

          <el-select
            v-model="item.channelId"
            placeholder="请选择渠道"
            clearable
            @change="(value) => getValue(value, index)"
          >
            <el-option
              v-for="(item, index) in bookList"
              :key="index"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-c-scale-to-original"></i>
            总费率
          </template>

          <el-input v-model="item.rate" clearable></el-input>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-c-scale-to-original"></i>
            渠道费率
          </template>

          <el-input v-model="item.channelRate" clearable></el-input>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-c-scale-to-original"></i>
            平台费率
          </template>

          <el-input v-model="item.platformRate" clearable></el-input>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-c-scale-to-original"></i>
            开户行行名
          </template>

          <el-input v-model="item.openBkNm" clearable></el-input>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-c-scale-to-original"></i>
            开户行行号
          </template>

          <el-input v-model="item.openBkCd" clearable></el-input>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-c-scale-to-original"></i>
            银行行名
          </template>

          <el-input v-model="item.bankName" clearable></el-input>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-c-scale-to-original"></i>
            银行账号
          </template>

          <el-input v-model="item.bankCd" clearable></el-input>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-setting"></i>
            操作
          </template>
          <el-button
            type="text"
            size="small"
            v-if="rates.length < bookList.length"
            @click="add"
            >增加</el-button
          >
          <el-button
            v-if="rates.length > 1"
            type="text"
            size="small"
            @click="deleted(index)"
          >
            删除
          </el-button>
        </el-descriptions-item>
      </el-descriptions>
      <div class="btn">
        <el-button type="primary" @click="submit">进件成功</el-button>
        <el-button @click="goBack">返回</el-button>
      </div>
    </div>
    <div class="main" v-else>
      <el-descriptions class="margin-top mt-30" :column="3" border>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-edit-outline"></i>
            失败原因
          </template>
          <el-input type="textarea" v-model="errorMsg"></el-input>
        </el-descriptions-item>
      </el-descriptions>
      <div class="btn">
        <el-button type="primary" @click="submitErr">进件失败</el-button>
        <el-button @click="goBack">返回</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import {intoSuccessful, intoFailure} from '@/api/merchantEdit.js'
export default {
  name: 'merchantEdit',
  data() {
    return {
      isShow: true,
      serialNo: '',
      rates: [
        {
          outVendorId: '',
          outUserId: '',
          channelId: '',
          rate: '',
          channelRate: '',
          platformRate: '',
          openBkNm:'',
          openBkCd:'',
          bankName:'',
          bankCd:''
        },
      ],
      bookList: [
        {value: '2', label: '微信'},
        {value: '3', label: '支付宝'},
        {value: '4', label: '工行'},
      ],
      errorMsg: '',
    }
  },
  created() {
    const id = this.$route.params.id
    const type = this.$route.params.type
    if (id && type) {
      this.isShow = true
      this.serialNo = id
    } else {
      this.isShow = false
      this.serialNo = id
    }
  },
  methods: {
    getValue(value, index) {
      const rates = this.rates
      let num = 0
      rates.map((item) => {
        if (item.channelId == value) {
          num++
        }
        if (num > 1) {
          this.rates[index].channelId = ''
          this.$message.error('不能重复选择')
        }
      })
    },
    add() {
      const index = this.bookList.length
      const idex = this.rates.length
      if (idex < index) {
        this.rates.push({
          outVendorId: '',
          outUserId: '',
          channelId: '',
          rate: '',
          channelRate: '',
          platformRate: '',
          openBkNm:'',
          openBkCd:'',
          bankName:'',
          bankCd:''
        })
      } else {
        this.$message.warning('')
      }
    },

    deleted(index) {
      this.rates.splice(index, 1)
    },
    submit() {
      // if (!this.merchantNo) {
      //   return this.$message.warning('请填写商户号')
      // }
      // let state
      // let rates = []
      // this.rates.map((item) => {
      //   if (item.channelId && item.rate) {
      //     rates.push({
      //       channelId: item.channelId,
      //       rate: item.rate,
      //       platformRate: item.platformRate,
      //       channelRate: item.channelRate,
      //     })
      //     state = true
      //   }
      // })
      const data = {
        serialNo: this.serialNo,
        rates: this.rates,
      }
      // if (state) {
        const loading = this.$loading({
          lock: true,
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)',
        })
        intoSuccessful(data).then((res) => {
          const {data} = res
          loading.close()
          if (data.state) {
            this.$message.success('进件成功')
            this.$router.back()
          }
        })
      // }
      //  else {
      //   this.$message.warning('请填写渠道和费率')
      // }
    },
    submitErr() {
      const data = {
        serialNo: this.serialNo,
        errorMsg: this.errorMsg,
      }
      if (this.errorMsg) {
        const loading = this.$loading({
          lock: true,
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)',
        })
        intoFailure(data).then((res) => {
          const {data} = res
          loading.close()
          if (data.state) {
            this.$message.success('进件失败')
            this.$router.back()
          }
        })
      } else {
        this.$message.warning('请填写失败原因')
      }
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
.right {
  text-align: right;
  margin-top: 20px;
}
.btn {
  text-align: center;
  margin-top: 50px;
}
.mt-30 {
  margin-top: 30px;
}
</style>
    