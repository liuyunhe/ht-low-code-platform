<template>
  <div>
    <div v-if="value">
      <div class="inblock" style="color: rgb(150, 151, 153); margin-left: 5px">
        二维码：
      </div>
      <el-image
        style="width: 100px; height: 100px; vertical-align: top"
        :src="url"
        :preview-src-list="srcList"
      >
      </el-image>
    </div>
    <div v-else>
      <canvas ref="eipqrcode" class="qr-canvas" v-show="showCode"></canvas>
      <div v-show="!showCode">{{ message }}</div>
    </div>
  </div>
</template>

<script>
import utils from '@/utils.js'
import {mapState} from 'vuex'
import QRCode from 'qrcode'
import req from '@/request.js'

export default {
  name: 'eip-qrcode',
  props: ['value'],
  data() {
    return {
      showCode: false,
      message: '流程实例还未生成',
      url: '',
      srcList: [],
    }
  },
  methods: {
    //得到url字符串
    getUrlString() {
      let params = this.$route.params
      //查看实例页面
      if (params.instId) {
        req
          .get(
            window.context.bpmRunTime + '/runtime/instance/v1/' + params.instId
          )
          .then((response) => {
            if (response.data) {
              this.qrcode(response.data.id, response.data.supportMobile)
            }
          })
      } else if (params.taskId) {
        //审批任务(根据路由的任务ID得到实例id)
        req
          .get(window.context.bpmRunTime + '/runtime/task/v1/' + params.taskId)
          .then((response) => {
            if (response.data) {
              this.qrcode(response.data.procInstId, response.data.supportMobile)
            }
          })
      }
    },
    //生成二维码的Canvas
    qrcode(instId, supportMobile) {
      if (supportMobile != 1) {
        this.message = '请联系管理员绑定手机表单。'
        return
      }
      if (instId) {
        let me_ = this
        this.$http
          .post('${portal}/portal/shorturlManage/v1/getShortUrlByLong', {
            url:
              '/shareInst/' +
              instId +
              '/true?token=' +
              this.$store.state.login.currentUser.token,
          })
          .then(function (resp) {
            if (resp.data && resp.data.state) {
              QRCode.toCanvas(
                me_.$refs.eipqrcode,
                req.getContext().mobile + '/' + resp.data.value.shortUrl,
                function (error) {
                  console.log(error)
                }
              )
              me_.showCode = true
            } else {
              me_.$message.error('获取表单外链短链接失败：' + resp.data.message)
            }
          })
      }
    },
    myQRcode() {
      const that = this
      QRCode.toDataURL(
        this.value,
        {version: 7, errorCorrectionLevel: 'Q', width: 300, height: 300},
        function (err, url) {
          if (err) throw err
          console.log("QRCode处理后的url====>",url)
          that.url = url
          that.srcList.push(url)
        }
      )
    },
  },
  mounted() {
    // console.log('this.qrCode', this.value)
    // if (this.value) {
    //   this.myQRcode()
    // } else {
    //   console.log(2222222222222)
    //   this.getUrlString()
    // }
  },
  watch: {
    value: {
      handler(newName, oldName) {
        console.log("watch=====>",newName)
        this.myQRcode()
      },
      immediate: true,
    },
  },
}
</script>
<style lang="stylus" scoped>
div[aria-invalid='true'] >>> .el-input__inner, div[aria-invalid='true'] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}

.qr-canvas {
  height: 130px !important;
  width: 130px !important;
}

.inblock {
  display: inline-block;
}
</style>
