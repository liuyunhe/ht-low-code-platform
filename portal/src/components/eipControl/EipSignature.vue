<template>
  <div>
    <el-row
      style="display: inline-block; vertical-align: top"
      v-if="permission_sub != 'n'"
    >
      <el-tag
        v-for="(item, index) in signatureList"
        :key="item.userId"
        :closable="permission_sub !== 'r' && userId == item.userId"
        @close="handleRemove(item)"
        :index="index"
      >
        <el-tooltip
          class="item"
          effect="dark"
          :content="getImgFit(item)"
          placement="top"
        >
          <el-image
            style="width: 80px; height: 26px"
            :ref="`signature_` + item.signature"
            :load="getShowSignature(item.signature)"
            :src="getShowSignature(item.signature)"
          ></el-image>
        </el-tooltip>
      </el-tag>

      <el-button
        type="warning"
        v-if="permission_sub !== 'r' && showSignatureBtn && false"
        @click="doSignature"
        icon="el-icon-s-check"
        >签章</el-button
      >
    </el-row>
    <el-dialog
      title="获取签章"
      :visible.sync="dialogVisible"
      width="420px"
      :close-on-click-modal="false"
      append-to-body
      :before-close="handleClose"
    >
      <div class="signaturePwd">
        <el-form-item label="签章密码">
          <el-input
            v-model="password"
            @keyup.enter.native="onConfirm"
            show-password
          ></el-input>
        </el-form-item>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="onConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {mapState} from 'vuex'
