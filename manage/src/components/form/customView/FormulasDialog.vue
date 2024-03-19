<template>
  <el-dialog
    title="公式编辑"
    :close-on-click-modal="false"
    :visible.sync="formulasDialogVisible"
    width="80%"
    :append-to-body="true"
  >
    <div v-if="formulasDialogVisible">
      <el-row>
        <el-col :span="3" v-if="nodeType!=='sun'">
          <el-checkbox v-model="checked" style="margin-left: 10px">子表单列运算</el-checkbox>
        </el-col>
        <el-col :span="21" style="font-size:14px;margin-bottom: 10px;">
          当前选中字段:
          <el-tag type="danger">{{field.desc}}</el-tag>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <!-- <el-input
          type="textarea"
          :rows="2"
          placeholder="请输入内容"
          v-model="formulasDiyJs"
          id="singleText"
          ></el-input>-->
          <codemirror
            ref="mycode2"
            v-model="formulasDiyJs"
            :options="cmOptions2"
            class="code"
            id="singleText"
          ></codemirror>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 15px;">
        <el-col :span="8">
          变量
          <el-card shadow="never">
            <div style="height:300px;overflow-y:auto">
              <el-tree
                :data="[boDefData]"
                :props="defaultProps"
                :default-expand-all="expandAll"
                @node-click="handleNodeClick"
                ref="varTree">
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
                  <i
                    class="icon-date bo-tree__icon"
                    title="日期类型的字段"
                    v-if="data.columnType=='date'"
                  />
                  <span class="bo-tree__label" :title="node.label">{{ node.label }}</span>
                </span>
              </el-tree>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          函数
          <el-card shadow="never">
            <div style="height:300px;overflow-y:auto">
              <el-tree
                :data="functionData"
                :default-expand-all="false"
                @node-click="functionNodeClick"
                :filter-node-method="filterNode"
                ref="funcTree"
              >
                <span
                  class="custom-tree-node"
                  slot-scope="{ node, data }"
                  style="width:100%;"
                  @mouseenter="mouseenter(data)"
                  @mouseleave="mouseleave(data)"
                >
                  <span>{{ node.label }}</span>
                </span>
              </el-tree>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          帮助
          <el-card shadow="never">
            <div style="height:300px;overflow-y:auto;">
              <div style="white-space:pre;font-size:12px;line-height: 20px;">{{helpDesc}}</div>
              <span style="font-size:16px;color: red;">注意事项:</span>
              <div style="font-size:12px;line-height: 20px;">
                1.此功能使用VUE自定义指令为底层实现,写法遵循VUE指令写法,指令会实时监听文本表达式的值改变,一但改变会把表达式式最终值赋值给对应字段
                <br />2.不可字段之间互相引用,例:字段a的公式中包含了字段b,字段b的公式中就不可再包含字段a了,不然会发生页面死循环
                <br />3.配置完公式后,请务必在浏览器开发者模式进行多次调试,以确保公式语法正确!
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
     </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleClose('true')">确 定</el-button>
        <el-button @click="handleClose('close')">取 消</el-button>
      </span>

  </el-dialog>
</template>
<script>
import { codemirror } from "vue-codemirror";
require("codemirror/mode/python/python.js");
require("codemirror/addon/fold/foldcode.js");
require("codemirror/addon/fold/foldgutter.js");
require("codemirror/addon/fold/brace-fold.js");
require("codemirror/addon/fold/xml-fold.js");
require("codemirror/addon/fold/indent-fold.js");
require("codemirror/addon/fold/markdown-fold.js");
require("codemirror/addon/fold/comment-fold.js");
import {config} from '@/api/formulasConfig.js'
export default {
  name: "formulas-dialog",
  components: {
    codemirror
  },
  props: ["boDefData", "field"],
  mounted() {},
  watch: {
    field(val) {
      this.formulasDiyJs = val.options.formulasDiyJs;
    },
    checked(val){
      this.$refs.funcTree.filter(val);
    }
  },
  methods: {
    mouseenter(data) {
      if (data.helpDesc) {
        this.helpDesc = data.helpDesc;
      }
    },
    mouseleave(data) {},
    handleClose(type) {
      if (type !== "close") {
        this.field.options.formulasDiyJs = this.formulasDiyJs;
      }
      this.formulasDialogVisible = false;
    },
    functionNodeClick(data, treeNode) {
      if (this.checked){
        if (data.subValue){
          this.insert(data.subValue, 1);
          return;
        }
      }
      this.insert(data.value, 1);
    },
    handleNodeClick(data, treeNode) {
      //不可自己计算自己
      if (data.path + "." + data.name === this.field.fieldPath) {
        this.$message("无法运算字段本身");
        return;
      }
      if (!data.nodeType || data.nodeType!=='field'){
        this.$message("选项不是字段");
        return;
      }
      if (!(data.path && data.path.split('.').length<2) && !this.checked && this.nodeType==='main'){
        this.$message("不可选子表、孙表字段");
        return;
      }
      if (!(data.path && data.path.split('.').length!==2) && this.nodeType==='sun'){
        this.$message("不可选子表字段");
        return;
      }
      if(data.path.split('.').length==2 && data.path.split('.sub_')[1]!=this.field.tableName && this.nodeType!=='main' ){
        this.$message("不可选其他子表");
        return;
      }
      let isMain = treeNode.parent.data.nodeType == "main";
      let path = "data." + data.path + "." + data.name;
      let dataPaths = data.path.split(".");
      if (!isMain) {
        if (this.checked){
          if (dataPaths.length===3){
            path = "{ data: data."+dataPaths[0]+"."+dataPaths[1]+"[index]."+dataPaths[2]+",path: '"+data.name+"'}";
          }else{
            path = "{ data: data."+ data.path + ", path: '" + data.name +"' }";
          }
        }else{
          path = "item." + data.name;
        }
      }
      this.insert(path);
    },
    //统计函数相关配置
    async insert(myValue, lineIndex) {
      const myField = this.$refs.mycode2;

      myField.codemirror.replaceSelection(myValue);
      let line = myField.codemirror.doc.getCursor();
      if (lineIndex) {
        line.ch = line.ch - lineIndex;
        myField.codemirror.doc.setCursor(line);
      }
      myField.codemirror.display.input.focus();
    },
    handleOpen() {
      this.formulasDialogVisible = true;
      if (!this.field.parentNodeType){
        this.nodeType = "main";
      }else {
        this.nodeType = this.field.parentNodeType;
      }
      this.formulasDiyJs = this.field.options.formulasDiyJs;
      this.checked = false;
    },
    filterNode(value, data){
      if (this.checked){
        return data.subValue;
      }
      return true;
    }
  },
  data() {
    return {
      helpDesc: "",
      expandAll: true,
      formulasDialogVisible: false,
      formulasDiyJs: this.field.options.formulasDiyJs,
      cmOptions2: {
        showCursorWhenSelecting: true,
        value: "",
        mode: "javascript",
        readOnly: false,
        smartIndent: true,
        tabSize: 2,
        theme: "base16-light",
        lineNumbers: true,
        line: true,
        autofocus: true,
        inputStyle: "textarea"
      },
      defaultProps: {
        children: "children",
        label: "desc"
      },
      functionData: config,
      checked: false,
      nodeType: ""
    };
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
@import "@/assets/css/form-editor.scss";

.code >>> .CodeMirror {
  font-family: monospace;
  height: 100px !important;
  color: black;
  direction: ltr;
}
</style>
