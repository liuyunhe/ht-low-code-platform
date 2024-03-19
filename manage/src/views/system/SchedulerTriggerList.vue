<template>
  <el-container class="fullheight">
    <el-container>
      <el-main>
        <ht-table
          ref="triggersTable"
          @load="loadData"
          :data="data"
          :nopagination="true"
          :show-export="false"
        >
          <template v-slot:toolbar>
            <el-button size="small" @click="handleCommand({command:'add'})" icon="el-icon-plus">添加</el-button>
            <el-button size="small" @click="back()">返回</el-button>
          </template>
          <template>
            <ht-table-column type="index" width="50" align="center" label="序号" />
            <ht-table-column
              prop="jobName"
              label="任务名称"
              width="300"
              :sortable="true"
              :show-overflow-tooltip="true"
            />
            <ht-table-column prop="triggerName" label="计划名称" sortable />
            <ht-table-column prop="description" label="描述" sortable />
            <ht-table-column prop="state" label="状态">
              <template v-slot="{row}">
                <el-tag type="primary" v-if="row.state=='NORMAL'">启用</el-tag>
                <el-tag type="default" v-if="row.state=='PAUSED'">禁用</el-tag>
                <el-tag type="danger" v-if="row.state=='ERROR'">执行出错</el-tag>
                <el-tag type="success" v-if="row.state=='COMPLETE'">已完成</el-tag>
                <el-tag type="info" v-if="row.state=='BLOCKED'">正在执行</el-tag>
                <el-tag type="warning" v-if="row.state=='NONE'">未启动</el-tag>
              </template>
            </ht-table-column>
            <ht-table-column width="150" label="操作">
              <template v-slot="{row}">
                <el-dropdown
                  size="mini"
                  split-button
                  @command="handleCommand"
                  @click="handleCommand({row:row,command:'lookLog'})"
                >
                  <span>
                    <i class="el-icon-date"></i>日志
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                      icon="el-icon-success"
                      :command="{row:row,command:'banAndPlay',operation:'启用'}"
                      v-show="row.state=='PAUSED'"
                    >启用</el-dropdown-item>
                    <el-dropdown-item
                      icon="el-icon-error"
                      :command="{row:row,command:'banAndPlay',operation:'禁用'}"
                      v-show="row.state=='NORMAL'"
                    >禁用</el-dropdown-item>
                    <el-dropdown-item icon="el-icon-delete" :command="{row:row,command:'delete'}">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
            </ht-table-column>
          </template>
        </ht-table>

        <ht-sidebar-dialog
          width="43%"
          title="添加触发器"
          :visible="dialogVisible"
          :before-close="handleClose"
        >
          <el-form v-model="schedulerTrigger" data-vv-scope="addSchedulerTriggerForm">
            <ht-form-item
              label="计划名称"
              prop="description"
              label-width="120px"
              class="scheduler-input-width"
            >
              <ht-input
                v-model="schedulerTrigger.triggerName"
                :validate="{required:true}"
                placeholder="请输入计划名称"
              ></ht-input>
            </ht-form-item>
            <div class="obj-atter">
              <div class="obj-atter-panel">
                <div style="width: 13%;float: left">
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="设置一个对应的时间段，触发定时计划"
                    placement="right-start"
                  >
                    <el-button type="text" class="el-icon-question" style="color:#606266;">
                      <strong>执行计划的方式</strong>
                    </el-button>
                  </el-tooltip>
                </div>
              </div>
              <div>
                <table class="form-table" cellspacing="0" cellpadding="0" border="0">
                  <tbody>
                    <tr>
                      <th width="120px">
                        <ht-radio
                          v-model="schedulerTriggerOld.rdoTimeType"
                          :options="[{key:'1',value:'一次:'}]"
                        />
                      </th>
                      <td>
                        <ht-date
                          v-model="schedulerTriggerOld.sampleDate"
                          :disabled="schedulerTriggerOld.rdoTimeType!='1'"
                          :validate="{required:schedulerTriggerOld.rdoTimeType!='1'?false:true}"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th width="120px">
                        <ht-radio
                          v-model="schedulerTriggerOld.rdoTimeType"
                          :options="[{key:'2',value:'每天:'}]"
                        />
                      </th>
                      <td>
                        <ht-select
                          wthid="100%"
                          :disabled="schedulerTriggerOld.rdoTimeType!='2'"
                          v-model="schedulerTriggerOld.selEveryDay"
                          :options="selEveryDays"
                          :validate="{required:schedulerTriggerOld.rdoTimeType!='2'?false:true}"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th width="120px">
                        <ht-radio
                          v-model="schedulerTriggerOld.rdoTimeType"
                          :options="[{key:'4',value:'每周:'}]"
                        />
                      </th>
                      <td>
                        <ht-checkbox
                          v-model="schedulerTriggerOld.chkWeek"
                          :options="chkWeek"
                          :disabled="schedulerTriggerOld.rdoTimeType!='4'"
                          :validate="{required:schedulerTriggerOld.rdoTimeType!='4'?false:true}"
                        />
                        <el-time-picker
                          v-model="schedulerTriggerOld.txtWeek"
                          :disabled="schedulerTriggerOld.rdoTimeType!='4'"
                          placeholder="选择时间"
                          value-format="HH:mm:ss"
                        ></el-time-picker>
                      </td>
                    </tr>
                    <tr>
                      <th width="120px">
                        <ht-radio
                          v-model="schedulerTriggerOld.rdoTimeType"
                          :options="[{key:'5',value:'每月:'}]"
                        />
                      </th>
                      <td>
                        <ht-checkbox
                          v-model="schedulerTriggerOld.chkMons"
                          :options="chkMons"
                          :disabled="schedulerTriggerOld.rdoTimeType!='5'"
                          :validate="{required:schedulerTriggerOld.rdoTimeType!='5'?false:true}"
                        />
                        <el-time-picker
                          v-model="schedulerTriggerOld.txtMon"
                          :disabled="schedulerTriggerOld.rdoTimeType!='5'"
                          placeholder="选择时间"
                          value-format="HH:mm:ss"
                        ></el-time-picker>
                      </td>
                    </tr>
                    <tr>
                      <th width="120px">
                        <ht-radio
                          v-model="schedulerTriggerOld.rdoTimeType"
                          :options="[{key:'6',value:'Cron表达式:'}]"
                        />
                      </th>
                      <td>
                        <ht-input
                          type="textarea"
                          v-model="schedulerTriggerOld.txtCronExpression"
                          :disabled="schedulerTriggerOld.rdoTimeType!='6'"
                          :validate="{required:schedulerTriggerOld.rdoTimeType!='6'?false:true}"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <ht-submit-button
              url="${portal}/job/scheduler/v1/addTrigger"
              :model="schedulerTrigger"
              scope-name="addSchedulerTriggerForm"
              @before-save-data="beforeSaveData"
              @after-save-data="afterSaveData"
              :is-submit="isSubmit"
            >{{$t('eip.common.save')}}</ht-submit-button>
            <el-button @click="handleClose">{{$t('eip.common.cancel')}}</el-button>
          </div>
        </ht-sidebar-dialog>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
