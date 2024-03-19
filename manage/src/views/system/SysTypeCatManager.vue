<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      :show-export="false"
      quick-search-props="name"
      :default-sorter="[{direction: 'DESC',property: 'updateTime'}]"
      ref="htTable"
      @row-click="rowClick"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="showDialog()" icon="el-icon-plus">添加</el-button>
          <ht-delete-button url="${portal}/sys/category/v1/remove" :htTable="$refs.htTable" style="margin:0;">删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="id" label="主键" hidden />
        <ht-table-column prop="name" label="分类名称" :sortable="true" />
        <ht-table-column
          prop="groupKey"
          label="分类组业务主键"
          :sortable="true"
          :show-overflow-tooltip="true"
        />
        <!-- <ht-table-column prop="type" label="类型">
          <template v-slot="{row}">
            <el-tag v-if="row.type==1">树形结构</el-tag>
            <el-tag type="danger" v-else>平铺结构</el-tag>
          </template>
        </ht-table-column> -->
        <ht-table-column width="150" label="操作">
          <template v-slot="{row}">
            <el-button icon="el-icon-edit" @click="handleCommand({row:row,command:'edit'})">编辑</el-button>
          </template>
        </ht-table-column>
      </template>
    </ht-table>

    <ht-sidebar-dialog
      width="28%"
      :title="(model.id? '编辑':'添加')+'分类标识'"
      :visible="dialogVisible"
      :before-close="handleClose"
    >
      <el-form v-model="model" data-vv-scope="editModelForm" >
        <ht-form-item label="分类名称" label-width="120px">
          <ht-input
            v-model="model.name"
            autocomplete="off"
            :validate="{required:true}"
            placeholder="请输入分类名称"
            :maxlength="50"
            :showWordLimit="true"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="分类业务主键" label-width="120px">
          <ht-input
            v-model="model.groupKey"
            v-pinyin="model.name"
            autocomplete="off"
            :disabled="model.id? true:false"
            :validate="{required:true,alpha_dash:true}"
            placeholder="请输入分类业务主键"
            :maxlength="50"
            :showWordLimit="true"
          ></ht-input>
        </ht-form-item>
        <!-- <ht-form-item label="类型">
          <ht-radio
            v-model="model.type"
            :options="[{ key: 0, value: '平铺结构'}, { key: 1, value: '树形结构'}]"
          />
        </ht-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
          url="/sys/category/v1/save"
          context="portal"
          :model="model"
          scope-name="editModelForm"
          @after-save-data="afterSaveData"
        >{{$t('eip.common.save')}}</ht-submit-button>
        <el-button @click="handleClose()">{{$t('eip.common.cancel')}}</el-button>
      </div>
    </ht-sidebar-dialog>
  </div>
</template>
<script>
import portalApi from "@/api/portal.js";

export default {
  components: {},
  computed: {},
  data() {
    return {
      dialogVisible: false,
      model: {
        name: "",
        groupKey: "",
        type: 1
      },
      data: [],
      pageResult: {
        page: 1,
        pageSize: 20,
        total: 0
      }
    };
  },
  mounted() {
    this.$validator = this.$root.$validator;
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    handleClose() {
      this.dialogVisible = false;
    },
    showDialog(row) {
      this.dialogVisible = true;
      if (row) {
        this.model = row;
        this.model.updateTime = "";
        this.model.createTime = "";
        setTimeout(() => this.$validator.validateAll());
      } else {
        this.model = { id: "", name: "", type: 0, groupKey: "" };
      }
    },
    loadData(param, cb) {
      portalApi
        .getSysCatByPage(param)
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
    handleCommand(params) {
      switch (params.command) {
        case "edit":
          this.showDialog(params.row);
          break;
        default:
          break;
      }
    },
    afterSaveData() {
      this.dialogVisible = false;
      this.$refs.htTable.load();
    }
  }
};
</script>
<style scoped>
div[aria-invalid="true"] >>> .el-input__inner,
div[aria-invalid="true"] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
</style>
