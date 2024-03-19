<template>
  <ht-sidebar-dialog
    title="设置流程报表"
    :visible="dialogVisible"
    width="32%"
    :before-close="beforeClose"
    append-to-body
  >
    <el-form v-form>
      <ht-form-item label="分类标题" v-if="!report.id">
        <ht-input style="width: 100%;" v-model="name" :validate="{required:true}"/>
      </ht-form-item>
      <ht-form-item label="统计标题">
        <ht-input style="width: 100%;" v-model="data.reportName" :validate="{required:true}"/>
      </ht-form-item>
      <ht-form-item label="流程范围">
        <el-radio-group v-model="data.porp.flowType" @change="changeFlowType">
          <el-radio :label="'1'">流程</el-radio>
          <el-radio :label="'2'">流程分类</el-radio>
        </el-radio-group>
      </ht-form-item>
      <ht-form-item :label="data.porp.flowType==='1'?'流程':'流程分类'">
        <ht-input :disabled="true" type="textarea" v-model="data.porp.name" placeholder="不选择时统计所有流程"/>
        <el-button @click="showDialog(data.porp.flowType==='1'?'eipFlowDialog':'flowTypeDialog')">选择</el-button>
      </ht-form-item>
      <ht-form-item label="部门/人员范围" label-width="120px">
        <el-radio-group v-model="data.porp.orgType">
          <el-radio :label="'1'">部门</el-radio>
          <el-radio :label="'2'">人员</el-radio>
        </el-radio-group>
      </ht-form-item>
      <ht-form-item :label="data.porp.orgType==='1'?'部门':'人员'">
        <eip-user-selector
          v-show="data.porp.orgType==='2'"
          v-model="data.porp.userNames"
          :config="{id:'data.porp.userIds'}"
          :validate="{required:true}"
          append-to-body
        />
        <eip-org-selector
          v-show="data.porp.orgType==='1'"
          v-model="data.porp.orgNames"
          :config="{id:'data.porp.orgIds'}"
          :validate="{required:true}"
          append-to-body
        />
      </ht-form-item>
      <ht-form-item label="统计维度">
        <ht-radio
          :options="[{key:'org',value:'部门/人员维度'},{key:'flow',value:'流程/流程分类维度'}]"
          v-model="data.porp.dimension"
        />
      </ht-form-item>
      <ht-form-item label="统计策略">
        <ht-select
          :options="strategy"
          :props="{key:'key',value:'value'}"
          v-model="data.params"
          placeholder="请选择统计策略"
          :validate="{required:true}"
        />
      </ht-form-item>
      <ht-form-item label="统计周期">
        <el-radio-group v-model="data.porp.calcuCycle" @change="changeType">
          <el-radio :label="p.key" v-for="p in period">{{p.value}}</el-radio>
        </el-radio-group>
<!--        <ht-radio :options="period" v-model="data.porp.calcuCycle" @change="changeType" />-->
      </ht-form-item>
      <ht-form-item label="统计区间">
        <template v-if="data.porp.calcuCycle==='year'">
          <ht-select :options="yearArray" v-model="data.porp.calcuStart" />至
          <ht-select :options="yearArray" v-model="data.porp.calcuEnd" />
        </template>
        <template v-if="data.porp.calcuCycle==='quarter'">
          <ht-select :options="quarterArray" v-model="data.porp.calcuStart" />至
          <ht-select :options="quarterArray" v-model="data.porp.calcuEnd" />
        </template>
        <template v-if="data.porp.calcuCycle==='monthly'">
          <ht-select :options="monthlyArray" v-model="data.porp.calcuStart" />至
          <ht-select :options="monthlyArray" v-model="data.porp.calcuEnd" />
        </template>
        <template v-if="data.porp.calcuCycle==='custom'">
          <el-date-picker v-model="data.porp.calcuStart" type="datetime" placeholder="选择日期时间" />至
          <el-date-picker v-model="data.porp.calcuEnd" type="datetime" placeholder="选择日期时间" />
        </template>
      </ht-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="dialogVisible = false">取消</el-button>
    </div>
    <eip-flow-dialog ref="eipFlowDialog" @onConfirm="dialogOnConfirm" append-to-body />
    <eip-sys-type-dialog
      ref="flowTypeDialog"
      cat-id="6"
      @onConfirm="sysTypeDialogOnConfirm"
      show-checkbox
      append-to-body
    />
  </ht-sidebar-dialog>
</template>

<script>
import flow from "@/api/flow.js";
const eipFlowDialog = () => import("@/components/dialog/EipFlowDialog.vue");
const eipSysTypeDialog = () =>
  import("@/components/dialog/EipSysTypeDialog.vue");
const eipUserSelector = () =>
  import("@/components/selector/EipUserSelector.vue");
