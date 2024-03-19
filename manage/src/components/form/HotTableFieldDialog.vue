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
      <form data-vv-scope="confForm" v-form v-if="dialogVisible">
        <template>
          <table class="form-table" style="width: 100%" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <th style="width: 15%;">字段描述</th>
                <td style="width: 35%;">{{field.desc}}</td>
                <th style="width: 15%;">字段名称</th>
                <td style="width: 35%;">{{field.name}}</td>
              </tr>
              <tr>
                <th>整列只读</th>
                <td><el-checkbox v-model="field.column.readOnly" /></td>
                <th>允许合并</th>
                <td><el-checkbox v-model="field.column.mergeCell" /></td>
              </tr>
               <tr v-if="!field.column.readOnly">
                <th>指定只读行</th>
                <td colspan="3">
                    <ht-input v-model="field.column.readOnlyRows" placeholder="请输入只读的行号，用逗号分隔，如：1,3,5" style="width:100%;"></ht-input>
                </td>
              </tr>
              <tr>
                <th>整列必填</th>
                <td><el-checkbox v-model="field.column.required" /></td>
                <th></th>
                <td></td>
              </tr>
              <tr v-if="!field.column.required">
                <th>指定必填行</th>
                <td colspan="3">
                    <ht-input v-model="field.column.requiredRows" placeholder="请输入必填的行号，用逗号分隔，如：1,3,5" style="width:100%;"></ht-input>
                </td>
              </tr>
              <tr>
                <th>列字体颜色</th>
                <td><el-color-picker v-model="field.column.style.color" size="mini"></el-color-picker></td>
                <th>列背景颜色</th>
                <td><el-color-picker v-model="field.column.style.background" size="mini"></el-color-picker></td>
              </tr>
              <tr>
                <th>列字体大小</th>
                <td><ht-input size="mini" width="130px" :min="0" :max="64" type="number" v-model="field.column.style.size" /> px</td>
                <th>列字体加粗</th>
                <td><el-checkbox v-model="field.column.style.bold" /></td>
              </tr>
              <tr>
                <th>自定义样式代码</th>
                <td colspan="3">
                  <el-input
                    v-model="field.column.style.diyStyle"
                    type="textarea"
                    :rows="2"
                    :cols="72"
                    autocomplete="off"
                  />
                </td>
              </tr>
              <tr>
                <th>控件类型</th>
                <td>
                  <ht-select
                    :options="controlTypes"
                    :props="{key:'type',value:'name'}"
                    v-model="field.column.type"
                  />
                </td>
                <th>列宽度</th>
                <td><ht-input size="mini" width="130px" type="number" v-model="field.column.width" /> px</td>
              </tr>
              <tr v-if="field.column.type==='dropdown'">
                <th>下拉框</th>
                <td colspan="3">
                  <el-button @click="field.column.source.push({kye:'',value:''})">添加</el-button>
                  <el-table :data="field.column.source" border>
                    <!-- <el-table-column label="值">
                      <template slot-scope="scope">
                        <ht-input v-model="scope.row.key" />
                      </template>
                    </el-table-column> -->
                    <el-table-column label="选项">
                      <template slot-scope="scope">
                        <ht-input v-model="scope.row.value" />
                      </template>
                    </el-table-column>
                    <el-table-column label="操作">
                      <template slot-scope="scope">
                        <el-button
                          size="mini"
                          icon="el-icon-arrow-up"
                          @click="arrayMove('field.column.source',scope.row,'up')"
                        />
                        <el-button
                          size="mini"
                          icon="el-icon-arrow-down"
                          @click="arrayMove('field.column.source',scope.row,'down')"
                        />
                        <el-button
                          size="mini"
                          @click="field.column.source.splice(scope.$index,1)"
                          icon="el-icon-delete"
                        />
                      </template>
                    </el-table-column>
                  </el-table>
                </td>
              </tr>
              <tr v-if="field.column.type==='date'">
                <th>日期格式</th>
                <td>
                  <ht-select
                    :options="[{key:'YYYY-MM-DD HH:mm:ss'},{key:'YYYY-MM-DD'}]"
                    :props="{key:'key',value:'key'}"
                    v-model="field.column.dateFormat"
                  />
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
import utils from "@/hotent-ui-util.js";
export default {
  name:'hot-table-field-dialog',
  data() {
    return {
      dialogVisible: false,
      field:{},
      controlTypes: [
        {
          type: "text",
          name: "文本"
        },
        {
          type: "dropdown",
          name: "下拉框"
        },
        {
          type: "numeric",
          name: "数字"
        },
        {
          type: "date",
          name: "日期选择器"
        },
        // {
        //   type: "checkbox",
        //   name: "多选框"
        // }
      ],
      selectContent: [],
      title: "字段类型设置"
    };
  },
  watch: {
    "field.controlType": function(newVal, oldVal) {
      for (let i = 0; i < this.controlTypes.length; i++) {
        if (this.controlTypes[i].type === newVal) {
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
      this.field = {column:{readOnly:false,type:'text',mergeCell:false,style:{}}};
    },
    handleOpen(item) {
      this.field = item;
      if(!this.field.column){
        this.$set(this.field,'column',{readOnly:false,required:false ,type:'text',mergeCell:false,style:{}});
      }
      if(typeof(this.field.column.mergeCell) == 'undefined'){
        this.$set(this.field.column,'mergeCell', false);
      }
      if(!this.field.column.width){
        this.$set(this.field.column,'width', 90);
      }
      if(!this.field.column.style){
        this.$set(this.field.column,'style', {size:0, color:'', bold:false, background:'', diyStyle:''});
      }
      if(typeof(this.field.column.readOnly) == 'undefined'){
        this.$set(this.field.column,'readOnly', false);
      }
      if(typeof(this.field.column.required) == 'undefined'){
        this.$set(this.field.column,'required', false);
      }
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.field = { ...this.field };
        if (this.field.controlType === "select") {
          this.selectContent = this.field.column.source;
        } else if (this.field.controlType === "customdialog") {
          this.customDialogContent = this.field.controlContent;
          if(this.customDialogContent.alias){
            this.change(this.customDialogContent.alias);
          }
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
        this.field.dialogAlarmSetting=[];
      }
      this.field.dialogAlarmSetting.push(json);
    },
    arrayMove(group, item, direct) {
      this[group] = utils.arrayMove(this[group], item, direct);
    }
  },
  created() {
    this.$validator = this.$root.$validator;
  }
};
</script>

<style scoped>
</style>
