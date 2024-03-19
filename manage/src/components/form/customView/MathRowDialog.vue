<template>
  <div style="margin: -20px -10px">
    <el-container style="height:220px">
      <el-main style="padding:0 0 0 20px">
        <el-tag type="warning">单列跨行统计函数说明：1、行号从1开始；2、编写规则：中括号包含行号+运算符；3、示例：（1）第一行乘以第二行除以100：[1]*[2]/100，</el-tag>
        <el-tag type="warning">（2）统计第1行到第20行的和：FormMath.sum([1:20])</el-tag>
        <el-card class="box-card operator-card" shadow="never">
          <div slot="header">
            <span>通用运算符</span>
          </div>
          <div>
            <el-row style="margin-top: 10px;">
              <el-col :span="5">
                <el-button circle title="加" @click="insert('+')">+</el-button>
              </el-col>
              <el-col :span="5">
                <el-button circle title="减" @click="insert('-')">－</el-button>
              </el-col>
              <el-col :span="5">
                <el-button circle title="乘" @click="insert('*')">×</el-button>
              </el-col>
              <el-col :span="5">
                <el-button circle title="除" @click="insert('/')">÷</el-button>
              </el-col>
              <el-col :span="4">
                <el-button circle title="括号" @click="insert('()')">()</el-button>
              </el-col>
            </el-row>

            <el-row style="margin-top: 20px;">
              <el-col :span="5">
                <el-button circle title="绝对值" @click="insert('abs')">|x|</el-button>
              </el-col>
              <el-col :span="5">
                <el-button circle title="四舍五入" @click="insert('round')">≈</el-button>
              </el-col>
              <el-col :span="5">
                <el-button circle title="开平方" @click="insert('sqrt')">开方</el-button>
              </el-col>
              <el-col :span="5">
                <el-button circle title="保留小数点后2位" @click="insert('tofixed')">保留</el-button>
              </el-col>
              <el-col :span="4">
                <el-button circle title="求和" @click="insert('sum')">∑</el-button>
              </el-col>
            </el-row>
          </div>
        </el-card>
        
      </el-main>
    </el-container>
    <el-container style="height:280px">
      <el-header style="height:30px;line-height:30px;background: #fafafa; font-weight: bold;font-size: 14px;">
        <el-button size="small" type="text" icon="el-icon-plus" @click="addMathExp()">添加</el-button>
      </el-header>
      <el-main style="padding:0 0 0 20px">
        <table class="form-table" cellspacing="0" cellpadding="0" border="0">
          <tbody>
            <tr class="linkageTable-tr">
              <td width="120px">描述</td>
              <td width="90px">统计行号(从1开始)</td>
              <td width="180px">公式</td>
              <td width="150px">操作</td>
            </tr>

            <tr
              class="linkageTable-tr"
              v-for="(field, index) in countSetting.rowMathExps"
              :key="index" @click="rowClick(index)"
            >
              <td><ht-input v-model="field.desc" /></td>
              <td><el-input-number v-model="field.sn" controls-position="right" :min="0" :max="1000"></el-input-number></td>
              <td>
                <el-input
                  v-model="field.mathExp"
                  type="textarea"
                  :rows="2"
                  :cols="60"
                  autocomplete="off"
                  :id="index+'_singleText'"
                />
              </td>
              <td>
                <el-button
                  icon="el-icon-delete"
                  @click="mathExpRemove(field)"
                ></el-button>
                <el-button size="small"
                  icon="el-icon-arrow-up"
                  @click="up(index,countSetting.rowMathExps)"
                ></el-button>
                <el-button 
                   icon="el-icon-arrow-down"
                   @click="down(index,countSetting.rowMathExps)"
                ></el-button>
              </td>
            </tr>
          </tbody>
        </table>
      </el-main>
    </el-container>
    <div slot="footer" class="dialog-footer" style="margin-top:20px;text-align:right;">
      <el-button type="primary" @click="confirm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </div>
