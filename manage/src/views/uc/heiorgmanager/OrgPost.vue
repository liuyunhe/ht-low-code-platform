<template>
  <div class="fullheight">
    <ht-table
        @load="loadData"
        :data="data"
        :pageResult="pageResult"
        :selection="true"
        :default-querys="[{property:'o.ID_',value:this.orgId}]"
        quick-search-props="name"
        :show-export="false"
        ref="htTable"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="showDialog()"
                     icon="el-icon-plus"
                     v-if="orgManagerNow.posPerms && orgManagerNow.posPerms.indexOf('add')>=0">添加岗位</el-button>
          <ht-delete-button
              :url="demDeleteUrl"
              :htTable="$refs.htTable"
              pk="code"
              parameter="postCodes"
              v-if="orgManagerNow.posPerms && orgManagerNow.posPerms.indexOf('delete')>=0"
              @after-delete="afterDelete"
          >删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column
            prop="name"
            label="岗位名称"
            width="300"
            :sortable="true"
            :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            <el-link type="primary" @click="handleCommand({row:scope.row,command:'edit'})">{{scope.row.name}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column prop="code" label="岗位编码" :show-overflow-tooltip="true" />
        <ht-table-column prop="jobName" label="职务名称"  />
        <ht-table-column
            prop="isCharge"
            label="是否责任岗位"
            width="120"
            :filters="[{text:'否', value:'0'},{text:'是', value:'1'}]"
        >
          <template v-slot="{row}">
            <el-tag type="danger" v-if="row.isCharge=='0'">否</el-tag>
            <el-tag type="success" v-if="row.isCharge=='1'">是</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column width="150">
          <template v-slot:header>
            <span style="color: #2274af">操作</span>
          </template>
          <template v-slot="{row}">
            <el-dropdown
                size="mini"
                split-button
                @command="handleCommand"
                @click="handleCommand({row:row,command:'showInfo'})"
            >
              <span>
                <i class="el-icon-edit"></i>分配人员
              </span>
              <el-dropdown-menu slot="dropdown">
                <!-- <ht-delete-button :url="demDeleteUrl" :row="row" @after-delete="afterDelete">删除</ht-delete-button> -->
                <!--                <el-dropdown-item icon="el-icon-edit" :command="{row:row,command:'edit'}">编辑</el-dropdown-item>-->
                <el-dropdown-item icon="el-icon-s-home" :command="{row:row,command:'orgInfo'}">岗位详情</el-dropdown-item>
                <el-dropdown-item icon="el-icon-s-home" :command="{row:row,command:'setPostMaster'}" v-if="row.isCharge">取消责任岗位</el-dropdown-item>
                <el-dropdown-item icon="el-icon-s-home" :command="{row:row,command:'setPostMaster'}" v-else>设置责任岗位</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </ht-table-column>
      </template>
    </ht-table>

    <ht-sidebar-dialog
        width="35%"
        title="添加岗位"
        :visible="dialogVisible"
        :before-close="handleClose"
    >
      <el-form v-model="OrgPost"  data-vv-scope="editDemForm" :label-position="position">
        <ht-form-item label="职务名称" prop="name" label-width="100px" v-if="!readOnly">
          <ht-select
              filterable
              clearable
              v-model="OrgPost.jobCode"
              class="m-r"
              :options="job"
              :props="{key:'groupCode',value:'name'}"
              :validate="{required:true}"
          />
        </ht-form-item>
        <ht-form-item label="岗位名称" prop="code" label-width="100px">
          <ht-input
              v-model="OrgPost.name"
              autocomplete="off"
              :validate="{required:true,regex: {
                        exp: '^[\\s\\S]{1,30}$',
                        message: '内容超出输入限制'
                      }}"
              placeholder="岗位名称"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="岗位编码" prop="code" label-width="100px">
          <ht-input
              v-model="OrgPost.code"
              autocomplete="off"
              v-pinyin="OrgPost.name"
              :validate="{required:true,alpha_num:true,regex: {
                        exp: '^[\\s\\S]{1,30}$',
                        message: '内容超出输入限制'
                      }}"
              placeholder="岗位编码"
              :disabled="readOnly"
          ></ht-input>
        </ht-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
            :url="saveOrgPost"
            :model="OrgPost"
            :isSubmit="isSubmit"
            :requestMethod="requestMethod"
            scopeName="editDemForm"
            @before-save-data="beforeSaveData"
            @after-save-data="afterSaveData"
        >{{$t('eip.common.save')}}</ht-submit-button>
        <el-button @click="handleClose()">{{$t('eip.common.cancel')}}</el-button>
      </div>
    </ht-sidebar-dialog>

    <!-- 编辑面板 -->
    <ht-sidebar-dialog
        width="30%"
        title="编辑岗位"
        :visible="editDialog"
        :before-close="handleClose"
    >
      <el-form v-model="OrgPost" data-vv-scope="editDemForm"  :label-position="position">
        <ht-form-item label="岗位名称" prop="code" label-width="100px">
          <ht-input
              v-model="OrgPost.name"
              autocomplete="off"
              :validate="{required:true,regex: {
                        exp: '^[\\s\\S]{1,30}$',
                        message: '内容超出输入限制'
                      }}"
              placeholder="岗位名称"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="岗位编码" prop="code" label-width="100px">
          <ht-input
              v-model="OrgPost.code"
              :disabled="true"
          ></ht-input>
        </ht-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
            :url="saveOrgPost"
            :model="OrgPost"
            :isSubmit="isSubmit"
            :requestMethod="requestMethod"
            scopeName="editDemForm"

            @before-save-data="beforeSaveData"
            @after-save-data="afterSaveData"
        >{{$t('eip.common.save')}}</ht-submit-button>
        <el-button @click="dialogCancle('editDialog')">{{$t('eip.common.cancel')}}</el-button>
      </div>
    </ht-sidebar-dialog>

    <distrubutive-user ref="distrubutiveUser"></distrubutive-user>
    <ht-load-data :url="loadDataUrl" context="uc" @after-load-data="afterLoadData"></ht-load-data>

    <ht-sidebar-dialog
        width="40%"
        title="查看岗位详情"
        :visible="diaType==='showInfo'"
        :before-close="handleClose"
    >
      <table class="form-table" cellspacing="0" cellpadding="0" border="0">
        <tbody>
        <tr>
          <th width="150px">岗位名称（编码）:</th>
          <td>
            {{OrgPost.name}}({{OrgPost.code}})
          </td>
        </tr>
        <tr>
          <th width="150px">所属职务（编码）:</th>
          <td>
            {{OrgPost.jobName}}({{OrgPost.jobCode}})
          </td>
        </tr>
        <tr>
          <th width="150px">所属组织（编码）:</th>
          <td>
            {{OrgPost.orgName}}({{OrgPost.orgCode}})
          </td>
        </tr>
        <tr>
          <th width="150px">岗位人员:</th>
          <td>
            <el-table :data="postUser" style="width: 100%" height="200" >
              <el-table-column prop="fullName" label="姓名" width="100"/>
              <el-table-column prop="pathName" label="人员所属组织全路径" />
            </el-table>
          </td>
        </tr>
        </tbody>
      </table>
    </ht-sidebar-dialog>
  </div>
