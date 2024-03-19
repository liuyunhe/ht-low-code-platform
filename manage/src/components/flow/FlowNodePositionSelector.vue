<template>
  <div>
    <el-dialog
      title="岗位选择"
      :visible.sync="dialogVisible"
      v-if="dialogVisible"
      width="80%"
      appendToBody
      :close-on-click-modal="false"
      top="8vh"
    >
      <form v-form>
        <el-container style="height:520px">
          <table class="table table-bordered" style="border-spacing: 0;width: 100%;">
            <tbody>
              <tr>
                <th style="width: 15%;">岗位</th>
                <td>
<!--                  <el-radio v-model="data.source" label="startSuper">发起人的上级岗位</el-radio>-->
<!--                  <el-radio v-model="data.source" label="prevSuper">上一步执行人的上级岗位</el-radio>-->
                  <el-radio v-model="data.source" label="spec">指定岗位</el-radio>
                </td>
              </tr>
              <tr v-show="data.source=='spec'">
                <th>指定岗位</th>
                <td>
                  <eipPostSelector
                    :single="true"
                    :appendToBody="true"
                    v-model="data.posName"
                    :config="{code:'data.posCode'}"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </el-container>
      </form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleClose" size="medium">确 定</el-button>
        <el-button @click="dialogVisible = false" size="medium">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import flow from "@/api/flow.js";
import req from "@/request.js";
import { mapState, mapActions } from "vuex";
const eipPostSelector = () =>
  import("@/components/selector/EipPostSelector.vue");

import utils from "@/hotent-ui-util.js";
export default {
  components: { eipPostSelector },
  data() {
    return {
      userConditionTab: "first",
      dialogVisible: false,
      data: {}
    };
  },
  methods: {
    showDialog: function(param) {
      this.dialogVisible = true;
      this.parentParam = param;
      if (param.calc) {
        this.data = JSON.parse(JSON.stringify(param.calc));
      }
    },
    handleClose: function() {
      if (this.data.source == "startSuper") {
        this.data.description = "发起人的上级岗位";
        this.data.posName = "";
        this.data.posCode = ""
      } else if (this.data.source == "prevSuper") {
        this.data.description = "上一步执行人的上级岗位";
        this.data.posName = "";
        this.data.posCode = ""
      } else if (this.data.source == "spec") {
        this.data.description = "[指定岗位]" + this.data.posName;
      }
      this.$emit("positionSelectorConfirm", this.data);
      this.dialogVisible = false;
    }
  }
};
</script>

<style  scoped>
div >>> .el-dialog__body {
  padding: 10px;
}

.table > thead > tr > th,
.table > thead > th,
.table > tbody > tr > th,
.table > tfoot > tr > th,
.table > thead > tr > td,
.table > tbody > tr > td,
.table > tfoot > tr > td {
  border-top: 1px solid #e7eaec;
  border-left: 1px solid #e7eaec;
  line-height: 1.42857;
  padding: 8px;
  vertical-align: middle;
}
.table {
  border-bottom: 1px solid #e7eaec;
  border-right: 1px solid #e7eaec;
}
.table >>> .el-button {
  padding: 6px 8px;
  margin-left: 0px;
  margin-right: 5px;
}
div >>> .el-tabs__content {
  height: 450px;
  overflow: auto;
}
</style>
