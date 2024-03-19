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
            <el-link type="primary" @click="edit(scope.row)" title="编辑详情">{{scope.row.name}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column prop="key" label="key" :sortable="true" :show-tooltip="true"/>
        <ht-table-column prop="desc" label="描述" :show-tooltip="true"/>
      </template>
    </ht-table>
    <ht-sidebar-dialog
        width="34%"
        :title="title"
        :visible="dialogVisible"
        :before-close="handleClose"
        :append-to-body="true">
      <el-form data-vv-scope="editForm">
        <ht-form-item label="名称">
          <ht-input
              v-model="holiday.name"
              :validate="{ required: true,max:60 }"/>
        </ht-form-item>
        <ht-form-item label="key">
          <ht-input
              v-model="holiday.key"
              :validate="{required: true,max:60,regex:{expression:'^[a-zA-Z][a-zA-Z0-9_]*$',message:'只能输入字母、数字、下划线，且以字母开头'}}"
              v-pinyin="holiday.name"
              :disabled="disabled"/>
        </ht-form-item>
        <ht-form-item label="描述">
          <ht-input
              type="textarea"
              :cols="50"
              :rows="5"
              v-model="holiday.desc"/>
        </ht-form-item>
        <span style="margin:10px 15px 0 30px;font-size: 14px">假期时间</span>
        <el-button type="primary" @click="add(0)">添加</el-button>
        <el-table
          :data="holidayTime"
          border>
          <el-table-column type="index" label="序号"/>
          <el-table-column label="开始时间" header-align="center">
            <template slot-scope="scope">
              <el-date-picker
                  v-model="scope.row.startTime"
                  type="datetime"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  placeholder="选择日期时间"
                  @change="change(scope.row,'small')">
              </el-date-picker>
            </template>
          </el-table-column>
          <el-table-column label="结束时间" header-align="center">
            <template slot-scope="scope">
              <el-date-picker
                  v-model="scope.row.endTime"
                  type="datetime"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  placeholder="选择日期时间"
                  @change="change(scope.row,'big')">
              </el-date-picker>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="70px">
            <template slot-scope="scope">
              <el-button class="el-icon-delete" type="danger" @click="remove(scope.$index, 0)"/>
            </template>
          </el-table-column>
        </el-table>
        <span style="margin:10px 15px 0 30px;font-size: 14px">补班时间</span>
        <el-button type="primary" @click="add(1)">添加</el-button>
        <el-table
                :data="makeUpTime"
                border>
          <el-table-column type="index" label="序号"/>
          <el-table-column label="开始时间" header-align="center">
            <template slot-scope="scope">
              <el-date-picker
                      v-model="scope.row.startTime"
                      type="datetime"
                      value-format="yyyy-MM-dd HH:mm:ss"
                      placeholder="选择日期时间"
                      @change="change(scope.row,'small')">
              </el-date-picker>
            </template>
          </el-table-column>
          <el-table-column label="结束时间" header-align="center">
            <template slot-scope="scope">
              <el-date-picker
                      v-model="scope.row.endTime"
                      type="datetime"
                      value-format="yyyy-MM-dd HH:mm:ss"
                      placeholder="选择日期时间"
                      @change="change(scope.row,'big')">
              </el-date-picker>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="70px">
            <template slot-scope="scope">
              <el-button class="el-icon-delete" type="danger" @click="remove(scope.$index, 1)"/>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
            :url="saveUrl"
            :model="holiday"
            scope-name="editForm"
            @before-save-data="beforeSaveData"
            @after-save-data="afterSaveData">保 存</ht-submit-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </ht-sidebar-dialog>
  </div>
</template>

<script>
  import uc from "@/api/uc.js";
  export default {
    name: "holiday-manager",
    data() {
      return {
        data: [],
        pageResult: {
          page: 1,
          pageSize: 10,
          total: 0
        },
        saveUrl: window.context.uc + "/uc/holiday/v1/save",
        deleteUrl: window.context.uc + "/uc/holiday/v1/remove",
        title: "添加节假日",
        dialogVisible: false,
        holiday:{
          name: "",
          key: "",
          desc: "",
          time: []
        },
        disabled: true,
        holidayTime: [],
        makeUpTime: []
      }
    },
    methods: {
      rowClick(row, column, event){
        this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
      },
      loadData(param,cb){
        uc.holidayList(param).then(data => {
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
      edit(row){
        this.dialogVisible = true;
        if (row){
          this.title = "编辑节假日";
          this.disabled = true;
          uc.getHoliday(row.id).then(data => {
            this.holiday = data;
            this.holidayTime = data.time.filter(item => !item.type || item.type === 0);
            this.makeUpTime = data.time.filter(item => item.type === 1)
          })
        }else {
          this.title = "新增节假日";
          this.disabled = false;
          this.holiday = {
            name: "",
            key: "",
            desc: "",
            time: []
          }
        }
      },
      handleClose(){
        this.dialogVisible = false;
      },
      beforeSaveData(){
        this.holiday.time = [...this.holidayTime, ...this.makeUpTime]
      },
      afterSaveData(){
        this.dialogVisible = false;
        this.$refs.htTable.load();
      },
      add(type){
        if (type === 0) {
          this.holidayTime.push({
            startTime: "",
            endTime: "",
            type: type
          })
        }else if (type === 1) {
          this.makeUpTime.push({
            startTime: "",
            endTime: "",
            type: type
          })
        }
      },
      remove(index, type){
        if (type === 0) {
          this.holidayTime.splice(index,1);
        }else if(type === 1){
          this.makeUpTime.splice(index,1);
        }
      },
      change(row,type){
        let startTime = new Date(row.startTime);
        let endTime = new Date(row.endTime);
        if (startTime>endTime){
          if (type==='small'){
            this.$set(row,"startTime",row.endTime);
          }else {
            this.$set(row,"endTime",row.startTime);
          }
          this.$message.error("开始时间大于结束时间");
        }
      }
    }
  }
</script>

<style scoped>

</style>
