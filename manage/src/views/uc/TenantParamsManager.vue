<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      @row-click="rowClick"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      :default-querys="[{property:'TYPE_',value: '3'}]"
      :quick-search-props="[{prop:'up.name_',label:'名称'}]"
      :show-export="false"
      :show-custom-column="false"
      ref="htTable"
    >
      <template v-slot:toolbar>
        <el-button size="small" @click="showDialog()" icon="el-icon-plus">添加</el-button>
        <ht-delete-button
          :url="demDeleteUrl"
          :htTable="$refs.htTable"
          @after-delete="afterDelete"
          style="margin:0;"
        >删除</ht-delete-button>
      </template>
      <template>
        <ht-table-column type="index" width="55" align="center" label="序号" />
        <ht-table-column prop="name" label="名称" :sortable="true" :show-overflow-tooltip="true">
          <template v-slot="{row}">
            <el-link
              type="primary"
              @click="handleCommand({row:row,command:'assignMenu'})"
              title="点击编辑"
            >{{row.name}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column prop="code" label="编码" :sortable="true" :show-overflow-tooltip="true" />
        <ht-table-column prop="ctlType" label="控件类型" width="150">
          <template v-slot="{row}">
            <el-tag type="info" v-if="row.ctlType=='date'">日期</el-tag>
            <el-tag type="info" v-if="row.ctlType=='input'">手动输入</el-tag>
            <el-tag type="info" v-if="row.ctlType=='checkbox'">复选框</el-tag>
            <el-tag type="info" v-if="row.ctlType=='radio'">单选按钮</el-tag>
            <el-tag type="info" v-if="row.ctlType=='number'">数字</el-tag>
            <el-tag type="info" v-if="row.ctlType=='select'">下拉框</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column prop="typeName" label="租户类型" :sortable="true" :show-overflow-tooltip="true">
        </ht-table-column>
      </template>
    </ht-table>

    <el-dialog width="50%" title="添加参数" :visible="dialogVisible" :before-close="handleClose">
      <el-form v-model="ProParam"  data-vv-scope="tenantParamForm">
        <ht-form-item label="租户类型" prop="tenantTypeId" label-width="100px">
          <ht-select
              :multiple="multiple"
              class="ht"
              v-model="ProParam.tenantTypeId"
              :options="tenantTypeList"
              :props="{ key: 'id', value: 'name' }"
              validate="required"
            />
        </ht-form-item>
        <ht-form-item label="参数名称" prop="name" label-width="100px">
          <ht-input
            v-model="ProParam.name"
            autocomplete="off"
            :validate="{required:true,
            regex: {
                exp: '^[\\s\\S]{1,21}$',
                message: '内容超出输入限制'
              }}"
            placeholder="请输入名称"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="参数编码" prop="code" label-width="100px">
          <ht-input
            v-model="ProParam.code"
            v-pinyin="ProParam.name"
            autocomplete="off"
            :validate="{required:true,alpha_num:true,
            regex: {
                exp: '^[\\s\\S]{1,50}$',
                message: '内容超出输入限制'
              }}"
            placeholder="请输入别名"
            :disabled="ProParam.id?true:false"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="控件类型" prop="ctlType" label-width="100px">
          <ht-select
            v-model="ProParam.ctlType"
            class="m-r"
            :options="ctlTypeOptions"
            @change="ctlTypeChecked"
            :disabled="ProParam.id?true:false || readOnly"
          />
        </ht-form-item>
        <ht-form-item label="自定义选项" prop="ctlType" label-width="100px" v-if="isCusOprionsShow">
          <el-button size="small" type="text" icon="el-icon-plus" @click="ProParam.json.push({})">添加</el-button>
          <table class="form-table" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr class="sub-table-header">
                <th width="150">选项</th>
                <th width="150">值</th>
                <th width="200">操作</th>
              </tr>
              <tr
                v-for="(item, index) in ProParam.json"
                :key="index"
                :data-index="index"
                data-subname="ProParam.json"
              >
                <td width="150">
                  <ht-input v-model="item.value" :validate="{required:true}" />
                </td>
                <td width="150">
                  <ht-input v-model="item.key" :validate="{required:true}" />
                </td>
                <td class="trash">
                  <el-button size="small" type="text" @click="ProParam.json.remove(item)">删除</el-button>
                  <el-button size="small" type="text" @click="move(ProParam.json, item, 'up')">上移</el-button>
                  <el-button size="small" type="text" @click="move(ProParam.json, item, 'down')">下移</el-button>
                </td>
              </tr>
            </tbody>
          </table>
        </ht-form-item>
      </el-form>
      <div slot="footer">
        <ht-submit-button
          :url="saveRoleUrl"
          :model="ProParam"
          :isSubmit="isSubmit"
          :requestMethod="requestMethod"
          scopeName="tenantParamForm"
          @before-save-data="beforeSaveData"
          @after-save-data="afterSaveData"
        >{{$t('eip.common.save')}}</ht-submit-button>
        <el-button @click="dialogCancle('dialogVisible')">{{$t('eip.common.cancel')}}</el-button>
      </div>
    </el-dialog>

    <ht-load-data :url="loadDataUrl" context="uc" @after-load-data="afterLoadData"></ht-load-data>
  </div>
