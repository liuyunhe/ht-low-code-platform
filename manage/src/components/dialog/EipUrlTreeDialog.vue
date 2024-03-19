<template>
     <el-dialog :title="title" width="400px" :visible.sync="dialogVisible" :before-close="handleClose" :close-on-click-modal="false">
        <ht-tree
          :data="treeData"
          :props="defaultProps"
          default-expand-all
          @node-click="handleNodeClick"
           :expand-on-click-node=false
          ref="htTypeTree"
        ></ht-tree>
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
  name: "eip-url-tree-dialog",
  props: {
    title: {
      type: String,
      required: true,
      default: "选择分类"
    },
    url: {
      type: String,
      required: true
    },
    requestMethod: {
      type: String,
      default: "GET"
    },
  },
  data() {
    return {
      dialogVisible:false,//是否显示对话框
      treeData: [], //树数据
      defaultProps: {
        children: "children",
        label: "name"
      },
      nodes:{},//鼠标左击点击的树数据
    }
  },
  methods: {
    //显示对话框
    showDialog() {
       this.getData();
    },
    //加载树
    async getData() {
      this.treeData = [];
      this.dialogVisible = true;
      let response = await req.request({
        url: this.url,
        method: this.requestMethod
      });
      this.treeData = response.data;
    },
    //确定对话框
    handleSave(){
      if(JSON.stringify(this.nodes) == "{}"){
         Message.warning("请选择数据");
         return;
      }
      this.$emit("handle-save",this.nodes)
      this.nodes = {};
      this.dialogVisible = false;
    },
    //关闭对话框
    handleClose() {
      this.nodes = {};
      this.dialogVisible = false;
    },
    //树鼠标左击事件
    handleNodeClick(node){
      this.nodes = node;
    }
  },
}
</script>

<style lang="scss" scoped>
.el-main {
  padding-top: 0px;
}
</style>