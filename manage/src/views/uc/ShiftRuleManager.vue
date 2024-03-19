<template>
  <div class="fullheight">
    <ht-table
        @load="loadData"
        @row-click="rowClick"
        :data="data"
        :pageResult="pageResult"
        :selection="true"
        quick-search-props="key,name"
        :show-export="false"
        :show-custom-column="false"
        ref="htTable">
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="edit()" icon="el-icon-plus">添加</el-button>
          <ht-delete-button :url="deleteUrl" :htTable="$refs.htTable" style="margin:0;">删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="name" label="名称" :sortable="true" :show-tooltip="true">
          <template slot-scope="scope">
            <el-link type="primary" @click="edit(scope.row.id)" title="编辑详情">{{scope.row.name}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column prop="key" label="key" :sortable="true" :show-tooltip="true"/>
        <ht-table-column prop="desc" label="描述" :show-tooltip="true"/>
        <ht-table-column label="操作">
          <template slot-scope="scope">
            <el-button @click="setUser(scope.row.id)">设置用户</el-button>
          </template>
        </ht-table-column>
      </template>
    </ht-table>
    <el-dialog
        width="50%"
        :title="title"
        :visible="dialogVisible"
        :before-close="handleClose"
        :close-on-click-modal="false "
        :append-to-body="true">
      <el-form data-vv-scope="editForm">
        <ht-form-item label="名称">
          <ht-input
              v-model="shiftRule.name"
              :validate="{ required: true,max:60 }"/>
        </ht-form-item>
        <ht-form-item label="key">
          <ht-input
              v-model="shiftRule.key"
              :validate="{required: true,max:60,regex:{expression:'^[a-zA-Z][a-zA-Z0-9_]*$',message:'只能输入字母、数字、下划线，且以字母开头'}}"
              v-pinyin="shiftRule.name"
              :disabled="disabled"/>
        </ht-form-item>
        <ht-form-item label="描述">
          <ht-input
              type="textarea"
              :cols="50"
              :rows="5"
              v-model="shiftRule.desc"/>
        </ht-form-item>
        <ht-form-item label="节假日">
          <ht-select
              v-model="shiftRule.holidayId"
              :options="holidays"
              :props="{key:'id',value:'name'}"
              clearable/>
        </ht-form-item>
        <ht-form-item label="规则">
          <el-tooltip placement="top" content="休息日为24小时">
            <i class="el-icon-warning"></i>
          </el-tooltip>
          <el-table
            :data="rules"
            border>
            <el-table-column prop="date" :formatter="weekFormat" label="日期"/>
            <el-table-column label="类型">
              <template slot-scope="scope">
                <ht-select
                  v-model="scope.row.type"
                  :options="[{key:0,value:'休息日'},{key: 1,value: '工作日'}]"
                  @change="change(scope.row)"/>
              </template>
            </el-table-column>
            <el-table-column label="上班时间" width="250">
              <template slot-scope="scope">
                <el-time-picker
                    :disabled="scope.row.type===0"
                    v-model="scope.row.startTime"
                    placeholder="任意时间点"
                    value-format="HH:mm:ss">
                </el-time-picker>
              </template>
            </el-table-column>
            <el-table-column label="下班时间" width="250">
              <template slot-scope="scope">
                <el-time-picker
                    :disabled="scope.row.type===0"
                    v-model="scope.row.endTime"
                    placeholder="任意时间点"
                    :min-time="scope.row.startTime"
                    value-format="HH:mm:ss">
                </el-time-picker>
              </template>
            </el-table-column>
          </el-table>
        </ht-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <ht-submit-button
            :url="saveUrl"
            :model="shiftRule"
            scope-name="editForm"
            @before-save-data="beforeSaveData"
            @after-save-data="afterSaveData">保 存</ht-submit-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <shift-user-manager ref="shiftUserManager"/>
  </div>
</template>

<script>
  import uc from "@/api/uc.js";
  import ShiftUserManager from "./ShiftUserManager";
  export default {
    name: "shift-rule-manager",
    components: {
      ShiftUserManager
    },
    data() {
      return {
        data: [],
        pageResult: {
          page: 1,
          pageSize: 10,
          total: 0
        },
        deleteUrl: window.context.uc + "/uc/shiftRule/v1/remove",
        saveUrl: window.context.uc + "/uc/shiftRule/v1/save",
        title: "编辑轮班规则",
        dialogVisible: false,
        shiftRule: {
          name: "",
          key: "",
          desc: "",
          holidayId: ""
        },
        rules: [],
        weeks: ["日","一","二","三","四","五","六"],
        selectId: "",
        userId: "",
        holidays: [],
        disabled: false
      }
    },
    mounted() {
      this.getHolidays();
    },
    methods: {
      rowClick(row, column, event){
        this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
      },
      loadData(param, cb){
        uc.ruleList(param).then(data => {
          this.data = data.rows;
          this.pageResult = {
            page: data.page,
            pageSize: data.pageSize,
            total: data.total
          }
        }).finally(() => {
          cb && cb();
        })
      },
      edit(id){
        this.dialogVisible = true;
        if (id){
          this.title = "编辑轮班规则";
          this.disabled = true;
          uc.getRule(id).then(data => {
            this.shiftRule = data;
            this.rules = JSON.parse(data.rule);
          });
        }else{
          this.title = "新增轮班规则";
          this.disabled = false;
          this.shiftRule = {
            name: "",
            key: "",
            desc: "",
            holidayId:""
          }
          this.rules = [];
          for (let i=0;i<7;i++){
            this.rules.push({
              date: i,
              type: 1,
              startTime: "",
              endTime: ""
            })
          }
        }
      },
      handleClose(){
        this.dialogVisible = false;
      },
      beforeSaveData(){
        this.shiftRule.rule = JSON.stringify(this.rules);
      },
      afterSaveData() {
        this.dialogVisible = false;
        this.$refs.htTable.load();
      },
      weekFormat(row){
        return "星期" + this.weeks[row.date];
      },
      setUser(id){
        this.$refs.shiftUserManager.openDialog(id);
      },
      getHolidays(){
        uc.holidayList({}).then(data => {
          this.holidays = data.rows;
        })
      },
      change(row){
        if (row.type===0){
          this.$set(row,"startTime","00:00:00");
          this.$set(row,"endTime","00:00:00");
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
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
