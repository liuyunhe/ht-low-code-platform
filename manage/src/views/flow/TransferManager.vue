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
        quick-search-props="transferName,transferedName"
        ref="table">
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="edit()" icon="el-icon-plus" >添加</el-button>
          <ht-delete-button
          style="margin:0;"
              :url="deleteUrl"
              :htTable="$refs.table">删除
          </ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column
            prop="transferName"
            label="移交人"
            :show-overflow-tooltip="true"
            :sortable="true"
            width="150" 
        />
        <ht-table-column
            prop="transferedName"
            label="被移交人"
            :show-overflow-tooltip="true"
            :sortable="true"
            width="150" 
        />
        <ht-table-column
            prop="createTime"
            label="创建时间"
            :show-overflow-tooltip="true"
            :sortable="true"
            width="150" 
        />
        <ht-table-column
            prop="reason"
            label="移交原因"
            :show-overflow-tooltip="true"
            :sortable="true"
        />
        <ht-table-column label="操作" width="210">
          <template slot-scope="scope">
            <el-button @click="detail(scope.row.id)" size="mini" icon="el-icon-menu">明细</el-button>
          </template>
        </ht-table-column>
      </template>

    </ht-table>
    <transfer-detail :detailData="detailData" ref="transfer"/>
    <transfer-edit @after-save="afterSave" ref="transferEdit"/>
  </div>
</template>

<script>
  import flow from "@/api/flow.js";
  import TransferEdit from "../../components/flow/TransferEdit";
  const transferDetail = () => import("@/components/flow/TransferDetail.vue");
  const transferEdit = () => import("@/components/flow/TransferEdit.vue");
  export default {
    components:{
      transferEdit,
      transferDetail
    },
    data(){
      return{
        data:[],
        pageResult:{
          page:0,
          pageSize:50,
          total:0
        },
        detailData:{},
        deleteUrl:window.context.bpmRunTime+"/runtime/bpmTransRecord/v1/removes"
      }
    },
    methods:{
      rowClick(row, column, event){
        this.$refs.table.$refs.htTable.toggleRowSelection(row);
      },
      loadData(param,cb){
        flow
          .getTransferList(param)
          .then(response => {
            this.data = response.rows;
            this.pageResult = {
              page: response.page,
              pageSize: response.pageSize,
              total: response.total
            }
          })
          .finally(()=>{
            cb()
          })
      },
      edit(){
        this.$refs.transferEdit.handleOpen();
      },
      async detail(id){
        this.detailData = await flow.getTransferById(id);
        this.detailData.url = window.context.bpmRunTime+"/runtime/bpmTransRecord/v1/tran/tranResult?tranId="+this.detailData.id;
        this.$refs.transfer.handleOpen();
      },
      afterSave(){
        this.$refs.table.load();
      }
    }
  }
</script>

<style scoped>

</style>
