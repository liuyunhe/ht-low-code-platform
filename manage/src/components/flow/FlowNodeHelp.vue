<template>
    <el-dialog :title="title" width="1000px" :visible.sync="dialogVisible" :before-close="handleClose" append-to-body :close-on-click-modal="false">
      <vue-ueditor-wrap v-model="helpValue"  :config="myConfig"></vue-ueditor-wrap>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSave" >确 定</el-button>
        <el-button @click="handleClose">取 消</el-button>
      </div>
    </el-dialog>
</template>

<script>
import { Message } from 'element-ui';
import req from "@/request.js";
export default {
  name: "FlowNodeHelp",
  components:{},
  props: {
    title: {
      type: String,
      required: true,
      default: "任务帮助提示"
    },
    //帮助内容
    value: {
      type: String,
      required: true
    },
    //任务ID
    nodeId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      myConfig: {
        initialFrameHeight: 240,
        UEDITOR_HOME_URL: window.location.origin +'/'+ window.location.pathname.split('/')[1]+'/static/ueditor/',
        toolbars: [
          [
            // 'source', //源代码
            'undo', //撤销
            'bold', //加粗
            'indent', //首行缩进
            'italic', //斜体
            'underline', //下划线
            'strikethrough', //删除线
            'subscript', //下标
            'fontborder', //字符边框
            'superscript', //上标
            'formatmatch', //格式刷
            'forecolor',//字体颜色
            'justifyleft', //居左对齐
            'justifycenter', //居中对齐
            'justifyright', //居右对齐
            'justifyjustify', //两端对齐
            'fontfamily', //字体
            'fontsize', //字号
            'insertorderedlist', //有序列表
            'insertunorderedlist', //无序列表
            'lineheight',//行间距
            'inserttable', //插入表格
            'link', //超链接
            'simpleupload', //单图上传
            'insertimage', //多图上传
            'attachment', //附件
          ]
        ],
        // 初始容器宽度
        initialFrameWidth: "100%",
        zIndex:9999,
        enableAutoSave: false,
        readonly : false
      },
      dialogVisible:false,//是否显示对话框
      helpValue:"",//帮助内容
    }
  },
  methods: {
    //显示对话框
    showDialog() {
      this.dialogVisible=true;
      this.helpValue=this.value;
    },
    //确认对话框
    handleSave(){
      let Base64 = require('js-base64').Base64;
      this.dialogVisible = false;
      //发布确认事件
      this.$emit("handle-save",Base64.encode(this.helpValue))
    },
    //关闭对话框
    handleClose() {
      this.dialogVisible = false;
    }
  },
}
</script>

<style lang="scss" scoped>
.el-main {
  padding-top: 0px;
}
</style>