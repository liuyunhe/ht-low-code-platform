<template>
  <el-container>
    <el-header>
      <el-row>
        <el-col :span="22">
          <h5 class="title">重置密码</h5>
        </el-col>
      </el-row>
    </el-header>
    <el-main>
      <el-form
        :model="pwdForm"
        :rules="pwdRules"
        ref="pwdForm"
        label-width="120px"
        status-icon
        class="pwdForm"
      >
        <el-form-item label="旧密码：" prop="old">
          <el-input
            type="password"
            placeholder="请输入旧密码"
            v-model="pwdForm.old"
          ></el-input>
        </el-form-item>
        <el-form-item label="新密码：" prop="new">
          <el-input
            type="password"
            placeholder="请输入新密码"
            v-model="pwdForm.new"
          ></el-input>
        </el-form-item>
        <el-form-item label="重复新密码：" prop="newRepeat">
          <el-input
            type="password"
            placeholder="请再次输入新密码"
            v-model="pwdForm.newRepeat"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="submitForm()" :disabled="confirm">确定</el-button>
          <el-button size="small" @click="back()">返回</el-button>
        </el-form-item>
      </el-form>
    </el-main>
  </el-container>
</template>

<script>
import uc from "@/api/uc.js";

export default {
  name: "reset-pwd-view",
  data() {
    var validateNew = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入新密码"));
      }
      let config = this.pwdStrategy;
      if(config.enable){
        let pwdRule = config.pwdRule;
        let pwdLength = config.pwdLength;
        if(pwdRule){
          if(value.length < pwdLength){
            callback(new Error("新密码长度至少为" + pwdLength));
          }
          if(pwdRule == 1){
              callback();
          }else if(pwdRule == 2){
            var re = new RegExp('(?=.*[0-9])(?=.*[a-zA-Z])');
            if(!re.test(value)){
              callback(new Error("新密码必须包含数字、字母"));
            }else{
              callback();
            }
          }else if(pwdRule == 3){
            var re = new RegExp('(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9])');
            if(!re.test(value)){
              callback(new Error("新密码必须包含数字、字母、特殊字符"));
            }else{
              callback();
            }
          }else if(pwdRule == 4){
            var re = new RegExp('(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^a-zA-Z0-9])');
            if(!re.test(value)){
              callback(new Error("新密码必须包含数字、大小写字母、特殊字符"));
            }else{
              callback();
            }
          }else{
            callback();
          }
        }
      }else{
        if(value.length < 6){
          callback(new Error("新密码长度至少为6"));
        }else{
          callback();
        }
      }
    };
    var validateold = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入旧密码"));
      } else {
        callback();
      }
    };
    var validateNewReapeat = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入新密码"));
      } else if (value !== this.pwdForm.new) {
        callback(new Error("两次输入的密码不一致！"));
      } else {
        callback();
      }
    };
    return {
      pwdForm: {
        old: "",
        new: "",
        newRepeat: ""
      },
      pwdRules: {
        old: [{ validator: validateold, trigger: "blur" }],
        new: [{ validator: validateNew, trigger: "blur" }],
        newRepeat: [{ validator: validateNewReapeat, trigger: "blur" }]
      },
      pwdStrategy:{},
      account:"",
      confirm: false
    };
  },
  mounted(){
    if(this.$route.params.account){
      this.account = this.$route.params.account;
    }
    uc.getDefaultPwdStrategy().then(
      data => {
        if(data){
          let form = data;
          if(form.enable == 1){
            form.enable = true;
          }else{
            form.enable = false;
          }
          this.pwdStrategy = form;
        }
      }
    );
  },
  methods: {
    submitForm() {
      this.$refs["pwdForm"].validate(valid => {
        if (valid) {
          if(this.account == ""){
            this.$message.warning("请返回重新登录");
            return;
          }
          this.confirm = true;
          this.$http
            .post("${uc}/api/user/v1/user/modifiUserPsd", {
              account: this.account,
              oldPwd: this.pwdForm.old,
              newPwd: this.pwdForm.new
            })
            .then(resp => {
              let data = resp.data;
              if (data && data.state) {
                this.$message.success("修改密码成功");
                this.confirm = false;
                this.$router.push({
                  path: /* this.$route.query.redirect
                    ? this.$route.query.redirect
                    :  */"/"
                });
              }else{
                this.confirm = false;
              }
            });
        }else{
          this.$message.warning("表单校验失败，请检查表单");
        }
      });
    },
    back() {
      this.$store.dispatch("login/logoutAndCleanUp").then(() => {
        this.$router.push({
          path: "/login"
        });
      });
    },
    warning() {
      this.$notify({
        title: '警告',
        message: '该密码不符合密码策略，请重置密码',
        type: 'warning'
      });
    },
  },
  created() {
    this.warning();
  }
};
</script>

<style lang="stylus" scoped>
.el-row {
  text-color: #ededed;
  active-text-color: #fff;
  margin: 0 -20px;
}

img {
  margin-top: 5px;
}

div.el-dropdown, div.el-dropdown + span {
  color: #fff;
  line-height: 48px;
  font-size: 13px;
}

.logo-link {
  color: #fff;
  text-decoration: none;
  font-size: 24px;
  font-weight: 400;
  line-height: 48px;
}

.el-form >>> .el-form-item__content > .el-tag {
  margin-right: 10px;
}

.content_span {
  color: #212121;
  border-bottom: 1px solid #ededed;
  width: 260px;
  display: inline-block;
  margin: 0 30px 0 10px;
}
.el-container{
    background-color: #fff;
}
.el-header {
    padding-top:10px;
    border-bottom :1px solid #E7EAEC;
}
.el-select{
    height :32px;
}
.title{
    font-size:16px;
    margin:0;
    margin-top:10px;
    margin-left :10px;
}
.back{
    float :right;
    margin-top:4px;
}

#modlfy-dialog >>> .el-input__inner {
  width: 200px;
}
</style>
