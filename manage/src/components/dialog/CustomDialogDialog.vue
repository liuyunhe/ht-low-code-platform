<template>
  <el-dialog
    :title="title"
    :append-to-body="appendToBody"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    :close-on-click-modal="false"
  >
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :show-export="false"
      :showCustomColumn="false"
      quick-search-props="name,alias"
      :highlight-current-row="single"
      :default-querys="[{'property': 'style_', 'value': styleType, 'operation': 'IN','relation': 'AND'}]"
      ref="dialogTable"
    >
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column label="名称" prop="name" :sortable="true" :show-overflow-tooltip="true">
          <template v-slot="{row}">
            <el-link type="primary" >{{row.name}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column prop="alias" width="120" label="别名" :sortable="true" />
        <ht-table-column
          prop="style"
          label="显示样式"
          width="110"
          :filters="[{text:'列表', value:'0'},{text:'树形', value:'1'}]"
        >
          <template v-slot="{row}">
            <el-tag type="info" v-if="row.style=='0'">列表</el-tag>
            <el-tag type="success" v-if="row.style=='1'">树形</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column
          prop="dsType"
          label="数据来源"
          width="110"
          :filters="[{text:'数据源', value:'dataSource'},{text:'REST接口', value:'restful'}]"
        >
          <template v-slot="{row}">
            <el-tag type="info" v-if="row.dsType=='dataSource'">数据源</el-tag>
            <el-tag type="success" v-if="row.dsType=='restful'">REST接口</el-tag>
          </template>
        </ht-table-column>
      </template>
    </ht-table>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="onConfirm">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import req from "@/request.js";
export default {
  name: "custom-dialog-dialog",
  props: {
    appendToBody: {
      type: Boolean,
      default: false
    },
    single:{
      type:Boolean,
      default:true
    },
    /**显示样式(0:列表 1:树形) */
    styleType:{
      type:Number
    }
  },
  data() {
    return {
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      data: [],
      dialogVisible: false,
      selectedNode: null,
    };
  },
  computed: {
    title:function(){
      if(this.styleType===0){
        return "选择[列表类型]-自定义对话框"
      }else if(this.styleType===1){
        return "选择[树形类型]-自定义对话框"
      }else if(this.styleType===2){
        return "选择[组合]-自定义对话框"
      }
    }
  },
  methods: {
     //页面加载显示数据
    loadData(param, cb) {
      req
        .post(window.context.form + "/form/customDialog/v1/list", param)
        .then(response => {
          this.data = response.data.rows;
          this.pageResult = {
            page: response.data.page,
            pageSize: response.data.pageSize,
            total: response.data.total
          };
        })
        .finally(() => {cb&&cb()});
    },
    showDialog() {
      this.dialogVisible = true;
    },
    handleClose() {
      this.dialogVisible = false;
    },
    onConfirm() {
      let selectedList = this.$refs.dialogTable.$refs.htTable.selection;
      if (selectedList.length < 1) {
        this.$message({ message: "请至少选择一项!", type: "warning" });
        return;
      }
      if(this.single && selectedList.length>1){
        this.$message({ message: "只能选择一项!", type: "warning" });
        return;
      }
      let arr = [];
      selectedList.forEach(item => {
        arr.push({alias:item.alias,name:item.name});
      });
      this.$emit("onConfirm", arr);
      this.dialogVisible = false;
    }
  }
};
</script>
