<template>
    <el-container>
        <el-header>
            <el-row>
                <el-col :span="22">
                    <h5 class="title">查看常用语</h5>
                </el-col>
                <el-col :span="2">
                    <el-button class="back" @click="back" size="small" type="danger" icon="el-icon-back" plain>返回</el-button>
                </el-col>
            </el-row>
        </el-header>
        <el-main>
            <el-form :model="form"  status-icon :rules="rules" ref="form" label-width="100px" class="demo-ruleForm">
                <el-form-item label="常用语类型:">
                    <el-input value="个人常用语" disabled="disabled"></el-input>
                </el-form-item>
                <el-form-item label="常用语:" >
                    <el-input v-model="form.expression" disabled="disabled"></el-input>
                </el-form-item>
            </el-form>
        </el-main>
    </el-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
    name:"approvalItemEdit",
    props:["id"],
    data() {
        return {
            rules:{
            }
        }
    },
     computed: mapState({
        form: state => state.approvalItem.form,
      }),
    methods: {
        back() {
            this.$router.go(-1);//返回上一层
        }
    },
  created() {
    this.$store.dispatch("approvalItem/detail",this.id);
  }
}
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

