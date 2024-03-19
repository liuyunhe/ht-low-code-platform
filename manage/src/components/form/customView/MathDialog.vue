<template>
  <div style="margin: -20px -10px">
    <el-container style="height:320px">
      <el-aside width="293px" style="border:1px solid #eee">
        <el-scrollbar class="scrollbar-fullheight">
          <ht-tree
            :data="[boDefData]"
            :props="defaultProps"
            :default-expand-all="expandAll"
            @node-click="handleNodeClick"
          >
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <i
                class="icon-number bo-tree__icon"
                title="数字类型的字段"
                v-if="data.columnType=='number'"
              />
              <i
                class="icon-text bo-tree__icon"
                title="字符串类型的字段"
                v-if="data.columnType=='varchar'"
              />
              <i class="icon-date bo-tree__icon" title="日期类型的字段" v-if="data.columnType=='date'" />
              <span class="bo-tree__label" :title="node.label">{{ node.label }}</span>
            </span>
          </ht-tree>
        </el-scrollbar>
      </el-aside>
      <el-main style="padding:0 0 0 20px">
        <el-tag type="warning">选择左侧的业务对象字段（数字类型），结合下方的运算符生成运算表达式。</el-tag>
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
                <el-button circle title="示为人民币大写" @click="insert('convertCurrency')">RMB</el-button>
              </el-col>
            </el-row>
          </div>
        </el-card>

        <el-card class="box-card operator-card" shadow="never">
          <div slot="header">
            <span>子表字段运算符</span>
          </div>
          <div>
            <el-row style="margin-top: 10px;" v-if="!countSetting.isSingleRecord">
              <el-col :span="5">
                <el-button circle title="求和" @click="insert('sum')">∑</el-button>
              </el-col>
              <el-col :span="5">
                <el-button circle title="取最大值" @click="insert('max')">Max</el-button>
              </el-col>
              <el-col :span="5">
                <el-button circle title="取最小值" @click="insert('min')">Min</el-button>
              </el-col>
              <el-col :span="5">
                <el-button circle title="取平均值" @click="insert('average')">均值</el-button>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-main>
    </el-container>

    <el-container>
      <el-main style="padding:0">
        <el-card class="box-card operator-card" shadow="never">
          <div slot="header">
            <span>运算表达式</span>
            <ht-checkbox
              style="float:right;font-size:12px;"
              v-model="countSetting.isSingleRecord"
              :options="[{key: 'true', value: '子表中单条记录运算'}]"
            />
          </div>
          <div>
            <el-input
              v-model="countSetting.mathExp"
              type="textarea"
              :rows="5"
              :cols="120"
              autocomplete="off"
              id="singleText"
            />
          </div>
        </el-card>
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
  name: "math-dialog",
  props: ["visible", "boDefData", "mathExp"],
  data() {
    return {
      expandAll: true,
      defaultProps: {
        children: "children",
        label: "desc"
      },
      countSetting: { isSingleRecord: "", mathExp: "" }
    };
  },
  mounted() {
    this.mathExpAssign(this.mathExp);
  },
  watch: {
    mathExp(val) {
      this.mathExpAssign(val);
    }
  },
  methods: {
    mathExpAssign(val) {
      this.$set(this.countSetting, "mathExp", val);
    },
    cancel() {
      this.$emit("update:visible", false);
    },
    confirm() {
      this.$emit("update:mathExp", this.countSetting.mathExp);
      try {
        if(this.$parent && this.$parent.$parent.setHotColumMathExp){
          this.$parent.$parent.setHotColumMathExp(this.countSetting.mathExp);
        }
      } catch (error) {}
      this.$emit("update:visible", false);
    },
    //统计函数相关配置
    async insert(myValue) {
      const myField = document.getElementById('singleText');
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
        this.countSetting.mathExp =
          myField.value.substring(0, startPos) +
          value +
          myField.value.substring(endPos, myField.value.length);
        await this.$nextTick(); // 这句是重点, 圈起来
        myField.focus();
        myField.setSelectionRange(
          endPos + value.length,
          endPos + value.length - endPosition
        );
      } else if(!this.countSetting.mathExp){
        this.countSetting.mathExp = value;
      }else{
        this.countSetting.mathExp += value;
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
    }
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
</style>
