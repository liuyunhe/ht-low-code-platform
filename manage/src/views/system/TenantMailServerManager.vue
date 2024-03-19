<template>
  <div class="fullheight">
    <el-form v-form data-vv-scope="tenantMailServerForm">
      <ht-form-item label="邮箱地址" label-width="180px">
        <ht-input v-model="tenantMailServer.userName" validate="required" :maxlength="100" :showWordLimit="true" />
      </ht-form-item>
        <ht-form-item label="邮件类型" label-width="180px">
          <ht-select
            v-model="tenantMailServer.mailType"
            :options="[{'key': 'pop3', 'value':'pop3类型'},{'key': 'imap', 'value':'imap类型'}]"
            :validate="{'required':true}"
            @change="mailTypeChange"
          />
        </ht-form-item>
        <ht-form-item label="协议服务器" label-width="180px">
          <ht-input v-model="tenantMailServer.mailHost" autocomplete="off" validate="required" :maxlength="100" :showWordLimit="true" />
        </ht-form-item>
        <ht-form-item label="密码" label-width="180px" class="is-required">
          <el-tooltip class="item" effect="dark" content="该密码为邮箱授权码，非登录密码" placement="top-start">
            <ht-input v-model="tenantMailServer.mailPass" show-password autocomplete="off" validate="required" :maxlength="100" />
          </el-tooltip>
        </ht-form-item>
        <ht-form-item label="昵称" label-width="180px">
          <ht-input v-model="tenantMailServer.nickName" validate="required" :maxlength="100" :showWordLimit="true" />
        </ht-form-item>
        <ht-form-item label="端口号" label-width="180px">
          <ht-input v-model="tenantMailServer.mailPort" validate="required" />
        </ht-form-item>
        <ht-form-item label="是否使用SSL认证" label-width="180px">
          <ht-select
            v-model="tenantMailServer.useSsl"
            :options="[{'key': 0, 'value':'否'},{'key': 1, 'value':'是'}]"
            :validate="{'required':true}"
          />
        </ht-form-item>
        <ht-form-item label="说明" label-width="180px">
          <ht-input type="textarea" v-model="tenantMailServer.desc" placeholder="请输入邮件服务器说明" :maxlength="200" :showWordLimit="true" />
        </ht-form-item>
        <el-form-item label-width="180px">
          <el-button @click="testConnect()" type="success">测试连接</el-button>
        </el-form-item>
      </el-form>
      <div v-show="false" slot="footer" style="text-align: center">
        <ht-submit-button
          url="${uc}/uc/tenantMailServer/v1/save"
          ref="tenantMailSaveBtn"
          :model="tenantMailServer"
          scope-name="tenantMailServerForm"
        >{{$t("eip.common.save")}}</ht-submit-button>
      </div>
  </div>
</template>
<script>

export default {
   name: "tenantMailSereverManager",
   props: {
    tenantId: String
  },
  data() {
    return {
      dialogVisible: false,
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      tenantMailServer: {}
    };
  },
  mounted() {
    this.$validator = this.$root.$validator;
    let url = "${uc}/uc/tenantMailServer/v1/getByCurrent";
    if(this.tenantId){
        url += "?tenantId="+this.tenantId;
    }
    this.$http.get(url).then(resp => {
        this.tenantMailServer = resp.data;
    }, error => {
        reject(error);
    })
  },
  methods: {
    saveData(){
      this.$refs.tenantMailSaveBtn.$el.click();
    },
    testConnect(){
      const this_ = this;
      this_.$validator.validateAll("tenantMailServerForm").then(result => {
        if (result) {
          let mailType = this.tenantMailServer.mailType;
          let mailSetting = {
            mailType:this.tenantMailServer.mailType,
            mailAddress:this.tenantMailServer.userName,
            password:this.tenantMailServer.mailPass,
            nickName:this.tenantMailServer.nickName,
            validate:true,
            isDeleteRemote:false,
            isHandleAttach:true,
          };
          if(this.tenantMailServer.useSsl == "0"){
            mailSetting.ssl = false;
          }else{
            mailSetting.ssl = true;
          }
          if(mailType == "pop3"){
            mailSetting.popHost = this.tenantMailServer.mailHost;
            mailSetting.popPort = this.tenantMailServer.mailPort;
          }else if(mailType == "imap"){
            mailSetting.imapHost = this.tenantMailServer.mailHost;
            mailSetting.imapPort = this.tenantMailServer.mailPort;
          }
          let address = this.tenantMailServer.userName;
          let s = address.substring(address.indexOf('@') + 1, address.length + 1).trim();
          mailSetting.smtpHost = 'smtp.' + s;
          mailSetting.smtpPort = 25;

          let url = "${portal}/mail/mail/mailSetting/v1/test?isOriginPwd=false";
          this.$http.post(url, mailSetting).then(resp =>{
            if(resp.data.state){
              this.$message.success("测试连接成功!");
            }
          });
        }else{
          let arr = this_.$validator.errors.items.filter(
            item => item.scope == "tenantMailServerForm"
          );
          let errorLength = arr.length;
          this_.$message({
            showClose: true,
            message: `有${errorLength}个字段未通过校验，请正确填写表单内容。`,
            type: "warning"
          });
        }
      });
    },
    mailTypeChange(change){
      if (this.tenantMailServer.userName){
        let address = this.tenantMailServer.userName;
        let s = address.substring(address.indexOf('@') + 1,
          address.length + 1).trim();
        if (change == 'pop3') {
          this.tenantMailServer.mailHost = 'pop.' + s;
        }
        if (change == 'pop3') {
          if (!(s == 'gmail.com' || s == 'msn.com' || s == 'live.cn' || s == 'live.com' || s == 'hotmail.com')) {
            this.tenantMailServer.mailPort = '110';
          }
        } else if (change == 'imap') {
          if (!(s == 'gmail.com' || s == 'msn.com' || s == 'live.cn' || s == 'live.com' || s == 'hotmail.com')) {
            this.tenantMailServer.mailPort = '143';
          }
          this.tenantMailServer.mailHost = 'imap' + '.' + s;
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.sp-manager__dialog /deep/ > .el-dialog > .el-dialog__body {
  height: calc(100% - 170px);
}
</style>
