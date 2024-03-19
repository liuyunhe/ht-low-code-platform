<template>
  <div>
      <ht-tree-list-dialog
        :single="single"
        :name="name"
        :data="data"
        :table-columns="tableColumns"
        :pagination="pagination"
        :tree-data="treeData"
        :default-expanded-keys="['9']"
        dialog-title="选择业务对象"
        :append-to-body="appendToBody"
        @load="handleLoad"
        @loadListData="loadListData"
        @onConfirm="onConfirm"
        @reset="reset"
        quickSearchProps="alias,description"
        select-label="description"
        search-placeholder="别名、描述"
        :destroy-on-close="destroyOnClose"
        ref="htTreeListDialog"
      />

      <form-template-dialog
        @onConfirm="confirmTemplate"
        :formType="formType"
        ref="formTemplateDialog"
      />
  </div>
</template>
<script>
import req from "@/request.js";
import sysType from "@/api/sysType.js";
import FormTemplateDialog from "@/components/dialog/FormTemplateDialog.vue";

export default {
  components: {
    FormTemplateDialog,
  },
  name: "eip-bo-dialog",
  props: {
    value: Array,
    single: Boolean,
    name:String,
    appendToBody: {
      type: Boolean,
      default: false
    },
    destroyOnClose:{
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      data: [],
      treeData: null,
      tableColumns: [
        { prop: "alias", label: "别名" },
        { prop: "description", label: "描述"  },
        { prop: "createTime", label: "创建时间",width: 160 }
      ],
      pagination: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      typeIdQuery: null,
      selection: [],
      formType: 'pc',
    };
  },
  mounted() {
  },
  methods: {
    loadTreeData() {
      sysType.getTypesByKey("DEF_TYPE").then(data => {
        this.treeData = data;
      });
    },
    showDialog(selection,formType) {
      this.formType = formType?formType:'pc';
      this.selection = [];
      this.loadTreeData();
      this.$refs.htTreeListDialog.showDialog();
    },
    handleClose() {
      this.selection = [];
      this.$refs.htTreeListDialog.handleClose();
    },
    handleLoad(param, cb) {
      if (this.typeIdQuery) {
        param.querys.push(this.typeIdQuery);
      }
      // 已发布  启动状态
      let deployedQuery = {
        property: "deployed",
        value: 1,
        group: "filter",
        operation: "EQUAL",
        relation: "AND"
      };
      let statusQuery = {
        property: "status",
        value: "normal",
        group: "filter",
        operation: "EQUAL",
        relation: "AND"
      };
      param.querys.push(deployedQuery);
      param.querys.push(statusQuery);

      // 参数说明  url  requestBodyParam  requestParam
      req
        .post("${form}/bo/def/v1/list", param)
        .then(data => {
          let response = data.data;
          if (response.rows) {
            response.rows.forEach(row => {
              if(row.createTime && row.createTime.constructor ==Number){
                row.createTime = new Date(row.createTime).format("yyyy-MM-dd hh:mm:ss");
              }
            });
          }
          this.data = response.rows;
          this.pagination = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total
          };
        })
        .finally(() => cb());
    },
    loadListData(nodedata) {
      let queryFilter = {
        pageBean: this.pagination,
        querys: []
      };
      this.typeIdQuery = {
        property: "categoryId",
        value: nodedata.id,
        group: "categoryGroup",
        operation: "EQUAL",
        relation: "AND"
      };
      this.handleLoad(queryFilter, () => {});
    },
    onConfirm(selection) {
       if(selection.length<1){
          this.$message({
            message: "请至少选择一条BO建模记录。",
            type: "warning"
          });
         this.$refs.htTreeListDialog.showDialog();
         return ;
       }
       let ids = '';
       selection.forEach(item =>{
         if(ids){
            ids += ',';
         }
         ids += item.id;
       })
       this.selection = selection;
       this.$refs.formTemplateDialog.showDialog(ids);
    },
    confirmTemplate(templateModel){
      if(templateModel){
        this.$emit("onConfirm", {"selection":this.selection,"templateConf":templateModel},this.name);
      }else{
        this.$emit("onConfirm", this.selection,this.name);
      }
      this.$emit("input", this.selection);
    },
    reset() {
      /**
       * 点击重置按钮
       * 1. 清空树条件  this.typeIdQuery = "";
       * 2. 清空树选中状态
       * */
      if (this.typeIdQuery) {
        this.$refs.htTreeListDialog.$refs.tree.$refs.elTree.currentNode.node.isCurrent = false;
      }
      this.typeIdQuery = "";
    }
  }
};
</script>
