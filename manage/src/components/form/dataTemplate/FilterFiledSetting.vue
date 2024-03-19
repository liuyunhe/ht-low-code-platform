<template>
  <el-container>
    <el-row :gutter="20" style="width:100%;">
      <el-col :span="7">
        <el-table
          ref="displaySettingTable"
          border
          :max-height="tabHeight"
          :data="displaySettingFields"
          tooltip-effect="dark"
          @row-dblclick="fillToDisplay"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="name" label="列名" show-overflow-tooltip></el-table-column>
          <el-table-column prop="desc" label="注释" show-overflow-tooltip></el-table-column>
          <el-table-column prop="type" label="类型" width="80"></el-table-column>
        </el-table>
      </el-col>
      <el-col :span="1">
        <el-button
          type="primary"
          circle
          icon="icon-hide"
          title="将所选字段添加为显示字段"
          style="-webkit-transform: rotate(270deg);transform: rotate(270deg)"
          @click="allFillToDisplay()"
        />
      </el-col>
      <el-col :span="16">
        <el-table
          ref="displayTable"
          border
          :max-height="tabHeight"
          :data="filteringField"
          tooltip-effect="dark"
          style="width: 100%;"
        >
          <el-table-column label="序号" type="index" width="50"></el-table-column>
          <el-table-column prop="name" label="列名" width="115"></el-table-column>
          <el-table-column prop="desc" label="注释" width="135">
          </el-table-column>

           <el-table-column  label="过滤范围" width="135">
            <template slot-scope="scope">
              <el-button @click="setting(scope.row)" size="small">设置</el-button>
            </template>
          </el-table-column>
          <el-table-column label="默认值" width="220">
            <template slot-scope="scope">
              <el-select v-model="scope.row.defaultValue" size="mini" clearable multiple >
                <el-option
                  v-for="(item,index) in scope.row.formatterData"
                  :key="index"
                  :label="item.text"
                  :value="item.value"
                ></el-option>
              </el-select>
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
                @click="remove(scope.$index)"
                type="danger"
                size="small"
                icon="el-icon-delete"
                plain
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <el-dialog
      title="设置"
      width="50%"
      append-to-body
      :close-on-click-modal="false"
      class="filter-set-dialog"
      :visible.sync="settingVisible"
      :before-close="handleDialogClose"
    >
      <el-button type="primary" style="margin-bottom: 10px" @click="addSetting">添加</el-button>
      <el-table :data="selectedRow.formatterData" border size="mini">
        <el-table-column label="值">
          <template slot-scope="scope">
            <el-input v-model="scope.row.value" :maxlength="50" show-word-limit v-if="selectedRow.type==='varchar'"/>
            <ht-input type="number" width="280px" v-model="scope.row.value" :maxlength="50" show-word-limit v-if="selectedRow.type==='number'"/>
          </template>
        </el-table-column>
        <el-table-column label="标签">
          <template slot-scope="scope">
            <el-input v-model="scope.row.text" :maxlength="50" show-word-limit />
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button icon="el-icon-delete" @click="removeSetting(scope.$index)" />
          </template>
        </el-table-column>
      </el-table>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogOk" size="medium">确 定</el-button>
        <el-button @click="cancelSetting" size="medium">取 消</el-button>
      </span>
    </el-dialog>

    <eip-data-template-dialog
      :appendToBody="true"
      ref="dataTemplateDialog"
      :single="true"
      @onConfirm="onDataTemplateConfirm"
    ></eip-data-template-dialog>
  </el-container>
</template>

<script>
const EipDataTemplateDialog = () =>
  import("@/components/dialog/EipDataTemplateDialog.vue");

