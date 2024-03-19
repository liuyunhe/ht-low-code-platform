<template>
  <div class="fullheight">
    <el-dialog
      class="print-form"
      v-if="dialogFlowVisible"
      :visible.sync="dialogFlowVisible"
      destroy-on-close
      width="60%"
      title="打印模板"
    >
      <ht-table
        @load="loadData"
        :data="data"
        quick-search-props="fileName"
        :page-result="pageResult"
        :default-querys="[{ property: 'formKey', value: formKey }]"
        :show-export="false"
        :show-custom-column="false"
        ref="htTable"
      >
        <template v-slot:toolbar>
          <el-tooltip placement="top" effect="light" content="默认调用主版本">
            <el-button icon="el-icon-printer" @click="defaultWordPrint()">word套打</el-button>
          </el-tooltip>
          <el-tooltip placement="top" effect="light" content="默认调用主版本">
            <el-button icon="el-icon-document" @click="defaultFormPreview()">表单打印预览</el-button>
          </el-tooltip>
          <el-tooltip placement="top" effect="light" content="直接打印">
            <el-button icon="el-icon-printer" @click="checkDefalut()">不使用打印模板</el-button>
          </el-tooltip>
        </template>
        <template>
          <ht-table-column type="index" width="50" align="center" label="序号" />
          <ht-table-column
            prop="fileName"
            label="名称"
            :show-overflow-tooltip="true"
          />
          <ht-table-column
            prop="createTime"
            label="创建时间"
            :show-overflow-tooltip="true"
          />
          <ht-table-column prop="isMain" width="80" label="主版本">
            <template v-slot="{ row }">
              <el-tag v-if="row.isMain == 'Y'">是</el-tag>
              <el-tag type="danger" v-else>否</el-tag>
            </template>
          </ht-table-column>
          <ht-table-column prop="printType" width="120" label="打印类型">
            <template v-slot="{ row }">
              <el-tag v-if="row.printType == 'word'" type="success">word套打</el-tag>
              <el-tag v-if="row.printType == 'form'" type="warning">表单模板</el-tag>
            </template>
          </ht-table-column>
          <ht-table-column width="200" label="操作" align="center">
            <template v-slot="{ row }">
              <el-button icon="el-icon-printer" v-if="row.printType == 'word'" size="mini" @click="openWordPrint(row)">打印</el-button>
              <el-button icon="el-icon-view" v-if="row.printType == 'word'" size="mini" @click="WordPreview(row)">预览</el-button>
              <el-button icon="el-icon-document" v-if="row.printType == 'form'" size="mini" @click="openPreview(row)">打印预览</el-button>
            </template>
          </ht-table-column>
        </template>
      </ht-table>
      <el-dialog
        class="form-print-dialog"
        fullscreen
        destroy-on-close
        :visible="formEditorDialogVisible"
        v-if="formEditorDialogVisible"
        :before-close="handleCloseFormEditor"
        :show-close="false"
        :close-on-press-escape="false"
        :append-to-body="true"
      >
        <div class="navbar-default box-shadow flex notprint">
          <el-page-header @back="goBack" content="打印预览"></el-page-header>
          <span>
              <el-button icon="el-icon-printer" type="primary" @click="flowPrint()">打印</el-button>
          </span>
        </div>
        <div id="printFlow">
          <DoneFormContent ref="doneFormContent" :instId="instId" :formId="formId" isFlowPrint ="true"/>
          <!-- <ProcessRecord :instId="instId"/> -->
        </div>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script>
