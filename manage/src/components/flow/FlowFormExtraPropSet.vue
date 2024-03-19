<template>
  <div>
      <el-dialog title="映射字段配置" :visible.sync="dialogVisible" width="60%" appendToBody 
        :close-on-click-modal="false" top="10vh">
          <el-container>
            <el-main style="padding: 10px;height:380px">
                <table class="table"  cellspacing="0" style="border-spacing: 0;width: 100%;max-height: 400px;overflow: initial;text-align: center;">
                  <thead>								
                    <th style="width:20%">流程扩展字段</th>
                    <th style="width:50%">表单字段</th>	
                    <th v-if="hasSubTable" style="width:30%">子表取值下标</th>							
                  </thead>
                  <tbody>
                  <tr v-for="pro in propList" :key="pro.name">								
                    <td>
                      {{pro.name}}
                    </td>
                    <td>
                      <el-select @change="chooseField(pro)" desc="属性名称"  v-model="propConf[pro.name].field">
                          <el-option value="" >请选择</el-option>
                          <el-option-group :label="fields.desc" v-for="fields in boDefJson" :key="fields.desc">
                              <el-option v-show="!m.sub" :value="m.path+'.'+m.name" v-for="m in fields.children" :key="m.id" :label="m.desc"></el-option>
                          </el-option-group>
                      </el-select>
                    </td>
                    <td v-if="hasSubTable">
                      <el-input-number  v-if="propConf[pro.name].sub" v-model="propConf[pro.name].subIndex" :min="1" controls-position="right" style="width:150px" placeholder="默认取第一条"></el-input-number>
                    </td>									
                  </tr>
                  </tbody>
              </table>
            </el-main>
          </el-container>
          <span slot="footer" class="dialog-footer">
              <el-button type="primary" @click="handleClose" size="medium">确 定</el-button>
              <el-button @click="dialogVisible = false" size="medium">取 消</el-button>
            </span>
      </el-dialog>
  </div>
</template>

<script>
import flow from "@/api/flow.js";
import req from "@/request.js";
import { mapState, mapActions } from "vuex";
export default {
  data() {
    return {
        dialogVisible:false,
        propList : [{name:"prop1"},{name:"prop2"},{name:"prop3"},{name:"prop4"},{name:"prop5"},{name:"prop6"}],
        propConf : {prop1:{},prop2:{},prop3:{},prop4:{},prop5:{},prop6:{}},
        boDefJson:[],
        hasSubTable:false
    };
  },
  methods: {
    showDialog: function(param) {
      if (param.propConf) {
        let initConf = JSON.parse(param.propConf);
        for (const key in this.propConf) {
            if (initConf[key]) {
               this.propConf[key] = initConf[key];
            }
        }
      }
      let this_ =this;
      req.get(window.context.form+'/form/form/v1/getBoJsonByFormKey?formkey='+param.formkey).then(response => {
        let data = response.data;
        if(data){
            let  list = [];
            for(let index=0,pf;pf=data[index++];){
                list.push(pf);
                for(let s=0,f;f=pf.children[s++];){
                    //子表
                    if(f.children){
                        this_.hasSubTable = true;
                        f.sub=true;
                        list.push(f);
                    }
                }
            }
            this_.boDefJson = list;
        }
      });
      this.dialogVisible = true;
    },

    handleClose: function() {
      let pathArr = [];
      let repeatArr = [];
      let handelConf = {};
      for(let key  in  this.propConf){
          if(this.propConf[key].field && pathArr.indexOf(this.propConf[key].field) >-1){
              repeatArr.push(key);
          }else if(this.propConf[key].field){
              handelConf[key] = this.propConf[key];
              pathArr.push(this.propConf[key].field);
          }
      }
      if(repeatArr.length>0){
          this.$message.error("流程扩展字段"+repeatArr.join(',')+"映射的属性重复");
      }else{
          this.$emit('formPropSetConfirm',handelConf);
          this.dialogVisible = false;
      }
      
    },
    chooseField: function(prop) {
      if(this.propConf[prop.name].field && this.propConf[prop.name].field.indexOf('sub_')>-1){
          this.propConf[prop.name].sub = true;
      }else{
          this.propConf[prop.name].sub = false;
      }
    },
  }
};
</script>

<style  scoped>
div >>>.el-dialog__body{
  padding:10px ;
}

.table > thead > tr > th,.table > thead > th, .table > tbody > tr > th, .table > tfoot > tr > th, .table > thead > tr > td, .table > tbody > tr > td, .table > tfoot > tr > td {
    border-top: 1px solid #e7eaec;
    border-left: 1px solid #e7eaec;
    line-height: 1.42857;
    padding: 8px;
    vertical-align: middle;
}
.table{
  border-bottom: 1px solid #e7eaec;
  border-right: 1px solid #e7eaec;
}
.filed_body >>>.el-button{
  float: right;
}

</style>