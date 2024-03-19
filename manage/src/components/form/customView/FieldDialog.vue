<template>
  <div class="fullheight">
    <el-dialog
      :title="title"
      :visible="dialogVisible"
      :before-close="beforeClose"
      :close-on-click-modal="false"
      width="50%"
      append-to-body
    >
      <form data-vv-scope="confForm" v-form>
        <template v-if="type==='K'">
          <table class="form-table" style="width: 100%" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <th style="width: 130px">字段描述</th>
                <td>{{field.fieldDesc}}</td>
                <th>字段名称</th>
                <td>{{field.fieldName}}</td>
              </tr>
              <tr>
                <th>字段类型</th>
                <td>{{field.dataType}}</td>
                <th>控件类型</th>
                <td>
                  <ht-select
                    :options="controlTypes"
                    :props="{key:'id',value:'name'}"
                    v-model="field.controlType"
                  />
                </td>
              </tr>
              <tr v-if="field.controlType==='select'">
                <th>下拉框</th>
                <td colspan="3">
                  <el-button @click="selectContent.push({optionKey:'',optionValue:''})">添加</el-button>
                  <el-table :data="selectContent" border>
                    <el-table-column label="值">
                      <template slot-scope="scope">
                        <ht-input v-model="scope.row.optionKey" :maxlength="50" :showWordLimit="true" />
                      </template>
                    </el-table-column>
                    <el-table-column label="选项">
                      <template slot-scope="scope">
                        <ht-input v-model="scope.row.optionValue" :maxlength="50" :showWordLimit="true" />
                      </template>
                    </el-table-column>
                    <el-table-column label="操作">
                      <template slot-scope="scope">
                        <el-button
                          size="mini"
                          icon="el-icon-arrow-up"
                          @click="arrayMove('selectContent',scope.row,'up')"
                        />
                        <el-button
                          size="mini"
                          icon="el-icon-arrow-down"
                          @click="arrayMove('selectContent',scope.row,'down')"
                        />
                        <el-button
                          size="mini"
                          @click="selectContent.splice(scope.$index,1)"
                          icon="el-icon-delete"
                        />
                      </template>
                    </el-table-column>
                  </el-table>
                </td>
              </tr>
              <tr v-if="field.controlType==='customdialog'">
                <th>自定义对话框</th>
                <td>
                  <ht-select
                    :options="customDialogs"
                    :props="{key:'alias',value:'name'}"
                    v-model="customDialogContent.alias"
                    @change="change"
                  />
                </td>
                <th>返回字段</th>
                <td>
                  <ht-select
                    :options="customDialog.resultfield"
                    :props="{key:'comment',value:'comment'}"
                    v-model="customDialogContent.resultfield"
                  />
                </td>
              </tr>
              <tr v-if="field.controlType==='date'">
                <th>日期格式</th>
                <td>
                  <ht-select
                    :options="[{key:'yyyy-MM-dd HH:mm:ss'},{key:'yyyy-MM-dd'}]"
                    :props="{key:'key',value:'key'}"
                    v-model="field.dateFormat"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </template>
        <template v-if="type==='B'">
          <table class="form-table" style="width: 100%">
            <tbody>
              <tr>
                <th>字段描述</th>
                <td>{{field.fieldDesc}}</td>
                <th>字段名称</th>
                <td>{{field.fieldName}}</td>
              </tr>
              <tr>
                <th>字段类型</th>
                <td colspan="3">{{field.dataType}}</td>
              </tr>
            </tbody>
          </table>
          <span style="font-size: 20px;">预警规则</span>
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-plus"
            @click="addSetting"
            style="margin: 10px 0"
          />
          <el-table :data="field.dialogAlarmSetting" border>
            <el-table-column label="颜色" width="50">
              <template slot-scope="scope">
                <el-color-picker v-model="scope.row.color" size="mini" />
              </template>
            </el-table-column>
            <el-table-column label="条件">
              <template slot-scope="scope">
                <span v-for="(con,index) in scope.row.condition" :key="index">
                  <span v-if="index>0">and</span>
                  <ht-select :options="operator" :props="{key:'id',value:'name'}" v-model="con.op"></ht-select>
                  <ht-input v-model="con.val" :maxlength="50" :showWordLimit="true" />
                  <el-button
                    icon="el-icon-plus"
                    size="mini"
                    @click="scope.row.condition.push({op:'=='})"
                  />
                  <el-button icon="el-icon-delete" size="mini" @click="removeAlarmSettingOne(scope.row,index)" />
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  icon="el-icon-delete"
                  @click="field.dialogAlarmSetting.splice(scope.$index,1)"
                />
              </template>
            </el-table-column>
          </el-table>
          <span style="font-size: 20px;margin: 10px 0">表单格式设置</span>
           <el-tooltip placement="top">
            <div slot="content">时间格式化方法(去除毫秒值):
              <br/> return cellValue.substring(0,cellValue.length-2);
              <br/>判断性别写法:
              <br/> if(cellValue ==1){
              <br/>   return "男";
              <br/> }else{
              <br/>   return "女";  
              <br/> }
              <br/>
              </div>
            <span class="el-icon-question"></span>
          </el-tooltip>
          <br />
          <ht-input type="textarea" v-model="field.formater" :maxlength="200" :showWordLimit="true" />
        </template>
        <template v-if="type==='X' || type==='P'">
          <table class="form-table" style="width: 100%">
            <tbody>
              <tr>
                <th>字段描述</th>
                <td>
                  <ht-input v-model="field.fieldDesc" :validate="{required:true}" />
                </td>
                <th>字段名称</th>
                <td>
                  <ht-input
                    v-model="field.fieldName"
                    :validate="{required:true}"
                    v-pinyin="field.fieldDesc"
                    :maxlength="50"
                    :showWordLimit="true"
                  />
                </td>
              </tr>
              <tr>
                <th>关联字段</th>
                <td>{{field.virtualFrom}}</td>
                <th>数据来源</th>
                <td>
                  <ht-select
                    :options="[{key:'sql',value:'SQL'},{key:'script',value:'脚本'}]"
                    :props="{key:'key',value:'value'}"
                    v-model="field.resultFromType"
                  />
                </td>
              </tr>
              <tr>
                <th>配置</th>
                <td colspan="3">
                  <ht-input type="textarea" v-model="field.resultFrom" :maxlength="50" :showWordLimit="true" />
                </td>
              </tr>
            </tbody>
          </table>
        </template>
      </form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="save" type="primary">确定</el-button>
        <el-button @click="close">返回</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import form from "@/api/form.js";
