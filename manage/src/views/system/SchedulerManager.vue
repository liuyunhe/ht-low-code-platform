<template>
  <el-container class="fullheight">
    <el-container>
      <el-main>
        <ht-table
          ref="schedulerTable"
          @load="loadData"
          :data="data"
          :pageResult="pageResult"
          :selection="true"
          quick-search-props="jobName,jobClassNname"
          :show-export="false"
          @row-click="rowClick"
        >
          <!--  定时计划没有分页和快速搜索
          :pageResult="pageResult"
          :selection="true"
          quick-search-props="jobName,className"-->
          <template v-slot:toolbar>
            <el-button
              size="small"
              @click="handleCommand({ command: 'add' })"
              icon="el-icon-plus"
              >添加</el-button
            >
            <el-switch
              v-model="isStandby"
              active-color="#13ce66"
              inactive-color="#ff4949"
              style="margin-left: 20px;"
              @change="changeStart()"
            ></el-switch>
          </template>
          <!-- <template v-slot:search>
            <ht-table-search-panel :divide="3">
              <ht-table-search-field label="任务名称" prop="jobName" />
              <ht-table-search-field label="任务类" prop="className" />
            </ht-table-search-panel>
          </template>-->
          <template>
            <ht-table-column
              type="index"
              width="50"
              align="center"
              label="序号"
            />
            <ht-table-column
              prop="jobName"
              label="任务名称"
              width="300"
              :show-overflow-tooltip="true"
            >
              <template slot-scope="scope">
                <el-link
                  type="primary"
                  @click="showDialog(scope.row)"
                  title="编辑"
                  >{{ scope.row.jobName }}</el-link
                >
              </template>
            </ht-table-column>
            <ht-table-column prop="jobClassNname" label="任务类" />
            <ht-table-column prop="description" label="描述" />
            <ht-table-column width="150" label="操作">
              <template v-slot="{ row }">
                <el-dropdown
                  size="mini"
                  split-button
                  @command="handleCommand"
                  @click="handleCommand({ row: row, command: 'executeJob' })"
                >
                  <span> <i class="el-icon-caret-right"></i>执行 </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                      icon="el-icon-tickets"
                      :command="{ row: row, command: 'triggersJob' }"
                      >计划列表</el-dropdown-item
                    >
                    <!--                    <el-dropdown-item-->
                    <!--                      icon="el-icon-caret-right"-->
                    <!--                      :command="{row:row,command:'executeJob'}"-->
                    <!--                    >执行</el-dropdown-item>-->
                    <!-- <router-link to="executeJobList/com.hotent.job.job.FlowStartJob">日志</router-link>   v-link="{name: 'executeJob', params: {jobName: 'com.hotent.job.job.FlowStartJob'}}"-->
                    <el-dropdown-item
                      icon="el-icon-date"
                      :command="{ row: row, command: 'lookLog' }"
                      >日志</el-dropdown-item
                    >
                    <el-dropdown-item
                      icon="el-icon-delete"
                      :command="{ row: row, command: 'delete' }"
                      >删除</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
            </ht-table-column>
          </template>
        </ht-table>

        <el-dialog
          width="70%"
          :title="schedulerTitle"
          :visible="dialogVisible"
          :before-close="handleClose"
          :close-on-click-modal="false"
        >
          <el-form
            :disabled="schedulerDisabled"
            v-model="scheduler"
            data-vv-scope="editschedulerForm"
          >
            <ht-form-item
              label="任务名"
              prop="jobName"
              label-width="120px"
              class="scheduler-input-width"
            >
              <ht-input
                v-model="scheduler.jobName"
                :validate="{ required: true,max:100 }"
                placeholder="请输入任务名"
                @blur="isExist('jobName')"
                :disabled="isEdit"
              ></ht-input>
            </ht-form-item>
            <ht-form-item
              label="任务类"
              prop="className"
              label-width="120px"
              class="scheduler-input-width is-required"
            >
              <!-- <ht-input
                v-model="scheduler.className"
                :validate="{required:true}"
                placeholder="请输入任务类"
                @blur="isExist('className')"
                :disabled="isEdit"
              ></ht-input>-->
              <ht-input
                placeholder="请输入任务类"
                v-model="scheduler.className"
                class="input-with-select"
                :validate="{ required: true }"
              >
                <el-button slot="append" @click="validClass()"
                  >验证任务类</el-button
                >
              </ht-input>
            </ht-form-item>
            <!-- <ht-form-item label="" prop="" label-width="120px" class="scheduler-input-width">
          <el-button size="mini">验证任务类</el-button>
            </ht-form-item>-->
            <ht-form-item
              label="任务描述"
              prop="description"
              label-width="120px"
              class="scheduler-input-width"
            >
              <ht-input
                v-model="scheduler.description"
                :validate="{ required: true,max:100 }"
                placeholder="请输入名称"
              ></ht-input>
            </ht-form-item>
            <div class="obj-atter">
              <div class="obj-atter-panel">
                <div style="width: 13%;float: left">
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="任务参数"
                    placement="right-start"
                  >
                    <el-button
                      type="text"
                      class="el-icon-question"
                      style="color:#606266;"
                    >
                      <strong>对象属性管理</strong>
                    </el-button>
                  </el-tooltip>
                </div>
                <div>
                  <el-button
                    icon="el-icon-plus"
                    size="mini"
                    @click="addEntRows()"
                    plain
                    >添加</el-button
                  >
                </div>
              </div>
              <div>
                <el-table :data="parameterJson" border style="width: 100%">
                  <el-table-column
                    prop="name"
                    label="参数名"
                    align="center"
                    v-slot="{ row }"
                  >
                    <ht-input
                      v-model="row.name"
                      :validate="{ required: true }"
                      placeholder="请输入参数名"
                    />
                  </el-table-column>
                  <el-table-column
                    prop="type"
                    label="参数类型"
                    align="center"
                    v-slot="{ row }"
                  >
                    <ht-select
                      v-model="row.type"
                      :validate="{ required: true }"
                      :options="paraTypes"
                      placeholder="请选择参数类型"
                    />
                    <!-- <el-input v-model="row.paraType" placeholder="请输入参数类型"></el-input> -->
                  </el-table-column>
                  <el-table-column
                    prop="value"
                    label="参数值"
                    align="center"
                    v-slot="{ row }"
                  >
                    <ht-input
                      v-model="row.value"
                      :validate="{ required: true }"
                      placeholder="请输入参数值"
                    />
                  </el-table-column>
                  <el-table-column label="删除" width="70" align="center">
                    <template slot-scope="scope">
                      <el-button
                        icon="el-icon-close"
                        @click="deleteEntRows(scope.row)"
                      ></el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <ht-submit-button
              v-show="!schedulerDisabled"
              :url="saveschedulerUrl"
              :model="scheduler"
              :is-submit="isSubmit"
              :request-method="requestMethod"
              scope-name="editschedulerForm"
              @before-save-data="beforeSaveData"
              @after-save-data="afterSaveData"
              >{{ $t("eip.common.save") }}</ht-submit-button
            >
            <el-button @click="dialogCancle('dialogVisible')">{{
              $t("eip.common.cancel")
            }}</el-button>
          </div>
        </el-dialog>

        <!-- 加载定时计划状态-->
        <ht-load-data
          url="/job/scheduler/v1/getStand"
          context="portal"
          @after-load-data="afterGetStand"
        ></ht-load-data>
        <!-- 加载数据 用作编辑定时计划和查看定时计划-->
        <ht-load-data
          :url="loadDataUrl"
          context="portal"
          @after-load-data="afterLoadData"
        ></ht-load-data>
        <!-- isExistUrl 验证任务名或类名是否存在计划当中了  -->
        <ht-load-data
          :url="isExistUrl"
          context="portal"
          @after-load-data="afterIsExist"
        ></ht-load-data>
        <!-- isExistUrl 验证定时计划类是否存在  -->
        <ht-load-data
          :url="validClassUrl"
          context="portal"
          @after-load-data="afterValidClass"
        ></ht-load-data>
        <!--执行定时计划  -->
        <ht-load-data
          :url="executeJobUrl"
          requestMethod="post"
          context="portal"
          @after-load-data="afterExecuteJob"
        ></ht-load-data>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
