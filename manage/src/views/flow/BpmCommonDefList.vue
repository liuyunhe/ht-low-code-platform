<template>
  <div style="height:100%">
    <ht-table
      @load="loadData"
      :data="tableData"
      :pageResult="pageResult"
      :nopagination="false"
      :show-export="false"
      :show-custom-column="false"
      quick-search-props="name"
      ref="htTable"
      @row-click="rowClick"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="showDialog()" icon="el-icon-plus"
            >添加</el-button
          >
          <ht-delete-button :url="deleteUrl" :htTable="$refs.htTable" style="margin:0;"
            >删除</ht-delete-button
          >
        </el-button-group>
      </template>
      <ht-table-column type="index" width="50" align="center" label="序号" />
      <ht-table-column
        prop="name"
        align="center"
        :show-overflow-tooltip="true"
        label="流程名称"
        :sortable="true"
      />
      <ht-table-column
        prop="rightType"
        align="center"
        :show-overflow-tooltip="true"
        label="所属人"
        :sortable="true"
      >
        <template v-slot="{row}">
          <el-tag v-if="row.rightType=='everyone'">所有人</el-tag>
          <el-tag v-if="row.rightType!='everyone'" type="success">其他</el-tag>
        </template>
      </ht-table-column>
      <ht-table-column
        width="200"
        align="center"
        label="适用范围"
      >
      <template v-slot="{row}">
        <el-button type="primary" size="small" @click="showEditDialog(row)" icon="el-icon-plus">选择</el-button>
      </template>
      </ht-table-column>
    </ht-table>
    <!-- 流程选择对话框  -->
    <eip-flow-dialog
      ref="eipFlowDialog"
      name="eipFlowDialog"
      @onConfirm="dialogOnConfirm"
      append-to-body
    />
    <!-- 授权页面 -->
    <eip-auth-dialog
      ref="eipAuthDialog"
      @onConfirm="eipAuthConfirm"
      append-to-body
    />
  </div>
</template>

<script>
import { Message } from "element-ui";
import req from "@/request.js";
const eipAuthDialog = () => import("@/components/dialog/EipAuthDialog.vue");
const eipFlowDialog = () => import("@/components/dialog/EipFlowDialog.vue");
export default {
  components: { eipFlowDialog,eipAuthDialog },
  name: "BpmCommonDefList",
  computed: {
    //删除对话框数据的URL
    deleteUrl: function() {
      return "${bpmModel}/bpmModel/BpmOftenFlow/v1/removes";
    },
  },
  data() {
    return {
      type:"",//新增或是修改
      defkeys:[],//选择的流程
      tableData: [], //列表数据
      pageResult: {
        page: 1,
        pageSize: 20,
        total: 0,
      },
    };
  },
  methods: {
    rowClick(row, column, event) {
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    //打开流程选择器对话框
    showDialog() {
      this.$refs.eipFlowDialog.showDialog([]);
    },
    //修改常用流程权限信息
    showEditDialog(row){
      const this_ = this;
      this_.defkeys = [];
      req.get("${bpmModel}/bpmModel/BpmOftenFlow/v1/getBpmOftenFlowUsers?oftenFlowId="+row.id).then(function(resp) {
        if(resp.data){
          let conf = {
            right: [],
            permissionList: [
              { type: "everyone", title: "所有人" },
              { type: "user", title: "用户" },
              { type: "org", title: "组织" },
              { type: "pos", title: "岗位" },
              { type: "role", title: "角色" }
            ]
          };
          conf.right = resp.data;
          this_.type="edit";
          this_.defkeys.push(row.defKey);
          this_.$refs.eipAuthDialog.showDialog(conf);
        }
      });
    },
    showAuthDialog() {
      let conf = {
        right: [],
        permissionList: [
          { type: "everyone", title: "所有人" },
          { type: "user", title: "用户" },
          { type: "org", title: "组织" },
          { type: "pos", title: "岗位" },
          { type: "role", title: "角色" }
        ]
      };
      this.type="add";
      this.$refs.eipAuthDialog.showDialog(conf);
    },
    //授权页面确认事件
    eipAuthConfirm(data){
      const this_ = this;
      let map = {
        defkeys:this_.defkeys,
        type:this_.type,
        calOwnerNameJson:data
      };
      req.post("${bpmModel}/bpmModel/BpmOftenFlow/v1/save", map).then(function(resp) {
        resp = resp.data;
        if (resp.state) {
          Message.success(resp && resp.message ? resp.message : "添加常用流程成功");
          this_.$refs.htTable.load(); //重新加载列表数据
        }
      });
    },
    //监听常用流程确认事件
    dialogOnConfirm(data) {
      const this_ = this;
      this_.defkeys = [];
      for (let i = 0; i < data.length; i++) {
        this_.defkeys.push(data[i].defKey);
      }
      if (this_.defkeys.length == 0) {
        Message.warning("至少选择一条流程");
        return;
      } else {
        this_.showAuthDialog();
      }
    },
    //页面加载显示数据
    loadData(param, cb) {
      const this_ = this;
      req
        .post("${bpmModel}/bpmModel/BpmOftenFlow/v1/list", param)
        .then((response) => {
          this_.tableData = response.data.rows;
          this_.pageResult = {
            page: response.data.page,
            pageSize: response.data.pageSize,
            total: response.data.total,
          };
        })
        .finally(() => cb());
    },
  },
};
</script>
<style lang="scss" scoped>
.el-main {
  padding-top: 0px;
}
.urgent-text .inputs {
  width: 100%;
}
</style>
