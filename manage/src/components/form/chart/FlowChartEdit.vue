<template>
  <div class="fullheight">
    <ht-sidebar-dialog
      :visible.sync="dialogVisible"
      :show-close="false"
      width="100%"
      :close-on-click-modal="false"
    >
      <el-page-header @back="back" content="视图列表"/>
      <div style="margin: 10px 0">
        <ht-input v-model="data.name"/>&nbsp;
        <el-button @click="edit()">添加报表</el-button>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button v-if="data.type!=='1' && data.id" @click="publish">发布</el-button>
      </div>
      <div v-for="(option,index) in options" :key="index">
        <el-button size="mini" type="primary" @click="edit(option.id, index)">编辑</el-button>
        <el-button size="mini" type="danger" @click="remove(option.id)">删除</el-button>
        <el-button size="mini" type="warning" @click="refresh(option.id,index)">刷新</el-button>
        <chart :option="option" :index="index" :is-convert-option="true"/>
      </div>
    </ht-sidebar-dialog>
    <report-setting ref="reportSetting" :id="selectedId" :report="selectedReport" @after-save="afterSave"/>
  </div>
</template>

<script>
  import flow from "@/api/flow.js";
  const chart = () => import("@/components/form/chart/Chart.vue");
  const reportSetting = () => import("@/components/form/chart/ReportSetting.vue");
  export default {
    components:{
      chart,
      reportSetting
    },
    data(){
      return {
        reportChartId:"",
        dialogVisible:false,
        data:{},
        options:[],
        selectedId:'',
        index:'',
        selectedReport:{}
      }
    },
    methods:{
      //返回
      back(){
        this.$emit("save-report");
        this.dialogVisible=false;
      },
      handleOpen(id){
        this.reportChartId = id;
        this.dialogVisible = true;
        this.getReportChartData();
      },
      getReportChartData(){
        if(this.reportChartId){
          flow.getReportList(this.reportChartId).then(data=>{
            if (data){
              this.data = data;
            }else{
              this.data = {};
            }
          });
          flow.getEchartsData(this.reportChartId).then(data=>{
            if (this.options){
              this.options = data.value;
            }else{
              this.options = [];
            }
          });
        }else{
          this.data = {};
          this.options = [];
        }
      },
      edit(id, index){
        this.selectedReport = {id:this.data.id,name:this.data.name};
        if (id){
          this.index = index;
          this.selectedId = id;
        }else{
          this.selectedId = "";
          this.index = "";
        }
        this.$refs.reportSetting.handleOpen();
      },
      remove(id){
        this.$confirm("确定删除吗？").then(()=>{
          flow.removeAct(id).then(data=>{
            this.$message.success("删除成功");
            this.getReportChartData(this.reportChartId);
          })
        }).catch(()=>{
        });
      },
      afterSave(){
        this.getReportChartData();
      },
      save(){
        let data={
          name:this.data.name,
          type:this.data.type,
          id:this.data.id
        };
        flow.saveReport(data).then(data=>{
          if (data.state) {
            this.data.id=data.value;
            this.$message.success(data.message);
            this.$emit("save-report");
            this.dialogVisible=false;
          } else {
            this.$message.error(data.message);
          }
        })
      },
      publish(){
        flow.publishReport(this.data.id).then(data=>{
          if (data.state) {
            this.$message.success("发布成功");
            this.data.type='1';
            this.$emit("after-save",{});
          } else {
            this.$message.error(data.message);
          }
        })
      },
      refresh(id,index){
        flow.getSingleEchartsData(id).then(data=>{
          this.options.splice(index,1);
          this.options.splice(index,0,data.value);
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .fullheight{
    overflow: auto;
  }
</style>
