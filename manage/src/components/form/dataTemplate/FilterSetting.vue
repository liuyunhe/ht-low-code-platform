<template>
  <el-container>
    <el-form ref="form" label-width="80px" style="width:100%;">
      <el-button
        icon="el-icon-plus"
        size="small"
        type="primary"
        style="margin-bottom: 10px;"
        @click="addFilter()"
      >添加</el-button>
      <el-table
        ref="filterSettingTable"
        border
        class="dt-filter__table"
        :max-height="tabHeight"
        :data="filterFields"
        tooltip-effect="dark"
      >
        <el-table-column prop="name" label="名称" width="220"></el-table-column>
        <el-table-column prop="key" label="Key" width="180"></el-table-column>
        <el-table-column prop="type" label="类型" width="120">
          <template slot-scope="scope">
            <span>{{getFilterType(scope.row.type)}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="right" label="权限" :render-header="mrightRenderHeader" width="300">
          <template slot-scope="scope">
            <span>{{rightToDesc(scope.row.right)}}</span>
            <span style="float:right;">
              <el-button size="small" @click="setFieldRightDialog(scope.row)" icon="el-icon-edit"></el-button>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="管理">
          <template slot-scope="scope">
            <el-button
              @click="sort(scope.$index,'down')"
              size="small"
              icon="el-icon-arrow-down"
              plain
            ></el-button>
            <el-button @click="sort(scope.$index,'up')" size="small" icon="el-icon-arrow-up" plain></el-button>
            <el-button
              @click="addFilter(scope.$index,scope.row);"
              size="small"
              icon="el-icon-edit"
              plain
            ></el-button>
            <el-button
              @click="remove(scope.$index);"
              type="danger"
              size="small"
              icon="el-icon-delete"
              plain
            ></el-button>
            <el-button
              @click="copy(scope.$index);"
              type="primary"
              size="small"
              icon="el-icon-document-copy"
              plain
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <!-- 选择对话框  -->
    <eip-auth-dialog
      ref="eipAuthDialog"
      name="eipAuthDialog"
      @onConfirm="authDialogOnConfirm"
      append-to-body
    />
    <!-- 添加过滤条件对话框  -->
    <template-filter-dialog
      ref="templateFilterDialog"
      name="templateFilterDialog"
      :colPrefix="colPrefix"
      :metafields="metafields"
      :conditionFields="dataTemplate.conditionField"
      :filterFields="filterFields"
      @onConfirm="filterDialogOnConfirm"
      append-to-body
    />
  </el-container>
</template>
<script>
const eipAuthDialog = () => import("@/components/dialog/EipAuthDialog.vue");
const templateFilterDialog = () =>
  import("@/components/form/dataTemplate/TemplateFilterDialog.vue");

export default {
  components: {
    eipAuthDialog,
    templateFilterDialog
  },
  name: "filter-setting",
  props: ["data"],
  data() {
    return {
      dataTemplate: {},
      filterFields: [],
      permissionMap: {},
      permissionList: [],
      tabHeight: `${document.documentElement.clientHeight}` - 280,
      currentAuthRow: null,
      colPrefix: "",
      metafields: [],
      editFilterIndex: -1,
      conditionReplaceChar: " &@ "
    };
  },
  mounted() {
    this.dataTemplate = this.data.bpmDataTemplate;
    this.filterFields = this.dataTemplate.filterField
      ? JSON.parse(this.dataTemplate.filterField)
      : [];
    this.permissionMap = this.data.permissionList;
    this.colPrefix = this.data.colPrefix;
    this.metafields = this.data.fields;
    if (this.permissionMap) {
      for (let key in this.permissionMap) {
        this.permissionList.push({ type: key, title: this.permissionMap[key] });
      }
    }
  },
  methods: {
    copy(index) {
      let obj = JSON.parse(JSON.stringify(this.filterFields[index]));
      this.filterFields.push(obj);
    },
    //保存过滤数据
    saveFilterField() {
      this.dataTemplate.filterField = this.filterFields
        ? JSON.stringify(this.filterFields)
        : null;
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
          let temp = this.filterFields[index - 1];
          this.$set(this.filterFields, index - 1, this.filterFields[index]);
          this.$set(this.filterFields, index, temp);
        }
      } else {
        if (index === this.filterFields.length - 1) {
          this.$message({
            message: "已经是列表中最后一位",
            type: "warning"
          });
        } else {
          let i = this.filterFields[index + 1];
          this.$set(this.filterFields, index + 1, this.displayFields[index]);
          this.$set(this.filterFields, index, i);
        }
      }
    },
    //删除显示字段
    remove(index) {
      this.filterFields.splice(index, 1);
    },
    //添加管理过滤
    addFilter(index, row) {
      let conf = { editFilter: {} };
      if (typeof index != "undefined" && index > -1) {
        this.editFilterIndex = index;
        conf.editFilter = { ...row };
        conf.editFilter.condition =
          row.type == 1
            ? this.transFromConditions(row.condition)
            : row.condition;
      } else {
        this.editFilterIndex = -1;
      }
      this.$refs.templateFilterDialog.showDialog(conf);
    },
    transFromConditions(condition) {
      let conditionObj = { junction: "and", condition: [] };
      condition.forEach(c => {
        if (c.branch) {
          let subs = c.sub;
          let subConditionObj = { junction: subs[0].compType, condition: [] };
          subs.forEach(sub => {
            let subCond = this.getTransDecode(sub);
            subConditionObj.condition.push(subCond);
          });
          conditionObj.condition.push(subConditionObj);
        } else {
          let cond = this.getTransDecode(c);
          conditionObj.junction = c.compType;
          conditionObj.condition.push(cond);
        }
      });
      return JSON.stringify(conditionObj);
    },
    getTransDecode(c) {
      let descArray = c.conDesc.split(this.conditionReplaceChar);
      let cond = {
        property: c.flowvarKey,
        operator: c.judgeCon1,
        dataType: descArray.length > 3 ? descArray[3] : "varchar",
        value: c.judgeVal1,
        compType: "1",
        style: descArray[2],
        indexStr: descArray[1],
        chooseDesc: descArray[0]
      };
      return cond;
    },
    transToConditions(filterCondition) {
      let filter = JSON.parse(filterCondition);
      let condition = [];
      if (filter && filter.junction) {
        let junction = filter.junction;
        if (filter.condition) {
          let conditions = filter.condition;
          conditions.forEach(c => {
            if (c.junction) {
              if (c.condition) {
                let subCond = { branch: true, sub: [] };
                let subConditions = c.condition;
                subConditions.forEach(sub => {
                  let scond = this.getTransObj(sub, c.junction);
                  subCond.sub.push(scond);
                });
                condition.push(subCond);
              }
            } else {
              let cond = this.getTransObj(c, junction);
              condition.push(cond);
            }
          });
        }
      }
      return condition;
    },
    getTransObj(c, junction) {
      let cond = {
        compType: junction,
        flowvarKey: c.property,
        judgeCon1: c.operator,
        judgeVal1: c.value,
        ruleType: "1"
      };
      switch (c.dataType) {
        case "number":
          cond.optType = "1";
          break;
        case "date":
          cond.optType = "3";
          break;
        default:
          cond.optType = "2";
          break;
      }
      cond.conDesc =
        c.chooseDesc +
        this.conditionReplaceChar +
        c.indexStr +
        this.conditionReplaceChar +
        c.style +
        this.conditionReplaceChar +
        c.dataType;
      return cond;
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
    //设置过滤条件
    filterDialogOnConfirm(selection, rtn) {
      if (rtn) {
        if (this.editFilterIndex == -1) {
          var filter = new Object();
          filter.condition =
            rtn.filterType == 1
              ? this.transToConditions(rtn.filter)
              : rtn.filter;
          filter.name = rtn.name;
          filter.key = rtn.key;
          filter.type = rtn.filterType;
          filter.right = JSON.stringify([{ type: "everyone" }]);
          this.filterFields.push(filter);
        } else {
          this.filterFields[this.editFilterIndex].condition =
            rtn.filterType == 1
              ? this.transToConditions(rtn.filter)
              : rtn.filter;
          this.filterFields[this.editFilterIndex].name = rtn.name;
          this.filterFields[this.editFilterIndex].key = rtn.key;
          this.filterFields[this.editFilterIndex].type = rtn.filterType;
        }
      }
    },
    //显示权限信息
    rightToDesc(right) {
      if (right) {
        try {
          right = JSON.parse(right);
        } catch (error) {}
      }
      let desc = "";
      let _this = this;
      right.forEach(r => {
        if (desc) {
          desc += " 和 ";
        }
        var str = _this.permissionMap[r.type];
        if (r.name) {
          str += ":" + r.name;
        } else if (r.id) {
          str += ":" + r.id;
        }
        desc += str;
      });
      return desc;
    },
    //显示类型描述
    getFilterType(type) {
      type = parseInt(type);
      var ft = "条件脚本";
      switch (type) {
        case 2:
          ft = "SQL";
          break;
        case 3:
          ft = "追加SQL";
          break;
        case 4:
          ft = "数据权限";
          break;
      }
      return ft;
    },
    //标题统一权限设置
    mrightRenderHeader(h, para) {
      //下拉框选项
      let _this = this;
      let rights = [
        { key: "", value: "请选择" },
        { key: "none", value: "无" },
        { key: "everyone", value: "所有人" }
      ];
      let rightMap = { "": "请选择", none: "无", everyone: "所有人" };
      //下拉框内容包裹在一个div里面
      return h("div", {}, [
        h(
          "span",
          {
            //div里面有一个文字提示：下拉框所属内容
            style: {},
            class: "level-font-class"
          },
          para.column.label
        ),
        h(
          "el-select",
          {
            //el-select实现下拉框
            size: "mini",
            style: {
              width: "120px",
              marginLeft: "10px"
            },
            on: {
              input: value => {
                //随着下拉框的不同，文字框里的内容在边
                _this.rightLab = rightMap[value];
                if (
                  value &&
                  _this.filterFields &&
                  _this.filterFields.length > 0
                ) {
                  _this.filterFields.forEach(field => {
                    if (field.right) {
                      try {
                        field.right = JSON.parse(field.right);
                      } catch (error) {}
                    }
                    if (field.right[0].hasOwnProperty("v")) {
                      field.right[0] = { v: value };
                    } else {
                      field.right[0] = { type: value };
                    }
                    field.right = JSON.stringify(field.right);
                  });
                }
              }
            },
            props: {
              value: _this.rightLab //文字框的内容取决于这个value，如果value不存在，会报错
            }
          },
          [
            //下拉框里面填充选项，通过rights遍历map，为每一个选项赋值。
            rights.map(item => {
              return h("el-option", {
                props: {
                  value: item.key,
                  label: item.value
                }
              });
            })
          ]
        )
      ]);
    }
  }
};
</script>
<style lang="scss" scoped>
.dt-filter__table >>> .cell {
  text-align: center;
}

.dt-filter__table >>> .cell span {
  line-height: 32px;
}
</style>
