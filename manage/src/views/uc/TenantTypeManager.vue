<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      quick-search-props="name,code"
      :show-export="false"
      :show-custom-column="false"
      ref="htTable"
      @row-click="rowClick"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="showDialog()" icon="el-icon-plus">添加</el-button>
          <ht-delete-button url="${uc}/uc/tenantType/v1/remove" :htTable="$refs.htTable" style="margin:0;">删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="name" label="类型名称" :sortable="true" :show-overflow-tooltip="true">
          <template v-slot="{row}">
            <el-link type="primary" @click="showDialog(row.id)" title="查看详情">{{row.name}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column prop="code" label="类型编码" :sortable="true" :show-overflow-tooltip="true">
        </ht-table-column>
        <!--<ht-table-column
          prop="status"
          label="状态"
          width="110"
          :filters="[{text:'禁用', value:'disabled'},{text:'启用', value:'enable'}]">
          <template v-slot="{row}">
            <el-tag type="warning" v-if="row.status=='disabled'">禁用</el-tag>
            <el-tag type="success" v-if="row.status=='enable'">启用</el-tag>
          </template>
        </ht-table-column>-->
        <ht-table-column
          prop="isDefault"
          label="是否默认"
          width="110"
          :filters="[{text:'否', value:'0'},{text:'是', value:'1'}]"
        >
          <template v-slot="{row}">
            <el-tag type="warning" v-if="row.isDefault=='0'">否</el-tag>
            <el-tag type="success" v-if="row.isDefault=='1'">是</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column prop="createTime" label="创建时间" :sortable="true" :show-overflow-tooltip="true">
          <template v-slot="{row}">
            <span>{{row.createTime}}</span>
          </template>
        </ht-table-column>
        <ht-table-column prop="updateTime" label="最后更新时间" :sortable="true" :show-overflow-tooltip="true">
          <template v-slot="{row}">
            <span >{{row.updateTime}}</span>
          </template>
        </ht-table-column>
        <ht-table-column width="180" label="操作">
          <template v-slot="{row}">
            <el-dropdown
              size="mini"
              split-button
              @command="handleCommand"
              @click="handleCommand({row:row,command:'assignUser'})"
            >
              <span>
                <i class="el-icon-user"></i>设置管理员
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  icon="el-icon-plus"
                  :command="{row:row,command:'setDefault'}"
                >设置为默认</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </ht-table-column>
      </template>
    </ht-table>
    <ht-sidebar-dialog
      width="28%"
      :title="tenantType.id?'编辑租户类型':'新增租户类型'"
      class="sp-manager__dialog"
      :visible="dialogVisible"
      :before-close="beforeCloseDialog"
    >
      <el-form v-form data-vv-scope="tenantTypeForm"  v-model="tenantType">
        <ht-form-item label="类型名称" label-width="120px">
          <ht-input v-model="tenantType.name" :validate="{required:true,
                    regex: {
                        exp: '^[\\s\\S]{1,21}$',
                        message: '内容超出输入限制'
                    }}" autocomplete="off"/>
        </ht-form-item>
        <ht-form-item label="类型编码" label-width="120px">
          <ht-input v-model="tenantType.code"
            autocomplete="off"
            :validate="{
              required: true,
              alpha_num: true,
              isExist: '${uc}/uc/tenantType/v1/checkCode?code=',
              regex: {
                exp: '^[\\s\\S]{1,50}$',
                message: '内容超出输入限制'
              }
            }"
           :disabled="tenantType.id?true:false"
            v-pinyin="tenantType.name"/>
        </ht-form-item>
        <!--<ht-form-item label="状态" label-width="120px">
          <ht-select
            v-model="tenantType.status"
            :options="[{'key': 'disabled', 'value':'禁用'},{'key': 'enable', 'value':'启用'}]"
            :validate="{'required':true}"
          />
        </ht-form-item>-->
        <ht-form-item label="类型说明" label-width="120px">
          <ht-input type="textarea" v-model="tenantType.desc" placeholder="请输入类型说明" />
        </ht-form-item>
      </el-form>
      <div slot="footer" style="text-align: center">
        <ht-submit-button
          url="${uc}/uc/tenantType/v1/save"
          :model="tenantType"
          scope-name="tenantTypeForm"
          @after-save-data="afterSaveData"
        >{{$t("eip.common.save")}}</ht-submit-button>
        <el-button @click="beforeCloseDialog">{{$t("eip.common.cancel")}}</el-button>
      </div>
    </ht-sidebar-dialog>
    <!-- 租户用户管理 -->
    <tenant-auth-manager ref="tenantAuthManager"></tenant-auth-manager>
  </div>
</template>
<script>

const tenantAuthManager = () => import("@/views/uc/TenantAuthManager.vue");
export default {
  components: {
    tenantAuthManager,
  },
  data() {
    return {
      dialogVisible: false,
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      tenantType: {code:'',name:''}
    };
  },
  mounted() {
    this.$validator = this.$root.$validator;
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    showDialog(id) {
      if (id) {
    	  this.$http.get("${uc}/uc/tenantType/v1/getJson?id="+`${id}`).then(resp => {
              this.tenantType = resp.data;
              this.dialogVisible = true;
          }, error => {
              reject(error);
          })
      } else {
        this.dialogVisible = true;
      }
    },
    beforeCloseDialog() {
      this.tenantType = {code:'',name:''};
      this.dialogVisible = false;
    },
    loadData(param, cb) {
    	this.$http.post("${uc}/uc/tenantType/v1/listJson", param).then(resp => {
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
    afterSaveData() {
      setTimeout(() => {
        this.beforeCloseDialog();
        this.$refs.htTable.load();
      }, 500);
    },
    handleCommand(params) {
      switch (params.command) {
        case "edit":
          this.showDialog(params.row.id);
          break;
        case "delete":
          break;
        case "assignUser":
          this.$refs.tenantAuthManager.showDialog(params.row.id,'');
          break;
        case "setDefault":
          this.setDefault(params.row.code);
          break;
        default:
          break;
      }
    },
    setDefault(code){
      let that = this;
      this.$http.post("${uc}/uc/tenantType/v1/setDefault?code="+code).then(result => {
            let resp = result.data;
            if(resp.state){
              that.$message.success(resp.message);
              that.$refs.htTable.load();
            }else{
              that.$message.error(resp.message);
            }
        }, error => {
            reject(error);
        });
    },
  }
};
</script>

<style lang="scss" scoped>
.sp-manager__dialog /deep/ > .el-dialog > .el-dialog__body {
  height: calc(100% - 170px);
}
</style>
