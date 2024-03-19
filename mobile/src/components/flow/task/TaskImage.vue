<template>
  <div>
    <ht-sidebar-dialog
      :visible.sync="imageDialog"
      title="流程图"
      :close-on-click-modal="false"
      append-to-body
      class="dialog-body"
      width="100%"
      :before-close="handleClose"
    >
    <div style="min-height: 80px;overflow:hidden;">
      <div class="target">
        <div class="icon" style="background: #FF0000;"></div>
        <span>待审批</span>
      </div>
      <div class="target">
        <div class="icon" style="background: #F89800;"></div>
        <span>提交</span>
      </div>
      <div class="target">
        <div class="icon" style="background: #FFE76E;"></div>
        <span>重新提交</span>
      </div>
      <div class="target">
        <div class="icon" style="background: #00FF00;"></div>
        <span>同意</span>
      </div>
      <div class="target">
        <div class="icon" style="background: #C33A1F;"></div>
        <span>挂起</span>
      </div>
      <div class="target">
        <div class="icon" style="background: #0000FF;"></div>
        <span>反对</span>
      </div>
      <div class="target">
        <div class="icon" style="background: #8A0902;"></div>
        <span>驳回</span>
      </div>
      <div class="target">
        <div class="icon" style="background: #FFA500;"></div>
        <span>驳回到发起人</span>
      </div>
      <div class="target">
        <div class="icon" style="background: #023B62;"></div>
        <span>撤回</span>
      </div>
      <div class="target">
        <div class="icon" style="background: #F23B62;"></div>
        <span>撤回到发起人</span>
      </div>
      <div class="target">
        <div class="icon" style="background: #338848;"></div>
        <span>会签通过</span>
      </div>
      <div class="target">
        <div class="icon" style="background: #82B7D7;"></div>
        <span>会签不通过</span>
      </div>
      <div class="target">
        <div class="icon" style="background: #EEAF97;"></div>
        <span>人工终止</span>
      </div>
      <div class="target">
        <div class="icon" style="background: #4A4A4A;"></div>
        <span>完成</span>
      </div>
    </div>
    <el-scrollbar>
      <div style="overflow: auto;min-height:400px;">
          <div :style="{position:positionImg,width:widthImg+'px',height:heightImg+'px',background:'url('+backGroundImg+') no-repeat'}">
              <div  v-for="layout in listLayout"  :key="'sub_'+layout.nodeId">
                <div @click="nodeClick(layout)"  v-if="layout.nodeType=='CALLACTIVITY'" :style="{position:'absolute',border: 'none',background: 'none', left:layout.x+'px', top:layout.y+'px', width:layout.width+'px', height:layout.height+'px'}" ></div>
              </div>
          </div>
      </div>
    </el-scrollbar>
  </ht-sidebar-dialog>
   <SubTaskImage ref="subTaskImage" />
  </div>
  
</template>