import req from "@/request.js";
import utils from "@/utils.js";
import DoneFormContent from "@/components/flow/doneFormContent.vue";
import ProcessRecord from "@/components/flow/processRecord.vue";
import watermark from "@/watermark.js";
import flow from "@/api/flow.js";
export default {
  name: "flowPrint",
  props: ["formKey","instId"],
  components: {
    DoneFormContent,
    ProcessRecord,
  },
  data() {
    return {
      dialogFlowVisible:false,
      fullscreenLoading: false,
      formEditorDialogVisible: false,
      data: [],
      formId:"",
      pageResult: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      watermarkSetting: null
    };
  },
  mounted(){
  },
  watch:{
    // instId: {
    //   handler(newVal, oldVal){
    //     if (newVal !== oldVal){
    //       if (newVal){
    //         flow.getWatermarkByInstId(newVal).then(data => {
    //           this.watermarkSetting = data;
    //         })
    //       }
    //     }
    //   },
    //   deep: true
    // }
  },
  methods: {
    WordPreview(row){
      this.dialogFlowVisible = false;
      this.$emit("previewWordTemplate", row);
    },
    loadData(param, cb) {
      req.post("${form}/form/printTemplate/v1/getPrintList", param)
        .then(response => {
          this.data = response.data.rows;
          this.pageResult = {
            page: response.data.page,
            pageSize: response.data.pageSize,
            total: response.data.total
          };
        })
        .finally(() => cb());
    },
    handleOpen(done) {
      this.dialogFlowVisible = true;
      flow.getWatermarkByInstId(this.instId).then(data => {
        this.watermarkSetting = data;
        console.log("this.watermarkSetting：", this.watermarkSetting);
      })
    },
    //word套打（默认主版本）
    defaultWordPrint(){
      let this_ = this;
      let printType = "word";
      req.get("${form}/form/printTemplate/v1/getMainTemlate?formKey=" + this.formKey + "&printType=" + printType).then(response => {
        if(response.data){
          this.dialogFlowVisible = false;
        this.$emit("printWordTemplate", response.data);
        }else{
          this.$message({ message: "未添加word套打模板，请添加模板后在进行操作", type: "warning" });
        }
      });
    },
    //表单打印预览（默认主版本）
    defaultFormPreview(){
      let this_ = this;
      let printType = "form";
      req.get("${form}/form/printTemplate/v1/getMainTemlate?formKey=" + this.formKey + "&printType=" + printType).then(response => {
        if(response.data){
          let printTemplate = response.data;
          this.formId = printTemplate.formId;
          this.formEditorDialogVisible = true;
          this.$nextTick(() => {
            this.$refs.doneFormContent.hiddenContent();
          });
        }else{
          this.$message({ message: "未添加表单打印模板，请表单打印模板后在进行操作", type: "warning" });
        }
      });
    },
    checkDefalut(){
      this.dialogFlowVisible = false;
      this.$emit("printHtml", "");
    },
    openWordPrint(row) {
      this.dialogFlowVisible = false;
      this.$emit("printWordTemplate", row);
    },
    openPreview(row){
      this.formId = row.formId;
      this.formEditorDialogVisible = true;
      this.$nextTick(() => {
        this.$refs.doneFormContent.hiddenContent();
      });
    },
    handleCloseFormEditor() {
      this.formId = "";
      this.formEditorDialogVisible = false;
    },
    goBack(){
      this.formId = "";
      this.formEditorDialogVisible = false;
    },
    flowPrint(){
      this.formEditorDialogVisible = false;
      this.dialogFlowVisible = false;
       var test = Print("#printFlow", {
          "no-print": "top-btns-col no-print"
        });
        var printData = test.dom.innerHTML;
        window.document.body.innerHTML = printData;
        if (this.watermarkSetting){
          watermark.watermark({"watermark_txt":this.watermarkSetting.content,"watermark_color": this.watermarkSetting.color,"watermark_type": this.watermarkSetting.type});
        }
        setTimeout(() => {
          document.getElementsByTagName('body')[0].style.zoom=0.8;
          window.print();
          utils.reload();
          document.getElementsByTagName('body')[0].style.zoom=1;
        },500);
    }
  },
  created() {

  }
};
</script>

<style lang="scss" scoped>
@media print
{
	.notprint { display:none }
}
#printFlow {
  width: 100%;
  height : auto;
}

.form-print-dialog /deep/ .el-dialog > .el-dialog__header {
  display: none;
}

.form-print-dialog /deep/ .el-dialog > .el-dialog__body {
  padding-top: 10px;
}

.navbar-default {
  height: 100%;
  background-image: none;
  background: #fff;
  border-radius: 0px;
  box-shadow: 0px 2px 5px rgba(86, 96, 117, 0.15);
  border-bottom: 1px solid #ededed;
  justify-content: space-between;
  padding: 0 10px;
}

.navbar-default span {
  color: #666;
  font-size: 14px;
  line-height: 48px;
  font-weight: bold;
  margin-left: 20px;
}

.navbar-default button {
  margin-right: 10px;
}
</style>