const eipOrgSelector = () => import("@/components/selector/EipOrgSelector.vue");
export default {
  components: {
    eipFlowDialog,
    eipSysTypeDialog,
    eipUserSelector,
    eipOrgSelector
  },
  props: {
    id: {
      type: String,
      default: ""
    },
    report: {
      type: Object,
      default: () => {
        return { id: "", name: "" };
      }
    }
  },
  data() {
    return {
      dialogVisible: false,
      data: {
        porp: {
          flowType: "1",
          name: "",
          orgNames: "",
          orgType: "1",
          calcuCycle: "year",
          dimension: "org",
          orgIds:'',
          orgNames:''
        },
        reportName: ""
      },
      strategy: [
        { key: "start_throughput", value: "启动流程吞吐量" },
        { key: "handle_throughput", value: "办件吞吐量" },
        { key: "handle_efficiency", value: "办件效率" },
        { key: "work_status", value: "工作状态" },
        { key: "task_num", value: "任务量" },
        { key: "inst_start_num", value: "流程启动" },
        { key: "flow_status", value: "流程状态" }
      ],
      period: [
        { key: "year", value: "年度" },
        { key: "quarter", value: "季度" },
        { key: "monthly", value: "月度" },
        { key: "custom", value: "自定义" }
      ],
      timeArray: [],
      yearArray: [],
      quarterArray: [],
      monthlyArray: [],
      customArray: [],
      changeInit: {
        year: new Date().getFullYear(),
        quarter: new Date().getFullYear() + "-2",
        monthly: new Date().getFullYear() + "-" + (new Date().getMonth() + 1),
        custom: "2020-01-01"
      },
      name: ""
    };
  },
  mounted() {
    this.initTimeArray();
  },
  methods: {
    beforeClose() {
      this.dialogVisible = false;
    },
    handleOpen() {
      this.dialogVisible = true;
      this.$nextTick(() => {
        if (this.id) {
          this.getReportSettingData();
        } else {
          this.name = "";
          this.data = {
            reportName: "",
            porp: {
              name: "",
              id: "",
              flowType: "1",
              orgType: "1",
              calcuCycle: "year",
              dimension: "org",
              orgIds:'',
              orgNames:'',
              userIds:'',
              userNames:'',
              calcuStart: new Date().getFullYear(),
              calcuEnd: new Date().getFullYear(),
              flowStatus: {
                running: true,
                back: true,
                manualend: true,
                end: true,
                instances: true,
                hourLong: true,
                incomplete: true,
                avgLong: true,
                overtime: true,
                closingRate: true
              }
            },
            rightContent: {
              histogram: true,
              line: true,
              pie: true,
              dataViews: true
            },
            isDefault: "1",
            reportId: this.report.id ? this.report.id : "",
            name: this.report.name ? this.report.name : ""
          };
        }
      });
    },
    getReportSettingData() {
      flow.getAct(this.id).then(data => {
        if (data && data.porp) {
          data.porp = JSON.parse(data.porp);
          //选择的是用户
          if (data.porp.orgType == 2) {
            data.porp.userIds = data.porp.orgIds || '';
            data.porp.userNames = data.porp.orgNames || '';
            data.porp.orgIds =  '';
            data.porp.orgNames =  '';
          }else{
            data.porp.userIds = '';
            data.porp.userNames = '';
            data.porp.orgIds =  data.porp.orgIds || '';
            data.porp.orgNames = data.porp.orgNames || '';
          }
        }
        this.data = data;
        this.data.rightContent = JSON.parse(data.rightContent);
        this.data.name = this.report.name;
      });
    },
    initTimeArray() {
      let date = new Date();
      date.setMonth(-10);
      let monthlyYear = date.getFullYear();
      let currentYear = new Date().getFullYear();

      for (let i = 0; i < 20; i++) {
        this.yearArray.push({
          key: currentYear - (10 - i),
          value: currentYear - (10 - i) + "年"
        });
        this.quarterArray.push({
          key: currentYear - Math.floor((10 - i + 1) / 4) + "-" + ((i % 4) + 1),
          value:
            currentYear -
            Math.floor((10 - i + 1) / 4) +
            "年第" +
            ((i % 4) + 1) +
            "季度"
        });
        date.setMonth(i % 12);
        date.setFullYear(monthlyYear + Math.floor(i / 12));
        this.monthlyArray.push({
          key: date.getFullYear() + "-" + (date.getMonth() + 1),
          value: date.getFullYear() + "年" + (date.getMonth() + 1) + "月"
        });
      }
    },
    dialogOnConfirm(data) {
      this.data.porp.name = "";
      this.data.porp.id = "";
      for (let i = 0; i < data.length; i++) {
        if (i === data.length - 1) {
          this.data.porp.name += data[i].name;
          this.data.porp.id += data[i].defKey;
          break;
        }
        this.data.porp.name += data[i].name + ",";
        this.data.porp.id += data[i].defKey + ",";
      }
    },
    sysTypeDialogOnConfirm(data) {
      this.data.porp.name = "";
      this.data.porp.id = "";
      for (let i = 0; i < data.length; i++) {
        if (i === data.length - 1) {
          this.data.porp.name += data[i].name;
          this.data.porp.id += data[i].id;
          break;
        }
        this.data.porp.name += data[i].name + ",";
        this.data.porp.id += data[i].id + ",";
      }
    },
    showDialog(type) {
      if (type === "eipFlowDialog") {
        let params = [];
        let names = [];
        let ids = [];
        if (this.data.porp.name) {
          names = this.data.porp.name.split(",");
          ids = this.data.porp.id.split(",");
        }
        for (let i = 0; i < names.length; i++) {
          params.push({ name: names[i], defKey: ids[i] });
        }
        this.$refs[type].showDialog(params);
      } else {
        this.$refs[type].showDialog();
      }
    },
    changeType(data) {
      this.data.porp.calcuStart = this.changeInit[data];
      this.data.porp.calcuEnd = this.changeInit[data];
    },
    changeFlowType() {
      this.data.porp.id = "";
      this.data.porp.name = "";
    },
    save() {
      if (this.report.id) {
        this.saveAct();
      } else {
        this.saveTitle();
      }
    },
    saveTitle() {
      let titleData = {
        name: this.name,
        type: 0,
        id: ""
      };
      this.data.name = this.name;
      if (!this.saveCheck()){
        return;
      }
      flow.saveReport(titleData).then(data => {
        if (data.state) {
          this.data.reportId = data.value;
          this.data.name = this.name;
          this.saveAct();
        } else {
          this.$message.error(data.message);
        }
      });
    },
    saveAct() {
      if (!this.saveCheck()){
        return;
      }
      let data = { ...this.data };
      data = JSON.parse(JSON.stringify(data));
      //选择的是用户
      if (data && data.porp && data.porp.orgType == 2) {
         data.porp.orgIds =  data.porp.userIds ;
         data.porp.orgNames = data.porp.userNames ;
      }
      data.rightContent = JSON.stringify(data.rightContent);
      data.porp = JSON.stringify(data.porp);
      flow.saveAct(data).then(result => {
        if (result.state) {
          this.$message({ type: "success", message: "保存报表成功" });
          this.dialogVisible = false;
          this.$emit("after-save", {});
        } else {
          this.$message.error("保存报表失败");
        }
      });
    },
    saveCheck(){
      if (!this.data.name) {
        this.$message({ type: "warning", message: "请输入分类标题" });
        return false;
      }
      if (!this.data.reportName) {
        this.$message({ type: "warning", message: "请输入统计标题" });
        return false;
      }
      if (this.data.porp.dimension === "flow" && !this.data.porp.id) {
        this.$message({ type: "warning", message: "请选择流程范围" });
        return false;
      }
      if (this.data.porp.dimension === "org" && ((this.data.porp.orgType==='1' && !this.data.porp.orgIds) || (this.data.porp.orgType==='2' && !this.data.porp.userIds))) {
        this.$message({
          type: "warning",
          message:
            this.data.porp.orgType === "1" ? "请选择部门范围" : "请选择人员"
        });
        return false;
      }
      if (!this.data.params) {
        this.$message({ type: "warning", message: "请选择统计策略" });
        return false;
      }
      if (this.data.porp.calcuCycle === "year") {
        if (this.data.porp.calcuEnd < this.data.porp.calcuStart) {
          this.$message({
            type: "warning",
            message: "结束时间不能小于开始时间"
          });
          return false;
        }
      } else if (
        this.data.porp.calcuCycle === "quarter" ||
        this.data.porp.calcuCycle === "monthly"
      ) {
        let strEndYear = parseInt(this.data.porp.calcuEnd.slice(0, 4));
        let strStartYear = parseInt(this.data.porp.calcuStart.slice(0, 4));

        let strEnd = parseInt(this.data.porp.calcuEnd.slice(5));
        let strStart = parseInt(this.data.porp.calcuStart.slice(5));

        if (strEndYear < strStartYear) {
          this.$message({
            type: "warning",
            message: "结束时间不能小于开始时间"
          });
          return false;
        } else if (strEndYear === strStartYear) {
          if (strEnd < strStart) {
            this.$message({
              type: "warning",
              message: "结束时间不能小于开始时间"
            });
            return false;
          }
        }
      }
      return true;
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/.el-dialog__body{
  height: calc(100% - 170px);
}
</style>
