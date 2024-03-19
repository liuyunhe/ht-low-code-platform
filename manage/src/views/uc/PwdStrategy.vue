<template>
  <div class="fullheight" data-vv-scope="pwdStrategyForm">
    <el-form :model="form" v-form v-loading.fullscreen.lock="fullscreenLoading">
      <ht-form-item label="初始化密码" label-width="120px">
        <ht-input
          v-model="form.initPwd"
          autocomplete="off"
          :validate="{ required: true }"
          placeholder="请输入初始化密码"
        ></ht-input>
      </ht-form-item>
      <ht-form-item label="密码规则" label-width="120px">
        <ht-select
          v-model="form.pwdRule"
          :options="options"
          :validate="{'required':true}"
        >
        </ht-select>
      </ht-form-item>
      <ht-form-item label="密码长度" label-width="120px">
        <ht-input
          v-model="form.pwdLength"
          type="number"
          :min="0"
          :max="30"
          :validate="{ required: true }"
          placeholder="请输入密码长度"
        ></ht-input>
      </ht-form-item>
      <ht-form-item label="密码可用时长" label-width="120px">
        <ht-input
          v-model="form.duration"
          type="number"
          :min="0"
          :validate="{ required: true }"
          placeholder="请输入密码可用时长"
        ></ht-input>&nbsp;天
      </ht-form-item>
      <ht-form-item label="启用" label-width="120px">
        <el-switch v-model="form.enable"></el-switch>
      </ht-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button class="confirm" type="primary" @click="confirm()">保存</el-button>
    </span>
  </div>
</template>

<script>
import uc from "@/api/uc.js";
import utils from "@/hotent-ui-util.js";

export default {
  name: "sys-pwd-strategy",
  components: {},
  props: {},
  computed: {

  },
  data() {
    return {
      fullscreenLoading:false,
      form:{},
      options:[
        {key:1,value:"无限制"},
        {key:2,value:"必须包含数字、字母"},
        {key:3,value:"必须包含数字、字母、特殊字符"},
        {key:4,value:"必须包含数字、大小字母、特殊字符"},
      ]
    };
  },
  mounted(){
    uc.getDefaultPwdStrategy().then(
      data => {
        if(data){
          let form = data;
          if(form.enable == 1){
            form.enable = true;
          }else{
            form.enable = false;
          }
          //
          this.form = form;
        }
      }
    );
  },
  methods: {
    confirm(){
      if(this.form.initPwd.length > 30){
        this.$message({type: "warning", message: "内容超出输入限制"});
        return false;
      }
      utils.validateForm(this, "form")
      .then(r => {
        this.fullscreenLoading = true;
        let param = {};
        Object.assign(param, this.form);
        param.id = "1";
        if(param.enable){
          param.enable = 1;
        }else {
          param.enable = 0;
        }
        uc.saveDefaultPwdStrategy(param).then(
          data => {
            this.fullscreenLoading = false;
            if (data.state) {
              this.$message.success(data.message);
            } else {
              this.$message.error(data.message || "保存失败");
            }
          },
          error => {
            this.fullscreenLoading = false;
            this.$message.error(error || "保存失败");
          }
        );
      })
      .catch(reason => {
        this.fullscreenLoading = false;
        this.$message.error("表单校验不通过，请检查表单");
      })
    },
  },
  created(){

  }
};
</script>

<style lang="scss" scoped>
.confirm{
  margin-left: 120px;
}
</style>
