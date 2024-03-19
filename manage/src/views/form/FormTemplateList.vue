<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="templateData"
      :page-result="pageBean"
      :selectable="false"
      quick-search-props="templateName,alias,createBy"
      ref="htTable"
      :show-export="false"
      :show-custom-column="false"
    >
      <template v-slot:toolbar>
        <el-button size="small" @click="initTemplate()" v-pm>
          <el-tooltip content="需要修改模板内容请查找源码中的模板文件修改 模板文件名为 (别名+.ftl) 如fieldControl.ftl">
            <i class="icon-question" style="margin-right: 8px" />
          </el-tooltip>初始化
        </el-button>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column
          prop="templateName"
          label="名称"
          width="200"
          :show-overflow-tooltip="true"
          :sortable="true"
        >
          <template slot-scope="scope">
            <el-link
              type="primary"
              title="编辑模板"
              @click="edit('编辑模板',scope.row)"
            >{{scope.row.templateName}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column prop="alias" label="别名" width="200" :show-overflow-tooltip="true" />
        <ht-table-column
          prop="templateType"
          label="类型"
          width="120"
          :filters="[{text:'宏模板', value:'macro'},{text:'查询模板', value:'queryDataTemplate'},{text:'业务数据模板', value:'dataTemplate'},{text:'表单设计模板', value:'formDesign'}]"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.templateType == 'macro'">
              <el-tag>宏模板</el-tag>
            </span>
            <span v-if="scope.row.templateType == 'queryDataTemplate'">
              <el-tag>查询模板</el-tag>
            </span>
            <span v-if="scope.row.templateType == 'dataTemplate'">
              <el-tag>业务数据模板</el-tag>
            </span>
            <span v-if="scope.row.templateType == 'formDesign'">
              <el-tag>表单设计模板</el-tag>
            </span>
          </template>
        </ht-table-column>
        <ht-table-column prop="templateDesc" label="描述" :show-overflow-tooltip="true" />
      </template>
    </ht-table>
    <!-- 编辑模板 -->
    <form-template-edit-dialog
      ref="formTemplateEditDialog"
      :dialogData="dialogData"
      @loadData="loadData()"
    ></form-template-edit-dialog>

    <!-- 复制模板 -->
    <form-template-copy-dialog
      ref="formTemplateCopyDialog"
      :oldValue="oldValue"
      @loadData="loadData()"
    ></form-template-copy-dialog>
  </div>
</template>

<script>
import form from "@/api/form.js";
const formTemplateEditDialog = () =>
  import("@/views/form/FormTemplateEditDialog.vue");
const formTemplateCopyDialog = () =>
  import("@/views/form/FormTemplateCopyDialog.vue");
export default {
  components: {
    formTemplateEditDialog,
    formTemplateCopyDialog
  },
  data() {
    return {
      oldValue: {
        id: ""
      },
      dialogData: {},
      title: "",
      templateType: [
        { key: "divContainer", value: "" },
        { key: "macro", value: "宏模板" },
        { key: "main", value: "主模板" },
        { key: "subTable", value: "子模板" },
        { key: "queryDataTemplate", value: "查询模板" },
        { key: "dataTemplate", value: "业务数据模板" },
        { key: "formDesign", value: "表单设计模板" }
      ],
      pageBean: {
        page: 1,
        pageSize: 20,
        total: 0,
        sorter: [{ direction: "DESC", property: "templateType" }]
      },
      templateData: []
    };
  },
  methods: {
    //表格操作
    showFormDialog(param) {
      switch (param.command) {
        case "edit":
          this.handleOpen("编辑模板", param.row);
          break;
        case "default":
          this.setDefault(param.row);
          break;
        case "copy":
          this.openCopyTemplate(param.row);
          break;
      }
    },
    edit(title, row) {
      this.handleOpen(title, row);
    },
    //打开编辑组件
    handleOpen(param, row) {
      this.dialogData.title = param;
      this.dialogData.formData = row;
      this.$refs.formTemplateEditDialog.openDialog();
    },
    //设置默认
    setDefault(row) {
      form.setDefault(row.id, row.templateType).then(resp => {
        if (resp.data.state) {
          this.$message({ message: resp.data.message, type: "success" });
          this.loadData();
        } else {
          this.$message({ message: resp.data.message, type: "error" });
        }
      });
    },
    //删除模板
    formDeleteUrl() {
      return window.context.portal + "/form/template/v1/remove";
    },
    //打开复制组件
    openCopyTemplate(row) {
      this.oldValue = row;
      this.$refs.formTemplateCopyDialog.handleOpen();
    },
    //初始化模板
    initTemplate() {
      form.initTemplate().then(resp => {
        if (resp.data.state) {
          this.$message({ message: resp.data.message, type: "success" });
          this.loadData();
        } else {
          this.$message({ message: resp.data.message, type: "error" });
        }
      });
    },
    //初始化加载
    loadData(param, cb) {
      if (!param) {
        this.pageBean.total = 0;
        param = {
          pageBean: "",
          sorter: [{ direction: "DESC", property: "templateType" }]
        };
        param.pageBean = this.pageBean;
      }
      form
        .templateListData(param)
        .then(resp => {
          this.templateData = resp.data.rows;
          this.pageBean = {
            page: resp.data.page,
            pageSize: resp.data.pageSize,
            total: resp.data.total
          };
        })
        .finally(() => {
          if (cb) {
            cb();
          }
        });
    }
  }
};
</script>
