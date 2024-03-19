<template>
  <el-container>
    <el-row :gutter="20" style="width:100%;">
      <el-col :span="7">
        <el-table
          ref="conditionSettingTable"
          border
          :max-height="tabHeight"
          :data="conditionSettingFields"
          tooltip-effect="dark"
          @row-dblclick="fillToCondition"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column
            prop="name"
            label="列名"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="desc"
            label="注释"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="type"
            label="类型"
            width="80"
          ></el-table-column>
        </el-table>
      </el-col>
      <el-col :span="1">
        <el-button
          type="primary"
          circle
          icon="icon-hide"
          title="将所选字段添加为查询条件"
          style="-webkit-transform: rotate(270deg);transform: rotate(270deg)"
          @click="allfillToCondition()"
        />
      </el-col>
      <el-col :span="16">
        <el-table
          ref="conditionTable"
          border
          :max-height="tabHeight"
          :data="conditionFields"
          tooltip-effect="dark"
          style="width: 100%"
        >
          <el-table-column
            label="序号"
            type="index"
            width="50"
          ></el-table-column>
          <el-table-column prop="na" label="列名" width="130"></el-table-column>
          <el-table-column prop="cm" label="显示名" width="135">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.cm"
                placeholder="请输入显示名称"
                maxlength="50"
                show-word-limit
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="ct" label="控件类型" width="120">
            <template slot-scope="scope">
              <ht-select
                v-model="scope.row.ct"
                :options="controlTypes"
                @change="controlTypeChange(scope.$index)"
                :validate="{ required: true }"
              />
            </template>
          </el-table-column>
          <el-table-column prop="op" label="条件" width="120">
            <template slot-scope="scope">
              <ht-select
                v-model="scope.row.op"
                @change="changeQt(scope.row, scope.$index)"
                :options="getOpOptions(scope.row.ty)"
                :validate="{ required: true }"
              />
            </template>
          </el-table-column>
          <el-table-column prop="mg" label="合并查询" width="80">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.mg" v-if="scope.row.ty!=='date'"/>
            </template>
          </el-table-column>
          <el-table-column label="默认值" width="100">
            <template slot-scope="scope">
              <el-button @click="setDefaultValue(scope.row)" icon="el-icon-edit">设置</el-button>
            </template>
          </el-table-column>
          <el-table-column label="管理">
            <template slot-scope="scope">
              <el-button
                @click="sort(scope.$index, 'down')"
                size="small"
                icon="el-icon-arrow-down"
                plain
              ></el-button>
              <el-button
                @click="sort(scope.$index, 'up')"
                size="small"
                icon="el-icon-arrow-up"
                plain
              ></el-button>
              <el-button
                class="mobile-btn"
                :class="{
                  'is-active__btn': scope.row.isShow,
                }"
                @click="isShow(scope.row)"
                >是否隐藏</el-button
              >
              <el-button
                :plain="scope.row.mpDisplay === btnType.notShow"
                class="mobile-btn"
                :class="{
                  'is-active__btn': scope.row.mpDisplay === btnType.isShow,
                }"
                v-show="
                  scope.row.mpDisplay
                    ? (scope.row.mpDisplay = scope.row.mpDisplay)
                    : initMpDisplay(scope.row)
                "
                @click="btnChange(scope.row)"
                >移动端</el-button
              >
              <el-button
                @click="remove(scope.$index)"
                type="danger"
                size="small"
                icon="el-icon-delete"
                plain
              ></el-button>
              <el-button
                @click="addCtrlField(scope.$index, scope.row,conditionFields)"
                type="info"
                size="small"
                v-if="
                  scope.row.ct == 'select' ||
                    scope.row.ct == 'radio' ||
                    scope.row.ct == 'customDialog'
                "
                :plain="
                  !(
                    (scope.row.controlContent &&
                      scope.row.controlContent.length > 0) ||
                    (scope.row.controlContent &&
                      scope.row.controlContent.alias) ||
                    (scope.row.dateFormat && scope.row.dateFormat != '')
                  )
                "
                >控</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <!-- 添加查询控件对话框  -->
    <template-ctrl-field-dialog
      ref="templateCtrlFieldDialog"
      name="templateCtrlFieldDialog"
      :controlTypes="controlTypes"
      @onConfirm="ctrlFieldDialogOnConfirm"
      append-to-body
    />
  </el-container>
