<template>
  <div>
    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      width="70%"
      appendToBody
      :close-on-click-modal="false"
      top="8vh"
    >
      <el-container v-if="dialogVisible">
        <el-tabs v-model="curEditTab" type="card" style="width:100%;">
          <el-tab-pane label="发起人设置" name="first">
            <form v-form>
              <table
                class="table table-bordered"
                style="border-spacing: 0;width: 100%;max-height: 400px;overflow: initial;"
              >
                <thead>
                  <th style="width:15%">人员类型</th>
                  <th>内容</th>
                  <th style="width:15%">操作</th>
                </thead>
                <tbody>
                  <tr
                    v-for="(item,$index) in startUser"
                    :key="item.title"
                    :data-index="$index"
                    data-subname="startUser"
                  >
                    <th>{{item.title}}</th>
                    <td>
                      <eip-user-selector
                        v-if="item.type=='user'"
                        :appendToBody="true"
                        v-model="item.name"
                        :config="{id:'item.id'}"
                        :key="selectorKey"
                      />
                      <eipRoleSelector
                        v-if="item.type=='group' && item.groupType=='role'"
                        :appendToBody="true"
                        v-model="item.name"
                        :config="{id:'item.id'}"
                        :key="selectorKey"
                      />
                      <eipOrgSelector
                        v-if="item.type=='group' && item.groupType=='org'"
                        :appendToBody="true"
                        v-model="item.name"
                        :config="{id:'item.id'}"
                        :key="selectorKey"
                      />
                      <eipPostSelector
                        v-if="item.type=='group' && item.groupType=='position'"
                        :appendToBody="true"
                        v-model="item.name"
                        :config="{id:'item.id'}"
                        :key="selectorKey"
                      />
                    </td>
                    <td>
                      <el-button @click="updateNeedSetArr($index)">重置</el-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </form>
          </el-tab-pane>
          <el-tab-pane label="表单数据" name="second">
            <div style="float: left;width:30%;height: 100%;">
              <FlowVarSelector
                :defId="defId"
                type="2"
                @node-click="onConfirm"
                :removeSub="true"
                :includeBpmConstants="false"
              />
            </div>
            <div style="width:68%;float: left;margin-left: 10px;height: 100%;">
              <div v-if="selectFiled">
                <!-- 常用脚本选择对话框  -->
                <eip-script-dialog
                  ref="whenSaveDialog"
                  v-model="formDataConf[selectFiled]"
                  append-to-body
                />
                <el-button @click="$refs.whenSaveDialog.showDialog();">常用脚本</el-button>
                <!-- 可选变量对话框 -->
                <FlowVarSelector :defId="defId"  v-model="formDataConf[selectFiled]" :isBpmForm="false" />
                <br/>
                <p style="color: red;">如果设置的是固定值，请用""包裹。</p>
                <ht-input
                  v-if="selectFiled"
                  type="textarea"
                  :rows="14"
                  class="ht"
                  v-model="formDataConf[selectFiled]"
                  placeholder="请输入字段值设置"
                  autocomplete="off"
                ></ht-input>
              </div>
              <div v-if="!selectFiled" class="form-empty">请选择一个字段进行设置</div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="发起时机" name="third">
            <table class="form-table" cellspacing="0" cellpadding="0" border="0">
              <tbody>
                <tr>
                  <th width="120px">
                    <ht-radio v-model="triggerConf.rdoTimeType" :options="[{key:'1',value:'一次:'}]" />
                  </th>
                  <td>
                    <ht-date
                      v-model="triggerConf.sampleDate"
                      :disabled="triggerConf.rdoTimeType!='1'"
                      :validate="{required:triggerConf.rdoTimeType!='1'?false:true}"
                    />
                  </td>
                </tr>
                <tr>
                  <th width="120px">
                    <ht-radio v-model="triggerConf.rdoTimeType" :options="[{key:'2',value:'每天:'}]" />
                  </th>
                  <td>
                     <el-time-picker
                      v-model="triggerConf.txtDay"
                      :disabled="triggerConf.rdoTimeType!='2'"
                      placeholder="选择时间"
                      value-format="HH:mm"
                    ></el-time-picker>
                  </td>
                </tr>
                <tr>
                  <th width="120px">
                    <ht-radio v-model="triggerConf.rdoTimeType" :options="[{key:'4',value:'每周:'}]" />
                  </th>
                  <td>
                    <ht-checkbox
                      v-model="triggerConf.chkWeek"
                      :options="chkWeek"
                      :disabled="triggerConf.rdoTimeType!='4'"
                      :validate="{required:triggerConf.rdoTimeType!='4'?false:true}"
                    />
                    <el-time-picker
                      v-model="triggerConf.txtWeek"
                      :disabled="triggerConf.rdoTimeType!='4'"
                      placeholder="选择时间"
                      value-format="HH:mm"
                    ></el-time-picker>
                  </td>
                </tr>
                <tr>
                  <th width="120px">
                    <ht-radio v-model="triggerConf.rdoTimeType" :options="[{key:'5',value:'每月:'}]" />
                  </th>
                  <td>
                    <ht-checkbox
                      v-model="triggerConf.chkMons"
                      :options="chkMons"
                      :disabled="triggerConf.rdoTimeType!='5'"
                      :validate="{required:triggerConf.rdoTimeType!='5'?false:true}"
                    />
                    <el-time-picker
                      v-model="triggerConf.txtMon"
                      :disabled="triggerConf.rdoTimeType!='5'"
                      placeholder="选择时间"
                      value-format="HH:mm"
                    ></el-time-picker>
                  </td>
                </tr>

              </tbody>
            </table>
          </el-tab-pane>
        </el-tabs>
      </el-container>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleClose" size="medium">确 定</el-button>
        <el-button @click="dialogVisible = false" size="medium">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import utils from "@/hotent-ui-util.js";

