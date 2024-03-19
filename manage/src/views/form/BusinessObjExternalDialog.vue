<template>
  <ht-sidebar-dialog
    width="800px"
    title="外部表"
    v-if="dialogVisible"
    :visible="dialogVisible"
    :before-close="handleClose"
    class="right-dialog"
    :append-to-body="true"
    destroy-on-close
  >
    <el-form :inline="true" :model="entExts" data-vv-scope="externalForm" class="external-form">
      <ht-form-item label="描述" prop="comment" label-width="100px">
        <ht-input
          placeholder="请输入描述"
          :disabled="addFk"
          v-model="entExts.comment"
          name="entExtsDesc"
          :validate="{ required: true }"
          :maxlength="50"
          :showWordLimit="true"
        />
      </ht-form-item>
      <ht-form-item label="名称" prop="name" label-width="100px">
        <ht-input
          placeholder="请输入名称"
          v-pinyin="entExts.comment"
          v-model="entExts.name"
          name="entExtsName"
          :disabled="addFk"
          :validate="{ required: true, alpha_dash: true,regex:{exp:'^[a-zA-Z][a-zA-Z0-9_]*$', message:'只能输入字母、数字、下划线，且以字母开头' }}"
          :maxlength="50"
          :showWordLimit="true"
        />
      </ht-form-item>
      <ht-form-item label="数据源" prop="dsName" label-width="100px">
        <ht-select
          :options="dataSource"
          :props="{ key: 'alias', value: 'name' }"
          v-model="entExts.dsName"
          name="entExtsDsName"
          :disabled="addFk || querying"
          @change="changeSource()"
          :validate="{ required: true }"
        ></ht-select>
      </ht-form-item>
      <ht-form-item label="表名" prop="searchTableName" label-width="100px">
        <ht-input
          v-model="searchTableName"
          :maxlength="50"
          :showWordLimit="true"
          style="width: 215px"
        >
          <el-button
            slot="append"
            icon="el-icon-search"
            style="width:45px"
            :disabled="querying"
            @click="getTableList('select')"
            class="table-name-search"
          ></el-button>
        </ht-input>
      </ht-form-item>
      <ht-form-item label="选择外部表" prop="tableName" label-width="100px">
        <ht-select
          :options="tableList"
          :props="{ key: 'name', value: 'comment' }"
          name="entExtsSelectName"
          :disabled="addFk || querying"
          @change="changeTableName()"
          :validate="{ required: true }"
          v-model="entExts.tableName"
        ></ht-select>
      </ht-form-item>
      <ht-form-item
        label="外部表类型"
        v-show="entExts.type!='mainTable'"
        label-width="100px"
        class="config-item"
      >
        <ht-select
          :options="extsTableType"
          :disabled="editing"
          v-model="entExts.type"
          :props="{key: 'key', value: 'value'}"
        ></ht-select>
      </ht-form-item>
      <ht-form-item label="主键" label-width="100px">
        <ht-input disabled placeholder v-model="entExts.pk" />
      </ht-form-item>
      <ht-form-item label="主键类型" label-width="100px">
        <el-radio-group v-model="entExts.pkType">
          <el-radio label="varchar">字符串</el-radio>
          <el-radio label="number">数字</el-radio>
        </el-radio-group>
      </ht-form-item>
      <ht-form-item label="外键" label-width="100px">
        <ht-select
          name="fkVal"
          :options="entExtsTable"
          v-model="entExts.fk"
          :props="{key:'name',value:'comment'}"
          clearable
        ></ht-select>
      </ht-form-item>
    </el-form>
    <el-scrollbar class="scrollbar-fullheight">
      <el-table :data="entExtsTable" width="100%" border style="height:calc(100%-220px)">
        <el-table-column label="字段信息" align="center">
          <el-table-column prop="comment" label="注释" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="name" label="名称" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="isRequired" label="是否必填" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span disabled v-if="scope.row.isRequired == 0">否</span>
              <span disabled v-else>是</span>
            </template>
          </el-table-column>
          <el-table-column prop="dataType" label="数据类型" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span disabled v-if="scope.row.dataType == 'varchar'">字符串</span>
              <span disabled v-else-if="scope.row.dataType == 'number'">数字</span>
              <span disabled v-else-if="scope.row.dataType == 'date'">日期</span>
              <span disabled v-else-if="scope.row.dataType == 'text' || scope.row.fcolumnType=='text'">大文本</span>
              <span disabled v-else>其他类型</span>
            </template>
          </el-table-column>
          <el-table-column prop="fcolumnType" label="属性长度" :show-overflow-tooltip="true"></el-table-column>
          <!-- <el-table-column
            prop="defaultValue"
            label="默认值"
            :show-overflow-tooltip="true"
            width="240"
          >
            <template slot-scope="scope">
              <ht-date
                v-if="scope.row.dataType == 'date'"
                style="width: 100%"
                v-model="scope.row.defaultValue"
                :value-format="scope.row.format"
              ></ht-date>
              <ht-input
                v-else
                v-model="scope.row.defaultValue"
                :maxlength="50"
                :showWordLimit="true"
              ></ht-input>
            </template>
          </el-table-column> -->
        </el-table-column>
      </el-table>
    </el-scrollbar>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" :disabled="entExtConfirm" @click="validatorEntExts()">确 定</el-button>
      <el-button @click="handleClose">取 消</el-button>
    </span>
  </ht-sidebar-dialog>
