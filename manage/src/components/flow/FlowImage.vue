<template>
  <div>
    <div style="height: 40px;overflow:hidden;">
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
    <div :style="'overflow: auto;max-height:'+maxHeightImg+'px;'">
        <div :style="{position:positionImg,width:widthImg+'px',height:heightImg+'px',background:'url('+backGroundImg+') no-repeat'}">
           <el-popover @click="nodeClick(layout)" v-for="layout in listLayout"  :key="layout.nodeId"   placement="bottom-start" trigger="hover">
              <div class="opinion-content" v-if="nodeOpinions[layout.nodeId]">
                  <span>任务审批详情</span>
                  <div v-if="nodeOpinions[layout.nodeId].hasOpinion">
                    <table  v-for="op in nodeOpinions[layout.nodeId].data" :key="op.taskKey"  class="table table-bordered">
                        <tr><th width="80">任务名称</th>
                          <td width="160">{{op.taskName}}</td>
                        </tr>
                        <tr v-show="op.auditor"><th>执行人</th>
                          <td><span class="owner-span">
                              <a href="javascript:void(0)" >{{op.auditorName}}</a>
                            </span>
                          </td>
                        </tr>
                        <tr v-show="!op.auditor">
                          <th>
                              <label>候选人</label>
                              <el-tooltip class="item" effect="light" content="有资格审批的用户及用户组" placement="right">
                                  <i class="el-icon-question"></i>
                              </el-tooltip>
                          </th>
                          <td><div class="owner-div">
                                <span class="owner-span" v-for="qualfied in op.qualfieds" :key="qualfied.id" >
                                  <a href="javascript:void(0)" >{{qualfied.name}}</a>
                                </span>
                            </div>
                          </td>
                        </tr>
                        <tr><th>开始时间</th>
                          <td style="font-size:11px;">{{op.createTime | dateformat('yyyy-MM-dd HH:mm:ss')}}</td>
                        </tr>
                        <tr><th>结束时间</th>
                          <td style="font-size:11px;">{{op.completeTime | dateformat('yyyy-MM-dd HH:mm:ss')}}</td>
                        </tr>
                        <tr><th>审批用时</th>
                          <td>{{op.durMs | timeLag}}</td>
                        </tr>
                        <tr><th>状态</th>
                          <td>{{op.statusVal}}</td>
                        </tr>
                        <tr><th>意见</th>
                          <td class="opinion">{{op.opinion}}</td>
                        </tr>
                      </table>
                  </div>

                  <div v-if="!nodeOpinions[layout.nodeId].hasOpinion">
                    <span>节点设置详情</span>
                    <table  class="table table-bordered">
                        <tr><th width="90">状态</th>
                          <td width="150">未产生过任务</td>
                        </tr>
                        <tr>
                          <th>
                              <label>暂定候选人</label>
                              <el-tooltip class="item" effect="light" content="暂定的有审批资格的用户及用户组，实际候选人要在产生任务以后才能确定" placement="right">
                                  <i class="el-icon-question"></i>
                              </el-tooltip>
                          </th>
                          <td>
                             <span class="owner-span" v-for="qualfied in nodeOpinions[layout.nodeId].data" :key="qualfied.id"  >
                                  <a href="javascript:void(0)" >{{qualfied.name}}</a>
                             </span>
                          </td>
                        </tr>

                      </table>
                  </div>
              </div>
              <el-button  v-if="layout.nodeType=='USERTASK' || layout.nodeType=='SIGNTASK'" slot="reference" :style="{position:'absolute',border: 'none',background: 'none', left:layout.x+'px', top:layout.y+'px', width:layout.width+'px', height:layout.height+'px'}" ></el-button>
            </el-popover>
            <div  v-for="layout in listLayout"  :key="'sub_'+layout.nodeId">
              <div @click="nodeClick(layout)"  v-if="layout.nodeType=='CALLACTIVITY'" :style="{position:'absolute',border: 'none',background: 'none', left:layout.x+'px', top:layout.y+'px', width:layout.width+'px', height:layout.height+'px'}" ></div>
            </div>
        </div>
    </div>
        <!-- 流程图 -->

   <SubFlowImage ref="subTaskImage" />
  </div>

</template>

<script>
import { mapState, mapActions } from "vuex";
import SubFlowImage from "@/components/flow/SubFlowImage.vue";
export default {
  name: "taskImage",
  props: ["bpmnInstId","instId","defId"],
  components: { SubFlowImage},
  data() {
    return {
        imageDialog:false,
        proInst: this.instId,
        widthImg:"",
        heightImg:"",
        backGroundImg:"",
        positionImg:"relative",
        listLayout:"",
        nodeOpinions:[],
        maxHeightImg:''
    };
  },
  methods: {
    handleOpen() {

    },
    handleClose(){
      this.imageDialog = false;
    } ,
    nodeClick(node){
      this.$refs.subTaskImage.handleOpen(this.defId,this.instId,node.nodeId);
    }
  },
  created() {
    this.imageDialog = true;
    this.maxHeightImg = document.body.clientHeight -100;
    let data = {"bpmnInstId":this.bpmnInstId,"instId":this.instId,"defId":this.defId};
    this.$store.dispatch("flow/getBpmImage",data).then(res=>{
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
        this.$store.dispatch("flow/getNodeopinions",{instId:this.instId,nodeIds:nodeIds}).then(resp=>{
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
          console.info(this.nodeOpinions)
        });
    });
 }
};
</script>

<style lang="stylus" scoped>
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
