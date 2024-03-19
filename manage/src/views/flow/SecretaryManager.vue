<template>
  <div class="fullheight">
    <ht-table
        @load="loadData"
        @row-click="rowClick"
        :data="data"
        :pageResult="pageResult"
        :selection="true"
        :show-export="false"
        :show-custom-column="false"
        quick-search-props="leaderName,secretaryName"
        ref="table">
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="edit()" icon="el-icon-plus">添加</el-button>
          <ht-delete-button
              :url="deleteUrl"
              style="margin:0;"
              :htTable="$refs.table">删除
          </ht-delete-button>
        </el-button-group>
      </template>
      <ht-table-column type="index" width="50" align="center" label="序号" />
      <ht-table-column
          prop="leaderName"
          label="领导姓名"
          width="150"
          :show-overflow-tooltip="true"
          :sortable="true"
      />
      <ht-table-column
          prop="secretaryName"
          label="秘书姓名"
          width="150"
          :show-overflow-tooltip="true"
          :sortable="true"
      />
      <ht-table-column
          prop="shareType"
          label="共享类型"
          width="90"
          :filters="[
            { text: '定义', value: '1' },
            { text: '分类', value: '2' }
          ]"
      >
        <template v-slot="{ row }">
          <el-tag type="info" v-if="row.shareType === '1'">定义</el-tag>
          <el-tag type="success" v-else-if="row.shareType === '2'">分类</el-tag>
          <el-tag type="danger" v-else>未知</el-tag>
        </template>
      </ht-table-column>
      <ht-table-column
          prop="enabled"
          label="是否启用"
          width="90"
          :filters="[
            { text: '启用', value: '1' },
            { text: '禁用', value: '2' }
          ]"
      >
        <template v-slot="{ row }">
          <el-tag type="info" v-if="row.enabled === '1'">启用</el-tag>
          <el-tag type="danger" v-else>禁用</el-tag>
        </template>
      </ht-table-column>
      <ht-table-column
          prop="shareName"
          label="流程名称"
          :show-overflow-tooltip="true"
          :sortable="true"
      />
      <ht-table-column label="操作" width="210">
        <template slot-scope="scope">
          <el-button @click="edit(scope.row.id)" size="mini" icon="el-icon-edit">修改</el-button>
        </template>
      </ht-table-column>
    </ht-table>

    <secretary-edit :editData="editData" ref="secretaryEdit" @after-save="afterSave"/>
  </div>
</template>

<script>
  import flow from "@/api/flow.js";
  const secretaryEdit = () => import("@/components/flow/SecretaryEdit.vue");
  export default {
    components:{
      secretaryEdit,
    },
    data(){
      return {
        data:[],
        pageResult:{
          page:0,
          pageSize:50,
          total:0
        },
        editData:{},
        dialogVisible:false,
        deleteUrl:window.context.bpmRunTime+"/runtime/bpmSecretaryManage/v1/removes"
      }
    },
    methods:{
      rowClick(row, column, event){
        this.$refs.table.$refs.htTable.toggleRowSelection(row);
      },
      loadData(param,cb){
        flow
          .getSecretaryList(param)
          .then(response => {
            this.data = response.rows;
            this.pageResult = {
              page:response.page,
              pageSize: response.pageSize,
              total: response.total
            }
          })
          .finally(()=>{
            cb();
          });
      },
      async edit(id){
        if (id!=null){
          this.editData = await flow.getSecretaryById(id);
        }else{
          this.editData = {};
        }
        this.$refs.secretaryEdit.handleOpen();
      },
      beforeClose(){
        this.dialogVisible = false;
      },
      afterSave(){
        this.$refs.table.load();
      }
    }
  }
</script>

<style scoped>

</style>
