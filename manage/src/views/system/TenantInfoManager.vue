<template>
  <div class="fullheight">
     <el-tabs type="card" v-model="currentTabName">
          <el-tab-pane label="基本信息" name="basic">
            <ht-submit-button
                :style="saveBtnStyle"
                url="${uc}/uc/tenantManage/v1/save"
                :model="tenantManage"
                scope-name="tenantManageForm"
                @before-save-data="beforeSaveData"
                @after-response-value="afterResponseValue"
              >保存基本信息</ht-submit-button>

            <el-form v-form data-vv-scope="tenantManageForm">
              <ht-form-item label="类型" label-width="120px" v-if="tenantId">
                <ht-select
                    class="ht"
                    v-model="tenantManage.typeId"
                    :options="tenantTypeList"
                    :props="{ key: 'id', value: 'name' }"
                    validate="required"
                  />
              </ht-form-item>
              <ht-form-item label="管理端名称" label-width="120px">
                <ht-input v-model="tenantManage.name" :validate="{required:true}" autocomplete="off" :maxlength="100" :showWordLimit="true" />
                <el-tooltip
                        class="item"
                        effect="dark"
                        content="管理端名称会作为登录页的公司名称"
                        placement="right-start"
                >
                    <span class="el-icon-question" style="margin-left: 10px"></span>
                </el-tooltip>
              </ht-form-item>
              <ht-form-item label="应用端名称" label-width="120px">
                <ht-input v-model="tenantManage.nameFront" :validate="{required:true}" autocomplete="off" :maxlength="100" :showWordLimit="true" />
                <el-tooltip
                        class="item"
                        effect="dark"
                        content="应用端名称会作为登录页的公司名称"
                        placement="right-start"
                >
                    <span class="el-icon-question" style="margin-left: 10px"></span>
                </el-tooltip>
              </ht-form-item>
              <ht-form-item label="别名" label-width="120px">
                <ht-input v-model="tenantManage.code"
                  autocomplete="off"
                  :validate="{
                    regex: {
                      exp: '^[a-z]{0,10}\\d{0,3}$',
                      message: '别名只能包含小写字母和数字，且必须以小写字母开头，小写字母最多10个，数字最多3个'
                    },
                    required: true,
                    isExist: '${uc}/uc/tenantManage/v1/checkCode?code='
                  }"
                :disabled="tenantManage.id?true:false"
                v-pinyin="tenantManage.name"
                :maxlength="100"
                :showWordLimit="true"
                />
                <el-tooltip
                        class="item"
                        effect="dark"
                        content="别名只能包含小写字母和数字，且必须以小写字母开头，小写字母最多10个，数字最多3个"
                        placement="right-start"
                >
                    <span class="el-icon-question" style="margin-left: 10px"></span>
                </el-tooltip>
              </ht-form-item>
              <ht-form-item label="简称" label-width="120px">
                <ht-input v-model="tenantManage.shorthand" validate="required" :maxlength="50" :showWordLimit="true"/>
              </ht-form-item>
              <ht-form-item v-if="tenantId" label="状态" label-width="120px">
                <ht-select
                  v-model="tenantManage.status"
                  :options="tenantManage.status=='draft'?draftOptions:statusOpition"
                  :validate="{'required':true,
                  regex: {
                        exp: '^[\\s\\S]{1,30}$',
                        message: '内容超出输入限制'
                    }}"
                />
              </ht-form-item>
              <ht-form-item label="访问地址" label-width="120px" v-if="tenantManage.id && tenantManage.id!='-1'">
                <el-link type="primary" @click="showCopyUrl">查看地址</el-link>
              </ht-form-item>
              <!-- <ht-form-item label="域名地址" label-width="120px">
                <ht-input v-model="tenantManage.domain" />
              </ht-form-item> -->
              <ht-form-item label="管理端LOGO" label-width="120px">
                 <FileUpload  ref="manageLogo"  model-name="tenantManage.manageLogo" :accept='`.jpg,.jpeg,.png,.JPG,.JPEG`' :limit="1" :multiple="false"> </FileUpload>
              </ht-form-item>
              <ht-form-item label="用户端LOGO" label-width="120px">
                  <FileUpload  ref="frontLogo"  model-name="tenantManage.frontLogo" :accept='`.jpg,.jpeg,.png,.JPG,.JPEG`' :limit="1" :multiple="false"> </FileUpload>
              </ht-form-item>
              <ht-form-item label="登录页LOGO" label-width="120px">
                  <FileUpload  ref="ico"  model-name="tenantManage.ico" :accept='`.jpg,.jpeg,.png,.JPG,.JPEG`' :limit="1" :multiple="false"> </FileUpload>
              </ht-form-item>
              <ht-form-item label="描述" label-width="120px">
                <ht-input type="textarea" v-model="tenantManage.desc" placeholder="请输入类型说明" :maxlength="100" :showWordLimit="true" />
              </ht-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="扩展信息" v-if="tenantManage.id && tenantManage.status!='draft'" name="params">
               <el-button
                  :style="saveBtnStyle"  type="primary"
                  @click="tenantParamSubmit">保存扩展信息</el-button>

              <el-form  v-form data-vv-scope="tenantParam" class="user-param-form">
                <template v-for="param in tenantParams">
                  <ht-form-item
                    :label="param.name"
                    prop="name"
                    label-width="220px"
                    :key="param.name"
                  >
                    <el-date-picker
                      v-model="tenantParam[param.code]"
                      type="datetime"
                      placeholder="选择日期时间"
                      v-if="param.ctlType === 'date'"
                    ></el-date-picker>
                    <ht-input
                      v-model="tenantParam[param.code]"
                      v-if="param.ctlType === 'input'"
                      :maxlength="50"
                      :showWordLimit="true"
                    />
                    <ht-input
                      type="number"
                      v-model="tenantParam[param.code]"
                      v-if="param.ctlType === 'number'"
                      :maxlength="50"
                      :showWordLimit="true"
                    />
                    <ht-select
                      v-model="tenantParam[param.code]"
                      v-if="param.ctlType === 'select'"
                      :options="JSON.parse(param.json)"
                    />
                    <ht-radio
                      v-model="tenantParam[param.code]"
                      v-if="param.ctlType === 'radio'"
                      :options="JSON.parse(param.json)"
                    />
                    <ht-checkbox
                      v-model="tenantParam[param.code]"
                      v-if="param.ctlType === 'checkbox'"
                      :options="JSON.parse(param.json)"
                    />
                  </ht-form-item>
                </template>
              </el-form>
          </el-tab-pane>
          <el-tab-pane label="邮件设置" name="mailService"  v-if="tenantManage.id && tenantManage.status!='draft'">
              <el-button
                  :style="saveBtnStyle" type="primary"
                  @click="saveTenantMail">保存邮件信息</el-button>

              <tenant-mail-server-manager ref="tenantMailServerManager" :tenantId="curSelectTenantId"></tenant-mail-server-manager>
          </el-tab-pane>
      </el-tabs>
      <!-- 租户访问地址 -->
    <tenant-access-address ref="tenantAccessAddress"></tenant-access-address>
  </div>