</template>

<script>
import form from "@/api/form.js";
import util from "@/hotent-ui-util.js";

export default {
  data() {
    return {
      dialogVisible: false, // 对话框是否可以见
      editSubOrSun: false,
      addFk: false,
      tableList: [], // 当前数据源的物理表集合
      entExtsTable: [], // 所选物理表的字段集合
      entExtConfirm: false,
      entsCount: 0, // 当前业务对象的模型数量
      editing: false, // 是否编辑
      hideAttr: [], // 需要隐藏起来的字段集合
      entExts: {
        // 外部表的form数据
        comment: "",
        desc: "",
        dsName: "",
        index: 0,
        isExternal: "1",
        name: "",
        packageId: "",
        pk: "",
        fk: "",
        pkType: "",
        relation: "",
        show: "",
        status: "",
        tableName: "",
        attributeList: [],
        type: "",
      },
      dataSource: [], // 当前数据源集合
      currentDataSource: null, // 当前所选择的数据源
      searchTableName: "", // 要搜索的表名
      extsTableType: [
        { key: "subTable", value: "子表" },
        { key: "sunTable", value: "孙表" },
      ],
      querying: false, // 是否正在查询：查询数据源、查询数据库表、查询表字段
      externalTables: [],
    };
  },
  watch: {
    "entExts.dsName": {
      handler: function (newVal) {
        if (newVal && this.dataSource && this.dataSource.length > 0) {
          this.currentDataSource = this.dataSource.find(
            (d) => d.alias == newVal
          );
        }
      },
      immediate: true,
    },
  },
  methods: {
    // 打开选择外部表的对话框
    open(currentEnt, currentEntType, entsCount,externalTables) {
      this.dialogVisible = true;
      this.entsCount = entsCount;
      this.entExts.type = currentEntType;
      this.externalTables = externalTables;
      this.editing = currentEntType ? true : false;
      this.editSubOrSun =
        currentEntType == "subTable" || currentEntType == "sunTable";

      this.querying = true;
      form
        .getDataSource()
        .then((resp) => {
          this.dataSource = resp.data;
          if (!this.entExts.dsName) {
            this.entExts.dsName = "LOCAL";
            this.changeSource();
          }
        })
        .finally(() => {
          this.querying = false;
        });
      let searchTable = null;
      if (currentEnt) {
        searchTable = currentEnt.tableName;
      }
      if (searchTable) {
        this.entExts.comment = currentEnt.comment;
        this.entExts.name = currentEnt.name;
        this.entExts.dsName = currentEnt.dsName;
        this.entExts.tableName = currentEnt.tableName;
        this.entExts.fk = currentEnt.fk;
        this.addFk = true;
        this.getTableList()
          .then(() => {
            this.changeTableName();
          })
          .catch((err) => {
            this.$message.error(err);
          });
      }
    },
    handleClose() {
      this.dialogVisible = false;
      this.querying = false;
      this.addFk = false;
      this.tableList = [];
      this.entExts = {
        desc: "",
        dsName: "",
        index: 0,
        isExternal: "1",
        name: "",
        packageId: "",
        pk: "",
        fk:"",
        pkType: "",
        relation: "",
        show: "",
        status: "",
        tableName: "",
        attributeList: [],
        type: "",
      };
      this.entExtsTable = [];
    },
    changeSource() {
      this.entExts.tableName = "";
      this.searchTableName = "";
      this.entExtsTable = [];
      this.getTableList("select");
    },
    //外部表数据
    getTableList(type) {
      const this_ = this;
      this.entExtConfirm = true;
      return new Promise((resolve, reject) => {
        if (type) {
          this_.showMessage = true;
        }
        if (!this_.entExts.dsName) {
          reject("当前未选择数据源");
        }
        var param = {
          dsalias: this_.entExts.dsName,
          isTable: "1",
          objName: this_.searchTableName,
        };
        this_.querying = true;
        this_.tableList = [];
        form
          .getTableList(param)
          .then((resp) => {
            if (resp.data) {
              resp.data.forEach((v) => {
                v.comment = v.name + "(" + v.comment + ")";
              });
              if (this_.showMessage) {
                this_.$message({
                  message: "查询成功，请选择外部表",
                  type: "success",
                });
              }
              this_.tableList = resp.data;
            }
          })
          .finally(() => {
            this_.entExtConfirm = false;
            this_.showMessage = false;
            this_.querying = false;
            resolve();
          });
      });
    },
    //外部表选择
    changeTableName() {
      this.entExtConfirm = true;
      let param = {
        dsalias: this.entExts.dsName,
        isTable: "1",
        objName: this.entExts.tableName,
      };
      this.querying = true;
      form
        .getHideAttr(param.objName)
        .then((resp) => {
          if (resp) {
            this.hideAttr = resp;
          }
        })
        .then(() => {
          this.querying = true;
          form
            .changeTableName(param,false)
            .then((resp) => {
              this.entExtsTable = JSON.parse(
                JSON.stringify(resp.data.table.columnList)
                  .replace(/charLen/g, "attrLength")
                  .replace(/fieldName/g, "name")
                  .replace(/columnType/g, "dataType")
                  .replace(/fdataType/g, "fcolumnType")
              );
              this.entExtsTable.forEach((item) => {
                item.fieldName = item.name;
              });
              if (this.hideAttr.length > 0) {
                let attr = "";
                this.hideAttr.forEach((v) => {
                  attr += v.fieldName + ",";
                });
                this.entExtsTable = this.entExtsTable.filter((value) => {
                  return !attr.includes(value.fieldName);
                });
              }
              resp.data.table.primayKey.forEach((data) => {
                this.entExts.pk = data.fieldName;
                this.entExts.pkType = data.columnType;
              });
              this.hideAttr = [];
            })
            .finally(() => {
              this.entExtConfirm = false;
              this.querying = false;
            });
        })
        .finally(() => {
          this.querying = false;
        });
    },
    validatorEntExts() {
      util
        .validateForm(this, "externalForm")
        .then(() => {
          this.buildExternalEnt();
        })
        .catch((reason) => {
          let rule = reason.map((v) => {
            return v.rule;
          });
          if (rule.includes("required")) {
            this.$message.warning("请将信息填写完整");
          } else if (rule.includes("alpha_dash")) {
            this.$message.warning("请按正确的格式输入");
          }
        });
    },
    buildExternalEnt() {
      this.entExts.index = this.entsCount;
      if (!this.editSubOrSun && this.entExts.index > 0) {
        if (!this.entExts.type) {
          this.$message.warning("请选择外部表类型。");
          return;
        }
        if (!this.entExts.fk) {
          this.$message.warning("请指定外键字段。");
          return;
        }
        if (this.externalTables.includes(this.entExts.tableName)){
          this.$message.warning("该外部表已存在，不允许重复添加。");
          return;
        }
      }
      console.log(this.externalTables)
      this.entExts.relation = this.entExts.relation || "onetomany";
      this.entExts.show = this.entExts.show || "子实体-外";
      if (this.entExtsTable && this.entExtsTable.length > 0) {
        // 若数据源为Oracle的 则要判断数据类型为date 还是 datetime 不同类型赋值类型不同
        if (
          this.currentDataSource &&
          this.currentDataSource.dbType == "oracle"
        ) {
          this.entExtsTable.forEach((item) => {
            if (!item.format && item.dataType == "date") {
              item.format = "yyyy-MM-dd";
            } else if (!item.format && item.dataType == "datatime") {
              item.format = "yyyy-MM-dd HH:mm:ss";
            }
          });
        } else {
          this.entExtsTable.forEach((item) => {
            if (!item.format && item.dataType == "date") {
              if(item.fcolumnType == "datetime"){
                item.format = "yyyy-MM-dd HH:mm:ss";
              }else{
                item.format = "yyyy-MM-dd";
              }
            }
          });
        }
      }

      const entExts = { ...this.entExts },
        entExtsTable = [...this.entExtsTable];
      let externalEnt = {
        entExts,
        entExtsTable,
        addFk: this.addFk,
      };
      this.$emit("selectExternal", externalEnt);
      this.$emit("addExternalTable", entExts.tableName);
      this.handleClose();
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/css/right-dialog.scss';
.dialog {
  // height: 100%;
  .external-form {
    height: 250px;
  }
  .scrollbar-fullheight {
    height: calc(100% - 270px);
  }
}
.right-dialog {
   /deep/ .el-dialog__wrapper{
    overflow: scroll!important;
  }
 /deep/ .el-dialog{
  .el-dialog__body{
    height:calc(100%-145px)!important;
  }
  }
}
</style>