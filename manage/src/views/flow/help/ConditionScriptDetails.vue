<template>
  <el-container>
    <el-dialog
      title="选择人员脚本"
      :visible.sync="dialogVisible"
      width="70%"
      style="height: 800px"
      :close-on-click-modal="false"
      :before-close="handleClose"
    >
      <el-input placeholder="请输入名称、对象名" style="width: 355px;padding-bottom: 10px" v-model="searchData" class="input-with-select">
        <el-button slot="append" icon="el-icon-search" @click="searchScript"></el-button>
      </el-input>
      <el-table
              :data="scriptData"
              ref="table"
              height="410"
              style="width: 100%;margin-top: 8px">
        <el-table-column width="50">
          <template slot-scope="scope">
            <el-radio
                    v-model="conditionScriptIndex"
                    :label="scope.$index"
                    @change="getIndex(scope.row, scope.$index)"
            ><span></span
            ></el-radio>
          </template>
        </el-table-column>
        <el-table-column
                prop="methodName"
                label="方法名称"
                >
        </el-table-column>
        <el-table-column
                prop="classInsName"
                label="调用类对象名"
        >
        </el-table-column>
        <el-table-column
                prop="methodDesc"
                label="方法描述"
                >
        </el-table-column>
        <el-table-column type="expand" width="1">
          <template slot-scope="props">
            <el-form label-position="left" inline class="demo-table-expand">
              <el-row><el-col>
              <el-form-item label="脚本别名：">
                <span class="scriptAlias">{{ props.row.methodName }}</span><br>
              </el-form-item>
              </el-col></el-row>
              <el-row><el-col>
              <el-form-item label="脚本描述：">
                <span class="scriptDesc">{{ props.row.methodDesc }}</span>
              </el-form-item>
              </el-col></el-row>
              <el-form-item>
                <table
                        class="form-table"
                        cellspacing="0"
                        cellpadding="0"
                        border="0"
                        width="900px"
                >
                  <tbody>
                  <tr>
                    <th width="100px" style="text-align: center">名称</th>
                    <th width="200px" style="text-align: center">参数类型:</th>
                    <th width="230px" style="text-align: center">参数说明:</th>
                    <th width="390px" style="text-align: center">参数值:</th>
                  </tr>
                  <tr v-for="(item,index) in argument.argument" :key="index">
                    <td>
                      <span style="text-align: center">{{ item.paraName }}</span>
                    </td>
                    <td>
                      <span style="text-align: center">{{ item.paraType }}</span>
                    </td>
                    <td>
                      <span style="text-align: center">{{item.paraDesc}}</span>
                    </td>
                    <td>
                      <ht-select :options="options" v-model="selectKey" style="width: 78px;">
                      </ht-select>
                      <ht-input />
                    </td>
                  </tr>
                  </tbody>
                </table>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
      </el-table>

      <div slot="footer" class="dialog-footer">
        <el-button @click="testScript">确 定</el-button>
        <el-button @click="handleClose">取 消</el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
import flow from "@/api/flow.js";
export default {
  data() {
    return {
      dialogVisible: false,
      scriptData: [],
      conditionScriptIndex: 0,
      argument: [],
      options: [{key:1,value:'固定值'},{key:2,value:'变量'}],
      selectKey:'变量',
      searchData:''
    };
  },
  methods: {
    handleOpen() {
      this.dialogVisible = true;
      this.loadData();
    },
    handleClose() {
      this.dialogVisible = false;
      this.searchData='';
    },
    testScript(){
      alert(this.argument)
    },
    getIndex(row, index) {
      this.conditionScriptIndex = index;
      this.argument = {...row};
      this.argument.argument=JSON.parse(row.argument);
      let $table = this.$refs.table;
      this.scriptData.map((item) => {
        if (row.id != item.id) {
          $table.toggleRowExpansion(item, false)
        }
      })
      $table.toggleRowExpansion(row)
    },
    searchScript(){
      let param = {
        pageBean: {
          page: 1,
          showTotal: true
        },
        querys: [
          {
            property: "classInsName",
            value: this.searchData,
            group: "main",
            operation: "LIKE",
            relation: "OR"
          },
          {
            property: "methodName",
            value: this.searchData,
            group: "main",
            operation: "LIKE",
            relation: "OR"
          }
        ]
      };
      this.loadData(param)
    },
    loadData(param,cb) {
      if(param){
        flow
                .getConditionScriptList(param)
                .then(resp => {
                  this.scriptData = resp.data.rows;
                })
                .finally(() => cb());
      }else {
      flow
        .getConditionScriptList()
        .then(resp => {
          this.scriptData = resp.data.rows;
        })
        .finally(() => cb());
    }
    }
  }
};
</script>

<style scoped>
  .scriptAlias{
    height:15px;
    font-size:14px;
    font-family:Microsoft YaHei;
    font-weight:bold;
    color:rgba(28,28,28,1);
    line-height:30px;
  }
  .scriptDesc{
    height:14px;
    font-size:14px;
    font-family:Microsoft YaHei;
    font-weight:400;
    color:rgba(28,28,28,1);
    line-height:30px;
  }
  ::-webkit-scrollbar
  {
    width: 8px;  /*滚动条宽度*/
    height: 22.1909%;  /*滚动条高度*/
  }
  /*定义滚动条轨道 内阴影+圆角*/
  ::-webkit-scrollbar-track
  {
    -webkit-box-shadow: inset 0 0 6px rgba(193,193,193,1);
    border-radius: 4px;  /*滚动条的背景区域的圆角*/
    cursor: pointer;
    background-color: rgba(144,147,153,.3);/*滚动条的背景颜色*/
    transition: background-color .3s;
  }

  /*定义滑块 内阴影+圆角*/
  ::-webkit-scrollbar-thumb
  {
    border-radius: 4px;  /*滚动条的圆角*/
    -webkit-box-shadow: inset 0 0 6px rgba(193,193,193,1);
    cursor: pointer;
    background-color: rgba(144,147,153,.3);/*滚动条的背景颜色*/
    transition: background-color .3s;
  }
</style>
