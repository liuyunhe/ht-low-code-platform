<template>
  <div class="fullheight">
    <el-form :inline="true" >
      <el-button type="primary" @click="add">添加</el-button>

      <ht-form-item label="树形对话框">
        <ht-page-select
            v-model="value"
            @change="changeEvent"
            :remote-method="loadOptions"
            :options="options"
            placeholder="请选择"
            :pagination="pageResult"
            :prop="{label:'name',value:'alias'}"/>
      </ht-form-item>
      <el-button type="danger" @click="del">删除</el-button>
    </el-form>
    <el-table
        style="width: 50%"
        :data="treeField.querys"
        border>
      <el-table-column type="selection" width="55"/>
      <el-table-column label="查询字段">
        <template slot-scope="scope">
          <el-select v-model="scope.row.key_">
            <el-option
              v-for="result in displaySettingFields"
              :key="result.name"
              :label="result.name"
              :value="result.name"/>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="value_" label="对话框字段">
        <template slot-scope="scope">
          <el-select v-model="scope.row.value_">
            <el-option
                v-for="result in resultFields"
                :key="result.field"
                :label="result.field"
                :value="result.field"/>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="danger" icon="el-icon-delete" @click="remove(scope.$index)"></el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import form from "@/api/form.js";
  const htPageSelect = () => import("@/components/common/HtPageSelect.vue");
  export default {
    name: "filter-tree-setting",
    components:{
      htPageSelect
    },
    props:{
      data:Object
    },
    data(){
      return {
        value:"",
        options:[],
        pageResult:{
          pageSize: 5,
          page: 0,
          total: 0
        },
        resultFields:[],
        value1:"",
        displaySettingFields:[],
        treeField:{},
        dataTemplate:{}
      }
    },
    mounted() {
      this.dataTemplate = this.data.bpmDataTemplate;
      if (this.data.displaySettingFields) {
        this.displaySettingFields = JSON.parse(this.data.displaySettingFields);
      }
      if (this.dataTemplate.treeField){
        this.treeField = JSON.parse(this.dataTemplate.treeField);
        this.value = this.treeField.alias;
        let param = {pageBean:{pageSize:1,page:1,total:0},querys:[]};
        param.querys.push({
          property: "style",
          value: 1,
          group: "filter",
          relation: "AND",
          operation: "EQUAL",
        });
        param.querys.push({
          property: "alias",
          value: this.treeField.alias,
          group: "filter",
          relation: "AND",
          operation: "EQUAL",
        })
        form.getCustomDialogList(param).then(data=>{
          if (data.rows[0]){
            this.resultFields = JSON.parse(data.rows[0].resultfield);
          }
        })
      }
    },
    methods:{
      changeEvent(data,obj){
        this.treeField.alias = data;
        this.treeField.showField = JSON.parse(obj.displayfield).displayName;
        this.treeField.querys = [];
        this.resultFields = JSON.parse(obj.resultfield);
      },
      loadOptions(param,cb){
        param.querys.push({
          property: "style",
          value: 1,
          group: "filter",
          relation: "AND",
          operation: "EQUAL",
        });
        form.getCustomDialogList(param).then(data=>{
          this.options = data.rows;
          this.pageResult = {
            pageSize: data.pageSize,
            page: data.page,
            total: data.total
          }
        }).finally(()=>{
          cb && cb();
        });
      },
      add(){
        if(!this.treeField.alias){
          this.$message.warning("请选择树形对话框");
          return;
        }
        this.treeField.querys.push({
          key_:"",
          value_:""
        })
      },
      del(){
        this.value="";
        this.treeField.alias = "";
        this.treeField.showField = [];
        this.treeField.querys = [];
        this.resultFields = [];
      },
      remove(index) {
        this.treeField.querys.splice(index, 1);
      },
      saveFilterTreeField(){
        this.dataTemplate.treeField = this.treeField
          ? JSON.stringify(this.treeField)
          : null;
      }
    }
  };
</script>

<style scoped>

</style>
