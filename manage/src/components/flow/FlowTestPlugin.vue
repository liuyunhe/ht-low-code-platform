<template>
  <div class="form-inline">
    <label class="control-label">{{node.name}}({{node.nodeId}})</label>
    <el-button type="primary" size="mini" @click="editAutoService">设置测试插件</el-button>
    <el-dialog
      width="70%"
      title="设置测试插件"
      :visible="dialogVisibleSetting"
      :before-close="close"
      :close-on-click-modal="false"
      append-to-body
      top="8vh"
    >
      <div style="width:100%;height: 550px;overflow: auto;">
        <div style="margin-bottom: 10px;">
          <el-button type="success" size="mini" @click="save" icon="el-icon-check">保 存</el-button>
          <el-button type="danger" size="mini" @click="close" icon="el-icon-close">关 闭</el-button>
        </div>
        <table class="form-table" cellspacing="0" cellpadding="0" border="0">
          <tbody>
            <tr>
              <th width="130px">消息内容:</th>
              <td>
                <ht-input
                  v-model="testPlugin.testMessage"
                  class="ht"
                  placeholder="请输入测试消息"
                  autocomplete="off"
                ></ht-input>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import req from "@/request.js";
import { mapState, mapActions } from "vuex";
import { Message } from "element-ui";

export default {
  name: "test-plugin",
  components: {},
  props: {
    //任务节点信息
    node: {
      type: Object,
      required: true
    },
    //流程配置信息
    defConfigData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      curEditSetting: "", //修改接收人配置的时候用于判断是修改富文本消息的还是修改普通消息的
      curEditRuleIndex: "", //下标，用于记录修改接收人配置的时候是哪条数据
      tabType: "message", //scriptNode:脚本任务，message：消息任务
      dialogVisibleSetting: false,
      isEdit: false, //是否编辑自动任务节点
      testPlugin: {}
    };
  },
  methods: {
    //设置自动任务
    editAutoService() {
      let Base64 = require("js-base64").Base64;
      this.dialogVisibleSetting = true;
      //根据定义id和节点id查询该自动任务节点是否已经配置过
      let this_ = this;
      req
        .get(
          "${bpmModel}/flow/plugins/v1/getTestPlugin?defId=" +
            this.node.defId +
            "&nodeId=" +
            this.node.nodeId
        )
        .then(function(data) {
          data = data.data;
          if (data) {
            this_.testPlugin = data;
          }else{
            this_.testPlugin = {};
          }
        });
    },
    save() {
      let this_ = this;
      //消息任务
      let url = "${bpmModel}/flow/plugins/v1/saveTestPlugin?defId="+this.node.defId+"&nodeId="+this.node.nodeId;
      req.post(url, JSON.stringify(this.testPlugin)).then(function(data) {
        data = data.data;
        if (data.state) {
          this_.dialogVisibleSetting = false;
          Message.success("消息任务配置成功");
        } else {
          Message.error(data.message);
        }
      });
    },
    //关闭自动任务设置列弹框
    close() {
      this.dialogVisibleSetting = false;
    }
  },
  mounted() {
    this.$validator = this.$root.$validator;
  }
};
</script>

<style lang="scss" scoped>
div >>> .el-dialog__body {
  padding: 10px 20px;
  color: #606266;
  font-size: 14px;
  word-break: break-all;
}
.ht_ce {
  margin-top: -10px !important;
}
.div_list {
  height: 30px;
  background: #e2e2e2;
  line-height: 30px;
  font-weight: bold;
  padding-left: 10px;
  margin-bottom: 10px;
}
>>> label.el-checkbox {
  margin: 5px 10px 0 0;
}
.ht {
  width: 100%;
}
.form-inline {
  float: left;
  width: 100%;
}
.left-label {
  width: 18%;
  float: left;
}
.control-label {
  word-break: break-all;
  text-align: right;
  color: #545252;
  font-size: 12px;
  padding: 0px 10px !important;
  font-weight: bold;
  line-height: 35px;
}
div >>> .box-card {
  margin-bottom: 20px;
}

div >>> .box-card .clearfix {
  padding-top: 20px;
}

div >>> .el-collapse-item__header {
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  font-weight: bold;
}

div >>> .el-button {
  padding: 7px;
  margin-right: 10px;
  margin-left: 0px !important;
}
.table > thead > tr > th,
.table > thead > th,
.table > tr > th,
.table > tfoot > tr > th,
.table > thead > tr > td,
.table > tr > td,
.table > tfoot > tr > td {
  border-top: 1px solid #e7eaec;
  border-left: 1px solid #e7eaec;
  line-height: 1.42857;
  padding: 4px 8px;
  vertical-align: middle;
  text-align: center;
}
.table {
  border-bottom: 1px solid #e7eaec;
  border-right: 1px solid #e7eaec;
  width: 100%;
  border-spacing: 0;
}
</style>