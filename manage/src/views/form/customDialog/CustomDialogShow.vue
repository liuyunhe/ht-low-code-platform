<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    :close-on-click-modal="false"
    :append-to-body="true"
    top="6vh"
    class="manage-dialog__wrap"
  >
    <custom-dialog-show-detail
      v-if="dialogVisible"
      ref="customDialogShowDetail"
      :alias="alias"
      :custom-dialog="customDialog"
      @orgRowClick="orgRowClick"
    />
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleSave">确 定</el-button>
      <el-button @click="handleClose">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { Message } from "element-ui";
import req from "@/request.js";
import CustomDialogShowDetail from "@/views/form/customDialog/CustomDialogShowDetail.vue";
export default {
  name: "custom-dialog-show",
  components: { CustomDialogShowDetail },
  props: {
    title: {
      type: String,
      required: true,
      default: "自定义对话框列表预览"
    },
    //自定义对话框的别名
    alias: {
      type: String,
      required: true
    },
    //自定义对话框的配置
    customDialog: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      customDialogPostParam: [], //为REST接口且请求类型是POST，条件字段是固定值的参数
      customDialogGetUrl: "", //为REST接口且请求类型是GET，条件字段是固定值的请求地址
      selectionRadio: [], //ht-table列表单选选择的数据
      textRadio: "", //ht-table列表数据的单选按钮
      selectable: true, //表示ht-table列表第一列是否显示复选框
      isShowSearch: false, //是否显示高级搜索
      nopagination: false, //是否隐藏分页组件，false：显示，true：隐藏
      dialogVisible: false, //是否显示对话框
      tableData: [], //ht-table列表数据
      pageResult: {
        page: 1,
        pageSize: 20,
        total: 0
      }
    };
  },
  methods: {
    //显示对话框
    showDialog() {
      this.customDialogPostParam = []; //清空为REST接口且请求类型是POST，条件字段是固定值的参数
      this.customDialogGetUrl = ""; //清空为REST接口且请求类型是GET，条件字段是固定值的请求地址
      this.selectionRadio = []; //清空ht-table列表单选选择的数据
      this.textRadio = ""; //清空ht-table列表数据单选按钮的选中状态
      this.isShowSearch = false; //不显示高级搜索
      this.dialogVisible = true;
      // setTimeout(() => {
      //   this.$refs.customDialogShowDetail.initData();
      // });
    },
    //点击列表某一条数据时触发
    orgRowClick(row) {
      this.selectionRadio = [row];
    },
    //确定对话框
    handleSave() {
      let elTable = this.$refs.customDialogShowDetail.$refs.htTable;
      if (elTable && elTable.$refs.htTable) {
        elTable = elTable.$refs.htTable;
      }
      //多选
      if (
        elTable &&
        elTable.selection &&
        elTable.selection.length == 0 &&
        this.customDialog.selectNum === -1
      ) {
        Message.error("请至少选择一条数据");
        return;
      }
      //单选
      if (this.selectionRadio == 0 && this.customDialog.selectNum === 1) {
        Message.error("请至少选择一条数据");
        return;
      }
      //拿到配置的返回字段
      let returnStr = this.customDialog.resultfield;
      //返回字段的字段名有多少个
      let field = new Array([returnStr.length]);
      //返回字段的返回名称有多少个
      let comment = new Array([returnStr.length]);
      let str = [];
      for (let i = 0; i < returnStr.length; i++) {
        //得到返回字段的字段名
        field[i] =
          this.customDialog.dsType == "dataSource"
            ? returnStr[i].field
            : returnStr[i].field;
        //得到返回字段的返回名称
        comment[i] =
          this.customDialog.dsType == "dataSource"
            ? returnStr[i].comment
            : returnStr[i].comment;
      }
      let s = [];
      //获取选择的数据集合
      if (this.customDialog.selectNum === 1) {
        s = this.selectionRadio;
      } else {
        s = elTable.selection;
      }
      this.$emit("return-all-data", s);
      //是否单选  1：单选；-1：多选
      if (this.customDialog.selectNum === 1) {
        let temp = "";
        for (let i = 0; i < comment.length; i++) {
          temp += '"' + comment[i] + '":"' + s[0][field[i]] + '",';
        }
        //去除字符串最后一个字符逗号
        if (temp != "") {
          temp = "{" + temp.substring(0, temp.length - 1) + "}";
        }
        str.push(JSON.parse(temp));
      } else {
        for (let i = 0; i < s.length; i++) {
          var temp = "";
          for (let j = 0; j < comment.length; j++) {
            temp += '"' + comment[j] + '":"' + s[i][field[j]] + '",';
          }
          //去除字符串最后一个字符逗号
          if (temp != "") {
            temp = "{" + temp.substring(0, temp.length - 1) + "}";
          }
          str.push(JSON.parse(temp));
        }
      }
      //发布确认事件，并返回选中的数据
      this.$emit("handle-save", str);
      this.dialogVisible = false;
    },
    //关闭对话框
    handleClose() {
      this.dialogVisible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.el-main {
  padding-top: 0px;
}
</style>
