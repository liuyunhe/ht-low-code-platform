<template>
  <el-dialog
    title="查看移交记录"
    :visible="dialogVisible"
    width="60%"
    :close-on-click-modal="false"
    :before-close="beforeClose">
    <table class="form-table">
      <tbody>
        <tr>
          <th>移交类型</th>
          <td>{{detailData.type}}</td>
          <th>移交人</th>
          <td>{{detailData.transferName}}</td>
        </tr>
        <tr>
          <th>被移交人</th>
          <td>{{detailData.transferedName}}</td>
          <th>移交原因</th>
          <td>{{detailData.reason}}</td>
        </tr>
        <tr>
          <th>创建时间</th>
          <td>{{detailData.createTime}}</td>
        </tr>
      </tbody>
    </table>
    <ht-table
        @load="loadData"
        :data="flowData"
        :pageResult="pageResult"
        :show-export="false"
        :show-custom-column="false"
        :selectable="false"
        ref="table">
      <ht-table-column type="index" width="50" align="center" label="序号" />
      <ht-table-column
          prop="creator"
          label="申请人"
          width="220"
          :show-overflow-tooltip="true"
      />
      <ht-table-column
          prop="subject"
          label="流程标题"
          :show-overflow-tooltip="true"
      />
      <ht-table-column
          prop="createTime"
          label="创建时间"
          width="260"
          :show-overflow-tooltip="true"
      />
    </ht-table>
  </el-dialog>
</template>

<script>
  import req from "@/request.js";
  export default {
    props:["detailData"],
    data(){
      return{
        dialogVisible:false,
        pageResult:{
          page:0,
          pageSize:50,
          total:0
        },
        flowData:[]
      }
    },
    methods:{
      loadData(param,cb){
        this.$nextTick(()=>{
          req
            .post(this.detailData.url,param)
            .then(resp=>{
              this.flowData = resp.data.rows;
              this.pageResult={
                page:resp.data.page,
                pageSize:resp.data.pageSize,
                total:resp.data.total
              }
            })
            .finally(()=>{
              cb()
            });
        });

      },
      beforeClose(){
        this.dialogVisible = false;
      },
      handleOpen(){
        this.dialogVisible = true;
        this.$refs.table.load();
      }
    }
  }
</script>

<style scoped>
  table{
    width: 100%;
  }
  th{
    width: 15%;
    padding: 8px;
  }
  td{
    font-size: 13px;
    width: 35%;
  }
  span{
    font-size: 13px;
    float: left;
  }
</style>
