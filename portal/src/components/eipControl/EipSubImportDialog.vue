<template>
  <div class="inputs import-container">
    <el-button type="text" size="mini" @click="dialogVisible = true">
      <i class="icon-moveup"></i>
      子表导入
    </el-button>
    <el-button type="text" size="mini" @click="exportFormSub">
      <i class="el-icon-download"></i>
      下载模板
    </el-button>
    <el-dialog :visible.sync="dialogVisible" width="600px" title="导入子表数据" append-to-body  :close-on-click-modal="false">
      <el-form label-width="100px" label-position="left">
        <el-form-item label="导入文件：">
          <input type="file" ref="selectFile"
            accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            @change="fileChange" />
        </el-form-item>
        <el-form-item label="导入模式：">
          <ht-radio v-model="mode" :options="modeOptions" :props="{key:'mode',value:'desc'}"></ht-radio>
        </el-form-item>
        <el-tag v-if="importRows && importRows.length > 0" type="warning" class="read-success__label">
          已经读取到
          <b>{{importRows.length}}</b>条数据，
          <a @click="showRowData=!showRowData">点击查看详情</a>。
        </el-tag>
        <pre v-if="showRowData" class="import-rows__pre">{{importRows}}</pre>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" type="primary" :disabled="!importRows || importRows.length == 0" @click="dialogConfirm">
          确定</el-button>
        <el-button size="small" @click="dialogVisible = false">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import req from "@/request.js";
import XLSX from "xlsx/dist/xlsx.core.min.js";
import SubPagination from "@/components/eipControl/bus/SubPagination.js";
const Base64 = require("js-base64").Base64;

export default {
  name: "eip-sub-import-dialog",
  props: {
    subDesc:{
      type: String,
      default: "子表模板",
    },
    dataSubname: {
      type: String,
      required: true,
    },
    maxRow: {
      type: String,
      default: null,
    },
    mergeExpression: {
      type: String,
      default: null,
    },
    dataColumns: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      dialogVisible: false,
      importRows: null,
      showRowData: false,
      mergeFunc: null,
      mode: "append",
      modeOptions: [
        { mode: "append", desc: "追加导入" },
        { mode: "override", desc: "覆盖导入" },
        { mode: "merge", desc: "合并导入", disabled: true },
      ],
    };
  },
  computed: {
    columns: function () {
      return eval(Base64.decode(this.dataColumns));
    }
  },
  watch: {
    dialogVisible: {
      handler: function (newVal) {
        // 清空附件
        if (!newVal && this.$refs.selectFile) {
          this.$refs.selectFile.value = "";
          this.importRows = null;
          this.showRowData = false;
        }
      },
      immediate: true,
    },
    mergeExpression: {
      handler: function (newVal) {
        if (newVal) {
          // 如果有导入合并的代码，则允许选择合并导入模式
          this.$set(this.modeOptions[2], "disabled", false);
          // 并设置默认为 合并导入
          this.mode = "merge";
          // 解码合并的代码
          const funcExp = Base64.decode(newVal);
          this.mergeFunc = eval(`(${funcExp})`);
        }
      },
      immediate: true,
    },
  },
  methods: {
    //子表模板导出
    exportFormSub(){
      req.post(window.context.form+"/form/form/v1/exportFormSub?subDesc="+this.subDesc, this.columns, "arraybuffer");
    },
    getNameByDesc(desc) {
      var name = "";
      this.columns.forEach(col => {
        if (col.desc == desc) {
          name = col.name;
        }
      });
      return name;
    },
    changeRowKey(rows) {
      var importRows = [];
      rows.forEach(row => {
        var importRow = {};
        for (let key in row) {
          importRow[this.getNameByDesc(key)] = row[key];
        }
        importRows.push(importRow);
      });
      return importRows;
    },
    dialogConfirm() {
      if(this.importRows.length==0){
        this.$message.error("请选择要导入的文件");
        return;
      }
      if(this.maxRow){
        let maxRowInt = parseInt(this.maxRow);
        if(this.mode=="override"){//覆盖导入
          let count = this.importRows.length;
          if(count>maxRowInt && maxRowInt!=0){
            this.$message.error("子表数据已超过最大行数【"+maxRowInt+"】");
            return;
          }
        }else if(this.mode=="append" || this.mode=="merge"){//追加导入/合并导入
          let boData = document.getElementsByName("online-form")[0].__vue__.data; //获取表单bo对象
          let pathArr = this.dataSubname.split('.')
          let subTabName = pathArr[2].replace('sub_', '')
          let subInitData = boData[pathArr[1]][pathArr[2]] || [];//子表数据
          let num = this.importRows.length+subInitData.length;
          if(num>maxRowInt && maxRowInt!=0){
            this.$message.error("子表数据已超过最大行数【"+maxRowInt+"】");
            return;
          }
        }
      }
      SubPagination.importData(
        this.dataSubname,
        this.importRows,
        this.mode,
        this.mergeFunc
      )
        .then(() => {
          this.dialogVisible = false;
        })
        .catch((err) => {
          this.$message.error(`数据导入失败：${err}`);
        });
    },
    fileChange(m) {
      if (!m || !m.target || !m.target.files || m.target.files.length != 1) {
        return;
      }
      this.importRows = [];
      this.readWorkbookFromLocalFile(m.target.files[0], (rows) => {
        this.importRows = this.changeRowKey(rows);
      });
    },
    // 读取本地excel文件
    readWorkbookFromLocalFile(file, callback) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        let workbook = null;
        try {
          // 读取Excel内容
          workbook = XLSX.read(data, { type: "binary" });
        } catch (err) {
          this.$message.error("所选文件不是有效的Excel文件.");
          return;
        }
        const sheetNames = workbook.SheetNames,
          // 只读取第一个sheet的数据
          worksheet = workbook.Sheets[sheetNames[0]];

        if (worksheet["!merges"] && worksheet["!merges"].length > 0) {
          const merge = worksheet["!merges"][0],
            rowNum = Number(merge["e"]["r"]);
          // 合并单元格时会导致转换出来的JSON数据格式错乱
          this.$message.error(
            `Excel中不能有合并的单元格，请检查第${rowNum + 1}行数据。`
          );
          return;
        }
        const json = XLSX.utils.sheet_to_json(worksheet);
        if (!json || json.constructor != Array) {
          this.$message.error("读取的数据格式错误。");
          return;
        }
        if (callback) callback(json);
      };
      reader.readAsBinaryString(file);
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";

.import-container {
  margin: 0 5px;
}
.read-success__label {
  display: block;
  font-size: 13px;
}
.read-success__label a {
  color: $--color-primary;
  cursor: pointer;
}
.read-success__label b {
  color: red;
}
.import-rows__pre {
  margin-top: 20px;
  max-height: 270px;
  overflow-y: scroll;
}
.inputs {
  margin-top: 3px;
}
</style>