</template>
<script>
  // 组织岗位
  import org from "@/api/org.js";
  import uc from "@/api/uc.js";
  import EipUserDialog from "@/components/dialog/EipUserDialog.vue";
  import DistrubutiveUser from "./DistrubutiveUser";
  export default {
    name: "org-post",
    // props:['orgId','orgCode'],
    props: {
      orgId : {
        type: String
      },
      orgCode: {
        type: String
      },
      orgManagerNow: {
        type: Object
      }
    },
    components: {
      EipUserDialog,
      DistrubutiveUser
    },
    computed: {
      demDeleteUrl: function() {
        return window.context.uc + "/api/org/v1/orgPost/deleteOrgPost";
      },
      saveOrgPost: function() {
        let preUrl = window.context.uc + "/api/org/v1/orgPost";
        this.OrgPost.orgCode = this.orgCode;
        if (this.OrgPost.id) {
          preUrl += "/updateOrgPost";
        } else {
          preUrl += "/saveOrgPost";
        }
        return preUrl;
      },
      requestMethod: function() {
        return "POST";
      }
    },
    data() {
      return {
        position:"right",
        dialogVisible: false,
        dialogVisibleMenuPerm: false,
        OrgPost: {
          jobCode:"",   //职务编码
          jobName:"",    //职务名称
          name:"",   //岗位名称
          code:""    //岗位编码
        },
        job: [],
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
        distOrgUser:false,   //分配岗位人员页面
        diaType:'',
        postUser:[],
        editDialog:false
      };
    },
    mounted() {
      this.$validator = this.$root.$validator;

    },
    methods: {
      setDemDefault(row){
        org.setDemDefault(row.code).then(() => {
          this.$refs.htTable.load();
        })
      },
      handleClose() {
        this.dialogVisible = false;
        this.diaType = false;
        this.editDialog = false;
      },
      handleCloseMenuPerm() {
        this.dialogVisibleMenuPerm = false;
      },
      showDialog(row) {
        this.dialogVisible = true;
        uc.getJobPage({"pageBean":{"page":1,"pageSize":1000}}).then(resp => {
          this.job = resp.rows
        });
        if (row) {
          var _code = `${row.code}`;
          org.getOrgPost(_code).then(resp => {
            this.OrgPost = resp.value
          })
        } else {
          this.OrgPost = {name:"",code:"",jobName:"",jobCode: ""};
        }
      },
      dialogCancle(dialogVisible) {
        this[dialogVisible] = false;
      },
      loadData(param, cb) {
        uc.getOrgPostPage(param).then(rep => {
          this.data = rep.rows;
          this.pageResult = {
            page: rep.page,
            pageSize: rep.pageSize,
            total: rep.total
          };
        }).finally(() => cb());
      },
      handleCommand(params) {
        this.readOnly = false;
        switch (params.command) {
          case "showInfo":
            if(!this.orgManagerNow.posPerms || this.orgManagerNow.posPerms.indexOf('edit')<0){
              this.$message.error("您无编辑权限，请联系管理员");
              return;
            }
            this.readOnly = true;
            this.$refs.distrubutiveUser.showDialog(params.row.id,params.row.code);
            break;
          case "orgInfo":
            this.diaType = 'showInfo';
            this.OrgPost = params.row;
            org.getFullname(params.row.id).then(resp => {
              this.postUser = resp;
            });
            break;
          case "setPostMaster":
            if(!this.orgManagerNow.posPerms || this.orgManagerNow.posPerms.indexOf('edit')<0){
              this.$message.error("您无编辑权限，请联系管理员");
              return;
            }
            var isMain =false;
            if (params.row.isCharge==0){
              isMain =true;
            }
            org.setPostMaster({postCode:params.row.code,isMain:isMain}).then(() => {
              this.$refs.htTable.load();
            });
            break;
          case "edit":
            console.log(params.row);
            if(!this.orgManagerNow.posPerms || this.orgManagerNow.posPerms.indexOf('edit')<0){
              this.$message.error("您无编辑权限，请联系管理员");
              return;
            }
             org.getOrgPost(params.row.code).then(resp => {
               this.OrgPost = resp.value;
             });
            this.editDialog = true;
            break;
          default:
            break;
        }
      },
      async beforeSaveData() {
        this.isSubmit = true;
      },
      afterSaveData() {
        this.editDialog = false;
        this.dialogVisible = false;
        this.$refs.htTable.load();
      },
      afterDelete() {
        this.$refs.htTable.load();
      },
      afterLoadData(data) {
        // 编辑角色
        if (this.dialogVisible) {
          this.demension = data;
          setTimeout(() => this.$validator.validateAll("editDemForm"));
        }
      },
      distOrgUserLoad(param, cb){
        org.getOrgUserPage(param)
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
  div[aria-invalid="true"] >>> .el-input__inner,
  div[aria-invalid="true"] >>> .el-input__inner:focus {
    border-color: #f56c6c;
  }
</style>
