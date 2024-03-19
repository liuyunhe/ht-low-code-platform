<template>
  <div>
    <h3 class="header">{{ title }}</h3>
    <div class="main">
      <el-form :model="form" label-width="100px" label-suffix="：">
        <el-row>
          <el-col :span="8">
            <el-form-item label="流程名称">
              <el-input
                v-model="form.flowName"
                clearable
                placeholder="请输入流程名称"
                :disabled="!checkbox"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="流程等级">
              <el-input
                v-model="form.flowLevel"
                clearable
                placeholder="请输入流程等级"
                :disabled="!checkbox"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="16">
            <el-form-item label="备注">
              <el-input
                type="textarea"
                v-model="form.remark"
                clearable
                placeholder="请输入备注"
                :disabled="!checkbox"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="状态">
              <el-radio-group v-model="form.state" :disabled="!checkbox">
                <el-radio label="1">启用</el-radio>
                <el-radio label="0">禁用</el-radio>
                <el-radio label="2">删除</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="pl-30">
        <h3>规则选择</h3>
        <div>
          <elTransfer
            sourceTitle="规则集合"
            targetTitle="已选规则"
            :checkKeys="checkKeys"
            :sourceList="sourceList"
            :checkbox="checkbox"
            @checkKeys="getCheckKeys"
          />
        </div>
      </div>
    </div>
    <div class="btn">
      <el-button v-if="checkbox" type="primary" @click="success"
        >确定</el-button
      >
      <el-button @click="goBack">返回</el-button>
    </div>
  </div>
</template>
  <script>
import elTransfer from './components/elTransfer.vue'
import {dataRuleList, dataFlowDetail, saveOrUp} from '@/api/dataWash.js'
export default {
  name: 'dataFlowEdit',
  components: {
    elTransfer,
  },
  data() {
    return {
      id: '',
      form: {
        state: '1',
      },
      title: '',
      sourceList: [
      ],
      rules: '',
      checkKeys: [],
      checkbox: false,
    }
  },
  mounted() {
    const id = (this.id = this.$route.params.id)
    const type = this.$route.params.type
    console.log('type', type)
    if (id) {
      this.title = '编辑流程'
      this.getDeyail(id)
    } else {
      this.title = '新增流程'
    }
    if(id&&type==1){
      this.title = '流程详情'
    }
    if (type != '1') {
      this.checkbox = true
    }
    this.getList()
  },
  methods: {
    getDeyail(id) {
      dataFlowDetail(id).then((res) => {
        const {data} = res
        if (data.state) {
          this.form = data.value
          this.checkKeys = data.value.rules.split(',')
        }
      })
    },
    getList() {
      dataRuleList().then((res) => {
        const {data} = res
        let sourceList = []
        data.map((item) => {
          let target = {}
          target.id = item.ruleId
          target.label = item.ruleName
          target.remark = item.remark
          sourceList.push(target)
        })
        this.sourceList = sourceList
      })
    },
    success() {
      let data = this.form
      this.form.rules = this.rules
      saveOrUp(data).then((res) => {
        const {data} = res
        if (data.state) {
          this.$message.success(data.message)
          this.$router.back()
        }
      })
    },
    getCheckKeys(data) {
      this.rules = data.toString()
      // console.log('父=====', data)
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
.pl-30 {
  padding-left: 30px;
}
.btn {
  text-align: center;
  margin-top: 100px;
  padding-bottom: 50px;
}
</style>
  