import req from '@/request.js'
import utils from '@/utils.js'
import {Base64} from 'js-base64'
import sub_pio_mixin from '@/sub-permission-mixin.js'
export default {
  name: 'eip-signature',
  props: ['maxPeople', 'permission', 'value', 'fieldPath'],
  data() {
    return {
      dialogVisible: false,
      inputVal: '',
      password: '',
      signatureList: [],
      showSignatureBtn: true,
      showSignatureMap: {},
    }
  },
  mixins: [sub_pio_mixin], //混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub）
  computed: mapState({
    userId: (state) => {
      if (state.login && state.login.currentUser) {
        return state.login.currentUser.userId
      }
      return ''
    },
    userName: (state) => {
      if (state.login && state.login.currentUser) {
        return state.login.currentUser.username
      }
      return ''
    },
    signatureConfig: (state) => state.storeProcess.signatureConfig,
    signatureStatus: (state) => state.storeProcess.signatureConfig.status,
  }),
  watch: {
    inputVal: function (newVal, oldVal) {
      this.$emit('input', newVal)
    },
    signatureList: {
      handler: function (newVal, oldValue) {
        if (!newVal || newVal.length == 0) {
          this.showSignatureBtn = true
          this.$emit('input', '')
        } else if (newVal && newVal.length >= 1) {
          let _this = this
          let signatures = JSON.parse(JSON.stringify(newVal))
          signatures.forEach((item) => {
            if (item.userId == _this.userId) {
              _this.showSignatureBtn = false
            }
          })
          this.$emit('input', JSON.stringify(signatures))
        }
      },
      deep: true,
      immediate: true,
    },
    signatureConfig: {
      handler: function (newVal, oldVal) {
        if (this.signatureConfig.field == this.fieldPath) {
          if (newVal.status === 'start') {
            this.submitSignature('ing') //发出消息，开始签章处理
            if (this.signatureConfig.isCover) {
              this.signatureList = []
            } else {
              let index = this.getCurrentIndex(null)
              if (index >= 0) {
                this.signatureList.splice(index, 1)
              }
            }
            this.getSignature(this.signatureConfig.password)
          }
        } else if (newVal.status === 'start' && !this.fieldPath) {
          this.$message.warning(
            '未获取到签章字段路径，请初始化表单模板后重新保存表单！'
          )
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    doSignature() {
      this.password = ''
      this.dialogVisible = true
    },
    submitSignature(status) {
      this.$store
        .dispatch('storeProcess/setSignatureStatus', status)
        .then((rep) => {})
    },
    getSignature(password) {
      let _this = this
      const url =
        window.context.uc +
        '/uc/electronicSeal/v1/getElectronicSeal?password=' +
        password +
        '&secretFree=' +
        this.signatureConfig.secretFree
      req.get(url).then((resp) => {
        if (resp.data.state) {
          _this.dialogVisible = false
          _this.reloadSignatures(resp.data.value)
          setTimeout(function () {
            _this.submitSignature('success')
          }, 300)
        } else {
          this.submitSignature('fail')
        }
      })
    },
    getShowSignature(fileId) {
      if (!fileId) {
        this.$message.warning('未获取到签章，请检查签章配置！')
        return
      }
      let _this = this
      if (!this.showSignatureMap || !this.showSignatureMap[fileId]) {
        let imgUrl = ''
        req
          .get(
            window.context.portal +
              '/file/onlinePreviewController/v1/getFileById_' +
              fileId,
            'arraybuffer'
          )
          .then((response) => {
            let type = response.headers['content-type']

            if (type) {
              imgUrl = window.URL.createObjectURL(
                new Blob([response.data], {type: type})
              )
            } else {
              imgUrl = window.URL.createObjectURL(new Blob([response.data]))
            }
            _this.showSignatureMap[fileId] = imgUrl
            try {
              _this.$refs['signature_' + fileId][0].src = imgUrl
            } catch (error) {
              return imgUrl
            }
          })
        return imgUrl
      } else {
        setTimeout(function () {
          try {
            if (_this.$refs['signature_' + fileId]) {
              _this.$refs['signature_' + fileId][0].src =
                _this.showSignatureMap[fileId]
            } else {
              _this.getShowSignature(fileId)
            }
          } catch (error) {
            return _this.showSignatureMap[fileId]
          }
        }, 100)
      }
    },
    reloadSignatures(fileId) {
      if (fileId) {
        this.showSignatureMap[fileId] = null
      }
      let index = this.getCurrentIndex(fileId)
      if (index < 0) {
        this.signatureList.push({
          index: this.signatureList.length + 1,
          userId: this.userId,
          name: this.userName,
          signature: fileId,
          createTime: utils.formatDate(new Date()),
        })
      }
    },
    getCurrentIndex(fileId) {
      let _this = this
      let rindex = -1
      if (this.signatureList.length > 0) {
        let index = 0
        this.signatureList.forEach((f) => {
          if (f.userId == _this.userId) {
            if (fileId) {
              f.signature = fileId
              _this.showSignatureBtn = false
            }
            rindex = index
            return rindex
          }
          index++
        })
      }
      return rindex
    },
    handleSort() {
      this.signatureList.sort(function (a, b) {
        var x = 'index' //要排序字段
        if (a[x] < b[x]) {
          return -1
        }
        if (a[x] > b[x]) {
          return 1
        }
        return 0
      })
    },
    getImgFit(item) {
      return item.name + ' 于 ' + item.createTime + ' 进行了签章'
    },
    handleRemove(item) {
      let index = 0
      let rIdx = 0
      this.signatureList.forEach((sn) => {
        if (sn.userId == item.userId) {
          rIdx = index
        }
        index++
      })
      this.signatureList.splice(rIdx, 1)
      this.showSignatureBtn = true
    },
    onConfirm() {
      if (!this.password) {
        this.$message.error('请填写获取签章密码！')
        return
      }
      this.getSignature(this.password)
    },
    handleClose() {
      this.dialogVisible = false
      this.submitSignature('fail')
    },
  },
  mounted() {
    this.$validator = this.$root.$validator
    if (this.value) {
      this.signatureList = JSON.parse(this.value)
      // let list = JSON.parse(this.value);
      // let _this = this;
      // list.forEach(item =>{
      //   _this.showCurSignature(item.userId, item.name, item.signature);
      // })
    }
  },
}
</script>
<style lang="stylus" scoped>
div[aria-invalid='true'] >>> .el-input__inner, div[aria-invalid='true'] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}

.signaturePwd {
  margin: 5px 30px;
}

.el-tag {
  margin-right: 7px;
  height: 28px;
  line-height: 26px;
  color: #666;
  background-color: transparent;
  border-color: #ebeef5;
  cursor: pointer;
}
</style>