import sys from "@/api/portal.js";
export default {
  //name: "schedulerTriggerList",
  props: {
    jobName: String
  },
  components: {},
  data() {
    return {
      data: [],
      selEveryDays: [
        { key: 1, value: "1分钟" },
        { key: 5, value: "5分钟" },
        { key: 10, value: "10分钟" },
        { key: 15, value: "15分钟" },
        { key: 30, value: "30分钟" },
        { key: 60, value: "1小时" }
      ],
      chkWeek: [
        { key: "MON", value: "星期一" },
        { key: "TUE", value: "星期二" },
        { key: "WED", value: "星期三" },
        { key: "THU", value: "星期四" },
        { key: "FRI", value: "星期五" },
        { key: "SAT", value: "星期六" },
        { key: "SUN", value: "星期天" }
      ],
      chkMons: [],
      schedulerTrigger: {
        rdoTimeType: "1"
      },
      dialogVisible: false,
      options: [
        { key: "1", value: "一次：" },
        { key: "0", value: "每天：" },
        { key: "0", value: "每周：" },
        { key: "0", value: "每月：" },
        { key: "0", value: "Cron表达式：" }
      ],
      schedulerTriggerOld: {
        rdoTimeType: "2", //单选框
        txtCronExpression: "", //Cron表达式值
        sampleDate: "",
        selEveryDay: "",
        chkWeek: "",
        txtWeek: "",
        chkMons: "",
        txtMon: ""
      },
      isSubmit: true
    };
  },
  computed: {},
  created() {
    for (let index = 1; index < 32; index++) {
      //this.chkMons.push({ key: '"'+index+'"', value: index});
      this.chkMons.push({ key: index.toString(), value: index.toString() });
    }
  },
  methods: {
    beforeSaveData() {
      const jobName = this.$route.params.jobName;
      if (!jobName) {
        this.$message.error("未获取到当前定时计划名称");
        return;
      }
      this.isSubmit = true;
      this.schedulerTrigger.jobName = decodeURI(jobName);
      this.schedulerTrigger.description = this.getPlan(
        this.schedulerTriggerOld.rdoTimeType
      );
    },
    afterSaveData() {
      this.dialogVisible = false;
      this.$refs.triggersTable.load();
    },
    handleClose() {
      this.dialogVisible = false;
    },
    getPlan(planType) {
      var str = "";
      switch (planType) {
        case "1":
          str = this.schedulerTriggerOld.sampleDate;
          str = '{"type":1,"timeInterval":"' + str + '"}';
          break;
        case "2":
          str = this.schedulerTriggerOld.selEveryDay;
          str = '{"type":2,"timeInterval":"' + str + '"}';
          break;
        // case "3":
        //   var h = $scope.txtDayHour;
        //   var m = $scope.txtDayMinute;
        //   str = h + ":" + m;
        //   str = '{"type":3,"timeInterval":"' + str + '"}';
        //   break;
        case "4":
          str = this.schedulerTriggerOld.chkWeek;
          str += "|" + this.schedulerTriggerOld.txtWeek;
          str = '{"type":4,"timeInterval":"' + str + '"}';
          if (!this.schedulerTriggerOld.txtWeek) {
            this.$message.warning("时间不能为空！");
            this.isSubmit = false;
            return;
          }
          break;
        case "5":
          //"{"type":5,"timeInterval":"1,13|02:12"}"
          str = this.schedulerTriggerOld.chkMons;
          str += "|" + this.schedulerTriggerOld.txtMon;
          str = '{"type":5,"timeInterval":"' + str + '"}';
          if (!this.schedulerTriggerOld.txtMon) {
            this.$message.warning("时间不能为空！");
            this.isSubmit = false;
            return;
          }
          break;
        case "6":
          str += this.schedulerTriggerOld.txtCronExpression;
          str = '{"type":6,"timeInterval":"' + str + '"}';
          break;
      }
      return str;
    },
    handleCommand(params) {
      switch (params.command) {
        case "lookLog":
          this.$router.push({
            name: "executeJobList",
            params: {
              jobName: params.row.jobName,
              tobName: params.row.jobName + "定时计划日志",
              trigName: params.row.triggerName
            }
          });
          break;
        case "banAndPlay":
          this.$confirm("是否确认" + params.operation + "？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
            .then(() => {
              sys.toggleTriggerRun(params.row.triggerName).then(
                data => {
                  if (data.state) {
                    this.$message.success(data.message);
                    this.$refs.triggersTable.load();
                  } else {
                    this.$message.error(
                      data.message || params.operation + "失败"
                    );
                  }
                },
                error => {
                  this.$message.error(error || params.operation + "失败");
                }
              );
            })
            .catch(() => {});
          break;
        case "add":
          this.dialogVisible = true;
          //this.schedulerTriggerOld={};
          this.schedulerTriggerOld.sampleDate = "";
          this.schedulerTriggerOld.selEveryDay = "";
          this.schedulerTriggerOld.chkWeek = "";
          this.schedulerTriggerOld.txtWeek = "";
          this.schedulerTriggerOld.chkMons = "";
          this.schedulerTriggerOld.txtMon = "";
          this.schedulerTriggerOld.txtCronExpression = "";
          this.schedulerTriggerOld.rdoTimeType = "2";
          this.schedulerTrigger = {};
          break;
        case "delete":
          this.$confirm("是否确认删除？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
            .then(() => {
              sys.delTrigger(params.row.triggerName).then(
                data => {
                  if (data.state) {
                    this.$message.success(data.message);
                    this.$refs.triggersTable.load();
                  } else {
                    this.$message.error(data.message || "删除失败");
                  }
                },
                error => {
                  this.$message.error(error || "删除失败");
                }
              );
            })
            .catch(() => {});
          break;
        default:
          break;
      }
    },
    back() {
      //this.$router.go(-1);
      this.$router.push("/schedulerManager");
    },
    loadData(param, cb) {
      sys
        .getTriggersJsonByJob(
          window.context.portal +
            "/job/scheduler/v1/getTriggersJsonByJob?jobName=" +
            this.$route.params.jobName,
          param
        )
        .then(response => {
          this.data = response;
        })
        .finally(() => cb());
    }
  }
};
</script>

<style scoped>
.el-main {
  padding: 0px;
}
</style>