<template>
  <el-container>
    <el-header>
      <el-row>
        <el-col :span="22"> <h5 class="title">设置代理</h5> </el-col>
      </el-row>
    </el-header>
    <el-main>
      <el-form
        ref="form"
        :model="form"
        status-icon
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="是否接收邮件:">
          <el-radio v-model="form.isMail" :label="1">是</el-radio>
          <el-radio v-model="form.isMail" :label="0">否</el-radio>
        </el-form-item>
        <el-form-item label="代理人:">
          <ht-user-selector v-model="form.agentNames" single permission="w" />
        </el-form-item>
        <el-form-item label="是否有效:">
          <el-radio v-model="form.isUsable" :label="1">是</el-radio>
          <el-radio v-model="form.isUsable" :label="0">否</el-radio>
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="submitForm('form')"
            >保存</el-button
          >
        </el-form-item>
      </el-form>
    </el-main>
  </el-container>
</template>

<script>
import HtUserSelector from "@/components/control/HtUserSelector.vue";
export default {
  name: "bpmDeputySetting",
  data() {
    return {
      form: {},
      agent: {}
    };
  },
  components: { HtUserSelector },
  methods: {
    submitForm(form) {
      let that = this;
      this.$refs[form].validate(valid => {
        if (valid) {
          if (that.form.agentNames && that.form.agentNames.length > 0) {
            that.form.agentId = that.form.agentNames[0].id;
            that.form.agentName = that.form.agentNames[0].fullname;
            delete that.form.agentNames;
          } else {
            that.form.agentId = "";
            that.form.agentName = "";
          }
          this.$store.dispatch("deputy/bpmDeputySave", that.form).then(res => {
            if(res.state){
              this.$message({
                message: res.message,
                type: "success"
              });
            }
          });
        } else {
          return false;
        }
      });
    }
  },
  created() {
    this.$store
      .dispatch("deputy/getByUserId", "")
      .then(data => (this.form = { ...data }));
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
