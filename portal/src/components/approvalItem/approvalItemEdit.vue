<template>
  <el-container>
    <el-header>
      <el-row>
        <el-col :span="22">
          <h5 class="title">{{$route.params.id != null?"编辑常用语":"添加常用语"}}</h5>
        </el-col>
        <el-col :span="2">
          <el-button class="back" @click="back" size="small" type="danger" icon="el-icon-back" plain>返回</el-button>
        </el-col>
      </el-row>
    </el-header>
    <el-main>
      <el-form
        :model="editForm"
        status-icon
        :rules="rules"
        ref="form"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="常用语类型:">
          <el-input value="个人常用语" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="常用语:" prop="expression">
          <el-input v-model="editForm.expression" show-word-limit maxlength="50"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="submitForm('form')">保存</el-button>
          <el-button @click="back" size="small" plain>取消</el-button>
        </el-form-item>
      </el-form>
    </el-main>
  </el-container>
</template>

<script>
import approvalItem from "@/api/approvalItem.js";
export default {
  name: "approvalItemEdit",
  props: ["id"],
  data() {
    return {
      rules: {
        expression:[
          { required: true, message: '请输入常用语', trigger: 'blur' }
        ]
      },
      editForm:{}
    };
  },
  methods: {
    back() {
      this.$router.go(-1); //返回上一层
    },
    submitForm(form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          this.editForm.type = 4;
          approvalItem.approvalItemSave(this.editForm,response =>{
            if(response.state){
              this.$message.success(response.message);
            }
            this.$router.go(-1);
          });
        } else {
          return false;
        }
      });
    }
  },
  created() {
    if (this.id){
      approvalItem.detail(this.id,resp=>{
        this.editForm = resp;
      });
    }else{
      this.editForm = {};
    }

  }
};
</script>

<style lang="stylus" scoped>
.el-container {
  background-color: #fff;
}

.el-header {
  padding-top: 10px;
  border-bottom: 1px solid #E7EAEC;
}

.el-select {
  height: 32px;
}

.title {
  font-size: 16px;
  margin: 0;
  margin-top: 10px;
}
.back{
    float :right;
    margin-top:4px;
}
</style>

