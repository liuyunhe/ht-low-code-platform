<template>
  <el-dialog
    class="form-editor-dialog"
    fullscreen
    destroy-on-close
    :close-on-click-modal="false"
    :visible.sync="dialogVisible"
  >
    <el-container class="fullheight">
      <el-header class="header" style="height: 45px;">
        <div class="navbar-default box-shadow flex">
          <el-page-header @back="close">
            <template v-slot:content>门户首页设计器</template>
          </el-page-header>
          <div>
            <ht-submit-button
              request-method="POST"
              url="${portal}/portal/sysIndexLayoutManage/sysIndexLayoutManage/v1/saveLayout"
              :model="layoutObj"
              scope-name="editForm"
              :is-submit="isSubmit"
              @before-save-data="beforeSaveData"
              @after-save-data="afterSaveData"
            >{{$t('eip.common.save')}}</ht-submit-button>
            <!-- <el-button type="default" @click="handleUpload">导入json</el-button>
          <el-button type="default" @click="handleClear">清除</el-button>
          <el-button type="default" @click="handlePreview">预览</el-button>
          <el-button  type="default"  @click="handleGenerateJson">生成json</el-button>
            <el-button  type="default" @click="handleGenerateCode">生成代码</el-button>-->
            <!-- <el-button type="danger" @click="close">关闭</el-button> -->
          </div>
        </div>
      </el-header>
      <el-container>
        <el-aside class="controler-container" width="300px">
          <ColumnPanel :columnMap="columnMap" />
        </el-aside>
        <el-main class="widget-form-container">
          <DesignPanel ref="widgetForm" :data="widgetForm" :select.sync="widgetFormSelect" />
        </el-main>
        <el-aside width="300px" class="property-container">
          <LayoutConfigPanel
            :data="widgetFormSelect"
            :layoutObj.sync="layoutObj"
            style="heigth:100%"
          />
        </el-aside>
      </el-container>
    </el-container>
  </el-dialog>
</template>
<script>
import ColumnPanel from "@/components/portal/ColumnPanel.vue";
import LayoutConfigPanel from "@/components/portal/LayoutConfigPanel.vue";
import DesignPanel from "@/components/portal/DesignPanel.vue";
import portal from "@/api/portal.js";
let Base64 = require("js-base64").Base64;
export default {
  components: { ColumnPanel, DesignPanel, LayoutConfigPanel },
  data() {
    return {
      dialogVisible: false,
      widgetForm: {
        list: [],
        config: {
          labelWidth: 100,
          labelPosition: "right",
          size: "small"
        }
      },
      widgetFormSelect: null,
      isSubmit: true,
      columnMap: {},
      layoutObj: {}
    };
  },
  methods: {
    showDialog(layoutId,layoutType,orgId){
       this.dialogVisible = true;
      this.widgetForm = { list: [],
        config: {
          labelWidth: 100,
          labelPosition: "right",
          size: "small"
        }}
       this.loadData(layoutId,layoutType,orgId);
    },
    loadData(layoutId,layoutType,orgId) {
      portal.getLayoutManageDesignData(layoutId, layoutType)
        .then(response => {
          this.columnMap = response.columnMap;
          if (!response.sysIndexLayout) {
            //如果为空，说明现在新建
            this.layoutObj= {};
            this.layoutObj.orgId = orgId;
            this.layoutObj.layoutType = layoutType;
          } else {
            this.layoutObj = response.sysIndexLayout;
            let json = JSON.parse(Base64.decode(this.layoutObj.designHtml));
            this.widgetForm = json;
            if (json.list.length > 0) {
              this.widgetFormSelect = json.list[0];
            }
          }
        });
    },
    handleGenerateJson() {
      this.jsonTemplate = this.widgetForm;
      this.$message(JSON.stringify(this.widgetForm));
      console.log(JSON.stringify(this.widgetForm));
    },
    beforeSaveData() {
      //{"designHtml":"","isDef":0,"layoutType":0,"templateHtml":"","orgId":"31766","name":"d","memo":"d"}
      this.layoutObj.designHtml = Base64.encode(
        JSON.stringify(this.widgetForm)
      );
    },
    afterSaveData() {
      this.close();
      this.$emit("close", null);
    },
    close(){
      this.dialogVisible = false;
    }
  }
};
</script>
<style scoped>
.navbar-default {
  height: 100%;
  background-image: none;
  background: #fff;
  border-radius: 0px;
  box-shadow: 0px 2px 5px rgba(86, 96, 117, 0.15);
  border-bottom: 1px solid #ededed;
  justify-content: space-between;
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
.header {
  padding: 0;
  background: #fff;
  z-index: 7;
}

.controler-container {
  margin-right: 3px;
  box-shadow: 2px 0 5px #ededed;
}

.property-container {
  margin-left: 3px;
  box-shadow: -2px 0 5px #ededed;
}

.widget-form-container {
  background: #fafafa;
  position: relative;
  padding: 0 5px;
  margin-top: 1px;
}

.footer-container {
  border-top: 1px solid #ededed;
}
.form-editor-dialog >>> .el-dialog__header {
  display: none;
}

.form-editor-dialog >>> .el-dialog__body {
  padding: 0;
  height: 100%;
}
</style>
