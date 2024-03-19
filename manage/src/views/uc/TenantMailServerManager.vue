<template>
  <div class="fullheight">
     <form data-vv-scope="tenantMailServerForm">
        <ht-form-item label="邮件类型" label-width="180px">
          <ht-select
            v-model="tenantMailServer.mailType"
            :options="[{'key': 'pop3', 'value':'pop3类型'},{'key': 'imap', 'value':'imap类型'}]"
            :validate="{'required':true}"
          />
        </ht-form-item>
        <ht-form-item label="协议服务器" label-width="180px">
          <ht-input v-model="tenantMailServer.mailHost" autocomplete="off" :validate="{'required':true}" />
        </ht-form-item>
        <ht-form-item label="密码" label-width="180px" class="is-required">
            <el-tooltip class="item" effect="dark" content="该密码为邮箱授权码，非登录密码" placement="top-start">
                <ht-input v-model="tenantMailServer.mailPass" show-password autocomplete="off" :validate="{'required':true}" />
            </el-tooltip>
        </ht-form-item>
        <ht-form-item label="昵称" label-width="180px">
          <ht-input v-model="tenantMailServer.nickName" :validate="{'required':true}" />
        </ht-form-item>
        <ht-form-item label="邮箱地址" label-width="180px">
          <ht-input v-model="tenantMailServer.userName" :validate="{'required':true}" />
        </ht-form-item>
        <ht-form-item label="端口号" label-width="180px">
          <ht-input v-model="tenantMailServer.mailPort" :validate="{'required':true}" />
        </ht-form-item>
        <ht-form-item label="是否使用SSL认证" label-width="180px">
          <ht-select
            v-model="tenantMailServer.useSsl"
            :options="[{'key': 0, 'value':'否'},{'key': 1, 'value':'是'}]"
            :validate="{'required':true}"
          />
        </ht-form-item>
        <ht-form-item label="说明" label-width="180px">
          <ht-input type="textarea" v-model="tenantMailServer.desc" placeholder="请输入邮件服务器说明" />
        </ht-form-item>
      </form>
      <div slot="footer" style="text-align: center">
        <ht-submit-button
          url="${uc}/uc/tenantMailServer/v1/save"
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
    
  }
};
</script>

<style lang="scss" scoped>
.sp-manager__dialog /deep/ > .el-dialog > .el-dialog__body {
  height: calc(100% - 170px);
}
</style>