</template>
<script>

const FileUpload = () => import("@/components/common/FileUpload.vue");
const tenantMailServerManager = () => import("@/views/system/TenantMailServerManager.vue");
const tenantAccessAddress = () => import("@/components/tenant/TenantAccessAddress.vue");
export default {
   name: "tenantInfoManager",
   props:['tenantId'],
   components: {
    FileUpload,
    tenantMailServerManager,
    tenantAccessAddress,
  },
  data() {
    return {
      currentTabName: 'basic',
      dialogVisible: false,
      tenantManage: {status:'enable',code:""},
      curSelectTenantId: '',
      tenantTypeList: [],
      tenantParam: {}, //当前租户的参数值
      tenantParams: [], //系统的所有组合类型参数
      saveBtnStyle: 'float: right;position: fixed;top:8px;right:15px',
      draftOptions : [{'key': 'draft', 'value':'草稿'},{'key': 'enable', 'value':'启用'},{'key': 'disabled', 'value':'禁用'}],
      statusOpition: [{'key': 'enable', 'value':'启用'},{'key': 'disabled', 'value':'禁用'}],
    };
  },
  mounted() {
    this.$validator = this.$root.$validator;
    this.curSelectTenantId = this.tenantId;
    if(!this.tenantId){
      this.saveBtnStyle = 'float: right;position: fixed;top:100px;right:15px'
      this.curSelectTenantId = this.$store.state.login.currentUser.userAttrs.tenantId;
    }
    if(this.curSelectTenantId=='add'){
      this.curSelectTenantId = '';
      this.getTenantTypeList();
    }
    let url = "${uc}/uc/tenantManage/v1/getJson?id="+this.curSelectTenantId;
    if(this.curSelectTenantId){
      let _this = this;
      this.$http.get(url).then(resp => {
          _this.tenantManage = resp.data;
          setTimeout(function(){
                if(_this.tenantManage.manageLogo){
                  _this.$refs.manageLogo.setFiles(JSON.parse(_this.tenantManage.manageLogo));
                }
                if(_this.tenantManage.frontLogo){
                  _this.$refs.frontLogo.setFiles(JSON.parse(_this.tenantManage.frontLogo));
                }
                if(_this.tenantManage.ico){
                  _this.$refs.ico.setFiles(JSON.parse(_this.tenantManage.ico));
                }
          },1000);
          this.getTenantTypeList();
          this.initTenantParams();
      }, error => {
          reject(error);
      })
    }

  },
  methods: {
    getTenantTypeList(){
        let that = this;
        this.$store.dispatch("tenant/actionTenantId", null);
        this.$http.get("${uc}/uc/tenantType/v1/getAll?status=enable").then(resp => {
              that.tenantTypeList = resp.data;
              that.$store.dispatch("tenant/actionTenantId", that.tenantId);
          }, error => {
              that.$store.dispatch("tenant/actionTenantId", that.tenantId);
              reject(error);
          }).then(()=>{
            if (!that.curSelectTenantId){
              let list = that.tenantTypeList.filter(item => item.isDefault === '1');
              that.$set(this.tenantManage,"typeId",list[0].id);
            }
        })
    },
    //初始化租户扩展参数
    initTenantParams(){
        let that = this;
        if(this.tenantManage.id) {
          this.$store.dispatch("tenant/actionTenantId", null);
          this.$http.get("${uc}/api/params/v1/tenantParams/getTenantParams?tenantTypeId="+this.tenantManage.typeId)
            .then(resp => {
              that.tenantParams = resp.data;
              return resp.data;
            })
            .then(params => {
              if (
                !params ||
                params.constructor != Array ||
                params.length < 1
              ) {
                return;
              }
              this.$http.get("${uc}/uc/tenantParams/v1/getParamsValue?tenantId="+that.tenantManage.id).then(response => {
                if (response.data && response.data.constructor == Array) {
                  response.data.forEach(r => {
                    that.$set(that.tenantParam, r["code"], r["value"]);
                  });
                }
                 that.$store.dispatch("tenant/actionTenantId", that.tenantId);
              });
            });
        }
    },
    tenantParamSubmit() {
      var data = [];
      let tenantParam = this.tenantParam;
      for (let _param in tenantParam) {
        if(tenantParam.hasOwnProperty(_param)){
            data.push({ alias: _param, value: this.tenantParam[_param] });
        }
      }
      let _this = this;
      if(data.length>0){
        this.$http.post("${uc}/uc/tenantParams/v1/saveTenantParams?tenantId="+this.tenantManage.id, data).then(resp => {
            let response = resp.data;
            if(!response.state){
              _this.$message.error(response.message);
            }else{
              _this.$message.success(response.message);
            }
        }, error => {
            reject(error);
        });
      }
    },
    beforeSaveData(){
      if(this.$refs.manageLogo.getFiles()!=""){
        this.tenantManage.manageLogo = JSON.stringify(this.$refs.manageLogo.getFiles())
      }else{
        this.tenantManage.manageLogo = "";
      }
      if(this.$refs.frontLogo.getFiles()!=""){
        this.tenantManage.frontLogo = JSON.stringify(this.$refs.frontLogo.getFiles())
      }else{
        this.tenantManage.frontLogo = "";
      }
      if(this.$refs.ico.getFiles()!=""){
        this.tenantManage.ico = JSON.stringify(this.$refs.ico.getFiles())
      }else{
        this.tenantManage.ico = "";
      }
      
    },
    afterResponseValue(value){
      if(this.tenantId=='add'){
         this.tenantManage.id = value;
         this.$emit('after-add-success',this.tenantManage);
      }else if(this.tenantId){
         this.$emit('after-add-success',this.tenantManage);
      }
    },
    saveTenantMail(){
      this.$refs.tenantMailServerManager.saveData();
    },
    showCopyUrl(){
      this.$refs.tenantAccessAddress.showDialog(this.tenantManage.code);
    },
  }
};
</script>

<style lang="scss" scoped>
.sp-manager__dialog /deep/ > .el-dialog > .el-dialog__body {
  height: calc(100% - 170px);
}
</style>
