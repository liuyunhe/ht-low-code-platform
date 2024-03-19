<template>
  <el-dialog
      width="40%"
      :title="i18nMessageTitle"
      :visible="dialogVisible"
      :before-close="handleClose"
      append-to-body
      :close-on-click-modal="false"
  >
    <el-form v-model="i18nMessage" data-vv-scope="editi18nMessageForm">
      <table class="form-table" cellspacing="0" cellpadding="0" border="0">
        <tbody>
        <tr>
          <th width="120px" class="is-required">资源KEY:</th>
          <td class="i18nMessage-input-width">
            <ht-input
                v-model="i18nMessage.key_"
                autocomplete="off"
                :validate="{required:true,regex:{exp:'^[a-zA-Z][a-zA-Z0-9_-]+$',message:'只能输入字母、数字、下划线，且以字母开头'}}"
                :disabled="true"
            ></ht-input>
          </td>
        </tr>
        <tr>
          <th width="120px">资源:</th>
          <td>
            <table class="form-table I18nTable" cellspacing="0" cellpadding="0" border="0">
              <tbody>
              <tr>
                <th width="30%">类型</th>
                <th width="30%">描述</th>
                <th width="30%">资源值</th>
              </tr>
              <tr v-for="item in types" :key="item.id">
                <td>{{item.type}}</td>
                <td>{{item.desc}}</td>
                <td>
                  <ht-input v-model="item.val"></ht-input>
                </td>
              </tr>
              </tbody>
            </table>
          </td>
        </tr>
        </tbody>
      </table>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <ht-submit-button
          :url="savei18nMessageUrl()"
          :model="i18nMessage"
          :is-submit="isSubmit"
          request-method="POST"
          scope-name="editi18nMessageForm"
          @before-save-data="beforeSaveData"
          @after-save-data="afterSaveData"
      >{{$t('eip.common.save')}}</ht-submit-button>
      <el-button @click="dialogCancel('dialogVisible')">{{$t('eip.common.cancel')}}</el-button>
    </div>
    <ht-load-data
        :url="loadDataUrl"
        requestMethod="post"
        context="portal"
        @after-load-data="afterLoadData"
    ></ht-load-data>
  </el-dialog>
</template>

<script>
  export default {
    name: "",
    props:{
      messageKey:String
    },
    data(){
      return{
        i18nMessageTitle:"添加国际化信息",
        dialogVisible:false,
        i18nMessage:{
          key_:""
        },
        oldKey:"",
        isSubmit:false,
        loadDataUrl:"",
        types:[]
      }
    },
    methods:{
      handleClose(){
        this.dialogVisible = false;
      },
      handleOpen(){
        this.$nextTick(()=>{
          if (this.messageKey){
            this.loadDataUrl = "/i18n/custom/i18nMessage/v1/getI18nMessageJson?key=" + this.messageKey;
            this.dialogVisible = true;
          }else{
            this.$message("请选择需要修改的组件或绑定属性");
          }
        })
      },
      dialogCancel(){
        this.dialogVisible = false;
      },
      savei18nMessageUrl(){
        return (
          window.context.portal +
          "/i18n/custom/i18nMessage/v1/save" +
          "?oldKey=" +
          this.messageKey
        );
      },
      beforeSaveData(){
        this.isSubmit = true;
        this.i18nMessage.vals = "";
        this.i18nMessage.types = "";
        var noData = true;
        this.types.forEach(item => {
          this.i18nMessage.types = this.i18nMessage.types + item.type + ",";
          if (item.val && item.val != "") {
            noData = false;
            this.i18nMessage.vals = this.i18nMessage.vals + ",";
          } else {
            this.i18nMessage.vals = this.i18nMessage.vals + item.val + ",";
          }
        });
        if (noData) {
          this.$message.error("资源中资源值至少有一个！");
          this.isSubmit = false;
          return;
        }
        this.i18nMessage.key = this.i18nMessage.key_;
        this.i18nMessage.mesTypeInfo = this.types;
      },
      afterSaveData(){
        this.dialogVisible = false;
        let desc = "";
        for (let i=0;i<this.i18nMessage.mesTypeInfo.length;i++){
          if (this.i18nMessage.mesTypeInfo[i].type==='zh-CN'){
            desc = this.i18nMessage.mesTypeInfo[i].val;
          }
        }
        this.$emit("after-save",{key:"${"+this.i18nMessage.key_+"}",desc:desc,prop:this.i18nMessage.key_});
      },
      afterLoadData(data){
        this.i18nMessage = data;
        this.types = data.mesTypeInfo;
        if (!data.key){
          this.i18nMessage.key_ = this.messageKey;
        }
        // 编辑数据源
        if (this.dialogVisible) {
          setTimeout(() => this.$validator.validateAll("editi18nMessageForm"));
        }
      }
    }
  }
</script>

<style scoped>

</style>