</template>
<script>
export default {
  name: "math-row-dialog",
  props: ["visible", "boDefData", "rowMathExp","boSubEntity","subTables"],
  data() {
    return {
      expandAll: true,
      defaultProps: {
        children: "children",
        label: "desc"
      },
      countSetting: { isSingleRecord: false, rowMathExps: [] },
      curMathExp:'',
      curMathExpIndex:-1,
    };
  },
  mounted() {
    this.mathExpAssign(this.rowMathExp);
  },
  watch: {
    mathExp(val) {
      this.mathExpAssign(val);
    },
  },
  methods: {
    mathExpAssign(val) {
      if(!val){
        val = [];
      }
      this.$set(this.countSetting, "rowMathExps", val);
    },
    cancel() {
      this.$emit("update:visible", false);
    },
    confirm() {
      this.$emit("update:rowMathExp", this.countSetting.rowMathExps);
      try {
        if(this.$parent && this.$parent.$parent.setHotColumRowMathExp){
          this.$parent.$parent.setHotColumRowMathExp(this.countSetting.rowMathExps);
        }
      } catch (error) {}
      this.$emit("update:visible", false);
    },
    //统计函数相关配置
    async insert(myValue) {
      const cindex = this.curMathExpIndex;
      const myField = document.getElementById(cindex+'_singleText');
      var value = myValue;
      var endPosition = 0;
      if (myValue == "abs") {
        value = "FormMath.abs()";
        endPosition = 1;
      } else if (myValue == "round") {
        value = "FormMath.round()";
        endPosition = 1;
      } else if (myValue == "sqrt") {
        value = "FormMath.sqrt()";
        endPosition = 1;
      } else if (myValue == "tofixed") {
        endPosition = 3;
        value = "FormMath.tofixed(,2)";
      } else if (myValue == "convertCurrency") {
        value = "FormMath.convertCurrency()";
        endPosition = 1;
      } else if (myValue == "()") {
        endPosition = 1;
      } else if (myValue == "sum") {
        value = "FormMath.sum()";
        endPosition = 1;
      } else if (myValue == "max") {
        value = "FormMath.max()";
        endPosition = 1;
      } else if (myValue == "min") {
        value = "FormMath.min()";
        endPosition = 1;
      } else if (myValue == "average") {
        value = "FormMath.average()";
        endPosition = 1;
      }
      if (myField.selectionStart || myField.selectionStart === 0) {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        this.curMathExp =
          myField.value.substring(0, startPos) +
          value +
          myField.value.substring(endPos, myField.value.length);
        await this.$nextTick(); // 这句是重点, 圈起来
        myField.focus();
        myField.setSelectionRange(
          endPos + value.length,
          endPos + value.length - endPosition
        );
      }
      if(!this.countSetting.rowMathExps[cindex]['mathExp']){
        this.countSetting.rowMathExps[cindex]['mathExp'] = value;
      }else{
        this.countSetting.rowMathExps[cindex]['mathExp'] += value;
      }
    },
    handleNodeClick(data, treeNode) {
      if (data.dataType != "number") {
        this.$message({ message: "请选择数字类型的字段！ ", type: "warning" });
        return;
      }
      var isMain = treeNode.parent.data.nodeType == "main";
      var path = "data." + data.path + "." + data.name;
      if (!isMain && this.countSetting.isSingleRecord) {
        path = "item." + data.name;
      }

      if (isMain && this.countSetting.isSingleRecord) {
        this.$message({
          message: "子表中单条记录运算模式下,不能选择主表字段!",
          type: "warning"
        });
        return;
      }
      var desc = "";
      if (isMain || this.countSetting.isSingleRecord) {
        desc = "{" + data.desc + "(" + path + ")" + "}";
      } else {
        desc = "[{" + data.desc + "(" + path + ")" + "}]";
      }
      this.insert(desc);
    },
    addMathExp(){
      this.countSetting.rowMathExps.push({desc:'',mathExp:''});
    },
    rowClick(index){
      this.curMathExpIndex = index;
      this.curMathExp = this.countSetting.rowMathExps[index]['mathExp'];
    },
    mathExpRemove(item){
      this.countSetting.rowMathExps.remove(item);
    },
    up(index, data) {
      if (index === 0) {
        this.$message({
          message: "已经是列表中第一位",
          type: "warning"
        });
      } else {
        let temp = data[index - 1];
        Vue.set(data, index - 1, data[index]);
        Vue.set(data, index, temp);
      }
    },
    down(index, data) {
      if (index === data.length - 1) {
        this.$message({
          message: "已经是列表中最后一位",
          type: "warning"
        });
      } else {
        this.isTransition = true;
        let i = data[index + 1];
        Vue.set(data, index + 1, data[index]);
        Vue.set(data, index, i);
      }
    },
  }
};
</script>
<style lang="scss" scoped>
.operator-card {
  margin-top: 10px;
}

.operator-card >>> .el-card__header,
.operator-card >>> .el-card__body {
  padding: 10px;
}

.operator-card >>> .el-card__header {
  background: #fafafa;
  color: #777;
  font-size: 14px;
  font-weight: bold;
}

.operator-card .el-button {
  width: 32px;
  height: 32px;
  padding: 0;
  line-height: 32px;
  text-align: center;
  color: #777;
  font-weight: bold;
}

.bo-tree__label {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.bo-tree__icon {
  outline: 2px solid #999;
}

.bo-tree__icon + .bo-tree__label {
  margin-left: 8px;
}
.form-table>tfoot>tr>td, .form-table>thead>tr>th{
  padding: 5px;
}
</style>