const eipRoleSelector = () =>
  import("@/components/selector/EipRoleSelector.vue");
const eipOrgSelector = () => import("@/components/selector/EipOrgSelector.vue");
const eipPostSelector = () =>
  import("@/components/selector/EipPostSelector.vue");
const eipUserSelector = () =>
  import("@/components/selector/EipUserSelector.vue");
const FlowVarSelector = () => import("@/components/flow/FlowVarSelector.vue");
const eipScriptDialog = () => import("@/components/dialog/EipScriptDialog.vue");

export default {
  props: ["defId"],
  components: {
    eipUserSelector,
    eipOrgSelector,
    eipRoleSelector,
    eipPostSelector,
    FlowVarSelector,
    eipScriptDialog
  },
  data() {
    return {
      dialogVisible: false,
      title: "流程自动发起设置",
      curEditTab: "first",
      startUser: [
        { title: "用户", type: "user", name: "", id: "" },
        { title: "角色", groupType:"role",type: "group", name: "", id: "" },
        { title: "组织", groupType:"org", type: "group", name: "", id: "" },
        { title: "岗位",  groupType:"position",type: "group", name: "", id: "" }
      ],
      selectorKey: 1,
      conf: {},
      treeData: [], //树数据
      defaultProps: {
        children: "children",
        label: "desc"
      },
      formDataConf: {},
      selectFiled: "",
      triggerConf: {},
      selEveryDays: [
        { key: 1, value: "1分钟" },
        { key: 5, value: "5分钟" },
        { key: 10, value: "10分钟" },
        { key: 15, value: "15分钟" },
        { key: 30, value: "30分钟" },
        { key: 60, value: "1小时" }
      ],
      chkWeek: [
        { key: "1", value: "星期一" },
        { key: "2", value: "星期二" },
        { key: "3", value: "星期三" },
        { key: "4", value: "星期四" },
        { key: "5", value: "星期五" },
        { key: "6", value: "星期六" },
        { key: "7", value: "星期天" }
      ],
      options: [
        { key: "1", value: "一次：" },
        { key: "0", value: "每天：" },
        { key: "0", value: "每周：" },
        { key: "0", value: "每月：" },
        { key: "0", value: "Cron表达式：" }
      ],
      chkMons: []
    };
  },
  methods: {
    varTreeWhenSave: function() {},
    onConfirm: function(data) {
      this.selectFiled = data.path + "." + data.name;
    },
    show: function() {
      this.dialogVisible = true;
      this.curEditTab = "first";
      this.selectFiled = "";
      this.formDataConf = {};
      this.triggerConf = {};
      let this_ = this;
      this.$http
        .get(
          "${bpmRunTime}/bpm/bpmAutoStartConf/v1/getByDefId?defId=" + this.defId
        )
        .then(function(respose) {
          let data = respose.data;
          if (!data) {
            return;
          }
          this_.conf = data;
          if (data.startUser) {
            this_.startUser = JSON.parse(data.startUser);
          }
          if (data.formData) {
            this_.formDataConf = JSON.parse(data.formData);
          }
          if (data.trigger) {
            this_.triggerConf = JSON.parse(data.trigger);
          }
        });
    },
    handleClose: function() {
      this.conf.startUser = JSON.stringify(this.startUser);
      this.conf.formData = JSON.stringify(this.formDataConf);
      this.conf.trigger = JSON.stringify(this.triggerConf);
      let this_ = this;
      this.$http
        .post("${bpmRunTime}/bpm/bpmAutoStartConf/v1/save", this.conf)
        .then(function(respose) {
          let data = respose.data;
          if (data && data.state) {
            this_.$message.success("保存成功");
            this_.dialogVisible = false;
          }
        });
    },
    updateNeedSetArr(index) {
      this.startUser[index].id = "";
      this.startUser[index].name = "";
      ++this.selectorKey;
    }
  },
  created() {
    for (let index = 1; index < 32; index++) {
      //this.chkMons.push({ key: '"'+index+'"', value: index});
      this.chkMons.push({ key: index.toString(), value: index.toString() });
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
  vertical-align: middle;
  padding: 6px;
}
.table {
  border-bottom: 1px solid #e7eaec;
  border-right: 1px solid #e7eaec;
  border-spacing: 0;
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
.labelrag {
  padding: 0.2em 0.2em 0.3em;
  font-size: 75%;
  font-weight: 700;
  line-height: 1;
  background-color: #fff;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 12px;
  width: 70px;
  line-height: 20px;
  border: solid 1px;
  position: absolute;
  z-index: 3;
}
div >>> .labelrag > .selected_search {
  width: 60px;
  border: none;
  outline: none;
  height: 22px;
}
div >>> .labelrag > .el-select > .el-input > .el-input__inner {
  padding: 0px;
  border: none;
  height: 26px;
}
.custom_condition_tab {
  width: 700px;
  position: absolute;
}

.form-empty {
  position: absolute;
  text-align: center;
  width: 300px;
  font-size: 20px;
  top: 100px;
  left: 50%;
  color: #ccc;
}

div >>> .el-tree {
  background: #fff !important;
}
</style>
