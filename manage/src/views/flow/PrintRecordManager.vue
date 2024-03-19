<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      quick-search-props="procInstId,procDefKey,procDefName,templateName"
      :show-export="false"
      :show-custom-column="false"
      :default-sorter="[{direction:'DESC',property:'createTime'}]"
      ref="htTable"
    >
      <!-- <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="showDialog()" icon="el-icon-plus">添加</el-button>
          <ht-delete-button :url="deleteUrl" :htTable="$refs.htTable">删除</ht-delete-button>
        </el-button-group>
      </template> -->
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column
          label="模板名称"
          prop="templateName"
          :show-overflow-tooltip="true"
        >
          <template v-slot="{ row }">
            <el-link @click="searchFile(row)" type="primary">{{
              row.procDefName
            }}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column prop="procDefKey" label="流程KEY" :sortable="true" :show-overflow-tooltip="true">
        </ht-table-column>
        <ht-table-column prop="procInstId" label="实例ID" :sortable="true" :show-overflow-tooltip="true">
        </ht-table-column>
        <ht-table-column prop="nodeId" label="节点ID" :sortable="true" :show-overflow-tooltip="true">
        </ht-table-column>
        <ht-table-column prop="formKey" label="表单key" :sortable="true" :show-overflow-tooltip="true">
        </ht-table-column>
        <ht-table-column prop="procDefName" label="流程名称" :sortable="true" :show-overflow-tooltip="true">
        </ht-table-column>
        <ht-table-column prop="createTime" label="生成时间" :sortable="true" :show-overflow-tooltip="true">
        </ht-table-column>
        <ht-table-column width="100" label="操作">
          <template v-slot="{ row }">
            <el-button
              size="mini"
              icon="el-icon-download"
              @click="download(row)"
              >下载</el-button
            >
          </template>
        </ht-table-column>
      </template>
    </ht-table>
    <!-- 预览pdf.word等文件格式 -->
    <Pdf ref="pdfSearch" :src="src" :fileRow="fileRow" />
    <!-- 预览excel.jpg.png.txt等文件格式 -->
    <iframe-src
      ref="iframeSrcSearch"
      :iframeSrc="iframeSrc"
      :fileRow="fileRow"
    />
  </div>
</template>
<script>
import req from "@/request.js";
const IframeSrc = () => import("@/views/file/IframeSrc.vue");
const Pdf = () => import("@/views/file/Pdf.vue");
export default {
  components: { IframeSrc, Pdf },
  data() {
    return {
      src: "",
      iframeSrc: "",
      fileRow: "",
      dialogVisible: false,
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      printRecord: {}
    };
  },
  mounted() {
    this.$validator = this.$root.$validator;
  },
   computed: {
    deleteUrl: function() {
      return window.context.bpmRunTime + "/runtime/bpmPrintRecord/v1/remove";
    },
  },
  methods: {
    loadData(param, cb) {
    	this.$http.post(window.context.bpmRunTime+"/runtime/bpmPrintRecord/v1/listJson", param).then(resp => {
            let response = resp.data;
            this.data = response.rows;
            this.pageResult = {
              page: response.page,
              pageSize: response.pageSize,
              total: response.total
            };
        }, error => {
            reject(error);
        }).finally(() => cb());
    },
    searchFile(row) {
      this.$http.get(window.context.portal+"/file/onlinePreviewController/v1/onlinePreview?fileId="+row.fileId).then(resp => {
        let data = resp.data;
        if (data.result == "error") {
          Message.error("附件不存在");
        } else {
          this.fileRow = row;
          this.fileRow.id = row.fileId;
          if (data.result == "html") {
            this.iframeSrc = window.context.portal + data.pdfUrl;
            this.$refs.iframeSrcSearch.handleOpen();
          } else if (data.result == "txt") {
            this.iframeSrc = window.context.portal + data.TxtUrl;
            this.$refs.iframeSrcSearch.handleOpen();
          } else if (data.result == "picture") {
            this.iframeSrc = window.context.portal + data.currentUrl;
            this.$refs.iframeSrcSearch.handleOpen();
          } else if (data.result == "compress") {
            this.fileTree = JSON.parse(data.fileTree).childList;
            this.$refs.fileTreeSearch.handleOpen();
          } else {
            this.src = window.context.portal + data.pdfUrl;
            this.$refs.pdfSearch.handleOpen();
          }
        }
      });
    },
    //下载附件
    download(row) {
      req.download(window.context.portal+"/system/file/v1/downloadFile?fileId=" + row.fileId);
    },
  }
};
</script>

<style lang="scss" scoped>
.sp-manager__dialog /deep/ > .el-dialog > .el-dialog__body {
  height: calc(100% - 170px);
}
</style>
