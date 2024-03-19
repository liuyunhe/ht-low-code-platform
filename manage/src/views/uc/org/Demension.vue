<template>
  <div class="fullheight">
    <ht-table
        @load="loadData"
        :data="data"
        :pageResult="pageResult"
        :selection="true"
        quick-search-props="demName"
        ref="htTable"
        :show-custom-column="false"
        :show-export="false"
        @row-click="rowClick"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="showDialog()" icon="el-icon-plus">添加</el-button>
          <ht-delete-button
              :url="demDeleteUrl"
              :htTable="$refs.htTable"
              @after-delete="afterDelete"
              style="margin:0;"
          >删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column
            prop="demName"
            label="名称"
            :sortable="true"
            :show-overflow-tooltip="true"
        >
          <template v-slot="{row,column,$index}">
            <el-link type="primary"  @click="handleCommand({row:row,command:'assignMenu'})" title="点击编辑" >{{row.demName}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column prop="demCode" label="别名"  />
        <ht-table-column
            prop="isDefault"
            label="是否默认"
            width="100"
            :filters="[{text:'否', value:0},{text:'是', value:1}]"
        >
          <template v-slot="{row}">
            <el-tag type="danger" v-if="row.isDefault=='0'">否</el-tag>
            <el-tag type="success" v-if="row.isDefault=='1'">是</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column label="操作" width="150">
          <template v-slot="{row}">
            <el-button size='mini' v-if="row.isDefault!='1'"  @click="handleCommand({row:row,command:'setDemDefault'})" >
              设置为默认
            </el-button>
          </template>
        </ht-table-column>

      </template>
    </ht-table>

    <ht-sidebar-dialog
        width="28%"
        :title="dialogTitle"
        :visible="dialogVisible"
        :before-close="handleClose"
        :append-to-body="true"
    >
      <el-form v-model="demension" data-vv-scope="editForm">
        <ht-form-item label="维度名称" prop="name" label-width="100px">
          <ht-input
              v-model="demension.name"
              autocomplete="off"
              :validate="{required:true,regex: {
                        exp: '^[\\s\\S]{1,21}$',
                        message: '内容超出输入限制'
                      }}"
              placeholder="请输入名称"
              :disabled="readOnly"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="维度别名" prop="code" label-width="100px">
          <ht-input
              v-model="demension.code"
              v-pinyin="demension.name"
              autocomplete="off"
              :validate="{required:true,alpha_dash:true,regex: {
                        exp: '^[\\s\\S]{1,30}$',
                        message: '内容超出输入限制'
                      }}"
              placeholder="请输入别名"
              :disabled="demension.id?true:false || readOnly"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="描述" label-width="100px">
          <ht-input type="textarea"
                    :validate="{
                    regex: {
                        exp: '^[\\s\\S]{0,80}$',
                        message: '内容超出输入限制'
                      }
                    }"
                    v-model="demension.description" :disabled="readOnly" placeholder="请输入描述" />
        </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" v-if="!readOnly">
        <ht-submit-button
            :url="saveRoleUrl"
            :model="demension"
            :isSubmit="isSubmit"
            :requestMethod="requestMethod"
            scopeName="editForm"
            @before-save-data="beforeSaveData"
            @after-save-data="afterSaveData"
        >{{$t('eip.common.save')}}</ht-submit-button>
        <el-button @click="dialogCancle('dialogVisible')">{{$t('eip.common.cancel')}}</el-button>
      </div>
    </ht-sidebar-dialog>

  </div>
</template>
<script>
  import org from "@/api/org.js";
  import EipUserDialog from "@/components/dialog/EipUserDialog.vue";


  export default {
    components: {
      EipUserDialog
    },
    computed: {
      demDeleteUrl: function() {
        return window.context.uc + "/api/demension/v1/dem/deleteDemByIds";
      },
      saveRoleUrl: function() {
        let preUrl = window.context.uc + "/api/demension/v1/dem";
        if (this.demension.id) {
          preUrl += "/updateDem";
        } else {
          preUrl += "/addDem";
        }
        return preUrl;
      },
      requestMethod: function() {
        return this.demension.id ? "PUT" : "POST";
      }
    },
    data() {
      return {
        dialogVisible: false,
        dialogVisibleMenuPerm: false,
        demension: {
          name:"",
          code:""
        },
        isSubmit: false,
        data: [],
        pageResult: {
          page: 1,
          pageSize: 50,
          total: 0
        },
        loadDataUrl: "",
        menuPerm: {},
        allowRoles: [],
        readOnly: false,
        dialogTitle:''
      };
    },
    mounted() {
      this.$validator = this.$root.$validator;
    },
    methods: {
      rowClick(row, column, event){
        this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
      },
      setDemDefault(row){
        org.setDemDefault(row.code).then(() => {
          this.$refs.htTable.load();
        })
      },
      handleClose() {
        this.dialogVisible = false;
        this.loadDataUrl = "";
      },
      handleCloseMenuPerm() {
        this.dialogVisibleMenuPerm = false;
      },
      showDialog(row) {
        this.dialogVisible = true;
        if (row) {
          this.dialogTitle = '编辑维度';
          row.description = row.demDesc;
          this.demension = JSON.parse(JSON.stringify(row));
        } else {
          this.dialogTitle = '添加维度';
          this.demension = {name:"",code:"",description:''};
        }
      },
      dialogCancle(dialogVisible) {
        this[dialogVisible] = false;
      },
      loadData(param, cb) {
        org.getDemListAll(param)
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
        this.readOnly = false
        switch (params.command) {
          case "showInfo":
            this.readOnly = true
            this.showDialog(params.row)
            break;
          case "assignMenu":
            this.showDialog(params.row)
            break;
          case "setDemDefault":
            this.setDemDefault(params.row)
            break;
          default:
            break;
        }
      },
      async beforeSaveData() {
        this.isSubmit = true;
      },
      afterSaveData() {
        this.dialogVisible = false;
        this.$refs.htTable.load();
      },
      afterDelete() {
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
