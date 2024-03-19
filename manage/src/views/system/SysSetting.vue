<template>
    <div class="fullheight">
        <el-form v-form  data-vv-scope="propertyForm">
            <table class="form-table" cellspacing="0" cellpadding="0" border="0">
                <tbody>
                    <tr>
                        <th width="130px">系统管理端名称:</th>
                        <td>
                            <ht-input v-model="sysSettingData.manageName" class="ht" placeholder="请输入系统管理端名称" autocomplete="off" :maxlength="50" :showWordLimit="true"></ht-input>
                        </td>
                    </tr>
                    <tr>
                        <th width="130px">系统管理端Logo:</th>
                        <td>
                            <FileUpload  ref="manageLogo"  model-name="sysSettingData.manageLogo" :accept='`.jpg,.jpeg,.png,.JPG,.JPEG`' :limit="1" :multiple="false"> </FileUpload>
                        </td>
                    </tr>
                    <tr>
                        <th width="130px">系统应用端名称:</th>
                        <td>
                            <ht-input v-model="sysSettingData.frontName" class="ht" placeholder="请输入系统应用端名称" autocomplete="off" :maxlength="50" :showWordLimit="true"></ht-input>
                        </td>
                    </tr>
                    <tr>
                        <th width="130px">系统应用端Logo:</th>
                        <td>
                            <FileUpload  ref="frontLogo"  model-name="sysSettingData.frontLogo" :accept='`.jpg,.jpeg,.png,.JPG,.JPEG`' :limit="1" :multiple="false"> </FileUpload>
                        </td>
                    </tr>
                    <tr>
                        <th width="130px">系统登录页Logo:</th>
                        <td>
                            <FileUpload  ref="ico"  model-name="sysSettingData.ico" :accept='`.jpg,.jpeg,.png,.JPG,.JPEG`' :limit="1" :multiple="false"> </FileUpload>
                        </td>
                    </tr>
                </tbody>
            </table>
        </el-form>
        <br>
        <ht-submit-button
          :url="saveUrl"
          :isSubmit="isSubmit"
          :model="currentProperty"
          scope-name="propertyForm"
          @before-save-data="beforeSaveData"
        >{{$t("eip.common.save")}}</ht-submit-button>
        <el-button type="danger" @click="handleClear">{{$t('eip.common.clear')}}</el-button>
</div>
</template>

<script>
const FileUpload = () => import("@/components/common/FileUpload.vue");
import portal from "@/api/portal.js";
import req from "@/request.js";
export default {
    name: "sysSetting",
    components: {
        FileUpload,
    },
    data() {
        return {
            isSubmit:false,
            saveUrl: `${window.context.portal}/sys/sysProperties/v1/save`,
            sysSettingData:{manageLogo:[],frontLogo:[],ico:[],manageName:"",frontName:""},
            currentProperty: { encrypt: 1 ,name:"系统Logo/名称",alias:"sysSetting",description:"当前系统的管理端Logo、应用端Logo、登录页Logo和名称。",value:""}
        }
    },
    watch: {
        "currentProperty.value": {
            handler(newVal, oldVal) {
                const this_ = this;
                if (newVal) {
                    setTimeout(function(){
                        this_.init();
                    },1000);
                }
            },
            immediate: true,
            deep: true
        }
    },
    mounted() {
        this.init();
    },
    methods: {
        //查看系统设置
        init(){
            const this_ = this;
            this_.sysSettingData={manageLogo:[],frontLogo:[],ico:[],manageName:"",frontName:""},
            portal.getDecryptBySysSetting().then(response => {
                if(response && response.value){
                    this_.sysSettingData = JSON.parse(response.value);
                    setTimeout(function(){
                        if(this_.sysSettingData.manageLogo.length>0){
                            this_.$refs.manageLogo.setFiles(this_.sysSettingData.manageLogo);
                        }
                        if(this_.sysSettingData.frontLogo.length>0){
                            this_.$refs.frontLogo.setFiles(this_.sysSettingData.frontLogo);
                        }
                        if(this_.sysSettingData.ico.length>0){
                            this_.$refs.ico.setFiles(this_.sysSettingData.ico);
                        }
                    },1000);
                    this_.currentProperty.id = response.id;
                }
            });
        },
        //保存前
        beforeSaveData() {
            const this_ = this;
            this_.isSubmit = true;
            if(this_.$refs.manageLogo.getFiles().length>0){
                this.sysSettingData.manageLogo = this_.$refs.manageLogo.getFiles();
            }
            if(this_.$refs.frontLogo.getFiles().length>0){
                this_.sysSettingData.frontLogo = this_.$refs.frontLogo.getFiles();
            }
            if(this_.$refs.ico.getFiles().length>0){
                this_.sysSettingData.ico = this_.$refs.ico.getFiles();
            }
            if(this_.sysSettingData.manageLogo.length==0 && this_.sysSettingData.frontLogo.length==0 && this_.sysSettingData.ico.length==0
            && this_.sysSettingData.manageName=="" && this_.sysSettingData.frontName==""){
                this_.isSubmit = false;
                this_.$message.warning("请填写其中一项再保存");
                return;
            }
            this_.currentProperty.value = JSON.stringify(this_.sysSettingData);
        },
        //清空系统设置
        handleClear(){
            const this_ = this;
            if(!this_.currentProperty.id){
                this_.$message.warning("请先保存数据再清空");
                return;
            }
            req.remove(`${window.context.portal}/sys/sysProperties/v1/remove?ids=${this_.currentProperty.id}`).then(response => {
                if(response.data){
                    if(response.data.state){
                        this_.sysSettingData = {manageLogo:[],frontLogo:[],ico:[],manageName:"",frontName:""};
                        this_.currentProperty = { encrypt: 1 ,name:"系统Logo/名称",alias:"sysSetting",description:"当前系统的管理端Logo、应用端Logo、登录页Logo和名称。",value:""};
                        this_.$refs.manageLogo.setFiles([]);
                        this_.$refs.frontLogo.setFiles([]);
                        this_.$refs.ico.setFiles([]);
                        this_.$forceUpdate();
                        this_.$message.success("清空成功,请重新登录后查看");
                    }
                }
            });
        }
    }
};
</script>

<style lang="scss" scoped>
.ht {
  width: 100%;
}
.table > thead > tr > th,
.table > thead > th,
.table > tr > th,
.table > tfoot > tr > th,
.table > thead > tr > td,
.table > tr > td,
.table > tfoot > tr > td {
  border-top: 1px solid #e7eaec;
  border-left: 1px solid #e7eaec;
  line-height: 1.42857;
  padding: 4px 8px;
  vertical-align: middle;
  text-align: center;
}
.table {
  border-bottom: 1px solid #e7eaec;
  border-right: 1px solid #e7eaec;
  width: 100%;
  border-spacing: 0;
}
</style>