</template>

<script>
import deepmerge from "deepmerge";
const templateCtrlFieldDialog = () =>
  import("@/components/form/dataTemplate/TemplateCtrlFieldDialog.vue");
  const BTN_TYPE = {
  isShow: '1',
  notShow: '2',
}
export default {
  name: "condition-setting",
  components: {
    templateCtrlFieldDialog
  },
  props: ["data"],
  data() {
    return {
      btnType:BTN_TYPE,//移动端显示隐藏按钮
      dataTemplate: {},
      conditionSettingFields: [],
      conditionFields: [],
      tabHeight: `${document.documentElement.clientHeight}` - 245,
      controlTypes: [
        { key: "onetext", value: "单行文本框" },
        { key: "date", value: "日期控件" },
        { key: "select", value: "下拉选项" },
        { key: "radio", value: "单选按钮" },
        { key: "customDialog", value: "自定义对话框" }
      ],
      editField: {},
      editFieldIndex: -1,
      option:{
        choiceType: "static",
        customQuery:{}
      }
    };
  },
  mounted() {
    this.dataTemplate = this.data.bpmDataTemplate;
    if (this.data.fields) {
      let fields = deepmerge({}, this.data.fields, { clone: true });
      fields=fields.filter(item=>!item.flowField);
      this.conditionSettingFields = fields;
    }
    this.templates = this.data.templates;
    this.initData();
  },
  methods: {
    isShow(row){
      this.$set(row,'isShow',!row.isShow)
    },
    btnChange(row){
      this.$set(row,'mpDisplay',row.mpDisplay==='1' ? '2' : '1')
    },
    //保存查询条件数据
    saveConditionField() {
      let unPassCondtionArr = [];
      this.conditionFields.forEach(c => {
        if (
          (c.ct == "select" || c.ct == "radio" || c.ct == "customDialog") &&
          !c.controlContent
        ) {
          unPassCondtionArr.push(c.cm);
        }
      });
      if (unPassCondtionArr.length > 0) {
        this.$message.error(
          "查询字段【" +
            unPassCondtionArr.join(",") +
            "】尚未配置控件，无法保存"
        );
        return "false";
      }
      this.dataTemplate.conditionField = this.conditionFields
        ? JSON.stringify(this.conditionFields)
        : null;
    },
    //初始化处理
    initData() {
      if (this.dataTemplate.conditionField) {
        this.conditionFields = JSON.parse(this.dataTemplate.conditionField);
      }
      if (this.conditionFields) {
        this.conditionFields.forEach(item => {
          if (
            item.ct != "onetext" &&
            item.ct != "date" &&
            item.ct != "select" &&
            item.ct != "radio" &&
            item.ct != "customDialog"
          ) {
            item.ct = "onetext";
          }
        });
      }
    }, //查询字段控件设置
    addCtrlField(index, row,conditionFields) {
      if(row.ct == "select" && !row.option){
        row.option={
          choiceType: "static",
          customQuery:{}
        };
      }
      this.editFieldIndex = index;
      this.editField = row;
      this.$refs.templateCtrlFieldDialog.showDialog(row,conditionFields);
    }, //回填查询字段控件设置
    ctrlFieldDialogOnConfirm(field) {
      this.editField = field;
    },
    //双击字段列表中的字段时将该字段加入到显示字段
    fillToCondition(row, event, column) {
      let isIn = this.isInConditionFields(row.name);
      if (!isIn) {
        let field = this.getConditionField(row);
        this.conditionFields.push(field);
      }
    },
    //将字段列表中的已选字段加入到显示字段列表
    allfillToCondition() {
      let selectrows = this.$refs.conditionSettingTable.store.states.selection;
      if (!selectrows || selectrows.length < 1) {
        this.$message({
          message: "请在左侧列表中选择要作为条件的字段",
          type: "warning"
        });
      }
      selectrows.forEach(obj => {
        let ctrlType = obj.ctrlType;
        if (ctrlType == "dialog") {
          ctrlType = "customDialog";
        } else if (ctrlType == "input") {
          ctrlType = "onetext";
        }
        if (obj.type === 'date') {
          ctrlType = "date";
        }
        let isTrue = false;
        for (let i = 0; i < this.controlTypes.length; i++) {
          if (ctrlType == this.controlTypes[i].key) {
            isTrue = true;
            break;
          }
        }
        if (!isTrue) {
          ctrlType = "onetext";
        }
        this.$set(obj, "ctrlType", ctrlType);
        if (!this.isInConditionFields(obj.name)) {
          let field = this.getConditionField(obj);
          this.conditionFields.push(field);
        }
      });
    },
    //显示字段排序
    sort(index, type) {
      if ("up" == type) {
        if (index === 0) {
          this.$message({
            message: "已经是列表中第一位",
            type: "warning"
          });
        } else {
          let temp = this.conditionFields[index - 1];
          this.$set(
            this.conditionFields,
            index - 1,
            this.conditionFields[index]
          );
          this.$set(this.conditionFields, index, temp);
        }
      } else {
        if (index === this.conditionFields.length - 1) {
          this.$message({
            message: "已经是列表中最后一位",
            type: "warning"
          });
        } else {
          let i = this.conditionFields[index + 1];
          this.$set(this.conditionFields, index + 1, this.displayFields[index]);
          this.$set(this.conditionFields, index, i);
        }
      }
    },
    //删除显示字段
    remove(index) {
      this.conditionFields.splice(index, 1);
    },
    //判断字段是否已在显示字段列表中
    isInConditionFields(name) {
      let isIn = false;
      if (this.conditionFields && this.conditionFields.length > 0) {
        this.conditionFields.forEach(obj => {
          if (obj.name == name) {
            isIn = true;
            return;
          }
        });
      }
      return isIn;
    },
    getConditionField(field) {
      let option = field.option ? JSON.parse(field.option) : null;
      let ctrlType = field.ctrlType;
      let resultField;
      ctrlType = ctrlType == "multiselect" ? "select" : ctrlType; //下拉框多选也为下拉框
      if (ctrlType == "selector" && option) {
        ctrlType = this.getSelectorOptions(option.selector.type.alias);
        for (var bind in option.bind) {
          if (
            option.bind[bind].json &&
            option.bind[bind].json.name == field.name
          ) {
            resultField = option.bind[bind].key;
            break;
          }
        }
        if (!resultField) {
          resultField = option.bind[0].key;
        }
      }
      if ("text" == ctrlType || "checkbox" == ctrlType) {
        ctrlType = "onetext";
      }
      var colPrefix = this.data.colPrefix;
      return {
        colPrefix: colPrefix,
        name: field.name,
        na: field.name,
        ty: field.type,
        op: field.type == "varchar" ? "equal" : "1",
        cm: field.desc,
        va: "",
        vf: (option && option.choiceType) || "static",
        ct: ctrlType || "onetext",
        qt: this.getQueryType(field.fieldType || field.type, 1),
        option: option,
        controlContent:
          resultField ||
          (option && option.choice) ||
          (option && option[ctrlType]) ||
          ""
      };
    },
    getQueryType(type, op) {
      let qt = "equal";
      op = parseInt(op);
      switch (type) {
        case "varchar":
        case "clob":
          if (op) {
            switch (op) {
              case 1:
                qt = "EQUAL";
                break;
              case 2:
                qt = "NOT_EQUAL";
                break;
              case 3:
                qt = "LIKE";
                break;
              case 4:
                qt = "RIGHT_LIKE";
                break;
              case 5:
                qt = "LEFT_LIKE";
                break;
              case 6:
                qt = "IN";
                break;
              default:
                qt = "LIKE";
                break;
            }
          }
          break;
        case "int":
        case "number":
          if (op) {
            switch (op) {
              case 1:
                qt = "EQUAL";
                break;
              case 2:
                qt = "GREAT";
                break;
              case 3:
                qt = "LESS";
                break;
              case 4:
                qt = "GREAT_EQUAL";
                break;
              case 5:
                qt = "LESS_EQUAL";
                break;
              default:
                qt = "EQUAL";
                break;
            }
          }
          break;
        case "date":
          if (op) {
            switch (op) {
              case 1:
                qt = "EQUAL";
                break;
              case 2:
                qt = "GREAT";
                break;
              case 3:
                qt = "LESS";
                break;
              case 4:
                qt = "GREAT_EQUAL";
                break;
              case 5:
                qt = "LESS_EQUAL";
                break;
              case 6:
                qt = "between";
                break;
              default:
                qt = "EQUAL";
                break;
            }
          }
          break;
        default:
          qt = "equal";
          break;
      }
      return qt;
    },
    getSelectorOptions(type) {
      let selector = "userSelector";
      switch (type) {
        case "RoleDialog":
          selector = "roleSelector";
          break;
        case "PostDialog":
          selector = "postSelector";
          break;
        case "OrgDialog":
          selector = "orgSelector";
          break;
        default:
          selector = "userSelector";
          break;
      }
      return selector;
    },
    getOpOptions(type) {
      let options = {
        varchar: [
          { key: "equal", value: "=" },
          { key: "2", value: "!=" },
          { key: "3", value: "like" },
          { key: "4", value: "left_like" },
          { key: "5", value: "right_like" },
          { key: "6", value: "in" }
        ],
        clob: [
          { key: "1", value: "=" },
          { key: "2", value: "!=" },
          { key: "3", value: "like" },
          { key: "4", value: "left_like" },
          { key: "5", value: "right_like" },
          { key: "6", value: "in" }
        ],
        number: [
          { key: "1", value: "=" },
          { key: "2", value: ">" },
          { key: "3", value: "<" },
          { key: "4", value: ">=" },
          { key: "5", value: "<=" }
        ],
        int: [
          { key: "1", value: "=" },
          { key: "2", value: ">" },
          { key: "3", value: "<" },
          { key: "4", value: ">=" },
          { key: "5", value: "<=" }
        ],
        date: [
          { key: "1", value: "=" },
          { key: "2", value: ">" },
          { key: "3", value: "<" },
          { key: "4", value: ">=" },
          { key: "5", value: "<=" },
          { key: "6", value: "日期范围" }
        ]
      };
      let otherOption = [
        { key: "1", value: "=" },
        { key: "2", value: ">" },
        { key: "3", value: "<" },
        { key: "4", value: ">=" },
        { key: "5", value: "<=" }
      ];
      if (options[type]) {
        return options[type];
      } else {
        return otherOption;
      }
    },
    changeQt(row, index) {
      let qt = this.getQueryType(row.ty, row.op);
      this.conditionFields[index].qt = qt;
    },
    initMpDisplay(row){
      this.$set(row,"mpDisplay","2");
    },
    controlTypeChange(index){
      this.conditionFields[index].controlContent = "";
      let option = {...this.option};
      let field = this.conditionFields[index];
      if( field.ct=='select' || field.ct == 'radio'){
            if(field.ct == 'radio'){
              option.choiceType = 'static';
            }
            this.$set(field,"option",option);
      }
    },
    setDefaultValue(row){
      let inputErrorMessage = "";
      let pattern = /(.)*/;
      if(row.ty == 'number'){
        pattern = /^\d*$/;
        inputErrorMessage = "只能输入数字"
      }
      let defaultValue = "请输入默认值"
      if(row.defaultValue){
        defaultValue = row.defaultValue;
      }
      this.$prompt('请输入默认值','提示',{
        confirmButtonText:"确定",
        cancelButtonText:"取消",
        inputPlaceholder:defaultValue,
        inputPattern:pattern,
        inputErrorMessage:inputErrorMessage,
        inputValue:row.defaultValue
      }).then(({value})=>{
        this.$set(row,"defaultValue",value)
      }).catch(()=>{

      })
    }
  }
};
</script>
<style lang="scss" scoped>
.el-table >>> .el-radio-group{
  margin-left: 10px;
  margin-right: 10px;
}
.mobile-btn {
  &:focus {
    border: 1px solid #dcdfe6;
    color: #606266;
  }
}

.is-active__btn {
  border: 1px solid #409eff;
  background: #409eff;
  color: #fff;
  &:focus {
    color: #fff;
  }
}
</style>
