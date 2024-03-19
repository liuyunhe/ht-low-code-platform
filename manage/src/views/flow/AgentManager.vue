<template>
  <div class="fullheight">
    <ht-table
        @load="loadData"
        :data="data"
        :pageResult="pageResult"
        :selection="true"
        :show-export="false"
        :show-custom-column="false"
        quick-search-props="userName,agentName"
        ref="table">
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="edit()" icon="el-icon-plus">添加</el-button>
          <ht-delete-button
              :url="deleteUrl"
              :htTable="$refs.table">删除
          </ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column
            prop="userName"
            label="被代理人"
            :show-overflow-tooltip="true"
            :sortable="true"
        />
        <ht-table-column
            prop="agentName"
            label="代理人"
            :show-overflow-tooltip="true"
            :sortable="true"
        />
        <ht-table-column
            prop="isUsable"
            label="是否启用"
            width="90"
            :filters="[
            { text: '启用', value: 1 },
            { text: '禁用', value: 0 }
          ]"
        >
          <template v-slot="{ row }">
            <el-tag type="info" v-if="row.isUsable === 1">启用</el-tag>
            <el-tag type="danger" v-if="row.isUsable === 0">禁用</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column label="操作" width="210">
          <template slot-scope="scope">
            <el-button @click="edit(scope.row.id)" size="mini" icon="el-icon-edit">修改</el-button>
          </template>
        </ht-table-column>
      </template>
    </ht-table>
    <agent-edit :editData="editData" @after-save="afterSave" ref="agentEdit"/>
  </div>
</template>

<script>
  import flow from "@/api/flow.js";
  const agentEdit = () => import("@/components/flow/AgentEdit.vue");

  export default {
    components:{
      agentEdit
    },
    data(){
      return {
        data:[],
        dialogVisible:false,
        pageResult:{
          page:0,
          pageSize:50,
          total:0
        },
        editData:{},
        deleteUrl:window.context.bpmModel+"/bpmModel/bpmDeputy/v1/removes"
      }
    },
    methods:{
      loadData(param,cb){
        flow
          .getAgentList(param)
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
          this.editData = await flow.getAgentById(id);
        }else{
          this.editData = {};
        }
        console.info(this.editData)
        this.$refs.agentEdit.handleOpen();
      },
      afterSave(){
        this.$refs.table.load();
      }
    }
  }
</script>

<style scoped>

</style>
