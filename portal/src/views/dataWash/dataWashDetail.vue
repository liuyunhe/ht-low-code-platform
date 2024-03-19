<template>
  <div>
    <h3 class="header">原始数据批次详情</h3>
    <div class="main">
      <el-form :model="form" label-width="120px" label-suffix="：">
        <el-row>
          <el-col :span="8">
            <el-form-item label="批次编号">
              {{ datailData.batchCode }}
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="批次名称">
              {{ datailData.batchName }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="批次类型">
              <span v-if="datailData.batchType == 'water'">自来水</span>
              <span v-if="datailData.batchType == 'gas'">燃气</span>
              <span v-if="datailData.batchType == 'heating'">热力</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="启动方式">
              <span v-if="datailData.startMode == 0">手动</span>
              <span v-else>自动</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="状态">
              <span v-if="datailData.state == '0'">未处理</span>
              <span v-if="datailData.state == '1'">处理成功</span>
              <span v-if="datailData.state == '2'">处理中</span>
              <span v-if="datailData.state == '3'">处理失败</span>
              <span v-if="datailData.state == '98'">撤销中</span>
              <span v-if="datailData.state == '99'">已撤销</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="创建时间">
              {{ datailData.startTime }}
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 差错集详情 -->
        <el-row v-if="datailData.state==3 || datailData.state==2">
          <el-col
            :span="8"
          >
            <el-form-item label="预处理(总数)">
              <span
                class="color-26A"
                >{{ datailData.processTotal }}</span
              >
            </el-form-item>
          </el-col>
          <el-col
            :span="8"
          >
            <el-form-item label="清洗(总数)">
              <span
                class="color-26A"
                >{{ datailData.cleanTotal }}</span
              >
            </el-form-item>
          </el-col>
          <el-col
            :span="8"
          >
            <el-form-item label="建模(总数)">
              <span
                class="color-26A"
                >{{ datailData.modelTotal }}</span
              >
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="datailData.state==3 || datailData.state==2">
          <el-col
            :span="8"
          >
            <el-form-item label="预处理(待处理)">
              <span
                class="color-26A"
                >{{ datailData.processWait }}</span
              >
            </el-form-item>
          </el-col>
          <el-col
            :span="8"
          >
            <el-form-item label="清洗(待清洗)">
              <span
                class="color-26A"
                >{{ datailData.cleanWait }}</span
              >
            </el-form-item>
          </el-col>
          <el-col
            :span="8"
          >
            <el-form-item label="建模(待建模)">
              <span
                class="color-26A"
                >{{ datailData.modelWait }}</span
              >
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="datailData.state==3 || datailData.state==2">
          <el-col
            :span="8"
          >
            <el-form-item label="预处理(差错)">
              <span
                @click="openErr(datailData.processErr, 'PROCESS')"
                :class="datailData.processErr > 0 && datailData.state==3 ? 'color-D81' : ' color-26A'"
                >{{ datailData.processErr }}</span
              >
            </el-form-item>
          </el-col>
          <el-col
            :span="8"
          >
            <el-form-item label="清洗(差错)">
              <span
                @click="openErr(datailData.cleanErr, 'CLEAN')"
                :class="datailData.cleanErr > 0 && datailData.state==3  ? 'color-D81' : ' color-26A'"
                >{{ datailData.cleanErr }}</span
              >
            </el-form-item>
          </el-col>
          <el-col
            :span="8"
          >
            <el-form-item label="建模(差错)">
              <span
                @click="openErr(datailData.cleanErr, 'MODEL')"
                :class="datailData.modelErr > 0 && datailData.state==3  ? 'color-D81' : ' color-26A'"
                >{{ datailData.modelErr }}</span
              >
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-if="datailData.state==3 || datailData.state==2">
          <el-col
            :span="8"
          >
            <el-form-item label="预处理(完成)">
              <span
                class="color-26A"
                >{{ datailData.processFinished }}</span
              >
            </el-form-item>
          </el-col>
          <el-col
            :span="8"
          >
            <el-form-item label="清洗(完成)">
              <span
                class="color-26A"
                >{{ datailData.cleanFinished }}</span
              >
            </el-form-item>
          </el-col>
          <el-col
            :span="8"
          >
            <el-form-item label="建模(完成)">
              <span
                class="color-26A"
                >{{ datailData.modelFinished }}</span
              >
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- <el-row v-if="datailData.state==2">
          <el-alert title="数据处理中，请稍后查看处理结果！" type="warning" show-icon :closable="false"> </el-alert>
        </el-row> -->
      </el-form>
    </div>
    <div class="btn">
      <el-button @click="goBack">返回</el-button>
    </div>
  </div>
</template>
<script>
import {rawDataDetail , newDetail} from '@/api/dataWash.js'
export default {
  name: 'dataWashDetail',
  data() {
    return {
      form: {},
      id: '',
      datailData:{

      }
    }
  },
  mounted() {
    const id = (this.id = this.$route.params.id)
    this.newDetail(id)
  },
  methods: {
    newDetail(id) {
      const _this = this
      const loading = _this.$loading({
            lock: true,
            text: 'Loading',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
      newDetail({batchId: id}).then((res) => {
        const {data} = res
        console.log("data=>",data)
        if(data.state){
          _this.datailData = data.value
          loading.close()
        }else{
          _this.$message.warning(data.message)
        }
        // this.form = data
      })
    },
    goBack() {
      this.$router.back()
    },
    openErr(num, flowCode) {
      if(this.datailData.state === '2'){
        console.log("阻止点击")
        return false
      }
      console.log(num)
      if (num == 0) {
        return false
      } else {
        this.$router.push(
          '/ywzx/dataWashDetailList/' + flowCode + '/' + this.id
        )
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
.unusual {
  font-size: 16px;
  padding-left: 30px;
  margin-top: 30px;
}
.color-26A {
  color: #26a886;
  font-size: 20px;
  /* text-decoration: underline;
  cursor: pointer; */
}
.color-D81 {
  color: #d81e06;
  font-size: 20px;
  text-decoration: underline;
  cursor: pointer;
}
.btn {
  text-align: center;
  margin-top: 50px;
}
</style>
