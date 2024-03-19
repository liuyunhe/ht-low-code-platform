<template>
  <div class="fullheight">
    <el-form :inline="true" style="margin-bottom: 10px">
      <el-button type="primary" @click="add">添加</el-button>
    </el-form>
    <el-table
        style="width: 50%"
        :data="summaryField"
        border>
      <el-table-column label="字段名称">
        <template slot-scope="scope">
          <ht-input v-model="scope.row.name" clearable/>
        </template>
      </el-table-column>
      <el-table-column label="选择字段">
        <template slot-scope="scope">
          <el-select
              v-model="scope.row.field"
              @change="change($event,scope.row)">
            <el-option
                v-for="result in displaySettingFields"
                :key="result.name"
                :label="result.name"
                :value="result.name">
              <span style="float: left">{{ result.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ result.desc }}</span>
            </el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="方法">
        <template slot-scope="scope">
          <el-select v-model="scope.row.method" v-if="scope.row.type==='number' || scope.row.type==='bigint'">
            <el-option
               v-for="method in methods"
               :key="method.key"
               :label="method.value"
               :value="method.key"/>
          </el-select>
          <el-select v-model="scope.row.method" v-else>
            <el-option
                v-for="method in strMethods"
                :key="method.key"
                :label="method.value"
                :value="method.key"/>
          </el-select>

        </template>
      </el-table-column>
      <el-table-column label="保留小数位">
        <template slot-scope="scope">
          <ht-input v-model="scope.row.decimal" v-if="(scope.row.type==='number' || scope.row.type==='bigint') && methods.map(m => m.key).indexOf(scope.row.method)" clearable placeholder = "需要保留的小数位"/>
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
  export default {
    name: "summary-setting",
    props:{
      data:Object
    },
    data() {
      return {
        summaryField:[],
        displaySettingFields: [],
        resultFields: [],
        dataTemplate:{},
        methods:[
          { key: "count", value: "计数"},
          { key: "sum", value: "求和"},
          { key: "min", value: "最小值"},
          { key: "max", value: "最大值"},
          { key: "avg", value: "平均值"}
        ],
        strMethods:[{ key: "count", value: "计数"}]
      }
    },
    watch: {
      data : {
        handler(newVal, oldVal){
          this.init();
        },
        deep: true,
        immediate: true
      }
    },
    methods: {
      add(){
        this.summaryField.push({
          name: "",
          method: "",
          field: "",
          type: "",
          decimal: ""
        })
      },
      remove(index) {
        this.summaryField.splice(index, 1);
      },
      saveSummaryField(){
        this.dataTemplate.summaryField = this.summaryField ? JSON.stringify(this.summaryField) : null;
      },
      change(name,row){
        //切换字段，方法置空
        row.method ='';
        let result = this.displaySettingFields.find(field => field.name === name);
        this.$set(row,"type",result.type);
      },
      init(){
        if (this.data.displaySettingFields) {
          this.displaySettingFields = JSON.parse(this.data.displaySettingFields);
        }
        if (this.dataTemplate.summaryField) {
          this.summaryField = JSON.parse(this.dataTemplate.summaryField);
        }
      }
    },
    mounted() {
      this.dataTemplate = this.data.bpmDataTemplate;
      this.init();
    }
  }
</script>

<style scoped>

</style>
