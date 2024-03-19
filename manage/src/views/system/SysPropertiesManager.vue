<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      quick-search-props="name,alias,description"
      :default-sorter="[{direction: 'DESC',property: 'createTime'}]"
      :show-export="false"
      :show-custom-column="false"
      ref="htTable"
      @row-click="rowClick"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="showDialog()" icon="el-icon-plus">添加</el-button>
          <ht-delete-button url="${portal}/sys/sysProperties/v1/remove" :htTable="$refs.htTable" style="margin:0;">删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="name" label="属性名称" :sortable="true" :show-overflow-tooltip="true">
          <template v-slot="{row}">
            <el-link type="primary" @click="showDialog(row)" title="编辑详情">{{row.name}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column width="150" prop="alias" label="属性代码" :sortable="true" :show-overflow-tooltip="true" />
        <ht-table-column
          prop="encrypt"
          label="存储方式"
          width="120"
          :filters="[{text:'加密存储', value:1},{text:'明文存储', value:0}]"
        >
          <template v-slot="{row}">
            <el-tag type="info" v-if="row.encrypt=='0'">明文存储</el-tag>
            <el-tag type="warning" v-if="row.encrypt=='1'">加密存储</el-tag>
          </template>
        </ht-table-column>
      </template>
      <ht-table-column prop="description" label="属性说明" :show-overflow-tooltip="true" />
    </ht-table>
    <ht-sidebar-dialog
      width="28%"
      title="系统属性编辑"
      class="sp-manager__dialog"
      :visible="dialogVisible"
      v-if="dialogVisible"
      :before-close="beforeCloseDialog"
    >
      <el-form v-form data-vv-scope="propertyForm">
        <ht-form-item label="属性名称">
          <ht-input v-model="currentProperty.name" validate="required"
                    :maxlength="50"
                    :showWordLimit="true" />
        </ht-form-item>
        <ht-form-item label="属性代码">
          <ht-input v-model="currentProperty.alias" validate="required"
                    :maxlength="50"
                    :showWordLimit="true" />
        </ht-form-item>
        <ht-form-item label="属性值">
          <ht-input type="textarea" :rows="5" v-model="currentProperty.value" validate="required" />
        </ht-form-item>
        <ht-form-item label="存储方式">
          <ht-radio
            v-model="currentProperty.encrypt"
            :options="[{ key: 0, value: '明文存储' },{ key: 1, value: '加密存储' }]"
          />
        </ht-form-item>
        <ht-form-item label="属性说明">
          <ht-input type="textarea" v-model="currentProperty.description" :rows="5"
                    :maxlength="200"
                    :showWordLimit="true" />
        </ht-form-item>
      </el-form>
      <div slot="footer" style="text-align: center">
        <ht-submit-button
          :url="saveUrl"
          :model="currentProperty"
          scope-name="propertyForm"
          @after-save-data="afterSaveData"
        >{{$t("eip.common.save")}}</ht-submit-button>
        <el-button @click="beforeCloseDialog">{{$t("eip.common.cancel")}}</el-button>
      </div>
    </ht-sidebar-dialog>
  </div>
</template>
<script>
import portal from "@/api/portal.js";

export default {
  data() {
    return {
      dialogVisible: false,
      data: [],
      saveUrl: `${window.context.portal}/sys/sysProperties/v1/save`,
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      currentProperty: { encrypt: 1 }
    };
  },
  mounted() {
    this.$validator = this.$root.$validator;
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    showDialog(row) {
      if( row && row.alias == "sysSetting"){
        this.$message.warning("请前往系统设置查看详情");
        return;
      }
      if (row && row.id) {
        portal.getSysProperty(row.id).then(response => {
          this.currentProperty = response;
          this.dialogVisible = true;
        });
      } else {
        this.dialogVisible = true;
      }
    },
    beforeCloseDialog() {
      this.currentProperty = { encrypt: 1 };
      this.dialogVisible = false;
    },
    loadData(param, cb) {
      portal
        .getSysProperties(param)
        .then(response => {
          this.data = response.rows;
          this.pageResult = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total
          };
        })
        .finally(() => cb());
    },
    afterSaveData() {
      setTimeout(() => {
        this.beforeCloseDialog();
        this.$refs.htTable.load();
      }, 500);
    }
  }
};
</script>
<style lang="scss" scoped>
.sp-manager__dialog /deep/ > .el-dialog > .el-dialog__body {
  height: calc(100% - 170px);
}
</style>