<script>
import { mapState, mapActions } from "vuex";
import SubTaskImage from "@/components/flow/task/SubTaskImage.vue";
export default {
  name: "taskImage",
  props: ["instId","defId"],
  components: { SubTaskImage},
  data() {
    return {
        imageDialog:false,
        proInst: this.instId,
        widthImg:"",
        heightImg:"",
        backGroundImg:"",
        positionImg:"relative",
        listLayout:"",
        nodeOpinions:[]
    };
  },
  methods: {
    handleOpen() {
        this.imageDialog = true;
        this.$store.dispatch("storeProcess/getInstanceByInstId", this.instId).then(insts => {
        let data = {"bpmnInstId":insts.bpmnInstId,"instId":this.instId,"defId":this.defId};
        this.$store.dispatch("storeProcess/getBpmImage",data).then(res=>{
            this.widthImg = res.rows.bpmDefLayout.width;
            this.heightImg = res.rows.bpmDefLayout.height;
            this.backGroundImg = res.img;
            res.rows.bpmDefLayout.listLayout.forEach(element => {
              let styleStr="position: 'absolute', left:"+ element.x+"px, top:"+ element.y+"px, width:"+ element.width+"px, height:"+ element.height+"px";
              element.style= styleStr;
            });
            this.listLayout = res.rows.bpmDefLayout.listLayout;
            let nodeIds = [];
            this.listLayout.forEach(layout => {
              if (layout.nodeType=='USERTASK' || layout.nodeType=='SIGNTASK') {
                nodeIds.push(layout.nodeId);
              }
            });
            nodeIds = nodeIds.join(',');
            this.$store.dispatch("storeProcess/getNodeopinions",{instId:this.instId,nodeIds:nodeIds}).then(resp=>{
              if (resp) {
                for (const key in resp) {
                    if (resp[key].data && resp[key].hasOpinion) {
                      resp[key].data.forEach(element => {
                        if(element.qualfieds){
                            element.qualfieds = eval('('+element.qualfieds+')');
                        }
                      });
                      
                    }
                }
              }
              this.nodeOpinions = resp;    
            });
        });
      });
    },
    handleClose(){
      this.imageDialog = false;
    } ,
    nodeClick(node){
      this.$refs.subTaskImage.handleOpen(this.defId,this.instId,node.nodeId);
    }
  }
};
</script>

<style lang="stylus" scoped>
div>>>.el-dialog .el-dialog__body {
  padding: 10px;
  height: calc(100% - 70px) !important;
}

div>>>.el-dialog__header {
  padding: 10px 20px;
  background: #F8F8F8;
  height: 24px;
  line-height: 24px;
  border-bottom: 1px solid #eee;
  border-radius: 2px 2px 0 0;
}
div>>>.el-dialog__headerbtn {
  top: 12px;
}

div.icon {
	border: 1px solid #868686;
	line-height: 10px;
	width: 10px;
	height: 10px;
	float: left;
	overflow: hidden;
	margin-top: 3px;
}

.target span {
	margin: 0 10px 0 3px;
	font-size: 12px;
	font-weight: bold;
	float: left;
	vertical-align: middle;
	white-space: nowrap;
}
.form-table {
  width: 100%;
  border-top: 1px solid #ebeef5;
  border-left: 1px solid #ebeef5;
}

.form-table th {
  text-align: right;
  color: #666;
}

.form-table th > span {
  color: #f00;
}

.form-table th, .form-table td {
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  padding: 10px;
  min-width: 0;
  box-sizing: border-box;
  text-overflow: ellipsis;
  vertical-align: middle;
  position: relative;
}

.xh-star {
  color: red;
}

.opinion-content >>> table {
  border-spacing: 0;
  border-bottom: 1px solid #e7eaec;
  border-left: 1px solid #e7eaec;
  margin-bottom: 10px;
}

.opinion-content >>> table > tr > th , .opinion-content >>> table > tr > td {
  border-top: 1px solid #e7eaec;
  border-right: 1px solid #e7eaec;
  line-height: 1.42857;
  padding: 8px;
  vertical-align: middle;
}

.opinion-content >>> a{
  color: #337ab7;
  text-decoration: none;
  display: block;
}

.opinion-content > span{
  font-size: 14px;
  line-height: 18px;
  display: block;
  padding-bottom: 10px;
  font-weight: bold;
}

.opinion-content > div{
    max-height: 300px;
    overflow: auto;
}

.owner-div{
    padding-right:10px;
}
.opinion{
  max-width :250px;
  min-width :250px;
  word-wrap :break-word; 
}
.el-popover {
      position: absolute;
    background: #fff;
    min-width: 250px;
    border-radius: 4px;
    border: 1px solid #ebeef5;
    padding: 12px;
    z-index: 2000;
    color: #606266;
    line-height: 1.4;
    text-align: justify;
    font-size: 14px;
    -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}


</style>