export default {
  components: {
    EipDataTemplateDialog
  },
  name: "filterFiled-setting",
  props: ["data"],
  data() {
    return {
      reportName: "",
      conditionField: [],
      dataTemplate: {},
      displaySettingFields: [],
      filteringField: [],
      permissionMap: {},
      permissionList: [],
      rightList: [
        { key: "", value: "请选择" },
        { key: "none", value: "无" },
        { key: "everyone", value: "所有人" }
      ],
      tabHeight: `${document.documentElement.clientHeight}` - 245,
      currentAuthRow: null,
      settingVisible: false,
      formRow: [],
      selectedRow: [],
      formFieldList: [],
      urlParams: []
    };
  },
  mounted() {
    this.dataTemplate = this.data.bpmDataTemplate;
    if (this.data.displaySettingFields) {
      this.displaySettingFields = JSON.parse(this.data.displaySettingFields);
      this.displaySettingFields = this.displaySettingFields.filter(item => {
        if (item.type==='date' || item.type==='clob'){
          return false;
        }else {
          return true;
        }
      });
    }
    this.templates = this.data.templates;
    this.permissionMap = this.data.permissionList;
    this.initData();
  },
  methods: {
    dialogOk() {
      for(let i=0; i<this.selectedRow.formatterData.length; i++){
        if(!this.selectedRow.formatterData[i].value || !this.selectedRow.formatterData[i].text){
          this.$message.warning("第"+(i+1)+"行值、标签为空！");
          return false;
        }
      }
      var conditionField = this.conditionField;
      this.selectedRow.parameter = [];
      conditionField.forEach(item => {
        this.selectedRow.parameter.push({
          property: item.key,
          value: item.parameter,
          group: "main",
          operation: item.qt,
          relation: "AND"
        });
      });
      if (this.selectedRow.urlType == "url" && this.urlParams) {
        this.selectedRow.urlParams = [...this.urlParams];
        this.urlParams = [];
      }
      //this.formRow.formatterData = this.selectedRow.formatterData;
      this.$set(this.formRow,"formatterData",this.selectedRow.formatterData)
      this.formRow.parameter = this.selectedRow.parameter;
      if(this.selectedRow.urlParams) {
        this.formRow.urlParams = this.selectedRow.urlParams;
      }
      this.settingVisible = false;
    },
    onDataTemplateConfirm(selectedNode) {
      if (selectedNode && selectedNode.length > 0) {
        this.$nextTick(() => {
          this.conditionField = [];
          var conditionField = JSON.parse(selectedNode[0].conditionField);
          conditionField.forEach(item => {
            var obj = {
              key: item.colPrefix + item.name,
              parameter: "",
              qt: item.qt,
              value: item.cm
            };
            this.conditionField.push(obj);
          });
          this.reportName = selectedNode[0].name;
          this.selectedRow.reportNameConfigure = {
            alias: selectedNode[0].alias,
            reportName: selectedNode[0].name,
            conditionField: this.conditionField
          };
        });
      } else {
        this.reportName = "";
        this.conditionField = [];
        this.selectedRow.reportNameConfigure = {};
      }
    },
    //保存显示列数据
    saveFilteringField() {
      this.dataTemplate.filteringField = this.filteringField
        ? JSON.stringify(this.filteringField)
        : null;
    },
    //初始化处理
    initData() {
      if (this.dataTemplate.filteringField) {
        this.filteringField = JSON.parse(this.dataTemplate.filteringField);
      }

      if (this.dataTemplate.formField) {
        this.formFieldList = [];
        const formFieldList = JSON.parse(this.dataTemplate.formField);
        let fieldMap = {};
        let _this = this;
        formFieldList.forEach(ffield => {
          if (!fieldMap[ffield.name]) {
            _this.formFieldList.push(ffield);
            fieldMap[ffield.name] = true;
          }
        });
      }
    },
    showDataTemplateDialog() {
      this.$refs.dataTemplateDialog.showDialog();
    },
    columnFilter(type) {
      return type != "sub" && type != "tabs";
    },
    //双击字段列表中的字段时将该字段加入到显示字段
    fillToDisplay(row, event, column) {
      let isIn = this.isInDisplayFields(row.name);
      if (!isIn) {
        this.filteringField.push(row);
      }
    },
    //将字段列表中的已选字段加入到显示字段列表
    allFillToDisplay() {
      let selectrows = this.$refs.displaySettingTable.store.states.selection;
      if (!selectrows || selectrows.length < 1) {
        this.$message({
          message: "请在左侧列表中选择要显示的字段",
          type: "warning"
        });
      }
      selectrows.forEach(obj => {
        if (!this.isInDisplayFields(obj.name)) {
          this.filteringField.push(obj);
        }
      });
    },
    //打开设置权限
    setFieldRightDialog(row) {
      let conf = {
        right: JSON.parse(row.right),
        permissionList: this.permissionList
      };
      this.currentAuthRow = row;
      this.$refs.eipAuthDialog.showDialog(conf);
    },
    //设置权限
    authDialogOnConfirm(data) {
      if (this.currentAuthRow) {
        this.currentAuthRow.right = JSON.stringify(data);
      }
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
          let temp = this.filteringField[index - 1];
          this.$set(this.filteringField, index - 1, this.filteringField[index]);
          this.$set(this.filteringField, index, temp);
        }
      } else {
        if (index === this.filteringField.length - 1) {
          this.$message({
            message: "已经是列表中最后一位",
            type: "warning"
          });
        } else {
          let i = this.filteringField[index + 1];
          this.$set(this.filteringField, index + 1, this.filteringField[index]);
          this.$set(this.filteringField, index, i);
        }
      }
    },

    //删除显示字段
    remove(index) {
      this.filteringField.splice(index, 1);
    },
    //判断字段是否已在显示字段列表中
    isInDisplayFields(name) {
      let isIn = false;
      if (this.filteringField && this.filteringField.length > 0) {
        this.filteringField.forEach(obj => {
          if (obj.name == name) {
            isIn = true;
            return;
          }
        });
      }
      return isIn;
    },

    setting(row) {
      this.settingVisible = true;
      this.formRow = row;
      this.selectedRow = JSON.parse(JSON.stringify(this.formRow));
      if (this.selectedRow.reportNameConfigure) {
        this.reportName = this.selectedRow.reportNameConfigure.reportName;
        this.conditionField =
          this.selectedRow.reportNameConfigure.conditionField == undefined
            ? []
            : this.selectedRow.reportNameConfigure.conditionField;
      }

      if (!this.selectedRow.formatterData) {
        this.selectedRow.formatterData = [];
      }
      if (
        this.selectedRow.urlType == "url" &&
        this.selectedRow.urlParams &&
        this.selectedRow.urlParams.length > 0
      ) {
        this.urlParams = [...this.selectedRow.urlParams];
      }
    },
    addSetting() {
      this.selectedRow.formatterData.push({
        key: "",
        value: ""
      });
    },
    removeSetting(index) {
      this.selectedRow.formatterData.splice(index, 1);
    },
    cancelSetting() {
      this.handleDialogClose();
    },
    urlParamsAdd() {
      this.urlParams.push({ name: "", field: "" });
    },
    urlParamsRemove(item) {
      this.urlParams.remove(item);
    },
    handleDialogClose() {
      this.settingVisible = false;
    },
  }
};
</script>
<style scoped>
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
.filter-set-dialog >>> .el-dialog__body {
  padding: 0px 20px;
}
</style>