import utils from "hotent-ui/src/utils";
export default {
  props: {
    type: String,
    item: Object
  },
  data() {
    return {
      dialogVisible: false,
      field: {
        resultFromType: "script"
      },
      controlTypes: [
        {
          id: "onetext",
          name: "单行文本框"
        },
        {
          id: "select",
          name: "下拉框"
        },
        {
          id: "customdialog",
          name: "自定义对话框"
        },
        {
          id: "date",
          name: "日期选择器"
        }
      ],
      customDialogs: [],
      customDialog: {},
      selectContent: [],
      customDialogContent: {},
      operator: [
        {
          id: ">",
          name: "大于"
        },
        {
          id: "<",
          name: "小于"
        },
        {
          id: "==",
          name: "等于"
        },
        {
          id: ">=",
          name: "大于等于"
        },
        {
          id: "<=",
          name: "小于等于"
        },
        {
          id: "!=",
          name: "不等于"
        },
        {
          id: "indexOf",
          name: "包含"
        },
        {
          id: "notIndexOf",
          name: "不包含"
        }
      ],
      title: ""
    };
  },
  watch: {
    "field.controlType": function(newVal, oldVal) {
      for (let i = 0; i < this.controlTypes.length; i++) {
        if (this.controlTypes[i].id === newVal) {
          this.field.controlTypeDesc = this.controlTypes[i].name;
        }
      }
    }
  },
  mounted() {
    form.getCustomDialog().then(response => {
      for (let i = 0; i < response.length; i++) {
        response[i].resultfield = JSON.parse(response[i].resultfield);
      }
      this.customDialogs = response;
    });
  },
  methods: {
    close() {
      this.dialogVisible = false;
      this.selectContent = [];
      this.customDialogContent = [];
    },
    beforeClose() {
      this.dialogVisible = false;
      this.selectContent = [];
      this.customDialogContent = [];
    },
    handleOpen() {
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.field = { ...this.item };
        if(this.field.controlContent && this.field.controlContent.constructor==String){
          this.field.controlContent = JSON.parse(this.field.controlContent)
        }
        if (this.type === "K") {
          this.title = "控件设置";
          if (this.field.controlType === "select") {
            this.selectContent = this.field.controlContent;
          } else if (this.field.controlType === "customdialog") {
            this.customDialogContent = this.field.controlContent;
            if(this.customDialogContent.alias){
              this.change(this.customDialogContent.alias);
            }
          }
        } else if (this.type === "B") {
          this.title = "报警设置";
          if (this.field.alarmSetting) {
            this.field.dialogAlarmSetting = this.field.alarmSetting;
            if(!Array.isArray(this.field.dialogAlarmSetting)){
              this.field.dialogAlarmSetting = JSON.parse(this.field.dialogAlarmSetting);
            }
          }else{
            this.field.dialogAlarmSetting = [];
          }
          if (!this.field.formater) {
            this.$set(this.field, "formater", "");
          }
        } else if (this.type === "X") {
          this.title = "虚拟列设置";
          this.field.isVirtual = 1;
          this.field.virtualFrom = this.field.fieldName;
          this.field.isSearch = 0;

          this.field.fieldDesc = "";
          this.field.fieldName = "";
          this.field.resultFromType = "script";

          this.field.controlTypeDesc = "无";
          this.field.controlType = "";

          this.field.dialogAlarmSetting = null; //清空报表设置
          this.field.formater = "";
        }
      });
    },
    change(type) {
      for (let i = 0; i < this.customDialogs.length; i++) {
        if (this.customDialogs[i].alias === type) {
          this.customDialog = this.customDialogs[i];
        }
      }
    },
    save() {
      utils
        .validateForm(this, "confForm")
        .then(r => {
          if (this.type === "K") {
            if (this.field.controlType === "select") {
              this.field.controlContent = this.selectContent;
            } else if (this.field.controlType === "customdialog") {
              this.field.controlContent = this.customDialogContent;
            }
            this.$emit("select", this.field);
          } else if (this.type === "B") {
            this.field.alarmSetting = this.field.dialogAlarmSetting;
            this.$emit("select", this.field);
          } else {
            this.$emit("after-save", this.field);
          }
          this.close();
        })
        .catch(items => {
          this.$message.error(`还有内容未填写，无法保存。`);
        });
    },
    addSetting() {
      let json = {};
      json.condition = [{ op: "==" }];
      if(!this.field.dialogAlarmSetting){
        this.$set(this.field, 'dialogAlarmSetting', []);
      }
      this.field.dialogAlarmSetting.push(json);
    },
    arrayMove(group, item, direct) {
      this[group] = utils.arrayMove(this[group], item, direct);
    },
    removeAlarmSettingOne(row,index){
      row.condition.splice(index,1)
    }
  },
  created() {
    this.$validator = this.$root.$validator;
  }
};
</script>

<style scoped>
</style>
