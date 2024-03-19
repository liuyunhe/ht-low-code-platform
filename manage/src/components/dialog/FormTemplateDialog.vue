<template>
  <el-dialog
      title="选择表单模板"
      :visible.sync="dialogVisible"
      append-to-body
      class="urgent-text"
      :close-on-click-modal="false"
      width="520px"
    >
      <div style="max-height:500px;overflow: auto;">
        <el-form
          label-width="150px"
          ref="form"
        >
            <el-divider content-position="center">初始化模板</el-divider>
            <el-row style="text-align: center;">
              <el-radio-group v-model="templateType">
                <el-radio-button label="none">空模板</el-radio-button>
                <el-radio-button label="template">模板生成</el-radio-button>
              </el-radio-group>
            </el-row>
            <el-divider v-if="templateType=='template'" content-position="center">主表布局</el-divider>
            <el-row v-show="templateType=='template'" v-for="(ent, index) in getEntByType('main')" :key="'main'+index" :index="'main'+index">
                <ht-form-item label-width :label="ent.name">
                  <ht-select
                    filterable
                    v-model="ent.template"
                    :options="mainTemplates"
                    :props="{ key: 'alias', value: 'name' }"
                  ></ht-select>
                </ht-form-item>
                <ht-form-item label-width label="每行列数" v-show="formType=='pc'">
                  <ht-input size="mini" :min="1" :max="4" type="number" v-model="ent.column" /><span class="column-tip">（仅支持1~4列）</span>
                </ht-form-item>
            </el-row>

            <el-divider v-if="templateType=='template' && hasSub" content-position="center">子表布局</el-divider>
            <el-row v-show="templateType=='template'" v-for="(ent, index) in getEntByType('sub')" :key="'sub'+index" :index="'sub'+index">
                <ht-form-item label-width :label="ent.name">
                  <ht-select
                    filterable
                    v-model="ent.template"
                    :options="subTemplates"
                    :props="{ key: 'alias', value: 'name' }"
                  ></ht-select>
                </ht-form-item>
                <ht-form-item v-if="formType=='pc' && ent.template=='div'" label-width label="每行列数">
                  <ht-input size="mini" :min="1" :max="4" type="number" v-model="ent.column" /><span class="column-tip">（仅支持1~4列）</span>
                </ht-form-item>
            </el-row>

            <el-divider v-if="templateType=='template' && hasSun" content-position="center">孙表布局</el-divider>
            <el-row v-show="templateType=='template'" v-for="(ent, index) in getEntByType('sun')" :key="'sun'+index" :index="'sun'+index">
                <ht-form-item v-if="hasSun" label-width :label="ent.name">
                  <ht-select
                    filterable
                    v-model="ent.template"
                    :options="subTemplates"
                    :props="{ key: 'alias', value: 'name' }"
                  ></ht-select>
                </ht-form-item>
                <ht-form-item v-if="formType=='pc' && ent.template=='div'" label-width label="每行列数">
                  <ht-input size="mini" :min="1" :max="4" type="number" v-model="ent.column" /><span class="column-tip">（仅支持1~4列）</span>
                </ht-form-item>
            </el-row>

        </el-form>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onConfirm()">确定</el-button>
        <el-button @click="onCancel();">取 消</el-button>
      </div>
    </el-dialog>
</template>
<script>
import req from "@/request.js";
export default {
  name: "form-template-dialog",
  props: {
    formType: {
      type: String,
      default: 'pc'
    },
  },
  data() {
    return {
      dialogVisible: false,
      mainTemplates: [{alias:'grid',name:'栅格布局'},{alias:'table',name:'表格布局'}],
      subTemplates: [{alias:'table',name:'表格布局'},{alias:'div',name:'div布局'}],
      hasSub: false,
      hasSun: false,
      templateType: 'none',
      templateModel:{
        boDefId:'',
        entList: [],
      }
    };
  },
  methods: {
    showDialog(defIds) {
      this.dialogVisible = true;
      const isMobile = this.formType == 'mobile'?true:false;
      this.init(isMobile);
      this.templateModel.boDefId = defIds;
      let _this = this;
      req.get("${form}/bo/def/v1/getSubEntInfo?ids="+defIds+'&isMobile='+isMobile).then(data => {
        let response = data.data;
        _this.hasSub = response.hasSub;
        _this.hasSun = response.hasSun;
        _this.templateModel.entList = response.entList;
      });
    },
    init(isMobile) {
      this.hasSub = false;
      this.hasSub = false;
      this.templateType = 'none';
      if(isMobile){
        this.mainTemplates = [{alias:'grid',name:'栅格布局'}];
      }
      this.templateModel = {
        boDefId:'',
        entList: [],
      }
    },
    onConfirm() {
      if(this.templateType=='template'){
        this.$emit("onConfirm", {...this.templateModel});
      }else{
        this.$emit("onConfirm", null);
      }
      this.dialogVisible = false;
    },
    getEntByType(type){
      let ents = [];
      this.templateModel.entList.forEach(ent =>{
        if(ent.type == type){
          ents.push(ent);
        }
      });
      return ents;
    },
    cancelTemplate(){
      this.$emit("onConfirm", null);
      this.dialogVisible = false;
    },
    onCancel(){
      this.dialogVisible = false;
      this.$emit("onCancel");
    }
  }
};
</script>

<style lang="scss" scoped>
.column-tip{
  font-size: 12px;
  color: #FF0000;
}
</style>