</template>
<script>
import org from "@/api/org.js";
import EipUserDialog from "@/components/dialog/EipUserDialog.vue";
import utils from "@/hotent-ui-util.js";
export default {
  components: {
    EipUserDialog
  },
  computed: {
    demDeleteUrl: function() {
      return window.context.uc + "/api/params/v1/param/deleteParamsByIds";
    },
    saveRoleUrl: function() {
      let preUrl = window.context.uc + "/api/params/v1/param";
      if (this.ProParam.id) {
        preUrl += "/updateParams";
      } else {
        this.ProParam.ctrType = this.ProParam.ctlType;
        preUrl += "/addParams";
      }
      return preUrl;
    },
    requestMethod: function() {
      return this.ProParam.id ? "PUT" : "POST";
    }
  },
  data() {
    return {
      multiple:true,
      dialogVisible: false,
      dialogVisibleMenuPerm: false,
      isCusOprionsShow: false, //自定义选项是否展示
      ProParam: {
        tenantTypeId:"",
        id: "",
        name: "",
        code: "",
        ctlType: "",
        ctrType: "",
        json: [],
        type: "1"
      },
      isSubmit: true,
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
      ctlTypeOptions: [
        { key: "input", value: "手动输入" },
        { key: "select", value: "下拉框" },
        { key: "checkbox", value: "复选框" },
        { key: "radio", value: "单选按钮" },
        { key: "date", value: "日期" },
        { key: "number", value: "数字" }
      ],
      showInfo: false,
      tenantTypeList: [],
    };
  },
  mounted() {
    this.$validator = this.$root.$validator;
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    setDemDefault(row) {
      org.setDemDefault(row.code).then(() => {
        this.$refs.htTable.load();
      });
    },
    handleClose() {
      this.dialogVisible = false;
      this.showInfo = false;
      this.isCusOprionsShow = false;
      this.loadDataUrl = "";
    },
    handleCloseMenuPerm() {
      this.dialogVisibleMenuPerm = false;
    },
    showDialog(row) {
      this.loadDataUrl = "";
      this.dialogVisible = true;
      this.multiple = true;
      this.readOnly = false;
      if (row) {
        this.multiple = false;
        this.loadDataUrl = `/api/params/v1/param/getParams?code=${row.code}&tenantTypeId=${row.tenantTypeId}`;
      } else {
        this.ProParam = {
          tenantTypeId:"",
          id: "",
          name: "",
          code: "",
          ctlType: "",
          json: [],
          type: "3"
        };
      }
      this.getTenantTypeList();
    },
    getTenantTypeList(){
        let that = this;
        this.$http.get("${uc}/uc/tenantType/v1/getAll?status=enable").then(resp => {
              that.tenantTypeList = resp.data;
          }, error => {
              reject(error);
          })
    },
    dialogCancle(dialogVisible) {
      this[dialogVisible] = false;
    },
    loadData(param, cb) {
      org
        .getParamsPage(param)
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
      this.readOnly = false;
      switch (params.command) {
        case "showInfo": //展示详细信息
          this.showInfo = true;
          org.getParams(params.row.code).then(resp => {
            resp.json = JSON.parse(resp.json);
            this.ProParam = resp;
            this.ctlTypeChecked();
          });
          break;
        case "assignMenu":
          this.readOnly = true;
          this.showDialog(params.row);
          break;
        case "setDemDefault":
          this.setDemDefault(params.row);
          break;
        default:
          break;
      }
    },
    async beforeSaveData() {
      if (['select','checkBox','box'].includes(this.ProParam.ctlType)){
        if (this.ProParam.json.length===0){
          this.isSubmit = false;
          this.$message({type:"warning",message:"请添加自定义选项"});
          return;
        }
      }
      this.isSubmit = true;
      this.ProParam.ctrType = this.ProParam.ctlType;
    },
    afterSaveData() {
      this.dialogVisible = false;
      this.isCusOprionsShow = false;
      this.$refs.htTable.load();
    },
    afterDelete() {
      this.$refs.htTable.load();
    },
    afterLoadData(data) {
      // 编辑角色
      if (this.dialogVisible) {
        data.json = JSON.parse(data.json);
        this.ProParam = data;
        this.ctlTypeChecked();
        setTimeout(() => this.$validator.validateAll("editDemForm"));
      }
    },
    move(ary, item, direct) {
      this.ProParam.json = utils.arrayMove(ary, item, direct);
    },
    ctlTypeChecked() {
      var thisctlType = this.ProParam.ctlType;
      if (
        thisctlType === "input" ||
        thisctlType === "date" ||
        thisctlType === "number"
      ) {
        this.isCusOprionsShow = false;
      } else {
        this.isCusOprionsShow = true;
      }
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
