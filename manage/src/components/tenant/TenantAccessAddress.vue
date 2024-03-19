<template>
  <el-container>
    <el-dialog
      title="复制地址"
      :visible.sync="dialogVisible"
      append-to-body
      :close-on-click-modal="false"
      class="urgent-text"
    >
      <el-form v-form class="copy-form">
        <ht-form-item label="管理端地址" label-width="120px">
          <el-input v-model="manageUrl" :disabled="true"/>
          <el-button
            class="copy-btn"
            type="text"
            v-clipboard:copy="manageUrl"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError"
          >复制地址</el-button>
        </ht-form-item>
        <ht-form-item label="用户端地址" label-width="120px">
          <el-input v-model="frontUrl"  :disabled="true"/>
          <el-button
            class="copy-btn"
            type="text"
            v-clipboard:copy="frontUrl"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError"
          >复制地址</el-button>
        </ht-form-item>
        <ht-form-item label="移动端地址" label-width="120px">
          <el-input v-model="mobileUrl"  :disabled="true"/>
          <el-button
            class="copy-btn"
            type="text"
            v-clipboard:copy="mobileUrl"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError"
          >复制地址</el-button>
        </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button icon="el-icon-close" size="mini" @click="cloase()">关闭</el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
export default {
  name: "tenant-access-address",
  data() {
    return {
      dialogVisible: false,
      alias: "",
      basicUrl: "",
      basicMUrl: "",
      basicPUrl: "",
      manageUrl: "",
      frontUrl: "",
      mobileUrl: ""
    };
  },
  mounted() {
    let front = window.context.front;
    this.basicUrl = this.getBasicUrl(front);
    if (window.context.manage) {
      this.basicMUrl = this.getBasicUrl(window.context.manage);
    } else {
      this.basicMUrl = this.basicUrl;
    }
    if (window.context.mobile) {
      this.basicPUrl = this.getBasicUrl(window.context.mobile);
    } else {
      this.basicPUrl = this.basicUrl;
    }
  },
  methods: {
    showDialog(alias) {
      this.alias = alias;
      this.manageUrl = this.basicMUrl + "/login/" + alias;
      this.frontUrl = this.basicUrl + "/login/" + alias;
      this.mobileUrl = this.basicPUrl + "/login/" + alias;
      this.dialogVisible = true;
    },
    getBasicUrl(url) {
      // let strs = url.split("/");
      // return strs[0] + "//" + strs[1] + strs[2];
      if(typeof String.prototype.startsWith == 'function' && url.endsWith('/')){
        url = url.substring(0, url.length - 1); 
      }
      return url;
    },
    // 复制成功时的回调函数
    onCopy(e) {
      this.$message.success("内容已复制到剪切板！");
    },
    // 复制失败时的回调函数
    onError(e) {
      this.$message.error("抱歉，复制失败！");
    },
    cloase() {
      this.dialogVisible = false;
    }
  }
};
</script>
<style lang="scss" scoped>
>>> .el-dialog {
  width: 700px;
  height: 300px;
}
>>> .el-dialog__header {
  border-bottom: 1px solid darkgrey;
}
>>> .el-dialog__body {
  padding: 0px;
  height: 380px;
}
>>> .el-dialog__footer {
  position: absolute;
  text-align: center;
  bottom: 0px;
  left: 0px;
  right: 0px;
}
>>> .copy-form {
  margin: 8px 15px;
}
>>> .copy-btn {
  margin-left: 15px;
  padding: 3px 8px;
}

/deep/ .el-form-item__content > .el-input--small{
    width: 450px;
}
</style>
