<template>
    <el-container>
        <el-header>
            <el-row>
                <el-col :span="22">
                    <h5 class="title">查看委托</h5>
                </el-col>
                <el-col :span="2">
                    <el-button class="back" @click="back" size="small" type="danger" icon="el-icon-back" plain>返回</el-button>
                </el-col>
            </el-row>
        </el-header>
        <el-main>
            <el-form ref="form" disabled="disabled" :model="form" status-icon :rules="rules"  label-width="100px" class="demo-ruleForm">
                <el-form-item label="被委托人:">
                    <el-input value="" v-model="form.authName"></el-input>
                </el-form-item>
                <el-form-item label="委托类型:" prop="type">
                    <el-radio v-model="form.type" :label="1">全权委托</el-radio>
                    <el-radio v-model="form.type" :label="2">部分委托</el-radio>
                </el-form-item>
                <el-form-item label="标题:" prop="subject">
                    <el-input v-model="form.subject"></el-input>
                </el-form-item>
                <el-form-item label="开始日期:" prop="startDate">
                   <el-date-picker
                    v-model="form.startDate"
                    align="right"
                    type="datetime"
                    placeholder="选择日期"
                    >
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="结束日期:" prop="entDate">
                    <el-date-picker
                    v-model="form.endDate"
                    align="right"
                    type="datetime"
                    placeholder="选择日期"
                    >
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="是否有效:" prop="isEnabled">
                    <el-radio v-model="form.isEnabled" label="Y">启用</el-radio>
                    <el-radio v-model="form.isEnabled" label="N">禁止</el-radio>
                </el-form-item>
                <el-form-item label="委托人:" prop="agent">
                    <el-input v-model="form.agent"></el-input>
                </el-form-item>
                <el-form-item label="委托流程:"  v-if="form.type==2">
                    <el-table 
                        :data="form.defList"
                            stripe
                            border
                            style="width: 100%"
                            header-cell-class-name="todo-header-row"
                            row-class-name="todo-row"
                            size="medium"
                        >
                            <el-table-column prop="flowName" label="流程名称"></el-table-column>
                            <el-table-column prop="flowKey" label="流程key"></el-table-column>
                        </el-table>
                </el-form-item>
            </el-form>
        </el-main>
    </el-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
    name:"agentGet",
    props:["id"],
    data() {
        return {
            rules:{
               /* expre:[
                    { required: true, message: '请输入常用语', trigger: 'blur' }
                ]*/

            }
        }
    },
     computed: mapState({
        form: state => state.agent.form,
      }),
    methods: {
        back() {
            this.$router.go(-1);//返回上一层
        }
    },
  created() {
    this.$store.dispatch("agent/detail",this.id);
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
.el-input__inner[aria-invalid='true'] {
  border-color: #f56c6c;
}

.el-select__tags {
  background: #fff;
  margin-left: 1px;
}

.left-aside {
  border-right: 1px solid #eee;
  padding: 10px;
}

.org-tree {
  height: 440px;
  margin-top: 10px;
}

.middle-header {
  border-bottom: 1px solid #eee;
  height: 52px !important;
}

.org-table {
  width: 100%;
  border-top-width: 0;
  border-left-width: 0;
}

.right-aside {
  border-left: 1px solid #eee;
}

.select-aside {
  border-left: 1px solid #eee;
}

.select-header {
  border-bottom: 1px solid #eee;
  height: 52px !important;
}

.select-header > span {
  padding: 10px 0;
  line-height: 53px;
}

.select-tree-div {
  height: 500px;
  overflow-y: auto;
}

>>> .el-dialog {
  margin-top: 8vh !important;
}

>>> .el-dialog__body {
  padding: 0;
}

>>> .el-card__header {
  padding: 10px;
}

>>> .el-card__body {
  padding: 10px;
}

.org-find-card >>> .el-card__header {
  background: #F5F7FA;
}

.button-group {
  width: 70px;
  height: 170px;
  margin: 0px auto;
  position: relative;
  top: 50%;
  -webkit-transform: translateY(-50%);
  -moz-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  -o-transform: translateY(-50%);
  transform: translateY(-50%);
}

.button-group > button {
  display: block;
  margin: 8px 0;
}
</style>

