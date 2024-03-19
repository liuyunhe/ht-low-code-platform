<template>
  <el-dialog title="子表导入数据合并编辑器" :visible.sync="dialogVisible" width="600px" :append-to-body="true"  :close-on-click-modal="false">
    <div v-if="dialogVisible">
      <codemirror v-model="funcExp" :options="cmOptions" class="code" id="singleText"></codemirror>
      <p class="help-tag">
        在编辑器中可以编写JS代码，实现子表导入时原有数据和导入数据的合并处理逻辑。
        需要定义一个JS方法，该方法有两个入参，第一个入参为原有数据（类型为数组），
        第二个参数为导入的数据（类型为数组），该方法需要返回一个新的数组。示例代码如下：
      </p>
      <pre>
      function(rows, importRows){
        //TODO 数据合并的逻辑处理，例如简单的合并两个数组
        const newRows = rows.concat(importRows);
        return newRows;
      }
      </pre>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="sure">确定</el-button>
      <el-button @click="dialogVisible=false">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { codemirror } from "vue-codemirror";
const Base64 = require("js-base64").Base64;

export default {
  name: "sub-import-merge-dialog",
  components: {
    codemirror,
  },
  props: ["expression"],
  data() {
    return {
      funcExp: null,
      dialogVisible: false,
      cmOptions: {
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
        inputStyle: "textarea",
      },
    };
  },
  watch: {
    dialogVisible: {
      handler: function (newVal) {
        if (newVal) {
          if (this.expression) {
            try {
              this.funcExp = Base64.decode(this.expression);
            } catch (err) {}
          }
        } else {
          this.funcExp = null;
        }
      },
      immediate: true,
    },
  },
  methods: {
    // 打开对话框
    open() {
      this.dialogVisible = true;
    },
    // 点击确定按钮
    sure() {
      const expInBase64 = Base64.encode(this.funcExp);
      this.$emit("updateExpression", expInBase64);
      this.dialogVisible = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
@import "@/assets/css/form-editor.scss";

.help-tag {
  display: block;
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #faecd8;
  background: #fdf6ec;
  color: #e6a23c;
  border-radius: 5px;
  font-size: 13px;
  line-height: 19px;
}

.code >>> .CodeMirror {
  font-family: monospace;
  height: 200px !important;
  color: black;
  direction: ltr;
}
</style>