import sys from "@/api/portal.js";
export default {
  components: {},
  data() {
    return {
      schedulerDisabled: false,
      schedulerTitle: "",
      loadDataUrl: "",
      dialogVisible: false,
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      isSubmit: true,
      scheduler: {},
      ent: {},
      isStandby: true,
      isExistUrl: "",
      isExistType: "",
      validClassUrl: "",
      parameterJson: [],
      paraTypes: [
        { key: "int", value: "int" },
        { key: "long", value: "long" },
        { key: "float", value: "float" },
        { key: "string", value: "string" },
        { key: "boolean", value: "boolean" }
      ],
      isEdit: false,
      saveschedulerUrl: "",
      executeJobUrl: ""
    };
  },
  computed: {
    requestMethod: function() {
      return this.scheduler.id ? "GET" : "POST";
    }
  },
  mounted() {
    this.$validator = this.$root.$validator;
  },
  updated(){
    if (this.isEdit) {
      this.saveschedulerUrl =
              window.context.portal +
              "/job/scheduler/v1/saveJob?jobName=" +
              encodeURI(this.scheduler.jobName);
    } else {
      this.saveschedulerUrl =
              window.context.portal + "/job/scheduler/v1/addJob";
    }
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.schedulerTable.$refs.htTable.toggleRowSelection(row);
    },
    //验证定时计划执行类是否存在
    validClass() {
      if (this.scheduler && this.scheduler.className) {
        this.validClassUrl =
          "/job/scheduler/v1/validClass?className=" +
          this.scheduler.className +
          "&radom=" +
          Math.random();
      } else {
        this.$message.warning("请先输入任务类再点击验证按钮");
      }
    },
    //验证任务名和类名
    isExist(type) {
      this.isExistType = type;
      var name = this.scheduler.className;
      if (type == "jobName") {
        name = this.scheduler.jobName;
      }
      this.isExistUrl =
        "/job/scheduler/v1/isExist?type=" + type + "&name=" + name;
    },
    //切换定时计划状态
    changeStart() {
      sys.changeStart(this.isStandby).then(
        data => {
          if (data.state) {
            this.$message.success(data.message);
          } else {
            this.$message.error(data.message || "操作失败");
          }
        },
        error => {
          this.$message.error(error || "操作失败");
        }
      );
    },
    deleteEntRows(rows) {
      this.parameterJson.remove(rows);
    },
    addEntRows() {
      let temp = {
        name: "",
        type: "",
        value: "",
        relation: ""
      };
      this.parameterJson.push(temp);
    },
    beforeSaveData() {
      if (!this.scheduler.className) {
        this.$message.warning("任务类不能为空");
        this.isSubmit = false;
        return;
      }
      this.scheduler.parameterJson = JSON.stringify(this.parameterJson);
      this.isSubmit = true;
    },
    afterSaveData() {
      this.isEdit = false;
      this.dialogVisible = false;
      this.$refs.schedulerTable.load();
    },
    afterGetStand(data) {
      this.isStandby = data;
    },
    afterValidClass(rep) {
      if (rep && rep.state) {
        this.$message.success(rep.message);
      }
    },
    afterExecuteJob(rep) {
      if (rep && rep.state) {
        this.$message.success(rep.message);
      } else {
        this.$message.error(rep.message || "执行失败");
      }
      this.executeJobUrl = "";
    },
    afterIsExist(data) {
      if (data) {
        var msg =
          this.isExistType == "jobName"
            ? "任务名称已经存在，请重新填写！"
            : "任务列表中已添加该任务类记录，不能多次添加同一任务类！";
        this.$message.error(msg);
        if (this.isExistType == "jobName") {
          this.scheduler.jobName = "";
        } else {
          this.scheduler.className = "";
        }
      }
      this.isExistType = "";
      this.isExistUrl = "";
    },
    afterLoadData(data) {
      // 编辑定时计划
      if (this.dialogVisible) {
        this.scheduler = data;
        if (this.scheduler.parameterJson) {
          this.parameterJson = JSON.parse(this.scheduler.parameterJson);
        } else {
          this.parameterJson = [];
        }
        setTimeout(() => this.$validator.validateAll("editschedulerForm"));
      }
    },
    dialogCancle(dialogVisible) {
      this.loadDataUrl = "";
      this[dialogVisible] = false;
      this.isEdit = false;
      setTimeout(() => (this.schedulerDisabled = false), 500);
    },
    handleClose() {
      this.loadDataUrl = "";
      this.dialogVisible = false;
      this.isEdit = false;
      setTimeout(() => (this.schedulerDisabled = false), 500);
    },
    showDialog(row) {
      this.dialogVisible = true;
      if (row) {
        this.isEdit = true;
        this.loadDataUrl = `/job/scheduler/v1/getJobDetail?name=${encodeURI(row.jobName)}`;
      } else {
        this.parameterJson = [];
      }
    },
    handleNodeClick(node) {},
    loadData(param, cb) {
      sys
        .getschedulerPageJson(param)
        .then(response => {
          this.data = response.rows;
          this.pageResult = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total
          };
        })
        .finally(() => cb());
    },
    handleCommand(params) {
      switch (params.command) {
        case "lookLog":
          //this.$router.push("/executeJobList/" + params.row.jobName);
          this.$router.push({
            name: "executeJobList",
            params: {
              jobName: params.row.jobName,
              tobName: params.row.jobName + "定时计划日志"
            }
          });
          //this.$router.go({name: 'executeJobList', params: {jobName: 'com.hotent.job.job.FlowStartJob'}});
          break;
        case "triggersJob":
          this.$router.push({
            name: "schedulerTriggerList",
            params: { jobName: encodeURI(params.row.jobName), tobName: "触发器列表" }
          });
          break;
        case "edit":
          this.parameterJson = [];
          this.schedulerTitle = "编辑定时计划";
          this.showDialog(params.row);
          this.isEdit = true;
          break;
        case "add":
          this.scheduler = {};
          this.parameterJson = [];
          this.schedulerTitle = "添加定时计划";
          this.showDialog();
          break;
        case "get":
          this.schedulerTitle = "查看定时计划";
          this.isSubmit = false;
          this.schedulerDisabled = true;
          this.showDialog(params.row);
          break;
        case "delete":
          this.$confirm("是否确认删除？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
            .then(() => {
              sys.delJob(params.row.jobName).then(
                data => {
                  if (data.state) {
                    this.$message.success(data.message);
                    this.$refs.schedulerTable.load();
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
        case "executeJob":
          this.executeJobUrl =
            "/job/scheduler/v1/executeJob?jobName=" + params.row.jobName;
          break;
        default:
          break;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.el-main {
  padding: 0px;
}
.obj-atter {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-left: 10px;
}
.obj-atter-panel {
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f4f4f5;
  height: 50px;
  line-height: 50px;
  padding: 0px 15px;
}
.scheduler-input-width .inputs {
  width: 100%;
}
/deep/.el-dialog__wrapper {
  overflow: unset !important;
}
 /deep/.el-dialog__body {
  height: calc(100% - 170px);
  overflow-y: auto;  
}
/deep/.el-dialog {
  height: 90%;
  min-height: 400px;
  margin-top: 3vh !important;
}
/deep/.el-dialog__body .selector-table {
  height: 100% !important;
}
/deep/.el-dialog .el-dialog__body .select-tree-div {
  height: calc(100% - 60px);
  min-height: unset;
}
@media (max-height: 960px) {
  /deep/.el-dialog__body .el-container {
      height: 100% !important;
  }
}
</style>
