<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <span class="el-dropdown-link export_link">
      <i class="icon-movedown"></i>
      子表导出
    </span>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="current">当前页数据</el-dropdown-item>
      <el-dropdown-item command="all">所有数据</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>
<script>
import XLSX from "xlsx/dist/xlsx.core.min.js";
import { saveAs } from "file-saver";
import SubPagination from "@/components/eipControl/bus/SubPagination.js";

export default {
  name: "eip-sub-export-dialog",
  props: {
    dataSubname: {
      type: String,
      required: true,
    },
    dataColumns: {
      type: String,
      required: true,
    },
    dataSubdesc: {
      type: String,
      default: "子表数据",
    },
  },
  computed: {
    columns: function () {
      return eval(Base64.decode(this.dataColumns));
    }
  },
  methods: {
    changeRowKey(rows) {
      var exportData = [];
      rows.forEach(row => {
        var exportRow = {};
        this.columns.forEach(col => {
          exportRow[col.desc] = row[col.name];
        });
        exportData.push(exportRow);
      });
      return exportData;
    },
    handleCommand(type) {
      SubPagination.exportData(this.dataSubname, type)
        .then((data) => {
          let exportData = this.changeRowKey(data);
          const sheet = XLSX.utils.json_to_sheet(exportData),
            blob = this.sheet2blob(sheet);

          saveAs(blob, `${this.dataSubdesc}.xls`);
        })
        .catch((err) => {
          this.$message.error(`数据导出失败：${err}`);
        });
    },
    sheet2blob(sheet, sheetName) {
      sheetName = sheetName || "sheet1";
      var workbook = {
        SheetNames: [sheetName],
        Sheets: {},
      };
      workbook.Sheets[sheetName] = sheet;
      // 生成excel的配置项
      var wopts = {
        bookType: "xls", // 要生成的文件类型
        bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
        type: "binary",
      };
      var wbout = XLSX.write(workbook, wopts);
      var blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
      // 字符串转ArrayBuffer
      function s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
        return buf;
      }
      return blob;
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";

.export_link {
  font-weight: normal;
  color: $--color-primary;
  cursor: pointer;
}
</style>