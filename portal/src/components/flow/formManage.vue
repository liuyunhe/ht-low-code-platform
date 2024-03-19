<template>
  <el-container>
    <el-header height="48px">
      <el-row>
        <el-col :span="12" :offset="6" class="top-subject-col">
          <h3>{{subject}}</h3>
        </el-col>
        <el-col :span="6" class="top-btns-col">
          <el-button type="text" icon="el-icon-success" @click="saveFormData">保存修改</el-button>
        </el-col>
      </el-row>
    </el-header>
    <el-main>
      <el-card class="task-card" id="printTest" style="overflow: auto;" :class="{'task-card__wrap':isPlmeformPage}">
        <FormContent :instId="procInstId" :taskId="taskId" :type="type" />
      </el-card>
    </el-main>
  </el-container>
</template>

<script>
import FormContent from "@/components/flow/formContent.vue";
import { mapState, mapActions } from "vuex";
import utils from "@/utils.js";
import { Base64 } from "js-base64";

export default {
  name: "formManage",
  components: {
    FormContent
  },
  props: ["instId", "type", "taskId"],
  data() {
    return {
      procInstId: this.instId,
      defId: "",
      bpmnInstId: "",
      subject: "",
      status: "",
      choiceExcutor: "",
      jumpType: ""
    };
  },
  computed: {
    isPlmeformPage() {
      return this.$route.query.hasOwnProperty('plmeform')
    }
  },
  methods: {
    //保存数据
    saveFormData() {
      utils
        .getOnlineFormData(true)
        .then(formDataStr => {
          let jsonData = {};
          jsonData.proInstId = this.instId;
          jsonData.data = Base64.encode(formDataStr);
          jsonData.expression = "";
          this.disabled = true;
          this.$confirm("确认修改表单数据?", "提示", {
            cancelButtonText: "取消",
            confirmButtonText: "确定",
            type: "warning",
            closeOnClickModal: false
          })
            .then(() => {
              utils.closeAllNotification();
              this.$store
                .dispatch("storeProcess/saveFormData", jsonData)
                .then(resp => {
                  if (resp && resp.state) {
                    this.$message.success("修改成功");
                  } else {
                    let message =
                      resp && resp.message ? resp.message : "修改失败";
                    this.$message.error(message);
                  }
                });
            })
            .finally(() => {
              this.disabled = false;
            });
        })
        .catch((reason) =>
          utils.handleGetFormDataReject(reason)
        );
    }
  },
  created() {
    this.$store
      .dispatch("storeProcess/getInstanceByInstId", this.instId)
      .then(insts => {
        this.defId = insts.procDefId;
        this.bpmnInstId = insts.bpmnInstId;
        this.subject = insts.subject;
      });
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
.el-main {
  padding: 0;
}

.el-header {
  padding: 0;
}

.top-subject-col > h3 {
  text-align: center;
  color: #666;
}

.top-btns-col {
  padding-right: 6px;
  height: 48px;
  line-height: 48px;
  text-align: right;
}

.top-btns-col > button {
  color: #666;
}

.top-btns-col > button /deep/ span {
  margin-left: 3px;
}

.top-btns-col > button:hover {
  color: $--theme-color;
}

.text {
  font-size: 14px;
}

.item {
  padding: 18px 0;
}

.task-card {
  background: #fff;
  max-height:700px;
}
.task-card__wrap{
  max-height: unset;
}
</style>
