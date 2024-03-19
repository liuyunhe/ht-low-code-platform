<template>
  <el-dialog
      title="设置列"
      :visible="dialogVisible"
      :before-close="beforeClose"
      :close-on-click-modal="false"
      append-to-body
      width="80%">
    <el-row v-loading="loading">
      <el-col :span="7" class="height">
        <el-card class="box-card" shadow="never" style="height: 100%;">
          <div slot="header">
            <span>获取字段信息</span>
          </div>
          <div>
            <el-table
                :data="table"
                height="420"
                @selection-change="handleSelectionChange">
              <el-table-column
                  type="selection">
              </el-table-column>
              <el-table-column
                  prop="fieldName"
                  label="字段">
              </el-table-column>
              <el-table-column
                  label="注解">
                <template slot-scope="scope">{{ scope.row.comment }}</template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
      <el-col :span="2" class="height">
        <el-button @click="addToField" style="position: relative;top:50%;left: 25%" type="primary" icon="el-icon-right" circle/>
      </el-col>
      <el-col :span="15" class="height">
        <el-card class="box-card" shadow="never" style="height: 100%">
          <div slot="header">
            <span>字段设置</span>
          </div>
          <div>
            <el-tabs type="card" v-model="activeName">
              <el-tab-pane label="Y轴取值字段" name="yAxis">
                <el-table
                    :data="yAxisField"
                    height="400">
                  <el-table-column
                      label="字段名"
                      prop="field">
                  </el-table-column>
                  <el-table-column
                      label="显示名">
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.comment" clearable maxlength="50"/>
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="回归曲线"
                    v-if="chartStyle===6">
                    <template slot="header">
                      回归曲线
                      <el-tooltip class="item" effect="dark" content="注：在数据展示中选择列数据展示与数值轴时才生效" placement="top-start">
                        <i class="el-icon-warning"></i>
                      </el-tooltip>
                    </template>
                    <template slot-scope="scope">
                      <ht-select
                          v-model="scope.row.regression"
                          :options="[{key:'none',value:'无'},{key:'linear',value:'线性回归'},{key:'exponential',value:'指数回归'},{key:'logarithmic',value:'对数回归'}]"/>
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="类型"
                    v-if="chartStyle===1 || chartStyle===2">
                    <template slot-scope="scope">
                      <ht-select
                          v-model="scope.row.yAxis"
                          :options="[{label:'第一Y轴',value:1},{label:'第二Y轴',value:2}]"
                          :validate="{required:true}"
                          :props="{key:'value',value:'label'}"/>
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="轴"
                    v-if="chartStyle===1 || chartStyle===2">
                    <template slot-scope="scope">
                      <ht-select
                          v-model="scope.row.type"
                          :options="[{label:'折线图',value:'line'},{label:'柱状图',value:'bar'}]"
                          :validate="{required:true}"
                          :props="{key:'value',value:'label'}"/>
                    </template>
                  </el-table-column>
                  <el-table-column
                      label="管理">
                    <template slot-scope="scope">
                      <el-button icon="el-icon-close" type="primary" @click="deleteRow(scope.$index,yAxisField)"/>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="X轴取值字段" name="xAxis">
                <el-table
                    :data="xAxisField"
                    height="400">
                  <el-table-column
                      label="字段名"
                      prop="field">
                  </el-table-column>
                  <el-table-column
                      label="显示名">
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.comment" clearable maxlength="50" show-word-limit/>
                    </template>
                  </el-table-column>
                  <el-table-column
                      label="管理">
                    <template slot-scope="scope">
                      <el-button icon="el-icon-close" type="primary" @click="deleteRow(scope.$index,xAxisField)"/>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="条件字段" name="condition">
                <el-table
                    :data="conditionField"
                    height="400">
                  <el-table-column
                      prop="field"
                      label="字段名"
                      width="70">
                  </el-table-column>
                  <el-table-column
                      label="显示名">
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.comment" maxlength="50" clearable/>
                    </template>
                  </el-table-column>
                  <el-table-column
                      label="条件">
                    <template slot-scope="scope">
                      <ht-select
                          v-model="scope.row.condition"
                          :options="numberOptionList"
                          :props="{key:'key',value:'value'}"
                          v-if="scope.row.dbType==='number' || scope.row.dbType==='int'"/>
                      <ht-select
                          v-model="scope.row.condition"
                          :options="stringOptionList"
                          :props="{key:'key',value:'value'}"
                          v-if="scope.row.dbType==='varchar' || scope.row.dbType==='clob'"/>
                      <ht-select
                          v-model="scope.row.condition"
                          :options="dateOptionList"
                          :props="{key:'key',value:'value'}"
                          v-if="scope.row.dbType==='date'"/>
                    </template>
                  </el-table-column>
                  <el-table-column
                      label="值来源">
                    <template slot-scope="scope">
                      <ht-select
                          v-model="scope.row.defaultType"
                          :options="valueSourceList"
                          :props="{key:'key',value:'value'}"/>
                    </template>
                  </el-table-column>
                  <el-table-column
                      label="默认值"
                      width="200">
                    <template slot-scope="scope">
                      <span v-if="scope.row.defaultType==='1'">文本框输入</span>
                      <ht-input
                          v-model="scope.row.defaultValue"
                          :maxlength="50"
                          :showWordLimit="true"
                          v-if="(scope.row.defaultType=='2'&&scope.row.dbType!='date')||scope.row.defaultType==='3'"/>
                      <ht-date v-model="scope.row.defaultValue" format="yyyy-MM-dd" v-if="scope.row.defaultType==='2' && scope.row.dbType==='date'"/>
                      <span v-if="scope.row.defaultType==='2' && scope.row.dbType==='date' && scope.row.condition==='BETWEEN'">
                        至
                        <ht-date v-model="scope.row.endDate" format="yyyy-MM-dd" />
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column
                      label="管理"
                      width="70">
                    <template slot-scope="scope">
                      <el-button icon="el-icon-close" type="primary" @click="deleteRow(scope.$index,conditionField)"/>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="排序字段" name="sort">
                <el-table
                  :data="sortField"
                  height="400">
                  <el-table-column
                    prop="field"
                    label="字段"/>
                  <el-table-column
                    label="排序类型">
                    <template slot-scope="scope">
                      <ht-select
                          v-model="scope.row.sortType"
                          :options="sortOptionList"
                          :props="{key:'key',value:'value'}"/>
                    </template>
                  </el-table-column>
                  <el-table-column
                      label="管理"
                      width="70">
                    <template slot-scope="scope">
                      <el-button icon="el-icon-close" type="primary" @click="deleteRow(scope.$index,sortField)"/>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="save">{{
        $t("eip.common.save")
        }}</el-button>
      <el-button @click="dialogVisible = false">{{
        $t("eip.common.cancel")
        }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import form from "@/api/form.js";
  import utils from "@/hotent-ui-util.js";
  export default {
    props:{
      param: Object,
      yAxis: Array,
      xAxis: Array,
      sort:Array,
      condition: Array,
      chartStyle:Number
    },
    data(){
      return {
        dialogVisible:false,
        table:[],
        selections:[],
        xAxisField:[],
        yAxisField:[],
        conditionField:[],
        sortField:[],
        loading:false,
        activeName:"yAxis",
        numberOptionList:[
          {
            key:'EQ',
            value:'等于'
          },
          {
            key:"GE",
            value:'大于等于'
          },
          {
            key:"LE",
            value:'小于等于'
          },
        ],
        stringOptionList:[
          {
            key:"LK",
            value:"like"
          },
          {
            key:"EQ",
            value:"等于"
          },
          {
            key:"IN",
            value:"in"
          }
        ],
        dateOptionList:[
          {
            key:'EQ',
            value:'等于'
          },
          {
            key:"BETWEEN",
            value:'between'
          },
          {
            key:"GE",
            value:'大于等于'
          },
          {
            key:"LE",
            value:'小于等于'
          }
        ],
        valueSourceList:[
          {
            key:"2",
            value:'固定值'
          },
          {
            key:"1",
            value:'动态传入'
          }
        ],
        sortOptionList:[
          {
            key:"asc",
            value:"升序"
          },
          {
            key:"desc",
            value:"降序"
          }
        ]
      }
    },
    methods:{
      async initData(){
        let result = await form.getTable(this.param);
        this.yAxisField = [...this.yAxis];
        this.xAxisField = [...this.xAxis];
        this.conditionField = [...this.condition];
        this.sortField = [...this.sort];
        this.table = result.table.columnList;
      },
      handleSelectionChange(val){
        this.selections = val;
      },
      addToField(){
        if (this.activeName==="yAxis"){
          this.addToYAxisField();
        }else if (this.activeName==="xAxis"){
          this.addToXAxisField();
        }else if (this.activeName==="condition"){
          this.addToConditionField();
        }else if (this.activeName==="sort"){
          this.addToSortField();
        }
      },
      addToYAxisField(){
        for (let i=0;i<this.selections.length;i++) {
          let item = {
            comment:this.selections[i].comment,
            dbType:this.selections[i].columnType,
            field:this.selections[i].fieldName,
            nameKey:"0"
          };
          if (this.chartStyle===1){
            item.type="line";
            item.yAxis=1;
          }
          this.yAxisField.push(item);
        }
        this.yAxisField = this.yAxisField.unique("field");
      },
      addToXAxisField(){
        let item = [{
          comment:this.selections[0].comment,
          dbType:this.selections[0].columnType,
          field:this.selections[0].fieldName,
          nameKey:"0"
        }];
        this.xAxisField = [...item];
      },
      addToConditionField(){
        for (let i=0;i<this.selections.length;i++) {
          let item = {
            comment:this.selections[i].comment,
            dbType:this.selections[i].columnType,
            field:this.selections[i].fieldName,
            condition:"LK",
            defaultType:"1",
            defaultValue:""
          };
          this.conditionField.push(item);
        }
        this.conditionField = this.conditionField.unique("field");
      },
      addToSortField(){
        for (let i=0;i<this.selections.length;i++) {
          let item = {
            field:this.selections[i].fieldName,
            sortType:"asc"
          };
          this.sortField.push(item);
        }
        this.sortField = this.sortField.unique("field");
      },
      deleteRow(index, rows) {
        rows.splice(index, 1);
      },
      save(){
        this.$emit("save",{yAxisField:this.yAxisField,xAxisField:this.xAxisField,conditionField:this.conditionField,sortField:this.sortField});
        this.dialogVisible = false;
      },
      beforeClose(){
        this.dialogVisible = false;
      },
      handleOpen(){
        this.dialogVisible = true;
        this.loading = true;
        this.$nextTick(()=>{
          this.initData();
        });
        this.loading = false;
      }
    }
  }
</script>

<style scoped>
.height{
  height: 500px;
}
</style>
