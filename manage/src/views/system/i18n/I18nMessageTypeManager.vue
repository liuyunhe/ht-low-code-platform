<template>
  <el-container class="fullheight">
    <el-container>
      <el-main>
        <ht-table
          ref="i18nMessageTypeTable"
          @load="loadData"
          :data="data"
          :pageResult="pageResult"
          :selection="true"
          quick-search-props="type,desc"
          :show-export="false"
          @row-click="rowClick"
        >
          <template v-slot:toolbar>
            <el-button size="small" icon="el-icon-plus" @click="showDialog()">添加</el-button>
            <ht-delete-button
              size="small"
              :url="i18nMessageTypeDeleteUrl"
              :htTable="$refs.i18nMessageTypeTable"
              style="margin:0;"
            >删除</ht-delete-button>
          </template>
          <template>
            <ht-table-column type="index" width="50" align="center" label="序号" />
            <ht-table-column prop="type" label="类型" :sortable="true" :show-overflow-tooltip="true">
            <template v-slot="{row}">
                <el-link
                   @click="showDialog(row.id)"
                  type="primary"
                >{{row.type}}</el-link>
              </template>
            </ht-table-column>
            <ht-table-column prop="desc" label="说明" :sortable="true" :show-overflow-tooltip="true" />
            <!-- <ht-table-column width="150" label="操作">
              <template v-slot="{row}">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showDialog(row.id)"
                >编辑</el-button>
              </template>
            </ht-table-column> -->
          </template>
        </ht-table>

        <ht-sidebar-dialog
          width="30%"
          :title="i18nMessageTypeTitle"
          :visible="dialogVisible"
          :before-close="handleClose"
        >
          <el-form v-model="i18nMessageType" data-vv-scope="editi18nMessageTypeForm">
            <ht-form-item
              label="类型"
              prop="type"
              label-width="120px"
              class="i18nMessageType-input-width"
            >
              <ht-input
                v-model="i18nMessageType.type"
                autocomplete="off"
                :validate="{required:true,regex:{exp:'^[a-zA-Z][a-zA-Z0-9_-]+$',message:'类型必须由数字、字母或者下划线组成，并且以字母开头。'}}"
                placeholder="请输入类型"
                @blur="isType()"
                :maxlength="30"
                :showWordLimit="true"
              ></ht-input>
            </ht-form-item>
            <ht-form-item
              label="说明"
              prop="desc"
              label-width="120px"
              class="i18nMessageType-input-width"
            >
              <ht-input
                v-model="i18nMessageType.desc"
                autocomplete="off"
                type="textarea"
                :validate="{required:false}"
                placeholder="请输入说明"
                :maxlength="200"
                :showWordLimit="true"
              ></ht-input>
            </ht-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <ht-submit-button
              :url="savei18nMessageTypeUrl()"
              :model="i18nMessageType"
              :is-submit="isSubmit"
              request-method="POST"
              scope-name="editi18nMessageTypeForm"
              @before-save-data="beforeSaveData"
              @after-save-data="afterSaveData"
            >{{$t('eip.common.save')}}</ht-submit-button>
            <el-button @click="dialogCancle('dialogVisible')">{{$t('eip.common.cancel')}}</el-button>
          </div>
        </ht-sidebar-dialog>
        <!-- 加载数据 用作编辑数据源和查看数据源-->
        <ht-load-data :url="loadDataUrl" context="portal" @after-load-data="afterLoadData"></ht-load-data>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
import sys from "@/api/portal.js";
export default {
  name: "i18n-i18nMessageType",
  components: {},
  data() {
    return {
      i18nMessageType: {},
      i18nMessageTypeTitle: "",
      loadDataUrl: "",
      dialogVisible: false,
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      isSubmit: true
    };
  },
  computed: {
    i18nMessageTypeDeleteUrl: function() {
      return window.context.portal + "/i18n/custom/i18nMessageType/v1/remove";
    }
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.i18nMessageTypeTable.$refs.htTable.toggleRowSelection(row);
    },
    isType() {
      if (this.i18nMessageType.id || !this.i18nMessageType.type) return;
      sys.getI18nMessageTypeByType(this.i18nMessageType.type).then(rep => {
        if (rep && rep.type == this.i18nMessageType.type) {
          this.$message.error("类型已存在");
          this.i18nMessageType.type = "";
        }
      });
    },
    beforeSaveData() {
      let pattern = /^[a-zA-Z][a-zA-Z0-9_-]+$/;

      if (!pattern.test(this.i18nMessageType.type)) {
        this.$message({ message: "类型必须由数字、字母或者下划线组成，并且以字母开头", type: "warning" });
        this.isSubmit = false;
        return true;
      }

      this.isSubmit = true;

    },
    savei18nMessageTypeUrl: function() {
      return window.context.portal + "/i18n/custom/i18nMessageType/v1/save";
    },
    afterSaveData() {
      this.dialogVisible = false;
      this.$refs.i18nMessageTypeTable.load();
    },
    afterLoadData(data) {
      this.i18nMessageType = data;
      // 编辑数据源
      if (this.dialogVisible) {
        setTimeout(() =>
          this.$validator.validateAll("editi18nMessageTypeForm")
        );
      }
    },
    dialogCancle(dialogVisible) {
      this.loadDataUrl = "";
      this[dialogVisible] = false;
    },
    handleClose() {
      this.loadDataUrl = "";
      this.dialogVisible = false;
    },
    showDialog(id) {
      this.i18nMessageType = {};
      this.dialogVisible = true;
      if (id) {
        this.loadDataUrl = "/i18n/custom/i18nMessageType/v1/getJson?id=" + id;
        this.i18nMessageTypeTitle = "编辑国际化资源支持的语言类型";
      } else {
        this.i18nMessageTypeTitle = "添加国际化资源支持的语言类型";
      }
    },
    handleNodeClick(node) {},
    loadData(param, cb) {
      sys
        .getI18nMessageTypePageJson(param)
        .then(response => {
          this.data = response.rows;
          this.pageResult = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total
          };
        })
        .finally(() => cb());
    }
  }
};
</script>

<style scoped>
.el-main {
  padding: 0px;
}
ul {
  padding: 0px;
  margin: 0px;
}
li {
  list-style-type: none;
}
.i18nMessageType-input-width .inputs {
  width: 100%;
}
</style>
